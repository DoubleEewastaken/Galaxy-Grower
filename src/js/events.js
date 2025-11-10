const Events = {
  buyProducer(i){
    const p = Game.state.producers[i];
    const cost = Math.floor(p.baseCost * Math.pow(1.15,p.count));
    if(Game.state.stardust >= cost){
      Game.state.stardust -= cost;
      p.count++;
      AudioManager.play('purchase');
      UI.updateStardust();
      UI.renderProducers();
    }
  },

  buyUpgrade(i){
    const u = Game.state.upgrades[i];
    const cost = Math.floor(u.baseCost * Math.pow(2,u.level));
    if(Game.state.stardust >= cost){
      Game.state.stardust -= cost;
      u.level++;
      Game.state.clickValue *= u.multiplier;
      AudioManager.play('purchase');
      UI.updateStardust();
      UI.renderUpgrades();
    }
  },

  clickMain(){
    Game.state.stardust += Game.state.clickValue*Game.state.rebirthMultiplier;
    AudioManager.play('click');
    UI.updateStardust();
    Particles.spawn(UI.stardustDisplay,20,'#fff');
  }
}
