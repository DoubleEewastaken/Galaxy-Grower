const UI = {
  stardustDisplay: document.getElementById('stardustDisplay'),
  producersDiv: document.getElementById('producers'),
  upgradesDiv: document.getElementById('upgrades'),
  settingsDiv: document.getElementById('settings'),
  rebirthModal: document.getElementById('rebirthModal'),
  rebirthInfo: document.getElementById('rebirthInfo'),

  updateStardust() {
    this.stardustDisplay.textContent = `Stardust: ${Game.format(Game.state.stardust)}`;
  },

  renderProducers() {
    this.producersDiv.innerHTML = "<h3>Producers</h3>";
    Game.state.producers.forEach((p,i)=>{
      const cost = Math.floor(p.baseCost * Math.pow(1.15,p.count));
      const div = document.createElement('div');
      div.className='item';
      div.innerHTML=`${p.name} - Owned: ${p.count} | Cost: ${cost} | DPS: ${p.baseDPS*p.count} <button onclick="Events.buyProducer(${i})">Buy</button>`;
      this.producersDiv.appendChild(div);
    });
  },

  renderUpgrades() {
    this.upgradesDiv.innerHTML = "<h3>Upgrades</h3>";
    Game.state.upgrades.forEach((u,i)=>{
      const cost = Math.floor(u.baseCost * Math.pow(2,u.level));
      const div = document.createElement('div');
      div.className='item';
      div.innerHTML=`${u.name} - Level: ${u.level} | Cost: ${cost} <button onclick="Events.buyUpgrade(${i})">Buy</button>`;
      this.upgradesDiv.appendChild(div);
    });
  },

  openSettings(){ this.settingsDiv.style.display='flex'; },
  closeSettings(){ this.settingsDiv.style.display='none'; },
  openRebirth(){
    this.rebirthInfo.textContent = `You have ${Game.state.cosmicEssence} Cosmic Essence. Rebirth resets Stardust and producers but increases multiplier by 1% per rebirth.`;
    this.rebirthModal.style.display='flex';
  },
  closeRebirth(){ this.rebirthModal.style.display='none'; }
}
