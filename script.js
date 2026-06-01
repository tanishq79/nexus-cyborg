/* ══════════════════════════════════════════
   NEXUS CYBORG — script.js
   Particles · Cursor · Nav · Reveal · Stats
   ══════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── UTILS ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ════════════════════════════════
     1.  PARTICLE CANVAS
  ════════════════════════════════ */
  const initParticles = () => {
    const canvas = $('#particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [], raf;
    const PARTICLE_COUNT = 90;
    const MAX_DIST = 120;
    const CYAN   = '0,240,255';
    const PURPLE = '189,0,255';

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x  = Math.random() * W;
        this.y  = init ? Math.random() * H : H + 10;
        this.vx = (Math.random() - .5) * .4;
        this.vy = -(Math.random() * .5 + .1);
        this.r  = Math.random() * 1.5 + .5;
        this.alpha = Math.random() * .5 + .1;
        this.color = Math.random() > .5 ? CYAN : PURPLE;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -10 || this.x < -10 || this.x > W + 10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
        ctx.fill();
      }
    }

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * .12;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${a.color},${alpha})`;
            ctx.lineWidth = .6;
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      raf = requestAnimationFrame(loop);
    };

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    loop();
    window.addEventListener('resize', () => { resize(); });
  };

  /* ════════════════════════════════
     2.  CUSTOM CURSOR
  ════════════════════════════════ */
  const initCursor = () => {
    const ring = $('#cursorRing');
    const dot  = $('#cursorDot');
    if (!ring || !dot) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      requestAnimationFrame(animate);
    };
    animate();

    // Hide on touch
    document.addEventListener('touchstart', () => {
      ring.style.display = 'none';
      dot.style.display  = 'none';
    }, { once: true });
  };

  /* ════════════════════════════════
     3.  NAVBAR SCROLL STATE
  ════════════════════════════════ */
  const initNavbar = () => {
    const nav = $('#navbar');
    if (!nav) return;
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', update, { passive: true });
    update();
  };

  /* ════════════════════════════════
     4.  HAMBURGER / MOBILE MENU
  ════════════════════════════════ */
  const initMobileMenu = () => {
    const btn  = $('#hamburger');
    const menu = $('#mobileMenu');
    if (!btn || !menu) return;
    const links = $$('.mob-link', menu);

    const toggle = (open) => {
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = $$('span', btn);
      if (open) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    };

    btn.addEventListener('click', () => toggle(!menu.classList.contains('open')));
    links.forEach(l => l.addEventListener('click', () => toggle(false)));
  };

  /* ════════════════════════════════
     5.  SMOOTH SCROLL (for <a href="#...">)
  ════════════════════════════════ */
  const initSmoothScroll = () => {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 68; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  /* ════════════════════════════════
     6.  SCROLL REVEAL (IntersectionObserver)
  ════════════════════════════════ */
  const initReveal = () => {
    const els = $$('.reveal-up, .reveal-left, .reveal-right');
    if (!els.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => io.observe(el));
  };

  /* ════════════════════════════════
     7.  ANIMATED STAT COUNTERS
  ════════════════════════════════ */
  const initCounters = () => {
    const blocks = $$('.stat-block');
    if (!blocks.length) return;

    const configs = [
      { target: 4700,  suffix: 'M+',  duration: 1800 },
      { target: 99,    suffix: '.98%', duration: 1200 },
      { target: 0,     suffix: '.3ms', duration: 800  },
      { target: 1,     suffix: ' PB',  duration: 800  },
      { target: 256,   suffix: ' Q',   duration: 1400 },
      { target: 10000, suffix: '×',    duration: 2000 },
    ];

    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const animate = (el, cfg) => {
      const numEl = el.querySelector('.stat-num');
      const fill  = el.querySelector('.stat-fill');
      if (!numEl) return;

      el.classList.add('animated');
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / cfg.duration, 1);
        const val = Math.round(easeOut(t) * cfg.target);
        numEl.textContent = val + cfg.suffix;
        if (t < 1) requestAnimationFrame(step);
        else numEl.textContent = cfg.target + cfg.suffix;
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = blocks.indexOf(entry.target);
        if (idx !== -1) animate(entry.target, configs[idx]);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    blocks.forEach(b => io.observe(b));
  };

  /* ════════════════════════════════
     8.  FEAT CARD FILL TRIGGER
  ════════════════════════════════ */
  const initFeatFills = () => {
    const fills = $$('.feat-fill');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    }, { threshold: 0.5 });
    fills.forEach(f => {
      f.style.animationPlayState = 'paused';
      io.observe(f);
    });
  };

  /* ════════════════════════════════
     9.  HOVER TILT ON CARDS
  ════════════════════════════════ */
  const initCardTilt = () => {
    const cards = $$('.feat-card, .stat-block, .tl-card, .layer-content');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - .5;
        const y = (e.clientY - rect.top)  / rect.height - .5;
        card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  };

  /* ════════════════════════════════
     10.  CONTACT FORM SUBMIT (mock)
  ════════════════════════════════ */
  const initForm = () => {
    const btn   = $('#submitBtn');
    const toast = $('#toast');
    const msg   = $('#toastMsg');
    if (!btn || !toast) return;

    btn.addEventListener('click', () => {
      btn.textContent = 'TRANSMITTING…';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = `
          <span class="btn-glow"></span>
          TRANSMIT REQUEST
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4z"/></svg>`;
        btn.disabled = false;

        msg.textContent = 'Transmission received. We will contact you shortly.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
      }, 1600);
    });
  };

  /* ════════════════════════════════
     11.  GLITCH TITLE EFFECT (Hero)
  ════════════════════════════════ */
  const initGlitch = () => {
    const title = $('.hero-title');
    if (!title) return;

    const CHARS = '▓▒░█▄▀╔╗╚╝';
    let glitching = false;

    const glitch = () => {
      if (glitching) return;
      glitching = true;
      const lines = $$('.title-line', title);

      let iterations = 0;
      const interval = setInterval(() => {
        lines.forEach(line => {
          if (Math.random() > .7) {
            const orig = line.dataset.orig || line.textContent;
            line.dataset.orig = orig;
            line.textContent = orig.split('').map((c, i) =>
              i < iterations ? c : Math.random() > .7 ? CHARS[Math.floor(Math.random() * CHARS.length)] : c
            ).join('');
          }
        });
        if (iterations >= 8) {
          clearInterval(interval);
          lines.forEach(l => { if (l.dataset.orig) l.textContent = l.dataset.orig; });
          glitching = false;
        }
        iterations++;
      }, 50);
    };

    // Trigger glitch randomly
    setInterval(() => { if (Math.random() > .7) glitch(); }, 5000);
    title.addEventListener('mouseenter', glitch);
  };

  /* ════════════════════════════════
     12.  TYPING EFFECT — status bar
  ════════════════════════════════ */
  const initTyping = () => {
    const statusText = $('.status-text');
    if (!statusText) return;

    const messages = [
      'CORTEX SYNC: NOMINAL',
      'QUANTUM BRIDGE: ACTIVE',
      'BIO-SYNC: 99.98%',
      'NEURAL LATENCY: 0.3ms',
      'ENCRYPTION: ENABLED',
    ];
    let idx = 0;

    setInterval(() => {
      idx = (idx + 1) % messages.length;
      const target = messages[idx];
      statusText.textContent = '';
      let ci = 0;
      const t = setInterval(() => {
        statusText.textContent += target[ci++];
        if (ci >= target.length) clearInterval(t);
      }, 40);
    }, 3000);
  };

  /* ════════════════════════════════
     13.  PARALLAX (hero orbs on scroll)
  ════════════════════════════════ */
  const initParallax = () => {
    const orbs = $$('.orb');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.12;
        orb.style.transform = `translateY(${y * speed}px)`;
      });
    }, { passive: true });
  };

  /* ════════════════════════════════
     INIT ALL
  ════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursor();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initReveal();
    initCounters();
    initFeatFills();
    initCardTilt();
    initForm();
    initGlitch();
    initTyping();
    initParallax();
  });

})();