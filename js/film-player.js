/* ============================================================
   CINE BECK — Film Player
   Fullscreen video player with audio, proper cleanup
   ============================================================ */

import { log } from './logger.js';

class FilmPlayer {
  constructor(audioManager, videoManager) {
    this.audio = audioManager;
    this.videoManager = videoManager;
    this.player = null;
    this.video = null;
    this.backBtn = null;
    this.audioBtn = null;
    this.audioLabel = null;
    this.bus = null;
    this.returnY = 0;
    this.isOpen = false;
  }
  
  init() {
    this.createPlayer();
    log.info('FilmPlayer initialized');
  }
  
  createPlayer() {
    this.player = document.createElement('div');
    this.player.className = 'film-player';
    this.player.id = 'filmPlayer';
    this.player.hidden = true;
    this.player.innerHTML = `
      <button type="button" class="site-back" id="filmPlayerBack" aria-label="THE LIGHT BREAKS WHERE THERE IS NO SUNSHINE [VOLTE] — voltar à página anterior">
        <span class="site-back-phrase">THE LIGHT BREAKS WHERE THERE IS NO SUNSHINE</span>
        <span class="site-back-volte">[VOLTE]</span>
      </button>
      <video class="film-player-video" id="filmPlayerVideo" playsinline preload="auto"></video>
      <button type="button" class="hero-audio-btn" id="filmPlayerAudioBtn" aria-pressed="false" aria-label="Silenciar filme">
        <span class="hero-audio-btn-ico" aria-hidden="true"></span>
        <span class="hero-audio-btn-label">AUDIO</span>
      </button>
    `;
    document.body.appendChild(this.player);
    
    this.video = document.getElementById('filmPlayerVideo');
    this.backBtn = document.getElementById('filmPlayerBack');
    this.audioBtn = document.getElementById('filmPlayerAudioBtn');
    this.audioLabel = this.audioBtn?.querySelector('.hero-audio-btn-label');
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.backBtn?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });
    
    this.audioBtn?.addEventListener('click', e => {
      e.stopPropagation();
      this.audio.resume();
      this.toggleAudio();
    });
    
    // Listen for open-film event from card previews
    document.addEventListener('cinebeck:open-film', e => {
      if (e.detail?.src) {
        this.open(e.detail.src);
      }
    });
    
    document.addEventListener('keydown', e => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        this.toggleAudio();
      }
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (this.video.paused) this.video.play().catch(_ => {});
        else this.video.pause();
      }
    });
    
    // Video event logging
    this.video?.addEventListener('play', () => log.videoEvent('play', this.video, { context: 'film-player' }));
    this.video?.addEventListener('pause', () => log.videoEvent('pause', this.video, { context: 'film-player' }));
    this.video?.addEventListener('ended', () => log.videoEvent('ended', this.video, { context: 'film-player' }));
    this.video?.addEventListener('error', e => log.error('FilmPlayer video error', { error: this.video.error?.code }));
  }
  
  open(src) {
    if (this.isOpen) return;
    
    this.returnY = window.scrollY || 0;
    this.audio.resume();
    
    if (src && /^https?:/i.test(src) && !src.startsWith(location.origin)) {
      this.video.crossOrigin = 'anonymous';
    }
    
    this.video.src = src;
    this.bus = this.audio.attach(this.video, true); // Start with audio WANTED
    
    // Silence all other media
    this.audio.silenceOthers(this.video);
    this.videoManager.pauseAll();
    
    // Ensure hero video is muted
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
      heroVideo.muted = true;
      const heroBus = heroVideo._stable;
      if (heroBus) heroBus.setWanted(false);
    }
    
    this.player.hidden = false;
    this.player.classList.add('is-open');
    document.body.classList.add('film-open');
    document.body.style.overflow = 'hidden';
    
    this.syncAudioButton();
    
    this.video.play()
      .then(() => log.videoEvent('play', this.video, { context: 'film-player-open' }))
      .catch(() => {
        // If play fails, mute and try again
        this.bus.setWanted(false);
        this.syncAudioButton();
        this.video.muted = true;
        this.video.play().catch(_ => {});
      });
    
    this.isOpen = true;
    log.info('FilmPlayer opened', { src });
  }
  
  close() {
    if (!this.isOpen) return;
    
    if (this.bus) {
      this.bus.setWanted(false);
      this.bus.destroy();
      this.bus = null;
    }
    
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
    
    this.player.classList.remove('is-open');
    this.player.hidden = true;
    document.body.classList.remove('film-open');
    document.body.style.overflow = '';
    window.scrollTo(0, this.returnY);
    
    // Restore hero video (muted)
    const heroVideo = document.getElementById('heroVideo');
    if (heroVideo) {
      heroVideo.muted = true;
      const heroBus = heroVideo._stable;
      if (heroBus) heroBus.setWanted(false);
      heroVideo.play().catch(_ => {});
    }
    
    this.isOpen = false;
    log.info('FilmPlayer closed');
  }
  
  toggleAudio() {
    if (!this.bus) return;
    
    this.audio.resume();
    const currentlyAudible = this.bus.isAudible();
    
    if (currentlyAudible) {
      this.bus.setWanted(false);
    } else {
      this.video.muted = false;
      this.audio.silenceOthers(this.video);
      this.bus.setWanted(true);
      this.video.play().catch(_ => {});
    }
    
    this.syncAudioButton();
  }
  
  syncAudioButton() {
    if (!this.audioBtn || !this.bus) return;
    
    const muted = !this.bus.isAudible();
    this.audioBtn.classList.toggle('is-muted', muted);
    this.audioBtn.setAttribute('aria-pressed', String(muted));
    this.audioBtn.setAttribute('aria-label', muted ? 'Ativar som do filme' : 'Silenciar filme');
    if (this.audioLabel) this.audioLabel.textContent = muted ? 'MUTED' : 'AUDIO';
  }
  
  destroy() {
    if (this.isOpen) this.close();
    if (this.player) {
      this.player.remove();
      this.player = null;
    }
  }
}
export default FilmPlayer;