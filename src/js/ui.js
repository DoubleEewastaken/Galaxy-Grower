// ui.js - main UI glue
import { Game } from './game.js';
import { FloatingEvent } from './events.js';
import { ParticleSystem } from './particles.js';
import { AudioManager } from './audio.js';
import { RebirthSystem } from './rebirth.js';
import { buildSettingsUI } from './settings.js';

export class UI {
  constructor() {
    this.game = new Game();
    this.audio = new AudioManager();
    this.particleCanvas = document.getElementById('particle-canvas');
    this.particles = new ParticleSystem(this.particleCanvas);
    this.eventRoot = document.getElementById('floating-events');
    this.bigBtn = document.getElementById('big-button');
    this.upgradesEl = document.getElementById('upgrades');
    this.clickUpgradesEl = document.getElementById('click-upgrades');
    this.stardustEl = document.getElementById('stardust');
    this.dpsEl = document.getElementById('dps');
    this.clickValueEl = document.getElementById('clickValue');
    this.adBtn = document.getElementById('adBtn');
    this.rebirthOpenBtn = document.getElementById('rebirthOpenBtn');
    this.settingsOpenBtn = document.getElementById('settingsOpenBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.rebirthModal = document.getElementById('rebirthModal');
    this.rebirthPane = document.getElementById('rebirthPane');
    this.settingsPane = document.getElementById('settingsPane');

    this.saveInterval = null;
    this.eventSpawner = null;
    this.rebirthSystem = new RebirthSystem(this.game);
    this.init();
  }

  init() {
    this.game.load();
    buildSettingsUI(this);
    this.buildShop();
    this.buildClickUpgrades();
    this.bindEvents();
    this.startLoop();
    this.startAutosave();
    this.startEventSpawner();
    // set default audio on
    this.audio.toggle(true);
  }

  buildShop() {
    this.upgradesEl.innerHTML = '';
    this.game.producers.forEach(p => {
      const el = this.createProducerEl(p);
      this.upgradesEl.appendChild(el);
    });
    this.rebuildShop();
  }

  createProducerEl(p) {
    const container = document.createElement('div'); container.className = 'upgrade';
    const left = document.createElement('div'); left.className='left';
    const icon = document.createElement('div'); icon.className='icon'; icon.textContent = p.icon;
    const info = document.createElement('div'); info.innerHTML = `<div class="name">${p.name}</div><div class="cost" id="owned-${p.id}">Owned: ${p.count}</div>`;
    left.appendChild(icon); left.appendChild(info);
    const right = document.createElement('div');
    right.innerHTML = `<div style="text-align:right;font-size:13px">+${(p.dpsPerItem()).toFixed(2)} DPS each</div>`;
    const buyBtn = document.createElement('button'); buyBtn.id = `buy-${p.id}`;
    buyBtn.textContent = `Buy (${p.cost()})`;
    buyBtn.onclick = () => {
      const ok = this.game.buyProducer(p.id);
      if (ok) {
        this.rebuildShop(); this.game.save(); this.particles.spawnBurst(window.innerWidth/2, window.innerHeight/2, '#9ff', 20);
        this.audio.playPurchase();
      } else this.shake(buyBtn);
    };
    right.appendChild(buyBtn);
    container.appendChild(left); container.appendChild(right);
    return container;
  }

  buildClickUpgrades(){
    // show click upgrade as similar style
    this.clickUpgradesEl.innerHTML = '';
    const container = document.createElement('div'); container.className='upgrade';
    container.innerHTML = `<div class="left"><div class="icon">✦</div><div><div class="name">Click Amplifier</div><div class="cost" id="clickOwned">Owned: ${this.game.state.clickUpgrades||0}</div></div></div>`;
    const right = document.createElement('div');
    const btn = document.createElement('button'); btn.id='buyClickBtn';
    btn.textContent = `Buy (${this.buyClickCost()})`;
    btn.onclick = () => {
      const ok = this.game.buyClickUpgrade();
      if (ok) {
        this.rebuildClickUpgrades(); this.game.save(); this.audio.playPurchase(); this.particles.spawnBurst(window.innerWidth/2, window.innerHeight/2, '#ffd27a', 26);
      } else this.shake(btn);
    };
    right.appendChild(btn);
    container.appendChild(right);
    this.clickUpgradesEl.appendChild(container);
  }

  rebuildClickUpgrades(){
    const ownedEl = document.getElementById('clickOwned');
    if (ownedEl) ownedEl.textContent = `Owned: ${this.game.state.clickUpgrades||0}`;
    const btn = document.getElementById('buyClickBtn');
    if (btn) btn.textContent = `Buy (${this.buyClickCost()})`;
  }

  buyClickCost(){ return Math.floor(50 * Math.pow(2, (this.game.state.clickUpgrades || 0))); }
  buyClickCost = this.buyClickCost;

  rebuildShop() {
    this.game.producers.forEach(p => {
      const ownedEl = document.getElementById(`owned-${p.id}`);
      if (ownedEl) ownedEl.textContent = `Owned: ${p.count}`;
      const btn = document.getElementById(`buy-${p.id}`);
      if (btn) btn.textContent = `Buy (${p.cost()})`;
      const el = btn?.closest('.upgrade');
      if (el) {
        el.style.display = (this.shouldUnlock(p) ? '' : 'none');
      }
    });
    this.rebuildClickUpgrades();
  }

  shouldUnlock(p) {
    if (!p.unlockAt) return true;
    return (this.game.state.totalStardust || 0) >= p.unlockAt * 0.5;
  }

  bindEvents() {
    this.bigBtn.addEventListener('click', (e) => {
      const gain = this.game.clickCore();
      this.showPop('+' + Math.floor(gain), this.bigBtn);
      this.audio.playClick();
      const rect = this.bigBtn.getBoundingClientRect();
      // particles spawn at button center
      this.particles.spawnBurst(rect.left + rect.width/2, rect.top + rect.height/2, '#9ff', 16);
      this.rebuildTop();
      this.game.save();
    });

    this.adBtn.addEventListener('click', async () => {
      this.adBtn.disabled = true; this.adBtn.textContent = 'Watching...';
      await new Promise(r => setTimeout(r, 5000));
      const reward = this.game.watchAd();
      this.showPop('+' + this.formatNumber(reward), this.adBtn, '#ffd27a');
      this.game.save();
      this.rebuildTop();
      setTimeout(()=>{ this.adBtn.disabled=false; this.adBtn.textContent='📺 Watch Ad (5%)'; }, 600);
    });

    this.saveBtn.addEventListener('click', ()=>{ this.game.save(); this.showPop('Saved', this.saveBtn); });
    this.resetBtn.addEventListener('click', ()=>{ if(confirm('Reset progress?')) { localStorage.removeItem(this.game.saveKey); location.reload(); } });

    this.settingsOpenBtn.addEventListener('click', ()=>{ document.getElementById('settingsModal').classList.remove('hidden'); });
    this.rebirthOpenBtn.addEventListener('click', ()=>{ document.getElementById('rebirthModal').classList.remove('hidden'); this.buildRebirthPane(); });

    // keyboard: space = click
    window.addEventListener('keydown', (e)=>{ if (e.code === 'Space') { e.preventDefault(); this.bigBtn.click(); } });

    // hide modals on background click
    document.getElementById('settingsModal').addEventListener('click', (ev)=>{ if (ev.target.id === 'settingsModal') document.getElementById('settingsModal').classList.add('hidden');});
    document.getElementById('rebirthModal').addEventListener('click', (ev)=>{ if (ev.target.id === 'rebirthModal') document.getElementById('rebirthModal').classList.add('hidden');});
  }

  rebuildTop(){
    this.stardustEl.textContent = this.formatNumber(this.game.state.stardust);
    this.dpsEl.textContent = this.game.computeDPS().toFixed(2);
    this.clickValueEl.textContent = this.formatNumber(this.game.state.clickValue);
    this.rebuildShop();
  }

  startLoop(){
    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      this.game.tick(dt);
      this.rebuildTop();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  startAutosave(){
    this.saveInterval = setInterval(()=>{ this.game.save(); this.showPop('Auto-saved', document.getElementById('saveBtn') || document.body); }, 30000);
  }

  startEventSpawner(){
    const spawnOne = ()=>{
      const ev = new FloatingEvent(this.eventRoot, ()=>{
        const reward = Math.max(1, Math.floor(this.game.computeDPS() * 5));
        this.game.state.stardust += reward; this.game.state.totalStardust += reward;
        this.showPop('+'+this.formatNumber(reward), this.eventRoot, '#ffd27a');
        this.audio.playEvent();
        this.particles.spawnBurst(window.innerWidth/2, 120, '#ffd27a', 20);
      });
    };
    const schedule = ()=>{
      const next = Math.random()*20 + 20;
      setTimeout(()=>{ spawnOne(); schedule(); }, next*1000);
    };
    setTimeout(schedule, Math.random()*8000 + 2000);
  }

  buildRebirthPane(){
    this.rebirthPane.innerHTML = '';
    const h = document.createElement('h2'); h.textContent = 'Rebirth';
    const info = document.createElement('div'); info.textContent = `Total Stardust: ${this.formatNumber(this.game.state.totalStardust)} • Rebirths: ${this.game.state.rebirths||0}`;
    const can = this.rebirthSystem.canRebirth();
    const btn = document.createElement('button'); btn.textContent = 'Perform Rebirth';
    btn.onclick = ()=> {
      if (!confirm('Do you want to rebirth? This resets progress but gives Cosmic Essence (perk points).')) return;
      const gain = this.rebirthSystem.rebirth();
      if (gain) {
        this.showPop('+'+gain+' Essence', btn, '#9ff79b');
        this.game.save(); this.rebuildTop(); this.buildRebirthPane();
      } else alert('Not eligible yet.');
    };
    const perksDiv = document.createElement('div'); perksDiv.style.marginTop='10px';
    const rs = this.rebirthSystem;
    perksDiv.innerHTML = `<div>Perk Points: ${this.game.state.rebirthPoints || 0}</div>`;
    rs.perks.forEach(p=>{
      const b = document.createElement('button'); b.textContent = `${p.name} (cost ${p.cost})`;
      b.onclick = ()=>{ const ok = rs.buyPerk(p.id); if (ok) { this.game.save(); this.showPop('Perk bought', b, '#9ff79b'); this.rebuildTop(); this.buildRebirthPane(); } else this.shake(b); };
      perksDiv.appendChild(b);
    });
    this.rebirthPane.appendChild(h); this.rebirthPane.appendChild(info); this.rebirthPane.appendChild(btn); this.rebirthPane.appendChild(perksDiv);
    // close control
    const close = document.createElement('div'); close.style.marginTop='10px'; const cbtn = document.createElement('button'); cbtn.textContent='Close'; cbtn.onclick = ()=>{ document.getElementById('rebirthModal').classList.add('hidden'); }; close.appendChild(cbtn); this.rebirthPane.appendChild(close);
  }

  showPop(text, anchorEl=document.body, color='#9ff') {
    const t = document.createElement('div');
    t.textContent = text;
    Object.assign(t.style, { position:'absolute', left:0, top:0, transform:'translate(-50%,-50%)', color, fontWeight:700, zIndex:9999, textShadow:'0 3px 10px rgba(0,0,0,0.6)' });
    document.body.appendChild(t);
    const rect = anchorEl.getBoundingClientRect();
    t.style.left = (rect.left + rect.width/2) + 'px';
    t.style.top = (rect.top + rect.height/2) + 'px';
    let y = 0;
    const id = setInterval(()=>{ y -= 2; t.style.transform = `translate(-50%,-50%) translateY(${y}px)`; }, 16);
    setTimeout(()=>{ clearInterval(id); t.remove(); }, 900);
  }

  formatNumber(n) {
    if (n >= 1e12) return (n/1e12).toFixed(2)+'T';
    if (n >= 1e9) return (n/1e9).toFixed(2)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(2)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(2)+'K';
    return Math.floor(n);
  }

  shake(el) {
    el.animate([{ transform:'translateX(0)' }, { transform:'translateX(-6px)' }, { transform:'translateX(6px)' }, { transform:'translateX(0)' }], { duration: 260 });
  }
}
