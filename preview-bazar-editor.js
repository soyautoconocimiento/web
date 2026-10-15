/**
 * ============================================================================
 * PREVIEW BAZAR & EDITOR DE CONTENIDOS EN TIEMPO REAL · SOYAUTOCONOCIMIENTO
 * ============================================================================
 * - Sincroniza Hero y Bazar: el servicio/curso en el Hero se excluye del Bazar.
 * - Soporta las 5 direcciones visuales de tarjetas.
 * - Modal de 2 pantallas (Detalle + Personalizador de WhatsApp con chips).
 * - Editor de contenidos interactivo en vivo (Hero, Tarjeta, Adentro de Tarjeta).
 * - Persistencia automática en localStorage y atajo de teclado (Tecla E).
 */

window.SoyBazarEditorActive = true;

(() => {
  // Datos iniciales de autor
  const DEFAULT_OFFERS = {
    floral: {
      id: 'floral',
      category: 'services',
      title: 'Terapia Floral',
      heroLead: 'Evolutiva',
      heroBody: 'Transformamos el proceso terapéutico en tu viaje de autoconocimiento.',
      heroQuote: 'Conocernos profundamente.',
      heroNoteNum: '01',
      heroNoteText: 'Observación consciente',
      kicker: 'Acompañamiento Terapéutico · Flores de Bach',
      image: 'assets/hero-terapia-floral-warm.webp',
      imageDisplay: 'assets/hero-terapia-floral-display.jpg',
      imageMobile: 'assets/hero-terapia-floral-mobile.jpg',
      cardDesc: 'Un acompañamiento terapéutico con Flores de Bach que une observación consciente y autoindagación.',
      cardDescMobile: 'Acompañamiento terapéutico con Flores de Bach para reconectar con tu bienestar y coherencia.',
      heroBodyMobile: 'Tu viaje de autoconocimiento guiado por la sabiduría de las flores.',
      fullDesc: 'Un acompañamiento terapéutico con Flores de Bach que une observación consciente y autoindagación en un viaje de autoconocimiento.\n\nEn cada sesión exploramos juntos lo que hoy te inquieta, facilitando la toma de conciencia sobre patrones emocionales para formular un preparado floral personalizado.',
      modalQuote: '«El bienestar nace de conocernos profundamente y vivir en coherencia con nuestra verdadera naturaleza.»',
      format: 'Online · Zoom',
      duration: '1 hora',
      detailNote: 'Incluye fórmula personalizada',
      agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
      defaultMsg: 'Hola Marcela, me gustaría consultar por la sesión de Terapia Floral Evolutiva. ¿Tienes disponibilidad en los próximos días para coordinar? Gracias.',
      waChips: ['📅 Horarios disponibles', '💻 Formato de sesión online', '🌿 Preparación previa', '💳 Métodos de pago']
    },
    tarot: {
      id: 'tarot',
      category: 'services',
      title: 'Lectura de Tarot',
      heroLead: 'Terapéutico & Arquetípico',
      heroBody: 'Un mapa simbólico del alma para explorar tu mundo interior con autenticidad y consciencia.',
      heroBodyMobile: 'Un mapa simbólico del alma para explorar tu mundo interior con autenticidad.',
      heroQuote: 'Imágenes arquetípicas que iluminan.',
      heroNoteNum: '02',
      heroNoteText: 'Sabiduría del inconsciente',
      kicker: 'Arquetipos & Sabiduría del Inconsciente',
      image: 'assets/curso_tarot-marcela-20261009.webp',
      imageDisplay: 'service-tarot-fool-display.jpg',
      imageMobile: 'service-tarot-fool-display.jpg',
      cardDesc: 'El Tarot es un espejo del alma que nos muestra el panorama arquetípico de lo que estamos viviendo.',
      cardDescMobile: 'Un espejo del alma que nos muestra el panorama arquetípico de lo que estamos viviendo.',
      fullDesc: 'Un mapa simbólico de la psique que, mediante imágenes arquetípicas, te invita a explorar tu mundo interior para conocerte y vivir con mayor conciencia, autenticidad y coherencia.\n\nA través de una mirada evolutiva y respetuosa, desentrañamos encrucijadas y clarificamos tu rumbo vital.',
      modalQuote: '«Un mapa simbólico que te invita a explorar tu mundo interior con autenticidad.»',
      format: 'Online · Zoom',
      duration: '1 hora',
      detailNote: 'Sesión individual confidencial',
      agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
      defaultMsg: 'Hola Marcela, quisiera coordinar una sesión de Lectura de Tarot Terapéutico contigo. ¿Cómo podemos agendar? Muchas gracias.',
      waChips: ['📅 Horarios disponibles', '💻 Modalidad online', '🃏 Enfoque terapéutico', '💳 Valores y pago']
    },
    constelaciones: {
      id: 'constelaciones',
      category: 'services',
      title: 'Constelaciones Familiares',
      heroLead: 'Sanación Sistémica',
      heroBody: 'En un espacio íntimo miramos con amor las dinámicas invisibles para abrir paso a la reconciliación y la paz.',
      heroBodyMobile: 'Espacio íntimo para mirar con amor dinámicas familiares y abrir paso a la reconciliación.',
      heroQuote: 'Asentir con amor a la historia.',
      heroNoteNum: '03',
      heroNoteText: 'Abordaje sistémico',
      kicker: 'Sanación Sistémica Individual',
      image: 'assets/constelaciones.webp',
      imageDisplay: 'service-constelaciones-stone-display.jpg',
      imageMobile: 'service-constelaciones-stone-display.jpg',
      cardDesc: 'En un espacio íntimo e individual, miramos con amor las dinámicas familiares inconscientes.',
      cardDescMobile: 'En un espacio íntimo e individual, miramos con amor las dinámicas familiares inconscientes.',
      fullDesc: 'En un espacio íntimo e individual, miramos con amor las dinámicas familiares inconscientes y lealtades invisibles que pueden estar frenando tu desarrollo o bienestar, abriendo paso a la reconciliación y la paz interior.',
      modalQuote: '«Asentir con amor a la historia familiar para habitar plenamente tu propio destino.»',
      format: 'Online · Zoom',
      duration: '1 hora',
      detailNote: 'Abordaje sistémico profundo',
      agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
      defaultMsg: 'Hola Marcela, me interesa realizar una sesión individual de Constelaciones Familiares. Me gustaría conocer fechas y cómo prepararme. Gracias.',
      waChips: ['📅 Fechas disponibles', '🌿 Cómo prepararme', '💻 Formato online', '💳 Formas de pago']
    },
    'carta-astral': {
      id: 'carta-astral',
      category: 'services',
      title: 'Carta Astral',
      heroLead: '& Flores Evolutivas',
      heroBody: 'Exploramos juntos tu mapa natal para reconocer potencialidades, desafíos y rutas personales evolutivas.',
      heroBodyMobile: 'Exploramos juntos tu mapa natal para reconocer potencialidades y rutas personales evolutivas.',
      heroQuote: 'Rutas personales evolutivas.',
      heroNoteNum: '04',
      heroNoteText: 'Mapa natal simbólico',
      kicker: 'Astrología & Esencias Florales',
      image: 'assets/carta_astral.webp',
      imageDisplay: 'service-carta-astral-astrolabe-display.jpg',
      imageMobile: 'service-carta-astral-astrolabe-display.jpg',
      cardDesc: 'Exploramos juntos tu mapa natal, a través de su lenguaje simbólico, para reconocer rutas evolutivas.',
      cardDescMobile: 'Exploramos juntos tu mapa natal, mediante su lenguaje simbólico, para reconocer rutas evolutivas.',
      fullDesc: 'Exploramos juntos tu mapa natal, a través de su lenguaje simbólico, para reconocer potencialidades, desafíos y rutas personales evolutivas.\n\nLuego de la primera sesión, si lo decides, podemos hacer un viaje de profundización y acompañarnos con Flores de Bach, que fortalecerán tu proceso.',
      modalQuote: '«El cielo al nacer como un mapa vivo de potencialidades que esperan ser desplegadas.»',
      format: 'Online · Zoom',
      duration: '1 hora',
      detailNote: 'Incluye informe natal simbólico',
      agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
      defaultMsg: 'Hola Marcela, deseo consultar por la sesión de Carta Astral. Tengo mi hora exacta de nacimiento. ¿Cómo coordinamos? Gracias.',
      waChips: ['📅 Horarios disponibles', '✨ Datos de nacimiento', '💻 Formato online', '💳 Tarifas y pago']
    },
    'curso-astrologia': {
      id: 'curso-astrologia',
      category: 'courses',
      title: 'Astrología',
      heroLead: 'Formación Anual',
      heroBody: 'Descubre el lenguaje de los astros y explora tu mapa astral como un camino de aprendizaje y autoconocimiento.',
      heroBodyMobile: 'Descubre el lenguaje de los astros en un camino vivencial de aprendizaje y autoconocimiento.',
      heroQuote: 'Aprender el lenguaje del cielo.',
      heroNoteNum: '05',
      heroNoteText: 'Formación profunda',
      kicker: 'Formación Anual · Lenguaje Simbólico',
      image: 'assets/curso_astrologia.webp',
      imageDisplay: 'assets/curso_astrologia.webp',
      imageMobile: 'assets/curso_astrologia.webp',
      cardDesc: 'Descubre el lenguaje de los astros y explora tu mapa astral como un camino de aprendizaje y autoconocimiento.',
      cardDescMobile: 'Formación anual para aprender el lenguaje de los astros y explorar tu carta natal.',
      fullDesc: 'Descubre el lenguaje de los astros y explora tu mapa astral como un camino de aprendizaje y autoconocimiento.\n\nUn recorrido sistemático y vivencial donde cada arquetipo planetario y zodiacal cobra sentido en tu propia biografía.',
      modalQuote: '«Aprender el cielo para comprender la tierra que habitamos por dentro.»',
      format: 'Online · Clases en vivo',
      duration: 'Módulos mensuales',
      detailNote: 'Entrevista previa a la inscripción',
      agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
      defaultMsg: 'Hola Marcela, quisiera solicitar una entrevista previa para conocer el programa de Astrología. Muchas gracias.',
      waChips: ['📅 Fechas de inicio', '📚 Programa y temario', '💻 Modalidad y grabaciones', '💳 Valores y cuotas']
    },
    'curso-tarot-2026': {
      id: 'curso-tarot-2026',
      category: 'courses',
      title: 'Tarot 2026',
      heroLead: 'Viaje del Héroe',
      heroBody: 'Explora las cartas como un camino de aprendizaje, intuición y autoconocimiento que abre nuevas miradas.',
      heroBodyMobile: 'Explora las 78 cartas como un camino vivencial de intuición y autoconocimiento.',
      heroQuote: 'El viaje del alma en 78 cartas.',
      heroNoteNum: '06',
      heroNoteText: 'Arcanos y autoconocimiento',
      kicker: 'Formación Anual · Arcanos Mayores y Menores',
      image: 'assets/curso_tarot.webp',
      imageDisplay: 'assets/curso_tarot.webp',
      imageMobile: 'assets/curso_tarot.webp',
      cardDesc: 'Explora las cartas como un camino de intuición y autoconocimiento. Arcanos, tiradas y relación con tu carta astral.',
      cardDescMobile: 'Formación vivencial en 78 cartas, tiradas y relación con tu carta astral.',
      fullDesc: 'Explora las cartas como un camino de aprendizaje, intuición y autoconocimiento, que abre nuevas miradas sobre tus procesos y la vida.\n\nArcanos Mayores y Menores · Tiradas terapéuticas · Relación con tu carta astral.',
      modalQuote: '«El Tarot no predice tu futuro; te devuelve el poder de crearlo con plena conciencia.»',
      format: 'Online · Grupos reducidos',
      duration: 'Ciclo 2026',
      detailNote: 'Entrevista previa a la inscripción',
      agendaUrl: 'https://calendar.app.google/bakqzB6p1NStA3Hy6',
      defaultMsg: 'Hola Marcela, me interesa conocer más sobre la Formación en Tarot 2026 y consultar si aún quedan cupos para la entrevista previa. Gracias.',
      waChips: ['📅 Cupos y fechas', '📚 Programa detallado', '💻 Grabaciones disponibles', '💳 Medios de pago']
    }
  };

  // Configuración de visibilidad de datos por dispositivo (Desktop, Tablet, Móvil)
  const DEFAULT_DEVICE_SETTINGS = {
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
  };

  const DEVICE_SETTINGS_KEY = 'soy_device_settings_v3';
  let DEVICE_SETTINGS = (() => {
    try {
      const saved = localStorage.getItem(DEVICE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_DEVICE_SETTINGS));
  })();

  let activeEditorDevice = 'desktop';

  function persistDeviceSettings() {
    try {
      localStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(DEVICE_SETTINGS));
    } catch {}
  }

  // Carga de datos con persistencia en localStorage
  const STORAGE_KEY = 'soy_bazar_editor_v2';
  let OFFERS = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_OFFERS));
  })();

  // Estado del Sistema
  let currentHeroId = localStorage.getItem('soy_hero_active_id') || 'floral';
  if (!OFFERS[currentHeroId]) currentHeroId = 'floral';

  let currentCardStyle = localStorage.getItem('soy_bazar_card_style') || 'atelier';
  let currentCategory = 'services';
  let currentActiveModalOffer = null;
  let currentModalScreen = 'detail';
  let lastTriggerElement = null;

  // Guardar en Storage
  function persistData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(OFFERS));
      localStorage.setItem('soy_hero_active_id', currentHeroId);
      localStorage.setItem('soy_bazar_card_style', currentCardStyle);
      persistDeviceSettings();
    } catch {}
  }

  // ==========================================================================
  // ADAPTACIÓN DE DATOS POR DISPOSITIVO (DESKTOP, TABLET, MÓVIL)
  // ==========================================================================
  function applyDeviceDataRules() {
    const curSettings = DEVICE_SETTINGS[activeEditorDevice] || DEFAULT_DEVICE_SETTINGS.desktop;
    const s3Container = document.querySelector('.s3-experience-container');

    if (s3Container) {
      s3Container.classList.toggle('hide-hero-note', !curSettings.heroNote);
      s3Container.classList.toggle('hide-hero-quote', !curSettings.heroQuote);
      s3Container.classList.toggle('hide-hero-secondary', !curSettings.heroSecondaryBtn);
      s3Container.classList.toggle('hide-card-desc', !curSettings.cardDesc);
      s3Container.classList.toggle('clamp-card-desc', activeEditorDevice === 'tablet' || (activeEditorDevice === 'mobile' && curSettings.cardDesc));
      s3Container.classList.toggle('hide-card-kicker', !curSettings.cardKicker);
      s3Container.classList.toggle('hide-card-quote', !curSettings.cardQuote);
      s3Container.classList.toggle('hide-card-duration', !curSettings.cardDuration);
    }
  }

  function setEditorActiveDevice(devKey, syncSimulator = true) {
    if (!['desktop', 'tablet', 'mobile'].includes(devKey)) devKey = 'desktop';
    activeEditorDevice = devKey;

    document.querySelectorAll('.editor-dev-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.deviceTarget === devKey);
    });

    const badge = document.getElementById('editor-active-device-badge');
    if (badge) {
      badge.textContent = devKey === 'desktop' ? 'Escritorio (1440)' : devKey === 'tablet' ? 'Tablet (768/1024)' : 'Móvil (390)';
    }

    const labelHero = document.getElementById('dev-box-hero-label');
    if (labelHero) labelHero.textContent = devKey === 'desktop' ? 'Escritorio' : devKey === 'tablet' ? 'Tablet' : 'Móvil';

    const labelCard = document.getElementById('dev-box-target-label');
    if (labelCard) labelCard.textContent = devKey === 'desktop' ? 'Escritorio' : devKey === 'tablet' ? 'Tablet' : 'Móvil';

    syncDeviceCheckboxesUI();

    if (syncSimulator && typeof window.setDeviceViewport === 'function') {
      const targetSimKey = devKey === 'mobile' ? 'mobile' : devKey === 'tablet' ? 'tablet-portrait' : 'desktop';
      window.setDeviceViewport(targetSimKey);
    }

    applyDeviceDataRules();
    updateHeroDOM();
    updateBazarGrid();
  }

  function syncDeviceCheckboxesUI() {
    const s = DEVICE_SETTINGS[activeEditorDevice] || DEFAULT_DEVICE_SETTINGS.desktop;
    
    const setCb = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(val);
    };

    setCb('dev-toggle-hero-note', s.heroNote);
    setCb('dev-toggle-hero-quote', s.heroQuote);
    setCb('dev-toggle-hero-secondary', s.heroSecondaryBtn);

    setCb('dev-toggle-card-kicker', s.cardKicker);
    setCb('dev-toggle-card-desc', s.cardDesc);
    setCb('dev-toggle-card-duration', s.cardDuration);
    setCb('dev-toggle-card-quote', s.cardQuote);
  }

  window.onDeviceViewportChanged = function(deviceKey) {
    let dev = 'desktop';
    if (deviceKey === 'mobile') dev = 'mobile';
    else if (deviceKey === 'tablet-portrait' || deviceKey === 'tablet-landscape') dev = 'tablet';
    else if (deviceKey === 'desktop' || deviceKey === 'fluid') dev = 'desktop';

    setEditorActiveDevice(dev, false);
  };

  // ==========================================================================
  // 1. SINCRONIZACIÓN DINÁMICA DEL HERO (#inicio)
  // ==========================================================================
  function updateHeroDOM() {
    const heroOffer = OFFERS[currentHeroId] || OFFERS['floral'];
    if (!heroOffer) return;

    applyDeviceDataRules();

    // Título, bajada y cuerpo
    const titleEl = document.getElementById('home-title');
    const leadEl = document.getElementById('home-lead');
    const bodyEl = document.getElementById('home-body');

    if (titleEl) titleEl.textContent = heroOffer.title;
    if (leadEl) leadEl.innerHTML = `<em>${heroOffer.heroLead || ''}</em>`;

    const isMobileMode = activeEditorDevice === 'mobile' || document.body.classList.contains('mode-mobile');
    const heroText = (isMobileMode && heroOffer.heroBodyMobile) ? heroOffer.heroBodyMobile : heroOffer.heroBody;
    if (bodyEl) bodyEl.textContent = heroText;

    // Nota
    const noteEl = document.getElementById('home-note') || document.querySelector('.home-note');
    if (noteEl) {
      noteEl.innerHTML = `<span>${heroOffer.heroNoteNum || '01'}</span><div>${heroOffer.heroNoteText || 'Observación consciente'}</div>`;
    }

    // Cita en la imagen
    const quoteEl = document.getElementById('home-visual-quote') || document.querySelector('.visual-quote');
    if (quoteEl) {
      quoteEl.textContent = heroOffer.heroQuote || 'Conocernos profundamente.';
    }

    // Imagen visual
    const heroImg = document.getElementById('home-hero-img') || document.querySelector('.arch-frame img');
    const heroSource = document.getElementById('home-hero-source') || document.querySelector('.arch-frame source');
    const imgSrc = heroOffer.imageDisplay || heroOffer.image;
    const imgMobile = heroOffer.imageMobile || heroOffer.image;

    if (heroImg) {
      heroImg.src = imgSrc;
      heroImg.alt = `${heroOffer.title} - Marcela`;
    }
    if (heroSource) {
      heroSource.srcset = imgMobile;
    }

    // Botón CTA del Hero
    const heroCta = document.getElementById('hero-floral-link');
    if (heroCta) {
      heroCta.onclick = (e) => {
        e.preventDefault();
        openBazarModal(currentHeroId, heroCta);
      };
    }
  }

  // ==========================================================================
  // 2. SINCRONIZACIÓN DINÁMICA DEL BAZAR (#acompanamientos)
  // Regla de Oro: El servicio/curso en el Hero NO debe mostrar su tarjeta.
  // ==========================================================================
  function updateBazarGrid() {
    applyDeviceDataRules();
    const grid = document.getElementById('service-grid');
    if (!grid) return;

    // Asegurarse de tener la clase matriz
    grid.classList.add('service-bazar-matrix');

    // Filtrar ofertas por categoría activa Y EXCLUIR EL HERO ACTIVO
    const categoryOffers = Object.values(OFFERS).filter(o => o.category === currentCategory);
    const visibleOffers = categoryOffers.filter(o => o.id !== currentHeroId);

    // Actualizar etiquetas en pestañas
    const servicesCount = Object.values(OFFERS).filter(o => o.category === 'services' && o.id !== currentHeroId).length;
    const coursesCount = Object.values(OFFERS).filter(o => o.category === 'courses' && o.id !== currentHeroId).length;

    const servTab = document.getElementById('services-tab');
    const courTab = document.getElementById('courses-tab');
    if (servTab) servTab.textContent = `Servicios (${servicesCount})`;
    if (courTab) courTab.textContent = `Cursos (${coursesCount})`;

    grid.innerHTML = '';

    visibleOffers.forEach(item => {
      const card = createCardElement(item, currentCardStyle);
      grid.appendChild(card);
    });
  }

  function createCardElement(item, style) {
    const article = document.createElement('article');
    article.className = 'card-interactive';
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `Abrir detalles de ${item.title}`);
    article.onclick = () => openBazarModal(item.id, article);
    article.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBazarModal(item.id, article);
      }
    };

    const imgSrc = item.imageDisplay || item.image;
    const isMobileMode = activeEditorDevice === 'mobile' || document.body.classList.contains('mode-mobile');
    const cardDescription = (isMobileMode && item.cardDescMobile) ? item.cardDescMobile : (item.cardDesc || item.fullDesc.split('\n')[0]);

    if (style === 'baseline') {
      article.classList.add('card-baseline');
      article.innerHTML = `
        <div class="baseline-photo"><img src="${imgSrc}" alt="${item.title}"></div>
        <div class="baseline-content">
          <span class="baseline-badge">${item.category === 'courses' ? 'Formación' : 'Servicio'}</span>
          <h3 class="baseline-title">${item.title}</h3>
          <span class="baseline-action">+ CONOCER ✦</span>
        </div>
      `;
    } else if (style === 'portal') {
      article.classList.add('card-portal');
      article.innerHTML = `
        <div class="portal-vault">
          <img src="${imgSrc}" alt="${item.title}">
          <span class="portal-badge">${item.category === 'courses' ? 'Formación' : 'Acompañamiento'}</span>
        </div>
        <div class="portal-body">
          <h3 class="portal-title">${item.title}</h3>
          <div class="portal-symbol">✦</div>
          <p class="portal-desc">${cardDescription}</p>
        </div>
        <div class="portal-footer">
          <span class="portal-duration">${item.duration} · Zoom</span>
          <button type="button" class="portal-btn">Explorar ✦</button>
        </div>
      `;
    } else if (style === 'notebook') {
      article.classList.add('card-notebook');
      article.innerHTML = `
        <div class="notebook-top">
          <img src="${imgSrc}" alt="${item.title}">
          <span class="notebook-tag">${item.category === 'courses' ? 'Curso' : 'Sesión'}</span>
        </div>
        <div class="notebook-content">
          <span class="notebook-meta">${item.kicker || 'Acompañamiento'}</span>
          <h3 class="notebook-title">${item.title}</h3>
          ${item.modalQuote ? `<div class="notebook-quote">${item.modalQuote}</div>` : ''}
          <p class="notebook-desc" style="font-size:.9rem; color:#554a40; line-height:1.45;">${cardDescription}</p>
        </div>
        <div class="notebook-footer">
          <span>${item.duration} · ${item.detailNote || 'Zoom'}</span>
          <button type="button" class="notebook-btn">Conocer ✦</button>
        </div>
      `;
    } else if (style === 'alchemy') {
      article.classList.add('card-alchemy');
      article.innerHTML = `
        <div class="alchemy-photo"><img src="${imgSrc}" alt="${item.title}"></div>
        <span class="alchemy-meta">${item.kicker || 'Autoconocimiento'}</span>
        <h3 class="alchemy-title">${item.title}</h3>
        <p class="alchemy-desc">${cardDescription}</p>
        <div class="alchemy-footer">
          <span class="alchemy-duration">${item.duration} · Zoom</span>
          <button type="button" class="alchemy-btn">Explorar ✦</button>
        </div>
      `;
    } else {
      // Por defecto: 1 · Lámina Atelier
      article.classList.add('card-atelier');
      article.innerHTML = `
        <div class="atelier-photo"><img src="${imgSrc}" alt="${item.title}"></div>
        <span class="atelier-meta">${item.kicker || 'Acompañamiento'}</span>
        <h3 class="atelier-title">${item.title}</h3>
        <p class="atelier-desc">${cardDescription}</p>
        <div class="atelier-footer">
          <span class="atelier-duration">${item.duration} · Zoom</span>
          <span class="atelier-action">Conocer ✦</span>
        </div>
      `;
    }

    return article;
  }

  // ==========================================================================
  // 3. DIÁLOGO MODAL INTERACTIVO DE 2 PANTALLAS (CON MOMENTUM & WA)
  // ==========================================================================
  function ensureModalDOM() {
    let dialog = document.getElementById('bazar-live-dialog');
    if (dialog) return dialog;

    dialog = document.createElement('dialog');
    dialog.id = 'bazar-live-dialog';
    dialog.className = 'bazar-modal-dialog';
    dialog.setAttribute('aria-labelledby', 'bazar-dialog-title');

    dialog.innerHTML = `
      <button type="button" class="dialog-close-btn" id="bazar-dialog-close" aria-label="Cerrar ventana">×</button>
      <div class="modal-deck-container">
        <!-- Columna Izquierda Multimedia -->
        <div class="modal-media-col">
          <img id="bazar-modal-img" src="" alt="">
          <div class="modal-media-overlay" id="bazar-modal-media-overlay">
            <div class="modal-contact-badge">
              <span class="badge-icon">🌿</span>
              <div>
                <span class="badge-title">Marcela</span>
                <span class="badge-sub">Terapeuta Floral & Guía Holística</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha con Deck de 2 Pantallas -->
        <div class="modal-deck-screens showing-detail" id="bazar-dialog-deck">
          
          <!-- Pantalla 1: Detalle de Sesión -->
          <div class="modal-screen" id="screen-detail">
            <div>
              <span class="detail-kicker" id="bazar-dialog-kicker">Acompañamiento</span>
              <h2 class="detail-title" id="bazar-dialog-title">Título</h2>
            </div>
            <div class="detail-quote" id="bazar-dialog-quote"></div>
            <div class="detail-desc" id="bazar-dialog-desc"></div>
            <div class="detail-specs-row">
              <span class="detail-spec-chip" id="bazar-dialog-format">Online · Zoom</span>
              <span class="detail-spec-chip" id="bazar-dialog-duration">1 hora</span>
              <span class="detail-spec-chip" id="bazar-dialog-detail">Fórmula personalizada</span>
            </div>
            <div class="detail-actions-row">
              <a class="btn-detail-agenda" id="bazar-dialog-agenda-btn" target="_blank" rel="noopener noreferrer">
                Agendar en Calendar 📅
              </a>
              <button type="button" class="btn-detail-whatsapp" id="bazar-dialog-go-wa-btn">
                <span>Personalizar & WhatsApp</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20l.9-4.7a8.5 8.5 0 1 1 16.6-3.6Z"/></svg>
              </button>
            </div>
          </div>

          <!-- Pantalla 2: Personalizador de WhatsApp -->
          <div class="modal-screen" id="screen-whatsapp">
            <div class="wa-back-header">
              <button type="button" class="btn-wa-back" id="bazar-wa-back-btn">
                ← Volver a detalles
              </button>
              <span style="font-family:var(--bazar-font-ui); font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; color:var(--bazar-gold);">
                Consulta Directa
              </span>
            </div>

            <div>
              <h2 style="font-family:var(--bazar-font-display); font-size:1.8rem; color:var(--bazar-navy); line-height:1.15;">
                Personaliza tu mensaje
              </h2>
              <p style="font-size:.9rem; color:var(--bazar-muted); margin-top:.2rem;">
                Añade tus inquietudes con los chips o escribe libremente antes de enviar.
              </p>
            </div>

            <div>
              <span style="font-family:var(--bazar-font-ui); font-size:.74rem; letter-spacing:.08em; text-transform:uppercase; color:var(--bazar-gold); display:block; margin-bottom:.35rem;">
                Preguntas frecuentes (haz clic para agregar):
              </span>
              <div class="wa-chips-row" id="bazar-wa-chips-container"></div>
            </div>

            <div class="wa-textarea-wrapper">
              <textarea class="wa-textarea" id="bazar-wa-textarea" rows="4" aria-label="Mensaje para WhatsApp"></textarea>
              <div class="wa-meta-row">
                <span id="bazar-wa-char-count">0 caracteres</span>
                <button type="button" class="wa-reset-btn" id="bazar-wa-reset-btn">Restablecer plantilla</button>
              </div>
            </div>

            <button type="button" class="btn-send-whatsapp" id="bazar-wa-send-btn">
              <span>Enviar a WhatsApp (+56 9 9238 8057) ↗</span>
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Eventos del modal
    document.getElementById('bazar-dialog-close').onclick = closeBazarModal;
    document.getElementById('bazar-dialog-go-wa-btn').onclick = goToWhatsAppScreen;
    document.getElementById('bazar-wa-back-btn').onclick = goToDetailScreen;
    document.getElementById('bazar-wa-reset-btn').onclick = resetWhatsAppTemplate;
    document.getElementById('bazar-wa-send-btn').onclick = sendCustomWhatsApp;

    const textarea = document.getElementById('bazar-wa-textarea');
    textarea.addEventListener('input', () => {
      document.getElementById('bazar-wa-char-count').textContent = `${textarea.value.length} caracteres`;
    });

    // Cerrar al hacer clic en el backdrop
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeBazarModal();
    });

    // Escape jerárquico
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (currentModalScreen === 'whatsapp') {
        goToDetailScreen();
      } else {
        closeBazarModal();
      }
    });

    return dialog;
  }

  function openBazarModal(offerId, triggerEl) {
    const offer = OFFERS[offerId];
    if (!offer) return;

    lastTriggerElement = triggerEl || document.activeElement;
    currentActiveModalOffer = offer;
    const dialog = ensureModalDOM();

    // Imagen
    document.getElementById('bazar-modal-img').src = offer.imageDisplay || offer.image;
    document.getElementById('bazar-modal-img').alt = offer.title;

    // Pantalla 1: Detalle
    document.getElementById('bazar-dialog-kicker').textContent = offer.kicker || 'Acompañamiento';
    document.getElementById('bazar-dialog-title').textContent = offer.title;
    
    const quoteEl = document.getElementById('bazar-dialog-quote');
    if (offer.modalQuote) {
      quoteEl.textContent = offer.modalQuote;
      quoteEl.hidden = false;
    } else {
      quoteEl.hidden = true;
    }

    document.getElementById('bazar-dialog-desc').textContent = offer.fullDesc || offer.cardDesc;
    document.getElementById('bazar-dialog-format').textContent = offer.format || 'Online · Zoom';
    document.getElementById('bazar-dialog-duration').textContent = offer.duration || '1 hora';
    document.getElementById('bazar-dialog-detail').textContent = offer.detailNote || 'Acompañamiento personalizado';

    const agendaBtn = document.getElementById('bazar-dialog-agenda-btn');
    if (offer.agendaUrl) {
      agendaBtn.href = offer.agendaUrl;
      agendaBtn.hidden = false;
    } else {
      agendaBtn.hidden = true;
    }

    // Pantalla 2: WhatsApp
    const textarea = document.getElementById('bazar-wa-textarea');
    textarea.value = offer.defaultMsg || `Hola Marcela, me gustaría consultar por ${offer.title}. Gracias.`;
    document.getElementById('bazar-wa-char-count').textContent = `${textarea.value.length} caracteres`;

    // Renderizar chips de WhatsApp
    const chipsContainer = document.getElementById('bazar-wa-chips-container');
    chipsContainer.innerHTML = '';
    const chips = offer.waChips && offer.waChips.length ? offer.waChips : ['📅 Horarios', '💻 Modalidad online', '🌿 Preparación', '💳 Valores'];
    chips.forEach(chipText => {
      const chipBtn = document.createElement('button');
      chipBtn.type = 'button';
      chipBtn.className = 'wa-topic-chip';
      chipBtn.textContent = chipText;
      chipBtn.onclick = () => {
        if (!textarea.value.includes(chipText)) {
          textarea.value = textarea.value.trim() + '\n\n' + chipText;
          chipBtn.classList.add('is-added');
        }
        document.getElementById('bazar-wa-char-count').textContent = `${textarea.value.length} caracteres`;
        textarea.focus();
      };
      chipsContainer.appendChild(chipBtn);
    });

    goToDetailScreen();
    dialog.classList.remove('is-closing');
    dialog.showModal();
  }

  function goToWhatsAppScreen() {
    currentModalScreen = 'whatsapp';
    const deck = document.getElementById('bazar-dialog-deck');
    const dialog = document.getElementById('bazar-live-dialog');
    deck.classList.remove('showing-detail');
    deck.classList.add('showing-whatsapp');
    dialog.classList.add('state-whatsapp');

    const textarea = document.getElementById('bazar-wa-textarea');
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 340);
  }

  function goToDetailScreen() {
    currentModalScreen = 'detail';
    const deck = document.getElementById('bazar-dialog-deck');
    const dialog = document.getElementById('bazar-live-dialog');
    deck.classList.remove('showing-whatsapp');
    deck.classList.add('showing-detail');
    dialog.classList.remove('state-whatsapp');
  }

  function resetWhatsAppTemplate() {
    if (!currentActiveModalOffer) return;
    const textarea = document.getElementById('bazar-wa-textarea');
    textarea.value = currentActiveModalOffer.defaultMsg || '';
    document.getElementById('bazar-wa-char-count').textContent = `${textarea.value.length} caracteres`;
    document.querySelectorAll('.wa-topic-chip').forEach(c => c.classList.remove('is-added'));
    textarea.focus();
  }

  function sendCustomWhatsApp() {
    const textarea = document.getElementById('bazar-wa-textarea');
    const msg = encodeURIComponent(textarea.value.trim());
    window.open(`https://wa.me/56992388057?text=${msg}`, '_blank', 'noopener,noreferrer');
  }

  function closeBazarModal() {
    const dialog = document.getElementById('bazar-live-dialog');
    if (!dialog || !dialog.open) return;

    dialog.classList.add('is-closing');
    setTimeout(() => {
      dialog.close();
      dialog.classList.remove('is-closing', 'state-whatsapp');
      goToDetailScreen();
      if (lastTriggerElement && typeof lastTriggerElement.focus === 'function') {
        lastTriggerElement.focus();
      }
    }, 200);
  }

  // ==========================================================================
  // 4. EDITOR DE CONTENIDOS EN TIEMPO REAL (DRAWER COLAPSABLE)
  // ==========================================================================
  function ensureEditorDrawerDOM() {
    // 1. Botón Flotante
    let toggleBtn = document.getElementById('editor-toggle-btn');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'editor-toggle-btn';
      toggleBtn.type = 'button';
      toggleBtn.className = 'floating-editor-trigger';
      toggleBtn.setAttribute('aria-label', 'Abrir Editor de Contenidos (Tecla E)');
      toggleBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        <span>Editor de Contenidos</span>
      `;
      toggleBtn.onclick = toggleEditorDrawer;
      document.body.appendChild(toggleBtn);
    }

    // 2. Drawer de Edición
    let drawer = document.getElementById('preview-editor-drawer');
    if (drawer) return drawer;

    drawer = document.createElement('aside');
    drawer.id = 'preview-editor-drawer';
    drawer.className = 'preview-editor-drawer';
    drawer.setAttribute('aria-label', 'Editor de contenidos en tiempo real');

    drawer.innerHTML = `
      <div class="editor-drawer-header">
        <div class="editor-title-group">
          <span class="editor-badge">Modo Preview · En Vivo</span>
          <h2 class="editor-heading">Editor de Contenidos</h2>
        </div>
        <button type="button" class="editor-close-btn" id="editor-drawer-close" aria-label="Cerrar editor">×</button>
      </div>

      <div class="editor-nav-tabs">
        <button type="button" class="editor-tab-btn is-active" data-editor-tab="hero">🌟 Hero</button>
        <button type="button" class="editor-tab-btn" data-editor-tab="card">🎴 Tarjeta</button>
        <button type="button" class="editor-tab-btn" data-editor-tab="modal">💬 Adentro (Modal)</button>
      </div>

      <div class="editor-drawer-body">
        
        <!-- SELECTOR DE DISPOSITIVO ACTIVO (DESKTOP, TABLET, MÓVIL) -->
        <div class="editor-device-selector-dock">
          <div class="editor-device-header">
            <span class="editor-device-title">Datos por Dispositivo:</span>
            <span class="editor-device-badge" id="editor-active-device-badge">Escritorio (1440)</span>
          </div>
          <div class="editor-device-btns">
            <button type="button" class="editor-dev-btn is-active" data-device-target="desktop">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></svg>
              <span>Escritorio</span>
            </button>
            <button type="button" class="editor-dev-btn" data-device-target="tablet">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/></svg>
              <span>Tablet</span>
            </button>
            <button type="button" class="editor-dev-btn" data-device-target="mobile">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></svg>
              <span>Móvil</span>
            </button>
          </div>
        </div>

        <!-- PESTAÑA 1: HERO -->
        <div class="editor-tab-content is-active" id="tab-content-hero">
          <div class="editor-highlight-box">
            <strong>Regla de Hero y Bazar:</strong> El servicio o curso que esté seleccionado como protagonista en el Hero se mostrará en portada y <em>automáticamente se excluirá de la grilla del Bazar</em>.
          </div>

          <!-- Toggles de Datos del Hero según dispositivo -->
          <div class="editor-device-card-box">
            <div class="device-box-heading">
              <span>Campos del Hero visibles en <strong id="dev-box-hero-label">Escritorio</strong>:</span>
            </div>
            <div class="device-toggles-grid">
              <label class="device-checkbox-item">
                <input type="checkbox" id="dev-toggle-hero-note">
                <span>Nota numérica (01 Observación)</span>
              </label>
              <label class="device-checkbox-item">
                <input type="checkbox" id="dev-toggle-hero-quote">
                <span>Cita sobre fotografía</span>
              </label>
              <label class="device-checkbox-item">
                <input type="checkbox" id="dev-toggle-hero-secondary">
                <span>Botón secundario ("Ver todos los caminos")</span>
              </label>
            </div>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-hero-select">Servicio / Curso en el Hero:</label>
            <select class="editor-select" id="ed-hero-select"></select>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-hero-title">Título Principal del Hero:</label>
            <input type="text" class="editor-input" id="ed-hero-title">
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-hero-lead">Bajada / Énfasis (Cursiva):</label>
            <input type="text" class="editor-input" id="ed-hero-lead">
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-hero-body">Texto descriptivo estándar (Escritorio/Tablet):</label>
            <textarea class="editor-textarea" id="ed-hero-body" rows="3"></textarea>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-hero-body-mobile">Texto descriptivo para Móvil (opcional):</label>
            <textarea class="editor-textarea" id="ed-hero-body-mobile" rows="2" placeholder="Versión sintética para pantallas táctiles..."></textarea>
            <span class="editor-help-text">Si se completa, se muestra en móvil en lugar del texto extenso de escritorio.</span>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-hero-quote">Cita sobre la fotografía:</label>
            <input type="text" class="editor-input" id="ed-hero-quote">
          </div>

          <div style="display:grid; grid-template-columns: 5rem 1fr; gap:.5rem;">
            <div class="editor-field-group">
              <label class="editor-label" for="ed-hero-num">N° Nota:</label>
              <input type="text" class="editor-input" id="ed-hero-num">
            </div>
            <div class="editor-field-group">
              <label class="editor-label" for="ed-hero-notetext">Texto de Nota:</label>
              <input type="text" class="editor-input" id="ed-hero-notetext">
            </div>
          </div>
        </div>

        <!-- PESTAÑA 2: TARJETA EN EL BAZAR -->
        <div class="editor-tab-content" id="tab-content-card">
          <!-- Toggles de Datos de Tarjeta según dispositivo -->
          <div class="editor-device-card-box">
            <div class="device-box-heading">
              <span>Campos de Tarjeta visibles en <strong id="dev-box-target-label">Escritorio</strong>:</span>
            </div>
            <div class="device-toggles-grid">
              <label class="device-checkbox-item">
                <input type="checkbox" id="dev-toggle-card-kicker">
                <span>Kicker / Subtítulo superior</span>
              </label>
              <label class="device-checkbox-item">
                <input type="checkbox" id="dev-toggle-card-desc">
                <span>Párrafo de descripción en tarjeta</span>
              </label>
              <label class="device-checkbox-item">
                <input type="checkbox" id="dev-toggle-card-duration">
                <span>Duración y formato</span>
              </label>
              <label class="device-checkbox-item">
                <input type="checkbox" id="dev-toggle-card-quote">
                <span>Cita en tarjeta (Cuaderno de Sabiduría)</span>
              </label>
            </div>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-card-style-select">Estilo Visual de Tarjetas:</label>
            <select class="editor-select" id="ed-card-style-select">
              <option value="atelier">1 · Lámina de Atelier (Elegante y Limpio)</option>
              <option value="portal">2 · Portal Arquetípico (Bóveda Arqueada)</option>
              <option value="notebook">3 · Cuaderno de Sabiduría (Cálido y Humano)</option>
              <option value="alchemy">4 · Atmósfera Alquímica (Misterio y Noche)</option>
              <option value="baseline">0 · Actual en Sitio (Baseline)</option>
            </select>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-card-offer-select">Oferta a editar en tarjeta:</label>
            <select class="editor-select" id="ed-card-offer-select"></select>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-card-title">Título de la Tarjeta:</label>
            <input type="text" class="editor-input" id="ed-card-title">
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-card-kicker">Kicker / Categoría superior:</label>
            <input type="text" class="editor-input" id="ed-card-kicker">
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-card-desc">Descripción estándar (Escritorio/Tablet):</label>
            <textarea class="editor-textarea" id="ed-card-desc" rows="3"></textarea>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-card-desc-mobile">Descripción concisa para Móvil (opcional):</label>
            <textarea class="editor-textarea" id="ed-card-desc-mobile" rows="2" placeholder="Frase corta para catálogo ágil en móvil..."></textarea>
            <span class="editor-help-text">Permite mantener la tarjeta compacta y de fácil escaneo en pantallas móviles.</span>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-card-duration">Duración / Formato visible:</label>
            <input type="text" class="editor-input" id="ed-card-duration">
          </div>
        </div>

        <!-- PESTAÑA 3: ADENTRO DE LA TARJETA (MODAL & WHATSAPP) -->
        <div class="editor-tab-content" id="tab-content-modal">
          <div class="editor-field-group">
            <label class="editor-label" for="ed-modal-offer-select">Oferta a editar en modal:</label>
            <select class="editor-select" id="ed-modal-offer-select"></select>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-modal-quote">Cita reflexiva en modal:</label>
            <textarea class="editor-textarea" id="ed-modal-quote" rows="2"></textarea>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-modal-desc">Descripción completa y proceso:</label>
            <textarea class="editor-textarea" id="ed-modal-desc" rows="5"></textarea>
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-modal-detailnote">Detalle de valor / fórmula:</label>
            <input type="text" class="editor-input" id="ed-modal-detailnote">
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-modal-agenda">URL de Agenda en Calendar:</label>
            <input type="url" class="editor-input" id="ed-modal-agenda">
          </div>

          <div class="editor-field-group">
            <label class="editor-label" for="ed-modal-defaultmsg">Plantilla de mensaje WhatsApp:</label>
            <textarea class="editor-textarea" id="ed-modal-defaultmsg" rows="3"></textarea>
          </div>
        </div>

      </div>

      <div class="editor-drawer-footer">
        <button type="button" class="btn-editor-reset" id="ed-btn-reset">Restablecer Originales</button>
        <button type="button" class="btn-editor-done" id="ed-btn-done">Ver Sitio Limpio ✦</button>
      </div>
    `;

    document.body.appendChild(drawer);

    // Eventos del Drawer
    document.getElementById('editor-drawer-close').onclick = toggleEditorDrawer;
    document.getElementById('ed-btn-done').onclick = toggleEditorDrawer;
    document.getElementById('ed-btn-reset').onclick = resetAllContentToDefaults;

    // Pestañas del Editor
    drawer.querySelectorAll('.editor-tab-btn').forEach(btn => {
      btn.onclick = () => {
        drawer.querySelectorAll('.editor-tab-btn').forEach(b => b.classList.remove('is-active'));
        drawer.querySelectorAll('.editor-tab-content').forEach(c => c.classList.remove('is-active'));
        btn.classList.add('is-active');
        const tabId = btn.dataset.editorTab;
        document.getElementById(`tab-content-${tabId}`)?.classList.add('is-active');
      };
    });

    // Rellenar Selectores de Oferta
    populateEditorOfferSelects();

    // Eventos de botones de dispositivo (Escritorio, Tablet, Móvil)
    drawer.querySelectorAll('.editor-dev-btn').forEach(btn => {
      btn.onclick = () => {
        const targetDev = btn.dataset.deviceTarget;
        setEditorActiveDevice(targetDev, true);
      };
    });

    // Eventos de checkboxes de visibilidad por dispositivo
    setupDeviceCheckboxEvents();
    syncDeviceCheckboxesUI();

    // Sincronizar inputs al cambiar de oferta
    document.getElementById('ed-card-offer-select').onchange = (e) => loadCardEditorValues(e.target.value);
    document.getElementById('ed-modal-offer-select').onchange = (e) => loadModalEditorValues(e.target.value);

    // Selector de Estilo de Tarjetas
    const styleSelect = document.getElementById('ed-card-style-select');
    styleSelect.value = currentCardStyle;
    styleSelect.onchange = (e) => {
      currentCardStyle = e.target.value;
      persistData();
      updateBazarGrid();
    };

    // Selector de Oferta Hero
    const heroSelect = document.getElementById('ed-hero-select');
    heroSelect.value = currentHeroId;
    heroSelect.onchange = (e) => {
      currentHeroId = e.target.value;
      persistData();
      loadHeroEditorValues(currentHeroId);
      updateHeroDOM();
      updateBazarGrid(); // ¡Re-filtra el Bazar inmediatamente!
    };

    // Vincular inputs reactivos
    bindReactiveInputs();

    return drawer;
  }

  function toggleEditorDrawer() {
    const drawer = document.getElementById('preview-editor-drawer');
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('is-open');
    drawer.setAttribute('aria-hidden', String(!isOpen));
  }

  function populateEditorOfferSelects() {
    const heroSelect = document.getElementById('ed-hero-select');
    const cardSelect = document.getElementById('ed-card-offer-select');
    const modalSelect = document.getElementById('ed-modal-offer-select');

    if (!heroSelect || !cardSelect || !modalSelect) return;

    const optionsHTML = Object.values(OFFERS).map(o => 
      `<option value="${o.id}">${o.title} (${o.category === 'courses' ? 'Curso' : 'Servicio'})</option>`
    ).join('');

    heroSelect.innerHTML = optionsHTML;
    cardSelect.innerHTML = optionsHTML;
    modalSelect.innerHTML = optionsHTML;

    heroSelect.value = currentHeroId;
    cardSelect.value = currentHeroId;
    modalSelect.value = currentHeroId;

    loadHeroEditorValues(currentHeroId);
    loadCardEditorValues(currentHeroId);
    loadModalEditorValues(currentHeroId);
  }

  function loadHeroEditorValues(id) {
    const item = OFFERS[id];
    if (!item) return;
    document.getElementById('ed-hero-title').value = item.title || '';
    document.getElementById('ed-hero-lead').value = item.heroLead || '';
    document.getElementById('ed-hero-body').value = item.heroBody || '';
    const mobileBody = document.getElementById('ed-hero-body-mobile');
    if (mobileBody) mobileBody.value = item.heroBodyMobile || '';
    document.getElementById('ed-hero-quote').value = item.heroQuote || '';
    document.getElementById('ed-hero-num').value = item.heroNoteNum || '01';
    document.getElementById('ed-hero-notetext').value = item.heroNoteText || '';
  }

  function loadCardEditorValues(id) {
    const item = OFFERS[id];
    if (!item) return;
    document.getElementById('ed-card-title').value = item.title || '';
    document.getElementById('ed-card-kicker').value = item.kicker || '';
    document.getElementById('ed-card-desc').value = item.cardDesc || '';
    const mobileDesc = document.getElementById('ed-card-desc-mobile');
    if (mobileDesc) mobileDesc.value = item.cardDescMobile || '';
    document.getElementById('ed-card-duration').value = item.duration || '';
  }

  function loadModalEditorValues(id) {
    const item = OFFERS[id];
    if (!item) return;
    document.getElementById('ed-modal-quote').value = item.modalQuote || '';
    document.getElementById('ed-modal-desc').value = item.fullDesc || '';
    document.getElementById('ed-modal-detailnote').value = item.detailNote || '';
    document.getElementById('ed-modal-agenda').value = item.agendaUrl || '';
    document.getElementById('ed-modal-defaultmsg').value = item.defaultMsg || '';
  }

  function setupDeviceCheckboxEvents() {
    const bindToggle = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        if (!DEVICE_SETTINGS[activeEditorDevice]) {
          DEVICE_SETTINGS[activeEditorDevice] = JSON.parse(JSON.stringify(DEFAULT_DEVICE_SETTINGS[activeEditorDevice] || DEFAULT_DEVICE_SETTINGS.desktop));
        }
        DEVICE_SETTINGS[activeEditorDevice][key] = el.checked;
        persistDeviceSettings();
        applyDeviceDataRules();
        updateHeroDOM();
        updateBazarGrid();
      });
    };

    bindToggle('dev-toggle-hero-note', 'heroNote');
    bindToggle('dev-toggle-hero-quote', 'heroQuote');
    bindToggle('dev-toggle-hero-secondary', 'heroSecondaryBtn');

    bindToggle('dev-toggle-card-kicker', 'cardKicker');
    bindToggle('dev-toggle-card-desc', 'cardDesc');
    bindToggle('dev-toggle-card-duration', 'cardDuration');
    bindToggle('dev-toggle-card-quote', 'cardQuote');
  }

  function bindReactiveInputs() {
    // 1. Hero Inputs
    const heroInputs = [
      { id: 'ed-hero-title', key: 'title', dom: 'home-title' },
      { id: 'ed-hero-lead', key: 'heroLead', dom: 'home-lead', html: true },
      { id: 'ed-hero-body', key: 'heroBody', dom: 'home-body' },
      { id: 'ed-hero-quote', key: 'heroQuote', dom: 'home-visual-quote' }
    ];

    heroInputs.forEach(({ id, key, dom, html }) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('input', () => {
        const item = OFFERS[currentHeroId];
        if (item) {
          item[key] = input.value;
          const el = document.getElementById(dom);
          if (el) {
            if (html) el.innerHTML = `<em>${input.value}</em>`;
            else el.textContent = input.value;
          }
          persistData();
        }
      });
    });

    const edHeroBodyMobile = document.getElementById('ed-hero-body-mobile');
    if (edHeroBodyMobile) {
      edHeroBodyMobile.addEventListener('input', () => {
        const item = OFFERS[currentHeroId];
        if (item) {
          item.heroBodyMobile = edHeroBodyMobile.value;
          persistData();
          updateHeroDOM();
        }
      });
    }

    const noteNum = document.getElementById('ed-hero-num');
    const noteText = document.getElementById('ed-hero-notetext');
    const onNoteChange = () => {
      const item = OFFERS[currentHeroId];
      if (item) {
        item.heroNoteNum = noteNum.value;
        item.heroNoteText = noteText.value;
        const noteEl = document.getElementById('home-note') || document.querySelector('.home-note');
        if (noteEl) noteEl.innerHTML = `<span>${item.heroNoteNum}</span><div>${item.heroNoteText}</div>`;
        persistData();
      }
    };
    noteNum?.addEventListener('input', onNoteChange);
    noteText?.addEventListener('input', onNoteChange);

    // 2. Card Inputs
    const cardInputs = [
      { id: 'ed-card-title', key: 'title' },
      { id: 'ed-card-kicker', key: 'kicker' },
      { id: 'ed-card-desc', key: 'cardDesc' },
      { id: 'ed-card-duration', key: 'duration' }
    ];

    cardInputs.forEach(({ id, key }) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('input', () => {
        const selId = document.getElementById('ed-card-offer-select').value;
        const item = OFFERS[selId];
        if (item) {
          item[key] = input.value;
          persistData();
          updateBazarGrid();
        }
      });
    });

    const edCardDescMobile = document.getElementById('ed-card-desc-mobile');
    if (edCardDescMobile) {
      edCardDescMobile.addEventListener('input', () => {
        const selId = document.getElementById('ed-card-offer-select').value;
        const item = OFFERS[selId];
        if (item) {
          item.cardDescMobile = edCardDescMobile.value;
          persistData();
          updateBazarGrid();
        }
      });
    }

    // 3. Modal Inputs
    const modalInputs = [
      { id: 'ed-modal-quote', key: 'modalQuote' },
      { id: 'ed-modal-desc', key: 'fullDesc' },
      { id: 'ed-modal-detailnote', key: 'detailNote' },
      { id: 'ed-modal-agenda', key: 'agendaUrl' },
      { id: 'ed-modal-defaultmsg', key: 'defaultMsg' }
    ];

    modalInputs.forEach(({ id, key }) => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('input', () => {
        const selId = document.getElementById('ed-modal-offer-select').value;
        const item = OFFERS[selId];
        if (item) {
          item[key] = input.value;
          persistData();
        }
      });
    });
  }

  function resetAllContentToDefaults() {
    OFFERS = JSON.parse(JSON.stringify(DEFAULT_OFFERS));
    DEVICE_SETTINGS = JSON.parse(JSON.stringify(DEFAULT_DEVICE_SETTINGS));
    currentHeroId = 'floral';
    currentCardStyle = 'atelier';
    activeEditorDevice = 'desktop';
    persistData();
    populateEditorOfferSelects();
    setEditorActiveDevice('desktop', true);
  }

  // Atajo de teclado: Tecla E para abrir/cerrar editor
  document.addEventListener('keydown', (e) => {
    // No disparar si está escribiendo en un input o textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'e' || e.key === 'E') {
      e.preventDefault();
      toggleEditorDrawer();
    }
  });

  // ==========================================================================
  // 5. INICIALIZACIÓN GLOBAL
  // ==========================================================================
  function initPreviewBazarEditor() {
    const s3Container = document.querySelector('.s3-experience-container');
    if (!s3Container) {
      // Aislamiento estricto: no intervenir el DOM si no existe el contenedor de Sistema 3
      return;
    }

    // 1. Configurar alternador de categorías en el Bazar
    const servTab = document.getElementById('services-tab');
    const courTab = document.getElementById('courses-tab');

    if (servTab && courTab) {
      servTab.onclick = (e) => {
        e.preventDefault();
        currentCategory = 'services';
        servTab.classList.add('is-active');
        servTab.setAttribute('aria-selected', 'true');
        courTab.classList.remove('is-active');
        courTab.setAttribute('aria-selected', 'false');
        updateBazarGrid();
      };

      courTab.onclick = (e) => {
        e.preventDefault();
        currentCategory = 'courses';
        courTab.classList.add('is-active');
        courTab.setAttribute('aria-selected', 'true');
        servTab.classList.remove('is-active');
        servTab.setAttribute('aria-selected', 'false');
        updateBazarGrid();
      };
    }

    // 2. Inyectar Modal y Drawer de Edición
    ensureModalDOM();
    ensureEditorDrawerDOM();

    // 3. Renderizar Hero y Bazar iniciales
    updateHeroDOM();
    updateBazarGrid();
    // Exponer API pública en window para interoperabilidad entre sistemas
    window.updateHeroDOM = updateHeroDOM;
    window.updateBazarGrid = updateBazarGrid;
    window.openBazarModal = openBazarModal;
    window.toggleEditorDrawer = toggleEditorDrawer;
    window.resetAllContentToDefaults = resetAllContentToDefaults;
    window.setEditorActiveDevice = setEditorActiveDevice;
    window.applyDeviceDataRules = applyDeviceDataRules;
  }

  // Arrancar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreviewBazarEditor);
  } else {
    initPreviewBazarEditor();
  }

})();

