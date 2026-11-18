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
  destinatario: "Melimelon",
  remitente: "Freddy",

  /* Textos generales */
  textos: {
    tituloPagina: "Nuestras estrellas",
    bienvenida: "Si solo tuviera un día, lo pasaría contigo. Por eso dibujé este cielo para ti",
    dedicatoriaBienvenida: "Para", // se muestra como “Para Melimelon”
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
     - Si la canción de una sorpresa tiene desdeElInicio: true (como “Just One Day”),
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
        fecha: "8 de octubre de 2024",
        titulo: "El día que empezó lo nuestro",
        mensaje: "El 8 de octubre de 2024 empezó nuestra historia. Desde ese día, Toluca se volvió un lugar distinto: cada calle, cada tarde fría y cada noche tienen algo de ti.",
        // La llave abre un vale por una cita; se reclama por WhatsApp con Freddy.
        // whatsapp: el número con lada del país y sin espacios (52 es México).
        sorpresa: {
          tipo: "cita",
          aviso: "La llave abrió algo para ti",
          pista: "Toca el candado para usar la llave",
          folio: "Nº 0810",
          antetitulo: "Vale por",
          titulo: "Una cita",
          detalle: "Tú eliges el día y el lugar. Yo me encargo de todo lo demás.",
          admite: "Admite: tú y yo",
          vigencia: "Válido para siempre",
          boton: "Reclamar por WhatsApp",
          whatsapp: "527223892908",
          mensajeWhatsapp: "Hola, Freddy ✨ Abrí la llave de nuestras estrellas y vengo a reclamar mi cita.",
          nota: "Si WhatsApp no se abre, escríbele al +52 722 389 2908"
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
          { foto: "assets/fotos/tu-y-yo.jpg", pie: "Tú y yo", enfoque: "50% 25%",
            textoAlternativo: "Los dos juntos en un evento: ella con lentes, vestido verde y suéter claro; él con traje gris y corbata" },
          { foto: "assets/fotos/tu-logro.jpg", pie: "Orgulloso de ti", enfoque: "50% 35%",
            textoAlternativo: "Ella sonriendo frente a un muro de ladrillo, sosteniendo su constancia de capacitación en un marco" },
          { foto: "assets/fotos/tu-mirada.jpg", pie: "Tu mirada", enfoque: "50% 45%",
            textoAlternativo: "Selfie de ella con lentes y audífonos blancos, con el cielo azul y nubes detrás" },
          { foto: "assets/fotos/esos-ojos.jpg", pie: "Esos ojos", enfoque: "50% 70%",
            textoAlternativo: "Acercamiento a sus ojos cafés, con el cabello rojizo iluminado por el sol" },
          { foto: "assets/fotos/de-rojo.jpg", pie: "Una obra maestra", enfoque: "50% 45%",
            textoAlternativo: "Ella frente al espejo con lentes, labios rojos y blusa negra, tomándose una foto con su celular" },
          { foto: "assets/fotos/en-blanco-y-negro.jpg", pie: "Tu existencia es arte", enfoque: "50% 50%",
            textoAlternativo: "Foto en blanco y negro de ella sentada frente al espejo, con vestido negro y el celular cubriéndole la cara" }
        ],
        fecha: "Desde el 8 de octubre de 2024",
        titulo: "Todos nuestros momentos",
        mensaje: "Tu mirada, tu sonrisa, tus logros y hasta tus fotos frente al espejo: todo lo tuyo me parece arte. Como dice nuestra canción, solo tu existencia ya es una obra maestra."
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
          "Las ganas de que cada día se parezca a un día contigo.",
          "La sonrisa que se me escapa cuando dices mi nombre.",
          "El orgullo que siento cada vez que logras algo nuevo.",
          "La calma de saber que, pase lo que pase, estamos juntos."
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
          archivo: "assets/audio/just-one-day.mp3",
          titulo: "Just One Day",
          artista: "BTS",
          dedicatoria: "Porque si solo tuviera un día, lo pasaría contigo",
          // Letra enviada por el cliente; tiempos [mm:ss] sincronizados con Whisper (medium) sobre este MP3. Coreano (botón "Original") y su traducción al español (mismos tiempos),
          // que se muestra primero.
          // desfaseLetra mueve todas las líneas a la vez (segundos; negativo = antes).
          idiomaOriginal: "ko",
          desfaseLetra: 0,
          letra: `
[00:00.00]
[00:04.86]Yeah (yeah)
[00:05.90]Yeah, just one day, one night
[00:10.02]하루만 내게 시간이 있다면
[00:12.12]달콤한 네 향기에 취해서 곤히 난 잠들고파
[00:15.04]빡빡한 스케줄 사이에 기회가 있다면
[00:17.68]따스하고 깊은 눈 안에 몸 담그고파
[00:20.10]I like that 너의 그 길고 긴 생머리
[00:22.24]올려 묶을 때의 아찔한 목선과 흘러내린 잔머리
[00:25.30]서로 같이 어딜 가든 내 핸드백은 니 허리
[00:27.92]Yo, ma honey
[00:28.50]볼 때마다 숨이 막혀 명동 거리처럼
[00:30.76]우리의 BGM은 숨소리
[00:32.78]내 이름을 불러줄 때의 니 목소리에
[00:35.50]잠겨서 난 수영하고파 너를 좀 더 알고파
[00:38.30]너란 미지의 숲을 깊이 모험하는 탐험가
[00:41.54]너란 작품에 대해 감상을 해
[00:43.52]너란 존재가 예술이니까
[00:45.38]이렇게 매일 난 밤새도록 상상을 해
[00:47.72]어차피 내게는 무의미한 꿈이니까
[00:50.28]하루만 너와 내가 함께할 수 있다면
[00:54.98]하루만 너와 내가 손잡을 수 있다면
[01:00.32]하루만 너와 내가 함께할 수 있다면
[01:05.18]하루만 (하루만)
[01:06.72]너와 내가 함께할 수 있다면
[01:11.23](Do it, do it, do it)
[01:12.98]너와 하루만 있기를 바래 바래
[01:16.27](Do it, do it, do it)
[01:18.30]너와 단둘이 보내는 party, party
[01:21.29](Do it, do it, do it)
[01:22.97]너와 하루만 있기를 바래 바래
[01:26.36](Do it, do it, do it)
[01:27.93]너와 단 둘이 보내는 party, party
[01:31.29]그럴 수 있다면 얼마나 좋을까
[01:33.77]아무 데나 가서 밥 먹고 영화
[01:36.21]한 편만 볼 수만 있다면
[01:38.27]나란 애 정말 뭔 짓이라도 할 텐데 girl
[01:41.65]I'm sorry 내 머리가 넘 이성적인가 봐
[01:44.77]그래도 언젠가 보면 웃어줘
[01:46.69]조금은 아니 어쩌면 많이 날 원망하겠지
[01:49.73]알아 내 꿈 때문에 널 더 바라보지 못해서
[01:51.47]그럼 내게 하루만 줘 꿈 속이라도 하루만
[01:54.09]현실을 핑계 대며 삼켜야 했던 그 수많은 말
[01:56.61]중에서 딱 한 마디만 제대로 할 수 있게
[01:58.93]그래 나팔꽃이 필 때 만나 헤어지자 꽃이 질 때
[02:01.71]쉽게 잊혀질 거라 생각 안 했지만
[02:03.81]너에게 난 그랬음 좋겠다면 이기적일까
[02:06.29]널 위해서라며 아직 난 거짓말하고 있어
[02:09.51]넌 내 한가운데 서 있어
[02:11.17]하루만 너와 내가 함께할 수 있다면
[02:15.83]하루만 너와 내가 손잡을 수 있다면
[02:21.01]하루만 너와 내가 함께할 수 있다면
[02:25.99]하루만 하루만
[02:27.55]Ayy 너와 내가 함께 하고 있다면 let's go time
[02:31.91]24 hours 너와 단둘이
[02:34.25]있다면 아침부터 입맞춤 해
[02:36.67]빠질 수 없는 브런치도 한 입 해
[02:39.23]손잡고 너와 햇빛에 몸 담그네
[02:41.65]안 끝내 아름다운 밤중에
[02:44.13]너에게 고백해 조명은 달로 해
[02:46.73]이 수 많은 일들이 내게 말을 해
[02:49.45]단 하루만 있으면 가능해
[02:54.01]하루만 너와 내가 함께할 수 있다면
[02:58.99]하루만 너와 내가 손잡을 수 있다면
[03:03.97]하루만 너와 내가 함께할 수 있다면
[03:08.97]하루만 (하루만)
[03:11.75]너와 내가 함께할 수 있다면
[03:14.98](Do it, do it, do it)
[03:16.43]너와 하루만 있기를 바래 바래
[03:20.12](Do it, do it, do it)
[03:21.21]너와 단둘이 보내는 party, party
[03:25.04](Do it, do it, do it)
[03:26.33]너와 하루만 있기를 바래 바래
[03:30.12](Do it, do it, do it)
[03:31.29]너와 단둘이 보내는 party, party
[03:34.51]하루만 너와 내가 함께할 수 있다면
[03:39.23]하루만 너와 내가 손잡을 수 있다면
[03:44.51]하루만 너와 내가 함께할 수 있다면
[03:49.39]하루만 (하루만)
[03:52.21]너와 내가 함께할 수 있다면
[03:57.00]Can you please stay with me?
[03:59.50]
`,
          letraTraducida: `
[00:00.00]
[00:04.86]Sí (sí)
[00:05.90]Sí, solo un día, una noche
[00:10.02]Es todo lo que desearía si solo tuviera un día
[00:12.12]Ojalá pudiera dormir tranquilo, intoxicado con tu dulce esencia
[00:15.04]Si tuviera una oportunidad en mi apretada agenda
[00:17.68]Quería sentir tu calor y tus ojos profundos
[00:20.10]Me gusta eso, tu pelo largo y liso
[00:22.24]Tu cuello me quita el aliento, cuando pinzas tu cabello y se caen los mechones
[00:25.30]Dondequiera que vayamos, descanso mi mano en tu cintura
[00:27.92]Oye, cariño
[00:28.50]Cada vez que te veo, me quedo sin aliento como las calles de Myungdong
[00:30.76]Nuestra música de fondo es el sonido de tu respiración
[00:32.78]Tu voz cuando dices mi nombre
[00:35.50]Estoy atrapado en ti, quiero nadar en ti, quiero conocerte mejor
[00:38.30]Soy como un explorador que se adentra en el gran bosque misterioso que eres tú
[00:41.54]Eres una obra maestra
[00:43.52]Porque solo tu existencia es arte
[00:45.38]Lo imagino todas las noches, todos los días
[00:47.72]Porque, de todas formas, es un sueño inalcanzable para mí
[00:50.28]Solo un día, si pudiera quedarme contigo
[00:54.98]Solo un día, si pudiera tomar tus manos
[01:00.32]Solo un día, si pudiera quedarme contigo
[01:05.18]Solo un día (solo un día)
[01:06.72]Si tan solo pudiéramos estar juntos
[01:11.23](¡Hazlo, hazlo, hazlo!)
[01:12.98]Espero poder estar contigo solo un día
[01:16.27](¡Hazlo, hazlo, hazlo!)
[01:18.30]Tener una fiesta, fiesta solo contigo
[01:21.29](¡Hazlo, hazlo, hazlo!)
[01:22.97]Espero poder estar contigo solo un día
[01:26.36](¡Hazlo, hazlo, hazlo!)
[01:27.93]Hacer una fiesta, fiesta solo contigo
[01:31.29]Si pudiera hacer todo esto, sería genial
[01:33.77]Si pudiéramos ir a cualquier parte
[01:36.21]Para comer y ver una película cómodamente
[01:38.27]Haría cualquier cosa, chica
[01:41.65]Lo siento, tal vez estoy siendo demasiado irracional
[01:44.77]Pero, aún así, si alguna vez me ves, sonríe
[01:46.69]Tal vez puedas resentirme un poco o mucho
[01:49.73]Sé que te dejé atrás por mi sueño
[01:51.47]Así que dame solo un día más, incluso si es un sueño, solo un día más
[01:54.09]De todas las palabras que tuve que tragar por la realidad
[01:56.61]Elegiré una y definitivamente te la diré
[01:58.93]Encontrémonos donde florecen los lirios y digamos adiós mientras se marchitan
[02:01.71]No creo que te olvide tan fácilmente, pero
[02:03.81]¿Soy egoísta al esperar que sigas igual?
[02:06.29]Sigo mintiendo, diciendo que es todo para ti
[02:09.51]Tú estas en el centro de mi vida
[02:11.17]Solo un día, si pudiera quedarme contigo
[02:15.83]Solo un día, si pudiera tomar tus manos
[02:21.01]Solo un día, si pudiera quedarme contigo
[02:25.99]Solo un día (solo un día)
[02:27.55]Si tú y yo estamos juntos solo un día, vamos
[02:31.91]24 horas, si pudiera estar contigo
[02:34.25]Te daría un beso temprano en la mañana
[02:36.67]No puedo olvidar traer un desayuno
[02:39.23]Tomaré tu mano y tomaremos el sol
[02:41.65]Aún no ha terminado, en medio de la noche hermosa
[02:44.13]Te confesaré con la luna de testigo
[02:46.73]Todo esto solo si me dices
[02:49.45]Si solo fuera por un día, sería posible
[02:54.01]Solo un día, si pudiera quedarme contigo
[02:58.99]Solo un día, si pudiera tomar tus manos
[03:03.97]Solo un día, si pudiera quedarme contigo
[03:08.97]Solo un día (solo un día)
[03:11.75]Si tan solo pudiéramos estar juntos
[03:14.98](¡Hazlo, hazlo, hazlo!)
[03:16.43]Espero poder estar contigo solo un día
[03:20.12](¡Hazlo, hazlo, hazlo!)
[03:21.21]Tener una fiesta, fiesta solo contigo
[03:25.04](¡Hazlo, hazlo, hazlo!)
[03:26.33]Espero poder estar contigo solo un día
[03:30.12](¡Hazlo, hazlo, hazlo!)
[03:31.29]Hacer una fiesta, fiesta solo contigo
[03:34.51]Solo un día, si pudiera quedarme contigo
[03:39.23]Solo un día, si pudiera tomar tus manos
[03:44.51]Solo un día, si pudiera quedarme contigo
[03:49.39]Solo un día (solo un día)
[03:52.21]Si tan solo pudiéramos estar juntos
[03:57.00]¿Puedes quedarte conmigo por favor?
[03:59.50]
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
          "Celebrar nuestro tercer aniversario el 8 de octubre de 2027, y cada uno de los que vengan.",
          "Regalarnos un día entero, como en la canción: desayuno juntos, una tarde al sol y la luna de testigo en la noche.",
          "Subir juntos al Nevado de Toluca y ver las lagunas del Sol y de la Luna.",
          "Ayudarte a armar tu propio rincón de uñas, y ser tu cliente más fiel.",
          "Ahorrar un poquito cada mes para ir juntos a un concierto de BTS."
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
        mensaje: "Podría recorrer mil cielos distintos y en cada uno te buscaría a ti. Así se veía el cielo de Toluca la noche del 8 de octubre de 2024."
      },
      // El cielo real de Toluca, Estado de México, la noche del 8 de octubre de 2024 (se abre en lugar de la tarjeta).
      // México centro: UTC-6 (sin horario de verano). El sol se puso a las 18:20;
      // la hora 20:00 es aproximada (cielo ya oscuro): cámbiala si el cliente da la hora real.
      mapaEstelar: {
        lugar: "Toluca, Estado de México",
        latitud: 19.2826,
        longitud: -99.6557,
        altitud: 2660,
        fecha: "2024-10-08",
        hora: "20:00",
        zonaHoraria: -6,
        titulo: "El cielo del día en que empezó lo nuestro",
        destacados: [
          {
            tipo: "planeta",
            objetivo: ["Luna", "Antares"],
            titulo: "La Luna y Antares",
            subtitulo: "Juntas al suroeste",
            texto: "Esa noche una Luna creciente se acercó a Antares, la estrella roja del corazón del Escorpión. Como en la canción: la luna de testigo."
          },
          {
            tipo: "planeta",
            objetivo: "Saturno",
            titulo: "Saturno",
            subtitulo: "Brillando al sureste",
            texto: "Un mes antes había tenido su mejor noche del año, y todavía brillaba fuerte y tranquilo. Así quiero que brille lo nuestro: constante."
          },
          {
            tipo: "pareja",
            objetivo: ["Vega", "Altair"],
            constelaciones: ["Lyr", "Aql"],
            titulo: "Vega y Altair",
            subtitulo: "Los enamorados del cielo",
            texto: "Cuenta la leyenda que son dos enamorados separados por la Vía Láctea que solo pueden verse un día al año. Esa noche estaban muy alto, casi sobre Toluca. Yo no quiero solo un día contigo: los quiero todos."
          },
          {
            tipo: "estrella",
            objetivo: "Fomalhaut",
            titulo: "Fomalhaut",
            subtitulo: "La estrella del otoño",
            texto: "Sola y brillante en la parte baja del cielo, al sureste. Así se ve todo cuando tú no estás, y así de fácil te encuentro entre todas."
          }
        ]
      }
    }
  ],

  /* La carta final */
  carta: {
    saludo: "Melimelon:",
    parrafos: [
      "Quise regalarte un cielo porque es lo único lo bastante grande para guardar todo lo que siento por ti.",
      "Desde el 8 de octubre de 2024 mi vida se acomodó distinto. Ya no imagino mis días sin tus mensajes, sin tu risa y sin la forma en que me miras.",
      "Me gusta todo de ti: tu cabello, tus lentes, tus ojos cuando les da el sol y lo seria que te pones cuando algo te importa. Te he visto esforzarte y lograr tus metas, y no sabes lo orgulloso que estoy de ti.",
      "Hay una canción que dice que si solo tuviera un día, lo pasaría contigo. Yo pienso lo mismo, pero no me alcanza con uno: quiero todos los que vengan.",
      "Gracias por elegirme, por tu paciencia y por cada momento juntos. Te amo, Melimelon. Tú estás en el centro de mi vida."
    ],
    despedida: "Con todo mi amor,",
    firma: "Freddy"
  }
};
