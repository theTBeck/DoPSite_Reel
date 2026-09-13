/* ============================================================
   CINE BECK — Core Application Module
   ES Module entry point
   ============================================================ */

import { AudioManager } from './audio-manager.js';
import { VideoManager } from './video-manager.js';
import { MegaMenu } from './mega-menu.js';
import { RevealManager } from './reveal-manager.js';
import { FilmPlayer } from './film-player.js';
import { CardPreviewManager } from './card-preview-manager.js';
import { ScrollSpy } from './scroll-spy.js';
import { BrandEvolution } from './brand-evolution.js';
import { Timecode } from './timecode.js';
import { HeaderScroll } from './header-scroll.js';
import { log } from './logger.js';

/* ---------- Application State ---------- */
const App = {
  initialized: false,
  modules: {},
  
  init() {
    if (this.initialized) return;
    
    log.info('Initializing CINE BECK application');
    
    // Core managers (order matters for dependencies)
    this.modules.audio = new AudioManager();
    this.modules.video = new VideoManager(this.modules.audio);
    this.modules.megaMenu = new MegaMenu();
    this.modules.reveal = new RevealManager();
    this.modules.filmPlayer = new FilmPlayer(this.modules.audio, this.modules.video);
    this.modules.cardPreview = new CardPreviewManager(this.modules.audio, this.modules.video);
    this.modules.scrollSpy = new ScrollSpy();
    this.modules.brand = new BrandEvolution();
    this.modules.timecode = new Timecode();
    this.modules.header = new HeaderScroll();
    
    // Initialize all modules
    Object.values(this.modules).forEach(m => m.init?.());
    
    // Global gesture unlock for audio
    this.setupGestureUnlock();
    
    // Reduced motion handling
    this.handleReducedMotion();
    
    this.initialized = true;
    log.info('Application initialized', { modules: Object.keys(this.modules) });
  },
  
  setupGestureUnlock() {
    const unlock = () => {
      this.modules.audio.resume();
      document.removeEventListener('pointerdown', unlock, { capture: true });
      document.removeEventListener('keydown', unlock, { capture: true });
      log.debug('Audio context unlocked by user gesture');
    };
    document.addEventListener('pointerdown', unlock, { once: true, capture: true });
    document.addEventListener('keydown', unlock, { once: true, capture: true });
  },
  
  handleReducedMotion() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (matches) => {
      document.documentElement.classList.toggle('reduce-motion', matches);
      if (matches) {
        this.modules.video.pauseAll();
        this.modules.reveal.disableAnimations();
        this.modules.brand.disable();
      }
    };
    apply(reduceMotion.matches);
    reduceMotion.addEventListener('change', e => apply(e.matches));
  },
  
  destroy() {
    Object.values(this.modules).forEach(m => m.destroy?.());
    this.initialized = false;
  }
};

/* ---------- Bootstrap ---------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

/* ---------- Export for debugging ---------- */
window.__CINE_BECK_APP__ = App;

export { App };