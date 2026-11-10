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
  destinatario: "Dina",
  remitente: "Victor",

  /* Textos generales */
  textos: {
    tituloPagina: "Nuestras estrellas",
    bienvenida: "Entre tantas estrellas, mi lugar favorito sigue siendo contigo",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Dina”
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
        fecha: "17 de septiembre de 2025",
        titulo: "Donde comenzó todo",
        mensaje: "El 17 de septiembre de 2025, en Tepeaca, nuestros caminos se cruzaron. No sabía que ese día estaba abriendo una puerta que ya nunca quise cerrar.",
        // La llave abre el cupón que pidió el cliente (imagen: assets/fotos/cupon.jpg)
        // y se reclama por WhatsApp.
        // whatsapp: el número con lada del país y sin espacios (52 es México).
        sorpresa: {
          tipo: "cita",
          aviso: "La llave abrió algo para ti",
          pista: "Toca el candado para usar la llave",
          folio: "Nº 0917",
          antetitulo: "Un cupón",
          titulo: "Para ti",
          imagen: "assets/fotos/cupon.jpg",
          textoAlternativoImagen: "Un corazón hecho con nuestras fotos juntos y la palabra always",
          detalle: "Es tuyo para siempre. Reclámalo cuando quieras.",
          admite: "Admite: tú y yo",
          vigencia: "Válido para siempre",
          boton: "Reclamar mi cupón",
          whatsapp: "522231198475",
          mensajeWhatsapp: "Hola, Victor ✨ Abrí la llave de nuestras estrellas y vengo a reclamar mi cupón.",
          nota: "Si WhatsApp no se abre, escríbele al +52 223 119 8475"
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
          { foto: "assets/fotos/el-beso.jpg", pie: "Un beso que me sigue sonrojando", enfoque: "45% 50%",
            textoAlternativo: "Un beso en la mejilla, muy de cerca, mientras ella sonríe" },
          { foto: "assets/fotos/juntos.jpg", pie: "Tú y yo, siempre así", enfoque: "62% 50%",
            textoAlternativo: "Una selfie de los dos juntos, mejilla con mejilla, con corazones rosas" },
          { foto: "assets/fotos/el-abrazo.jpg", pie: "Hasta en clase, abrazados", enfoque: "50% 35%",
            textoAlternativo: "Un abrazo en el salón de clases, con uniforme y plumones de colores" },
          { foto: "assets/fotos/bajo-el-arbol.jpg", pie: "Flores para ti bajo nuestro árbol", enfoque: "70% 50%",
            textoAlternativo: "Bajo un árbol, poniendo margaritas en el cabello" },
          { foto: "assets/fotos/margaritas.jpg", pie: "Margaritas y sol", enfoque: "80% 40%",
            textoAlternativo: "Una sonrisa con el sol de la tarde y pequeñas flores en el cabello" },
          { foto: "assets/fotos/esa-mirada.jpg", pie: "Esa mirada que me encanta", enfoque: "55% 50%",
            textoAlternativo: "Una selfie de cerca con una paleta en la boca" }
        ],
        fecha: "Desde el 17 de septiembre de 2025",
        titulo: "Todos nuestros momentos",
        mensaje: "Cada foto guarda una risa, un abrazo o una tarde de sol. Si pudiera, viviría cada uno otra vez contigo."
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
          "Las ganas de intentarlo una vez más.",
          "La calma, incluso en los días ruidosos.",
          "Una risa que no sabía que tenía.",
          "El valor de decir lo que siento."
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
          archivo: "assets/audio/eres.mp3",
          titulo: "Eres",
          artista: "Café Tacvba",
          dedicatoria: "Porque eso eres: lo que más quiero en este mundo",
          // Letra enviada por el cliente. Los tiempos [mm:ss] son aproximados (calculados
          // a partir del audio, sin cotejo línea por línea): ajústalos escuchando el MP3.
          // desfaseLetra mueve todas las líneas a la vez (segundos; negativo = antes).
          idiomaOriginal: "es",
          desfaseLetra: 0,
          letra: `
[00:00.00]
[00:29.00]Eres
[00:31.00]Lo que más quiero en este mundo, eso eres
[00:37.00]Mi pensamiento más profundo también eres
[00:43.00]Tan sólo dime lo que hago, aquí me tienes
[00:50.00]Eres
[00:52.00]Cuando despierto, lo primero, eso eres
[00:58.00]Lo que a mi vida le hace falta si no vienes
[01:04.00]Lo único, preciosa, que en mi mente habita hoy
[01:19.00]¿Qué más puedo decirte?
[01:23.00]Tal vez puedo mentirte sin razón
[01:27.00]Pero lo que hoy siento
[01:31.00]Es que sin ti estoy muerto, pues eres
[01:35.00]Lo que más quiero en este mundo, eso eres
[01:42.00]
[02:23.00]Eres
[02:25.00]El tiempo que comparto, eso eres
[02:31.00]Lo que la gente promete cuando se quiere
[02:37.00]Mi salvación, mi esperanza y mi fe
[02:44.00]Soy
[02:46.00]El que quererte quiere como nadie, soy
[02:52.00]El que te llevaría el sustento día a día, día a día
[02:58.00]El que por ti daría la vida, ese soy
[03:05.00]Aquí estoy a tu lado
[03:09.00]Y espero aquí sentado hasta el final
[03:13.00]No te has imaginado
[03:17.00]Lo que por ti he esperado, pues eres
[03:21.00]Lo que yo amo en este mundo, eso eres
[03:28.00]Cada minuto en lo que pienso, eso eres
[03:35.00]Lo que más cuido en este mundo eso eres
[03:44.00]
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
          "Tener una familia juntos.",
          "Viajar a un lugar lleno de vegetación, verde hasta donde alcance la vista.",
          "Abrir nuestro propio restaurante."
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
      // El cielo real de Tepeaca la noche del 17 de septiembre de 2025 (se abre en lugar de la tarjeta)
      // La hora 21:00 es aproximada: cámbiala si el cliente da la hora real.
      mapaEstelar: {
        lugar: "Tepeaca, Puebla",
        latitud: 18.9653,
        longitud: -97.9008,
        altitud: 2250,
        fecha: "2025-09-17",
        hora: "21:00",
        zonaHoraria: -6,
        titulo: "El cielo de nuestro día",
        destacados: [
          {
            tipo: "planeta",
            objetivo: "Saturno",
            titulo: "Saturno",
            subtitulo: "El planeta de los anillos",
            texto: "Subía brillante por el este. Cuatro noches después estuvo en su punto más cercano y luminoso de todo el año."
          },
          {
            tipo: "pareja",
            objetivo: ["Vega", "Altair"],
            titulo: "Vega y Altair",
            subtitulo: "Los enamorados",
            texto: "Una leyenda cuenta que son dos enamorados separados por la Vía Láctea que se encuentran una noche al año. Esa noche brillaban casi encima de Tepeaca."
          },
          {
            tipo: "via-lactea",
            objetivo: "centro-galactico",
            constelaciones: ["Sgr", "Sco"],
            titulo: "Vía Láctea",
            subtitulo: "Nuestra galaxia",
            texto: "Su centro brillaba al suroeste, entre Sagitario y el Escorpión, cruzando el cielo de lado a lado."
          },
          {
            tipo: "estrella",
            objetivo: "Antares",
            titulo: "Antares",
            subtitulo: "El corazón del Escorpión",
            texto: "Rojiza y encendida, se iba despidiendo por el suroeste: esa noche el cielo también tenía corazón."
          }
        ]
      }
    }
  ],

  /* La carta final */
  carta: {
    saludo: "Mi Dina:",
    parrafos: [
      "Quise regalarte un cielo porque es lo único lo bastante grande para guardar todo lo que siento por ti.",
      "Desde el 17 de septiembre de 2025, cada día a tu lado se volvió una estrella más: los abrazos en el salón, las flores en tu cabello, nuestras fotos tontas y esas risas que nadie más entiende.",
      "Cuando escucho nuestra canción pienso en ti, porque eso eres: lo que más quiero en este mundo, lo primero en lo que pienso al despertar y lo que más cuido.",
      "Y lo mejor todavía no llega. Quiero formar una familia contigo, perdernos en un viaje a un lugar lleno de verde y abrir juntos ese restaurante con el que soñamos.",
      "Gracias por elegirme y por llenar mis días de luz. Este es solo el primer mapa: todavía nos quedan muchas constelaciones por dibujar."
    ],
    despedida: "Te amo, hoy y siempre,",
    firma: "Victor"
  }
};
