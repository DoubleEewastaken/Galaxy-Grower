
// rebirth.js - rebirth & perks system
export class RebirthSystem {
  constructor(game) {
    this.game = game;
    this.perks = [
      { id:'clickPlus', name:'+10% Click Power', cost:1, apply:g => { g.state.clickMultiplier *= 1.1; } },
      { id:'dpsPlus', name:'+10% DPS', cost:1, apply:g => { g.state.globalDPSMultiplier *= 1.1; } },
      { id:'autoBonus', name:'Auto-Start Bonus (5% extra DPS)', cost:2, apply:g => { g.state.autoBonus += 0.05; } },
      { id:'rebirthIncome', name:'+2% rebirth income', cost:3, apply:g => { g.state.rebirthIncomeBonus += 0.02; } }
    ];
  }

  canRebirth() {
    // threshold example: rebirth when totalStardust >= 1e6 * (1.5^rebirths)
    const base = 1_000_000;
    const multiplier = Math.pow(1.5, this.game.state.rebirths || 0);
    return this.game.state.totalStardust >= base * multiplier;
  }

  rebirth() {
    if (!this.canRebirth()) return 0;
    const base = 1_000_000;
    const multiplier = Math.pow(1.5, this.game.state.rebirths || 0);
    const gain = Math.floor((this.game.state.totalStardust / (base * multiplier)) ); // perk points
    const finalGain = Math.max(1, gain);
    // award points
    this.game.state.rebirthPoints = (this.game.state.rebirthPoints || 0) + finalGain;
    this.game.state.rebirths = (this.game.state.rebirths || 0) + 1;
    // reset core currencies but keep perks and rebirthPoints
    this.game.resetForRebirth();
    return finalGain;
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
