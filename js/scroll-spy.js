/* ============================================================
   CINE BECK — Scroll Spy
   Updates header slate with current section
   ============================================================ */

import { log } from './logger.js';

class ScrollSpy {
  constructor() {
    this.slate = null;
    this.sections = [];
    this.observer = null;
  }
  
  init() {
    this.slate = document.getElementById('headSlate');
    this.sections = [...document.querySelectorAll('[data-reel]')];
    
    if (!this.slate || this.sections.length === 0) return;
    
    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            this.slate.textContent = `REEL ${en.target.dataset.reel} — ${en.target.dataset.label}`;
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    
    this.sections.forEach(s => this.observer.observe(s));
    log.info('ScrollSpy initialized', { sections: this.sections.length });
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const scrollSpy = new ScrollSpy();
export default ScrollSpy;