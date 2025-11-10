// settings.js - builds settings modal content and binds toggle
export function buildSettingsUI(ui) {
  const root = document.getElementById('settingsPane');
  root.innerHTML = `<h2>Settings</h2>
    <div class="row"><div>Sound Effects</div><div><input type="checkbox" id="chkSound"></div></div>
    <div class="row"><div>Starfield Background</div><div><input type="checkbox" id="chkStarfield"></div></div>
    <div class="row"><div>Auto-save (30s)</div><div>Enabled</div></div>
    <div class="row"><button id="closeSettingsBtn">Close</button><button id="hardResetBtn" class="danger">Reset Save</button></div>
  `;
  const chkSound = root.querySelector('#chkSound');
  const chkStar = root.querySelector('#chkStarfield');
  chkSound.checked = ui.audio.enabled;
  chkStar.checked = true;
  chkSound.addEventListener('change', (e)=> { ui.audio.toggle(e.target.checked); ui.showPop('Sound: ' + (e.target.checked ? 'On' : 'Off'), document.getElementById('settingsOpenBtn')); });
  chkStar.addEventListener('change', (e)=> { document.getElementById('starfield').style.display = e.target.checked ? 'block' : 'none'; });
  root.querySelector('#closeSettingsBtn').addEventListener('click', ()=>{ document.getElementById('settingsModal').classList.add('hidden'); });
  root.querySelector('#hardResetBtn').addEventListener('click', ()=>{ if(!confirm('Clear save?')) return; localStorage.removeItem(ui.game.saveKey); location.reload(); });
}
