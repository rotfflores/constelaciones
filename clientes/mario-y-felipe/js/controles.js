/* El cielo de nosotros · cámara y gestos
   La cámara orbita alrededor de un punto (el centro del universo o una
   constelación). Arrastrar gira el universo con inercia, pellizcar o la rueda
   acercan y alejan, y los vuelos llevan la cámara de una vista a otra.
   Los gestos se reparten entre la cámara y el momento interactivo activo. */
(function (C) {
  "use strict";

  var THREE = window.THREE;

  function Camara(camara3) {
    this.c = camara3;
    this.objetivo = new THREE.Vector3();
    this.az = 0;
    this.el = 0.12;
    this.dist = 60;
    this.distDeseada = 60;
    this.vAz = 0;
    this.vEl = 0;
    this.limites = { elMin: -0.55, elMax: 1.1, distMin: 8, distMax: 160 };
    this.giroAuto = 0;
    this.giroAutoObjetivo = 0;
    this.vaiven = 0;
    this.vaivenObjetivo = 0;
    this.vuelo = null;
    this.tocando = false;
    this._t = 0;
    this._ultimoMovimiento = 0;
  }

  var P = Camara.prototype;

  P.estado = function () {
    return { objetivo: this.objetivo.clone(), az: this.az, el: this.el, dist: this.dist };
  };

  P.aplicar = function () {
    var ce = Math.cos(this.el), c = this.c;
    c.position.set(
      this.objetivo.x + this.dist * ce * Math.sin(this.az),
      this.objetivo.y + this.dist * Math.sin(this.el),
      this.objetivo.z + this.dist * ce * Math.cos(this.az)
    );
    if (this.vaiven > 0.001) {
      // Vaivén lento: la vista respira aunque nadie la toque.
      var a = this.vaiven * this.dist * 0.012, t = this._t;
      c.position.x += Math.sin(t * 0.31) * a;
      c.position.y += Math.sin(t * 0.23 + 1.3) * a * 0.7;
    }
    c.lookAt(this.objetivo);
    c.updateMatrixWorld();
  };

  P.detenerVuelo = function () {
    if (this.vuelo) {
      var v = this.vuelo;
      this.vuelo = null;
      v.resolver(false);
    }
  };

  P.fijar = function (v) {
    this.detenerVuelo();
    if (v.objetivo) this.objetivo.copy(v.objetivo);
    if (v.az != null) this.az = v.az;
    if (v.el != null) this.el = v.el;
    if (v.dist != null) this.dist = this.distDeseada = v.dist;
    this.vAz = this.vEl = 0;
    this.aplicar();
  };

  // Vuela a una vista { objetivo, az, el, dist }. Devuelve una promesa (true si terminó).
  P.volarA = function (destino, op) {
    op = op || {};
    var self = this;
    this.detenerVuelo();
    return new Promise(function (resolver) {
      var desde = self.estado();
      var hasta = {
        objetivo: destino.objetivo ? destino.objetivo.clone() : desde.objetivo.clone(),
        az: destino.az != null ? destino.az : desde.az,
        el: destino.el != null ? destino.el : desde.el,
        dist: destino.dist != null ? destino.dist : desde.dist
      };
      hasta.az = desde.az + C.anguloCorto(desde.az, hasta.az);
      self.vAz = self.vEl = 0;
      self.vuelo = {
        desde: desde, hasta: hasta, t0: null,
        dur: Math.max(1, op.duracion || 1800),
        arco: op.arco || 0,
        curva: op.curva || C.suave,
        resolver: resolver
      };
    });
  };

  P.actualizar = function (dt, ahora) {
    this._t += dt;
    var v = this.vuelo;
    if (v) {
      if (v.t0 == null) v.t0 = ahora;
      var p = Math.min(1, (ahora - v.t0) / v.dur), e = v.curva(p);
      this.objetivo.lerpVectors(v.desde.objetivo, v.hasta.objetivo, e);
      this.az = C.mezclar(v.desde.az, v.hasta.az, e);
      this.el = C.mezclar(v.desde.el, v.hasta.el, e);
      this.dist = Math.exp(C.mezclar(Math.log(v.desde.dist), Math.log(v.hasta.dist), e)) * (1 + v.arco * Math.sin(Math.PI * e));
      this.distDeseada = this.dist;
      if (p >= 1) {
        this.vuelo = null;
        v.resolver(true);
      }
    } else {
      var L = this.limites;
      if (!this.tocando) {
        this.az += this.vAz * dt;
        this.el += this.vEl * dt;
        var f = Math.exp(-dt / 0.6);
        this.vAz *= f;
        this.vEl *= f;
        // Bordes elásticos: si se pasa, vuelve con suavidad.
        if (this.el > L.elMax) { this.el = C.amortiguar(this.el, L.elMax, 9, dt); this.vEl = 0; }
        if (this.el < L.elMin) { this.el = C.amortiguar(this.el, L.elMin, 9, dt); this.vEl = 0; }
        if (this.distDeseada > L.distMax) this.distDeseada = C.amortiguar(this.distDeseada, L.distMax, 7, dt);
        if (this.distDeseada < L.distMin) this.distDeseada = C.amortiguar(this.distDeseada, L.distMin, 7, dt);
      }
      this.giroAuto = C.amortiguar(this.giroAuto, this.giroAutoObjetivo, 0.8, dt);
      this.az += this.giroAuto * dt;
      this.dist = Math.exp(C.amortiguar(Math.log(this.dist), Math.log(this.distDeseada), 8, dt));
    }
    this.vaiven = C.amortiguar(this.vaiven, this.vaivenObjetivo, 1.5, dt);
    this.aplicar();
  };

  P.empezarGesto = function () {
    this.detenerVuelo();
    this.tocando = true;
    this.vAz = this.vEl = 0;
  };

  // dx, dy en píxeles; dtMs desde el movimiento anterior.
  P.girar = function (dx, dy, dtMs, ancho, alto) {
    var k = 5.4 / (ancho + alto), L = this.limites;
    var dAz = -dx * k, dEl = dy * k * 0.75;
    this.az += dAz;
    var el = this.el + dEl;
    if ((el > L.elMax && dEl > 0) || (el < L.elMin && dEl < 0)) el = this.el + dEl * 0.25;
    this.el = el;
    if (dtMs > 0) {
      var s = 1000 / Math.max(8, dtMs);
      this.vAz = 0.7 * this.vAz + 0.3 * dAz * s;
      this.vEl = 0.7 * this.vEl + 0.3 * dEl * s;
    }
    this._ultimoMovimiento = performance.now();
  };

  P.terminarGesto = function () {
    this.tocando = false;
    if (performance.now() - this._ultimoMovimiento > 90) this.vAz = this.vEl = 0;
    this.vAz = C.limitar(this.vAz, -3.2, 3.2);
    this.vEl = C.limitar(this.vEl, -1.8, 1.8);
  };

  // factor > 1 acerca. inmediato: aplica ya (pellizco), si no, se suaviza (rueda, botones).
  P.acercar = function (factor, inmediato) {
    this.detenerVuelo();
    var L = this.limites;
    this.distDeseada = C.limitar(this.distDeseada / factor, L.distMin * 0.8, L.distMax * 1.15);
    if (inmediato) this.dist = this.distDeseada;
  };

  /* ---------- Gestos ---------- */

  // manejadores: modo() → "orbita" | "momento" | "nada"; toque(x, y); dobleToque(x, y);
  // momento(tipo, x, y) con tipo "abajo" | "mover" | "arriba"; interaccion().
  function Gestos(elemento, camara, manejadores) {
    var punteros = {};
    var cantidad = 0;
    var modo = null;
    var pinza = null;
    var huboPinza = false;
    var ultimoToque = { t: 0, x: 0, y: 0 };

    function pos(e) {
      var r = elemento.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function medidas() {
      return { ancho: elemento.clientWidth || window.innerWidth, alto: elemento.clientHeight || window.innerHeight };
    }
    function datosPinza() {
      var ids = Object.keys(punteros), a = punteros[ids[0]], b = punteros[ids[1]];
      return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    elemento.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      var m = manejadores.modo();
      if (m === "nada") return;
      if (cantidad === 0) modo = m;
      if (modo !== m) return;
      if (modo === "momento" && cantidad >= 1) return;
      var p = pos(e);
      punteros[e.pointerId] = { x: p.x, y: p.y, x0: p.x, y0: p.y, t0: performance.now(), t: performance.now(), arrastre: false };
      cantidad++;
      try { elemento.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      e.preventDefault();
      if (manejadores.interaccion) manejadores.interaccion(e);
      if (modo === "momento") {
        manejadores.momento("abajo", p.x, p.y, e);
        return;
      }
      if (cantidad === 1) {
        camara.empezarGesto();
        huboPinza = false;
      } else if (cantidad === 2) {
        pinza = datosPinza();
        huboPinza = true;
      }
    });

    elemento.addEventListener("pointermove", function (e) {
      var q = punteros[e.pointerId];
      if (!q) return;
      var p = pos(e), ahora = performance.now();
      if (modo === "momento") {
        q.x = p.x; q.y = p.y;
        manejadores.momento("mover", p.x, p.y, e);
        return;
      }
      var dx = p.x - q.x, dy = p.y - q.y, dt = ahora - q.t;
      q.x = p.x; q.y = p.y; q.t = ahora;
      if (!q.arrastre && Math.hypot(p.x - q.x0, p.y - q.y0) > 7) q.arrastre = true;
      var m = medidas();
      if (cantidad === 1 && q.arrastre) {
        camara.girar(dx, dy, dt, m.ancho, m.alto);
      } else if (cantidad >= 2 && pinza) {
        var nueva = datosPinza();
        if (pinza.d > 0 && nueva.d > 0) camara.acercar(nueva.d / pinza.d, true);
        camara.girar((nueva.x - pinza.x) * 0.6, (nueva.y - pinza.y) * 0.6, dt, m.ancho, m.alto);
        pinza = nueva;
      }
    });

    function fin(e) {
      var q = punteros[e.pointerId];
      if (!q) return;
      delete punteros[e.pointerId];
      cantidad--;
      var p = pos(e);
      if (modo === "momento") {
        manejadores.momento("arriba", p.x, p.y, e);
        if (cantidad <= 0) { cantidad = 0; modo = null; }
        return;
      }
      if (cantidad <= 0) {
        cantidad = 0;
        camara.terminarGesto();
        var ahora = performance.now();
        var esToque = e.type === "pointerup" && !q.arrastre && !huboPinza && ahora - q.t0 < 600;
        if (esToque) {
          var doble = ahora - ultimoToque.t < 340 && Math.hypot(p.x - ultimoToque.x, p.y - ultimoToque.y) < 36;
          ultimoToque = { t: doble ? 0 : ahora, x: p.x, y: p.y };
          if (doble && manejadores.dobleToque) manejadores.dobleToque(p.x, p.y);
          else if (manejadores.toque) manejadores.toque(p.x, p.y);
        }
        pinza = null;
        modo = null;
      } else if (cantidad === 1) {
        // Queda un dedo tras pellizcar: sigue desde donde está, sin saltos.
        pinza = null;
        var resto = punteros[Object.keys(punteros)[0]];
        resto.t = performance.now();
        resto.arrastre = true;
      }
    }
    elemento.addEventListener("pointerup", fin);
    elemento.addEventListener("pointercancel", fin);
    elemento.addEventListener("lostpointercapture", function (e) { if (punteros[e.pointerId]) fin(e); });

    elemento.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (manejadores.modo() !== "orbita") return;
      var d = e.deltaMode === 1 ? e.deltaY * 18 : e.deltaY;
      camara.acercar(Math.exp(-d * 0.0014));
      if (manejadores.interaccion) manejadores.interaccion(e);
    }, { passive: false });

    elemento.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); });

    return {
      reiniciar: function () {
        punteros = {};
        cantidad = 0;
        modo = null;
        pinza = null;
      }
    };
  }

  C.Camara = Camara;
  C.Gestos = Gestos;
})(window.Cielo);
