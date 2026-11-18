/* El cielo de nosotros · utilidades compartidas
   Números aleatorios con semilla, curvas de animación y pequeñas ayudas
   que usan el universo, la cámara, los momentos y la experiencia. */
window.Cielo = window.Cielo || {};

(function (C) {
  "use strict";

  // Generador con semilla (mulberry32): el mismo cielo cada vez que se abre.
  C.azar = function (semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Distribución normal (Box-Muller) a partir de un generador uniforme.
  C.gauss = function (rnd) {
    var u = 1 - rnd(), v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  C.limitar = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  C.mezclar = function (a, b, t) { return a + (b - a) * t; };
  C.suave = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  C.salida = function (t) { return 1 - Math.pow(1 - t, 3); };
  C.entrada = function (t) { return t * t * t; };
  C.pasoSuave = function (a, b, x) {
    var t = C.limitar((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  // Acercamiento exponencial independiente de los cuadros por segundo (dt en segundos).
  C.amortiguar = function (actual, objetivo, rapidez, dt) {
    return objetivo + (actual - objetivo) * Math.exp(-rapidez * dt);
  };
  // Diferencia angular más corta entre dos ángulos.
  C.anguloCorto = function (a, b) {
    var d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  var consulta = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  C.movimientoReducido = function () { return !!(consulta && consulta.matches); };
  C.esTactil = function () {
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  };

  C.formatear = function (plantilla, datos) {
    return String(plantilla || "").replace(/\{(\w+)\}/g, function (_, k) {
      return datos[k] != null ? datos[k] : "";
    });
  };

  C.vibrar = function (patron) {
    try { if (navigator.vibrate) navigator.vibrate(patron); } catch (e) { /* sin vibración */ }
  };

  // Promesa que se resuelve tras un tiempo (para encadenar momentos).
  C.esperar = function (ms) {
    return new Promise(function (resolver) { setTimeout(resolver, ms); });
  };
})(window.Cielo);
