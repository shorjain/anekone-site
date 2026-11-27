/* anēkone, anekone.com: quiet interactions only. */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SVG = "http://www.w3.org/2000/svg";

  function el(name, attrs, parent) {
    var n = document.createElementNS(SVG, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // Small seeded random so figures look the same on every visit.
  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
  }

  function svgPoint(svg, evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  /* ---------- Reveal on scroll (once) ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce.matches) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (r) { ro.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }

  /* ---------- Current section in nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function markCurrent() {
    var line = window.innerHeight * 0.35;
    var current = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top <= line) current = i;
    });
    // At the very bottom, the last section is current.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) current = sections.length - 1;
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { markCurrent(); ticking = false; }); }
  }, { passive: true });
  window.addEventListener("resize", markCurrent);
  markCurrent();

  /* ---------- Fig. 1: many signals converging on one ---------- */
  (function () {
    var svg = document.getElementById("fig-converge");
    if (!svg) return;
    var live = document.getElementById("fig-converge-live");
    var SIGNALS = [
      "seasonality", "price history", "location", "demand", "weather", "foot traffic",
      "holidays", "promotions", "inventory", "lead time", "competitor prices", "local events",
      "day of week", "trend", "volatility", "returns", "neighborhood", "zoning",
      "interest rates", "listings", "days on market", "transit access", "rent levels", "supply",
      "search interest", "pay cycles", "tourism", "new construction", "school zones", "regional growth"
    ];
    var C = 200, rand = rng(7);
    var rings = [[72, 7], [118, 10], [166, 13]];
    var nodes = [];
    rings.forEach(function (ring, ri) {
      var off = rand() * Math.PI * 2;
      for (var i = 0; i < ring[1]; i++) {
        var a = off + (i / ring[1]) * Math.PI * 2 + (rand() - 0.5) * 0.25;
        var r = ring[0] + (rand() - 0.5) * 16;
        nodes.push({ x: C + Math.cos(a) * r, y: C + Math.sin(a) * r });
      }
    });

    var groups = nodes.map(function (n, i) {
      var g = el("g", {}, svg);
      var dx = n.x - C, dy = n.y - C, d = Math.hypot(dx, dy);
      el("line", { "class": "c-line", x1: n.x, y1: n.y, x2: C + dx / d * 9, y2: C + dy / d * 9 }, g);
      el("circle", { "class": "c-node", cx: n.x, cy: n.y, r: 3 }, g);
      var right = n.x > C;
      var t = el("text", {
        "class": "c-label",
        x: right ? n.x - 9 : n.x + 9,
        y: n.y - 8,
        "text-anchor": right ? "end" : "start"
      }, g);
      t.textContent = SIGNALS[i];
      n.g = g;
      return g;
    });
    // Labels sit on top of everything.
    groups.forEach(function (g) { svg.appendChild(g.querySelector("text")); g.label = svg.lastChild; });
    el("circle", { "class": "c-center", cx: C, cy: C, r: 9 }, svg);

    var active = -1;
    function setActive(i) {
      if (i === active) return;
      if (active >= 0) { groups[active].classList.remove("is-on"); groups[active].label.style.opacity = ""; }
      active = i;
      if (i >= 0) {
        groups[i].classList.add("is-on");
        groups[i].label.style.opacity = "1";
        if (live) live.textContent = "Signal: " + SIGNALS[i];
      }
    }
    function nearest(p, max) {
      var best = -1, bd = max;
      nodes.forEach(function (n, i) {
        var d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    svg.addEventListener("pointermove", function (e) { setActive(nearest(svgPoint(svg, e), 26)); });
    svg.addEventListener("pointerdown", function (e) { setActive(nearest(svgPoint(svg, e), 34)); });
    svg.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") setActive(-1); });
    svg.addEventListener("keydown", function (e) {
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].indexOf(e.key) < 0) return;
      e.preventDefault();
      var step = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
      setActive(((active < 0 ? (step > 0 ? -1 : 0) : active) + step + nodes.length) % nodes.length);
    });
    svg.addEventListener("blur", function () { setActive(-1); });
  })();

  /* ---------- Fig. 6: forecast with widening band ---------- */
  (function () {
    var svg = document.getElementById("fig-forecast");
    var input = document.getElementById("horizon");
    var out = document.getElementById("horizon-out");
    if (!svg || !input) return;

    var W = 560, H = 230, L = 8, R = 552, T = 18, B = 196;
    var HIST = 42, MAXH = 30, rand = rng(11);
    var weekly = [-7, -5, -3, 0, 7, 13, 6];
    var hist = [];
    for (var t = 0; t < HIST; t++) hist.push(58 + 0.32 * t + weekly[t % 7] + (rand() - 0.5) * 9);
    var level = 58 + 0.32 * (HIST - 1), trend = 0.32;
    function fc(h) { var t = HIST - 1 + h; return level + trend * h + weekly[t % 7]; }
    function spread(h) { return 6 + 2.6 * Math.sqrt(h); }

    var yMin = 30, yMax = 128;
    function X(t) { return L + (t / (HIST - 1 + MAXH)) * (R - L); }
    function Y(v) { return B - ((v - yMin) / (yMax - yMin)) * (B - T); }

    el("line", { "class": "axis", x1: L, y1: B + 0.5, x2: R, y2: B + 0.5 }, svg);
    var x0 = X(HIST - 1);
    el("line", { "class": "today", x1: x0, y1: T - 6, x2: x0, y2: B }, svg);
    var tToday = el("text", { x: x0, y: B + 22, "text-anchor": "middle" }, svg); tToday.textContent = "today";
    var tPast = el("text", { x: L, y: B + 22 }, svg); tPast.textContent = "−6 wk";
    var tEnd = el("text", { y: B + 22, "text-anchor": "middle" }, svg);

    var band = el("path", { "class": "band" }, svg);
    el("polyline", { "class": "hist", points: hist.map(function (v, i) { return X(i).toFixed(1) + "," + Y(v).toFixed(1); }).join(" ") }, svg);
    var line = el("polyline", { "class": "fc" }, svg);

    function draw(h) {
      function val(k) { return k === 0 ? hist[HIST - 1] : fc(k); }
      function sp(k) { return k === 0 ? 0 : spread(k); }
      var pts = [], top = [], bot = [];
      var steps = [];
      for (var k = 0; k <= Math.floor(h); k++) steps.push(k);
      if (h > Math.floor(h)) steps.push(h); // partial last step, for a smooth extension
      steps.forEach(function (k) {
        var a = Math.floor(k), f = k - a;
        var v = f ? val(a) * (1 - f) + val(a + 1) * f : val(a);
        var s = f ? sp(a) * (1 - f) + sp(a + 1) * f : sp(a);
        var x = X(HIST - 1 + k);
        pts.push([x, Y(v)]); top.push([x, Y(v + s)]); bot.push([x, Y(v - s)]);
      });
      line.setAttribute("points", pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "));
      var d = "M" + top.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") +
              " L" + bot.reverse().map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L") + " Z";
      band.setAttribute("d", d);
      tEnd.setAttribute("x", Math.min(X(HIST - 1 + h), R - 18).toFixed(1));
      tEnd.textContent = "+" + Math.round(h) + " d";
    }

    var shown = +input.value, target = shown, raf = 0;
    function animate() {
      cancelAnimationFrame(raf);
      if (reduce.matches) { shown = target; draw(shown); return; }
      var from = shown, start = performance.now(), dur = 450;
      (function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        shown = from + (target - from) * e;
        draw(shown);
        if (p < 1) raf = requestAnimationFrame(step);
      })(start);
    }
    input.addEventListener("input", function () {
      target = +input.value;
      out.textContent = target + " days";
      animate();
    });
    draw(shown);
  })();

  /* ---------- Fig. 7: parcels and four signals ---------- */
  (function () {
    var svg = document.getElementById("fig-parcels");
    if (!svg) return;
    // Parcel layout in a 280×160 block at (140, 50).
    var OX = 140, OY = 50, G = 4;
    var P = [
      [0, 0, 60, 46], [64, 0, 40, 46], [108, 0, 76, 46], [188, 0, 92, 30],
      [0, 50, 40, 60], [44, 50, 80, 32], [128, 50, 56, 60], [188, 34, 44, 76], [236, 34, 44, 46],
      [44, 86, 38, 24], [86, 86, 38, 24], [236, 84, 44, 26],
      [0, 114, 82, 46], [86, 114, 58, 46], [148, 114, 36, 46], [188, 114, 92, 46]
    ];
    var anchors = [
      { name: "price", x: 34, y: 130, tx: 34, ty: 152, anchor: "middle" },
      { name: "demand", x: 280, y: 18, tx: 280, ty: 10, anchor: "middle" },
      { name: "neighborhood", x: 526, y: 130, tx: 526, ty: 152, anchor: "middle" },
      { name: "trend", x: 280, y: 242, tx: 280, ty: 258, anchor: "middle" }
    ];
    var sigG = el("g", {}, svg);
    var parcels = P.map(function (p, i) {
      var r = el("rect", { "class": "parcel", x: OX + p[0], y: OY + p[1], width: p[2], height: p[3] }, svg);
      r.cx = OX + p[0] + p[2] / 2; r.cy = OY + p[1] + p[3] / 2;
      r.addEventListener("pointerenter", function () { select(i); });
      r.addEventListener("pointerdown", function () { select(i); });
      return r;
    });
    anchors.forEach(function (a) {
      el("circle", { "class": "anchor", cx: a.x, cy: a.y, r: 2.5 }, svg);
      var t = el("text", { x: a.tx, y: a.ty, "text-anchor": a.anchor }, svg);
      t.textContent = a.name;
    });
    var lines = anchors.map(function () { return el("path", { "class": "sig" }, sigG); });
    svg.appendChild(sigG); // signal lines above the parcels

    var active = -1;
    function select(i) {
      if (i === active) return;
      if (active >= 0) parcels[active].classList.remove("is-on");
      active = i;
      if (i < 0) { lines.forEach(function (l) { l.setAttribute("d", ""); }); return; }
      var p = parcels[i];
      p.classList.add("is-on");
      lines.forEach(function (l, k) {
        var a = anchors[k];
        l.setAttribute("d", "M" + a.x + " " + a.y + " L" + p.cx.toFixed(1) + " " + p.cy.toFixed(1));
        var len = l.getTotalLength();
        l.style.transition = "none";
        l.style.strokeDasharray = len;
        l.style.strokeDashoffset = reduce.matches ? 0 : len;
        if (!reduce.matches) {
          l.getBoundingClientRect(); // commit start state
          l.style.transition = "stroke-dashoffset 480ms cubic-bezier(.4,0,.2,1) " + (k * 40) + "ms";
          l.style.strokeDashoffset = 0;
        }
      });
    }
    svg.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") select(-1); });
    svg.addEventListener("keydown", function (e) {
      if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].indexOf(e.key) < 0) return;
      e.preventDefault();
      var step = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : -1;
      select(((active < 0 ? (step > 0 ? -1 : 0) : active) + step + parcels.length) % parcels.length);
    });
    svg.addEventListener("blur", function () { select(-1); });
  })();

  /* ---------- Copy email ---------- */
  (function () {
    var btn = document.getElementById("copy-email");
    if (!btn) return;
    var timer;
    function done() {
      btn.textContent = "Copied";
      btn.classList.add("is-copied");
      clearTimeout(timer);
      timer = setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("is-copied"); }, 2000);
    }
    function fallback(text) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-email");
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); });
      } else fallback(text);
    });
    btn.setAttribute("aria-live", "polite");
  })();
})();
