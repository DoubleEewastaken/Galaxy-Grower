// main entry
import { UI } from './ui.js';
document.addEventListener('DOMContentLoaded', ()=>{
  const ui = new UI();
  // ensure settings pane built and controls wired
  // build settings UI again to get live references
  setTimeout(()=>{ import('./settings.js').then(m=>m.buildSettingsUI(ui)); }, 300);
});
