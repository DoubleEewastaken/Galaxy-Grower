const Settings = {
  resetGame(){ localStorage.clear(); location.reload(); }
}

document.getElementById('clickSoundToggle').addEventListener('change', e=>{ Game.state.settings.clickSound=e.target.checked; });
document.getElementById('eventSoundToggle').addEventListener('change', e=>{ Game.state.settings.eventSound=e.target.checked; });
document.getElementById('purchaseSoundToggle').addEventListener('change', e=>{ Game.state.settings.purchaseSound=e.target.checked; });
document.getElementById('bgToggle').addEventListener('change', e=>{ Game.state.settings.bgAnim=e.target.checked; });
