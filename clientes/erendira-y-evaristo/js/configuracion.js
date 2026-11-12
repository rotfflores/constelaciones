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
     tipo "cita": un candado que se abre con la llave; aquí guarda una carta (parrafos, saludo, firma).
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
  /* Quién recibe y a quién honra este cielo.
     destinatario: su nombre se forma con estrellas al final.
     remitente: aquí es su papá; su estrella es la que se encuentra con la de ella. */
  destinatario: "Erendira",
  remitente: "Evaristo",
  /* Nombre que se escribe con estrellas dentro del corazón al final (si falta, el de destinatario). */
  nombreFinal: "Evaristo",

  /* Textos generales */
  textos: {
    tituloPagina: "Una estrella más en el cielo",
    bienvenida: "El 12 de noviembre de 2022 llegó una estrella más al cielo",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Erendira”
    botonEntrar: "Descubre su cielo",
    indicacion: "Toca una constelación para descubrir su historia",
    gestosTactil: "Desliza para girar el cielo · pellizca para acercar",
    gestosRaton: "Arrastra para girar el cielo · usa la rueda para acercar",
    gestosTeclado: "Tab para elegir una constelación · flechas para girar",
    volverCielo: "Volver al cielo",
    cerrarRecuerdo: "Seguir explorando",
    progreso: "{n} de {total} constelaciones descubiertas",
    antesDelFinal: "Mira lo que dibujan juntas",
    final: "Ahora lo sabes: tu papá sigue brillando en cada recuerdo",
    abrirCarta: "Abrir mi carta",
    leerCarta: "Leer la carta",
    repetir: "Volver a recorrer su cielo",
    contemplar: "Contemplar el cielo",
    vistaGeneral: "Ver todo el cielo",
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
    sin3d: "Tu navegador no puede mostrar el cielo en 3D, pero aquí están sus recuerdos."
  },

  /* Sonido (ver la explicación en las otras copias). La canción de la sorpresa
     tiene desdeElInicio: true, así que es la música de toda la experiencia. */
  musica: {
    habilitada: true,
    efectos: true,
    archivo: null,
    volumen: 0.5,
    campanillas: true,
    etiquetaActivar: "Activar música",
    etiquetaPausar: "Pausar música"
  },

  cielo: {
    semilla: 7,
    densidad: 1
  },

  /* Las cinco constelaciones, en el orden en que las une el camino final */
  constelaciones: [
    {
      id: "comienzo",
      nombre: "Una estrella más",
      forma: "La llave",
      color: "#ffb48c",
      escala: 1,
      estrellas: [[22, 30, 0.8], [8, 46, 0.65], [23, 61, 0.7], [37, 45, 1], [75, 46, 0.6], [93, 44, 0.75], [92, 59, 0.55], [76, 57, 0.5]],
      trazos: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6], [4, 7]],
      anillos: [],
      experiencia: {
        tipo: "encuentro",
        indicacion: "Dos estrellas que nunca se separan. Arrastra una hacia la otra",
        indicacionTeclado: "Pulsa Enter o Espacio para acercar sus estrellas",
        union: "Y aunque no lo veas, sigue a tu lado"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: "12 de noviembre de 2022",
        titulo: "Una estrella más en el cielo",
        mensaje: "El 12 de noviembre de 2022, en Ixtapaluca, llegó una estrella más al cielo. Desde ese día brilla un poco más fuerte, para que nunca te falte su luz.",
        // La llave abre una carta de su papá (sorpresa “cita” con parrafos: sin vale ni WhatsApp).
        sorpresa: {
          tipo: "cita",
          aviso: "Tu papá dejó algo para ti",
          pista: "Toca el candado para usar la llave",
          etiquetaCerradura: "Usar la llave para abrir la carta de tu papá",
          antetitulo: "Una carta de",
          titulo: "Papá",
          saludo: "Hija mía:",
          parrafos: [
            "Sé que ha sido difícil mi partida, que les ha costado aceptar que ya no estoy con ustedes, pero quiero que sepas que yo jamás las dejaré. Por toda la eternidad tendrán mi compañía y estaré viendo sus logros y errores, esperando que sean felices y tengan una vida plena.",
            "No estés triste, porque yo estoy feliz de ver la mujer tan valiente en la que te has convertido.",
            "Todas mis nietas también son lo mejor que me pudo pasar, y también estaré vigilante de ellas en toda su vida."
          ],
          firma: "Papá"
        }
      }
    },
    {
      id: "momento",
      nombre: "Su nombre en las estrellas",
      forma: "La cámara",
      color: "#ff93bd",
      escala: 1,
      estrellas: [[10, 41, 0.7], [29, 40, 0.6], [36, 27, 0.75], [57, 28, 0.7], [64, 40, 0.6], [90, 42, 0.85], [89, 80, 0.65], [11, 79, 0.7], [50, 60, 1]],
      trazos: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]],
      anillos: [{ estrella: 8, radio: 12 }],
      experiencia: {
        tipo: "revelado",
        indicacion: "Mantén presionado el cielo y deja que las estrellas escriban su nombre",
        indicacionTeclado: "Mantén presionada la barra espaciadora y deja que las estrellas escriban su nombre"
      },
      recuerdo: {
        // Sin fotos: el polvo de estrellas forma su nombre (una imagen hecha para este regalo).
        foto: "assets/fotos/su-nombre.jpg",
        textoAlternativo: "El nombre Evaristo Reyes Martínez escrito con luz dorada entre estrellas",
        fecha: "Escrito en el cielo",
        titulo: "Su nombre en las estrellas",
        mensaje: "Hay nombres que no se borran. El suyo está escrito en el cielo, en tu manera de reír, de cocinar y de salir adelante. Cada vez que lo digas, seguirá aquí."
      }
    },
    {
      id: "iluminas",
      nombre: "Lo que papá dejó en ti",
      forma: "El sol",
      color: "#ffd27a",
      escala: 1,
      estrellas: [[50, 50, 1], [50, 9, 0.7], [86, 29, 0.6], [83, 71, 0.65], [51, 91, 0.6], [16, 70, 0.7], [14, 31, 0.55]],
      trazos: [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]],
      anillos: [{ estrella: 0, radio: 13 }],
      experiencia: {
        tipo: "luces",
        indicacion: "Atrapa cada luz: cada una guarda algo que él te dejó",
        indicacionTeclado: "Usa Tab para elegir cada luz y Enter para atraparla",
        cierre: "Y todo lo que vive en ti sin que lo notes"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: null,
        titulo: "Lo que papá dejó en ti",
        mensaje: "Su luz sigue encendida en ti:",
        lista: [
          "Su valentía, que hoy es tuya.",
          "La fuerza para levantarte en los días difíciles.",
          "El cariño con el que cuidas a los tuyos.",
          "Su sazón y su alegría en cada mesa."
        ],
        // La canción con su letra. Suena desde el inicio y, al tocar el sol, se descubre cuál es.
        sorpresa: {
          tipo: "cancion",
          desdeElInicio: true,
          aviso: "Esta canción es para ti",
          pista: "Toca el sol para descubrirla y ver su letra",
          tituloOculto: "¿Ya sabes cuál es?",
          archivo: "assets/audio/hasta-la-raiz.mp3",
          titulo: "Hasta la raíz",
          artista: "Natalia Lafourcade",
          dedicatoria: "Porque lo llevas dentro, hasta la raíz",
          // Letra enviada por el cliente. Tiempos [mm:ss] sincronizados con Whisper (palabra por palabra); los "Ouh, oh" del final son aproximados.
          // desfaseLetra mueve todas las líneas a la vez (segundos; negativo = antes).
          idiomaOriginal: "es",
          desfaseLetra: 0,
          letra: `
[00:00.00]
[00:18.70]Sigo cruzando ríos, andando selvas, amando el Sol
[00:22.60]Cada día, sigo sacando espinas de lo profundo del corazón
[00:27.20]En la noche, sigo encendiendo sueños
[00:29.85]Para limpiar, con el humo sagrado, cada recuerdo
[00:37.35]Cuando escriba tu nombre en la arena blanca con fondo azul
[00:41.35]Cuando mire al cielo, en la forma cruel de una nube gris, aparezcas tú
[00:46.10]Una tarde, suba una alta loma, mire el pasado
[00:50.10]Sabrás que no te he olvidado
[00:55.05]Yo te llevo dentro, hasta la raíz
[01:00.15]Y por más que crezca, vas a estar aquí
[01:04.85]Aunque yo me oculte tras la montaña
[01:07.55]Y encuentre un campo lleno de caña
[01:09.85]No habrá manera, mi rayo de Luna
[01:12.20]Que tú te vayas
[01:16.50]Ouh, oh, uh, oh
[01:20.90]Oh, uh, oh, oh
[01:24.60]Ouh, oh, uh, oh
[01:28.40]Oh, uh, oh, oh
[01:36.35]Pienso que cada instante sobrevivido al caminar
[01:40.20]Y cada segundo de incertidumbre
[01:43.10]Cada momento de no saber
[01:44.85]Son la clave exacta de ese tejido
[01:47.40]Que ando cargando bajo la piel
[01:49.60]Así, te protejo
[01:51.90]Aquí, sigues dentro
[01:54.15]Yo te llevo dentro, hasta la raíz
[01:59.00]Y por más que crezca, vas a estar aquí
[02:03.50]Aunque yo me oculte tras la montaña
[02:06.35]Y encuentre un campo lleno de caña
[02:08.60]No habrá manera, mi rayo de Luna
[02:11.00]Que tú te vayas, que tú te vayas
[02:15.40]Yo te llevo dentro, hasta la raíz
[02:20.10]Y por más que crezca, vas a estar aquí
[02:24.80]Aunque yo me oculte tras la montaña
[02:27.55]Y encuentre un campo lleno de caña
[02:29.85]No habrá manera, mi rayo de Luna
[02:32.15]Que tú te vayas, que tú te vayas
[02:37.00]Ouh, oh, uh, oh (oh, uh, oh)
[02:41.60]Oh, uh, oh (oh, uh, oh)
[02:46.20]Ouh, oh, uh, oh (oh, uh, oh)
[02:50.80]Oh, uh, oh (oh, uh, oh)
[02:55.40]Ouh, oh, uh, oh (oh, uh, oh)
[03:00.00]Oh, uh, oh (oh, uh, oh)
[03:04.60]Ouh, oh, uh, oh (oh, uh, oh)
[03:09.20]Oh, uh, oh (oh, uh, oh)
[03:13.85]Yo te llevo dentro, hasta la raíz
[03:18.95]Y por más que crezca, vas a estar aquí
[03:23.70]Aunque yo me oculte tras la montaña
[03:26.35]Y encuentre un campo lleno de caña
[03:28.65]No habrá manera, mi rayo de Luna
[03:31.05]Que tú te vayas
[03:35.50]
`
        }
      }
    },
    {
      id: "recuerdos",
      nombre: "Recuerdos en la cocina",
      forma: "El avión de papel",
      color: "#8fc6ff",
      escala: 1,
      estrellas: [[94, 10, 0.95], [24, 40, 0.75], [54, 50, 0.85], [64, 80, 0.7], [31, 73, 0.5], [7, 93, 0.45]],
      trazos: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 0], [2, 4, "punteado"], [4, 5, "punteado"]],
      anillos: [],
      experiencia: {
        tipo: "deseos",
        indicacion: "Desliza hacia arriba para mandarle cada recuerdo al cielo",
        indicacionTeclado: "Pulsa Enter o Espacio para mandarle cada recuerdo al cielo",
        cierre: "Y todos los que guardas en el corazón"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: null,
        titulo: "Recuerdos en la cocina",
        mensaje: "Los días en que la casa olía a comida hecha con papá:",
        lista: [
          "El olor de la cocina cuando papá estaba frente a la estufa.",
          "Probar la comida antes de que estuviera lista.",
          "Las risas y las pláticas mientras preparaban todo juntos.",
          "Sentarse a la mesa a disfrutar lo que hicieron con sus manos."
        ]
      }
    },
    {
      id: "siempre",
      nombre: "Siempre contigo",
      forma: "El corazón",
      color: "#ff7096",
      escala: 1,
      estrellas: [[50, 31, 0.75], [30, 13, 0.7], [9, 29, 0.65], [21, 57, 0.6], [50, 87, 1], [79, 57, 0.6], [91, 29, 0.7], [70, 13, 0.65]],
      trazos: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]],
      anillos: [],
      experiencia: {
        tipo: "latido",
        indicacion: "Mantén presionado el corazón y siente que sigue latiendo contigo",
        indicacionTeclado: "Mantén presionada la barra espaciadora y siente que sigue latiendo contigo",
        cierre: "Su amor sigue latiendo en ti"
      },
      recuerdo: {
        foto: null,
        textoAlternativo: "",
        fecha: "Hoy y siempre",
        titulo: "Siempre contigo",
        mensaje: "Cuando mires al cielo, búscalo. No se fue: solo cambió de lugar, y desde ahí sigue cuidándote a ti y a los tuyos."
      },
      // El cielo real de Ixtapaluca la noche del 12 de noviembre de 2022 (se abre en lugar de la tarjeta).
      // La hora 22:00 es aproximada (a esa hora ya había salido la Luna): cámbiala si el cliente da otra.
      mapaEstelar: {
        lugar: "Ixtapaluca",
        latitud: 19.3186,
        longitud: -98.8822,
        altitud: 2250,
        fecha: "2022-11-12",
        hora: "22:00",
        zonaHoraria: -6,
        titulo: "El cielo del día que llegó una estrella más",
        nombres: ["Evaristo", "Erendira"],
        destacados: [
          {
            tipo: "planeta",
            objetivo: "Júpiter",
            titulo: "Júpiter",
            subtitulo: "La luz más brillante de esa noche",
            texto: "Brillaba casi en lo más alto del cielo, más fuerte que cualquier estrella. Como si esa noche el cielo le hubiera guardado el mejor lugar."
          },
          {
            tipo: "estrella",
            objetivo: "Estrella Polar",
            titulo: "Estrella Polar",
            subtitulo: "La que nunca se mueve",
            texto: "Mientras todo el cielo gira, ella se queda en el mismo lugar, al norte. Así es él: siempre ahí, aunque todo lo demás cambie."
          },
          {
            tipo: "planeta",
            objetivo: "Luna",
            titulo: "La Luna",
            subtitulo: "Mi rayo de Luna",
            texto: "Salió por el este pasadas las nueve y media de la noche, casi llena. “No habrá manera, mi rayo de Luna, que tú te vayas.”"
          },
          {
            tipo: "planeta",
            objetivo: "Marte",
            titulo: "Marte",
            subtitulo: "Una luz cálida en el este",
            texto: "Subía rojo y cálido junto a la Luna. Esas semanas brillaba más que nunca en todo el año, como una brasa que no se apaga."
          }
        ]
      }
    }
  ],

  /* La carta final, de su esposo */
  carta: {
    saludo: "Mi amor:",
    parrafos: [
      "Quise regalarte un cielo porque es el único lugar lo bastante grande para guardar a tu papá.",
      "El 12 de noviembre de 2022 llegó una estrella más al cielo de Ixtapaluca. Desde entonces sé que hay días que pesan, y quiero que sepas que no los cargas sola.",
      "Lo veo en ti todos los días: en tu valentía, en cómo cuidas a nuestra familia y en cada comida que preparas con el mismo cariño con el que él cocinaba en casa.",
      "Él no se fue del todo. Lo llevas dentro, hasta la raíz, y por más que pase el tiempo, va a estar aquí.",
      "Cada vez que mires al cielo, búscalo. Ahí está, brillando para ti."
    ],
    despedida: "Aquí estoy contigo, hoy y siempre. Con todo mi amor,",
    firma: "Tu esposo"
  }
};
