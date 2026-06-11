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


  // === AI Readiness Assessment (ported from asi intelligence) ===
  // Six dimensions, five anchors each, weighted scoring rescaled to 0-30.
  // Scored entirely in the browser. Nothing leaves the page.

  var ASSESS_DIMS = [
    { id: 'data', name: 'CRM data quality', weight: 1.25,
      question: 'How clean is the data in your CRM today?',
      help: 'Think duplicates, missing fields, and how often records are refreshed.',
      anchors: [
        ['Messy', 'Duplicates, missing fields, rarely refreshed. No one trusts it fully.'],
        ['Patchy', 'Core records are okay, but gaps and stale entries are common.'],
        ['Reasonable', 'Mostly reliable. Cleanup happens, but it is manual and ad hoc.'],
        ['Good', 'Clean, deduplicated, and refreshed on a known cadence.'],
        ['Excellent', 'A single source of truth, validated on entry, trusted across teams.']
      ] },
    { id: 'integrations', name: 'Integration ecosystem', weight: 1.0,
      question: 'How reliable are the integrations between your CRM and everything around it?',
      help: 'How data moves between your CRM and the tools around it.',
      anchors: [
        ['Fragile', 'Manual exports and brittle scripts. Things break and no one notices.'],
        ['Workable', 'A few real integrations, with spreadsheets filling the gaps.'],
        ['Stable', 'Key systems are connected and mostly hold, with some manual fixes.'],
        ['Robust', 'Well-built integrations with monitoring and clear ownership.'],
        ['Best-in-class', 'Event-driven, observable, and tested. Data flows without babysitting.']
      ] },
    { id: 'realtime', name: 'Real-time processing', weight: 1.0,
      question: 'Can your teams act on data as it arrives, not hours or days later?',
      help: 'How quickly your teams can act on new information.',
      anchors: [
        ['Batch-only', 'Everything runs on overnight or weekly batches.'],
        ['Mostly batch', 'A few near-live reports, but most decisions wait for the batch.'],
        ['Hybrid', 'Some flows are live, the important ones still lag.'],
        ['Real-time', 'Teams act on current data across most workflows.'],
        ['Streaming-native', 'Events stream end to end. The business sees state as it changes.']
      ] },
    { id: 'governance', name: 'Security and governance', weight: 1.25,
      question: 'Do you have clear policies on who can access what, with audit trails?',
      help: 'Access control, data ownership, and audit trails.',
      anchors: [
        ['Ad hoc', 'No clear policy on who can access what. No audit trail.'],
        ['Starting', 'Some access controls exist, applied inconsistently.'],
        ['Documented', 'Access policies are written down and mostly followed.'],
        ['Audited', 'Roles, logs, and reviews are in place and checked.'],
        ['Zero-trust', 'Least-privilege access, full audit trails, regular reviews.']
      ] },
    { id: 'change', name: 'Change management', weight: 1.0,
      question: 'When you have rolled out new tech in the last two years, how well did it actually land?',
      help: 'How well new technology has actually landed in the last two years.',
      anchors: [
        ['Shelfware', 'New tools get bought and then ignored.'],
        ['Partial', 'Some teams adopt, most revert to the old way.'],
        ['Adopted', 'Rollouts land, with the usual push to get there.'],
        ['Embedded', 'New tools stick and become how work gets done.'],
        ['Change-first culture', 'The org adopts fast and treats change as normal.']
      ] },
    { id: 'knowledge', name: 'Knowledge and docs', weight: 1.0,
      question: 'If a new hire joined today, how much of what they need is documented?',
      help: 'How much operating knowledge is documented versus in people heads.',
      anchors: [
        ['In people heads', 'Critical know-how lives with individuals, not documents.'],
        ['Some docs', 'Scattered notes exist, often out of date.'],
        ['Decent', 'Core processes are documented, with gaps.'],
        ['Good', 'Most of what a new hire needs is written and findable.'],
        ['Docs-first', 'Documentation is the default. Knowledge outlives the people.']
      ] }
  ];

  var ASSESS_TIERS = [
    { min: 0, max: 13, label: 'Not yet', caption: 'FIX THE FOUNDATIONS FIRST',
      interp: 'Hold off on enterprise AI for now. The foundations underneath are not ready, and foundation work costs far less than a failed AI rollout. Start with the three moves below.' },
    { min: 14, max: 23, label: 'Fixable gaps', caption: 'FOUR TO EIGHT WEEKS OF FOUNDATION WORK',
      interp: 'You are close. A focused foundation programme on the weak areas below will unlock your first real AI wave. The gaps are fixable, and most are smaller than teams expect.' },
    { min: 24, max: 30, label: 'Ready', caption: 'START PLANNING YOUR FIRST USE CASE',
      interp: 'Your foundations are solid. Pick your first high-value use case and go. The moves below are about sequencing and sharpening, not blocking.' }
  ];

  var ASSESS_MOVES = {
    data: { title: 'Fix CRM data quality in a focused sprint',
      body: 'Run a time-boxed cleanup on the records your AI will actually read first. Deduplicate, fill the load-bearing fields, and set a refresh cadence so the data stays clean after the sprint.',
      meta: '$ · 6 TO 8 WEEKS · 1 DATA STEWARD' },
    integrations: { title: 'Stabilise the integrations AI will rely on',
      body: 'Pick the two or three connections your first use case depends on and make them reliable. Add monitoring and clear ownership so a silent failure never feeds the agent bad data.',
      meta: '$$ · 8 TO 10 WEEKS · 1 INTEGRATION LEAD' },
    realtime: { title: 'Make one flow real-time, not all of them',
      body: 'Choose the single decision that suffers most from lag and move that one flow to live data. Proving it on one flow is cheaper and faster than re-platforming everything at once.',
      meta: '$$ · 10 TO 12 WEEKS · ENGINEERING PLUS PLATFORM' },
    governance: { title: 'Name data owners and write one policy',
      body: 'Write a one-page data-classification policy with a named owner for each category, plus quarterly access reviews. Treat this as non-negotiable before any AI touches sensitive data.',
      meta: '$ · 4 WEEKS · SECURITY PLUS LEGAL' },
    change: { title: 'Run a small AI pilot as a change test',
      body: 'Use a contained AI pilot to test whether your organisation can actually adopt something new. The lesson about change capability matters as much as the pilot result.',
      meta: '$ · 1 QUARTER · 1 PM PLUS CHAMPIONS' },
    knowledge: { title: 'Fund a 90-day documentation reset',
      body: 'Capture the operating knowledge that currently lives in people heads before it walks out the door. Prioritise the processes your AI and your new hires will lean on first.',
      meta: '$ · 90 DAYS · 2 PART-TIME FTES' }
  };

  var ASSESS_MAX_WEIGHTED = 32.5;
  var ASSESS_SCORE_MAX = 30;
  var GAUGE_CIRC = 2 * Math.PI * 84; // r=84 in the gauge svg

  function assessScore(answers) {
    var weighted = 0;
    for (var i = 0; i < ASSESS_DIMS.length; i++) weighted += (answers[i] || 0) * ASSESS_DIMS[i].weight;
    return Math.round((weighted / ASSESS_MAX_WEIGHTED) * ASSESS_SCORE_MAX * 10) / 10;
  }
  function assessTier(score) {
    for (var i = 0; i < ASSESS_TIERS.length; i++) {
      if (score >= ASSESS_TIERS[i].min && score <= ASSESS_TIERS[i].max) return ASSESS_TIERS[i];
    }
    return ASSESS_TIERS[0];
  }
  function assessTopMoves(answers) {
    var rows = ASSESS_DIMS.map(function (d, i) { return { id: d.id, value: answers[i] || 0, order: i }; });
    rows.sort(function (a, b) { return a.value - b.value || a.order - b.order; });
    return rows.slice(0, 3).map(function (r) { return r.id; });
  }
  function radarPoints(answers) {
    // 6 axes starting at top, clockwise. Center 150,150, max radius 110.
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var v = (answers[i] || 0) / 5;
      var r = 18 + v * 92; // keep a small core so the shape never degenerates
      var ang = (Math.PI / 180) * (-90 + i * 60);
      pts.push((150 + r * Math.cos(ang)).toFixed(1) + ',' + (150 + r * Math.sin(ang)).toFixed(1));
    }
    return pts.join(' ');
  }

  function initAssess() {
    var shell = document.querySelector('[data-assess]');
    if (!shell) return;
    var startEl = shell.querySelector('[data-assess-start]');
    var qEl = shell.querySelector('[data-assess-q]');
    var resEl = shell.querySelector('[data-assess-results]');
    var bar = shell.querySelector('[data-assess-bar]');
    var ixEl = shell.querySelector('[data-assess-ix]');
    var dimEl = shell.querySelector('[data-assess-dim]');
    var questionEl = shell.querySelector('[data-assess-question]');
    var helpEl = shell.querySelector('[data-assess-help]');
    var anchorsEl = shell.querySelector('[data-assess-anchors]');

    var answers = [];
    var idx = 0;

    function show(panel) {
      [startEl, qEl, resEl].forEach(function (p) { p.hidden = p !== panel; });
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function renderQuestion() {
      var d = ASSESS_DIMS[idx];
      ixEl.textContent = pad(idx + 1) + ' / ' + pad(ASSESS_DIMS.length);
      dimEl.textContent = d.name.toUpperCase();
      questionEl.textContent = d.question;
      helpEl.textContent = d.help;
      bar.style.width = ((idx) / ASSESS_DIMS.length * 100) + '%';
      anchorsEl.innerHTML = '';
      d.anchors.forEach(function (a, ai) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'assess-anchor' + (answers[idx] === ai + 1 ? ' is-picked' : '');
        btn.innerHTML = '<span class="a-num">' + (ai + 1) + '</span><span class="a-label">' + a[0] + '</span><span class="a-desc">' + a[1] + '</span>';
        btn.addEventListener('click', function () {
          answers[idx] = ai + 1;
          Array.prototype.forEach.call(anchorsEl.children, function (c) { c.classList.remove('is-picked'); });
          btn.classList.add('is-picked');
          window.setTimeout(function () {
            if (idx < ASSESS_DIMS.length - 1) { idx++; renderQuestion(); }
            else { renderResults(); }
          }, prefersReduce ? 0 : 240);
        });
        anchorsEl.appendChild(btn);
      });
      var backBtn = shell.querySelector('[data-assess-back]');
      backBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
    }

    function renderResults() {
      var score = assessScore(answers);
      var tier = assessTier(score);
      show(resEl);
      // gauge
      var arc = shell.querySelector('[data-assess-arc]');
      var target = GAUGE_CIRC * (1 - Math.min(1, score / ASSESS_SCORE_MAX));
      if (prefersReduce) {
        arc.style.transition = 'none';
        arc.style.strokeDashoffset = target;
      } else {
        arc.style.strokeDashoffset = GAUGE_CIRC;
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          arc.style.strokeDashoffset = target;
        }); });
      }
      // score count-up
      var scoreEl = shell.querySelector('[data-assess-score]');
      if (prefersReduce) { scoreEl.textContent = score; }
      else {
        var start = performance.now(), dur = 1100;
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          scoreEl.textContent = (Math.round(score * eased * 10) / 10).toFixed(score % 1 === 0 ? 0 : 1);
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      }
      // tier
      shell.querySelector('[data-assess-tier]').textContent = tier.label;
      shell.querySelector('[data-assess-caption]').textContent = tier.caption;
      shell.querySelector('[data-assess-interp]').textContent = tier.interp;
      // radar
      var radar = shell.querySelector('[data-assess-radar]');
      if (prefersReduce) { radar.style.transition = 'none'; }
      radar.setAttribute('points', radarPoints(answers));
      // moves
      var movesEl = shell.querySelector('[data-assess-moves]');
      movesEl.innerHTML = '';
      assessTopMoves(answers).forEach(function (id, mi) {
        var m = ASSESS_MOVES[id];
        var card = document.createElement('div');
        card.className = 'assess-move';
        card.innerHTML = '<span class="m-ix">MOVE ' + pad(mi + 1) + '</span><span class="m-title">' + m.title + '</span><p class="m-body">' + m.body + '</p><span class="m-meta">' + m.meta + '</span>';
        movesEl.appendChild(card);
      });
      bar.style.width = '100%';
    }

    shell.querySelector('[data-assess-begin]').addEventListener('click', function () {
      answers = []; idx = 0;
      show(qEl);
      renderQuestion();
    });
    shell.querySelector('[data-assess-back]').addEventListener('click', function () {
      if (idx > 0) { idx--; renderQuestion(); }
    });
    shell.querySelector('[data-assess-restart]').addEventListener('click', function () {
      answers = []; idx = 0;
      var radar = shell.querySelector('[data-assess-radar]');
      radar.setAttribute('points', '150,150 150,150 150,150 150,150 150,150 150,150');
      show(qEl);
      renderQuestion();
      qEl.scrollIntoView({ behavior: prefersReduce ? 'auto' : 'smooth', block: 'center' });
    });
  }


  // === Hero particle field ===
  // A dot lattice on the ink hero. Fine pointers: dots repel from the cursor
  // and spring back. Coarse pointers: a slow autonomous drift wave. One blue
  // row stays signal. IO-gated rAF, DPR capped, reduced-motion = static paint.

  function initHeroField() {
    var canvas = document.querySelector('[data-hero-field]');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dots = [];
    var W = 0, H = 0, DPR = 1;
    var GAP = 34;
    var mx = -9999, my = -9999;
    var running = false;
    var raf = 0;
    var t0 = performance.now();

    function build() {
      var rect = canvas.parentElement.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      dots = [];
      var cols = Math.ceil(W / GAP) + 1;
      var rows = Math.ceil(H / GAP) + 1;
      var signalRow = Math.round(rows * 0.62);
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          dots.push({ ox: c * GAP, oy: r * GAP, x: c * GAP, y: r * GAP, sig: r === signalRow });
        }
      }
    }

    function paint(interactive, now) {
      ctx.clearRect(0, 0, W, H);
      var i, d;
      // base dots
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.beginPath();
      for (i = 0; i < dots.length; i++) {
        d = dots[i];
        if (d.sig) continue;
        ctx.rect(d.x - 0.75, d.y - 0.75, 1.5, 1.5);
      }
      ctx.fill();
      // signal row
      ctx.fillStyle = 'rgba(0,82,255,0.9)';
      ctx.beginPath();
      for (i = 0; i < dots.length; i++) {
        d = dots[i];
        if (!d.sig) continue;
        ctx.rect(d.x - 1.25, d.y - 1.25, 2.5, 2.5);
      }
      ctx.fill();
    }

    function step(now) {
      var i, d, dx, dy, dist, f;
      var driftMode = isCoarse;
      for (i = 0; i < dots.length; i++) {
        d = dots[i];
        var tx = d.ox, ty = d.oy;
        if (driftMode) {
          ty += Math.sin((now - t0) * 0.0006 + d.ox * 0.018) * 5;
        } else {
          dx = d.ox - mx; dy = d.oy - my;
          dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0.001) {
            f = (1 - dist / 140) * 26;
            tx = d.ox + (dx / dist) * f;
            ty = d.oy + (dy / dist) * f;
          }
        }
        d.x += (tx - d.x) * 0.12;
        d.y += (ty - d.y) * 0.12;
      }
      paint(true, now);
      if (running && !document.hidden) raf = requestAnimationFrame(step);
    }

    function start() {
      if (prefersReduce || running) return;
      running = true;
      raf = requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    build();
    paint(false, 0);

    if (prefersReduce) {
      window.addEventListener('resize', function () { build(); paint(false, 0); });
      return;
    }

    canvas.parentElement.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('pointerleave', function () { mx = -9999; my = -9999; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
    }, { rootMargin: '60px 0px' });
    io.observe(canvas);

    var rsz;
    window.addEventListener('resize', function () {
      clearTimeout(rsz);
      rsz = setTimeout(function () { build(); if (!running) paint(false, 0); }, 150);
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) start();
    });
  }

  function boot() {
    initReveals();
    initAssess();
    initHeroField();
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
