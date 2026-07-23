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

  /* ---------- Funken-Partikel (Canvas) im Hero — "krass" ---------- */
  var sparkCanvas = document.getElementById("sparks");
  if (sparkCanvas && sparkCanvas.getContext && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var sctx = sparkCanvas.getContext("2d");
    var SW, SH, sdpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], rafSparks = null;
    function sresize() {
      SW = sparkCanvas.clientWidth; SH = sparkCanvas.clientHeight;
      sparkCanvas.width = SW * sdpr; sparkCanvas.height = SH * sdpr;
      sctx.setTransform(sdpr, 0, 0, sdpr, 0, 0);
    }
    function spawnSpark(seed) {
      return {
        x: Math.random() * SW,
        y: seed ? Math.random() * SH : SH + 12,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.5 + Math.random() * 1.7),
        r: 1 + Math.random() * 2.6,
        life: 0, max: 110 + Math.random() * 140,
        hue: 18 + Math.random() * 34
      };
    }
    function initSparks() { parts = []; for (var s = 0; s < 110; s++) parts.push(spawnSpark(true)); }
    function tickSparks() {
      sctx.clearRect(0, 0, SW, SH);
      sctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.life++; p.x += p.vx; p.y += p.vy; p.vy -= 0.0016; p.vx += (Math.random() - 0.5) * 0.06;
        var t = p.life / p.max, a = Math.sin(Math.min(t, 1) * Math.PI);
        var g = sctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, "rgba(255,225,160," + (a * 0.9) + ")");
        g.addColorStop(0.4, "hsla(" + p.hue + ",100%,55%," + (a * 0.5) + ")");
        g.addColorStop(1, "hsla(" + p.hue + ",100%,50%,0)");
        sctx.fillStyle = g;
        sctx.beginPath(); sctx.arc(p.x, p.y, p.r * 4, 0, 6.29); sctx.fill();
        if (p.life >= p.max || p.y < -24) parts[i] = spawnSpark(false);
      }
      sctx.globalCompositeOperation = "source-over";
      rafSparks = requestAnimationFrame(tickSparks);
    }
    sresize(); initSparks(); tickSparks();
    window.addEventListener("resize", sresize);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (rafSparks) { cancelAnimationFrame(rafSparks); rafSparks = null; } }
      else if (!rafSparks) { tickSparks(); }
    });
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
        vsBtn.textContent = "🔇 Video-Ton aus";
        vsBtn.style.animation = "none";
      } else {
        vsBtn.textContent = "🔊 Video-Ton einschalten";
        vsBtn.style.animation = "";
      }
    });
  }

  /* ============================================================
     VORLESE-STIMME (Text-to-Speech, Web Speech API)
     ============================================================ */
  var synth = window.speechSynthesis;
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var resumeTimer = null;
  if (synth) {
    synth.getVoices();
    synth.onvoiceschanged = function () { synth.getVoices(); };
    // iPad/Chrome: Stimme beim ersten Antippen aufwecken
    document.addEventListener("pointerdown", function () { try { synth.resume(); } catch (e) {} }, { once: true });
  }

  function pickGermanVoice() {
    if (!synth) return null;
    var vs = synth.getVoices() || [];
    var de = vs.filter(function (v) { return /de(-|_|$)/i.test(v.lang); });
    return de[0] || vs[0] || null;
  }
  function speak(text, onend) {
    if (!synth) { if (onend) onend(); return; }
    try { synth.resume(); } catch (e) {}
    synth.cancel();
    var u = new SpeechSynthesisUtterance(text);
    var v = pickGermanVoice(); if (v) u.voice = v;
    u.lang = "de-DE"; u.rate = 1; u.pitch = 1; u.volume = 1;
    u.onend = function () { if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; } if (onend) onend(); };
    u.onerror = function () { if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; } if (onend) onend(); };
    synth.speak(u);
    // Chrome/Desktop: verhindert das automatische Stoppen nach ~15 Sekunden
    if (!isIOS) {
      if (resumeTimer) clearInterval(resumeTimer);
      resumeTimer = setInterval(function () {
        if (synth.speaking) { try { synth.pause(); synth.resume(); } catch (e) {} }
        else { clearInterval(resumeTimer); resumeTimer = null; }
      }, 9000);
    }
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
      stopGuide(); stopReadAll(); pauseFilm();
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
    stopReadAll(); pauseFilm();
    if (currentBtn) { synth.cancel(); clearSpeakUI(); }
    guiding = true; guideBtn.textContent = "⏹ Stopp";
    runGuide(0);
  });

  /* ============================================================
     GANZE SEITE VORLESEN (liest alle Abschnitte nacheinander)
     ============================================================ */
  var readAllBtn = document.getElementById("readAll");
  var readAllLabel = readAllBtn ? readAllBtn.textContent : "";
  var reading = false;

  function readableText(el) {
    if (el.hasAttribute("data-speak")) return el.getAttribute("data-speak");
    if (el.hasAttribute("data-say")) return el.getAttribute("data-say");
    if (el.hasAttribute("data-speak-from")) {
      var e = document.getElementById(el.getAttribute("data-speak-from"));
      return e ? e.textContent : "";
    }
    return "";
  }
  function stopReadAll() {
    if (!reading) return;
    reading = false;
    if (synth) synth.cancel();
    strokeEls.forEach(function (s) { s.classList.remove("active-stroke"); });
    if (readAllBtn) readAllBtn.textContent = readAllLabel;
  }
  function readSeq(list, i) {
    if (!reading) return;
    if (i >= list.length) { stopReadAll(); return; }
    var el = list[i];
    strokeEls.forEach(function (s) { s.classList.remove("active-stroke"); });
    if (el.classList && el.classList.contains("stroke")) el.classList.add("active-stroke");
    if (el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
    speak(readableText(el), function () { setTimeout(function () { readSeq(list, i + 1); }, 300); });
  }
  if (readAllBtn) readAllBtn.addEventListener("click", function () {
    if (reading) { stopReadAll(); return; }
    if (!synth) { alert("Dein Browser kann leider nicht vorlesen. Auf iPad/iPhone klappt es in Safari am besten. Bitte auch die Lautstärke aufdrehen und den Lautlos-Schalter ausschalten."); return; }
    stopGuide(); if (currentBtn) { synth.cancel(); clearSpeakUI(); }
    var list = Array.prototype.slice.call(document.querySelectorAll("[data-speak],[data-say],[data-speak-from]"));
    if (!list.length) return;
    reading = true; readAllBtn.textContent = "⏹ Vorlesen stoppen";
    readSeq(list, 0);
  });

  /* ============================================================
     ROTIERENDES WORT im Hero
     ============================================================ */
  var rot = document.getElementById("rot");
  if (rot && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var words = ["klimaneutral", "sauberer", "unabhängiger", "stärker", "emissionsarm"];
    var ri = 0;
    setInterval(function () {
      ri = (ri + 1) % words.length;
      rot.textContent = words[ri];
      rot.classList.remove("swap"); void rot.offsetWidth; rot.classList.add("swap");
    }, 2200);
  }

  /* ============================================================
     INTERAKTIVER "ZUKUNFTS-ANTRIEB"-BUILDER
     ============================================================ */
  var fuels = {
    efuel: {
      icon: "🌱", name: "E-Fuel-Verbrenner", sub: "Synthetischer Kraftstoff aus CO₂ + Ökostrom",
      stats: [["CO₂", "≈ klimaneutral"], ["Sound", "🔊🔊🔊 voll"], ["Tanken", "~3 Min"], ["Reichweite", "700–1000 km"]],
      note: "💡 Läuft in jedem heutigen Verbrenner — kein neues Auto nötig."
    },
    h2: {
      icon: "💧", name: "Wasserstoff-Verbrenner", sub: "Verbrennt Wasserstoff statt Benzin",
      stats: [["CO₂", "fast nur Wasser"], ["Sound", "🔊🔊 kräftig"], ["Tanken", "~5 Min"], ["Reichweite", "500–700 km"]],
      note: "💡 Aus dem Auspuff kommt fast nur Wasserdampf."
    },
    hybrid: {
      icon: "⚡", name: "Hybrid-Verbrenner", sub: "Verbrenner + Elektro-Boost",
      stats: [["CO₂", "stark reduziert"], ["Sound", "🔊🔊 auf Abruf"], ["Tanken", "~3 Min"], ["Reichweite", "900+ km"]],
      note: "💡 Der E-Motor hilft beim Anfahren, der Verbrenner auf langer Strecke."
    }
  };
  var builderResult = document.getElementById("builderResult");
  var choices = document.querySelectorAll(".choice");
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function renderFuel(key) {
    var f = fuels[key]; if (!f || !builderResult) return;
    var html = '<div class="br-head"><span class="br-icon">' + f.icon + '</span><div><h3>' + esc(f.name) + '</h3><p>' + esc(f.sub) + '</p></div></div><div class="br-stats">';
    f.stats.forEach(function (s) { html += '<div class="br-stat"><span>' + esc(s[0]) + '</span><b>' + esc(s[1]) + '</b></div>'; });
    html += '</div><p class="br-note">' + esc(f.note) + '</p>';
    builderResult.innerHTML = html;
    builderResult.classList.remove("br-pop"); void builderResult.offsetWidth; builderResult.classList.add("br-pop");
  }
  choices.forEach(function (btn) {
    btn.addEventListener("click", function () {
      choices.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("active"); btn.setAttribute("aria-selected", "true");
      renderFuel(btn.getAttribute("data-fuel"));
    });
  });
  if (builderResult) renderFuel("efuel");

  /* ============================================================
     ERKLÄRFILM: animierter Motor von Benzin bis CO₂ (mit Stimme)
     ============================================================ */
  var filmSvg = document.getElementById("filmSvg");
  var filmPlay = document.getElementById("filmPlay");
  var filmReplay = document.getElementById("filmReplay");
  var filmVoice = document.getElementById("filmVoice");
  var filmCaption = document.getElementById("filmCaption");
  var filmBar = document.getElementById("filmBar");
  var fparts = filmSvg ? filmSvg.querySelectorAll(".fpart") : [];
  var filmSteps = [
    { part: "fp-tank", fx: [], cap: "1/6 · Alles beginnt im Tank: Benzin — oder klimaneutrales E-Fuel.", say: "Alles beginnt im Tank. Dort ist der Kraftstoff: Benzin, oder klimaneutrales E-Fuel." },
    { part: "fp-line", fx: ["flowing"], cap: "2/6 · Der Kraftstoff wird als feiner Nebel in den Zylinder gespritzt und mit Luft gemischt.", say: "Der Kraftstoff wird als feiner Nebel in den Zylinder gespritzt und mit Luft gemischt." },
    { part: "fp-cyl", fx: ["running"], cap: "3/6 · Der Kolben fährt nach oben und presst das Gemisch stark zusammen.", say: "Der Kolben fährt nach oben und presst das Gemisch stark zusammen." },
    { part: "fp-spark", fx: ["running", "sparking"], cap: "4/6 · Die Zündkerze zündet — das Gemisch explodiert! 💥", say: "Die Zündkerze zündet. Das Gemisch explodiert!" },
    { part: "fp-crank", fx: ["running"], cap: "5/6 · Die Explosion drückt den Kolben nach unten. Über Pleuel und Kurbelwelle drehen sich die Räder.", say: "Die Explosion drückt den Kolben nach unten. Über Pleuel und Kurbelwelle drehen sich die Räder." },
    { part: "fp-exhaust", fx: ["running", "emitting"], cap: "6/6 · Die Abgase verlassen den Motor durch den Auspuff — dabei entsteht CO₂. Bei E-Fuel wurde dieses CO₂ vorher aus der Luft geholt: fast klimaneutral. ♻️", say: "Die Abgase verlassen den Motor durch den Auspuff. Dabei entsteht Kohlendioxid, also CO 2. Bei E-Fuel wurde dieses CO 2 vorher aus der Luft geholt. Deshalb ist es fast klimaneutral." }
  ];
  var filmIndex = 0, filmPlaying = false, filmTimer = null;

  function applyFilmStep(i) {
    var s = filmSteps[i]; if (!s || !filmSvg) return;
    filmSvg.classList.add("dimmed");
    fparts.forEach(function (p) { p.classList.toggle("hl", p.id === s.part); });
    ["flowing", "sparking", "emitting"].forEach(function (c) { filmSvg.classList.toggle(c, s.fx.indexOf(c) >= 0); });
    if (s.fx.indexOf("running") >= 0) filmSvg.classList.add("running");
    if (filmCaption) filmCaption.textContent = s.cap;
    if (filmBar) filmBar.style.width = ((i + 1) / filmSteps.length * 100) + "%";
  }
  function endFilm() {
    filmPlaying = false; filmIndex = filmSteps.length;
    if (filmTimer) { clearTimeout(filmTimer); filmTimer = null; }
    if (filmSvg) filmSvg.classList.remove("dimmed", "flowing", "sparking");
    if (filmPlay) filmPlay.textContent = "▶ Nochmal abspielen";
  }
  function filmNext(i) {
    if (!filmPlaying) return;
    if (i >= filmSteps.length) { endFilm(); return; }
    filmIndex = i; applyFilmStep(i);
    var s = filmSteps[i];
    if (filmVoice && filmVoice.checked && synth) {
      speak(s.say, function () { if (filmPlaying) filmTimer = setTimeout(function () { filmNext(i + 1); }, 500); });
    } else {
      filmTimer = setTimeout(function () { if (filmPlaying) filmNext(i + 1); }, 3800);
    }
  }
  function startFilm(from) {
    if (!filmSvg) return;
    stopGuide(); stopReadAll(); if (currentBtn) { if (synth) synth.cancel(); clearSpeakUI(); }
    if (synth) { try { synth.resume(); } catch (e) {} synth.cancel(); }
    filmPlaying = true;
    if (filmPlay) filmPlay.textContent = "⏸ Pause";
    filmNext(from || 0);
  }
  function pauseFilm() {
    if (!filmPlaying) return;
    filmPlaying = false;
    if (filmTimer) { clearTimeout(filmTimer); filmTimer = null; }
    if (synth) synth.cancel();
    if (filmPlay) filmPlay.textContent = "▶ Weiter";
  }
  function stopFilm() {
    filmPlaying = false;
    if (filmTimer) { clearTimeout(filmTimer); filmTimer = null; }
    if (filmSvg) filmSvg.classList.remove("dimmed", "flowing", "sparking", "emitting", "running");
    fparts.forEach(function (p) { p.classList.remove("hl"); });
    if (filmPlay) filmPlay.textContent = "▶ Erklärfilm starten";
  }
  if (filmPlay) filmPlay.addEventListener("click", function () {
    if (filmPlaying) pauseFilm();
    else startFilm(filmIndex >= filmSteps.length ? 0 : filmIndex);
  });
  if (filmReplay) filmReplay.addEventListener("click", function () {
    stopFilm(); filmIndex = 0;
    if (filmBar) filmBar.style.width = "0%";
    if (filmCaption) filmCaption.textContent = "Drücke auf ▶ Erklärfilm starten.";
    startFilm(0);
  });
  if (filmVoice) filmVoice.addEventListener("change", function () { if (!filmVoice.checked && synth) synth.cancel(); });
})();
