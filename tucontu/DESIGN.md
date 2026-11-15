# Tienda de Colores del Alma · nota de diseño

> **Novedad (rama `colores-welcome`, 4 de noviembre de 2026):** la sección ahora empieza con una **bienvenida** a Colores del Alma y una **vitrina** (TuconTu y Gift Cards); después viene TuconTu, igual que antes. Ver la §8, al final.
>
> **Antes (rama `colores-final`):** la sección tiene un diseño nuevo por defecto. Lo que cambió y lo que Marcela todavía decide está en la §7. Las secciones 1 a 6 cuentan cómo nació la Tienda y siguen valiendo para `tienda/productos.json`.

Prototipo en la rama `tucontu-store`. No está publicado. La sección sigue tapada por la cortina "Muy pronto" para el público.

## 1. El deseo de Marcela

> "Un espacio como tienda donde puedan irse agregando después otros accesorio o productos"

De ahí salen dos requisitos: hoy es una tienda de TuconTu, y mañana tiene que poder recibir otros productos **sin tocar código**.

## 2. Qué existía antes

- `#tucontu` es una sección a pantalla completa con pestañas: **Pieza** (solo en móvil), **Concepto** y **Personaliza el tuyo** (un encargo a medida por WhatsApp), más el botón **Dossier**.
- `tucontu/piezas.json` tiene **34 entradas, una por fotografía** (`001.webp` … `034.webp`). Su campo `nombre` solo está lleno en una ("Prueba"). Lo edita `panel/index.html`.
- Al revisar las fotos, **muchas muestran la misma pieza desde varios ángulos** (por ejemplo, 001 a 009). Las fotos 031 a 034 son ilustraciones, no accesorios.
- Conclusión: piezas.json describe **fotos**, no **productos**. Si se usara tal cual, la tienda mostraría la misma pieza ocho veces.

## 3. Estructura de la tienda

| Parte | Qué es | Dónde |
|---|---|---|
| Entrada | Una pestaña nueva, **Tienda**, entre Concepto y Personaliza el tuyo | `index.html` |
| Catálogo | Cuadrícula de tarjetas armada con los datos. 3 columnas en escritorio, 2 en móvil | `tucontu-store.js` |
| Colecciones | Botones de filtro. **Aparecen solos cuando hay 2 o más colecciones con productos.** Hoy hay una (TuconTu), así que no se muestran | `tucontu-store.js` |
| Tarjeta | Foto en arco (como la foto principal del sitio), colección · etiqueta, nombre y precio | `tucontu-store.css` |
| Ficha | Ventana modal con fotos y miniaturas, descripción, medidas y materiales (solo si existen), y el botón de pedido | `index.html` `#store-dialog` |
| Pedido | **Pedir por WhatsApp** al único número de Marcela, con la pieza y su referencia escritas en el mensaje | `contact-links.js` |
| Cierre | Una tarjeta final, "¿Sueñas otra combinación?", que lleva a **Personaliza el tuyo** | `tucontu-store.js` |

### Por qué así

- **Dentro de su sección, como una pestaña más**: respeta la navegación que Marcela ya tiene y no agrega una página nueva.
- **Hover con segunda foto, leve zoom y "Ver pieza"**: Baymard observó que mostrar una imagen alternativa o más información al pasar el mouse ayuda a comparar sin entrar y salir de cada producto ([Baymard, *Display Extra Product Info and Images on Hover*](https://baymard.com/blog/secondary-hover-information)). En pantallas táctiles no hay hover, así que la tarjeta no depende de él. En el teclado se ve el mismo gesto, con un anillo de foco.
- **Varias fotos con miniaturas en la ficha**: Baymard recomienda representar cada imagen adicional con una miniatura ([Baymard, *Always Use Thumbnails to Represent Additional Product Images*](https://baymard.com/blog/always-use-thumbnails-additional-images)).
- **El precio siempre ocupa su lugar**: si no hay precio, se lee "Precio a consultar". Baymard indica que, cuando faltan precios en un listado, a las personas les cuesta evaluar los productos y pueden descartarlos ([Baymard, guía 452, *Price clarity in product lists*](https://baymard.com/guidelines/452-price-clarity-in-product-lists-and-search-results)). Por eso **conviene que Marcela publique precios**.
- **Ficha accesible**: abre con `showModal()`. El foco entra al botón cerrar, Tab y Shift+Tab giran dentro, Escape cierra y el foco vuelve a la tarjeta que la abrió, como indica el patrón de diálogo modal de W3C ([WAI-ARIA APG, *Dialog (Modal) Pattern*](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)). Los botones miden 44 px o más (`2.75rem`).
- **Filtros solo si los datos los justifican**: una sola opción no ayuda a elegir, solo agrega ruido.
- **Un único canal de compra (WhatsApp)**: es el mismo canal que usa todo el sitio. No inventa un carrito, pagos ni despacho.

Ninguna de estas fuentes tiene DOI. Los artículos de Baymard resumen investigación cuyo detalle completo es de pago; aquí solo se cita lo que dicen sus páginas públicas.

## 4. Cómo agregar un producto (sin tocar código)

Editar **`tienda/productos.json`**: copiar un bloque de `productos` y cambiar sus datos.

```json
{
  "id": "aros-luna",
  "coleccion": "accesorios",
  "nombre": "Aros Luna",
  "precio": 18000,
  "disponible": true,
  "publicado": true,
  "descripcion": "Texto de Marcela. Una línea en blanco = nuevo párrafo.",
  "medidas": "3 cm",
  "materiales": "Hilo de algodón",
  "fotos": [
    { "src": "assets/tienda/aros-luna-1.webp", "alt": "Qué se ve en la foto" }
  ]
}
```

| Campo | Regla |
|---|---|
| `id` | Único, en minúsculas y con guiones. Lo usan WhatsApp, GA4 y el contador QR |
| `coleccion` | El `id` de una colección de la lista `colecciones`. Una colección nueva se agrega ahí, y con 2 aparecen los filtros |
| `precio` | Número en pesos chilenos, sin puntos (`18000` se muestra `$18.000`). `null` = "Precio a consultar" |
| `disponible` | `true`, `false` (se muestra "Vendida" y el botón cambia a "Pedir una parecida") o `null` (no se dice nada) |
| `publicado` | `false` lo oculta sin borrarlo |
| `descripcion` | Si queda vacía, se usa la descripción de su colección |
| `medidas`, `materiales` | Solo se muestran si tienen texto |
| `fotos` | Al menos una. La primera es la portada, y la segunda aparece al pasar el mouse |
| `tienda.nota_compra` | Texto opcional bajo el precio en todas las fichas (por ejemplo, envíos). Vacío = no se muestra |

`piezas.json` y el panel siguen como estaban. El panel **todavía no edita** `productos.json`. Si Marcela lo prefiere, ese sería el siguiente paso.

## 5. Medición (se mantienen las convenciones del README)

Todos los eventos pasan por `privacy-consent.js`, así que **solo se envían si la visitante activó la analítica**.

| Acción | Evento GA4 | Parámetros |
|---|---|---|
| Abrir la pestaña | `tucontu_gallery_mode` (ya existía) | `mode: tienda` |
| Abrir una ficha | `view_item` | `item_name`, `section: tienda` |
| Pedir por WhatsApp | `click_whatsapp` | `item_name`, `section: tienda` |
| Elegir una colección | `store_collection_select` | `collection` |
| Cambiar de foto | `store_photo_select` | — |
| Cerrar la ficha | `store_detail_close` | — |
| Ir a personalizar | `store_customize_open` | — |

No inventé parámetros nuevos para los eventos que ya existían: `section` e `item_name` son los que el README pide registrar como dimensiones personalizadas. No pude ver el panel de GA4, así que hay que confirmar allí que estén registrados.

Contador QR (`counter/README.md`, fuera de esta carpeta, **sin actualizar**): las tarjetas se registran como `ver-<id>` (igual que los servicios) y el WhatsApp como `<id>` (por ejemplo `tucontu-02`). Los botones nuevos son `tucontu-store-tab`, `store-order`, `store-customize` y `store-dialog-close`. Lo comprobé con un código `test_tienda` en un navegador sin interfaz.

## 6. Lo que Marcela debe decidir o entregar (marcadores, nada inventado)

1. **Qué fotos son la misma pieza.** Agrupé 6 piezas "a ojo" (01: fotos 001, 003, 009 · 02: 012, 021, 019 · 03: 013, 018, 014 · 04: 029, 020, 022 · 05: 010, 028, 027 · 06: 025, 023, 024). Es un **borrador** que ella tiene que confirmar o corregir.
2. **Si esas piezas están a la venta** o ya se vendieron (`disponible`).
3. **Nombres** de cada pieza. "TuconTu Nº 01" es un marcador.
4. **Precios** en pesos.
5. **Descripción, medidas y materiales** de cada pieza. Hoy se repite el texto general de su Ficha descriptiva.
6. **Pago, envío o retiro, y plazos**: no hay nada escrito. Si quiere decirlo, va en `tienda.nota_compra`.
7. Qué son las ilustraciones 031 a 034 y si serán un producto.
8. El texto de la bajada ("Piezas tejidas a mano. Pídelas directamente a Marcela por WhatsApp.") y del cierre ("¿Sueñas otra combinación?").
9. Cuándo se levanta la cortina "Muy pronto".
10. El *alt* de cada foto describe lo que se ve. Ella puede mejorarlo.

## 7. Diseño por defecto: «colores-final» (4 de noviembre de 2026)

Rama `colores-final`. **No está publicado.** La cortina "Muy pronto" sigue igual (la maneja `preview.js`). Para verla: `index.html?preview=tucontu#tucontu`.

### 7.1 De dónde sale

Ricardo y Marcela revisaron en el teléfono los tres conceptos de `REDESIGN.md`:

| Concepto | Lo que vieron | Qué se tomó |
|---|---|---|
| 1 · Relato vertical | Se perdieron, pero la barra de abajo les gustó | **La barra inferior fija** |
| 2 · Galería deslizable | Se sintió como un catálogo y dejaba claro qué hacer | **El catálogo**: piezas que se deslizan, "Ver pieza" y la ficha que sube desde abajo |
| 3 · Catálogo por colecciones | Dijo primero que TuconTu es un accesorio | **La apertura** |
| Creador "Personaliza el tuyo" | Los perdió: demasiado técnico | **Se oculta.** En su lugar se eligen colores de la tarjeta de algodón |

### 7.2 Cómo se recorre (teléfono, 390 px)

1. **Qué es.** "Colores del Alma", "TuconTu", "Accesorio para el pelo" y la descripción de la Ficha descriptiva ("Accesorio para el cabello elaborado completamente a mano…"), con la foto de portada que ya existía. **Solo palabras de Marcela**: se leen de `index.html` y de `tienda/productos.json`, no se copian.
2. **① Tienda.** Las piezas de `tienda/productos.json`, una tarjeta grande por pieza; se deslizan o se usan las flechas ← → ("2 de 6"). Cada tarjeta tiene **Ver pieza** (abre la ficha) y **Elegir**.
3. **La ficha.** Sube desde abajo (en escritorio, desde el lado). Fotos con miniaturas, descripción, medidas y materiales si existen. Su botón es **Elegir**: elige la pieza y la cierra. Foco al botón Cerrar, Tab gira dentro, Escape, tocar afuera o Atrás la cierran, y el foco vuelve a la pieza ([WAI-ARIA APG, *Dialog (Modal) Pattern*](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).
4. **② Elige tus colores.** Los 22 colores de la tarjeta "Algodón embarrilado, 100% algodón" (`assets/tucontu/algodon-embarrilado.png`), de ALG-01 Blanco a ALG-22 Chocolate.
5. **La barra de abajo**, siempre visible: nombra la pieza elegida y los colores elegidos (con su código, su nombre y un punto de color) y tiene el botón **Pedir**, que abre el único WhatsApp de Marcela (56962391328).

Se puede elegir solo una pieza, solo colores o las dos cosas. El mensaje cambia según lo elegido:

| Elección | Mensaje de WhatsApp |
|---|---|
| Nada | "Hola Marcela, quiero ver las piezas de Colores del Alma." |
| Solo pieza | El mismo de la Tienda: "Hola Marcela, me interesa la pieza «TuconTu Nº 02» de la tienda de Colores del Alma (ref. tucontu-02). ¿Está disponible y cuál es su precio?" |
| Pieza y colores | "Hola Marcela, me interesa la pieza «TuconTu Nº 02» de la tienda de Colores del Alma (ref. tucontu-02), en los colores ALG-05 Vino y ALG-19 Verde salvia. ¿Cuál es su precio?" (sin la pregunta si la pieza tiene precio) |
| Pieza vendida y colores | "…Me gustaría pedir una parecida en los colores ALG-05 Vino y ALG-19 Verde salvia." |
| Solo colores | "Hola Marcela, me gustaría un TuconTu de Colores del Alma en los colores ALG-05 Vino y ALG-19 Verde salvia." |

### 7.3 Los colores

- **Datos:** `tienda/colores-algodon.json`. Cada color tiene `codigo`, `nombre`, `hex` y `publicado` (`false` lo oculta sin borrarlo). Un color nuevo es un bloque nuevo, sin tocar código.
- **El hex es una muestra de la imagen, no del hilo.** Se tomó la mediana de 9 × 9 píxeles al centro del círculo pequeño de cada tarjeta (las 22 muestras se revisaron una por una; la variación dentro de cada muestra fue de 5 a 9 sobre 255). **Marcela debe confirmar cada hex con su hilo real**: el archivo lo dice en `_pendiente`, y la sección muestra "En pantalla el color es una referencia: el hilo real puede verse distinto."
- **Cuántos: hasta 3.** Es el número de tramos de embarrilado que ya permitía el creador (`MAX_WRAPS = 3` en `tucontu-builder-core.js`), y esta tarjeta es de algodón *embarrilado*. Se cambia en `max_colores`, sin tocar código. Con 3 elegidos, los demás quedan atenuados pero se pueden tocar: un aviso dice "Ya elegiste 3 colores. Quita uno para cambiarlo."
- **Accesible, nunca solo color:** cada color es un `<button>` real con `aria-pressed`, con el código y el nombre escritos (14 px o más). Elegido = borde grueso, fondo y un número de orden (1, 2, 3), además de `aria-pressed`. Al elegir o quitar, un aviso lo dice en palabras ("Elegiste ALG-05 Vino."). La barra repite códigos y nombres en texto.

### 7.4 El creador, oculto (un interruptor)

Sus archivos (`tucontu-builder-app.js`, `tucontu-builder-core.js`, `tucontu-builder.css` y su diálogo en `index.html`) **no se borraron ni cambiaron**. Para volver a mostrarlo, en `index.html`:

```html
<section … id="tucontu" … data-builder="oculto">   →   data-builder="visible"
```

Con `visible`, aparece el botón **Personaliza el tuyo** bajo los colores, y abre el creador como antes.

### 7.5 Medición (convenciones del README)

Los eventos siguen pasando por `privacy-consent.js`, así que **solo se envían si la visitante activó la analítica**. Los que ya existían no cambian: abrir una ficha = `view_item`; pedir = `click_whatsapp` con `item_name` (la pieza elegida, o vacío) y `section: tienda`; fotos = `store_photo_select`; cerrar = `store_detail_close`. Nuevos, con el mismo estilo `store_…`:

| Acción | Evento GA4 | Parámetros |
|---|---|---|
| Flechas ← → del catálogo | `store_gallery_navigation` | `direction: previous \| next` |
| Elegir una pieza / quitarla | `store_piece_select` / `store_piece_remove` | `item_name` |
| Elegir un color / quitarlo | `store_color_select` / `store_color_remove` | `color` (por ejemplo `ALG-05`) |
| Tocar un color con 3 ya elegidos | `store_color_limit` | `color` |

`color` es un **parámetro nuevo**: hay que registrarlo como dimensión personalizada en GA4 para verlo en los informes. `store_color_limit` sirve para saber si 3 colores se quedan cortos. Lo comprobé en un navegador sin interfaz con la analítica activada (la conexión a Google estaba bloqueada; se revisó `dataLayer`).

Contador QR: el botón de la barra es `tc-bar-order`, las flechas `tc-prev` y `tc-next`, y las tarjetas siguen siendo `ver-<id>`. El tema del WhatsApp se deduce del texto ("TuconTu …"); con el mensaje nuevo puede salir menos claro. `counter/README.md` (fuera de esta carpeta) **no se actualizó**.

### 7.6 Revisado

En Chromium sin interfaz, a **390 × 844** (teléfono) y a **1440 × 900**: ningún botón visible mide menos de 44 px, ningún texto visible baja de 14 px, no hay desplazamiento horizontal de la página, y no hay errores en la consola (salvo Google Analytics, bloqueado en el entorno de prueba). Escape y Atrás cierran la ficha, y el foco vuelve a la pieza.

### 7.7 Lo que se quitó

Los prototipos `?concept=1|2|3` (`tucontu-concepts.js` y `.css`). Siguen en el historial de git (commit `625b938`). `REDESIGN.md` queda como registro de la comparación.

### 7.8 Lo que Marcela todavía decide (nada de esto lo inventé)

1. **Los 22 hex**, comparados con su hilo real, a la luz del día.
2. **Cuántos colores** se pueden elegir (hoy 3, por los tramos del creador) y si el **orden** importa (hoy se muestra 1, 2, 3 pero el mensaje no lo explica).
3. **Para qué parte son los colores** (¿solo el embarrilado?) y si el colet, la trenza u otras fibras se eligen aparte.
4. **Si una pieza única se puede pedir en otros colores**, o si los colores son solo para encargos. El mensaje hoy dice "me interesa la pieza… en los colores…".
5. Los textos de interfaz que escribí: "Elige tus colores", "Toca hasta 3 colores; tócalo otra vez para quitarlo.", "Elegir / Elegida", "Aún sin pieza / Aún sin colores", "Pedir", "Después elige sus colores y pídela desde la barra de abajo." y la nota del color en pantalla. También los mensajes de WhatsApp de la tabla 7.2.
6. La bajada de la Tienda ("Piezas tejidas a mano. Pídelas directamente a Marcela por WhatsApp."), que ya estaba pendiente (§6.8).
7. Si quiere volver a mostrar el creador (§7.4).
8. Todo lo de la §6 que sigue abierto: qué fotos son la misma pieza, nombres, **precios**, disponibilidad, medidas, materiales, pago y envío, y cuándo se levanta la cortina.

## 8. Bienvenida y vitrina: «colores-welcome» (4 de noviembre de 2026)

Rama `colores-welcome`. **No está publicado.** La cortina "Muy pronto", el catálogo, los colores y la barra de pedido siguen igual. Para verla: `index.html?preview=tucontu#tucontu`.

### 8.1 Por qué

Marcela sintió que la sección **llegaba al producto demasiado directo**. Pidió primero una bienvenida: llegar a Colores del Alma, qué es el espacio y qué se encuentra ahí; después TuconTu. Sus palabras (mensaje a Ricardo):

> "Es un espacio virtual donde voy encontrando novedades que tal vez me gusten y pueda adquirirlas para mí o para hacer un regalo.. me imagino entrando en una tienda del sur (de manera presencial) y vitriniar si luego de un rato no encuentro nada salgo y sigo.. pero ya sé que hay un lugar (tienda, bazar) en donde poder ir a ver cositas, tejidos, accesorios, novedades, escritos, etc. que me pueden gustar y los puedo comprar. Tal vez podrían estar ahí como parte de la "vitrina" las Gift Card para lecturas de Tarot, Carta astral, constelaciones familiares, etc 🫶🏻"

### 8.2 Cómo se recorre (teléfono, 390 px)

1. **Bienvenida.** "Te doy la bienvenida a / Colores del Alma", dos citas de Marcela, firmadas, y la foto del perchero con piezas (`tucontu-rack-collection.webp`, ya estaba en el sitio). Dos botones: **Vitrinear** (baja a la vitrina) e **Ir a TuconTu**.
2. **La vitrina.** Tarjetas en 2 columnas (4 en escritorio):
   - **TuconTu**: lleva a la parte TuconTu de la misma sección. Su bajada ("Accesorio para el pelo") y su foto se leen de `index.html`.
   - **Gift Card · Lectura de Tarot**, **Gift Card · Carta Astral**, **Gift Card · Constelaciones Familiares**: los nombres, la descripción y "Online · Zoom · 1 hora" se leen de `data.js`, tal como aparecen en El Bazar. Las fotos son las de sus tarjetas en El Bazar. Cada tarjeta abre su ficha (la misma hoja inferior de las piezas) con **Pedir por WhatsApp** al único número de Marcela.
3. **TuconTu**, como estaba: apertura, ① Tienda, ② Elige tus colores.
4. **La barra de pedido** aparece al llegar a TuconTu (antes no se muestra, para que la bienvenida no empuje al producto). Si se prefiere siempre visible, se quita el bloque "Con bienvenida, la barra…" en `tucontu-colores.js`.

Las citas son de Marcela, **acortadas**: en la primera solo se quitó "Es"; en la segunda se quitaron "(de manera presencial)", "(tienda, bazar)" y la lista final, se ajustó la puntuación y se escribió **"vitrinear"** donde ella escribió "vitriniar".

Mensaje de WhatsApp de una Gift Card: "Hola Marcela, me interesa una Gift Card de «Lectura de Tarot» de la vitrina de Colores del Alma (ref. gift-tarot). ¿Cómo la pido y cuál es su precio?"

### 8.3 Cómo agregar algo a la vitrina (sin tocar código)

Todo está en **`tienda/vitrina.json`**:

| Parte | Qué es |
|---|---|
| `bienvenida` | Antetítulo, título, `lema` y `cita` (entre «»), `firma` y `foto` |
| `vitrina` | Título y bajada de la vitrina |
| `estantes` | Un bloque por estante. `publicado: false` lo oculta. **Un estante sin `items` no se muestra** |
| Gift Card nueva | Un bloque en `items` del estante `gift-cards` con `id`, `servicio` (el `id` del servicio en `data.js`) y `foto` |
| Estante futuro | `tejidos`, `escritos` y `novedades` ya existen, vacíos. Cada item: `id`, `nombre`, `descripcion` y `foto { src, alt }`. Al poner el primero, aparece solo |

Sin precios: Marcela aún no los tiene. Si un `servicio` deja de existir en `data.js`, su Gift Card no se muestra.

### 8.4 Medición

Sin eventos nuevos: abrir una tarjeta = `view_item` (`item_name`, por ejemplo "Gift Card Lectura de Tarot"); pedir = `click_whatsapp`; cerrar = `store_detail_close`. Contador QR: las tarjetas son `ver-<id>` (por ejemplo `ver-gift-tarot`) y el WhatsApp `<id>`. `section` sigue diciendo `tienda`.

### 8.5 Revisado

Chromium sin interfaz, a **390 × 844** y **1440 × 900**: ningún botón visible mide menos de 44 px, ningún texto visible baja de 14 px, sin desplazamiento horizontal, sin errores en la consola. La ficha abre con el foco en Cerrar, Escape la cierra y el foco vuelve a la tarjeta. Con `?curtain=1` la cortina sigue tapando la sección.

### 8.6 Lo que Marcela todavía decide (nada de esto lo inventé)

1. **Los textos que escribí yo**: "Te doy la bienvenida a", "Vitrinear", "Ir a TuconTu", "La vitrina", "Lo que puedes encontrar hoy. Toca una tarjeta para verla.", "Ver detalle", "Sesión" y el mensaje de WhatsApp de las Gift Cards.
2. **Cómo se acortaron sus citas** (§8.2), y si "vitrinear" queda así.
3. **Las Gift Cards**: precio, cómo se entregan (¿imagen, PDF, impresa?), vigencia, si se regala una sesión completa y cómo agenda quien la recibe. Hoy la ficha solo dice el servicio y su sesión, y el mensaje pregunta.
4. **Qué otros servicios** tienen Gift Card (ella escribió "etc."). Terapia Floral Evolutiva y los cursos no tienen; se agregan con un bloque.
5. **Las fotos de las Gift Cards** (hoy, las del Bazar) y la de la bienvenida (el perchero).
6. **Qué estantes futuros** quiere (tejidos, escritos, novedades) y sus primeras piezas.
7. Si la barra de pedido debe verse ya en la bienvenida (§8.2, punto 4).
8. Todo lo de la §7.8 que sigue abierto.
