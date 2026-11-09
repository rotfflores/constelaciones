/* El cielo de nosotros · detalles de las tarjetas
   - Chispas: estrellitas que saltan de cada botón al tocarlo.
   - Botones: en computadora, un brillo sigue al cursor y el botón se acerca a él.
   - Galería: fotos instantáneas que se deslizan con el dedo, como un mazo.
   - Sorpresas: la cita que abre la llave (se reclama por WhatsApp) y la
     canción que se desbloquea, con su letra sincronizada.
   Todo funciona también en la página sencilla para equipos sin 3D. */
(function (C) {
  "use strict";

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
  function quieto() { return C.movimientoReducido(); }
  function llamar(obj, metodo) {
    if (obj && typeof obj[metodo] === "function") return obj[metodo].apply(obj, Array.prototype.slice.call(arguments, 2));
  }
  function centroDe(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function acentoDe(el) {
    var v = "";
    try { v = getComputedStyle(el).getPropertyValue("--acento").trim(); } catch (e) { v = ""; }
    return v || "#f3e3bc";
  }
  function reloj(s) {
    if (!isFinite(s) || s < 0) return "–:––";
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  var SVG_SOL = '<svg viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="24" cy="24" r="8.5"/><path d="M24 4.5v6.5M24 37v6.5M4.5 24H11M37 24h6.5M10.2 10.2l4.6 4.6M33.2 33.2l4.6 4.6M10.2 37.8l4.6-4.6M33.2 14.8l4.6-4.6"/></g></svg>';
  var SVG_PLAY = '<svg class="disco__play" viewBox="0 0 24 24"><path d="M9 6.6v10.8l8.6-5.4z" fill="currentColor"/></svg>';
  var SVG_PAUSA = '<svg class="disco__pausa" viewBox="0 0 24 24"><path d="M8 6.5h2.8v11H8zM13.2 6.5H16v11h-2.8z" fill="currentColor"/></svg>';
  var SVG_CHAT = '<svg viewBox="0 0 24 24"><path d="M12 3.2a8.6 8.6 0 0 0-7.5 12.9L3.3 20.7l4.7-1.2A8.6 8.6 0 1 0 12 3.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9.1 8.2c.2-.4.4-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.3 0 .5-.1.7l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.2.5-.2.7-.1l1.7.7c.3.1.4.3.4.5v.5c0 .4-.1.6-.5.8-.6.3-1.4.4-2.3.1-2.1-.7-3.8-2.4-4.5-4.5-.3-.9-.2-1.7.1-2.2z" fill="currentColor"/></svg>';
  var SVG_CANDADO =
    '<svg class="candado" viewBox="0 0 64 72">' +
      '<defs><linearGradient id="cielo-candado" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#fff3cf"/><stop offset=".48" stop-color="#e8c67c"/><stop offset="1" stop-color="#a5793a"/>' +
      '</linearGradient></defs>' +
      '<path class="candado__arco" d="M19 33V22a13 13 0 0 1 26 0v11" fill="none" stroke="#ead293" stroke-width="5.5" stroke-linecap="round"/>' +
      '<rect class="candado__cuerpo" x="9" y="30" width="46" height="37" rx="10" fill="url(#cielo-candado)"/>' +
      '<rect x="13" y="34" width="38" height="29" rx="7" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1"/>' +
      '<g class="candado__ojo"><circle cx="32" cy="45" r="5" fill="#291c3f"/><path d="M29.7 47.6h4.6l1.4 8.4h-7.4z" fill="#291c3f"/></g>' +
    '</svg>';
  var SVG_LLAVE =
    '<svg class="llave" viewBox="0 0 80 28"><g fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="14" r="8.5"/><path d="M20.5 14H74M61 14v7.5M69 14v5.5"/></g>' +
      '<circle cx="12" cy="14" r="2.6" fill="currentColor"/></svg>';

  /* ---------- Chispas ---------- */

  var capa = null;

  function lanzarChispas(x, y, op) {
    op = op || {};
    if (!capa || !capa.parentNode) {
      capa = nodo("div", "chispero");
      capa.setAttribute("aria-hidden", "true");
      document.body.appendChild(capa);
    }
    var color = op.color || "#f3e3bc";
    var onda = nodo("span", "chispero__onda");
    onda.style.left = x.toFixed(1) + "px";
    onda.style.top = y.toFixed(1) + "px";
    onda.style.borderColor = color;
    if (op.onda) onda.style.setProperty("--tam", op.onda + "px");
    capa.appendChild(onda);
    animarYQuitar(onda, [
      { transform: "scale(0.12)", opacity: 0.85 },
      { transform: "scale(1)", opacity: 0 }
    ], { duration: quieto() ? 380 : 720, easing: "cubic-bezier(.2,.7,.3,1)" });
    if (quieto()) return;
    var n = op.cantidad || 10, alcance = op.alcance || 44;
    for (var i = 0; i < n; i++) {
      var s = nodo("span", "chispero__chispa");
      var tam = (op.tam || 5) + Math.random() * 6;
      s.style.width = s.style.height = tam.toFixed(1) + "px";
      s.style.left = (x - tam / 2).toFixed(1) + "px";
      s.style.top = (y - tam / 2).toFixed(1) + "px";
      s.style.background = Math.random() < 0.32 ? "#fffaf0" : color;
      capa.appendChild(s);
      var ang = (i / n) * Math.PI * 2 + Math.random() * 0.7;
      var d = alcance * (0.5 + Math.random() * 0.75);
      var dx = Math.cos(ang) * d, dy = Math.sin(ang) * d - (op.subir == null ? 8 : op.subir);
      var g = (Math.random() - 0.5) * 240;
      animarYQuitar(s, [
        { transform: "translate(0px,0px) scale(0.2) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + (dx * 0.82).toFixed(1) + "px," + (dy * 0.82).toFixed(1) + "px) scale(1) rotate(" + (g * 0.6).toFixed(0) + "deg)", opacity: 1, offset: 0.5 },
        { transform: "translate(" + dx.toFixed(1) + "px," + (dy + 16).toFixed(1) + "px) scale(0) rotate(" + g.toFixed(0) + "deg)", opacity: 0 }
      ], { duration: 650 + Math.random() * 520, easing: "cubic-bezier(.16,.8,.34,1)" });
    }
  }

  function animarYQuitar(el, cuadros, op) {
    function quitar() { if (el.parentNode) el.parentNode.removeChild(el); }
    if (!el.animate) { setTimeout(quitar, op.duration || 600); return; }
    var a = el.animate(cuadros, op);
    a.onfinish = quitar;
    a.oncancel = quitar;
  }

  /* ---------- Botones ---------- */

  var SELECTOR_BOTON = ".boton, .boton-icono, .cerradura, .disco";
  var botonesActivos = false;

  function activarBotones(op) {
    if (botonesActivos) return;
    botonesActivos = true;
    op = op || {};
    function sonido() { return typeof op.sonido === "function" ? op.sonido() : op.sonido; }
    function chispasDe(b, x, y) {
      var grande = /boton--principal|boton--whatsapp|cerradura|disco/.test(b.className);
      lanzarChispas(x, y, { color: acentoDe(b), cantidad: grande ? 14 : 9, alcance: grande ? 58 : 40 });
    }
    document.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      var b = e.target && e.target.closest ? e.target.closest(SELECTOR_BOTON) : null;
      if (!b || b.disabled) return;
      chispasDe(b, e.clientX, e.clientY);
      llamar(sonido(), "toque");
    }, true);
    // Con el teclado (Enter o Espacio) las chispas salen del centro del botón.
    document.addEventListener("click", function (e) {
      if (e.detail !== 0) return;
      var b = e.target && e.target.closest ? e.target.closest(SELECTOR_BOTON) : null;
      if (!b) return;
      var c = centroDe(b);
      chispasDe(b, c.x, c.y);
      llamar(sonido(), "toque");
    }, true);

    if (quieto() || !(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
    var actual = null;
    function soltar(b) {
      if (!b) return;
      b.style.removeProperty("--mx");
      b.style.removeProperty("--my");
    }
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      var b = e.target && e.target.closest ? e.target.closest(".boton, .boton-icono") : null;
      if (b !== actual) { soltar(actual); actual = b; }
      if (!b) return;
      var r = b.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      b.style.setProperty("--px", (px * 100).toFixed(1) + "%");
      b.style.setProperty("--py", (py * 100).toFixed(1) + "%");
      b.style.setProperty("--mx", ((px - 0.5) * Math.min(12, r.width * 0.06)).toFixed(1) + "px");
      b.style.setProperty("--my", ((py - 0.5) * 6).toFixed(1) + "px");
    }, { passive: true });
    document.addEventListener("pointerout", function (e) {
      if (!e.relatedTarget) { soltar(actual); actual = null; }
    });
  }

  /* ---------- Galería de fotos instantáneas ---------- */

  var INCLINACIONES = [-2.6, 3.1, -3.8, 2.2, -1.6, 3.6, -2.9, 1.8];
  // Lugar de cada foto en el mazo: la de arriba casi derecha y las demás asomándose.
  var PUESTOS = [
    { x: 0, y: 0, s: 1, g: 0.4 },
    { x: 13, y: 7, s: 0.95, g: 1 },
    { x: -13, y: 13, s: 0.91, g: 1 },
    { x: 2, y: 18, s: 0.87, g: 1 }
  ];
  var SVG_ATRAS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SVG_ADELANTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var SVG_DESLIZAR = '<svg viewBox="0 0 28 12"><path d="M2 6h24M6.5 2L2 6l4.5 4M21.5 2L26 6l-4.5 4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function crearGaleria(fotos, op) {
    op = op || {};
    var T = op.textos || {};
    var N = fotos.length;
    var raiz = nodo("div", "galeria" + (N > 1 ? "" : " galeria--una"));
    raiz.setAttribute("role", "group");
    raiz.setAttribute("aria-roledescription", T.galeria || "galería");
    raiz.setAttribute("aria-label", op.titulo || "Fotos");
    if (N > 1) raiz.tabIndex = 0;

    var fondo = nodo("div", "galeria__fondo");
    fondo.setAttribute("aria-hidden", "true");
    var imgFondo = document.createElement("img");
    imgFondo.alt = "";
    imgFondo.decoding = "async";
    fondo.appendChild(imgFondo);
    raiz.appendChild(fondo);

    var mazo = nodo("div", "galeria__mazo");
    raiz.appendChild(mazo);
    var tarjetas = fotos.map(function (f, i) {
      var fig = nodo("figure", "polaroid por-revelar");
      fig.style.setProperty("--inclinacion", INCLINACIONES[i % INCLINACIONES.length] + "deg");
      fig.style.setProperty("--cinta", (((i * 37) % 22) - 11) + "deg");
      var marco = nodo("div", "polaroid__foto");
      var img = document.createElement("img");
      img.src = f.foto;
      img.alt = f.textoAlternativo || "";
      img.decoding = "async";
      img.draggable = false;
      if (f.enfoque) img.style.objectPosition = f.enfoque;
      marco.appendChild(img);
      fig.appendChild(marco);
      fig.appendChild(nodo("figcaption", "polaroid__pie", f.pie || ""));
      mazo.appendChild(fig);
      return fig;
    });

    var puntos = [], pista = null;
    var vivo = nodo("p", "sr-only");
    vivo.setAttribute("aria-live", "polite");
    if (N > 1) {
      var control = nodo("div", "galeria__control");
      var atras = botonFlecha("atras", T.fotoAnterior || "Foto anterior", SVG_ATRAS);
      var adelante = botonFlecha("adelante", T.fotoSiguiente || "Foto siguiente", SVG_ADELANTE);
      var listaPuntos = nodo("div", "galeria__puntos");
      listaPuntos.setAttribute("aria-hidden", "true");
      fotos.forEach(function () { var p = nodo("span"); listaPuntos.appendChild(p); puntos.push(p); });
      control.appendChild(atras);
      control.appendChild(listaPuntos);
      control.appendChild(adelante);
      raiz.appendChild(control);
      atras.addEventListener("click", function () { anterior(); });
      adelante.addEventListener("click", function () { siguiente(); });
      pista = nodo("p", "galeria__pista");
      pista.appendChild(icono(SVG_DESLIZAR, "galeria__pista-icono"));
      pista.appendChild(nodo("span", "", C.esTactil() ? (T.galeriaPistaTactil || "Desliza las fotos") : (T.galeriaPistaRaton || "Arrastra las fotos o usa las flechas")));
      raiz.appendChild(pista);
    }
    raiz.appendChild(vivo);

    function botonFlecha(lado, etiqueta, svg) {
      var b = nodo("button", "boton-icono galeria__flecha galeria__flecha--" + lado);
      b.type = "button";
      b.setAttribute("aria-label", etiqueta);
      b.innerHTML = svg;
      return b;
    }

    var orden = fotos.map(function (_, i) { return i; });
    var animando = false, visible = false, temporizadores = [];

    function programar(fn, ms) { temporizadores.push(setTimeout(fn, ms)); }
    function transformar(k) {
      var p = PUESTOS[Math.min(k, PUESTOS.length - 1)];
      return "translate(" + p.x + "px," + p.y + "px) rotate(calc(var(--inclinacion) * " + p.g + ")) scale(" + p.s + ")";
    }
    function colocar(excepto) {
      orden.forEach(function (idx, k) {
        var t = tarjetas[idx];
        if (t === excepto) return;
        t.style.zIndex = String(N - k);
        t.style.transform = transformar(k);
        t.style.opacity = k < PUESTOS.length ? "1" : "0";
        t.classList.toggle("polaroid--arriba", k === 0);
        t.setAttribute("aria-hidden", k === 0 ? "false" : "true");
      });
      var actual = orden[0];
      puntos.forEach(function (p, i) { p.classList.toggle("activo", i === actual); });
      cambiarFondo(fotos[actual].foto);
      if (visible) revelar(tarjetas[actual]);
    }
    var fondoActual = "";
    function cambiarFondo(src) {
      if (src === fondoActual) return;
      fondoActual = src;
      if (!imgFondo.getAttribute("src")) { imgFondo.src = src; return; }
      fondo.classList.add("cambiando");
      programar(function () { imgFondo.src = src; fondo.classList.remove("cambiando"); }, 260);
    }
    // Como una foto instantánea: aparece lechosa y se revela poco a poco.
    function revelar(t) {
      if (t.classList.contains("por-revelar")) t.classList.remove("por-revelar");
    }
    function anunciar() {
      var i = orden[0];
      vivo.textContent = C.formatear(T.fotoDe || "Foto {n} de {total}", { n: i + 1, total: N }) + (fotos[i].pie ? ": " + fotos[i].pie : "");
    }
    function ocultarPista() {
      if (pista) pista.classList.add("usada");
      raiz.classList.remove("galeria--asomar");
    }

    function lanzar(dir) {
      if (N < 2 || animando) return;
      animando = true;
      ocultarPista();
      var idx = orden.shift();
      orden.push(idx);
      var t = tarjetas[idx];
      var ancho = mazo.clientWidth || 260;
      t.classList.remove("polaroid--arrastrando");
      t.classList.add("polaroid--volando");
      t.style.zIndex = String(N + 1);
      t.style.transform = "translate(" + (dir * ancho * 1.15).toFixed(0) + "px,-28px) rotate(" + (dir * 24) + "deg) scale(1.02)";
      t.style.opacity = "0";
      colocar(t);
      llamar(op.sonido, "deslizar");
      programar(function () {
        t.classList.remove("polaroid--volando");
        t.classList.add("polaroid--quieta");
        var k = N - 1;
        t.style.zIndex = "0";
        t.style.transform = transformar(k);
        t.classList.remove("polaroid--arriba");
        t.setAttribute("aria-hidden", "true");
        void t.offsetWidth;
        t.classList.remove("polaroid--quieta");
        t.style.zIndex = "1";
        t.style.opacity = k < PUESTOS.length ? "1" : "0";
        animando = false;
      }, quieto() ? 20 : 380);
      anunciar();
    }
    function siguiente() { lanzar(-1); }
    function anterior() {
      if (N < 2 || animando) return;
      animando = true;
      ocultarPista();
      var idx = orden.pop();
      orden.unshift(idx);
      var t = tarjetas[idx];
      var ancho = mazo.clientWidth || 260;
      t.classList.add("polaroid--quieta");
      t.style.zIndex = String(N + 1);
      t.style.transform = "translate(" + (-ancho * 1.15).toFixed(0) + "px,-28px) rotate(-24deg) scale(1.02)";
      t.style.opacity = "0";
      void t.offsetWidth;
      t.classList.remove("polaroid--quieta");
      colocar();
      llamar(op.sonido, "deslizar");
      programar(function () { animando = false; }, quieto() ? 20 : 440);
      anunciar();
    }

    // Arrastrar la foto de arriba hacia un lado la manda al fondo del mazo.
    var arrastre = null;
    mazo.addEventListener("pointerdown", function (e) {
      if (N < 2 || animando || (e.button && e.button > 0)) return;
      var t = tarjetas[orden[0]];
      if (!t.contains(e.target)) return;
      var ahora = performance.now();
      arrastre = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, vx: 0, ux: e.clientX, ut: ahora, movio: false };
      try { mazo.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      t.classList.add("polaroid--arrastrando");
    });
    mazo.addEventListener("pointermove", function (e) {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      var dx = e.clientX - arrastre.x0, dy = e.clientY - arrastre.y0;
      if (!arrastre.movio && Math.abs(dx) > 6) { arrastre.movio = true; ocultarPista(); }
      var ahora = performance.now(), dt = Math.max(1, ahora - arrastre.ut);
      arrastre.vx = arrastre.vx * 0.6 + ((e.clientX - arrastre.ux) / dt) * 0.4;
      arrastre.ux = e.clientX;
      arrastre.ut = ahora;
      arrastre.dx = dx;
      arrastre.dy = dy;
      if (!arrastre.movio) return;
      var t = tarjetas[orden[0]];
      t.style.transform = "translate(" + dx.toFixed(1) + "px," + (dy * 0.18).toFixed(1) + "px) rotate(" + (dx * 0.07).toFixed(2) + "deg) scale(1.02)";
    });
    function terminar(e) {
      if (!arrastre || e.pointerId !== arrastre.id) return;
      var a = arrastre;
      arrastre = null;
      var t = tarjetas[orden[0]];
      t.classList.remove("polaroid--arrastrando");
      if (!a.movio) {
        if (e.type === "pointerup") siguiente();
        else colocar();
        return;
      }
      if (Math.abs(a.dx) > 70 || (Math.abs(a.vx) > 0.45 && Math.abs(a.dx) > 24)) lanzar(a.dx > 0 ? 1 : -1);
      else colocar();
    }
    mazo.addEventListener("pointerup", terminar);
    mazo.addEventListener("pointercancel", terminar);

    raiz.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); siguiente(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); anterior(); }
    });

    colocar();

    return {
      elemento: raiz,
      // Se llama cada vez que la tarjeta se abre: la foto de arriba se revela y el mazo se asoma.
      mostrar: function (retraso) {
        visible = true;
        programar(function () {
          if (!visible) return;
          revelar(tarjetas[orden[0]]);
          if (pista && !pista.classList.contains("usada") && !quieto()) {
            raiz.classList.remove("galeria--asomar");
            void raiz.offsetWidth;
            raiz.classList.add("galeria--asomar");
            programar(function () { raiz.classList.remove("galeria--asomar"); }, 1700);
          }
        }, retraso || 0);
      },
      ocultar: function () {
        visible = false;
        temporizadores.forEach(clearTimeout);
        temporizadores = [];
        animando = false;
        arrastre = null;
        tarjetas.forEach(function (t) { t.classList.remove("polaroid--arrastrando", "polaroid--volando"); });
        raiz.classList.remove("galeria--asomar");
        colocar();
      },
      siguiente: siguiente,
      anterior: anterior
    };
  }

  /* ---------- Sorpresa: la cita que abre la llave ---------- */

  function aviso(texto) {
    var p = nodo("p", "sorpresa__aviso");
    p.appendChild(nodo("span", "", texto));
    return p;
  }

  function enlaceWhatsApp(numero, mensaje) {
    var limpio = String(numero || "").replace(/\D/g, "");
    return "https://wa.me/" + limpio + (mensaje ? "?text=" + encodeURIComponent(mensaje) : "");
  }

  function mostrarEn(ctx, el) {
    if (ctx.alAbrir) { ctx.alAbrir(el); return; }
    try { el.scrollIntoView({ behavior: quieto() ? "auto" : "smooth", block: "center" }); } catch (e) { /* sin desplazamiento suave */ }
  }

  function crearCita(d, ctx) {
    var raiz = nodo("section", "sorpresa sorpresa--cita");
    raiz.setAttribute("aria-label", d.aviso || d.titulo || "");
    raiz.appendChild(aviso(d.aviso || ""));

    var cofre = nodo("div", "cofre");
    var cerradura = nodo("button", "cerradura");
    cerradura.type = "button";
    cerradura.setAttribute("aria-label", d.etiquetaCerradura || "Usar la llave para abrir la sorpresa");
    cerradura.appendChild(icono(SVG_CANDADO, "cerradura__candado"));
    cerradura.appendChild(icono(SVG_LLAVE, "cerradura__llave"));
    cofre.appendChild(cerradura);
    cofre.appendChild(nodo("p", "sorpresa__pista", d.pista || ""));
    raiz.appendChild(cofre);

    var boleto = nodo("div", "boleto");
    boleto.hidden = true;
    var papel = nodo("div", "boleto__papel");
    var cabeza = nodo("div", "boleto__cabeza");
    if (d.folio) cabeza.appendChild(nodo("p", "boleto__folio", d.folio));
    cabeza.appendChild(nodo("p", "boleto__antetitulo", d.antetitulo || ""));
    cabeza.appendChild(nodo("h3", "boleto__titulo", d.titulo || ""));
    var estrellas = nodo("span", "boleto__estrellas");
    estrellas.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 3; i++) estrellas.appendChild(nodo("span"));
    cabeza.appendChild(estrellas);
    papel.appendChild(cabeza);
    var talon = nodo("div", "boleto__talon");
    if (d.detalle) talon.appendChild(nodo("p", "boleto__detalle", d.detalle));
    if (d.admite || d.vigencia) {
      var pie = nodo("p", "boleto__pie");
      if (d.admite) pie.appendChild(nodo("span", "", d.admite));
      if (d.vigencia) pie.appendChild(nodo("span", "", d.vigencia));
      talon.appendChild(pie);
    }
    papel.appendChild(talon);
    boleto.appendChild(papel);

    var enlace = null;
    if (d.whatsapp) {
      enlace = nodo("a", "boton boton--whatsapp");
      enlace.href = enlaceWhatsApp(d.whatsapp, d.mensajeWhatsapp);
      enlace.target = "_blank";
      enlace.rel = "noopener";
      enlace.appendChild(icono(SVG_CHAT));
      enlace.appendChild(nodo("span", "", d.boton || "Reclamar por WhatsApp"));
      boleto.appendChild(enlace);
      enlace.addEventListener("click", function () { llamar(ctx.sonido, "acorde"); });
    }
    if (d.nota) {
      // El número de teléfono no se parte en dos renglones.
      var nota = nodo("p", "boleto__nota");
      String(d.nota).split(/(\+?\d[\d ]{6,}\d)/).forEach(function (parte, i) {
        if (!parte) return;
        nota.appendChild(i % 2 ? nodo("span", "boleto__numero", parte) : document.createTextNode(parte));
      });
      boleto.appendChild(nota);
    }
    raiz.appendChild(boleto);

    var abierta = false;
    function abrir(inmediato) {
      abierta = true;
      var teniaFoco = document.activeElement === cerradura;
      cofre.hidden = true;
      boleto.hidden = false;
      if (inmediato) { boleto.classList.add("visible"); return; }
      void boleto.offsetWidth;
      boleto.classList.add("visible");
      if (teniaFoco) {
        if (!enlace) raiz.tabIndex = -1;
        (enlace || raiz).focus({ preventScroll: true });
      }
      setTimeout(function () { mostrarEn(ctx, boleto); }, 120);
    }
    cerradura.addEventListener("click", function () {
      if (abierta || raiz.classList.contains("girando")) return;
      raiz.classList.add("girando");
      llamar(ctx.sonido, "clic");
      C.vibrar(12);
      var lento = !quieto();
      setTimeout(function () {
        raiz.classList.add("abierta");
        llamar(ctx.sonido, "clic", true);
        C.vibrar([10, 40, 18]);
      }, lento ? 900 : 0);
      setTimeout(function () {
        var c = centroDe(cerradura);
        lanzarChispas(c.x, c.y, { cantidad: 24, alcance: 96, color: acentoDe(raiz), onda: 160 });
        llamar(ctx.sonido, "arpegio");
        abrir(false);
      }, lento ? 1500 : 30);
    });

    return {
      elemento: raiz,
      abierta: function () { return abierta; },
      // En la página sencilla (sin 3D) la cita también se abre con la llave.
      abrirYa: function () { if (!abierta) abrir(true); }
    };
  }

  /* ---------- Sorpresa: la canción con su letra ---------- */

  var Cancion = { actual: null };

  // Lee la letra: con tiempos [mm:ss] (formato LRC) cada línea se ilumina justo cuando
  // se canta; sin tiempos, las líneas se reparten a lo largo de la canción.
  function leerLetra(texto, duracion, d) {
    var marcadas = [], sueltas = [];
    var RE = /\[(\d{1,2}):(\d{1,2}(?:[.,]\d{1,3})?)\]/g;
    String(texto || "").split(/\r?\n/).forEach(function (fila) {
      var f = fila.trim();
      if (!f || /^\[[a-z]+:.*\]$/i.test(f)) return;
      var tiempos = [], m;
      RE.lastIndex = 0;
      while ((m = RE.exec(f))) tiempos.push(parseInt(m[1], 10) * 60 + parseFloat(m[2].replace(",", ".")));
      var linea = f.replace(RE, "").trim();
      if (tiempos.length) tiempos.forEach(function (t) { marcadas.push({ t: t, texto: linea }); });
      else sueltas.push(linea);
    });
    if (marcadas.length) return marcadas.sort(function (a, b) { return a.t - b.t; });
    if (!sueltas.length || !duracion || !isFinite(duracion)) return [];
    var ini = typeof d.inicioLetra === "number" ? d.inicioLetra : Math.min(14, duracion * 0.06);
    var fin = typeof d.finLetra === "number" ? d.finLetra : duracion * 0.92;
    var paso = Math.max(1, (fin - ini) / sueltas.length);
    return sueltas.map(function (linea, i) { return { t: ini + i * paso, texto: linea }; });
  }
  function letraConTiempos(texto) { return /\[\d{1,2}:\d{1,2}/.test(String(texto || "")); }

  function crearCancion(d, ctx) {
    var T = ctx.textos || {};
    var raiz = nodo("section", "sorpresa sorpresa--cancion sellada");
    raiz.setAttribute("aria-label", d.aviso || d.titulo || "");
    raiz.appendChild(aviso(d.aviso || ""));

    var rep = nodo("div", "reproductor");
    var disco = nodo("button", "disco");
    disco.type = "button";
    var vinilo = nodo("span", "disco__vinilo");
    vinilo.appendChild(icono(SVG_SOL, "disco__etiqueta"));
    disco.appendChild(vinilo);
    disco.appendChild(icono(SVG_PLAY + SVG_PAUSA, "disco__icono"));
    disco.appendChild(icono(SVG_SOL, "disco__sello"));
    rep.appendChild(disco);

    var info = nodo("div", "reproductor__info");
    var titulo = nodo("p", "reproductor__titulo", d.tituloOculto || "Una canción para ti");
    var artista = nodo("p", "reproductor__artista", "");
    info.appendChild(titulo);
    info.appendChild(artista);
    var barra = nodo("div", "reproductor__barra");
    barra.setAttribute("role", "slider");
    barra.setAttribute("aria-label", T.avanceCancion || "Avance de la canción");
    barra.setAttribute("aria-valuemin", "0");
    barra.setAttribute("aria-valuemax", "0");
    barra.setAttribute("aria-valuenow", "0");
    barra.tabIndex = -1;
    var relleno = nodo("span", "reproductor__relleno");
    barra.appendChild(relleno);
    info.appendChild(barra);
    var tiempos = nodo("p", "reproductor__tiempos");
    var tActual = nodo("span", "", "0:00"), tTotal = nodo("span", "", "–:––");
    tiempos.appendChild(tActual);
    tiempos.appendChild(tTotal);
    info.appendChild(tiempos);
    rep.appendChild(info);
    raiz.appendChild(rep);

    var pista = nodo("p", "sorpresa__pista", d.pista || "");
    raiz.appendChild(pista);
    var idioma = d.letraTraducida ? "es" : "original";
    var idiomas = nodo("div", "letra-idiomas");
    idiomas.setAttribute("role", "group");
    idiomas.setAttribute("aria-label", "Idioma de la letra");
    idiomas.hidden = true;
    var original = nodo("button", "letra-idiomas__boton", "Original");
    var traducida = nodo("button", "letra-idiomas__boton", "Español");
    [original, traducida].forEach(function (b) { b.type = "button"; idiomas.appendChild(b); });
    raiz.appendChild(idiomas);
    var pendiente = nodo("p", "sorpresa__pista", "La letra estará disponible cuando se añada el texto de la canción.");
    pendiente.hidden = true;
    raiz.appendChild(pendiente);
    var panel = nodo("div", "letra");
    panel.hidden = true;
    var carril = nodo("div", "letra__carril");
    panel.appendChild(carril);
    raiz.appendChild(panel);
    // Cuando la letra termina de abrirse, la línea que toca queda al centro.
    panel.addEventListener("transitionend", function (e) { if (e.target === panel && e.propertyName === "height") centrar(); });
    if (d.dedicatoria) raiz.appendChild(nodo("p", "sorpresa__dedicatoria", d.dedicatoria));
    var error = nodo("p", "sorpresa__error", T.errorCancion || "No se pudo reproducir la canción en este navegador.");
    error.hidden = true;
    raiz.appendChild(error);

    var audio = null, lineas = [], nodosLinea = [], actual = -2, sonando = false, liberada = false, bucle = 0;
    var iniciada = false, esperaToque = null, volumenBase = 1, atenuada = false, fundido = 0;
    var EVENTOS_TOQUE = ["pointerdown", "pointerup", "touchend", "click", "keydown"];

    function etiquetaDisco() {
      var plantilla = !liberada ? (T.liberarCancion || "Descubrir la canción")
        : sonando ? (T.pausarCancion || "Pausar {titulo}") : (T.escucharCancion || "Escuchar {titulo}");
      disco.setAttribute("aria-label", C.formatear(plantilla, { titulo: d.titulo || "" }));
    }
    etiquetaDisco();

    function prepararAudio() {
      if (audio) return audio;
      audio = new Audio();
      audio.preload = "auto";
      // Si suena desde el inicio, se repite mientras ella recorre el cielo.
      audio.loop = d.repetir != null ? !!d.repetir : !!d.desdeElInicio;
      volumenBase = typeof d.volumen === "number" ? C.limitar(d.volumen, 0, 1) : 1;
      try { audio.volume = volumenBase; } catch (e) { /* sin control de volumen */ }
      audio.src = d.archivo;
      audio.addEventListener("loadedmetadata", function () {
        tTotal.textContent = reloj(audio.duration);
        barra.setAttribute("aria-valuemax", String(Math.round(audio.duration)));
        if (!lineas.length) armarLetra();
      });
      audio.addEventListener("play", function () { cambiar(true); });
      audio.addEventListener("pause", function () { cambiar(false); });
      audio.addEventListener("ended", function () {
        audio.currentTime = 0;
        cambiar(false);
        sincronizar(true);
      });
      audio.addEventListener("error", function () { error.hidden = false; cambiar(false); });
      audio.addEventListener("timeupdate", function () { if (!sonando) sincronizar(false); });
      return audio;
    }

    function cambiar(valor) {
      if (sonando === valor) return;
      sonando = valor;
      raiz.classList.toggle("sonando", sonando);
      document.body.classList.toggle("con-cancion", sonando);
      etiquetaDisco();
      if (sonando) { sincronizar(true); bucleLetra(); }
      else cancelAnimationFrame(bucle);
      llamar(ctx, "alCambiar", sonando);
      if (!sonando) llamar(ctx, "alLinea", "");
    }

    function textoLetra() { return idioma === "es" ? d.letraTraducida : d.letra; }
    function elegirIdioma(valor) {
      idioma = valor;
      armarLetra();
      sincronizar(true);
    }
    original.addEventListener("click", function () { elegirIdioma("original"); });
    traducida.addEventListener("click", function () { elegirIdioma("es"); });
    function armarLetra() {
      var dur = audio ? audio.duration : 0;
      var texto = textoLetra();
      pendiente.hidden = !liberada || !!texto;
      idiomas.hidden = !liberada || !d.letra || !d.letraTraducida;
      original.setAttribute("aria-pressed", String(idioma === "original"));
      traducida.setAttribute("aria-pressed", String(idioma === "es"));
      panel.lang = idioma === "es" ? "es" : (d.idiomaOriginal || "en");
      if (!texto || (!letraConTiempos(texto) && !(dur && isFinite(dur)))) return;
      lineas = leerLetra(texto, dur, d);
      // La traducción sin marcas utiliza los tiempos del original línea por línea.
      if (idioma === "es" && !letraConTiempos(texto) && letraConTiempos(d.letra)) {
        var base = leerLetra(d.letra, dur, d);
        if (base.length === lineas.length) lineas.forEach(function (l, i) { l.t = base[i].t; });
      }
      carril.textContent = "";
      nodosLinea = lineas.map(function (l) {
        var p = nodo("p", "letra__linea" + (l.texto ? "" : " letra__linea--pausa"), l.texto || "♪ ♪ ♪");
        carril.appendChild(p);
        return p;
      });
      actual = -2;
      panel.hidden = !lineas.length || !liberada;
      if (!panel.hidden) requestAnimationFrame(function () { panel.classList.add("visible"); sincronizar(true); });
    }

    function indiceEn(t) {
      var i = -1;
      for (var k = 0; k < lineas.length; k++) {
        if (lineas[k].t <= t + 0.05) i = k;
        else break;
      }
      return i;
    }
    function centrar() {
      if (panel.hidden || !panel.clientHeight) return;
      var n = nodosLinea[Math.max(0, actual)];
      if (!n) return;
      var y = n.offsetTop + n.offsetHeight / 2 - panel.clientHeight / 2;
      carril.style.transform = "translateY(" + (-y).toFixed(1) + "px)";
    }
    function sincronizar(forzar) {
      if (!audio) return;
      var t = audio.currentTime || 0, dur = audio.duration;
      if (dur && isFinite(dur)) {
        relleno.style.width = (C.limitar(t / dur, 0, 1) * 100).toFixed(2) + "%";
        barra.setAttribute("aria-valuenow", String(Math.round(t)));
        barra.setAttribute("aria-valuetext", reloj(t) + " / " + reloj(dur));
      }
      tActual.textContent = reloj(t);
      if (!lineas.length) return;
      var i = indiceEn(t - (Number(d.desfaseLetra) || 0));
      if (i !== actual || forzar) {
        nodosLinea.forEach(function (n, k) {
          n.classList.toggle("pasada", k < i);
          n.classList.toggle("actual", k === i);
          n.classList.toggle("proxima", k === i + 1);
        });
        actual = i;
        centrar();
        if (sonando && liberada) llamar(ctx, "alLinea", i >= 0 ? lineas[i].texto : "");
      }
      if (nodosLinea[i]) {
        var l = lineas[i], sig = lineas[i + 1];
        var largo = sig ? sig.t - l.t : (isFinite(dur) ? dur - l.t : 6);
        nodosLinea[i].style.setProperty("--avance", (C.limitar((t - (Number(d.desfaseLetra) || 0) - l.t) / Math.max(0.3, largo), 0, 1) * 100).toFixed(1) + "%");
      }
    }
    function bucleLetra() {
      cancelAnimationFrame(bucle);
      (function paso() {
        sincronizar(false);
        if (sonando) bucle = requestAnimationFrame(paso);
      })();
    }

    function volumenDestino() { return volumenBase * (atenuada ? 0.35 : 1); }
    function reproducir() {
      prepararAudio();
      llamar(ctx, "antesDeSonar");
      error.hidden = true;
      try { if (audio.volume < 0.02) audio.volume = volumenDestino(); } catch (e) { /* sin control de volumen */ }
      var p;
      try { p = audio.play(); } catch (e) { p = null; error.hidden = false; }
      if (p && p.catch) p.catch(function (err) { if (!err || err.name !== "AbortError") error.hidden = false; });
    }
    function pausar() { if (audio && !audio.paused) audio.pause(); }
    function alternar() { if (sonando) pausar(); else reproducir(); }

    function liberar() {
      liberada = true;
      raiz.classList.remove("sellada");
      raiz.classList.add("liberada");
      titulo.textContent = d.titulo || "";
      artista.textContent = d.artista || "";
      barra.tabIndex = 0;
      if (d.pistaLiberada != null) pista.textContent = d.pistaLiberada;
      else pista.hidden = true;
      var c = centroDe(disco);
      lanzarChispas(c.x, c.y, { cantidad: 24, alcance: 100, color: acentoDe(raiz), onda: 170 });
      llamar(ctx.sonido, "arpegio");
      Cancion.actual = api;
      prepararAudio();
      armarLetra();
      // Espera a que la letra termine de abrirse para dejar a la vista el disco y la letra.
      setTimeout(function () { mostrarEn(ctx, raiz); }, quieto() ? 320 : 700);
    }

    disco.addEventListener("click", function () {
      // Si la canción ya suena desde el inicio, el sol solo la descubre (no la corta).
      if (!liberada) {
        liberar();
        if (!sonando) reproducir();
      } else {
        alternar();
      }
    });

    // Fundido suave del volumen. En iPhone el volumen no se puede cambiar y suena igual.
    function fundirA(destino, ms) {
      if (!audio) return;
      cancelAnimationFrame(fundido);
      var inicio = audio.volume, t0 = performance.now();
      (function paso(t) {
        var k = Math.min(1, ((t || performance.now()) - t0) / ms);
        try { audio.volume = C.limitar(inicio + (destino - inicio) * k, 0, 1); } catch (e) { return; }
        if (k < 1) fundido = requestAnimationFrame(paso);
      })(t0);
    }
    // Durante los momentos interactivos baja un poco, para que se oigan sus sonidos.
    function atenuar(si) {
      if (atenuada === !!si) return;
      atenuada = !!si;
      if (audio && sonando) fundirA(volumenDestino(), 900);
      else if (audio) { try { audio.volume = volumenDestino(); } catch (e) { /* sin control de volumen */ } }
    }

    // Suena desde el inicio. Los navegadores no dejan que suene sola antes de que la
    // persona toque la página, así que empieza con su primer toque o tecla.
    function dejarDeEsperar() {
      if (!esperaToque) return;
      EVENTOS_TOQUE.forEach(function (tipo) { window.removeEventListener(tipo, esperaToque, true); });
      esperaToque = null;
    }
    function intentarSonar() {
      if (sonando) { dejarDeEsperar(); return; }
      llamar(ctx, "antesDeSonar");
      try { audio.volume = 0; } catch (e) { /* sin control de volumen */ }
      var p;
      try { p = audio.play(); } catch (e) { p = null; }
      if (p && p.then) {
        p.then(function () { dejarDeEsperar(); fundirA(volumenDestino(), 2400); }, function () { /* espera el siguiente toque */ });
      }
    }
    function sonarDesdeElInicio(op) {
      op = op || {};
      if (iniciada) return;
      iniciada = true;
      Cancion.actual = api;
      prepararAudio();
      esperaToque = function (e) {
        if (e.type === "keydown" && e.key === "Escape") return;
        // Un toque en el botón de música lo decide ese botón.
        if (op.excepto && e.target && e.target.closest && e.target.closest(op.excepto)) { dejarDeEsperar(); return; }
        intentarSonar();
      };
      EVENTOS_TOQUE.forEach(function (tipo) { window.addEventListener(tipo, esperaToque, true); });
      intentarSonar();
    }

    function buscar(fraccion) {
      if (!audio || !audio.duration || !isFinite(audio.duration)) return;
      audio.currentTime = C.limitar(fraccion, 0, 1) * audio.duration;
      sincronizar(true);
    }
    var buscando = null;
    barra.addEventListener("pointerdown", function (e) {
      if (!liberada) return;
      buscando = e.pointerId;
      try { barra.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      var r = barra.getBoundingClientRect();
      buscar((e.clientX - r.left) / r.width);
    });
    barra.addEventListener("pointermove", function (e) {
      if (buscando !== e.pointerId) return;
      var r = barra.getBoundingClientRect();
      buscar((e.clientX - r.left) / r.width);
    });
    ["pointerup", "pointercancel"].forEach(function (tipo) {
      barra.addEventListener(tipo, function () { buscando = null; });
    });
    barra.addEventListener("keydown", function (e) {
      if (!audio || !audio.duration) return;
      var paso = 0;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") paso = 5;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") paso = -5;
      else if (e.key === "Home") { e.preventDefault(); buscar(0); return; }
      if (!paso) return;
      e.preventDefault();
      buscar((audio.currentTime + paso) / audio.duration);
    });

    var api = {
      elemento: raiz,
      cargada: function () { return liberada || iniciada; },
      sonarDesdeElInicio: sonarDesdeElInicio,
      atenuar: atenuar,
      sonando: function () { return sonando; },
      alternar: alternar,
      pausar: pausar,
      titulo: d.titulo || "",
      // Al volver a abrir la tarjeta, la letra vuelve a centrar la línea que suena.
      alMostrar: function () { requestAnimationFrame(function () { sincronizar(true); }); },
      liberarYa: function () { if (!liberada) { liberada = true; raiz.classList.remove("sellada"); raiz.classList.add("liberada"); titulo.textContent = d.titulo || ""; artista.textContent = d.artista || ""; barra.tabIndex = 0; pista.hidden = true; Cancion.actual = api; prepararAudio(); armarLetra(); } }
    };
    return api;
  }

  function crearSorpresa(d, ctx) {
    if (!d || !d.tipo) return null;
    ctx = ctx || {};
    if (d.tipo === "cita") return crearCita(d, ctx);
    if (d.tipo === "cancion" && d.archivo) return crearCancion(d, ctx);
    return null;
  }

  C.chispas = lanzarChispas;
  C.Botones = { activar: activarBotones };
  C.Galeria = { crear: crearGaleria };
  C.Sorpresas = { crear: crearSorpresa, enlaceWhatsApp: enlaceWhatsApp, leerLetra: leerLetra };
  C.Cancion = Cancion;
})(window.Cielo);
