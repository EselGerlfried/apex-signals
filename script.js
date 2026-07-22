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

  /* ---------- Funken (Embers) im Hero ---------- */
  var embers = document.getElementById("embers");
  if (embers && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (var i = 0; i < 26; i++) {
      var e = document.createElement("div");
      e.className = "ember";
      e.style.left = (Math.random() * 100) + "%";
      e.style.animationDuration = (5 + Math.random() * 7) + "s";
      e.style.animationDelay = (Math.random() * 7) + "s";
      var s = (3 + Math.random() * 5);
      e.style.width = s + "px"; e.style.height = s + "px";
      embers.appendChild(e);
    }
  }

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
    if (document.hidden) { stopEngine(); if (window.speechSynthesis) window.speechSynthesis.cancel(); }
  });

  /* ============================================================
     SCROLL-FORTSCHRITTSBALKEN
     ============================================================ */
  var progress = document.getElementById("progress");
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    var sc = h.scrollTop || document.body.scrollTop;
    var height = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (height > 0 ? (sc / height) * 100 : 0) + "%";
  });

  /* ============================================================
     ZURÜCK NACH OBEN
     ============================================================ */
  var toTop = document.getElementById("toTop");
  window.addEventListener("scroll", function () {
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
  });
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ============================================================
     VIDEO-TON an/aus
     ============================================================ */
  var vsBtn = document.getElementById("videoSound");
  if (vsBtn && heroVideo) {
    vsBtn.addEventListener("click", function () {
      heroVideo.muted = !heroVideo.muted;
      if (!heroVideo.muted) {
        heroVideo.volume = 1;
        if (heroVideo.play) { var p = heroVideo.play(); if (p && p.catch) p.catch(function(){}); }
        vsBtn.textContent = "🔊 Video-Ton aus";
      } else {
        vsBtn.textContent = "🔇 Video-Ton an";
      }
    });
  }

  /* ============================================================
     VORLESE-STIMME (Text-to-Speech, Web Speech API)
     ============================================================ */
  var synth = window.speechSynthesis;
  if (synth) { synth.getVoices(); synth.onvoiceschanged = function () { synth.getVoices(); }; }

  function pickGermanVoice() {
    if (!synth) return null;
    var vs = synth.getVoices() || [];
    var de = vs.filter(function (v) { return /de(-|_|$)/i.test(v.lang); });
    return de[0] || vs[0] || null;
  }
  function speak(text, onend) {
    if (!synth) { if (onend) onend(); return; }
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickGermanVoice(); if (v) u.voice = v;
    u.lang = "de-DE"; u.rate = 1; u.pitch = 1;
    u.onend = function () { if (onend) onend(); };
    synth.speak(u);
  }

  var speakBtns = document.querySelectorAll(".speak-btn");
  var currentBtn = null;
  function clearSpeakUI() {
    if (currentBtn) { currentBtn.classList.remove("speaking"); currentBtn.textContent = currentBtn._label; }
    currentBtn = null;
  }
  speakBtns.forEach(function (btn) {
    btn._label = btn.textContent;
    btn.addEventListener("click", function () {
      stopGuide();
      if (currentBtn === btn) { if (synth) synth.cancel(); clearSpeakUI(); return; }
      if (synth) synth.cancel(); clearSpeakUI();
      if (!synth) { alert("Dein Browser kann leider nicht vorlesen. Auf iPad/iPhone in Safari klappt es am besten."); return; }
      var text = btn.getAttribute("data-speak");
      if (!text) {
        var from = btn.getAttribute("data-speak-from");
        var el = from && document.getElementById(from);
        text = el ? el.textContent : "";
      }
      currentBtn = btn; btn.classList.add("speaking"); btn.textContent = "⏹ Stopp";
      speak(text, function () { clearSpeakUI(); });
    });
  });

  /* ============================================================
     GUIDED 4-TAKT-PLAYER (Animation + Stimme)
     ============================================================ */
  var guideBtn = document.getElementById("guideBtn");
  var guideLabel = guideBtn ? guideBtn.textContent : "";
  var strokeEls = document.querySelectorAll("#funktion .stroke");
  var guiding = false;

  function stopGuide() {
    if (!guiding) return;
    guiding = false;
    if (synth) synth.cancel();
    strokeEls.forEach(function (s) { s.classList.remove("active-stroke"); });
    if (guideBtn) guideBtn.textContent = guideLabel;
  }
  function runGuide(i) {
    if (!guiding) return;
    if (i >= strokeEls.length) { stopGuide(); return; }
    strokeEls.forEach(function (s) { s.classList.remove("active-stroke"); });
    var s = strokeEls[i];
    s.classList.add("active-stroke");
    if (s.scrollIntoView) s.scrollIntoView({ behavior: "smooth", block: "center" });
    speak(s.getAttribute("data-say") || "", function () {
      setTimeout(function () { runGuide(i + 1); }, 350);
    });
  }
  if (guideBtn) guideBtn.addEventListener("click", function () {
    if (guiding) { stopGuide(); return; }
    if (!synth) { alert("Dein Browser kann leider nicht vorlesen. Auf iPad/iPhone in Safari klappt es am besten."); return; }
    if (currentBtn) { synth.cancel(); clearSpeakUI(); }
    guiding = true; guideBtn.textContent = "⏹ Stopp";
    runGuide(0);
  });
})();
