export const Game = {
  state: {
    stardust: 0,
    clickValue: 1,
    producers: [
      { name: "Asteroid Miner", count: 0, baseCost: 10, baseDPS: 1 },
      { name: "Comet Harvester", count: 0, baseCost: 100, baseDPS: 10 }
    ],
    upgrades: [
      { name: "Click Booster", level: 0, baseCost: 50, multiplier: 2 }
    ],
    cosmicEssence: 0,
    rebirthMultiplier: 1,
    floatingEvents: [],
    settings: { clickSound: true, eventSound: true, purchaseSound: true, bgAnim: true }
  },

  save() { localStorage.setItem('cosmicClicker', JSON.stringify(this.state)); },

  load() {
    const saved = localStorage.getItem('cosmicClicker');
    if(saved) this.state = JSON.parse(saved);
  },

  format(n){ return n.toFixed(0); }
};
