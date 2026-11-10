/* El cielo de nosotros · momentos interactivos
   Cada constelación guarda un recuerdo y una forma distinta de descubrirlo:
   - encuentro: dos estrellas (tú y yo) que se buscan hasta encontrarse.
   - revelado:  polvo de estrellas que forma nuestra foto mientras lo sostienes.
   - luces:     luces que flotan y atrapas; cada una es algo que iluminas en mí.
   - deseos:    deseos que lanzas al cielo y se vuelven estrellas.
   - latido:    un corazón de estrellas que late mientras lo sostienes.
   Todos se pueden completar con teclado. */
(function (C) {
  "use strict";

  var THREE = window.THREE;
  var DOS_PI = Math.PI * 2;

  function color(hex) { return new THREE.Color(hex); }

  var ORO = color("#f3dca8");
  var CREMA = color("#fff3dc");

  /* ---------- Ayudas comunes ----------
     ctx = { u: universo, c: constelación, ui, sonido, config, datos, reducido, movil,
             teclado(): bool, alCompletar() } */

  function mundo(ctx, local, destino) {
    destino = destino || new THREE.Vector3();
    destino.copy(local);
    return ctx.c.contenido.localToWorld(destino);
  }
  function pantalla(ctx, local) {
    return ctx.u.aPantalla(mundo(ctx, local, new THREE.Vector3()));
  }
  function chispas(ctx, local, n, op) {
    ctx.u.chispas.emitir(mundo(ctx, local), n, op);
  }
  function destello(ctx, local, escala, col, dur) {
    ctx.u.destellos.emitir(mundo(ctx, local), escala, col, dur);
  }
  function onda(ctx, local, radio, col, dur) {
    ctx.u.ondas.emitir(mundo(ctx, local), radio, col, dur);
  }
  function luz(ctx, col, escala, opacidad) {
    var s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: ctx.u.texturas.brillo, color: col, transparent: true, opacity: opacidad == null ? 1 : opacidad,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    s.scale.set(escala, escala, 1);
    s.renderOrder = 6;
    ctx.c.contenido.add(s);
    return s;
  }
  function quitar(obj) {
    if (!obj) return;
    if (obj.parent) obj.parent.remove(obj);
    if (obj.material) obj.material.dispose();
    if (obj.geometry && !obj.geometry.compartida) obj.geometry.dispose();
  }
  function indicar(ctx) {
    var e = ctx.datos.experiencia || {};
    ctx.ui.indicacion(ctx.teclado() && e.indicacionTeclado ? e.indicacionTeclado : (e.indicacion || ""));
  }
  function esAccion(e) {
    return e.key === " " || e.key === "Enter" || e.key === "Spacebar";
  }
  function bezier(a, b, c, t, destino) {
    var u = 1 - t;
    return destino.set(
      u * u * a.x + 2 * u * t * b.x + t * t * c.x,
      u * u * a.y + 2 * u * t * b.y + t * t * c.y,
      u * u * a.z + 2 * u * t * b.z + t * t * c.z
    );
  }

  // Cierre común: la figura termina de encenderse, suenan las campanillas y se abre el recuerdo.
  function culminar(ctx, op) {
    op = op || {};
    var c = ctx.c;
    c.encenderTodo(op.intervalo || 95, function (i, k) {
      ctx.sonido.campanilla(k + 2);
      if (k % 2 === 0) chispas(ctx, c.estrellas[i].local, 10, { color: ORO, velocidad: c.S * 0.25, vida: 0.9, tam: c.S * 0.02 });
    }, function () {
      var cierre = (ctx.datos.experiencia || {}).cierre;
      if (cierre) {
        var p = pantalla(ctx, new THREE.Vector3(0, -c.S * 0.62, 0));
        ctx.ui.frase(cierre, p.x, p.y, { grande: true });
      }
      setTimeout(ctx.alCompletar, op.espera != null ? op.espera : (cierre ? 1900 : 1100));
    });
  }

  /* ---------- 1. Encuentro: dos estrellas que se buscan ---------- */

  function Encuentro(ctx) {
    var c = ctx.c, S = c.S, u = ctx.u, cfg = ctx.config;
    var almas = [
      { nombre: cfg.destinatario || "Tú", color: color("#ffd0a8"), pos: new THREE.Vector3(-0.52 * S, -0.26 * S, 0.08 * S) },
      { nombre: cfg.remitente || "Yo", color: color("#bfd3ff"), pos: new THREE.Vector3(0.52 * S, 0.28 * S, 0.08 * S) }
    ];
    var TRAMOS = 26;
    var colorTrazo = [];
    almas.forEach(function (a, i) {
      a.base = a.pos.clone();
      a.halo = luz(ctx, a.color, S * 0.42, 0);
      a.nucleo = luz(ctx, CREMA, S * 0.12, 0);
      a.historia = [];
      for (var k = 0; k <= TRAMOS; k++) a.historia.push(a.pos.clone());
      colorTrazo = [];
      for (var j = 0; j <= TRAMOS; j++) {
        var f = Math.pow(1 - j / TRAMOS, 1.6);
        colorTrazo.push(a.color.r * f, a.color.g * f, a.color.b * f);
      }
      a.estela = C.lineaNueva(a.historia, { colores: colorTrazo, ancho: 2.2, opacidad: 0 });
      c.contenido.add(a.estela);
      a.fase = i * 2.1;
    });
    var agarrada = -1, objetivo = new THREE.Vector3(), unidas = false, automatico = false;
    var aparicion = 0, fusion = null, completado = false, tiempo = 0;
    var tmp = new THREE.Vector3();
    indicar(ctx);
    ctx.ui.progreso(0, 0);

    function etiquetas() {
      almas.forEach(function (a, i) {
        var p = pantalla(ctx, tmp.copy(a.pos).add(new THREE.Vector3(0, -0.11 * S, 0)));
        ctx.ui.etiqueta("alma" + i, a.nombre, p.x, p.y, !unidas && aparicion > 0.5);
      });
    }

    function unir() {
      if (unidas) return;
      unidas = true;
      agarrada = -1;
      var centro = almas[0].pos.clone().lerp(almas[1].pos, 0.5);
      destello(ctx, centro, S * 1.5, CREMA, 1.5);
      onda(ctx, centro, S * 0.95, ORO, 1.6);
      chispas(ctx, centro, ctx.movil ? 110 : 170, { color: ORO, velocidad: S * 0.6, vida: 1.6, tam: S * 0.028 });
      ctx.sonido.acorde();
      C.vibrar([25, 40, 70]);
      ctx.ui.flash(0.3);
      ctx.ui.indicacion("");
      ctx.ui.etiqueta("alma0", "", 0, 0, false);
      ctx.ui.etiqueta("alma1", "", 0, 0, false);
      var p = pantalla(ctx, centro);
      var e = ctx.datos.experiencia || {};
      if (e.union) ctx.ui.frase(e.union, p.x, p.y - 30);
      fusion = { desde: centro, hasta: c.estrellas[c.principal].local.clone(), t: 0, luz: luz(ctx, CREMA, S * 0.3, 1) };
    }

    return {
      actualizar: function (dt) {
        tiempo += dt;
        aparicion = Math.min(1, aparicion + dt / 1.1);
        if (!unidas) {
          for (var i = 0; i < 2; i++) {
            var a = almas[i];
            if (i === agarrada) {
              a.pos.lerp(objetivo, 1 - Math.exp(-dt * 14));
            } else if (automatico && i === 1) {
              tmp.copy(almas[0].pos).sub(a.pos);
              var d = tmp.length();
              a.pos.addScaledVector(tmp.normalize(), Math.min(d, dt * S * 0.55));
              a.base.copy(a.pos);
            } else {
              tmp.set(Math.sin(tiempo * 0.7 + a.fase) * 0.035 * S, Math.cos(tiempo * 0.9 + a.fase) * 0.035 * S, 0).add(a.base);
              a.pos.lerp(tmp, 1 - Math.exp(-dt * 1.4));
            }
          }
          // Cuando están cerca se atraen y se rodean.
          var dist = almas[0].pos.distanceTo(almas[1].pos), alcance = 0.36 * S;
          if (dist < alcance) {
            var fuerza = 1 - dist / alcance;
            for (var k = 0; k < 2; k++) {
              if (k === agarrada) continue;
              var otra = almas[1 - k].pos;
              almas[k].pos.lerp(otra, 1 - Math.exp(-dt * (1.2 + 9 * fuerza * fuerza)));
              almas[k].base.copy(almas[k].pos);
            }
            if (Math.random() < dt * 20 * fuerza) {
              chispas(ctx, almas[0].pos.clone().lerp(almas[1].pos, Math.random()), 2, { color: ORO, velocidad: S * 0.08, vida: 0.8, tam: S * 0.018 });
            }
          }
          if (dist < 0.075 * S) unir();
        }
        for (var j = 0; j < 2; j++) {
          var al = almas[j];
          var latido = 1 + 0.08 * Math.sin(tiempo * 2.6 + al.fase);
          var vis = unidas ? Math.max(0, al.halo.material.opacity - dt * 2.2) : aparicion;
          al.halo.position.copy(al.pos);
          al.nucleo.position.copy(al.pos);
          al.halo.scale.setScalar(S * 0.42 * latido);
          al.halo.material.opacity = unidas ? vis : aparicion * 0.95;
          al.nucleo.material.opacity = unidas ? vis : aparicion;
          var viejo = al.historia.pop();
          al.historia.unshift(viejo.copy(al.pos));
          C.moverLinea(al.estela, al.historia);
          al.estela.material.opacity = unidas ? Math.max(0, al.estela.material.opacity - dt * 2) : aparicion * 0.9;
        }
        if (fusion) {
          fusion.t += dt;
          var p = C.suave(Math.min(1, fusion.t / 0.9));
          fusion.luz.position.copy(fusion.desde).lerp(fusion.hasta, p);
          fusion.luz.scale.setScalar(S * (0.3 + 0.1 * Math.sin(fusion.t * 9)));
          if (fusion.t >= 0.9 && !completado) {
            completado = true;
            c.encender(c.principal);
            destello(ctx, fusion.hasta, S * 0.9, ORO, 1.1);
            culminar(ctx, { intervalo: 120 });
          }
          if (fusion.t > 0.9) fusion.luz.material.opacity = Math.max(0, 1 - (fusion.t - 0.9) * 2.5);
        }
        etiquetas();
      },
      abajo: function (x, y) {
        if (unidas) return;
        var mejor = -1, menor = Infinity;
        almas.forEach(function (a, i) {
          var p = pantalla(ctx, a.pos), d = Math.hypot(p.x - x, p.y - y);
          if (d < menor) { menor = d; mejor = i; }
        });
        agarrada = mejor;
        var q = u.pantallaAPlano(x, y, c.contenido);
        objetivo.copy(q || almas[mejor].pos);
        objetivo.z = almas[mejor].pos.z;
        C.vibrar(8);
      },
      mover: function (x, y) {
        if (agarrada < 0) return;
        var q = u.pantallaAPlano(x, y, c.contenido);
        if (!q) return;
        objetivo.set(C.limitar(q.x, -0.75 * S, 0.75 * S), C.limitar(q.y, -0.75 * S, 0.75 * S), almas[agarrada].pos.z);
      },
      arriba: function () {
        if (agarrada >= 0) almas[agarrada].base.copy(almas[agarrada].pos);
        agarrada = -1;
      },
      tecla: function (e, abajo) {
        if (!abajo || unidas) return false;
        if (esAccion(e)) { automatico = true; return true; }
        var paso = 0.08 * S, a = almas[1];
        if (e.key === "ArrowLeft") a.base.x -= paso;
        else if (e.key === "ArrowRight") a.base.x += paso;
        else if (e.key === "ArrowUp") a.base.y += paso;
        else if (e.key === "ArrowDown") a.base.y -= paso;
        else return false;
        return true;
      },
      revelar: function () {
        if (!unidas) {
          almas[1].pos.copy(almas[0].pos);
          unir();
        }
      },
      reindicar: function () { if (!unidas) indicar(ctx); },
      destruir: function () {
        almas.forEach(function (a) { quitar(a.halo); quitar(a.nucleo); quitar(a.estela); });
        if (fusion) quitar(fusion.luz);
        ctx.ui.etiqueta("alma0", "", 0, 0, false);
        ctx.ui.etiqueta("alma1", "", 0, 0, false);
      }
    };
  }

  /* ---------- 2. Revelado: el polvo de estrellas forma nuestra foto ---------- */

  function Revelado(ctx) {
    var c = ctx.c, S = c.S, u = ctx.u;
    var rec = ctx.datos.recuerdo || {};
    var presupuesto = ctx.movil ? 12000 : 22000;
    var ancho = S * 1.02;
    var rnd = C.azar(31);
    var polvo = u.crearPolvo(presupuesto, {
      rnd: rnd, radioLibre: S * 0.78, aplanado: 0.85, tam: S * 0.016, tamLibre: S * 0.013,
      colorLibre: color("#f6e2bf"), nitidez: 0.55, temblor: S * 0.0012
    });
    polvo.puntos.position.z = 0.12 * S;
    c.contenido.add(polvo.puntos);
    var marco = C.Figuras.marco(presupuesto, ancho, ancho * 0.75, rnd);
    polvo.fijarFigura(marco.destinos, marco.colores, rnd);
    // Si el navegador no deja leer los píxeles de la foto (al abrir el archivo
    // con doble clic), el polvo forma el marco y la foto se revela dentro.
    var fotoPlana = null, mundo = new THREE.Vector3();
    C.Figuras.muestrearImagen(rec.foto, presupuesto, function (m) {
      if (!m) return;
      if (!m.datos) {
        var mm = C.Figuras.marco(presupuesto, ancho, ancho / m.aspecto, rnd);
        polvo.fijarFigura(mm.destinos, mm.colores, rnd);
        fotoPlana = { aspecto: m.aspecto };
        ctx.ui.foto(rec.foto);
        return;
      }
      var f = C.Figuras.imagen(m, ancho);
      polvo.fijarFigura(f.destinos, f.colores, rnd);
      polvo.uniformes.uTam.value = f.celda * 1.55;
    });

    var progreso = 0, sosteniendo = false, dedo = { x: 0, y: 0 }, aparicion = 0;
    var hitos = 0, completado = false, despues = 0, pulso = 0;
    var n = c.estrellas.length;
    indicar(ctx);
    ctx.ui.progreso(0, 0);

    function revelarFoto() {
      if (completado) return;
      completado = true;
      progreso = 1;
      sosteniendo = false;
      ctx.ui.anillo(null);
      ctx.ui.indicacion("");
      ctx.ui.flash(0.9);
      ctx.sonido.obturador();
      C.vibrar(40);
      pulso = 1;
      onda(ctx, new THREE.Vector3(0, 0, 0.12 * S), S * 1.1, CREMA, 1.4);
      c.encenderTodo(55, function (i, k) { if (k % 3 === 0) ctx.sonido.campanilla(k); }, function () {
        setTimeout(ctx.alCompletar, 1500);
      });
    }

    return {
      actualizar: function (dt) {
        aparicion = Math.min(1, aparicion + dt / 1.2);
        polvo.uniformes.uOpacidad.value = aparicion;
        if (!completado) {
          if (sosteniendo) progreso = Math.min(1, progreso + dt / (ctx.reducido ? 1.8 : 2.6));
          else progreso = Math.max(0, progreso - dt / 4.5);
          // Mientras se sostiene, la figura de la cámara se va dibujando.
          var deben = Math.floor(progreso * (n + 1));
          while (hitos < deben && hitos < n) {
            c.encender(hitos, { sinDestello: hitos % 2 === 1 });
            if (hitos % 2 === 0) { ctx.sonido.campanilla(hitos); C.vibrar(8); }
            hitos++;
          }
          if (progreso >= 1) revelarFoto();
          ctx.ui.anillo(sosteniendo ? dedo : null, progreso);
        } else {
          despues += dt;
          // Después del destello, el polvo vuelve a ser cielo.
          polvo.uniformes.uDispersion.value = C.pasoSuave(1.1, 2.4, despues);
        }
        pulso = Math.max(0, pulso - dt * 1.6);
        if (fotoPlana) {
          polvo.puntos.getWorldPosition(mundo);
          var pf = u.aPantalla(mundo), px = u.escalaEn(mundo) * ancho * 0.9;
          var revelado = completado ? 1 : C.pasoSuave(0.08, 0.95, progreso);
          var visible = completado ? 1 - C.pasoSuave(0.9, 2.1, despues) : C.pasoSuave(0, 0.3, progreso);
          ctx.ui.fotoMarco(pf.x, pf.y, px, px / fotoPlana.aspecto, revelado, visible * aparicion);
        }
        polvo.uniformes.uPulso.value = pulso;
        polvo.uniformes.uProgreso.value = progreso;
        polvo.uniformes.uRemolino.value = ctx.reducido ? 0.3 : (sosteniendo ? 2.2 : 1);
      },
      abajo: function (x, y) {
        if (completado) return;
        sosteniendo = true;
        dedo = { x: x, y: y };
        C.vibrar(10);
      },
      mover: function (x, y) { dedo = { x: x, y: y }; },
      arriba: function () { sosteniendo = false; },
      tecla: function (e, abajo) {
        if (!esAccion(e) || completado) return false;
        sosteniendo = abajo;
        dedo = { x: u.ancho / 2, y: u.alto / 2 };
        return true;
      },
      revelar: revelarFoto,
      reindicar: function () { if (!completado) indicar(ctx); },
      destruir: function () {
        ctx.ui.anillo(null);
        polvo.destruir();
      }
    };
  }

  /* ---------- 3. Luces: lo que iluminas en mí ---------- */

  function Luces(ctx) {
    var c = ctx.c, S = c.S;
    var rec = ctx.datos.recuerdo || {};
    var frases = (rec.lista || []).slice(0, 6);
    var n = frases.length || 4;
    var rnd = C.azar(57);
    var centro = c.estrellas[c.principal].local.clone();
    var rayos = [];
    c.estrellas.forEach(function (e, i) { if (i !== c.principal) rayos.push(i); });
    var sol = luz(ctx, color("#ffcf7a"), S * 0.3, 0);
    sol.position.copy(centro);
    var tonos = ["#ffd98f", "#ffc6a3", "#fff0c2", "#ffd1e0", "#cfe3ff", "#ffe7a8"];
    var luces = [];
    for (var i = 0; i < n; i++) {
      var col = color(tonos[i % tonos.length]);
      luces.push({
        indice: i,
        halo: luz(ctx, col, S * 0.2, 0),
        nucleo: luz(ctx, CREMA, S * 0.06, 0),
        color: col,
        angulo: i / n * DOS_PI + rnd() * 0.5,
        radio: (0.42 + rnd() * 0.12) * S,
        giro: (0.13 + rnd() * 0.08) * (i % 2 ? 1 : -1),
        fase: rnd() * DOS_PI,
        pos: new THREE.Vector3(),
        estado: "flota",
        t: 0
      });
    }
    var atrapadas = 0, aparicion = 0, completado = false, toque = null;
    var tmp = new THREE.Vector3();
    indicar(ctx);
    ctx.ui.progreso(0, n);
    ctx.ui.botones(luces.map(function (l, k) {
      return { id: "luz" + k, etiqueta: "Atrapar la luz " + (k + 1), alActivar: function () { atrapar(l); } };
    }));

    function atrapar(l) {
      if (l.estado !== "flota" || completado) return;
      l.estado = "vuela";
      l.t = 0;
      l.desde = l.pos.clone();
      l.control = l.pos.clone().lerp(centro, 0.5).add(new THREE.Vector3(-(l.pos.y - centro.y) * 0.5, (l.pos.x - centro.x) * 0.5, 0.2 * S));
      var p = pantalla(ctx, l.pos);
      if (frases[l.indice]) {
        ctx.ui.frase(frases[l.indice], p.x, p.y, { ranura: 0.69 });
        ctx.ui.anunciar(frases[l.indice]);
      }
      ctx.sonido.campanilla(l.indice + 1);
      C.vibrar(14);
      ctx.ui.quitarBoton("luz" + l.indice);
      chispas(ctx, l.pos, 18, { color: l.color, velocidad: S * 0.3, vida: 0.8, tam: S * 0.02 });
    }

    function llegar(l) {
      l.estado = "dentro";
      l.halo.visible = l.nucleo.visible = false;
      atrapadas++;
      destello(ctx, centro, S * (0.45 + 0.1 * atrapadas), l.color, 0.9);
      chispas(ctx, centro, 26, { color: ORO, velocidad: S * 0.35, vida: 0.9, tam: S * 0.022 });
      c.encender(c.principal, { sinDestello: atrapadas > 1 });
      var k = Math.min(rayos.length - 1, atrapadas - 1);
      c.encender(rayos[k]);
      ctx.ui.progreso(atrapadas, n);
      if (atrapadas >= n) terminar();
    }

    function terminar() {
      if (completado) return;
      completado = true;
      ctx.ui.indicacion("");
      ctx.ui.botones([]);
      destello(ctx, centro, S * 2.2, color("#ffe2a0"), 1.8);
      onda(ctx, centro, S * 1.25, ORO, 1.7);
      ctx.sonido.acorde();
      C.vibrar([20, 40, 60]);
      culminar(ctx, { intervalo: 110 });
    }

    return {
      actualizar: function (dt, t) {
        aparicion = Math.min(1, aparicion + dt / 1.2);
        var brillo = 0.25 + 0.75 * (atrapadas / n);
        sol.material.opacity = aparicion * (0.35 + 0.65 * brillo) * (completado ? 1 : 0.85);
        sol.scale.setScalar(S * (0.28 + 0.55 * brillo) * (1 + 0.05 * Math.sin(t * 3)));
        for (var i = 0; i < luces.length; i++) {
          var l = luces[i];
          if (l.estado === "flota") {
            l.angulo += l.giro * dt * (ctx.reducido ? 0.4 : 1);
            l.pos.set(
              centro.x + Math.cos(l.angulo) * l.radio,
              centro.y + Math.sin(l.angulo) * l.radio * 0.86 + Math.sin(t * 1.3 + l.fase) * 0.04 * S,
              0.14 * S + Math.sin(t * 0.8 + l.fase) * 0.06 * S
            );
            var pul = 1 + 0.12 * Math.sin(t * 2.4 + l.fase);
            l.halo.scale.setScalar(S * 0.2 * pul);
            l.halo.material.opacity = aparicion * 0.95;
            l.nucleo.material.opacity = aparicion;
            var p = pantalla(ctx, l.pos);
            ctx.ui.moverBoton("luz" + i, p.x, p.y);
          } else if (l.estado === "vuela") {
            l.t += dt / 0.75;
            var e = C.suave(Math.min(1, l.t));
            bezier(l.desde, l.control, centro, e, l.pos);
            if (Math.random() < 0.8) chispas(ctx, l.pos, 1, { color: l.color, velocidad: S * 0.04, vida: 0.6, tam: S * 0.018 });
            l.halo.scale.setScalar(S * 0.2 * (1 - 0.5 * e));
            if (l.t >= 1) llegar(l);
          }
          l.halo.position.copy(l.pos);
          l.nucleo.position.copy(l.pos);
        }
      },
      abajo: function (x, y) { toque = { x: x, y: y }; },
      mover: function () { },
      arriba: function (x, y) {
        if (!toque || Math.hypot(x - toque.x, y - toque.y) > 16) { toque = null; return; }
        toque = null;
        var mejor = null, menor = Infinity;
        luces.forEach(function (l) {
          if (l.estado !== "flota") return;
          var p = pantalla(ctx, l.pos), d = Math.hypot(p.x - x, p.y - y);
          var radio = Math.max(46, ctx.u.escalaEn(mundo(ctx, l.pos, tmp)) * S * 0.12);
          if (d < radio && d < menor) { menor = d; mejor = l; }
        });
        if (mejor) atrapar(mejor);
        else {
          var q = ctx.u.pantallaAPlano(x, y, c.contenido);
          if (q) chispas(ctx, q, 6, { color: CREMA, velocidad: S * 0.08, vida: 0.5, tam: S * 0.015 });
        }
      },
      tecla: function (e, abajo) {
        if (!abajo || !esAccion(e) || completado) return false;
        // Sin un botón enfocado, Espacio atrapa la siguiente luz.
        for (var i = 0; i < luces.length; i++) if (luces[i].estado === "flota") { atrapar(luces[i]); return true; }
        return false;
      },
      revelar: function () {
        luces.forEach(function (l) { if (l.estado === "flota") { l.estado = "dentro"; l.halo.visible = l.nucleo.visible = false; } });
        atrapadas = n;
        rayos.forEach(function (r) { c.encender(r, { sinDestello: true }); });
        c.encender(c.principal);
        terminar();
      },
      reindicar: function () { if (!completado) indicar(ctx); },
      destruir: function () {
        luces.forEach(function (l) { quitar(l.halo); quitar(l.nucleo); });
        quitar(sol);
        ctx.ui.botones([]);
      }
    };
  }

  /* ---------- 4. Deseos: lanzarlos al cielo ---------- */

  function Deseos(ctx) {
    var c = ctx.c, S = c.S, u = ctx.u;
    var rec = ctx.datos.recuerdo || {};
    var deseos = (rec.lista || []).slice(0, c.estrellas.length);
    var n = deseos.length || 3;
    var base = new THREE.Vector3(0, -0.74 * S, 0.12 * S);
    var farol = {
      halo: luz(ctx, color("#ffc98a"), S * 0.3, 0),
      nucleo: luz(ctx, CREMA, S * 0.09, 0),
      pos: base.clone(),
      listo: true,
      vis: 0
    };
    var vuelos = [], lanzados = 0, llegados = 0, completado = false, despegue = null;
    var gesto = null, tiempo = 0;
    indicar(ctx);
    ctx.ui.progreso(0, n);

    function lanzar(xPantalla) {
      if (completado || lanzados >= n || !farol.listo) return;
      var k = lanzados++;
      var desde = farol.pos.clone();
      if (xPantalla != null) {
        var q = u.pantallaAPlano(xPantalla, pantalla(ctx, base).y, c.contenido);
        if (q) desde.x = C.limitar(q.x, -0.4 * S, 0.4 * S);
      }
      var hasta = c.estrellas[k].local.clone();
      var lado = (k % 2 ? 1 : -1) * 0.35 * S;
      var control = desde.clone().lerp(hasta, 0.5).add(new THREE.Vector3(lado, 0.15 * S, 0.25 * S));
      vuelos.push({
        k: k, desde: desde, control: control, hasta: hasta, t: 0,
        halo: luz(ctx, color("#ffd9a0"), S * 0.2, 1),
        nucleo: luz(ctx, CREMA, S * 0.07, 1),
        pos: desde.clone()
      });
      farol.listo = false;
      farol.vis = 0;
      setTimeout(function () { farol.listo = true; }, ctx.reducido ? 300 : 650);
      ctx.sonido.soplo();
      C.vibrar(12);
    }

    function llegar(v) {
      quitar(v.halo);
      quitar(v.nucleo);
      c.encender(v.k);
      destello(ctx, v.hasta, S * 0.5, color("#ffe7b8"), 1);
      chispas(ctx, v.hasta, 30, { color: ORO, velocidad: S * 0.35, vida: 1, tam: S * 0.022 });
      ctx.sonido.campanilla(v.k + 1);
      C.vibrar(16);
      llegados++;
      ctx.ui.progreso(llegados, n);
      if (deseos[v.k]) {
        var p = pantalla(ctx, v.hasta);
        ctx.ui.frase(deseos[v.k], p.x, p.y, { ranura: 0.28 });
        ctx.ui.anunciar(deseos[v.k]);
      }
      if (llegados >= n) terminar();
    }

    function terminar() {
      if (completado) return;
      completado = true;
      ctx.ui.indicacion("");
      c.encenderTodo(110, function (i, k) { ctx.sonido.campanilla(k + 5); }, function () {
        // El avión despega: avanza hacia su punta dejando una estela y vuelve.
        var punta = c.estrellas[0].local, cola = c.estrellas[c.estrellas.length - 1].local;
        despegue = { t: 0, dir: punta.clone().sub(cola).normalize() };
        ctx.sonido.arpegio();
        var cierre = (ctx.datos.experiencia || {}).cierre;
        if (cierre) {
          var p = pantalla(ctx, new THREE.Vector3(0, -0.62 * S, 0));
          ctx.ui.frase(cierre, p.x, p.y, { grande: true });
        }
        setTimeout(ctx.alCompletar, cierre ? 2600 : 2000);
      });
    }

    return {
      actualizar: function (dt) {
        tiempo += dt;
        var mostrar = !completado && lanzados < n;
        farol.vis = C.amortiguar(farol.vis, mostrar && farol.listo ? 1 : 0, 4, dt);
        farol.pos.copy(base);
        farol.pos.y += Math.sin(tiempo * 2) * 0.03 * S;
        farol.halo.position.copy(farol.pos);
        farol.nucleo.position.copy(farol.pos);
        farol.halo.scale.setScalar(S * 0.3 * (1 + 0.1 * Math.sin(tiempo * 3.2)));
        farol.halo.material.opacity = farol.vis * 0.9;
        farol.nucleo.material.opacity = farol.vis;
        if (mostrar && farol.listo && Math.random() < dt * 6) {
          chispas(ctx, farol.pos, 1, { color: color("#ffc98a"), velocidad: S * 0.05, vida: 1, tam: S * 0.016, direccion: new THREE.Vector3(0, S * 0.12, 0) });
        }
        var p = pantalla(ctx, farol.pos);
        ctx.ui.anillo(mostrar && farol.vis > 0.3 ? { x: p.x, y: p.y, guia: true } : null, 0);
        for (var i = vuelos.length - 1; i >= 0; i--) {
          var v = vuelos[i];
          v.t += dt / (ctx.reducido ? 0.7 : 1.15);
          var e = C.suave(Math.min(1, v.t));
          bezier(v.desde, v.control, v.hasta, e, v.pos);
          v.halo.position.copy(v.pos);
          v.nucleo.position.copy(v.pos);
          chispas(ctx, v.pos, 2, { color: color("#ffd59a"), velocidad: S * 0.04, vida: 0.9, tam: S * 0.02 });
          if (v.t >= 1) { vuelos.splice(i, 1); llegar(v); }
        }
        if (despegue) {
          despegue.t += dt;
          var d = despegue.t;
          var avance = d < 1 ? C.suave(d) : Math.max(0, 1 - C.suave(Math.min(1, (d - 1.15) / 1)));
          c.contenido.position.copy(despegue.dir).multiplyScalar(avance * 0.2 * S);
          if (d < 1.1) {
            var cola = c.estrellas[c.estrellas.length - 1].local.clone();
            chispas(ctx, cola, 3, { color: ORO, velocidad: S * 0.05, vida: 1.1, tam: S * 0.02 });
          }
          if (d > 2.2) { c.contenido.position.set(0, 0, 0); despegue = null; }
        }
      },
      abajo: function (x, y) { gesto = { x: x, y: y, lanzado: false }; },
      mover: function (x, y) {
        if (!gesto || gesto.lanzado) return;
        if (gesto.y - y > 46) { gesto.lanzado = true; lanzar(x); }
      },
      arriba: function (x, y) {
        if (!gesto) return;
        if (!gesto.lanzado) {
          var cerca = pantalla(ctx, farol.pos);
          var esToque = Math.hypot(x - gesto.x, y - gesto.y) < 14;
          if (esToque && Math.hypot(x - cerca.x, y - cerca.y) < 90) lanzar(x);
          else if (gesto.y - y > 30) lanzar(x);
        }
        gesto = null;
      },
      tecla: function (e, abajo) {
        if (!abajo || !esAccion(e) || completado) return false;
        lanzar(null);
        return true;
      },
      revelar: function () {
        if (completado) return;
        vuelos.forEach(function (v) { quitar(v.halo); quitar(v.nucleo); c.encender(v.k); });
        vuelos = [];
        for (var k = 0; k < c.estrellas.length; k++) c.encender(k, { sinDestello: true });
        lanzados = llegados = n;
        terminar();
      },
      reindicar: function () { if (!completado) indicar(ctx); },
      destruir: function () {
        vuelos.forEach(function (v) { quitar(v.halo); quitar(v.nucleo); });
        quitar(farol.halo);
        quitar(farol.nucleo);
        c.contenido.position.set(0, 0, 0);
        ctx.ui.anillo(null);
      }
    };
  }

  /* ---------- 5. Latido: un corazón que late mientras lo sostienes ---------- */

  function Latido(ctx) {
    var c = ctx.c, S = c.S, u = ctx.u;
    var cantidad = ctx.movil ? 6500 : 12000;
    var rnd = C.azar(73);
    var polvo = u.crearPolvo(cantidad, {
      rnd: rnd, radioLibre: S * 0.95, aplanado: 1, tam: S * 0.013, tamLibre: S * 0.012,
      colorLibre: color("#ffc6d4"), nitidez: 0.25, temblor: S * 0.002
    });
    var destinos = C.Figuras.corazon(cantidad, S * 0.44, rnd);
    var paleta = [color("#ff6f8f"), color("#ff9fb3"), color("#ffd0b0"), color("#ffe4ee")];
    var colores = new Float32Array(cantidad * 3);
    for (var i = 0; i < cantidad; i++) {
      var col = paleta[Math.floor(rnd() * paleta.length)];
      var b = 0.55 + rnd() * 0.6;
      colores[i * 3] = col.r * b; colores[i * 3 + 1] = col.g * b; colores[i * 3 + 2] = col.b * b;
    }
    polvo.fijarFigura(destinos, colores, rnd);
    polvo.puntos.position.set(0, -0.02 * S, 0.06 * S);
    c.contenido.add(polvo.puntos);

    var TOTAL = 6, PERIODO = 0.86;
    var latidos = 0, objetivo = 0, progreso = 0, sosteniendo = false, siguiente = 0, dub = 0;
    var pulso = 0, tiempo = 0, aparicion = 0, completado = false, despues = 0;
    var dedo = { x: 0, y: 0 };
    var n = c.estrellas.length;
    indicar(ctx);
    ctx.ui.progreso(0, TOTAL);

    function latir() {
      latidos++;
      objetivo = Math.min(1, latidos / TOTAL);
      pulso = 1;
      dub = tiempo + 0.24;
      ctx.sonido.latido();
      C.vibrar([30, 130, 22]);
      onda(ctx, new THREE.Vector3(0, 0, 0.06 * S), S * (0.6 + 0.08 * latidos), color("#ff9fb6"), 1.2);
      ctx.ui.progreso(latidos, TOTAL);
      var deben = Math.floor(objetivo * n);
      for (var k = 0; k < deben; k++) c.encender(k, { sinDestello: k < deben - 2 });
      if (latidos >= TOTAL) terminar();
    }

    function terminar() {
      if (completado) return;
      completado = true;
      sosteniendo = false;
      objetivo = 1;
      ctx.ui.anillo(null);
      ctx.ui.indicacion("");
      destello(ctx, new THREE.Vector3(0, 0, 0.1 * S), S * 2.4, color("#ffb3c4"), 1.8);
      ctx.ui.flash(0.35);
      ctx.sonido.acorde();
      C.vibrar([40, 80, 40, 80, 60]);
      culminar(ctx, { intervalo: 80, espera: 2200 });
    }

    return {
      actualizar: function (dt) {
        tiempo += dt;
        aparicion = Math.min(1, aparicion + dt / 1.2);
        polvo.uniformes.uOpacidad.value = aparicion;
        if (!completado) {
          if (sosteniendo && tiempo >= siguiente) { latir(); siguiente = tiempo + PERIODO; }
          if (!sosteniendo) objetivo = Math.max(0, objetivo - dt / (PERIODO * 3));
          ctx.ui.anillo(sosteniendo ? dedo : null, latidos / TOTAL);
        } else {
          despues += dt;
          // Ya completo, el corazón sigue latiendo despacio y gira un poco.
          if (despues > 0.6 && tiempo >= siguiente) { pulso = 0.7; dub = tiempo + 0.24; siguiente = tiempo + 1.1; }
          polvo.puntos.rotation.y = Math.sin(despues * 0.7) * (ctx.reducido ? 0 : 0.45);
        }
        if (dub && tiempo >= dub) { pulso = Math.max(pulso, 0.55); dub = 0; }
        pulso = Math.max(0, pulso - dt * 3.4);
        progreso = C.amortiguar(progreso, objetivo, 3.2, dt);
        polvo.uniformes.uProgreso.value = progreso;
        polvo.uniformes.uPulso.value = ctx.reducido ? pulso * 0.3 : pulso;
        polvo.uniformes.uRemolino.value = ctx.reducido ? 0.3 : 1 + pulso;
      },
      abajo: function (x, y) {
        if (completado) return;
        sosteniendo = true;
        dedo = { x: x, y: y };
        if (siguiente < tiempo + 0.15) siguiente = tiempo + 0.15;
      },
      mover: function (x, y) { dedo = { x: x, y: y }; },
      arriba: function () { sosteniendo = false; },
      tecla: function (e, abajo) {
        if (!esAccion(e) || completado) return false;
        sosteniendo = abajo;
        dedo = { x: u.ancho / 2, y: u.alto / 2 };
        if (abajo && siguiente < tiempo + 0.15) siguiente = tiempo + 0.15;
        return true;
      },
      revelar: function () {
        latidos = TOTAL;
        terminar();
      },
      reindicar: function () { if (!completado) indicar(ctx); },
      destruir: function () {
        ctx.ui.anillo(null);
        polvo.destruir();
      }
    };
  }

  var TIPOS = { encuentro: Encuentro, revelado: Revelado, luces: Luces, deseos: Deseos, latido: Latido };

  C.Rituales = {
    crear: function (tipo, ctx) {
      var F = TIPOS[tipo] || Luces;
      return F(ctx);
    },
    tipos: Object.keys(TIPOS)
  };
})(window.Cielo);
