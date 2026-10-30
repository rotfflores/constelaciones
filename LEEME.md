# El cielo de nosotros · Rotf Studio

Un regalo interactivo en 3D: un universo con una galaxia en espiral que se gira con el dedo. A su alrededor flotan cinco constelaciones, y cada una guarda un recuerdo que se abre con un momento interactivo distinto. Al descubrirlas todas, un cometa revela que juntas dibujan un corazón y el nombre de quien recibe el regalo se escribe con estrellas.

## Cómo abrirlo

Haz doble clic en `index.html`. Funciona sin internet y sin instalar nada: el motor 3D (three.js) y las fuentes van incluidos en la carpeta.
Para publicarlo, sube la carpeta completa a cualquier hosting estático (Netlify, Vercel, GitHub Pages o tu servidor).

## El recorrido

1. **Bienvenida:** la galaxia gira despacio detrás del mensaje. Al tocar “Descubre nuestro cielo”, la cámara vuela hacia el universo y las cinco constelaciones se encienden una a una.
2. **Explorar:** se arrastra para girar el universo (con inercia), se pellizca para acercar y se toca una constelación para abrirla. En computadora: arrastrar con el ratón, rueda o botones + y −.
3. **Cinco momentos, uno por recuerdo:**
   - **Encuentro** (Donde comenzó todo): dos estrellas con sus nombres. Al arrastrar una hacia la otra se atraen, se funden en un destello y aparece “Y entonces, nos encontramos”.
   - **Revelado** (Nuestro momento favorito): al mantener presionado, el polvo de estrellas forma un marco y la foto se revela dentro, como en un cuarto oscuro.
   - **Luces** (Lo que iluminas en mí): luces que orbitan el sol; cada una que se atrapa vuela hacia el centro, enciende un rayo y muestra una frase de la lista.
   - **Deseos** (Todo lo que nos espera): al deslizar hacia arriba se lanza cada deseo desde un farol; viaja por el cielo y se convierte en una estrella del avión de papel.
   - **Latido** (Siempre tú): al mantener presionado, un corazón de polvo de estrellas late y se forma con cada latido (con vibración en Android).
   Después de cada momento se abre la tarjeta con el recuerdo: los recuerdos sin foto muestran arriba su constelación en 3D, con su brillo, su halo y sus líneas de luz: se enciende estrella por estrella, se mece despacio y se puede girar con el dedo o el ratón. No hay atajo: cada recuerdo se abre haciendo su actividad.
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
- **Revelado** usa la foto de `recuerdo.foto`. Publicada en internet, el polvo de estrellas forma la foto misma; abierta con doble clic, el navegador no deja leer la imagen, así que el polvo forma el marco y la foto se revela dentro.

### Fotografías
Copia la foto en `assets/fotos/` (jpg o webp, idealmente 1200 px de ancho y menos de 400 KB) y escribe su ruta en `recuerdo.foto`, por ejemplo `"assets/fotos/playa.jpg"`. Describe la imagen en `textoAlternativo`. Usa `null` si un recuerdo no lleva foto. La ilustración incluida (`nuestro-momento.svg`) es solo de ejemplo.

### Fechas
`recuerdo.fecha` acepta cualquier texto (“14 de febrero de 2021”, “Verano de 2022”) o `null` para ocultarla.

### Sonido y música
- **Efectos** (activados por defecto): las estrellas suenan como campanillas y los momentos tienen sus propios sonidos (latidos, obturador, soplo de los deseos). Empiezan al tocar “Descubre nuestro cielo”, porque los navegadores no dejan sonar nada antes de un toque. `efectos: false` los apaga y `campanillas: false` quita solo las campanillas.
- **Música ambiental** (opcional): nunca empieza sola, solo suena cuando la persona toca el botón de música. Por defecto es una atmósfera suave generada en el navegador. Para usar una canción propia, crea la carpeta `assets/audio/`, copia ahí el archivo y escribe `archivo: "assets/audio/nuestra-cancion.mp3"`. `habilitada: false` quita el botón.

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
js/experiencia.js       recorrido completo
assets/fotos/           fotografías de los recuerdos
```

## Accesibilidad y rendimiento
- Todo funciona con teclado: Tab para elegir una constelación (el universo gira hacia ella) y Enter para abrirla, flechas para girar, + y − para acercar, 0 para la vista general y Esc para volver. Cada momento tiene su versión con teclado (Enter, Espacio sostenido o Tab entre las luces).
- Respeta la preferencia de “reducir movimiento” del sistema: sin vuelos largos de cámara, giro automático ni estrellas fugaces, y con destellos más suaves.
- Si un equipo va lento, la experiencia baja sola la resolución y, si hace falta, apaga el resplandor. Se pausa cuando la pestaña no está visible o hay una tarjeta abierta.
- Necesita WebGL 2 (cualquier celular o computadora de los últimos años). Si el navegador no puede mostrar 3D, aparecen los recuerdos y la carta en una página sencilla.
