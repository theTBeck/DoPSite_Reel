/* ============================================================
   CINE BECK — Audio Manager
   Single AudioContext singleton, stable gain control for Bluetooth
   ============================================================ */

import { log } from './logger.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.suspended = true;
    this.mediaElements = new Map(); // videoEl -> { gain, wanted }
  }
  
  init() {
    this.createContext();
    this.initialized = true;
    log.info('AudioManager initialized');
  }
  
  createContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      log.warn('Web Audio API not supported');
      return;
    }
    
    try {
      this.ctx = new AudioCtx({ latencyHint: 'playback' });
      this.suspended = this.ctx.state === 'suspended';
      log.debug('AudioContext created', { state: this.ctx.state });
    } catch (e) {
      try {
        this.ctx = new AudioCtx();
        this.suspended = this.ctx.state === 'suspended';
      } catch (e2) {
        log.error('Failed to create AudioContext', { error: e2.message });
        this.ctx = null;
      }
    }
  }
  
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.suspended = false;
        log.info('AudioContext resumed');
      }).catch(e => log.error('AudioContext resume failed', { error: e.message }));
    }
  }
  
  /**
   * Attach stable audio control to a video element.
   * Uses GainNode instead of .muted to avoid Bluetooth A2DP renegotiation.
   * @param {HTMLVideoElement} videoEl
   * @param {boolean} initialWanted - initial audible state (default: false = muted)
   * @returns {Object} control bus { setWanted, isAudible, destroy }
   */
  attach(videoEl, initialWanted = false) {
    if (!videoEl) return this.createFallbackBus(initialWanted);
    if (this.mediaElements.has(videoEl)) {
      return this.mediaElements.get(videoEl);
    }
    
    const bus = {
      el: videoEl,
      gain: null,
      wanted: initialWanted,
      sourceNode: null,
      
      apply() {
        const on = !!this.wanted;
        if (this.gain) {
          this.gain.gain.value = on ? 1 : 0;
          this.el.muted = false;
          this.el.volume = 1;
        } else {
          this.el.muted = !on;
          this.el.volume = on ? 1 : 0;
        }
      },
      
      setWanted(on) {
        this.wanted = !!on;
        this.apply();
        log.debug('Audio wanted changed', { wanted: this.wanted, src: this.el.src });
      },
      
      isAudible() {
        return !!this.wanted;
      },
      
      destroy() {
        if (this.sourceNode) {
          try { this.sourceNode.disconnect(); } catch (_) {}
          this.sourceNode = null;
        }
        if (this.gain) {
          try { this.gain.disconnect(); } catch (_) {}
          this.gain = null;
        }
        this.mediaElements.delete(this.el);
      }
    };
    
    // Set up Web Audio routing if possible
    try {
      if (videoEl.src && /^https?:/i.test(videoEl.src) && !videoEl.src.startsWith(location.origin)) {
        videoEl.crossOrigin = 'anonymous';
      }
      
      if (this.ctx) {
        bus.sourceNode = this.ctx.createMediaElementSource(videoEl);
        bus.gain = this.ctx.createGain();
        bus.sourceNode.connect(bus.gain);
        bus.gain.connect(this.ctx.destination);
      }
    } catch (e) {
      log.warn('Web Audio routing failed, using native mute', { error: e.message });
      bus.gain = null;
    }
    
    videoEl.playsInline = true;
    videoEl.preload = 'metadata'; // Changed from 'auto' - critical for performance
    videoEl.defaultPlaybackRate = 1;
    videoEl.playbackRate = 1;
    
    bus.apply();
    this.mediaElements.set(videoEl, bus);
    
    // Clean up on element removal
    const observer = new MutationObserver(() => {
      if (!document.contains(videoEl)) bus.destroy();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    bus._observer = observer;
    
    return bus;
  }
  
  createFallbackBus(initialWanted) {
    return {
      wanted: initialWanted,
      setWanted(on) { this.wanted = !!on; },
      isAudible() { return !!this.wanted; },
      destroy() {}
    };
  }
  
  /**
   * Silence all media except the specified one
   * @param {HTMLMediaElement} exceptEl - element to keep audible
   */
  silenceOthers(exceptEl) {
    this.mediaElements.forEach((bus, el) => {
      if (el !== exceptEl) {
        bus.setWanted(false);
      }
    });
    log.debug('Silenced other media', { except: exceptEl?.src });
  }
  
  /**
   * Pause all video elements
   */
  pauseAll() {
    this.mediaElements.forEach((bus, el) => {
      if (!el.paused) {
        el.pause();
        log.videoEvent('pause', el);
      }
    });
  }
  
  destroy() {
    this.mediaElements.forEach(bus => bus.destroy());
    this.mediaElements.clear();
    if (this.ctx) {
      this.ctx.close().catch(_ => {});
      this.ctx = null;
    }
    this.initialized = false;
  }
  
  /**
   * Check if any media element currently has audio wanted
   * @returns {boolean}
   */
  isAnyAudible() {
    for (const bus of this.mediaElements.values()) {
      if (bus.isAudible()) return true;
    }
    return false;
  }
}

export const audioManager = new AudioManager();
export default audioManager;