# SoyAutoconocimiento

Sitio de una sola página para acompañamientos de Terapia Floral Evolutiva, Tarot, Constelaciones Familiares, Astrología y (próximamente) Colores del Alma. HTML/CSS/JS sin build step ni dependencias.

## Estructura

- `index.html` — marcado de todas las secciones y modales.
- `styles.css` — tokens de diseño, layout y media queries.
- `script.js` — scroll snap, modales, laberinto SVG, tracking GA4.
- `data.js` — contenido editable de Servicios, Cursos y Testimonios (sin tocar HTML/CSS).
- `assets/` — imágenes e íconos.
- `tienda/productos.json` — productos de la Tienda de Colores del Alma (pestaña "Tienda" en `#tucontu`). Un producto nuevo = un bloque nuevo; ver `tucontu/DESIGN.md`. Lo dibujan `tucontu-store.js` y `tucontu-store.css`.
- `tucontu-colores.js` / `.css` — diseño por defecto de `#tucontu` (móvil primero): qué es TuconTu, las piezas, los colores de algodón y una barra inferior con el pedido. Los colores están en `tienda/colores-algodon.json`. El creador "Personaliza el tuyo" está oculto con `data-builder="oculto"` en `index.html`. Ver `tucontu/DESIGN.md`.

## Previsualizar en local

No requiere instalación. Cualquier servidor estático sirve:

```
npx serve .
```

## Métricas

El sitio manda eventos custom a Google Analytics 4 (`view_section`, `tab_switch`, `view_item`, `view_about`, `click_whatsapp`, `click_calendar`). La Tienda reutiliza `view_item` y `click_whatsapp` (con `item_name` y `section: tienda`) y agrega `store_collection_select`, `store_photo_select`, `store_detail_close`, `store_customize_open`, `store_gallery_navigation`, `store_piece_select`, `store_piece_remove`, `store_color_select`, `store_color_remove` y `store_color_limit` (los de color llevan el parámetro `color`, por ejemplo `ALG-05`). Antes de cada lanzamiento, verificar en el panel de GA4 que `click_whatsapp` y `click_calendar` estén marcados como eventos clave, y que los parámetros (`tab`, `section`, `servicio`, `item_name`) estén registrados como dimensiones personalizadas.
