/* ============================================================
   CINE BECK — Mega Menu with Focus Trap
   WAI-ARIA compliant menu pattern
   ============================================================ */

import { log } from './logger.js';

class MegaMenu {
  constructor() {
    this.btn = null;
    this.menu = null;
    this.links = [];
    this.previewImg = null;
    this.focusTrap = null;
    this.lastFocused = null;
  }
  
  init() {
    this.btn = document.getElementById('menuBtn');
    this.menu = document.getElementById('megaMenu');
    this.previewImg = document.getElementById('megaImg');
    
    if (!this.btn || !this.menu) {
      log.warn('MegaMenu elements not found');
      return;
    }
    
    this.links = [...this.menu.querySelectorAll('a[role="menuitem"]')];
    this.setupEventListeners();
    this.setupFocusTrap();
    log.info('MegaMenu initialized', { items: this.links.length });
  }
  
  setupEventListeners() {
    this.btn.addEventListener('click', () => this.toggle(!this.isOpen()));
    
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
    
    this.links.forEach((link, idx) => {
      link.addEventListener('mouseenter', () => this.updatePreview(link));
      link.addEventListener('focus', () => this.updatePreview(link));
      link.addEventListener('click', () => this.close());
      
      // Keyboard navigation within menu
      link.addEventListener('keydown', e => this.handleKeyNav(e, idx));
    });
  }
  
  setupFocusTrap() {
    // Create focus trap using sentinel elements
    this.firstSentinel = document.createElement('div');
    this.lastSentinel = document.createElement('div');
    this.firstSentinel.tabIndex = 0;
    this.lastSentinel.tabIndex = 0;
    this.firstSentinel.setAttribute('aria-hidden', 'true');
    this.lastSentinel.setAttribute('aria-hidden', 'true');
    
    this.menu.insertBefore(this.firstSentinel, this.menu.firstChild);
    this.menu.appendChild(this.lastSentinel);
    
    this.firstSentinel.addEventListener('focus', () => this.focusLast());
    this.lastSentinel.addEventListener('focus', () => this.focusFirst());
  }
  
  toggle(open) {
    if (open) this.open();
    else this.close();
  }
  
  open() {
    if (this.isOpen()) return;
    
    this.lastFocused = document.activeElement;
    this.menu.classList.add('open');
    this.btn.setAttribute('aria-expanded', 'true');
    this.menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Move focus to first menu item
    requestAnimationFrame(() => {
      this.focusFirst();
    });
    
    log.debug('MegaMenu opened');
  }
  
  close() {
    if (!this.isOpen()) return;
    
    this.menu.classList.remove('open');
    this.btn.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Restore focus to trigger button
    if (this.lastFocused) {
      this.lastFocused.focus();
    }
    
    log.debug('MegaMenu closed');
  }
  
  isOpen() {
    return this.menu.classList.contains('open');
  }
  
  focusFirst() {
    if (this.links.length > 0) {
      this.links[0].focus();
    }
  }
  
  focusLast() {
    if (this.links.length > 0) {
      this.links[this.links.length - 1].focus();
    }
  }
  
  handleKeyNav(event, currentIndex) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % this.links.length;
      this.links[nextIndex].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + this.links.length) % this.links.length;
      this.links[prevIndex].focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.focusFirst();
    } else if (event.key === 'End') {
      event.preventDefault();
      this.focusLast();
    }
  }
  
  updatePreview(link) {
    const src = link.dataset.img;
    if (src && this.previewImg && !this.previewImg.src.endsWith(src)) {
      this.previewImg.src = src;
    }
  }
  
  destroy() {
    if (this.firstSentinel) this.firstSentinel.remove();
    if (this.lastSentinel) this.lastSentinel.remove();
    this.btn = null;
    this.menu = null;
    this.links = [];
  }
}

export const megaMenu = new MegaMenu();
export default megaMenu;