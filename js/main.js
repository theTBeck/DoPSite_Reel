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

/* ---------- vídeo do hero: autoplay com trilha + mute manual ---------- */
const video = document.getElementById("heroVideo");
const audioBtn = document.getElementById("heroAudioBtn");
const audioLabel = audioBtn?.querySelector(".hero-audio-btn-label");

const syncAudioBtn = () => {
  if (!audioBtn) return;
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
  /* browsers block unmuted autoplay — keep picture, wait for mute toggle */
  video.muted = true;
  syncAudioBtn();
  playHero();
  const unlock = () => {
    if (!video.paused) return;
    playHero();
  };
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });
});

if (audioBtn) {
  audioBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted) playHero();
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

/* ---------- reel fullpage: autoplay do master ---------- */
const reelMaster = document.getElementById("reelMasterVideo");
if (reelMaster) {
  reelMaster.muted = true;
  const tryReel = () => reelMaster.play().catch(() => {});
  tryReel();
  const reelWatch = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) tryReel();
        else reelMaster.pause();
      });
    },
    { threshold: 0.2 }
  );
  reelWatch.observe(reelMaster);
  document.addEventListener("pointerdown", tryReel, { once: true });
}

/* ---------- player fullscreen: clique no card = autoplay com áudio ---------- */
const filmPlayer = document.createElement("div");
filmPlayer.className = "film-player";
filmPlayer.id = "filmPlayer";
filmPlayer.setAttribute("hidden", "");
filmPlayer.innerHTML = `
  <a class="site-back" href="#hero" id="filmPlayerBack" aria-label="THE LIGHT BREAKS WERE IS NO SHUNSHINE [VOLTE] — voltar">
    <span class="site-back-phrase">THE LIGHT BREAKS WERE IS NO SHUNSHINE</span>
    <span class="site-back-volte">[VOLTE]</span>
  </a>
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

const syncFilmAudioBtn = () => {
  if (!filmAudioBtn) return;
  const muted = !!filmVideo.muted;
  filmAudioBtn.classList.toggle("is-muted", muted);
  filmAudioBtn.setAttribute("aria-pressed", String(muted));
  filmAudioBtn.setAttribute("aria-label", muted ? "Ativar som do filme" : "Silenciar filme");
  if (filmAudioLabel) filmAudioLabel.textContent = muted ? "MUTED" : "AUDIO";
};

const closeFilmPlayer = () => {
  filmVideo.pause();
  filmVideo.removeAttribute("src");
  filmVideo.load();
  filmPlayer.classList.remove("is-open");
  filmPlayer.setAttribute("hidden", "");
  document.body.style.overflow = "";
};

const openFilmPlayer = (src) => {
  filmPlayer.removeAttribute("hidden");
  filmPlayer.classList.add("is-open");
  document.body.style.overflow = "hidden";
  filmVideo.src = src;
  filmVideo.muted = false;
  filmVideo.volume = 1;
  syncFilmAudioBtn();
  filmVideo.play().catch(() => {
    filmVideo.muted = true;
    syncFilmAudioBtn();
    filmVideo.play().catch(() => {});
  });
};

filmBack?.addEventListener("click", (e) => {
  e.preventDefault();
  closeFilmPlayer();
});

filmAudioBtn?.addEventListener("click", () => {
  filmVideo.muted = !filmVideo.muted;
  if (!filmVideo.muted) filmVideo.play().catch(() => {});
  syncFilmAudioBtn();
});

document.addEventListener("keydown", (e) => {
  if (!filmPlayer.classList.contains("is-open")) return;
  if (e.key === "Escape") closeFilmPlayer();
  if (e.key.toLowerCase() === "m") {
    filmVideo.muted = !filmVideo.muted;
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
    openFilmPlayer(href);
  });
});

if (finePointer && !reduceMotion) {
  mp4Cards.forEach((card) => {
    const fig = card.querySelector(".card-fig");
    if (!fig) return;

    const video = document.createElement("video");
    video.className = "card-video";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.preload = "none";
    fig.appendChild(video);

    let armed = false;

    card.addEventListener("mouseenter", () => {
      if (!armed) {
        video.src = card.getAttribute("data-preview") || card.getAttribute("href");
        armed = true;
      }
      card.classList.add("is-playing");
      const play = video.play();
      if (play) play.catch(() => card.classList.remove("is-playing"));
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-playing");
      video.pause();
      try { video.currentTime = 0; } catch (_) {}
    });
  });
}
