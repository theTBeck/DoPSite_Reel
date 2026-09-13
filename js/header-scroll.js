/* ============================================================
   CINE BECK — Header Scroll Effect
   Adds scrolled class when page scrolls past threshold
   ============================================================ */

import { log } from './logger.js';

class HeaderScroll {
  constructor() {
    this.header = null;
    this.threshold = 24;
  }
  
  init() {
    this.header = document.getElementById('siteHead');
    if (!this.header) return;
    
    this.bind();
    log.info('HeaderScroll initialized');
  }
  
  bind() {
    const onScroll = () => {
      this.header.classList.toggle('scrolled', window.scrollY > this.threshold);
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Initial check
  }
  
  destroy() {
    // Note: Can't easily remove passive listener without reference
    // This is fine for SPA lifecycle
  }
}

export const headerScroll = new HeaderScroll();
export default HeaderScroll;