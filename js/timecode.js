/* ============================================================
   CINE BECK — Timecode Display
   24fps timecode for hero video viewfinder
   ============================================================ */

import { log } from './logger.js';

class Timecode {
  constructor() {
    this.element = null;
    this.video = null;
    this.rafId = null;
  }
  
  init() {
    this.element = document.getElementById('timecode');
    this.video = document.getElementById('heroVideo');
    
    if (!this.element || !this.video) return;
    
    this.start();
    log.info('Timecode initialized');
  }
  
  start() {
    const pad2 = n => String(n).padStart(2, '0');
    
    const tick = () => {
      const t = this.video.currentTime || 0;
      const h = Math.floor(t / 3600);
      const m = Math.floor((t % 3600) / 60);
      const s = Math.floor(t % 60);
      const f = Math.floor((t % 1) * 24);
      this.element.textContent = `${pad2(h)}:${pad2(m)}:${pad2(s)}:${pad2(f)}`;
      this.rafId = requestAnimationFrame(tick);
    };
    
    this.rafId = requestAnimationFrame(tick);
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

export const timecode = new Timecode();
export default Timecode;