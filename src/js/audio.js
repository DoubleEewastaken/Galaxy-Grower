// audio.js - small WebAudio wrappers for SFX (no external files)
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e){ this.ctx = null; this.enabled = false; }
  }

  toggle(enabled) { this.enabled = !!enabled; if (!this.enabled && this.ctx) { try { this.ctx.suspend(); } catch(e){} } }

  // simple click ping: triangle + decay
  playClick() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(900, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.19);
  }

  playPurchase() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(520, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.26);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.28);
  }

  playEvent() {
    if (!this.enabled || !this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(1200, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime+0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.2);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+0.21);
  }
}
