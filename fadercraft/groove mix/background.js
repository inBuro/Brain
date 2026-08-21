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

// increment_uses_count=false — this endpoint is called on every activation attempt AND
// could be called again later for re-checks; without it each call burns one of Gumroad's
// per-license activation slots, so a single real buyer could exhaust it just by retrying.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'verifyLicense') return false;
  (async () => {
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
      sendResponse(data);
    } catch (error) {
      sendResponse({ success: false, message: String(error) });
    }
  })();
  return true; // keep the message channel open for the async sendResponse
});
