const AudioManager = {
  click: new Audio('https://freesound.org/data/previews/66/66717_931655-lq.mp3'),
  event: new Audio('https://freesound.org/data/previews/320/320655_5260877-lq.mp3'),
  purchase: new Audio('https://freesound.org/data/previews/33/33749_512123-lq.mp3'),

  play(sound){
    if(Game.state.settings[`${sound}Sound`]) this[sound].play();
  }
}


