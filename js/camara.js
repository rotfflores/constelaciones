/* El cielo de nosotros · cámara y gestos
   Arrastrar con inercia, pellizcar para acercar, doble toque, rueda del ratón,
   bordes elásticos y vuelos de cámara suaves entre puntos del cielo. */
(function (C) {
  "use strict";

  var RHO = Math.SQRT2;
  function cosh(x) { x = Math.exp(x); return (x + 1 / x) / 2; }
  function sinh(x) { x = Math.exp(x); return (x - 1 / x) / 2; }
  function tanh(x) { x = Math.exp(2 * x); return (x - 1) / (x + 1); }

  /* Interpolación de vuelo (van Wijk y Nuij): se aleja un poco para viajar
     lejos y se vuelve a acercar, como una cámara de cine. p = [x, y, ancho]. */
  function interpolarVuelo(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
    var dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < 1e-6) {
      S = Math.log(w1 / w0) / RHO;
      i = function (t) { return [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(RHO * t * S)]; };
    } else {
      var d1 = Math.sqrt(d2),
        b0 = (w1 * w1 - w0 * w0 + 4 * d2) / (4 * w0 * d1),
        b1 = (w1 * w1 - w0 * w0 - 4 * d2) / (4 * w1 * d1),
        r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
        r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / RHO;
      i = function (t) {
        var s = t * S, ch = cosh(r0), u = w0 / (2 * d1) * (ch * tanh(RHO * s + r0) - sinh(r0));
        return [ux0 + u * dx, uy0 + u * dy, w0 * ch / cosh(RHO * s + r0)];
      };
    }
    i.duracion = Math.abs(S) * 1000;
    return i;
  }

  function interpolarDirecto(p0, p1) {
    var i = function (t) {
      return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] * Math.pow(p1[2] / p0[2], t)];
    };
    i.duracion = 1200;
    return i;
  }

  // Resistencia elástica fuera de los límites.
  function goma(valor, min, max, maximo) {
    if (valor < min) return min - maximo * (1 - 1 / ((min - valor) * 0.55 / maximo + 1));
    if (valor > max) return max + maximo * (1 - 1 / ((valor - max) * 0.55 / maximo + 1));
    return valor;
  }
  function gomaZoom(z, min, max) {
    if (z < min) return min * Math.pow(z / min, 0.35);
    if (z > max) return max * Math.pow(z / max, 0.35);
    return z;
  }

  /* ---------- Cámara ---------- */
  function Camara() {
    this.x = 0; this.y = 0; this.z = 1;
    this.W = 1; this.H = 1;
    this.mundo = null;
    this.zMax = 3.4;
    this.vx = 0; this.vy = 0;
    this.vuelo = null;
    this.gesto = null;
    this.ancla = null;
    this.zObjetivo = null;
    this.cambio = true;
  }
  var P = Camara.prototype;

  P.dimensionar = function (W, H) { this.W = W; this.H = H; this.cambio = true; };
  P.zMin = function () { return Math.max(this.W / this.mundo.w, this.H / this.mundo.h); };
  P.limites = function (z) {
    var m = this.mundo, mw = this.W / (2 * z), mh = this.H / (2 * z);
    var r = { minX: mw, maxX: m.w - mw, minY: mh, maxY: m.h - mh };
    if (r.minX > r.maxX) r.minX = r.maxX = m.w / 2;
    if (r.minY > r.maxY) r.minY = r.maxY = m.h / 2;
    return r;
  };
  P.restringir = function (v) {
    var z = C.limitar(v.z, this.zMin(), this.zMax), l = this.limites(z);
    return { x: C.limitar(v.x, l.minX, l.maxX), y: C.limitar(v.y, l.minY, l.maxY), z: z };
  };
  P.aPantalla = function (wx, wy) {
    return { x: (wx - this.x) * this.z + this.W / 2, y: (wy - this.y) * this.z + this.H / 2 };
  };
  P.aMundo = function (sx, sy) {
    return { x: (sx - this.W / 2) / this.z + this.x, y: (sy - this.H / 2) / this.z + this.y };
  };
  P.estado = function () { return { x: this.x, y: this.y, z: this.z }; };
  P.enMovimiento = function () { return !!(this.vuelo || this.gesto || this.vx || this.vy || this.zObjetivo); };

  P.detener = function () {
    this.vx = this.vy = 0;
    this.zObjetivo = null;
    if (this.vuelo) { var v = this.vuelo; this.vuelo = null; v.resolver(false); }
  };
  P.fijar = function (v) {
    this.detener();
    var r = this.restringir(v);
    this.x = r.x; this.y = r.y; this.z = r.z;
    this.cambio = true;
  };

  P.volarA = function (destino, opciones) {
    opciones = opciones || {};
    var self = this, d = this.restringir(destino);
    this.detener();
    return new Promise(function (resolver) {
      var crear = opciones.directo ? interpolarDirecto : interpolarVuelo;
      var interp = crear([self.x, self.y, self.W / self.z], [d.x, d.y, self.W / d.z]);
      var dur = opciones.duracion != null ? opciones.duracion
        : C.limitar(interp.duracion * (opciones.velocidad || 0.95), opciones.minimo || 650, opciones.maximo || 2600);
      if (C.movimientoReducido() || dur <= 0) {
        self.x = d.x; self.y = d.y; self.z = d.z; self.cambio = true;
        resolver(true);
        return;
      }
      self.vuelo = { interp: interp, inicio: null, dur: dur, destino: d, resolver: resolver, curva: opciones.curva || C.suave };
    });
  };

  /* Gesto continuo: se recalcula desde el estado inicial para no acumular error. */
  P.iniciarGesto = function (cx, cy, distancia) {
    this.vx = this.vy = 0;
    this.zObjetivo = null;
    if (this.vuelo) this.detener();
    this.gesto = { x0: this.x, y0: this.y, z0: this.z, cx: cx, cy: cy, d: distancia || 0 };
  };
  P.moverGesto = function (cx, cy, distancia) {
    var g = this.gesto;
    if (!g) return;
    var zc = g.z0 * (g.d && distancia ? distancia / g.d : 1);
    var z = gomaZoom(zc, this.zMin(), this.zMax);
    var wx = (g.cx - this.W / 2) / g.z0 + g.x0, wy = (g.cy - this.H / 2) / g.z0 + g.y0;
    var l = this.limites(z);
    this.x = goma(wx - (cx - this.W / 2) / z, l.minX, l.maxX, this.W * 0.22 / z);
    this.y = goma(wy - (cy - this.H / 2) / z, l.minY, l.maxY, this.H * 0.22 / z);
    this.z = z;
    this.cambio = true;
  };
  P.terminarGesto = function (vxPx, vyPx, cx, cy) {
    this.gesto = null;
    this.ancla = { x: cx, y: cy };
    if (!C.movimientoReducido()) {
      var tope = 4.5;
      this.vx = -C.limitar(vxPx, -tope, tope) / this.z;
      this.vy = -C.limitar(vyPx, -tope, tope) / this.z;
    }
    this.cambio = true;
  };

  // Zoom alrededor de un punto de la pantalla (rueda del ratón, botones, doble toque).
  P.zoomEn = function (factor, sx, sy) {
    if (this.vuelo) this.detener();
    this.vx = this.vy = 0;
    var base = this.zObjetivo != null ? this.zObjetivo : this.z;
    this.zObjetivo = C.limitar(base * factor, this.zMin(), this.zMax);
    this.ancla = { x: sx, y: sy };
  };

  P.actualizar = function (dt, ahora) {
    var movio = this.cambio;
    this.cambio = false;

    if (this.vuelo) {
      var v = this.vuelo;
      if (v.inicio == null) v.inicio = ahora;
      var t = C.limitar((ahora - v.inicio) / v.dur, 0, 1);
      var p = v.interp(v.curva(t));
      this.x = p[0]; this.y = p[1]; this.z = this.W / p[2];
      if (t >= 1) {
        this.vuelo = null;
        this.x = v.destino.x; this.y = v.destino.y; this.z = v.destino.z;
        v.resolver(true);
      }
      return true;
    }
    if (this.gesto) return movio;

    var a = this.ancla || { x: this.W / 2, y: this.H / 2 }, punto;

    if (this.zObjetivo != null) {
      punto = this.aMundo(a.x, a.y);
      var k = 1 - Math.exp(-dt / 75);
      var z = this.z + (this.zObjetivo - this.z) * k;
      if (Math.abs(z - this.zObjetivo) < 1e-4) { z = this.zObjetivo; this.zObjetivo = null; }
      this.z = z;
      this.x = punto.x - (a.x - this.W / 2) / z;
      this.y = punto.y - (a.y - this.H / 2) / z;
      var r = this.restringir(this);
      this.x = r.x; this.y = r.y;
      movio = true;
    }

    var l = this.limites(this.z);
    if (this.vx || this.vy) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      var fuera = this.x < l.minX || this.x > l.maxX || this.y < l.minY || this.y > l.maxY;
      var f = Math.exp(-dt / (fuera ? 60 : 430));
      this.vx *= f; this.vy *= f;
      if (Math.abs(this.vx * this.z) < 0.008 && Math.abs(this.vy * this.z) < 0.008) this.vx = this.vy = 0;
      movio = true;
    }

    var zMin = this.zMin();
    if (this.z < zMin - 1e-6 || this.z > this.zMax + 1e-6) {
      var zt = C.limitar(this.z, zMin, this.zMax);
      punto = this.aMundo(a.x, a.y);
      var z2 = this.z + (zt - this.z) * (1 - Math.exp(-dt / 90));
      if (Math.abs(z2 - zt) < 1e-4) z2 = zt;
      this.z = z2;
      this.x = punto.x - (a.x - this.W / 2) / z2;
      this.y = punto.y - (a.y - this.H / 2) / z2;
      l = this.limites(this.z);
      movio = true;
    }

    var tx = C.limitar(this.x, l.minX, l.maxX), ty = C.limitar(this.y, l.minY, l.maxY);
    if (tx !== this.x || ty !== this.y) {
      var k2 = 1 - Math.exp(-dt / 110);
      this.x += (tx - this.x) * k2;
      this.y += (ty - this.y) * k2;
      if (Math.abs(tx - this.x) * this.z < 0.3) this.x = tx;
      if (Math.abs(ty - this.y) * this.z < 0.3) this.y = ty;
      movio = true;
    }
    return movio;
  };

  /* ---------- Gestos ----------
     cb.modo() devuelve "explorar", "trazar" o "nada".
     En "explorar": un dedo arrastra, dos dedos pellizcan, un toque selecciona.
     En "trazar": el dedo dibuja sobre las estrellas de una constelación. */
  function Gestos(el, camara, cb) {
    var punteros = {}, cantidad = 0;
    var toque = null, muestras = [], ultimoToque = null, trazando = false;

    function lista() { var r = []; for (var k in punteros) r.push(punteros[k]); return r; }
    function centro() {
      var l = lista(), x = 0, y = 0;
      l.forEach(function (p) { x += p.x; y += p.y; });
      return { x: x / l.length, y: y / l.length };
    }
    function distancia() {
      var l = lista();
      if (l.length < 2) return 0;
      return Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y);
    }
    function reiniciarBase() {
      var c = centro();
      camara.iniciarGesto(c.x, c.y, distancia());
      muestras = [{ t: performance.now(), x: c.x, y: c.y }];
    }

    function abajo(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      var modo = cb.modo();
      if (modo === "nada" || (modo === "trazar" && cantidad >= 1)) return;
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* puntero sintético */ }
      punteros[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: performance.now() };
      cantidad++;
      e.preventDefault();
      if (modo === "explorar") {
        toque = cantidad === 1 ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
        if (cantidad === 1) camara.detener();
        if (cantidad === 2) reiniciarBase();
      } else if (modo === "trazar" && cantidad === 1) {
        toque = { x: e.clientX, y: e.clientY, t: performance.now() };
        trazando = false;
      }
    }

    function mover(e) {
      var p = punteros[e.pointerId];
      if (!p) return;
      p.x = e.clientX; p.y = e.clientY;
      var modo = cb.modo();
      if (modo === "explorar") {
        if (toque && Math.hypot(p.x - toque.x, p.y - toque.y) > 7) {
          toque = null;
          reiniciarBase();
          if (cb.interaccion) cb.interaccion("arrastre");
        }
        if (!toque && camara.gesto) {
          var c = centro();
          camara.moverGesto(c.x, c.y, distancia());
          var ahora = performance.now();
          muestras.push({ t: ahora, x: c.x, y: c.y });
          while (muestras.length > 2 && ahora - muestras[0].t > 90) muestras.shift();
          if (cantidad > 1 && cb.interaccion) cb.interaccion("pellizco");
        }
      } else if (modo === "trazar" && cantidad === 1) {
        if (toque && Math.hypot(p.x - toque.x, p.y - toque.y) > 6) {
          toque = null;
          trazando = true;
          if (cb.trazoInicio) cb.trazoInicio(p.x0, p.y0);
        }
        if (trazando && cb.trazoMovimiento) cb.trazoMovimiento(p.x, p.y);
      }
    }

    function arriba(e) {
      var p = punteros[e.pointerId];
      if (!p) return;
      delete punteros[e.pointerId];
      cantidad = Math.max(0, cantidad - 1);
      var modo = cb.modo();
      var cancelado = e.type === "pointercancel";

      if (modo === "trazar" || trazando) {
        if (trazando) { trazando = false; if (cb.trazoFin) cb.trazoFin(); }
        else if (toque && !cancelado && cb.toque) cb.toque(toque.x, toque.y);
        toque = null;
        return;
      }

      if (cantidad === 0) {
        if (toque && !cancelado && performance.now() - toque.t < 600) {
          var x = toque.x, y = toque.y, ahora = performance.now();
          toque = null;
          var atendido = cb.toque ? cb.toque(x, y) : false;
          if (!atendido) {
            if (ultimoToque && ahora - ultimoToque.t < 330 && Math.hypot(x - ultimoToque.x, y - ultimoToque.y) < 40) {
              ultimoToque = null;
              if (cb.dobleToque) cb.dobleToque(x, y);
            } else {
              ultimoToque = { t: ahora, x: x, y: y };
            }
          }
          return;
        }
        toque = null;
        if (camara.gesto) {
          var vx = 0, vy = 0, ultimo = muestras[muestras.length - 1], primero = muestras[0];
          if (ultimo && primero && ultimo !== primero && performance.now() - ultimo.t < 70) {
            var dtm = Math.max(1, ultimo.t - primero.t);
            vx = (ultimo.x - primero.x) / dtm;
            vy = (ultimo.y - primero.y) / dtm;
          }
          camara.terminarGesto(vx, vy, ultimo ? ultimo.x : camara.W / 2, ultimo ? ultimo.y : camara.H / 2);
        }
      } else if (camara.gesto) {
        reiniciarBase();
      }
    }

    function rueda(e) {
      if (cb.modo() !== "explorar") return;
      e.preventDefault();
      var delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      var factor = Math.exp(-delta * (e.ctrlKey ? 0.012 : 0.0018));
      camara.zoomEn(factor, e.clientX, e.clientY);
      if (cb.interaccion) cb.interaccion("zoom");
    }

    el.addEventListener("pointerdown", abajo);
    el.addEventListener("pointermove", mover);
    el.addEventListener("pointerup", arriba);
    el.addEventListener("pointercancel", arriba);
    el.addEventListener("lostpointercapture", function (e) { if (punteros[e.pointerId]) arriba(e); });
    el.addEventListener("wheel", rueda, { passive: false });
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    // Safari: evita el zoom de la página con dos dedos.
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); });

    return {
      cancelar: function () {
        punteros = {}; cantidad = 0; toque = null;
        if (trazando) { trazando = false; if (cb.trazoFin) cb.trazoFin(); }
        if (camara.gesto) camara.terminarGesto(0, 0, camara.W / 2, camara.H / 2);
      }
    };
  }

  C.Camara = Camara;
  C.Gestos = Gestos;
})(window.Cielo);
