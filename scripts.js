(function () {
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
      done();
      return;
    }
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(link);
    var script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = done;
    document.head.appendChild(script);
  }

  function initCalendlyLazy() {
    var slot = document.getElementById('calendly-slot');
    if (!slot) return;
    var url = slot.getAttribute('data-calendly-url');
    if (!url) return;

    function mount() {
      loadCalendlyAssets(function () {
        if (window.Calendly && typeof Calendly.initInlineWidget === 'function') {
          Calendly.initInlineWidget({ url: url, parentElement: slot });
        }
      });
    }

    if (!('IntersectionObserver' in window)) {
      mount();
      return;
    }

    var fired = false;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || fired) return;
          fired = true;
          io.disconnect();
          mount();
        });
      },
      { rootMargin: '120px 0px' }
    );
    io.observe(slot);
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
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    hero.classList.add('motion-seed');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add('is-animated');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initReveals();
      initCalendlyLazy();
      initHeaderScroll();
      initHeroMotion();
    });
  } else {
    initReveals();
    initCalendlyLazy();
    initHeaderScroll();
    initHeroMotion();
  }
})();
