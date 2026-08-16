chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

// Independent install signal, separate from sidepanel.js's app_launched: that one only fires if
// the user opens the panel, so it can't tell "installed but never opened" apart from "no install
// event wired up at all". No window/DOM here (service worker), so no posthog-js — post straight
// to the HTTP capture API on the same first-party proxy as the rest of GrooveMix's PostHog traffic.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') return;
  fetch('https://groovemix.app/ingest/capture/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: 'phc_BAghKLaJXyEZ9hcPdjQ7BFfQ3543X6aDDjzapsrJTE3S',
      event: 'extension_installed',
      distinct_id: crypto.randomUUID(),
      properties: { source: 'extension' },
    }),
  }).catch((error) => console.error(error));
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'reload-extension') chrome.runtime.reload();
});

// TODO: replace with the real permalink once the Gumroad listing exists (Settings ->
// "Generate a unique license key per sale" must be on for /v2/licenses/verify to work).
const GUMROAD_PRODUCT_PERMALINK = 'groove-mix';

async function handleVerifyLicense(message) {
  try {
    const body = new URLSearchParams({
      product_permalink: GUMROAD_PRODUCT_PERMALINK,
      license_key: message.licenseKey,
      increment_uses_count: 'false',
    });
    const res = await fetch('https://api.gumroad.com/v2/licenses/verify', { method: 'POST', body });
    const data = await res.json();
    if (data.success) {
      await chrome.storage.local.set({
        license: { valid: true, key: message.licenseKey, email: data.purchase?.email || null, verifiedAt: Date.now() },
      });
    }
    return data;
  } catch (error) {
    return { success: false, message: String(error) };
  }
}

// Bandcamp tabCapture + offscreen document relay. Bandcamp's <audio> is cross-origin
// (bcbits.com, no CORS) so createMediaElementSource is silent on it — the workaround is
// chrome.tabCapture.getMediaStreamId() (works on any tab, no user gesture needed since
// Chrome 116) handed to an offscreen document's getUserMedia(), which hosts the actual
// EQ/FX/gain/cross graph (offscreen.js). This service worker only brokers the stream id
// and keeps the offscreen document alive for exactly as long as a Bandcamp deck needs it.
const bcConnectedDecks = new Set();

async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return;
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Bandcamp audio capture and EQ/FX processing for GrooveMix',
    });
  } catch (e) {
    // Race: another connect call created it between hasDocument() and createDocument().
    if (!/already exists/i.test(String(e?.message || e))) throw e;
  }
}

async function maybeCloseOffscreenDocument() {
  if (bcConnectedDecks.size > 0) return;
  try {
    await chrome.offscreen.closeDocument();
  } catch (e) { /* already gone */ }
}

async function handleBandcampConnect(message) {
  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: message.tabId });
    await ensureOffscreenDocument();
    bcConnectedDecks.add(message.deckKey);
    return { ok: true, streamId };
  } catch (error) {
    return { ok: false, error: String((error && error.message) || error) };
  }
}

async function handleBandcampDisconnect(message) {
  bcConnectedDecks.delete(message.deckKey);
  await maybeCloseOffscreenDocument();
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'verifyLicense') {
    handleVerifyLicense(message).then(sendResponse);
    return true; // keep the message channel open for the async sendResponse
  }
  // increment_uses_count=false above — this endpoint is called on every activation attempt
  // AND could be called again later for re-checks; without it each call burns one of
  // Gumroad's per-license activation slots, so a single real buyer could exhaust it just by
  // retrying.
  if (message?.target === 'background' && message?.type === 'bandcampConnect') {
    handleBandcampConnect(message).then(sendResponse);
    return true;
  }
  if (message?.target === 'background' && message?.type === 'bandcampDisconnect') {
    handleBandcampDisconnect(message).then(sendResponse);
    return true;
  }
  return false;
});
