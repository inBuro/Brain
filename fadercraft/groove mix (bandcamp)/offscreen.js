// Offscreen document — hosts one AudioContext per connected Bandcamp deck.
// Bandcamp's <audio> streams cross-origin from bcbits.com with no CORS headers, so
// createMediaElementSource() (the trick the YouTube-tab content script uses) is silent on it.
// Instead: background.js gets a tabCapture stream id for the Bandcamp tab, this document turns
// it into a MediaStream via getUserMedia(), and the graph below mirrors counterDJSetup's EQ/FX/
// gain/cross/cue topology (sidepanel.js) minus the beat detector — BPM/tempo sync is out of
// scope for Bandcamp v1. Capturing a tab's audio reroutes it away from the OS mixer into the
// stream, so the Bandcamp tab goes locally silent and this graph must reach ctx.destination
// itself for any sound to come out.

const decks = {}; // keyed 'A' | 'B'

function dbToGain(v) {
  return v <= -40 ? 0 : Math.pow(10, v / 20);
}

function lowpassStage(ctx, freq) {
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  f.Q.value = Math.SQRT1_2;
  return f;
}

function highpassStage(ctx, freq) {
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = freq;
  f.Q.value = Math.SQRT1_2;
  return f;
}

function applyFx(fxNode, value) {
  if (value <= 0) {
    fxNode.type = 'lowpass';
    fxNode.frequency.value = 20000 * Math.pow(100 / 20000, -value);
  } else {
    fxNode.type = 'highpass';
    fxNode.frequency.value = 20 * Math.pow(8000 / 20, value);
  }
}

function teardownDeck(deckKey) {
  const d = decks[deckKey];
  if (!d) return;
  try { d.cueAudioEl.srcObject = null; } catch (e) { /* already gone */ }
  try { d.stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* already gone */ }
  try { d.ctx.close(); } catch (e) { /* already closed */ }
  delete decks[deckKey];
}

async function bcSetup({ deckKey, streamId, initial }) {
  teardownDeck(deckKey);

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
  });

  const ctx = new AudioContext();
  await ctx.resume().catch(() => {});
  const source = ctx.createMediaStreamSource(stream);

  // 3-band isolator crossover — same topology as counterDJSetup (sidepanel.js).
  const LOW_MID_HZ = 250, MID_HIGH_HZ = 2500;
  const low = ctx.createGain();
  source.connect(lowpassStage(ctx, LOW_MID_HZ)).connect(lowpassStage(ctx, LOW_MID_HZ)).connect(low);
  const mid = ctx.createGain();
  source.connect(highpassStage(ctx, LOW_MID_HZ)).connect(highpassStage(ctx, LOW_MID_HZ))
    .connect(lowpassStage(ctx, MID_HIGH_HZ)).connect(lowpassStage(ctx, MID_HIGH_HZ)).connect(mid);
  const high = ctx.createGain();
  source.connect(highpassStage(ctx, MID_HIGH_HZ)).connect(highpassStage(ctx, MID_HIGH_HZ)).connect(high);

  const eqOut = ctx.createGain();
  low.connect(eqOut);
  mid.connect(eqOut);
  high.connect(eqOut);

  const fx = ctx.createBiquadFilter();
  fx.type = 'lowpass';
  fx.frequency.value = 20000;
  fx.Q.value = Math.SQRT1_2;

  const gain = ctx.createGain();
  const cross = ctx.createGain();

  if (initial) {
    if (typeof initial.low === 'number') low.gain.value = dbToGain(initial.low);
    if (typeof initial.mid === 'number') mid.gain.value = dbToGain(initial.mid);
    if (typeof initial.high === 'number') high.gain.value = dbToGain(initial.high);
    if (typeof initial.gain === 'number') gain.gain.value = initial.gain;
    if (typeof initial.fx === 'number' && initial.fx !== 0) applyFx(fx, initial.fx);
  }

  eqOut.connect(fx).connect(gain).connect(cross).connect(ctx.destination);

  // Cue tap: post-gain/pre-cross (PFL) — same as counterDJSetup's cueAudioEl, routed via
  // HTMLMediaElement.setSinkId() so cue never touches the master AudioContext output.
  const cueDest = ctx.createMediaStreamDestination();
  gain.connect(cueDest);
  const cueAudioEl = new Audio();
  cueAudioEl.srcObject = cueDest.stream;
  cueAudioEl.muted = true;
  cueAudioEl.play().catch(() => {});

  // Level meter: post-EQ/pre-gain, same as counterDJLevel's tap point.
  const levelAnalyser = ctx.createAnalyser();
  levelAnalyser.fftSize = 512;
  const levelSilentGain = ctx.createGain();
  levelSilentGain.gain.value = 0;
  eqOut.connect(levelAnalyser).connect(levelSilentGain).connect(ctx.destination);

  decks[deckKey] = { ctx, stream, source, low, mid, high, fx, gain, cross, cueDest, cueAudioEl, levelAnalyser };
  return { ok: true, ctxState: ctx.state };
}

function bcSetParam({ deckKey, param, value }) {
  const d = decks[deckKey];
  if (!d) return { ok: false, error: 'deck not set up' };
  if (d.ctx.state === 'suspended') d.ctx.resume();
  if (param === 'low' || param === 'mid' || param === 'high') {
    d[param].gain.value = dbToGain(value);
  } else if (param === 'fx') {
    applyFx(d.fx, value);
  } else if (param === 'gain') {
    d.gain.gain.value = value;
  } else if (param === 'cross') {
    d.cross.gain.value = value;
  } else if (param === 'rate') {
    // No-op — BPM/tempo sync is out of scope for Bandcamp v1.
    return { ok: true };
  } else {
    return { ok: false, error: 'unknown param ' + param };
  }
  return { ok: true };
}

function bcGetLevel({ deckKey }) {
  const d = decks[deckKey];
  if (!d) return { db: -60 };
  const data = new Uint8Array(d.levelAnalyser.fftSize);
  d.levelAnalyser.getByteTimeDomainData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
  const rms = Math.sqrt(sum / data.length);
  return { db: rms > 0 ? Math.max(-60, 20 * Math.log10(rms)) : -60 };
}

async function bcSetCue({ deckKey, deviceId, active }) {
  const d = decks[deckKey];
  if (!d || !d.cueAudioEl) return { ok: false, error: 'cue not available' };
  if (!active) {
    d.cueAudioEl.muted = true;
    return { ok: true };
  }
  if (typeof d.cueAudioEl.setSinkId !== 'function') {
    return { ok: false, error: 'setSinkId unsupported in this browser/version' };
  }
  try {
    await d.cueAudioEl.setSinkId(deviceId || '');
    d.cueAudioEl.muted = false;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `${err.name}: ${err.message}` };
  }
}

async function bcEnumerateOutputs() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      ok: true,
      outputs: devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Output ${i + 1}` })),
    };
  } catch (err) {
    return { ok: false, error: `${err.name}: ${err.message}` };
  }
}

function bcPoll({ deckKey }) {
  const d = decks[deckKey];
  return { connected: !!d, ctxState: d ? d.ctx.state : null };
}

async function bcResumeCtx({ deckKey }) {
  const d = decks[deckKey];
  if (!d) return { ok: false };
  await d.ctx.resume().catch(() => {});
  return { ok: true, ctxState: d.ctx.state };
}

function bcDisconnect({ deckKey }) {
  teardownDeck(deckKey);
  return { ok: true };
}

function bcSwapDecks() {
  const tmp = decks.A;
  decks.A = decks.B;
  decks.B = tmp;
  return { ok: true };
}

const HANDLERS = {
  bcSetup, bcSetParam, bcGetLevel, bcSetCue, bcEnumerateOutputs,
  bcPoll, bcResumeCtx, bcDisconnect, bcSwapDecks,
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.target !== 'offscreen') return false;
  const handler = HANDLERS[message.type];
  if (!handler) return false;
  Promise.resolve(handler(message)).then(sendResponse, (err) => {
    sendResponse({ ok: false, error: `${err?.name || 'Error'}: ${err?.message || String(err)}` });
  });
  return true; // keep the message channel open for the async sendResponse
});
