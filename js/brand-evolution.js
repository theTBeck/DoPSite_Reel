/* ============================================================
   CINE BECK — Brand Evolution
   Animates brand from short to long form on hero
   ============================================================ */

import { log } from './logger.js';

class BrandEvolution {
  constructor() {
    this.brand = null;
    this.timeoutId = null;
    this.disabled = false;
  }
  
  init() {
    this.brand = document.getElementById('brandLink');
    if (!this.brand) return;
    
    this.start();
    log.info('BrandEvolution initialized');
  }
  
  start() {
    if (this.disabled) return;
    
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (reduceMotion) {
      this.evolve();
    } else {
      this.timeoutId = window.setTimeout(() => this.evolve(), 1600);
    }
  }
  
  evolve() {
    if (this.brand && !this.brand.classList.contains('is-evolved')) {
      this.brand.classList.add('is-evolved');
      log.debug('Brand evolved to long form');
    }
  }
  
  disable() {
    this.disabled = true;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.evolve(); // Jump to final state
  }
  
  destroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

export const brandEvolution = new BrandEvolution();
export default BrandEvolution;