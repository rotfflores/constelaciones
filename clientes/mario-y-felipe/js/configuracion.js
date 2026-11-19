/* ==========================================================================
   EL CIELO DE NOSOTROS · Rotf Studio
   Archivo de personalización
   --------------------------------------------------------------------------
   Todo lo que cambia de un regalo a otro vive aquí: nombres, textos,
   fotografías, fechas, carta, música, la forma de cada constelación y el
   momento interactivo que la abre. No hace falta tocar ningún otro archivo.

   Cómo se arma el universo
   - Las cinco constelaciones flotan alrededor de una galaxia, en 3D.
     Se colocan solas a lo largo de un corazón que solo se revela al final,
     en el orden de esta lista.
   - estrellas: puntos [x, y, brillo] dentro de una caja de 100 × 100
     (x de izquierda a derecha, y de arriba hacia abajo). El brillo va de 0.4
     (tenue) a 1. La más brillante es por donde pasa el camino final.
   - trazos: pares de estrellas que se unen con una línea de luz. Añade
     "punteado" como tercer valor para una línea discontinua.
   - anillos: círculos alrededor de una estrella (la lente, el centro del sol).
   - color: el tono del halo que la rodea en el cielo.

   Momentos interactivos (experiencia.tipo)
   - "encuentro": dos estrellas con sus nombres; se arrastra una hacia la otra.
   - "revelado":  se mantiene presionado y el polvo de estrellas forma la foto.
   - "luces":     luces que flotan; cada una que se atrapa muestra una frase de la lista.
   - "deseos":    se desliza hacia arriba para lanzar cada deseo de la lista al cielo.
   - "latido":    se mantiene presionado y un corazón de estrellas late hasta formarse.
   Cualquier tipo se puede usar en cualquier constelación.

   Galería y sorpresas de cada recuerdo
   - recuerdo.fotos: varias fotos instantáneas que se deslizan con el dedo.
     La primera es la que forma el polvo de estrellas en el momento “revelado”.
   - recuerdo.sorpresa: algo que se desbloquea al abrir la tarjeta.
     tipo "cita": un candado que se abre con la llave y un vale que se reclama por WhatsApp.
     tipo "cancion": un disco de sol que libera una canción con su letra.

   Mapa estelar (mapaEstelar)
   - En lugar de la tarjeta, la constelación abre el cielo real de una noche y un
     lugar, como un cartel: la carta circular en 3D, los nombres, la fecha, lo que
     brillaba y las coordenadas. "Mirar desde…" entra a la cúpula para ver ese
     cielo alrededor, y la barra de horas recorre la noche entera.
   - lugar, latitud y longitud (en grados; sur y oeste en negativo), altitud en metros.
   - fecha "AAAA-MM-DD", hora "HH:MM" (24 horas) y zonaHoraria: horas respecto a UTC
     (México centro: -6, sin horario de verano desde 2022).
   - titulo, mensaje (si falta, se usa el de recuerdo) y nombres (si faltan, los de arriba).
   - destacados: hasta cuatro. tipo "estrella", "pareja", "via-lactea" o "planeta";
     objetivo: el nombre de una estrella (Antares, Vega, Régulo…), de un planeta
     (Marte, Venus…), "Luna" o "centro-galactico"; para "pareja", una lista de dos.
     Las posiciones del Sol, la Luna y los planetas se calculan para esa fecha.
   ========================================================================== */

window.CIELO_CONFIG = {
  /* Quién recibe y quién envía */
  destinatario: "Mario",
  remitente: "Felipe",

  /* Textos generales */
  textos: {
    tituloPagina: "Nuestras estrellas",
    bienvenida: "Desde el 19 de agosto, mi cielo tiene tu nombre. Lo dibujé para ti",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Mario”
    botonEntrar: "Descubre nuestro cielo",
    indicacion: "Toca una constelación para descubrir su historia",
    gestosTactil: "Desliza para girar nuestro universo · pellizca para acercar",
    gestosRaton: "Arrastra para girar nuestro universo · usa la rueda para acercar",
    gestosTeclado: "Tab para elegir una constelación · flechas para girar",
    volverCielo: "Volver al cielo",
    cerrarRecuerdo: "Seguir explorando",
    progreso: "{n} de {total} constelaciones descubiertas",
    antesDelFinal: "Mira lo que dibujan juntas",
    final: "Cada estrella de este cielo lleva tu nombre. Lo demás te lo digo en mi carta",
    abrirCarta: "Abrir mi carta",
    leerCarta: "Leer la carta",
    repetir: "Volver a recorrer nuestro cielo",
    contemplar: "Contemplar el cielo",
    vistaGeneral: "Ver todo el universo",
    acercar: "Acercar",
    alejar: "Alejar",
    abrir: "Abrir {nombre}",
    girarFiguraTactil: "Desliza para girarla",
    girarFiguraRaton: "Arrastra para girarla",
    galeriaPistaTactil: "Desliza las fotos",
    galeriaPistaRaton: "Arrastra las fotos o usa las flechas",
    fotoAnterior: "Foto anterior",
    fotoSiguiente: "Foto siguiente",
    fotoDe: "Foto {n} de {total}",
    haySorpresa: "Hay una sorpresa más abajo",
    descubierta: "descubierta",
    firmaMarca: "Un regalo creado con Rotf Studio",
    sin3d: "Tu navegador no puede mostrar el cielo en 3D, pero aquí están nuestros recuerdos."
  },

  /* Sonido
     - efectos: campanillas, latidos, obturador y deseos. Vienen activados y empiezan a
       sonar al tocar “Descubre nuestro cielo”. false los apaga.
     - campanillas: notas suaves al encender las estrellas (parte de los efectos).
     - Música ambiental opcional: nunca suena sola, solo empieza con el botón de música.
       archivo: ruta a un .mp3 propio (por ejemplo "assets/audio/nuestra-cancion.mp3").
       Si se deja en null, se genera una atmósfera suave directamente en el navegador.
     - Si la canción de una sorpresa tiene desdeElInicio: true (como “A Sky Full of Stars”),
       esa canción es la música de toda la experiencia y el botón de música la pausa o la reanuda. */
  musica: {
    habilitada: true,
    efectos: true,
    archivo: null,
    volumen: 0.5,
    campanillas: true,
    etiquetaActivar: "Activar música",
    etiquetaPausar: "Pausar música"
  },

  /* Cielo: cambia la semilla para obtener otra galaxia y otras estrellas.
     densidad: 1 es lo normal; 0.7 aligera el cielo en equipos modestos. */
  cielo: {
    semilla: 7,
    densidad: 1
  },

  /* Las cinco constelaciones, en el orden en que las une el camino final */
  constelaciones: [
    {
      id: "comienzo",
      nombre: "Donde comenzó todo",
      forma: "La llave",
      color: "#ffb48c",
      escala: 1,
      estrellas: [[22, 30, 0.8], [8, 46, 0.65], [23, 61, 0.7], [37, 45, 1], [75, 46, 0.6], [93, 44, 0.75], [92, 59, 0.55], [76, 57, 0.5]],
      trazos: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6], [4, 7]],
      anillos: [],
      experiencia: {
        tipo: "encuentro",
        indicacion: "Dos caminos en el mismo cielo. Arrastra una estrella hacia la otra",
        indicacionTeclado: "Pulsa Enter o Espacio para acercar nuestras estrellas",
        union: "Y entonces, nos encontramos"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: "19 de agosto de 2026",
        titulo: "El día que empezó lo nuestro",
        mensaje: "El 19 de agosto de 2026, en Veracruz, empezamos a ser novios. Desde ese día, cada camino nuevo tiene más sentido porque lo recorro contigo.",
        // La llave abre un vale por una cita; se reclama por WhatsApp con Felipe.
        // whatsapp: el número con lada del país y sin espacios (52 es México).
        sorpresa: {
          tipo: "cita",
          aviso: "La llave abrió algo para ti",
          pista: "Toca el candado para usar la llave",
          folio: "Nº 1908",
          antetitulo: "Vale por",
          titulo: "Una cita",
          detalle: "Tú eliges el día y el lugar. Yo me encargo de todo lo demás.",
          admite: "Admite: tú y yo",
          vigencia: "Válido para siempre",
          boton: "Reclamar por WhatsApp",
          whatsapp: "522283354974",
          mensajeWhatsapp: "Hola, Felipe ✨ Abrí la llave de nuestras estrellas y vengo a reclamar mi cita.",
          nota: "Si WhatsApp no se abre, escríbele al +52 228 335 4974"
        }
      }
    },
    {
      id: "momento",
      nombre: "Nuestro momento favorito",
      forma: "La cámara",
      color: "#ff93bd",
      escala: 1,
      estrellas: [[10, 41, 0.7], [29, 40, 0.6], [36, 27, 0.75], [57, 28, 0.7], [64, 40, 0.6], [90, 42, 0.85], [89, 80, 0.65], [11, 79, 0.7], [50, 60, 1]],
      trazos: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]],
      anillos: [{ estrella: 8, radio: 12 }],
      experiencia: {
        tipo: "revelado",
        indicacion: "Mantén presionado el cielo para revelar nuestro momento",
        indicacionTeclado: "Mantén presionada la barra espaciadora para revelar nuestro momento"
      },
      recuerdo: {
        // Galería: agrega o quita fotos libremente. pie es lo que va escrito a mano
        // debajo de cada foto; enfoque (opcional) elige qué parte de la foto se ve.
        fotos: [
          { foto: "assets/fotos/tu-y-yo.jpg", pie: "Tú y yo, entre flores", enfoque: "50% 35%",
            textoAlternativo: "Selfie de los dos sonriendo bajo un paraguas, frente a un campo de flores naranjas, rojas y rosas" },
          { foto: "assets/fotos/bajo-el-corazon.jpg", pie: "Bajo un corazón de luces", enfoque: "50% 72%",
            textoAlternativo: "Los dos sentados juntos de noche, bajo un gran corazón de ramas con foquitos y un letrero luminoso de AMOR" },
          { foto: "assets/fotos/noche-de-luces.jpg", pie: "Una noche bajo mil luces", enfoque: "46% 50%",
            textoAlternativo: "Los dos de pie, lado a lado, en un salón de fiesta con un techo lleno de luces" },
          { foto: "assets/fotos/de-camino.jpg", pie: "De camino, siempre juntos", enfoque: "55% 40%",
            textoAlternativo: "Selfie de los dos con lentes de sol dentro del coche, uno al volante" },
          { foto: "assets/fotos/nuestra-noche.jpg", pie: "Nuestras salidas", enfoque: "50% 45%",
            textoAlternativo: "Selfie de los dos sonriendo de noche, frente a una pared de piedra" },
          { foto: "assets/fotos/hasta-en-el-super.jpg", pie: "Hasta en el súper", enfoque: "50% 62%",
            textoAlternativo: "Selfie divertida de los dos en el pasillo de un supermercado, frente a los estantes" }
        ],
        fecha: "Desde el 19 de agosto",
        titulo: "Todos nuestros momentos",
        mensaje: "Entre flores, bajo un corazón de luces, de camino a cualquier parte o en el pasillo del súper: contigo hasta lo más sencillo se vuelve un recuerdo que quiero guardar."
      }
    },
    {
      id: "iluminas",
      nombre: "Lo que iluminas en mí",
      forma: "El sol",
      color: "#ffd27a",
      escala: 1,
      estrellas: [[50, 50, 1], [50, 9, 0.7], [86, 29, 0.6], [83, 71, 0.65], [51, 91, 0.6], [16, 70, 0.7], [14, 31, 0.55]],
      trazos: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
      anillos: [{ estrella: 0, radio: 13 }],
      experiencia: {
        tipo: "luces",
        indicacion: "Atrapa cada luz que flota a tu alrededor",
        indicacionTeclado: "Usa Tab para elegir cada luz y Enter para atraparla",
        cierre: "Y todo lo que todavía no sé nombrar"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: null,
        titulo: "Lo que iluminas en mí",
        mensaje: "Pequeñas cosas que despiertas sin darte cuenta:",
        lista: [
          "Las ganas de hacer planes, aunque sea ir juntos al súper.",
          "La risa que solo me sale contigo.",
          "La paz de recargarme en ti al final del día.",
          "La certeza de que, pase lo que pase, somos equipo."
        ],
        // La canción con su letra. Suena desde el inicio y, al tocar el sol, se descubre cuál es.
        sorpresa: {
          tipo: "cancion",
          // desdeElInicio: true hace que suene desde que toca la pantalla por primera vez
          // (los navegadores no dejan que suene nada antes) y se repite mientras recorre el cielo.
          desdeElInicio: true,
          aviso: "Esta canción es para ti",
          pista: "Toca el sol para descubrirla y ver su letra",
          tituloOculto: "¿Ya sabes cuál es?",
          archivo: "assets/audio/a-sky-full-of-stars.mp3",
          titulo: "A Sky Full of Stars",
          artista: "Coldplay",
          dedicatoria: "Porque desde que llegaste, mi cielo está lleno de estrellas",
          // Letra compartida por el usuario; traducción al español línea por línea.
          // Marcas de referencia de la edición de radio; pendiente cotejo auditivo
          // con este MP3. Fuente de tiempos: https://www.lyricdown.com/lrc/coldplay-a-sky-full-of-stars-radio-edit-1978450
          // Ambas versiones incluyen los mismos silencios instrumentales.
          idiomaOriginal: "en",
          desfaseLetra: 1.5, // retrasa 2 segundos ambas versiones respecto al ajuste anterior
          letraTraducida: `
[00:00.00]
[00:17.17]Porque eres un cielo, porque eres un cielo lleno de estrellas
[00:24.86]Voy a darte mi corazón
[00:30.17]
[00:32.43]Porque eres un cielo, porque eres un cielo lleno de estrellas
[00:40.35]Porque iluminas el camino
[00:47.85]No me importa, adelante, hazme pedazos
[00:55.52]No me importa si lo haces, uh-uh, uh
[01:03.18]Porque en un cielo, en un cielo lleno de estrellas
[01:08.48]Creo que te vi
[01:13.10]
[01:41.60]Porque eres un cielo, porque eres un cielo lleno de estrellas
[01:49.34]Quiero morir en tus brazos, oh, oh-oh
[01:57.01]Porque cuanto más oscurece, más brillas
[02:04.77]Voy a darte mi corazón, oh
[02:12.47]No me importa, adelante, hazme pedazos
[02:20.07]No me importa si lo haces, uh-uh, uh
[02:27.78]Porque en un cielo, en un cielo lleno de estrellas
[02:33.03]Creo que te veo
[02:40.71]Creo que te veo
[02:44.43]
[03:21.34]Porque eres un cielo, eres un cielo lleno de estrellas
[03:26.61]Una vista tan celestial
[03:34.03]Eres una vista tan celestial
[03:39.93]Sí, sí, sí, uh
[03:48.00]
`,
          letra: `
[00:00.00]
[00:17.17]'Cause you're a sky, 'cause you're a sky full of stars
[00:24.86]I'm gonna give you my heart
[00:30.17]
[00:32.43]'Cause you're a sky, 'cause you're a sky full of stars
[00:40.35]'Cause you light up the path
[00:47.85]I don't care, go on and tear me apart
[00:55.52]I don't care if you do, ooh-ooh, ooh
[01:03.18]'Cause in a sky, 'cause in a sky full of stars
[01:08.48]I think I saw you
[01:13.10]
[01:41.60]'Cause you're a sky, 'cause you're a sky full of stars
[01:49.34]I wanna die in your arms, oh, oh-oh
[01:57.01]'Cause you get lighter the more it gets dark
[02:04.77]I'm gonna give you my heart, oh
[02:12.47]I don't care, go on and tear me apart
[02:20.07]I don't care if you do, ooh-ooh, ooh
[02:27.78]'Cause in a sky, 'cause in a sky full of stars
[02:33.03]I think I see you
[02:40.71]I think I see you
[02:44.43]
[03:21.34]'Cause you're a sky, you're a sky full of stars
[03:26.61]Such a heavenly view
[03:34.03]You're such a heavenly view
[03:39.93]Yeah, yeah, yeah, ooh
[03:48.00]
`
        }
      }
    },
    {
      id: "futuro",
      nombre: "Todo lo que nos espera",
      forma: "El avión de papel",
      color: "#8fc6ff",
      escala: 1,
      estrellas: [[94, 10, 0.95], [24, 40, 0.75], [54, 50, 0.85], [64, 80, 0.7], [31, 73, 0.5], [7, 93, 0.45]],
      trazos: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 0], [2, 4, "punteado"], [4, 5, "punteado"]],
      anillos: [],
      experiencia: {
        tipo: "deseos",
        indicacion: "Desliza hacia arriba para lanzar cada deseo al cielo",
        indicacionTeclado: "Pulsa Enter o Espacio para lanzar cada deseo",
        cierre: "Y los que todavía nos faltan por pedir"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: null,
        titulo: "Todo lo que nos espera",
        mensaje: "Lo que quiero vivir contigo:",
        lista: [
          "Celebrar nuestro primer aniversario el 19 de agosto de 2027, y cada uno de los que vengan.",
          "Caminar por el malecón al atardecer y terminar con un café en el centro, sin prisa.",
          "Hacer un viaje por carretera de fin de semana a un pueblo que no conozcamos.",
          "Ahorrar juntos, poco a poco, para nuestro primer viaje largo."
        ]
      }
    },
    {
      id: "siempre",
      nombre: "Siempre tú",
      forma: "El corazón",
      color: "#ff7096",
      escala: 1,
      estrellas: [[50, 31, 0.75], [30, 13, 0.7], [9, 29, 0.65], [21, 57, 0.6], [50, 87, 1], [79, 57, 0.6], [91, 29, 0.7], [70, 13, 0.65]],
      trazos: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]],
      anillos: [],
      experiencia: {
        tipo: "latido",
        indicacion: "Mantén presionado el corazón y siente cómo late",
        indicacionTeclado: "Mantén presionada la barra espaciadora y siente cómo late",
        cierre: "Late así cada vez que te pienso"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: "Hoy, y todos los días que vengan",
        titulo: "Siempre tú",
        mensaje: "Podría recorrer mil cielos distintos y en cada uno te buscaría a ti. Así se veía el cielo de Veracruz la noche del 19 de agosto de 2026."
      },
      // El cielo real de Veracruz la noche del 19 de agosto de 2026 (se abre en lugar de la tarjeta)
      // La hora 21:00 es aproximada: cámbiala si el cliente da la hora real.
      mapaEstelar: {
        lugar: "Veracruz, Veracruz",
        latitud: 19.1738,
        longitud: -96.1342,
        altitud: 10,
        fecha: "2026-08-19",
        hora: "21:00",
        zonaHoraria: -6,
        titulo: "El cielo del día en que empezó lo nuestro",
        destacados: [
          {
            tipo: "planeta",
            objetivo: "Luna",
            titulo: "La media luna",
            subtitulo: "Junto al corazón del Escorpión",
            texto: "Esa noche la Luna, a media luz, brillaba hacia el suroeste muy cerca de Antares, la estrella roja del Escorpión. Como si el cielo también estrenara algo nuevo."
          },
          {
            tipo: "pareja",
            objetivo: ["Vega", "Altair"],
            constelaciones: ["Lyr", "Aql"],
            titulo: "Vega y Altair",
            subtitulo: "Los enamorados del cielo de verano",
            texto: "Brillaban casi sobre nuestras cabezas. Cuenta la leyenda que son dos enamorados separados por la Vía Láctea que se reencuentran cada verano. Nosotros nos encontramos ese verano."
          },
          {
            tipo: "via-lactea",
            objetivo: "centro-galactico",
            constelaciones: ["Sgr", "Sco"],
            titulo: "Vía Láctea",
            subtitulo: "Nuestra galaxia",
            texto: "Su centro brillaba alto hacia el sur, entre Sagitario y el Escorpión, y su brazo de luz cruzaba todo el cielo hasta el norte."
          },
          {
            tipo: "estrella",
            objetivo: "Arturo",
            titulo: "Arturo",
            subtitulo: "El guardián de la Osa",
            texto: "La estrella naranja más brillante de esa noche se despedía por el oeste, como el último testigo de un día que no vamos a olvidar."
          }
        ]
      }
    }
  ],

  /* La carta final */
  carta: {
    saludo: "Mario:",
    parrafos: [
      "Quise regalarte un cielo porque es lo único lo bastante grande para guardar todo lo que siento por ti.",
      "El 19 de agosto de 2026, en Veracruz, empezamos a ser novios, y desde entonces mis días tienen otro brillo: salidas, caminos en coche, noches de luces y hasta vueltas al súper que se vuelven planes.",
      "Contigo aprendí que el mejor plan no depende del lugar, sino de con quién lo vives. Y yo quiero vivirlos todos a tu lado.",
      "Gracias por tu paciencia, por tus risas y por hacerme sentir en casa cada vez que estoy contigo.",
      "Esto apenas empieza, y ya quiero que llegue nuestro primer aniversario para celebrarlo juntos. Te amo, Mario, hoy y en cada cielo que nos toque mirar juntos."
    ],
    despedida: "Con todo mi amor,",
    firma: "Felipe"
  }
};
