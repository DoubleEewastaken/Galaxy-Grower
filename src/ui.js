// ui.js - DOM wiring, shop rendering, events, autosave, settings
import { Game } from './game.js';
import { Producer } from './producers.js';

export class UI {
  constructor() {
    this.game = new Game(document.body);
    this.bigBtn = document.getElementById('big-button');
    this.upgradesEl = document.getElementById('upgrades');
    this.stardustEl = document.getElementById('stardust');
    this.dpsEl = document.getElementById('dps');
    this.clickValueEl = document.getElementById('clickValue');
    this.clickCostEl = document.getElementById('clickCost');
    this.buyClickBtn = document.getElementById('buyClickUpgrade');
    this.adBtn = document.getElementById('adBtn');
    this.rebirthBtn = document.getElementById('rebirthBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.rebirthPanel = document.getElementById('rebirthPanel');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettings = document.getElementById('closeSettings');
    this.hardReset = document.getElementById('hardReset');
    this.toggleStarfield = document.getElementById('toggleStarfield');
    this.init();
  }

  init() {
    // load saved state
    this.game.load();
    this.buildShop();
    this.bindEvents();
    this.startLoop();
    this.startAutosave();
    // listen for floating rewards to show popup
    document.addEventListener('floatingReward', e => {
      const r = e.detail.reward;
      this.showPop(`+${r} ✦`, document.getElementById('floating-events'));
    });
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
    const container = document.createElement('div');
    container.className = 'upgrade';
    const left = document.createElement('div'); left.className='left';
    const icon = document.createElement('div'); icon.className='icon'; icon.textContent = p.icon;
    const info = document.createElement('div'); info.innerHTML = `<div class="name">${p.name}</div><div class="cost" id="owned-${p.id}">Owned: ${p.count}</div>`;
    left.appendChild(icon); left.appendChild(info);
    const right = document.createElement('div');
    right.innerHTML = `<div style="text-align:right;font-size:13px">+${(p.dpsPerItem()).toFixed(2)} DPS each</div>`;
    const buyBtn = document.createElement('button');
    buyBtn.id = `buy-${p.id}`;
    buyBtn.textContent = `Buy (${p.cost()})`;
    buyBtn.onclick = () => {
      const ok = this.game.buyProducer(p.id);
      if (ok) {
        this.rebuildShop();
        this.game.save();
        this.popAndPulse(`#buy-${p.id}`, `+${p.baseDPS}`);
      } else {
        this.shake(buyBtn);
      }
    };
    right.appendChild(buyBtn);
    container.appendChild(left);
    container.appendChild(right);
    return container;
  }

  rebuildShop() {
    this.game.producers.forEach(p => {
      const ownedEl = document.getElementById(`owned-${p.id}`);
      if (ownedEl) ownedEl.textContent = `Owned: ${p.count}`;
      const btn = document.getElementById(`buy-${p.id}`);
      if (btn) btn.textContent = `Buy (${p.cost()})`;
      // hide until unlocked
      const el = btn?.closest('.upgrade');
      if (el) {
        if (this.shouldUnlock(p)) el.style.display = '';
        else el.style.display = 'none';
      }
    });
    // click upgrade cost
    const base = 50;
    const owned = this.game.state.clickUpgrades || 0;
    const cost = Math.floor(base * Math.pow(2, owned));
    if (this.clickCostEl) this.clickCostEl.textContent = cost;
  }

  shouldUnlock(p) {
    if (!p.unlockAt) return true;
    return this.game.state.totalStardust >= p.unlockAt * 0.5;
  }

  bindEvents() {
    this.bigBtn.addEventListener('click', (e) => {
      const gain = this.game.clickCore();
      this.showPop('+' + Math.floor(gain), this.bigBtn);
      this.rebuildTop();
    });

    this.buyClickBtn.addEventListener('click', () => {
      const ok = this.game.buyClickUpgrade();
      if (ok) {
        // FIX: immediately update UI cost and clickValue
        this.rebuildShop();
        this.rebuildTop();
        this.game.save();
        this.showPop('+Click Power', this.buyClickBtn, '#ffd27a');
      } else this.shake(this.buyClickBtn);
    });

    this.adBtn.addEventListener('click', async () => {
      this.adBtn.disabled = true;
      this.adBtn.textContent = 'Watching...';
      // simulate ad watch
      await new Promise(r => setTimeout(r, 5000));
      const reward = this.game.watchAd();
      this.showPop('+' + this.formatNumber(reward), this.adBtn, '#ffd27a');
      this.rebuildTop();
      this.game.save();
      setTimeout(()=>{ this.adBtn.disabled = false; this.adBtn.textContent = '📺 Watch Ad (5%)'; }, 600);
    });

    this.rebirthBtn.addEventListener('click', () => {
      if (!this.game.rebirthSystem.canRebirth()) {
        if (!confirm('Not yet eligible to rebirth. Show requirement?')) return;
      }
      if (!confirm('Perform Rebirth? This resets progress but grants Perk Points.')) return;
      const gained = this.game.rebirthSystem.rebirth();
      this.showPop(`+${gained} Perk Points`, this.rebirthBtn, '#9ff79b');
      this.rebuildPerks();
      this.rebuildTop();
      this.game.save();
    });

    this.saveBtn.addEventListener('click', () => { this.game.save(); this.showPop('Saved', this.saveBtn); });
    this.resetBtn.addEventListener('click', () => { if (confirm('Reset all progress?')) { localStorage.removeItem(this.game.saveKey); location.reload(); } });

    // settings
    this.settingsBtn.addEventListener('click', () => { this.settingsModal.classList.remove('hidden'); });
    this.closeSettings.addEventListener('click', () => { this.settingsModal.classList.add('hidden'); });
    this.hardReset.addEventListener('click', () => { if (!confirm('Hard reset (clear save)?')) return; localStorage.removeItem(this.game.saveKey); location.reload(); });
    this.toggleStarfield.addEventListener('change', (e) => {
      document.body.style.background = e.target.checked ? '' : 'linear-gradient(#000022,#021028)';
    });

    // floating event click notification handled in events module dispatch
  }

  rebuildTop() {
    this.stardustEl.textContent = this.formatNumber(this.game.state.stardust);
    this.dpsEl.textContent = this.game.computeDPS().toFixed(2);
    this.clickValueEl.textContent = this.formatNumber(this.game.state.clickValue);
    this.rebuildShop();
  }

  startLoop() {
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

  startAutosave() {
    // auto-save every 30s
    this.autoSaveInterval = setInterval(() => {
      this.game.save();
      this.showPop('Auto-saved', document.getElementById('saveBtn') || document.body);
    }, 30000);
  }

  startFloatingEvents() {
    // handled by game class spawner — UI just shows popups on 'floatingReward'
  }

  rebuildPerks() {
    const panel = this.rebirthPanel;
    panel.innerHTML = '';
    const pCount = this.game.state.rebirthPoints || 0;
    const h = document.createElement('div'); h.innerHTML = `<div>Perk Points: <b>${pCount}</b></div>`;
    panel.appendChild(h);
    // dynamic list
    import('./rebirth.js').then(mod => {
      const repo = new mod.RebirthSystem(this.game);
      repo.perks.forEach(p => {
        const b = document.createElement('button');
        b.textContent = `${p.name} (cost ${p.cost})`;
        b.onclick = () => {
          const ok = this.game.rebirthSystem.buyPerk(p.id);
          if (ok) {
            this.showPop('Perk bought', b, '#9ff79b');
            this.rebuildPerks();
            this.rebuildTop();
            this.game.save();
          } else this.shake(b);
        };
        panel.appendChild(b);
      });
    });
  }

  showPop(text, anchorEl = document.body, color = '#9ff') {
    const t = document.createElement('div');
    t.textContent = text;
    Object.assign(t.style, {
      position:'absolute', left:0, top:0, transform:'translate(-50%,-50%)',
      color, fontWeight:700, zIndex:9999, textShadow:'0 3px 10px rgba(0,0,0,0.6)'
    });
    document.body.appendChild(t);
    const rect = anchorEl.getBoundingClientRect();
    t.style.left = (rect.left + rect.width/2) + 'px';
    t.style.top = (rect.top + rect.height/2) + 'px';
    let y = 0;
    const id = setInterval(()=> { y -= 2; t.style.transform = `translate(-50%,-50%) translateY(${y}px)`; }, 16);
    setTimeout(()=> { clearInterval(id); t.remove(); }, 900);
  }

  formatNumber(n) {
    if (n >= 1e12) return (n/1e12).toFixed(2)+'T';
    if (n >= 1e9) return (n/1e9).toFixed(2)+'B';
    if (n >= 1e6) return (n/1e6).toFixed(2)+'M';
    if (n >= 1e3) return (n/1e3).toFixed(2)+'K';
    return Math.floor(n);
  }

  popAndPulse(selector, text) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    this.showPop(text, el);
    el.animate([{ transform:'scale(1)' }, { transform:'scale(1.08)' }, { transform:'scale(1)'}], { duration:350 });
  }

  shake(el) {
    el.animate([{ transform:'translateX(0)' }, { transform:'translateX(-6px)' }, { transform:'translateX(6px)' }, { transform:'translateX(0)' }], { duration: 300 });
  }
}

