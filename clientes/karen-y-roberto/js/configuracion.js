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
  destinatario: "Karen",
  remitente: "Roberto",

  /* Textos generales */
  textos: {
    tituloPagina: "Nuestras estrellas",
    bienvenida: "Desde que te conocí, el cielo tiene una estrella nueva. Hoy quiero hacerte una pregunta",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Karen”
    botonEntrar: "Descubre nuestro cielo",
    indicacion: "Toca una constelación para descubrir su historia",
    gestosTactil: "Desliza para girar nuestro universo · pellizca para acercar",
    gestosRaton: "Arrastra para girar nuestro universo · usa la rueda para acercar",
    gestosTeclado: "Tab para elegir una constelación · flechas para girar",
    volverCielo: "Volver al cielo",
    cerrarRecuerdo: "Seguir explorando",
    progreso: "{n} de {total} constelaciones descubiertas",
    antesDelFinal: "Mira lo que dibujan juntas",
    final: "Cada estrella de este cielo te hace la misma pregunta. Ábrela en mi carta",
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
        fecha: "17 de octubre de 2026",
        titulo: "El día que te conocí",
        mensaje: "El 17 de octubre de 2026, en la Ciudad de México, te conocí. No sabía que ese día iba a cambiarlo todo, pero desde entonces no he dejado de pensar en ti ni de buscar cualquier pretexto para verte otra vez.",
        // La llave abre un vale por nuestra primera cita como novios; se reclama (y se responde) por WhatsApp.
        // whatsapp: el número con lada del país y sin espacios (52 es México).
        sorpresa: {
          tipo: "cita",
          aviso: "La llave abrió algo para ti",
          pista: "Toca el candado para usar la llave",
          folio: "Nº 1710",
          antetitulo: "Válido por",
          titulo: "Nuestra primera cita como novios",
          detalle: "Este vale se activa con un sí. Tú eliges el día y el lugar; yo me encargo de las flores y de todo lo demás.",
          admite: "Admite: tú y yo",
          vigencia: "Válido desde tu sí y para siempre",
          boton: "Responderle a Roberto",
          whatsapp: "525561398494",
          mensajeWhatsapp: "Hola, Roberto ✨ Abrí la llave de nuestras estrellas y vengo a reclamar nuestra primera cita como novios.",
          nota: "Si WhatsApp no se abre, escríbele al +52 55 6139 8494"
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
          { foto: "assets/fotos/tu-y-yo.jpg", pie: "Tú y yo, entre montañas", enfoque: "50% 40%",
            textoAlternativo: "Selfie de los dos en un balcón, él con camiseta blanca y ella de rojo, con los cerros y las bugambilias detrás" },
          { foto: "assets/fotos/tu-sonrisa.jpg", pie: "Mi vista favorita", enfoque: "50% 55%",
            textoAlternativo: "Karen de rojo, recargada en un barandal de ladrillo, sonriendo frente a las montañas" },
          { foto: "assets/fotos/el-corazon.jpg", pie: "Hasta la pared lo sabía", enfoque: "50% 50%",
            textoAlternativo: "Los dos sentados de la mano frente a una pared roja con un gran corazón de flores rosas" },
          { foto: "assets/fotos/noche-de-teatro.jpg", pie: "Una noche de teatro", enfoque: "50% 35%",
            textoAlternativo: "Selfie de los dos sentados en las butacas de un teatro" },
          { foto: "assets/fotos/bajo-las-luces.jpg", pie: "Bajo las luces", enfoque: "50% 30%",
            textoAlternativo: "Selfie de los dos de noche frente a la marquesina iluminada de un teatro" },
          { foto: "assets/fotos/esperando-tu-respuesta.jpg", pie: "Yo, esperando tu respuesta", enfoque: "50% 60%",
            textoAlternativo: "Roberto sentado en un barandal de ladrillo con las montañas y el cielo azul detrás" }
        ],
        fecha: "Desde el 17 de octubre",
        titulo: "Todos nuestros momentos",
        mensaje: "Ha pasado poco tiempo y ya tengo una colección de momentos favoritos: tu sonrisa entre montañas, las noches de teatro y cada vez que te sientas a mi lado. Quiero llenar este álbum contigo."
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
          "Una sonrisa cada vez que llega un mensaje tuyo.",
          "Las ganas de que el fin de semana llegue rápido para verte.",
          "La calma de estar a tu lado, aunque no digamos nada.",
          "El valor para hacerte, por fin, esta pregunta."
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
          dedicatoria: "Porque desde que te conocí, mi cielo está lleno de estrellas",
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
        mensaje: "Lo que me gustaría vivir contigo, si me dices que sí:",
        lista: [
          "Volver a escaparnos entre montañas, ahora tomados de la mano como novios.",
          "Muchas noches más de teatro, tú y yo en la misma fila.",
          "Celebrar cada 17 de octubre, el día que te conocí.",
          "Llenar un álbum entero de fotos, viajes y recuerdos nuestros."
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
        mensaje: "Podría recorrer mil cielos distintos y en cada uno buscaría la misma estrella. Así se veía el cielo la noche del día en que te conocí."
      },
      // El cielo real de la Ciudad de México la noche del 17 de octubre de 2026 (el día que se conocieron) (se abre en lugar de la tarjeta)
      // La hora 21:00 es aproximada: cámbiala si el cliente da la hora real.
      mapaEstelar: {
        lugar: "Ciudad de México",
        latitud: 19.4326,
        longitud: -99.1332,
        altitud: 2240,
        fecha: "2026-10-17",
        hora: "21:00",
        zonaHoraria: -6,
        titulo: "El cielo del día que te conocí",
        destacados: [
          {
            tipo: "planeta",
            objetivo: "Luna",
            titulo: "La Luna creciente",
            subtitulo: "Iluminada a la mitad",
            texto: "Esa noche la Luna estaba en cuarto creciente, brillando al suroeste. Una luna que apenas empezaba a crecer, como lo que empecé a sentir por ti."
          },
          {
            tipo: "planeta",
            objetivo: "Saturno",
            titulo: "Saturno",
            subtitulo: "El planeta de los anillos",
            texto: "Brillaba alto hacia el este, dorado y tranquilo. Un anillo en el cielo, justo la noche en que empezó nuestra historia."
          },
          {
            tipo: "pareja",
            objetivo: ["Vega", "Altair"],
            titulo: "Vega y Altair",
            subtitulo: "Los enamorados del cielo",
            texto: "Una leyenda cuenta que son dos enamorados separados por la Vía Láctea que se encuentran una noche al año. Esa noche brillaban juntos al oeste, como si supieran que tú y yo acabábamos de encontrarnos."
          },
          {
            tipo: "estrella",
            objetivo: "Fomalhaut",
            titulo: "Fomalhaut",
            subtitulo: "La estrella solitaria del otoño",
            texto: "La más brillante del cielo del sur esa noche. Ella brillaba sola; yo, desde ese día, ya no."
          }
        ]
      }
    }
  ],

  /* La carta final */
  carta: {
    saludo: "Karen:",
    parrafos: [
      "Quise regalarte un cielo porque es lo único lo bastante grande para guardar todo lo que siento por ti.",
      "El 17 de octubre de 2026 te conocí en la Ciudad de México, y desde ese día algo cambió. Empecé a contar las horas para volver a verte, a guardar cada foto contigo y a sonreír como tonto cada vez que me escribes.",
      "Entre montañas, en una butaca de teatro o en cualquier lugar, me di cuenta de que mi momento favorito siempre es el que paso a tu lado.",
      "No sé todo lo que nos espera, pero sí sé con quién quiero descubrirlo. Quiero cuidarte, hacerte reír y llenar contigo muchas constelaciones más.",
      "Así que hoy, bajo este cielo que dibujé para ti, te lo pregunto con todo el corazón: ¿quieres ser mi novia?"
    ],
    despedida: "Esperando tu respuesta, con todo mi cariño,",
    firma: "Roberto"
  }
};
