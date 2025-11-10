import { Game } from './game.js';
import { UI } from './ui.js';
import { Events } from './events.js';
import { Particles } from './particles.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

  Game.load();

  UI.updateStardust();
  UI.renderProducers();
  UI.renderUpgrades();

  // Main click
  document.getElementById('clickButton').addEventListener('click', ()=>Events.clickMain());

  // Settings buttons
  document.getElementById('openSettingsBtn').addEventListener('click', ()=>UI.openSettings());
  document.getElementById('closeSettingsBtn').addEventListener('click', ()=>UI.closeSettings());
  document.getElementById('resetBtn').addEventListener('click', ()=>import('./settings.js').then(m=>m.Settings.resetGame()));

  // Rebirth buttons
  document.getElementById('openRebirthBtn').addEventListener('click', ()=>UI.openRebirth());
  document.getElementById('closeRebirthBtn').addEventListener('click', ()=>UI.closeRebirth());
  document.getElementById('confirmRebirthBtn').addEventListener('click', ()=>import('./rebirth.js').then(m=>m.Rebirth.confirmRebirth()));

  // DPS Loop
  setInterval(()=>{
    let dps = Game.state.producers.reduce((sum,p)=>sum+p.baseDPS*p.count,0);
    Game.state.stardust += dps * Game.state.rebirthMultiplier / 2; // 0.5 sec
    UI.updateStardust();
  },500);

  // Floating Events
  function spawnFloatingEvent(){
    const emojis = ["🚀","🌠","☄️","🪐","🌌","💫"];
    const emoji = emojis[Math.floor(Math.random()*emojis.length)];
    const div = document.createElement('div');
    div.className='floatingEvent';
    div.style.left=Math.random()*window.innerWidth+'px';
    div.style.top=Math.random()*window.innerHeight*0.7+'px';
    div.textContent = emoji;
    document.body.appendChild(div);
    div.addEventListener('click', ()=>{
      Game.state.stardust += 5*Game.state.producers.reduce((sum,p)=>sum+p.baseDPS*p.count,0)*Game.state.rebirthMultiplier;
      import('./audio.js').then(m=>m.AudioManager.play('event'));
      Particles.spawn(div,10,'yellow');
      div.remove();
    });
    setTimeout(()=>{ if(div.parentNode) div.remove(); },5000);
  }
  setInterval(spawnFloatingEvent,10000);

  // Auto-save
  setInterval(()=>Game.save(),30000);

});
