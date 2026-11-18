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
     (México centro: -6, sin horario de verano desde 2022; Illinois en verano: -5).
   - titulo, mensaje (si falta, se usa el de recuerdo) y nombres (si faltan, los de arriba).
   - destacados: hasta cuatro. tipo "estrella", "pareja", "via-lactea" o "planeta";
     objetivo: el nombre de una estrella (Antares, Vega, Régulo…), de un planeta
     (Marte, Venus…), "Luna" o "centro-galactico"; para "pareja", una lista de dos.
     Las posiciones del Sol, la Luna y los planetas se calculan para esa fecha.
   ========================================================================== */

window.CIELO_CONFIG = {
  /* Quién recibe y quién envía */
  destinatario: "Yaret",
  remitente: "Gaby",

  /* Textos generales */
  textos: {
    tituloPagina: "Nuestras estrellas",
    bienvenida: "Desde el 3 de junio, mi cielo tiene tus ojitos lindos. Lo dibujé para ti",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Yaret”
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
        fecha: "3 de junio de 2026",
        titulo: "El día que empezó lo nuestro",
        mensaje: "El 3 de junio de 2026 empezó nuestra historia. Yo no te busqué: chocamos en el trayecto, y desde ese día cada camino tiene más sentido porque lo recorro contigo.",
        // La llave abre un vale por una cita; se reclama por WhatsApp con Gaby.
        // whatsapp: el número con lada del país y sin espacios (52 es México).
        sorpresa: {
          tipo: "cita",
          aviso: "La llave abrió algo para ti",
          pista: "Toca el candado para usar la llave",
          folio: "Nº 0306",
          antetitulo: "Vale por",
          titulo: "Una cita",
          detalle: "Tú eliges el día y el lugar. Yo me encargo de todo lo demás.",
          admite: "Admite: tú y yo",
          vigencia: "Válido para siempre",
          boton: "Reclamar por WhatsApp",
          whatsapp: "524431373757",
          mensajeWhatsapp: "Hola, Gaby ✨ Abrí la llave de nuestras estrellas y vengo a reclamar mi cita.",
          nota: "Si WhatsApp no se abre, escríbele al +52 443 137 3757"
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
          { foto: "assets/fotos/tu-y-yo.jpg", pie: "Tú y yo", enfoque: "50% 30%",
            textoAlternativo: "Selfie de las dos bajo un árbol: una con lentes de sol en la cabeza y la otra recargada en su hombro" },
          { foto: "assets/fotos/en-chicago.jpg", pie: "Chicago, contigo", enfoque: "50% 45%",
            textoAlternativo: "Selfie de las dos en el centro de Chicago, con gorras, frente a un edificio blanco con una bandera arcoíris" },
          { foto: "assets/fotos/vaqueras.jpg", pie: "Mis vaqueras favoritas", enfoque: "50% 30%",
            textoAlternativo: "Selfie de las dos bajo un techo de madera, una con sombrero vaquero negro y la otra con gorra" },
          { foto: "assets/fotos/junto-al-lago.jpg", pie: "Junto al lago", enfoque: "50% 40%",
            textoAlternativo: "Selfie de las dos sonriendo junto a un lago con lanchas, una con gorra y la otra con sombrero" },
          { foto: "assets/fotos/tu-abrazo.jpg", pie: "Mi lugar favorito: tu abrazo", enfoque: "50% 35%",
            textoAlternativo: "Selfie de las dos en un parque: una con lentes de sol y la otra abrazándola por detrás con gorra" },
          { foto: "assets/fotos/bajo-el-sol.jpg", pie: "Bajo el sol, juntas", enfoque: "50% 35%",
            textoAlternativo: "Selfie de las dos sentadas al sol en un jardín, con lentes oscuros y sudaderas" },
          { foto: "assets/fotos/en-camino.jpg", pie: "En camino, a tu lado", enfoque: "50% 40%",
            textoAlternativo: "Selfie de las dos dentro de un coche al atardecer, una con gorra y la otra con gorro naranja" }
        ],
        fecha: "Desde el 3 de junio",
        titulo: "Todos nuestros momentos",
        mensaje: "De las calles de Chicago a la orilla de un lago, de un viaje en carretera a una tarde bajo los árboles: contigo cualquier lugar se vuelve mi lugar favorito, y cualquier día se vuelve bonito."
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
          "Las ganas de volver a tomar a alguien de la mano.",
          "La risa que solo me sale contigo.",
          "La paz que siento cuando me miras con esos ojitos lindos.",
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
          archivo: "assets/audio/mi-musa.mp3",
          titulo: "Mi Musa",
          artista: "Marco Ferrero",
          dedicatoria: "Porque eres mi musa, y cada estrella de este cielo lo sabe",
          // Sin la letra de la canción (Obed no la tiene): en su lugar van frases de dedicatoria
          // escritas para Yaret, repartidas a lo largo de la canción. Se iluminan como karaoke
          // y la frase actual aparece en el cielo. desfaseLetra las mueve todas a la vez (segundos).
          idiomaOriginal: "es",
          desfaseLetra: 0,
          letra: `
[00:00.00]
[00:09.00]Esta canción es para ti, Yaret
[00:23.80]Porque desde el 3 de junio, todo lo bonito me recuerda a ti
[00:38.60]Eres mi musa: la razón de cada detalle de este cielo
[00:53.40]Me inspiras cuando sonríes
[01:08.20]cuando me tomas de la mano
[01:23.00]y cuando me miras sin decir nada
[01:37.80]Contigo, los días comunes se vuelven canciones
[01:52.60]Cada foto nuestra es un verso que quiero seguir escribiendo
[02:07.40]De Flora a Chicago, de un lago a cualquier camino,
[02:22.20]mi lugar favorito siempre es a tu lado
[02:37.00]Gracias por llegar sin avisar
[02:51.80]y quedarte como si siempre hubieras sido parte de mí
[03:06.60]Todo lo que viene, quiero vivirlo contigo
[03:21.40]Te amo, Yaret
[03:36.20]Con todo mi amor, Gaby
[03:50.00]
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
          "Celebrar nuestro primer aniversario el 3 de junio de 2027, y cada uno de los que vengan.",
          "Volver a Chicago con calma: caminar junto al lago y ver la ciudad iluminada de noche.",
          "Ahorrar juntas, un poquito cada mes, para un viaje a la playa a buscar caracoles.",
          "Hacer un viaje por carretera y ver juntas un atardecer en el camino.",
          "Bailar nuestras 200 canciones, aunque sea en la sala de la casa."
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
        mensaje: "Podría recorrer mil cielos distintos y en cada uno te buscaría a ti. Así se veía el cielo de Flora la noche del 3 de junio de 2026."
      },
      // El cielo real de Flora, Illinois, la noche del 3 de junio de 2026 (se abre en lugar de la tarjeta).
      // Illinois usa horario de verano en junio (CDT, UTC-5). El sol se puso a las 20:14;
      // la hora 22:00 es aproximada (cielo ya oscuro): cámbiala si el cliente da la hora real.
      mapaEstelar: {
        lugar: "Flora, Illinois",
        latitud: 38.6689,
        longitud: -88.4856,
        altitud: 150,
        fecha: "2026-06-03",
        hora: "22:00",
        zonaHoraria: -5,
        titulo: "El cielo del día en que empezó lo nuestro",
        destacados: [
          {
            tipo: "planeta",
            objetivo: ["Venus", "Júpiter"],
            titulo: "Venus y Júpiter",
            subtitulo: "Juntos al oeste, después del atardecer",
            texto: "Esa noche los dos planetas más brillantes bajaban juntos hacia el oeste, uno al lado del otro. Así quiero ir por la vida: contigo al lado."
          },
          {
            tipo: "estrella",
            objetivo: "Arturo",
            titulo: "Arturo",
            subtitulo: "Casi sobre nuestras cabezas",
            texto: "La estrella más brillante de esa noche estaba muy alta, hacia el sur. Cálida y dorada, como se siente estar contigo."
          },
          {
            tipo: "pareja",
            objetivo: ["Vega", "Altair"],
            constelaciones: ["Lyr", "Aql"],
            titulo: "Vega y Altair",
            subtitulo: "Las enamoradas del cielo de verano",
            texto: "Cuenta la leyenda que son dos enamoradas separadas por la Vía Láctea que se reencuentran cada verano. Esa noche subían juntas por el este, como nuestra historia, que apenas empezaba."
          },
          {
            tipo: "estrella",
            objetivo: "Antares",
            titulo: "Antares",
            subtitulo: "El corazón del Escorpión",
            texto: "Roja y brillante, salía por el sureste. Es el corazón de una constelación entera, igual que tú eres el centro de la mía."
          }
        ]
      }
    }
  ],

  /* La carta final */
  carta: {
    saludo: "Yaret:",
    parrafos: [
      "Quise regalarte un cielo porque es lo único lo bastante grande para guardar todo lo que siento por ti.",
      "Hacía tiempo que no tomaba a nadie de la mano, ni mandaba un “buenos días, te amo”. Y entonces llegaste tú. Yo no te busqué: chocamos en el trayecto, y desde el 3 de junio de 2026 todo cambió.",
      "Contigo aprendí que no tiene que ser perfecto para ser bonito. Que los momentos lindos nunca cuestan, como cuando me regalas tu mirada.",
      "Gracias por tu paciencia, por tus risas, por cada viaje y cada abrazo. Contigo me siento en casa, estemos en Flora, en Chicago o en cualquier camino.",
      "Esto apenas empieza, y quiero vivir todo lo que viene a tu lado. Te amo, Yaret. Eres mi musa, hoy y en cada cielo que nos toque mirar juntas."
    ],
    despedida: "Con todo mi amor,",
    firma: "Gaby"
  }
};
