/* El cielo de nosotros · mapa estelar
   El cielo real de una noche y un lugar, para la constelación que tenga
   `mapaEstelar` en la configuración (por ejemplo, "Siempre tú"):
   - Las estrellas salen del centro y forman la cúpula del cielo; cae la noche
     hasta la hora elegida y la cúpula se aplana en una carta circular con un
     aro de astrolabio, como un cartel.
   - "Mirar desde…": la cámara entra a la cúpula y se puede mirar alrededor,
     con el horizonte, los puntos cardinales y los nombres de lo que se ve.
   - La barra de horas recorre la noche entera: salen la Luna y los planetas,
     y el cielo clarea al amanecer. Al tocar el mapa se sabe qué constelación es.
   - Sin 3D, C.MapaEstelar.plano dibuja la misma carta en un lienzo 2D.
   Posiciones del Sol, la Luna y los planetas: Astronomy Engine (MIT, Don Cross).
   Estrellas, líneas y nombres: d3-celestial (BSD-3-Clause, Olaf Frohn). */
(function (C) {
  "use strict";

  var THREE = window.THREE;
  var GRADO = Math.PI / 180;
  var ESCALA_ARO = 1.17;          // radio exterior del aro, con la carta de radio 1
  var FOV_CARTA = 30;
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var CARDINALES = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  var RUMBOS = ["Al norte", "Al noreste", "Al este", "Al sureste", "Al sur", "Al suroeste", "Al oeste", "Al noroeste"];
  var CENTRO_GALACTICO = [266.4168, -29.0078];

  var CUERPOS = [
    { id: "Moon", nombre: "Luna", articulo: "la Luna", color: [0.96, 0.95, 0.9] },
    { id: "Venus", nombre: "Venus", articulo: "Venus", color: [1, 0.97, 0.86] },
    { id: "Mars", nombre: "Marte", articulo: "Marte", color: [1, 0.56, 0.4] },
    { id: "Jupiter", nombre: "Júpiter", articulo: "Júpiter", color: [0.98, 0.9, 0.76] },
    { id: "Saturn", nombre: "Saturno", articulo: "Saturno", color: [0.96, 0.85, 0.62] },
    { id: "Mercury", nombre: "Mercurio", articulo: "Mercurio", color: [0.92, 0.85, 0.76] }
  ];

  var TEXTOS = {
    titulo: "El cielo de nuestro día",
    destacados: "Lo que brillaba esa noche",
    mirar: "Mirar desde {lugar}",
    notaMirar: "¡Toca aquí!",
    notaMirarRaton: "¡Haz clic aquí!",
    verMapa: "Ver el mapa",
    volver: "Seguir explorando",
    reproducir: "Ver pasar la noche",
    pausar: "Pausar la noche",
    hora: "Hora de la noche",
    volverHora: "Volver a las {hora}",
    pistaCupula: "Arrastra para mirar alrededor",
    pistaCarta: "Toca el mapa para conocer sus estrellas",
    ahora: "{rumbo}, a {altura}° sobre el horizonte",
    bajo: "A esta hora está bajo el horizonte",
    descripcion: "Mapa del cielo de {lugar} el {fecha} a las {hora}.",
    centroGalactico: "Centro de la galaxia",
    sale: "Sale {cuerpo}",
    sePone: "Se pone {cuerpo}",
    anochece: "Noche cerrada",
    amanece: "Empieza a clarear",
    constelacion: "Constelación",
    planeta: "Planeta"
  };

  var SVG = {
    corazon: '<svg viewBox="0 0 32 32"><defs><linearGradient id="mapa-corazon-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8fae"/><stop offset="1" stop-color="#ff3f6f"/></linearGradient></defs><path d="M16 28.5C7.5 22.4 2.6 17.6 2.6 11.6 2.6 7.4 5.8 4.2 9.8 4.2c2.6 0 4.8 1.4 6.2 3.6 1.4-2.2 3.6-3.6 6.2-3.6 4 0 7.2 3.2 7.2 7.4 0 6-4.9 10.8-13.4 16.9z" fill="url(#mapa-corazon-g)"/><path d="M9.6 8.4c-2 .2-3.4 1.8-3.4 3.8" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/></svg>',
    volver: '<svg viewBox="0 0 24 24"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cupula: '<svg viewBox="0 0 24 24"><path d="M3.5 17.5a8.5 8.5 0 0 1 17 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2.5 17.5h19" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12 7.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7zM7.6 12.4l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4zM16.6 11.2l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" fill="currentColor"/></svg>',
    carta: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1.4 2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="10.4" cy="10.6" r="1.1" fill="currentColor"/><circle cx="14.2" cy="13.6" r=".8" fill="currentColor"/></svg>',
    reproducir: '<svg viewBox="0 0 24 24"><path class="icono-reproducir" d="M9 6.8v10.4l8.4-5.2z" fill="currentColor"/><path class="icono-pausa" d="M8.6 6.8v10.4M15.4 6.8v10.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    lugar: '<svg viewBox="0 0 24 24"><path d="M12 21.5s-6.6-6.3-6.6-11.4a6.6 6.6 0 0 1 13.2 0c0 5.1-6.6 11.4-6.6 11.4z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10.1" r="2.4" fill="currentColor"/></svg>',
    estrella: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="13" fill="currentColor" opacity=".14"/><circle cx="24" cy="24" r="7.5" fill="currentColor" opacity=".22"/><path d="M24 5.5l2.4 15.1 15.1 3.4-15.1 3.4L24 42.5l-2.4-15.1L6.5 24l15.1-3.4z" fill="currentColor"/><circle cx="24" cy="24" r="2.6" fill="#fff"/></svg>',
    pareja: '<svg viewBox="0 0 48 48"><path d="M10 33C12 17 36 17 38 33" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.2 3" stroke-linecap="round"/><path d="M24 23.6c-2.6-1.9-4.1-3.3-4.1-5.1 0-1.3 1-2.3 2.2-2.3.8 0 1.5.4 1.9 1.1.4-.7 1.1-1.1 1.9-1.1 1.2 0 2.2 1 2.2 2.3 0 1.8-1.5 3.2-4.1 5.1z" fill="currentColor"/><path d="M10 27.5l1.3 4.2 4.2 1.3-4.2 1.3L10 38.5l-1.3-4.2-4.2-1.3 4.2-1.3zM38 27.5l1.3 4.2 4.2 1.3-4.2 1.3L38 38.5l-1.3-4.2-4.2-1.3 4.2-1.3z" fill="currentColor"/></svg>',
    galaxia: '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="19" ry="7.5" fill="currentColor" opacity=".12" transform="rotate(-24 24 24)"/><path d="M24 24c5-5 13-3.5 15.5 1.5M24 24c-5 5-13 3.5-15.5-1.5M24 24c3.5-1.8 4-6.5.5-9.5M24 24c-3.5 1.8-4 6.5-.5 9.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" transform="rotate(-24 24 24)"/><circle cx="24" cy="24" r="3.6" fill="currentColor"/><circle cx="24" cy="24" r="1.5" fill="#fff"/><circle cx="9" cy="12" r=".9" fill="currentColor"/><circle cx="39" cy="36" r="1.1" fill="currentColor"/><circle cx="36" cy="10" r=".7" fill="currentColor"/></svg>',
    planeta: '<svg viewBox="0 0 48 48"><circle cx="19" cy="27" r="9" fill="currentColor" opacity=".9"/><path d="M13.5 23.5a7 7 0 0 1 6-3.6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/><circle cx="19" cy="27" r="13.5" fill="none" stroke="currentColor" stroke-width="1" opacity=".35"/><path d="M36 8.5l1.5 5.2 5.2 1.5-5.2 1.5L36 21.9l-1.5-5.2-5.2-1.5 5.2-1.5z" fill="currentColor"/></svg>'
  };

  /* ---------- Utilidades ---------- */

  function nodo(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }
  // Solo para íconos fijos escritos aquí mismo (nunca para textos de la configuración).
  function icono(markup, clase) {
    var s = nodo("span", clase ? "icono " + clase : "icono");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = markup;
    return s;
  }
  function limitar(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mezclar(a, b, t) { return a + (b - a) * t; }
  function suave(t) { t = limitar(t, 0, 1); return t * t * (3 - 2 * t); }
  function tramo(t, a, b) { return limitar((t - a) / (b - a), 0, 1); }
  function formatear(plantilla, datos) { return C.formatear ? C.formatear(plantilla, datos) : String(plantilla); }

  // Dirección (vector unitario, ecuador J2000) desde ascensión recta y declinación en grados.
  function direccion(ra, dec, salida, k) {
    var a = ra * GRADO, d = dec * GRADO, c = Math.cos(d);
    salida[k] = c * Math.cos(a);
    salida[k + 1] = c * Math.sin(a);
    salida[k + 2] = Math.sin(d);
    return salida;
  }
  // Ecuador J2000 → horizonte (x = norte, y = oeste, z = cénit) con la matriz `a` (columnas, como en GLSL).
  function alHorizonte(a, v, s) {
    var x = v[0], y = v[1], z = v[2];
    s[0] = a[0] * x + a[3] * y + a[6] * z;
    s[1] = a[1] * x + a[4] * y + a[7] * z;
    s[2] = a[2] * x + a[5] * y + a[8] * z;
    return s;
  }
  function alEcuador(a, h, s) {
    var x = h[0], y = h[1], z = h[2];
    s[0] = a[0] * x + a[1] * y + a[2] * z;
    s[1] = a[3] * x + a[4] * y + a[5] * z;
    s[2] = a[6] * x + a[7] * y + a[8] * z;
    return s;
  }
  // La misma colocación que el sombreador: cúpula (vista desde abajo) o carta estereográfica.
  function colocar(h, mezcla, v) {
    var k = 1 / Math.max(1 + h[2], 0.05);
    return v.set(mezclar(h[1], h[1] * k, mezcla), mezclar(h[0], h[0] * k, mezcla), -h[2] * (1 - mezcla));
  }
  function azimut(h) {
    var az = Math.atan2(-h[1], h[0]) / GRADO;
    return az < 0 ? az + 360 : az;
  }
  function altura(h) { return Math.asin(limitar(h[2], -1, 1)) / GRADO; }
  function rumbo(az) { return Math.round(az / 45) % 8; }

  function reloj(min) {
    var m = ((Math.round(min) % 1440) + 1440) % 1440, h = Math.floor(m / 60), mm = m % 60;
    return ((h + 11) % 12 + 1) + ":" + (mm < 10 ? "0" : "") + mm + (h < 12 ? " a. m." : " p. m.");
  }
  function coordenada(valor, positivo, negativo) {
    var v = Math.abs(valor), g = Math.floor(v), mf = (v - g) * 60, m = Math.floor(mf), s = Math.round((mf - m) * 60);
    if (s === 60) { s = 0; m++; }
    if (m === 60) { m = 0; g++; }
    return g + "°" + (m < 10 ? "0" : "") + m + "′" + (s < 10 ? "0" : "") + s + "″ " + (valor >= 0 ? positivo : negativo);
  }

  // Color aproximado de una estrella por su índice B−V, suavizado hacia el blanco.
  function colorBV(bv) {
    bv = limitar(isFinite(bv) ? bv : 0.6, -0.4, 2);
    var t = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62)), x = t / 100, r, g, b;
    if (x <= 66) {
      r = 255;
      g = 99.47 * Math.log(x) - 161.12;
      b = x <= 19 ? 0 : 138.52 * Math.log(x - 10) - 305.04;
    } else {
      r = 329.7 * Math.pow(x - 60, -0.1332);
      g = 288.12 * Math.pow(x - 60, -0.0755);
      b = 255;
    }
    return [mezclar(limitar(r, 0, 255) / 255, 1, 0.3), mezclar(limitar(g, 0, 255) / 255, 1, 0.3), mezclar(limitar(b, 0, 255) / 255, 1, 0.3)];
  }

  /* ---------- Efemérides: el cielo de esa fecha y lugar ---------- */

  function Efemerides(m) {
    var A = window.Astronomy;
    this.A = A;
    this.obs = new A.Observer(Number(m.latitud) || 0, Number(m.longitud) || 0, Number(m.altitud) || 0);
    var f = String(m.fecha || "2025-01-01").split("-").map(Number);
    this.anio = f[0] || 2025;
    this.mes = (f[1] || 1) - 1;
    this.dia = f[2] || 1;
    this.zona = Number(m.zonaHoraria) || 0;
    this.base = Date.UTC(this.anio, this.mes, this.dia) - this.zona * 3600000;
    var h = String(m.hora || "22:00").split(":").map(Number);
    this.hora = (h[0] || 0) * 60 + (h[1] || 0);
    this.calcularRango();
    this.muestrear();
  }
  var PE = Efemerides.prototype;
  PE.fecha = function (min) { return new Date(this.base + min * 60000); };
  PE.minutosDe = function (fecha) { return (fecha.getTime() - this.base) / 60000; };
  PE.rotacion = function (min, a) {
    var r = this.A.Rotation_EQJ_HOR(this.fecha(min), this.obs).rot;
    a[0] = r[0][0]; a[1] = r[0][1]; a[2] = r[0][2];
    a[3] = r[1][0]; a[4] = r[1][1]; a[5] = r[1][2];
    a[6] = r[2][0]; a[7] = r[2][1]; a[8] = r[2][2];
    return a;
  };
  // La noche de esa fecha: del ocaso al amanecer (si la hora es de madrugada, la noche anterior).
  PE.calcularRango = function () {
    var A = this.A, inicio = NaN, fin = NaN;
    try {
      var ocaso = A.SearchRiseSet("Sun", this.obs, -1, this.fecha(this.hora < 720 ? -720 : 720), 1);
      var salida = ocaso && A.SearchRiseSet("Sun", this.obs, +1, ocaso, 1);
      if (ocaso && salida) {
        inicio = Math.ceil((this.minutosDe(ocaso.date) + 6) / 30) * 30;
        fin = Math.floor((this.minutosDe(salida.date) - 6) / 30) * 30;
      }
    } catch (e) { /* sin ocaso: se usa la hora elegida */ }
    if (!(fin > inicio) || this.hora < inicio || this.hora > fin) {
      inicio = this.hora - 360;
      fin = this.hora + 360;
    }
    this.inicio = inicio;
    this.fin = fin;
  };
  // Sol, Luna y planetas cada hora de la noche; entre muestras se interpola.
  PE.muestrear = function () {
    var A = this.A, paso = 60, n = Math.max(2, Math.ceil((this.fin - this.inicio) / paso) + 1);
    this.paso = paso;
    this.n = n;
    this.muestras = {};
    var ids = ["Sun"].concat(CUERPOS.map(function (c) { return c.id; }));
    for (var k = 0; k < ids.length; k++) {
      var id = ids[k], arr = new Float32Array(n * 5);
      for (var i = 0; i < n; i++) {
        var t = A.MakeTime(this.fecha(this.inicio + i * paso));
        var eq = A.Equator(id, t, this.obs, false, true);
        direccion(eq.ra * 15, eq.dec, arr, i * 5);
        if (id !== "Sun") {
          var il = A.Illumination(id, t);
          arr[i * 5 + 3] = il.mag;
          arr[i * 5 + 4] = il.phase_angle;
        }
      }
      this.muestras[id] = arr;
    }
  };
  PE.cuerpo = function (id, min, salida) {
    var arr = this.muestras[id], x = limitar((min - this.inicio) / this.paso, 0, this.n - 1);
    var i = Math.min(this.n - 2, Math.floor(x)), f = x - i, a = i * 5, b = a + 5;
    var vx = mezclar(arr[a], arr[b], f), vy = mezclar(arr[a + 1], arr[b + 1], f), vz = mezclar(arr[a + 2], arr[b + 2], f);
    var l = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
    salida[0] = vx / l; salida[1] = vy / l; salida[2] = vz / l;
    salida[3] = mezclar(arr[a + 3], arr[b + 3], f);
    salida[4] = mezclar(arr[a + 4], arr[b + 4], f);
    return salida;
  };
  PE.eventos = function () {
    var A = this.A, self = this, lista = [], desde = this.fecha(this.inicio), dias = (this.fin - this.inicio) / 1440;
    function agregar(tipo, cuerpo, r) {
      if (!r) return;
      var m = self.minutosDe(r.date);
      if (m > self.inicio + 2 && m < self.fin - 2) lista.push({ minutos: m, tipo: tipo, cuerpo: cuerpo });
    }
    try {
      agregar("anochece", null, A.SearchAltitude("Sun", this.obs, -1, desde, dias, -18));
      agregar("amanece", null, A.SearchAltitude("Sun", this.obs, +1, desde, dias, -18));
      CUERPOS.forEach(function (c) {
        agregar("sale", c, A.SearchRiseSet(c.id, self.obs, +1, desde, dias));
        agregar("sePone", c, A.SearchRiseSet(c.id, self.obs, -1, desde, dias));
      });
    } catch (e) { /* sin eventos */ }
    return lista.sort(function (a, b) { return a.minutos - b.minutos; });
  };

  /* ---------- Datos: estrellas, líneas, Vía Láctea y horizonte ---------- */

  var cacheEstrellas = null;
  function prepararEstrellas() {
    if (cacheEstrellas) return cacheEstrellas;
    var e = window.CIELO_MAPA_DATOS.estrellas, n = e.length / 4;
    var pos = new Float32Array(n * 3), mag = new Float32Array(n), col = new Float32Array(n * 3), azar = new Float32Array(n);
    var rnd = C.azar(2025);
    for (var i = 0; i < n; i++) {
      direccion(e[i * 4] / 100, e[i * 4 + 1] / 100, pos, i * 3);
      mag[i] = e[i * 4 + 2] / 100;
      var c = colorBV(e[i * 4 + 3] / 100);
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      azar[i] = rnd();
    }
    cacheEstrellas = { posiciones: pos, magnitudes: mag, colores: col, azar: azar, n: n };
    return cacheEstrellas;
  }

  // Polilíneas de las constelaciones como vectores, subdivididas sobre círculos máximos.
  function subdividir(u, v, pasoGrados, salida) {
    var d = limitar(u[0] * v[0] + u[1] * v[1] + u[2] * v[2], -1, 1), ang = Math.acos(d);
    var n = Math.max(1, Math.ceil(ang / (pasoGrados * GRADO))), s = Math.sin(ang);
    for (var j = 1; j <= n; j++) {
      var t = j / n, a, b;
      if (s < 1e-6) { a = 1 - t; b = t; } else { a = Math.sin((1 - t) * ang) / s; b = Math.sin(t * ang) / s; }
      salida.push([u[0] * a + v[0] * b, u[1] * a + v[1] * b, u[2] * a + v[2] * b]);
    }
  }
  function polilineasConstelaciones() {
    var D = window.CIELO_MAPA_DATOS, rnd = C.azar(621), lista = [];
    D.lineas.forEach(function (l) {
      var k = l[0], inicio = rnd() * 0.5;
      for (var t = 1; t < l.length; t++) {
        var p = l[t], puntos = [];
        for (var i = 0; i < p.length; i += 2) puntos.push(direccion(p[i] / 100, p[i + 1] / 100, [0, 0, 0], 0));
        var fino = [puntos[0]];
        for (var q = 1; q < puntos.length; q++) subdividir(puntos[q - 1], puntos[q], 2, fino);
        lista.push({ puntos: fino, grupo: k, inicio: inicio, duracion: 0.5 });
      }
    });
    return lista;
  }
  function polilineaEcliptica() {
    var e = 23.4393 * GRADO, puntos = [];
    for (var l = 0; l <= 360; l += 2) {
      var a = l * GRADO;
      puntos.push([Math.cos(a), Math.sin(a) * Math.cos(e), Math.sin(a) * Math.sin(e)]);
    }
    return { puntos: puntos, grupo: -1, inicio: 0, duracion: 1 };
  }
  function polilineaArco(u, v) {
    var puntos = [u.slice(0, 3)];
    subdividir(u, v, 1, puntos);
    return { puntos: puntos, grupo: -1, inicio: 0, duracion: 1 };
  }
  // Cintas de líneas: cada tramo es un rectángulo que el sombreador orienta en la pantalla.
  function geometriaLineas(polilineas) {
    var segs = 0;
    polilineas.forEach(function (p) { segs += p.puntos.length - 1; });
    var A = new Float32Array(segs * 12), B = new Float32Array(segs * 12), lado = new Float32Array(segs * 4),
      orden = new Float32Array(segs * 4), grupo = new Float32Array(segs * 4), extremo = new Float32Array(segs * 4), idx = [];
    var v = 0;
    polilineas.forEach(function (p) {
      var pts = p.puntos, total = 0, acum = [0];
      for (var i = 1; i < pts.length; i++) {
        total += Math.acos(limitar(pts[i][0] * pts[i - 1][0] + pts[i][1] * pts[i - 1][1] + pts[i][2] * pts[i - 1][2], -1, 1));
        acum.push(total);
      }
      for (var s = 0; s < pts.length - 1; s++) {
        var P = pts[s], Q = pts[s + 1];
        var oP = p.inicio + p.duracion * (total ? acum[s] / total : 0), oQ = p.inicio + p.duracion * (total ? acum[s + 1] / total : 1);
        for (var k = 0; k < 4; k++) {
          var b3 = (v + k) * 3;
          A[b3] = P[0]; A[b3 + 1] = P[1]; A[b3 + 2] = P[2];
          B[b3] = Q[0]; B[b3 + 1] = Q[1]; B[b3 + 2] = Q[2];
          lado[v + k] = k % 2 ? -1 : 1;
          orden[v + k] = k < 2 ? oP : oQ;
          extremo[v + k] = k < 2 ? 0 : 1;
          grupo[v + k] = p.grupo;
        }
        idx.push(v, v + 1, v + 2, v + 2, v + 1, v + 3);
        v += 4;
      }
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(A, 3));
    g.setAttribute("aB", new THREE.BufferAttribute(B, 3));
    g.setAttribute("aLado", new THREE.BufferAttribute(lado, 1));
    g.setAttribute("aOrden", new THREE.BufferAttribute(orden, 1));
    g.setAttribute("aGrupo", new THREE.BufferAttribute(grupo, 1));
    g.setAttribute("aExtremo", new THREE.BufferAttribute(extremo, 1));
    g.setIndex(idx);
    return g;
  }

  // Vía Láctea: partículas en coordenadas galácticas, con nubes de estrellas,
  // la Gran Grieta de polvo y nebulosas rosadas donde de verdad están.
  var GALACTICA = [-0.0548755604, -0.8734370902, -0.4838350155, 0.4941094279, -0.4448296300, 0.7469822445, -0.8676661490, -0.1980763734, 0.4559837762];
  function desdeGalactica(l, b, salida, k) {
    var lr = l * GRADO, br = b * GRADO, x = Math.cos(br) * Math.cos(lr), y = Math.cos(br) * Math.sin(lr), z = Math.sin(br), G = GALACTICA;
    salida[k] = G[0] * x + G[3] * y + G[6] * z;
    salida[k + 1] = G[1] * x + G[4] * y + G[7] * z;
    salida[k + 2] = G[2] * x + G[5] * y + G[8] * z;
    return salida;
  }
  function campana(l, b, l0, b0, sl, sb) { var dl = (l - l0) / sl, db = (b - b0) / sb; return Math.exp(-0.5 * (dl * dl + db * db)); }
  function nubesGalacticas(l, b) {
    return 0.55 * campana(l, b, 27, -2.5, 6, 4) + 0.6 * campana(l, b, 3, -4.5, 7, 4.5) + 0.35 * campana(l, b, 12, -1, 3, 2) +
      0.4 * campana(l, b, 76, 1, 11, 5) + 0.3 * campana(l, b, -73, -1, 13, 5) + 0.25 * campana(l, b, -32, -1, 10, 4);
  }
  function polvoGalactico(l, b) {
    var grieta = 0;
    if (l > -12 && l < 90) {
      var centro = 1.3 + 0.024 * l, ancho = 1.6 + 0.032 * Math.abs(l);
      grieta = 0.86 * Math.exp(-Math.pow((b - centro) / ancho, 2)) * C.pasoSuave(-12, 4, l) * (1 - C.pasoSuave(62, 90, l));
    }
    var plano = 0.45 * Math.exp(-Math.pow(b / 0.75, 2)) * Math.exp(-(l * l) / (2 * 45 * 45));
    var pipa = 0.62 * campana(l, b, -3, 5.5, 4.5, 1.7);
    var ofiuco = 0.42 * campana(l, b, -7, 15, 7, 3.5);
    return Math.min(0.96, grieta + plano + pipa + ofiuco);
  }
  var NEBULOSAS = [
    [6, -1.2, 1.0, 1, 0.4, 0.58], [7, -0.3, 0.6, 1, 0.45, 0.62], [15.1, -0.7, 0.7, 1, 0.42, 0.56], [17, 0.8, 0.8, 1, 0.45, 0.6],
    [85.6, -0.8, 1.6, 1, 0.42, 0.55], [99.3, 3.7, 1.4, 1, 0.48, 0.6], [-8.5, 15.5, 2.2, 1, 0.78, 0.5], [-6.3, 17.7, 1.6, 0.6, 0.72, 1]
  ];
  // Resplandor de la Vía Láctea en una textura (longitud y latitud galácticas, ±40°): nubes de estrellas,
  // el bulbo del centro, la Gran Grieta y otras franjas de polvo con un ruido suave que las rompe en grumos.
  function texturaViaLactea(W, H) {
    var lienzo = document.createElement("canvas");
    lienzo.width = W; lienzo.height = H;
    var g = lienzo.getContext("2d");
    if (!g) return null;
    function hash(i, j, s) {
      var h = Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    }
    function valor(x, y, periodo, s) {
      var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      var i0 = ((xi % periodo) + periodo) % periodo, i1 = (i0 + 1) % periodo;
      var a = hash(i0, yi, s), b = hash(i1, yi, s), c = hash(i0, yi + 1, s), d = hash(i1, yi + 1, s);
      var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }
    function fbm(x, y, s) {
      return (valor(x, y, 60, s) * 0.5 + valor(x * 2, y * 2, 120, s + 1) * 0.25 + valor(x * 4, y * 4, 240, s + 2) * 0.125 +
        valor(x * 8, y * 8, 480, s + 3) * 0.0625) / 0.9375;
    }
    // Lo que solo depende de la longitud se calcula una vez por columna
    var colL = new Float32Array(W), colSigma = new Float32Array(W), colAmp = new Float32Array(W), colCalido = new Float32Array(W);
    for (var i = 0; i < W; i++) {
      var l0 = (i + 0.5) * 360 / W - 180, cerca = Math.exp(-(l0 * l0) / (2 * 24 * 24));
      colL[i] = l0;
      colSigma[i] = 3 + 3.2 * cerca + 1.4 * Math.exp(-(l0 * l0) / (2 * 70 * 70));
      colAmp[i] = 0.2 + 0.8 * Math.exp(-(l0 * l0) / (2 * 62 * 62));
      colCalido[i] = Math.exp(-(l0 * l0) / (2 * 34 * 34));
    }
    var neb = NEBULOSAS.map(function (nb) { return { l: nb[0], b: nb[1], s2: nb[2] * nb[2] * 0.5, r: nb[2] * 2.2, c: [nb[3], nb[4], nb[5]] }; });
    var datos = new Float32Array(W * H * 3), maximo = 0;
    for (var j = 0; j < H; j++) {
      var b = 40 - (j + 0.5) * 80 / H, yb = (b + 40) / 6, b2 = b * b, bulboB = 2.8 * (b + 1.6) * (b + 1.6), calidoB = 0.6 + 0.4 * Math.exp(-b2 / 50);
      var cercanas = neb.filter(function (n) { return Math.abs(b - n.b) < n.r; });
      for (i = 0; i < W; i++) {
        var l = colL[i], xl = (l + 180) / 6, sg = colSigma[i];
        var f = fbm(xl, yb, 3), f2 = fbm(xl * 1.9 + 31, yb * 1.9, 11);
        var grumo = 0.28 + 1.3 * Math.pow(f, 1.35);
        var brillo = colAmp[i] * Math.exp(-b2 / (2 * sg * sg)) * grumo;
        if (Math.abs(l) < 30 && Math.abs(b) < 24) brillo += 0.34 * Math.exp(-(l * l + bulboB) / (2 * 6.5 * 6.5)) * (0.7 + 0.6 * f);
        if (Math.abs(b) < 22) brillo += nubesGalacticas(l, b) * (0.4 + 1.1 * f);
        if (Math.abs(b) < 30) brillo *= 1 - Math.min(0.97, polvoGalactico(l, b) * (0.7 + 0.55 * f2));
        var manchas = f2 * f2;
        brillo *= 1.08 - 0.62 * manchas;
        var calido = colCalido[i] * calidoB;
        var r = brillo * (0.7 + 0.3 * calido), gg = brillo * (0.8 + 0.04 * calido), bb = brillo * (1 - 0.38 * calido);
        for (var k = 0; k < cercanas.length; k++) {
          var n = cercanas[k], dl = l - n.l;
          if (Math.abs(dl) > n.r) continue;
          var db = b - n.b, w = 0.22 * Math.exp(-(dl * dl + db * db) / n.s2);
          r += n.c[0] * w; gg += n.c[1] * w; bb += n.c[2] * w;
        }
        var q = (j * W + i) * 3;
        datos[q] = r; datos[q + 1] = gg; datos[q + 2] = bb;
        if (r > maximo) maximo = r;
      }
    }
    var img = g.createImageData(W, H), px = img.data, tabla = new Uint8Array(4096);
    for (var t = 0; t < 4096; t++) { var v = t / 4095; tabla[t] = Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); }
    var escala = 4095 / maximo;
    for (var z = 0, m = W * H; z < m; z++) {
      px[z * 4] = tabla[Math.min(4095, Math.round(datos[z * 3] * escala))];
      px[z * 4 + 1] = tabla[Math.min(4095, Math.round(datos[z * 3 + 1] * escala))];
      px[z * 4 + 2] = tabla[Math.min(4095, Math.round(datos[z * 3 + 2] * escala))];
      px[z * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return { lienzo: lienzo, maximo: maximo };
  }

  function generarViaLactea(cantidad, brillos, rnd) {
    var total = cantidad + brillos + NEBULOSAS.length * 70;
    var pos = new Float32Array(total * 3), tam = new Float32Array(total), col = new Float32Array(total * 3), alfa = new Float32Array(total);
    var n = 0, intentos = 0;
    function poner(l, b, t, c, a) {
      desdeGalactica(l, b, pos, n * 3);
      tam[n] = t;
      col[n * 3] = c[0]; col[n * 3 + 1] = c[1]; col[n * 3 + 2] = c[2];
      alfa[n] = a;
      n++;
    }
    function colorEn(l, b, extra) {
      var calido = Math.exp(-(l * l) / (2 * 34 * 34)) * (0.55 + 0.45 * Math.exp(-b * b / 60));
      var v = 0.82 + rnd() * 0.36 + extra;
      return [mezclar(0.7, 1, calido) * v, mezclar(0.79, 0.86, calido) * v, mezclar(1, 0.7, calido) * v];
    }
    // Estrellas lejanas que forman la banda
    while (n < cantidad && intentos < cantidad * 12) {
      intentos++;
      var l = rnd() < 0.45 ? rnd() * 360 - 180 : C.gauss(rnd) * 40;
      l = ((l + 540) % 360) - 180;
      var nucleo = Math.exp(-(l * l) / (2 * 22 * 22));
      var b = C.gauss(rnd) * (2.4 + 5.6 * nucleo);
      var peso = 0.25 + 0.75 * Math.exp(-(l * l) / (2 * 60 * 60)) + nubesGalacticas(l, b);
      if (rnd() > peso * 0.8) continue;
      if (rnd() < polvoGalactico(l, b)) continue;
      poner(l, b, (0.0026 + rnd() * 0.0042), colorEn(l, b, 0), 0.06 + rnd() * 0.14);
    }
    // Resplandor difuso
    var hechos = 0;
    intentos = 0;
    while (hechos < brillos && intentos < brillos * 14) {
      intentos++;
      var lg = rnd() < 0.4 ? rnd() * 360 - 180 : C.gauss(rnd) * 45;
      lg = ((lg + 540) % 360) - 180;
      var nb = Math.exp(-(lg * lg) / (2 * 24 * 24));
      var bg = C.gauss(rnd) * (2.6 + 5 * nb);
      var pg = 0.3 + 0.7 * Math.exp(-(lg * lg) / (2 * 55 * 55)) + nubesGalacticas(lg, bg);
      if (rnd() > pg * 0.75) continue;
      var sombra = polvoGalactico(lg, bg);
      poner(lg, bg, 0.03 + rnd() * 0.05, colorEn(lg, bg, -0.1), (0.028 + rnd() * 0.03) * (1 - sombra * 0.85));
      hechos++;
    }
    // Nebulosas
    NEBULOSAS.forEach(function (nb2) {
      for (var i = 0; i < 70 && n < total; i++) {
        var gl = nb2[0] + C.gauss(rnd) * nb2[2] * 0.5, gb = nb2[1] + C.gauss(rnd) * nb2[2] * 0.4;
        poner(gl, gb, i < 12 ? 0.012 + rnd() * 0.014 : 0.003 + rnd() * 0.005, [nb2[3], nb2[4], nb2[5]], i < 12 ? 0.05 + rnd() * 0.05 : 0.06 + rnd() * 0.08);
      }
    });
    return { posiciones: pos.subarray(0, n * 3), tamanos: tam.subarray(0, n), colores: col.subarray(0, n * 3), alfas: alfa.subarray(0, n), n: n };
  }

  // Silueta del horizonte: lomas bajas alrededor, sierra al poniente y un cerro al norte.
  function perfilHorizonte(m, rnd) {
    var N = 720, alt = new Float32Array(N + 1), ondas = [];
    for (var k = 0; k < 18; k++) ondas.push({ f: 2 + Math.floor(Math.pow(rnd(), 1.7) * 70), a: (0.12 + rnd() * 0.5) / (1 + k * 0.25), p: rnd() * Math.PI * 2 });
    var montes = (m && m.montes) || [{ az: 268, ancho: 42, alto: 1.4 }, { az: 4, ancho: 12, alto: 2.4 }, { az: 140, ancho: 30, alto: 0.5 }];
    for (var i = 0; i <= N; i++) {
      var az = i / N * 360, v = 0, extra = 0;
      for (var q = 0; q < ondas.length; q++) v += ondas[q].a * Math.sin(ondas[q].f * az * GRADO + ondas[q].p);
      montes.forEach(function (mt) {
        var d = Math.abs(((az - mt.az + 540) % 360) - 180) / mt.ancho;
        extra += mt.alto * Math.exp(-d * d);
      });
      alt[i] = Math.max(0.18, 0.5 + extra + v * (0.32 + extra * 0.22));
    }
    return alt;
  }
  function horizonte(az, alt, s, k) {
    var a = az * GRADO, h = alt * GRADO, c = Math.cos(h);
    s[k] = c * Math.cos(a);
    s[k + 1] = -c * Math.sin(a);
    s[k + 2] = Math.sin(h);
    return s;
  }

  /* ---------- Sombreadores ---------- */

  var GLSL_COLOCAR = [
    "uniform mat3 uRot;",
    "uniform float uMezcla;",
    "vec3 colocar(vec3 h) {",
    "  vec3 cupula = vec3(h.y, h.x, -h.z);",
    "  vec3 carta = vec3(h.y, h.x, 0.0) / max(1.0 + h.z, 0.05);",
    "  return mix(cupula, carta, uMezcla);",
    "}"
  ].join("\n");

  var VS_ESTRELLAS = [
    GLSL_COLOCAR,
    "attribute float aMag;",
    "attribute vec3 aColor;",
    "attribute float aAzar;",
    "uniform float uTiempo;",
    "uniform float uTam;",
    "uniform float uMagLimite;",
    "uniform float uEnsamble;",
    "uniform float uOpacidad;",
    "uniform float uTitileo;",
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "varying float vPicos;",
    "varying float vHalo;",
    "void main() {",
    "  vec3 h = uRot * position;",
    "  vec3 destino = colocar(h);",
    "  float retraso = aAzar * 0.5 + clamp((aMag + 1.5) / 7.5, 0.0, 1.0) * 0.3;",
    "  float e = clamp((uEnsamble - retraso) / 0.3, 0.0, 1.0);",
    "  e = e * e * (3.0 - 2.0 * e);",
    "  vec3 pos = destino * e;",
    "  float giro = (1.0 - e) * (1.4 + aAzar * 1.8);",
    "  float cg = cos(giro), sg = sin(giro);",
    "  pos.xy = mat2(cg, sg, -sg, cg) * pos.xy;",
    "  pos.z += sin(e * 3.14159) * 0.22;",
    "  vec4 mv = modelViewMatrix * vec4(pos, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  float flujo = pow(10.0, -0.4 * (aMag - 6.0));",
    "  float vis = smoothstep(-0.012, 0.01, h.z);",
    "  float limite = smoothstep(uMagLimite + 0.5, uMagLimite - 0.5, aMag);",
    "  float bajo = pow(1.0 - clamp(h.z, 0.0, 1.0), 3.0) * (1.0 - uMezcla);",
    "  float tw = 1.0 + uTitileo * (0.09 + 0.4 * bajo) * sin(uTiempo * (1.7 + aAzar * 4.6) + aAzar * 70.0);",
    "  vAlfa = uOpacidad * vis * limite * smoothstep(0.0, 0.2, e) * clamp(0.13 * pow(flujo, 0.37), 0.13, 1.5) * tw;",
    "  gl_PointSize = uTam * (0.85 + pow(flujo, 0.255));",
    "  vColor = aColor;",
    "  vPicos = smoothstep(1.4, -0.4, aMag);",
    "  vHalo = smoothstep(5.0, 1.5, aMag);",
    "}"
  ].join("\n");

  var FS_ESTRELLAS = [
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "varying float vPicos;",
    "varying float vHalo;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  float nucleo = exp(-r2 * 20.0);",
    "  float halo = exp(-r2 * 5.0) * 0.3 * vHalo;",
    "  float picos = (exp(-abs(p.x) * 24.0) * exp(-abs(p.y) * 2.4) + exp(-abs(p.y) * 24.0) * exp(-abs(p.x) * 2.4)) * vPicos * 0.55;",
    "  float a = (nucleo + halo + picos) * (1.0 - r2);",
    "  vec3 col = mix(vColor, vec3(1.0), nucleo * 0.55);",
    "  gl_FragColor = vec4(col, a * vAlfa);",
    "}"
  ].join("\n");

  var VS_VIA = [
    GLSL_COLOCAR,
    "attribute float aTam;",
    "attribute vec3 aColor;",
    "attribute float aAlfa;",
    "uniform float uPxRad;",
    "uniform float uRadioPx;",
    "uniform float uBrillo;",
    "uniform float uMaxPx;",
    "uniform float uDifuso;",
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "void main() {",
    "  vec3 h = uRot * position;",
    "  vec3 pos = colocar(h);",
    "  vec4 mv = modelViewMatrix * vec4(pos, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  float r2 = (1.0 - h.z) / max(1.0 + h.z, 0.05);",
    "  float escala = mix(uPxRad, uRadioPx * 0.5 * (1.0 + r2), uMezcla);",
    "  float tam = aTam * escala;",
    "  gl_PointSize = clamp(tam, 1.0, uMaxPx);",
    "  vAlfa = aAlfa * uBrillo * smoothstep(-0.015, 0.02, h.z) * min(1.0, tam * tam) * mix(1.0, uDifuso, smoothstep(0.012, 0.03, aTam));",
    "  vColor = aColor;",
    "}"
  ].join("\n");

  var FS_VIA = [
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  gl_FragColor = vec4(vColor, exp(-r2 * 3.2) * (1.0 - r2) * vAlfa);",
    "}"
  ].join("\n");

  var VS_LINEAS = [
    GLSL_COLOCAR,
    "attribute vec3 aB;",
    "attribute float aLado;",
    "attribute float aOrden;",
    "attribute float aGrupo;",
    "attribute float aExtremo;",
    "uniform vec2 uPantalla;",
    "uniform float uAncho;",
    "uniform float uGrupoA;",
    "uniform float uGrupoB;",
    "uniform float uResalte;",
    "varying float vLado;",
    "varying float vOrden;",
    "varying float vAlfa;",
    "varying float vResalte;",
    "varying float vAncho;",
    "void main() {",
    "  vec3 hA = uRot * position;",
    "  vec3 hB = uRot * aB;",
    "  vec4 cA = projectionMatrix * modelViewMatrix * vec4(colocar(hA), 1.0);",
    "  vec4 cB = projectionMatrix * modelViewMatrix * vec4(colocar(hB), 1.0);",
    "  float detras = step(cA.w, 0.001) + step(cB.w, 0.001);",
    "  vec2 sA = cA.xy / max(cA.w, 0.001) * uPantalla * 0.5;",
    "  vec2 sB = cB.xy / max(cB.w, 0.001) * uPantalla * 0.5;",
    "  vec2 d = sB - sA;",
    "  float L = length(d);",
    "  d = L > 0.0001 ? d / L : vec2(1.0, 0.0);",
    "  vec2 n = vec2(-d.y, d.x);",
    "  float r = (abs(aGrupo - uGrupoA) < 0.5 || abs(aGrupo - uGrupoB) < 0.5) ? uResalte : 0.0;",
    "  float ancho = uAncho * (1.0 + 0.9 * r) + 1.0;",
    "  vec4 c = aExtremo > 0.5 ? cB : cA;",
    "  c.xy += n * aLado * ancho * 0.5 / (uPantalla * 0.5) * c.w;",
    "  gl_Position = detras > 0.0 ? vec4(0.0, 0.0, 2.0, 1.0) : c;",
    "  vLado = aLado;",
    "  vOrden = aOrden;",
    "  vResalte = r;",
    "  vAncho = ancho;",
    "  vAlfa = smoothstep(-0.01, 0.015, min(hA.z, hB.z) + 0.01) * (1.0 - 0.55 * uResalte * (1.0 - r));",
    "}"
  ].join("\n");

  var FS_LINEAS = [
    "uniform vec3 uColor;",
    "uniform vec3 uColorResalte;",
    "uniform float uOpacidad;",
    "uniform float uTrazo;",
    "uniform float uRayas;",
    "uniform float uTiempo;",
    "varying float vLado;",
    "varying float vOrden;",
    "varying float vAlfa;",
    "varying float vResalte;",
    "varying float vAncho;",
    "void main() {",
    "  if (vOrden > uTrazo) discard;",
    "  float borde = 1.0 - smoothstep(1.0 - 1.6 / vAncho, 1.0, abs(vLado));",
    "  float punta = 1.0 + 2.5 * smoothstep(0.035, 0.0, uTrazo - vOrden) * step(uTrazo, 0.999);",
    "  float raya = uRayas > 0.0 ? step(0.45, fract(vOrden * uRayas - uTiempo * 0.35)) : 1.0;",
    "  vec3 col = mix(uColor, uColorResalte, vResalte);",
    "  gl_FragColor = vec4(col * punta, borde * vAlfa * uOpacidad * raya * (1.0 + vResalte * 0.9));",
    "}"
  ].join("\n");

  var VS_FIJO = [
    GLSL_COLOCAR,
    "varying vec3 vH;",
    "void main() {",
    "  vH = position;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(colocar(position), 1.0);",
    "}"
  ].join("\n");

  // Los colores de los fondos se piensan en sRGB y se pasan a lineal: el resplandor trabaja en lineal
  // y la última pasada los vuelve a sRGB. El grano evita escalones en los degradados oscuros.
  var GLSL_LINEAL = [
    "vec3 lineal(vec3 c) { return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }",
    "float grano(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453) - 0.5; }"
  ].join("\n");

  // Fondo del cielo: noche profunda, resplandor de la ciudad y el crepúsculo hacia donde está el Sol.
  var FS_CIELO = [
    GLSL_LINEAL,
    "uniform mat3 uRot;",
    "uniform mat3 uGal;",
    "uniform sampler2D uViaMapa;",
    "uniform float uVia;",
    "uniform float uViaHalo;",
    "uniform vec3 uSol;",
    "uniform float uCrepusculo;",
    "uniform float uOpacidad;",
    "uniform float uMezcla;",
    "varying vec3 vH;",
    "void main() {",
    "  vec3 h = normalize(vH);",
    "  float alto = clamp(h.z, 0.0, 1.0);",
    "  float k = pow(1.0 - alto, 2.6);",
    "  vec3 cenitN = mix(vec3(0.02, 0.035, 0.085), vec3(0.008, 0.014, 0.038), uMezcla);",
    "  vec3 horizN = mix(vec3(0.075, 0.1, 0.19), vec3(0.03, 0.05, 0.11), uMezcla);",
    "  vec3 cenit = mix(cenitN, vec3(0.085, 0.16, 0.36), uCrepusculo);",
    "  vec3 horiz = mix(horizN, vec3(0.34, 0.4, 0.62), uCrepusculo);",
    "  vec3 col = mix(cenit, horiz, k);",
    "  float haciaCiudad = max(dot(normalize(vec2(h.x, h.y) + 1e-5), vec2(-0.766, -0.643)), 0.0);",
    "  col += vec3(0.17, 0.1, 0.055) * pow(1.0 - clamp(h.z * 4.0, 0.0, 1.0), 2.4) * (1.0 - uMezcla * 0.75) * (1.0 - uCrepusculo * 0.6) * mix(0.75, 1.5, haciaCiudad * haciaCiudad);",
    "  float haciaSol = max(dot(h, uSol), 0.0);",
    "  col += vec3(1.0, 0.5, 0.26) * pow(haciaSol, 6.0) * pow(1.0 - alto, 3.4) * uCrepusculo * 0.55;",
    "  col += vec3(0.6, 0.42, 0.7) * pow(haciaSol, 1.5) * k * uCrepusculo * 0.2;",
    "  float r = length(vec2(h.x, h.y)) / max(1.0 + h.z, 0.05);",
    "  col *= mix(1.0, 0.86 + 0.14 * smoothstep(1.0, 0.2, r), uMezcla);",
    "  col += grano(gl_FragCoord.xy) / 255.0;",
    "  vec3 gal = (h * uRot) * uGal;",
    "  float lat = asin(clamp(gal.z, -1.0, 1.0)) * 57.29578;",
    "  vec2 uvVia = vec2(atan(gal.y, gal.x) / 6.2831853 + 0.5, (lat + 40.0) / 80.0);",
    "  vec3 via = texture2D(uViaMapa, uvVia).rgb * uVia * (1.0 - smoothstep(37.0, 40.0, abs(lat)));",
    "  float lon = atan(gal.y, gal.x) * 57.29578;",
    "  via += vec3(0.62, 0.7, 1.0) * uViaHalo * exp(-lat * lat / 450.0) * (0.3 + 0.7 * exp(-lon * lon / 5000.0));",
    "  via *= smoothstep(-0.03, 0.06, h.z);",
    "  gl_FragColor = vec4(lineal(max(col, 0.0)) + via, uOpacidad);",
    "}"
  ].join("\n");

  var FS_SUELO = [
    GLSL_LINEAL,
    "uniform float uOpacidad;",
    "uniform float uCrepusculo;",
    "varying vec3 vH;",
    "void main() {",
    "  float borde = smoothstep(-0.06, 0.04, vH.z);",
    "  vec3 col = mix(vec3(0.006, 0.009, 0.02), vec3(0.028, 0.036, 0.07) + vec3(0.07, 0.07, 0.11) * uCrepusculo, borde);",
    "  col += grano(gl_FragCoord.xy) / 255.0;",
    "  gl_FragColor = vec4(lineal(max(col, 0.0)), uOpacidad);",
    "}"
  ].join("\n");

  var VS_LUCES = [
    GLSL_COLOCAR,
    "attribute float aAzar;",
    "uniform float uTiempo;",
    "uniform float uPx;",
    "uniform float uOpacidad;",
    "varying float vAlfa;",
    "varying vec3 vColor;",
    "void main() {",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(colocar(position), 1.0);",
    "  if (aAzar > 1.5) {",
    "    float fase = fract(uTiempo * 0.55 + aAzar * 3.7);",
    "    gl_PointSize = 4.2 * uPx;",
    "    vAlfa = uOpacidad * (0.18 + 0.82 * smoothstep(0.0, 0.08, fase) * (1.0 - smoothstep(0.32, 0.5, fase)));",
    "    vColor = vec3(1.0, 0.05, 0.03);",
    "  } else {",
    "    gl_PointSize = (1.6 + aAzar * 2.2) * uPx;",
    "    vAlfa = uOpacidad * (0.45 + 0.4 * aAzar) * (0.85 + 0.15 * sin(uTiempo * (2.0 + aAzar * 5.0) + aAzar * 40.0));",
    "    vColor = vec3(1.0, 0.5, 0.17);",
    "  }",
    "}"
  ].join("\n");

  var FS_LUCES = [
    "varying float vAlfa;",
    "varying vec3 vColor;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  gl_FragColor = vec4(vColor, exp(-r2 * 4.0) * vAlfa);",
    "}"
  ].join("\n");

  // La ciudad de noche vista desde una loma: cada luz vive en el suelo (este, norte, en km) y se
  // proyecta hacia abajo del horizonte; los autos recorren su avenida.
  var VS_CIUDAD = [
    GLSL_COLOCAR,
    "attribute vec4 aRuta;",
    "attribute vec3 aColor;",
    "attribute float aAzar;",
    "attribute float aVel;",
    "uniform float uTiempo;",
    "uniform float uPx;",
    "uniform float uZoom;",
    "uniform float uOpacidad;",
    "uniform float uAltura;",
    "varying float vAlfa;",
    "varying vec3 vColor;",
    "void main() {",
    "  float t = aVel > 0.0 ? fract(uTiempo * aVel + aAzar) : 0.0;",
    "  vec2 p = mix(aRuta.xy, aRuta.zw, t);",
    "  float d = max(length(p), 0.05);",
    "  vec3 h = normalize(vec3(p.y, -p.x, -uAltura - d * d * 0.0000785));",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(colocar(h), 1.0);",
    "  gl_PointSize = clamp(2.4 * pow(0.8 / d, 0.5), 1.0, 4.6) * uPx * uZoom;",
    "  float parpadeo = 0.8 + 0.2 * sin(uTiempo * (1.3 + aAzar * 5.0) + aAzar * 50.0);",
    "  float fin = aVel > 0.0 ? smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.95, 1.0, t)) : 1.0;",
    "  vAlfa = uOpacidad * (0.5 + 0.5 * aAzar) * mix(1.0, parpadeo, smoothstep(1.0, 4.0, d)) * (0.4 + 0.6 * exp(-d / 9.0)) * fin;",
    "  vColor = aColor;",
    "}"
  ].join("\n");

  var FS_CIUDAD = [
    "varying float vAlfa;",
    "varying vec3 vColor;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  gl_FragColor = vec4(vColor, (exp(-r2 * 7.0) + exp(-r2 * 2.5) * 0.25) * (1.0 - r2) * vAlfa);",
    "}"
  ].join("\n");

  var VS_CUERPOS = [
    GLSL_COLOCAR,
    "attribute vec3 aColor;",
    "attribute float aMag;",
    "uniform float uTam;",
    "uniform float uOpacidad;",
    "uniform float uMagLimite;",
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "void main() {",
    "  vec3 h = uRot * position;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(colocar(h), 1.0);",
    "  float flujo = pow(10.0, -0.4 * (aMag - 6.0));",
    "  gl_PointSize = uTam * (1.4 + pow(flujo, 0.26));",
    "  vAlfa = uOpacidad * smoothstep(-0.012, 0.01, h.z) * smoothstep(uMagLimite + 0.8, uMagLimite - 0.4, aMag);",
    "  vColor = aColor;",
    "}"
  ].join("\n");

  var FS_CUERPOS = [
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  float disco = 1.0 - smoothstep(0.035, 0.07, r2);",
    "  float halo = exp(-r2 * 6.0) * 0.55;",
    "  gl_FragColor = vec4(mix(vColor, vec3(1.0), disco * 0.35), (disco + halo) * (1.0 - r2) * vAlfa);",
    "}"
  ].join("\n");

  // La Luna con su fase real: el lado iluminado mira hacia el Sol.
  var VS_LUNA = [
    GLSL_COLOCAR,
    "uniform vec3 uLuna;",
    "uniform vec3 uSolEq;",
    "uniform vec2 uPantalla;",
    "uniform float uTam;",
    "uniform float uOpacidad;",
    "varying vec2 vLuz;",
    "varying float vAlfa;",
    "void main() {",
    "  vec3 h = uRot * uLuna;",
    "  vec3 hs = uRot * normalize(uLuna + (uSolEq - uLuna) * 0.03);",
    "  vec4 c = projectionMatrix * modelViewMatrix * vec4(colocar(h), 1.0);",
    "  vec4 cs = projectionMatrix * modelViewMatrix * vec4(colocar(hs), 1.0);",
    "  vec2 d = cs.xy / max(cs.w, 0.001) * uPantalla - c.xy / max(c.w, 0.001) * uPantalla;",
    "  vLuz = length(d) > 0.0001 ? normalize(d) : vec2(1.0, 0.0);",
    "  gl_Position = c.w > 0.001 ? c : vec4(0.0, 0.0, 2.0, 1.0);",
    "  gl_PointSize = uTam;",
    "  vAlfa = uOpacidad * smoothstep(-0.01, 0.012, h.z);",
    "}"
  ].join("\n");

  var FS_LUNA = [
    "uniform float uFase;",
    "varying vec2 vLuz;",
    "varying float vAlfa;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  p.y = -p.y;",
    "  float r = length(p) / 0.5;",
    "  float halo = exp(-max(r - 1.0, 0.0) * 2.4) * 0.22 * (1.0 - smoothstep(1.0, 2.0, r));",
    "  if (r > 1.0) { gl_FragColor = vec4(0.85, 0.88, 1.0, halo * vAlfa * (1.0 - uFase / 3.2)); return; }",
    "  vec3 n = vec3(p / 0.5, sqrt(max(0.0, 1.0 - r * r)));",
    "  vec3 L = vec3(vLuz * sin(uFase), cos(uFase));",
    "  float luz = smoothstep(-0.06, 0.08, dot(n, L));",
    "  float manchas = 0.86 + 0.14 * sin(p.x * 23.0 + p.y * 7.0) * sin(p.y * 19.0 - p.x * 5.0);",
    "  vec3 col = vec3(0.94, 0.9, 0.8) * manchas * (0.022 + 0.978 * luz);",
    "  float borde = 1.0 - smoothstep(0.92, 1.0, r);",
    "  gl_FragColor = vec4(col, borde * vAlfa);",
    "}"
  ].join("\n");

  var VS_ARO = [
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = uv;",
    "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}"
  ].join("\n");

  var FS_ARO = [
    "uniform sampler2D uMapa;",
    "uniform float uOpacidad;",
    "uniform float uRevelado;",
    "uniform float uTiempo;",
    "varying vec2 vUv;",
    "void main() {",
    "  vec4 t = texture2D(uMapa, vUv);",
    "  vec2 p = vUv * 2.0 - 1.0;",
    "  float ang = fract(atan(p.x, p.y) / 6.2831853 + 1.0);",
    "  float rev = smoothstep(uRevelado, uRevelado - 0.04, ang);",
    "  float barrido = pow(max(0.0, cos((ang - fract(uTiempo * 0.035)) * 6.2831853)), 40.0) * 0.6;",
    "  float aro = smoothstep(0.8, 0.86, length(p));",
    "  vec3 col = t.rgb * (1.0 + barrido * aro);",
    "  gl_FragColor = vec4(col, t.a * uOpacidad * rev);",
    "}"
  ].join("\n");

  var VS_FONDO = [
    "varying vec2 vUv;",
    "void main() {",
    "  vUv = position.xy * 0.5 + 0.5;",
    "  gl_Position = vec4(position.xy, 0.0, 1.0);",
    "}"
  ].join("\n");

  // Fondo del cartel: azul de medianoche, un halo detrás de la carta y la sierra de Durango con sus pinos.
  var FS_FONDO = [
    GLSL_LINEAL,
    "uniform vec2 uCentro;",
    "uniform float uAspecto;",
    "uniform float uRadio;",
    "uniform float uTiempo;",
    "uniform float uOpacidad;",
    "uniform vec2 uParalaje;",
    "uniform float uPx;",
    "varying vec2 vUv;",
    "float azar(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }",
    "float ruido(float x, float s) { float i = floor(x), f = fract(x); return mix(azar(vec2(i, s)), azar(vec2(i + 1.0, s)), f * f * (3.0 - 2.0 * f)); }",
    "float loma(float x, float s) { return ruido(x, s) * 0.6 + ruido(x * 2.3, s + 1.7) * 0.27 + ruido(x * 5.1, s + 3.1) * 0.13; }",
    "float pinos(float x, float y, float base, float sp, float px, float s) {",
    "  float dentro = 0.0, c0 = floor(x / sp);",
    "  for (int i = -1; i <= 1; i++) {",
    "    float c = c0 + float(i);",
    "    float a1 = azar(vec2(c, s)), a2 = azar(vec2(c, s + 0.37)), a3 = azar(vec2(c, s + 0.71));",
    "    float xc = (c + 0.5 + (a1 - 0.5) * 0.7) * sp;",
    "    float alto = sp * (1.3 + 1.9 * a2) * step(0.16, a3);",
    "    float v = (y - base) / max(alto, 1e-5);",
    "    float t = clamp(1.0 - v, 0.0, 1.0);",
    "    float ancho = sp * (0.42 + 0.22 * a3) * t * (0.5 + 0.5 * fract(t * 4.0 + a1 * 0.5));",
    "    dentro = max(dentro, smoothstep(-px, px, ancho - abs(x - xc)) * step(0.0, v) * step(v, 1.0));",
    "  }",
    "  return dentro;",
    "}",
    "void main() {",
    "  float x = (vUv.x - 0.5) * uAspecto, y = vUv.y, R = max(uRadio, 0.08), px = uPx * 1.2;",
    "  vec3 col = mix(vec3(0.018, 0.034, 0.09), vec3(0.075, 0.135, 0.31), smoothstep(0.05, 1.0, y));",
    "  float r = length(vec2((vUv.x - uCentro.x) * uAspecto, y - uCentro.y)) / R;",
    "  col += vec3(0.06, 0.11, 0.25) * exp(-max(r - 1.05, 0.0) * 2.2) * 0.55;",
    "  vec2 e = vec2(x, y) * 150.0;",
    "  float a = azar(floor(e));",
    "  float brilla = step(0.986, a) * (0.45 + 0.55 * sin(uTiempo * (0.6 + a * 2.0) + a * 90.0));",
    "  float estrellas = brilla * (1.0 - smoothstep(0.0, 0.2, length(fract(e) - 0.5)));",
    "  float cy = uCentro.y;",
    "  float yA = cy - R * 0.36 + R * 0.34 * (loma((x + uParalaje.x * R * 0.03) / R * 1.2, 11.0) - 0.5);",
    "  float yB = cy - R * 0.74 + R * 0.28 * (loma((x + uParalaje.x * R * 0.07) / R * 1.9, 37.0) - 0.5);",
    "  float yC = cy - R * 1.04 + R * 0.18 * (loma((x + uParalaje.x * R * 0.13) / R * 2.8, 73.0) - 0.5);",
    "  float xB = x + uParalaje.x * R * 0.07, xC = x + uParalaje.x * R * 0.13;",
    "  float mA = 1.0 - smoothstep(-px, px, y - yA);",
    "  col += vec3(0.75, 0.8, 1.0) * estrellas * 0.55 * (1.0 - mA);",
    "  col = mix(col, vec3(0.038, 0.07, 0.17), mA);",
    "  col += vec3(0.035, 0.055, 0.11) * exp(-max(y - yB, 0.0) / (R * 0.13)) * mA * 0.7;",
    "  float mB = max(1.0 - smoothstep(-px, px, y - yB), pinos(xB, y, yB - R * 0.01, R * 0.042, px, 5.0));",
    "  col = mix(col, vec3(0.02, 0.04, 0.095), mB);",
    "  col += vec3(0.022, 0.036, 0.075) * exp(-max(y - yC, 0.0) / (R * 0.1)) * mB * 0.65;",
    "  float mC = max(1.0 - smoothstep(-px, px, y - yC), pinos(xC, y, yC - R * 0.01, R * 0.07, px, 9.0));",
    "  col = mix(col, vec3(0.011, 0.02, 0.05), mC);",
    "  col = mix(col, vec3(0.005, 0.009, 0.024), (1.0 - smoothstep(0.0, max(yC, 0.01), y)) * mC * 0.75);",
    "  vec2 q = vUv - 0.5;",
    "  col *= 1.0 - dot(q, q) * 0.6;",
    "  col += grano(gl_FragCoord.xy) / 255.0;",
    "  gl_FragColor = vec4(lineal(max(col, 0.0)), uOpacidad);",
    "}"
  ].join("\n");

  /* ---------- El aro de astrolabio (también lo usa la carta plana) ---------- */

  function dibujarAro(g, S) {
    var c = S / 2, R = c / ESCALA_ARO, TAU = Math.PI * 2;
    var oro = function (a) { return "rgba(205, 184, 133, " + a + ")"; };
    var claro = function (a) { return "rgba(243, 227, 188, " + a + ")"; };
    function punto(az, r) { var a = az * GRADO; return [-Math.sin(a) * r, -Math.cos(a) * r]; }
    g.clearRect(0, 0, S, S);
    g.save();
    g.translate(c, c);
    // Rejilla interior: alturas de 30° y 60°, el meridiano y el primer vertical
    g.strokeStyle = oro(0.17);
    g.lineWidth = Math.max(1, R * 0.0024);
    g.setLineDash([R * 0.007, R * 0.016]);
    [30, 60].forEach(function (alt) {
      var r = R * Math.cos(alt * GRADO) / (1 + Math.sin(alt * GRADO));
      g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
    });
    g.beginPath(); g.moveTo(0, -R); g.lineTo(0, R); g.moveTo(-R, 0); g.lineTo(R, 0); g.stroke();
    g.setLineDash([]);
    g.strokeStyle = oro(0.35);
    g.beginPath(); g.moveTo(-R * 0.025, 0); g.lineTo(R * 0.025, 0); g.moveTo(0, -R * 0.025); g.lineTo(0, R * 0.025); g.stroke();
    // Borde de la carta, con su luz
    g.shadowColor = claro(0.6);
    g.shadowBlur = R * 0.025;
    g.strokeStyle = claro(0.95);
    g.lineWidth = R * 0.0065;
    g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke();
    g.shadowBlur = 0;
    // Banda graduada
    g.fillStyle = "rgba(6, 9, 26, 0.72)";
    g.beginPath(); g.arc(0, 0, R * 1.138, 0, TAU); g.arc(0, 0, R * 1.012, 0, TAU, true); g.fill();
    g.strokeStyle = oro(0.6); g.lineWidth = R * 0.0022;
    g.beginPath(); g.arc(0, 0, R * 1.034, 0, TAU); g.stroke();
    g.strokeStyle = oro(0.75); g.lineWidth = R * 0.0034;
    g.beginPath(); g.arc(0, 0, R * 1.132, 0, TAU); g.stroke();
    g.strokeStyle = oro(0.3); g.lineWidth = R * 0.0016;
    g.beginPath(); g.arc(0, 0, R * 1.15, 0, TAU); g.stroke();
    for (var d = 0; d < 360; d++) {
      var largo = d % 15 === 0 ? 0.03 : d % 5 === 0 ? 0.019 : 0.0095;
      var p0 = punto(d, R * 1.034), p1 = punto(d, R * (1.034 + largo));
      g.strokeStyle = d % 15 === 0 ? claro(0.85) : oro(d % 5 === 0 ? 0.7 : 0.45);
      g.lineWidth = R * (d % 15 === 0 ? 0.003 : 0.0018);
      g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
    }
    g.textAlign = "center";
    g.textBaseline = "middle";
    // Puntos cardinales y grados
    var mayor = "600 " + Math.round(R * 0.066) + "px \"Cormorant Garamond\", Georgia, serif";
    var menor = "400 " + Math.round(R * 0.031) + "px Jost, \"Avenir Next\", sans-serif";
    var numeros = "300 " + Math.round(R * 0.026) + "px Jost, \"Avenir Next\", sans-serif";
    var letras = { 0: "N", 90: "E", 180: "S", 270: "O", 45: "NE", 135: "SE", 225: "SO", 315: "NO" };
    for (var az = 0; az < 360; az += 15) {
      var t = letras[az], pos = punto(az, R * 1.093);
      if (az % 90 === 0) {
        g.font = mayor;
        g.fillStyle = claro(1);
        g.shadowColor = claro(0.55);
        g.shadowBlur = R * 0.012;
        g.fillText(t, pos[0], pos[1] + R * 0.003);
        g.shadowBlur = 0;
      } else if (t) {
        g.font = menor;
        g.fillStyle = oro(0.95);
        g.fillText(t, pos[0], pos[1]);
      } else if (az % 30 === 0) {
        g.font = numeros;
        g.fillStyle = oro(0.62);
        g.fillText(az + "°", pos[0], pos[1]);
      } else {
        g.fillStyle = oro(0.5);
        g.beginPath(); g.arc(pos[0], pos[1], R * 0.0042, 0, TAU); g.fill();
      }
    }
    // Rombos en los cuatro puntos cardinales, por fuera
    [0, 90, 180, 270].forEach(function (a) {
      var p = punto(a, R * 1.155), s = R * 0.011;
      g.save();
      g.translate(p[0], p[1]);
      g.rotate(-a * GRADO);
      g.fillStyle = claro(0.9);
      g.beginPath(); g.moveTo(0, -s * 1.6); g.lineTo(s, 0); g.lineTo(0, s * 1.6); g.lineTo(-s, 0); g.closePath(); g.fill();
      g.restore();
    });
    g.restore();
  }

  // Exporta lo necesario para el resto del módulo (segunda parte, más abajo).
  C._Mapa = {
    GRADO: GRADO, ESCALA_ARO: ESCALA_ARO, FOV_CARTA: FOV_CARTA, MESES: MESES, CARDINALES: CARDINALES, RUMBOS: RUMBOS,
    CENTRO_GALACTICO: CENTRO_GALACTICO, CUERPOS: CUERPOS, TEXTOS: TEXTOS, SVG: SVG,
    nodo: nodo, icono: icono, limitar: limitar, mezclar: mezclar, suave: suave, tramo: tramo, formatear: formatear,
    direccion: direccion, alHorizonte: alHorizonte, alEcuador: alEcuador, colocar: colocar, azimut: azimut, altura: altura,
    rumbo: rumbo, reloj: reloj, coordenada: coordenada, colorBV: colorBV, Efemerides: Efemerides,
    prepararEstrellas: prepararEstrellas, polilineasConstelaciones: polilineasConstelaciones, polilineaEcliptica: polilineaEcliptica,
    polilineaArco: polilineaArco, geometriaLineas: geometriaLineas, generarViaLactea: generarViaLactea, perfilHorizonte: perfilHorizonte,
    texturaViaLactea: texturaViaLactea, GALACTICA: GALACTICA,
    horizonte: horizonte, dibujarAro: dibujarAro,
    GLSL: {
      VS_ESTRELLAS: VS_ESTRELLAS, FS_ESTRELLAS: FS_ESTRELLAS, VS_VIA: VS_VIA, FS_VIA: FS_VIA, VS_LINEAS: VS_LINEAS, FS_LINEAS: FS_LINEAS,
      VS_FIJO: VS_FIJO, FS_CIELO: FS_CIELO, FS_SUELO: FS_SUELO, VS_LUCES: VS_LUCES, FS_LUCES: FS_LUCES, VS_CIUDAD: VS_CIUDAD, FS_CIUDAD: FS_CIUDAD, VS_CUERPOS: VS_CUERPOS,
      FS_CUERPOS: FS_CUERPOS, VS_LUNA: VS_LUNA, FS_LUNA: FS_LUNA, VS_ARO: VS_ARO, FS_ARO: FS_ARO, VS_FONDO: VS_FONDO, FS_FONDO: FS_FONDO
    }
  };
})(window.Cielo);

/* ---------- Segunda parte: la escena, el cartel y los gestos ---------- */
(function (C) {
  "use strict";

  var M = C._Mapa;
  var THREE = window.THREE;
  if (!M) return;
  var GRADO = M.GRADO, ESCALA_ARO = M.ESCALA_ARO, G = M.GLSL;
  var nodo = M.nodo, icono = M.icono, limitar = M.limitar, mezclar = M.mezclar, suave = M.suave, tramo = M.tramo, formatear = M.formatear;

  var ICONOS = { estrella: "estrella", pareja: "pareja", "via-lactea": "galaxia", planeta: "planeta" };
  var TONOS = { estrella: "#ff8a6e", pareja: "#ff9cbc", "via-lactea": "#c3bdff", planeta: "#ffbf7a" };

  function disponible() { return !!(window.Astronomy && window.CIELO_MAPA_DATOS && window.Astronomy.Rotation_EQJ_HOR); }
  function sinAcentos(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }

  function textosDe(m, T) {
    var t = {}, k;
    for (k in M.TEXTOS) t[k] = M.TEXTOS[k];
    if (T && T.cerrarRecuerdo) t.volver = T.cerrarRecuerdo;
    var extra = (m && m.textos) || {};
    for (k in extra) t[k] = extra[k];
    return t;
  }
  function fechaTexto(m, efe) { return m.fechaTexto || (efe.dia + " de " + M.MESES[efe.mes] + " de " + efe.anio); }
  function lugarCorto(m) { return m.lugarCorto || String(m.lugar || "").split(",")[0].trim(); }

  var indiceConst = null;
  function constelacionPorSigla(sigla) {
    if (!indiceConst) {
      indiceConst = {};
      window.CIELO_MAPA_DATOS.constelaciones.forEach(function (c, i) { indiceConst[c[0]] = i; });
    }
    var k = indiceConst[sigla];
    return k == null ? -1 : k;
  }

  // Un objeto del cielo por su nombre: estrella con nombre, planeta, la Luna o el centro de la galaxia.
  function buscarObjeto(nombre) {
    var D = window.CIELO_MAPA_DATOS, n = sinAcentos(nombre);
    if (!n) return null;
    if (/^(centro[- ]galactico|via[- ]lactea|centro de la galaxia)$/.test(n)) {
      return { fijo: true, dir: M.direccion(M.CENTRO_GALACTICO[0], M.CENTRO_GALACTICO[1], [0, 0, 0], 0), nombre: null, grupo: constelacionPorSigla("Sgr"), centro: true };
    }
    for (var i = 0; i < D.nombres.length; i++) {
      var s = D.nombres[i];
      if (sinAcentos(s[0]) === n) return { fijo: true, dir: M.direccion(s[1] / 100, s[2] / 100, [0, 0, 0], 0), nombre: s[0], grupo: constelacionPorSigla(s[4]), mag: s[3] / 100 };
    }
    for (var j = 0; j < M.CUERPOS.length; j++) {
      var c = M.CUERPOS[j];
      if (sinAcentos(c.nombre) === n || sinAcentos(c.id) === n) return { fijo: false, cuerpo: c.id, dir: [1, 0, 0], nombre: c.nombre, grupo: -1 };
    }
    return null;
  }
  function prepararDestacados(lista) {
    return (lista || []).map(function (d) {
      var nombres = [].concat(d.objetivos || d.objetivo || []);
      var objetos = nombres.map(buscarObjeto).filter(Boolean);
      var grupos = [];
      objetos.forEach(function (o) { if (o.grupo >= 0 && grupos.indexOf(o.grupo) < 0) grupos.push(o.grupo); });
      [].concat(d.constelaciones || []).forEach(function (s) { var k = constelacionPorSigla(s); if (k >= 0 && grupos.indexOf(k) < 0) grupos.push(k); });
      return {
        tipo: d.tipo || "estrella", titulo: d.titulo || nombres.join(" y "), subtitulo: d.subtitulo || "", texto: d.texto || "",
        icono: ICONOS[d.tipo] || "estrella", tono: d.color || TONOS[d.tipo] || "#f3e3bc", objetos: objetos, grupos: grupos
      };
    });
  }

  /* ---------- Geometrías del horizonte ---------- */

  function geometriaCupula(altMin, filas, cols) {
    var pos = [], idx = [], s = [0, 0, 0];
    for (var i = 0; i <= filas; i++) {
      var alt = Math.min(89.95, altMin + (90 - altMin) * (i / filas));
      for (var j = 0; j <= cols; j++) {
        M.horizonte(j / cols * 360, alt, s, 0);
        pos.push(s[0], s[1], s[2]);
      }
    }
    for (i = 0; i < filas; i++) {
      for (j = 0; j < cols; j++) {
        var a = i * (cols + 1) + j, b = a + cols + 1;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(idx);
    return g;
  }
  function geometriaSuelo(perfil) {
    var N = perfil.length - 1, filas = 6, pos = [], idx = [], s = [0, 0, 0];
    for (var j = 0; j <= N; j++) {
      var az = j / N * 360, alturas = [perfil[j], -1.2, -5, -18, -50, -89.5];
      for (var i = 0; i < filas; i++) {
        M.horizonte(az, alturas[i], s, 0);
        pos.push(s[0], s[1], s[2]);
      }
    }
    for (j = 0; j < N; j++) {
      for (var f = 0; f < filas - 1; f++) {
        var a = j * filas + f, b = a + filas;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(idx);
    return g;
  }
  function geometriaLuces(perfil, rnd, n) {
    var antenas = [8, 256, 271, 292], total = n + antenas.length;
    var pos = new Float32Array(total * 3), azar = new Float32Array(total), N = perfil.length - 1;
    for (var i = 0; i < n; i++) {
      var az = rnd() * 360, tope = perfil[Math.round(az / 360 * N)];
      M.horizonte(az, 0.04 + Math.pow(rnd(), 2.2) * tope * 0.5, pos, i * 3);
      azar[i] = rnd();
    }
    // Antenas en lo alto de los cerros, con su luz roja que parpadea
    antenas.forEach(function (az, k) {
      M.horizonte(az, perfilEn(perfil, az) + 0.12, pos, (n + k) * 3);
      azar[n + k] = 2 + k * 0.29;
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aAzar", new THREE.BufferAttribute(azar, 1));
    return g;
  }
  // Durango de noche: calles en cuadrícula (más densas hacia el sureste, donde queda el centro),
  // vistas desde una loma de unos 160 m, y autos por cuatro avenidas.
  function geometriaCiudad(rnd, movil) {
    var ruta = [], color = [], azar = [], vel = [];
    var cx = 2.1, cy = -2.5, s2 = 2 * 2.7 * 2.7, th = 18 * GRADO, ct = Math.cos(th), st = Math.sin(th), lim = 9;
    var sodio = [1, 0.46, 0.14], led = [0.8, 0.83, 0.95], faro = [1, 0.93, 0.8], freno = [1, 0.09, 0.05];
    function densidad(e, n) {
      var de = e - cx, dn = n - cy;
      return 0.8 * Math.exp(-(de * de + dn * dn) / s2) + Math.exp(-(e * e + n * n) / 5.1) + 0.04;
    }
    function aSuelo(u, w) { return [u * ct - w * st, u * st + w * ct]; }
    // Se encienden cuadras completas, así las calles se leen como hileras de luz en perspectiva
    var paso = 0.1, factor = movil ? 0.42 : 0.55;
    for (var fam = 0; fam < 2; fam++) {
      for (var k = -lim; k <= lim; k += paso) {
        var principal = Math.abs(Math.round(k / paso)) % 8 === 0, cada = principal ? 0.026 : 0.034;
        for (var tb = -lim; tb <= lim; tb += paso) {
          var qc = fam ? aSuelo(k, tb + paso / 2) : aSuelo(tb + paso / 2, k), dc = Math.sqrt(qc[0] * qc[0] + qc[1] * qc[1]);
          if (dc < 0.3 || dc > lim) continue;
          var cerca = dc < 3 ? 1.5 : 0.33;
          if (rnd() > Math.min(1, densidad(qc[0], qc[1]) * factor * cerca * (principal ? 2.4 : 1))) continue;
          var tono = rnd() < (principal ? 0.85 : 0.62) ? sodio : led;
          for (var t = tb + cada * 0.5; t < tb + paso; t += cada) {
            var q = fam ? aSuelo(k, t) : aSuelo(t, k), e = q[0] + (rnd() - 0.5) * 0.004, n = q[1] + (rnd() - 0.5) * 0.004;
            if (e * e + n * n < 0.09) continue;
            ruta.push(e, n, e, n); color.push(tono[0], tono[1], tono[2]); azar.push(rnd()); vel.push(0);
          }
        }
      }
    }
    // Luces sueltas: ventanas y casas fuera de la cuadrícula
    for (var i = 0; i < (movil ? 260 : 400); i++) {
      var ang = rnd() * Math.PI * 2, dd = 0.3 + Math.pow(rnd(), 0.7) * 8;
      var es = Math.sin(ang) * dd, ns = Math.cos(ang) * dd;
      if (rnd() > densidad(es, ns) * 1.4) continue;
      ruta.push(es, ns, es, ns); color.push(sodio[0], sodio[1] * 1.1, sodio[2] * 1.3); azar.push(rnd()); vel.push(0);
    }
    // Autos: faros que vienen y luces de freno que se van
    [[0, 8 * paso * 2], [0, -8 * paso * 4], [1, 8 * paso * 2], [1, -8 * paso * 2]].forEach(function (av) {
      var a = av[0] ? aSuelo(av[1], -lim) : aSuelo(-lim, av[1]), b = av[0] ? aSuelo(av[1], lim) : aSuelo(lim, av[1]);
      var L = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
      for (var j = 0; j < (movil ? 14 : 22); j++) {
        var ida = j % 2 === 0, v = (0.035 + rnd() * 0.02) / L, c2 = ida ? faro : freno;
        if (ida) ruta.push(a[0], a[1], b[0], b[1]); else ruta.push(b[0], b[1], a[0], a[1]);
        color.push(c2[0], c2[1], c2[2]); azar.push(rnd()); vel.push(v);
      }
    });
    var total = azar.length, g = new THREE.BufferGeometry();
    var lin = new Float32Array(color.length);
    for (var z = 0; z < color.length; z++) lin[z] = Math.pow(color[z], 2.2);
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(total * 3), 3));
    g.setAttribute("aRuta", new THREE.BufferAttribute(new Float32Array(ruta), 4));
    g.setAttribute("aColor", new THREE.BufferAttribute(lin, 3));
    g.setAttribute("aAzar", new THREE.BufferAttribute(new Float32Array(azar), 1));
    g.setAttribute("aVel", new THREE.BufferAttribute(new Float32Array(vel), 1));
    return g;
  }
  function perfilEn(perfil, az) {
    var N = perfil.length - 1, x = (((az % 360) + 360) % 360) / 360 * N, i = Math.floor(x);
    return mezclar(perfil[i], perfil[Math.min(N, i + 1)], x - i);
  }

  /* ---------- Mapa ---------- */

  function Mapa(op) {
    this.op = op;
    this.m = op.config || {};
    this.T = textosDe(this.m, op.textos);
    this.movil = !!op.movil;
    this.reducido = !!op.reducido;
    this.raiz = op.raiz;
    this.efe = new M.Efemerides(this.m);
    this.rot = new Float32Array(9);
    this.minutos = this.efe.hora;
    this.calculados = NaN;
    this.p = 0;
    this.mezcla = 1;
    this.modo = "carta";
    this.transicion = null;
    this.mirada = { az: 180, alt: 24, fov: 72, vaz: 0, valt: 0, propia: false, giro: null };
    this.inclina = { x: 0, y: 0, objX: 0, objY: 0, arrastre: false, hoverX: 0, hoverY: 0 };
    this.seleccion = -1;
    this.resalte = { a: -9, b: -9, valor: 0, objetivo: 0, hasta: 0 };
    this.realceVia = 1;
    this.arcoVisible = 0;
    this.tiempo = 0;
    this.activo = false;
    this.listo = false;
    this.intro = null;
    this.estadoIntro = this.introFinal();
    this.reproduciendo = false;
    this.animHora = null;
    this.eventos = null;
    this.promedio = 16;
    this.lentos = 0;
    this.dpr = null;
    this.v = new THREE.Vector3();
    this.h = [0, 0, 0];
    this.h2 = [0, 0, 0];
    this.c5 = new Float32Array(5);
    this.qCarta = new THREE.Quaternion();
    this.qCupula = new THREE.Quaternion();
    this.rayo = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.destacados = prepararDestacados(this.m.destacados);
    this.construirDom();
    this.construirEscena();
    this.prepararEtiquetas();
    this.conectar();
    this.mostrarDetalle();
    this.fijarMinutos(this.efe.hora);
  }
  var P = Mapa.prototype;

  P.introFinal = function () { return { ensamble: 1, trazo: 1, via: 1, mezcla: 1, tilt: 0, giro: 0, lejos: 1, aro: 1.05 }; };

  /* ----- Cartel (HTML) ----- */

  P.construirDom = function () {
    var r = this.raiz, T = this.T, m = this.m, efe = this.efe, self = this;
    r.textContent = "";
    r.className = "mapa";
    r.setAttribute("role", "dialog");
    r.setAttribute("aria-modal", "true");
    r.tabIndex = -1;
    r.style.setProperty("--acento", this.op.color || "#ff7096");

    this.lienzo = nodo("canvas", "mapa__lienzo");
    this.lienzo.setAttribute("aria-hidden", "true");
    this.capa = nodo("div", "mapa__etiquetas");
    this.capa.setAttribute("aria-hidden", "true");

    var cartel = nodo("div", "mapa__cartel");
    this.cartel = cartel;
    var nombres = (m.nombres && m.nombres.length ? m.nombres : [this.op.destinatario, this.op.remitente]).filter(Boolean);
    var pn = nodo("p", "mapa__nombres");
    pn.appendChild(nodo("span", "mapa__nombre", nombres[0] || ""));
    if (nombres.length > 1) {
      pn.appendChild(icono(M.SVG.corazon, "mapa__corazon"));
      pn.appendChild(nodo("span", "mapa__nombre", nombres[1]));
    }
    this.hueco = nodo("div", "mapa__hueco");
    this.descripcion = nodo("p", "sr-only");
    this.hueco.appendChild(this.descripcion);
    this.botonVista = nodo("button", "boton boton--cristal mapa__vista");
    this.botonVista.type = "button";
    this.botonVista.appendChild(icono(M.SVG.cupula));
    this.botonVista.appendChild(nodo("span", "", formatear(T.mirar, { lugar: lugarCorto(m) })));
    // Nota que avisa que el botón se puede tocar; se va después de usarlo la primera vez.
    var tactil = window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches;
    this.notaVista = nodo("span", "mapa__vista-nota", tactil ? T.notaMirar : (T.notaMirarRaton || T.notaMirar));
    this.notaVista.setAttribute("aria-hidden", "true");
    this.botonVista.appendChild(this.notaVista);

    var texto = nodo("div", "mapa__texto");
    this.fecha = nodo("p", "mapa__fecha", fechaTexto(m, efe));
    this.titulo = nodo("h2", "mapa__titulo", m.titulo || T.titulo);
    this.titulo.id = "mapa-titulo";
    r.setAttribute("aria-labelledby", "mapa-titulo");
    var lista = nodo("div", "mapa__destacados");
    lista.setAttribute("role", "group");
    lista.setAttribute("aria-label", T.destacados);
    this.botonesDestacados = this.destacados.map(function (o, i) {
      var b = nodo("button", "mapa__destacado");
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.style.setProperty("--tono", o.tono);
      b.style.setProperty("--i", i);
      b.appendChild(icono(M.SVG[o.icono] || M.SVG.estrella, "mapa__destacado-icono"));
      var tx = nodo("span", "mapa__destacado-texto");
      tx.appendChild(nodo("span", "mapa__destacado-titulo", o.titulo));
      if (o.subtitulo) tx.appendChild(nodo("span", "mapa__destacado-subtitulo", o.subtitulo));
      b.appendChild(tx);
      b.addEventListener("click", function () { self.seleccionar(self.seleccion === i ? -1 : i, true); });
      lista.appendChild(b);
      return b;
    });
    this.detalle = nodo("div", "mapa__detalle");
    this.detalle.setAttribute("aria-live", "polite");
    var coords = nodo("p", "mapa__coordenadas", M.coordenada(Number(m.latitud) || 0, "N", "S") + "  ·  " + M.coordenada(Number(m.longitud) || 0, "E", "O"));
    var lugar = nodo("p", "mapa__lugar");
    lugar.appendChild(icono(M.SVG.lugar));
    lugar.appendChild(nodo("span", "", m.lugar || ""));
    [this.fecha, this.titulo, lista, this.detalle, coords, lugar].forEach(function (el) { texto.appendChild(el); });
    cartel.appendChild(pn);
    cartel.appendChild(this.hueco);
    cartel.appendChild(this.botonVista);
    cartel.appendChild(texto);

    this.botonVolver = nodo("button", "boton boton--cristal mapa__volver");
    this.botonVolver.type = "button";
    this.botonVolver.appendChild(icono(M.SVG.volver));
    this.textoVolver = nodo("span", "mapa__volver-texto", T.volver);
    this.botonVolver.appendChild(this.textoVolver);

    this.hud = nodo("div", "mapa__hud");
    this.hud.setAttribute("aria-hidden", "true");
    this.hud.appendChild(nodo("p", "mapa__hud-lugar", (m.lugar || "") + "  ·  " + fechaTexto(m, efe)));
    this.pista = nodo("p", "mapa__hud-pista", T.pistaCupula);
    this.hud.appendChild(this.pista);

    var controles = nodo("div", "mapa__controles");
    this.botonReproducir = nodo("button", "boton-icono mapa__reproducir");
    this.botonReproducir.type = "button";
    this.botonReproducir.setAttribute("aria-pressed", "false");
    this.botonReproducir.appendChild(icono(M.SVG.reproducir));
    this.textoReproducir = nodo("span", "sr-only", T.reproducir);
    this.botonReproducir.appendChild(this.textoReproducir);
    var pista = nodo("div", "mapa__pista");
    var barra = document.createElement("input");
    barra.type = "range";
    barra.className = "mapa__hora";
    barra.min = String(Math.round(efe.inicio));
    barra.max = String(Math.round(efe.fin));
    barra.step = "1";
    barra.value = String(efe.hora);
    barra.setAttribute("aria-label", T.hora);
    this.barra = barra;
    this.marcas = nodo("div", "mapa__marcas");
    this.marcas.setAttribute("aria-hidden", "true");
    var corazon = nodo("span", "mapa__marca mapa__marca--nuestra");
    corazon.style.setProperty("--x", ((efe.hora - efe.inicio) / (efe.fin - efe.inicio)).toFixed(4));
    this.marcas.appendChild(corazon);
    pista.appendChild(this.marcas);
    pista.appendChild(barra);
    this.reloj = nodo("output", "mapa__reloj");
    this.reloj.setAttribute("aria-hidden", "true");
    controles.appendChild(this.botonReproducir);
    controles.appendChild(pista);
    controles.appendChild(this.reloj);
    this.botonHora = nodo("button", "mapa__volver-hora");
    this.botonHora.type = "button";
    this.botonHora.appendChild(icono(M.SVG.corazon));
    this.botonHora.appendChild(nodo("span", "", formatear(T.volverHora, { hora: M.reloj(efe.hora) })));
    this.botonHora.hidden = true;

    this.aviso = nodo("p", "mapa__aviso");
    this.aviso.setAttribute("aria-live", "polite");
    this.toque = nodo("div", "mapa__toque");
    this.toque.setAttribute("aria-hidden", "true");
    this.toqueTitulo = nodo("span", "mapa__toque-titulo");
    this.toqueSub = nodo("span", "mapa__toque-sub");
    this.toque.appendChild(this.toqueTitulo);
    this.toque.appendChild(this.toqueSub);

    [this.lienzo, this.capa, cartel, this.hud, this.botonVolver, this.botonHora, controles, this.aviso, this.toque].forEach(function (el) { r.appendChild(el); });
    this.controles = controles;
  };

  P.mostrarDetalle = function () {
    var d = this.detalle, o = this.destacados[this.seleccion], m = this.m;
    d.textContent = "";
    this.posicionDetalle = null;
    d.classList.toggle("con-destacado", !!o);
    if (!o) {
      var mensaje = m.mensaje != null ? m.mensaje : this.op.mensaje;
      if (mensaje) d.appendChild(nodo("p", "mapa__mensaje", mensaje));
      return;
    }
    d.style.setProperty("--tono", o.tono);
    d.appendChild(nodo("p", "mapa__detalle-titulo", o.subtitulo ? o.titulo + " · " + o.subtitulo : o.titulo));
    if (o.texto) d.appendChild(nodo("p", "mapa__detalle-texto", o.texto));
    if (o.objetos.length) {
      this.posicionDetalle = nodo("p", "mapa__detalle-posicion", "");
      d.appendChild(this.posicionDetalle);
      this.ultimaPosicion = "";
      this.actualizarPosicion();
    }
  };
  P.textoPosicion = function (obj) {
    var h = M.alHorizonte(this.rot, this.dirDe(obj), this.h2), alt = M.altura(h);
    if (alt < 0) return this.T.bajo;
    return formatear(this.T.ahora, { rumbo: M.RUMBOS[M.rumbo(M.azimut(h))], altura: Math.round(alt) });
  };
  P.actualizarPosicion = function () {
    var o = this.destacados[this.seleccion];
    if (!o || !this.posicionDetalle || !o.objetos.length) return;
    var t = this.textoPosicion(o.objetos[0]);
    if (t !== this.ultimaPosicion) {
      this.ultimaPosicion = t;
      this.posicionDetalle.textContent = t;
    }
  };
  P.describir = function () {
    var self = this, partes = [formatear(this.T.descripcion, { lugar: this.m.lugar || "", fecha: fechaTexto(this.m, this.efe), hora: M.reloj(this.minutos) })];
    this.destacados.forEach(function (o) {
      if (o.objetos.length) partes.push(o.titulo + ": " + self.textoPosicion(o.objetos[0]).toLowerCase() + ".");
    });
    this.descripcion.textContent = partes.join(" ");
  };

  /* ----- Escena 3D ----- */

  P.construirEscena = function () {
    var self = this, movil = this.movil;
    var renderer = new THREE.WebGLRenderer({ canvas: this.lienzo, antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" });
    renderer.setClearColor(0x04060f, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    this.renderer = renderer;
    var escena = new THREE.Scene();
    this.escena = escena;
    this.camara = new THREE.PerspectiveCamera(M.FOV_CARTA, 1, 0.01, 100);
    var rot = { value: this.rot }, mezcla = { value: 1 }, tiempo = { value: 0 }, pantalla = { value: new THREE.Vector2(1, 1) };
    this.u = { mezcla: mezcla, tiempo: tiempo, pantalla: pantalla };

    function material(vs, fs, uniformes, aditiva, ambasCaras) {
      uniformes.uRot = rot;
      uniformes.uMezcla = mezcla;
      var op = { vertexShader: vs, fragmentShader: fs, uniforms: uniformes, transparent: true, depthTest: false, depthWrite: false };
      if (aditiva) op.blending = THREE.AdditiveBlending;
      if (ambasCaras) op.side = THREE.DoubleSide;
      return new THREE.ShaderMaterial(op);
    }
    function poner(obj, orden) { obj.frustumCulled = false; obj.renderOrder = orden; escena.add(obj); return obj; }
    function uniformesLinea(color, opacidad, ancho, rayas) {
      return {
        uPantalla: pantalla, uAncho: { value: ancho }, uGrupoA: { value: -9 }, uGrupoB: { value: -9 }, uResalte: { value: 0 },
        uColor: { value: new THREE.Color(color[0], color[1], color[2]) }, uColorResalte: { value: new THREE.Color(1, 0.84, 0.6) },
        uOpacidad: { value: opacidad }, uTrazo: { value: 2 }, uRayas: { value: rayas }, uTiempo: tiempo
      };
    }
    function atributo(g, nombre, datos, n) { g.setAttribute(nombre, new THREE.BufferAttribute(datos, n)); }
    // Los colores se eligieron en sRGB; la escena trabaja en lineal.
    function aLineal(datos) { var o = new Float32Array(datos.length); for (var i = 0; i < datos.length; i++) o[i] = Math.pow(Math.max(0, datos[i]), 2.2); return o; }

    // Fondo del cartel
    var gf = new THREE.BufferGeometry();
    atributo(gf, "position", new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3);
    this.matFondo = material(G.VS_FONDO, G.FS_FONDO, {
      uCentro: { value: new THREE.Vector2(0.5, 0.6) }, uAspecto: { value: 1 }, uRadio: { value: 0.2 }, uTiempo: tiempo, uOpacidad: { value: 1 },
      uParalaje: { value: new THREE.Vector2(0, 0) }, uPx: { value: 0.001 }
    }, false);
    poner(new THREE.Mesh(gf, this.matFondo), 0);

    // Cielo (fondo de la carta y de la cúpula)
    var via = M.texturaViaLactea(movil ? 512 : 768, movil ? 128 : 192), texVia = null;
    if (via) {
      texVia = new THREE.CanvasTexture(via.lienzo);
      texVia.colorSpace = THREE.SRGBColorSpace;
      texVia.wrapS = 1000; // RepeatWrapping: la longitud galáctica da la vuelta completa
      texVia.minFilter = 1006; // LinearFilter, sin mipmaps: evita la costura donde la longitud salta de 180° a −180°
      texVia.generateMipmaps = false;
    }
    this.viaMaximo = via ? via.maximo : 0;
    this.matCielo = material(G.VS_FIJO, G.FS_CIELO, {
      uSol: { value: new THREE.Vector3(0, 0, -1) }, uCrepusculo: { value: 0 }, uOpacidad: { value: 1 },
      uGal: { value: new Float32Array(M.GALACTICA) }, uViaMapa: { value: texVia }, uVia: { value: 0 }, uViaHalo: { value: 0 }
    }, false, true);
    poner(new THREE.Mesh(geometriaCupula(-4, 34, 120), this.matCielo), 1);

    // Vía Láctea
    var vl = M.generarViaLactea(movil ? 17000 : 30000, 0, C.azar(1906));
    var gv = new THREE.BufferGeometry();
    atributo(gv, "position", vl.posiciones, 3);
    atributo(gv, "aTam", vl.tamanos, 1);
    atributo(gv, "aColor", aLineal(vl.colores), 3);
    atributo(gv, "aAlfa", vl.alfas, 1);
    this.matVia = material(G.VS_VIA, G.FS_VIA, { uPxRad: { value: 600 }, uRadioPx: { value: 300 }, uBrillo: { value: 0 }, uMaxPx: { value: 64 }, uDifuso: { value: 1 } }, true);
    poner(new THREE.Points(gv, this.matVia), 2);

    // Eclíptica, líneas de las constelaciones y el arco de los enamorados
    this.matEcliptica = material(G.VS_LINEAS, G.FS_LINEAS, uniformesLinea([0.86, 0.74, 0.46], 0.16, 0.9, 120), true);
    poner(new THREE.Mesh(M.geometriaLineas([M.polilineaEcliptica()]), this.matEcliptica), 3);
    this.matLineas = material(G.VS_LINEAS, G.FS_LINEAS, uniformesLinea([0.68, 0.78, 1], 0.42, 1.1, 0), true);
    poner(new THREE.Mesh(M.geometriaLineas(M.polilineasConstelaciones()), this.matLineas), 4);
    this.matArco = material(G.VS_LINEAS, G.FS_LINEAS, uniformesLinea([1, 0.55, 0.7], 0, 1.5, 40), true);
    this.arco = null;

    // Estrellas
    var E = M.prepararEstrellas();
    var ge = new THREE.BufferGeometry();
    atributo(ge, "position", E.posiciones, 3);
    atributo(ge, "aMag", E.magnitudes, 1);
    atributo(ge, "aColor", aLineal(E.colores), 3);
    atributo(ge, "aAzar", E.azar, 1);
    this.matEstrellas = material(G.VS_ESTRELLAS, G.FS_ESTRELLAS, {
      uTiempo: tiempo, uTam: { value: 3 }, uMagLimite: { value: 6.5 }, uEnsamble: { value: 1 }, uOpacidad: { value: 1 }, uTitileo: { value: this.reducido ? 0 : 1 }
    }, true);
    poner(new THREE.Points(ge, this.matEstrellas), 6);

    // Planetas y Luna
    this.planetas = M.CUERPOS.filter(function (c) { return c.id !== "Moon"; });
    var np = this.planetas.length, gp = new THREE.BufferGeometry(), colores = new Float32Array(np * 3);
    this.planetas.forEach(function (c, i) { colores[i * 3] = c.color[0]; colores[i * 3 + 1] = c.color[1]; colores[i * 3 + 2] = c.color[2]; });
    this.posPlanetas = new THREE.BufferAttribute(new Float32Array(np * 3), 3);
    this.magPlanetas = new THREE.BufferAttribute(new Float32Array(np), 1);
    this.posPlanetas.setUsage(THREE.DynamicDrawUsage);
    this.magPlanetas.setUsage(THREE.DynamicDrawUsage);
    gp.setAttribute("position", this.posPlanetas);
    gp.setAttribute("aMag", this.magPlanetas);
    atributo(gp, "aColor", aLineal(colores), 3);
    this.matPlanetas = material(G.VS_CUERPOS, G.FS_CUERPOS, { uTam: { value: 3 }, uOpacidad: { value: 1 }, uMagLimite: { value: 6.5 } }, true);
    poner(new THREE.Points(gp, this.matPlanetas), 7);
    var gl = new THREE.BufferGeometry();
    atributo(gl, "position", new Float32Array(3), 3);
    this.matLuna = material(G.VS_LUNA, G.FS_LUNA, {
      uLuna: { value: new THREE.Vector3(1, 0, 0) }, uSolEq: { value: new THREE.Vector3(0, 1, 0) }, uPantalla: pantalla,
      uTam: { value: 24 }, uOpacidad: { value: 1 }, uFase: { value: 2 }
    }, false);
    poner(new THREE.Points(gl, this.matLuna), 8);

    // Horizonte: silueta del paisaje y luces de la ciudad (solo dentro de la cúpula)
    this.perfil = M.perfilHorizonte(this.m, C.azar(1890));
    this.matSuelo = material(G.VS_FIJO, G.FS_SUELO, { uOpacidad: { value: 0 }, uCrepusculo: this.matCielo.uniforms.uCrepusculo }, false, true);
    poner(new THREE.Mesh(geometriaSuelo(this.perfil), this.matSuelo), 9);
    this.matLuces = material(G.VS_LUCES, G.FS_LUCES, { uTiempo: tiempo, uPx: { value: 1 }, uOpacidad: { value: 0 } }, true);
    poner(new THREE.Points(geometriaLuces(this.perfil, C.azar(618), movil ? 160 : 240), this.matLuces), 10);
    this.matCiudad = material(G.VS_CIUDAD, G.FS_CIUDAD, { uTiempo: tiempo, uPx: { value: 1 }, uZoom: { value: 1 }, uOpacidad: { value: 0 }, uAltura: { value: 0.16 } }, true);
    poner(new THREE.Points(geometriaCiudad(C.azar(1563), movil), this.matCiudad), 10);

    // Aro de astrolabio
    var tam = movil ? 1536 : 2048, lienzoAro = document.createElement("canvas");
    lienzoAro.width = lienzoAro.height = tam;
    M.dibujarAro(lienzoAro.getContext("2d"), tam);
    var tex = new THREE.CanvasTexture(lienzoAro);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);
    this.texAro = tex;
    if (document.fonts && document.fonts.load) {
      Promise.all([
        document.fonts.load('600 64px "Cormorant Garamond"'), document.fonts.load('400 32px "Jost"'), document.fonts.load('300 32px "Jost"')
      ]).then(function () { M.dibujarAro(lienzoAro.getContext("2d"), tam); tex.needsUpdate = true; }, function () {});
    }
    this.matAro = new THREE.ShaderMaterial({
      vertexShader: G.VS_ARO, fragmentShader: G.FS_ARO, transparent: true, depthTest: false, depthWrite: false,
      uniforms: { uMapa: { value: tex }, uOpacidad: { value: 1 }, uRevelado: { value: 1.05 }, uTiempo: tiempo }
    });
    this.aro = poner(new THREE.Mesh(new THREE.RingGeometry(0, ESCALA_ARO, 180, 1), this.matAro), 11);

    // Resplandor
    this.compositor = new THREE.EffectComposer(renderer);
    this.compositor.addPass(new THREE.RenderPass(escena, this.camara));
    this.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.45, 0.34);
    this.compositor.addPass(this.bloom);
    this.compositor.addPass(new THREE.OutputPass());
    this.conResplandor = true;
  };

  P.ponerArco = function (o) {
    if (this.arco) { this.escena.remove(this.arco); this.arco.geometry.dispose(); this.arco = null; }
    if (!o || o.objetos.length < 2 || !o.objetos[0].fijo || !o.objetos[1].fijo) return;
    var g = M.geometriaLineas([M.polilineaArco(o.objetos[0].dir, o.objetos[1].dir)]);
    this.arco = new THREE.Mesh(g, this.matArco);
    this.arco.frustumCulled = false;
    this.arco.renderOrder = 5;
    this.escena.add(this.arco);
    this.arcoT0 = performance.now();
  };

  /* ----- Etiquetas sobre el cielo ----- */

  P.prepararEtiquetas = function () {
    var self = this, D = window.CIELO_MAPA_DATOS;
    this.etiquetas = [];
    var objetivos = {};
    this.destacados.forEach(function (o) { o.objetos.forEach(function (x) { if (x.nombre) objetivos[sinAcentos(x.nombre)] = true; }); });
    function crear(clase, texto, dir, op) {
      var el = nodo("span", "mapa__etiqueta " + clase, texto);
      el.hidden = true;
      self.capa.appendChild(el);
      var e = { el: el, clave: sinAcentos(texto), dir: dir, fijo: !!op.fijo, cuerpo: op.cuerpo || null, centrada: !!op.centrada, minAlt: op.minAlt != null ? op.minAlt : 0.5, mag: op.mag, visible: false };
      self.etiquetas.push(e);
      return e;
    }
    for (var i = 0; i < 8; i++) {
      var az = i * 45;
      crear("mapa__etiqueta--cardinal" + (i % 2 ? " menor" : ""), M.CARDINALES[i], M.horizonte(az, perfilEn(this.perfil, az) + 2.2, [0, 0, 0], 0), { fijo: true, centrada: true, minAlt: -5 });
    }
    D.constelaciones.forEach(function (c) {
      if (c[4] <= 2) crear("mapa__etiqueta--constelacion", c[1], M.direccion(c[2] / 100, c[3] / 100, [0, 0, 0], 0), { centrada: true, minAlt: 6 });
    });
    D.nombres.forEach(function (s) {
      if (s[3] <= 165 || objetivos[sinAcentos(s[0])]) crear("mapa__etiqueta--estrella", s[0], M.direccion(s[1] / 100, s[2] / 100, [0, 0, 0], 0), { minAlt: 1, mag: s[3] / 100 });
    });
    this.etiquetasCuerpos = {};
    M.CUERPOS.forEach(function (c) {
      self.etiquetasCuerpos[c.id] = crear("mapa__etiqueta--cuerpo", c.nombre, [1, 0, 0], { cuerpo: c.id, minAlt: 0.5 });
    });
    crear("mapa__etiqueta--centro", this.T.centroGalactico, M.direccion(M.CENTRO_GALACTICO[0], M.CENTRO_GALACTICO[1], [0, 0, 0], 0), { centrada: true, minAlt: 2 });
    // Tamaño aproximado de cada etiqueta (sin medir el DOM) y su prioridad cuando dos se encimarían
    this.etiquetas.forEach(function (e) {
      var c = e.el.className, n = e.el.textContent.length;
      if (/cardinal/.test(c)) { e.ancho = /menor/.test(c) ? 22 : 17; e.alto = /menor/.test(c) ? 15 : 24; e.prioridad = 0; }
      else if (/cuerpo/.test(c)) { e.ancho = n * 7.6; e.alto = 15; e.prioridad = 1; }
      else if (/estrella/.test(c)) { e.ancho = n * 7.2; e.alto = 15; e.prioridad = 2 + (e.mag || 0) / 10; }
      else if (/centro/.test(c)) { e.ancho = n * 9; e.alto = 13; e.prioridad = 3; }
      else { e.ancho = n * 9.4; e.alto = 13; e.prioridad = 4; }
    });
    this.ordenEtiquetas = this.etiquetas.slice().sort(function (a, b) { return a.prioridad - b.prioridad; });
    this.reticulas = [0, 1].map(function () {
      var r = nodo("span", "mapa__reticula");
      var t = nodo("span", "mapa__reticula-nombre");
      r.appendChild(t);
      r.hidden = true;
      self.capa.appendChild(r);
      return { el: r, texto: t };
    });
  };

  P.dirDe = function (obj) {
    if (obj.fijo) return obj.dir;
    var c = this.efe.cuerpo(obj.cuerpo, this.minutos, this.c5);
    obj.dir[0] = c[0]; obj.dir[1] = c[1]; obj.dir[2] = c[2];
    return obj.dir;
  };

  // Posición en pantalla (px CSS) de una dirección del horizonte; null si no se ve.
  P.proyectar = function (h, salida) {
    var v = M.colocar(h, this.mezcla, this.v).project(this.camara);
    if (v.z > 1 || v.z < -1 || Math.abs(v.x) > 1.15 || Math.abs(v.y) > 1.15) return null;
    salida.x = (v.x + 1) / 2 * this.ancho;
    salida.y = (1 - v.y) / 2 * this.alto;
    return salida;
  };

  P.actualizarEtiquetas = function () {
    var cupula = this.p > 0.86 && this.listo, pos = { x: 0, y: 0 }, magVisible = mezclar(6.4, 1.0, this.crepusculo || 0);
    // Lo que ya nombra la retícula del destacado no se repite como etiqueta
    var o = cupula ? this.destacados[this.seleccion] : null, ocultas = {}, T = this.T;
    if (o) o.objetos.forEach(function (x) { ocultas[sinAcentos(x.nombre || T.centroGalactico)] = true; });
    var cajas = [];
    for (var i = 0; i < this.ordenEtiquetas.length; i++) {
      var e = this.ordenEtiquetas[i], ver = false;
      if (cupula && !ocultas[e.clave]) {
        var h = e.fijo ? e.dir : M.alHorizonte(this.rot, e.dir, this.h);
        var alt = M.altura(h);
        if (alt >= e.minAlt && (e.mag == null || e.mag < magVisible + 0.3) && (!e.cuerpo || this.cuerpoVisible(e.cuerpo, alt)) && this.proyectar(h, pos)) {
          var x0 = e.centrada ? pos.x - e.ancho / 2 : pos.x + 9, y0 = pos.y - e.alto / 2, libre = true;
          for (var k = 0; k < cajas.length; k++) {
            var c = cajas[k];
            if (x0 < c[2] && x0 + e.ancho > c[0] && y0 < c[3] && y0 + e.alto > c[1]) { libre = false; break; }
          }
          if (libre) {
            ver = true;
            cajas.push([x0 - 4, y0 - 2, x0 + e.ancho + 4, y0 + e.alto + 2]);
            e.el.style.transform = "translate3d(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px,0)" + (e.centrada ? " translate(-50%,-50%)" : " translate(9px,-50%)");
          }
        }
      }
      if (ver !== e.visible) { e.visible = ver; e.el.hidden = !ver; }
    }
    this.actualizarReticulas();
    this.actualizarToque();
  };
  P.cuerpoVisible = function (id, alt) {
    if (alt < 0.3) return false;
    var c = this.efe.cuerpo(id, this.minutos, this.c5);
    return c[3] < mezclar(6.4, 1.6, this.crepusculo || 0);
  };
  P.actualizarReticulas = function () {
    var o = this.listo && this.p < 0.4 || this.p > 0.86 ? this.destacados[this.seleccion] : null;
    var puntos = [], self = this;
    if (o) {
      o.objetos.forEach(function (obj) {
        var h = M.alHorizonte(self.rot, self.dirDe(obj), self.h2);
        if (M.altura(h) < -0.5) return;
        var p = self.proyectar(h, { x: 0, y: 0 });
        if (p) puntos.push({ x: p.x, y: p.y, nombre: obj.nombre || self.T.centroGalactico });
      });
      if (puntos.length === 2 && Math.hypot(puntos[0].x - puntos[1].x, puntos[0].y - puntos[1].y) < 46) {
        puntos = [{ x: (puntos[0].x + puntos[1].x) / 2, y: (puntos[0].y + puntos[1].y) / 2, nombre: puntos[0].nombre + " y " + puntos[1].nombre, grande: true }];
      }
    }
    for (var i = 0; i < this.reticulas.length; i++) {
      var r = this.reticulas[i], p = puntos[i];
      if (!p) { if (!r.el.hidden) r.el.hidden = true; continue; }
      if (r.el.hidden) r.el.hidden = false;
      if (r.texto.textContent !== p.nombre) r.texto.textContent = p.nombre;
      r.el.classList.toggle("grande", !!p.grande);
      r.el.classList.toggle("izquierda", p.x > this.ancho * 0.58);
      r.el.style.setProperty("--tono", o.tono);
      r.el.style.transform = "translate3d(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px,0)";
    }
  };

  /* ----- Tocar el cielo: qué constelación o estrella es ----- */

  P.direccionEn = function (x, y) {
    this.ndc.set(x / this.ancho * 2 - 1, -(y / this.alto) * 2 + 1);
    this.rayo.setFromCamera(this.ndc, this.camara);
    var o = this.rayo.ray.origin, d = this.rayo.ray.direction;
    if (this.mezcla < 0.5) return [d.y, d.x, -d.z];
    if (Math.abs(d.z) < 1e-5) return null;
    var t = -o.z / d.z, X = o.x + t * d.x, Y = o.y + t * d.y, r2 = X * X + Y * Y;
    if (r2 > 1.0) return null;
    return [2 * Y / (1 + r2), 2 * X / (1 + r2), (1 - r2) / (1 + r2)];
  };
  P.identificar = function (x, y) {
    var h = this.direccionEn(x, y);
    if (!h) return;
    var D = window.CIELO_MAPA_DATOS, self = this, mejor = null, dmin = (this.mezcla < 0.5 ? 30 : 22), pos = { x: 0, y: 0 };
    function probar(nombre, sub, dir, grupo) {
      var hh = M.alHorizonte(self.rot, dir, [0, 0, 0]);
      if (M.altura(hh) < 0) return;
      var p = self.proyectar(hh, pos);
      if (!p) return;
      var d = Math.hypot(p.x - x, p.y - y);
      if (d < dmin) { dmin = d; mejor = { nombre: nombre, sub: sub, dir: dir.slice ? dir.slice(0, 3) : [dir[0], dir[1], dir[2]], grupo: grupo }; }
    }
    D.nombres.forEach(function (s) {
      var k = constelacionPorSigla(s[4]);
      probar(s[0], k >= 0 ? D.constelaciones[k][1] : "", M.direccion(s[1] / 100, s[2] / 100, [0, 0, 0], 0), k);
    });
    M.CUERPOS.forEach(function (c) {
      var v = self.efe.cuerpo(c.id, self.minutos, self.c5);
      if (v[3] < mezclar(6.4, 1.6, self.crepusculo || 0)) probar(c.nombre, c.id === "Moon" ? "" : self.T.planeta, [v[0], v[1], v[2]], -1);
    });
    var eq = M.alEcuador(this.rot, h, [0, 0, 0]);
    var ra = Math.atan2(eq[1], eq[0]) / GRADO, dec = Math.asin(limitar(eq[2], -1, 1)) / GRADO;
    var cst = null;
    try { cst = window.Astronomy.Constellation(((ra + 360) % 360) / 15, dec); } catch (e) { cst = null; }
    var k = cst ? constelacionPorSigla(cst.symbol) : -1;
    if (!mejor && k < 0) return;
    if (!mejor) mejor = { nombre: D.constelaciones[k][1], sub: this.T.constelacion, dir: eq, grupo: k, region: true };
    this.toqueActual = { dir: mejor.dir, x: x, y: y, region: !!mejor.region, hasta: performance.now() + 3200 };
    this.toqueTitulo.textContent = mejor.nombre;
    this.toqueSub.textContent = mejor.sub || "";
    this.toque.classList.remove("visible");
    void this.toque.offsetWidth;
    this.toque.classList.add("visible");
    var grupo = mejor.grupo >= 0 ? mejor.grupo : k;
    if (grupo >= 0) {
      this.resalte.temporal = { a: grupo, b: -9 };
      this.resalte.hasta = performance.now() + 3200;
    }
    this.sonar("campanilla", 4);
  };
  P.actualizarToque = function () {
    var t = this.toqueActual;
    if (!t) return;
    if (performance.now() > t.hasta) {
      this.toque.classList.remove("visible");
      this.toqueActual = null;
      return;
    }
    var p = t.region ? { x: t.x, y: t.y } : this.proyectar(M.alHorizonte(this.rot, t.dir, this.h2), { x: 0, y: 0 });
    if (!p) return;
    this.toque.style.transform = "translate3d(" + p.x.toFixed(1) + "px," + p.y.toFixed(1) + "px,0)";
  };

  /* ----- Hora, reproducción y eventos de la noche ----- */

  P.fijarMinutos = function (m, desdeBarra, anunciar) {
    var efe = this.efe;
    m = limitar(m, efe.inicio, efe.fin);
    var antes = this.minutos;
    this.minutos = m;
    if (!desdeBarra) this.barra.value = String(Math.round(m));
    var texto = M.reloj(m);
    if (this.reloj.textContent !== texto) {
      this.reloj.textContent = texto;
      this.barra.setAttribute("aria-valuetext", texto);
    }
    var lejos = this.listo && Math.abs(m - efe.hora) > 2 && !this.reproduciendo;
    if (this.botonHora.hidden === lejos) this.botonHora.hidden = !lejos;
    if (anunciar && this.eventos) {
      var a = Math.min(antes, m), b = Math.max(antes, m), self = this;
      this.eventos.forEach(function (ev) { if (ev.minutos > a && ev.minutos <= b && b - a < 90) self.avisar(M.reloj(ev.minutos) + "  ·  " + self.textoEvento(ev)); });
    }
  };
  P.textoEvento = function (ev) {
    if (ev.tipo === "anochece") return this.T.anochece;
    if (ev.tipo === "amanece") return this.T.amanece;
    return formatear(ev.tipo === "sale" ? this.T.sale : this.T.sePone, { cuerpo: ev.cuerpo.articulo });
  };
  P.calcularEventos = function () {
    if (this.eventos) return;
    var self = this, efe = this.efe;
    this.eventos = efe.eventos();
    this.eventos.forEach(function (ev) {
      var mk = nodo("span", "mapa__marca mapa__marca--" + ev.tipo);
      mk.style.setProperty("--x", ((ev.minutos - efe.inicio) / (efe.fin - efe.inicio)).toFixed(4));
      mk.title = M.reloj(ev.minutos) + " · " + self.textoEvento(ev);
      self.marcas.appendChild(mk);
    });
  };
  P.avisar = function (texto) {
    var a = this.aviso, self = this;
    a.textContent = texto;
    a.classList.remove("visible");
    void a.offsetWidth;
    a.classList.add("visible");
    clearTimeout(this.tAviso);
    this.tAviso = setTimeout(function () { self.aviso.classList.remove("visible"); }, 2800);
  };
  P.alternarReproduccion = function (forzar) {
    var si = forzar != null ? !!forzar : !this.reproduciendo, efe = this.efe;
    if (si && this.minutos >= efe.fin - 1) this.fijarMinutos(efe.inicio);
    this.animHora = null;
    this.reproduciendo = si;
    this.velocidad = (efe.fin - efe.inicio) / 15;
    this.botonReproducir.classList.toggle("activo", si);
    this.botonReproducir.setAttribute("aria-pressed", si ? "true" : "false");
    this.textoReproducir.textContent = si ? this.T.pausar : this.T.reproducir;
    if (!si) this.fijarMinutos(this.minutos);
  };
  P.animarMinutos = function (destino) {
    this.alternarReproduccion(false);
    this.animHora = { desde: this.minutos, hacia: destino, t0: performance.now(), dur: this.reducido ? 1 : 1400 };
  };

  /* ----- Destacados ----- */

  P.seleccionar = function (i, conSonido) {
    var o = this.destacados[i] || null;
    this.seleccion = o ? i : -1;
    this.botonesDestacados.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i && o ? "true" : "false"); });
    this.resalte.a = o && o.grupos.length ? o.grupos[0] : -9;
    this.resalte.b = o && o.grupos.length > 1 ? o.grupos[1] : -9;
    this.resalte.objetivo = o && o.grupos.length ? 1 : 0;
    this.ponerArco(o && o.tipo === "pareja" ? o : null);
    this.mostrarDetalle();
    if (o && this.modo === "cupula") this.mirarHacia(o);
    if (conSonido) this.sonar("campanilla", o ? 2 + i : 1);
  };
  P.mirarHacia = function (o) {
    if (!o || !o.objetos.length) return;
    var h = M.alHorizonte(this.rot, this.dirDe(o.objetos[0]), this.h2), alt = M.altura(h);
    if (alt < -2) return;
    var az = M.azimut(h), m = this.mirada, dif = ((az - m.az + 540) % 360) - 180;
    m.giro = { desdeAz: m.az, hastaAz: m.az + dif, desdeAlt: m.alt, hastaAlt: limitar(alt - 11, 10, 70), t0: performance.now(), dur: this.reducido ? 1 : 1500 };
    m.vaz = m.valt = 0;
  };

  /* ----- Carta ↔ cúpula ----- */

  P.irA = function (modo) {
    if (!this.listo || modo === this.modo) return;
    this.modo = modo;
    var entrar = modo === "cupula";
    if (entrar) {
      var o = this.destacados[this.seleccion], m = this.mirada;
      m.az = 180; m.alt = 24; m.vaz = m.valt = 0; m.giro = null;
      m.fov = this.ancho / this.alto < 0.8 ? 78 : 64;
      if (o && o.objetos.length) {
        var h = M.alHorizonte(this.rot, this.dirDe(o.objetos[0]), this.h2);
        if (M.altura(h) > -2) { m.az = M.azimut(h); m.alt = limitar(M.altura(h) - 11, 10, 60); }
      }
    }
    this.transicion = { desde: this.p, hacia: entrar ? 1 : 0, t0: performance.now(), dur: this.reducido ? 1 : 2600 };
    this.raiz.classList.toggle("en-cupula", entrar);
    this.cartel.setAttribute("aria-hidden", entrar ? "true" : "false");
    if ("inert" in this.cartel) this.cartel.inert = entrar;
    this.textoVolver.textContent = entrar ? this.T.verMapa : this.T.volver;
    this.botonVolver.querySelector(".icono").innerHTML = entrar ? M.SVG.carta : M.SVG.volver;
    this.pista.classList.remove("usada");
    this.sonar("campanilla", entrar ? 6 : 3);
    if (entrar) this.botonVolver.focus({ preventScroll: true });
    else if (document.activeElement === this.botonVolver || !this.raiz.contains(document.activeElement)) {
      var self = this;
      this.botonVista.focus({ preventScroll: true });
      // Por si el cartel todavía no era visible en ese instante
      if (document.activeElement !== this.botonVista) {
        setTimeout(function () { if (self.modo === "carta" && self.activo) self.botonVista.focus({ preventScroll: true }); }, 350);
      }
    }
  };
  P.atras = function () {
    if (this.modo === "cupula") { this.irA("carta"); return true; }
    return false;
  };

  /* ----- Gestos ----- */

  P.conectar = function () {
    var self = this;
    this.botonVolver.addEventListener("click", function () {
      if (self.modo === "cupula") self.irA("carta");
      else if (self.op.alCerrar) self.op.alCerrar();
    });
    this.botonVista.addEventListener("click", function () {
      self.botonVista.classList.add("usado");
      self.irA(self.modo === "carta" ? "cupula" : "carta");
    });
    this.botonReproducir.addEventListener("click", function () { self.alternarReproduccion(); });
    this.botonHora.addEventListener("click", function () { self.animarMinutos(self.efe.hora); });
    this.barra.addEventListener("input", function () {
      if (self.reproduciendo) self.alternarReproduccion(false);
      self.animHora = null;
      self.fijarMinutos(Number(self.barra.value), true, true);
    });
    this.barra.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      var paso = e.shiftKey ? 60 : 10, signo = e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 1;
      if (self.reproduciendo) self.alternarReproduccion(false);
      self.fijarMinutos(self.minutos + signo * paso, false, true);
    });
    var activos = {}, cuenta = 0, inicio = null, pinza = null;
    function enCupula() { return self.modo === "cupula" && self.p > 0.7; }
    function abajo(e) {
      if (!self.listo || (e.button != null && e.button > 0)) return;
      if (e.target.closest && e.target.closest("button, input")) return;
      if (e.currentTarget === self.lienzo && !enCupula()) return;
      activos[e.pointerId] = { x: e.clientX, y: e.clientY };
      cuenta++;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      if (cuenta === 1) {
        inicio = { x: e.clientX, y: e.clientY, t: performance.now(), movido: false, ux: e.clientX, uy: e.clientY, ut: performance.now() };
        self.inclina.arrastre = !enCupula();
        self.mirada.giro = null;
        self.mirada.vaz = self.mirada.valt = 0;
      } else if (cuenta === 2) {
        var ids = Object.keys(activos), a = activos[ids[0]], b = activos[ids[1]];
        pinza = { d: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), fov: self.mirada.fov };
        if (inicio) inicio.movido = true;
      }
    }
    function mover(e) {
      var a = activos[e.pointerId];
      if (!a) {
        if (e.pointerType === "mouse" && !enCupula() && e.currentTarget === self.hueco) {
          var r = self.hueco.getBoundingClientRect();
          self.inclina.hoverX = limitar((e.clientY - (r.top + r.height / 2)) / r.height, -0.5, 0.5);
          self.inclina.hoverY = limitar((e.clientX - (r.left + r.width / 2)) / r.width, -0.5, 0.5);
        }
        return;
      }
      var dx = e.clientX - a.x, dy = e.clientY - a.y;
      a.x = e.clientX;
      a.y = e.clientY;
      if (cuenta >= 2 && pinza) {
        var ids = Object.keys(activos), p1 = activos[ids[0]], p2 = activos[ids[1]];
        if (enCupula()) self.mirada.fov = limitar(pinza.fov * pinza.d / Math.max(20, Math.hypot(p1.x - p2.x, p1.y - p2.y)), 26, 100);
        return;
      }
      if (!inicio) return;
      if (Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y) > 7) inicio.movido = true;
      var ahora = performance.now(), dtp = Math.max(1, ahora - inicio.ut);
      if (enCupula()) {
        var k = self.mirada.fov / self.alto;
        self.mirada.az -= dx * k;
        self.mirada.alt = limitar(self.mirada.alt + dy * k, -12, 86);
        self.mirada.vaz = -dx * k / dtp * 1000;
        self.mirada.valt = dy * k / dtp * 1000;
        if (inicio.movido) self.pista.classList.add("usada");
      } else {
        self.inclina.x = limitar(self.inclina.x - dy * 0.22, -28, 28);
        self.inclina.y = limitar(self.inclina.y - dx * 0.22, -28, 28);
      }
      inicio.ut = ahora;
    }
    function arriba(e) {
      if (!activos[e.pointerId]) return;
      delete activos[e.pointerId];
      cuenta = Math.max(0, cuenta - 1);
      if (cuenta < 2) pinza = null;
      if (cuenta === 0) {
        if (inicio && !inicio.movido && performance.now() - inicio.t < 500 && e.type === "pointerup") self.identificar(e.clientX, e.clientY);
        if (inicio && performance.now() - inicio.ut > 80) { self.mirada.vaz = self.mirada.valt = 0; }
        inicio = null;
        self.inclina.arrastre = false;
      }
    }
    [this.hueco, this.lienzo].forEach(function (el) {
      el.addEventListener("pointerdown", abajo);
      el.addEventListener("pointermove", mover);
      el.addEventListener("pointerup", arriba);
      el.addEventListener("pointercancel", arriba);
    });
    this.hueco.addEventListener("pointerleave", function () { self.inclina.hoverX = self.inclina.hoverY = 0; });
    this.lienzo.addEventListener("wheel", function (e) {
      if (!enCupula()) return;
      e.preventDefault();
      self.mirada.fov = limitar(self.mirada.fov * Math.exp(e.deltaY * 0.0012), 26, 100);
    }, { passive: false });
    this.raiz.addEventListener("keydown", function (e) {
      if (!enCupula() || e.target === self.barra) return;
      var m = self.mirada, hecho = true;
      m.giro = null;
      if (e.key === "ArrowLeft") m.az -= 8;
      else if (e.key === "ArrowRight") m.az += 8;
      else if (e.key === "ArrowUp") m.alt = limitar(m.alt + 5, -12, 86);
      else if (e.key === "ArrowDown") m.alt = limitar(m.alt - 5, -12, 86);
      else if (e.key === "+" || e.key === "=") m.fov = limitar(m.fov * 0.86, 26, 100);
      else if (e.key === "-" || e.key === "_") m.fov = limitar(m.fov / 0.86, 26, 100);
      else hecho = false;
      if (hecho) { e.preventDefault(); self.pista.classList.add("usada"); }
    });
  };

  P.sonar = function (tipo, n) {
    var s = this.op.sonido;
    if (s && typeof s[tipo] === "function") { try { s[tipo](n); } catch (e) { /* sin sonido */ } }
  };

  /* ----- Abrir, cerrar y tamaño ----- */

  P.abrir = function () {
    var self = this, efe = this.efe;
    clearTimeout(this.tCerrar);
    this.activo = true;
    this.raiz.hidden = false;
    this.dimensionar();
    this.modo = "carta";
    this.p = 0;
    this.transicion = null;
    this.reproduciendo = false;
    this.animHora = null;
    this.alternarReproduccion(false);
    this.inclina.x = this.inclina.y = this.inclina.hoverX = this.inclina.hoverY = 0;
    this.raiz.classList.remove("en-cupula", "paso-1", "paso-2", "paso-3", "paso-4", "listo");
    this.cartel.setAttribute("aria-hidden", "false");
    if ("inert" in this.cartel) this.cartel.inert = false;
    this.textoVolver.textContent = this.T.volver;
    this.botonVolver.querySelector(".icono").innerHTML = M.SVG.volver;
    this.seleccionar(-1);
    this.toqueActual = null;
    this.toque.classList.remove("visible");
    this.listo = false;
    this.cartel.scrollTop = 0;
    if (this.reducido) {
      this.terminarIntro();
    } else {
      this.intro = { t0: performance.now(), desde: Math.max(efe.inicio, efe.hora - 90), pasos: 0, sonado: 0 };
      this.estadoIntro = { ensamble: 0, trazo: 0, via: 0, mezcla: 0, tilt: 56, giro: -38, lejos: 1.35, aro: 0 };
      this.fijarMinutos(this.intro.desde);
    }
    requestAnimationFrame(function () { self.raiz.classList.add("visible"); });
    this.raiz.focus({ preventScroll: true });
    if (!this.eventos) setTimeout(function () { self.calcularEventos(); }, 1600);
  };
  P.terminarIntro = function () {
    this.intro = null;
    this.estadoIntro = this.introFinal();
    this.listo = true;
    this.raiz.classList.add("paso-1", "paso-2", "paso-3", "paso-4", "listo");
    this.fijarMinutos(this.efe.hora);
    this.calculados = NaN;
    this.actualizarCielo();
    this.describir();
  };
  P.cerrar = function () {
    var self = this;
    this.raiz.classList.remove("visible");
    this.alternarReproduccion(false);
    this.intro = null;
    clearTimeout(this.tCerrar);
    this.tCerrar = setTimeout(function () {
      if (self.raiz.classList.contains("visible")) return;
      self.raiz.hidden = true;
      self.activo = false;
    }, 800);
  };
  P.estaActivo = function () { return this.activo; };

  P.dimensionar = function () {
    var W = window.innerWidth, H = window.innerHeight;
    this.ancho = W;
    this.alto = H;
    if (this.dpr == null) this.dpr = Math.min(window.devicePixelRatio || 1, this.movil ? 1.75 : 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(W, H, false);
    this.compositor.setPixelRatio(this.dpr);
    this.compositor.setSize(W, H);
    this.u.pantalla.value.set(W * this.dpr, H * this.dpr);
    this.matFondo.uniforms.uAspecto.value = W / Math.max(1, H);
    this.matFondo.uniforms.uPx.value = 1 / Math.max(1, H * this.dpr);
  };
  P.medir = function (dt) {
    this.promedio = this.promedio * 0.95 + dt * 1000 * 0.05;
    if (this.promedio > 30) this.lentos++;
    else this.lentos = Math.max(0, this.lentos - 1);
    if (this.lentos > 80) {
      this.lentos = 0;
      this.promedio = 16;
      if (this.dpr > 1.05) {
        this.dpr = Math.max(1, this.dpr - 0.3);
        this.dimensionar();
      } else if (this.conResplandor) {
        this.conResplandor = false;
        this.bloom.enabled = false;
      }
    }
  };

  /* ----- Cada cuadro ----- */

  P.pasoIntro = function (ahora) {
    var I = this.intro, t = (ahora - I.t0) / 1000, E = this.estadoIntro;
    E.ensamble = tramo(t, 0.2, 3.1);
    E.via = tramo(t, 1.2, 3.8);
    E.trazo = tramo(t, 2.3, 4.7);
    E.mezcla = suave(tramo(t, 3.4, 5.4));
    E.tilt = 56 * (1 - suave(tramo(t, 3.2, 5.5)));
    E.giro = -38 * (1 - suave(tramo(t, 0, 5.7)));
    E.lejos = 1 + 0.35 * (1 - suave(tramo(t, 0, 5.5)));
    E.aro = tramo(t, 4.3, 5.9) * 1.05;
    this.fijarMinutos(mezclar(I.desde, this.efe.hora, C.salida(tramo(t, 0.5, 4.0))));
    var pasos = [0.6, 4.5, 5.0, 5.5];
    while (I.pasos < pasos.length && t >= pasos[I.pasos]) {
      I.pasos++;
      this.raiz.classList.add("paso-" + I.pasos);
    }
    if (I.sonado === 0 && t > 0.3) { I.sonado = 1; this.sonar("campanilla", 5); }
    if (I.sonado === 1 && t > 5.7) { I.sonado = 2; this.sonar("campanilla", 8); }
    if (t >= 6.1) this.terminarIntro();
  };

  P.actualizarCielo = function () {
    if (this.minutos === this.calculados) return;
    this.calculados = this.minutos;
    var efe = this.efe, min = this.minutos, c = this.c5, self = this;
    efe.rotacion(min, this.rot);
    efe.cuerpo("Sun", min, c);
    var sol = [c[0], c[1], c[2]], hs = M.alHorizonte(this.rot, sol, this.h2);
    this.matCielo.uniforms.uSol.value.set(hs[0], hs[1], hs[2]);
    this.matLuna.uniforms.uSolEq.value.set(sol[0], sol[1], sol[2]);
    this.crepusculo = C.pasoSuave(-18, -4, M.altura(hs));
    this.matCielo.uniforms.uCrepusculo.value = this.crepusculo;
    var limite = mezclar(6.4, 1.1, this.crepusculo);
    this.matEstrellas.uniforms.uMagLimite.value = limite;
    this.matPlanetas.uniforms.uMagLimite.value = mezclar(6.4, 1.8, this.crepusculo);
    var pp = this.posPlanetas.array, mp = this.magPlanetas.array;
    this.planetas.forEach(function (pl, i) {
      efe.cuerpo(pl.id, min, c);
      pp[i * 3] = c[0]; pp[i * 3 + 1] = c[1]; pp[i * 3 + 2] = c[2];
      mp[i] = c[3];
      var e = self.etiquetasCuerpos[pl.id];
      e.dir[0] = c[0]; e.dir[1] = c[1]; e.dir[2] = c[2];
    });
    this.posPlanetas.needsUpdate = true;
    this.magPlanetas.needsUpdate = true;
    efe.cuerpo("Moon", min, c);
    this.matLuna.uniforms.uLuna.value.set(c[0], c[1], c[2]);
    this.matLuna.uniforms.uFase.value = c[4] * GRADO;
    var el = this.etiquetasCuerpos.Moon;
    el.dir[0] = c[0]; el.dir[1] = c[1]; el.dir[2] = c[2];
    this.actualizarPosicion();
  };

  P.colocarCamara = function () {
    var cam = this.camara, W = this.ancho, H = this.alto, r = this.hueco.getBoundingClientRect(), E = this.estadoIntro;
    if (r.width > 40) this.rectHueco = { w: r.width, x: r.left + r.width / 2, y: r.top + r.height / 2 };
    var rh = this.rectHueco || { w: Math.min(W, H) * 0.7, x: W / 2, y: H / 2 };
    var hd = rh.w, p = this.p;
    this.radioCss = hd / 2 / ESCALA_ARO;
    var pIn = suave(tramo(p, 0, 0.55)), pGiro = suave(tramo(p, 0.45, 1));
    var lx = mezclar(rh.x, W / 2, pIn), ly = mezclar(rh.y, H / 2, pIn);
    var uf = this.matFondo.uniforms;
    uf.uCentro.value.set(lx / W, 1 - ly / H);
    uf.uRadio.value = this.radioCss / Math.max(1, H);
    uf.uParalaje.value.set(this.inclina.y / 14, this.inclina.x / 14);
    var fov = mezclar(M.FOV_CARTA, this.mirada.fov, suave(tramo(p, 0.08, 0.85)));
    var Wf = 2 * Math.max(lx, W - lx), Hf = 2 * Math.max(ly, H - ly);
    var D = Hf * ESCALA_ARO / (hd * Math.tan(fov * GRADO / 2));
    var tx = (this.inclina.x + E.tilt) * GRADO, ty = this.inclina.y * GRADO, w = E.giro * GRADO;
    var px = Math.sin(ty) * Math.cos(tx), py = -Math.sin(tx), pz = Math.cos(ty) * Math.cos(tx);
    var cw = Math.cos(w), sw = Math.sin(w), qx = px * cw - py * sw, qy = px * sw + py * cw;
    cam.up.set(-sw, cw, 0);
    cam.position.set(qx * D, qy * D, pz * D);
    cam.lookAt(0, 0, 0);
    this.qCarta.copy(cam.quaternion);
    var m = this.mirada, az = m.az * GRADO, alt = limitar(m.alt, -14, 86) * GRADO;
    cam.position.set(0, 0, 0);
    cam.up.set(0, 0, -1);
    cam.lookAt(-Math.cos(alt) * Math.sin(az), Math.cos(alt) * Math.cos(az), -Math.sin(alt));
    this.qCupula.copy(cam.quaternion);
    cam.quaternion.slerpQuaternions(this.qCarta, this.qCupula, pGiro);
    var dist = D * E.lejos * (1 - pIn);
    this.distCamara = dist;
    this.altoVirtual = Hf;
    cam.position.set(qx * dist, qy * dist, pz * dist);
    cam.fov = fov;
    cam.aspect = Wf / Hf;
    cam.near = Math.max(0.004, dist - 2.6);
    cam.far = dist + 3;
    cam.setViewOffset(Wf, Hf, Wf / 2 - lx, Hf / 2 - ly, W, H);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    this.mezcla = this.intro ? E.mezcla : 1 - suave(tramo(p, 0, 0.6));
    this.fovActual = fov;
  };

  P.actualizarUniformes = function (dt) {
    var dpr = this.dpr, E = this.estadoIntro, mz = this.mezcla, p = this.p, ahora = performance.now();
    this.u.mezcla.value = mz;
    this.u.tiempo.value = this.tiempo;
    var radioPx = this.radioCss * dpr;
    var tamCarta = limitar(this.radioCss / 170, 0.8, 1.55) * 2.5 * dpr;
    var tamCupula = 3.1 * dpr * Math.sqrt(limitar(72 / this.fovActual, 0.7, 2.6));
    var ue = this.matEstrellas.uniforms;
    ue.uTam.value = mezclar(tamCupula, tamCarta, mz);
    ue.uEnsamble.value = E.ensamble * 1.15;
    this.matPlanetas.uniforms.uTam.value = ue.uTam.value * 1.15;
    this.matLuna.uniforms.uTam.value = mezclar(30, limitar(this.radioCss / 9, 14, 30), mz) * dpr * Math.sqrt(limitar(72 / this.fovActual, 0.7, 2.6));
    var pxRad = (this.altoVirtual || this.alto) * dpr / (2 * Math.tan(this.fovActual * GRADO / 2) * Math.max(1, this.distCamara || 0));
    var uv = this.matVia.uniforms;
    uv.uPxRad.value = pxRad;
    uv.uRadioPx.value = radioPx;
    uv.uMaxPx.value = (this.movil ? 40 : 56) * dpr;
    this.realceVia = C.amortiguar(this.realceVia, this.destacados[this.seleccion] && this.destacados[this.seleccion].tipo === "via-lactea" ? 1.55 : 1, 3, dt);
    uv.uBrillo.value = E.via * Math.pow(1 - (this.crepusculo || 0), 1.6) * mezclar(1.1, 1.6, mz) * this.realceVia;
    uv.uDifuso.value = mezclar(1, 1.9, mz);
    this.matCielo.uniforms.uVia.value = this.matCielo.uniforms.uViaMapa.value ? uv.uBrillo.value * mezclar(0.075, 0.095, mz) : 0;
    this.matCielo.uniforms.uViaHalo.value = uv.uBrillo.value * mezclar(0.006, 0.026, mz);
    // Resalte de constelaciones: el destacado elegido o la que se tocó
    var res = this.resalte, temporal = res.temporal && ahora < res.hasta ? res.temporal : null;
    if (!temporal) res.temporal = null;
    var ga = temporal ? temporal.a : res.a, gb = temporal ? temporal.b : res.b, obj = temporal ? 1 : res.objetivo;
    if (ga !== this.grupoMostrado || gb !== this.grupoMostradoB) {
      if (res.valor > 0.05 && this.grupoMostrado != null && this.grupoMostrado !== -9) obj = 0;
      else { this.grupoMostrado = ga; this.grupoMostradoB = gb; }
    }
    res.valor = C.amortiguar(res.valor, obj, 6, dt);
    var ul = this.matLineas.uniforms;
    ul.uGrupoA.value = this.grupoMostrado == null ? -9 : this.grupoMostrado;
    ul.uGrupoB.value = this.grupoMostradoB == null ? -9 : this.grupoMostradoB;
    ul.uResalte.value = res.valor;
    ul.uTrazo.value = E.trazo >= 1 ? 2 : E.trazo;
    ul.uAncho.value = mezclar(1.35, 1.05, mz) * dpr;
    ul.uOpacidad.value = mezclar(0.3, 0.27, mz);
    var uec = this.matEcliptica.uniforms;
    uec.uTrazo.value = ul.uTrazo.value;
    uec.uAncho.value = 0.9 * dpr;
    uec.uOpacidad.value = mezclar(0.12, 0.17, mz) * E.via;
    this.arcoVisible = C.amortiguar(this.arcoVisible, this.arco ? 1 : 0, 4, dt);
    var ua = this.matArco.uniforms;
    ua.uOpacidad.value = this.arcoVisible * 0.95;
    ua.uTrazo.value = this.arco ? tramo(ahora - (this.arcoT0 || 0), 0, this.reducido ? 1 : 1600) * 1.02 : 2;
    ua.uAncho.value = 1.6 * dpr;
    ua.uRayas.value = 46;
    var suelo = tramo(p, 0.5, 0.92);
    this.matSuelo.uniforms.uOpacidad.value = this.intro ? 0 : suelo;
    this.matLuces.uniforms.uOpacidad.value = this.intro ? 0 : suelo;
    this.matLuces.uniforms.uPx.value = dpr;
    var uc = this.matCiudad.uniforms;
    uc.uOpacidad.value = this.intro ? 0 : suelo;
    uc.uPx.value = dpr;
    uc.uZoom.value = Math.sqrt(limitar(72 / this.fovActual, 0.7, 2.6));
    var ua2 = this.matAro.uniforms;
    ua2.uOpacidad.value = Math.pow(mz, 3);
    ua2.uRevelado.value = E.aro;
    if (this.bloom) this.bloom.strength = mezclar(0.55, 0.7, mz);
  };

  P.cuadro = function (dt) {
    if (!this.activo) return;
    var ahora = performance.now();
    this.tiempo += this.reducido ? 0 : dt;
    this.medir(dt);
    if (window.innerWidth !== this.ancho || window.innerHeight !== this.alto) this.dimensionar();
    if (this.intro) this.pasoIntro(ahora);
    if (this.transicion) {
      var tr = this.transicion, k = tramo(ahora - tr.t0, 0, tr.dur);
      this.p = mezclar(tr.desde, tr.hacia, C.suave(k));
      if (k >= 1) this.transicion = null;
    }
    if (this.reproduciendo) {
      var m = this.minutos + dt * this.velocidad;
      if (m >= this.efe.fin) { this.fijarMinutos(this.efe.fin, false, true); this.alternarReproduccion(false); }
      else this.fijarMinutos(m, false, true);
    } else if (this.animHora) {
      var a = this.animHora, ka = tramo(ahora - a.t0, 0, a.dur);
      this.fijarMinutos(mezclar(a.desde, a.hacia, C.suave(ka)));
      if (ka >= 1) { this.animHora = null; this.fijarMinutos(a.hacia); }
    }
    // Inclinación de la carta: sigue al dedo y vuelve sola, con un vaivén leve
    var inc = this.inclina;
    if (!inc.arrastre) {
      var vaivenX = this.reducido ? 0 : 2.2 * Math.sin(this.tiempo * 0.31), vaivenY = this.reducido ? 0 : 2.8 * Math.sin(this.tiempo * 0.23 + 1.2);
      inc.x = C.amortiguar(inc.x, vaivenX + inc.hoverX * 12, 3.2, dt);
      inc.y = C.amortiguar(inc.y, vaivenY + inc.hoverY * 14, 3.2, dt);
    }
    // Mirada dentro de la cúpula: inercia o giro hacia un destacado
    var mi = this.mirada;
    if (mi.giro) {
      var g = mi.giro, kg = tramo(ahora - g.t0, 0, g.dur), e = C.suave(kg);
      mi.az = mezclar(g.desdeAz, g.hastaAz, e);
      mi.alt = mezclar(g.desdeAlt, g.hastaAlt, e);
      if (kg >= 1) mi.giro = null;
    } else if (Math.abs(mi.vaz) > 0.01 || Math.abs(mi.valt) > 0.01) {
      mi.az += mi.vaz * dt;
      mi.alt = limitar(mi.alt + mi.valt * dt, -12, 86);
      var f = Math.exp(-3.2 * dt);
      mi.vaz *= f;
      mi.valt *= f;
    }
    this.actualizarCielo();
    this.colocarCamara();
    this.actualizarUniformes(dt);
    this.actualizarEtiquetas();
    this.compositor.render();
  };

  /* ---------- Sin 3D: la misma carta en un lienzo 2D ---------- */

  function dibujarCartaPlana(lienzo, m, lado) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), S = Math.round(lado * dpr);
    lienzo.width = lienzo.height = S;
    lienzo.style.width = lienzo.style.height = lado + "px";
    var g = lienzo.getContext("2d"), c = S / 2, R = c / ESCALA_ARO, efe = new M.Efemerides(m), rot = efe.rotacion(efe.hora, new Float32Array(9));
    var h = [0, 0, 0];
    function plano(v) {
      M.alHorizonte(rot, v, h);
      if (h[2] < 0) return null;
      var k = 1 / (1 + h[2]);
      return [c + h[1] * k * R, c - h[0] * k * R];
    }
    var fondo = g.createRadialGradient(c, c, R * 0.1, c, c, R);
    fondo.addColorStop(0, "#03050f");
    fondo.addColorStop(1, "#0b1233");
    g.fillStyle = fondo;
    g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.fill();
    g.save();
    g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.clip();
    g.globalCompositeOperation = "lighter";
    var vl = M.generarViaLactea(7000, 500, C.azar(1906));
    for (var i = 0; i < vl.n; i++) {
      var q = plano(vl.posiciones.subarray(i * 3, i * 3 + 3));
      if (!q) continue;
      var rr = Math.max(0.6 * dpr, vl.tamanos[i] * R * 0.6), col = vl.colores.subarray(i * 3, i * 3 + 3);
      g.fillStyle = "rgba(" + Math.round(col[0] * 255) + "," + Math.round(col[1] * 255) + "," + Math.round(col[2] * 255) + "," + Math.min(0.5, vl.alfas[i] * (rr > 3 ? 0.5 : 0.9)).toFixed(3) + ")";
      g.beginPath(); g.arc(q[0], q[1], rr, 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = "source-over";
    g.strokeStyle = "rgba(180, 200, 255, 0.36)";
    g.lineWidth = Math.max(1, 0.9 * dpr);
    M.polilineasConstelaciones().forEach(function (pl) {
      var antes = null;
      pl.puntos.forEach(function (pt) {
        var q2 = plano(pt);
        if (q2 && antes) { g.beginPath(); g.moveTo(antes[0], antes[1]); g.lineTo(q2[0], q2[1]); g.stroke(); }
        antes = q2;
      });
    });
    var E = M.prepararEstrellas();
    for (var s = 0; s < E.n; s++) {
      var q3 = plano(E.posiciones.subarray(s * 3, s * 3 + 3));
      if (!q3) continue;
      var flujo = Math.pow(10, -0.4 * (E.magnitudes[s] - 6)), radio = (0.35 + Math.pow(flujo, 0.25) * 0.42) * dpr * (lado / 340);
      var cc = E.colores.subarray(s * 3, s * 3 + 3);
      g.fillStyle = "rgba(" + Math.round(cc[0] * 255) + "," + Math.round(cc[1] * 255) + "," + Math.round(cc[2] * 255) + "," + Math.min(1, 0.35 + Math.pow(flujo, 0.2) * 0.2).toFixed(3) + ")";
      g.beginPath(); g.arc(q3[0], q3[1], radio, 0, Math.PI * 2); g.fill();
    }
    var cuerpo = new Float32Array(5);
    M.CUERPOS.forEach(function (cp) {
      efe.cuerpo(cp.id, efe.hora, cuerpo);
      var q4 = plano(cuerpo);
      if (!q4) return;
      g.fillStyle = "rgb(" + Math.round(cp.color[0] * 255) + "," + Math.round(cp.color[1] * 255) + "," + Math.round(cp.color[2] * 255) + ")";
      g.beginPath(); g.arc(q4[0], q4[1], (cp.id === "Moon" ? 4.5 : 2.2) * dpr * (lado / 340), 0, Math.PI * 2); g.fill();
    });
    g.restore();
    var aro = document.createElement("canvas");
    aro.width = aro.height = S;
    M.dibujarAro(aro.getContext("2d"), S);
    g.drawImage(aro, 0, 0);
  }

  function crearPlano(m, op) {
    op = op || {};
    var T = textosDe(m, op.textos), efe = new M.Efemerides(m);
    var art = nodo("article", "recuerdo recuerdo--plano mapa-plano");
    art.style.setProperty("--acento", op.color || "#ff7096");
    var nombres = (m.nombres && m.nombres.length ? m.nombres : [op.destinatario, op.remitente]).filter(Boolean);
    var pn = nodo("p", "mapa__nombres");
    pn.appendChild(nodo("span", "mapa__nombre", nombres[0] || ""));
    if (nombres.length > 1) {
      pn.appendChild(icono(M.SVG.corazon, "mapa__corazon"));
      pn.appendChild(nodo("span", "mapa__nombre", nombres[1]));
    }
    art.appendChild(pn);
    var lienzo = nodo("canvas", "mapa-plano__carta");
    lienzo.setAttribute("role", "img");
    lienzo.setAttribute("aria-label", formatear(T.descripcion, { lugar: m.lugar || "", fecha: fechaTexto(m, efe), hora: M.reloj(efe.hora) }));
    art.appendChild(lienzo);
    var texto = nodo("div", "mapa__texto");
    texto.appendChild(nodo("p", "mapa__fecha", fechaTexto(m, efe) + "  ·  " + M.reloj(efe.hora)));
    texto.appendChild(nodo("h2", "mapa__titulo", m.titulo || T.titulo));
    var mensaje = m.mensaje != null ? m.mensaje : op.mensaje;
    if (mensaje) texto.appendChild(nodo("p", "mapa__mensaje", mensaje));
    var ul = nodo("ul", "mapa-plano__destacados");
    prepararDestacados(m.destacados).forEach(function (o) {
      var li = nodo("li", "mapa-plano__destacado");
      li.style.setProperty("--tono", o.tono);
      li.appendChild(icono(M.SVG[o.icono] || M.SVG.estrella, "mapa__destacado-icono"));
      var tx = nodo("div", "");
      tx.appendChild(nodo("p", "mapa__detalle-titulo", o.subtitulo ? o.titulo + " · " + o.subtitulo : o.titulo));
      if (o.texto) tx.appendChild(nodo("p", "mapa__detalle-texto", o.texto));
      li.appendChild(tx);
      ul.appendChild(li);
    });
    texto.appendChild(ul);
    texto.appendChild(nodo("p", "mapa__coordenadas", M.coordenada(Number(m.latitud) || 0, "N", "S") + "  ·  " + M.coordenada(Number(m.longitud) || 0, "E", "O")));
    var lugar = nodo("p", "mapa__lugar");
    lugar.appendChild(icono(M.SVG.lugar));
    lugar.appendChild(nodo("span", "", m.lugar || ""));
    texto.appendChild(lugar);
    art.appendChild(texto);
    var lado = Math.min(520, Math.max(240, (window.innerWidth || 360) - 72));
    function dibujar() { try { dibujarCartaPlana(lienzo, m, lado); } catch (e) { if (window.console) console.error(e); } }
    dibujar();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(dibujar);
    return art;
  }

  C.MapaEstelar = {
    disponible: disponible,
    crear: function (op) { return new Mapa(op); },
    plano: crearPlano
  };
})(window.Cielo);
