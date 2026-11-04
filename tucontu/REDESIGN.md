# Colores del Alma · tres conceptos para el teléfono

> **Retirados (4 de noviembre de 2026, rama `colores-final`).** Los prototipos `?concept=1|2|3` ya no están en el sitio; siguen en el historial de git (commit `625b938`). El diseño que salió de esta comparación está en `DESIGN.md` §7. Este archivo queda como registro.

Rama `colores-redesign`. **No está publicado.** Sin parámetro, la sección sigue exactamente como está, con su cortina "Muy pronto" incluida.

| Concepto | Dirección (en local o en una vista previa) |
|---|---|
| Actual | `index.html#tucontu` |
| 1 · Relato vertical | `index.html?concept=1#tucontu` |
| 2 · Galería deslizable | `index.html?concept=2#tucontu` |
| 3 · Catálogo por colecciones | `index.html?concept=3#tucontu` |

Fuera de la red local, la cortina sigue tapando la sección. Para ver un concepto hay que sumar el desbloqueo que ya existe: `?concept=2&preview=tucontu#tucontu`.

## 1. Punto de partida

**El deseo de Marcela.** "Un espacio como tienda donde puedan irse agregando después otros accesorio o productos". Hoy son 6 piezas TuconTu en una sola colección (`tienda/productos.json`). Mañana puede haber más piezas y más colecciones.

**Quiénes llegan.** El contador QR (`counter/README.md`) muestra el camino: QR → `/q/<código>` → `/?utm_source=<código>`. O sea, **se llega a la portada, no a Colores del Alma**. Desde ahí la persona baja o usa el menú. Que la mayoría llega por teléfono lo dice Ricardo. En este repositorio **no hay cifras** que lo confirmen: los datos están en la hoja de cálculo de Marcela (columna `device`). Conviene mirarla antes de decidir.

**Medición de la versión actual a 390 × 844 px** (Chromium sin interfaz, emulando un teléfono):

| Qué | Medida | Por qué importa |
|---|---|---|
| Barra inferior Pieza · Concepto · Tienda · Personaliza | 4 íconos **sin texto visible**, cada uno de 80 × 30 px. Dossier: 35 × 30 px | Esconder la navegación o dejarla sin nombre la hace más difícil de encontrar (NN/g). 30 px cumple el mínimo de 24 px de WCAG 2.2 (2.5.8, AA), pero no los 44 px de 2.5.5 (AAA) |
| Lector de Concepto | 7 páginas con puntos de 20 × 20 px y flechas de 23 × 23 px | Por debajo de los 24 px de 2.5.8. Solo cumplen si se aplica la excepción de espaciado |
| Tarjetas de la Tienda | 2 columnas de 175 px. "TuconTu · Pieza única" a 9,9 px, "Ver pieza" a 12,5 px y el precio a 13,4 px | Muy chico para leer en la calle, con el teléfono en una mano |
| Camino al pedido | Sección → pestaña con ícono → tarjeta → ficha → WhatsApp: **3 toques** después de encontrar la pestaña | Cada capa se suma a la anterior |
| Ficha | Pedir por WhatsApp abajo (bien: y = 731–779 px). Cerrar × en la esquina superior derecha | La esquina de arriba es la zona más lejana del pulgar |

## 2. Investigación usada

Ninguna de estas fuentes tiene DOI. **Límite honesto:** el entorno donde trabajé no me dejó abrir nngroup.com, baymard.com ni w3.org. Lo que sigue sale de los resúmenes de búsqueda de esas mismas páginas. Antes de citarlas afuera, conviene leerlas enteras.

- **NN/g, *Bottom Sheets*** (https://www.nngroup.com/articles/bottom-sheet/). Una hoja inferior es una capa parcial pensada para el móvil: muestra detalles sin sacarte de donde estás. Los problemas típicos son no saber cómo cerrarla, apilar varias hojas y tapar lo que importa detrás. Recomienda que el botón Atrás también la cierre. → Concepto 2.
- **NN/g, *Mobile carousels*** (https://www.nngroup.com/articles/mobile-carousels/). Pocos elementos, deslizar con el dedo y además flechas para tocar. En iPhone, un deslizamiento cerca del borde izquierdo puede volver a la página anterior. Los puntos de paginación casi no se ven. → Concepto 2: flechas de 48 px, contador "2 / 8", la pieza siguiente asoma por el borde y la primera no queda pegada al borde.
- **NN/g, *Scrolling and Attention*** (https://www.nngroup.com/articles/scrolling-and-attention/). La gente sí baja, pero el 57 % del tiempo se queda en la primera pantalla y el 17 % en la segunda. Más abajo solo hojea. → Concepto 1: el índice de piezas va arriba y el pedido viaja contigo. Concepto 3: lista compacta.
- **NN/g, *Hamburger menus*** (https://www.nngroup.com/articles/hamburger-menus/). Esconder la navegación principal redujo casi a la mitad la capacidad de encontrarla. Recomienda poner etiquetas con texto. → Los tres conceptos quitan la barra de íconos sin nombre.
- **Baymard, *Mobile image gestures*** (https://baymard.com/blog/mobile-image-gestures, 2016). En las fotos de producto la gente intenta deslizar, pellizcar y tocar dos veces. → Las fotos se deslizan y el sitio no bloquea el zoom del teléfono.
- **Baymard, miniaturas y claridad de precio** (ya citadas en `DESIGN.md`). → Concepto 3: miniaturas en la ficha. En los tres, el precio o "Precio a consultar" siempre ocupa su lugar.
- **Baymard, *Mobile product list*** (https://baymard.com/mcommerce-usability/benchmark/mobile-page-types/product-list). En el teléfono, entrar a cada ficha cuesta más que en el computador, así que la lista tiene que traer suficiente información. El detalle es de pago y no lo vi. → Concepto 3: filas con nombre, precio y número de fotos, en letra legible.
- **W3C, WAI-ARIA APG, *Carousel Pattern*** (https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) y ***Dialog (Modal) Pattern*** (ya citado). → Concepto 2: una región con nombre, diapositivas "3 de 8", botones nativos y nada gira solo. En los tres, la ficha recibe el foco, Tab gira dentro, Escape cierra y el foco vuelve a la pieza.
- **W3C, *Understanding WCAG 2.2: Target Size (Minimum)*** (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). El mínimo AA es 24 px. 44 px viene de 2.5.5 (AAA). → Los tres usan 44 px o más.
- **Hoober, *How Do Users Really Hold Mobile Devices?*** (UXmatters, 2013, https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php). En 1.333 observaciones en la calle, el 49 % usaba el teléfono con una mano. El propio Hoober corrigió después su mapa de "zonas del pulgar", así que aquí solo uso el dato de la mano. → Las acciones principales van abajo.
- **The Met, *Online collection user research*** (https://www.metmuseum.org/perspectives/online-collection-user-research). Según el resumen, cerca del 70 % de sus visitas entra directo a la página de una obra desde un buscador o un enlace. → Una idea para después, **no implementada**: que cada pieza tenga su propia dirección para compartirla por WhatsApp.

**Sin evidencia encontrada:** la barra fija de pedido es una práctica común de las tiendas, pero no encontré un estudio público de Baymard o NN/g que la respalde. En el Concepto 1 se apoya solo en Hoober y en la atención de NN/g.

## 3. Los tres conceptos

Todos cumplen lo mismo:

- **El catálogo sale de `productos.json`.** Lo probé agregando una colección y una pieza solo en el navegador: las 3 versiones la mostraron, y en la 3 aparecieron solos los estantes.
- **La ficha es accesible.**
- **El pedido va al único WhatsApp de Marcela**, con el mismo mensaje de la Tienda, que nombra la pieza y su referencia.
- **Se respetan los eventos GA4** `view_item`, `click_whatsapp` (con `item_name` y `section: tienda`), `store_photo_select`, `store_detail_close` y `store_customize_open`, y el contador QR (`ver-<id>`, WhatsApp = `<id>`).

Lo comprobé en el navegador con la analítica activada y un código `test_cx…`.

### 1 · Relato vertical: una pieza por capítulo

**Idea.** Se lee como una revista. Arriba, TuconTu y su historia en las palabras de Marcela, más un índice de fotos redondas para saltar a una pieza. Abajo, un capítulo por pieza con fotos para deslizar, nombre, precio y "Ver detalles". Entre capítulos aparece una línea del lenguaje simbólico (la trenza, la columna, el embarrilado, la espiral). Al final, "¿Sueñas otra combinación?" con las tres líneas, Personaliza el tuyo, el video y el Dossier. **Una barra fija abajo siempre nombra la pieza que está en pantalla y tiene su botón Pedir.** La ficha ocupa toda la pantalla, con las fotos una bajo otra.

- **Fortalezas:** cuenta la historia y vende a la vez, sin pestañas. El pedido está a **1 toque** desde cualquier capítulo, abajo, donde llega el pulgar. Es el que más se parece al tono de Marcela.
- **Costos:** crece a lo largo. Con 6 piezas son unos 5.500 px, y con 30 sería muy largo (NN/g: la atención cae después de la segunda pantalla). Con otras colecciones habría que ordenar capítulos. La barra ocupa unos 60 px de pantalla.

### 2 · Galería deslizable con hoja inferior

**Idea.** Una pieza por pantalla, a sangre, como recorrer una sala. Se desliza de lado o se usan las flechas, y la siguiente asoma por el borde. Abajo, sobre la foto, van el nombre, el precio y "Ver pieza ↑". La ficha **sube desde abajo** y deja ver la pieza detrás. Se cierra con Cerrar, con Escape, tocando afuera o con Atrás. La primera diapositiva es la historia y la última es Personaliza el tuyo.

- **Fortalezas:** es lo más visual e inmersivo, y las fotos se ven grandes. Todo pasa sin bajar por la página, así que no se pelea con el desplazamiento de las secciones del sitio. Pedir toma **2 toques**.
- **Costos:** los carruseles esconden lo que no está en pantalla (NN/g). Con muchas piezas, las últimas casi no se verán, y no hay forma de comparar dos piezas. No escala a varias colecciones sin agregar otra capa. Hay riesgo de que un gesto se confunda con "volver" en iPhone.

### 3 · Catálogo por colecciones

**Idea.** Es una tienda de verdad. Arriba van el título y la bajada de `productos.json`. Cada colección es un **estante** con su nombre, su etiqueta, su descripción y un desplegable "Sobre TuconTu" con la historia, la ficha y las líneas. Las piezas se ven como **filas** grandes con foto, nombre, precio y número de fotos, en letra de 16 px o más. Al final del estante va "¿Sueñas otra combinación?". La ficha es una **página completa** con "← Volver" arriba a la izquierda, fotos para deslizar con miniaturas y el pedido fijo abajo. Atrás también vuelve. Con 2 o más colecciones aparece solo un índice de estantes arriba (`store_collection_select`).

- **Fortalezas:** es **el que mejor recibe "otros accesorios o productos"**: una colección nueva es un estante nuevo, sin diseño nuevo. La lista se lee y se compara de un vistazo (Baymard). Usa los patrones más conocidos (lista → ficha → Volver), y pedir toma **2 toques**.
- **Costos:** es el menos poético, porque la historia queda en un desplegable que mucha gente no abrirá. Se parece más a cualquier tienda y le cuesta más transmitir lo artesanal.

### Comparación rápida (390 px)

| | Actual | 1 · Relato | 2 · Galería | 3 · Catálogo |
|---|---|---|---|---|
| Toques hasta WhatsApp, ya en la sección | 3 (y encontrar el ícono) | **1** | 2 | 2 |
| Botón más chico | 20 × 20 px | ≥ 44 px | ≥ 44 px | ≥ 44 px |
| Texto más chico visible | 9,9 px | 14 px | 14 px | 14 px |
| Recibe muchas piezas | Sí (cuadrícula) | Regular | Poco | **Sí** |
| Recibe otras colecciones | Filtros | Regular | Poco | **Sí, por diseño** |
| Cuenta la historia | En otra pestaña | **Sí, entrelazada** | Primera diapositiva | En un desplegable |

Los tres revisados a 390 y 1440 px: ningún botón visible mide menos de 44 px, ningún texto visible baja de 14 px, no hay desplazamiento horizontal de la página ni errores en la consola.

## 4. Recomendación

**El Concepto 3 como base, con dos préstamos del 1:** la historia de Marcela abierta arriba del estante TuconTu (no escondida en un desplegable) y una pieza con su propia dirección para compartirla.

**Por qué:**

1. Es el único que crece como Marcela pidió, "irse agregando después otros accesorios o productos", sin rediseñar.
2. En el teléfono gana lo que se lee y se toca fácil, y las filas de 16 px con botones de 44 px lo logran.
3. "Volver" y Atrás funcionan como en cualquier tienda.

El 1 es mejor mientras sean pocas piezas, y el 2 es el más bello para mostrarlas, pero los dos se vuelven difíciles con muchas.

Esto es una recomendación de método. **Qué se ve y qué se dice lo deciden Marcela y Ricardo**, idealmente después de pasarle el teléfono a 3 o 4 personas reales con los tres conceptos.

## 5. Lo que Marcela debe decidir (nada de esto lo inventé)

1. **Cuál concepto**, o qué mezcla.
2. Lo que ya pedía `DESIGN.md` §6, que sigue pendiente: qué fotos son la misma pieza, nombres, **precios**, disponibilidad, medidas, materiales, y pago, envío o retiro (`tienda.nota_compra`).
3. **Cuánto de su historia va a la vista.** En el 1 está completa, en el 2 es una diapositiva y en el 3 va en un desplegable.
4. Los textos que reutilicé de la Tienda actual: "¿Sueñas otra combinación?" y "Elige el largo, las fibras y los colores, y Marcela la teje para ti.".
5. Si quiere que cada pieza tenga su propia dirección para compartir (no está hecho).
6. Cuándo se levanta la cortina "Muy pronto".

## 6. Notas técnicas

- `tucontu-concepts.js` y `tucontu-concepts.css` solo actúan con `?concept=1|2|3`. Todo el CSS vive bajo `#tucontu[data-concept]` o `.cx-detail`.
- `tucontu-store.js` ahora comparte sus datos y su mensaje de pedido como `window.SoyStore`. La Tienda actual no cambia.
- `privacy-consent.js`: `store_detail_close` también cuenta los botones con `data-store-close`.
- "Personaliza el tuyo" abre el creador que ya existe (`#tucontu-create`). Eso envía `store_customize_open` y también `tucontu_create_open`, el evento que el creador ya tenía.
- Para quitar los conceptos después de elegir: borrar los dos archivos `tucontu-concepts.*` y sus dos líneas en `index.html`.
