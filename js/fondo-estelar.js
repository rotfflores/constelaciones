/* El cielo de nosotros · cielo estelar
   WebGL: Vía Láctea procedural (nubes, polvo oscuro, grieta central y nebulosas
   tenues) y miles de estrellas con color, magnitud, picos de difracción y
   titileo atmosférico. Si el navegador no tiene WebGL, usa un respaldo en Canvas 2D. */
(function (C) {
  "use strict";

  /* ---------- Sombreadores ---------- */
  var RUIDO = [
    "float hash(vec2 p) {",
    "  vec3 p3 = fract(vec3(p.xyx) * 0.1031);",
    "  p3 += dot(p3, p3.yzx + 33.33);",
    "  return fract((p3.x + p3.y) * p3.z);",
    "}",
    "float ruido(vec2 p) {",
    "  vec2 i = floor(p), f = fract(p);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float fbm(vec2 p) {",
    "  float v = 0.0, a = 0.5;",
    "  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);",
    "  for (int i = 0; i < 6; i++) { v += a * ruido(p); p = r * p * 2.02 + 17.17; a *= 0.5; }",
    "  return v;",
    "}"
  ].join("\n");

  var VS_HORNEADO = [
    "attribute vec2 aPos;",
    "varying vec2 vUv;",
    "void main() { vUv = aPos; gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0); }"
  ].join("\n");

  var FS_HORNEADO = [
    "uniform vec4 uRect;",
    "uniform vec2 uBanda0;",
    "uniform vec2 uBandaDir;",
    "uniform float uBandaLargo;",
    "uniform float uBandaAncho;",
    "uniform float uSemilla;",
    "uniform float uHorizonte;",
    "uniform float uAlto;",
    "varying vec2 vUv;",
    RUIDO,
    "void main() {",
    "  vec2 p = uRect.xy + vUv * uRect.zw;",
    "  vec2 q = p - uBanda0;",
    "  vec2 nrm = vec2(-uBandaDir.y, uBandaDir.x);",
    "  float t = dot(q, uBandaDir) / uBandaLargo;",
    "  float curva = sin(t * 3.14159 * 1.2 + 0.4) * uBandaAncho * 0.6;",
    "  float d = dot(q, nrm) - curva;",
    "  float nucleo = exp(-pow((t - 0.06) / 0.16, 2.0));",
    "  float w = uBandaAncho * (0.85 + 0.25 * sin(t * 7.0 + 1.3) + 0.9 * nucleo);",
    "  vec2 np = p / 520.0 + vec2(uSemilla * 7.13, uSemilla * 3.71);",
    "  vec2 deform = vec2(fbm(np * 1.3), fbm(np * 1.3 + 7.7)) - 0.5;",
    "  float dd = d / w + deform.x * 0.7;",
    "  float banda = exp(-dd * dd * 1.6);",
    "  float nubes = fbm(np * 2.3 + deform * 1.8);",
    "  float brillo = banda * (0.3 + 1.35 * nubes * nubes) * (0.6 + 1.3 * nucleo);",
    "  float cresta = 1.0 - abs(fbm(np * 3.2 + deform * 2.6) * 2.0 - 1.0);",
    "  float polvo = smoothstep(0.58, 0.9, cresta) * exp(-pow(dd / 0.6, 2.0));",
    "  float grieta = exp(-pow((dd - 0.08 + deform.y * 0.5) / 0.13, 2.0)) * smoothstep(0.02, 0.35, t) * (0.6 + 0.4 * nubes);",
    "  brillo *= (1.0 - 0.75 * polvo) * (1.0 - 0.55 * grieta);",

    "  float altura = clamp((uHorizonte - p.y) / uAlto, 0.0, 1.0);",
    "  vec3 base = vec3(0.031, 0.051, 0.129);",
    "  vec3 cenit = vec3(0.016, 0.026, 0.074);",
    "  vec3 bajo = vec3(0.058, 0.078, 0.175);",
    "  vec3 cielo = mix(bajo, base, smoothstep(0.0, 0.22, altura));",
    "  cielo = mix(cielo, cenit, smoothstep(0.4, 1.0, altura));",

    "  vec3 frio = vec3(0.52, 0.60, 0.90);",
    "  vec3 calido = vec3(1.0, 0.85, 0.62);",
    "  vec3 tono = mix(frio, calido, clamp(nucleo * 1.3 + nubes * 0.35 - 0.1, 0.0, 1.0));",
    "  vec3 color = cielo + tono * brillo * 0.3;",

    "  float difuso = fbm(np * 0.55 + 5.0);",
    "  color += vec3(0.10, 0.13, 0.28) * smoothstep(0.3, 0.9, difuso) * 0.3;",
    "  float n1 = smoothstep(0.56, 0.86, fbm(np * 1.8 + 3.3)) * banda;",
    "  color += vec3(0.52, 0.20, 0.36) * n1 * 0.055;",
    "  float n2 = smoothstep(0.6, 0.92, fbm(np * 1.4 + 11.1)) * (0.25 + banda);",
    "  color += vec3(0.12, 0.32, 0.44) * n2 * 0.05;",

    "  vec2 celda = floor(p / 2.6);",
    "  float h = hash(celda + uSemilla * 13.0);",
    "  float umbral = 0.982 - banda * 0.07 * (1.0 - polvo);",
    "  float grano = step(umbral, h) * (0.35 + 0.65 * hash(celda * 1.37 + 4.1));",
    "  color += vec3(0.85, 0.88, 1.0) * grano * 0.17 * (0.4 + banda);",

    "  color += (hash(gl_FragCoord.xy + uSemilla) - 0.5) / 255.0;",
    "  gl_FragColor = vec4(color, 1.0);",
    "}"
  ].join("\n");

  // Plano del cielo: rectángulo del mundo con la cámara y un paralaje leve.
  var VS_PLANO = [
    "attribute vec2 aPos;",
    "uniform vec4 uRect;",
    "uniform vec3 uCam;",
    "uniform vec2 uRes;",
    "uniform vec2 uAncla;",
    "uniform float uPar;",
    "varying vec2 vUv;",
    "void main() {",
    "  vec2 w = uRect.xy + aPos * uRect.zw;",
    "  vec2 s = ((w - uAncla) + (uAncla - uCam.xy) * uPar) * uCam.z;",
    "  gl_Position = vec4(s.x / (uRes.x * 0.5), -s.y / (uRes.y * 0.5), 0.0, 1.0);",
    "  vUv = aPos;",
    "}"
  ].join("\n");

  var FS_FONDO = [
    "uniform sampler2D uTex;",
    "uniform float uAparicion;",
    "varying vec2 vUv;",
    "float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }",
    "void main() {",
    "  vec3 c = texture2D(uTex, vUv).rgb;",
    "  c = mix(vec3(0.008, 0.012, 0.03), c, uAparicion);",
    "  c += (hash(gl_FragCoord.xy) - 0.5) / 200.0;",
    "  gl_FragColor = vec4(c, 1.0);",
    "}"
  ].join("\n");

  var VS_ESTRELLAS = [
    "attribute vec2 aPos;",
    "attribute vec4 aDatos;", // brillo, azar, tinte, profundidad
    "uniform vec3 uCam;",
    "uniform vec2 uRes;",
    "uniform vec2 uAncla;",
    "uniform float uDpr;",
    "uniform float uTiempo;",
    "uniform float uTitileo;",
    "uniform float uZoomRel;",
    "uniform float uAparicion;",
    "uniform float uTamMax;",
    "varying vec3 vColor;",
    "varying float vIntensidad;",
    "varying float vPicos;",
    "varying float vNitidez;",
    "void main() {",
    "  vec2 s = ((aPos - uAncla) + (uAncla - uCam.xy) * aDatos.w) * uCam.z;",
    "  gl_Position = vec4(s.x / (uRes.x * 0.5), -s.y / (uRes.y * 0.5), 0.0, 1.0);",
    "  float b = aDatos.x;",
    "  float zr = clamp(uZoomRel, 0.3, 4.0);",
    "  float zf = pow(zr, 0.45);",
    "  float aparece = smoothstep(aDatos.y * 0.75, aDatos.y * 0.75 + 0.25, uAparicion);",
    "  float tt = uTiempo * (0.6 + aDatos.y * 1.6);",
    "  float tw = 1.0 + uTitileo * smoothstep(0.25, 0.85, b) * (0.30 * sin(tt * 2.7 + aDatos.y * 61.0) * sin(tt * 1.31 + aDatos.y * 17.0) + 0.10 * sin(tt * 7.9 + aDatos.y * 29.0));",
    "  vPicos = smoothstep(0.972, 0.997, b);",
    "  float tam = (1.3 + 3.8 * b * b) * zf * mix(1.0, 3.6, vPicos);",
    "  gl_PointSize = clamp(tam * uDpr, 1.0, uTamMax);",
    "  vNitidez = mix(9.0, 70.0, vPicos);",
    "  vIntensidad = (0.11 + 0.95 * b) * (0.75 + 0.25 * min(zr, 2.5)) * tw * aparece;",
    "  vec3 frio = vec3(0.74, 0.83, 1.0), neutro = vec3(1.0, 0.975, 0.94), calido = vec3(1.0, 0.82, 0.62);",
    "  vColor = aDatos.z < 0.5 ? mix(frio, neutro, aDatos.z * 2.0) : mix(neutro, calido, (aDatos.z - 0.5) * 2.0);",
    "}"
  ].join("\n");

  var FS_ESTRELLAS = [
    "precision mediump float;",
    "varying vec3 vColor;",
    "varying float vIntensidad;",
    "varying float vPicos;",
    "varying float vNitidez;",
    "void main() {",
    "  vec2 c = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(c, c);",
    "  if (r2 > 1.0) discard;",
    "  float nucleo = exp(-r2 * vNitidez);",
    "  float halo = exp(-sqrt(r2) * 6.0) * (0.10 + 0.25 * vPicos);",
    "  float picos = 0.0;",
    "  if (vPicos > 0.01) {",
    "    vec2 a = abs(c);",
    "    picos = (exp(-a.y * 90.0) * pow(1.0 - a.x, 2.0) + exp(-a.x * 90.0) * pow(1.0 - a.y, 2.0)) * 0.6 * vPicos;",
    "  }",
    "  float i = (nucleo + halo + picos) * vIntensidad * (1.0 - r2);",
    "  gl_FragColor = vec4(vColor * i, 1.0);",
    "}"
  ].join("\n");

  /* ---------- Estrellas del campo ---------- */
  function generarEstrellas(mundo, opciones) {
    var rnd = C.azar(opciones.semilla || 7);
    var e = mundo.extendido;
    var n = Math.round(e.w * e.h / 330 * (opciones.densidad || 1));
    var datos = new Float32Array(n * 6);
    var i = 0, intentos = 0;
    while (i < n && intentos < n * 10) {
      intentos++;
      var x = e.x + rnd() * e.w, y = e.y + rnd() * e.h;
      if (y > mundo.horizonte + 30) continue;
      var bd = C.densidadBanda(mundo.banda, x, y);
      var dens = (0.3 + 0.7 * bd.banda + 0.3 * bd.nucleo * bd.banda) / 1.3;
      if (rnd() > dens) continue;
      var b = Math.pow(rnd(), 7);
      b *= 0.3 + 0.7 * C.pasoSuave(0, 520, mundo.horizonte - y); // extinción cerca del horizonte
      var r = rnd();
      var tinte = r < 0.22 ? rnd() * 0.42 : r < 0.86 ? 0.42 + rnd() * 0.22 : 0.64 + rnd() * 0.36;
      var o = i * 6;
      datos[o] = x;
      datos[o + 1] = y;
      datos[o + 2] = b;
      datos[o + 3] = rnd();
      datos[o + 4] = tinte;
      datos[o + 5] = 0.955 + 0.045 * Math.min(1, b * 1.5);
      i++;
    }
    return { datos: datos, cantidad: i };
  }

  /* ---------- Utilidades WebGL ---------- */
  function compilar(gl, tipo, fuente) {
    var s = gl.createShader(tipo);
    gl.shaderSource(s, fuente);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) {
      throw new Error("Sombreador: " + gl.getShaderInfoLog(s));
    }
    return s;
  }
  function programa(gl, vs, fs, atributos) {
    var p = gl.createProgram();
    gl.attachShader(p, compilar(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compilar(gl, gl.FRAGMENT_SHADER, fs));
    atributos.forEach(function (a, i) { gl.bindAttribLocation(p, i, a); });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) {
      throw new Error("Programa: " + gl.getProgramInfoLog(p));
    }
    var u = {}, total = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var k = 0; k < total; k++) {
      var info = gl.getActiveUniform(p, k);
      u[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { p: p, u: function (nombre) { return u[nombre] || null; } };
  }

  /* ---------- Renderizador WebGL ---------- */
  function crearWebGL(lienzo) {
    var opciones = { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: "high-performance" };
    var gl = null;
    try { gl = lienzo.getContext("webgl", opciones) || lienzo.getContext("experimental-webgl", opciones); } catch (err) { gl = null; }
    if (!gl) return null;

    var r = { esWebGL: true, listo: false };
    var progFondo, progEstrellas, progHorneado, bufPlano, bufEstrellas, textura;
    var cantidad = 0, tamMax = 64, mundo = null, op = null, W = 1, H = 1, dpr = 1;

    function iniciar() {
      var hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      var precision = "precision " + (hp && hp.precision > 0 ? "highp" : "mediump") + " float;\n";
      progHorneado = programa(gl, VS_HORNEADO, precision + FS_HORNEADO, ["aPos"]);
      progFondo = programa(gl, VS_PLANO, precision + FS_FONDO, ["aPos"]);
      progEstrellas = programa(gl, VS_ESTRELLAS, FS_ESTRELLAS, ["aPos", "aDatos"]);
      bufPlano = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bufPlano);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
      bufEstrellas = gl.createBuffer();
      var rango = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
      tamMax = Math.min(rango ? rango[1] : 64, 128);
      gl.clearColor(0.031, 0.051, 0.129, 1);
    }

    function hornear() {
      var e = mundo.extendido, b = mundo.banda;
      var lado = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE));
      var tw, th;
      if (e.w >= e.h) { tw = lado; th = Math.round(lado * e.h / e.w); }
      else { th = lado; tw = Math.round(lado * e.w / e.h); }
      if (textura) gl.deleteTexture(textura);
      textura = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, textura);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textura, 0);
      gl.viewport(0, 0, tw, th);
      gl.disable(gl.BLEND);
      var pr = progHorneado;
      gl.useProgram(pr.p);
      gl.uniform4f(pr.u("uRect"), e.x, e.y, e.w, e.h);
      gl.uniform2f(pr.u("uBanda0"), b.x0, b.y0);
      gl.uniform2f(pr.u("uBandaDir"), b.dx, b.dy);
      gl.uniform1f(pr.u("uBandaLargo"), b.largo);
      gl.uniform1f(pr.u("uBandaAncho"), b.ancho);
      gl.uniform1f(pr.u("uSemilla"), (op.semilla % 97) / 9.7);
      gl.uniform1f(pr.u("uHorizonte"), mundo.horizonte);
      gl.uniform1f(pr.u("uAlto"), mundo.h);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufPlano);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(fb);
    }

    function subirEstrellas() {
      var g = generarEstrellas(mundo, op);
      cantidad = g.cantidad;
      gl.bindBuffer(gl.ARRAY_BUFFER, bufEstrellas);
      gl.bufferData(gl.ARRAY_BUFFER, g.datos.subarray(0, cantidad * 6), gl.STATIC_DRAW);
    }

    r.dimensionar = function (w, h, d) {
      W = w; H = h; dpr = d;
      lienzo.width = Math.round(w * d);
      lienzo.height = Math.round(h * d);
      lienzo.style.width = w + "px";
      lienzo.style.height = h + "px";
    };

    r.configurar = function (m, opciones) {
      mundo = m;
      op = opciones || {};
      if (gl.isContextLost()) return;
      hornear();
      subirEstrellas();
      r.listo = true;
    };

    r.dibujar = function (cam, tiempo, o) {
      if (!r.listo || gl.isContextLost()) return;
      var e = mundo.extendido, a = mundo.ancla;
      gl.viewport(0, 0, lienzo.width, lienzo.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.disable(gl.BLEND);
      var f = progFondo;
      gl.useProgram(f.p);
      gl.uniform4f(f.u("uRect"), e.x, e.y, e.w, e.h);
      gl.uniform3f(f.u("uCam"), cam.x, cam.y, cam.z);
      gl.uniform2f(f.u("uRes"), W, H);
      gl.uniform2f(f.u("uAncla"), a.x, a.y);
      gl.uniform1f(f.u("uPar"), 0.93);
      gl.uniform1f(f.u("uAparicion"), o.aparicion);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textura);
      gl.uniform1i(f.u("uTex"), 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufPlano);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      var s = progEstrellas;
      gl.useProgram(s.p);
      gl.uniform3f(s.u("uCam"), cam.x, cam.y, cam.z);
      gl.uniform2f(s.u("uRes"), W, H);
      gl.uniform2f(s.u("uAncla"), a.x, a.y);
      gl.uniform1f(s.u("uDpr"), dpr);
      gl.uniform1f(s.u("uTiempo"), tiempo);
      gl.uniform1f(s.u("uTitileo"), o.titileo);
      gl.uniform1f(s.u("uZoomRel"), o.zoomRel);
      gl.uniform1f(s.u("uAparicion"), o.aparicionEstrellas);
      gl.uniform1f(s.u("uTamMax"), tamMax);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufEstrellas);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
      gl.drawArrays(gl.POINTS, 0, cantidad);
      gl.disableVertexAttribArray(1);
    };

    lienzo.addEventListener("webglcontextlost", function (ev) { ev.preventDefault(); r.listo = false; });
    lienzo.addEventListener("webglcontextrestored", function () {
      try { iniciar(); if (mundo) r.configurar(mundo, op); } catch (err) { /* se reintenta en el siguiente cambio */ }
    });

    try { iniciar(); } catch (err) { lienzo.setAttribute("data-contexto", "webgl"); return null; }
    return r;
  }

  /* ---------- Respaldo en Canvas 2D ---------- */
  function crear2D(lienzo) {
    var ctx = lienzo.getContext("2d");
    var r = { esWebGL: false, listo: false };
    var mundo = null, capa = null, W = 1, H = 1, dpr = 1;

    r.dimensionar = function (w, h, d) {
      W = w; H = h; dpr = d;
      lienzo.width = Math.round(w * d);
      lienzo.height = Math.round(h * d);
      lienzo.style.width = w + "px";
      lienzo.style.height = h + "px";
    };

    r.configurar = function (m, op) {
      mundo = m;
      var e = m.extendido, b = m.banda;
      var k = Math.min(1, 1600 / Math.max(e.w, e.h));
      capa = document.createElement("canvas");
      capa.width = Math.round(e.w * k);
      capa.height = Math.round(e.h * k);
      var g = capa.getContext("2d");
      g.scale(k, k);
      g.translate(-e.x, -e.y);
      var cielo = g.createLinearGradient(0, e.y, 0, e.y + e.h);
      cielo.addColorStop(0, "#04071a");
      cielo.addColorStop(0.6, "#080D21");
      cielo.addColorStop(1, "#111a3c");
      g.fillStyle = cielo;
      g.fillRect(e.x, e.y, e.w, e.h);
      var rnd = C.azar((op.semilla || 7) + 5);
      g.globalCompositeOperation = "lighter";
      for (var i = 0; i < 520; i++) {
        var t = rnd(), gauss = (rnd() + rnd() + rnd() - 1.5) * 0.9;
        var curva = Math.sin(t * Math.PI * 1.2 + 0.4) * b.ancho * 0.6;
        var x = b.x0 + b.dx * t * b.largo + b.nx * (curva + gauss * b.ancho);
        var y = b.y0 + b.dy * t * b.largo + b.ny * (curva + gauss * b.ancho);
        var rad = b.ancho * (0.3 + 0.6 * rnd()) * (1 + Math.exp(-Math.pow((t - 0.06) / 0.16, 2)));
        var cal = t < 0.25 ? "255,220,170" : "150,170,230";
        var rg = g.createRadialGradient(x, y, 0, x, y, rad);
        rg.addColorStop(0, "rgba(" + cal + ",0.012)");
        rg.addColorStop(1, "rgba(" + cal + ",0)");
        g.fillStyle = rg;
        g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      var est = generarEstrellas(m, { semilla: op.semilla, densidad: 0.35 });
      for (var j = 0; j < est.cantidad; j++) {
        var o = j * 6, br = est.datos[o + 2];
        g.fillStyle = "rgba(248,243,231," + (0.1 + 0.9 * br).toFixed(3) + ")";
        g.beginPath();
        g.arc(est.datos[o], est.datos[o + 1], (0.45 + 1.7 * br) / k * 0.45, 0, 6.2832);
        g.fill();
      }
      r.listo = true;
    };

    r.dibujar = function (cam, tiempo, o) {
      if (!r.listo) return;
      var e = mundo.extendido;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#03050f";
      ctx.fillRect(0, 0, lienzo.width, lienzo.height);
      ctx.globalAlpha = o.aparicion;
      ctx.setTransform(cam.z * dpr, 0, 0, cam.z * dpr, (W / 2 - cam.x * cam.z) * dpr, (H / 2 - cam.y * cam.z) * dpr);
      ctx.drawImage(capa, e.x, e.y, e.w, e.h);
      ctx.globalAlpha = 1;
    };
    return r;
  }

  C.FondoEstelar = {
    crear: function (lienzo) {
      var r = crearWebGL(lienzo);
      if (r) return r;
      // Un lienzo que ya tuvo contexto WebGL no admite 2D: se sustituye por uno nuevo.
      if (lienzo.getAttribute("data-contexto") === "webgl") {
        var nuevo = lienzo.cloneNode(false);
        nuevo.removeAttribute("data-contexto");
        lienzo.parentNode.replaceChild(nuevo, lienzo);
        lienzo = nuevo;
      }
      return crear2D(lienzo);
    },
    generarEstrellas: generarEstrellas
  };
})(window.Cielo);
