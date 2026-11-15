/* El cielo de nosotros · recorrido
   Bienvenida → vuelo hacia el universo → explorar girándolo con el dedo →
   cada constelación abre su momento interactivo → recuerdo → al completar
   las cinco, un cometa dibuja un corazón con ellas, su nombre se escribe con
   estrellas y se abre la carta. */
(function (C) {
  "use strict";

  var cfg = window.CIELO_CONFIG || {};
  var T = cfg.textos || {};
  var THREE = window.THREE;
  var cuerpo = document.body;
  function $(id) { return document.getElementById(id); }

  document.title = T.tituloPagina || document.title;

  /* ---------- Sin 3D: los recuerdos y la carta, en una página sencilla ---------- */

  function hayWebGL2() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
    } catch (e) { return false; }
  }

  function textoNodo(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }

  // Una galería (recuerdo.fotos) deja su primera foto como recuerdo.foto:
  // es la que forma el polvo de estrellas en el momento “revelado”.
  (cfg.constelaciones || []).forEach(function (d) {
    var r = d.recuerdo;
    if (!r || !r.fotos) return;
    r.fotos = (r.fotos || []).map(function (f) { return typeof f === "string" ? { foto: f } : f; })
      .filter(function (f) { return f && f.foto; });
    if (!r.fotos.length) { r.fotos = null; return; }
    if (!r.foto) {
      r.foto = r.fotos[0].foto;
      if (!r.textoAlternativo) r.textoAlternativo = r.fotos[0].textoAlternativo || "";
    }
  });

  // Chispas y brillo en todos los botones.
  C.Botones.activar({ sonido: function () { return musica; } });

  function mostrarSin3D() {
    cuerpo.className = "sin-3d-activo";
    ["bienvenida", "ayuda", "controles-zoom"].forEach(function (id) { var el = $(id); if (el) el.hidden = true; });
    var marcador = document.querySelector(".barra");
    if (marcador) marcador.hidden = true;
    $("sin-3d-para").textContent = (T.dedicatoriaBienvenida || "Para") + " " + (cfg.destinatario || "");
    $("sin-3d-titulo").textContent = T.bienvenida || "";
    $("sin-3d-aviso").textContent = T.sin3d || "";
    var cont = $("sin-3d-recuerdos");
    (cfg.constelaciones || []).forEach(function (d) {
      var r = d.recuerdo || {};
      if (d.mapaEstelar && C.MapaEstelar && C.MapaEstelar.disponible()) {
        cont.appendChild(C.MapaEstelar.plano(d.mapaEstelar, {
          textos: T, destinatario: cfg.destinatario, remitente: cfg.remitente, mensaje: r.mensaje, color: d.color
        }));
        return;
      }
      var art = textoNodo("article", "recuerdo recuerdo--plano");
      art.style.setProperty("--acento", d.color || "#f3dca8");
      if (r.fotos && r.fotos.length) {
        var gal = C.Galeria.crear(r.fotos, { textos: T, titulo: r.titulo || d.nombre });
        art.appendChild(gal.elemento);
        gal.mostrar(500);
      } else if (r.foto) {
        var fig = textoNodo("figure", "recuerdo__foto");
        var img = document.createElement("img");
        img.src = r.foto;
        img.alt = r.textoAlternativo || "";
        fig.appendChild(img);
        art.appendChild(fig);
      }
      var tx = textoNodo("div", "recuerdo__texto");
      tx.appendChild(textoNodo("p", "recuerdo__fecha", [d.forma, r.fecha].filter(Boolean).join(" · ")));
      tx.appendChild(textoNodo("h2", "recuerdo__titulo", r.titulo || d.nombre));
      tx.appendChild(textoNodo("p", "recuerdo__mensaje", r.mensaje || ""));
      if (r.lista && r.lista.length) {
        var ul = textoNodo("ul", "recuerdo__lista");
        r.lista.forEach(function (item) { ul.appendChild(textoNodo("li", "", item)); });
        tx.appendChild(ul);
      }
      var sorpresa = r.sorpresa ? C.Sorpresas.crear(r.sorpresa, { textos: T }) : null;
      if (sorpresa) tx.appendChild(sorpresa.elemento);
      if (sorpresa && sorpresa.sonarDesdeElInicio && r.sorpresa.desdeElInicio && !C.Cancion.actual) sorpresa.sonarDesdeElInicio();
      art.appendChild(tx);
      cont.appendChild(art);
    });
    var carta = cfg.carta || {}, ct = $("sin-3d-carta");
    ct.appendChild(textoNodo("h2", "carta__saludo", carta.saludo || ""));
    (carta.parrafos || []).forEach(function (p) { ct.appendChild(textoNodo("p", "carta__parrafo", p)); });
    ct.appendChild(textoNodo("p", "carta__despedida", carta.despedida || ""));
    ct.appendChild(textoNodo("p", "carta__firma carta__firma--visible", carta.firma || cfg.remitente || ""));
    $("sin-3d").hidden = false;
  }

  if (!THREE || !hayWebGL2()) { mostrarSin3D(); return; }

  var movil = C.esTactil() || Math.min(window.innerWidth, window.innerHeight) < 600;
  var u;
  try {
    u = new C.Universo($("cielo"), cfg, { movil: movil });
  } catch (err) {
    if (window.console) console.error(err);
    mostrarSin3D();
    return;
  }

  var camara = new C.Camara(u.camara);
  var musica = C.MusicaAmbiental.crear(cfg.musica || {});
  var lista = u.constelaciones;
  var total = lista.length;
  var reducido = C.movimientoReducido();
  var rnd = C.azar(((cfg.cielo || {}).semilla || 7) + 101);

  var estado = {
    fase: "bienvenida",
    descubiertas: {},
    activa: null,
    ritual: null,
    teclado: false,
    vistaPrevia: null,
    pausado: false,
    finalVisto: false,
    recorrido: null,
    ultimoGesto: 0
  };
  window.__cielo = { estado: estado, universo: u, camara: camara };

  /* ---------- Vistas de la cámara ---------- */

  var centro = new THREE.Vector3(), caja = new THREE.Box3(), tmp = new THREE.Vector3();

  function medirEscena() {
    caja.makeEmpty();
    lista.forEach(function (c) { caja.expandByPoint(c.grupo.position); });
    caja.getCenter(centro);
  }
  medirEscena();

  function vertical() { return u.camara.aspect < 0.8; }

  function distanciaParaVer(ancho, alto, margenV, margenH) {
    var tv = Math.tan(u.camara.fov * Math.PI / 360);
    return Math.max((alto / 2) / (tv * margenV), (ancho / 2) / (tv * u.camara.aspect * margenH));
  }

  function vistaUniverso(az) {
    var S = u.S;
    var ancho = caja.max.x - caja.min.x + S * 1.3, alto = caja.max.y - caja.min.y + S * 1.5;
    // En pantallas bajas (celular de lado) hace falta más aire para los nombres.
    var bajo = u.alto < 520 && !vertical();
    var d = distanciaParaVer(ancho, alto, vertical() ? 0.62 : bajo ? 0.6 : 0.76, 0.95);
    return { objetivo: centro.clone().add(new THREE.Vector3(0, -S * (bajo ? 0.3 : 0.08), 0)), az: az == null ? 0 : az, el: 0.1, dist: d };
  }

  function vistaBienvenida() {
    var v = vistaUniverso(-0.6);
    v.el = 0.46;
    v.dist *= vertical() ? 1.15 : 1.35;
    v.objetivo.y += u.S * (vertical() ? 1.25 : 0.7);
    return v;
  }

  function vistaDetalle(c) {
    var p = c.grupo.position, S = c.S;
    // La cámara se pone del lado de afuera, para que la galaxia quede detrás de la figura.
    var az = Math.atan2(p.x, p.z + 16);
    var el = C.limitar(Math.atan2(p.y - 1, Math.hypot(p.x, p.z + 16)) * 0.55, -0.16, 0.26);
    var tam = S * 1.5;
    var d = distanciaParaVer(tam, tam, vertical() ? 0.6 : 0.62, 0.92);
    return { objetivo: p.clone().add(new THREE.Vector3(0, -S * 0.02, 0)), az: az, el: el, dist: d };
  }

  function vistaFinal(sinMensaje) {
    var b = new THREE.Box3();
    u.camino.puntos.forEach(function (p) { b.expandByPoint(p); });
    var S = u.S, ancho = b.max.x - b.min.x + S * 0.7, alto = b.max.y - b.min.y + S * 0.7;
    var v = vertical();
    var d = distanciaParaVer(ancho, alto, sinMensaje ? 0.78 : v ? 0.46 : 0.6, v ? 0.86 : 0.94);
    var obj = b.getCenter(new THREE.Vector3());
    if (sinMensaje) return { objetivo: obj, az: 0, el: 0.02, dist: d };
    var tv = Math.tan(u.camara.fov * Math.PI / 360);
    // Deja espacio abajo para el mensaje: el corazón sube un poco en pantalla.
    obj.y -= d * tv * (v ? 0.26 : 0.2);
    return { objetivo: obj, az: 0, el: 0.02, dist: d };
  }

  /* ---------- Textos ---------- */

  function prepararTextos() {
    $("para-quien").textContent = (T.dedicatoriaBienvenida || "Para") + " " + (cfg.destinatario || "");
    var h = $("mensaje-bienvenida");
    h.textContent = "";
    (T.bienvenida || "").split(/\s+/).forEach(function (p, i, arr) {
      var s = textoNodo("span", "palabra", p);
      s.style.setProperty("--i", i);
      h.appendChild(s);
      if (i < arr.length - 1) h.appendChild(document.createTextNode(" "));
    });
    $("texto-entrar").textContent = T.botonEntrar || "";
    $("marca").textContent = T.firmaMarca || "";
    $("etiqueta-vista").textContent = T.vistaGeneral || "";
    $("boton-vista").title = T.vistaGeneral || "";
    $("etiqueta-acercar").textContent = T.acercar || "";
    $("etiqueta-alejar").textContent = T.alejar || "";
    $("texto-volver").textContent = T.volverCielo || "";
    $("boton-cerrar-recuerdo").textContent = T.cerrarRecuerdo || "";
    $("final-previo").textContent = T.antesDelFinal || "";
    $("final-mensaje").textContent = T.final || "";
    $("boton-carta").textContent = T.abrirCarta || "";
    $("boton-leer-carta").textContent = T.leerCarta || "";
    $("boton-repetir").textContent = T.repetir || "";
    $("boton-contemplar").textContent = T.contemplar || "";
    var carta = cfg.carta || {};
    $("carta-saludo").textContent = carta.saludo || "";
    var cuerpoCarta = $("carta-cuerpo");
    (carta.parrafos || []).forEach(function (p, i) {
      var el = textoNodo("p", "", p);
      el.style.setProperty("--i", i);
      cuerpoCarta.appendChild(el);
    });
    $("carta-despedida").textContent = carta.despedida || "";
    $("carta-firma").textContent = carta.firma || cfg.remitente || "";
    var m = cfg.musica || {};
    if (m.habilitada === false) $("boton-musica").hidden = true;
    actualizarMusica();
  }

  // Si la canción suena desde el inicio o ya se desbloqueó, el botón de música la pausa o la reanuda.
  function cancionLista() {
    var c = C.Cancion && C.Cancion.actual;
    return c && c.cargada() ? c : null;
  }

  function actualizarMusica() {
    var m = cfg.musica || {}, cancion = cancionLista();
    var sonando = musica.estaSonando() || !!(cancion && cancion.sonando());
    $("boton-musica").classList.toggle("sonando", sonando);
    $("boton-musica").setAttribute("aria-pressed", sonando ? "true" : "false");
    $("etiqueta-musica").textContent = sonando ? (m.etiquetaPausar || "Pausar música") : (m.etiquetaActivar || "Activar música");
    $("boton-musica").title = $("etiqueta-musica").textContent;
  }

  /* ---------- Etiquetas, indicadores y progreso ---------- */

  var marcadorEstrellas = $("marcador-estrellas");
  lista.forEach(function () { marcadorEstrellas.appendChild(textoNodo("span", "marcador__estrella")); });

  var proy = lista.map(function () { return { x: 0, y: 0, r: 0, delante: false, enPantalla: false }; });

  var etiquetas = lista.map(function (c) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "etiqueta";
    b.tabIndex = -1;
    b.style.setProperty("--acento", c.datos.color || "#f3dca8");
    b.appendChild(textoNodo("span", "etiqueta__forma", c.datos.forma || ""));
    b.appendChild(textoNodo("span", "etiqueta__nombre", c.datos.nombre || ""));
    b.setAttribute("aria-label", C.formatear(T.abrir || "{nombre}", { nombre: c.datos.nombre }));
    b.addEventListener("click", function () { abrirConstelacion(c); });
    b.addEventListener("focus", function () {
      if (estado.teclado && (estado.fase === "universo" || estado.fase === "contemplar")) girarHacia(c);
    });
    $("etiquetas").appendChild(b);
    return b;
  });

  var indicadores = lista.map(function (c) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "indicador";
    b.tabIndex = -1;
    b.style.setProperty("--acento", c.datos.color || "#f3dca8");
    b.innerHTML = '<span class="indicador__flecha"></span><span class="indicador__punto"></span>';
    b.addEventListener("click", function () { girarHacia(c); });
    $("indicadores").appendChild(b);
    return b;
  });

  function actualizarProgreso() {
    var n = Object.keys(estado.descubiertas).length;
    $("progreso").textContent = C.formatear(T.progreso || "{n} / {total}", { n: n, total: total });
    Array.prototype.forEach.call(marcadorEstrellas.children, function (s, i) {
      s.classList.toggle("encendida", !!estado.descubiertas[lista[i].id]);
    });
    lista.forEach(function (c, i) {
      var desc = !!estado.descubiertas[c.id];
      etiquetas[i].classList.toggle("descubierta", desc);
      etiquetas[i].setAttribute("aria-label", C.formatear(T.abrir || "{nombre}", { nombre: c.datos.nombre }) + (desc ? ", " + (T.descubierta || "") : ""));
      indicadores[i].classList.toggle("descubierta", desc);
    });
  }

  var anchosEtiquetas = [];

  function enExploracion() { return estado.fase === "universo" || estado.fase === "contemplar"; }

  function actualizarCapas() {
    var ancho = u.ancho, alto = u.alto, explorar = enExploracion() && !camara.vuelo;
    var margen = 24;
    for (var i = 0; i < lista.length; i++) {
      var c = lista[i], info = proy[i];
      c.centroMundo(tmp);
      u.aPantalla(tmp, info);
      info.r = u.escalaEn(tmp) * c.S * 0.5;
      info.enPantalla = info.delante && info.x > -info.r * 0.3 && info.x < ancho + info.r * 0.3 && info.y > -info.r * 0.3 && info.y < alto + info.r * 0.3;
      var b = etiquetas[i];
      var mostrar = enExploracion() && info.enPantalla && c.visibilidad > 0.5;
      b.classList.toggle("visible", mostrar);
      if (mostrar) {
        // La etiqueta no se sale de la pantalla aunque la constelación esté en el borde.
        if (!anchosEtiquetas[i]) anchosEtiquetas[i] = b.offsetWidth;
        var mitad = anchosEtiquetas[i] / 2 + 8;
        var ex = mitad * 2 < ancho ? C.limitar(info.x, mitad, ancho - mitad) : ancho / 2;
        b.style.transform = "translate(" + ex.toFixed(1) + "px," + (info.y + info.r * 0.62 + 10).toFixed(1) + "px)";
      }
      // Indicador en el borde si la constelación quedó fuera de la vista.
      var ind = indicadores[i];
      var fuera = explorar && !info.enPantalla && c.visibilidad > 0.5;
      ind.classList.toggle("visible", fuera);
      if (fuera) {
        var dx = info.x - ancho / 2, dy = info.y - alto / 2;
        if (!info.delante) { dx = -dx; dy = -dy; }
        var ang = Math.atan2(dy, dx);
        var kx = (ancho / 2 - margen - 20) / Math.max(1e-3, Math.abs(Math.cos(ang)));
        var ky = (alto / 2 - margen - 60) / Math.max(1e-3, Math.abs(Math.sin(ang)));
        var k = Math.min(kx, ky);
        ind.style.transform = "translate(" + (ancho / 2 + Math.cos(ang) * k).toFixed(1) + "px," + (alto / 2 + Math.sin(ang) * k).toFixed(1) + "px)";
        ind.style.setProperty("--ang", ang + "rad");
      }
    }
  }

  function constelacionEn(x, y) {
    var mejor = null, menor = Infinity;
    for (var i = 0; i < lista.length; i++) {
      var info = proy[i], c = lista[i];
      if (!info.delante || c.visibilidad < 0.5) continue;
      var dx = x - info.x, dy = y - info.y, d = Math.hypot(dx, dy);
      var radio = Math.max(46, info.r * 0.72);
      var enEtiqueta = Math.abs(dx) < 80 && dy > 0 && dy < info.r * 0.62 + 52;
      if ((d < radio || enEtiqueta) && d < menor) { menor = d; mejor = c; }
    }
    return mejor;
  }

  /* ---------- Ayuda ---------- */

  var temporizadorAyuda = 0;
  function mostrarAyuda(soloPrincipal, duracion) {
    clearTimeout(temporizadorAyuda);
    $("ayuda-principal").textContent = T.indicacion || "";
    var gestos = estado.teclado ? T.gestosTeclado : (C.esTactil() ? T.gestosTactil : T.gestosRaton);
    $("ayuda-secundaria").textContent = gestos || "";
    $("ayuda").classList.toggle("arrastrado", !!soloPrincipal);
    $("ayuda").classList.add("visible");
    if (duracion) temporizadorAyuda = setTimeout(ocultarAyuda, duracion);
  }
  function ocultarAyuda() {
    clearTimeout(temporizadorAyuda);
    $("ayuda").classList.remove("visible");
  }

  /* ---------- Interfaz que usan los momentos ---------- */

  var capa = $("capa-momento");
  var etiquetasMomento = {};
  var botonesMomento = {};
  var fotoMomento = null;
  var CIRCUNFERENCIA = 2 * Math.PI * 44;
  $("anillo-progreso").style.strokeDasharray = CIRCUNFERENCIA;

  var ui = {
    indicacion: function (texto) {
      var el = $("momento-indicacion");
      if (el.textContent === texto) return;
      el.classList.remove("cambio");
      void el.offsetWidth;
      el.textContent = texto;
      el.classList.add("cambio");
    },
    progreso: function (n, tot) {
      var cont = $("momento-puntos");
      if (cont.children.length !== tot) {
        cont.textContent = "";
        for (var i = 0; i < tot; i++) cont.appendChild(textoNodo("span"));
      }
      Array.prototype.forEach.call(cont.children, function (s, i) { s.classList.toggle("encendido", i < n); });
    },
    anillo: function (pos, p) {
      var a = $("anillo");
      if (!pos) { a.classList.remove("visible"); return; }
      a.classList.add("visible");
      a.classList.toggle("guia", !!pos.guia);
      a.style.transform = "translate(" + pos.x.toFixed(1) + "px," + pos.y.toFixed(1) + "px)";
      $("anillo-progreso").style.strokeDashoffset = ((1 - C.limitar(p || 0, 0, 1)) * CIRCUNFERENCIA).toFixed(1);
    },
    frase: function (texto, x, y, op) {
      op = op || {};
      if (op.ranura) {
        // Una frase a la vez, debajo de la figura, para que no se encimen.
        Array.prototype.forEach.call(capa.querySelectorAll(".frase--ranura"), function (vieja) {
          vieja.classList.add("saliendo");
          setTimeout(function () { if (vieja.parentNode) vieja.parentNode.removeChild(vieja); }, 450);
        });
        x = u.ancho / 2;
        y = u.alto * op.ranura;
        // Arriba, siempre por debajo del título y las indicaciones.
        if (op.ranura < 0.5) y = Math.max(y, $("momento-puntos").getBoundingClientRect().bottom + 18);
      }
      var el = textoNodo("p", "frase" + (op.grande ? " frase--grande" : "") + (op.ranura ? " frase--ranura" : ""), texto);
      var ancho = Math.min(u.ancho - 32, op.grande ? 520 : 300);
      el.style.width = ancho + "px";
      var cx = C.limitar(x, 16 + ancho / 2, u.ancho - 16 - ancho / 2);
      var cy = op.ranura ? y : C.limitar(y, 150, u.alto - 120);
      el.style.left = (cx - ancho / 2).toFixed(1) + "px";
      el.style.top = cy.toFixed(1) + "px";
      capa.appendChild(el);
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, op.grande ? 5200 : op.ranura ? 5600 : 4600);
    },
    etiqueta: function (id, texto, x, y, visible) {
      var el = etiquetasMomento[id];
      if (!el) {
        if (!visible) return;
        el = etiquetasMomento[id] = textoNodo("span", "alma-nombre", texto);
        capa.appendChild(el);
      }
      if (texto) el.textContent = texto;
      el.classList.toggle("visible", !!visible);
      if (visible) el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    },
    botones: function (defs) {
      var cont = $("botones-momento");
      cont.textContent = "";
      botonesMomento = {};
      defs.forEach(function (d) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "boton-momento";
        b.setAttribute("aria-label", d.etiqueta);
        b.addEventListener("click", d.alActivar);
        cont.appendChild(b);
        botonesMomento[d.id] = b;
      });
    },
    moverBoton: function (id, x, y) {
      var b = botonesMomento[id];
      if (b) b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
    },
    quitarBoton: function (id) {
      var b = botonesMomento[id];
      if (!b) return;
      var siguiente = b.nextElementSibling || b.previousElementSibling;
      var teniaFoco = document.activeElement === b;
      b.parentNode.removeChild(b);
      delete botonesMomento[id];
      if (teniaFoco) (siguiente || $("momento")).focus();
    },
    flash: function (intensidad) {
      var d = $("destello");
      d.style.setProperty("--intensidad", reducido ? intensidad * 0.4 : intensidad);
      d.classList.remove("activo");
      void d.offsetWidth;
      d.classList.add("activo");
    },
    foto: function (src) {
      var el = textoNodo("div", "revelado");
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      el.appendChild(img);
      capa.appendChild(el);
      fotoMomento = el;
    },
    fotoMarco: function (x, y, w, h, revelado, opacidad) {
      var el = fotoMomento;
      if (!el) return;
      el.style.width = w.toFixed(1) + "px";
      el.style.height = h.toFixed(1) + "px";
      el.style.transform = "translate(" + (x - w / 2).toFixed(1) + "px," + (y - h / 2).toFixed(1) + "px)";
      el.style.setProperty("--revelado", revelado.toFixed(3));
      el.style.opacity = opacidad.toFixed(3);
    },
    anunciar: function (texto) {
      var a = $("anuncio");
      a.textContent = "";
      setTimeout(function () { a.textContent = texto; }, 60);
    }
  };

  function limpiarCapaMomento() {
    Array.prototype.slice.call(capa.querySelectorAll(".frase, .alma-nombre, .revelado")).forEach(function (el) { el.parentNode.removeChild(el); });
    etiquetasMomento = {};
    fotoMomento = null;
    ui.anillo(null);
    ui.botones([]);
  }

  /* ---------- Bienvenida y entrada ---------- */

  function entrar() {
    if (estado.fase !== "bienvenida") return;
    estado.fase = "entrando";
    musica.prepararEfectos();
    $("bienvenida").classList.add("saliendo");
    cuerpo.classList.remove("en-bienvenida");
    camara.giroAutoObjetivo = 0;
    camara.vaivenObjetivo = 0;
    var destino = vistaUniverso(0);
    var dur = reducido ? 1 : 3800;
    lista.forEach(function (c, i) {
      setTimeout(function () {
        c.visibilidadObjetivo = 1;
        c.faroObjetivo = 1;
        c.guiasObjetivo = 0.14;
        u.destellos.emitir(c.centroMundo(), c.S * 1.2, c.acento, 1.5);
        musica.campanilla(i * 2);
      }, (reducido ? 0 : 1700) + i * (reducido ? 0 : 280));
    });
    setTimeout(function () { $("bienvenida").hidden = true; }, 1100);
    camara.volarA(destino, { duracion: dur, curva: C.suave }).then(function () {
      if (estado.fase !== "entrando") return;
      estado.fase = "universo";
      cuerpo.classList.add("en-universo");
      etiquetas.forEach(function (b) { b.tabIndex = 0; });
      mostrarAyuda(false);
      estado.ultimoGesto = performance.now();
    });
  }

  /* ---------- Explorar ---------- */

  function girarHacia(c) {
    var p = c.grupo.position;
    var v = vistaUniverso(Math.atan2(p.x - centro.x, p.z + 18));
    v.dist = Math.min(camara.dist, v.dist);
    camara.volarA(v, { duracion: reducido ? 1 : 1100 });
  }

  function vistaGeneral() {
    if (!enExploracion()) return;
    camara.volarA(vistaUniverso(0), { duracion: reducido ? 1 : 1500 });
  }

  function interaccion() {
    estado.ultimoGesto = performance.now();
    camara.giroAutoObjetivo = 0;
  }

  /* ---------- Momentos ---------- */

  function abrirConstelacion(c) {
    if (!enExploracion() || estado.activa) return;
    estado.faseAnterior = estado.fase;
    estado.fase = "momento";
    estado.activa = c;
    estado.vistaPrevia = camara.estado();
    camara.giroAutoObjetivo = 0;
    ocultarAyuda();
    cuerpo.classList.add("en-momento");
    var descubierta = !!estado.descubiertas[c.id];
    lista.forEach(function (o) {
      o.atenuacionObjetivo = o === c ? 1 : 0.1;
      o.faroObjetivo = 0;
      o.guiasObjetivo = o === c && !descubierta ? 0.16 : 0;
    });
    c.tamObjetivo = 0.6;
    u.brilloGalaxiaObjetivo = 0.3;
    u.ondas.emitir(c.centroMundo(), c.S * 0.8, c.acento, 1.3);
    musica.campanilla(3);
    C.vibrar(10);
    $("momento-forma").textContent = c.datos.forma || "";
    $("momento-nombre").textContent = c.datos.nombre || "";
    ui.indicacion("");
    ui.progreso(0, 0);
    var sec = $("momento");
    sec.hidden = false;
    sec.classList.toggle("descubierta", descubierta);
    requestAnimationFrame(function () { sec.classList.add("visible"); });
    if (estado.teclado) sec.focus({ preventScroll: true });
    camara.vaivenObjetivo = reducido ? 0 : 1;
    camara.volarA(vistaDetalle(c), { duracion: reducido ? 1 : 1800, arco: 0.04 }).then(function (ok) {
      if (!ok || estado.activa !== c || estado.fase !== "momento") return;
      if (descubierta) abrirDestino(c);
      else iniciarMomento(c);
    });
  }

  var TIPO_POR_DEFECTO = ["encuentro", "revelado", "luces", "deseos", "latido"];

  // Durante cada momento la canción baja un poco, para que se oigan sus sonidos.
  function atenuarCancion(si) {
    var cancion = cancionLista();
    if (cancion && cancion.atenuar) cancion.atenuar(si);
  }

  function iniciarMomento(c) {
    atenuarCancion(true);
    var tipo = (c.datos.experiencia || {}).tipo || TIPO_POR_DEFECTO[c.indice % TIPO_POR_DEFECTO.length];
    cuerpo.setAttribute("data-momento", tipo);
    estado.ritual = C.Rituales.crear(tipo, {
      u: u, c: c, ui: ui, sonido: musica, config: cfg, datos: c.datos,
      reducido: reducido, movil: movil,
      teclado: function () { return estado.teclado; },
      alCompletar: function () { completarMomento(c); }
    });
  }

  function terminarRitual() {
    atenuarCancion(false);
    if (estado.ritual) {
      estado.ritual.destruir();
      estado.ritual = null;
    }
    limpiarCapaMomento();
    cuerpo.removeAttribute("data-momento");
  }

  function completarMomento(c) {
    if (estado.activa !== c || estado.fase !== "momento") return;
    estado.descubiertas[c.id] = true;
    c.completar();
    actualizarProgreso();
    abrirDestino(c);
  }

  function ocultarMomento() {
    var sec = $("momento");
    sec.classList.remove("visible");
    setTimeout(function () { if (!sec.classList.contains("visible")) sec.hidden = true; }, 600);
  }

  function regresarAlCielo(c) {
    lista.forEach(function (o) {
      o.atenuacionObjetivo = 1;
      o.faroObjetivo = 1;
      o.guiasObjetivo = estado.descubiertas[o.id] ? 0 : 0.14;
      o.tamObjetivo = 1;
    });
    u.brilloGalaxiaObjetivo = 1;
    camara.vaivenObjetivo = 0;
    cuerpo.classList.remove("en-momento");
    estado.activa = null;
    var completas = Object.keys(estado.descubiertas).length >= total;
    var destino = estado.vistaPrevia || vistaUniverso(camara.az);
    estado.fase = estado.faseAnterior === "contemplar" ? "contemplar" : "universo";
    camara.volarA(destino, { duracion: reducido ? 1 : 1700 }).then(function () {
      if (completas && !estado.finalVisto && estado.fase === "universo") {
        sorpresaFinal();
      } else if (enExploracion() && !completas) {
        mostrarAyuda(true, 4500);
      }
      if (c && estado.teclado && enExploracion()) etiquetas[c.indice].focus({ preventScroll: true });
    });
    estado.ultimoGesto = performance.now();
  }

  function volverDesdeMomento() {
    if (estado.fase !== "momento") return;
    var c = estado.activa;
    terminarRitual();
    if (c && !estado.descubiertas[c.id]) c.reiniciar();
    ocultarMomento();
    regresarAlCielo(c);
  }

  /* ---------- Recuerdo ---------- */

  var temporizadorPausa = 0;

  // Dibuja la constelación del recuerdo como en una carta celeste antigua.
  var ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  var SVG = "http://www.w3.org/2000/svg";

  function nodoSvg(etiqueta, atributos) {
    var el = document.createElementNS(SVG, etiqueta);
    for (var k in atributos) el.setAttribute(k, atributos[k]);
    return el;
  }

  function dibujarLamina(c) {
    var d = c.datos, mapa = $("recuerdo-mapa");
    var estrellas = d.estrellas || [];
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    estrellas.forEach(function (e) {
      minX = Math.min(minX, e[0]); maxX = Math.max(maxX, e[0]);
      minY = Math.min(minY, e[1]); maxY = Math.max(maxY, e[1]);
    });
    (d.anillos || []).forEach(function (a) {
      var e = estrellas[a.estrella];
      if (!e) return;
      minX = Math.min(minX, e[0] - a.radio); maxX = Math.max(maxX, e[0] + a.radio);
      minY = Math.min(minY, e[1] - a.radio); maxY = Math.max(maxY, e[1] + a.radio);
    });
    var m = 9;
    mapa.setAttribute("viewBox", [minX - m, minY - m, maxX - minX + m * 2, maxY - minY + m * 2].map(function (v) { return v.toFixed(1); }).join(" "));
    mapa.textContent = "";
    var defs = nodoSvg("defs", {});
    var filtro = nodoSvg("filter", { id: "brillo-lamina", x: "-200%", y: "-200%", width: "500%", height: "500%" });
    filtro.appendChild(nodoSvg("feGaussianBlur", { stdDeviation: "1.6", result: "halo" }));
    var mezcla = nodoSvg("feMerge", {});
    mezcla.appendChild(nodoSvg("feMergeNode", { "in": "halo" }));
    mezcla.appendChild(nodoSvg("feMergeNode", { "in": "SourceGraphic" }));
    filtro.appendChild(mezcla);
    defs.appendChild(filtro);
    mapa.appendChild(defs);
    (d.trazos || []).forEach(function (t, k) {
      var a = estrellas[t[0]], b = estrellas[t[1]];
      if (!a || !b) return;
      var punteada = t[2] === "punteado";
      var linea = nodoSvg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], "class": "traza" + (punteada ? " traza--punteada" : "") });
      if (!punteada) linea.setAttribute("pathLength", 1);
      linea.style.setProperty("--i", k);
      mapa.appendChild(linea);
    });
    (d.anillos || []).forEach(function (an) {
      var e = estrellas[an.estrella];
      if (e) mapa.appendChild(nodoSvg("circle", { cx: e[0], cy: e[1], r: an.radio, pathLength: 1, "class": "traza traza--anillo" }));
    });
    var grupo = nodoSvg("g", { filter: "url(#brillo-lamina)" });
    estrellas.forEach(function (e, k) {
      var b = e[2] == null ? 0.7 : e[2];
      var punto = nodoSvg("circle", { cx: e[0], cy: e[1], r: (0.9 + b * 1.5).toFixed(2), "class": "astro" + (k === c.principal ? " astro--principal" : "") });
      punto.style.setProperty("--i", k);
      grupo.appendChild(punto);
    });
    mapa.appendChild(grupo);
    $("recuerdo-numero").textContent = "Constelación " + (ROMANOS[c.indice] || c.indice + 1);
    $("recuerdo-forma").textContent = d.forma || "";
  }

  // En la lámina vive la constelación en 3D, con su brillo, y se gira con el dedo.
  // Si el equipo no pudiera, queda su retrato fijo y, como último recurso, el dibujo.
  var vitrina = null, vitrinaActiva = false;

  function prepararVitrina() {
    if (vitrina) return vitrina;
    var lienzo = $("recuerdo-vitrina");
    vitrina = u.crearVitrina(lienzo);
    lienzo.addEventListener("pointerdown", function (e) {
      if (!vitrinaActiva) return;
      try { lienzo.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      vitrina.empezar(e.clientX, e.clientY);
      $("recuerdo-gira").classList.add("usada");
    });
    lienzo.addEventListener("pointermove", function (e) { if (vitrinaActiva) vitrina.mover(e.clientX, e.clientY); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (tipo) {
      lienzo.addEventListener(tipo, function () { if (vitrina) vitrina.soltar(); });
    });
    return vitrina;
  }

  function dimensionarVitrina() {
    var lamina = $("recuerdo-lamina");
    vitrina.dimensionar(lamina.clientWidth, lamina.clientHeight, Math.min(window.devicePixelRatio || 1, 2));
  }

  function ponerVitrina(c) {
    var lamina = $("recuerdo-lamina");
    lamina.classList.remove("con-vitrina");
    if (!lamina.clientWidth || !lamina.clientHeight) return false;
    try {
      prepararVitrina();
      dimensionarVitrina();
      vitrina.mostrar(c, reducido);
    } catch (e) {
      if (window.console) console.error(e);
      return false;
    }
    vitrinaActiva = true;
    var gira = $("recuerdo-gira");
    gira.textContent = C.esTactil() ? (T.girarFiguraTactil || "") : (T.girarFiguraRaton || "");
    gira.classList.remove("usada");
    lamina.classList.add("con-vitrina");
    return true;
  }

  function quitarVitrina() {
    if (!vitrinaActiva) return;
    vitrinaActiva = false;
    vitrina.soltar();
    // Se apaga cuando la tarjeta ya terminó de cerrarse.
    setTimeout(function () { if (!vitrinaActiva && vitrina) vitrina.ocultar(); }, 700);
  }

  function ponerRetrato(c) {
    var lamina = $("recuerdo-lamina");
    var viejo = lamina.querySelector(".recuerdo__retrato");
    if (viejo) lamina.removeChild(viejo);
    lamina.classList.remove("con-retrato");
    if (ponerVitrina(c)) return;
    var w = lamina.clientWidth, h = lamina.clientHeight;
    if (!w || !h) return;
    var retrato = null;
    try { retrato = u.retratar(c, w, h); } catch (e) { retrato = null; }
    if (!retrato) return;
    retrato.className = "recuerdo__retrato";
    lamina.insertBefore(retrato, lamina.querySelector(".recuerdo__rotulo"));
    lamina.classList.add("con-retrato");
  }

  // Galería y sorpresa de cada recuerdo: se crean una vez y conservan su estado
  // (la cita sigue abierta y la canción sigue sonando al volver a abrir la tarjeta).
  var componentes = {};

  function componentesDe(c) {
    if (componentes[c.id]) return componentes[c.id];
    var r = c.datos.recuerdo || {};
    var comp = componentes[c.id] = {};
    if (r.fotos && r.fotos.length) {
      comp.galeria = C.Galeria.crear(r.fotos, { textos: T, sonido: musica, titulo: r.titulo || c.datos.nombre });
    }
    if (r.sorpresa) {
      comp.sorpresa = C.Sorpresas.crear(r.sorpresa, {
        textos: T,
        sonido: musica,
        alAbrir: llevarALaVista,
        antesDeSonar: function () { if (musica.estaSonando()) musica.alternar(); },
        alCambiar: actualizarMusica,
        alLinea: letraViva
      });
    }
    return comp;
  }

  function llevarALaVista(el) {
    var caja = $("recuerdo-desplazable");
    if (!caja || !caja.contains(el)) return;
    var rc = caja.getBoundingClientRect(), re = el.getBoundingClientRect();
    var destino = caja.scrollTop + (re.top - rc.top) - Math.max(16, (rc.height - re.height) / 2);
    try { caja.scrollTo({ top: Math.max(0, destino), behavior: reducido ? "auto" : "smooth" }); }
    catch (e) { caja.scrollTop = Math.max(0, destino); }
  }

  // El mensaje aparece palabra por palabra.
  function ponerPalabras(el, texto) {
    el.textContent = "";
    String(texto || "").split(/\s+/).filter(Boolean).forEach(function (p, i, todas) {
      var s = textoNodo("span", "pm", p);
      s.style.setProperty("--i", i);
      el.appendChild(s);
      if (i < todas.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }

  // La constelación en el reverso de la tarjeta.
  function dibujarDorso(c) {
    var d = c.datos, svg = $("recuerdo-dorso-figura");
    var estrellas = d.estrellas || [];
    svg.textContent = "";
    if (!estrellas.length) return;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    estrellas.forEach(function (e) {
      minX = Math.min(minX, e[0]); maxX = Math.max(maxX, e[0]);
      minY = Math.min(minY, e[1]); maxY = Math.max(maxY, e[1]);
    });
    var lado = Math.max(maxX - minX, maxY - minY) + 12;
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    svg.setAttribute("viewBox", [cx - lado / 2, cy - lado / 2, lado, lado].map(function (v) { return v.toFixed(1); }).join(" "));
    (d.trazos || []).forEach(function (t) {
      var a = estrellas[t[0]], b = estrellas[t[1]];
      if (a && b) svg.appendChild(nodoSvg("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
    });
    estrellas.forEach(function (e) {
      svg.appendChild(nodoSvg("circle", { cx: e[0], cy: e[1], r: (1 + (e[2] == null ? 0.7 : e[2]) * 1.6).toFixed(2) }));
    });
  }

  // Aviso flotante si la sorpresa quedó más abajo y todavía no se ve.
  var observadorSorpresa = null, temporizadorAviso = 0;
  function prepararAviso(sorpresa) {
    var chip = $("recuerdo-aviso"), caja = $("recuerdo-desplazable");
    clearTimeout(temporizadorAviso);
    if (observadorSorpresa) { observadorSorpresa.disconnect(); observadorSorpresa = null; }
    chip.classList.remove("visible");
    chip.hidden = true;
    if (!sorpresa || !window.IntersectionObserver) return;
    var el = sorpresa.elemento, vista = false;
    observadorSorpresa = new IntersectionObserver(function (entradas) {
      if (!entradas[0].isIntersecting) return;
      vista = true;
      chip.classList.remove("visible");
      setTimeout(function () { if (!chip.classList.contains("visible")) chip.hidden = true; }, 500);
    }, { root: caja, threshold: 0.2 });
    observadorSorpresa.observe(el);
    temporizadorAviso = setTimeout(function () {
      if (estado.fase !== "recuerdo" || vista) return;
      $("recuerdo-aviso-texto").textContent = T.haySorpresa || "Hay una sorpresa más abajo";
      chip.hidden = false;
      requestAnimationFrame(function () { chip.classList.add("visible"); });
    }, reducido ? 400 : 2600);
  }
  $("recuerdo-aviso").addEventListener("click", function () {
    var s = $("recuerdo-sorpresa");
    llevarALaVista(s.firstElementChild || s);
  });

  // La tarjeta se inclina hacia el cursor y su brillo lo sigue; con el dedo, solo el brillo.
  var inclinable = !reducido && !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var inclinacionLista = false, temporizadorBrillo = 0;
  function tarjetaRecuerdo() { return $("recuerdo").querySelector(".recuerdo"); }
  function enderezar() {
    var t = tarjetaRecuerdo();
    t.style.setProperty("--rx", "0deg");
    t.style.setProperty("--ry", "0deg");
    t.classList.remove("con-brillo");
  }
  $("recuerdo").addEventListener("pointermove", function (e) {
    if (estado.fase !== "recuerdo") return;
    var t = tarjetaRecuerdo(), r = t.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    var dentro = px >= 0 && px <= 1 && py >= 0 && py <= 1;
    t.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
    t.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    if (e.pointerType !== "mouse") return;
    t.classList.toggle("con-brillo", dentro);
    if (!inclinable || !inclinacionLista) return;
    t.classList.add("inclinando");
    t.style.setProperty("--rx", dentro ? ((0.5 - py) * 5).toFixed(2) + "deg" : "0deg");
    t.style.setProperty("--ry", dentro ? ((px - 0.5) * 6).toFixed(2) + "deg" : "0deg");
  });
  $("recuerdo").addEventListener("pointerleave", function () { if (inclinable) enderezar(); });
  $("recuerdo").addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || estado.fase !== "recuerdo") return;
    var t = tarjetaRecuerdo(), r = t.getBoundingClientRect();
    t.style.setProperty("--gx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    t.style.setProperty("--gy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    t.classList.add("con-brillo");
    clearTimeout(temporizadorBrillo);
    temporizadorBrillo = setTimeout(function () { t.classList.remove("con-brillo"); }, 900);
  });

  // La línea que suena de la canción, mientras se explora el cielo.
  function letraViva(texto) {
    var el = $("letra-viva");
    var actual = $("letra-viva-texto").textContent;
    if (texto === actual && el.classList.contains("con-texto") === !!texto) return;
    el.classList.remove("cambio");
    void el.offsetWidth;
    $("letra-viva-texto").textContent = texto || "";
    el.classList.toggle("con-texto", !!texto);
    if (texto) el.classList.add("cambio");
  }

  function abrirRecuerdo(c) {
    atenuarCancion(false);
    var r = c.datos.recuerdo || {};
    var tarjeta = tarjetaRecuerdo();
    var comp = componentesDe(c);
    var conGaleria = !!comp.galeria;
    var conFoto = !conGaleria && !!r.foto;
    var conLamina = !conGaleria && !conFoto;
    tarjeta.classList.toggle("recuerdo--galeria", conGaleria);
    tarjeta.classList.toggle("recuerdo--foto", conFoto);
    tarjeta.classList.toggle("recuerdo--lamina", conLamina);
    tarjeta.classList.toggle("recuerdo--con-lista", !!(r.lista && r.lista.length));
    tarjeta.classList.toggle("recuerdo--con-sorpresa", !!comp.sorpresa);
    tarjeta.classList.remove("inclinando", "con-brillo");
    tarjeta.style.setProperty("--acento", c.datos.color || "#f3dca8");
    tarjeta.style.setProperty("--rx", "0deg");
    tarjeta.style.setProperty("--ry", "0deg");
    inclinacionLista = false;

    var numeral = ROMANOS[c.indice] || String(c.indice + 1);
    $("recuerdo-sello").textContent = numeral;
    $("recuerdo-marca-agua").textContent = numeral;
    $("recuerdo-dorso-numero").textContent = "Constelación " + numeral;
    $("recuerdo-dorso-forma").textContent = c.datos.forma || "";
    dibujarDorso(c);

    var cajaGaleria = $("recuerdo-galeria");
    cajaGaleria.textContent = "";
    if (conGaleria) cajaGaleria.appendChild(comp.galeria.elemento);
    cajaGaleria.hidden = !conGaleria;
    $("recuerdo-lamina").hidden = !conLamina;
    if (conLamina) dibujarLamina(c);
    var fecha = r.fecha || (conFoto ? c.datos.forma || "" : "");
    $("recuerdo-fecha").textContent = fecha;
    $("recuerdo-fecha").hidden = !fecha;
    $("recuerdo-titulo").textContent = r.titulo || c.datos.nombre || "";
    ponerPalabras($("recuerdo-mensaje"), r.mensaje || "");
    var fig = $("recuerdo-figura"), img = $("recuerdo-imagen");
    if (conFoto) {
      img.src = r.foto;
      img.alt = r.textoAlternativo || "";
      fig.hidden = false;
    } else {
      fig.hidden = true;
      img.removeAttribute("src");
    }
    var ul = $("recuerdo-lista");
    ul.textContent = "";
    if (r.lista && r.lista.length) {
      r.lista.forEach(function (item, i) {
        var li = textoNodo("li", "", item);
        li.style.setProperty("--i", i);
        ul.appendChild(li);
      });
      ul.hidden = false;
    } else {
      ul.hidden = true;
    }
    var cajaSorpresa = $("recuerdo-sorpresa");
    cajaSorpresa.textContent = "";
    if (comp.sorpresa) cajaSorpresa.appendChild(comp.sorpresa.elemento);
    cajaSorpresa.hidden = !comp.sorpresa;

    ui.indicacion("");
    estado.fase = "recuerdo";
    cuerpo.classList.add("en-recuerdo");
    var velo = $("recuerdo");
    velo.hidden = false;
    $("recuerdo-desplazable").scrollTop = 0;
    if (conLamina) ponerRetrato(c);
    requestAnimationFrame(function () {
      velo.classList.add("visible");
      tarjeta.focus({ preventScroll: true });
    });
    if (comp.galeria) comp.galeria.mostrar(reducido ? 100 : 1350);
    if (comp.sorpresa && comp.sorpresa.alMostrar) comp.sorpresa.alMostrar();
    prepararAviso(comp.sorpresa);
    // Al voltearse, la tarjeta suelta un destello de estrellas.
    if (!reducido) {
      setTimeout(function () {
        if (estado.fase !== "recuerdo") return;
        var rc = tarjeta.getBoundingClientRect();
        C.chispas(rc.left + rc.width / 2, rc.top + Math.min(rc.height / 2, 230), { cantidad: 20, alcance: Math.min(170, rc.width * 0.42), color: c.datos.color, onda: Math.min(380, rc.width * 0.9) });
        musica.campanilla(5);
      }, 600);
    }
    setTimeout(function () { if (estado.fase === "recuerdo") inclinacionLista = true; }, reducido ? 0 : 1400);
    // Con la tarjeta abierta, el cielo deja de dibujarse para ahorrar batería.
    clearTimeout(temporizadorPausa);
    temporizadorPausa = setTimeout(function () { if (estado.fase === "recuerdo") estado.pausado = true; }, 1100);
  }

  function cerrarRecuerdo() {
    if (estado.fase !== "recuerdo") return;
    quitarVitrina();
    clearTimeout(temporizadorPausa);
    clearTimeout(temporizadorAviso);
    if (observadorSorpresa) { observadorSorpresa.disconnect(); observadorSorpresa = null; }
    estado.pausado = false;
    var c = estado.activa;
    var comp = c ? componentes[c.id] : null;
    if (comp && comp.galeria) comp.galeria.ocultar();
    inclinacionLista = false;
    enderezar();
    var velo = $("recuerdo");
    velo.classList.remove("visible");
    $("recuerdo-aviso").classList.remove("visible");
    cuerpo.classList.remove("en-recuerdo");
    setTimeout(function () { if (!velo.classList.contains("visible")) velo.hidden = true; }, 700);
    terminarRitual();
    ocultarMomento();
    estado.fase = "momento";
    regresarAlCielo(c);
  }

  /* ---------- Mapa estelar ---------- */

  // Una constelación con "mapaEstelar" abre el cielo real de esa noche en lugar de la tarjeta.
  var mapa = null;
  function mapaDe(c) {
    return c && c.datos.mapaEstelar && C.MapaEstelar && C.MapaEstelar.disponible() ? c.datos.mapaEstelar : null;
  }
  function abrirDestino(c) {
    if (mapaDe(c)) abrirMapa(c);
    else abrirRecuerdo(c);
  }
  function abrirMapa(c) {
    if (!mapa) {
      try {
        mapa = C.MapaEstelar.crear({
          raiz: $("mapa"), config: c.datos.mapaEstelar, textos: T, movil: movil, reducido: reducido, sonido: musica,
          color: c.datos.color, destinatario: cfg.destinatario, remitente: cfg.remitente,
          mensaje: (c.datos.recuerdo || {}).mensaje, alCerrar: cerrarMapa
        });
      } catch (err) {
        if (window.console) console.error(err);
        mapa = null;
        abrirRecuerdo(c);
        return;
      }
      window.__cielo.mapa = mapa;
    }
    atenuarCancion(false);
    ui.indicacion("");
    estado.fase = "mapa";
    cuerpo.classList.add("en-mapa");
    mapa.abrir();
    musica.campanilla(5);
    // Con el mapa abierto, el universo deja de dibujarse; el mapa tiene su propio lienzo.
    clearTimeout(temporizadorPausa);
    temporizadorPausa = setTimeout(function () { if (estado.fase === "mapa") estado.pausado = true; }, 1000);
  }
  function cerrarMapa() {
    if (estado.fase !== "mapa") return;
    clearTimeout(temporizadorPausa);
    estado.pausado = false;
    mapa.cerrar();
    cuerpo.classList.remove("en-mapa");
    terminarRitual();
    ocultarMomento();
    estado.fase = "momento";
    regresarAlCielo(estado.activa);
  }

  /* ---------- Final ---------- */

  var nombreEstelar = null;

  function sorpresaFinal() {
    estado.fase = "final";
    estado.finalVisto = true;
    cuerpo.classList.add("en-final");
    ocultarAyuda();
    lista.forEach(function (c) { c.faroObjetivo = 0.5; c.guiasObjetivo = 0; });
    var fin = $("final");
    fin.hidden = false;
    $("boton-carta").classList.remove("visible");
    fin.classList.remove("mensaje");
    requestAnimationFrame(function () { fin.classList.add("visible", "previo"); });
    ui.anunciar(T.antesDelFinal || "");
    camara.volarA(vistaFinal(), { duracion: reducido ? 1 : 2800 }).then(function () {
      if (estado.fase !== "final") return;
      fin.classList.remove("previo");
      u.camino.intensidadObjetivo = 1;
      u.camino.cabezaVisible = 1;
      estado.recorrido = { t0: performance.now(), dur: reducido ? 1200 : 6200, pasados: 0 };
    });
  }

  function actualizarRecorrido(ahora) {
    var r = estado.recorrido;
    if (!r) return;
    var p = Math.min(1, (ahora - r.t0) / r.dur);
    var e = C.suave(p);
    u.camino.fijarProgreso(e);
    var fr = u.corazon.fracciones;
    while (r.pasados < fr.length && e >= fr[r.pasados]) {
      var c = lista[r.pasados];
      u.destellos.emitir(c.mundo(c.principal), c.S * 0.9, c.acento, 1.2);
      u.ondas.emitir(c.centroMundo(), c.S * 0.7, c.acento, 1.4);
      musica.campanilla(r.pasados * 2);
      C.vibrar(14);
      r.pasados++;
    }
    if (p >= 1) {
      estado.recorrido = null;
      u.camino.cabezaVisible = 0;
      u.destellos.emitir(u.camino.puntos[0], u.S * 1.6, new THREE.Color("#ffe7b8"), 1.6);
      u.fuerzaObjetivo = 1.15;
      setTimeout(function () { u.fuerzaObjetivo = 0.8; }, 1600);
      musica.arpegio();
      C.vibrar([30, 60, 30, 60, 80]);
      if (!reducido) {
        for (var k = 0; k < 5; k++) setTimeout(function () { u.meteoros.lanzar(u.camara, { lejos: true }); }, 300 + k * 420);
      }
      setTimeout(formarNombre, reducido ? 200 : 900);
      setTimeout(mostrarMensajeFinal, reducido ? 600 : 3400);
    }
  }

  function formarNombre() {
    if (estado.fase !== "final" && estado.fase !== "carta" && estado.fase !== "contemplar") return;
    if (nombreEstelar) { nombreEstelar.objetivo = 1; return; }
    var cant = movil ? 5200 : 9000;
    var anchoNombre = Math.min(17, u.S * 2.6);
    var destinos = C.Figuras.texto(cfg.destinatario || "", '"Pinyon Script", "Snell Roundhand", cursive', anchoNombre, cant, rnd);
    var polvo = u.crearPolvo(cant, {
      rnd: rnd, radioLibre: u.R * 0.35, aplanado: 0.6, tam: 0.085, tamLibre: 0.06,
      colorLibre: new THREE.Color("#ffe3b8"), nitidez: 0.35, temblor: 0.01
    });
    var colores = new Float32Array(cant * 3), a = new THREE.Color("#fff3dc"), b = new THREE.Color("#f3cf8a");
    for (var i = 0; i < cant; i++) {
      var k = rnd(), br = 0.7 + rnd() * 0.5;
      colores[i * 3] = (a.r + (b.r - a.r) * k) * br;
      colores[i * 3 + 1] = (a.g + (b.g - a.g) * k) * br;
      colores[i * 3 + 2] = (a.b + (b.b - a.b) * k) * br;
    }
    polvo.fijarFigura(destinos, colores, rnd);
    var bc = new THREE.Box3();
    u.camino.puntos.forEach(function (p) { bc.expandByPoint(p); });
    polvo.puntos.position.set(0, bc.min.y + (bc.max.y - bc.min.y) * 0.5, 6.5);
    u.escena.add(polvo.puntos);
    u.brilloGalaxiaObjetivo = 0.55;
    nombreEstelar = { polvo: polvo, progreso: 0, objetivo: 1 };
  }

  function actualizarNombre(dt) {
    var n = nombreEstelar;
    if (!n) return;
    n.progreso = C.amortiguar(n.progreso, n.objetivo, n.objetivo > n.progreso ? 0.9 : 2.5, dt);
    var un = n.polvo.uniformes;
    un.uProgreso.value = n.progreso;
    un.uOpacidad.value = Math.min(1, n.progreso * 3) * (n.objetivo > 0 ? 1 : n.progreso);
    un.uRemolino.value = reducido ? 0.2 : 1;
    var cam = u.camara.position, p = n.polvo.puntos.position;
    n.polvo.puntos.rotation.set(0, Math.atan2(cam.x - p.x, cam.z - p.z), 0);
    if (n.objetivo === 0 && n.progreso < 0.01) {
      n.polvo.destruir();
      nombreEstelar = null;
    }
  }

  function mostrarMensajeFinal() {
    if (estado.fase !== "final") return;
    var fin = $("final");
    fin.classList.add("mensaje");
    ui.anunciar(T.final || "");
    setTimeout(function () {
      if (estado.fase !== "final") return;
      var b = $("boton-carta");
      b.classList.add("visible");
      if (estado.teclado) b.focus({ preventScroll: true });
    }, reducido ? 200 : 2000);
  }

  function abrirCarta() {
    if (estado.fase !== "final" && estado.fase !== "contemplar") return;
    estado.faseAntesCarta = estado.fase;
    estado.fase = "carta";
    var fin = $("final");
    fin.classList.remove("visible");
    $("boton-leer-carta").hidden = true;
    setTimeout(function () { if (!fin.classList.contains("visible")) fin.hidden = true; }, 900);
    var velo = $("carta");
    velo.hidden = false;
    var tarjeta = velo.querySelector(".carta");
    tarjeta.scrollTop = 0;
    requestAnimationFrame(function () {
      velo.classList.add("visible");
      tarjeta.focus({ preventScroll: true });
    });
    musica.acorde();
    clearTimeout(temporizadorPausa);
    temporizadorPausa = setTimeout(function () { if (estado.fase === "carta") estado.pausado = true; }, 1200);
  }

  function cerrarCarta() {
    clearTimeout(temporizadorPausa);
    estado.pausado = false;
    var velo = $("carta");
    velo.classList.remove("visible");
    setTimeout(function () { if (!velo.classList.contains("visible")) velo.hidden = true; }, 800);
  }

  function contemplar() {
    if (estado.fase !== "carta") return;
    cerrarCarta();
    estado.fase = "contemplar";
    cuerpo.classList.remove("en-final");
    cuerpo.classList.add("en-universo", "en-contemplar");
    var leer = $("boton-leer-carta");
    leer.hidden = false;
    lista.forEach(function (c) { c.faroObjetivo = 1; });
    if (nombreEstelar) nombreEstelar.objetivo = 1;
    camara.volarA(vistaFinal(true), { duracion: reducido ? 1 : 2200 });
    estado.ultimoGesto = performance.now();
    if (estado.teclado) leer.focus({ preventScroll: true });
  }

  function repetir() {
    cerrarCarta();
    estado.descubiertas = {};
    estado.finalVisto = false;
    estado.recorrido = null;
    estado.activa = null;
    terminarRitual();
    lista.forEach(function (c) {
      c.reiniciar();
      c.atenuacionObjetivo = 1;
      c.faroObjetivo = 1;
      c.guiasObjetivo = 0.14;
      c.tamObjetivo = 1;
    });
    u.camino.intensidadObjetivo = 0;
    u.camino.cabezaVisible = 0;
    setTimeout(function () { if (u.camino.intensidadObjetivo === 0) u.camino.fijarProgreso(0); }, 1500);
    if (nombreEstelar) nombreEstelar.objetivo = 0;
    u.brilloGalaxiaObjetivo = 1;
    $("final").hidden = true;
    $("final").className = "final";
    $("boton-leer-carta").hidden = true;
    cuerpo.classList.remove("en-final", "en-contemplar");
    cuerpo.classList.add("en-universo");
    actualizarProgreso();
    estado.fase = "universo";
    camara.volarA(vistaUniverso(0), { duracion: reducido ? 1 : 2600, arco: 0.15 }).then(function () {
      if (estado.fase === "universo") mostrarAyuda(false, 6000);
    });
    estado.ultimoGesto = performance.now();
    if (estado.teclado) etiquetas[0].focus({ preventScroll: true });
  }

  /* ---------- Gestos ---------- */

  C.Gestos($("cielo"), camara, {
    modo: function () {
      if (estado.fase === "momento") return estado.ritual ? "momento" : "nada";
      if (estado.fase === "bienvenida" || enExploracion() || estado.fase === "final") return camara.vuelo && estado.fase !== "bienvenida" && estado.fase !== "universo" && estado.fase !== "contemplar" ? "nada" : "orbita";
      return "nada";
    },
    toque: function (x, y) {
      if (!enExploracion()) return;
      var c = constelacionEn(x, y);
      if (c) abrirConstelacion(c);
    },
    dobleToque: function (x, y) {
      if (!enExploracion()) return;
      if (!constelacionEn(x, y)) camara.acercar(1.6);
    },
    momento: function (tipo, x, y) {
      var r = estado.ritual;
      if (!r) return;
      if (tipo === "abajo") r.abajo(x, y);
      else if (tipo === "mover") r.mover(x, y);
      else r.arriba(x, y);
    },
    interaccion: function () {
      interaccion();
      if (estado.teclado) {
        estado.teclado = false;
        cuerpo.classList.remove("con-teclado");
        if (estado.ritual && estado.ritual.reindicar) estado.ritual.reindicar();
      }
      if (estado.fase === "universo") $("ayuda").classList.add("arrastrado");
    }
  });

  /* ---------- Teclado ---------- */

  var TECLAS_NAVEGACION = { Tab: 1, ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, Enter: 1, " ": 1 };

  function atraparFoco(e, contenedor) {
    var focos = Array.prototype.filter.call(contenedor.querySelectorAll("button, [href], input, [tabindex]:not([tabindex='-1'])"), function (el) {
      return !el.hidden && el.offsetParent !== null && !el.closest("[inert]") && getComputedStyle(el).visibility !== "hidden";
    });
    if (!focos.length) return;
    var primero = focos[0], ultimo = focos[focos.length - 1];
    if (e.shiftKey && (document.activeElement === primero || !contenedor.contains(document.activeElement))) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && (document.activeElement === ultimo || !contenedor.contains(document.activeElement))) { e.preventDefault(); primero.focus(); }
  }

  document.addEventListener("keydown", function (e) {
    if (TECLAS_NAVEGACION[e.key] && !estado.teclado) {
      estado.teclado = true;
      cuerpo.classList.add("con-teclado");
      if (estado.ritual && estado.ritual.reindicar) estado.ritual.reindicar();
    }
    var f = estado.fase;
    var enBoton = e.target && e.target.closest && e.target.closest("button");
    if (f === "momento" && estado.ritual && !enBoton && !e.repeat) {
      if (estado.ritual.tecla(e, true)) { e.preventDefault(); return; }
    } else if (f === "momento" && estado.ritual && !enBoton && e.repeat && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      return;
    }
    if (e.key === "Escape") {
      if (f === "mapa") { if (!mapa || !mapa.atras()) cerrarMapa(); }
      else if (f === "recuerdo") cerrarRecuerdo();
      else if (f === "carta") contemplar();
      else if (f === "momento") volverDesdeMomento();
      return;
    }
    if (e.key === "Tab") {
      if (f === "recuerdo") atraparFoco(e, $("recuerdo"));
      else if (f === "mapa") atraparFoco(e, $("mapa"));
      else if (f === "carta") atraparFoco(e, $("carta"));
      return;
    }
    if (enExploracion() && !enBoton) {
      var paso = 0.16;
      if (e.key === "ArrowLeft") { camara.volarA({ az: camara.az - paso }, { duracion: 260, curva: C.salida }); e.preventDefault(); }
      else if (e.key === "ArrowRight") { camara.volarA({ az: camara.az + paso }, { duracion: 260, curva: C.salida }); e.preventDefault(); }
      else if (e.key === "ArrowUp") { camara.volarA({ el: C.limitar(camara.el + 0.1, camara.limites.elMin, camara.limites.elMax) }, { duracion: 260, curva: C.salida }); e.preventDefault(); }
      else if (e.key === "ArrowDown") { camara.volarA({ el: C.limitar(camara.el - 0.1, camara.limites.elMin, camara.limites.elMax) }, { duracion: 260, curva: C.salida }); e.preventDefault(); }
      else if (e.key === "+" || e.key === "=") camara.acercar(1.25);
      else if (e.key === "-" || e.key === "_") camara.acercar(0.8);
      else if (e.key === "0") vistaGeneral();
      interaccion();
    }
  });

  document.addEventListener("keyup", function (e) {
    if (estado.fase === "momento" && estado.ritual) estado.ritual.tecla(e, false);
  });

  /* ---------- Botones ---------- */

  $("boton-entrar").addEventListener("click", entrar);
  $("boton-musica").addEventListener("click", function () {
    var cancion = cancionLista();
    if (cancion) { cancion.alternar(); return; }
    musica.alternar().then(actualizarMusica);
    actualizarMusica();
  });
  $("boton-vista").addEventListener("click", vistaGeneral);
  $("boton-acercar").addEventListener("click", function () { camara.acercar(1.3); interaccion(); });
  $("boton-alejar").addEventListener("click", function () { camara.acercar(1 / 1.3); interaccion(); });
  $("boton-volver").addEventListener("click", volverDesdeMomento);
  $("boton-cerrar-recuerdo").addEventListener("click", cerrarRecuerdo);
  $("boton-carta").addEventListener("click", abrirCarta);
  $("boton-leer-carta").addEventListener("click", abrirCarta);
  $("boton-repetir").addEventListener("click", repetir);
  $("boton-contemplar").addEventListener("click", contemplar);
  $("recuerdo").addEventListener("click", function (e) { if (e.target === this) cerrarRecuerdo(); });

  /* ---------- Tamaño, calidad y bucle ---------- */

  var dprMax = Math.min(window.devicePixelRatio || 1, movil ? 1.75 : 2);
  var dpr = dprMax;
  var promedio = 16, lentos = 0;

  function dimensionar() {
    var w = window.innerWidth, h = window.innerHeight;
    u.dimensionar(w, h, dpr);
    anchosEtiquetas = [];
    if (vitrinaActiva) dimensionarVitrina();
    if (mapa && mapa.estaActivo()) mapa.dimensionar();
    if (estado.fase === "bienvenida") camara.fijar(vistaBienvenida());
    else if (estado.fase === "universo" && !camara.vuelo) camara.volarA(vistaUniverso(camara.az), { duracion: reducido ? 1 : 700 });
    else if (estado.fase === "contemplar" && !camara.vuelo) camara.volarA(vistaFinal(true), { duracion: reducido ? 1 : 700 });
    else if ((estado.fase === "momento" || estado.fase === "recuerdo") && estado.activa && !camara.vuelo) {
      var v = vistaDetalle(estado.activa);
      camara.fijar({ dist: v.dist });
    } else if ((estado.fase === "final" || estado.fase === "carta") && !camara.vuelo) camara.fijar(vistaFinal());
    if (estado.pausado) { camara.actualizar(0, performance.now()); u.actualizar(0, reloj, reducido); u.dibujar(); }
  }

  var pendiente = false;
  window.addEventListener("resize", function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(function () { pendiente = false; dimensionar(); });
  });

  // Si el equipo va lento, baja la resolución y, como último recurso, apaga el resplandor.
  function medir(dtMs) {
    promedio = promedio * 0.94 + dtMs * 0.06;
    if (promedio > 27) lentos++;
    else lentos = Math.max(0, lentos - 1);
    if (lentos > 90) {
      lentos = 0;
      promedio = 16;
      if (dpr > 1.01) {
        dpr = Math.max(1, dpr - 0.35);
        u.dimensionar(window.innerWidth, window.innerHeight, dpr);
      } else if (u.conResplandor) {
        u.fijarResplandor(false);
      }
    }
  }

  // Si la página se oculta, la música se pausa; al volver, sigue donde se quedó.
  var sonabaAlOcultar = { musica: false, cancion: false };
  document.addEventListener("visibilitychange", function () {
    var cancion = cancionLista();
    if (document.hidden) {
      sonabaAlOcultar.musica = musica.estaSonando();
      sonabaAlOcultar.cancion = !!(cancion && cancion.sonando());
      if (sonabaAlOcultar.musica) { musica.alternar(); actualizarMusica(); }
      if (sonabaAlOcultar.cancion) cancion.pausar();
      return;
    }
    if (sonabaAlOcultar.cancion && cancion && !cancion.sonando()) cancion.alternar();
    if (sonabaAlOcultar.musica && !musica.estaSonando()) musica.alternar().then(actualizarMusica);
    sonabaAlOcultar.musica = sonabaAlOcultar.cancion = false;
  });

  var ultimo = performance.now(), reloj = 0, proximoMeteoro = 4;

  function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    var dtMs = ahora - ultimo;
    ultimo = ahora;
    // La constelación de la tarjeta sigue viva aunque el universo esté en pausa.
    if (vitrina && (vitrinaActiva || estado.fase === "recuerdo") && !document.hidden) vitrina.cuadro(Math.min(0.05, Math.max(0, dtMs / 1000)));
    // El mapa estelar también sigue vivo con el universo en pausa.
    if (mapa && mapa.estaActivo() && !document.hidden) mapa.cuadro(Math.min(0.05, Math.max(0, dtMs / 1000)));
    if (estado.pausado || document.hidden) return;
    var dt = Math.min(0.05, Math.max(0, dtMs / 1000));
    reloj += dt;
    if (estado.fase !== "carta" && estado.fase !== "recuerdo" && estado.fase !== "mapa") medir(dtMs);

    // Giro automático suave cuando nadie toca el cielo.
    if (!reducido) {
      if (estado.fase === "bienvenida") camara.giroAutoObjetivo = 0.045;
      else if (enExploracion() && !camara.vuelo && performance.now() - estado.ultimoGesto > 8000) camara.giroAutoObjetivo = 0.03;
    }
    camara.actualizar(dt, ahora);
    if (estado.ritual) estado.ritual.actualizar(dt, reloj);
    actualizarRecorrido(ahora);
    actualizarNombre(dt);
    if (!reducido && reloj > proximoMeteoro && estado.fase !== "momento") {
      u.meteoros.lanzar(u.camara);
      proximoMeteoro = reloj + 6 + Math.random() * 9;
    }
    u.actualizar(dt, reloj, reducido);
    actualizarCapas();
    u.dibujar();
  }

  /* ---------- Inicio ---------- */

  prepararTextos();
  actualizarProgreso();
  dimensionar();
  // La canción que suena desde el inicio: empieza con el primer toque de la persona.
  lista.forEach(function (c) {
    var s = (c.datos.recuerdo || {}).sorpresa;
    if (C.Cancion.actual || !s || s.tipo !== "cancion" || !s.archivo || !s.desdeElInicio) return;
    var comp = componentesDe(c);
    if (comp.sorpresa && comp.sorpresa.sonarDesdeElInicio) comp.sorpresa.sonarDesdeElInicio({ excepto: "#boton-musica" });
  });
  camara.fijar(vistaBienvenida());
  camara.vaivenObjetivo = reducido ? 0 : 1;
  if (document.fonts && document.fonts.load) {
    document.fonts.load('200px "Pinyon Script"');
    if (document.fonts.ready) document.fonts.ready.then(function () { anchosEtiquetas = []; });
  }
  requestAnimationFrame(function () {
    cuerpo.classList.add("listo");
    requestAnimationFrame(cuadro);
  });

  window.__cielo.abrir = abrirConstelacion;
  window.__cielo.proy = proy;
})(window.Cielo);
