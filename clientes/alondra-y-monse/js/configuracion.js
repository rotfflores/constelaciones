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
  destinatario: "Alondra",
  remitente: "Monse",

  /* Textos generales */
  textos: {
    tituloPagina: "Nuestras estrellas",
    bienvenida: "Entre tantas estrellas, mi lugar favorito sigue siendo contigo",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Alondra”
    botonEntrar: "Descubre nuestro cielo",
    indicacion: "Toca una constelación para descubrir su historia",
    gestosTactil: "Desliza para girar nuestro universo · pellizca para acercar",
    gestosRaton: "Arrastra para girar nuestro universo · usa la rueda para acercar",
    gestosTeclado: "Tab para elegir una constelación · flechas para girar",
    volverCielo: "Volver al cielo",
    cerrarRecuerdo: "Seguir explorando",
    progreso: "{n} de {total} constelaciones descubiertas",
    antesDelFinal: "Mira lo que dibujan juntas",
    final: "Ahora lo sabes: cada recuerdo contigo tiene su lugar en mi universo",
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
        fecha: "10 de octubre de 2026",
        titulo: "Donde comenzó todo",
        mensaje: "El 10 de octubre de 2026, en la Ciudad de México, empezó un capítulo nuevo de nuestra historia. Ese día supe que quiero recorrer todos los caminos contigo, de tu mano.",
        // La llave abre un vale por una cena que se reclama por WhatsApp.
        // whatsapp: el número con lada del país y sin espacios (52 es México).
        sorpresa: {
          tipo: "cita",
          aviso: "La llave abrió algo para ti",
          pista: "Toca el candado para usar la llave",
          folio: "Nº 1010",
          antetitulo: "Válido por",
          titulo: "Una cena",
          detalle: "Tú eliges el día y el lugar. Yo me encargo de la mesa, las velas y todo lo demás.",
          admite: "Admite: tú y yo",
          vigencia: "Válido para siempre",
          boton: "Reclamar mi cena",
          whatsapp: "525636695709",
          mensajeWhatsapp: "Hola, Monse ✨ Abrí la llave de nuestras estrellas y vengo a reclamar mi cena.",
          nota: "Si WhatsApp no se abre, escríbele al +52 56 3669 5709"
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
          { foto: "assets/fotos/tu-mirada.jpg", pie: "Cuando me miras así", enfoque: "50% 35%",
            textoAlternativo: "Foto en blanco y negro: un abrazo, una mirada hacia arriba y la otra mirando hacia abajo con ternura" },
          { foto: "assets/fotos/esa-noche.jpg", pie: "Tú y yo, esa noche", enfoque: "50% 40%",
            textoAlternativo: "Selfie mejilla con mejilla, una con saco claro y otra con vestido blanco y tocado de perlas" },
          { foto: "assets/fotos/de-blanco.jpg", pie: "De blanco y bajo el sol", enfoque: "50% 30%",
            textoAlternativo: "Las dos de pie, vestidas de blanco, entre plantas y la luz cálida de la tarde" },
          { foto: "assets/fotos/siempre-nosotros.jpg", pie: "Siempre nosotros", enfoque: "50% 45%",
            textoAlternativo: "Selfie en tono sepia frente a un árbol de Navidad, con el texto Siempre nosotros, te amo" },
          { foto: "assets/fotos/el-beso.jpg", pie: "Un beso que lo dice todo", enfoque: "50% 40%",
            textoAlternativo: "Un beso, muy de cerca, con chamarra de piel y camisa de flores" },
          { foto: "assets/fotos/tu-sonrisa.jpg", pie: "Mi vista favorita", enfoque: "50% 35%",
            textoAlternativo: "Retrato de cerca con vestido blanco, tocado de perlas y labios color vino" }
        ],
        fecha: "Cada día contigo",
        titulo: "Todos nuestros momentos",
        mensaje: "Cada foto guarda una mirada, un abrazo o una noche que no quiero olvidar. Si pudiera, viviría cada una otra vez contigo."
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
          "Las ganas de levantarme después de cada caída.",
          "La calma de saber que puedo contar contigo.",
          "Una sonrisa en cada mensaje tuyo por la mañana.",
          "Las ganas de agradecerte todos los días."
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
          archivo: "assets/audio/gracias-un-millon.mp3",
          titulo: "Gracias un millón",
          artista: "Río Roma",
          dedicatoria: "Porque sin pedírtelo me cuidas. Gracias un millón",
          // Letra enviada por el cliente. Tiempos [mm:ss] sincronizados con Whisper (palabra por palabra).
          // desfaseLetra mueve todas las líneas a la vez (segundos; negativo = antes).
          idiomaOriginal: "es",
          desfaseLetra: 0,
          letra: `
[00:00.00]
[00:03.60]Después de tanto y tanto caminar
[00:08.85]Después de los fracasos y las heridas
[00:13.35]Después de las caídas y de tantos desengaños
[00:18.50]Hoy la vida se acomoda con los años
[00:23.00]Después de tanto perder y ganar
[00:27.65]Después de traer arena en los bolsillos
[00:32.40]Después de aguantar mentiras para llegar a la verdad
[00:36.70]De fallar mil flechas de felicidad
[00:41.70]Gracias por estar siempre conmigo
[00:46.40]Porque me has dado la mano
[00:48.90]Cuando me sentía perdido
[00:51.50]Gracias por curarme las heridas del destino
[00:56.10]Porque me has dejado claro que puedo contar contigo
[01:01.10]Porque sin pedírtelo me cuidas
[01:05.05]Y me abrazas como nadie me ha abrazado en esta vida
[01:09.90]Por esos mensajes que iluminan mis mañanas
[01:14.65]Porque nunca me dejaste tirar la toalla
[01:19.65]Por ayudarme a andar el camino
[01:23.55]Por compartir tu vida conmigo
[01:28.95]Gracias un millón
[01:34.65]Gracias un millón
[01:39.05]Un millón de gracias
[01:43.55]A ti gracias un millón
[01:47.50]Sin pensarlo, sin planearlo
[01:50.70]Simplemente me nació del corazón
[01:52.75]Decírtelo
[01:56.10]Uno nunca sabe si habrá o no un mañana
[02:00.50]Mejor aprovechar la vida no dura nada
[02:06.45]Gracias por estar siempre conmigo
[02:11.10]Porque me has dado la mano
[02:13.60]Cuando me sentía perdido
[02:16.30]Gracias por curarme las heridas del destino
[02:20.70]Porque me has dejado claro que puedo contar contigo
[02:25.75]Porque sin pedírtelo me cuidas
[02:29.90]Y me abrazas como nadie me ha abrazado en esta vida
[02:34.75]Por esos mensajes que iluminan mis mañanas
[02:39.45]Porque nunca me dejaste tirar la toalla
[02:44.35]Por ayudarme a andar el camino
[02:48.95]Por ayudarme a andar el camino
[02:52.75]Por compartir tu vida conmigo
[02:57.00](Oh, oh, oh, oh)
[02:59.75]Gracias un millón
[03:02.70](Oh, oh, oh, oh)
[03:03.40]Gracias un millón
[03:06.90](Oh, oh, oh, oh)
[03:07.60]Un millón de gracias
[03:11.00](Oh, oh, oh, oh)
[03:13.05]A ti gracias un millón
[03:15.60]A ti gracias un millón
[03:18.20]A ti gracias un millón
[03:22.05]
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
        mensaje: "Lo que soñamos construir juntos:",
        lista: [
          "Escaparnos a la playa y ver un atardecer sin prisa.",
          "Ahorrar poco a poco para tener nuestro propio hogar.",
          "Celebrar cada aniversario con una cena, solo tú y yo.",
          "Seguir llenando el álbum de fotos y de viajes."
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
        mensaje: "Podría recorrer mil cielos distintos y en cada uno buscaría la misma estrella. Esta constelación no tiene final, porque contigo todo sigue empezando."
      },
      // El cielo real de la Ciudad de México la noche del 10 de octubre de 2026 (se abre en lugar de la tarjeta)
      // La hora 21:00 es aproximada: cámbiala si el cliente da la hora real.
      mapaEstelar: {
        lugar: "Ciudad de México",
        latitud: 19.4326,
        longitud: -99.1332,
        altitud: 2240,
        fecha: "2026-10-10",
        hora: "21:00",
        zonaHoraria: -6,
        titulo: "El cielo de nuestro día",
        destacados: [
          {
            tipo: "planeta",
            objetivo: "Saturno",
            titulo: "Saturno",
            subtitulo: "El planeta de los anillos",
            texto: "Brillaba alto en el sureste, dorado y tranquilo. Esa noche había luna nueva: el cielo estaba en su punto más oscuro del mes."
          },
          {
            tipo: "pareja",
            objetivo: ["Vega", "Altair"],
            titulo: "Vega y Altair",
            subtitulo: "Las enamoradas del cielo",
            texto: "Una leyenda cuenta que son dos almas separadas por la Vía Láctea que se encuentran una noche al año. Esa noche brillaban juntas en lo alto, al oeste."
          },
          {
            tipo: "via-lactea",
            objetivo: "centro-galactico",
            constelaciones: ["Sgr", "Sco"],
            titulo: "Vía Láctea",
            subtitulo: "Nuestra galaxia",
            texto: "Su centro se despedía por el suroeste, entre Sagitario y el Escorpión, y su brazo de luz cruzaba el cielo hacia el norte."
          },
          {
            tipo: "estrella",
            objetivo: "Fomalhaut",
            titulo: "Fomalhaut",
            subtitulo: "La estrella solitaria del otoño",
            texto: "La más brillante del cielo del sur esa noche. Brilla sola, pero esa noche el cielo nos tenía a ti y a mí."
          }
        ]
      }
    }
  ],

  /* La carta final */
  carta: {
    saludo: "Mi Alondra:",
    parrafos: [
      "Quise regalarte un cielo porque es lo único lo bastante grande para guardar todo lo que siento por ti.",
      "El 10 de octubre de 2026 se quedó escrito en las estrellas de la Ciudad de México, y cada día a tu lado se ha vuelto una más: tus miradas, nuestros abrazos, las fotos que guardamos y esos besos que todavía me hacen temblar.",
      "Cuando escucho nuestra canción pienso en ti, porque es justo lo que siento: gracias por darme la mano, por cuidarme sin que te lo pida y por esos mensajes que iluminan mis mañanas.",
      "Y lo mejor todavía no llega. Quiero ver contigo un atardecer en la playa, construir nuestro hogar poco a poco y celebrar cada aniversario con una cena, tú y yo.",
      "Gracias por compartir tu vida conmigo. Este es solo el primer mapa: todavía nos quedan muchas constelaciones por dibujar."
    ],
    despedida: "Te amo, hoy y siempre. Gracias un millón,",
    firma: "Monse"
  }
};
