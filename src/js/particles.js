// particles.js - lightweight particle engine for click / purchase effects
export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', ()=>this.resize());
    this._last = performance.now();
    this._loop();
  }

  resize(){
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  spawnBurst(x,y, color='#fff', count=18, speed=120) {
    for(let i=0;i<count;i++){
      const a = Math.random()*Math.PI*2;
      const s = (Math.random()*0.5+0.5)*speed;
      this.particles.push({
        x, y,
        vx: Math.cos(a)*s,
        vy: Math.sin(a)*s,
        life: 0.9 + Math.random()*0.6,
        age: 0, color
      });
    }
  }

  tick(dt){
    for(let i=this.particles.length-1;i>=0;i--){
      const p = this.particles[i];
      p.age += dt;
      if(p.age >= p.life) this.particles.splice(i,1);
      else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.995; p.vy *= 0.995;
      }
    }
  }

  draw(){
    const ctx = this.ctx;
    ctx.clearRect(0,0,this.canvas.width, this.canvas.height);
    for(const p of this.particles){
      const alpha = 1 - (p.age / p.life);
      ctx.fillStyle = this._withAlpha(p.color, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI*2);
      ctx.fill();
    }
  }

  _withAlpha(color, a){
    // color like '#rrggbb' -> rgba
    if(color.startsWith('#')){
      const r = parseInt(color.slice(1,3),16), g=parseInt(color.slice(3,5),16), b=parseInt(color.slice(5,7),16);
      return `rgba(${r},${g},${b},${a})`;
    }
    return color;
  }

  _loop(){
    const now = performance.now();
    const dt = Math.min(0.05, (now - this._last)/1000);
    this._last = now;
    this.tick(dt);
    this.draw();
    requestAnimationFrame(()=>this._loop());
  }
}
