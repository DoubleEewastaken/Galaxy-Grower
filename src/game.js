// game.js - Game class, state, save/load, autosave, ad reward
import { Producer, ProducerTemplates } from './producers.js';
import { FloatingEvent } from './events.js';
import { RebirthSystem } from './rebirth.js';

export class Game {
  constructor(uiRoot) {
    this.state = {
      stardust: 0,
      totalStardust: 0,
      clickValue: 1,
      clickUpgrades: 0,
      clickMultiplier: 1,
      globalDPSMultiplier: 1,
      autoBonus: 0,
      rebirths: 0,
      rebirthPoints: 0,
      rebirthIncomeBonus: 0
    };
    this.producers = ProducerTemplates.map(t => new Producer(t));
    this.uiRoot = uiRoot;
    this.saveKey = 'galaxygrower.2.save_v2';
    this.eventRoot = document.getElementById('floating-events');
    this.rebirthSystem = new RebirthSystem(this);
    this.eventTimer = null;
    this.lastTick = performance.now();
    this.setupEventSpawner();
  }

  netWorth() {
    const producerValue = this.producers.reduce((s,p) => s + p.count * p.cost(), 0);
    return this.state.stardust + this.state.totalStardust * 0.05 + producerValue;
  }

  computeDPS() {
    const base = this.producers.reduce((acc,p) => acc + p.totalDPS(), 0);
    const withMultipliers = base * (this.state.globalDPSMultiplier || 1) * (1 + (this.state.autoBonus || 0));
    return withMultipliers;
  }

  tick(dt) {
    const dps = this.computeDPS();
    const gain = dps * dt;
    this.state.stardust += gain;
    this.state.totalStardust += gain;
  }

  clickCore() {
    const gain = this.state.clickValue * (this.state.clickMultiplier || 1);
    this.state.stardust += gain;
    this.state.totalStardust += gain;
    return gain;
  }

  buyProducer(id) {
    const p = this.producers.find(x => x.id === id);
    const cost = p.cost();
    if (this.state.stardust >= cost) {
      this.state.stardust -= cost;
      p.count++;
      return true;
    }
    return false;
  }

  buyClickUpgrade() {
    const base = 50;
    const owned = this.state.clickUpgrades || 0;
    const cost = Math.floor(base * Math.pow(2, owned));
    if (this.state.stardust >= cost) {
      this.state.stardust -= cost;
      this.state.clickUpgrades = owned + 1;
      this.state.clickValue = +(this.state.clickValue * 2).toFixed(2);
      return true;
    }
    return false;
  }

  watchAd() {
    // reward = 5% of net worth
    const reward = Math.floor(this.netWorth() * 0.05);
    this.state.stardust += reward;
    this.state.totalStardust += reward;
    return reward;
  }

  resetForRebirth() {
    // Keep: rebirthPoints, rebirths, clickMultiplier, globalDPSMultiplier, rebirthIncomeBonus
    const keep = {
      rebirths: this.state.rebirths,
      rebirthPoints: this.state.rebirthPoints,
      clickMultiplier: this.state.clickMultiplier,
      globalDPSMultiplier: this.state.globalDPSMultiplier,
      rebirthIncomeBonus: this.state.rebirthIncomeBonus
    };
    // Reset main currencies and producers
    this.state = Object.assign({
      stardust: 0,
      totalStardust: 0,
      clickValue: 1,
      clickUpgrades: 0,
      clickMultiplier: keep.clickMultiplier || 1,
      globalDPSMultiplier: keep.globalDPSMultiplier || 1,
      autoBonus: 0,
      rebirths: keep.rebirths || 0,
      rebirthPoints: keep.rebirthPoints || 0,
      rebirthIncomeBonus: keep.rebirthIncomeBonus || 0
    }, this.state);
    this.producers = ProducerTemplates.map(t => new Producer(t));
  }

  // Save / Load
  save() {
    const payload = {
      state: this.state,
      producers: this.producers.map(p => ({ id: p.id, count: p.count, multiplier: p.multiplier })),
      ts: Date.now()
    };
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(payload));
    } catch (e) { console.error('Save failed', e); }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.assign(this.state, data.state || {});
      if (Array.isArray(data.producers)) {
        data.producers.forEach(pSaved => {
          const p = this.producers.find(pp => pp.id === pSaved.id);
          if (p) {
            p.count = pSaved.count || 0;
            p.multiplier = pSaved.multiplier || 1;
          }
        });
      }
    } catch (e) { console.error('Load failed', e); }
  }

  // Floating events spawner
  setupEventSpawner() {
    // spawn first after random 5-15s, then every 20-40s randomized
    const spawnOne = () => {
      import('./events.js').then(mod => {
        const ev = new mod.FloatingEvent(this.eventRoot, () => {
          // on collect: reward 5x DPS
          const reward = Math.max(1, Math.floor(this.computeDPS() * 5));
          this.state.stardust += reward;
          this.state.totalStardust += reward;
          // notify UI (UI handles pop effects)
          document.dispatchEvent(new CustomEvent('floatingReward', { detail: { reward } }));
        });
      });
    };
    const schedule = () => {
      const next = Math.random() * 20 + 20; // 20 - 40s
      this.eventTimer = setTimeout(() => {
        spawnOne();
        schedule();
      }, next*1000);
    };
    // kick off
    setTimeout(schedule, Math.random()*10000+3000);
  }

  stopEventSpawner() {
    clearTimeout(this.eventTimer);
  }
}

