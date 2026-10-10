/* ==========================================================
   SOY AUTOCONOCIMIENTO — DATOS DE OFERTA
   Acá se editan servicios y cursos. No hace falta tocar
   index.html, styles.css ni script.js para agregar/quitar uno.
   ========================================================== */

const SITE_DATA = {

  /* El servicio que abre el sitio. 2026-09-12: vivia escrito a mano dentro de
     `index.html`, en el hero, con sus datos en atributos `data-`. Dos fuentes
     para lo mismo es la falta que el nodo del cliente existe para terminar, y
     ademas dejaba a Marcela sin poder cambiar con que servicio se presenta.
     Ahora es un servicio como los otros, marcado con `hero: true`. */
  hero: "floral",

  services: [
    {
      id: "floral",
      type: "service",
      hero: true,
      title: "Terapia Floral Evolutiva",
      heroTitle: "Terapia Floral Evolutiva",
      description: "Un acompañamiento terapéutico con Flores de Bach que une observación consciente y autoindagación en un viaje de autoconocimiento.\n\n\u201cEl bienestar nace de conocernos profundamente y vivir en coherencia con nuestra verdadera naturaleza.\u201d",
      format: "Online · Zoom",
      duration: "1 hora",
      image: "assets/hero-terapia-floral-warm.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "tarot",
      type: "service",
      title: "Lectura de Tarot",
      description: "Un mapa simbólico de la psique que, mediante imágenes arquetípicas, te invita a explorar tu mundo interior para conocerte y vivir con mayor conciencia, autenticidad y coherencia.",
      format: "Online · Zoom",
      duration: "1 hora",
      image: "assets/curso_tarot-marcela-20261009.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "constelaciones",
      type: "service",
      title: "Constelaciones Familiares",
      description: "En un espacio íntimo e individual, exploramos juntos las dinámicas familiares inconscientes que hoy pueden estar limitando tu crecimiento y desarrollo.",
      format: "Online · Zoom",
      duration: "1 hora",
      image: "assets/constelaciones.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "carta-astral",
      type: "service",
      title: "Carta Astral",
      description: "Exploramos juntos tu mapa natal, a través de su lenguaje simbólico, para reconocer potencialidades, desafíos y rutas personales evolutivas. Luego de la primera sesión, si lo decides, podemos hacer un viaje de profundización y acompañarnos con Flores de Bach, que fortalecerán tu proceso de autoconocimiento.",
      format: "Online · Zoom",
      duration: "1 hora",
      image: "assets/carta_astral.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    }
  ],

  /* CURSOS. Mismo modal que Servicios por ahora (título, descripción,
     formato, duración, botones). Si más adelante se necesita mostrar el
     temario completo, se agrega un campo "lessons: [...]" a cada curso
     y se extiende el modal, sin tocar la estructura de datos existente.

     Las imágenes están optimizadas para web y se mantienen separadas
     de sus originales de archivo. */
  courses: [
    {
      id: "curso-astrologia",
      type: "course",
      title: "Astrología",
      description: "Descubre el lenguaje de los astros y explora tu mapa astral como un camino de aprendizaje y autoconocimiento.",
      format: "Online · Zoom",
      requirement: "Entrevista previa a la inscripción",
      image: "assets/curso_astrologia.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "curso-tarot-2026",
      type: "course",
      title: "Tarot 2026",
      description: "Explora las cartas como un camino de aprendizaje, intuición y autoconocimiento, que abre nuevas miradas sobre tus procesos y la vida.\nArcanos Mayores y Menores · Tiradas · Relación con tu carta astral.",
      format: "Online · Zoom",
      requirement: "Entrevista previa a la inscripción",
      image: "assets/curso_tarot.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    }
  ],

  /* TESTIMONIOS. Vacío por ahora — la clienta está recopilando los
     primeros. El bloque en el modal "Quién soy" se mantiene oculto
     mientras este array esté vacío; en cuanto se agregue el primer
     objeto, aparece solo, sin tocar HTML/CSS.
     Formato: { quote: "...", author: "Nombre o iniciales" } */
  testimonials: []

};
