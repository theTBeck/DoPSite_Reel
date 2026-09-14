/* ============================================================
   CINE BECK — Video Manager
   Centralized video element lifecycle, error handling, lazy loading
   ============================================================ */

import { log } from './logger.js';
import { audioManager } from './audio-manager.js';

class VideoManager {
  constructor(audioManager) {
    this.audio = audioManager;
    this.elements = new Set();
    this.heroVideo = null;
    this.reelMasterVideo = null;
    this.errorRetries = new Map(); // videoEl -> retry count
    this.maxRetries = 2;
  }
  
  init() {
    this.heroVideo = document.getElementById('heroVideo');
    this.reelMasterVideo = document.getElementById('reelMasterVideo');
    
    if (this.heroVideo) this.setupHeroVideo();
    if (this.reelMasterVideo) this.setupReelMasterVideo();
    
    log.info('VideoManager initialized');
  }
  
  setupHeroVideo() {
    const v = this.heroVideo;
    this.track(v);
    
    // CRITICAL: Always start muted - no autoplay with sound
    v.muted = true;
    v.volume = 1;
    v.preload = 'metadata';
    v.playsInline = true;
    
    // Attach audio control (starts silent)
    this.audio.attach(v, false);
    
    // Autoplay attempt (muted)
    this.attemptPlay(v, 'hero');
    
    // Error handling
    v.addEventListener('error', e => this.handleError(v, e));
    v.addEventListener('stalled', () => log.videoEvent('stalled', v));
    v.addEventListener('waiting', () => log.videoEvent('waiting', v));
    v.addEventListener('playing', () => log.videoEvent('playing', v));
    v.addEventListener('pause', () => log.videoEvent('pause', v));
    v.addEventListener('ended', () => log.videoEvent('ended', v));
  }
  
  setupReelMasterVideo() {
    const v = this.reelMasterVideo;
    if (!v) return;

    this.track(v);
    // Stay on the native muted flag so Chrome allows autoplay.
    // Do not route this clip through AudioManager (GainNode forces muted=false).
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.volume = 1;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'auto';

    const section = document.getElementById('reel') || v;
    let inView = false;

    const kickMuted = () => {
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('muted', '');
      if (!inView) return;
      v.play().then(() => log.videoEvent('play', v, { context: 'reel-master' }))
        .catch(e => log.warn('Reel muted autoplay blocked', { error: e.name, message: e.message }));
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(en => {
        inView = en.isIntersecting;
        if (inView) kickMuted();
        else {
          v.pause();
          log.videoEvent('pause', v, { reason: 'intersection-exit' });
        }
      });
    }, { threshold: 0.15 });

    observer.observe(section);
    v._intersectionObserver = observer;

    v.addEventListener('canplay', () => {
      if (v.paused && inView) kickMuted();
    });
    v.addEventListener('loadeddata', () => {
      if (v.paused && inView) kickMuted();
    });
  }
  
  attemptPlay(videoEl, context) {
    if (videoEl.paused) {
      videoEl.play()
        .then(() => log.videoEvent('play', videoEl, { context }))
        .catch(e => {
          log.warn('Autoplay blocked', { context, error: e.name, message: e.message });
          // Ensure muted on failure
          videoEl.muted = true;
          this.audio.attach(videoEl, false);
        });
    }
  }
  
  handleError(videoEl, event) {
    const error = videoEl.error;
    const retryCount = this.errorRetries.get(videoEl) || 0;
    
    log.error('Video error', {
      src: videoEl.src,
      code: error?.code,
      message: error?.message,
      retryCount,
      networkState: videoEl.networkState,
      readyState: videoEl.readyState
    });
    
    // Show fallback poster
    this.showFallbackPoster(videoEl);
    
    // Retry logic
    if (retryCount < this.maxRetries) {
      this.errorRetries.set(videoEl, retryCount + 1);
      setTimeout(() => {
        log.info('Retrying video load', { src: videoEl.src, attempt: retryCount + 1 });
        videoEl.load();
        this.attemptPlay(videoEl, 'retry');
      }, 1000 * (retryCount + 1));
    } else {
      this.showErrorOverlay(videoEl);
    }
  }
  
  showFallbackPoster(videoEl) {
    const poster = videoEl.poster || videoEl.getAttribute('data-fallback-poster');
    if (poster) {
      videoEl.style.backgroundImage = `url(${poster})`;
      videoEl.style.backgroundSize = 'cover';
      videoEl.style.backgroundPosition = 'center';
    }
  }
  
  showErrorOverlay(videoEl) {
    // Create error message overlay
    const container = videoEl.parentElement;
    if (!container || container.querySelector('.video-error')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'video-error';
    overlay.innerHTML = `
      <p>Unable to load video</p>
      <button type="button" class="retry-btn">Retry</button>
    `;
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(11, 10, 8, 0.9)',
      color: '#ede7db',
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '14px',
      gap: '12px',
      zIndex: 10
    });
    
    const btn = overlay.querySelector('.retry-btn');
    Object.assign(btn.style, {
      padding: '8px 16px',
      background: '#e39a3b',
      color: '#0b0a08',
      border: 'none',
      borderRadius: '2px',
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: '12px',
      cursor: 'pointer'
    });
    
    btn.addEventListener('click', () => {
      overlay.remove();
      this.errorRetries.set(videoEl, 0);
      videoEl.load();
      this.attemptPlay(videoEl, 'manual-retry');
    });
    
    container.style.position = 'relative';
    container.appendChild(overlay);
  }
  
  track(videoEl) {
    this.elements.add(videoEl);
  }
  
  untrack(videoEl) {
    this.elements.delete(videoEl);
    this.errorRetries.delete(videoEl);
    if (videoEl._intersectionObserver) {
      videoEl._intersectionObserver.disconnect();
      videoEl._intersectionObserver = null;
    }
  }
  
  pauseAll() {
    this.elements.forEach(el => {
      if (!el.paused) {
        el.pause();
        log.videoEvent('pause', el);
      }
    });
  }
  
  destroy() {
    this.elements.forEach(el => this.untrack(el));
    this.elements.clear();
  }
}

export const videoManager = new VideoManager(audioManager);
export default videoManager;