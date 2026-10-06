(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* Year in footer */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* Nav: shadow on scroll + mobile menu */
  const nav = document.querySelector('.nav');
  const toggle = nav.querySelector('.nav__toggle');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = open => {
    nav.toggleAttribute('data-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!nav.hasAttribute('data-open')));
  nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Stagger siblings that share a parent
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 4) * 90}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    reveals.forEach(el => io.observe(el));
  }

  /* Spaces accordion
     Desktop: hover or focus opens a space, click pins it open.
     Touch: tap toggles. */
  const accordion = document.querySelector('[data-accordion]');
  if (accordion) {
    const spaces = [...accordion.querySelectorAll('[data-space]')];
    let pinned = null;

    const open = target => {
      spaces.forEach(space => {
        const active = space === target;
        space.classList.toggle('is-active', active);
        space.querySelector('.space__tab').setAttribute('aria-expanded', String(active));
      });
    };

    spaces.forEach(space => {
      const tab = space.querySelector('.space__tab');

      space.addEventListener('mouseenter', () => { if (canHover.matches) open(space); });
      tab.addEventListener('focus', () => { if (canHover.matches) open(space); });

      tab.addEventListener('click', () => {
        if (canHover.matches) {
          pinned = pinned === space ? null : space;
          open(pinned || space);
        } else {
          const isOpen = space.classList.contains('is-active');
          pinned = isOpen ? null : space;
          open(pinned);
        }
      });
    });

    accordion.addEventListener('mouseleave', () => { if (canHover.matches) open(pinned); });

    // Arrow keys move between spaces
    accordion.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      const tabs = spaces.map(s => s.querySelector('.space__tab'));
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const step = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.focus();
      if (!canHover.matches) { pinned = next.closest('[data-space]'); open(pinned); }
    });

    // On touch layouts, start with the first space open so the pattern is obvious
    if (!canHover.matches) { pinned = spaces[0]; open(pinned); }
  }

  /* Reviews carousel */
  const track = document.querySelector('[data-carousel]');
  if (track) {
    const slides = [...track.children];
    const dotsWrap = document.querySelector('.reviews__dots');
    let index = Math.min(1, slides.length - 1);
    let timer = null;

    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Review ${i + 1}`);
      b.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });

    const go = i => {
      index = (i + slides.length) % slides.length;
      const slide = slides[index];
      const offset = slide.offsetLeft + slide.offsetWidth / 2 - track.parentElement.clientWidth / 2;
      track.style.transform = `translateX(${-offset}px)`;
      slides.forEach((s, n) => {
        s.classList.toggle('is-active', n === index);
        s.setAttribute('aria-hidden', String(n !== index));
      });
      dots.forEach((d, n) => d.setAttribute('aria-selected', String(n === index)));
    };

    const stop = () => { clearInterval(timer); timer = null; };
    const restart = () => {
      stop();
      if (!reduceMotion) timer = setInterval(() => go(index + 1), 6000);
    };

    slides.forEach((s, i) => s.addEventListener('click', () => { if (i !== index) { go(i); restart(); } }));

    // Swipe
    let startX = null;
    track.addEventListener('pointerdown', e => { startX = e.clientX; stop(); });
    window.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      restart();
    });

    const section = track.closest('section');
    section.addEventListener('mouseenter', stop);
    section.addEventListener('mouseleave', restart);
    section.addEventListener('focusin', stop);
    section.addEventListener('focusout', restart);

    window.addEventListener('resize', () => go(index));
    go(index);
    restart();
  }
})();

/* Sticky "night changes" section: pin at the nav, or by its bottom edge if taller than the screen */
(() => {
  const night = document.querySelector('.night');
  if (!night) return;
  const NAV = 72;
  const set = () => {
    const top = Math.min(NAV, window.innerHeight - night.offsetHeight);
    night.style.setProperty('--night-top', `${top}px`);
  };
  set();
  window.addEventListener('resize', set);
  window.addEventListener('load', set);
})();

/* Background videos: fade in once playing, pause when offscreen, respect reduced motion */
(() => {
  const videos = [...document.querySelectorAll('.bg-video')];
  if (!videos.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  videos.forEach(v => {
    const show = () => { v.classList.add('is-playing'); v.parentElement.classList.add('has-video'); };
    v.addEventListener('playing', show);
    v.addEventListener('timeupdate', show, { once: true });
    if (!v.paused && v.readyState > 2) show();
    v.addEventListener('error', () => { v.classList.remove('is-playing'); v.parentElement.classList.remove('has-video'); }, true);
  });

  const tryPlay = v => {
    if (reduce.matches) return;
    if (v.dataset.lazyVideo !== undefined && v.preload === 'none') v.preload = 'auto';
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };

  if (!('IntersectionObserver' in window)) { videos.forEach(tryPlay); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) tryPlay(v); else v.pause();
    });
  }, { rootMargin: '200px 0px' });
  videos.forEach(v => io.observe(v));

  reduce.addEventListener?.('change', () => videos.forEach(v => reduce.matches ? v.pause() : tryPlay(v)));
})();
