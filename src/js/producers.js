// producers.js
export class Producer {
  constructor({ id, name, baseCost, baseDPS, icon, unlockAt = 0 }) {
    this.id = id;
    this.name = name;
    this.baseCost = baseCost;
    this.baseDPS = baseDPS;
    this.icon = icon;
    this.count = 0;
    this.multiplier = 1;
    this.unlockAt = unlockAt; // visible threshold
  }

  cost() {
    return Math.floor(this.baseCost * Math.pow(1.15, this.count));
  }

  dpsPerItem() {
    return this.baseDPS * this.multiplier;
  }

  totalDPS() {
    return this.count * this.dpsPerItem();
  }
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

