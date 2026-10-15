/**
 * SOYAUTOCONOCIMIENTO · FUENTE ÚNICA DE DATOS (Single Source of Truth)
 * Almacena el contenido del Hero, Tarjetas del Bazar, Textos por Dispositivo
 * y Modales con personalización de WhatsApp.
 */
(function(root) {
  'use strict';

  const DEFAULT_CONTENT = {
    settings: {
      activeHeroId: 'floral',
      activeCardStyle: 'atelier', // 'baseline' | 'atelier' | 'portal' | 'notebook' | 'alchemy'
      version: '2026.10.15'
    },
    deviceRules: {
      desktop: {
        heroNote: true,
        heroQuote: true,
        heroSecondaryBtn: true,
        cardKicker: true,
        cardDesc: true,
        cardDuration: true,
        cardQuote: true
      },
      tablet: {
        heroNote: true,
        heroQuote: false,
        heroSecondaryBtn: true,
        cardKicker: true,
        cardDesc: true,
        cardDuration: true,
        cardQuote: false
      },
      mobile: {
        heroNote: false,
        heroQuote: false,
        heroSecondaryBtn: false,
        cardKicker: true,
        cardDesc: false, // Por defecto en móvil la tarjeta es compacta y sin párrafo largo
        cardDuration: true,
        cardQuote: false
      }
    },
    offers: {
      'floral': {
        id: 'floral',
        category: 'services',
        title: 'Terapia Floral',
        heroLead: 'Evolutiva',
        heroBody: 'Transformamos el proceso terapéutico en tu viaje de autoconocimiento. Las esencias florales actúan como catalizadores de tu propia sabiduría interior.',
        heroBodyMobile: 'Transformamos el proceso terapéutico en tu viaje de autoconocimiento con esencias florales evolutivas.',
        heroQuote: 'Conocernos profundamente.',
        heroNoteNum: '01',
        heroNoteText: 'Observación consciente',
        kicker: 'Acompañamiento Individual',
        tag: 'Sesión',
        image: 'assets/hero-terapia-floral-warm.webp',
        imageDisplay: 'assets/hero-terapia-floral-display.jpg',
        imageMobile: 'assets/hero-terapia-floral-mobile.jpg',
        cardDesc: 'Un viaje sensible hacia tu centro emocional a través de la vibración de las flores y la palabra consciente.',
        cardDescMobile: 'Viaje sensible hacia tu centro emocional con esencias y palabra.',
        fullDesc: 'La Terapia Floral Evolutiva es un proceso profundo de escucha y armonización. A través del diálogo terapéutico identificamos los patrones emocionales y las creencias que piden ser transformados.\n\nCada fórmula floral es personalizada y acompaña tu momento vital con gentileza y precisión.',
        modalQuote: '«Las flores no cambian quién eres; revelan la luz que siempre ha estado en ti.»',
        format: 'Online · Vía Google Meet',
        duration: '1 hora por sesión',
        detailNote: 'Valor por sesión individual',
        agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
        defaultMsg: 'Hola Marcela, me gustaría agendar una sesión de Terapia Floral Evolutiva. ¿Cuáles son los horarios disponibles para esta semana? Gracias.',
        waChips: ['📅 Próxima fecha disponible', '🌿 Sobre el frasco floral', '💳 Formas de pago', '📍 Modalidad online']
      },
      'tarot': {
        id: 'tarot',
        category: 'services',
        title: 'Tarot Terapéutico',
        heroLead: 'Espejo del Alma',
        heroBody: 'Las imágenes y arquetipos del Tarot dialogan con tu inconsciente para iluminar bloqueos, tomar decisiones y ordenar tu presente.',
        heroBodyMobile: 'Diálogo consciente con las imágenes del Tarot para iluminar bloqueos y ordenar tu presente.',
        heroQuote: 'El inconsciente habla en imágenes.',
        heroNoteNum: '02',
        heroNoteText: 'Simbología sagrada',
        kicker: 'Consulta Arquetípica',
        tag: 'Sesión',
        image: 'service-tarot-fool-display.jpg',
        imageDisplay: 'service-tarot-fool-display.jpg',
        imageMobile: 'service-tarot-fool-display.jpg',
        cardDesc: 'Una lectura evolutiva que abre perspectivas claras y comprensivas sobre tus encrucijadas actuales.',
        cardDescMobile: 'Lectura evolutiva para abrir perspectiva sobre tus encrucijadas.',
        fullDesc: 'Lejos de la adivinación predictiva, el Tarot Terapéutico es una conversación profunda con los símbolos universales de la psique humana.\n\nExploramos las preguntas esenciales que habitan en ti, revelando caminos de acción y recursos internos que quizás no estabas viendo.',
        modalQuote: '«El símbolo no predice tu destino: despierta tu conciencia para construirlo.»',
        format: 'Online · Sesión interactiva',
        duration: '1 hora',
        detailNote: 'Incluye registro fotográfico de la tirada',
        agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
        defaultMsg: 'Hola Marcela, me interesa agendar una consulta de Tarot Terapéutico. Me gustaría saber cómo preparar mi consulta. Saludos.',
        waChips: ['❓ Cómo preparar mi pregunta', '📅 Horarios de atención', '💳 Medios de pago', '⏱️ Duración de la sesión']
      },
      'constelaciones': {
        id: 'constelaciones',
        category: 'services',
        title: 'Constelaciones Familiares',
        heroLead: 'Orden del Amor',
        heroBody: 'Mira tu historia familiar con ojos de reconciliación. Libera lealtades invisibles que condicionan tu salud, tus vínculos y tu prosperidad.',
        heroBodyMobile: 'Mira tu historia familiar con ojos de reconciliación y libera lealtades invisibles.',
        heroQuote: 'Honrar lo que fue para vivir lo que es.',
        heroNoteNum: '03',
        heroNoteText: 'Sistémica integradora',
        kicker: 'Sanación de Linaje',
        tag: 'Individual',
        image: 'assets/constelaciones.webp',
        imageDisplay: 'assets/constelaciones.webp',
        imageMobile: 'assets/constelaciones.webp',
        cardDesc: 'Configuración sistémica para desentrañar dinámicas heredadas y tomar tu propio lugar en la vida.',
        cardDescMobile: 'Configuración sistémica para tomar tu propio lugar en la vida.',
        fullDesc: 'Trabajamos con figuras de madera, anclajes espaciales y visualizaciones guiadas para representar tu sistema relacional.\n\nAl ordenar las lealtades del linaje, la energía de vida vuelve a fluir hacia adelante, permitiéndote vivir tu propio destino sin cargar lo ajeno.',
        modalQuote: '«Cuando los ancestros encuentran su lugar en el corazón, el presente queda libre.»',
        format: 'Online · Formato individual con anclajes',
        duration: '1 hora 15 min',
        detailNote: 'Sesión única de alto impacto',
        agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
        defaultMsg: 'Hola Marcela, quisiera agendar una constelación familiar individual. Me gustaría saber las próximas fechas disponibles.',
        waChips: ['🌱 Tema a trabajar', '📅 Disponibilidad horaria', '📜 Qué necesito preparar', '💳 Valor y reserva']
      },
      'carta-astral': {
        id: 'carta-astral',
        category: 'services',
        title: 'Carta Astral Natal',
        heroLead: 'Cielo de Nacimiento',
        heroBody: 'El mapa cósmico del instante en que respiraste por primera vez. Un espejo celeste de tus dones, tus tensiones y tu camino evolutivo.',
        heroBodyMobile: 'El mapa cósmico del instante en que respiraste por primera vez: dones, retos y camino.',
        heroQuote: 'Como es arriba, es adentro.',
        heroNoteNum: '04',
        heroNoteText: 'Cosmología del ser',
        kicker: 'Astrología Psicológica',
        tag: 'Mapa Natal',
        image: 'assets/carta_astral.webp',
        imageDisplay: 'assets/carta_astral.webp',
        imageMobile: 'assets/carta_astral.webp',
        cardDesc: 'Descifra tu configuración celeste: sol, luna, ascendente y el propósito que tu alma vino a integrar.',
        cardDescMobile: 'Descifra tu sol, luna, ascendente y el propósito que tu alma vino a integrar.',
        fullDesc: 'Analizamos en detalle la geometría de tu cielo: planetas, casas, aspectos y nodos lunares. Abordamos tu carta no como un destino estático, sino como una partitura viva que aprendes a interpretar con maestría.',
        modalQuote: '«Los astros no obligan: inclinan, revelan y afinan la conciencia.»',
        format: 'Online · Vía Zoom / Meet',
        duration: '1 hora 30 min',
        detailNote: 'Requiere fecha, hora exacta y ciudad de nacimiento',
        agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
        defaultMsg: 'Hola Marcela, me gustaría encargar la lectura de mi Carta Astral Natal. Tengo mis datos de nacimiento listos.',
        waChips: ['📍 Datos que necesito enviar', '🎧 Entrega de grabación', '📅 Coordinar sesión', '💳 Formas de pago']
      },
      'curso-astrologia': {
        id: 'curso-astrologia',
        category: 'courses',
        title: 'Curso de Astrología',
        heroLead: 'El Lenguaje Sagrado',
        heroBody: 'Un camino pedagógico de iniciación en la sabiduría celeste. Aprende a leer cartas natales con rigor técnico y mirada terapéutica.',
        heroBodyMobile: 'Iniciación pedagógica en la sabiduría celeste para leer cartas natales con mirada terapéutica.',
        heroQuote: 'Aprender el cielo para comprender la tierra.',
        heroNoteNum: '05',
        heroNoteText: 'Formación profunda',
        kicker: 'Formación Anual',
        tag: 'Curso',
        image: 'assets/curso_astrologia.webp',
        imageDisplay: 'assets/curso_astrologia.webp',
        imageMobile: 'assets/curso_astrologia.webp',
        cardDesc: 'Descubre el lenguaje de los astros y explora tu mapa astral como un camino de aprendizaje y autoconocimiento.',
        cardDescMobile: 'Descubre el lenguaje de los astros como camino de autoconocimiento.',
        fullDesc: 'Un recorrido sistemático y vivencial donde cada arquetipo planetario y zodiacal cobra sentido en tu propia biografía. Aprenderás a relacionar signos, casas, aspectos y tránsitos con profundidad humana.',
        modalQuote: '«Aprender el cielo para comprender la tierra que habitamos por dentro.»',
        format: 'Online · Clases en vivo + grabaciones',
        duration: 'Módulos mensuales',
        detailNote: 'Entrevista previa a la inscripción',
        agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
        defaultMsg: 'Hola Marcela, quisiera solicitar una entrevista previa para conocer el programa del Curso de Astrología. Muchas gracias.',
        waChips: ['📅 Fechas de inicio', '📚 Programa y temario', '💻 Modalidad y grabaciones', '💳 Valores y cuotas']
      },
      'curso-tarot-2026': {
        id: 'curso-tarot-2026',
        category: 'courses',
        title: 'Tarot 2026',
        heroLead: 'Viaje del Héroe',
        heroBody: 'Explora las 78 cartas como un sendero de transformación, intuición y maestría simbólica que abre nuevas miradas.',
        heroBodyMobile: 'Las 78 cartas como un sendero de transformación, intuición y maestría simbólica.',
        heroQuote: 'El viaje del alma en 78 cartas.',
        heroNoteNum: '06',
        heroNoteText: 'Arcanos y conciencia',
        kicker: 'Formación Intensiva',
        tag: 'Ciclo 2026',
        image: 'assets/curso_tarot.webp',
        imageDisplay: 'assets/curso_tarot.webp',
        imageMobile: 'assets/curso_tarot.webp',
        cardDesc: 'Formación completa en Arcanos Mayores y Menores con prácticas terapéuticas y éticas desde el primer mes.',
        cardDescMobile: 'Formación en Arcanos Mayores y Menores con prácticas terapéuticas.',
        fullDesc: 'Un curso integrador pensado para quienes desean dominar la lectura del Tarot como herramienta de autoexploración o de servicio profesional.\n\nIncluye cuaderno de prácticas, supervisiones y biblioteca arquetípica.',
        modalQuote: '«Cada carta es un portal a una dimensión viva de tu propia psique.»',
        format: 'Online · Grupos reducidos',
        duration: 'Ciclo anual 2026',
        detailNote: 'Cupos limitados por orden de inscripción',
        agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
        defaultMsg: 'Hola Marcela, me interesa el curso de Tarot 2026. Quisiera consultar por el programa detallado y la reserva de cupo.',
        waChips: ['📚 Temario completo', '📅 Calendario de clases', '🎟️ Reserva de cupo', '💳 Aranceles y descuentos']
      }
    }
  };

  const STORAGE_KEY = 'soy_site_content_v1';

  function loadContent() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          settings: Object.assign({}, DEFAULT_CONTENT.settings, parsed.settings),
          deviceRules: Object.assign({}, DEFAULT_CONTENT.deviceRules, parsed.deviceRules),
          offers: Object.assign({}, DEFAULT_CONTENT.offers, parsed.offers)
        };
      }
    } catch (e) {
      console.warn('[SoyContent] Usando datos por defecto debido a error en localStorage', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }

  function saveContent(content) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      return true;
    } catch (e) {
      console.error('[SoyContent] Error al guardar en localStorage', e);
      return false;
    }
  }

  function resetContent() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }

  // Exportar en window para el ecosistema
  root.SoySiteContent = {
    DEFAULT: DEFAULT_CONTENT,
    load: loadContent,
    save: saveContent,
    reset: resetContent
  };

})(typeof window !== 'undefined' ? window : this);
