// events.js - floating space-only emoji events
const SPACE_EMOJIS = ['☄️','🚀','✨','💫','🌠','🛰️','🌟','🔭','🌌'];

export class FloatingEvent {
  constructor(rootEl, onCollectCallback) {
    this.rootEl = rootEl; // container to attach element
    this.onCollect = onCollectCallback;
    this.el = document.createElement('div');
    this.el.className = 'flying-event';
    this.emoji = SPACE_EMOJIS[Math.floor(Math.random()*SPACE_EMOJIS.length)];
    this.el.textContent = this.emoji;
    this.speed = Math.random()*30+30; // px/sec
    this.direction = Math.random() < 0.5 ? 'left' : 'right';
    this.y = Math.random() * (rootEl.clientHeight * 0.8) + rootEl.clientHeight*0.1;
    this.start();
  }

  start() {
    const container = this.rootEl;
    container.appendChild(this.el);
    this.el.style.top = `${this.y}px`;
    // initial left/right
    if (this.direction === 'left') {
      this.x = container.clientWidth + 40;
      this.el.style.left = `${this.x}px`;
    } else {
      this.x = -60;
      this.el.style.left = `${this.x}px`;
    }
    this.boundTick = this.tick.bind(this);
    this.last = performance.now();
    this.el.addEventListener('click', this.collect.bind(this));
    requestAnimationFrame(this.boundTick);
  }

  tick(now) {
    const dt = (now - this.last) / 1000;
    this.last = now;
    const delta = this.speed * dt * (this.direction === 'left' ? -1 : 1);
    this.x += delta;
    this.el.style.left = `${this.x}px`;
    // remove if out
    if (this.direction === 'left' && this.x < -80) { this.destroy(); return; }
    if (this.direction === 'right' && this.x > this.rootEl.clientWidth + 80) { this.destroy(); return; }
    this._raf = requestAnimationFrame(this.boundTick);
  }

  collect() {
    // small scale animation then callback
    this.el.style.transform = 'scale(1.4)';
    setTimeout(()=> {
      this.onCollect();
      this.destroy();
    }, 120);
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    this.el.remove();
  }
}

