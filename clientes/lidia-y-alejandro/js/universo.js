/* El cielo de nosotros · universo en 3D
   Galaxia espiral hecha de partículas, cielo profundo con su banda de luz,
   nebulosas, las cinco constelaciones (estrellas, trazos y anillos de luz),
   efectos (chispas, ondas, destellos, estrellas fugaces), polvo de estrellas
   que forma figuras y el camino final en forma de corazón.
   Dibuja con Three.js (js/vendor/three.min.js) y un resplandor cinematográfico. */
(function (C) {
  "use strict";

  var THREE = window.THREE;
  var DOS_PI = Math.PI * 2;

  /* ---------- Texturas generadas en el navegador (no dependen de archivos) ---------- */

  function lienzo(ancho, alto) {
    var c = document.createElement("canvas");
    c.width = ancho;
    c.height = alto || ancho;
    return c;
  }

  function texturaBrillo() {
    var tam = 256, c = lienzo(tam), g = c.getContext("2d"), m = tam / 2;
    var gr = g.createRadialGradient(m, m, 0, m, m, m);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.06, "rgba(255,255,255,0.9)");
    gr.addColorStop(0.18, "rgba(255,255,255,0.38)");
    gr.addColorStop(0.42, "rgba(255,255,255,0.1)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, tam, tam);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function texturaNebulosa(semilla) {
    var tam = 256, c = lienzo(tam), g = c.getContext("2d"), m = tam / 2;
    var rnd = C.azar(semilla);
    g.globalCompositeOperation = "lighter";
    for (var i = 0; i < 34; i++) {
      var x = m + C.gauss(rnd) * tam * 0.15, y = m + C.gauss(rnd) * tam * 0.15;
      var r = tam * (0.08 + rnd() * 0.24);
      var gr = g.createRadialGradient(x, y, 0, x, y, r);
      var a = 0.05 + rnd() * 0.11;
      gr.addColorStop(0, "rgba(255,255,255," + a + ")");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, tam, tam);
    }
    // Borde suave para que no se note el cuadrado.
    g.globalCompositeOperation = "destination-in";
    var borde = g.createRadialGradient(m, m, tam * 0.12, m, m, m);
    borde.addColorStop(0, "rgba(0,0,0,1)");
    borde.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = borde;
    g.fillRect(0, 0, tam, tam);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  // Banda tenue de luz y nubes de color en una esfera lejana (proyección equirectangular).
  // Se pinta píxel a píxel (sin degradados del lienzo) para que no aparezcan tramas al ampliarla.
  function texturaBanda(semilla, normal) {
    var W = 768, H = 384, acum = new Float32Array(W * H * 3);
    var rnd = C.azar(semilla);
    var n = normal.clone().normalize();
    var e1 = new THREE.Vector3(1, 0, 0).cross(n).normalize();
    var e2 = n.clone().cross(e1).normalize();
    var d = new THREE.Vector3();
    var colores = [[120, 140, 255], [170, 120, 255], [255, 150, 200], [120, 200, 230], [255, 220, 190]];
    function mancha(dir, radio, rgb, a) {
      var th = Math.acos(C.limitar(dir.y, -1, 1));
      var ph = Math.atan2(dir.z, -dir.x);
      var cx = (((ph / DOS_PI) % 1) + 1) % 1 * W, cy = th / Math.PI * H;
      var estirar = 1 / Math.max(0.3, Math.sin(th));
      var sy = radio * 0.45, sx = sy * estirar;
      var y0 = Math.max(0, Math.floor(cy - sy * 3)), y1 = Math.min(H - 1, Math.ceil(cy + sy * 3));
      var x0 = Math.floor(cx - sx * 3), x1 = Math.ceil(cx + sx * 3);
      for (var y = y0; y <= y1; y++) {
        var dy = (y - cy) / sy, gy = a * Math.exp(-0.5 * dy * dy);
        for (var x = x0; x <= x1; x++) {
          var dx = (x - cx) / sx, w = gy * Math.exp(-0.5 * dx * dx);
          var o = (y * W + ((x % W) + W) % W) * 3;
          acum[o] += rgb[0] * w; acum[o + 1] += rgb[1] * w; acum[o + 2] += rgb[2] * w;
        }
      }
    }
    for (var i = 0; i < 420; i++) {
      var al = rnd() * DOS_PI, desv = C.gauss(rnd) * 0.11;
      d.copy(e1).multiplyScalar(Math.cos(al)).addScaledVector(e2, Math.sin(al)).addScaledVector(n, desv).normalize();
      mancha(d, 6 + rnd() * 30, colores[Math.floor(rnd() * colores.length)], 0.012 + rnd() * 0.03);
    }
    // Nubes sueltas fuera de la banda.
    for (var j = 0; j < 40; j++) {
      d.set(C.gauss(rnd), C.gauss(rnd), C.gauss(rnd)).normalize();
      mancha(d, 24 + rnd() * 50, colores[Math.floor(rnd() * 3)], 0.008 + rnd() * 0.014);
    }
    var c = lienzo(W, H), g = c.getContext("2d"), img = g.createImageData(W, H), px = img.data;
    for (var k = 0, q = 0; k < W * H; k++, q += 3) {
      px[k * 4] = acum[q] + rnd() - 0.5;
      px[k * 4 + 1] = acum[q + 1] + rnd() - 0.5;
      px[k * 4 + 2] = acum[q + 2] + rnd() - 0.5;
      px[k * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  /* ---------- Shaders ---------- */

  // Puntos de luz suaves (galaxia, cielo de fondo, polvo y chispas).
  var VS_PUNTOS = [
    "attribute float aTam;",
    "attribute vec3 aColor;",
    "attribute float aAzar;",
    "uniform float uTiempo;",
    "uniform float uEscala;",
    "uniform float uBrillo;",
    "uniform float uTitileo;",
    "uniform float uTamMin;",
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "void main() {",
    "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  float tam = aTam * uEscala / max(0.01, -mv.z);",
    "  float tw = 1.0;",
    "  if (aAzar > 0.55) tw += uTitileo * 0.55 * sin(uTiempo * (0.8 + aAzar * 2.6) + aAzar * 97.0);",
    "  vAlfa = uBrillo * tw * min(1.0, tam / uTamMin);",
    "  gl_PointSize = max(tam, uTamMin);",
    "  vColor = aColor;",
    "}"
  ].join("\n");

  var FS_PUNTOS = [
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  float a = exp(-r2 * 4.5) * (1.0 - r2);",
    "  gl_FragColor = vec4(vColor, a * vAlfa);",
    "}"
  ].join("\n");

  // Estrellas de las constelaciones: núcleo, halo y picos de difracción.
  var VS_ESTRELLAS = [
    "attribute float aBrillo;",
    "attribute float aLuz;",
    "attribute float aDestello;",
    "uniform float uEscala;",
    "uniform float uTiempo;",
    "uniform float uOpacidad;",
    "uniform float uTam;",
    "uniform float uTamMin;",
    "varying float vLuz;",
    "varying float vAlfa;",
    "varying float vDestello;",
    "void main() {",
    "  vec4 mv = modelViewMatrix * vec4(position, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  float pulso = 1.0 + 0.07 * sin(uTiempo * 1.7 + aBrillo * 13.0 + position.x * 3.0);",
    "  float tam = uTam * (0.55 + 0.6 * aBrillo) * (1.0 + 1.15 * aLuz + 1.7 * aDestello) * pulso;",
    "  gl_PointSize = clamp(tam * uEscala / max(0.01, -mv.z), uTamMin * (5.0 + 3.0 * aLuz), 260.0);",
    "  vLuz = aLuz;",
    "  vDestello = aDestello;",
    "  vAlfa = uOpacidad * (0.5 + 0.5 * aBrillo);",
    "}"
  ].join("\n");

  var FS_ESTRELLAS = [
    "uniform vec3 uFrio;",
    "uniform vec3 uOro;",
    "varying float vLuz;",
    "varying float vAlfa;",
    "varying float vDestello;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  float nucleo = exp(-r2 * 42.0);",
    "  float halo = exp(-r2 * 7.0) * 0.3;",
    "  float picos = exp(-abs(p.x) * 30.0) * exp(-abs(p.y) * 3.0) + exp(-abs(p.y) * 30.0) * exp(-abs(p.x) * 3.0);",
    "  picos *= 0.18 + 0.7 * max(vLuz, vDestello);",
    "  float a = (nucleo * 1.5 + halo + picos * 0.6) * (1.0 - r2);",
    "  vec3 col = mix(uFrio, uOro, vLuz);",
    "  col = mix(col, vec3(1.0), nucleo * 0.65);",
    "  gl_FragColor = vec4(col * (0.85 + 0.6 * vLuz + 1.3 * vDestello), a * vAlfa);",
    "}"
  ].join("\n");

  // Polvo de estrellas que viaja desde una nube libre hasta una figura (foto, corazón, nombre).
  var VS_POLVO = [
    "attribute vec3 aDestino;",
    "attribute vec3 aColor;",
    "attribute vec4 aAzar;",
    "uniform float uTiempo;",
    "uniform float uEscala;",
    "uniform float uTamMin;",
    "uniform float uProgreso;",
    "uniform float uRemolino;",
    "uniform float uPulso;",
    "uniform float uDispersion;",
    "uniform float uTam;",
    "uniform float uTamLibre;",
    "uniform float uOpacidad;",
    "uniform float uTemblor;",
    "uniform vec3 uColorLibre;",
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "vec2 rotar(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }",
    "void main() {",
    "  float p = clamp(uProgreso * 1.4 - aAzar.x * 0.4, 0.0, 1.0);",
    "  p = p * p * (3.0 - 2.0 * p);",
    "  vec3 libre = position;",
    "  float giro = uTiempo * (0.12 + aAzar.y * 0.4) * uRemolino + aAzar.z * 6.2831;",
    "  libre.xy = rotar(libre.xy, giro / (0.6 + length(position.xy) * 0.25));",
    "  libre.z += sin(uTiempo * 0.7 + aAzar.z * 20.0) * 0.08 * (1.0 + length(position));",
    "  vec3 forma = aDestino * (1.0 + uPulso * 0.075);",
    "  forma += vec3(sin(uTiempo * 1.3 + aAzar.z * 50.0), cos(uTiempo * 1.1 + aAzar.z * 31.0), sin(uTiempo * 0.9 + aAzar.y * 20.0)) * uTemblor;",
    "  vec3 pos = mix(libre, forma, p);",
    "  vec3 dir = normalize(pos + vec3(0.0001, 0.0002, 0.0003));",
    "  pos += dir * uDispersion * (1.5 + aAzar.y * 3.0) * (0.5 + length(aDestino));",
    "  vec4 mv = modelViewMatrix * vec4(pos, 1.0);",
    "  gl_Position = projectionMatrix * mv;",
    "  float tamMundo = mix(uTamLibre * (0.45 + aAzar.w), uTam, p);",
    "  float tam = tamMundo * uEscala / max(0.01, -mv.z);",
    "  float chispeo = mix(0.55 + 0.45 * sin(uTiempo * 2.2 + aAzar.z * 40.0), 1.0, p);",
    "  vAlfa = uOpacidad * min(1.0, tam / uTamMin) * chispeo * (1.0 - uDispersion);",
    "  gl_PointSize = max(tam, uTamMin);",
    "  vColor = mix(uColorLibre, aColor, p) * (1.0 + uPulso * 0.6 * p);",
    "}"
  ].join("\n");

  var FS_POLVO = [
    "uniform float uNitidez;",
    "varying vec3 vColor;",
    "varying float vAlfa;",
    "void main() {",
    "  vec2 p = gl_PointCoord * 2.0 - 1.0;",
    "  float r2 = dot(p, p);",
    "  if (r2 > 1.0) discard;",
    "  float suave = exp(-r2 * 4.0) * (1.0 - r2);",
    "  float nitida = 1.0 - smoothstep(0.3, 1.0, sqrt(r2));",
    "  gl_FragColor = vec4(vColor, mix(suave, nitida, uNitidez) * vAlfa);",
    "}"
  ].join("\n");

  function materialPuntos(comunes, extra) {
    var u = {
      uTiempo: comunes.uTiempo,
      uEscala: comunes.uEscala,
      uTamMin: comunes.uTamMin,
      uBrillo: { value: 1 },
      uTitileo: { value: 1 }
    };
    if (extra) for (var k in extra) u[k] = extra[k];
    return new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: VS_PUNTOS,
      fragmentShader: FS_PUNTOS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }

  function color(hex) { return new THREE.Color(hex); }

  /* ---------- Galaxia espiral ---------- */

  function crearGalaxia(op, comunes, texturas) {
    var N = op.cantidad, R = op.radio, rnd = op.rnd;
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    var tam = new Float32Array(N), azr = new Float32Array(N);
    var cNucleo = color("#ffcf94"), cCalido = color("#ffe6c4"), cBlanco = color("#f2f0ff");
    var cAzul = color("#8eaeff"), cAzulProfundo = color("#6b83ff"), cRosa = color("#ff7fb6");
    var c = new THREE.Color();
    var brazos = 2, cotPaso = 3.1, r0 = 0.07 * R;

    for (var i = 0; i < N; i++) {
      var x, y, z, b, s, u = rnd();
      if (u < 0.15) {
        // Bulbo central, cálido y concentrado.
        var rr = Math.pow(rnd(), 1.7) * 0.24 * R;
        var th = rnd() * DOS_PI, ph = Math.acos(2 * rnd() - 1);
        x = rr * Math.sin(ph) * Math.cos(th);
        z = rr * Math.sin(ph) * Math.sin(th);
        y = rr * Math.cos(ph) * 0.55;
        c.copy(cNucleo).lerp(cCalido, rnd() * 0.7);
        b = 0.2 + rnd() * 0.3;
        s = 0.045 + rnd() * 0.045;
      } else if (u < 0.31) {
        // Disco difuso entre los brazos.
        var rd = R * Math.pow(rnd(), 0.75);
        var td = rnd() * DOS_PI;
        x = rd * Math.cos(td);
        z = rd * Math.sin(td);
        y = C.gauss(rnd) * 0.02 * R * (1.5 - rd / R);
        c.copy(cCalido).lerp(cAzul, C.pasoSuave(0.12, 0.9, rd / R));
        b = (0.16 + rnd() * 0.22) * (1.1 - 0.65 * rd / R);
        s = 0.04 + rnd() * 0.03;
      } else {
        // Brazos en espiral logarítmica.
        var brazo = Math.floor(rnd() * brazos);
        var r = r0 + (R - r0) * Math.pow(rnd(), 0.8);
        var ta = brazo * (DOS_PI / brazos) + cotPaso * Math.log(r / r0);
        var ancho = (0.03 + 0.08 * (r / R)) * R;
        var dx = C.gauss(rnd) * ancho, dz = C.gauss(rnd) * ancho;
        x = r * Math.cos(ta) + dx;
        z = r * Math.sin(ta) + dz;
        y = C.gauss(rnd) * 0.018 * R * (1.4 - r / R);
        var cresta = Math.exp(-(dx * dx + dz * dz) / (ancho * ancho * 0.4));
        var f = r / R;
        c.copy(cBlanco).lerp(cAzul, C.pasoSuave(0.08, 0.7, f)).lerp(cAzulProfundo, C.pasoSuave(0.7, 1, f) * 0.6);
        if (f < 0.25) c.lerp(cCalido, (0.25 - f) * 3);
        b = (0.28 + 0.55 * cresta) * (1.05 - 0.55 * f) * (0.6 + rnd() * 0.6);
        s = 0.04 + rnd() * 0.035;
        var k = rnd();
        if (k < 0.035 && f > 0.2 && cresta > 0.35) { c.copy(cRosa); b *= 1.7; s *= 1.9; }
        else if (k < 0.075) { c.lerp(cBlanco, 0.5); b *= 1.5; s *= 1.6; }
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = c.r * b; col[i * 3 + 1] = c.g * b; col[i * 3 + 2] = c.b * b;
      tam[i] = s;
      azr[i] = rnd();
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
    geo.setAttribute("aAzar", new THREE.BufferAttribute(azr, 1));
    var mat = materialPuntos(comunes);
    mat.uniforms.uTitileo.value = 0.6;
    var puntos = new THREE.Points(geo, mat);
    puntos.frustumCulled = false;

    var giro = new THREE.Group();
    giro.add(puntos);

    // Resplandor del núcleo y halo azul alrededor del disco.
    var nucleo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texturas.brillo, color: color("#ffc98a"), transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    nucleo.scale.set(R * 0.7, R * 0.7, 1);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texturas.brillo, color: color("#6f86ff"), transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    halo.scale.set(R * 3.2, R * 3.2, 1);
    giro.add(halo);
    giro.add(nucleo);

    // Nubes de gas a lo largo de los brazos.
    var tonos = ["#7a5cff", "#c060c0", "#4a6bff", "#40b4d4", "#ff7fa8"];
    var nebulosas = [];
    for (var j = 0; j < op.nebulosas; j++) {
      var bz = j % brazos;
      var rn = R * (0.22 + 0.72 * rnd());
      var tn = bz * (DOS_PI / brazos) + cotPaso * Math.log(rn / r0) + C.gauss(rnd) * 0.18;
      var spr = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texturas.nebulosas[j % texturas.nebulosas.length],
        color: color(tonos[Math.floor(rnd() * tonos.length)]),
        transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      var e = R * (0.35 + rnd() * 0.5);
      spr.scale.set(e, e, 1);
      spr.position.set(rn * Math.cos(tn), C.gauss(rnd) * 0.04 * R, rn * Math.sin(tn));
      spr.material.rotation = rnd() * DOS_PI;
      spr.userData.opacidad = 0.07 + rnd() * 0.12;
      giro.add(spr);
      nebulosas.push(spr);
    }

    var grupo = new THREE.Group();
    grupo.rotation.set(0.66, 0, 0.32);
    grupo.add(giro);
    return { grupo: grupo, giro: giro, material: mat, nucleo: nucleo, halo: halo, nebulosas: nebulosas };
  }

  /* ---------- Cielo profundo ---------- */

  function crearFondo(op, comunes, texturas) {
    var N = op.cantidad, rnd = op.rnd, radio = 900;
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    var tam = new Float32Array(N), azr = new Float32Array(N);
    var normal = new THREE.Vector3(0.3, 0.86, 0.42).normalize();
    var e1 = new THREE.Vector3(1, 0, 0).cross(normal).normalize();
    var e2 = normal.clone().cross(e1).normalize();
    var paleta = [color("#9db4ff"), color("#c9d6ff"), color("#f6f5ff"), color("#fff3e4"), color("#ffd6a8"), color("#ffb98a")];
    var pesos = [0.12, 0.24, 0.3, 0.18, 0.11, 0.05];
    var d = new THREE.Vector3();
    for (var i = 0; i < N; i++) {
      if (rnd() < 0.38) {
        var al = rnd() * DOS_PI;
        d.copy(e1).multiplyScalar(Math.cos(al)).addScaledVector(e2, Math.sin(al)).addScaledVector(normal, C.gauss(rnd) * 0.13).normalize();
      } else {
        d.set(C.gauss(rnd), C.gauss(rnd), C.gauss(rnd)).normalize();
      }
      pos[i * 3] = d.x * radio; pos[i * 3 + 1] = d.y * radio; pos[i * 3 + 2] = d.z * radio;
      var m = Math.pow(rnd(), 6);
      var q = rnd(), acum = 0, k = 0;
      for (; k < pesos.length - 1; k++) { acum += pesos[k]; if (q < acum) break; }
      var b = 0.32 + 0.68 * m + rnd() * 0.12;
      col[i * 3] = paleta[k].r * b; col[i * 3 + 1] = paleta[k].g * b; col[i * 3 + 2] = paleta[k].b * b;
      tam[i] = 0.8 + m * 4.6 + rnd() * 0.5;
      azr[i] = rnd();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
    geo.setAttribute("aAzar", new THREE.BufferAttribute(azr, 1));
    var mat = materialPuntos(comunes);
    var estrellas = new THREE.Points(geo, mat);
    estrellas.frustumCulled = false;

    var banda = new THREE.Mesh(
      new THREE.SphereGeometry(950, 48, 24),
      new THREE.MeshBasicMaterial({
        map: texturaBanda(op.semilla + 3, normal), side: THREE.BackSide, transparent: true,
        opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending
      })
    );
    var grupo = new THREE.Group();
    grupo.add(banda);
    grupo.add(estrellas);
    return { grupo: grupo, material: mat, banda: banda };
  }

  // Polvo cercano: da profundidad al girar.
  function crearPolvoCercano(op, comunes) {
    var N = op.cantidad, rnd = op.rnd;
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    var tam = new Float32Array(N), azr = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var r = 10 + Math.pow(rnd(), 0.6) * 46;
      var th = rnd() * DOS_PI, ph = Math.acos(2 * rnd() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      var b = 0.12 + rnd() * 0.3;
      col[i * 3] = 0.75 * b; col[i * 3 + 1] = 0.82 * b; col[i * 3 + 2] = 1.0 * b;
      tam[i] = 0.05 + rnd() * 0.14;
      azr[i] = rnd();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
    geo.setAttribute("aAzar", new THREE.BufferAttribute(azr, 1));
    var mat = materialPuntos(comunes);
    var puntos = new THREE.Points(geo, mat);
    puntos.frustumCulled = false;
    return { puntos: puntos, material: mat };
  }

  /* ---------- Ayudas para líneas gruesas (Line2) ---------- */

  function lineaNueva(puntos, opciones) {
    var geo = new THREE.LineGeometry();
    var arr = [];
    puntos.forEach(function (p) { arr.push(p.x, p.y, p.z); });
    geo.setPositions(arr);
    if (opciones.colores) geo.setColors(opciones.colores);
    var mat = new THREE.LineMaterial({
      color: opciones.color != null ? opciones.color : 0xffffff,
      linewidth: opciones.ancho || 1.5,
      transparent: true,
      opacity: opciones.opacidad != null ? opciones.opacidad : 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: !!opciones.colores,
      dashed: !!opciones.punteado,
      dashSize: opciones.guion || 0.2,
      gapSize: opciones.hueco || 0.15
    });
    var linea = new THREE.Line2(geo, mat);
    linea.frustumCulled = false;
    if (opciones.punteado) linea.computeLineDistances();
    return linea;
  }

  // Reescribe los puntos de una línea ya creada (misma cantidad de puntos).
  function moverLinea(linea, puntos) {
    var atr = linea.geometry.attributes.instanceStart;
    var arr = atr.data.array;
    for (var k = 0; k < puntos.length - 1; k++) {
      var a = puntos[k], b = puntos[k + 1], o = k * 6;
      arr[o] = a.x; arr[o + 1] = a.y; arr[o + 2] = a.z;
      arr[o + 3] = b.x; arr[o + 4] = b.y; arr[o + 5] = b.z;
    }
    atr.data.needsUpdate = true;
  }

  /* ---------- Constelación ---------- */

  var ORO = color("#f3dca8");
  var FRIO = color("#d3defd");

  function Constelacion(datos, indice, op) {
    var S = op.tam * (datos.escala || 1);
    var rnd = op.rnd;
    this.datos = datos;
    this.id = datos.id;
    this.indice = indice;
    this.S = S;
    this.acento = color(datos.color || "#f3dca8");

    this.grupo = new THREE.Group();
    this.grupo.position.copy(op.posicion);
    this.contenido = new THREE.Group();
    this.grupo.add(this.contenido);

    this.estrellas = datos.estrellas.map(function (e) {
      return {
        local: new THREE.Vector3((e[0] - 50) / 100 * S, (50 - e[1]) / 100 * S, (rnd() - 0.5) * 0.16 * S),
        brillo: e[2] == null ? 0.7 : e[2],
        luz: 0, luzObjetivo: 0, destello: 0
      };
    });
    var n = this.estrellas.length;
    var pos = new Float32Array(n * 3), brillo = new Float32Array(n);
    this.aLuz = new Float32Array(n);
    this.aDestello = new Float32Array(n);
    this.estrellas.forEach(function (e, i) {
      pos[i * 3] = e.local.x; pos[i * 3 + 1] = e.local.y; pos[i * 3 + 2] = e.local.z;
      brillo[i] = e.brillo;
    });
    // Estrella principal: por ella pasa el camino final.
    var principal = 0;
    this.estrellas.forEach(function (e, i) { if (e.brillo > this.estrellas[principal].brillo) principal = i; }, this);
    this.principal = principal;

    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aBrillo", new THREE.BufferAttribute(brillo, 1));
    geo.setAttribute("aLuz", new THREE.BufferAttribute(this.aLuz, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aDestello", new THREE.BufferAttribute(this.aDestello, 1).setUsage(THREE.DynamicDrawUsage));
    this.geo = geo;
    this.uniformes = {
      uEscala: op.comunes.uEscala,
      uTiempo: op.comunes.uTiempo,
      uTamMin: op.comunes.uTamMin,
      uOpacidad: { value: 0 },
      uTam: { value: S * 0.08 },
      uFrio: { value: FRIO.clone() },
      uOro: { value: ORO.clone() }
    };
    this.puntos = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: this.uniformes,
      vertexShader: VS_ESTRELLAS,
      fragmentShader: FS_ESTRELLAS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    this.puntos.frustumCulled = false;
    this.puntos.renderOrder = 3;

    // Halo de color detrás de la constelación: la hace reconocible de lejos.
    this.halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: op.texturas.nebulosas[indice % op.texturas.nebulosas.length],
      color: this.acento, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    this.halo.scale.set(S * 2.1, S * 2.1, 1);
    this.halo.position.z = -0.25 * S;
    this.contenido.add(this.halo);

    // Faro: un brillo que late en el centro y la señala desde lejos.
    this.faro = new THREE.Sprite(new THREE.SpriteMaterial({
      map: op.texturas.brillo, color: this.acento, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    this.faro.scale.set(S * 0.9, S * 0.9, 1);
    this.contenido.add(this.faro);
    this.faroValor = 0;
    this.faroObjetivo = 0;

    // Guías tenues de la figura.
    var self = this;
    var guia = [];
    (datos.trazos || []).forEach(function (t) {
      var a = self.estrellas[t[0]].local, b = self.estrellas[t[1]].local;
      guia.push(a.x, a.y, a.z, b.x, b.y, b.z);
    });
    var gGeo = new THREE.LineSegmentsGeometry();
    gGeo.setPositions(guia.length ? guia : [0, 0, 0, 0, 0, 0]);
    this.guias = new THREE.LineSegments2(gGeo, new THREE.LineMaterial({
      color: 0xcbd6ff, linewidth: 1, transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, dashed: true, dashSize: S * 0.018, gapSize: S * 0.03
    }));
    this.guias.computeLineDistances();
    this.guias.frustumCulled = false;
    this.contenido.add(this.guias);

    // Trazos de luz que se dibujan al encender sus dos estrellas.
    this.trazos = (datos.trazos || []).map(function (t) {
      var a = self.estrellas[t[0]].local;
      var linea = lineaNueva([a, a], {
        color: 0xf6e3b4, ancho: 1.7, opacidad: 0, punteado: t[2] === "punteado",
        guion: S * 0.035, hueco: S * 0.03
      });
      linea.renderOrder = 2;
      self.contenido.add(linea);
      return { a: t[0], b: t[1], punteado: t[2] === "punteado", linea: linea, progreso: 0, objetivo: 0, dibujado: 0 };
    });

    // Anillos (lente de la cámara, centro del sol).
    this.anillos = (datos.anillos || []).map(function (an) {
      var centro = self.estrellas[an.estrella].local, r = (an.radio || 10) / 100 * S, pts = [];
      for (var k = 0; k <= 72; k++) {
        var a = k / 72 * DOS_PI;
        pts.push(new THREE.Vector3(centro.x + Math.cos(a) * r, centro.y + Math.sin(a) * r, centro.z));
      }
      var linea = lineaNueva(pts, { color: 0xf6e3b4, ancho: 1.4, opacidad: 0 });
      self.contenido.add(linea);
      return { estrella: an.estrella, linea: linea };
    });

    this.contenido.add(this.puntos);

    this.visibilidad = 0;
    this.visibilidadObjetivo = 0;
    this.atenuacion = 1;
    this.atenuacionObjetivo = 1;
    this.guiasValor = 0;
    this.guiasObjetivo = 0;
    this.tamFactor = 1;
    this.tamObjetivo = 1;
    this.completa = false;
    this.brilloHalo = 0;
    this._temporizadores = [];
    this._a = new THREE.Vector3();
    this._b = new THREE.Vector3();
    this._pts = [new THREE.Vector3(), new THREE.Vector3()];
  }

  var PC = Constelacion.prototype;

  PC.encender = function (i, op) {
    var e = this.estrellas[i];
    if (!e) return;
    var nueva = e.luzObjetivo < 1;
    e.luzObjetivo = 1;
    if (!(op && op.sinDestello)) e.destello = 1;
    if (nueva) this._revisarTrazos();
    return nueva;
  };

  PC._revisarTrazos = function () {
    var es = this.estrellas;
    this.trazos.forEach(function (t) {
      if (t.objetivo === 0 && es[t.a].luzObjetivo > 0.5 && es[t.b].luzObjetivo > 0.5) t.objetivo = 1;
    });
  };

  PC.encendidas = function () {
    return this.estrellas.filter(function (e) { return e.luzObjetivo > 0.5; }).length;
  };

  // Enciende las estrellas que faltan, una tras otra.
  PC.encenderTodo = function (intervalo, alCadaUna, alTerminar) {
    var self = this, pendientes = [];
    this.estrellas.forEach(function (e, i) { if (e.luzObjetivo < 1) pendientes.push(i); });
    var k = 0;
    function siguiente() {
      if (k >= pendientes.length) {
        self.completa = true;
        if (alTerminar) alTerminar();
        return;
      }
      var i = pendientes[k++];
      self.encender(i);
      if (alCadaUna) alCadaUna(i, k - 1);
      self._temporizadores.push(setTimeout(siguiente, intervalo));
    }
    siguiente();
  };

  PC.completar = function (instantaneo) {
    this.estrellas.forEach(function (e) {
      e.luzObjetivo = 1;
      if (instantaneo) e.luz = 1;
    });
    this.trazos.forEach(function (t) {
      t.objetivo = 1;
      if (instantaneo) t.progreso = 1;
    });
    this.completa = true;
    if (instantaneo) this.brilloHalo = 1;
  };

  PC.reiniciar = function () {
    this._temporizadores.forEach(clearTimeout);
    this._temporizadores = [];
    this.estrellas.forEach(function (e) { e.luz = 0; e.luzObjetivo = 0; e.destello = 0; });
    this.trazos.forEach(function (t) { t.progreso = 0; t.objetivo = 0; t.dibujado = -1; });
    this.completa = false;
    this.brilloHalo = 0;
    this.contenido.position.set(0, 0, 0);
  };

  PC.mundo = function (i, destino) {
    destino = destino || new THREE.Vector3();
    destino.copy(this.estrellas[i].local);
    return this.contenido.localToWorld(destino);
  };

  PC.centroMundo = function (destino) {
    destino = destino || new THREE.Vector3();
    return this.grupo.getWorldPosition(destino);
  };

  PC.actualizar = function (dt, camara) {
    // Mira siempre hacia la cámara (solo gira sobre su eje vertical): la figura se lee desde cualquier lado.
    var dx = camara.position.x - this.grupo.position.x, dz = camara.position.z - this.grupo.position.z;
    this.grupo.rotation.set(0, Math.atan2(dx, dz), 0);

    this.visibilidad = C.amortiguar(this.visibilidad, this.visibilidadObjetivo, 3, dt);
    this.atenuacion = C.amortiguar(this.atenuacion, this.atenuacionObjetivo, 3, dt);
    this.guiasValor = C.amortiguar(this.guiasValor, this.guiasObjetivo, 3, dt);
    this.tamFactor = C.amortiguar(this.tamFactor, this.tamObjetivo, 3, dt);
    this.brilloHalo = C.amortiguar(this.brilloHalo, this.completa ? 1 : 0, 1.2, dt);
    var vis = this.visibilidad * this.atenuacion;
    this.uniformes.uOpacidad.value = vis;
    this.uniformes.uTam.value = this.S * 0.08 * this.tamFactor;

    var es = this.estrellas, cambio = false;
    for (var i = 0; i < es.length; i++) {
      var e = es[i];
      var luz = C.amortiguar(e.luz, e.luzObjetivo, 5, dt);
      var dest = Math.max(0, e.destello - dt * 1.5);
      if (Math.abs(luz - e.luz) > 1e-4 || dest !== e.destello) cambio = true;
      e.luz = luz; e.destello = dest;
      this.aLuz[i] = luz;
      this.aDestello[i] = dest * dest;
    }
    if (cambio) {
      this.geo.attributes.aLuz.needsUpdate = true;
      this.geo.attributes.aDestello.needsUpdate = true;
    }

    for (var k = 0; k < this.trazos.length; k++) {
      var t = this.trazos[k];
      if (t.progreso < t.objetivo) t.progreso = Math.min(t.objetivo, t.progreso + dt / 0.55);
      else if (t.progreso > t.objetivo) t.progreso = t.objetivo;
      if (t.progreso !== t.dibujado) {
        var a = es[t.a].local, b = es[t.b].local, p = C.salida(t.progreso);
        this._pts[0].copy(a);
        this._pts[1].copy(a).lerp(b, Math.max(0.0001, p));
        moverLinea(t.linea, this._pts);
        if (t.punteado) t.linea.computeLineDistances();
        t.dibujado = t.progreso;
      }
      t.linea.material.opacity = vis * 0.9 * Math.min(1, t.progreso * 4);
      t.linea.visible = t.progreso > 0.001 && vis > 0.01;
    }
    this.guias.material.opacity = vis * this.guiasValor;
    this.guias.visible = this.guiasValor * vis > 0.005;
    for (var m = 0; m < this.anillos.length; m++) {
      var an = this.anillos[m];
      an.linea.material.opacity = vis * 0.8 * es[an.estrella].luz;
      an.linea.visible = es[an.estrella].luz > 0.01 && vis > 0.01;
    }
    this.halo.material.opacity = vis * (0.09 + 0.2 * this.brilloHalo);
    this.faroValor = C.amortiguar(this.faroValor, this.faroObjetivo, 2.5, dt);
    var latido = 0.75 + 0.25 * Math.sin(this.uniformes.uTiempo.value * 2.1 + this.indice * 1.3);
    this.faro.material.opacity = vis * this.faroValor * latido * (this.completa ? 0.42 : 0.3);
    this.faro.visible = this.faroValor * vis > 0.01;
  };

  /* ---------- Efectos ---------- */

  function Chispas(capacidad, comunes) {
    this.n = capacidad;
    this.pos = new Float32Array(capacidad * 3);
    this.col = new Float32Array(capacidad * 3);
    this.tam = new Float32Array(capacidad);
    this.azr = new Float32Array(capacidad);
    this.vel = new Float32Array(capacidad * 3);
    this.base = new Float32Array(capacidad * 3);
    this.tamBase = new Float32Array(capacidad);
    this.vida = new Float32Array(capacidad);
    this.vidaMax = new Float32Array(capacidad);
    this.freno = new Float32Array(capacidad);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aColor", new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aTam", new THREE.BufferAttribute(this.tam, 1).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("aAzar", new THREE.BufferAttribute(this.azr, 1));
    this.geo = geo;
    var mat = materialPuntos(comunes);
    mat.uniforms.uTitileo.value = 0;
    mat.uniforms.uBrillo.value = 1.5;
    this.puntos = new THREE.Points(geo, mat);
    this.puntos.frustumCulled = false;
    this.puntos.renderOrder = 5;
    this.cursor = 0;
    this.activas = 0;
    this.rnd = C.azar(91);
  }

  Chispas.prototype.emitir = function (centro, cantidad, op) {
    op = op || {};
    var rnd = this.rnd, col = op.color || ORO, vel = op.velocidad != null ? op.velocidad : 2;
    var vida = op.vida || 1.2, tam = op.tam || 0.12, disp = op.dispersion || 0;
    var dir = op.direccion;
    for (var i = 0; i < cantidad; i++) {
      var k = this.cursor;
      this.cursor = (this.cursor + 1) % this.n;
      var x = C.gauss(rnd), y = C.gauss(rnd), z = C.gauss(rnd) * 0.6;
      var l = Math.sqrt(x * x + y * y + z * z) || 1;
      x /= l; y /= l; z /= l;
      var v = vel * (0.35 + rnd() * 0.85);
      this.pos[k * 3] = centro.x + x * disp * rnd();
      this.pos[k * 3 + 1] = centro.y + y * disp * rnd();
      this.pos[k * 3 + 2] = centro.z + z * disp * rnd();
      this.vel[k * 3] = x * v + (dir ? dir.x : 0);
      this.vel[k * 3 + 1] = y * v + (dir ? dir.y : 0);
      this.vel[k * 3 + 2] = z * v + (dir ? dir.z : 0);
      var mezcla = rnd() * 0.5;
      this.base[k * 3] = col.r + (1 - col.r) * mezcla;
      this.base[k * 3 + 1] = col.g + (1 - col.g) * mezcla;
      this.base[k * 3 + 2] = col.b + (1 - col.b) * mezcla;
      this.tamBase[k] = tam * (0.5 + rnd());
      this.vidaMax[k] = this.vida[k] = vida * (0.55 + rnd() * 0.7);
      this.freno[k] = op.freno != null ? op.freno : 2.2;
      this.azr[k] = rnd();
    }
    this.activas = this.n;
    this.geo.attributes.aAzar.needsUpdate = true;
  };

  Chispas.prototype.actualizar = function (dt) {
    if (!this.activas) return;
    var vivas = 0;
    for (var k = 0; k < this.n; k++) {
      if (this.vida[k] <= 0) { this.tam[k] = 0; continue; }
      vivas++;
      this.vida[k] -= dt;
      var f = Math.exp(-this.freno[k] * dt);
      this.vel[k * 3] *= f; this.vel[k * 3 + 1] *= f; this.vel[k * 3 + 2] *= f;
      this.pos[k * 3] += this.vel[k * 3] * dt;
      this.pos[k * 3 + 1] += this.vel[k * 3 + 1] * dt;
      this.pos[k * 3 + 2] += this.vel[k * 3 + 2] * dt;
      var a = Math.max(0, this.vida[k] / this.vidaMax[k]);
      var aa = Math.pow(a, 1.4);
      this.col[k * 3] = this.base[k * 3] * aa;
      this.col[k * 3 + 1] = this.base[k * 3 + 1] * aa;
      this.col[k * 3 + 2] = this.base[k * 3 + 2] * aa;
      this.tam[k] = this.tamBase[k] * (0.35 + 0.65 * a);
    }
    this.activas = vivas;
    var at = this.geo.attributes;
    at.position.needsUpdate = true;
    at.aColor.needsUpdate = true;
    at.aTam.needsUpdate = true;
  };

  function Ondas(cantidad, escena) {
    this.lista = [];
    var geo = new THREE.RingGeometry(0.93, 1, 96);
    for (var i = 0; i < cantidad; i++) {
      var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
        depthWrite: false, side: THREE.DoubleSide
      }));
      m.visible = false;
      m.renderOrder = 6;
      escena.add(m);
      this.lista.push({ malla: m, edad: 0, dur: 1, radio: 1, activa: false });
    }
    this.cursor = 0;
  }
  Ondas.prototype.emitir = function (pos, radio, col, dur) {
    var o = this.lista[this.cursor];
    this.cursor = (this.cursor + 1) % this.lista.length;
    o.malla.position.copy(pos);
    o.malla.material.color.copy(col || ORO);
    o.radio = radio;
    o.dur = dur || 1.4;
    o.edad = 0;
    o.activa = true;
    o.malla.visible = true;
  };
  Ondas.prototype.actualizar = function (dt, camara) {
    for (var i = 0; i < this.lista.length; i++) {
      var o = this.lista[i];
      if (!o.activa) continue;
      o.edad += dt;
      var p = o.edad / o.dur;
      if (p >= 1) { o.activa = false; o.malla.visible = false; continue; }
      var e = o.radio * (0.04 + 0.96 * C.salida(p));
      o.malla.scale.set(e, e, e);
      o.malla.material.opacity = Math.pow(1 - p, 1.6) * 0.6;
      o.malla.quaternion.copy(camara.quaternion);
    }
  };

  function Destellos(cantidad, textura, escena) {
    this.lista = [];
    for (var i = 0; i < cantidad; i++) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: textura, color: 0xffffff, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      }));
      s.visible = false;
      s.renderOrder = 7;
      escena.add(s);
      this.lista.push({ sprite: s, edad: 0, dur: 1, escala: 1, activa: false });
    }
    this.cursor = 0;
  }
  Destellos.prototype.emitir = function (pos, escala, col, dur) {
    var d = this.lista[this.cursor];
    this.cursor = (this.cursor + 1) % this.lista.length;
    d.sprite.position.copy(pos);
    d.sprite.material.color.copy(col || ORO);
    d.escala = escala;
    d.dur = dur || 1;
    d.edad = 0;
    d.activa = true;
    d.sprite.visible = true;
  };
  Destellos.prototype.actualizar = function (dt) {
    for (var i = 0; i < this.lista.length; i++) {
      var d = this.lista[i];
      if (!d.activa) continue;
      d.edad += dt;
      var p = d.edad / d.dur;
      if (p >= 1) { d.activa = false; d.sprite.visible = false; continue; }
      var e = d.escala * (0.25 + 0.75 * C.salida(Math.min(1, p * 3.5)));
      d.sprite.scale.set(e, e, 1);
      d.sprite.material.opacity = p < 0.22 ? 1 : Math.pow(1 - (p - 0.22) / 0.78, 2);
    }
  };

  // Estrellas fugaces que cruzan por delante de la cámara.
  function Meteoros(cantidad, escena, textura) {
    this.lista = [];
    this.rnd = C.azar(404);
    var cols = [];
    var tramos = 10;
    for (var k = 0; k <= tramos; k++) {
      var a = Math.pow(1 - k / tramos, 1.8);
      cols.push(a, a * 0.97, a * 0.9);
    }
    for (var i = 0; i < cantidad; i++) {
      var pts = [];
      for (var j = 0; j <= tramos; j++) pts.push(new THREE.Vector3());
      var linea = lineaNueva(pts, { colores: cols, ancho: 1.8, opacidad: 0 });
      linea.visible = false;
      var cabeza = new THREE.Sprite(new THREE.SpriteMaterial({
        map: textura, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      cabeza.visible = false;
      escena.add(linea);
      escena.add(cabeza);
      this.lista.push({ linea: linea, cabeza: cabeza, pts: pts, inicio: new THREE.Vector3(), dir: new THREE.Vector3(), largo: 1, dist: 1, edad: 0, dur: 1, activa: false });
    }
  }
  Meteoros.prototype.lanzar = function (camara, op) {
    op = op || {};
    var m = null;
    for (var i = 0; i < this.lista.length; i++) if (!this.lista[i].activa) { m = this.lista[i]; break; }
    if (!m) return;
    var rnd = this.rnd;
    var adelante = new THREE.Vector3(), derecha = new THREE.Vector3(), arriba = new THREE.Vector3();
    camara.getWorldDirection(adelante);
    derecha.crossVectors(adelante, camara.up).normalize();
    arriba.crossVectors(derecha, adelante).normalize();
    var dist = 40 + rnd() * 60;
    var alto = Math.tan(camara.fov * Math.PI / 360) * dist;
    var ancho = alto * camara.aspect;
    var lado = rnd() < 0.5 ? -1 : 1;
    m.inicio.copy(camara.position).addScaledVector(adelante, dist)
      .addScaledVector(derecha, lado * ancho * (0.1 + rnd() * 0.8))
      .addScaledVector(arriba, alto * (0.35 + rnd() * 0.65));
    m.dir.copy(derecha).multiplyScalar(-lado * (0.65 + rnd() * 0.3)).addScaledVector(arriba, -(0.45 + rnd() * 0.35)).normalize();
    m.dist = ancho * (0.7 + rnd() * 0.7) * (op.lejos ? 1.4 : 1);
    m.largo = m.dist * 0.32;
    m.dur = (0.75 + rnd() * 0.55) * (op.lento ? 1.5 : 1);
    m.edad = 0;
    m.activa = true;
    m.linea.visible = true;
    m.cabeza.visible = true;
    var e = alto * 0.035;
    m.cabeza.scale.set(e, e, 1);
  };
  Meteoros.prototype.actualizar = function (dt) {
    for (var i = 0; i < this.lista.length; i++) {
      var m = this.lista[i];
      if (!m.activa) continue;
      m.edad += dt;
      var p = m.edad / m.dur;
      if (p >= 1) { m.activa = false; m.linea.visible = false; m.cabeza.visible = false; continue; }
      var avance = C.salida(p) * m.dist;
      var largo = m.largo * Math.sin(Math.PI * Math.min(1, p * 1.15));
      for (var k = 0; k < m.pts.length; k++) {
        var t = avance - largo * k / (m.pts.length - 1);
        m.pts[k].copy(m.inicio).addScaledVector(m.dir, Math.max(0, t));
      }
      moverLinea(m.linea, m.pts);
      var a = Math.sin(Math.PI * p);
      m.linea.material.opacity = a;
      m.cabeza.position.copy(m.pts[0]);
      m.cabeza.material.opacity = a * 0.9;
    }
  };

  /* ---------- Polvo de estrellas que forma figuras ---------- */

  function Polvo(cantidad, op) {
    this.n = cantidad;
    var rnd = op.rnd || C.azar(5);
    var inicio = new Float32Array(cantidad * 3), destino = new Float32Array(cantidad * 3);
    var col = new Float32Array(cantidad * 3), azar = new Float32Array(cantidad * 4);
    var radio = op.radioLibre || 1;
    for (var i = 0; i < cantidad; i++) {
      // Nube libre: un disco grueso alrededor del centro, más denso por dentro.
      var r = radio * (0.25 + 0.75 * Math.pow(rnd(), 0.6));
      var a = rnd() * DOS_PI;
      inicio[i * 3] = Math.cos(a) * r;
      inicio[i * 3 + 1] = Math.sin(a) * r * (op.aplanado || 1);
      inicio[i * 3 + 2] = C.gauss(rnd) * radio * 0.25;
      azar[i * 4] = rnd();
      azar[i * 4 + 1] = rnd();
      azar[i * 4 + 2] = rnd();
      azar[i * 4 + 3] = rnd();
      col[i * 3] = 1; col[i * 3 + 1] = 0.9; col[i * 3 + 2] = 0.75;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(inicio, 3));
    geo.setAttribute("aDestino", new THREE.BufferAttribute(destino, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aAzar", new THREE.BufferAttribute(azar, 4));
    this.geo = geo;
    this.uniformes = {
      uTiempo: op.comunes.uTiempo,
      uEscala: op.comunes.uEscala,
      uTamMin: op.comunes.uTamMin,
      uProgreso: { value: 0 },
      uRemolino: { value: 1 },
      uPulso: { value: 0 },
      uDispersion: { value: 0 },
      uTam: { value: op.tam || 0.05 },
      uTamLibre: { value: op.tamLibre || 0.06 },
      uOpacidad: { value: 0 },
      uTemblor: { value: op.temblor != null ? op.temblor : 0.004 },
      uColorLibre: { value: (op.colorLibre || color("#f6e6c4")).clone() },
      uNitidez: { value: op.nitidez || 0 }
    };
    this.puntos = new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: this.uniformes,
      vertexShader: VS_POLVO,
      fragmentShader: FS_POLVO,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    this.puntos.frustumCulled = false;
    this.puntos.renderOrder = 4;
  }

  // destinos: Float32Array (x, y, z) y colores: Float32Array (r, g, b, lineales). Si hay menos
  // puntos que partículas, se repiten al azar; si hay más, se toma una muestra.
  Polvo.prototype.fijarFigura = function (destinos, colores, rnd) {
    rnd = rnd || C.azar(17);
    var m = destinos.length / 3, d = this.geo.attributes.aDestino.array, c = this.geo.attributes.aColor.array;
    for (var i = 0; i < this.n; i++) {
      var k = m >= this.n ? Math.floor(i * m / this.n) : (i < m ? i : Math.floor(rnd() * m));
      d[i * 3] = destinos[k * 3]; d[i * 3 + 1] = destinos[k * 3 + 1]; d[i * 3 + 2] = destinos[k * 3 + 2];
      if (colores) {
        c[i * 3] = colores[k * 3]; c[i * 3 + 1] = colores[k * 3 + 1]; c[i * 3 + 2] = colores[k * 3 + 2];
      }
    }
    this.geo.attributes.aDestino.needsUpdate = true;
    this.geo.attributes.aColor.needsUpdate = true;
  };

  Polvo.prototype.destruir = function () {
    if (this.puntos.parent) this.puntos.parent.remove(this.puntos);
    this.geo.dispose();
    this.puntos.material.dispose();
  };

  /* ---------- Figuras para el polvo ---------- */

  // Corazón en volumen (para "Siempre tú"), centrado y de alto ~2*tam.
  function figuraCorazon(cantidad, tam, rnd) {
    var out = new Float32Array(cantidad * 3);
    for (var i = 0; i < cantidad; i++) {
      var t = rnd() * DOS_PI;
      var borde = rnd() < 0.42;
      var r = borde ? 0.94 + rnd() * 0.06 : Math.sqrt(rnd());
      var x = 16 * Math.pow(Math.sin(t), 3);
      var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      x = x / 17 * r; y = (y + 2.5) / 17 * r;
      var grosor = 0.42 * Math.sqrt(Math.max(0, 1 - r * r)) + 0.04;
      out[i * 3] = x * tam;
      out[i * 3 + 1] = y * tam;
      out[i * 3 + 2] = (rnd() * 2 - 1) * grosor * tam;
    }
    return out;
  }

  // Marco de luz (si la foto no se puede leer, el polvo forma un marco y la foto aparece en la tarjeta).
  function figuraMarco(cantidad, ancho, alto, rnd) {
    var out = new Float32Array(cantidad * 3), col = new Float32Array(cantidad * 3);
    var oro = color("#f3d9a0"), crema = color("#fff5e6");
    for (var i = 0; i < cantidad; i++) {
      var x, y;
      if (rnd() < 0.55) {
        var per = rnd() * 2 * (ancho + alto);
        if (per < ancho) { x = per - ancho / 2; y = alto / 2; }
        else if (per < ancho + alto) { x = ancho / 2; y = alto / 2 - (per - ancho); }
        else if (per < 2 * ancho + alto) { x = ancho / 2 - (per - ancho - alto); y = -alto / 2; }
        else { x = -ancho / 2; y = -alto / 2 + (per - 2 * ancho - alto); }
        x += C.gauss(rnd) * ancho * 0.006;
        y += C.gauss(rnd) * ancho * 0.006;
        col[i * 3] = oro.r; col[i * 3 + 1] = oro.g; col[i * 3 + 2] = oro.b;
      } else {
        x = (rnd() - 0.5) * ancho * 0.96;
        y = (rnd() - 0.5) * alto * 0.96;
        var b = 0.18 + 0.25 * rnd();
        col[i * 3] = crema.r * b; col[i * 3 + 1] = crema.g * b; col[i * 3 + 2] = crema.b * b;
      }
      out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = 0;
    }
    return { destinos: out, colores: col };
  }

  // Muestrea una imagen en una cuadrícula de colores. Si el navegador no deja leer
  // sus píxeles (por ejemplo, al abrir el archivo con doble clic), devuelve datos: null.
  function muestrearImagen(src, presupuesto, alListo) {
    if (!src) { alListo(null); return; }
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      var w = img.naturalWidth || 800, h = img.naturalHeight || 600;
      var aspecto = C.limitar(w / h, 0.5, 2.2);
      var cols = Math.max(20, Math.round(Math.sqrt(presupuesto * aspecto)));
      var filas = Math.max(16, Math.round(cols / aspecto));
      var c = lienzo(cols, filas), g = c.getContext("2d");
      try {
        g.drawImage(img, 0, 0, cols, filas);
        var datos = g.getImageData(0, 0, cols, filas).data;
        alListo({ cols: cols, filas: filas, datos: datos, aspecto: aspecto });
      } catch (e) {
        alListo({ cols: cols, filas: filas, datos: null, aspecto: aspecto });
      }
    };
    img.onerror = function () { alListo(null); };
    img.src = src;
  }

  function figuraImagen(muestra, ancho) {
    var cols = muestra.cols, filas = muestra.filas, n = cols * filas;
    var alto = ancho / muestra.aspecto;
    var out = new Float32Array(n * 3), col = new Float32Array(n * 3);
    var d = muestra.datos;
    for (var j = 0; j < filas; j++) {
      for (var i = 0; i < cols; i++) {
        var k = j * cols + i, o = k * 4;
        out[k * 3] = ((i + 0.5) / cols - 0.5) * ancho;
        out[k * 3 + 1] = (0.5 - (j + 0.5) / filas) * alto;
        out[k * 3 + 2] = 0;
        // De sRGB a lineal, con un poco más de luz para que brille en el cielo.
        col[k * 3] = Math.pow(d[o] / 255, 2.2) * 1.15;
        col[k * 3 + 1] = Math.pow(d[o + 1] / 255, 2.2) * 1.15;
        col[k * 3 + 2] = Math.pow(d[o + 2] / 255, 2.2) * 1.15;
      }
    }
    return { destinos: out, colores: col, alto: alto, celda: ancho / cols };
  }

  // Texto escrito con estrellas (el nombre en el final). Lee un lienzo propio: siempre se puede.
  function figuraTexto(texto, fuente, ancho, presupuesto, rnd) {
    var alto = 200;
    var c = lienzo(8, 8), g = c.getContext("2d");
    g.font = alto + "px " + fuente;
    var medida = Math.ceil(g.measureText(texto).width + alto * 0.8);
    c.width = Math.min(4096, medida);
    c.height = Math.ceil(alto * 1.7);
    g = c.getContext("2d");
    g.font = alto + "px " + fuente;
    g.fillStyle = "#fff";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(texto, c.width / 2, c.height * 0.52);
    var datos = g.getImageData(0, 0, c.width, c.height).data;
    var candidatos = [];
    var paso = 2;
    var minX = c.width, maxX = 0;
    for (var y = 0; y < c.height; y += paso) {
      for (var x = 0; x < c.width; x += paso) {
        if (datos[(y * c.width + x) * 4 + 3] > 110) {
          candidatos.push(x, y);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    var total = candidatos.length / 2;
    var escala = ancho / Math.max(1, maxX - minX);
    var out = new Float32Array(presupuesto * 3);
    for (var i = 0; i < presupuesto; i++) {
      var k = Math.floor(rnd() * total);
      out[i * 3] = (candidatos[k * 2] - (minX + maxX) / 2 + (rnd() - 0.5) * paso) * escala;
      out[i * 3 + 1] = -(candidatos[k * 2 + 1] - c.height * 0.52 + (rnd() - 0.5) * paso) * escala;
      out[i * 3 + 2] = (rnd() - 0.5) * 0.04 * ancho;
    }
    return out;
  }

  /* ---------- Camino en forma de corazón ---------- */

  function calcularCorazon(op) {
    var M = 1600, crudo = [], largo = [0];
    for (var j = 0; j <= M; j++) {
      var t = Math.PI + DOS_PI * j / M;
      var x = 16 * Math.pow(Math.sin(t), 3);
      var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      crudo.push([x, y]);
      if (j > 0) {
        var a = crudo[j - 1];
        largo.push(largo[j - 1] + Math.hypot(x - a[0], y - a[1]));
      }
    }
    var total = largo[M];
    function enFraccion(s) {
      var objetivo = s * total, k = 1;
      while (k < M && largo[k] < objetivo) k++;
      var l0 = largo[k - 1], l1 = largo[k], f = (objetivo - l0) / Math.max(1e-6, l1 - l0);
      var a = crudo[k - 1], b = crudo[k];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    function profundidad(s) {
      return op.profundidad * (0.8 * Math.sin(4 * Math.PI * s) + 0.3 * Math.sin(2 * Math.PI * s)) +
        op.realce * Math.exp(-Math.pow((s - 0.5) / 0.11, 2));
    }
    function punto(s) {
      var p = enFraccion(s);
      return new THREE.Vector3(p[0] * op.escala, p[1] * op.escala + op.dy, profundidad(s));
    }
    var puntos = [];
    for (var i = 0; i <= op.puntos; i++) puntos.push(punto(i / op.puntos));
    var fracciones = [], posiciones = [];
    for (var c = 1; c <= op.cantidad; c++) {
      var f = c / (op.cantidad + 1);
      fracciones.push(f);
      posiciones.push(punto(f));
    }
    return { puntos: puntos, fracciones: fracciones, posiciones: posiciones };
  }

  function Camino(datos, textura) {
    this.puntos = datos.puntos;
    this.fracciones = datos.fracciones;
    this.n = this.puntos.length;
    this.linea = lineaNueva(this.puntos, { color: 0xf8e6b8, ancho: 2.1, opacidad: 0 });
    this.resplandor = lineaNueva(this.puntos, { color: 0xd8b878, ancho: 10, opacidad: 0 });
    this.linea.renderOrder = 8;
    this.resplandor.renderOrder = 7;
    this.cabeza = new THREE.Sprite(new THREE.SpriteMaterial({
      map: textura, color: 0xfff4dc, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    this.cabeza.scale.set(3, 3, 1);
    this.grupo = new THREE.Group();
    this.grupo.add(this.resplandor);
    this.grupo.add(this.linea);
    this.grupo.add(this.cabeza);
    this.progreso = 0;
    this.intensidad = 0;
    this.intensidadObjetivo = 0;
    this.cabezaVisible = 0;
    this.fijarProgreso(0);
  }
  Camino.prototype.fijarProgreso = function (p) {
    this.progreso = C.limitar(p, 0, 1);
    var segmentos = this.n - 1;
    var exacto = this.progreso * segmentos;
    var k = Math.floor(exacto);
    this.linea.geometry.instanceCount = k;
    this.resplandor.geometry.instanceCount = k;
    var a = this.puntos[Math.min(k, segmentos)], b = this.puntos[Math.min(k + 1, segmentos)];
    this.cabeza.position.copy(a).lerp(b, exacto - k);
  };
  Camino.prototype.actualizar = function (dt, t) {
    this.intensidad = C.amortiguar(this.intensidad, this.intensidadObjetivo, 2.5, dt);
    var latido = 1 + 0.12 * Math.sin(t * 2.4);
    this.linea.material.opacity = 0.95 * this.intensidad;
    this.resplandor.material.opacity = 0.13 * this.intensidad * latido;
    this.linea.visible = this.resplandor.visible = this.intensidad > 0.005 && this.progreso > 0;
    this.cabeza.material.opacity = this.cabezaVisible * this.intensidad;
    this.cabeza.visible = this.cabezaVisible > 0.01;
  };

  /* ---------- Universo ---------- */

  var ACENTOS = ["#ffb48c", "#ff93bd", "#ffd27a", "#8fc6ff", "#ff7096"];

  function Universo(lienzoGL, config, op) {
    op = op || {};
    var movil = !!op.movil;
    this.config = config;
    this.movil = movil;
    this.R = 10;
    this.S = 6.2;
    var densidad = C.limitar(Number((config.cielo || {}).densidad) || 1, 0.3, 1.6);
    var semilla = (config.cielo || {}).semilla || 7;
    var rnd = C.azar(semilla);

    var renderer = new THREE.WebGLRenderer({
      canvas: lienzoGL, antialias: false, alpha: false, stencil: false,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x080d21, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    this.renderer = renderer;

    var escena = new THREE.Scene();
    escena.background = color("#080d21");
    this.escena = escena;
    this.camara = new THREE.PerspectiveCamera(50, 1, 0.1, 4000);

    this.comunes = { uTiempo: { value: 0 }, uEscala: { value: 600 }, uTamMin: { value: 1.5 } };
    this.texturas = {
      brillo: texturaBrillo(),
      nebulosas: [texturaNebulosa(3), texturaNebulosa(11), texturaNebulosa(27)]
    };

    this.fondo = crearFondo({ cantidad: Math.round((movil ? 5200 : 9000) * densidad), rnd: rnd, semilla: semilla }, this.comunes, this.texturas);
    escena.add(this.fondo.grupo);

    this.galaxia = crearGalaxia({
      cantidad: Math.round((movil ? 52000 : 110000) * densidad), radio: this.R, rnd: rnd,
      nebulosas: movil ? 22 : 34
    }, this.comunes, this.texturas);
    escena.add(this.galaxia.grupo);

    this.polvoCercano = crearPolvoCercano({ cantidad: movil ? 260 : 480, rnd: rnd }, this.comunes);
    escena.add(this.polvoCercano.puntos);

    var lista = config.constelaciones || [];
    this.corazon = calcularCorazon({
      escala: 0.86, dy: 2.1, profundidad: 4, realce: 2.6, puntos: 420, cantidad: lista.length
    });
    var self = this;
    this.constelaciones = lista.map(function (d, i) {
      var c = new Constelacion(d, i, {
        tam: self.S, posicion: self.corazon.posiciones[i], rnd: rnd, comunes: self.comunes,
        texturas: self.texturas
      });
      if (!d.color) {
        c.acento.set(ACENTOS[i % ACENTOS.length]);
        c.halo.material.color.copy(c.acento);
        c.faro.material.color.copy(c.acento);
      }
      escena.add(c.grupo);
      return c;
    });
    this.porId = {};
    this.constelaciones.forEach(function (c) { self.porId[c.id] = c; });

    this.camino = new Camino(this.corazon, this.texturas.brillo);
    escena.add(this.camino.grupo);

    this.chispas = new Chispas(movil ? 1200 : 1800, this.comunes);
    escena.add(this.chispas.puntos);
    this.ondas = new Ondas(10, escena);
    this.destellos = new Destellos(12, this.texturas.brillo, escena);
    this.meteoros = new Meteoros(5, escena, this.texturas.brillo);

    // Resplandor cinematográfico.
    this.compositor = new THREE.EffectComposer(renderer);
    this.compositor.addPass(new THREE.RenderPass(escena, this.camara));
    this.bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), 0.8, 0.3, 0.24);
    this.compositor.addPass(this.bloom);
    this.compositor.addPass(new THREE.OutputPass());
    this.conResplandor = true;

    this.brilloGalaxia = 1;
    this.brilloGalaxiaObjetivo = 1;
    this.fuerzaObjetivo = 0.8;
    this.giroGalaxia = 0.016;
    this.ancho = 1;
    this.alto = 1;
    this.dpr = 1;

    this._v = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
    this._plano = new THREE.Plane();
    this._rayo = new THREE.Raycaster();
    this._ndc = new THREE.Vector2();
    this._q = new THREE.Quaternion();
  }

  var PU = Universo.prototype;

  PU.dimensionar = function (ancho, alto, dpr) {
    this.ancho = ancho;
    this.alto = alto;
    this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(ancho, alto, false);
    this.compositor.setPixelRatio(dpr);
    this.compositor.setSize(ancho, alto);
    var cam = this.camara;
    cam.aspect = ancho / alto;
    cam.fov = cam.aspect < 0.8 ? 56 : 44;
    cam.updateProjectionMatrix();
    this.comunes.uEscala.value = alto * dpr / (2 * Math.tan(cam.fov * Math.PI / 360));
    this.comunes.uTamMin.value = 1.25 * dpr;
  };

  PU.fijarResplandor = function (activo) {
    this.conResplandor = activo;
    this.bloom.enabled = activo;
  };

  PU.actualizar = function (dt, t, reducido) {
    this.comunes.uTiempo.value = t;
    var g = this.galaxia;
    if (!reducido) g.giro.rotation.y += dt * this.giroGalaxia;
    this.brilloGalaxia = C.amortiguar(this.brilloGalaxia, this.brilloGalaxiaObjetivo, 2.2, dt);
    var b = this.brilloGalaxia;
    g.material.uniforms.uBrillo.value = b;
    g.material.uniforms.uTitileo.value = reducido ? 0 : 0.6;
    this.fondo.material.uniforms.uTitileo.value = reducido ? 0 : 1;
    g.nucleo.material.opacity = 0.35 * b;
    g.halo.material.opacity = 0.16 * b;
    for (var i = 0; i < g.nebulosas.length; i++) {
      g.nebulosas[i].material.opacity = g.nebulosas[i].userData.opacidad * b;
    }
    this.bloom.strength = C.amortiguar(this.bloom.strength, this.fuerzaObjetivo, 2.5, dt);

    var cam = this.camara;
    for (var k = 0; k < this.constelaciones.length; k++) this.constelaciones[k].actualizar(dt, cam);
    this.chispas.actualizar(dt);
    this.ondas.actualizar(dt, cam);
    this.destellos.actualizar(dt);
    this.meteoros.actualizar(dt);
    this.camino.actualizar(dt, t);
  };

  PU.dibujar = function () {
    if (this.conResplandor) this.compositor.render();
    else this.renderer.render(this.escena, this.camara);
  };

  // Vitrina: una pequeña escena 3D propia (con su resplandor) donde vive una copia de
  // la constelación, para la tarjeta del recuerdo. Gira sola despacio y con el dedo.
  // No toca el universo: tiene su propio lienzo, cámara y copias de las figuras.
  PU.crearVitrina = function (lienzo) {
    var u = this;
    var renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: false, alpha: false, stencil: false });
    renderer.setClearColor(0x070b1f, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    var escena = new THREE.Scene();
    escena.background = color("#070b1f");
    var camara = new THREE.PerspectiveCamera(32, 2, 0.1, 400);
    var comunes = { uTiempo: { value: 0 }, uEscala: { value: 1 }, uTamMin: { value: 1.25 } };
    var compositor = new THREE.EffectComposer(renderer);
    compositor.addPass(new THREE.RenderPass(escena, camara));
    compositor.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.32, 0.3));
    compositor.addPass(new THREE.OutputPass());

    // Cielo de fondo: estrellas tenues a distintas profundidades.
    var rnd = C.azar(211), N = 420;
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3), tam = new Float32Array(N), azr = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      var r = 16 + rnd() * 40, th = rnd() * DOS_PI, ph = Math.acos(2 * rnd() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph) * 0.8;
      pos[i * 3 + 2] = -Math.abs(r * Math.sin(ph) * Math.sin(th)) - 2;
      var b = 0.18 + rnd() * 0.45;
      col[i * 3] = 0.78 * b; col[i * 3 + 1] = 0.84 * b; col[i * 3 + 2] = b;
      tam[i] = 0.05 + rnd() * 0.12;
      azr[i] = rnd();
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aTam", new THREE.BufferAttribute(tam, 1));
    geo.setAttribute("aAzar", new THREE.BufferAttribute(azr, 1));
    var fondo = new THREE.Points(geo, materialPuntos(comunes));
    fondo.frustumCulled = false;
    escena.add(fondo);

    var copias = {}, actual = null, ancho = 2, alto = 1;
    var giro = { az: 0, el: 0, vAz: 0, vEl: 0, arrastre: null, t: 0, entrada: 0 };
    var camFija = { position: new THREE.Vector3(0, 0, 1000) };

    function copiaDe(c) {
      if (copias[c.indice]) return copias[c.indice];
      var copia = new Constelacion(c.datos, c.indice, {
        tam: c.S / (c.datos.escala || 1), rnd: C.azar(97 + c.indice), posicion: new THREE.Vector3(),
        comunes: comunes, texturas: u.texturas
      });
      // La misma figura que en el cielo, con más profundidad para que se aprecie al girar.
      var atr = copia.geo.attributes.position;
      copia.estrellas.forEach(function (e, k) {
        e.local.copy(c.estrellas[k].local);
        e.local.z = c.estrellas[k].local.z * 2.6;
        atr.setXYZ(k, e.local.x, e.local.y, e.local.z);
      });
      atr.needsUpdate = true;
      copia.anillos.forEach(function (an) {
        var centro = copia.estrellas[an.estrella].local, rr = 0, pts = [];
        (c.datos.anillos || []).forEach(function (d) { if (d.estrella === an.estrella) rr = (d.radio || 10) / 100 * copia.S; });
        for (var k = 0; k <= 72; k++) {
          var a = k / 72 * DOS_PI;
          pts.push(new THREE.Vector3(centro.x + Math.cos(a) * rr, centro.y + Math.sin(a) * rr, centro.z));
        }
        moverLinea(an.linea, pts);
      });
      // Centra la figura en la vitrina.
      var caja = new THREE.Box3();
      copia.estrellas.forEach(function (e) { caja.expandByPoint(e.local); });
      var centro = caja.getCenter(new THREE.Vector3());
      copia.centrado = new THREE.Vector3(-centro.x, -centro.y, 0);
      copia.medida = caja.getSize(new THREE.Vector3());
      copia.visibilidad = copia.visibilidadObjetivo = 1;
      copias[c.indice] = copia;
      return copia;
    }

    function encuadrar() {
      if (!actual) return;
      var t = Math.tan(camara.fov * Math.PI / 360), m = actual.S * 0.32;
      var w = actual.medida.x + m, h = actual.medida.y + m;
      giro.dist = Math.max((h / 2) / (t * 0.86), (w / 2) / (t * camara.aspect * 0.88));
    }

    return {
      mostrar: function (c, reducido) {
        if (actual) escena.remove(actual.grupo);
        actual = copiaDe(c);
        actual.reiniciar();
        actual.contenido.position.copy(actual.centrado);
        escena.add(actual.grupo);
        encuadrar();
        giro.az = reducido ? 0 : 0.85;
        giro.el = reducido ? 0 : 0.18;
        giro.vAz = giro.vEl = 0;
        giro.t = 0;
        giro.reducido = reducido;
        // La constelación se enciende estrella por estrella, como en el cielo.
        if (reducido) actual.completar(true);
        else {
          var esta = actual;
          setTimeout(function () { if (actual === esta) esta.encenderTodo(120); }, 450);
        }
      },
      ocultar: function () {
        if (!actual) return;
        actual.reiniciar();
        escena.remove(actual.grupo);
        actual = null;
      },
      dimensionar: function (w, h, dpr) {
        ancho = Math.max(1, w); alto = Math.max(1, h);
        renderer.setPixelRatio(dpr);
        renderer.setSize(ancho, alto, false);
        compositor.setPixelRatio(dpr);
        compositor.setSize(ancho, alto);
        camara.aspect = ancho / alto;
        camara.updateProjectionMatrix();
        comunes.uEscala.value = alto * dpr / (2 * Math.tan(camara.fov * Math.PI / 360));
        comunes.uTamMin.value = 1.25 * dpr;
        encuadrar();
      },
      // Arrastrar con el dedo gira la figura; al soltar sigue con inercia y vuelve a mecerse.
      empezar: function (x, y) { giro.arrastre = { x: x, y: y, t: performance.now() }; giro.vAz = giro.vEl = 0; },
      mover: function (x, y) {
        var a = giro.arrastre;
        if (!a) return;
        var ahora = performance.now(), dt = Math.max(8, ahora - a.t) / 1000;
        var dAz = -(x - a.x) / ancho * 2.4, dEl = (y - a.y) / alto * 1.2;
        giro.az += dAz; giro.el = C.limitar(giro.el + dEl, -0.6, 0.6);
        giro.vAz = dAz / dt; giro.vEl = dEl / dt;
        a.x = x; a.y = y; a.t = ahora;
      },
      soltar: function () { giro.arrastre = null; },
      cuadro: function (dt) {
        if (!actual) return;
        giro.t += dt;
        comunes.uTiempo.value += dt;
        if (!giro.arrastre) {
          giro.az += giro.vAz * dt;
          giro.el = C.limitar(giro.el + giro.vEl * dt, -0.6, 0.6);
          giro.vAz *= Math.exp(-dt / 0.5);
          giro.vEl *= Math.exp(-dt / 0.5);
          if (!giro.reducido && Math.abs(giro.vAz) < 0.05) {
            // Vaivén suave alrededor de la figura.
            var meta = Math.sin(giro.t * 0.42) * 0.38;
            giro.az = C.amortiguar(giro.az, meta, 0.7, dt);
            giro.el = C.amortiguar(giro.el, 0.08 + Math.sin(giro.t * 0.31) * 0.1, 0.7, dt);
          }
        }
        var d = giro.dist;
        camara.position.set(Math.sin(giro.az) * Math.cos(giro.el) * d, Math.sin(giro.el) * d, Math.cos(giro.az) * Math.cos(giro.el) * d);
        camara.lookAt(0, 0, 0);
        actual.actualizar(dt, camFija);
        compositor.render();
      }
    };
  };

  // Retrato de una constelación tal como se ve en el universo (estrellas, halo, líneas
  // de luz y resplandor), sin la galaxia ni los efectos, para las tarjetas.
  // Se dibuja en el mismo instante y se repinta la vista normal, así que no se nota.
  // ancho y alto: tamaño en pantalla (px CSS) donde se va a mostrar; se retrata a esa
  // misma escala para que las líneas y las estrellas se vean igual que en el cielo.
  PU.retratar = function (c, ancho, alto) {
    var cam = this.camara, W = this.ancho, H = this.alto, dpr = this.dpr;
    var k = Math.min(1, (W * 0.96) / ancho, (H * 0.96) / alto);
    var cw = ancho * k, ch = alto * k;
    var sx = (W - cw) / 2, sy = (H - ch) / 2;
    var anchoSalida = Math.round(cw * dpr), altoSalida = Math.round(ch * dpr);

    // La constelación en su estado final y a su tamaño normal.
    var antes = { tam: c.tamFactor, tamObj: c.tamObjetivo, faro: c.faroValor, faroObj: c.faroObjetivo, guias: c.guiasValor, guiasObj: c.guiasObjetivo };
    c.tamObjetivo = 1; c.faroObjetivo = 0; c.guiasObjetivo = 0;
    c.actualizar(10, cam);

    // Encuadre: de frente a la figura, a la distancia justa para que llene el retrato.
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    c.estrellas.forEach(function (e) {
      minX = Math.min(minX, e.local.x); maxX = Math.max(maxX, e.local.x);
      minY = Math.min(minY, e.local.y); maxY = Math.max(maxY, e.local.y);
    });
    var m = c.S * 0.14, bw = maxX - minX + m * 2, bh = maxY - minY + m * 2;
    var t = Math.tan(cam.fov * Math.PI / 360);
    var d = Math.max(bw * H / (2 * t * cw * 0.86), bh * H / (2 * t * ch * 0.84));
    var desplazamiento = c.contenido.position.clone();
    c.contenido.position.set(0, 0, 0);
    c.grupo.updateMatrixWorld(true);
    var objetivo = c.grupo.localToWorld(new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, 0));
    var giro = c.grupo.rotation.y;
    var pos0 = cam.position.clone(), q0 = cam.quaternion.clone();
    cam.position.set(objetivo.x + Math.sin(giro) * d, objetivo.y, objetivo.z + Math.cos(giro) * d);
    cam.lookAt(objetivo);
    cam.updateMatrixWorld(true);

    // Solo la constelación: se esconde todo lo demás un instante.
    var propias = [c.halo, c.guias, c.puntos].concat(c.trazos.map(function (tr) { return tr.linea; }), c.anillos.map(function (an) { return an.linea || an; }));
    var ocultos = [];
    this.escena.children.forEach(function (o) { if (o !== c.grupo && o.visible) { o.visible = false; ocultos.push(o); } });
    c.contenido.children.forEach(function (o) { if (propias.indexOf(o) < 0 && o.visible) { o.visible = false; ocultos.push(o); } });

    var salida = document.createElement("canvas");
    salida.width = anchoSalida;
    salida.height = altoSalida;
    try {
      this.dibujar();
      salida.getContext("2d").drawImage(this.renderer.domElement, sx * dpr, sy * dpr, cw * dpr, ch * dpr, 0, 0, anchoSalida, altoSalida);
    } catch (e) {
      salida = null;
    }

    // Todo vuelve a su lugar y se repinta la vista de siempre.
    ocultos.forEach(function (o) { o.visible = true; });
    c.contenido.position.copy(desplazamiento);
    cam.position.copy(pos0);
    cam.quaternion.copy(q0);
    cam.updateMatrixWorld(true);
    c.tamFactor = antes.tam; c.tamObjetivo = antes.tamObj;
    c.faroValor = antes.faro; c.faroObjetivo = antes.faroObj;
    c.guiasValor = antes.guias; c.guiasObjetivo = antes.guiasObj;
    c.actualizar(0, cam);
    this.dibujar();
    return salida;
  };

  // Mundo → pantalla (píxeles CSS). delante: false si el punto queda detrás de la cámara.
  PU.aPantalla = function (v, destino) {
    destino = destino || {};
    var cam = this.camara;
    this._v.copy(v).applyMatrix4(cam.matrixWorldInverse);
    destino.delante = this._v.z < -0.05;
    this._v.applyMatrix4(cam.projectionMatrix);
    destino.x = (this._v.x + 1) / 2 * this.ancho;
    destino.y = (1 - this._v.y) / 2 * this.alto;
    return destino;
  };

  // Tamaño en pantalla (píxeles CSS) de una longitud del mundo a la distancia de un punto.
  PU.escalaEn = function (v) {
    var cam = this.camara;
    this._v.copy(v).applyMatrix4(cam.matrixWorldInverse);
    var z = Math.max(0.1, -this._v.z);
    return this.alto / (2 * Math.tan(cam.fov * Math.PI / 360) * z);
  };

  // Pantalla → punto en el plano (z = 0 local) de un objeto, en coordenadas locales del objeto.
  PU.pantallaAPlano = function (x, y, objeto, destino) {
    destino = destino || new THREE.Vector3();
    this._ndc.set(x / this.ancho * 2 - 1, -(y / this.alto) * 2 + 1);
    this._rayo.setFromCamera(this._ndc, this.camara);
    objeto.updateWorldMatrix(true, false);
    objeto.getWorldQuaternion(this._q);
    this._v2.set(0, 0, 1).applyQuaternion(this._q);
    objeto.getWorldPosition(this._v);
    this._plano.setFromNormalAndCoplanarPoint(this._v2, this._v);
    if (!this._rayo.ray.intersectPlane(this._plano, destino)) return null;
    return objeto.worldToLocal(destino);
  };

  PU.crearPolvo = function (cantidad, op) {
    op.comunes = this.comunes;
    return new Polvo(cantidad, op);
  };

  C.Universo = Universo;
  C.Figuras = {
    corazon: figuraCorazon,
    marco: figuraMarco,
    imagen: figuraImagen,
    texto: figuraTexto,
    muestrearImagen: muestrearImagen
  };
  C.lineaNueva = lineaNueva;
  C.moverLinea = moverLinea;
})(window.Cielo);
