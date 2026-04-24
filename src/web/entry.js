// Web build entry. Install the browser platform adapter (which sets
// window.formatpad) before the renderer module runs its top-level code.
import * as SentryBrowser from '@sentry/browser';
import './platform-adapter.js';
import '../renderer/renderer.js';

// Sentry for web builds — @sentry/browser is lighter than @sentry/electron.
// This runs after the renderer module body so all error surfaces are live.
// Opt-out: set localStorage["sentry-opt-out"] = "1" to disable.
// TODO: wire SENTRY_DSN via build-time define once the project's Sentry org is set up.
if (!localStorage.getItem('sentry-opt-out')) {
  SentryBrowser.init({
    dsn: undefined,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      delete event.user;
      if (event.breadcrumbs?.values) {
        for (const bc of event.breadcrumbs.values) {
          if (typeof bc.message === 'string') {
            bc.message = bc.message.replace(/[^/\\]+\.(?:env|key|pem)\b/gi, '<redacted>');
          }
        }
      }
      return event;
    },
  });
}
