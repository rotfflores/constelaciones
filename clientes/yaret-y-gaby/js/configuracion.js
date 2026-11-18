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
          archivo: "assets/audio/ojitos-lindos.mp3",
          titulo: "Ojitos Lindos",
          artista: "Bad Bunny y Bomba Estéreo",
          dedicatoria: "Porque con que me mires con esos ojitos lindos, yo estoy bien",
          // Letra enviada por el cliente. Tiempos [mm:ss] sincronizados con Whisper (medium) sobre este MP3; los "Tú y yo" y los "Mmm" se ajustaron a mano.
          // desfaseLetra mueve todas las líneas a la vez (segundos; negativo = antes).
          idiomaOriginal: "es",
          desfaseLetra: 0,
          letra: `
[00:00.00]
[00:10.92]Hace mucho tiempo le hago caso al corazón
[00:16.04]Y pasan los día', los meses pensando en tu olor
[00:22.78]Ha llegado el tiempo para usar la razón
[00:29.22]Ante' que sea tarde y sin querer me parta en do'
[00:35.28]Antes de que salga el sol y hunda el acelerador
[00:38.45]Que vaya sin frenos y pierda el control
[00:41.20]Nada más seremos dos, tú y yo acariciándonos
[00:44.48]En medio del tiempo, sin decir adiós
[00:47.12]Y solo mírame con esos ojito' lindo'
[00:51.90]Que con eso yo estoy bien
[00:54.95]Hoy he vuelto a nacer
[00:59.42]Hace tiempo que no agarro a nadie de la mano
[01:05.48]Hace tiempo que no envío: "buenos días, te amo"
[01:10.18]Pero tú me tiene' enredao, me envolví
[01:14.36]Iba por mi camino y me perdí
[01:17.16]Mi mirada cambió cuando tus ojos vi
[01:20.18]Bye-bye a los culo', ni me despedí
[01:22.80]Yo no te busqué, no
[01:26.00]Chocamo en el trayecto
[01:28.70]Con tu alma es la que yo conecto
[01:31.50]Tranquila, no tiene que ser perfecto, no
[01:35.16]Aquí no existe el pecado
[01:38.28]Y equivocarse es bonito
[01:41.34]Los errores son placeres
[01:44.42]Igual que to' tus besito'
[01:47.06]Y solo mírame con esos ojito' lindo'
[01:51.86]Que con eso yo estoy bien
[01:54.41]Hoy he vuelto a nacer
[01:58.36]Y solo mírame con esos ojito' lindo'
[02:03.88]Que con eso yo estoy bien
[02:06.53]Hoy he vuelto a nacer
[02:11.46]Tú y yo, tú y yo, tú y yo (tú y yo, tú y yo)
[02:17.48]Tú y yo, tú y yo (tú y yo, tú y yo), tú y yo
[02:27.34]Tú y yo, tú y yo
[02:31.76]Tú y yo, tú y yo
[02:34.70]Yo no me dejo llevar de nadie
[02:36.88]Yo solo me dejo llevar de tu sonrisa
[02:39.98]Y del lunar cerquita de tu boca
[02:43.06]Si yo estoy loco, tú estás loquita
[02:46.20]Pero, baby, como tú no hay otra, no
[02:50.14]Quiero regalarte girasoles
[02:52.52]Ir pa la playa y buscarte caracoles
[02:55.86]Cuando estoy contigo, yo no miro el Rolex
[02:58.66]Vamo a bailar 200 cancione'
[03:02.14]Nadie me pone como tú me pone'
[03:06.00]Mmm, mm-mm, mmm
[03:08.40]Mmm, mm-mm, mmm
[03:10.96]Yo le hablo a Dio' y tú eres su respuesta
[03:14.02]Aprendí que los momento' lindo' nunca cuestan
[03:17.48]Como cuando me regalas tu mirada
[03:20.12]Y el sol, su puesta (ey, ey), y el sol, su puesta
[03:23.18]Cuando estoy encima de ti, de ti
[03:26.46]Mami, yo me olvido de todo, de todo
[03:29.38]No hace falta nadie aquí
[03:32.34]Solamente tú y yo
[03:35.44]Antes de que salga el sol y hunda el acelerador
[03:38.45]Que vaya sin frenos y pierda el control
[03:41.24]Nada más seremos dos, tú y yo acariciándonos
[03:44.44]En medio del tiempo, sin decir adiós
[03:47.10]Y solo mírame con esos ojito' lindo'
[03:51.88]Que con eso yo estoy bien
[03:54.84]Hoy he vuelto a nacer
[03:59.10]Y solo mírame con esos ojito' lindo'
[04:03.94]Que con eso yo estoy bien
[04:06.72]Hoy he vuelto a nacer
[04:12.00]
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
      "Esto apenas empieza, y quiero vivir todo lo que viene a tu lado. Te amo, Yaret. Solo mírame con esos ojitos lindos, que con eso yo estoy bien."
    ],
    despedida: "Con todo mi amor,",
    firma: "Gaby"
  }
};
