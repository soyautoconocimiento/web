/* ==========================================================
   SOY AUTOCONOCIMIENTO — DATOS DE OFERTA
   Acá se editan servicios y cursos. No hace falta tocar
   index.html, styles.css ni script.js para agregar/quitar uno.
   ========================================================== */

const SITE_DATA = {

  services: [
    {
      id: "tarot",
      type: "service",
      title: "Lectura de Tarot",
      description: "Herramienta de autoconocimiento que utiliza cartas con imágenes y símbolos arquetípicos para explorar situaciones, emociones y patrones presentes en tu vida. A través de una lectura guiada, las cartas actúan como un espejo que facilita la reflexión, ayudando a identificar perspectivas, desafíos y recursos internos que pueden acompañar y enriquecer el proceso terapéutico floral.",
      format: "Online - Vía Zoom",
      duration: "Sesión de 1 Hora",
      image: "assets/tarot.png",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "constelaciones",
      type: "service",
      title: "Constelaciones Familiares",
      description: "En un espacio íntimo e individual, la propuesta es a explorar las dinámicas familiares y vinculantes que, sin darte cuenta, pueden estar frenando el desarrollo, crecimiento y expansión del ser extraordinario que eres.",
      format: "Online - Vía Zoom",
      duration: "Sesión de 1 Hora",
      image: "assets/constelaciones.png",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "carta-astral",
      type: "service",
      title: "Carta Astral",
      description: "Mapa simbólico elaborado a partir de la fecha, hora y lugar de nacimiento. Ofrece una mirada sobre potencialidades, desafíos y tendencias personales, contribuyendo al autoconocimiento y al desarrollo consciente.",
      format: "Online - Vía Zoom",
      duration: "Sesión de 1 Hora",
      image: "assets/carta_astral.png",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    }
  ],

  /* CURSOS. Mismo modal que Servicios por ahora (título, descripción,
     formato, duración, botones). Si más adelante se necesita mostrar el
     temario completo, se agrega un campo "lessons: [...]" a cada curso
     y se extiende el modal, sin tocar la estructura de datos existente.

     TODO: reemplazar "image" por los flyers reales una vez guardados en
     /assets (ej. assets/curso_astrologia.png, assets/curso_tarot.png).
     Por ahora usan imágenes existentes del sitio como placeholder. */
  courses: [
    {
      id: "curso-astrologia",
      type: "course",
      title: "Curso de Astrología",
      description: "Un camino hacia adentro.\nDescubre el lenguaje de los astros y explora tu mapa astral en un viaje único de aprendizajes y autoconocimiento.",
      format: "Online - Vía Zoom",
      duration: "Entrevista previa a inscripción",
      image: "assets/curso_astrologia.png",
      urlAgenda: "https://calendar.app.google/bakqzB6p1NStA3Hy6"
    },
    {
      id: "curso-tarot-2026",
      type: "course",
      title: "Curso de Tarot 2026",
      description: "Un camino hacia adentro.\nEl Tarot es un lenguaje simbólico que nos ayuda a comprender nuestros procesos y abrir nuevas miradas sobre la vida. Te invito a recorrer las cartas como un camino de aprendizaje, intuición y autoconocimiento.\nArcanos Mayores y Menores · Tiradas de Tarot · Relación del Tarot con tu carta astral.",
      format: "Online - Vía Zoom",
      duration: "Inicio: Abril 2026",
      image: "assets/curso_tarot.png",
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
