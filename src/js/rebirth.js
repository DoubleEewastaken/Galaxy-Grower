const Rebirth = {
  confirmRebirth(){
    Game.state.cosmicEssence++;
    Game.state.rebirthMultiplier=1+Game.state.cosmicEssence*0.01;
    Game.state.stardust=0;
    Game.state.producers.forEach(p=>p.count=0);
    UI.renderProducers();
    UI.updateStardust();
    UI.closeRebirth();
  }
}
