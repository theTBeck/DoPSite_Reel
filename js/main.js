/* ============================================================
   CINE BECK — interações
   ============================================================ */

/* ---------- header: fundo ao rolar + slate scrollspy ---------- */
const head = document.getElementById("siteHead");
const slate = document.getElementById("headSlate");
const brand = document.getElementById("brandLink");
const sections = [...document.querySelectorAll("[data-reel]")];

const onScrollHead = () => head.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onScrollHead, { passive: true });
onScrollHead();

/* C.BECK → frase (evolução no Hero) */
if (brand) {
  const evolve = () => brand.classList.add("is-evolved");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) evolve();
  else window.setTimeout(evolve, 1600);
}

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        slate.textContent = `REEL ${en.target.dataset.reel} — ${en.target.dataset.label}`;
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);
sections.forEach((s) => spy.observe(s));

/* ---------- áudio estável p/ Bluetooth (A2DP): gain/volume, sem mute brusco ---------- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let sharedAudioCtx = null;
const getAudioCtx = () => {
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtx({ latencyHint: "playback" });
    } catch (_) {
      try { sharedAudioCtx = new AudioCtx(); } catch (__) { return null; }
    }
  }
  return sharedAudioCtx;
};

/** Controla nível sem toggles de .muted (evita renegociação/corte no Bluetooth). */
const attachStableAudio = (el) => {
  if (!el) return null;
  if (el._stable) return el._stable;
  const bus = {
    el,
    gain: null,
    wanted: true,
    apply() {
      const on = !!bus.wanted;
      if (bus.gain) {
        bus.gain.gain.value = on ? 1 : 0;
        el.muted = false;
        el.volume = 1;
      } else {
        el.muted = false;
        el.volume = on ? 1 : 0;
      }
    },
    setWanted(on) {
      bus.wanted = !!on;
      bus.apply();
    },
    isAudible() {
      return !!bus.wanted;
    },
  };

  try {
    if (el.src && /^https?:/i.test(el.src) && !el.src.startsWith(location.origin)) {
      el.crossOrigin = "anonymous";
    }
    const ctx = getAudioCtx();
    if (ctx) {
      const srcNode = ctx.createMediaElementSource(el);
      bus.gain = ctx.createGain();
      srcNode.connect(bus.gain);
      bus.gain.connect(ctx.destination);
    }
  } catch (_) {
    bus.gain = null;
  }

  el.playsInline = true;
  el.preload = "auto";
  el.defaultPlaybackRate = 1;
  el.playbackRate = 1;
  el._stable = bus;
  bus.apply();
  return bus;
};

const resumeAudioCtx = () => {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
};

/* ---------- vídeo do hero: autoplay com trilha + mute manual (versão estável) ---------- */
const video = document.getElementById("heroVideo");
const audioBtn = document.getElementById("heroAudioBtn");
const audioLabel = audioBtn?.querySelector(".hero-audio-btn-label");

const syncAudioBtn = () => {
  if (!audioBtn || !video) return;
  const muted = !!video.muted;
  audioBtn.classList.toggle("is-muted", muted);
  audioBtn.setAttribute("aria-pressed", String(muted));
  audioBtn.setAttribute("aria-label", muted ? "Ativar som do reel" : "Silenciar reel");
  if (audioLabel) audioLabel.textContent = muted ? "MUTED" : "AUDIO";
};

const playHero = () => video.play().catch(() => {});

video.muted = false;
video.volume = 1;
syncAudioBtn();

video.play().catch(() => {
  /* browsers bloqueiam autoplay com som — mantém imagem e espera gesto */
  video.muted = true;
  syncAudioBtn();
  playHero();
  const unlock = () => {
    if (!video.muted) return;
    video.muted = false;
    video.volume = 1;
    if (typeof silenceOtherAudio === "function") silenceOtherAudio(video);
    syncAudioBtn();
    playHero();
  };
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
});

if (audioBtn) {
  audioBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted) {
      video.volume = 1;
      if (typeof silenceOtherAudio === "function") silenceOtherAudio(video);
      playHero();
    }
    syncAudioBtn();
  });
}

/* ---------- timecode do viewfinder (24 fps) ---------- */
const tc = document.getElementById("timecode");
const pad2 = (n) => String(n).padStart(2, "0");
const tcLoop = () => {
  const t = video.currentTime || 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const f = Math.floor((t % 1) * 24);
  tc.textContent = `${pad2(h)}:${pad2(m)}:${pad2(s)}:${pad2(f)}`;
  requestAnimationFrame(tcLoop);
};
requestAnimationFrame(tcLoop);

/* ---------- mega menu ---------- */
const menuBtn = document.getElementById("menuBtn");
const mega = document.getElementById("megaMenu");
const megaImg = document.getElementById("megaImg");
const megaLinks = [...mega.querySelectorAll("a")];

const setMenu = (open) => {
  mega.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  mega.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
};
menuBtn.addEventListener("click", () => setMenu(!mega.classList.contains("open")));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mega.classList.contains("open")) setMenu(false);
});
megaLinks.forEach((a) => {
  a.addEventListener("mouseenter", () => {
    const src = a.dataset.img;
    if (src && !megaImg.src.endsWith(src)) megaImg.src = src;
  });
  a.addEventListener("focus", () => {
    const src = a.dataset.img;
    if (src) megaImg.src = src;
  });
  a.addEventListener("click", () => setMenu(false));
});

/* ---------- reveals por scroll ---------- */
const revealIO = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        revealIO.unobserve(en.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".rv").forEach((el) => revealIO.observe(el));

/* ---------- reel fullpage: autoplay mudo (antes do Contato) ---------- */
const reelMaster = document.getElementById("reelMasterVideo");
if (reelMaster) {
  const kickMuted = () => {
    reelMaster.muted = true;
    reelMaster.defaultMuted = true;
    reelMaster.setAttribute("muted", "");
    reelMaster.play().catch(() => {});
  };
  reelMaster.loop = true;
  reelMaster.playsInline = true;
  reelMaster.preload = "auto";
  kickMuted();
  const reelWatch = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) kickMuted();
        else reelMaster.pause();
      });
    },
    { threshold: 0.15 }
  );
  reelWatch.observe(document.getElementById("reel") || reelMaster);
  reelMaster.addEventListener("canplay", () => {
    if (reelMaster.paused) kickMuted();
  });
  reelMaster.addEventListener("loadeddata", () => {
    if (reelMaster.paused) kickMuted();
  });
  document.addEventListener("pointerdown", kickMuted, { once: true });
}

/* ---------- player fullscreen: clique no card = autoplay com áudio ---------- */
const filmPlayer = document.createElement("div");
filmPlayer.className = "film-player";
filmPlayer.id = "filmPlayer";
filmPlayer.setAttribute("hidden", "");
filmPlayer.innerHTML = `
  <button type="button" class="site-back" id="filmPlayerBack" aria-label="THE LIGHT BREAKS WERE IS NO SHUNSHINE [VOLTE] — voltar à página anterior">
    <span class="site-back-phrase">THE LIGHT BREAKS WERE IS NO SHUNSHINE</span>
    <span class="site-back-volte">[VOLTE]</span>
  </button>
  <video class="film-player-video" id="filmPlayerVideo" playsinline preload="auto"></video>
  <button type="button" class="hero-audio-btn" id="filmPlayerAudioBtn" aria-pressed="false" aria-label="Silenciar filme">
    <span class="hero-audio-btn-ico" aria-hidden="true"></span>
    <span class="hero-audio-btn-label">AUDIO</span>
  </button>
`;
document.body.appendChild(filmPlayer);

const filmVideo = document.getElementById("filmPlayerVideo");
const filmBack = document.getElementById("filmPlayerBack");
const filmAudioBtn = document.getElementById("filmPlayerAudioBtn");
const filmAudioLabel = filmAudioBtn?.querySelector(".hero-audio-btn-label");
let filmBus = null;
let filmReturnY = 0;

const ensureFilmBus = () => {
  if (!filmBus) filmBus = attachStableAudio(filmVideo);
  return filmBus;
};

const syncFilmAudioBtn = () => {
  const bus = filmBus || filmVideo?._stable;
  if (!filmAudioBtn || !bus) return;
  const muted = !bus.isAudible();
  filmAudioBtn.classList.toggle("is-muted", muted);
  filmAudioBtn.setAttribute("aria-pressed", String(muted));
  filmAudioBtn.setAttribute("aria-label", muted ? "Ativar som do filme" : "Silenciar filme");
  if (filmAudioLabel) filmAudioLabel.textContent = muted ? "MUTED" : "AUDIO";
};

/**
 * Silencia outras mídias. Hero usa .muted nativo (sem Web Audio).
 * Previews de card podem pausar — são sempre mudos.
 */
const silenceOtherAudio = (except) => {
  document.querySelectorAll("video, audio").forEach((media) => {
    if (except && media === except) return;
    try {
      if (media.classList.contains("card-video") || media === reelMaster) {
        media.muted = true;
        media.pause();
        return;
      }
      if (media === video) {
        media.muted = true;
        return;
      }
      if (media._stable) {
        media._stable.setWanted(false);
      } else {
        media.muted = true;
        media.volume = 0;
      }
    } catch (_) {}
  });
  if (except !== video) syncAudioBtn();
  if (except !== filmVideo) syncFilmAudioBtn();
};

const closeFilmPlayer = () => {
  if (filmBus) filmBus.setWanted(false);
  filmVideo.pause();
  filmVideo.removeAttribute("src");
  filmVideo.load();
  filmPlayer.classList.remove("is-open");
  filmPlayer.setAttribute("hidden", "");
  document.body.classList.remove("film-open");
  document.body.style.overflow = "";
  window.scrollTo(0, filmReturnY);
  /* volta: hero imagem sem trilha por cima do ambiente */
  if (video) {
    video.muted = true;
    syncAudioBtn();
    playHero();
  }
};

const openFilmPlayer = (src) => {
  filmReturnY = window.scrollY || 0;
  resumeAudioCtx();
  if (src && /^https?:/i.test(src) && !src.startsWith(location.origin)) {
    filmVideo.crossOrigin = "anonymous";
  }
  filmVideo.src = src;
  const bus = ensureFilmBus();
  silenceOtherAudio(filmVideo);
  filmPlayer.removeAttribute("hidden");
  filmPlayer.classList.add("is-open");
  document.body.classList.add("film-open");
  document.body.style.overflow = "hidden";

  filmVideo.muted = false;
  bus.setWanted(true);
  syncFilmAudioBtn();
  silenceOtherAudio(filmVideo);

  filmVideo.play().catch(() => {
    bus.setWanted(false);
    filmVideo.muted = true;
    syncFilmAudioBtn();
    filmVideo.play().catch(() => {});
  });
};

filmBack?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeFilmPlayer();
});

filmAudioBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  resumeAudioCtx();
  const bus = ensureFilmBus();
  if (bus.isAudible()) {
    bus.setWanted(false);
  } else {
    filmVideo.muted = false;
    silenceOtherAudio(filmVideo);
    bus.setWanted(true);
    filmVideo.play().catch(() => {});
  }
  syncFilmAudioBtn();
});

document.addEventListener("keydown", (e) => {
  if (!filmPlayer.classList.contains("is-open")) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeFilmPlayer();
  }
  if (e.key.toLowerCase() === "m") {
    const bus = ensureFilmBus();
    if (bus.isAudible()) bus.setWanted(false);
    else {
      filmVideo.muted = false;
      silenceOtherAudio(filmVideo);
      bus.setWanted(true);
    }
    syncFilmAudioBtn();
  }
});

/* ---------- cards: preview mute no hover + clique abre player com áudio ---------- */
const finePointer = window.matchMedia("(pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mp4Cards = document.querySelectorAll("a.card[href*='.mp4']");

mp4Cards.forEach((card) => {
  card.addEventListener("click", (e) => {
    const href = card.getAttribute("href");
    if (!href || !/\.mp4($|\?)/i.test(href)) return;
    e.preventDefault();
    e.stopPropagation();
    openFilmPlayer(href);
  });
});

if (finePointer && !reduceMotion) {
  mp4Cards.forEach((card) => {
    const fig = card.querySelector(".card-fig");
    if (!fig) return;

    const preview = document.createElement("video");
    preview.className = "card-video";
    preview.muted = true;
    preview.loop = true;
    preview.playsInline = true;
    preview.setAttribute("muted", "");
    preview.setAttribute("playsinline", "");
    preview.preload = "none";
    fig.appendChild(preview);

    let armed = false;

    card.addEventListener("mouseenter", () => {
      if (filmPlayer.classList.contains("is-open")) return;
      /* com trilha ativa, não dispara preview — poupa CPU */
      if ((video && !video.muted) || filmBus?.isAudible()) return;
      if (!armed) {
        preview.src = card.getAttribute("data-preview") || card.getAttribute("href");
        armed = true;
      }
      preview.muted = true;
      preview.volume = 0;
      card.classList.add("is-playing");
      const play = preview.play();
      if (play) play.catch(() => card.classList.remove("is-playing"));
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-playing");
      preview.pause();
      try { preview.currentTime = 0; } catch (_) {}
    });
  });
}

/* Ao sair para reel-v4: desliga áudio da home para não interferir */
document.querySelectorAll('a[href="reel-v4.html"]').forEach((link) => {
  link.addEventListener("click", () => {
    silenceOtherAudio(null);
  });
});
