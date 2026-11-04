# Tienda de Colores del Alma · nota de diseño

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
