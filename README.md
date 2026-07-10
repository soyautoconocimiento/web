# SoyAutoconocimiento

Sitio de una sola página para acompañamientos de Terapia Floral Evolutiva, Tarot, Constelaciones Familiares, Astrología y (próximamente) Colores del Alma. HTML/CSS/JS sin build step ni dependencias.

## Estructura

- `index.html` — marcado de todas las secciones y modales.
- `styles.css` — tokens de diseño, layout y media queries.
- `script.js` — scroll snap, modales, laberinto SVG, tracking GA4.
- `data.js` — contenido editable de Servicios, Cursos y Testimonios (sin tocar HTML/CSS).
- `assets/` — imágenes e íconos.

## Previsualizar en local

No requiere instalación. Cualquier servidor estático sirve:

```
npx serve .
```

## Métricas

El sitio manda eventos custom a Google Analytics 4 (`view_section`, `tab_switch`, `view_item`, `view_about`, `click_whatsapp`, `click_calendar`). Antes de cada lanzamiento, verificar en el panel de GA4 que `click_whatsapp` y `click_calendar` estén marcados como eventos clave, y que los parámetros (`tab`, `section`, `servicio`, `item_name`) estén registrados como dimensiones personalizadas.
