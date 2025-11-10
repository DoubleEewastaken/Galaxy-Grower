import { Game } from './game.js';
import { UI } from './ui.js';
import { AudioManager } from './audio.js';
import { Particles } from './particles.js';

export const Events={
  buyProducer(i){
    const p=Game.state.producers[i];
    const cost=Math.floor(p.baseCost*Math.pow(1.15,p.count));
    if(Game.state.stardust>=cost){
      Game.state.stardust-=cost;
      p.count++;
      AudioManager.play('purchase');
      UI.updateStardust();
      UI.renderProducers();
    }
  },

  buyUpgrade(i){
    const u=Game.state.upgrades[i];
    const cost=Math.floor(u.baseCost*Math.pow(2,u.level));
    if(Game.state.stardust>=cost){
      Game.state.stardust-=cost;
      u.level++;
      if(u.type==="color") Game.gun.color=["#fff","#0ff","#f0f","#ff0","#f90"][u.level%5];
      else if(u.type==="flat") Game.state.clickValue+=u.flat||0;
      else if(u.type==="dps") Game.state.rebirthMultiplier*=u.multiplier;
      AudioManager.play('purchase');
      UI.updateStardust();
      UI.renderUpgrades();
    }
  },

  spendPerk(type){
    if(Game.state.cosmicEssence>0){
      Game.state.cosmicEssence--;
      if(type==="click") Game.state.clickValue*=1.01;
      else if(type==="dps") Game.state.producers.forEach(p=>p.baseDPS*=1.01);
      else if(type==="stardust") Game.state.stardust+=100;
      UI.updateStardust();
      UI.updateRebirthMenu();
    }
  }
};
