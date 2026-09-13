/* ============================================================
   CINE BECK — Card Preview Manager
   Hover/tap video previews on cards, proper cleanup
   ============================================================ */

import { log } from './logger.js';

class CardPreviewManager {
  constructor(audioManager, videoManager) {
    this.audio = audioManager;
    this.videoManager = videoManager;
    this.cards = [];
    this.previews = new Map(); // card -> preview video element
    this.armed = new Map(); // card -> boolean
    this.finePointer = false;
    this.reduceMotion = false;
  }
  
  init() {
    this.cards = [...document.querySelectorAll('a.card[href*=".mp4"]')];
    if (this.cards.length === 0) return;
    
    this.finePointer = window.matchMedia('(pointer: fine)').matches;
    this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.setupClickHandlers();
    
    if (this.finePointer && !this.reduceMotion) {
      this.setupHoverPreviews();
    } else {
      this.setupTapPreviews();
    }
    
    // Handle navigation to reel-v4.html
    document.querySelectorAll('a[href="reel-v4.html"]').forEach(link => {
      link.addEventListener('click', () => {
        this.audio.silenceOthers(null);
      });
    });
    
    log.info('CardPreviewManager initialized', { 
      cards: this.cards.length, 
      finePointer: this.finePointer,
      reduceMotion: this.reduceMotion 
    });
  }
  
  setupClickHandlers() {
    this.cards.forEach(card => {
      card.addEventListener('click', e => {
        const href = card.getAttribute('href');
        if (!href || !/\.mp4($|\?)/i.test(href)) return;
        e.preventDefault();
        e.stopPropagation();
        
        // Open film player - will be handled by FilmPlayer module
        const event = new CustomEvent('cinebeck:open-film', { 
          detail: { src: href, card } 
        });
        document.dispatchEvent(event);
      });
    });
  }
  
  setupHoverPreviews() {
    this.cards.forEach(card => {
      const fig = card.querySelector('.card-fig');
      if (!fig) return;
      
      const preview = document.createElement('video');
      preview.className = 'card-video';
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.setAttribute('muted', '');
      preview.setAttribute('playsinline', '');
      preview.preload = 'none';
      fig.appendChild(preview);
      
      this.previews.set(card, preview);
      this.armed.set(card, false);
      
      card.addEventListener('mouseenter', () => this.onHoverEnter(card, preview));
      card.addEventListener('mouseleave', () => this.onHoverLeave(card, preview));
    });
  }
  
  setupTapPreviews() {
    // For touch devices: tap to preview, tap again to open
    this.cards.forEach(card => {
      let tapCount = 0;
      let tapTimer = null;
      
      card.addEventListener('click', e => {
        const href = card.getAttribute('href');
        if (!href || !/\.mp4($|\?)/i.test(href)) return;
        
        tapCount++;
        if (tapCount === 1) {
          e.preventDefault();
          e.stopPropagation();
          this.showTapPreview(card, href);
          
          tapTimer = setTimeout(() => {
            tapCount = 0;
            this.hideTapPreview(card);
          }, 2000);
        } else if (tapCount === 2) {
          clearTimeout(tapTimer);
          tapCount = 0;
          this.hideTapPreview(card);
          // Open film player
          const event = new CustomEvent('cinebeck:open-film', { 
            detail: { src: href, card } 
          });
          document.dispatchEvent(event);
        }
      });
    });
  }
  
  showTapPreview(card, src) {
    const fig = card.querySelector('.card-fig');
    if (!fig) return;
    
    let preview = this.previews.get(card);
    if (!preview) {
      preview = document.createElement('video');
      preview.className = 'card-video';
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.preload = 'metadata';
      fig.appendChild(preview);
      this.previews.set(card, preview);
    }
    
    preview.src = card.getAttribute('data-preview') || src;
    preview.muted = true;
    preview.volume = 0;
    card.classList.add('is-playing');
    
    preview.play().catch(() => card.classList.remove('is-playing'));
  }
  
  hideTapPreview(card) {
    const preview = this.previews.get(card);
    if (preview) {
      card.classList.remove('is-playing');
      preview.pause();
      try { preview.currentTime = 0; } catch (_) {}
    }
  }
  
  onHoverEnter(card, preview) {
    // Don't show preview if any audio is active
    const heroVideo = document.getElementById('heroVideo');
    if ((heroVideo && !heroVideo.muted) || this.audio.isAnyAudible?.()) return;
    
    if (!this.armed.get(card)) {
      preview.src = card.getAttribute('data-preview') || card.getAttribute('href');
      this.armed.set(card, true);
    }
    
    preview.muted = true;
    preview.volume = 0;
    card.classList.add('is-playing');
    
    preview.play().catch(() => card.classList.remove('is-playing'));
  }
  
  onHoverLeave(card, preview) {
    card.classList.remove('is-playing');
    preview.pause();
    try { preview.currentTime = 0; } catch (_) {}
  }
  
  destroy() {
    this.previews.forEach((preview, card) => {
      card.classList.remove('is-playing');
      preview.pause();
      preview.remove();
    });
    this.previews.clear();
    this.armed.clear();
  }
}
export default CardPreviewManager;