/* El cielo de nosotros · escena
   Capa 2D sobre el cielo: horizonte con montañas y paralaje, la pareja que mira
   las estrellas, constelaciones, destellos, partículas, estrellas fugaces y el
   recorrido luminoso final. */
(function (C) {
  "use strict";

  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }

  function crearSprite(tam, nucleo, halo, picos, alfaPicos) {
    var c = document.createElement("canvas");
    c.width = c.height = tam;
    var g = c.getContext("2d"), m = tam / 2;
    var rg = g.createRadialGradient(m, m, 0, m, m, m);
    rg.addColorStop(0, rgba(nucleo, 1));
    rg.addColorStop(0.07, rgba(nucleo, 0.95));
    rg.addColorStop(0.13, rgba(halo, 0.5));
    rg.addColorStop(0.3, rgba(halo, 0.14));
    rg.addColorStop(0.6, rgba(halo, 0.035));
    rg.addColorStop(1, rgba(halo, 0));
    g.fillStyle = rg;
    g.fillRect(0, 0, tam, tam);
    if (picos) {
      g.globalCompositeOperation = "lighter";
      var grosor = Math.max(1, tam * 0.012);
      [true, false].forEach(function (horizontal) {
        var lg = horizontal ? g.createLinearGradient(0, 0, tam, 0) : g.createLinearGradient(0, 0, 0, tam);
        lg.addColorStop(0, rgba(picos, 0));
        lg.addColorStop(0.32, rgba(picos, alfaPicos * 0.1));
        lg.addColorStop(0.5, rgba(picos, alfaPicos));
        lg.addColorStop(0.68, rgba(picos, alfaPicos * 0.1));
        lg.addColorStop(1, rgba(picos, 0));
        g.fillStyle = lg;
        if (horizontal) g.fillRect(0, m - grosor / 2, tam, grosor);
        else g.fillRect(m - grosor / 2, 0, grosor, tam);
      });
    }
    return c;
  }

  function crearAura(tam, color) {
    var c = document.createElement("canvas");
    c.width = c.height = tam;
    var g = c.getContext("2d"), m = tam / 2;
    var rg = g.createRadialGradient(m, m, 0, m, m, m);
    rg.addColorStop(0, rgba(color, 0.55));
    rg.addColorStop(0.35, rgba(color, 0.22));
    rg.addColorStop(0.7, rgba(color, 0.05));
    rg.addColorStop(1, rgba(color, 0));
    g.fillStyle = rg;
    g.fillRect(0, 0, tam, tam);
    return c;
  }

  // Ruido 1D suave para las crestas de las montañas.
  function ruido1D(rnd, longitud) {
    var v = [];
    for (var i = 0; i < 1024; i++) v.push(rnd());
    return function (x) {
      var p = x / longitud, i = Math.floor(p), f = p - i, u = f * f * (3 - 2 * f);
      var a = v[((i % 1024) + 1024) % 1024], b = v[(((i + 1) % 1024) + 1024) % 1024];
      return a + (b - a) * u;
    };
  }

  function pino(p, x, y, h) {
    var w = h * 0.34, niveles = 5, tronco = w * 0.09, puntas = [];
    for (var i = 1; i <= niveles; i++) {
      puntas.push({ y: y - h + h * 0.9 * i / niveles, w: w * (0.35 + 0.65 * i / niveles) });
    }
    p.moveTo(x, y - h);
    puntas.forEach(function (pt, i) {
      p.lineTo(x + pt.w, pt.y);
      if (i < puntas.length - 1) p.lineTo(x + pt.w * 0.32, pt.y - h * 0.02);
    });
    p.lineTo(x + tronco, puntas[puntas.length - 1].y);
    p.lineTo(x + tronco, y + 4);
    p.lineTo(x - tronco, y + 4);
    p.lineTo(x - tronco, puntas[puntas.length - 1].y);
    for (var j = puntas.length - 1; j >= 0; j--) {
      p.lineTo(x - puntas[j].w, puntas[j].y);
      if (j > 0) p.lineTo(x - puntas[j - 1].w * 0.32, puntas[j - 1].y - h * 0.02);
    }
    p.closePath();
  }

  // Dos personas sentadas, muy juntas, mirando el cielo.
  function pareja(p, x, y, s) {
    p.moveTo(x - 30 * s, y + 6 * s);
    p.bezierCurveTo(x - 26 * s, y - 2 * s, x - 18 * s, y - 4 * s, x - 15 * s, y - 6 * s);
    p.bezierCurveTo(x - 17 * s, y - 16 * s, x - 16 * s, y - 27 * s, x - 9 * s, y - 31 * s);
    p.bezierCurveTo(x - 5 * s, y - 33 * s, x - 1 * s, y - 31 * s, x + 1 * s, y - 28 * s);
    p.bezierCurveTo(x + 4 * s, y - 30 * s, x + 9 * s, y - 30 * s, x + 12 * s, y - 25 * s);
    p.bezierCurveTo(x + 16 * s, y - 18 * s, x + 16 * s, y - 10 * s, x + 15 * s, y - 5 * s);
    p.bezierCurveTo(x + 20 * s, y - 3 * s, x + 26 * s, y - 1 * s, x + 30 * s, y + 6 * s);
    p.closePath();
    p.moveTo(x - 6 * s + 5.4 * s, y - 37 * s);
    p.arc(x - 6 * s, y - 37 * s, 5.4 * s, 0, Math.PI * 2);
    p.moveTo(x + 6.5 * s + 4.9 * s, y - 34.5 * s);
    p.arc(x + 6.5 * s, y - 34.5 * s, 4.9 * s, 0, Math.PI * 2);
  }

  function recortar(a, b, h) {
    var dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    if (l < h * 2.2) return [a.x, a.y, a.x, a.y];
    return [a.x + dx / l * h, a.y + dy / l * h, b.x - dx / l * h, b.y - dy / l * h];
  }

  /* ---------- Escena ---------- */
  function Escena(lienzo) {
    this.lienzo = lienzo;
    this.ctx = lienzo.getContext("2d");
    this.W = 1; this.H = 1; this.dpr = 1;
    this.mundo = null;
    this.constelaciones = [];
    this.porId = {};
    this.efectos = [];
    this.meteoros = [];
    this.recorrido = null;
    this.trazo = null;
    this.sprites = {
      fria: crearSprite(128, [255, 255, 255], [196, 210, 255], [214, 226, 255], 0.55),
      dorada: crearSprite(128, [255, 250, 238], [232, 200, 138], [242, 216, 160], 0.85),
      chispa: crearSprite(48, [255, 249, 232], [236, 206, 150], null, 0),
      auraFria: crearAura(256, [170, 190, 255]),
      auraDorada: crearAura(256, [222, 192, 132])
    };
  }
  var P = Escena.prototype;

  P.dimensionar = function (W, H, dpr) {
    this.W = W; this.H = H; this.dpr = dpr;
    this.lienzo.width = Math.round(W * dpr);
    this.lienzo.height = Math.round(H * dpr);
    this.lienzo.style.width = W + "px";
    this.lienzo.style.height = H + "px";
  };

  P.configurar = function (mundo, config) {
    this.mundo = mundo;
    var rnd = C.azar(91);
    this.constelaciones = mundo.constelaciones.map(function (mc, i) {
      var cfg = config.constelaciones[i];
      return {
        id: mc.id, nombre: cfg.nombre, datos: mc,
        trazos: cfg.trazos, anillos: cfg.anillos || [],
        encendidas: [], lineas: {}, aros: {},
        descubierta: false, completaEn: null, fase: rnd() * 6.283
      };
    });
    var porId = this.porId = {};
    this.constelaciones.forEach(function (c) { porId[c.id] = c; });
    this.efectos = [];
    this.recorrido = null;
    this.trazo = null;
    this.construirPaisaje(mundo);
  };

  /* ---------- Paisaje ---------- */
  P.construirPaisaje = function (m) {
    var rnd = C.azar(29);
    var margen = m.w * 0.3;
    var x0 = -margen, x1 = m.w + margen, fondo = m.h + 900, paso = 6;
    var parejaX = m.ancla.x - (m.vertical ? 120 : 380);

    function perfil(base, alto, longitudes, amplitudes, picudo) {
      var ruidos = longitudes.map(function (l) { return ruido1D(rnd, l); });
      var suma = amplitudes.reduce(function (a, b) { return a + b; }, 0);
      return function (x) {
        var h = 0;
        for (var k = 0; k < ruidos.length; k++) {
          var n = ruidos[k](x);
          if (picudo && k < 2) n = 1 - Math.abs(2 * n - 1);
          h += n * amplitudes[k];
        }
        return base - alto * (h / suma);
      };
    }

    var capas = [
      { f: 1.0, alto: m.vertical ? 300 : 380, base: m.horizonte + 50, l: [520, 230, 90, 34, 14], a: [0.55, 0.27, 0.11, 0.05, 0.02], picudo: true,
        arriba: "#0f1636", abajo: "#080c22", borde: true },
      { f: 1.1, alto: 170, base: m.horizonte + 120, l: [460, 190, 70, 26], a: [0.6, 0.25, 0.1, 0.05], picudo: false,
        arriba: "#080c20", abajo: "#050815", arboles: { prob: 0.05, min: 14, max: 34 } },
      { f: 1.22, alto: 120, base: m.horizonte + 175, l: [900, 360, 120, 40], a: [0.6, 0.25, 0.1, 0.05], picudo: false,
        arriba: "#04060e", abajo: "#020308", arboles: { prob: 0.11, min: 36, max: 108 }, pareja: true, borde: true, loma: m.vertical ? 150 : 190 }
    ];

    this.capas = capas.map(function (cp) {
      var relieve = perfil(cp.base, cp.alto, cp.l, cp.a, cp.picudo);
      var altura = cp.loma ? function (x) {
        return relieve(x) - cp.loma * Math.exp(-Math.pow((x - parejaX) / (m.vertical ? 260 : 420), 2));
      } : relieve;
      var camino = new Path2D(), borde = cp.borde ? new Path2D() : null, minY = Infinity;
      camino.moveTo(x0, fondo);
      for (var x = x0; x <= x1; x += paso) {
        var y = altura(x);
        if (cp.pareja && Math.abs(x - parejaX) < 120) {
          var meseta = altura(parejaX) - 4, k = C.pasoSuave(120, 40, Math.abs(x - parejaX));
          y = y + (meseta - y) * k;
        }
        minY = Math.min(minY, y);
        camino.lineTo(x, y);
        if (borde) { if (x === x0) borde.moveTo(x, y); else borde.lineTo(x, y); }
      }
      camino.lineTo(x1, fondo);
      camino.closePath();
      if (cp.arboles) {
        for (var xa = x0; xa <= x1; xa += 9) {
          if (cp.pareja && Math.abs(xa - parejaX) < 170) continue;
          if (rnd() < cp.arboles.prob) {
            var h = cp.arboles.min + rnd() * (cp.arboles.max - cp.arboles.min);
            var ya = altura(xa) + 3;
            pino(camino, xa, ya, h);
            minY = Math.min(minY, ya - h);
          }
        }
      }
      if (cp.pareja) {
        var py = altura(parejaX) - 2;
        pareja(camino, parejaX, py, m.vertical ? 1.15 : 1.3);
      }
      return { f: cp.f, camino: camino, borde: borde, minY: minY, arriba: cp.arriba, abajo: cp.abajo, base: cp.base, alto: cp.alto + (cp.loma || 0), x0: x0, x1: x1, brilloBorde: cp.loma ? 0.09 : 0.16 };
    });
  };

  P.dibujarPaisaje = function (cam, ui) {
    var ctx = this.ctx, m = this.mundo, a = m.ancla, dpr = this.dpr, z = cam.z, W = this.W, H = this.H;
    this.capas.forEach(function (cp, i) {
      var tx = W / 2 - a.x * z + (a.x - cam.x) * cp.f * z;
      var ty = H / 2 - a.y * z + (a.y - cam.y) * cp.f * z;
      if (cp.minY * z + ty > H + 2) return;
      ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * tx, dpr * ty);
      if (i === 0) {
        // Resplandor del horizonte: luz cálida y bruma azul sobre las montañas.
        var g = ctx.createLinearGradient(0, m.horizonte - 620, 0, m.horizonte + 40);
        g.addColorStop(0, "rgba(40,55,120,0)");
        g.addColorStop(0.55, "rgba(48,64,140,0.07)");
        g.addColorStop(0.85, "rgba(170,150,130,0.10)");
        g.addColorStop(1, "rgba(215,185,140,0.16)");
        ctx.globalAlpha = ui.aparicion;
        ctx.fillStyle = g;
        ctx.fillRect(cp.x0, m.horizonte - 620, cp.x1 - cp.x0, 700);
        ctx.globalAlpha = 1;
      }
      var relleno = ctx.createLinearGradient(0, cp.base - cp.alto, 0, cp.base + 120);
      relleno.addColorStop(0, cp.arriba);
      relleno.addColorStop(1, cp.abajo);
      ctx.fillStyle = relleno;
      ctx.fill(cp.camino);
      if (cp.borde) {
        ctx.strokeStyle = "rgba(205,184,133," + (cp.brilloBorde * ui.aparicion).toFixed(3) + ")";
        ctx.lineWidth = 1.1 / z;
        ctx.stroke(cp.borde);
      }
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  /* ---------- Estado visual de las constelaciones ---------- */
  P.encender = function (id, i, t, silencioso) {
    var c = this.porId[id];
    if (!c || c.encendidas[i] != null) return;
    var t0 = silencioso ? -1e9 : t;
    c.encendidas[i] = t0;
    c.trazos.forEach(function (tr, k) {
      if (c.lineas[k]) return;
      var otro = tr[0] === i ? tr[1] : tr[1] === i ? tr[0] : -1;
      if (otro < 0 || c.encendidas[otro] == null) return;
      c.lineas[k] = { desde: otro, hasta: i, inicio: t0, dur: 520, punteada: tr[2] === "punteado" };
    });
    c.anillos.forEach(function (an) {
      if (an.estrella === i) c.aros[i] = { inicio: t0, radio: an.radio };
    });
    if (!silencioso) {
      var e = c.datos.estrellas[i];
      this.efectos.push({ tipo: "destello", id: id, i: i, inicio: t, dur: 950 });
      this.chispas(e.x, e.y, t, 12, 1);
    }
  };

  P.completar = function (id, t, silencioso) {
    var c = this.porId[id];
    if (!c) return;
    c.descubierta = true;
    c.completaEn = silencioso ? -1e9 : t;
    if (!silencioso) {
      this.efectos.push({ tipo: "onda", id: id, inicio: t, dur: 1500 });
      var self = this;
      c.datos.estrellas.forEach(function (e, i) {
        self.efectos.push({ tipo: "destello", id: id, i: i, inicio: t + i * 70, dur: 900, suave: true });
      });
      this.chispas(c.datos.ccx, c.datos.ccy, t, 26, 2.2);
    }
  };

  P.reiniciar = function () {
    this.constelaciones.forEach(function (c) {
      c.encendidas = []; c.lineas = {}; c.aros = {};
      c.descubierta = false; c.completaEn = null;
    });
    this.efectos = [];
    this.recorrido = null;
    this.trazo = null;
  };

  P.chispas = function (wx, wy, t, n, fuerza) {
    if (C.movimientoReducido()) return;
    for (var k = 0; k < n; k++) {
      var ang = Math.random() * Math.PI * 2;
      this.efectos.push({
        tipo: "chispa", wx: wx, wy: wy, inicio: t, dur: 700 + Math.random() * 700,
        dx: Math.cos(ang), dy: Math.sin(ang), vel: (30 + Math.random() * 100) * (fuerza || 1),
        tam: 4 + Math.random() * 6
      });
    }
  };

  /* ---------- Estrellas fugaces ---------- */
  P.meteoro = function (t, retraso) {
    if (C.movimientoReducido()) return;
    var izquierda = Math.random() < 0.5, ang = 0.32 + Math.random() * 0.42;
    this.meteoros.push({
      x: this.W * (0.15 + Math.random() * 0.7), y: this.H * (0.04 + Math.random() * 0.38),
      dx: Math.cos(ang) * (izquierda ? -1 : 1), dy: Math.sin(ang),
      vel: 0.8 + Math.random() * 0.8, largo: 120 + Math.random() * 160,
      inicio: t + (retraso || 0), dur: 650 + Math.random() * 550, brillo: 0.55 + Math.random() * 0.45
    });
  };

  P.dibujarMeteoros = function (t) {
    var ctx = this.ctx, chispa = this.sprites.chispa;
    ctx.globalCompositeOperation = "lighter";
    this.meteoros = this.meteoros.filter(function (m) {
      var e = t - m.inicio;
      if (e < 0) return true;
      var p = e / m.dur;
      if (p >= 1) return false;
      var hx = m.x + m.dx * m.vel * e, hy = m.y + m.dy * m.vel * e;
      var largo = m.largo * Math.min(1, p * 2.5);
      var cx = hx - m.dx * largo, cy = hy - m.dy * largo;
      var a = Math.sin(p * Math.PI) * m.brillo;
      var g = ctx.createLinearGradient(hx, hy, cx, cy);
      g.addColorStop(0, "rgba(255,250,235," + a.toFixed(3) + ")");
      g.addColorStop(0.25, "rgba(210,225,255," + (a * 0.45).toFixed(3) + ")");
      g.addColorStop(1, "rgba(180,200,255,0)");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = g;
      ctx.lineCap = "round";
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(cx, cy); ctx.stroke();
      ctx.globalAlpha = a * 0.35;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.globalAlpha = a;
      ctx.drawImage(chispa, hx - 7, hy - 7, 14, 14);
      return true;
    });
    ctx.globalAlpha = 1;
  };

  /* ---------- Recorrido final ---------- */
  P.prepararRecorrido = function () {
    var pts = this.constelaciones.map(function (c) {
      var mejor = c.datos.estrellas[0];
      c.datos.estrellas.forEach(function (e) { if (e.brillo > mejor.brillo) mejor = e; });
      return { x: mejor.x, y: mejor.y };
    });
    var muestras = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (var k = 0; k < 28; k++) {
        var t = k / 28, t2 = t * t, t3 = t2 * t;
        muestras.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    muestras.push(pts[pts.length - 1]);
    var largos = [0];
    for (var j = 1; j < muestras.length; j++) {
      largos.push(largos[j - 1] + Math.hypot(muestras[j].x - muestras[j - 1].x, muestras[j].y - muestras[j - 1].y));
    }
    this.recorrido = { puntos: muestras, largos: largos, total: largos[largos.length - 1], inicio: -1e9, dur: 1, ultimaChispa: 0 };
  };
  P.iniciarRecorrido = function (t, dur) {
    if (!this.recorrido) this.prepararRecorrido();
    this.recorrido.inicio = t;
    this.recorrido.dur = dur;
  };

  P.dibujarRecorrido = function (cam, t) {
    var r = this.recorrido;
    if (!r) return;
    var ctx = this.ctx, p = C.limitar((t - r.inicio) / r.dur, 0, 1), L = C.suave(p) * r.total;
    var pts = [], cabeza = null;
    for (var i = 0; i < r.puntos.length; i++) {
      if (r.largos[i] <= L) pts.push(cam.aPantalla(r.puntos[i].x, r.puntos[i].y));
      else {
        var a = r.puntos[i - 1], b = r.puntos[i], f = (L - r.largos[i - 1]) / (r.largos[i] - r.largos[i - 1] || 1);
        cabeza = cam.aPantalla(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
        pts.push(cabeza);
        break;
      }
    }
    if (pts.length < 2) return;
    var pulso = p >= 1 && !C.movimientoReducido() ? 0.78 + 0.22 * Math.sin(t / 900) : 1;
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var k = 1; k < pts.length; k++) ctx.lineTo(pts[k].x, pts[k].y);
    ctx.globalAlpha = 0.14 * pulso;
    ctx.strokeStyle = "#CDB885";
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.globalAlpha = 0.9 * pulso;
    ctx.strokeStyle = "#F3E3BC";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (cabeza && p < 1) {
      ctx.globalAlpha = 1;
      ctx.drawImage(this.sprites.dorada, cabeza.x - 28, cabeza.y - 28, 56, 56);
      if (t - r.ultimaChispa > 34) {
        r.ultimaChispa = t;
        var w = cam.aMundo(cabeza.x, cabeza.y);
        this.chispas(w.x, w.y, t, 2, 0.5);
      }
    }
    ctx.globalAlpha = 1;
  };

  /* ---------- Constelaciones ---------- */
  P.dibujarConstelacion = function (c, cam, t, ui) {
    var ctx = this.ctx, d = c.datos, z = cam.z, W = this.W, H = this.H, s = this.sprites;
    var centro = cam.aPantalla(d.ccx, d.ccy), rpx = d.radio * z + 90;
    if (centro.x < -rpx || centro.x > W + rpx || centro.y < -rpx || centro.y > H + rpx) return;
    var Spx = d.S * z;
    var activa = ui.activa === c.id, otraActiva = ui.activa && !activa;
    var alfa = (otraActiva ? 0.14 : 1) * ui.aparicionConstelaciones;
    if (alfa <= 0.003) return;
    var mov = !ui.reducido;
    var pts = d.estrellas.map(function (e) { return cam.aPantalla(e.x, e.y); });
    var hueco = C.limitar(Spx * 0.03, 3, 11);
    var n = d.estrellas.length, encendidas = 0;
    for (var q = 0; q < n; q++) if (c.encendidas[q] != null) encendidas++;

    ctx.globalCompositeOperation = "lighter";

    // Aura: un latido suave invita a descubrir las constelaciones.
    var respiro = mov ? 0.5 + 0.5 * Math.sin(t / 1300 + c.fase) : 0.5;
    var alfaAura = c.descubierta ? 0.2 : (ui.fase === "universo" || ui.fase === "contemplar" ? 0.06 + 0.07 * respiro : 0.05);
    if (c.completaEn != null && t - c.completaEn < 2200) alfaAura += 0.35 * (1 - (t - c.completaEn) / 2200);
    if (ui.unidas) alfaAura = 0.2 + 0.08 * respiro;
    var ta = Spx * 1.75;
    ctx.globalAlpha = alfa * alfaAura;
    ctx.drawImage(c.descubierta ? s.auraDorada : s.auraFria, centro.x - ta / 2, centro.y - ta / 2, ta, ta);

    // Guías: la figura insinuada antes de encenderse.
    ctx.globalAlpha = alfa;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = "rgba(220,228,255," + (activa ? 0.24 : 0.14) + ")";
    ctx.beginPath();
    c.trazos.forEach(function (tr, k) {
      var L = c.lineas[k];
      if (L && t - L.inicio > L.dur) return;
      var r = recortar(pts[tr[0]], pts[tr[1]], hueco);
      ctx.moveTo(r[0], r[1]);
      ctx.lineTo(r[2], r[3]);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Líneas encendidas: crecen de estrella en estrella con una cabeza luminosa.
    var realce = c.completaEn != null ? Math.max(0, 1 - (t - c.completaEn) / 1400) : 0;
    ctx.lineCap = "round";
    for (var k in c.lineas) {
      var L = c.lineas[k], p = C.limitar((t - L.inicio) / L.dur, 0, 1), e = C.salida(p);
      var r = recortar(pts[L.desde], pts[L.hasta], hueco);
      var ex = r[0] + (r[2] - r[0]) * e, ey = r[1] + (r[3] - r[1]) * e;
      ctx.setLineDash(L.punteada ? [3, 7] : []);
      ctx.beginPath();
      ctx.moveTo(r[0], r[1]);
      ctx.lineTo(ex, ey);
      ctx.globalAlpha = alfa * (0.17 + 0.25 * realce);
      ctx.strokeStyle = "#CDB885";
      ctx.lineWidth = 5 + 4 * realce;
      ctx.stroke();
      ctx.globalAlpha = alfa * 0.95;
      ctx.strokeStyle = "#F6E5B8";
      ctx.lineWidth = 1.3 + 0.6 * realce;
      ctx.stroke();
      if (p < 1) {
        ctx.globalAlpha = alfa;
        ctx.drawImage(s.chispa, ex - 12, ey - 12, 24, 24);
      }
    }
    ctx.setLineDash([]);

    // Anillos (la lente de la cámara, el centro del sol).
    for (var ia in c.aros) {
      var aro = c.aros[ia], pa = C.limitar((t - aro.inicio) / 900, 0, 1), ca = pts[ia];
      var ra = aro.radio / 100 * Spx * (0.55 + 0.45 * C.salida(pa));
      ctx.beginPath();
      ctx.arc(ca.x, ca.y, ra, 0, Math.PI * 2);
      ctx.globalAlpha = alfa * pa * (0.17 + 0.2 * realce);
      ctx.strokeStyle = "#CDB885";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.globalAlpha = alfa * pa * 0.9;
      ctx.strokeStyle = "#F6E5B8";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Estrellas: frías y discretas; al encenderse, doradas con un destello.
    var siguiente = activa && ui.fase === "detalle" ? encendidas : -1;
    for (var i = 0; i < n; i++) {
      var st = d.estrellas[i], pt = pts[i], enc = c.encendidas[i];
      var kk = enc != null ? C.limitar((t - enc) / 450, 0, 1) : 0;
      var base = C.limitar(Spx * 0.16, 14, 74) * (0.6 + 0.55 * st.brillo);
      var tw = mov ? 1 + 0.06 * Math.sin(t / 620 + i * 1.9 + c.fase) : 1;
      if (kk < 1) {
        var Df = base * tw * (i === siguiente ? 1.15 : 1);
        ctx.globalAlpha = alfa * (1 - kk) * (0.5 + 0.45 * st.brillo) * (i === siguiente ? 1.25 : 1);
        ctx.drawImage(s.fria, pt.x - Df / 2, pt.y - Df / 2, Df, Df);
      }
      if (kk > 0) {
        var pop = kk < 1 ? 1 + 0.8 * (1 - C.salida(kk)) : 1;
        var Dd = base * 1.18 * tw * pop * (1 + 0.25 * realce);
        ctx.globalAlpha = alfa * kk;
        ctx.drawImage(s.dorada, pt.x - Dd / 2, pt.y - Dd / 2, Dd, Dd);
      }
    }

    // Indicación de la siguiente estrella.
    if (siguiente >= 0 && siguiente < n) {
      var ps = pts[siguiente], pul = mov ? 0.5 + 0.5 * Math.sin(t / 260) : 0.6;
      var rr = C.limitar(Spx * 0.055, 13, 26) * (1 + 0.22 * pul);
      ctx.globalAlpha = alfa * (0.35 + 0.45 * pul);
      ctx.strokeStyle = "#F6E5B8";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, rr, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alfa * 0.18 * (1 - pul);
      ctx.beginPath();
      ctx.arc(ps.x, ps.y, rr * 1.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Trazo con el dedo.
    if (activa && this.trazo) {
      var desde = encendidas > 0 ? pts[encendidas - 1] : null, f = this.trazo;
      if (desde) {
        ctx.setLineDash([4, 6]);
        ctx.globalAlpha = alfa * 0.6;
        ctx.strokeStyle = "#F6E5B8";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(desde.x, desde.y);
        ctx.lineTo(f.x, f.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.globalAlpha = alfa * 0.9;
      ctx.drawImage(s.chispa, f.x - 16, f.y - 16, 32, 32);
    }

    // Nombre de la constelación.
    ctx.globalCompositeOperation = "source-over";
    if (!activa && (Spx > 70 || ui.unidas) && ui.etiquetas) {
      var fs = C.limitar(Spx * 0.062, 12, 19);
      var ly = cam.aPantalla(d.ccx, d.caja.maxY).y + fs * 1.4 + C.limitar(Spx * 0.07, 8, 22);
      ctx.font = "italic 400 " + fs.toFixed(1) + "px 'Cormorant Garamond', Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(3,5,15,0.85)";
      ctx.shadowBlur = 8;
      ctx.globalAlpha = alfa * Math.max(C.pasoSuave(70, 120, Spx), ui.unidas ? 0.75 : 0) * (c.descubierta ? 0.98 : 0.8);
      ctx.fillStyle = c.descubierta ? "#DCC891" : "#EEE8DB";
      ctx.fillText(c.nombre, centro.x, ly);
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    }
    ctx.globalAlpha = 1;
  };

  P.dibujarEfectos = function (cam, t) {
    var ctx = this.ctx, s = this.sprites, self = this;
    ctx.globalCompositeOperation = "lighter";
    this.efectos = this.efectos.filter(function (ef) {
      var p = (t - ef.inicio) / ef.dur;
      if (p >= 1) return false;
      if (p < 0) return true;
      var c, pos, e;
      if (ef.tipo === "destello") {
        c = self.porId[ef.id];
        if (!c) return false;
        e = c.datos.estrellas[ef.i];
        pos = cam.aPantalla(e.x, e.y);
        var Spx = c.datos.S * cam.z;
        var radio = 5 + C.limitar(Spx * 0.12, 20, 42) * C.salida(p);
        ctx.globalAlpha = (1 - p) * (1 - p) * (ef.suave ? 0.4 : 0.85);
        ctx.strokeStyle = "#F6E5B8";
        ctx.lineWidth = 0.3 + 1.1 * (1 - p);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radio, 0, Math.PI * 2);
        ctx.stroke();
        var D = C.limitar(Spx * 0.5, 40, 150) * (1 - 0.4 * p);
        ctx.globalAlpha = (1 - p) * (1 - p) * (ef.suave ? 0.4 : 0.85);
        ctx.drawImage(s.dorada, pos.x - D / 2, pos.y - D / 2, D, D);
      } else if (ef.tipo === "chispa") {
        pos = cam.aPantalla(ef.wx, ef.wy);
        var dist = ef.vel * (t - ef.inicio) / 1000 * (1 - 0.45 * p);
        var x = pos.x + ef.dx * dist, y = pos.y + ef.dy * dist + 14 * p * p;
        var tam = ef.tam * (1 - 0.5 * p);
        ctx.globalAlpha = (1 - p);
        ctx.drawImage(s.chispa, x - tam / 2, y - tam / 2, tam, tam);
      } else if (ef.tipo === "onda") {
        c = self.porId[ef.id];
        if (!c) return false;
        pos = cam.aPantalla(c.datos.ccx, c.datos.ccy);
        var S2 = c.datos.S * cam.z;
        ctx.globalAlpha = (1 - p) * 0.55;
        ctx.strokeStyle = "#E9D3A0";
        ctx.lineWidth = 0.6 + 2.2 * (1 - p);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, S2 * (0.15 + 0.75 * C.salida(p)), 0, Math.PI * 2);
        ctx.stroke();
      }
      return true;
    });
    ctx.globalAlpha = 1;
  };

  P.dibujar = function (cam, t, ui) {
    var ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, this.lienzo.width, this.lienzo.height);
    if (!this.mundo) return;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.dibujarMeteoros(t);
    ctx.globalCompositeOperation = "source-over";
    this.dibujarPaisaje(cam, ui);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.dibujarRecorrido(cam, t);
    for (var i = 0; i < this.constelaciones.length; i++) this.dibujarConstelacion(this.constelaciones[i], cam, t, ui);
    this.dibujarEfectos(cam, t);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  };

  /* ---------- Consultas ---------- */
  P.constelacionEn = function (sx, sy, cam) {
    var mejor = null, menor = Infinity;
    this.constelaciones.forEach(function (c) {
      var d = c.datos, p = cam.aPantalla(d.ccx, d.ccy);
      var r = Math.max(d.radio * cam.z, 38), dist = Math.hypot(sx - p.x, sy - p.y);
      if (dist < r && dist / r < menor) { menor = dist / r; mejor = c.id; }
    });
    return mejor;
  };
  P.distanciaEstrella = function (id, i, sx, sy, cam) {
    var e = this.porId[id].datos.estrellas[i], p = cam.aPantalla(e.x, e.y);
    return Math.hypot(sx - p.x, sy - p.y);
  };
  P.animando = function () { return this.efectos.length > 0 || this.meteoros.length > 0; };

  C.Escena = Escena;
})(window.Cielo);
