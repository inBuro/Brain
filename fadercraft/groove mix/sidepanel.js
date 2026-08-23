// ---- functions injected into the YouTube tab (MAIN world) ----
// Must stay self-contained: no references to outer closure variables.

function counterDJSetup(initial) {
  if (window.__counterDJ__) {
    const eng = window.__counterDJ__;
    // YouTube is an SPA — __counterDJ__ persists across reconnects. A tab set up before the
    // cue tap existed (older extension version) reaches this early-return with no cueAudioEl;
    // patch it here so a stale tab self-heals on reconnect instead of throwing on muted=...
    if (!eng.cueAudioEl) {
      const cueDest = eng.ctx.createMediaStreamDestination();
      eng.gain.connect(cueDest);
      const cueAudioEl = new Audio();
      cueAudioEl.srcObject = cueDest.stream;
      cueAudioEl.muted = true;
      cueAudioEl.play().catch(() => {});
      eng.cueAudioEl = cueAudioEl;
    }
    // Reconnect on a surviving page must also apply the caller's fresh starting values —
    // whatever gain was left over from before disconnect would otherwise persist.
    if (initial) {
      const dbToGain = (v) => (v <= -40 ? 0 : Math.pow(10, v / 20));
      if (typeof initial.low === 'number') eng.low.gain.value = dbToGain(initial.low);
      if (typeof initial.mid === 'number') eng.mid.gain.value = dbToGain(initial.mid);
      if (typeof initial.high === 'number') eng.high.gain.value = dbToGain(initial.high);
      if (typeof initial.gain === 'number') eng.gain.gain.value = initial.gain;
      if (typeof initial.rate === 'number') eng.video.playbackRate = initial.rate;
      // eng.applyFxType only exists on a graph built by this-or-later extension version — a tab
      // reconnecting from before the FX-type feature landed keeps its old direct fx insert and
      // can only ever run Filter (same self-heal precedent as cueAudioEl above).
      if (eng.applyFxType && eng.applyFxValueForType) {
        if (typeof initial.filterValue === 'number') eng.applyFxValueForType('filter', initial.filterValue);
        if (typeof initial.delayValue === 'number') eng.applyFxValueForType('delay', initial.delayValue);
        if (typeof initial.fxType === 'string') eng.applyFxType(initial.fxType);
      } else if (typeof initial.fx === 'number') {
        if (initial.fx < 0) {
          eng.fx.type = 'lowpass';
          eng.fx.frequency.value = 20000 * Math.pow(100 / 20000, -initial.fx);
        } else if (initial.fx > 0) {
          eng.fx.type = 'highpass';
          eng.fx.frequency.value = 20 * Math.pow(8000 / 20, initial.fx);
        } else {
          eng.fx.type = 'lowpass';
          eng.fx.frequency.value = 20000;
        }
      }
    }
    return {
      ok: true,
      already: true,
      videoCount: document.querySelectorAll('video').length,
      playing: !eng.video.paused,
      muted: eng.video.muted,
      ctxState: eng.ctx.state,
      hasFxTypes: !!eng.applyFxType,
    };
  }
  const videos = Array.from(document.querySelectorAll('video'));
  let video = document.querySelector('video.html5-main-video');
  if (!video) video = videos.find((v) => !v.paused) || videos[0];
  if (!video) return { ok: false, error: 'no <video> found on this tab' };
  // Everything below is one-shot, irreversible setup on this <video> (createMediaElementSource
  // in particular can only ever be called once per element, ever) — window.__counterDJ__ is only
  // set at the very end, so an uncaught throw here used to leave the tab in a state where every
  // future Connect attempt fails identically (createMediaElementSource re-entry) with no real
  // error surfaced, just a generic "injection failed" (2026-08-09, a real user hit this and could
  // never recover without reloading the tab). Catching here at least reports what broke.
  try {
  video.preservesPitch = true;
  // A guest deck (sibling already connected and playing — initial.forceCue) always lands cued,
  // regardless of its own tab's playback state: a freshly opened YouTube tab autoplays by
  // default, the same outward signal as a genuinely mid-set track, so video.paused alone can't
  // tell "just autoplaying" apart from "anchor already running a set" (2026-08-10, direct report
  // — deck B showed playing on cold-start connect back when this checked video.paused instead).
  // An anchor deck (no live sibling — solo connect, or first of a cold-start pair) is left
  // exactly as found: idle stays cued (DJ decides when it starts, same as dropping a record on a
  // real deck); already playing keeps playing undisturbed, since pausing it here would stop a
  // running set and the next Play click would hit counterDJTransport's 'restart', throwing away
  // the current position entirely (2026-08-10, direct report).
  const shouldCue = (initial && initial.forceCue) || video.paused;
  if (shouldCue) {
    video.pause();
    // A single pause() isn't enough — YouTube's own player can re-assert autoplay on its own right
    // after we call this (still initializing, or genuinely repeats the attempt), and a later
    // one-shot re-pause from the side panel lost that race in practice (2026-08-10, direct report).
    // Fight it at the source instead: re-pause on every native 'play' event for a short settle
    // window, then get out of the way. counterDJTransport's 'restart' action cancels this guard
    // right before it calls video.play(), so a real Play click in the mixer always wins even inside
    // the window — known gap: a click on YouTube's OWN play button in that same window looks
    // identical to autoplay resuming and gets paused right back; past ~4s it's honored normally.
    const pauseGuardUntil = Date.now() + 4000;
    const pauseGuard = () => {
      if (Date.now() < pauseGuardUntil) video.pause();
      else video.removeEventListener('play', pauseGuard);
    };
    video.addEventListener('play', pauseGuard);
    video.__counterDJCancelPauseGuard__ = () => video.removeEventListener('play', pauseGuard);
  }

  // createMediaElementSource is one-shot per <video>, ever — if a prior attempt on this exact
  // element got this far and then failed later in setup, retrying here would throw again
  // (InvalidStateError: already connected to a different source) and permanently strand the tab,
  // since window.__counterDJ__ (the "already set up" guard) is only assigned at the very end.
  // Caching the pair on the element itself lets a retry reuse what the last attempt already
  // created instead of re-triggering the one-shot operation (2026-08-09).
  let ctx, source, eng;
  if (video.__counterDJPending__) {
    ({ ctx, source } = video.__counterDJPending__);
  } else {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    source = ctx.createMediaElementSource(video);
    video.__counterDJPending__ = { ctx, source };
  }

  // Isolator-style 3-band crossover: each band is a fully separate filtered signal path, so
  // killing a band's gain (see counterDJSetParam) truly silences it, not just attenuates.
  // Two cascaded Butterworth stages per edge (~4th-order/24dB-per-octave) for a clean kill
  // near crossover points.
  const LOW_MID_HZ = 250, MID_HIGH_HZ = 2500;
  function lowpassStage(freq) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq;
    f.Q.value = Math.SQRT1_2;
    return f;
  }
  function highpassStage(freq) {
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = freq;
    f.Q.value = Math.SQRT1_2;
    return f;
  }
  const low = ctx.createGain(); // names match counterDJSetParam's eng.low/mid/high lookup
  source.connect(lowpassStage(LOW_MID_HZ)).connect(lowpassStage(LOW_MID_HZ)).connect(low);
  const mid = ctx.createGain();
  source.connect(highpassStage(LOW_MID_HZ)).connect(highpassStage(LOW_MID_HZ))
    .connect(lowpassStage(MID_HIGH_HZ)).connect(lowpassStage(MID_HIGH_HZ)).connect(mid);
  const high = ctx.createGain();
  source.connect(highpassStage(MID_HIGH_HZ)).connect(highpassStage(MID_HIGH_HZ)).connect(high);

  const eqOut = ctx.createGain();
  low.connect(eqOut);
  mid.connect(eqOut);
  high.connect(eqOut);

  // FX chain: Filter and Delay are both PERMANENTLY in series (eqOut -> Filter -> Delay -> bus),
  // each holding its own independent value at all times — not a switched/exclusive slot. The
  // ◀/▶ knob-type selector only changes which one the single physical knob currently shows and
  // edits; the other keeps running exactly as last set. This is what lets you dial in a filter
  // sweep, page to Delay, and have the echo apply to the already-filtered signal (direct
  // request) — not an either/or effect slot, so there's no gate/crossfade here at all.
  // Filter starts wide open (lowpass @ 20kHz) so a fresh connect is transparent. Non-resonant
  // (same Butterworth Q as the crossover stages).
  const fx = ctx.createBiquadFilter();
  fx.type = 'lowpass';
  fx.frequency.value = 20000;
  fx.Q.value = Math.SQRT1_2;

  // Delay taps FILTER'S OUTPUT (not eqOut) — it's downstream in the chain, so it echoes whatever
  // Filter just did to the signal. Dry stays permanently at full (adds echo on top, doesn't
  // replace the signal); only the wet (repeats) level and density come from Delay's own knob
  // value, independent of whatever Filter's knob currently reads.
  const fxDelayDry = ctx.createGain();
  const fxDelayWet = ctx.createGain();
  fxDelayDry.gain.value = 1;
  fxDelayWet.gain.value = 0; // set by applyFxValue below, based on Delay's own value
  const fxDelayLine = ctx.createDelay(2.0);
  const fxDelayFeedback = ctx.createGain();
  fxDelayFeedback.gain.value = 0.35; // fixed — one physical knob per deck, not exposed separately
  fxDelayLine.delayTime.value = 0.3; // replaced below once initial/knob value is known
  const DELAY_WET_MAX = 0.7; // ceiling at full knob — stays a layer under the dry track, not a replacement

  const fxBus = ctx.createGain();

  fx.connect(fxDelayDry);
  fx.connect(fxDelayLine);
  fxDelayDry.connect(fxBus);
  fxDelayLine.connect(fxDelayFeedback);
  fxDelayFeedback.connect(fxDelayLine);
  fxDelayLine.connect(fxDelayWet);
  fxDelayWet.connect(fxBus);

  // Tracks which type the physical knob currently shows/edits — NOT which effect is "on" (both
  // always are). Only routes an incoming knob value (applyFxValue) to the right node.
  let fxType = 'filter';

  // BPM-synced delay time from repeat density: knob=0 -> sparse quarter-note echoes, knob=1 ->
  // dense eighth-of-a-beat stutter. Falls back to 120bpm before any lock (matches the beat
  // detector's own convergence — a brand new connect never has eng.detectedBpm yet).
  function delayTimeForKnob(knobValue, bpm) {
    const quarterNote = 60 / (bpm || 120);
    const divisor = Math.pow(2, knobValue * 3); // 1x..8x
    return Math.min(1.5, Math.max(0.04, quarterNote / divisor));
  }

  // Routes an incoming knob value to whichever type is CURRENTLY tracked as fxType — used both
  // for live knob turns and (via applyFxValueForType below) for seeding either node explicitly
  // regardless of which one the panel currently shows. Delay's own value is unipolar (0..1) and
  // drives both dimensions together — density (see delayTimeForKnob) AND wet level (fxDelayWet),
  // so turning it up reads as "more/denser echo", not just "louder": at 0 both bottom out, a
  // true, inaudible bypass. Filter's value stays the existing bipolar lowpass/highpass sweep.
  // Neither node is touched by the OTHER type's updates — each keeps whatever was last set here
  // even while the panel is showing the other one.
  function applyFxValue(value) {
    if (fxType === 'delay') {
      fxDelayLine.delayTime.value = delayTimeForKnob(value, eng ? eng.detectedBpm : null);
      fxDelayWet.gain.value = value * DELAY_WET_MAX;
    } else if (value <= 0) {
      fx.type = 'lowpass';
      fx.frequency.value = 20000 * Math.pow(100 / 20000, -value);
    } else {
      fx.type = 'highpass';
      fx.frequency.value = 20 * Math.pow(8000 / 20, value);
    }
  }

  // Applies a value to a SPECIFIC type's node regardless of which one is currently displayed —
  // temporarily borrows applyFxValue's routing rather than duplicating it. Used to seed both
  // nodes independently at connect time and to resync both on demand (see counterDJSetFxType).
  function applyFxValueForType(type, value) {
    const savedType = fxType;
    fxType = type;
    applyFxValue(value);
    fxType = savedType;
  }

  // Switches which type the knob shows/edits. Purely a UI-focus change — both Filter and Delay
  // stay live in the signal path regardless, so this never touches any audio param itself: no
  // ramp needed, nothing to click, nothing to resync.
  function applyFxType(type) {
    fxType = type;
    if (eng) eng.fxType = type;
  }

  const gain = ctx.createGain();
  const cross = ctx.createGain();

  // Apply starting values synchronously before unity gain ever reaches ctx.destination —
  // otherwise a guest deck briefly blasts at full volume until the async sendParam calls land.
  // dB-to-linear duplicated here because injected MAIN-world functions must stay self-contained.
  if (initial) {
    const dbToGain = (v) => (v <= -40 ? 0 : Math.pow(10, v / 20));
    if (typeof initial.low === 'number') low.gain.value = dbToGain(initial.low);
    if (typeof initial.mid === 'number') mid.gain.value = dbToGain(initial.mid);
    if (typeof initial.high === 'number') high.gain.value = dbToGain(initial.high);
    if (typeof initial.gain === 'number') gain.gain.value = initial.gain;
    if (typeof initial.rate === 'number') video.playbackRate = initial.rate;
    // Seed BOTH nodes independently — Filter and Delay are always live, not a switched slot —
    // then set which one the knob actually shows.
    if (typeof initial.filterValue === 'number') applyFxValueForType('filter', initial.filterValue);
    if (typeof initial.delayValue === 'number') applyFxValueForType('delay', initial.delayValue);
    fxType = typeof initial.fxType === 'string' ? initial.fxType : 'filter';
  }

  eqOut.connect(fx);
  fxBus.connect(gain).connect(cross).connect(ctx.destination);
  if (ctx.state === 'suspended') ctx.resume();
  // safety net: if resume() above was blocked, a genuine click on the page will unblock it
  document.addEventListener('click', () => { if (ctx.state === 'suspended') ctx.resume(); }, { capture: true });

  // Cue tap: simultaneous with master (not exclusive). Post-GAIN/pre-CROSSFADER (PFL behavior —
  // previews regardless of crossfader position). Routed through a separate hidden <audio> element
  // via HTMLMediaElement.setSinkId() — NOT AudioContext.setSinkId, which would move the whole
  // context including master onto the cue device. ctx.destination is never touched by cue.
  const cueDest = ctx.createMediaStreamDestination();
  gain.connect(cueDest);
  const cueAudioEl = new Audio();
  cueAudioEl.srcObject = cueDest.stream;
  cueAudioEl.muted = true; // silent until a deck is actually cued — see counterDJSetCue
  cueAudioEl.play().catch(() => {}); // needs to be playing for audio to flow once unmuted

  // Beat-detection tap off raw `source`, not the `low` EQ band — so killing the EQ low band
  // doesn't also blind the kick detector.
  const beatFilter = ctx.createBiquadFilter();
  beatFilter.type = 'lowpass';
  beatFilter.frequency.value = 150;
  source.connect(beatFilter);
  // analyser kept around only for the counterDJPoll energyNow diagnostic snapshot — the
  // actual continuous beat detector below no longer reads it.
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  const silentGain = ctx.createGain();
  silentGain.gain.value = 0;
  beatFilter.connect(analyser).connect(silentGain).connect(ctx.destination);

  // Level meter tap: post-EQ (band kills are visible) but pre-GAIN/pre-cross. Full-range,
  // unlike the beat-detection analyser above.
  const levelAnalyser = ctx.createAnalyser();
  levelAnalyser.fftSize = 512;
  const levelSilentGain = ctx.createGain();
  levelSilentGain.gain.value = 0;
  eqOut.connect(levelAnalyser).connect(levelSilentGain).connect(ctx.destination);

  // Beat detection on ScriptProcessorNode.onaudioprocess, NOT requestAnimationFrame — rAF is
  // throttled hard on background tabs (one of the two YouTube tabs is always background).
  // onaudioprocess is driven by the audio engine's own buffering, same reason background tabs
  // keep playing audio at all. AudioWorkletNode (the modern replacement) requires an external
  // module URL, adding CSP risk on a page we don't control.
  // Buffer size 1024 (halved from 2048) — onset-timing floor halves to ~23ms at 44.1kHz.
  // cpuStats (see counterDJPerfStats) measures whether the double callback frequency is noticeable.
  const BEAT_PROCESSOR_BUFFER_SIZE = 1024;
  const beatProcessor = ctx.createScriptProcessor(BEAT_PROCESSOR_BUFFER_SIZE, 1, 1);

  const beatProcessorSilentGain = ctx.createGain();
  beatProcessorSilentGain.gain.value = 0;
  beatFilter.connect(beatProcessor).connect(beatProcessorSilentGain).connect(ctx.destination);

  // Date.now() (epoch, globally comparable), NOT performance.now() (relative to THIS document's
  // navigation start — useless for comparing timing across two tabs, which phase sync needs).
  // recentOnsets is kept as a cheap rolling history for diagnostics; the phase-sync path now
  // feeds lastOnsetWallClock straight into the Kalman filter (see kalmanPhaseUpdate).
  window.__counterDJ__ = {
    ctx, low, mid, high, fx, gain, cross, video, analyser, levelAnalyser, cueAudioEl,
    detectedBpm: null, beatCount: 0, lastOnsetWallClock: null, recentOnsets: [],
    fxType, fxDelayLine, applyFxType, applyFxValue, applyFxValueForType,
  };
  eng = window.__counterDJ__;
  // Rolling self-timing for the beat-detection callback only — not browser CPU overall
  // (dominated by YouTube's own video decode). Read via counterDJPerfStats() from the side panel.
  eng.perfStats = { count: 0, totalMs: 0, maxMs: 0, bufferSize: BEAT_PROCESSOR_BUFFER_SIZE, sampleRate: ctx.sampleRate };

  // Onset detector design (replacing a naive "energy spike vs rolling average" that swung wildly):
  //   - half-wave-rectified ENERGY FLUX (increase in energy, not level) — sustained bass notes
  //     don't re-trigger false onsets
  //   - ADAPTIVE threshold (mean + 1.5x std-dev of recent flux) — no per-track tuning needed
  //   - IOI HISTOGRAM VOTING with multi-hop pairing (vote against each of the last 8 onsets) —
  //     one bad onset pollutes few votes; true tempo accumulates dozens; votes decay over time
  //   - octave normalization to 90-180 BPM — kick patterns are ambiguous with half/double tempo
  //   - confidence gate + EMA smoothing — only commit once the histogram peak holds a majority
  // Lives on `eng` so counterDJResetDetector() can wipe it on a same-tab track change.
  // window.__counterDJ__ survives SPA navigation — without a reset, a stale post-lock BPM needs
  // 20 straight agreeing onsets to move and could outlast the new track entirely.
  //
  // OBTAIN-style overlapping-window timing: ScriptProcessorNode fires once per
  // BEAT_PROCESSOR_BUFFER_SIZE, no real overlap possible — so instead a circular buffer of
  // ENERGY_WINDOW_SAMPLES runs continuously via O(1) sliding sums, and the onset CHECK fires
  // every HOP_SAMPLES. Onset timing resolution: HOP_SAMPLES/sampleRate (~5.8ms) vs the old
  // ~23ms window duration — a 4x improvement. FLUX_HISTORY_CAP is tied to HOP_SAMPLES (the
  // actual check rate), kept as a rolling sum to avoid per-hop reduce() cost at 4x check rate.
  const ENERGY_WINDOW_SAMPLES = 1024;
  const HOP_SAMPLES = 256;
  const FLUX_HISTORY_CAP = Math.round(2 * ctx.sampleRate / HOP_SAMPLES);
  eng.detector = {
    energyRing: new Float32Array(ENERGY_WINDOW_SAMPLES), energyRingIndex: 0, sumSquares: 0, prevEnergy: 0,
    samplesSinceHop: 0,
    fluxRing: new Float32Array(FLUX_HISTORY_CAP), fluxRingIndex: 0, fluxRingFilled: 0, fluxSum: 0, fluxSumSquares: 0,
    lastOnsetAt: 0, onsetTimes: [],
    bpmVotes: new Map(), lastTopBpm: null, stableCount: 0,
  };

  function normalizeBpm(bpm) {
    while (bpm < 90) bpm *= 2;
    while (bpm > 180) bpm /= 2;
    return bpm;
  }

  beatProcessor.onaudioprocess = (e) => {
    // stop cleanly if this engine got replaced by a fresh counterDJSetup call
    if (window.__counterDJ__ !== eng) { beatProcessor.onaudioprocess = null; return; }
    const perfStart = performance.now();
    const det = eng.detector;
    const buf = e.inputBuffer.getChannelData(0);
    const W = det.energyRing.length;
    const H = det.fluxRing.length;

    for (let i = 0; i < buf.length; i++) {
      const s = buf[i];
      const outgoingSample = det.energyRing[det.energyRingIndex];
      det.sumSquares += s * s - outgoingSample * outgoingSample;
      det.energyRing[det.energyRingIndex] = s;
      det.energyRingIndex = (det.energyRingIndex + 1) % W;

      det.samplesSinceHop++;
      if (det.samplesSinceHop < HOP_SAMPLES) continue;
      det.samplesSinceHop = 0;

      // guard against float drift over a long session — sumSquares should never truly go
      // negative, but repeated add/subtract can nudge it a hair below zero
      const energy = Math.sqrt(Math.max(0, det.sumSquares) / W);
      const flux = Math.max(0, energy - det.prevEnergy);
      det.prevEnergy = energy;

      if (det.fluxRingFilled === H) {
        const outgoingFlux = det.fluxRing[det.fluxRingIndex];
        det.fluxSum -= outgoingFlux;
        det.fluxSumSquares -= outgoingFlux * outgoingFlux;
      } else {
        det.fluxRingFilled++;
      }
      det.fluxRing[det.fluxRingIndex] = flux;
      det.fluxSum += flux;
      det.fluxSumSquares += flux * flux;
      det.fluxRingIndex = (det.fluxRingIndex + 1) % H;

      const mean = det.fluxSum / det.fluxRingFilled;
      const variance = Math.max(0, det.fluxSumSquares / det.fluxRingFilled - mean * mean);
      const threshold = mean + 1.5 * Math.sqrt(variance);

      const now = performance.now();
      // 300ms refractory (max 200bpm) — long enough to not double-count one kick's attack+decay
      if (flux > threshold && flux > 0.00005 && now - det.lastOnsetAt > 300) {
        det.lastOnsetAt = now;
        eng.beatCount = (eng.beatCount || 0) + 1;
        eng.lastOnsetWallClock = Date.now();
        eng.recentOnsets.push(eng.lastOnsetWallClock);
        if (eng.recentOnsets.length > 8) eng.recentOnsets.shift();
        det.onsetTimes.push(now);
        if (det.onsetTimes.length > 9) det.onsetTimes.shift(); // up to 8 hops back from the newest

        for (const [bpm, votes] of det.bpmVotes) {
          const decayed = votes * 0.98;
          if (decayed < 0.05) det.bpmVotes.delete(bpm); else det.bpmVotes.set(bpm, decayed);
        }
        for (let hop = 1; hop < det.onsetTimes.length; hop++) {
          const perBeatMs = (now - det.onsetTimes[det.onsetTimes.length - 1 - hop]) / hop;
          if (perBeatMs < 150 || perBeatMs > 2000) continue; // implausible (>400bpm or <30bpm)
          const bpm = Math.round(normalizeBpm(60000 / perBeatMs));
          det.bpmVotes.set(bpm, (det.bpmVotes.get(bpm) || 0) + 1);
        }

        let topBpm = null, topVotes = 0, totalVotes = 0;
        for (const [bpm, votes] of det.bpmVotes) {
          totalVotes += votes;
          if (votes > topVotes) { topVotes = votes; topBpm = bpm; }
        }
        const confidence = totalVotes ? topVotes / totalVotes : 0;
        // On syncopated material, vote-share alone never clears 0.25 even when the top bin is
        // stable — accept via sustained-agreement (stableCount) as an alternate path.
        if (topBpm === det.lastTopBpm) det.stableCount++; else { det.stableCount = 1; det.lastTopBpm = topBpm; }
        const locked = eng.detectedBpm != null;
        // Post-lock: require 20 straight agreeing onsets to move the value — quiet passages
        // produce scattered onsets that can't agree 20 times in a row on a wrong bin.
        // First-lock thresholds are looser (totalVotes>=5, stableCount>=4) so lock isn't slow.
        const confident = locked ? det.stableCount >= 20 : ((totalVotes >= 5 && confidence > 0.25) || det.stableCount >= 4);
        if (eng.beatCount >= 5 && confident) {
          // Not rounded — display shows real fraction, tempo-blend math is more accurate.
          // FREEZE once settled: perpetual EMA creep after stableCount > 40 kept re-triggering
          // pollOneDeckStatus's bpmChanged branch, fighting the phase trim on every onset.
          const SETTLE_STABLE_ONSETS = 40;
          if (!locked) {
            eng.detectedBpm = topBpm;
          } else if (det.stableCount <= SETTLE_STABLE_ONSETS) {
            eng.detectedBpm = 0.08 * topBpm + 0.92 * eng.detectedBpm; // still converging
          } // else: settled — hold steady
        }
      }
    }
    // Recorded every callback — the ring-buffer work above runs regardless of whether an onset fired.
    const perfMs = performance.now() - perfStart;
    eng.perfStats.count++;
    eng.perfStats.totalMs += perfMs;
    if (perfMs > eng.perfStats.maxMs) eng.perfStats.maxMs = perfMs;
  };

  return {
    ok: true,
    videoCount: videos.length,
    playing: !video.paused,
    muted: video.muted,
    ctxState: ctx.state,
    hasFxTypes: true,
  };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e), exception: true };
  }
}

// Resets the beat detector for a same-tab SPA track change — window.__counterDJ__ survives
// the navigation, but the audio is now a different song. counterDJSetup() can't do this
// because it early-returns `already:true` against the same engine to avoid double-wiring the graph.
function counterDJResetDetector() {
  const eng = window.__counterDJ__;
  if (!eng) return { ok: false, error: 'not connected' };
  eng.detectedBpm = null;
  eng.beatCount = 0;
  eng.lastOnsetWallClock = null;
  eng.recentOnsets = [];
  // Same shape as counterDJSetup's eng.detector (sliding energy ring + hop-triggered flux ring).
  const ENERGY_WINDOW_SAMPLES = 1024;
  const HOP_SAMPLES = 256;
  const FLUX_HISTORY_CAP = Math.round(2 * eng.ctx.sampleRate / HOP_SAMPLES);
  eng.detector = {
    energyRing: new Float32Array(ENERGY_WINDOW_SAMPLES), energyRingIndex: 0, sumSquares: 0, prevEnergy: 0,
    samplesSinceHop: 0,
    fluxRing: new Float32Array(FLUX_HISTORY_CAP), fluxRingIndex: 0, fluxRingFilled: 0, fluxSum: 0, fluxSumSquares: 0,
    lastOnsetAt: 0, onsetTimes: [],
    bpmVotes: new Map(), lastTopBpm: null, stableCount: 0,
  };
  return { ok: true };
}

function counterDJSetParam(param, value) {
  const eng = window.__counterDJ__;
  if (!eng) return { ok: false, error: 'not connected' };
  if (eng.ctx.state === 'suspended') eng.ctx.resume();
  if (param === 'low' || param === 'mid' || param === 'high') {
    // Each band is a fully separate signal path (see counterDJSetup), so gain=0 truly silences
    // it. -40 must match EQ_MIN in outer scope — duplicated (injected functions must be self-contained).
    eng[param].gain.value = value <= -40 ? 0 : Math.pow(10, value / 20);
  }
  else if (param === 'fx') {
    // eng.applyFxValue (built in counterDJSetup) knows which type is active: bipolar lowpass/
    // highpass sweep for Filter (negative sweeps lowpass down from 20kHz, positive sweeps highpass
    // up from 20Hz — exponential curve since frequency perception is logarithmic), or unipolar
    // repeat-density for Delay. A stale pre-FX-type tab has no applyFxValue — fall back to the old
    // direct filter-only behavior so it still works until the tab is reloaded.
    if (eng.applyFxValue) {
      eng.applyFxValue(value);
    } else if (value <= 0) {
      eng.fx.type = 'lowpass';
      eng.fx.frequency.value = 20000 * Math.pow(100 / 20000, -value);
    } else {
      eng.fx.type = 'highpass';
      eng.fx.frequency.value = 20 * Math.pow(8000 / 20, value);
    }
  }
  else if (param === 'gain') eng.gain.gain.value = value;
  else if (param === 'cross') eng.cross.gain.value = value;
  else if (param === 'rate') {
    // preservesPitch set once at setup — not re-set on every change (could disturb routing on
    // decks already through createMediaElementSource).
    eng.video.playbackRate = value;
  }
  else return { ok: false, error: 'unknown param ' + param };
  return { ok: true };
}

// Switches the FX slot's active type (Filter/Delay), applying the new type's own knob value
// immediately so the switch is audible right away — not silent until the knob is next touched.
// No early-return on "already this type": sendTrackToOtherDeck always re-applies even when the
// type isn't changing, since the tab that just inherited the box may still carry the OTHER box's
// old fx routing state.
function counterDJSetFxType(displayType, filterValue, delayValue) {
  const eng = window.__counterDJ__;
  if (!eng) return { ok: false, error: 'not connected' };
  if (eng.ctx.state === 'suspended') eng.ctx.resume();
  if (!eng.applyFxType || !eng.applyFxValueForType) {
    return { ok: false, error: 'FX bus missing — reconnect this deck to pick up FX types' };
  }
  // filterValue/delayValue are optional — omitted on a plain type-switch, since both nodes
  // are always live and already hold whatever was last set; only a fresh connect or an explicit
  // resync (e.g. after a track swap) needs to push both values again.
  if (typeof filterValue === 'number') eng.applyFxValueForType('filter', filterValue);
  if (typeof delayValue === 'number') eng.applyFxValueForType('delay', delayValue);
  eng.applyFxType(displayType);
  return { ok: true };
}

// Mutes/unmutes the cue element only — NOT the AudioContext, so master is never interrupted.
// active=true routes to deviceId via HTMLMediaElement.setSinkId() and only unmutes on success,
// so a failed device switch never silently plays cue out of the wrong device.
function counterDJSetCue(deviceId, active) {
  try {
    const eng = window.__counterDJ__;
    if (!eng) return { ok: false, error: 'not connected' };
    if (!eng.cueAudioEl) return { ok: false, error: 'cue tap missing — reconnect this deck' };
    if (!active) {
      eng.cueAudioEl.muted = true;
      return { ok: true };
    }
    if (typeof eng.cueAudioEl.setSinkId !== 'function') {
      return { ok: false, error: 'setSinkId unsupported in this browser/version' };
    }
    return eng.cueAudioEl.setSinkId(deviceId || '').then(
      () => {
        eng.cueAudioEl.muted = false;
        return { ok: true };
      },
      (err) => ({ ok: false, error: `${err.name}: ${err.message}` })
    );
  } catch (e) {
    return { ok: false, error: `${e.name}: ${e.message}` };
  }
}

// Chapters-first skip with smart-previous (first press restarts current chapter, second goes back).
// Chapters from ytd-macro-markers-list-item-renderer DOM nodes, NOT window.ytInitialData —
// ytInitialData is a hard-page-load snapshot that YouTube's SPA router never refreshes on a
// client-side video change, so it kept describing the previous video after every track switch.
// The DOM marker list is a live Polymer element; each item's .data.onTap.watchEndpoint.videoId
// is checked against the current video_id as a freshness guard (stale nodes briefly linger).
// Falls through to .ytp-next-button/.ytp-prev-button (works via .click() even while hidden)
// when there are no chapters or no match.
function counterDJSkip(direction) {
  try {
    const eng = window.__counterDJ__;
    if (!eng) return { ok: false, error: 'not connected' };
    const video = eng.video;
    const mp = document.querySelector('#movie_player');

    let chapters = null;
    try {
      const currentId = mp && mp.getVideoData ? mp.getVideoData().video_id : null;
      const items = Array.from(document.querySelectorAll('ytd-macro-markers-list-item-renderer'))
        .map((el) => {
          const onTap = el.data && el.data.onTap && el.data.onTap.watchEndpoint;
          const title = el.data && el.data.title && (el.data.title.simpleText || el.data.title);
          if (!onTap || onTap.videoId !== currentId || onTap.startTimeSeconds == null) return null;
          return { title, startSec: onTap.startTimeSeconds };
        })
        .filter(Boolean);
      // YouTube renders each chapter in more than one DOM location (description panel list +
      // preview strip), so the same startSec shows up multiple times — dedupe before using it.
      const seen = new Set();
      const deduped = items.filter((c) => (seen.has(c.startSec) ? false : (seen.add(c.startSec), true)));
      deduped.sort((a, b) => a.startSec - b.startSec);
      if (deduped.length) chapters = deduped;
    } catch (e) { /* chapters are a nice-to-have — any parsing hiccup just falls through below */ }

    if (direction === 'next') {
      if (chapters && chapters.length) {
        const upcoming = chapters.find((c) => c.startSec > video.currentTime + 0.5);
        if (upcoming) {
          video.currentTime = upcoming.startSec;
          return { ok: true };
        }
      }
      const btn = document.querySelector('.ytp-next-button');
      if (btn) btn.click();
      return { ok: true };
    }

    // direction === 'prev'
    const currentChapterStart = (chapters && chapters.length &&
      [...chapters].reverse().find((c) => c.startSec <= video.currentTime + 0.5)?.startSec) || 0;
    const atStart = video.currentTime <= currentChapterStart + 1.5;
    if (!atStart) {
      video.currentTime = currentChapterStart;
      return { ok: true };
    }
    if (chapters && chapters.length) {
      const prevChapter = [...chapters].reverse().find((c) => c.startSec < currentChapterStart - 0.5);
      if (prevChapter) {
        video.currentTime = prevChapter.startSec;
        return { ok: true };
      }
    }
    const prevBtn = document.querySelector('.ytp-prev-button');
    if (prevBtn) prevBtn.click();
    else video.currentTime = 0;
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `${e.name}: ${e.message}` };
  }
}

// These MUST run inside the deck's youtube.com tab, not the extension's chrome-extension://
// document. Chrome scopes MediaDevice deviceIds per top-level origin — an id enumerated from
// the extension origin is a different string than the same device's id inside youtube.com, so
// setSinkId() always fails with NotFoundError if the id came from the side panel.
// counterDJMicPermissionState() is a read-only pre-check so the side panel can skip the
// tab-focus dance when mic was already granted in a prior session (getUserMedia resolves silently).
function counterDJMicPermissionState() {
  if (!navigator.permissions || !navigator.permissions.query) return Promise.resolve('unknown');
  return navigator.permissions.query({ name: 'microphone' }).then(
    (status) => status.state,
    () => 'unknown'
  );
}

function counterDJUnlockMic() {
  return navigator.mediaDevices.getUserMedia({ audio: true }).then(
    (stream) => {
      stream.getTracks().forEach((t) => t.stop());
      return { ok: true };
    },
    (err) => ({ ok: false, error: `${err.name}: ${err.message}` })
  );
}

function counterDJEnumerateOutputs() {
  return navigator.mediaDevices.enumerateDevices().then(
    (devices) => ({
      ok: true,
      outputs: devices
        .filter((d) => d.kind === 'audiooutput')
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Output ${i + 1}` })),
    }),
    (err) => ({ ok: false, error: `${err.name}: ${err.message}` })
  );
}

// Last detected onset wall-clock + current rate — enough for the side panel to compute
// and correct each deck's beat-grid phase drift.
function counterDJPhaseInfo() {
  const eng = window.__counterDJ__;
  if (!eng) return null;
  return { lastOnsetWallClock: eng.lastOnsetWallClock, recentOnsets: eng.recentOnsets, rate: eng.video.playbackRate };
}

// Beat-detector self-timing stats. cpuPct = avg callback duration / real-time budget (bufferSize/sampleRate)
// — isolates the detector's own CPU cost from YouTube's video decode overhead.
function counterDJPerfStats() {
  const eng = window.__counterDJ__;
  if (!eng || !eng.perfStats) return null;
  const p = eng.perfStats;
  const blockPeriodMs = (p.bufferSize / p.sampleRate) * 1000;
  const avgMs = p.count ? p.totalMs / p.count : 0;
  return {
    count: p.count, avgMs, maxMs: p.maxMs, bufferSize: p.bufferSize,
    blockPeriodMs, cpuPct: blockPeriodMs ? (avgMs / blockPeriodMs) * 100 : 0,
  };
}

// Immediate seek — nudge buttons previously only changed state.phaseOffsetEighths and let the
// background trim loop (sub-2% pitch, gated on lock state) chase it. An eighth-note offset
// (12.5% of a beat) often didn't cross the exit threshold, so clicks had no felt effect.
// A manual nudge needs an immediate reposition, not a slow background trim.
function counterDJSeekBy(deltaSeconds) {
  const eng = window.__counterDJ__;
  if (!eng) return { ok: false, error: 'not connected' };
  if (!eng.video || !eng.video.isConnected) {
    const fresh = document.querySelector('video.html5-main-video') ||
      Array.from(document.querySelectorAll('video')).find((v) => v.isConnected);
    if (!fresh) return { ok: false, error: 'video element detached and no replacement found' };
    eng.video = fresh;
  }
  eng.video.currentTime = Math.max(0, eng.video.currentTime + deltaSeconds);
  return { ok: true };
}

async function counterDJTransport(action) {
  const eng = window.__counterDJ__;
  if (!eng) return { ok: false, error: 'not connected' };
  // YouTube swaps out <video> on autoplay-next/ad/quality-change. .play()/.pause() on a
  // detached node silently does nothing — re-find the live node rather than ghost-control it.
  if (!eng.video || !eng.video.isConnected) {
    const fresh = document.querySelector('video.html5-main-video') ||
      Array.from(document.querySelectorAll('video')).find((v) => v.isConnected);
    if (!fresh) return { ok: false, error: 'video element detached and no replacement found' };
    eng.video = fresh;
  }
  if (action === 'restart') {
    // A genuine Play click always wins — cancel the connect-time autoplay guard (if it's still
    // active) before calling .play() below, or it would immediately pause this right back.
    if (eng.video.__counterDJCancelPauseGuard__) {
      eng.video.__counterDJCancelPauseGuard__();
      eng.video.__counterDJCancelPauseGuard__ = null;
    }
    eng.video.currentTime = 0;
    // YouTube autoplays a never-focused background tab MUTED (browser policy permits silent
    // autoplay, not audible) — video.paused reads false, but there's no real sound. A deliberate
    // Play click is a genuine reason to unmute; without this the track could stay muted forever
    // even after the user explicitly asked to hear it (2026-08-07, direct report — a deck showed
    // "playing" with no audio until the tab was manually revisited).
    eng.video.muted = false;
    // Audio is rerouted through our own AudioContext (createMediaElementSource) — a suspended
    // context outputs silence regardless of video.paused/.muted. A real click carries user
    // activation into this executeScript call, so resume() here should succeed — awaited so
    // ctxState below reflects the post-resume truth, not a stale 'suspended' read taken before
    // the transition finished.
    if (eng.ctx.state === 'suspended') await eng.ctx.resume().catch(() => {});
    // .play() can reject (autoplay policy) — await it so callers see the real outcome, not always ok:true.
    try {
      await eng.video.play();
      return { ok: true, playing: !eng.video.paused, muted: eng.video.muted, ctxState: eng.ctx.state };
    } catch (err) {
      return { ok: false, error: `play() rejected: ${err.name}: ${err.message}` };
    }
  } else if (action === 'pause') {
    eng.video.pause();
    return { ok: true, playing: !eng.video.paused };
  }
  return { ok: false, error: 'unknown action ' + action };
}

// Fast-polled level+waveform read (separate from counterDJPoll) — no chapter/BPM bookkeeping,
// just one pass over the level-meter buffer, so it can run several times a second without cost.
// Measured round-trip cost of this exact tap (2026-08-23, both decks live, 20ms interval):
// avg ~2.1ms/tick combined, occasional spikes to ~30ms causing <1% of ticks to skip (self-
// recovering, no drift) — comfortably inside a 20ms budget. peak (not the full sample array)
// is returned for the waveform: a single float is even cheaper than the RMS-only version this
// replaced, and matches a real audio-editor waveform (amplitude envelope), not an oscilloscope trace.
function counterDJLevel() {
  const eng = window.__counterDJ__;
  if (!eng) return null;
  const data = new Uint8Array(eng.levelAnalyser.fftSize);
  eng.levelAnalyser.getByteTimeDomainData(data);
  let sum = 0;
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128;
    sum += v * v;
    const av = Math.abs(v);
    if (av > peak) peak = av;
  }
  const rms = Math.sqrt(sum / data.length);
  const db = rms > 0 ? Math.max(-60, 20 * Math.log10(rms)) : -60;
  return { db, peak };
}

// Polled (no push channel from YouTube to side panel) — catches passive changes: user pause
// via YouTube controls, chapter rollover, tab reload/navigate-away (__counterDJ__ gone).
function counterDJPoll() {
  const eng = window.__counterDJ__;
  // .ytp-chapter-title-content stays in DOM with placeholder text ("In this video") even when
  // no chapters exist — just hidden, not absent. offsetParent alone misses visibility/opacity
  // hiding, so computed style is also checked. Placeholder string excluded as a fallback
  // (brittle, but visibility checks alone weren't reliable).
  const chapterEl = document.querySelector('.ytp-chapter-title-content');
  let chapterVisible = false;
  if (chapterEl) {
    const style = getComputedStyle(chapterEl);
    const text = chapterEl.textContent.trim();
    const isPlaceholder = /^in this video$/i.test(text) || text === 'В этом видео';
    chapterVisible = style.display !== 'none' && style.visibility !== 'hidden' &&
      chapterEl.offsetParent !== null && !isPlaceholder;
  }
  // energyNow is a diagnostic field — read via this panel's own DevTools console, not the tab's.
  let energyNow = null;
  if (eng) {
    const data = new Uint8Array(eng.analyser.fftSize);
    eng.analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
    energyNow = sum / data.length;
  }
  return {
    ok: true,
    connected: !!eng,
    playing: eng ? !eng.video.paused : null,
    chapterTitle: (chapterVisible && chapterEl.textContent.trim()) || null,
    detectedBpm: eng ? eng.detectedBpm : null,
    beatCount: eng ? (eng.beatCount || 0) : 0,
    ctxState: eng ? eng.ctx.state : null,
    videoMuted: eng ? eng.video.muted : null,
    currentTime: eng ? eng.video.currentTime : null,
    energyNow,
    lastOnsetWallClock: eng ? eng.lastOnsetWallClock : null,
    recentOnsets: eng ? eng.recentOnsets : [],
  };
}

// ---- side panel logic ----

// ---- UI strings — editable wording without shipping a new extension version ----
// DEFAULT_STRINGS ships in the extension and always works offline/on first run. On load we try
// to fetch a fresher copy from groovemix.app and cache it, so a wording tweak (e.g. rephrasing
// an error) reaches users on their next panel open without a Chrome Web Store review cycle.
// Only wording lives here — deck letters and raw error text from the page/mixer are passed as
// {vars}, never baked into the template, so the source of truth for *facts* stays in the code.
const DEFAULT_STRINGS = {
  'status.noTabsOpen': 'Open YouTube tabs to start mixing',
  'status.pickATab': 'Pick a tab for at least one deck',
  'status.sameTabError': 'Deck A and Deck B must be different tabs',
  'status.noOtherTab': 'No other YouTube tab open for Deck {deck}',
  'status.alreadyConnected': 'Already connected',
  'status.connecting': 'Connecting…',
  'status.connectFailed': 'Connect failed: {reason}',
  'status.deckError': 'Deck {deck} error: {reason}',
  'status.deckDisconnected': 'Deck {deck} disconnected — {reason}. Reconnect',
  'status.nonFiniteValue': 'Deck {deck} {param}: skipped a non-finite value ({value})',
  'status.paramError': 'Deck {deck} {param}: {reason}',
  'status.deckCue': 'Deck {deck} cue: {reason}',
  'status.deckCueError': 'Deck {deck} cue error: {reason}',
  'status.deckSkip': 'Deck {deck} skip: {reason}',
  'status.deckSkipError': 'Deck {deck} skip error: {reason}',
  'status.deckTransport': 'Deck {deck}: {reason}',
  'status.deckInjection': 'Deck {deck}: {reason}',
  'status.phaseSyncFailed': 'Phase sync failed: {reason}',
  'status.cueDevicesFailed': "Can't list cue devices: {reason}",
  'status.micPermissionNeeded': 'Mic permission needed for device names: {reason}',
  'status.noResult': 'no result',
  'status.transportFailed': 'transport failed',
  'status.injectionFailed': 'injection failed',
  'menu.noTabsOpen': 'No YouTube tabs open',
  'menu.noOtherTabs': 'No other tabs available',
};
// Keys whose current wording marks a transitional/expected state, not a problem — kept as keys
// (not literal text) so a remote reword of e.g. "Connecting…" can't silently break the match.
const NON_ERROR_STATUS_KEYS = new Set(['status.connecting', 'status.alreadyConnected']);

let STRINGS = { ...DEFAULT_STRINGS };
function t(key, vars) {
  let str = STRINGS[key] ?? DEFAULT_STRINGS[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, v);
  return str;
}
const STRINGS_URL = 'https://groovemix.app/strings.json';
const STRINGS_CACHE_KEY = 'uiStrings';
async function loadStrings() {
  try {
    const cached = await chrome.storage.local.get(STRINGS_CACHE_KEY);
    if (cached[STRINGS_CACHE_KEY]) STRINGS = { ...DEFAULT_STRINGS, ...cached[STRINGS_CACHE_KEY] };
  } catch {}
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(STRINGS_URL, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    if (res.ok) {
      const remote = await res.json();
      if (remote && typeof remote === 'object') {
        STRINGS = { ...DEFAULT_STRINGS, ...remote };
        chrome.storage.local.set({ [STRINGS_CACHE_KEY]: remote });
      }
    }
  } catch {} // offline, blocked, or bad JSON — cached or default strings already in STRINGS
}
loadStrings();

// 3-band EQ acts as the isolator — a deck's "level" is how hard the bands are cut.
// Gain is a separate line-fader (own graph node), distinct from the EQ isolator.

const EQ_MIN = -40, EQ_MAX = 6, EQ_STEP = 2;
const GAIN_MIN = 0, GAIN_MAX = 1.5, GAIN_STEP = 0.05;
// FX: bipolar filter knob, 0 = bypass. Negative = lowpass sweep down, positive = highpass up.
// See counterDJSetParam's 'fx' branch for the exponential frequency curve.
const FX_MIN = -1, FX_MAX = 1, FX_STEP = 0.1;
// Delay's own knob range: unipolar 0..1, drives both wet level and repeat density together (see
// counterDJSetup's applyFxValue) — reset at 0 is a genuine bypass (silent), same convention as
// Filter's own reset: turning the knob up from rest is what makes the effect audible, at 12
// o'clock/rest neither type colors the sound (direct request).
const FX_TYPES = {
  filter: { label: 'FILTER', min: FX_MIN, max: FX_MAX, step: FX_STEP, reset: 0 },
  delay: { label: 'DELAY', min: 0, max: 1, step: 0.1, reset: 0 },
};
const FX_TYPE_ORDER = ['filter', 'delay'];
// One physical knob per deck serves whichever type is active — every place that used to read the
// static FX_MIN/MAX/STEP now resolves it per-deck through this.
function fxRange(deck) {
  return FX_TYPES[state.decks[deck].fxType] || FX_TYPES.filter;
}
const CROSS_STEP = 0.05; // must evenly divide 0.5 so the center (50%) is always reachable
// A fully EQ-killed or crossfader-cut deck is inaudible and excluded from beatmatching.
// Split into two functions so the sync UI can distinguish the two cases (crossfader-out is a
// positive "nothing can be out of phase" state; EQ-kill is not).
function isDeckEqKilled(deck) {
  const d = state.decks[deck];
  return d.high <= EQ_MIN && d.mid <= EQ_MIN && d.low <= EQ_MIN;
}
function isDeckCrossedOut(deck) {
  return deck === 'A' ? state.cross >= 1 : state.cross <= 0;
}
function isDeckSilent(deck) {
  return isDeckEqKilled(deck) || isDeckCrossedOut(deck);
}

// PostHog: same project/proxy as groovemix.app (first-party ingest, not blocked by ad blockers).
// autocapture:true — goals defined retroactively in PostHog UI without per-goal code changes.
// capture_pageview:false — the panel has no page navigation; $pageview per load would be noise.
if (window.posthog) {
  posthog.init('phc_BAghKLaJXyEZ9hcPdjQ7BFfQ3543X6aDDjzapsrJTE3S', {
    api_host: 'https://groovemix.app/ingest',
    ui_host: 'https://us.posthog.com',
    autocapture: true,
    capture_pageview: false,
    persistence: 'localStorage',
    // MV3 CSP (script-src 'self') blocks PostHog's lazy-loaded config.js/surveys.js.
    // Surveys is not used (custom feedback widget instead), and no feature flags are read —
    // tell the SDK not to try rather than relaxing the CSP (which flags a Web Store review).
    disable_external_dependency_loading: true,
    // All users are anonymous — 'identified_only' (the default) only creates a person profile
    // when identify() fires, which never happens here. That silently starves Retention/Lifecycle
    // (person-profile-based) even though events land fine. 'always' creates a profile from the
    // first event, matching how all other GrooveMix insights count people.
    person_profiles: 'always',
  });
  // Separates extension events from groovemix.app site events within the same PostHog project.
  posthog.register({ source: 'extension' });
  // Fires on every panel open, independent of whether a YouTube tab exists or a track ever loads —
  // track_loaded requires real usage, so it can't tell "installed but never opened" apart from
  // "opened but nothing to mix yet". first_time_for_user math on this event gives install count.
  posthog.capture('app_launched');
  // Owner exclusion: set localStorage.setItem('ph_owner','1') once in DevTools to tag all
  // future sessions as the owner. Uses identify() (not opt_out_capturing) so the sessions are
  // still visible when searched, just excluded by PostHog's "Internal Accounts" filter.
  try {
    if (localStorage.getItem('ph_owner') === '1') {
      posthog.identify('groovemix-owner', { email: 'hellokbbureau@gmail.com' });
    }
  } catch (e) {}
  // Unhandled errors/rejections — captureException goes to PostHog Error Tracking (by stack trace),
  // separate from the ui_error event stream (handled application messages via setStatus).
  window.addEventListener('error', (event) => {
    if (window.posthog) posthog.captureException(event.error || new Error(event.message), { breadcrumbs: breadcrumbs.slice() });
  });
  window.addEventListener('unhandledrejection', (event) => {
    if (window.posthog) posthog.captureException(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), { breadcrumbs: breadcrumbs.slice() });
  });
}
// Per-session feature-touch flags, registered as super-properties so they stamp every event
// in the session. Fired once per session (engagementFlags dedupes continuous drag ticks).
const engagementFlags = new Set();
function trackEngagementOnce(flag) {
  if (engagementFlags.has(flag) || !window.posthog) return;
  engagementFlags.add(flag);
  addBreadcrumb(flag);
  posthog.register({ [flag]: true });
}

// Rolling action trail attached to each error report. Not every drag tick — lifecycle events
// (connect/skip/track/license) are logged at their call sites; repeated actions (rapid re-skips
// before a crash) are exactly the pattern worth capturing.
const MAX_BREADCRUMBS = 20;
const breadcrumbs = [];
function addBreadcrumb(action) {
  breadcrumbs.push(`${new Date().toISOString().slice(11, 19)} ${action}`);
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();
}

// Trial = active mixing time (either deck actually playing), not wall-clock since install —
// opening the panel without playing anything doesn't burn it down.
const TRIAL_LIMIT_MS = 5 * 60 * 60 * 1000;
// TODO: replace with the real Gumroad listing URL once it exists.
const GUMROAD_PRODUCT_URL = 'https://fadercraft.gumroad.com/l/groove-mix';
const GUMROAD_COFFEE_URL = 'https://fadercraft.gumroad.com/coffee';
// id-only path (no slug) — Chrome Web Store resolves this reliably regardless of the listing's
// display name; /reviews opens straight to the reviews tab instead of the top of the listing.
const CWS_REVIEW_URL = 'https://chromewebstore.google.com/detail/kiigcdfcmdanbpjpgilolmchobnpmjij/reviews';

// Any star click — footer or the feedback popover's own rating row — is analytics-first, CWS
// redirect second. Free-text feedback with no rating never redirects there; only this gesture does.
function rateAndOpenCws(value, source) {
  addBreadcrumb(`button_click: rate_extension (${value} stars, ${source})`);
  if (window.posthog) posthog.capture('button_click', { button: 'rate_extension', rating: value, source });
  window.open(CWS_REVIEW_URL, '_blank', 'noopener');
}

const state = {
  decks: {
    A: { tabId: null, connected: false, high: 0, mid: 0, low: 0, fx: 0, fxType: 'filter', filterValue: 0, delayValue: 0, gain: 1, playing: null, rate: 1, detectedBpm: null, beatCount: 0, recentOnsets: [], cued: false, hasPlayedOnce: false },
    B: { tabId: null, connected: false, high: EQ_MIN, mid: EQ_MIN, low: EQ_MIN, fx: 0, fxType: 'filter', filterValue: 0, delayValue: 0, gain: 1, playing: null, rate: 1, detectedBpm: null, beatCount: 0, recentOnsets: [], cued: false, hasPlayedOnce: false },
  },
  cross: 0.5, // 0 = full A, 1 = full B
  // null = disengaged. 0 = A native/B matches A. 1 = mirrored. 0.5 = both bend to shared midpoint.
  // See applyTempoBlend().
  tempoBlend: null,
  // Manual beat-grid offset in eighths of the lead deck's beat. syncPhase normally chases zero
  // error (follow's beat lands exactly on lead's); this shifts that target so the grids are
  // deliberately offset (e.g. if detection locked onto a hi-hat). Wraps 0..7. Resets with
  // resetPhaseIntegral (same 3 call sites).
  phaseOffsetEighths: 0,
};

const statusEl = document.getElementById('status');
const mixerEl = document.getElementById('mixer');
// Any click in the panel focuses #mixer so keyboard shortcuts work without requiring a click
// inside the mixer box specifically. Excludes real form controls — clicking an input would
// otherwise immediately re-focus #mixer, swallowing keystrokes as mixer hotkeys.
document.addEventListener('click', (e) => {
  if (e.target.closest('input, textarea, select')) return;
  mixerEl.focus({ preventScroll: true });
});

// #status is the error/problem channel — every message not keyed as NON_ERROR_STATUS_KEYS means
// something broke. `key` (optional) is the STRINGS key msg was rendered from, so this still works
// even if a remote reword changes the literal text. Captured as ui_error (plain event, not
// captureException — these are handled messages, not real JS exceptions with a stack trace).
// refreshTabs() re-asserts the same status every 2s poll tick while its condition holds (e.g. no
// YouTube tabs open) — dedupe against the last CAPTURED message so that holds as one ui_error on
// the transition, not one per poll (a panel left open for a few hours turned this into thousands
// of near-identical events, 2026-08-09).
let lastCapturedStatus = null;
function setStatus(msg, key) {
  statusEl.textContent = msg;
  if (msg && msg !== lastCapturedStatus && !(key && NON_ERROR_STATUS_KEYS.has(key)) && window.posthog) {
    posthog.capture('ui_error', { message: msg, breadcrumbs: breadcrumbs.slice() });
    addBreadcrumb(`error: ${msg}`); // so a second error 1s later shows the first one led into it
  }
  // Only a real message updates the dedupe memory — clearing the status (msg === '', e.g. tabs
  // briefly reappearing between polls) must not wipe it, or a condition that flickers keeps
  // re-triggering the same "already captured" message as if it were new (2026-08-09: this exact
  // flicker between refreshTabs ticks turned "No YouTube tabs open yet" into ~5000 events/day).
  if (msg) lastCapturedStatus = msg;
}

// Cleans raw Chrome error messages before surfacing to the user: replaces "No tab with id: N"
// (bare numeric id meaningless to users) and strips trailing periods (status templates add their
// own endings, so a raw "." doubled up once appended).
function cleanErrorReason(msg) {
  return String(msg || '')
    .replace(/no tab with id:?\s*\d+/i, 'tab not found')
    .replace(/\.+$/, '');
}

// ---- trial usage + license ----

let usageMs = 0;
let licensed = false;
let usageLoaded = false; // guards against a fast open/close flushing a stale usageMs=0 over storage before the async load below resolves
let lastUsageTickAt = null;
let usageFlushTimer = null;
let trialLimitEventSent = false; // one-shot: fire once at limit crossing, not every tick

const trialBannerEl = document.getElementById('trialBanner');
const trialBuyLinkEl = document.getElementById('trialBuyLink');
const licenseKeyInputEl = document.getElementById('licenseKeyInput');
const licenseActivateBtnEl = document.getElementById('licenseActivateBtn');
const licenseStatusEl = document.getElementById('licenseStatus');

trialBuyLinkEl.href = GUMROAD_PRODUCT_URL;

const coffeeLinkEl = document.getElementById('coffeeLink');
coffeeLinkEl.href = GUMROAD_COFFEE_URL;
coffeeLinkEl.addEventListener('click', () => {
  addBreadcrumb('button_click: buy_coffee');
  if (window.posthog) posthog.capture('button_click', { button: 'buy_coffee' });
});

// Guarded (unlike coffeeLinkEl above) — new element, added same day as several HTML/JS edits;
// a stale already-open side panel that picked up new JS against old HTML (chrome.runtime.reload()
// doesn't always re-navigate an already-open panel) would otherwise throw here and silently kill
// every initializer after this line (same bug class noted in ARCHITECTURE.md's bug-class list).
const rateLinkEl = document.getElementById('rateLink');
if (rateLinkEl) {
  rateLinkEl.querySelectorAll('.rateStar').forEach((star) => {
    star.addEventListener('click', () => {
      rateAndOpenCws(Number(star.dataset.value), 'footer');
      rateLinkEl.hidden = true; // already rated once — no need to keep nagging
    });
  });
}

// Banner suppressed (deferred feature) — usage/license tracking still runs, only the nag is hidden.
// To re-enable: trialBannerEl.hidden = licensed || usageMs < TRIAL_LIMIT_MS;
function updateTrialBanner() {
  trialBannerEl.hidden = true;
}

function scheduleUsageFlush() {
  if (!usageLoaded || usageFlushTimer) return;
  usageFlushTimer = setTimeout(() => {
    usageFlushTimer = null;
    chrome.storage.local.set({ usageMs });
  }, 10000);
}

function tickTrialUsage() {
  const now = Date.now();
  const elapsed = lastUsageTickAt ? now - lastUsageTickAt : 0;
  lastUsageTickAt = now;
  if (!usageLoaded || licensed) return;
  const active = state.decks.A.playing || state.decks.B.playing;
  if (!active) return;
  usageMs += elapsed;
  scheduleUsageFlush();
  updateTrialBanner();
  if (!trialLimitEventSent && usageMs >= TRIAL_LIMIT_MS) {
    trialLimitEventSent = true;
    chrome.storage.local.set({ trialLimitEventSent: true });
    addBreadcrumb('trial_limit_reached');
    if (window.posthog) posthog.capture('trial_limit_reached');
  }
}
setInterval(tickTrialUsage, 1000);

window.addEventListener('pagehide', () => {
  if (usageLoaded) chrome.storage.local.set({ usageMs });
});

chrome.storage.local.get(['usageMs', 'license', 'trialLimitEventSent'], (data) => {
  usageMs = data.usageMs || 0;
  licensed = !!(data.license && data.license.valid);
  trialLimitEventSent = !!data.trialLimitEventSent;
  usageLoaded = true;
  updateTrialBanner();
});

licenseActivateBtnEl.addEventListener('click', async () => {
  const key = licenseKeyInputEl.value.trim();
  if (!key) return;
  licenseActivateBtnEl.disabled = true;
  licenseStatusEl.textContent = chrome.i18n.getMessage('licenseChecking') || 'Checking…';
  const result = await chrome.runtime.sendMessage({ type: 'verifyLicense', licenseKey: key });
  licenseActivateBtnEl.disabled = false;
  if (result && result.success) {
    licensed = true;
    licenseStatusEl.textContent = chrome.i18n.getMessage('licenseActivated') || 'Licensed — thanks!';
    updateTrialBanner();
    addBreadcrumb('license_activated');
    if (window.posthog) posthog.capture('license_activated');
  } else {
    addBreadcrumb(`license_activate_failed: ${(result && result.message) || 'invalid'}`);
    licenseStatusEl.textContent = (result && result.message) || chrome.i18n.getMessage('licenseInvalid') || 'Invalid license key.';
  }
});

async function listYoutubeTabs() {
  const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*' });
  return tabs;
}

function getVideoId(url) {
  try {
    return new URL(url).searchParams.get('v');
  } catch {
    return null;
  }
}

// The placeholder backdrop for "no tab picked" lives on .deckThumbClip (background, see
// styles.css), not on this <img> — so the img itself can be fully hidden while empty without
// collapsing the box the ▾ picker arrow rests on. Hidden, not just faded: opacity alone still let
// a stray browser broken-image glyph render through from a request that errored right as the tab
// closed (2026-08-13, direct report — glyph persisting after closing the deck's tab).
function setDeckThumb(deckKey, videoId) {
  const img = document.getElementById(`deckThumb${deckKey}`);
  // Use removeAttribute, NOT src='': img.src='' resolves against the page's own URL, fails to
  // load, and renders the browser's broken-image icon. removeAttribute falls back to .deckThumb's
  // background-color with no network request.
  if (videoId) {
    img.hidden = false;
    img.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  } else {
    img.removeAttribute('src');
    img.hidden = true;
  }
}

// Self-heals ANY failed thumbnail load back to the plain placeholder (2026-08-07, direct report
// — broken-image glyph persisting through a disconnect), not just the specific src='' case
// setDeckThumb already avoids above. A real request CAN still fail on its own — ytimg 404s for
// a given video, or the request getting cut off mid-flight by the tab closing right as it was
// loading — neither of those is the src='' bug, so removeAttribute at the call site can't
// prevent them; catching it here at the element covers every cause instead of chasing each one.
// Also hides the element (2026-08-13) — clearing src alone still lets the browser paint the
// broken-image glyph for the frame between the error firing and the next legitimate load.
for (const deck of ['A', 'B']) {
  document.getElementById(`deckThumb${deck}`).addEventListener('error', function () {
    this.removeAttribute('src');
    this.hidden = true;
  });
}

// Click anywhere on the cover (thumbnail + title, one hit area — 2026-08-07, direct report that
// two separately-clickable pieces looked sloppy) to focus that deck's tab. The ▾ picker and its
// dropdown live inside this same cover, so both stop propagation below to keep their own clicks
// from also triggering a focus jump.
for (const deck of ['A', 'B']) {
  document.getElementById(`deckCover${deck}`).addEventListener('click', () => {
    const tabId = state.decks[deck].tabId;
    if (!tabId) {
      addBreadcrumb(`empty_deck_click_open_youtube: ${deck}`);
      chrome.tabs.create({ url: 'https://www.youtube.com' });
      return;
    }
    addBreadcrumb(`thumb_click_focus_tab: ${deck}`);
    chrome.tabs.update(tabId, { active: true });
  });
  document.getElementById(`tabMenu${deck}`).addEventListener('click', (e) => e.stopPropagation());
}

function pickTab(deck, tab) {
  state.decks[deck].tabId = tab.id;
  state.decks[deck].staticTitle = tab.title || tab.url;
  state.decks[deck].videoId = getVideoId(tab.url);
  document.getElementById(`title${deck}`).textContent = state.decks[deck].staticTitle;
  setDeckThumb(deck, state.decks[deck].videoId);
  closeTabMenu(deck);
  refreshTitleWhenResolved(deck, tab.id, tab.url);
  // Picking a new tab invalidates this deck's graph — its sibling stays untouched.
  state.decks[deck].connected = false;
  updateDeckConnectedVisual(deck);
  updateConnectEnabled(); // this deck just went unconnected — re-derive from the sibling's state
  // levelSmoothedDb is keyed by deck letter, not tabId — without this reset the meter keeps
  // decaying from the PREVIOUS occupant's loudness for up to ~2.4s (DECAY_DB_PER_SEC) after a
  // new track lands here, reading as "still playing" while the new track is actually silent
  // (2026-08-07, direct report).
  levelSmoothedDb[deck] = -60;
  setLevelMeterLit(deck, 0);
}

// A tab picked right after opening hasn't resolved its real <title> yet — Chrome reports the
// raw URL as tab.title in that window, which we'd otherwise show forever since nothing else
// re-checks it (2026-08-07, direct report — title showing "youtube.com/watch?v=..." instead of
// the video/chapter name). One short recheck covers it without polling indefinitely.
function refreshTitleWhenResolved(deck, tabId, url) {
  setTimeout(async () => {
    if (state.decks[deck].tabId !== tabId) return; // deck moved on since — stale check
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (tab && tab.title && tab.title !== url && tab.title !== state.decks[deck].staticTitle) {
      state.decks[deck].staticTitle = tab.title;
      document.getElementById(`title${deck}`).textContent = tab.title;
    }
  }, 800);
}

function closeTabMenu(deck) {
  document.getElementById(`tabMenu${deck}`).hidden = true;
}
function closeAllTabMenus() {
  closeTabMenu('A');
  closeTabMenu('B');
}

async function openTabMenu(deck) {
  closeTabMenu(deck === 'A' ? 'B' : 'A');
  const tabs = await listYoutubeTabs();
  const otherTabId = state.decks[deck === 'A' ? 'B' : 'A'].tabId;
  const available = tabs.filter((t) => t.id !== otherTabId && t.id !== state.decks[deck].tabId);
  const menu = document.getElementById(`tabMenu${deck}`);
  menu.innerHTML = '';
  if (available.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'tabMenuEmpty';
    empty.textContent = tabs.length === 0 ? t('menu.noTabsOpen') : t('menu.noOtherTabs');
    menu.appendChild(empty);
  } else {
    available.forEach((t) => {
      const item = document.createElement('button');
      item.className = 'tabMenuItem ph-no-capture'; // track title — excluded from PostHog autocapture
      item.textContent = (t.audible ? '\u{1F50A} ' : '') + (t.title || t.url).slice(0, 40);
      // Focus is manual-pick only — not inside pickTab() itself, which also runs on the
      // automatic on-load default pairing (refreshTabs), where stealing focus would be wrong.
      item.addEventListener('click', () => {
        pickTab(deck, t);
        chrome.tabs.update(t.id, { active: true });
      });
      menu.appendChild(item);
    });
  }
  // "Swap Decks" — trades the two decks' full state (track + EQ/gain, encoders move with the
  // track); the header ⇄ button used to own this, now owns the deck-bound send instead (see
  // connectBtn's click handler). Only shown when there's actually a track here to swap.
  if (state.decks[deck].tabId) {
    const otherDeck = deck === 'A' ? 'B' : 'A';
    const sendItem = document.createElement('button');
    sendItem.className = 'tabMenuItem tabMenuItem--send';
    // Deck A always sits left, B always sits right — arrow points the same direction as the
    // move, and stays pinned to that edge with the label on the opposite side (2026-08-07).
    const arrowRight = otherDeck === 'B';
    const label = document.createElement('span');
    label.textContent = 'Swap Decks';
    const arrow = document.createElement('span');
    arrow.textContent = arrowRight ? '→' : '←';
    sendItem.append(...(arrowRight ? [label, arrow] : [arrow, label]));
    sendItem.addEventListener('click', () => {
      closeTabMenu(deck);
      swapDecks();
    });
    menu.appendChild(sendItem);
  }
  menu.hidden = false;
}

for (const deck of ['A', 'B']) {
  document.getElementById(`tabPick${deck}`).addEventListener('click', (e) => {
    e.stopPropagation(); // don't let the document-level listener below close it immediately
    const menu = document.getElementById(`tabMenu${deck}`);
    if (menu.hidden) openTabMenu(deck); else closeTabMenu(deck);
  });
}
document.addEventListener('click', closeAllTabMenus); // click anywhere else closes an open menu

// Auto-pick a starting pair on load (prefer audible tab for A), only when nothing's been picked yet.
// Polls for eligible YouTube tabs on an interval (not chrome.tabs.onUpdated — SPA nav doesn't
// fire it reliably). Auto-fills empty deck slots A before B; never steals browser focus.
async function refreshTabs() {
  const tabs = await listYoutubeTabs();
  // Catches a picked-but-not-yet-connected deck whose tab got closed (2026-08-07, direct report
  // — stale cover art stuck showing forever). pollOneDeckStatus only watches CONNECTED decks (its
  // own connected guard exists to stop it tearing down a fresh pick before Connect can run) — an
  // unconnected pick had nothing else watching whether its tab still exists. Piggybacks on the
  // tab list this function already fetches every 2s rather than a separate check.
  const openTabIds = new Set(tabs.map((t) => t.id));
  for (const deck of ['A', 'B']) {
    if (state.decks[deck].tabId && !state.decks[deck].connected && !openTabIds.has(state.decks[deck].tabId)) {
      disconnectDeck(deck, 'tab closed');
    }
  }
  const eligible = tabs
    .filter((t) => getVideoId(t.url) && t.id !== state.decks.A.tabId && t.id !== state.decks.B.tabId)
    .sort((a, b) => (b.audible ? 1 : 0) - (a.audible ? 1 : 0));
  const picked = [];
  if (!state.decks.A.tabId && eligible.length) { pickTab('A', eligible.shift()); picked.push('A'); }
  if (!state.decks.B.tabId && eligible.length) { pickTab('B', eligible.shift()); picked.push('B'); }
  // No manual power-on step anymore — whatever just got picked (cold-start pair or completing an
  // already-live one) connects itself; see attemptAutoConnect().
  await attemptAutoConnect();
}
setInterval(refreshTabs, 2000);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function crossGain(side) {
  const p = state.cross;
  return side === 'A' ? Math.cos((p * Math.PI) / 2) : Math.sin((p * Math.PI) / 2);
}

// Declared here so updateDeckConnectedVisual can call it regardless of definition order;
// reassigned to renderFallbackOptions further down once the cue-device picker sets itself up.
let refreshCueDeviceOptions = () => {};

// Skip requires hasPlayedOnce (latches on first play, not reset on pause), not just `playing`.
function updateSkipBtnEnabled(deck) {
  const enabled = state.decks[deck].connected && state.decks[deck].hasPlayedOnce;
  document.getElementById(`skipPrev${deck}`).disabled = !enabled;
  document.getElementById(`skipNext${deck}`).disabled = !enabled;
}

// Disables Play while not connected — a picked-but-unconnected tab has no audio graph yet.
function updatePlayBtnEnabled(deck) {
  document.getElementById(`playBtn${deck}`).disabled = !state.decks[deck].connected;
}

function updateDeckConnectedVisual(deck) {
  const deckBox = document.getElementById(`deckBox${deck}`);
  deckBox.classList.toggle('disconnected', !state.decks[deck].connected);
  // .empty = no track picked at all; distinct from .disconnected (picked but not yet live).
  deckBox.classList.toggle('empty', !state.decks[deck].tabId);
  updatePlayBtnEnabled(deck);
  // Also owned by updateReadouts() (the live poll path) — duplicated here because disconnectDeck()
  // calls this function but not that one, and used to leave a stale isPlaying glow on a Play button
  // that had gone right back to disabled (2026-08-10, direct report — two placeholder decks, one
  // still glowing from before it disconnected).
  document.getElementById(`playBtn${deck}`).classList.toggle('isPlaying', state.decks[deck].playing === true);
  // Empty-slot hint: shown on THIS deck whenever it has no track picked, independent of the
  // sibling's state (2026-08-07, direct report — cold start, neither deck connected yet, showed
  // no guidance at all since this used to require the OTHER deck to already be live and playing).
  const hint = document.getElementById(`deckEmptyHint${deck}`);
  if (hint) hint.hidden = !!state.decks[deck].tabId;
  updateCueBtnEnabled(deck);
  updateSkipBtnEnabled(deck);
  refreshCueDeviceOptions();
}

// Angle/arc geometry lives in deck-render.js now (shared verbatim with the landing site).
function dbToAngle(v) {
  return DeckRender.tieredAngle(v, EQ_MIN, EQ_MAX);
}
function gainToAngle(g) {
  return DeckRender.tieredAngle(g - 1, GAIN_MIN - 1, GAIN_MAX - 1);
}
function fxToAngle(v, deck) {
  // Shifted by the active type's own reset/neutral value — same trick as gainToAngle above.
  // tieredAngle always puts its own zero at 12 o'clock; both types currently reset to their own
  // min (0), so this is a no-op today, but keeps the knob correctly centered if a future type's
  // neutral point ever isn't its minimum (a real bug here once, when Delay's reset was 0.5).
  const r = fxRange(deck);
  return DeckRender.tieredAngle(v - r.reset, r.min - r.reset, r.max - r.reset);
}

function updateReadouts() {
  for (const deck of ['A', 'B']) {
    for (const band of ['high', 'mid', 'low']) {
      const v = state.decks[deck][band];
      const angle = dbToAngle(v);
      const knob = document.getElementById(`knob${deck}_${band}`);
      knob.querySelector('.knobPointer').style.transform = `translateX(-50%) rotate(${angle}deg)`;
      DeckRender.setKnobArc(knob, angle, dbToAngle(0));
      knob.title = `${band.toUpperCase()}: ${v.toFixed(1)} dB`;
      document.getElementById(`led${deck}_${band}`).classList.toggle('lit', Math.abs(v) > 0.5);
    }
    const g = state.decks[deck].gain;
    const gainAngle = gainToAngle(g);
    const gainKnob = document.getElementById(`knob${deck}_gain`);
    gainKnob.querySelector('.knobPointer').style.transform = `translateX(-50%) rotate(${gainAngle}deg)`;
    DeckRender.setKnobArc(gainKnob, gainAngle, gainToAngle(1));
    gainKnob.title = `GAIN: ${g.toFixed(2)}`;
    document.getElementById(`led${deck}_gain`).classList.toggle('lit', Math.abs(g - 1) > 0.05);
    const fxV = state.decks[deck].fx;
    const fxT = state.decks[deck].fxType;
    const range = fxRange(deck);
    const fxAngle = fxToAngle(fxV, deck);
    const fxKnob = document.getElementById(`knob${deck}_fx`);
    fxKnob.querySelector('.knobPointer').style.transform = `translateX(-50%) rotate(${fxAngle}deg)`;
    DeckRender.setKnobArc(fxKnob, fxAngle, fxToAngle(range.reset, deck));
    const fxTypeLabel = document.getElementById(`fxTypeLabel${deck}`);
    if (fxTypeLabel) fxTypeLabel.textContent = range.label;
    if (fxT === 'delay') {
      fxKnob.title = `DELAY: ${Math.round(fxV * 100)}% density`;
    } else {
      fxKnob.title = fxV === 0 ? 'FILTER: bypass' : `FILTER: ${fxV < 0 ? 'lowpass' : 'highpass'} ${Math.abs(fxV * 100).toFixed(0)}%`;
    }
    document.getElementById(`playBtn${deck}`).classList.toggle('isPlaying', state.decks[deck].playing === true);
  }
  const pct = Math.round(state.cross * 100);
  document.getElementById('crossThumb').style.left = `${pct}%`;
}

async function sendParam(deckKey, param, value) {
  const tabId = state.decks[deckKey].tabId;
  // tabId = "picked", not "live" — guard both to avoid reaching a tab with no graph.
  if (!tabId || !state.decks[deckKey].connected) return;
  // Last-resort guard: executeScript args must be JSON-serializable; NaN/Infinity throws a
  // cryptic native error instead of failing gracefully.
  if (typeof value === 'number' && !Number.isFinite(value)) {
    setStatus(t('status.nonFiniteValue', { deck: deckKey, param, value }));
    return;
  }
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: counterDJSetParam,
      args: [param, value],
    });
    // executeScript resolving doesn't mean the injected function succeeded — check result.ok.
    const result = res && res[0] && res[0].result;
    if (!result || !result.ok) {
      setStatus(t('status.paramError', { deck: deckKey, param, reason: result ? result.error : t('status.noResult') }));
    }
  } catch (e) {
    // "No tab with id" means the tab closed since the last poll — auto-disconnect to stop
    // re-triggering on every subsequent send, same as pollOneDeckStatus's own catch.
    if (/no tab with id/i.test(e.message || '')) {
      disconnectDeck(deckKey, 'tab closed');
    } else {
      setStatus(t('status.deckError', { deck: deckKey, reason: cleanErrorReason(e.message) }));
    }
  }
}

// Switches a deck's active FX type. Returns success so cycleFxType can roll the UI back on
// failure instead of showing a switch that never actually happened tab-side.
// filterValue/delayValue are optional — pass them to force-resync both nodes (fresh connect,
// track swap); omit them for a plain type-switch, since both stay live and already hold
// whatever was last set.
async function sendFxType(deckKey, type, filterValue, delayValue) {
  const tabId = state.decks[deckKey].tabId;
  if (!tabId || !state.decks[deckKey].connected) return false;
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: counterDJSetFxType,
      args: [type, filterValue ?? null, delayValue ?? null],
    });
    const result = res && res[0] && res[0].result;
    if (!result || !result.ok) {
      setStatus(t('status.paramError', { deck: deckKey, param: 'fxType', reason: result ? result.error : t('status.noResult') }));
      return false;
    }
    return true;
  } catch (e) {
    if (/no tab with id/i.test(e.message || '')) {
      disconnectDeck(deckKey, 'tab closed');
    } else {
      setStatus(t('status.deckError', { deck: deckKey, reason: cleanErrorReason(e.message) }));
    }
    return false;
  }
}

async function sendCue(deckKey, deviceId, active) {
  const tabId = state.decks[deckKey].tabId;
  if (!tabId) return;
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: counterDJSetCue,
      args: [deviceId, active],
    });
    const result = res && res[0] && res[0].result;
    if (!result || !result.ok) {
      setStatus(t('status.deckCue', { deck: deckKey, reason: result ? result.error : t('status.noResult') }));
      return false;
    }
    return true;
  } catch (e) {
    setStatus(t('status.deckCueError', { deck: deckKey, reason: cleanErrorReason(e.message) }));
    return false;
  }
}

async function sendSkip(deckKey, direction) {
  const tabId = state.decks[deckKey].tabId;
  if (!tabId) return;
  chrome.tabs.update(tabId, { active: true });
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: counterDJSkip,
      args: [direction],
    });
    const result = res && res[0] && res[0].result;
    if (!result || !result.ok) {
      setStatus(t('status.deckSkip', { deck: deckKey, reason: result ? result.error : t('status.noResult') }));
    }
  } catch (e) {
    setStatus(t('status.deckSkipError', { deck: deckKey, reason: cleanErrorReason(e.message) }));
  }
}

async function checkMicPermission(tabId) {
  try {
    const res = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: counterDJMicPermissionState });
    return (res && res[0] && res[0].result) || 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

async function sendUnlockMic(tabId) {
  try {
    const res = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: counterDJUnlockMic });
    return (res && res[0] && res[0].result) || { ok: false, error: 'no result' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function fetchOutputs(tabId) {
  try {
    const res = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: counterDJEnumerateOutputs });
    return (res && res[0] && res[0].result) || { ok: false, error: 'no result' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function applyCrossfader() {
  // Solo deck: force full gain — the equal-power curve would otherwise attenuate ~3dB at center.
  const bothConnected = state.decks.A.connected && state.decks.B.connected;
  sendParam('A', 'cross', bothConnected ? crossGain('A') : (state.decks.A.connected ? 1 : 0));
  sendParam('B', 'cross', bothConnected ? crossGain('B') : (state.decks.B.connected ? 1 : 0));
}

async function sendTransport(deckKey, action) {
  const tabId = state.decks[deckKey].tabId;
  if (!tabId || !state.decks[deckKey].connected) return;
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: counterDJTransport,
      args: [action],
    });
    const result = res && res[0] && res[0].result;
    if (!result || !result.ok) {
      setStatus(t('status.deckTransport', { deck: deckKey, reason: result ? result.error : t('status.transportFailed') }));
      return;
    }
    // ctxState is only present on the 'restart' result (pause doesn't touch the AudioContext);
    // undefined there just means "not applicable", not "not running" — don't gate on it.
    state.decks[deckKey].playing = result.playing && result.ctxState !== 'suspended';
    updateReadouts();
  } catch (e) {
    setStatus(t('status.deckError', { deck: deckKey, reason: cleanErrorReason(e.message) }));
  }
}

async function sendSeekBy(deckKey, deltaSeconds) {
  const tabId = state.decks[deckKey].tabId;
  if (!tabId) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: counterDJSeekBy,
      args: [deltaSeconds],
    });
  } catch (e) {
    setStatus(t('status.deckError', { deck: deckKey, reason: cleanErrorReason(e.message) }));
  }
}

const connectBtn = document.getElementById('connect');

// #connect has no power-on state — it's purely the send-to-other-deck control, enabled as soon
// as EITHER deck has a track (sending into an empty slot is a valid move, not just trading two
// live decks).
// Always recomputed from current state rather than hand-toggled, so no call site can leave it
// stale after a pick/connect/disconnect changes which deck is occupied.
function updateConnectEnabled() {
  connectBtn.disabled = !(state.decks.A.connected || state.decks.B.connected);
}

// Injects the audio graph for each deck in `keys` and marks it live. Shared by the header
// Connect button and refreshTabs()'s own auto-connect path below (2026-08-07, direct report —
// auto-picking a tab into an empty slot left Play sitting disabled, since picking alone was
// never enough; only this injection step actually makes a deck playable). Returns false (and
// sets a status message) on injection failure, true on success.
async function connectDecks(keys) {
  for (const key of keys) {
    const tabInfo = await chrome.tabs.get(state.decks[key].tabId);
    // staticTitle = video title fallback when no chapter marker is at the current position.
    state.decks[key].staticTitle = tabInfo.title || tabInfo.url;
    state.decks[key].videoId = getVideoId(tabInfo.url);
    document.getElementById(`title${key}`).textContent = state.decks[key].staticTitle;
    refreshTitleWhenResolved(key, state.decks[key].tabId, tabInfo.url);
    setDeckThumb(key, state.decks[key].videoId);

    // Guest deck (joining while sibling is already playing) starts EQ-cut; anchor stays at its
    // current levels. Determined by which one's ALREADY playing, not by letter (A/B).
    const otherKey = key === 'A' ? 'B' : 'A';
    const otherAlreadyPlaying = state.decks[otherKey].connected && state.decks[otherKey].playing;
    state.decks[key].high = state.decks[key].mid = state.decks[key].low = otherAlreadyPlaying ? EQ_MIN : 0;
    state.decks[key].fx = 0;
    state.decks[key].fxType = 'filter';
    state.decks[key].filterValue = 0;
    state.decks[key].delayValue = 0;
    state.decks[key].gain = 1;
    state.decks[key].rate = 1;
    resetPhaseIntegral(key);
    state.phaseOffsetEighths = 0;
    state.decks[key].detectedBpm = null;
    state.decks[key].beatCount = 0;
    state.decks[key].recentOnsets = [];

    const res = await chrome.scripting.executeScript({
      target: { tabId: state.decks[key].tabId },
      world: 'MAIN',
      func: counterDJSetup,
      // Pass initial values in — without this the graph starts at unity gain, and the
      // sendParam calls below are separate async round trips (audible spike before they land).
      args: [{
        low: state.decks[key].low,
        mid: state.decks[key].mid,
        high: state.decks[key].high,
        gain: state.decks[key].gain,
        rate: state.decks[key].rate,
        fx: state.decks[key].fx,
        fxType: state.decks[key].fxType,
        filterValue: state.decks[key].filterValue,
        delayValue: state.decks[key].delayValue,
        // Guest deck always lands cued regardless of its own tab's playback state — a freshly
        // opened YouTube tab autoplays by default, same outward signal as a genuinely mid-set
        // track, so video.paused alone can't tell "anchor already running a set" apart from
        // "guest tab that just happens to autoplay" (2026-08-10, direct report — deck B showed
        // playing on cold-start connect once the cue-decision moved to raw video.paused).
        forceCue: otherAlreadyPlaying,
      }],
    });
    const result = res && res[0] && res[0].result;
    if (!result || !result.ok) {
      // result.exception means counterDJSetup's own try/catch reports a real browser error
      // message — worth Error Tracking (with a synthetic Error, since exceptions thrown inside
      // the injected MAIN-world function never carry a real stack back across the boundary).
      // A falsy `result` (executeScript itself failed to deliver one) has no message to report.
      if (result && result.exception && window.posthog) {
        posthog.captureException(new Error(`connectDecks injection: ${result.error}`), { breadcrumbs: breadcrumbs.slice() });
      }
      setStatus(t('status.deckInjection', { deck: key, reason: result ? result.error : t('status.injectionFailed') }));
      return false;
    }
    // The real blocker on a never-focused tab isn't video.muted — audio is rerouted through our
    // own AudioContext (createMediaElementSource), and a fresh AudioContext starts 'suspended'
    // until Chrome sees genuine user activation on that page's frame. This auto-connect call is
    // timer/detection-triggered, not a live click, so it carries none — ctx stays suspended and
    // silent even though video.paused reads false (2026-08-07, direct report — a knob-drag,
    // which DOES carry a real click into executeScript, was the only thing that ever unstuck it).
    state.decks[key].playing = result.playing && !result.muted && result.ctxState === 'running';
    state.decks[key].hasPlayedOnce = state.decks[key].playing;
    state.decks[key].connected = true;
    // A stale SPA-persisted tab from before the FX-type feature landed reconnects with its old
    // direct filter-only graph (see counterDJSetup's reconnect branch) — Filter still works on it,
    // but Delay silently wouldn't, so don't let the UI offer/keep a type the tab can't run.
    if (!result.hasFxTypes) state.decks[key].fxType = 'filter';
    addBreadcrumb(`track_loaded: ${key} (connect)`);
    if (window.posthog) posthog.capture('track_loaded', { deck: key, via: 'connect' });
    updateDeckConnectedVisual(key);
    await sendParam(key, 'gain', state.decks[key].gain);
    await sendParam(key, 'rate', state.decks[key].rate);
    await sendParam(key, 'low', state.decks[key].low);
    await sendParam(key, 'mid', state.decks[key].mid);
    await sendParam(key, 'high', state.decks[key].high);
    await sendFxType(key, state.decks[key].fxType, state.decks[key].filterValue, state.decks[key].delayValue);
  }
  state.cross = 0.5;
  applyCrossfader();
  updateReadouts();
  // Full redraw of both decks: after a reconnect, the reconnected deck's visuals can get stuck
  // (state correct, paint drifted) — a full redraw costs nothing and is always safe.
  updateDeckConnectedVisual('A');
  updateDeckConnectedVisual('B');
  if (state.decks.A.connected && state.decks.B.connected) {
    state.tempoBlend = null; // fresh pairing — disengaged until the bar is touched
    // Reset octave too: bestOctaveFactor's hysteresis must not bias toward the previous pairing's choice.
    state.tempoOctave = null;
    updateTempoStatus();
    // Both decks paired = the actual mixing session begins. Used to be implicit in the manual
    // Connect click (button_click/button=connect); that click no longer exists now that decks
    // connect themselves, so this was the one place left that reliably means "a real pairing
    // just happened," not just "one more track loaded."
    if (window.posthog) posthog.capture('mixing_started');
  }
  updateConnectEnabled();
  startChapterPolling();
  return true;
}

// Connects whichever decks have a tab picked but aren't live yet — the one path that used to
// require a manual Connect click. Called after every pick (auto-detected in refreshTabs(), or
// manual from a deck's ▾ menu) so a deck starts playing the moment it has a tab, no click needed.
async function attemptAutoConnect() {
  const toConnect = ['A', 'B'].filter((k) => state.decks[k].tabId && !state.decks[k].connected);
  if (!toConnect.length) {
    setStatus('');
    return;
  }
  try {
    setStatus(t('status.connecting'), 'status.connecting');
    addBreadcrumb(`connect_attempt: ${toConnect.join(',')}`);
    const ok = await connectDecks(toConnect);
    if (ok) setStatus('');
  } catch (e) {
    setStatus(t('status.connectFailed', { reason: cleanErrorReason(e.message) }));
  }
}

// #connect is disabled (see setConnected) until both decks are live — by the time a click can
// land, the only thing left for it to do is send the track across (encoders stay put; the
// full-state swap now lives in each deck's ▾ dropdown, see openTabMenu).
connectBtn.addEventListener('click', () => {
  addBreadcrumb('button_click: send_to_other_deck');
  if (window.posthog) posthog.capture('button_click', { button: 'send_to_other_deck' });
  sendTrackToOtherDeck();
  mixerEl.focus({ preventScroll: true });
});

// Chapter/BPM/play-state poll — 1s (was 3s). This is the ONLY place that reads detectedBpm
// back from the in-page detector into state; updatePhaseDrift's 100ms loop only reads the cached
// value. The 3s delay was adding a real multi-second tax on every BPM lock-in.
let statusPollTimer = null;

function startChapterPolling() {
  clearInterval(statusPollTimer);
  statusPollTimer = setInterval(pollDeckStatus, 1000);
  pollDeckStatus();
  startBackgroundSync();
  startLevelsPoll();
  startPhaseDriftLoop();
  startPerfMonitor();
}

// Temporary CPU diagnostic — logs to the side panel's own console (right-click → Inspect).
// Remove once the buffer-size question is settled.
let perfMonitorTimer = null;
function startPerfMonitor() {
  clearInterval(perfMonitorTimer);
  perfMonitorTimer = setInterval(async () => {
    for (const deck of ['A', 'B']) {
      const tabId = state.decks[deck].tabId;
      if (!tabId) continue;
      try {
        const res = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: counterDJPerfStats });
        const stats = res && res[0] && res[0].result;
        if (stats) {
          console.log(`[counterDJ] perf deck ${deck}: buffer=${stats.bufferSize} budget=${stats.blockPeriodMs.toFixed(2)}ms avg=${stats.avgMs.toFixed(3)}ms max=${stats.maxMs.toFixed(3)}ms cpu=${stats.cpuPct.toFixed(1)}% (n=${stats.count})`);
        }
      } catch { /* deck not ready yet — skip this tick */ }
    }
  }, 5000);
}


// 1s background sync loop. The old seek-based design needed a long interval to avoid glitches;
// applyPhaseTrim is a continuous inaudible rate trim, so shortening alone wouldn't have fixed
// drift — the real fix was replacing the one-shot "bend for a fixed duration" with a continuous
// proportional trim recomputed every tick from the current error (see applyPhaseTrim).
let syncPhaseTimer = null;
function startBackgroundSync() {
  clearInterval(syncPhaseTimer);
  syncPhaseTimer = setInterval(syncPhase, 1000);
}

// -45..+3dB -> 0..100% (2026-08-07, direct report — even audible playback showed no meter
// movement at all: real program material sits well below the old -30dB floor during normal,
// non-peak passages, so most actual listening levels never crossed even the FIRST of the 9
// segments — floor(pct/100*9) needs ~11% just to light one). Widened further than the previous
// -60..0 -> -30..+4 pass; still clamped, so genuine silence stays fully dark.
function levelDbToPercent(levelDb) {
  return clamp(((levelDb ?? -45) + 45) / 48, 0, 1) * 100;
}

// IEC 60268-10 peak-meter ballistics: instant attack, slow decay (DECAY_DB_PER_SEC=20 → ~1.7s
// full-scale decay, in line with EBU/BBC PPM meters).
const DECAY_DB_PER_SEC = 20;
const levelSmoothedDb = { A: -60, B: -60 };
let lastLevelsPollAt = null;

// Matches the 9 .levelCell divs generated at the bottom of this file.
const LEVEL_METER_SEGMENTS = 9;

function setLevelMeterLit(deck, litSegments) {
  const cells = document.querySelectorAll(`#levelTrack${deck} .levelCell`);
  cells.forEach((cell, i) => {
    const fromBottom = LEVEL_METER_SEGMENTS - 1 - i;
    cell.classList.toggle('lit', fromBottom < litSegments);
  });
}

// Recent-history amplitude envelope per deck, fed straight from the levels-poll tick — NOT a
// full-track scrub view (see ARCHITECTURE.md "Bandcamp as second source" for why the audio
// graph has no access to a decodable whole-track buffer; a YouTube <video> is MSE-streamed,
// there is no lookahead past what has already played). WAVEFORM_HISTORY_LEN * poll interval
// (20ms) = ~4.4s of visible history, oldest at the left.
const WAVEFORM_HISTORY_LEN = 220;
const waveformHistory = {
  A: new Array(WAVEFORM_HISTORY_LEN).fill(0),
  B: new Array(WAVEFORM_HISTORY_LEN).fill(0),
};
const waveformAccentColor = { A: null, B: null }; // cached from CSS on first draw, not re-read every tick

function pushWaveformSample(deck, peak) {
  const hist = waveformHistory[deck];
  hist.push(clamp(peak, 0, 1));
  hist.shift();
  drawWaveform(deck);
}

function drawWaveform(deck) {
  const canvas = document.getElementById(`waveform${deck}`);
  if (!canvas) return;
  // Backing-store size follows the CSS box × DPR, not a fixed attribute — the side panel is
  // drag-resizable (see ARCHITECTURE.md "Поверхность"), so this is re-checked every draw; the
  // cost of a no-op comparison is negligible next to the canvas repaint itself.
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  const wantW = Math.round(cssWidth * dpr);
  const wantH = Math.round(cssHeight * dpr);
  if (canvas.width !== wantW || canvas.height !== wantH) {
    canvas.width = wantW;
    canvas.height = wantH;
  }
  const ctx2d = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx2d.clearRect(0, 0, w, h);
  if (!waveformAccentColor[deck]) {
    waveformAccentColor[deck] = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-accent-deck${deck}`).trim() || (deck === 'A' ? '#99ccff' : '#ffcc99');
  }
  ctx2d.fillStyle = waveformAccentColor[deck];
  const hist = waveformHistory[deck];
  const midY = h / 2;
  const colW = w / hist.length;
  for (let i = 0; i < hist.length; i++) {
    const amp = hist[i] * (midY - 1);
    if (amp <= 0) continue;
    ctx2d.fillRect(i * colW, midY - amp, Math.max(1, colW - Math.min(1, colW * 0.15)), amp * 2);
  }
}

// Own fast 20ms interval (separate from the 1s status poll) — uses lightweight counterDJLevel()
// not the full counterDJPoll. Measured live (2026-08-23): full sequential tick across both
// decks averages ~2.1ms, well inside the 20ms budget — see counterDJLevel's comment for numbers.
let levelsPollTimer = null;
function startLevelsPoll() {
  clearInterval(levelsPollTimer);
  lastLevelsPollAt = null;
  levelsPollTimer = setInterval(async () => {
    const now = Date.now();
    const elapsedSec = lastLevelsPollAt == null ? 0 : (now - lastLevelsPollAt) / 1000;
    lastLevelsPollAt = now;
    for (const deck of ['A', 'B']) {
      const tabId = state.decks[deck].tabId;
      if (!tabId) continue;
      try {
        const res = await chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: counterDJLevel });
        const result = res && res[0] && res[0].result;
        const rawDb = result ? result.db : null;
        const prev = levelSmoothedDb[deck];
        const smoothed = rawDb == null ? prev : Math.max(rawDb, prev - DECAY_DB_PER_SEC * elapsedSec);
        levelSmoothedDb[deck] = smoothed;
        const pct = levelDbToPercent(smoothed);
        const litSegments = Math.floor((pct / 100) * LEVEL_METER_SEGMENTS); // floor, not round — LED meters never optimistically light early
        setLevelMeterLit(deck, litSegments);
        pushWaveformSample(deck, result ? result.peak : 0);
      } catch (e) { /* transient — next tick retries */ }
    }
  }, 20);
}

function disconnectDeck(deck, reason) {
  if (!state.decks[deck].tabId) return; // already handled
  state.decks[deck].tabId = null;
  state.decks[deck].connected = false;
  state.decks[deck].missedPolls = 0;
  state.decks[deck].playing = null;
  state.decks[deck].hasPlayedOnce = false;
  resetPhaseIntegral(deck);
  state.phaseOffsetEighths = 0;
  // Clear cue state — tab is gone, AudioContext with it; don't leave the toggle showing "active".
  state.decks[deck].cued = false;
  document.getElementById(`cueBtn${deck}`).classList.remove('active');
  state.decks[deck].videoId = null;
  state.decks[deck].detectedBpm = null;
  state.decks[deck].beatCount = 0;
  state.decks[deck].recentOnsets = [];
  // Clear stale cover art and title left over from the closed tab.
  document.getElementById(`title${deck}`).textContent = '—';
  setDeckThumb(deck, null);
  updateDeckConnectedVisual(deck);
  // startLevelsPoll skips a tabId-less deck entirely, so decay never runs — reset manually.
  levelSmoothedDb[deck] = -60;
  setLevelMeterLit(deck, 0);
  // Don't hide phaseDrift here — updatePhaseDrift() owns its visibility via .phaseInactive;
  // hiding on disconnect left it permanently display:none for the session.
  // tempoStatus itself is never hidden anymore — refresh it so labels fall back to the
  // disconnected deck's placeholder instead of showing its last (now stale) BPM/rate.
  updateTempoStatus();
  // Tab closed, not found, or the poll simply lost the page (reload/navigation) = normal,
  // not an error — the deck box's own .disconnected state already shows it. Skip the
  // "Reconnect" scold; only genuine unexpected reasons (e.g. a caught exception) surface.
  const cleaned = cleanErrorReason(reason);
  if (cleaned !== 'tab closed' && cleaned !== 'tab not found' && cleaned !== 'page reloaded or navigated away') {
    setStatus(t('status.deckDisconnected', { deck, reason: cleaned }));
  }
  updateConnectEnabled();
}

// Binary "Synced"/"Syncing" status (not a precise moving value) — a smooth animated needle read
// as "broken" because correction is automatic and there's nothing the user can do with an exact
// number. Reads kalmanPhase (below) rather than computing its own estimate.
//
// Schmitt trigger: wider error band to LEAVE "synced" than to enter it — onset jitter (~46ms,
// one audio block) was comparable to the flat 5% threshold this used to use with no hysteresis.
//
// Kalman filter (kalmanPhase): replaces both smoothedAnchor's onset-averaging AND the old EMA
// with one estimator. State = [errorMs, errorRateMsPerSec]. Global (not per-deck) because
// there's only ever one active pairing at a time.
//
// syncTuning: all tunable constants in one object. Values from an offline sweep (sync-sim.js,
// not shipped) against 3 scenarios x 800 parameter sets, scored on acquisition speed, % time
// locked, spurious-unlock count, and RMS trim. Validated at 92/120/171bpm. Re-run the sim after
// any structural change — these numbers are only valid for the update equations they were fit against.
const syncTuning = {
  kalmanMeasurementVar: 900, // ms^2 (30ms std) — sweep found tighter than the ~46ms jitter floor converges faster; wider thresholds compensate
  // Process noise: how much the TRUE error/rate are expected to wander per second on their own,
  // independent of what any single measurement says.
  kalmanProcessVarError: 4, // ms^2 per second
  kalmanProcessVarRate: 2, // (ms/s)^2 per second
  kalmanStaleMs: 3000, // after this many ms without a syncPhase update, consider estimate stale (not "between ticks" quiet)
  bendRateDelta: 0.012,        // rate-trim cap while LOCKED — gentler (was 0.02); paired with aggressive acquisition cap below
  acquisitionRateDelta: 0.065, // rate-trim cap while UNLOCKED — 5x+ bendRateDelta for fast large-error catch-up
  // Fraction of the beat at which the proportional trim saturates to its cap — unchanged, the
  // sweep landed back on the same value the earlier hand-tuning had already converged to.
  saturationBeatFraction: 1 / 16,
  // How strongly the accumulated integral converts into a rate trim — gentler than before (was
  // 0.15), consistent with the gentler bendRateDelta above.
  integralGain: 0.065,
  // Fraction of the beat below which, once LOCKED, the proportional component contributes nothing
  // (only the integral keeps nudging) — wider than before (was 1/32).
  deadZoneBeatFraction: 1 / 24,
  // Lock detector (Schmitt trigger + dwell, see updatePhaseDrift) — error must drop under this
  // fraction of the beat to be considered a "locked" candidate — wider than before (was 0.06).
  enterThresholdFraction: 0.075,
  // Exit threshold is enterThresholdFraction times THIS, not its own independent percentage.
  exitThresholdMultiplier: 3.5,
  syncDwellMs: 800, // candidate must persist this long to commit (was 2000; shorter is fine, estimate more confident now)
};
const kalmanPhase = {
  errorMs: 0,
  errorRateMsPerSec: 0,
  Pee: 1e4, Per: 0, Prr: 1e2, // state covariance — starts wide/uncertain, converges as measurements arrive
  lastUpdateAt: null, // wall-clock ms of the last update; also doubles as "do we have live data at all"
};
function resetKalmanPhase() {
  kalmanPhase.errorMs = 0;
  kalmanPhase.errorRateMsPerSec = 0;
  kalmanPhase.Pee = 1e4;
  kalmanPhase.Per = 0;
  kalmanPhase.Prr = 1e2;
  kalmanPhase.lastUpdateAt = null;
}
// Standard 2-state (error, error-rate) Kalman filter. First call after reset initializes directly.
// Subsequent calls: predict forward by dt under constant-rate model, then update against measurement.
function kalmanPhaseUpdate(measuredErrorMs, nowMs) {
  if (kalmanPhase.lastUpdateAt == null) {
    kalmanPhase.errorMs = measuredErrorMs;
    kalmanPhase.errorRateMsPerSec = 0;
    kalmanPhase.Pee = syncTuning.kalmanMeasurementVar;
    kalmanPhase.Per = 0;
    kalmanPhase.Prr = 1e2;
    kalmanPhase.lastUpdateAt = nowMs;
    return;
  }
  const dt = Math.max(0.001, (nowMs - kalmanPhase.lastUpdateAt) / 1000);
  // Predict: state transition F = [[1, dt], [0, 1]], applied to both the state and its covariance
  // (P_pred = F P F^T + Q, expanded by hand below since a 2x2 matrix library would be overkill).
  const errorPred = kalmanPhase.errorMs + kalmanPhase.errorRateMsPerSec * dt;
  const ratePred = kalmanPhase.errorRateMsPerSec;
  const PeePred = kalmanPhase.Pee + 2 * dt * kalmanPhase.Per + dt * dt * kalmanPhase.Prr + syncTuning.kalmanProcessVarError * dt;
  const PerPred = kalmanPhase.Per + dt * kalmanPhase.Prr;
  const PrrPred = kalmanPhase.Prr + syncTuning.kalmanProcessVarRate * dt;
  // Update: measurement model H = [1, 0] — every tick measures error directly, never rate.
  const innovation = measuredErrorMs - errorPred;
  const S = PeePred + syncTuning.kalmanMeasurementVar;
  const Ke = PeePred / S;
  const Kr = PerPred / S;
  kalmanPhase.errorMs = errorPred + Ke * innovation;
  kalmanPhase.errorRateMsPerSec = ratePred + Kr * innovation;
  kalmanPhase.Pee = PeePred * (1 - Ke);
  kalmanPhase.Per = PerPred * (1 - Ke);
  kalmanPhase.Prr = PrrPred - Kr * PerPred;
  kalmanPhase.lastUpdateAt = nowMs;
}
// Set once a pairing first reaches "Syncing"/"Synced"; cleared only on genuine disengagement.
// Gates whether brief data gaps (BPM re-acquiring, stale Kalman) show "Syncing" vs "Tempo".
let phaseEngagedThisPairing = false;
let wasPhaseSynced = false; // the DISPLAYED/committed state — only changes once a candidate survives SYNC_DWELL_MS below
let candidateSynced = null; // this tick's raw threshold verdict, pending commit
let candidateSince = null; // when the candidate first started disagreeing with wasPhaseSynced
// Logs to the side panel's own console (right-click → Inspect). Each flip logs how long
// the previous state held and the error at the moment of the flip.
let syncStateChangedAt = null;
function resetSyncMonitor() {
  resetKalmanPhase();
  wasPhaseSynced = false;
  candidateSynced = null;
  candidateSince = null;
  syncStateChangedAt = null;
}
// Resets to the "Tempo" neutral label. The old implementation just dimmed whatever was already
// showing, leaving a ghost pale-green "Synced" after a mute. Every idle branch calls this now.
function showPhaseIdle(nudgeEl, label) {
  nudgeEl.classList.add('phaseInactive');
  label.classList.remove('synced');
  label.textContent = 'Tempo';
}
// Shows "Syncing" instead of "Tempo" during brief data gaps (BPM re-acquiring after a track
// change). Does NOT call resetSyncMonitor — wasPhaseSynced carries over so a quick re-lock
// confirms through the wider exit threshold rather than re-earning from the tighter entry.
function showPhaseReacquiring(nudgeEl, label) {
  nudgeEl.classList.add('phaseInactive');
  label.classList.remove('synced');
  label.textContent = 'Syncing';
}
function updatePhaseDrift() {
  const nudgeEl = document.getElementById('phaseNudgeRow');
  const label = document.getElementById('phaseDriftLabel');
  const t = state.tempoBlend;
  // Idle if either deck is paused, disconnected, EQ-killed, or crossfader-cut — same gate as syncPhase().
  if (t == null || t === 0.5 || !state.decks.A.connected || !state.decks.B.connected ||
    !state.decks.A.playing || !state.decks.B.playing || isDeckSilent('A') || isDeckSilent('B')) {
    showPhaseIdle(nudgeEl, label);
    resetSyncMonitor();
    phaseEngagedThisPairing = false;
    return;
  }
  const leadDeck = t < 0.5 ? 'A' : 'B';
  const lead = state.decks[leadDeck];
  if (!lead.detectedBpm) {
    // BPM null = detector re-acquiring after track change — transient, not disengagement.
    if (phaseEngagedThisPairing) { showPhaseReacquiring(nudgeEl, label); return; }
    showPhaseIdle(nudgeEl, label);
    resetSyncMonitor();
    return;
  }
  const now = Date.now();
  // Read the shared kalmanPhase estimate (syncPhase() is the sole writer); fall back to idle if
  // stale (several missed 1s ticks, not just "between ticks" quiet on the 100ms loop).
  if (kalmanPhase.lastUpdateAt == null || now - kalmanPhase.lastUpdateAt > syncTuning.kalmanStaleMs) {
    if (phaseEngagedThisPairing) { showPhaseReacquiring(nudgeEl, label); return; }
    showPhaseIdle(nudgeEl, label);
    resetSyncMonitor();
    return;
  }
  phaseEngagedThisPairing = true;
  const periodMs = 60000 / lead.detectedBpm;
  const errorMs = kalmanPhase.errorMs;
  nudgeEl.classList.remove('phaseInactive');
  // exitThreshold = enterThreshold × exitThresholdMultiplier (3×); wider to exit than to enter.
  const enterThreshold = periodMs * syncTuning.enterThresholdFraction;
  const exitThreshold = enterThreshold * syncTuning.exitThresholdMultiplier;
  const rawSynced = Math.abs(errorMs) < (wasPhaseSynced ? exitThreshold : enterThreshold);
  // Dwell debounce on top of Schmitt-trigger hysteresis: candidate must persist continuously for
  // syncTuning.syncDwellMs before committing; any tick that agrees with the current state resets the clock.
  if (rawSynced === wasPhaseSynced) {
    candidateSince = null;
  } else {
    if (candidateSynced !== rawSynced) {
      candidateSynced = rawSynced;
      candidateSince = now;
    }
    if (now - candidateSince >= syncTuning.syncDwellMs) {
      const heldMs = syncStateChangedAt == null ? null : Math.round(now - syncStateChangedAt);
      console.log(`[counterDJ] sync-monitor: ${wasPhaseSynced ? 'in sync' : 'syncing'} held for ${heldMs}ms -> now ${rawSynced ? 'in sync' : 'syncing'} (errorMs=${errorMs.toFixed(1)} rateMsPerSec=${kalmanPhase.errorRateMsPerSec.toFixed(1)} periodMs=${periodMs.toFixed(1)})`);
      syncStateChangedAt = now;
      wasPhaseSynced = rawSynced;
      candidateSince = null;
      // Integral intentionally NOT reset here — syncPhase() freezes (not zeroes) it while
      // unlocked, so a brief excursion leaves a valid converged value; resetting forced a slow
      // rebuild each time, which caused a self-feeding relock->reset->drift->unlock cycle.
    }
  }
  label.classList.toggle('synced', wasPhaseSynced);
  label.textContent = wasPhaseSynced ? 'Synced' : 'Syncing';
}

let phaseDriftTimer = null;
function startPhaseDriftLoop() {
  clearInterval(phaseDriftTimer);
  phaseDriftTimer = setInterval(updatePhaseDrift, 100);
}

// Runs both decks concurrently via Promise.all — sequential would add a full round-trip of latency.
async function pollDeckStatus() {
  await Promise.all(['A', 'B'].map(pollOneDeckStatus));
}
async function pollOneDeckStatus(deck) {
  const tabId = state.decks[deck].tabId;
  // tabId = "picked", not "live" — without the connected guard, a sibling-driven poll tick
  // would find __counterDJ__ missing on the freshly-picked tab, rack up missedPolls, and
  // auto-disconnect before the user can click Connect.
  if (!tabId || !state.decks[deck].connected) return;
  try {
      // SPA navigation doesn't reload: __counterDJ__ survives, tab.url/title change. Chapter
      // changes inside the same video don't change the URL, so this won't fight chapterTitle.
      const tab = await chrome.tabs.get(tabId);
      const videoId = getVideoId(tab.url);
      if (videoId && videoId !== state.decks[deck].videoId) {
        addBreadcrumb(`track_loaded: ${deck} (auto_next)`);
        if (window.posthog) posthog.capture('track_loaded', { deck, via: 'auto_next' });
        state.decks[deck].videoId = videoId;
        state.decks[deck].staticTitle = tab.title || tab.url;
        // Same race as the initial pick (see refreshTitleWhenResolved above): SPA nav updates
        // the URL/videoId before YouTube's own JS gets around to updating document.title, so
        // tab.title read at this exact instant can still be the generic "YouTube" shell title —
        // pickTab() already re-checks after a beat for that reason, this auto-next path (a track
        // finishing and the next one starting inside the same tab) didn't (direct report — stuck
        // showing "YouTube" instead of the new track's title/chapter).
        refreshTitleWhenResolved(deck, tabId, tab.url);
        setDeckThumb(deck, videoId);
        // Same asymmetric EQ reset as initial Connect: anchor (A) stays flat, guest (B) cuts in.
        const resetEq = deck === 'A' ? 0 : EQ_MIN;
        state.decks[deck].high = state.decks[deck].mid = state.decks[deck].low = resetEq;
        sendParam(deck, 'low', resetEq);
        sendParam(deck, 'mid', resetEq);
        sendParam(deck, 'high', resetEq);
        // Reset BPM and rate: the in-page engine survives SPA nav but needs 20 agreeing onsets
        // before moving detectedBpm; without this it keeps reporting the previous song's tempo.
        // rate=1 too — the old correction has no meaning until re-lock against the new track.
        state.decks[deck].detectedBpm = null;
        state.decks[deck].beatCount = 0;
        state.decks[deck].recentOnsets = [];
        state.decks[deck].rate = 1;
        resetPhaseIntegral(deck);
        state.phaseOffsetEighths = 0;
        state.decks[deck].hasPlayedOnce = false; // new track = cold for skip too
        updateSkipBtnEnabled(deck);
        state.tempoOctave = null; // old octave relationship has no meaning for the new track
        sendParam(deck, 'rate', 1);
        chrome.scripting.executeScript({ target: { tabId }, world: 'MAIN', func: counterDJResetDetector });
        updateTempoStatus();
        updateReadouts();
      }

      const res = await chrome.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        func: counterDJPoll,
      });
      const result = res && res[0] && res[0].result;
      if (!result || !result.connected) {
        // 2 consecutive misses before tearing down — a freshly-connected tab mid-redirect can
        // briefly read as __counterDJ__ missing even though nothing is wrong; a genuine
        // navigation-away stays gone on the next tick too.
        state.decks[deck].missedPolls = (state.decks[deck].missedPolls || 0) + 1;
        if (state.decks[deck].missedPolls >= 2) {
          disconnectDeck(deck, 'page reloaded or navigated away');
        }
        return;
      }
      state.decks[deck].missedPolls = 0;
      // Temporary diagnostic — inspect the side panel (right-click → Inspect), not the YouTube tab.
      console.log(`[counterDJ] deck ${deck}`, {
        ctxState: result.ctxState,
        playing: result.playing,
        videoMuted: result.videoMuted,
        energyNow: result.energyNow,
        beatCount: result.beatCount,
      });
      document.getElementById(`title${deck}`).textContent = result.chapterTitle || state.decks[deck].staticTitle;
      // A suspended AudioContext (see connectDecks) counts as not-playing here too — it can stay
      // suspended indefinitely on a background tab until the user actually engages with it, which
      // resumes it (as does any of our own executeScript calls that carry a real click, e.g. a
      // knob drag).
      const reallyPlaying = result.playing && !result.videoMuted && result.ctxState === 'running';
      if (state.decks[deck].playing !== reallyPlaying) {
        state.decks[deck].playing = reallyPlaying;
        updateReadouts();
      }
      if (reallyPlaying && !state.decks[deck].hasPlayedOnce) {
        state.decks[deck].hasPlayedOnce = true;
        updateSkipBtnEnabled(deck);
      }
      const bpmChanged = state.decks[deck].detectedBpm !== result.detectedBpm;
      if (bpmChanged || state.decks[deck].beatCount !== result.beatCount) {
        // A seek can produce Infinity/NaN BPM for one tick (disrupted onset timing).
        // NaN/Infinity is not JSON-serializable → cryptic executeScript error. Treat as null.
        const bpm = result.detectedBpm;
        state.decks[deck].detectedBpm = (bpm == null || Number.isFinite(bpm)) ? bpm : null;
        state.decks[deck].beatCount = result.beatCount;
        updateTempoStatus();
        // Delay's density knob is BPM-synced (see counterDJSetup's delayTimeForKnob) but the tab
        // only recomputes the actual delay time when the knob value is (re)applied — re-send the
        // current value as BPM converges so the echo spacing tightens up to match, not just
        // whatever tempo happened to be locked in when the knob was last touched.
        if (bpmChanged && state.decks[deck].fxType === 'delay') sendParam(deck, 'fx', state.decks[deck].fx);
      }
      // Auto-beatmatch the first time both decks have a BPM and are both playing.
      // tempoBlend == null is the once-only guard; a later manual bar touch re-engages normally.
      if (state.tempoBlend == null && state.decks.A.detectedBpm && state.decks.B.detectedBpm &&
        state.decks.A.playing && state.decks.B.playing) {
        applyTempoBlend(0);
        syncPhase();
      } else if (bpmChanged && state.tempoBlend != null) {
        // Re-apply whenever BPM refines — otherwise rate/% would sit stale against the old reading.
        applyTempoBlend(state.tempoBlend);
      }
      state.decks[deck].recentOnsets = result.recentOnsets; // consumed by updatePhaseDrift's 100ms loop
    } catch (e) {
      disconnectDeck(deck, cleanErrorReason(e.message) || 'tab closed');
  }
}

// Swaps the entire deck state (including EQ/gain) — controls keep addressing "left box".
// The deck-bound variant (only stream moves) is sendTrackToOtherDeck(). Reachable from each
// deck's own tab-picker dropdown as "Swap Decks" (moved here from the header button 2026-08-14).
function swapDecks() {
  const tmp = state.decks.A;
  state.decks.A = state.decks.B;
  state.decks.B = tmp;
  // levelSmoothedDb is keyed by deck letter, not tabId — the stream moved, so the meter reading
  // has to move with it, same as sendTrackToOtherDeck() already does below (2026-08-10, direct
  // report — gain/level LEDs stayed lit on a slot after swapping instead of following the track).
  const tmpLevel = levelSmoothedDb.A;
  levelSmoothedDb.A = levelSmoothedDb.B;
  levelSmoothedDb.B = tmpLevel;
  const titleA = document.getElementById('titleA');
  const titleB = document.getElementById('titleB');
  const tmpTitle = titleA.textContent;
  titleA.textContent = titleB.textContent;
  titleB.textContent = tmpTitle;
  // Route through setDeckThumb, not img.src: reading .src on an img with no src attribute
  // returns '' and writing '' back resolves against the page URL, causing a broken-image glyph.
  setDeckThumb('A', state.decks.A.videoId);
  setDeckThumb('B', state.decks.B.videoId);
  state.cross = 1 - state.cross; // invert so the same position still points at the same track
  applyCrossfader();
  updateReadouts();
  // Invert tempoBlend too — lead/follow is derived by comparing against 0.5 for whichever deck
  // is labeled A; without this the role labels would flip post-swap.
  if (state.tempoBlend != null) state.tempoBlend = Math.round((1 - state.tempoBlend) * 100) / 100;
  updateTempoStatus();
  for (const deck of ['A', 'B']) {
    document.getElementById(`cueBtn${deck}`).classList.toggle('active', state.decks[deck].cued);
    // Covers cue/skip-enabled too — called here (not just at connect time) because swap can now
    // move a track into (or out of) an empty slot, not just trade two live decks; .disconnected/
    // .empty and the empty-hint text are per-box and won't otherwise refresh.
    updateDeckConnectedVisual(deck);
    // A slot left empty by the swap never goes through disconnectDeck() (this is a straight
    // object swap, not a disconnect) — without this its level meter freezes at whatever the
    // track that just left last showed, since startLevelsPoll skips tabId-less decks forever.
    if (!state.decks[deck].tabId) {
      levelSmoothedDb[deck] = -60;
      setLevelMeterLit(deck, 0);
    }
  }
  updateConnectEnabled();
}

// Reachable from the header ⇄ button and the Tab key (moved here from the dropdown 2026-08-14,
// which now owns the full swapDecks() instead). Unlike swapDecks(), only the STREAM moves —
// tabId + everything identifying it; EQ/gain/crossfader stay deck-bound (fixed to the box). Same
// underlying swap regardless of which side triggered it: sending A's track to an empty B just
// means B inherits it and A ends up with B's (empty) fields — no separate "move to empty slot"
// case needed.
const TRACK_BOUND_FIELDS = [
  'tabId', 'connected', 'videoId', 'staticTitle', 'playing', 'hasPlayedOnce', 'cued',
  'detectedBpm', 'beatCount', 'recentOnsets', 'rate', 'missedPolls',
];
function sendTrackToOtherDeck() {
  const a = state.decks.A, b = state.decks.B;
  for (const field of TRACK_BOUND_FIELDS) {
    const tmp = a[field];
    a[field] = b[field];
    b[field] = tmp;
  }
  // levelSmoothedDb is keyed by deck letter, not tabId — the stream moved, so the meter reading
  // has to move with it, or the box that just inherited a loud track reads silent (decaying from
  // -60) while the box that just went empty keeps showing the old loudness for ~2.4s.
  const tmpLevel = levelSmoothedDb.A;
  levelSmoothedDb.A = levelSmoothedDb.B;
  levelSmoothedDb.B = tmpLevel;
  const titleA = document.getElementById('titleA');
  const titleB = document.getElementById('titleB');
  const tmpTitle = titleA.textContent;
  titleA.textContent = titleB.textContent;
  titleB.textContent = tmpTitle;
  setDeckThumb('A', state.decks.A.videoId);
  setDeckThumb('B', state.decks.B.videoId);
  // gain/EQ deliberately untouched (deck-bound) — but the tab now plugged into each box is a
  // DIFFERENT tab than before, and its own graph still carries the PREVIOUS box's dial settings
  // until these are resent.
  for (const deck of ['A', 'B']) {
    sendParam(deck, 'gain', state.decks[deck].gain);
    sendParam(deck, 'low', state.decks[deck].low);
    sendParam(deck, 'mid', state.decks[deck].mid);
    sendParam(deck, 'high', state.decks[deck].high);
    // fx is deck/box-bound like gain/EQ (not in TRACK_BOUND_FIELDS), but the tab that just landed
    // in this box may still be running whichever Filter/Delay values it had before — resend both
    // plus which one the knob shows, or the new tab's own graph would keep its previous values.
    sendFxType(deck, state.decks[deck].fxType, state.decks[deck].filterValue, state.decks[deck].delayValue);
  }
  applyCrossfader();
  updateReadouts();
  if (state.tempoBlend != null) state.tempoBlend = Math.round((1 - state.tempoBlend) * 100) / 100;
  updateTempoStatus();
  for (const deck of ['A', 'B']) {
    document.getElementById(`cueBtn${deck}`).classList.toggle('active', state.decks[deck].cued);
    updateCueBtnEnabled(deck);
    updateSkipBtnEnabled(deck);
    updateDeckConnectedVisual(deck);
  }
}

// Q/W=A-high, A/S=A-mid, Z/X=A-low; P/[=B-high, L/;=B-mid, ,/.=B-low. Direction same raw
// rule on both decks (right key = up). Mirrored mode tried and removed (unintuitive in testing).
const KEYMAP = {
  q: ['A', 'high', -1], w: ['A', 'high', +1],
  a: ['A', 'mid', -1], s: ['A', 'mid', +1],
  z: ['A', 'low', -1], x: ['A', 'low', +1],
  p: ['B', 'high', -1], '[': ['B', 'high', +1],
  l: ['B', 'mid', -1], ';': ['B', 'mid', +1],
  ',': ['B', 'low', -1], '.': ['B', 'low', +1],
  '1': ['A', 'gain', -1], '2': ['A', 'gain', +1],
  '=': ['B', 'gain', +1], '-': ['B', 'gain', -1],
  // C/V below D/F (deck A mid column); N/M below J/K — moved off J/K (2026-08-08) because
  // those are native YouTube shortcuts (J=rewind 10s, K=play/pause) and stealing OS focus to
  // the YouTube tab while reaching for FX would rewind/pause the track instead of touching FX.
  c: ['A', 'fx', -1], v: ['A', 'fx', +1],
  n: ['B', 'fx', -1], m: ['B', 'fx', +1],
};

const TOGGLE_PLAY_KEYS = { e: 'A', o: 'B' };

function togglePlay(deck) {
  if (!state.decks[deck].tabId || !state.decks[deck].connected) return;
  // Manual capture — PostHog autocapture is a no-op in the side-panel context.
  addBreadcrumb(`button_click: play_pause ${deck}`);
  if (window.posthog) posthog.capture('button_click', { button: 'play_pause', deck });
  if (state.decks[deck].playing) {
    sendTransport(deck, 'pause');
    return;
  }
  // Chrome blocks .play() on a tab that's never been focused/visible (autoplay policy) — the
  // click lands in the sidepanel document, not the target tab, so it grants no activation there.
  // Focusing the tab first satisfies the engagement check before we ask it to play (2026-08-07,
  // direct report — pressing Play on a background deck silently did nothing).
  chrome.tabs.update(state.decks[deck].tabId, { active: true }).then(() => {
    sendTransport(deck, 'restart');
  });
}

for (const deck of ['A', 'B']) {
  document.getElementById(`playBtn${deck}`).addEventListener('click', () => togglePlay(deck));
}

for (const deck of ['A', 'B']) {
  document.getElementById(`skipNext${deck}`).addEventListener('click', () => {
    if (!state.decks[deck].tabId) return;
    addBreadcrumb(`track_skip: ${deck} next`);
    if (window.posthog) posthog.capture('track_skip', { direction: 'next' });
    sendSkip(deck, 'next');
  });
  document.getElementById(`skipPrev${deck}`).addEventListener('click', () => {
    if (!state.decks[deck].tabId || document.getElementById(`skipPrev${deck}`).disabled) return;
    addBreadcrumb(`track_skip: ${deck} prev`);
    if (window.posthog) posthog.capture('track_skip', { direction: 'prev' });
    sendSkip(deck, 'prev');
  });
}

for (const deck of ['A', 'B']) {
  document.getElementById(`fxTypePrev${deck}`).addEventListener('click', () => cycleFxType(deck, -1));
  document.getElementById(`fxTypeNext${deck}`).addEventListener('click', () => cycleFxType(deck, 1));
}

// One eighth of the lead beat per click, wrapped 0..7. Seeks the follower immediately (background
// trim alone wasn't fast enough) then calls syncPhase() once to settle residual.
function nudgePhaseOffset(deltaEighths) {
  const t = state.tempoBlend;
  if (t == null || t === 0.5) return;
  const leadDeck = t < 0.5 ? 'A' : 'B';
  const followDeck = leadDeck === 'A' ? 'B' : 'A';
  if (!state.decks[leadDeck].detectedBpm) return;
  trackEngagementOnce('used_phase_nudge');
  state.phaseOffsetEighths = ((state.phaseOffsetEighths + deltaEighths) % 8 + 8) % 8;
  const periodMs = 60000 / state.decks[leadDeck].detectedBpm;
  // Positive deltaEighths seeks the follower FORWARD — same sign convention as syncPhase's errorMs.
  const deltaContentSeconds = (periodMs / 1000 / 8) * deltaEighths * state.decks[followDeck].rate;
  sendSeekBy(followDeck, deltaContentSeconds);
  syncPhase();
}
document.getElementById('phaseNudgeLeft').addEventListener('click', () => nudgePhaseOffset(-1));
document.getElementById('phaseNudgeRight').addEventListener('click', () => nudgePhaseOffset(1));

// crossfader nudge: negative = toward A (position 0), positive = toward B (position 1)
const CROSS_KEYS = { ArrowLeft: -1, ArrowRight: +1 };

// Holding both keys of a pair is the isolator gesture: first press snaps to neutral,
// second press kills to minimum. handledPairs fires once per physical press, not per OS key-repeat.
const PAIR_PARTNER = {
  q: 'w', w: 'q',
  a: 's', s: 'a',
  z: 'x', x: 'z',
  p: '[', '[': 'p',
  l: ';', ';': 'l',
  ',': '.', '.': ',',
  '1': '2', '2': '1',
  '=': '-', '-': '=',
  c: 'v', v: 'c',
  n: 'm', m: 'n',
};
const heldKeys = new Set();
const handledPairs = new Set();
function pairId(k1, k2) {
  return [k1, k2].sort().join('+');
}

mixerEl.addEventListener('keyup', (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  heldKeys.delete(key);
  const partner = PAIR_PARTNER[key];
  if (partner) handledPairs.delete(pairId(key, partner));
});

function nudgeCrossfader(dir, mult = 1) {
  trackEngagementOnce('used_crossfader');
  state.cross = Math.round(clamp(state.cross + dir * CROSS_STEP * mult, 0, 1) * 100) / 100; // rounded to avoid float drift
  document.getElementById('crossThumb').classList.add('animated'); // CSS glide on discrete key steps
  applyCrossfader();
  updateReadouts();
}

// Horizontal two-finger trackpad swipe moves the crossfader. { passive: false } is required
// for preventDefault; vertical scroll is left alone.
mixerEl.addEventListener('wheel', (e) => {
  if (!state.decks.A.connected || !state.decks.B.connected) return;
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
  e.preventDefault();
  document.getElementById('crossThumb').classList.remove('animated');
  state.cross = clamp(state.cross - e.deltaX * 0.002, 0, 1);
  applyCrossfader();
  updateReadouts();
}, { passive: false });

// Tempo/sync. Uses preservesPitch (set once in counterDJSetup) for real time-stretching.
const TEMPO_MIN = 0.5, TEMPO_MAX = 1.5;
const BPM_DETECT_BEATS = 5; // matches in-page detector's first-lock floor (see counterDJSetup)

function bpmLabel(d) {
  if (d.detectedBpm) return `${d.detectedBpm.toFixed(1)} BPM`; // 1 decimal so 127.6 and 128.4 stay distinct
  if (!d.tabId) return 'BPM'; // cold, no track picked yet — no dash placeholder to read as a value
  return `BPM … (${Math.min(d.beatCount, BPM_DETECT_BEATS)}/${BPM_DETECT_BEATS})`;
}

// Uses state rate (our set value) not live BPM — jitter-free and meaningful before sync locks.
function ratePercent(rate) {
  const pct = (rate - 1) * 100;
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

function updateTempoStatus() {
  // Always rendered, never hidden — bpmLabel/ratePercent already degrade gracefully with no
  // tabId or no detected BPM yet, so there's a sensible placeholder even with 0 or 1 deck live.
  const a = state.decks.A, b = state.decks.B;
  const t = state.tempoBlend;
  const engaged = t != null && t !== 0.5;
  const roleA = engaged && t < 0.5 ? 'lead' : '';
  const roleB = engaged && t >= 0.5 ? 'lead' : '';
  const pctA = ratePercent(a.rate);
  const pctB = ratePercent(b.rate);
  document.getElementById('tempoPctA').textContent = [pctA, roleA].filter(Boolean).join(' · ');
  document.getElementById('tempoPctB').textContent = [roleB, pctB].filter(Boolean).join(' · ');
  document.getElementById('tempoMainA').textContent = bpmLabel(a);
  document.getElementById('tempoMainB').textContent = bpmLabel(b);
  // Cold (no tabId) always reads grey on both sides — without the `!a.tabId` guard, A stayed its
  // full accent-blue while B alone read grey, purely because B's cold-state EQ defaults happen to
  // start pre-cut (isDeckEqKilled) and A's don't — a leftover asymmetry with no meaning before
  // either deck has a track, and no real difference between the two at that point (2026-08-11,
  // direct report).
  document.getElementById('tempoMainA').classList.toggle('silent', !a.tabId || isDeckSilent('A'));
  document.getElementById('tempoMainB').classList.toggle('silent', !b.tabId || isDeckSilent('B'));
  const thumb = document.getElementById('tempoThumb');
  thumb.style.left = `${(t == null ? 0.5 : t) * 100}%`;
}

// Picks A octave (×0.25/0.5/1/2/4) that minimises stretch from B — half/double-time mixing.
const OCTAVE_CANDIDATES = [0.25, 0.5, 1, 2, 4];
function bestOctaveFactor(aBpm, bBpm, prevK) {
  const ratio = aBpm / bBpm;
  let best = 1, bestErr = Infinity;
  for (const k of OCTAVE_CANDIDATES) {
    const err = Math.abs(ratio / k - 1);
    if (err < bestErr) { bestErr = err; best = k; }
  }
  // Hysteresis: at an octave boundary, BPM EMA jitter can flip k on every call → audible rate snap.
  // Stick with the previous call's k unless the new candidate is clearly better (>15% margin).
  if (prevK != null && prevK !== best) {
    const prevErr = Math.abs(ratio / prevK - 1);
    if (prevErr <= bestErr * 1.15) return prevK;
  }
  return best;
}

// 250ms/20-step glide back to native — instant rate snap to 1.0 is audible as a pitch click.
const RATE_RAMPS = { A: null, B: null };
const RATE_RAMP_MS = 250, RATE_RAMP_STEPS = 20;
function cancelRateRamp(deck) {
  if (RATE_RAMPS[deck]) { clearInterval(RATE_RAMPS[deck]); RATE_RAMPS[deck] = null; }
}
function rampRateToNative(deck) {
  const d = state.decks[deck];
  if (d.rate === 1 || RATE_RAMPS[deck]) return; // already there, or already gliding there
  const startRate = d.rate;
  let step = 0;
  RATE_RAMPS[deck] = setInterval(() => {
    step++;
    const frac = step / RATE_RAMP_STEPS;
    d.rate = frac >= 1 ? 1 : Math.round((startRate + (1 - startRate) * frac) * 1000) / 1000;
    sendParam(deck, 'rate', d.rate);
    if (frac >= 1) cancelRateRamp(deck);
  }, RATE_RAMP_MS / RATE_RAMP_STEPS);
}

// t=0 → A is anchor (B matches), t=1 → B is anchor (A matches), t=0.5 → both bend equally.
// Enter = applyTempoBlend(0) shortcut (A as permanent anchor, old syncTempo behavior).
function applyTempoBlend(t) {
  if (!state.decks.A.connected || !state.decks.B.connected) return;
  const a = state.decks.A, b = state.decks.B;
  state.tempoBlend = Math.round(clamp(t, 0, 1) * 100) / 100;
  // Bar/thumb updates regardless; rate correction only when both decks are playing and non-silent.
  if (a.detectedBpm && b.detectedBpm && a.playing && b.playing && !isDeckSilent('A') && !isDeckSilent('B')) {
    // k = octave factor: how many B beats fit in one A beat (k=2 → B is half-time vs A).
    // bEff = B's tempo expressed in A's octave, so blend math is shape-identical to the 1:1 case.
    const k = bestOctaveFactor(a.detectedBpm, b.detectedBpm, state.tempoOctave);
    state.tempoOctave = k;
    const bEff = b.detectedBpm * k;
    const targetBpm = a.detectedBpm + (bEff - a.detectedBpm) * state.tempoBlend;
    const newARate = Math.round(clamp(targetBpm / a.detectedBpm, TEMPO_MIN, TEMPO_MAX) * 1000) / 1000;
    const newBRate = Math.round(clamp((targetBpm / k) / b.detectedBpm, TEMPO_MIN, TEMPO_MAX) * 1000) / 1000;
    // Only push when the rounded rate actually changed — every ~1s poll re-invokes this (BPM
    // EMA nudges almost every onset), and unconditional sendParam was stomping the continuous
    // phase trim syncPhase() had just applied, resetting it to zero-trim once per second.
    if (newARate !== a.rate) { a.rate = newARate; sendParam('A', 'rate', a.rate); }
    if (newBRate !== b.rate) { b.rate = newBRate; sendParam('B', 'rate', b.rate); }
  } else if (a.playing && b.playing && (isDeckSilent('A') || isDeckSilent('B'))) {
    // A deck went silent — release both to native rather than leaving them frozen at the
    // last blend. Same reasoning as releasePhaseTrim() in the analogous syncPhase() branch.
    rampRateToNative('A');
    rampRateToNative('B');
  } else {
    cancelRateRamp('A'); // sync active again or one paused — cancel any stale glide
    cancelRateRamp('B');
  }
  updateTempoStatus();
}

const TEMPO_BLEND_STEP = 0.02; // ↑/↓ keys — 50 steps edge-to-edge
function nudgeTempoBlend(dir, mult = 1) {
  if (!state.decks.A.connected || !state.decks.B.connected) return;
  trackEngagementOnce('used_tempo_manual');
  const current = state.tempoBlend == null ? 0.5 : state.tempoBlend;
  applyTempoBlend(current + dir * TEMPO_BLEND_STEP * mult);
  // No syncPhase() — repeated key presses would cause audible seek clicks; background sync handles it.
}

// Continuous proportional phase trim — recomputed every 1s tick from the CURRENT error.
// Old design was a one-shot "bend for a fixed duration then release"; between ticks rate sat at
// exactly the target with zero correction, so any rate-estimate error re-accumulated drift the
// whole interval. Continuous trim suppresses drift every tick instead of catching it in bursts.
// Never touches state.decks[deck].rate — only live video.playbackRate, so BPM/% display is stable.
//
// Gain scheduling: acquisition mode (big error) uses a larger cap than tracking (small error) —
// reuses wasPhaseSynced (the label's own dwell-time lock verdict) as the regime switch.
// acquisitionRateDelta was 0.06 originally, causing limit-cycle oscillation: saturationBeatFraction
// and the lock threshold land at nearly the same error magnitude, so at 0.06 cap the correction
// overshot every single tick right at the boundary. 0.065 (current) is the sim-optimized value.
//
// Saturation and dead-zone are BEAT FRACTIONS (not flat ms) so tightness scales with tempo.
// Integral term (PI loop): pure proportional + dead-zone causes hunting — a small sustained
// error sits inside the dead zone getting zero correction, drifts out, gets corrected, drifts
// back. Integral accumulates even inside the dead zone, closing steady-state bias continuously.
const phaseIntegral = { A: 0, B: 0 };
function resetPhaseIntegral(deck) { phaseIntegral[deck] = 0; }
function applyPhaseTrim(deck, contentSecondsShift, periodMs) {
  const targetRate = state.decks[deck].rate;
  const cap = wasPhaseSynced ? syncTuning.bendRateDelta : syncTuning.acquisitionRateDelta;
  const satSeconds = (periodMs / 1000) * syncTuning.saturationBeatFraction;
  const gain = cap / satSeconds; // contentSecondsShift * gain = proportional trim, before the cap
  const proportionalTrim = clamp(contentSecondsShift * gain, -cap, cap);
  // Integral active in both regimes — anti-windup is in syncPhase (freeze on saturation, not on lock state).
  const integralTrim = clamp(phaseIntegral[deck] * syncTuning.integralGain, -cap, cap);
  const trim = clamp(proportionalTrim + integralTrim, -cap, cap);
  sendParam(deck, 'rate', targetRate + trim);
}
// Releases live rate back to target — called from dead-zone and on disengagement (t null/0.5).
function releasePhaseTrim(deck) {
  sendParam(deck, 'rate', state.decks[deck].rate);
  resetPhaseIntegral(deck);
}

// Shared by syncPhase() and updatePhaseDrift() so correction and verdict chase the same target.
function currentPhaseOffsetMs(periodMs) {
  let offsetMs = periodMs * (state.phaseOffsetEighths / 8);
  offsetMs = ((offsetMs % periodMs) + periodMs) % periodMs;
  if (offsetMs > periodMs / 2) offsetMs -= periodMs;
  return offsetMs;
}

// Beat-grid alignment on top of tempo sync. Uses Date.now() wall-clock (not performance.now()
// which isn't comparable across tabs). Dead zone is beat-fraction-relative (see saturationBeatFraction).
async function syncPhase() {
  if (!state.decks.A.connected || !state.decks.B.connected) return;
  // Release and reset if paused or silent — nothing real to phase-lock against.
  if (!state.decks.A.playing || !state.decks.B.playing || isDeckSilent('A') || isDeckSilent('B')) {
    releasePhaseTrim('A');
    releasePhaseTrim('B');
    resetKalmanPhase();
    return;
  }
  // Was hardcoded to A=lead: when B was actually the lead, we were seeking the anchor against
  // the follower's period — the "correction" never converged (errorMs sat at ~111.5ms forever).
  const t = state.tempoBlend;
  if (t == null || t === 0.5) {
    // Release stale trims — switching lead or disengaging could leave a trim from the old pairing.
    releasePhaseTrim('A');
    releasePhaseTrim('B');
    resetKalmanPhase();
    return;
  }
  const leadDeck = t < 0.5 ? 'A' : 'B';
  const followDeck = leadDeck === 'A' ? 'B' : 'A';
  if (!state.decks[leadDeck].detectedBpm) return; // no reliable period to phase-lock against yet
  try {
    const [resLead, resFollow] = await Promise.all([
      chrome.scripting.executeScript({ target: { tabId: state.decks[leadDeck].tabId }, world: 'MAIN', func: counterDJPhaseInfo }),
      chrome.scripting.executeScript({ target: { tabId: state.decks[followDeck].tabId }, world: 'MAIN', func: counterDJPhaseInfo }),
    ]);
    const lead = resLead && resLead[0] && resLead[0].result;
    const follow = resFollow && resFollow[0] && resFollow[0].result;
    if (!lead || !follow || !lead.lastOnsetWallClock || !follow.lastOnsetWallClock) {
      return; // no beat data yet — silent, not an error
    }
    const now = Date.now();
    const periodMs = 60000 / state.decks[leadDeck].detectedBpm; // the LEAD's period, not always A's
    // Raw last onset — pre-smoothing before a Kalman filter biases its noise model and adds lag.
    const anchorLead = lead.lastOnsetWallClock;
    const anchorFollow = follow.lastOnsetWallClock;
    const phaseLead = ((now - anchorLead) % periodMs + periodMs) % periodMs;
    const phaseFollow = ((now - anchorFollow) % periodMs + periodMs) % periodMs;
    let errorMs = phaseFollow - phaseLead;
    if (errorMs > periodMs / 2) errorMs -= periodMs; // shortest direction, not always "forward"
    if (errorMs < -periodMs / 2) errorMs += periodMs;
    errorMs -= currentPhaseOffsetMs(periodMs); // apply manual nudge offset
    if (errorMs > periodMs / 2) errorMs -= periodMs;
    if (errorMs < -periodMs / 2) errorMs += periodMs;
    // Feed raw measurement into Kalman filter; use filtered estimate (kalmanPhase.errorMs) from here on.
    kalmanPhaseUpdate(errorMs, now);
    // videoTimeShift: errorMs of real-time phase = errorMs/1000 * rate of video-time to skip.
    // Uses state.decks[followDeck].rate (clean target), not live playbackRate which may be
    // mid-trim — reading a contaminated rate compounds rather than converges. Computed before
    // the dead-zone check so the integral gets it every tick regardless.
    const videoTimeShift = -(kalmanPhase.errorMs / 1000) * state.decks[followDeck].rate;
    // Integral accumulates every tick. Anti-windup gates on SATURATION not on lock state —
    // gating on wasPhaseSynced stopped windup but also disabled the only thing that closes
    // a constant bias (proportional alone can't drive steady-state error to zero). Freeze
    // only while proportional is pegged at cap; let it run inside the linear zone.
    const satSecondsForIntegral = (periodMs / 1000) * syncTuning.saturationBeatFraction;
    if (Math.abs(videoTimeShift) < satSecondsForIntegral) {
      phaseIntegral[followDeck] = clamp(phaseIntegral[followDeck] + videoTimeShift, -(syncTuning.bendRateDelta / syncTuning.integralGain), (syncTuning.bendRateDelta / syncTuning.integralGain));
    }
    console.log('[counterDJ] syncPhase', { leadDeck, followDeck, periodMs, phaseLead, phaseFollow, rawErrorMs: errorMs, filteredErrorMs: kalmanPhase.errorMs, errorRateMsPerSec: kalmanPhase.errorRateMsPerSec, videoTimeShift, integral: phaseIntegral[followDeck] });
    // Dead zone (syncTuning.deadZoneBeatFraction): below this threshold a seek glitch is
    // audible but the phase error is not — proportional passes 0, but applyPhaseTrim still
    // runs so the integral can keep tightening. Dead zone only applies once LOCKED; while
    // acquiring, acquisitionRateDelta caps the output instead.
    const deadZoneMs = periodMs * syncTuning.deadZoneBeatFraction;
    const proportionalInput = wasPhaseSynced ? (Math.abs(kalmanPhase.errorMs) < deadZoneMs ? 0 : videoTimeShift) : videoTimeShift;
    applyPhaseTrim(followDeck, proportionalInput, periodMs);
  } catch (e) {
    setStatus(t('status.phaseSyncFailed', { reason: cleanErrorReason(e.message) }));
  }
}


// setPointerCapture so pointermove keeps firing if cursor leaves the narrow side-panel viewport.
const crossTrackEl = document.getElementById('crossTrack');
function setCrossFromEvent(e) {
  trackEngagementOnce('used_crossfader');
  document.getElementById('crossThumb').classList.remove('animated'); // no animated class on mouse drag
  const rect = crossTrackEl.getBoundingClientRect();
  // No rounding — absolute position every event, no float-drift risk; rounding caused visible
  // quantization steps without a CSS transition to smooth them.
  state.cross = clamp((e.clientX - rect.left) / rect.width, 0, 1);
  applyCrossfader();
  updateReadouts();
}
crossTrackEl.addEventListener('pointerdown', (e) => {
  crossTrackEl.setPointerCapture(e.pointerId);
  setCrossFromEvent(e);
  const onMove = (moveEvent) => setCrossFromEvent(moveEvent);
  const onUp = () => {
    crossTrackEl.releasePointerCapture(e.pointerId);
    crossTrackEl.removeEventListener('pointermove', onMove);
    crossTrackEl.removeEventListener('pointerup', onUp);
  };
  crossTrackEl.addEventListener('pointermove', onMove);
  crossTrackEl.addEventListener('pointerup', onUp);
});

const tempoTrackEl = document.getElementById('tempoTrack');
function setTempoBlendFromEvent(e) {
  trackEngagementOnce('used_tempo_manual');
  const rect = tempoTrackEl.getBoundingClientRect();
  const fraction = clamp((e.clientX - rect.left) / rect.width, 0, 1);
  applyTempoBlend(fraction);
}
tempoTrackEl.addEventListener('pointerdown', (e) => {
  tempoTrackEl.setPointerCapture(e.pointerId);
  setTempoBlendFromEvent(e);
  const onMove = (moveEvent) => setTempoBlendFromEvent(moveEvent);
  const onUp = () => {
    tempoTrackEl.releasePointerCapture(e.pointerId);
    tempoTrackEl.removeEventListener('pointermove', onMove);
    tempoTrackEl.removeEventListener('pointerup', onUp);
    syncPhase(); // once, on drag-end — not on every pointermove tick, see nudgeTempoBlend()
  };
  tempoTrackEl.addEventListener('pointermove', onMove);
  tempoTrackEl.addEventListener('pointerup', onUp);
});

// Wheel/trackpad swipe on tempo track — bound here (not #mixer) because this bar is outside it.
tempoTrackEl.addEventListener('wheel', (e) => {
  if (!state.decks.A.connected || !state.decks.B.connected) return;
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
  e.preventDefault();
  const current = state.tempoBlend == null ? 0.5 : state.tempoBlend;
  applyTempoBlend(current - e.deltaX * 0.002); // inverted, matching the crossfader's swipe direction
}, { passive: false });

// Two-stage isolator: off-neutral → snap to neutral; already at neutral → kill to MIN.
// Shared by knob double-click and key-pair hold so both do exactly the same thing.
// fx "kill" lands on that type's own min (full lowpass sweep for Filter, silence for Delay) —
// no hard-mute equivalent for Filter itself, but Delay's min=0 genuinely is "off".
const PARAM_RESET = {
  gain: { min: GAIN_MIN, reset: 1 },
};
function resetOrKill(deck, param) {
  const d = state.decks[deck];
  if (!d.tabId) return;
  const { min, reset: resetValue } = param === 'fx' ? fxRange(deck) : (PARAM_RESET[param] || { min: EQ_MIN, reset: 0 });
  d[param] = d[param] === resetValue ? min : resetValue;
  sendParam(deck, param, d[param]);
  updateReadouts();
}

// ◀/▶ FX type cycle. Optimistic UI update rolled back on failure so the panel can never show a
// switch that didn't actually happen tab-side (e.g. a stale pre-FX-type tab, see
// counterDJSetFxType's guard).
async function cycleFxType(deck, dir) {
  const d = state.decks[deck];
  if (!d.tabId) return;
  trackEngagementOnce('used_fx_type_switch');
  const currentIndex = FX_TYPE_ORDER.indexOf(d.fxType);
  const nextType = FX_TYPE_ORDER[(currentIndex + dir + FX_TYPE_ORDER.length) % FX_TYPE_ORDER.length];
  // Filter and Delay are both always live, in series — switching only changes which one the
  // knob shows. Stash the outgoing type's current value under its own name, restore the
  // incoming type's own value (not a reset) — neither effect's actual sound changes here.
  const prevType = d.fxType;
  const prevTypeValue = d.fx;
  d[`${prevType}Value`] = prevTypeValue;
  d.fxType = nextType;
  d.fx = d[`${nextType}Value`];
  updateReadouts();
  const ok = await sendFxType(deck, nextType);
  if (!ok) {
    d.fxType = prevType;
    d.fx = prevTypeValue;
    updateReadouts();
  }
}

mixerEl.addEventListener('keydown', (e) => {
  trackEngagementOnce('used_hotkeys');
  if (e.key === 'Tab') {
    e.preventDefault();
    sendTrackToOtherDeck(); // mirrors the header button — see connectBtn's click handler
    return;
  }
  const mult = e.shiftKey ? 10 : 1; // Shift = 10× speed on step-based nudges
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key in CROSS_KEYS) {
    e.preventDefault();
    nudgeCrossfader(CROSS_KEYS[key], mult);
    return;
  }
  if (key in TOGGLE_PLAY_KEYS) {
    e.preventDefault();
    togglePlay(TOGGLE_PLAY_KEYS[key]);
    return;
  }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    nudgeTempoBlend(e.key === 'ArrowUp' ? +1 : -1, mult);
    return;
  }
  const entry = KEYMAP[key];
  if (!entry) return;
  e.preventDefault();
  const [deck, param, dir] = entry;
  const d = state.decks[deck];
  if (!d.tabId) return;

  const NUDGE_RANGE = {
    gain: { min: GAIN_MIN, max: GAIN_MAX, step: GAIN_STEP, reset: 1 },
  };
  const range = param === 'fx' ? fxRange(deck) : (NUDGE_RANGE[param] || { min: EQ_MIN, max: EQ_MAX, step: EQ_STEP, reset: 0 });
  const min = range.min;
  const max = range.max;
  const step = range.step * mult;
  const resetValue = range.reset;

  const isFreshPress = !heldKeys.has(key);
  heldKeys.add(key);
  const partner = PAIR_PARTNER[key];
  if (partner && heldKeys.has(partner)) {
    const pid = pairId(key, partner);
    if (!handledPairs.has(pid)) {
      handledPairs.add(pid);
      resetOrKill(deck, param);
    }
    return;
  }

  if (partner && isFreshPress) {
    // Simultaneous key presses never land in one event — first key would nudge solo before the
    // pair fires. 40ms deferral lets the partner catch up; key-repeat falls through because
    // isFreshPress is false by then, so there's no repeated deferral.
    setTimeout(() => {
      if (!heldKeys.has(key) || heldKeys.has(partner)) return;
      d[param] = clamp(d[param] + dir * step, min, max);
      sendParam(deck, param, d[param]);
      updateReadouts();
    }, 40);
    return;
  }

  d[param] = clamp(d[param] + dir * step, min, max);
  sendParam(deck, param, d[param]);
  updateReadouts();
});

// chrome.i18n auto-matches the browser's own UI language against _locales/; falls back to
// existing HTML text if the key is missing or chrome.i18n is unavailable.
if (window.chrome && chrome.i18n) {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const msg = chrome.i18n.getMessage(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const msg = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
    if (msg) el.placeholder = msg;
  });
}

// langToggle: first click force-fetches _locales/en/messages.json and overwrites all
// [data-i18n] elements; second click re-runs chrome.i18n resolution back to native.
// Hidden if native language is already English. Choice persists in chrome.storage.local
// (key: forcedEnglish) so it survives closing/reopening the panel.
{
  const langToggleBtn = document.getElementById('langToggle');
  // .slice(0,2) guards against 3+-character subtags like "fil".
  const nativeLangCode = (window.chrome && chrome.i18n && chrome.i18n.getUILanguage)
    ? chrome.i18n.getUILanguage().split('-')[0].toUpperCase().slice(0, 2)
    : 'EN';
  if (nativeLangCode === 'EN') {
    langToggleBtn.hidden = true;
  } else {
    let forcedEnglish = false;

    async function applyNative() {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const msg = chrome.i18n.getMessage(el.dataset.i18n);
        if (msg) el.textContent = msg;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const msg = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
        if (msg) el.placeholder = msg;
      });
      forcedEnglish = false;
      langToggleBtn.textContent = 'EN';
    }

    async function applyForcedEnglish() {
      const res = await fetch(chrome.runtime.getURL('_locales/en/messages.json'));
      const messages = await res.json();
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const entry = messages[el.dataset.i18n];
        if (entry) el.textContent = entry.message;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const entry = messages[el.dataset.i18nPlaceholder];
        if (entry) el.placeholder = entry.message;
      });
      forcedEnglish = true;
      langToggleBtn.textContent = nativeLangCode;
    }

    chrome.storage.local.get(['forcedEnglish'], (data) => {
      if (data.forcedEnglish) applyForcedEnglish();
    });

    langToggleBtn.addEventListener('click', async () => {
      if (forcedEnglish) {
        await applyNative();
      } else {
        await applyForcedEnglish();
      }
      chrome.storage.local.set({ forcedEnglish });
    });
  }
}

{
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackPopover = document.getElementById('feedbackPopover');
  const feedbackCloseBtn = document.getElementById('feedbackClose');
  const feedbackTextarea = document.getElementById('feedbackTextarea');
  const feedbackStarsRow = document.getElementById('feedbackStars');
  const feedbackStars = Array.from(document.querySelectorAll('.feedbackStar'));
  const feedbackSubmitBtn = document.getElementById('feedbackSubmit');
  const feedbackStatusEl = document.getElementById('feedbackStatus');
  let rating = 0;

  function closeFeedbackPopover() {
    feedbackPopover.hidden = true;
  }

  function paintStars(upTo) {
    feedbackStars.forEach((star) => {
      star.classList.toggle('isFilled', Number(star.dataset.value) <= upTo);
    });
  }

  function updateSubmitEnabled() {
    feedbackSubmitBtn.disabled = feedbackTextarea.value.trim().length === 0 && rating === 0;
  }

  feedbackBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't let the document-level listener below close it immediately
    feedbackPopover.hidden = !feedbackPopover.hidden;
    if (!feedbackPopover.hidden) feedbackTextarea.focus();
  });
  feedbackCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeFeedbackPopover();
  });
  document.addEventListener('click', (e) => {
    if (!feedbackPopover.hidden && !feedbackPopover.contains(e.target) && e.target !== feedbackBtn) {
      closeFeedbackPopover();
    }
  });

  feedbackTextarea.addEventListener('input', updateSubmitEnabled);

  feedbackStars.forEach((star) => {
    const value = Number(star.dataset.value);
    star.addEventListener('mouseenter', () => paintStars(value));
    star.addEventListener('mouseleave', () => paintStars(rating));
    star.addEventListener('click', () => {
      rating = value;
      paintStars(rating);
      updateSubmitEnabled();
      rateAndOpenCws(value, 'feedback_form');
      feedbackStarsRow.hidden = true; // already rated once — no need to keep nagging
    });
  });

  feedbackSubmitBtn.addEventListener('click', () => {
    const text = feedbackTextarea.value.trim();
    if (!text && !rating) return;
    if (window.posthog) posthog.capture('feedback_idea', { text, rating });
    feedbackTextarea.value = '';
    rating = 0;
    paintStars(0);
    feedbackSubmitBtn.disabled = true;
    feedbackStatusEl.textContent = chrome.i18n.getMessage('feedbackSent') || 'Thanks — got it!';
    setTimeout(() => {
      closeFeedbackPopover();
      feedbackStatusEl.textContent = '';
    }, 1500);
  });
}

// DEBUG: locale previewer — remove alongside button+menu markup before shipping.
{
  const DEBUG_LOCALES = [
    ['ru', 'Русский'], ['es', 'Español'], ['pt_BR', 'Português'],
    ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano'], ['ja', '日本語'], ['ko', '한국어'],
    ['zh_CN', '简体中文'], ['zh_TW', '繁體中文'], ['ar', 'العربية'],
    ['hi', 'हिन्दी'], ['tr', 'Türkçe'], ['pl', 'Polski'], ['nl', 'Nederlands'], ['sv', 'Svenska'],
    ['id', 'Bahasa'], ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['uk', 'Українська'],
    ['cs', 'Čeština'], ['el', 'Ελληνικά'], ['iw', 'עברית'], ['ro', 'Română'],
  ].sort((a, b) => a[1].localeCompare(b[1]));

  const debugSelect = document.getElementById('debugLangPreview');
  const debugLabel = document.getElementById('debugLangPreviewLabel');
  const codeToPrefix = (code) => code.split('_')[0].toUpperCase().slice(0, 2);
  const rawUILang = (window.chrome && chrome.i18n && chrome.i18n.getUILanguage) ? chrome.i18n.getUILanguage() : 'en';
  const nativeCode = rawUILang.split('-')[0].toUpperCase().slice(0, 2);
  const normalizedNative = rawUILang.replace('-', '_');
  const nativeName = (nativeCode === 'EN') ? 'English'
    : (DEBUG_LOCALES.find(([c]) => c === normalizedNative)
      || DEBUG_LOCALES.find(([c]) => c.split('_')[0] === normalizedNative.split('_')[0])
      || [null, nativeCode])[1];

  debugSelect.querySelector('option[value=""]').textContent = nativeName;
  debugLabel.textContent = nativeCode;
  if (nativeCode !== 'EN') {
    const enOpt = document.createElement('option');
    enOpt.value = 'en';
    enOpt.textContent = 'English';
    debugSelect.appendChild(enOpt);
  }
  for (const [code, name] of DEBUG_LOCALES) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    debugSelect.appendChild(opt);
  }
  debugSelect.value = '';
  debugSelect.addEventListener('change', async () => {
    const lang = debugSelect.value;
    debugLabel.textContent = lang ? codeToPrefix(lang) : nativeCode;
    if (!lang) {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const msg = chrome.i18n.getMessage(el.dataset.i18n);
        if (msg) el.textContent = msg;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const msg = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
        if (msg) el.placeholder = msg;
      });
      return;
    }
    const res = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
    const messages = await res.json();
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const entry = messages[el.dataset.i18n];
      if (entry) el.textContent = entry.message;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const entry = messages[el.dataset.i18nPlaceholder];
      if (entry) el.placeholder = entry.message;
    });
  });
}

// All sizes use rem, so adjusting root font-size scales the entire UI uniformly.
const ZOOM_MIN = 0.75, ZOOM_MAX = 1.75, ZOOM_STEP = 0.125;
let zoom = 1.375;

function applyZoom() {
  document.documentElement.style.fontSize = `${16 * zoom}px`;
}
applyZoom();

document.getElementById('zoomIn').addEventListener('click', () => {
  trackEngagementOnce('used_zoom');
  zoom = clamp(zoom + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);
  applyZoom();
});
document.getElementById('zoomOut').addEventListener('click', () => {
  trackEngagementOnce('used_zoom');
  zoom = clamp(zoom - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX);
  applyZoom();
});

// Cue routing: one globally-selected device + per-deck toggle. Cue taps the signal post-gain
// pre-crossfader (see counterDJSetup cueDest/cueAudioEl); master output is never muted.
let selectedCueDeviceId = null;
let selectedCueDeviceLabel = null;
let outputDeviceBtn = document.getElementById('outputDeviceBtn');
const cueBtnEls = { A: document.getElementById('cueBtnA'), B: document.getElementById('cueBtnB') };

function updateCueBtnEnabled(deck) {
  cueBtnEls[deck].disabled = !state.decks[deck].connected || !selectedCueDeviceId;
}

function applyPickedCueDevice(deviceId, label) {
  selectedCueDeviceId = deviceId;
  selectedCueDeviceLabel = label || 'Selected device';
  chrome.storage.local.set({ selectedCueDeviceId, selectedCueDeviceLabel });
  for (const deck of ['A', 'B']) {
    updateCueBtnEnabled(deck);
    // An already-cued deck follows the newly picked device immediately, not just on next toggle.
    if (state.decks[deck].cued) sendCue(deck, selectedCueDeviceId, true);
  }
}

// Device selection runs in a connected deck's tab (same youtube.com origin as the permission).
// selectAudioOutput() was dropped — it hits the same origin-scoping issue as enumerateDevices.
const select = document.createElement('select');
select.className = 'outputDeviceSelect';
select.id = 'outputDeviceBtn';
outputDeviceBtn.replaceWith(select);
outputDeviceBtn = select;

function connectedTabId() {
  if (state.decks.A.connected && state.decks.A.tabId) return state.decks.A.tabId;
  if (state.decks.B.connected && state.decks.B.tabId) return state.decks.B.tabId;
  return null;
}

// `matched` = selectedCueDeviceId is present in THIS session's enumerated list. A stale id
// (deviceIds aren't stable across restarts) left no <option> selected so the browser silently
// auto-picked the first device — do not treat a truthy id as matched without confirming it.
function placeholderOption(matched) {
  return Object.assign(document.createElement('option'), {
    value: '', textContent: 'Cue source', disabled: true, selected: !matched,
  });
}

let labelsUnlockAttempted = false;
async function renderFallbackOptions() {
  const tabId = connectedTabId();
  if (!tabId) {
    select.disabled = true;
    select.replaceChildren(placeholderOption(false));
    return;
  }
  const res = await fetchOutputs(tabId);
  if (!res.ok || !res.outputs.length) {
    select.disabled = true;
    select.replaceChildren(placeholderOption(false));
    if (!res.ok) setStatus(t('status.cueDevicesFailed', { reason: res.error }));
    return;
  }
  select.disabled = false;
  const matched = res.outputs.some((d) => d.deviceId === selectedCueDeviceId);
  if (selectedCueDeviceId && !matched) { // clear stale id that didn't survive restart
    selectedCueDeviceId = null;
    selectedCueDeviceLabel = null;
    chrome.storage.local.remove(['selectedCueDeviceId', 'selectedCueDeviceLabel']);
    for (const deck of ['A', 'B']) updateCueBtnEnabled(deck);
  }
  select.replaceChildren(placeholderOption(matched), ...res.outputs.map((d) => Object.assign(document.createElement('option'), {
    value: d.deviceId,
    textContent: d.label,
    selected: d.deviceId === selectedCueDeviceId,
  })));
}
refreshCueDeviceOptions = renderFallbackOptions;

// Bring the deck's tab forward before the permission prompt — it renders on that tab, not
// the side panel, so if it's backgrounded the user misses it. Skip if already granted.
select.addEventListener('mousedown', async () => {
  if (labelsUnlockAttempted) return;
  const tabId = connectedTabId();
  if (!tabId) return;
  labelsUnlockAttempted = true;
  const permissionState = await checkMicPermission(tabId);
  if (permissionState !== 'granted') {
    try {
      await chrome.tabs.update(tabId, { active: true });
    } catch (e) { /* tab may already be gone — sendUnlockMic below fails loudly if so */ }
  }
  const res = await sendUnlockMic(tabId);
  if (!res.ok) {
    setStatus(t('status.micPermissionNeeded', { reason: res.error }));
    labelsUnlockAttempted = false; // let a retry re-trigger the prompt after a real failure
  }
  await renderFallbackOptions();
});
select.addEventListener('change', () => {
  const opt = select.options[select.selectedIndex];
  applyPickedCueDevice(select.value, opt ? opt.textContent : null);
});
renderFallbackOptions();

for (const deck of ['A', 'B']) {
  cueBtnEls[deck].addEventListener('click', async () => {
    const nowCued = !state.decks[deck].cued;
    const ok = await sendCue(deck, selectedCueDeviceId, nowCued);
    if (!ok) return;
    state.decks[deck].cued = nowCued;
    cueBtnEls[deck].classList.toggle('active', nowCued);
    addBreadcrumb(`button_click: cue_${nowCued ? 'on' : 'off'} ${deck}`);
    if (window.posthog) posthog.capture('button_click', { button: 'cue', deck, state: nowCued ? 'on' : 'off' });
  });
}

// deviceId may not survive restarts (Chrome privacy-scopes per session); persist anyway — stale
// ids fail loudly through sendCue rather than silently. renderFallbackOptions re-validates.
chrome.storage.local.get(['selectedCueDeviceId', 'selectedCueDeviceLabel'], (data) => {
  selectedCueDeviceId = data.selectedCueDeviceId || null;
  selectedCueDeviceLabel = data.selectedCueDeviceLabel || null;
  for (const deck of ['A', 'B']) updateCueBtnEnabled(deck);
});

// setPointerCapture keeps drag tracking when cursor strays outside the narrow side-panel viewport.
const PX_PER_DB = 3;
const PX_PER_GAIN = 90; // gain's whole range (0..1.5) is much narrower than EQ's (-40..6dB)
const PX_PER_FX = 135; // FX_MIN..FX_MAX (-1..1) is narrower still — full knob throw in a short drag
// Center detent for HI/MID/LOW (not gain/fx): snaps to 0 when dragging through neutral.
// Width is an ANGLE (DETENT_DEG), not a flat dB value — EQ_MIN/EQ_MAX are asymmetric (-40..+6),
// so a flat ±1dB width translated to ~7x more angular catch on the boost side than the cut side.
// Deriving both sides from one angle keeps them symmetric by construction.
const DETENT_DEG = 18; // narrowed from 25 — felt too sticky/grabby around center (2026-08-07, direct request)
function applyDetent(value, min, max) {
  const pos = (DETENT_DEG / 135) * max;
  const neg = (DETENT_DEG / 135) * Math.abs(min);
  return value >= 0
    ? (value < pos ? 0 : value)
    : (value > -neg ? 0 : value);
}
const KNOB_BANDS = [
  { band: 'high', px: PX_PER_DB, min: EQ_MIN, max: EQ_MAX, detent: true },
  { band: 'mid', px: PX_PER_DB, min: EQ_MIN, max: EQ_MAX, detent: true },
  { band: 'low', px: PX_PER_DB, min: EQ_MIN, max: EQ_MAX, detent: true },
  { band: 'gain', px: PX_PER_GAIN, min: GAIN_MIN, max: GAIN_MAX, detent: false },
  { band: 'fx', px: PX_PER_FX, min: FX_MIN, max: FX_MAX, detent: false }, // no detent — sweeps through bypass
];
const BAND_ENGAGEMENT_FLAG = { high: 'used_eq', mid: 'used_eq', low: 'used_eq', gain: 'used_gain', fx: 'used_fx_filter' };
for (const deck of ['A', 'B']) {
  for (const { band, px, min, max, detent } of KNOB_BANDS) {
    const knob = document.getElementById(`knob${deck}_${band}`);
    // wheelAxis: gesture-level axis lock — per-event axis check leaks stray deltaX ticks from
    // finger wobble to the crossfader mid-swipe. 200ms timer resets between gestures.
    let wheelAxis = null;
    let wheelAxisTimer = null;
    // wheelRawValue: undetented accumulator for the wheel gesture. Without it, each tiny trackpad
    // tick recomputes from the already-snapped displayed value and re-snaps to 0 before it can
    // accumulate past the detent. Mouse-drag avoids this because startValue is captured once per
    // gesture; wheel needs the same fixed reference point.
    let wheelRawValue = null;
    knob.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!state.decks[deck].tabId) return;
      trackEngagementOnce(BAND_ENGAGEMENT_FLAG[band]);
      knob.setPointerCapture(e.pointerId);
      const startY = e.clientY;
      const startValue = state.decks[deck][band];
      // fx's range depends on which type is currently active on this deck — resolve fresh at
      // drag start rather than using the static min/max this band's KNOB_BANDS entry captured
      // (those are Filter's, and would clamp/misinterpret a Delay density drag).
      const dragRange = band === 'fx' ? fxRange(deck) : { min, max };
      const onMove = (moveEvent) => {
        const delta = (startY - moveEvent.clientY) / px;
        const raw = clamp(startValue + delta, dragRange.min, dragRange.max);
        state.decks[deck][band] = detent ? applyDetent(raw, dragRange.min, dragRange.max) : raw;
        sendParam(deck, band, state.decks[deck][band]);
        updateReadouts();
      };
      const onUp = () => {
        knob.releasePointerCapture(e.pointerId);
        knob.removeEventListener('pointermove', onMove);
        knob.removeEventListener('pointerup', onUp);
      };
      knob.addEventListener('pointermove', onMove);
      knob.addEventListener('pointerup', onUp);
    });
    knob.addEventListener('dblclick', () => resetOrKill(deck, band));
        knob.addEventListener('wheel', (e) => {
      if (!state.decks[deck].tabId) return;
      // 200ms timer resets axis lock and raw accumulator between gestures.
      clearTimeout(wheelAxisTimer);
      wheelAxisTimer = setTimeout(() => { wheelAxis = null; wheelRawValue = null; }, 200);
      const dragRange = band === 'fx' ? fxRange(deck) : { min, max };
      if (wheelAxis == null) {
        wheelAxis = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? 'y' : 'x';
        wheelRawValue = state.decks[deck][band]; // seed from displayed value once per gesture
      }
      // Horizontal gesture over a knob → let it bubble to #mixer's crossfader listener.
      if (wheelAxis === 'x') return;
      trackEngagementOnce(BAND_ENGAGEMENT_FLAG[band]);
      e.preventDefault();
      e.stopPropagation(); // prevent #mixer's crossfader wheel listener from also firing
      wheelRawValue = clamp(wheelRawValue + e.deltaY / px, dragRange.min, dragRange.max);
      state.decks[deck][band] = detent ? applyDetent(wheelRawValue, dragRange.min, dragRange.max) : wheelRawValue;
      sendParam(deck, band, state.decks[deck][band]);
      updateReadouts();
    }, { passive: false });
  }
}

document.querySelectorAll('.knob').forEach(DeckRender.buildKnobArc);

for (const deck of ['A', 'B']) {
  const track = document.getElementById(`levelTrack${deck}`);
  for (let i = 0; i < LEVEL_METER_SEGMENTS; i++) {
    const cell = document.createElement('div');
    cell.className = 'levelCell';
    track.appendChild(cell);
  }
}

refreshTabs();
updateReadouts();
updateDeckConnectedVisual('A');
updateDeckConnectedVisual('B');
updateTempoStatus();
updateConnectEnabled();
