import Plausible from 'plausible-tracker';

let api = null;

export function initAnalytics({ domain, apiHost, isPackaged, isWeb }) {
  if (localStorage.getItem('analytics-opt-out') === '1') return;
  if (!isWeb && !isPackaged) return;
  if (!domain) {
    console.info('[analytics] PLAUSIBLE_DOMAIN not set — telemetry disabled');
    return;
  }
  api = Plausible({ domain, apiHost, trackLocalhost: false });
  api.enableAutoPageviews();
}

export function track(eventName, props) {
  if (!api) return;
  try { api.trackEvent(eventName, { props }); } catch {}
}

export function sizeBucket(bytes) {
  return bytes < 50_000 ? 'S' : bytes < 1_000_000 ? 'M' : 'L';
}

export function stackSig(err) {
  return (err?.name || 'Error') + ':' + (err?.message || String(err)).slice(0, 80);
}
