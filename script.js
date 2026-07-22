/* ============================================================
   TEAM VERBRENNER — Interaktion, Animation & Motorsound
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Navbar: Scroll-Zustand & Burger-Menü ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });
  burger.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") navLinks.classList.remove("open");
  });

  /* ---------- Hero-Video anzeigen, falls vorhanden ---------- */
  var heroVideo = document.getElementById("heroVideo");
  var heroFallback = document.getElementById("heroFallback");
  if (heroVideo) {
    heroVideo.addEventListener("loadeddata", function () {
      heroVideo.style.display = "block";
      if (heroFallback) heroFallback.style.display = "none";
    });
    // Versuchen zu laden; scheitert still, wenn Datei fehlt -> Fallback bleibt.
    heroVideo.load();
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Zahlen hochzählen ---------- */
  var counters = document.querySelectorAll(".count");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-to"), 10);
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); io2.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { io2.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-to"); });
  }

  /* ---------- Grundaufbau: Bauteile hervorheben ---------- */
  var parts = document.querySelectorAll(".part");
  var svgParts = document.querySelectorAll(".svg-part");
  function highlight(target) {
    svgParts.forEach(function (sp) {
      var match = sp.getAttribute("data-part") === target;
      sp.classList.toggle("hi", match);
      sp.classList.toggle("dim", !match);
    });
  }
  parts.forEach(function (p) {
    var act = function () {
      parts.forEach(function (x) { x.classList.remove("active"); });
      p.classList.add("active");
      highlight(p.getAttribute("data-target"));
    };
    p.addEventListener("click", act);
    p.addEventListener("mouseenter", act);
  });

  /* ============================================================
     MOTORSOUND per Web Audio API (kein externer Sound nötig)
     Erzeugt ein "Brummen", dessen Tonhöhe wie Drehzahl hochgeht.
     ============================================================ */
  var audioCtx = null, running = false, rafId = null;
  var masterGain, oscA, oscB, lfo, lfoGain, filter;
  var rpm = 0, targetRpm = 0;

  function buildAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.connect(masterGain);

    // zwei Sägezahn-Oszillatoren für einen volleren Motorklang
    oscA = audioCtx.createOscillator(); oscA.type = "sawtooth";
    oscB = audioCtx.createOscillator(); oscB.type = "square";
    oscA.connect(filter); oscB.connect(filter);

    // LFO moduliert die Lautstärke -> "Blubbern" wie Zündungen
    lfo = audioCtx.createOscillator(); lfo.type = "sawtooth";
    lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain); lfoGain.connect(masterGain.gain);

    oscA.start(); oscB.start(); lfo.start();
  }

  function updateSound() {
    if (!audioCtx) return;
    // Drehzahl weich Richtung Ziel bewegen
    rpm += (targetRpm - rpm) * 0.06;
    var base = 45 + (rpm / 7000) * 150;          // Grundfrequenz 45–195 Hz
    var t = audioCtx.currentTime;
    oscA.frequency.setTargetAtTime(base, t, 0.05);
    oscB.frequency.setTargetAtTime(base * 0.5, t, 0.05);
    lfo.frequency.setTargetAtTime(6 + (rpm / 7000) * 40, t, 0.05); // Zündtakt
    filter.frequency.setTargetAtTime(500 + (rpm / 7000) * 3500, t, 0.05);
    masterGain.gain.setTargetAtTime(running ? 0.18 : 0, t, 0.1);

    // Schwungrad-Animation an Drehzahl koppeln
    spin(rpm);
    rafId = requestAnimationFrame(updateSound);
  }

  /* ---------- Motor-Animation (Schwungrad + Kolben) ---------- */
  var flywheel = document.getElementById("flywheel");
  var pistons = document.querySelectorAll("#animEngine .pis");
  var angle = 0;
  function spin(currentRpm) {
    var speed = currentRpm / 6000; // 0..~1.2
    angle = (angle + speed * 22) % 360;
    if (flywheel) flywheel.setAttribute("transform", "rotate(" + angle + " 130 245)");
    // Kolben versetzt auf und ab (4-Zylinder: 0/180/180/0)
    var offsets = [0, 180, 180, 0];
    pistons.forEach(function (pis, i) {
      var ph = (angle + offsets[i]) * Math.PI / 180;
      var y = 80 + Math.sin(ph) * 26; // Hub
      pis.setAttribute("y", y.toFixed(1));
    });
  }

  function startEngine() {
    if (!audioCtx) buildAudio();
    if (audioCtx.state === "suspended") audioCtx.resume();
    running = true;
    targetRpm = 950;                 // Leerlauf
    if (!rafId) updateSound();
    var wave = document.getElementById("wave");
    if (wave) wave.classList.add("on");
  }
  function rev() {
    startEngine();
    targetRpm = 5200;                // Gas geben
    clearTimeout(rev._t);
    rev._t = setTimeout(function () { targetRpm = 950; }, 1400); // zurück in Leerlauf
  }
  function stopEngine() {
    running = false;
    targetRpm = 0;
    var wave = document.getElementById("wave");
    if (wave) wave.classList.remove("on");
    setTimeout(function () {
      if (!running && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }, 600);
  }

  var startBtn = document.getElementById("startEngine");
  var revBtn = document.getElementById("revBtn");
  var stopBtn = document.getElementById("stopBtn");
  if (startBtn) startBtn.addEventListener("click", function () {
    if (running) { stopEngine(); } else { startEngine(); }
  });
  if (revBtn) revBtn.addEventListener("click", rev);
  if (stopBtn) stopBtn.addEventListener("click", stopEngine);

  // Motor stoppen, wenn Seite in den Hintergrund geht
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopEngine();
  });
})();
