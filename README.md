# SoyAutoconocimiento

Sitio de una sola página para acompañamientos de Terapia Floral Evolutiva, Tarot, Constelaciones Familiares, Astrología y (próximamente) Colores del Alma. HTML/CSS/JS sin build step ni dependencias.

## Estructura

- `index.html` — marcado de todas las secciones y modales.
- `sitio.css` — todo el estilo del sitio, en un solo archivo. Lo usan `index.html` y `privacidad.html`.
- `preview.js` — el sitio en movimiento: inicio, servicios, navegación.
- `data.js` — contenido editable de Servicios, Cursos y Testimonios (sin tocar HTML/CSS).
- `assets/` — imágenes e íconos.
- `colores.js` — Colores del Alma, la tienda en una pantalla, montada en `.cda` dentro de `#tucontu`. Lee `tienda/destacados.json`, `tienda/lineas.json` y `tienda/colores-algodon.json`.
- `tienda/destacados.json` — los destacados con que abre Colores del Alma.
- `tienda/lineas.json` — las 3 líneas de TuconTu: Perséfone, Afrodita, Héstia.
- `blog.js` y `blog/entradas.json` — el blog, en modo lectura. Sin entradas, el botón Blog no se muestra.

## Previsualizar en local

No requiere instalación. Cualquier servidor estático sirve:

```
npx serve .
```

## Métricas

El sitio manda eventos custom a Google Analytics 4 (`view_section`, `tab_switch`, `view_item`, `view_about`, `click_whatsapp`, `click_calendar`). Colores del Alma (`colores.js`) todavía no manda eventos propios. GA4 está apagado hasta que la persona lo enciende en «Privacidad»: sus cifras son un piso; el contador QR (`../counter/README.md`) cuenta a todos. Antes de cada lanzamiento, verificar en el panel de GA4 que `click_whatsapp` y `click_calendar` estén marcados como eventos clave, y que los parámetros (`tab`, `section`, `servicio`, `item_name`) estén registrados como dimensiones personalizadas.
