// game.js - core game logic / state
import { Producer } from './producers.inline.js'; // dynamic inline template below
import { ProducerTemplates } from './producers.inline.js';

export class Game {
  constructor() {
    this.saveKey = 'galaxygrower.3.save';
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
  }

  tick(dt) {
    const dps = this.computeDPS();
    const gain = dps * dt;
    this.state.stardust += gain;
    this.state.totalStardust += gain;
  }

  clickCore() {
    const gain = (this.state.clickValue || 1) * (this.state.clickMultiplier || 1);
    this.state.stardust += gain;
    this.state.totalStardust += gain;
    return Math.floor(gain);
  }

  computeDPS() {
    const base = this.producers.reduce((s,p)=>s + p.totalDPS(), 0);
    return base * (this.state.globalDPSMultiplier || 1) * (1 + (this.state.autoBonus || 0));
  }

  buyProducer(id) {
    const p = this.producers.find(x => x.id === id);
    if (!p) return false;
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
    const producerValue = this.producers.reduce((s,p)=> s + p.count * p.cost(), 0);
    const net = this.state.stardust + this.state.totalStardust * 0.05 + producerValue;
    const reward = Math.floor(net * 0.05);
    this.state.stardust += reward;
    this.state.totalStardust += reward;
    return reward;
  }

  resetForRebirth() {
    const keep = {
      rebirths: this.state.rebirths,
      rebirthPoints: this.state.rebirthPoints,
      clickMultiplier: this.state.clickMultiplier,
      globalDPSMultiplier: this.state.globalDPSMultiplier,
      rebirthIncomeBonus: this.state.rebirthIncomeBonus
    };
    this.state = Object.assign({
      stardust:0, totalStardust:0, clickValue:1, clickUpgrades:0, clickMultiplier: keep.clickMultiplier||1, globalDPSMultiplier: keep.globalDPSMultiplier||1, autoBonus:0,
      rebirths: keep.rebirths||0, rebirthPoints: keep.rebirthPoints||0, rebirthIncomeBonus: keep.rebirthIncomeBonus||0
    }, this.state);
    this.producers = ProducerTemplates.map(t => new Producer(t));
  }

  save() {
    const payload = { state: this.state, producers: this.producers.map(p=>({id:p.id,count:p.count,multiplier:p.multiplier})), ts:Date.now() };
    localStorage.setItem(this.saveKey, JSON.stringify(payload));
  }

  load() {
    const raw = localStorage.getItem(this.saveKey);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.assign(this.state, data.state || {});
      if (Array.isArray(data.producers)) {
        data.producers.forEach(ps => {
          const p = this.producers.find(pp=>pp.id===ps.id);
          if (p) { p.count = ps.count||0; p.multiplier = ps.multiplier||1; }
        });
      }
    } catch(e){ console.error(e); }
  }
}

/* inline producers definition because of modular single-file constraints (easier patching) */
export class Producer {
  constructor({ id, name, baseCost, baseDPS, icon, unlockAt = 0 }) {
    this.id = id; this.name = name; this.baseCost = baseCost; this.baseDPS = baseDPS; this.icon = icon; this.count = 0;
    this.multiplier = 1; this.unlockAt = unlockAt;
  }
  cost(){ return Math.floor(this.baseCost * Math.pow(1.15, this.count)); }
  dpsPerItem(){ return this.baseDPS * this.multiplier; }
  totalDPS(){ return this.count * this.dpsPerItem(); }
}

export const ProducerTemplates = [
  { id:'probe', name:'Probe', baseCost:15, baseDPS:0.08, icon:'🔭', unlockAt:0 },
  { id:'comet', name:'Comet', baseCost:125, baseDPS:1, icon:'☄️', unlockAt:50 },
  { id:'planet', name:'Planet', baseCost:1200, baseDPS:9, icon:'🜂', unlockAt:600 },
  { id:'star', name:'Star', baseCost:10000, baseDPS:75, icon:'⭐', unlockAt:6000 },
  { id:'galaxy', name:'Galaxy', baseCost:120000, baseDPS:700, icon:'🌌', unlockAt:120000 },
  { id:'nebula', name:'Nebula', baseCost:900000, baseDPS:5000, icon:'☁️', unlockAt:900000 },
  { id:'cluster', name:'Cluster', baseCost:7_500_000, baseDPS:42000, icon:'🔗', unlockAt:7_500_000 },
  { id:'blackhole', name:'Black Hole', baseCost:60_000_000, baseDPS:350_000, icon:'🕳️', unlockAt:60_000_000 },
  { id:'universe', name:'Universe Core', baseCost:600_000_000, baseDPS:3_000_000, icon:'🌐', unlockAt:600_000_000 },
  { id:'multiverse', name:'Multiverse Engine', baseCost:9_000_000_000, baseDPS:25_000_000, icon:'🌀', unlockAt:9_000_000_000 }
];
