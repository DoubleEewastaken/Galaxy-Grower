import { Game } from './game.js';
import { Events } from './events.js';

export const UI = {
  stardustDisplay:document.getElementById('stardustDisplay'),
  producersDiv:document.getElementById('producers'),
  upgradesDiv:document.getElementById('upgrades'),
  rebirthInfo:document.getElementById('rebirthInfo'),
  rebirthPerks:document.getElementById('rebirthPerks'),

  updateStardust(){ this.stardustDisplay.textContent=`Stardust: ${Math.floor(Game.state.stardust)}`; },

  renderProducers(){
    this.producersDiv.innerHTML="<h3>Producers</h3>";
    Game.state.producers.forEach((p,i)=>{
      const cost=Math.floor(p.baseCost*Math.pow(1.15,p.count));
      const div=document.createElement('div');
      div.className='item';
      div.innerHTML=`${p.name} - Owned:${p.count} | Cost:${cost} | DPS:${p.baseDPS*p.count} <button onclick="Events.buyProducer(${i})">Buy</button>`;
      this.producersDiv.appendChild(div);
    });
  },

  renderUpgrades(){
    this.upgradesDiv.innerHTML="<h3>Click Upgrades</h3>";
    Game.state.upgrades.forEach((u,i)=>{
      const cost=Math.floor(u.baseCost*Math.pow(2,u.level));
      const div=document.createElement('div');
      div.className='item';
      div.innerHTML=`${u.name} - Level:${u.level} | Cost:${cost} <button onclick="Events.buyUpgrade(${i})">Buy</button>`;
      this.upgradesDiv.appendChild(div);
    });
  },

  updateRebirthMenu(){
    this.rebirthInfo.textContent=`Cosmic Essence: ${Game.state.cosmicEssence}`;
    this.rebirthPerks.innerHTML=`<button onclick="Events.spendPerk('click')">+1% Click</button>
    <button onclick="Events.spendPerk('dps')">+1% DPS</button>
    <button onclick="Events.spendPerk('stardust')">+100 Stardust</button>`;
  }
};
