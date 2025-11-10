// rebirth.js - rebirth & perks
export class RebirthSystem {
  constructor(game) {
    this.game = game;
    this.perks = [
      { id:'clickPlus', name:'+10% Click Power', cost:1, apply:g => { g.state.clickMultiplier *= 1.10; } },
      { id:'dpsPlus', name:'+10% DPS', cost:1, apply:g => { g.state.globalDPSMultiplier *= 1.10; } },
      { id:'autoBonus', name:'Auto Bonus +5%', cost:2, apply:g => { g.state.autoBonus = (g.state.autoBonus || 0) + 0.05; } },
      { id:'rebirthIncome', name:'+2% Rebirth Income', cost:3, apply:g => { g.state.rebirthIncomeBonus = (g.state.rebirthIncomeBonus || 0) + 0.02; } }
    ];
  }

  canRebirth() {
    const base = 1_000_000;
    const req = base * Math.pow(1.6, (this.game.state.rebirths || 0));
    return this.game.state.totalStardust >= req;
  }

  rebirth() {
    if (!this.canRebirth()) return 0;
    const base = 1_000_000;
    const multiplier = Math.pow(1.6, this.game.state.rebirths || 0);
    const gain = Math.max(1, Math.floor(this.game.state.totalStardust / (base * multiplier)));
    this.game.state.rebirthPoints = (this.game.state.rebirthPoints || 0) + gain;
    this.game.state.rebirths = (this.game.state.rebirths || 0) + 1;
    // reset game but keep multipliers/points
    this.game.resetForRebirth();
    return gain;
  }

  buyPerk(perkId) {
    const p = this.perks.find(x => x.id === perkId);
    if (!p) return false;
    if ((this.game.state.rebirthPoints || 0) < p.cost) return false;
    this.game.state.rebirthPoints -= p.cost;
    p.apply(this.game);
    return true;
  }
}
