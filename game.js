// Galaxy Grower - clicker core
(() => {
  // DOM
  const sdEl = id => document.getElementById(id);
  const stardustEl = sdEl('stardust');
  const dpsEl = sdEl('dps');
  const clickValueEl = sdEl('clickValue');
  const upgradesEl = sdEl('upgrades');
  const clickCostEl = sdEl('clickCost'); // may be null if not used
  const bigBtn = sdEl('big-button');

  // Save key
  const SAVE_KEY = 'galaxygrower.save_v1';

  // Game state
  const state = {
    stardust: 0,
    totalStardust: 0,
    clickValue: 1,
    producers: [], // created from template below
    lastTick: performance.now()
  };

  // Producer templates
  // name, baseCost, baseDPS, emoji/icon
  const producerTemplates = [
    { id: 'probe', name: 'Probe', baseCost: 15, baseDPS: 0.1, icon: '🔭' },
    { id: 'comet', name: 'Comet', baseCost: 125, baseDPS: 1, icon: '☄️' },
    { id: 'planet', name: 'Planet', baseCost: 1200, baseDPS: 9, icon: '🜂' },
    { id: 'star', name: 'Star', baseCost: 10000, baseDPS: 75, icon: '⭐' },
    { id: 'galaxy', name: 'Galaxy', baseCost: 120000, baseDPS: 700, icon: '🌌' }
  ];

  // Create producers in state (count, multiplier)
  state.producers = producerTemplates.map(t => ({ ...t, count: 0, multiplier: 1 }));

  // cost formula
  function costFor(template, owned) {
    // exponential cost: base * (1.15^owned)
    return Math.floor(template.baseCost * Math.pow(1.15, owned));
  }

  // compute DPS (sum of producers)
  function computeDPS() {
    return state.producers.reduce((sum, p) => sum + (p.baseDPS * p.count * p.multiplier), 0);
  }

  // UI build for upgrades
  function buildShop() {
    upgradesEl.innerHTML = '';
    state.producers.forEach((p, idx) => {
      const container = document.createElement('div');
      container.className = 'upgrade';

      const left = document.createElement('div');
      left.className = 'left';
      const icon = document.createElement('div');
      icon.className = 'icon';
      icon.textContent = p.icon;
      const info = document.createElement('div');
      info.innerHTML = `<div class="name">${p.name}</div><div class="cost">Owned: ${p.count}</div>`;
      left.appendChild(icon);
      left.appendChild(info);

      const right = document.createElement('div');
      right.innerHTML = `<div style="text-align:right;font-size:13px">+${(p.baseDPS * p.multiplier).toFixed(2)} DPS each</div>`;
      const buyBtn = document.createElement('button');
      buyBtn.textContent = `Buy (${costFor(p, p.count)})`;
      buyBtn.onclick = () => {
        const c = costFor(p, p.count);
        if (state.stardust >= c) {
          state.stardust -= c;
          p.count++;
          save();
          render();
          rebuildShop();
        } else {
          shake(buyBtn);
        }
      };
      right.appendChild(buyBtn);
      container.appendChild(left);
      container.appendChild(right);
      upgradesEl.appendChild(container);
    });
  }

  function rebuildShop() {
    // update each buy button and owned text
    Array.from(upgradesEl.children).forEach((child, idx) => {
      const p = state.producers[idx];
      child.querySelector('.cost').textContent = `Owned: ${p.count}`;
      const btn = child.querySelector('button');
      btn.textContent = `Buy (${costFor(p, p.count)})`;
    });
  }

  // click handler
  bigBtn.addEventListener('click', () => {
    const gain = state.clickValue;
    // visual tiny pop
    popText(`+${formatNumber(gain)}`, bigBtn, '#9ff');
    state.stardust += gain;
    state.totalStardust += gain;
    render();
  });

  // buy click upgrade button (in actions)
  const buyClickBtn = document.getElementById('buyClickUpgrade');
  if (buyClickBtn) {
    buyClickBtn.addEventListener('click', () => {
      // dynamic click upgrade cost formula
      const clickUpgradeBase = 50;
      const owned = state.clickUpgrades || 0;
      const cost = Math.floor(clickUpgradeBase * Math.pow(2, owned));
      if (state.stardust >= cost) {
        state.stardust -= cost;
        state.clickValue = Math.round((state.clickValue * 2) * 100) / 100;
        state.clickUpgrades = (state.clickUpgrades || 0) + 1;
        save();
        render();
        popText('+Click Power', buyClickBtn, '#ffd27a');
      } else {
        shake(buyClickBtn);
      }
    });
  }

  // save, load, reset
  sdEl('saveBtn').addEventListener('click', () => { save(); popText('Saved', sdEl('saveBtn'), '#bfe'); });
  sdEl('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all progress?')) return;
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  });

  // tiny UI helpers
  function formatNumber(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return Math.floor(n);
  }
  function popText(text, anchorEl, color = '#cff') {
    const t = document.createElement('div');
    t.textContent = text;
    Object.assign(t.style, {
      position: 'absolute', left: 0, top: 0, transform: 'translate(-50%,-50%)', pointerEvents: 'none',
      color, fontWeight: 700, zIndex: 9999, textShadow: '0 2px 8px rgba(0,0,0,0.6)'
    });
    document.body.appendChild(t);
    const rect = anchorEl.getBoundingClientRect();
    t.style.left = (rect.left + rect.width/2) + 'px';
    t.style.top = (rect.top + rect.height/2) + 'px';
    let y = 0;
    const id = setInterval(()=> {
      y -= 2;
      t.style.transform = `translate(-50%,-50%) translateY(${y}px)`;
    }, 16);
    setTimeout(()=>{ clearInterval(id); t.remove(); }, 900);
  }
  function shake(el) {
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
  }

  // main tick: produce stardust by DPS
  function tick(dt) {
    const dps = computeDPS();
    state.stardust += dps * dt;
    state.totalStardust += dps * dt;

    // natural decay or effects could go here (none by default)
  }

  function computeDPS() {
    return state.producers.reduce((acc, p) => acc + (p.baseDPS * p.count * p.multiplier), 0);
  }

  // render HUD and UI
  function render() {
    stardustEl.textContent = formatNumber(state.stardust);
    dpsEl.textContent = computeDPS().toFixed(2);
    clickValueEl.textContent = formatNumber(state.clickValue);

    // update shop buttons
    rebuildShop();
  }

  // autosave
  function save() {
    try {
      const s = JSON.stringify({
        stardust: state.stardust,
        total: state.totalStardust,
        clickValue: state.clickValue,
        producers: state.producers.map(p => ({ id: p.id, count: p.count })),
        clickUpgrades: state.clickUpgrades || 0
      });
      localStorage.setItem(SAVE_KEY, s);
    } catch (e) { console.error('Save failed', e); }
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      state.stardust = data.stardust || 0;
      state.totalStardust = data.total || 0;
      state.clickValue = data.clickValue || 1;
      state.clickUpgrades = data.clickUpgrades || 0;
      if (data.producers && Array.isArray(data.producers)) {
        data.producers.forEach(pSaved => {
          const p = state.producers.find(pp => pp.id === pSaved.id);
          if (p) p.count = pSaved.count || 0;
        });
      }
    } catch (e) { console.error('Load failed', e); }
  }

  // initial build
  function init() {
    buildShop();
    load();
    render();
    // main loop
    let last = performance.now();
    function loop(now) {
      const dt = (now - last) / 1000;
      last = now;
      tick(dt);
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // periodic autosave
    setInterval(save, 5000);
  }

  init();
})();
