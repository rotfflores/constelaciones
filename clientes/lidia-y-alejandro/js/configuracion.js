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
  destinatario: "Lidia",
  remitente: "Alejandro",

  /* Textos generales */
  textos: {
    tituloPagina: "Nuestras estrellas",
    bienvenida: "Hay estrellas que siguen brillando, aunque pase el tiempo",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Lidia”
    botonEntrar: "Descubre nuestro cielo",
    indicacion: "Toca una constelación para descubrir su historia",
    gestosTactil: "Desliza para girar nuestro universo · pellizca para acercar",
    gestosRaton: "Arrastra para girar nuestro universo · usa la rueda para acercar",
    gestosTeclado: "Tab para elegir una constelación · flechas para girar",
    volverCielo: "Volver al cielo",
    cerrarRecuerdo: "Seguir explorando",
    progreso: "{n} de {total} constelaciones descubiertas",
    antesDelFinal: "Mira lo que dibujan juntas",
    final: "Ahora lo sabes: cada recuerdo contigo sigue teniendo su lugar en mi universo",
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
        fecha: "El día que te conocí",
        titulo: "Donde comenzó todo",
        mensaje: "Hubo un día en que nuestros caminos se cruzaron y, sin saberlo, empezamos a escribir la historia más importante de mi vida. Pase lo que pase, ese día sigue siendo uno de los mejores que he tenido.",
        // La llave abre un vale por un café y una plática que se reclama por WhatsApp.
        // whatsapp: el número con lada del país y sin espacios (52 es México).
        sorpresa: {
          tipo: "cita",
          aviso: "La llave abrió algo para ti",
          pista: "Toca el candado para usar la llave",
          folio: "Nº 0202",
          antetitulo: "Válido por",
          titulo: "Un café y una plática",
          detalle: "Sin prisa y sin presiones. Tú eliges el día y el lugar; yo llego puntual, dispuesto a escucharte de verdad.",
          admite: "Admite: tú y yo",
          vigencia: "Válido cuando tú lo decidas",
          boton: "Reclamar mi café",
          whatsapp: "529851259327",
          mensajeWhatsapp: "Hola, Alejandro. Abrí la llave de nuestras estrellas y vengo a reclamar ese café.",
          nota: "Si WhatsApp no se abre, escríbele al +52 985 125 9327"
        }
      }
    },
    {
      id: "momento",
      nombre: "Lo que construimos",
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
        // Galería: la primera foto es la que forma el polvo de estrellas (principal.jpeg del cliente).
        fotos: [
          { foto: "assets/fotos/nosotros.jpg", pie: "Mi lugar favorito", enfoque: "50% 45%",
            textoAlternativo: "Selfie en el sillón: ella sonríe con lentes y blusa de leopardo mientras él la besa en la sien" },
          { foto: "assets/fotos/en-casa.jpg", pie: "Una noche cualquiera en casa", enfoque: "65% 50%",
            textoAlternativo: "Selfie de él en la sala; detrás, ella y los niños descansan juntos en el sillón gris" },
          { foto: "assets/fotos/los-cuatro.jpg", pie: "Los cuatro", enfoque: "50% 45%",
            textoAlternativo: "Selfie de los cuatro sonriendo: la hija con lentes, el hijo, ella de blusa rosa y él" },
          { foto: "assets/fotos/los-siete-de-renato.jpg", pie: "Los 7 de Renato", enfoque: "50% 25%",
            textoAlternativo: "Los dos con su hijo Renato frente a un pastel de Spider-Man con el número 7" },
          { foto: "assets/fotos/navidad.jpg", pie: "Navidad en familia", enfoque: "50% 45%",
            textoAlternativo: "Foto familiar navideña dentro de un marco dorado: él carga al niño, ella abraza a la niña" },
          { foto: "assets/fotos/te-amo.jpg", pie: "Hasta el último de mis alientos", enfoque: "50% 40%",
            textoAlternativo: "Él besa a ella en la mejilla mientras ella abraza a su hija pequeña; el texto dice Te amo, Lidiesita hermosa" }
        ],
        fecha: "Todo lo que somos",
        titulo: "Lo que construimos",
        mensaje: "Una casa, dos hijos maravillosos, domingos en el sillón y fiestas llenas de risas. Lo más bonito que he hecho en la vida lo hice contigo, y no lo miro con nostalgia: lo miro con gratitud."
      }
    },
    {
      id: "iluminas",
      nombre: "Lo que he aprendido",
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
        cierre: "Y que todavía me queda mucho por aprender"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: null,
        titulo: "Lo que he aprendido",
        mensaje: "Este tiempo me enseñó cosas que debí entender antes:",
        lista: [
          "Que pedir perdón no basta si no cambia nada.",
          "Que escuchar también es una forma de amar.",
          "Que lo de todos los días era lo más importante.",
          "Que te admiro más de lo que alguna vez supe decirte."
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
          archivo: "assets/audio/fix-you.mp3",
          titulo: "Fix You",
          artista: "Coldplay",
          dedicatoria: "“I promise you I will learn from my mistakes.” Y lo cumplo, un día a la vez",
          // Letra enviada por el cliente, con traducción al español (se muestra primero; el botón cambia al original).
          // Tiempos [mm:ss] sincronizados con Whisper (modelo medium) en la compu de Obed
          // desfaseLetra mueve todas las líneas a la vez (segundos; negativo = antes).
          idiomaOriginal: "en",
          desfaseLetra: 0,
          letra: `
[00:00.00]
[00:12.50]When you try your best, but you don't succeed
[00:20.14]When you get what you want, but not what you need
[00:26.94]When you feel so tired, but you can't sleep
[00:34.00]Stuck in reverse
[00:40.80]And the tears come streaming down your face
[00:48.98]When you lose something you can't replace
[00:54.22]When you love someone, but it goes to waste
[01:02.46]Could it be worse?
[01:11.88]Lights will guide you home
[01:19.62]And ignite your bones
[01:26.24]And I will try to fix you
[01:44.42]And high up above or down below
[01:51.56]When you're too in love to let it go
[01:58.30]But if you never try, you'll never know
[02:05.54]Just what you're worth
[02:15.26]Lights will guide you home
[02:23.02]And ignite your bones
[02:29.94]And I will try to fix you
[03:30.88]Tears stream down your face
[03:37.36]When you lose something you cannot replace
[03:44.52]Tears stream down your face, and I
[03:59.22]Tears stream down your face
[04:04.98]I promise you I will learn from my mistakes
[04:11.76]Tears stream down your face, and I
[04:25.66]Lights will guide you home
[04:33.14]And ignite your bones
[04:39.70]And I will try to fix you
[04:45.76]
`,
          letraTraducida: `
[00:00.00]
[00:12.50]Cuando das lo mejor de ti, pero no lo logras
[00:20.14]Cuando consigues lo que quieres, pero no lo que necesitas
[00:26.94]Cuando estás tan cansada, pero no puedes dormir
[00:34.00]Atrapada en reversa
[00:40.80]Y las lágrimas corren por tu rostro
[00:48.98]Cuando pierdes algo que no puedes reemplazar
[00:54.22]Cuando amas a alguien, pero ese amor se pierde
[01:02.46]¿Podría ser peor?
[01:11.88]Las luces te guiarán a casa
[01:19.62]Y encenderán tu alma
[01:26.24]Y yo intentaré sanarte
[01:44.42]Y allá en lo alto o aquí abajo
[01:51.56]Cuando amas tanto que no puedes dejarlo ir
[01:58.30]Pero si nunca lo intentas, nunca sabrás
[02:05.54]Lo mucho que vales
[02:15.26]Las luces te guiarán a casa
[02:23.02]Y encenderán tu alma
[02:29.94]Y yo intentaré sanarte
[03:30.88]Las lágrimas corren por tu rostro
[03:37.36]Cuando pierdes algo que no puedes reemplazar
[03:44.52]Las lágrimas corren por tu rostro, y yo…
[03:59.22]Las lágrimas corren por tu rostro
[04:04.98]Te prometo que aprenderé de mis errores
[04:11.76]Las lágrimas corren por tu rostro, y yo…
[04:25.66]Las luces te guiarán a casa
[04:33.14]Y encenderán tu alma
[04:39.70]Y yo intentaré sanarte
[04:45.76]
`
        }
      }
    },
    {
      id: "futuro",
      nombre: "Lo que deseo para nosotros",
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
        cierre: "Y, sobre todo, que tú seas feliz"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: null,
        titulo: "Lo que deseo para nosotros",
        mensaje: "No te pido que olvides. Solo te cuento lo que deseo, con el corazón en la mano:",
        lista: [
          "Ganarme otra vez tu confianza, con hechos y un día a la vez.",
          "Volver a platicar contigo sin prisa, como antes.",
          "Que nuestros hijos nos vean reír juntos otra vez.",
          "Que vuelvas a sentirte en paz, cuidada y en casa."
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
        fecha: "2 de febrero de 1987",
        titulo: "Siempre tú",
        mensaje: "El 2 de febrero de 1987 el cielo de Valladolid se encendió para recibirte. Mucho antes de conocernos ya brillaba la estrella que un día iba a cambiarme la vida."
      },
      // El cielo real de Valladolid, Yucatán, la noche del 2 de febrero de 1987, el día en que nació Lidia
      // (se abre en lugar de la tarjeta). La hora 21:00 es aproximada: cámbiala si el cliente da otra.
      // En 1987 Yucatán usaba la hora del centro (UTC−6).
      mapaEstelar: {
        lugar: "Valladolid, Yucatán",
        latitud: 20.6896,
        longitud: -88.2011,
        altitud: 25,
        fecha: "1987-02-02",
        hora: "21:00",
        zonaHoraria: -6,
        titulo: "El cielo del día en que naciste",
        mensaje: "El 2 de febrero de 1987 el cielo de Valladolid se encendió para recibirte. Mucho antes de conocernos ya brillaba la estrella que un día iba a cambiarme la vida.",
        destacados: [
          {
            tipo: "estrella",
            objetivo: "Sirio",
            titulo: "Sirio",
            subtitulo: "La estrella más brillante del cielo",
            texto: "Esa noche brillaba alta en el sur, más que cualquier otra estrella. Así llegaste tú al mundo: imposible de no ver."
          },
          {
            tipo: "pareja",
            objetivo: ["Betelgeuse", "Rigel"],
            constelaciones: ["Ori"],
            titulo: "Orión",
            subtitulo: "El cazador, casi sobre tu cabeza",
            texto: "Betelgeuse, roja, y Rigel, azul: dos estrellas muy distintas que forman la misma figura. Cada una con su propia luz, y juntas dibujan algo más grande."
          },
          {
            tipo: "planeta",
            objetivo: "Luna",
            titulo: "La Luna y Marte",
            subtitulo: "Juntos al oeste",
            texto: "Una luna creciente bajaba por el oeste y, a su lado, la luz rojiza de Marte. Esa noche se acompañaron hasta perderse en el horizonte."
          },
          {
            tipo: "estrella",
            objetivo: "Canopo",
            titulo: "Canopo",
            subtitulo: "La que se ve desde el sur de México",
            texto: "La segunda estrella más brillante del cielo, baja sobre el horizonte sur. Desde Yucatán se alcanza a ver; desde muchas otras partes, no. Tu cielo tenía algo especial."
          }
        ]
      }
    }
  ],

  /* La carta final */
  carta: {
    saludo: "Lidia:",
    parrafos: [
      "Te escribo esto sin prisa y sin esperar nada a cambio. Solo quería que supieras, de la mejor forma que encontré, lo que llevo tiempo queriendo decirte.",
      "Sé que me equivoqué y que hubo momentos en los que no estuve a la altura de lo que tú y nuestra familia merecían. No quiero justificarme ni repartir culpas: lo que me tocaba entender, lo he ido entendiendo.",
      "Este tiempo me ha obligado a mirarme por dentro. Estoy trabajando en ser un mejor hombre, primero por mí y por nuestros hijos, y también porque tú siempre viste lo mejor de mí, incluso cuando yo no sabía verlo.",
      "Quise regalarte el cielo del día en que naciste, el 2 de febrero de 1987 en Valladolid, porque ese día el mundo se volvió un lugar mejor, y yo tuve la suerte de que un día me eligieras.",
      "No te pido que olvides ni que decidas nada hoy. Solo te pido la oportunidad de demostrarte, con hechos y con paciencia, que puedo ser el compañero que mereces. Si algún día quieres platicar, aquí voy a estar. Y si no, igual te voy a desear siempre lo mejor, porque lo que siento por ti no depende de lo que decidas."
    ],
    despedida: "Con todo mi amor y todo mi respeto,",
    firma: "Alejandro"
  }
};
