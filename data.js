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
      title: "Terapia Floral",
      subtitle: "Evolutiva",
      heroTitle: "Terapia Floral Evolutiva",
      description: "La Terapia Floral Evolutiva es un acompañamiento terapéutico basado en el sistema de Flores de Bach que favorece la autoindagación, la observación consciente.\nUn proceso terapéutico lo transformamos en un viaje de autoconocimiento.\n\n\u201cPorque el bien estar no surge de transformarnos en alguien distinto, sino de conocernos profundamente y vivir en coherencia con nuestra verdadera naturaleza.\u201d",
      format: "Encuentro Online Vía Zoom",
      duration: "Sesiones de 1 Hora",
      image: "assets/hero-terapia-floral-warm.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "tarot",
      type: "service",
      title: "Lectura de Tarot",
      description: "El Tarot es un mapa simbólico de la psique que, mediante imágenes y arquetipos, favorece la autoindagación, el autoconocimiento y la comprensión de los procesos internos, acompañando el desarrollo de una vida más consciente, auténtica y coherente.",
      format: "Online - Vía Zoom",
      duration: "Sesión de 1 Hora",
      image: "assets/tarot.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "constelaciones",
      type: "service",
      title: "Constelaciones Familiares",
      description: "En un espacio íntimo e individual, la propuesta es que juntos exploremos las dinámicas familiares que, de manera inconsciente, pueden estar frenando el desarrollo, el crecimiento y la expansión del ser extraordinario que eres.",
      format: "Online - Vía Zoom",
      duration: "Sesión de 1 Hora",
      image: "assets/constelaciones.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "carta-astral",
      type: "service",
      title: "Carta Astral",
      description: "A partir del mapa simbólico, que representa la Carta Astral juntos miraremos potencialidades, desafíos y tendencias personales, que contribuyan a tu autoconocimiento y desarrollo consciente.",
      format: "Online - Vía Zoom",
      duration: "Sesión de 1 Hora",
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
      title: "Curso de Astrología",
      description: "Un camino hacia adentro.\nDescubre el lenguaje de los astros y explora tu mapa astral en un viaje único de aprendizajes y autoconocimiento.",
      format: "Online - Vía Zoom",
      duration: "Entrevista previa a inscripción",
      image: "assets/curso_astrologia.webp",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "curso-tarot-2026",
      type: "course",
      title: "Curso de Tarot 2026",
      description: "Un camino hacia adentro.\nEl Tarot es un lenguaje simbólico que nos ayuda a comprender nuestros procesos y abrir nuevas miradas sobre la vida. Te invito a recorrer las cartas como un camino de aprendizaje, intuición y autoconocimiento.\nArcanos Mayores y Menores · Tiradas de Tarot · Relación del Tarot con tu carta astral.",
      format: "Online - Vía Zoom",
      duration: "Entrevista previa a inscripción",
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
