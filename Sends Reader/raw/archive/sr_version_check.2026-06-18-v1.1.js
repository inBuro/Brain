// Fadercraft Sends Reader — version ping for Node for Max.
// Fetches the live manifest, compares `latest` to this device's version,
// and emits tagged messages on outlet 0:
//   "dot 1" / "dot 0"  -> update available / up to date (drives the "New Version" button)
//   "url <link>"       -> the click-through URL from the manifest (server-controlled)
// The patch seeds a hardcoded fallback URL via loadmess, so the button always
// works even before the first successful ping; "url ..." overrides it when it arrives.
// Edit DEVICE_VERSION on release to match the device's own build.
const maxApi = require('max-api');
const https  = require('https');

const DEVICE_VERSION = '1.1';                                   // this build's version
const URL            = 'https://fadercraft.com/api/sends-reader.json';
const RECHECK_MS     = 30 * 60 * 1000;                        // re-ping every 30 min

function cmp(a, b) {                                          // >0 if a newer than b
  const pa = String(a).split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map(n => parseInt(n, 10) || 0);
  const L = Math.max(pa.length, pb.length);
  for (let i = 0; i < L; i++) { const x = pa[i] || 0, y = pb[i] || 0; if (x !== y) return x - y; }
  return 0;
}

function fetchManifest(url, redirects) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && (redirects || 0) < 3) {
        res.resume(); return resolve(fetchManifest(res.headers.location, (redirects || 0) + 1));
      }
      let d = '';
      res.on('data', (c) => { d += c; if (d.length > 65536) req.destroy(); });
      res.on('end', () => {
        try { const j = JSON.parse(d); const v = j.latest != null ? j.latest : j.version;
          const u = (typeof j.url === 'string' && j.url.trim()) ? j.url.trim() : null;
          if (v != null) resolve({ ok: true, latest: String(v), url: u }); else resolve({ ok: false, reason: 'no version field' });
        } catch (e) { resolve({ ok: false, reason: 'not JSON' }); }
      });
    });
    req.on('error', (e) => resolve({ ok: false, reason: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, reason: 'timeout' }); });
  });
}

async function check() {
  const m = await fetchManifest(URL, 0);
  let dot = 0;
  if (m.ok && cmp(m.latest, DEVICE_VERSION) > 0) dot = 1;
  if (m.ok && m.url) maxApi.outlet('url', m.url);             // server-controlled click-through (overrides patch fallback)
  maxApi.outlet('dot', dot);                                  // 1 = update available, 0 = up to date / unknown
  maxApi.post(`version check: device=${DEVICE_VERSION} latest=${m.ok ? m.latest : '?'} (${m.ok ? 'ok' : m.reason}) url=${m.ok && m.url ? m.url : '-'} -> dot ${dot}`);
}

maxApi.addHandler('check', check);
maxApi.addHandler('bang',  check);
check();                                                      // run once on load
setInterval(check, RECHECK_MS);                               // and periodically
