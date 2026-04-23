// Web build entry. Install the browser platform adapter (which sets
// window.formatpad) before the renderer module runs its top-level code.
import './platform-adapter.js';
import '../renderer/renderer.js';
