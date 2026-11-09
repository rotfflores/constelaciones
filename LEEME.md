# Nuestras estrellas · Rotf Studio

Un regalo interactivo en 3D: un universo con una galaxia en espiral que se gira con el dedo. A su alrededor flotan cinco constelaciones, y cada una guarda un recuerdo que se abre con un momento interactivo distinto. Al descubrirlas todas, un cometa revela que juntas dibujan un corazón y el nombre de quien recibe el regalo se escribe con estrellas.

## Cómo abrirlo

Haz doble clic en `index.html`. Funciona sin internet y sin instalar nada: el motor 3D (three.js) y las fuentes van incluidos en la carpeta.
Para publicarlo, sube la carpeta completa a cualquier hosting estático (Netlify, Vercel, GitHub Pages o tu servidor).
Está publicado con GitHub Pages en https://rotfflores.github.io/constelaciones/ (repositorio `rotfflores/constelaciones`, rama `main`): cada cambio que se sube a `main` se publica solo en uno o dos minutos. La vista previa al compartir usa `assets/imagen-compartir.jpg` (1200 × 630) y los metadatos Open Graph/Twitter de `index.html`, que ya apuntan a esa URL absoluta. Si lo mueves a otro dominio, cambia `og:url`, `og:image` y `twitter:image`. Los archivos CSS y JS se cargan con `?v=20261109` en `index.html`: cuando cambies alguno, cambia ese número en todas las líneas para que los navegadores no mezclen archivos guardados de una versión anterior.

## El recorrido

1. **Bienvenida:** la galaxia gira despacio detrás del mensaje. Al tocar “Descubre nuestro cielo”, la cámara vuela hacia el universo y las cinco constelaciones se encienden una a una.
2. **Explorar:** se arrastra para girar el universo (con inercia), se pellizca para acercar y se toca una constelación para abrirla. En computadora: arrastrar con el ratón, rueda o botones + y −.
3. **Cinco momentos, uno por recuerdo:**
   - **Encuentro** (Donde comenzó todo): dos estrellas con sus nombres. Al arrastrar una hacia la otra se atraen, se funden en un destello y aparece “Y entonces, nos encontramos”.
   - **Revelado** (Nuestro momento favorito): al mantener presionado, el polvo de estrellas forma un marco y la foto se revela dentro, como en un cuarto oscuro.
   - **Luces** (Lo que iluminas en mí): luces que orbitan el sol; cada una que se atrapa vuela hacia el centro, enciende un rayo y muestra una frase de la lista.
   - **Deseos** (Todo lo que nos espera): al deslizar hacia arriba se lanza cada deseo desde un farol; viaja por el cielo y se convierte en una estrella del avión de papel.
   - **Latido** (Siempre tú): al mantener presionado, un corazón de polvo de estrellas late y se forma con cada latido (con vibración en Android).
   Después de cada momento la tarjeta llega de espaldas y se voltea, con un marco dorado que gira, esquinas de astrolabio y un brillo que sigue al dedo o al cursor. Los recuerdos sin foto muestran arriba su constelación en 3D (se enciende estrella por estrella y se puede girar con el dedo o el ratón). No hay atajo: cada recuerdo se abre haciendo su actividad.
   - **Nuestro momento favorito** trae una galería de fotos instantáneas: se deslizan con el dedo como un mazo de cartas, cada foto se revela como una instantánea al llegar arriba y el fondo de la tarjeta toma sus colores.
   - **Donde comenzó todo** guarda un candado: al tocarlo, la llave entra, gira y se abre un vale por una cita que se reclama por WhatsApp.
   - **Lo que iluminas en mí** guarda un sol. La canción ya suena desde el inicio, y al tocar el sol se descubre cuál es: aparece en un disco que gira y su letra se ilumina línea por línea. Después, al cerrar la tarjeta, la línea que suena se sigue viendo mientras se explora el cielo.
   - **Siempre tú** no abre una tarjeta: al terminar el latido se abre **el cielo de nuestro día**, el cielo real de Durango la noche del 21 de junio de 2025, como un cartel en 3D (ver “Mapa estelar”).
4. **Final:** la cámara se aleja, un cometa une las cinco constelaciones y dibuja un corazón, su nombre se escribe con estrellas, aparece “Ahora lo sabes: cada recuerdo contigo tiene su lugar en mi universo” y se abre la carta con la firma escribiéndose sola. Desde ahí se puede contemplar el universo o volver a recorrerlo.

## Cómo personalizarlo

Todo se edita en **`js/configuracion.js`**:

| Qué | Dónde |
| --- | --- |
| Nombre de quien recibe y de quien envía | `destinatario`, `remitente` |
| Frases de la bienvenida, ayudas, botones y final | `textos` |
| Nombre, forma y color de cada constelación | `constelaciones[].nombre`, `forma`, `color` |
| Momento interactivo de cada constelación | `constelaciones[].experiencia` |
| Fotografía, fecha, título y mensaje de cada recuerdo | `constelaciones[].recuerdo` |
| Galería de fotos de un recuerdo | `recuerdo.fotos` |
| Cita por WhatsApp o canción con letra | `recuerdo.sorpresa` |
| Mapa estelar de un lugar y una fecha | `constelaciones[].mapaEstelar` |
| Frases de las luces y de los deseos | `recuerdo.lista` |
| Carta final y firma | `carta` |
| Efectos de sonido y música | `musica` |
| Otra galaxia y otras estrellas | `cielo.semilla`; `cielo.densidad` (0.7 aligera el cielo) |

### Momentos interactivos
`experiencia.tipo` puede ser `"encuentro"`, `"revelado"`, `"luces"`, `"deseos"` o `"latido"`, y cualquier tipo sirve en cualquier constelación.
- `indicacion` es la instrucción que se ve en pantalla; `indicacionTeclado` la que se ve al usar el teclado.
- `union` (encuentro) y `cierre` (luces, deseos, latido) son la frase grande que aparece al terminar.
- En **encuentro**, las estrellas llevan los nombres de `destinatario` y `remitente`.
- **Luces** y **deseos** toman sus frases de `recuerdo.lista` (luces: hasta 6; deseos: tantos como estrellas tenga la constelación).
- **Revelado** usa la primera foto de `recuerdo.fotos` (o `recuerdo.foto`). Publicada en internet, el polvo de estrellas forma la foto misma; abierta con doble clic, el navegador no deja leer la imagen, así que el polvo forma el marco y la foto se revela dentro.

### Fotografías y galería
Copia las fotos en `assets/fotos/` (jpg o webp, idealmente 1400 px de ancho y menos de 400 KB).
- **Una sola foto:** escribe su ruta en `recuerdo.foto`, por ejemplo `"assets/fotos/playa.jpg"`, y descríbela en `textoAlternativo`. Usa `null` si un recuerdo no lleva foto.
- **Galería:** usa `recuerdo.fotos`, una lista con tantas fotos como quieras. Cada una lleva `foto` (la ruta), `pie` (lo que va escrito a mano debajo), `textoAlternativo` (la descripción) y, si hace falta, `enfoque`, que elige qué parte de la foto se ve en el cuadro (`"50% 50%"` es el centro; `"80% 50%"` muestra más el lado derecho). Se pasa de foto deslizando con el dedo, tocando la foto o con las flechas.
- Las seis fotos incluidas son de ejemplo (de Unsplash, uso libre; los créditos están al final): cámbialas por fotos suyas.

### Sorpresas
`recuerdo.sorpresa` agrega algo que se desbloquea dentro de la tarjeta. Si la sorpresa queda más abajo, un aviso invita a bajar.
- **Cita** (`tipo: "cita"`): un candado con su llave. Al abrirlo aparece un vale dorado con `antetitulo`, `titulo`, `detalle`, `admite`, `vigencia` y `folio`. El botón abre WhatsApp con el mensaje `mensajeWhatsapp` escrito y dirigido a `whatsapp`: el número con la lada del país y sin espacios ni signos (México: `52` + los 10 dígitos, por ejemplo `"526182051723"`). `nota` es el texto de respaldo por si WhatsApp no abre.
- **Canción** (`tipo: "cancion"`): un sol que, al tocarlo, se convierte en un disco que suena. Copia el archivo en `assets/audio/` y escribe su ruta en `archivo`; `titulo` y `artista` aparecen al desbloquearla, y `tituloOculto` antes.
  - Con `desdeElInicio: true`, la canción suena desde el primer toque en la página y se repite mientras ella recorre el cielo (`repetir: false` la deja sonar una sola vez). Los navegadores no dejan que una página suene antes de que la persona la toque, así que en la práctica empieza con “Descubre nuestro cielo”. Durante cada momento interactivo baja un poco, para que se oigan sus sonidos, y el sol ya no la inicia: la descubre y muestra su letra.
  - La letra va en `letra`, una línea por renglón:
    - Con tiempos al inicio de cada línea, como `[01:05.20]` (formato LRC, el que usan las apps de letras), cada línea se ilumina justo cuando se canta.
    - Sin tiempos, las líneas se reparten solas a lo largo de la canción; `inicioLetra` y `finLetra` (en segundos) ajustan dónde empieza y dónde termina.
    - Ya se incluye la letra de “A Sky Full of Stars” compartida por el usuario y su traducción al español. Ambas tienen 21 líneas cantadas y las mismas pausas instrumentales.
    - Los tiempos toman como referencia la edición de radio ([fuente de marcas LRC](https://www.lyricdown.com/lrc/coldplay-a-sky-full-of-stars-radio-edit-1978450)); queda pendiente verificar de oído su coincidencia con el MP3 local de 3:59.
    - `letraTraducida` permite añadir la versión en español con sus marcas LRC, o una línea por cada línea del original para heredar sus tiempos. Cuando hay ambas versiones, aparecen los botones Original / Español y se muestra español por defecto.
    - `desfaseLetra` ajusta ambas versiones en segundos (positivo retrasa, negativo adelanta). Para sincronización precisa usa marcas LRC; repartir líneas sin tiempos solo es aproximado.

### Mapa estelar
`mapaEstelar` hace que una constelación (hoy, “Siempre tú”) abra el cielo real de una noche en lugar de la tarjeta.
- **Cómo se ve:** primero aparece un cuenco de cielo al anochecer; las estrellas llegan volando, se trazan las constelaciones y el cuenco se aplana en una carta circular con un aro dorado de astrolabio (N, E, S, O y sus grados). Alrededor quedan los nombres con su corazón, la fecha, el título, lo que brillaba esa noche, el mensaje y las coordenadas, sobre un fondo de medianoche con la sierra y sus pinos. La carta se inclina con el dedo o el cursor.
- **Lo que brillaba:** cuatro destacados. Al tocar uno, sus estrellas se marcan en la carta, se lee su historia y dónde estaba a esa hora (“Al sureste, a 35° sobre el horizonte”). Tocar cualquier punto de la carta dice qué estrella, planeta o constelación es.
- **Mirar desde Durango:** entra a la cúpula para ver ese cielo alrededor, como si se estuviera parada en una loma: la Vía Láctea con su franja oscura, la ciudad iluminada en perspectiva, autos por las avenidas y las antenas rojas de los cerros. Se mira alrededor arrastrando y se acerca pellizcando o con la rueda.
- **La noche entera:** la barra de abajo mueve la hora. “Ver pasar la noche” la recorre del anochecer al amanecer en unos segundos y avisa cuando se pone Marte, salen Saturno, la Luna (con su fase real) y Venus, y cuando empieza a clarear. El corazón de la barra marca la hora del día especial y un botón vuelve a ella.
- **Campos:** `lugar`, `latitud` y `longitud` (en grados; sur y oeste en negativo), `altitud` (metros), `fecha` (`"AAAA-MM-DD"`), `hora` (`"HH:MM"`, 24 horas) y `zonaHoraria` (horas respecto a UTC; Durango: `-6`, sin horario de verano desde 2022). `titulo` y, si se quiere otro texto que el del recuerdo, `mensaje`.
- **La hora:** viene puesta a las 22:00. Si recuerdas la hora exacta de ese momento, escríbela en `hora` y el cielo, los textos de posición y los avisos se recalculan solos.
- **`destacados`** (hasta cuatro): `tipo` (`"estrella"`, `"pareja"`, `"via-lactea"` o `"planeta"`), `objetivo` (el nombre de una estrella como `"Antares"` o `"Vega"`, de un planeta como `"Marte"`, `"Luna"` o `"centro-galactico"`; para una pareja, una lista de dos), `titulo`, `subtitulo` y `texto`. `constelaciones` (opcional) resalta otras constelaciones por su sigla, por ejemplo `["Sco"]`. Si cambias la fecha o la hora, revisa que los textos sigan diciendo lo que de verdad se veía.
- **Otros textos:** `mapaEstelar.textos` cambia los botones y avisos, por ejemplo `{ mirar: "Mirar desde casa", reproducir: "Ver la noche pasar" }`.
- **`montes`** (opcional) dibuja otros cerros en el horizonte de la cúpula: una lista de `{ az, ancho, alto }` en grados (`az`: 0 norte, 90 este, 180 sur, 270 oeste).
- Sin 3D, la página sencilla muestra la misma carta dibujada en plano con sus textos.

### Fechas
`recuerdo.fecha` acepta cualquier texto (“14 de febrero de 2021”, “Verano de 2022”) o `null` para ocultarla.

### Sonido y música
- **Efectos** (activados por defecto): las estrellas suenan como campanillas y los momentos tienen sus propios sonidos (latidos, obturador, soplo de los deseos). Empiezan al tocar “Descubre nuestro cielo”, porque los navegadores no dejan sonar nada antes de un toque. `efectos: false` los apaga y `campanillas: false` quita solo las campanillas.
- **Música ambiental** (opcional): nunca empieza sola, solo suena cuando la persona toca el botón de música. Por defecto es una atmósfera suave generada en el navegador. Para usar una canción propia, copia el archivo en `assets/audio/` y escribe `archivo: "assets/audio/nuestra-cancion.mp3"`. `habilitada: false` quita el botón.
- **La canción de la sorpresa**: cuando empieza, la música ambiental se calla y el botón de música pausa y reanuda la canción. Si la pestaña se oculta, se pausa sola y sigue al volver.

### Constelaciones
- Se colocan solas en 3D, a lo largo del corazón que se revela al final, en el orden de la lista.
- `estrellas`: puntos `[x, y, brillo]` en una caja de 100 × 100. El brillo va de 0.4 a 1; la más brillante es por donde pasa el cometa del final.
- `trazos`: pares de estrellas que se unen; añade `"punteado"` como tercer valor para una línea discontinua.
- `anillos`: círculos alrededor de una estrella (la lente de la cámara, el centro del sol).
- `color`: el tono del halo que la rodea.
- `escala`: 1 es el tamaño normal; 1.2 la agranda un 20 %.

## Estructura

```
index.html              estructura de la experiencia
css/estilos.css         diseño visual
css/fuentes.css         fuentes incrustadas (Cormorant Garamond, Jost, Pinyon Script)
js/configuracion.js     ← todo lo personalizable
js/vendor/three.min.js  motor 3D (three.js, licencia MIT), reducido a lo que se usa
js/nucleo.js            utilidades
js/universo.js          galaxia, estrellas, constelaciones, efectos y el corazón final
js/controles.js         cámara orbital, vuelos y gestos (arrastrar, pellizcar, inercia)
js/rituales.js          los cinco momentos interactivos
js/musica.js            música ambiental opcional y sonidos
js/sorpresas.js         galería, botones con chispas, cita por WhatsApp y canción con letra
js/mapa-estelar.js      el cielo de nuestro día: carta 3D, cúpula, ciudad y barra de la noche
js/mapa-datos.js        estrellas, líneas y nombres de las constelaciones (d3-celestial)
js/vendor/astronomy.min.js  posiciones del Sol, la Luna y los planetas (Astronomy Engine, licencia MIT)
js/experiencia.js       recorrido completo
assets/fotos/           fotografías de los recuerdos
assets/audio/           canciones
```

## Accesibilidad y rendimiento
- Todo funciona con teclado: Tab para elegir una constelación (el universo gira hacia ella) y Enter para abrirla, flechas para girar, + y − para acercar, 0 para la vista general y Esc para volver. Cada momento tiene su versión con teclado (Enter, Espacio sostenido o Tab entre las luces). En las tarjetas: flechas para pasar las fotos de la galería, Enter para abrir el candado o el disco, y flechas sobre la barra de la canción para adelantarla o regresarla.
- En el mapa estelar: Tab recorre los destacados, “Mirar desde Durango” y la barra de la noche (flechas: 10 minutos; con Mayús, una hora). Dentro de la cúpula, las flechas miran alrededor y + y − acercan. Esc regresa de la cúpula a la carta y de la carta al universo.
- Respeta la preferencia de “reducir movimiento” del sistema: sin vuelos largos de cámara, giro automático ni estrellas fugaces, y con destellos más suaves.
- Si un equipo va lento, la experiencia baja sola la resolución y, si hace falta, apaga el resplandor. Se pausa cuando la pestaña no está visible o hay una tarjeta abierta. Mientras el mapa estelar está abierto, el universo se queda quieto detrás para que el mapa vaya fluido.
- Necesita WebGL 2 (cualquier celular o computadora de los últimos años). Si el navegador no puede mostrar 3D, aparecen los recuerdos y la carta en una página sencilla.

## Créditos de las fotos de ejemplo
Fotos de [Unsplash](https://unsplash.com), con su licencia de uso libre:
- `nuestro-momento.jpg`: [Bobby (@thapapawan)](https://unsplash.com/photos/FP_uDs7Gh4o)
- `de-tu-mano.jpg`: [Alee Catagatan](https://unsplash.com/photos/HYzTq8NCIqA)
- `el-abrazo.jpg`: [Mary Sill](https://unsplash.com/photos/ZRMHeRV_xE8)
- `tu-hombro.jpg`: [Ryan Jacobson](https://unsplash.com/photos/0R_JdRQQVqw)
- `el-mismo-deseo.jpg`: [Egor Yakushkin](https://unsplash.com/photos/pqbcX2uwzzA)
- `via-lactea.jpg`: [Maarten Verstraete](https://unsplash.com/photos/yoK3oL2Lypo)

## Créditos del mapa estelar
- **Estrellas, líneas y nombres de las constelaciones:** datos de [d3-celestial](https://github.com/ofrohn/d3-celestial) (catálogo XHIP y cartas de la IAU), resumidos en `js/mapa-datos.js` y con los nombres en español. Licencia BSD de 3 cláusulas:

  > Copyright (c) 2015, Olaf Frohn
  > All rights reserved.
  >
  > Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  >
  > 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  >
  > 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  >
  > 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
  >
  > THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

- **Sol, Luna y planetas:** [Astronomy Engine](https://github.com/cosinekitty/astronomy) 2.1.19, Copyright (c) 2019-2023 Don Cross, licencia MIT (el texto completo va al inicio de `js/vendor/astronomy.min.js`).
- La Vía Láctea, la sierra, la ciudad y sus luces se dibujan en el navegador; no usan imágenes de nadie.
