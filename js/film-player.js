/* ============================================================
   CINE BECK — Film Player
   Fullscreen video player with audio, proper cleanup
   ============================================================ */

import { log } from './logger.js';

const VIMEO_BY_FILE = {
  'HistoriaDavi-doc.mp4': '907524644',
  'Amazon-Rally.mp4': '993231887',
  'NikeFootbal.mp4': '394934272',
  'Exilados-doc.mp4': '993225139',
  'Exilio.mp4': '271225511',
  'Hondad-Reality01.mp4': '995137587',
  'Honda-Reality02.mp4': '995141282',
  'Honda-Reality03.mp4': '995142497',
  'SteveSpigel-curtasequenciq.mp4': '995125769',
  'Coletanea.mp4': '995121205',
  'Curta-desaparecido.mp4': '643207792',
  'AdidasPharrel.mp4': '335950430',
  'AlphaRomeu.mp4': '286706361',
  'Bancodobrasil.mp4': '238272652',
  'Buscopam.mp4': '1154088646',
  'Cannon-Amor.mp4': '1129287804',
  'Cupnoodles.mp4': '387761952',
  'Epson-canudos.mp4': '1152351008',
  'Granola.mp4': '317320183',
  'Indaia.mp4': '358948347',
  'Jeep-RENEGADE.mp4': '685965694',
  'JeepGladiator.mp4': '768715500',
  'Marisa.mp4': '296919700',
  'Ora3GWM.mp4': '901557525',
  'Serasa-detetive.mp4': '1024875059',
  'Sonic-TELECINE.mp4': '768766085',
  'SonyBRAVIA.mp4': '394995301',
  'TataExa.mp4': '286706315',
  'Tim-Genius.mp4': '1123868540'
};

const vimeoIdFor = (src) => {
  if (!src) return '';
  let name = String(src).split('?')[0].split('/').pop();
  try { name = decodeURIComponent(name); } catch (_) {}
  return VIMEO_BY_FILE[name] || '';
};

export class FilmPlayer {
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
      <video class="film-player-video" id="filmPlayerVideo" controls playsinline preload="auto"></video>
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
    this.video?.addEventListener('error', () => {
      log.error('FilmPlayer video error', { error: this.video.error?.code, src: this.video.currentSrc || this.video.src });
      if (!this.isOpen) return;
      const id = vimeoIdFor(this.video.currentSrc || this.video.getAttribute('src') || '');
      if (id) this.showVimeo(id);
    });
  }

  showVimeo(id) {
    this.clearVimeo();
    try { this.video.pause(); } catch (_) {}
    this.video.hidden = true;
    const frame = document.createElement('iframe');
    frame.className = 'film-player-embed';
    frame.src = `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0`;
    frame.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.setAttribute('allowfullscreen', '');
    frame.title = 'Filme';
    this.player.appendChild(frame);
    this.frame = frame;
  }

  clearVimeo() {
    if (this.frame) {
      this.frame.remove();
      this.frame = null;
    }
    if (this.video) this.video.hidden = false;
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
    
    this.player.classList.remove('is-open');
    this.clearVimeo();
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
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