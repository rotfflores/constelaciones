/* El cielo de nosotros · sonido
   Efectos (activados por defecto): cada estrella encendida suena como una
   campanilla y los momentos tienen su propio sonido (latido, obturador de la
   cámara, deseos que suben). Empiezan al tocar “Descubre nuestro cielo”, porque
   los navegadores solo dejan sonar audio después de un toque.
   Música ambiental opcional: solo suena después de tocar el botón de música.
   Si la configuración trae un archivo, se reproduce en bucle; si no, se genera
   una atmósfera suave con Web Audio. */
(function (C) {
  "use strict";

  var ESCALA = [587.33, 659.25, 739.99, 880.0, 987.77, 1174.66, 1318.51, 1479.98, 1760.0];

  function crear(opciones) {
    var volumen = typeof opciones.volumen === "number" ? opciones.volumen : 0.5;
    var sonando = false;
    var efectosActivos = opciones.efectos !== false;
    var audio = null;
    var ctx = null, maestro = null, efectos = null, generada = false;

    function contexto() {
      if (ctx) return ctx;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      maestro = ctx.createGain();
      maestro.gain.value = 0;
      maestro.connect(ctx.destination);
      // Eco suave para las campanillas.
      efectos = ctx.createGain();
      efectos.gain.value = 0.9;
      var eco = ctx.createDelay(1.5), realimentacion = ctx.createGain(), filtroEco = ctx.createBiquadFilter();
      eco.delayTime.value = 0.32;
      realimentacion.gain.value = 0.32;
      filtroEco.type = "lowpass";
      filtroEco.frequency.value = 2600;
      efectos.connect(ctx.destination);
      efectos.connect(eco);
      eco.connect(filtroEco);
      filtroEco.connect(realimentacion);
      realimentacion.connect(eco);
      filtroEco.connect(ctx.destination);
      return ctx;
    }

    function iniciarGenerada() {
      var c = contexto();
      if (!c) return Promise.resolve();
      if (!generada) {
        generada = true;
        var filtro = c.createBiquadFilter();
        filtro.type = "lowpass";
        filtro.frequency.value = 1300;
        filtro.Q.value = 0.4;
        filtro.connect(maestro);
        [146.83, 220.0, 293.66, 369.99, 329.63].forEach(function (f, i) {
          var osc = c.createOscillator();
          osc.type = i % 2 ? "triangle" : "sine";
          osc.frequency.value = f;
          osc.detune.value = (i - 2) * 3;
          var g = c.createGain();
          g.gain.value = 0.05;
          var lfo = c.createOscillator(), prof = c.createGain();
          lfo.frequency.value = 0.05 + i * 0.017;
          prof.gain.value = 0.035;
          lfo.connect(prof); prof.connect(g.gain);
          osc.connect(g); g.connect(filtro);
          osc.start(); lfo.start();
        });
        (function ambiente() {
          if (sonando) nota(ESCALA[Math.floor(Math.random() * 6)], 0.022, 4.5);
          setTimeout(ambiente, 2800 + Math.random() * 4200);
        })();
      }
      return c.resume().then(function () {
        var t = c.currentTime;
        maestro.gain.cancelScheduledValues(t);
        maestro.gain.setValueAtTime(maestro.gain.value, t);
        maestro.gain.linearRampToValueAtTime(volumen * 0.9, t + 2.5);
      });
    }

    function nota(frecuencia, intensidad, duracion, retraso) {
      if (!ctx) return;
      var t = ctx.currentTime + (retraso || 0);
      [1, 2.76].forEach(function (parcial, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = frecuencia * parcial;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(intensidad * (i ? 0.18 : 1), t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + duracion * (i ? 0.4 : 1));
        o.connect(g);
        g.connect(efectos);
        o.start(t);
        o.stop(t + duracion + 0.1);
      });
    }

    function iniciarArchivo() {
      if (!audio) {
        audio = new Audio(opciones.archivo);
        audio.loop = true;
        audio.preload = "auto";
      }
      audio.volume = 0;
      contexto();
      if (ctx) ctx.resume();
      var promesa = audio.play();
      fundirArchivo(volumen);
      return promesa && promesa.catch ? promesa.catch(function () {
        audio = null;
        opciones.archivo = null;
        return iniciarGenerada();
      }) : Promise.resolve();
    }

    function fundirArchivo(destino, alTerminar) {
      var inicio = audio.volume, t0 = performance.now(), dur = 1800;
      (function paso(t) {
        if (!audio) return;
        var p = Math.min(1, (t - t0) / dur);
        audio.volume = inicio + (destino - inicio) * p;
        if (p < 1) requestAnimationFrame(paso);
        else if (alTerminar) alTerminar();
      })(t0);
    }

    function activar() {
      if (sonando) return Promise.resolve();
      sonando = true;
      return opciones.archivo ? iniciarArchivo() : iniciarGenerada();
    }

    function pausar() {
      if (!sonando) return;
      sonando = false;
      if (audio) fundirArchivo(0, function () { if (audio && !sonando) audio.pause(); });
      if (ctx && maestro) {
        var t = ctx.currentTime;
        maestro.gain.cancelScheduledValues(t);
        maestro.gain.setValueAtTime(maestro.gain.value, t);
        maestro.gain.linearRampToValueAtTime(0, t + 1.2);
        setTimeout(function () { if (!sonando && ctx && !efectosActivos) ctx.suspend(); }, 1300);
      }
    }

    // Ruido blanco compartido para el obturador y el soplo de los deseos.
    var ruido = null;
    function bufferRuido() {
      if (ruido || !ctx) return ruido;
      ruido = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = ruido.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return ruido;
    }
    function golpe(frecuencia, caida, intensidad, retraso) {
      var t = ctx.currentTime + (retraso || 0);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(frecuencia * 1.6, t);
      o.frequency.exponentialRampToValueAtTime(frecuencia, t + 0.06);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(intensidad * (0.4 + volumen), t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + caida);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t);
      o.stop(t + caida + 0.05);
    }
    function soplido(duracion, desde, hasta, intensidad, tipo) {
      var t = ctx.currentTime, fuente = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      fuente.buffer = bufferRuido();
      f.type = tipo || "bandpass";
      f.Q.value = 1.2;
      f.frequency.setValueAtTime(desde, t);
      f.frequency.exponentialRampToValueAtTime(hasta, t + duracion);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(intensidad, t + duracion * 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
      fuente.connect(f);
      f.connect(g);
      g.connect(efectos);
      fuente.start(t);
      fuente.stop(t + duracion + 0.05);
    }

    var conCampanillas = opciones.campanillas !== false;
    function puedeSonar() { return !!ctx && (sonando || efectosActivos); }
    return {
      alternar: function () {
        if (sonando) { pausar(); return Promise.resolve(false); }
        return activar().then(function () { return true; });
      },
      estaSonando: function () { return sonando; },
      // Se llama desde un toque de la persona: ahí el navegador deja encender el audio.
      prepararEfectos: function () {
        if (!efectosActivos || !contexto()) return;
        if (ctx.state !== "running" && ctx.resume) ctx.resume();
      },
      campanilla: function (indice) {
        if (!puedeSonar() || !conCampanillas) return;
        nota(ESCALA[indice % ESCALA.length], 0.06, 3.2);
      },
      acorde: function () {
        if (!puedeSonar() || !conCampanillas) return;
        [0, 2, 4, 7].forEach(function (k, i) { nota(ESCALA[k], 0.05, 4.2, i * 0.09); });
      },
      arpegio: function () {
        if (!puedeSonar() || !conCampanillas) return;
        [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(function (k, i) { nota(ESCALA[k], 0.045, 4.5, i * 0.16); });
      },
      latido: function () {
        if (!puedeSonar()) return;
        golpe(58, 0.32, 0.5, 0);
        golpe(52, 0.28, 0.32, 0.24);
      },
      obturador: function () {
        if (!puedeSonar()) return;
        soplido(0.07, 3200, 1800, 0.35, "highpass");
        setTimeout(function () { if (ctx) soplido(0.09, 2600, 1400, 0.25, "highpass"); }, 70);
        [4, 6, 8].forEach(function (k, i) { nota(ESCALA[k], 0.035, 3, 0.18 + i * 0.07); });
      },
      soplo: function () {
        if (!puedeSonar()) return;
        soplido(1.1, 400, 2400, 0.22);
      }
    };
  }

  C.MusicaAmbiental = { crear: crear };
})(window.Cielo);
