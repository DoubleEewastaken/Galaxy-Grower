import { Game } from './game.js';
import { UI } from './ui.js';
import { Events } from './events.js';
import { Particles } from './particles.js';
import { AudioManager } from './audio.js';

document.addEventListener('DOMContentLoaded',()=>{

  const canvas=document.getElementById('gameCanvas');
  Game.canvas=canvas;
  Game.ctx=canvas.getContext('2d');
  canvas.width=window.innerWidth-300;
  canvas.height=window.innerHeight;
  Game.width=canvas.width;
  Game.height=canvas.height;
  Game.gun.x=canvas.width/2;
  Game.gun.y=canvas.height/2;

  // Mouse
  canvas.addEventListener('mousemove',e=>{
    Game.mouse.x=e.offsetX;
    Game.mouse.y=e.offsetY;
  });
  canvas.addEventListener('click',()=>{
    // Check if target clicked
    Game.targets.forEach(t=>{
      const dx=t.x-Game.mouse.x;
      const dy=t.y-Game.mouse.y;
      if(Math.hypot(dx,dy)<t.radius){
        Game.state.stardust+=Game.state.clickValue*Game.state.rebirthMultiplier;
        Particles.spawn(t.x,t.y,20,Game.gun.color);
        AudioManager.play('click');
        t.hit=true;
      }
    });
  });

  // Initialize UI
  UI.updateStardust();
  UI.renderProducers();
  UI.renderUpgrades();
  UI.updateRebirthMenu();

  // Buttons
  document.getElementById('openSettingsBtn').addEventListener('click',()=>document.getElementById('settings').style.display='flex');
  document.getElementById('closeSettingsBtn').addEventListener('click',()=>document.getElementById('settings').style.display='none');
  document.getElementById('resetBtn').addEventListener('click',()=>import('./settings.js').then(m=>m.Settings.resetGame()));
  document.getElementById('openRebirthBtn').addEventListener('click',()=>{ UI.updateRebirthMenu(); document.getElementById('rebirthModal').style.display='flex'; });
  document.getElementById('closeRebirthBtn').addEventListener('click',()=>document.getElementById('rebirthModal').style.display='none');
  document.getElementById('confirmRebirthBtn').addEventListener('click',()=>import('./rebirth.js').then(m=>m.Rebirth.confirmRebirth()));

  // Targets
  function spawnTarget(){
    Game.targets.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, radius:30, hit:false});
  }
  setInterval(spawnTarget,2000);

  // Game loop
  function loop(){
    Game.ctx.clearRect(0,0,Game.width,Game.height);

    // Draw gun
    const dx=Game.mouse.x-Game.gun.x;
    const dy=Game.mouse.y-Game.gun.y;
    Game.gun.angle=Math.atan2(dy,dx);
    Game.ctx.save();
    Game.ctx.translate(Game.gun.x,Game.gun.y);
    Game.ctx.rotate(Game.gun.angle);
    Game.ctx.fillStyle=Game.gun.color;
    Game.ctx.fillRect(0,-5,40,10);
    Game.ctx.restore();

    // Draw targets
    Game.targets=Game.targets.filter(t=>!t.hit);
    Game.targets.forEach(t=>{
      Game.ctx.beginPath();
      Game.ctx.arc(t.x,t.y,t.radius,0,Math.PI*2);
      Game.ctx.fillStyle='red';
      Game.ctx.fill();
    });

    requestAnimationFrame(loop);
  }
  loop();

  // DPS loop
  setInterval(()=>{
    const dps=Game.state.producers.reduce((sum,p)=>sum+p.baseDPS*p.count,0);
    Game.state.stardust+=dps*Game.state.rebirthMultiplier/2;
    UI.updateStardust();
  },500);

  // Auto-save
  setInterval(()=>localStorage.setItem('cosmicAimClicker',JSON.stringify(Game.state)),30000);

});
