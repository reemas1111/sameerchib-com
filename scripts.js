(function () {
  var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;

  function initReveals() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  }

  function loadCalendlyAssets(done) {
    if (window.Calendly) {
      done(true);
      return;
    }
    if (window.__calendlyLoading) {
      window.__calendlyCallbacks.push(done);
      return;
    }
    window.__calendlyLoading = true;
    window.__calendlyCallbacks = [done];
    function finish(ok) {
      var callbacks = window.__calendlyCallbacks || [];
      window.__calendlyCallbacks = [];
      window.__calendlyLoading = false;
      callbacks.forEach(function (cb) { cb(ok); });
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(link);
    var script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = function () { finish(true); };
    script.onerror = function () { finish(false); };
    document.head.appendChild(script);
  }

  function initCalendlyLauncher() {
    var slot = document.getElementById('calendly-slot');
    if (!slot) return;
    var url = slot.getAttribute('data-calendly-url');
    if (!url) return;
    var opener = slot.querySelector('[data-calendly-open]');
    var fallback = slot.querySelector('.calendly-fallback');
    if (!opener) return;

    opener.addEventListener('click', function (event) {
      event.preventDefault();
      loadCalendlyAssets(function (ok) {
        if (ok && window.Calendly && typeof Calendly.initPopupWidget === 'function') {
          Calendly.initPopupWidget({ url: url });
          return;
        }
        if (fallback) {
          window.open(fallback.href, '_blank', 'noopener');
        }
      });
    });
  }

  function initHeaderScroll() {
    var header = document.querySelector('header.site');
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 16) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initHeroMotion() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (prefersReduce) return;
    hero.classList.add('motion-seed');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('is-animated');
      });
    });
  }

  // === Fun motion layer ===

  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;
    if (prefersReduce) return;
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var pct = Math.max(0, Math.min(1, scrollTop / max));
      bar.style.width = (pct * 100) + '%';
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  function initSpotlight() {
    var spot = document.querySelector('.cursor-spotlight');
    if (!spot) return;
    if (prefersReduce || isCoarse) return;
    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var rendered = false;
    function render() {
      spot.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
      rendered = false;
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      spot.classList.add('is-active');
      if (!rendered) {
        rendered = true;
        requestAnimationFrame(render);
      }
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      spot.classList.remove('is-active');
    });
    document.addEventListener('mouseleave', function () {
      spot.classList.remove('is-active');
    });
  }

  function initMagnetic() {
    if (prefersReduce || isCoarse) return;
    var nodes = document.querySelectorAll('[data-magnetic]');
    nodes.forEach(function (el) {
      var rect = null;
      var raf = 0;
      function onEnter() { rect = el.getBoundingClientRect(); }
      function onMove(e) {
        if (!rect) rect = el.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        var strength = 0.25;
        var maxDist = 22;
        var tx = Math.max(-maxDist, Math.min(maxDist, dx * strength));
        var ty = Math.max(-maxDist, Math.min(maxDist, dy * strength));
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'translate3d(' + tx + 'px, ' + ty + 'px, 0)';
        });
      }
      function onLeave() {
        rect = null;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = '';
        });
      }
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    });
  }

  function initTilt() {
    if (prefersReduce || isCoarse) return;
    var nodes = document.querySelectorAll('[data-tilt]');
    nodes.forEach(function (el) {
      var rect = null;
      var raf = 0;
      function onEnter() {
        rect = el.getBoundingClientRect();
        el.classList.add('is-tilting');
      }
      function onMove(e) {
        if (!rect) rect = el.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width; // 0..1
        var ny = (e.clientY - rect.top) / rect.height; // 0..1
        var rotY = (nx - 0.5) * 8; // deg
        var rotX = (0.5 - ny) * 8;
        el.style.setProperty('--tilt-x', (nx * 100) + '%');
        el.style.setProperty('--tilt-y', (ny * 100) + '%');
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'perspective(900px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(0)';
        });
      }
      function onLeave() {
        rect = null;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = '';
          el.classList.remove('is-tilting');
        });
      }
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
    });
  }

  function initCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;
    if (prefersReduce || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) {
        var n = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        el.textContent = n + suffix;
      });
      return;
    }
    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1400;
      var start = performance.now();
      el.classList.add('is-counting');
      function tick(now) {
        var t = Math.min(1, (now - start) / dur);
        // ease-out-expo
        var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        var val = Math.round(target * eased);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (el) {
      el.textContent = '0' + (el.getAttribute('data-suffix') || '');
      io.observe(el);
    });
  }

  function boot() {
    initReveals();
    initCalendlyLauncher();
    initHeaderScroll();
    initHeroMotion();
    initScrollProgress();
    initSpotlight();
    initMagnetic();
    initTilt();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
