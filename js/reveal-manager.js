/* ============================================================
   CINE BECK — Reveal Manager
   Scroll-triggered animations with reduced motion support
   ============================================================ */

import { log } from './logger.js';

class RevealManager {
  constructor() {
    this.observer = null;
    this.elements = [];
    this.disabled = false;
  }
  
  init() {
    this.elements = [...document.querySelectorAll('.rv')];
    if (this.elements.length === 0) return;
    
    this.observer = new IntersectionObserver(
      entries => {
        if (this.disabled) return;
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            this.observer.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );
    
    this.elements.forEach(el => this.observer.observe(el));
    log.info('RevealManager initialized', { count: this.elements.length });
  }
  
  disableAnimations() {
    this.disabled = true;
    this.elements.forEach(el => el.classList.add('in'));
    if (this.observer) {
      this.observer.disconnect();
    }
    log.debug('Reveal animations disabled (reduced motion)');
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.elements = [];
  }
}

export const revealManager = new RevealManager();
export default revealManager;