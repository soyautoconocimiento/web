/* ==========================================================
   SOY AUTOCONOCIMIENTO 2.5 - ARQUITECTURA DE CONTROL DE FLUIDEZ
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderOfferingCards();
  renderTestimonials();
  initWelcomePreload();
  initBazarTabs();
  initEngineScrollSnap();
  initContinuousAmbientDepth();
  initAboutPresenceBubble();
  initOnDemandAboutModal();
  initServiceModal();
  initCarouselCenter();
  initLazyVisuals();
});

/* ==========================================================
   RENDERIZADO DE TARJETAS (Servicios y Cursos) DESDE data.js
   ========================================================== */
function renderOfferingCards() {
  if (typeof SITE_DATA === "undefined") return;

  /* Diseño de carta full-bleed congelado para todas las ofertas. */
  const fullBleedSliceIds = new Set([
    "tarot",
    "constelaciones",
    "carta-astral",
    "curso-astrologia",
    "curso-tarot-2026"
  ]);

  const renderGrid = (gridEl, items) => {
    if (!gridEl) return;
    gridEl.innerHTML = items.map(item => {
      const isFullBleedSlice = fullBleedSliceIds.has(item.id);
      const cardContent = isFullBleedSlice
        ? `
          <button class="service-card-action" type="button">
            <span class="service-visual" data-bg="${item.image}" aria-hidden="true"></span>
            <span class="service-card-copy">
              <span class="service-card-title" role="heading" aria-level="3">${item.title}</span>
              <span class="service-card-cta">Explorar</span>
            </span>
          </button>`
        : `
          <div class="service-visual" data-bg="${item.image}"></div>
          <div class="service-body">
            <h3>${item.title}</h3>
            <button class="service-button" type="button">Explorar</button>
          </div>`;

      return `
      <article class="service-card${isFullBleedSlice ? " service-card--full-bleed" : ""}"
               data-title="${item.title}"
               data-description="${item.description}"
               data-format="${item.format}"
               data-duration="${item.duration}"
               data-url-agenda="${item.urlAgenda}"
               data-type="${item.type || "service"}">
        ${cardContent}
      </article>
    `;
    }).join("");
  };

  renderGrid(document.getElementById("services-grid"), SITE_DATA.services);
  renderGrid(document.getElementById("courses-grid"), SITE_DATA.courses);
}

/* ==========================================================
   APERTURA Y PRECALENTAMIENTO DE ASSETS
   ========================================================== */
const visualLoadPromises = new WeakMap();

function loadCardVisual(visual, fetchPriority = "auto") {
  if (!visual || visual.classList.contains("is-loaded")) return Promise.resolve(true);
  if (visualLoadPromises.has(visual)) return visualLoadPromises.get(visual);

  const src = visual.dataset.bg;
  const loadPromise = new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.fetchPriority = fetchPriority;

    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // onload confirma que la imagen puede utilizarse aunque decode no exista.
      }

      visual.style.backgroundImage = `url('${src}')`;
      requestAnimationFrame(() => visual.classList.add("is-loaded"));
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = src;
  });

  visualLoadPromises.set(visual, loadPromise);
  return loadPromise;
}

function initWelcomePreload() {
  const sessionKey = "soy-autoconocimiento-welcome-seen";
  const criticalAssets = [
    "assets/hero-terapia-floral-warm.webp",
    "assets/global-botanical-labyrinth.svg",
    ...Array.from(document.querySelectorAll("img[src]"), (image) => image.currentSrc || image.src)
  ];
  const serviceVisuals = Array.from(document.querySelectorAll("#services-grid .service-visual[data-bg]"));
  const courseVisuals = Array.from(document.querySelectorAll("#courses-grid .service-visual[data-bg]"));
  const preloadImage = (src) => new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = async () => {
      try {
        await image.decode();
      } catch {
        // La disponibilidad de decode varía; onload sigue siendo suficiente.
      }
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = src;
  });
  const hydrateServices = () => Promise.all(serviceVisuals.map((visual) => loadCardVisual(visual, "high")));
  const hydrateCourses = () => Promise.all(courseVisuals.map((visual) => loadCardVisual(visual, "low")));
  const scheduleCourseHydration = () => {
    const hydrate = () => hydrateCourses();
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(hydrate, { timeout: 1800 });
    } else {
      window.setTimeout(hydrate, 350);
    }
  };

  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem(sessionKey) === "true";
  } catch {
    // Si el navegador bloquea el almacenamiento, la apertura sigue siendo segura.
  }

  if (alreadySeen) {
    hydrateServices();
    scheduleCourseHydration();
    return;
  }

  const welcome = document.createElement("div");
  welcome.className = "welcome-preload";
  welcome.setAttribute("aria-hidden", "true");
  welcome.innerHTML = `
    <div class="welcome-preload__content">
      <span class="welcome-preload__brand">Soy Autoconocimiento</span>
      <svg class="welcome-preload__labyrinth" viewBox="0 0 160 160" aria-hidden="true">
        <path pathLength="1" d="M72 148 C32 148 10 119 10 80 C10 40 40 10 80 10 C120 10 150 40 150 80 C150 118 120 148 88 148 L88 133 C116 131 135 108 135 80 C135 49 111 25 80 25 C49 25 25 49 25 80 C25 110 49 133 72 133 L72 118 C53 116 40 100 40 80 C40 58 58 40 80 40 C102 40 120 58 120 80 C120 101 102 118 88 118 L88 103 C98 100 105 91 105 80 C105 66 94 55 80 55 C66 55 55 66 55 80 C55 92 64 102 72 103 C68 96 68 88 80 80" />
      </svg>
      <span class="welcome-preload__line"></span>
    </div>`;
  document.body.append(welcome);

  const minimumDuration = new Promise((resolve) => setTimeout(resolve, 3000));
  const maximumDuration = new Promise((resolve) => setTimeout(resolve, 10000));
  const fontReady = document.fonts?.ready ?? Promise.resolve();
  const criticalReady = Promise.all([
    fontReady,
    ...criticalAssets.map((src) => preloadImage(src))
  ]);
  const entryReady = Promise.all([criticalReady, hydrateServices()]);

  Promise.all([Promise.race([entryReady, maximumDuration]), minimumDuration]).then(() => {
    try {
      sessionStorage.setItem(sessionKey, "true");
    } catch {
      // La salida de la apertura no depende del almacenamiento local.
    }

    welcome.classList.add("is-leaving");
    scheduleCourseHydration();
    window.setTimeout(() => welcome.remove(), 320);
  });
}

/* ==========================================================
   RESPALDO DIFERIDO DE IMÁGENES DE TARJETAS
   La apertura hidrata servicios y cursos por prioridad. Este
   observador cubre cualquier tarjeta futura que aún no haya sido
   preparada al acercarse al viewport.
   ========================================================== */
function initLazyVisuals() {
  const visuals = document.querySelectorAll(".service-visual[data-bg]");
  if (!visuals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      loadCardVisual(el);
      obs.unobserve(el);
    });
  }, { rootMargin: "150px" });

  visuals.forEach((el) => {
    if (!el.classList.contains("is-loaded")) observer.observe(el);
  });
}

/* ==========================================================
   TESTIMONIOS — modal "Quién soy"
   Se mantiene oculto mientras SITE_DATA.testimonials esté vacío.
   ========================================================== */
function renderTestimonials() {
  const block = document.getElementById("testimonials-block");
  const list = document.getElementById("testimonials-list");
  if (!block || !list || typeof SITE_DATA === "undefined") return;

  const items = SITE_DATA.testimonials || [];
  if (!items.length) return;

  list.innerHTML = items.map(t => `
    <div class="testimonial-item">
      <p class="testimonial-quote">${t.quote}</p>
      <span class="testimonial-author">${t.author}</span>
    </div>
  `).join("");

  block.hidden = false;
}

/* ==========================================================
   PESTAÑAS DE BAZAR: SERVICIOS / CURSOS
   ========================================================== */
function initBazarTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll("[data-tab-panel]");
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });

      panels.forEach(panel => {
        panel.hidden = panel.dataset.tabPanel !== target;
      });

      if (typeof gtag === "function") {
        gtag("event", "tab_switch", { tab: target });
      }

      // El carrusel móvil necesita recentrarse sobre el grid recién mostrado
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    });
  });
}

/* ==========================================================
   INTERACTION ENGINE: SCROLL SNAP & LATERAL NAV
   ========================================================== */
function initEngineScrollSnap() {
  const container = document.querySelector(".scroll-snap-container");
  const navigator = document.querySelector(".slide-navigator");
  const dots = document.querySelectorAll(".nav-dot");
  const sections = document.querySelectorAll(".snap-section");

  if (!container || !navigator) return;

  let isScrollingTimeout;
  container.addEventListener("scroll", () => {
    navigator.classList.add("is-scrolling");

    clearTimeout(isScrollingTimeout);
    isScrollingTimeout = setTimeout(() => {
      navigator.classList.remove("is-scrolling");
    }, 800); 
  }, { passive: true }); 

  const observerOptions = {
    root: container,
    threshold: 0.6 
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute("id");
        const depth = Array.from(sections).indexOf(entry.target);
        document.body.dataset.scrollDepth = depth;

        dots.forEach(dot => {
          if (dot.dataset.target === activeId) {
            dot.classList.add("active");
          } else {
            dot.classList.remove("active");
          }
        });

        if (typeof gtag === "function") {
          gtag("event", "view_section", { section: activeId });
        }
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const targetId = dot.dataset.target;
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

/* ==========================================================
   FONDO AMBIENTAL CONTINUO
   ========================================================== */
function initContinuousAmbientDepth() {
  const container = document.querySelector(".scroll-snap-container");
  const sections = Array.from(document.querySelectorAll(".snap-section"));
  const body = document.body;

  if (!container || sections.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const properties = [
    "--ambient-photo-opacity",
    "--ambient-labyrinth-opacity",
    "--ambient-labyrinth-scale"
  ];
  const originalDepth = body.dataset.scrollDepth;
  const keyframes = [0, 1, 2].map((depth) => {
    body.dataset.scrollDepth = depth;
    const styles = getComputedStyle(body);
    return Object.fromEntries(
      properties.map((property) => [property, parseFloat(styles.getPropertyValue(property))])
    );
  });

  if (originalDepth === undefined) {
    delete body.dataset.scrollDepth;
  } else {
    body.dataset.scrollDepth = originalDepth;
  }

  const interpolate = (from, to, progress) => from + (to - from) * progress;
  let frameRequested = false;

  const updateAmbientDepth = () => {
    frameRequested = false;
    const offsets = sections.map((section) => section.offsetTop);
    const scrollTop = container.scrollTop;
    let segment = 0;

    while (segment < offsets.length - 2 && scrollTop >= offsets[segment + 1]) {
      segment += 1;
    }

    const start = offsets[segment];
    const end = offsets[segment + 1] ?? start;
    const progress = end === start ? 0 : Math.min(1, Math.max(0, (scrollTop - start) / (end - start)));
    const from = keyframes[segment];
    const to = keyframes[segment + 1];

    properties.forEach((property) => {
      body.style.setProperty(property, interpolate(from[property], to[property], progress).toFixed(4));
    });
  };

  const requestUpdate = () => {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(updateAmbientDepth);
    }
  };

  container.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  requestUpdate();
}

/* ==========================================================
   FOCUS TRAP PARA MODALES
   Sin esto, al navegar con teclado (Tab) dentro de un modal
   abierto, el foco se escapa hacia elementos de la página que
   quedaron "detrás" (invisibles pero seleccionables), dejando a
   alguien que navega solo con teclado sin saber dónde está parado.
   Esto encierra el Tab dentro del modal mientras está abierto y
   devuelve el foco a quien lo abrió al cerrarlo.
   ========================================================== */
let _focusTrapCleanup = null;

function trapFocus(modal) {
  const focusable = modal.querySelectorAll(
    'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const previouslyFocused = document.activeElement;

  const handleKeydown = e => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  modal.addEventListener("keydown", handleKeydown);
  first.focus();

  _focusTrapCleanup = () => {
    modal.removeEventListener("keydown", handleKeydown);
    previouslyFocused?.focus();
  };
}

function releaseFocus() {
  _focusTrapCleanup?.();
  _focusTrapCleanup = null;
}

/* ==========================================================
   PRESENTACIÓN INICIAL DE MARCELA
   ========================================================== */
function initAboutPresenceBubble() {
  const trigger = document.querySelector(".about-trigger-btn");
  if (!trigger || trigger.closest(".about-presence-anchor")) return;

  const anchor = document.createElement("span");
  anchor.className = "about-presence-anchor";

  const bubble = document.createElement("span");
  bubble.className = "about-presence-bubble";
  bubble.textContent = "Quién soy";
  bubble.setAttribute("aria-hidden", "true");

  trigger.before(anchor);
  anchor.append(trigger, bubble);

  const storageKey = "soyautoconocimiento:marcela-intro:v1";
  let introCompleted = false;

  try {
    introCompleted = window.localStorage.getItem(storageKey) === "complete";
  } catch {
    /* El almacenamiento puede estar restringido; la presentación
       sigue funcionando durante la visita actual. */
  }

  anchor.classList.toggle("is-presence-intro", !introCompleted);
  anchor.classList.toggle("is-presence-complete", introCompleted);

  if (introCompleted) return;

  trigger.addEventListener("click", () => {
    anchor.classList.remove("is-presence-intro");
    anchor.classList.add("is-presence-complete");

    try {
      window.localStorage.setItem(storageKey, "complete");
    } catch {
      /* El modal debe abrir normalmente aunque no pueda persistirse. */
    }
  }, { once: true });
}

/* ==========================================================
   MODAL BAJO DEMANDA: "QUIÊN SOY"
   ========================================================== */
function initOnDemandAboutModal() {
  const triggerMobile = document.querySelector(".about-trigger-btn");
  const triggerDesktop = document.querySelector(".about-desktop-link");
  const modal = document.getElementById("about-modal");
  const closeBtn = document.querySelector(".aria-close-about");

  if (!modal) return;

  const openAbout = () => {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");
    trapFocus(modal);

    if (typeof gtag === "function") {
      gtag("event", "view_about");
    }

    // Espera la transición CSS para medir con precisión las alturas reales
    setTimeout(() => {
      const isMobile = window.innerWidth <= 768;
      const actualScroller = isMobile
        ? modal.querySelector(".about-modal-window")
        : modal.querySelector(".about-content");

      if (actualScroller) {
        initScrollHint(actualScroller);
      }
    }, 200);
  };

  const closeAbout = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-modal-open");
    releaseFocus();
  };

  triggerMobile?.addEventListener("click", openAbout);
  triggerDesktop?.addEventListener("click", openAbout);
  closeBtn?.addEventListener("click", closeAbout);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAbout();
  });

  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAbout(); });
}

/* ==========================================================
   ENGINE: SERVICE MODAL & MULTI-ROUTING DINÁMICO
   ========================================================== */
function initServiceModal() {
  const modal = document.getElementById("service-modal");
  if (!modal) return;

  const closeBtn = modal.querySelector(".modal-close");
  const title = document.getElementById("modal-title");
  const description = document.getElementById("modal-description");
  const format = document.getElementById("modal-format");
  const duration = document.getElementById("modal-duration");

  // Captura precisa de botones de acción hipervínculo
  const btnConversar = modal.querySelector(".btn-conversar");
  const btnAgenda = modal.querySelector(".btn-agenda");

  // === SEGUIMIENTO DE CONVERSIONES GA4 ===
  // Vinculamos los disparadores una sola vez al cargar la estructura del modal
  if (btnConversar) {
    btnConversar.addEventListener("click", () => {
      const nombreServicio = title.textContent || "Desconocido";
      if (typeof gtag === "function") {
        gtag("event", "click_whatsapp", {
          'servicio': nombreServicio,
          'origen': 'modal_detalles'
        });
      }
    });
  }

  if (btnAgenda) {
    btnAgenda.addEventListener("click", () => {
      const nombreServicio = title.textContent || "Desconocido";
      if (typeof gtag === "function") {
        gtag("event", "click_calendar", {
          'servicio': nombreServicio,
          'origen': 'modal_detalles'
        });
      }
    });
  }
  // =======================================

  // Subrutina unificada de extracción y mapeo de contexto de datos
  const renderAndOpenModal = (dataSource) => {
    if (!dataSource) return;

    // Inyección de variables textuales bases
    title.textContent = dataSource.dataset.title || "";
    const rawText = dataSource.dataset.description || "";
    const paragraphs = rawText.split('\n').filter(p => p.trim() !== '');
    description.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
    
    // Sintonización condicional de especificaciones técnicas
    if (format) {
      const formatVal = dataSource.dataset.format;
      format.textContent = formatVal ? `Modalidad: ${formatVal}` : "";
      format.style.display = formatVal ? "block" : "none";
    }
    if (duration) {
      const durationVal = dataSource.dataset.duration;
      duration.textContent = durationVal ? `Duración: ${durationVal}` : "";
      duration.style.display = durationVal ? "block" : "none";
    }

    // Enrutamiento Dinámico e Inyección de Links de Conversión
    const isCourse = dataSource.dataset.type === "course";

    if (btnConversar) {
      const phone = "56962391328"; // Su número real
      const serviceName = dataSource.dataset.title || "";
      const text = isCourse
        ? `Hola, quiero información sobre el curso: ${serviceName}`
        : `Hola, me interesa saber más sobre: ${serviceName}`;
      const message = encodeURIComponent(text);
      btnConversar.setAttribute("href", `https://wa.me/${phone}?text=${message}`);
      btnConversar.setAttribute("target", "_blank");
    }

    if (btnAgenda) {
      // Los cursos no agendan sesión por calendario: solo WhatsApp.
      btnAgenda.hidden = isCourse;

      const urlAgenda = dataSource.dataset.urlAgenda || "#";
      btnAgenda.setAttribute("href", urlAgenda);
      if (urlAgenda !== "#") {
        btnAgenda.setAttribute("target", "_blank");
      } else {
        btnAgenda.removeAttribute("target");
      }
    }

    // Ejecución de Apertura y Scroll Lock
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-modal-open");
    trapFocus(modal);
    initScrollHint(document.getElementById("modal-description"));

    if (typeof gtag === "function") {
      gtag("event", "view_item", { item_name: dataSource.dataset.title || "Desconocido" });
    }
  };

  // FLUJO A: Escuchador para las Tarjetas del Bazar de Servicios
  const cards = document.querySelectorAll(".service-card");
  cards.forEach(card => {
    const button = card.querySelector(".service-button, .service-card-action");
    if (!button) return;

    let pointerStart = null;
    let suppressActivationUntil = 0;

    if (button.classList.contains("service-card-action")) {
      button.addEventListener("pointerdown", e => {
        pointerStart = { x: e.clientX, y: e.clientY };
      });

      button.addEventListener("pointermove", e => {
        if (!pointerStart) return;
        const distance = Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y);
        if (distance > 10) suppressActivationUntil = performance.now() + 500;
      });

      button.addEventListener("pointerup", () => { pointerStart = null; });
      button.addEventListener("pointercancel", () => { pointerStart = null; });
    }

    button.addEventListener("click", e => {
      if (performance.now() < suppressActivationUntil) {
        e.preventDefault();
        return;
      }

      // Pasamos la tarjeta como la fuente de datos que contiene los datasets
      renderAndOpenModal(card);
    });
  });

  // FLUJO B: Escuchador para el nuevo Botón de Exploración en la sección Hero
  const heroExploreBtn = document.querySelector(".hero-explore-btn");
  if (heroExploreBtn) {
    heroExploreBtn.addEventListener("click", () => {
      // El botón del Hero contiene sus propios datasets, operando de forma autónoma
      renderAndOpenModal(heroExploreBtn);
    });
  }

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-modal-open");
    releaseFocus();
  };

  closeBtn?.addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
}

function initScrollHint(scrollEl) {
  if (!scrollEl) return;

  // Purga defensiva de indicadores previos activos
  document.querySelectorAll(".scroll-hint").forEach(el => el.remove());

  requestAnimationFrame(() => {
    // Si el contenido no desborda el Viewport del contenedor, abortamos
    if (scrollEl.scrollHeight <= scrollEl.clientHeight + 5) return;

    const hint = document.createElement("div");
    hint.className = "scroll-hint";
    hint.textContent = "↓";
    scrollEl.appendChild(hint);

    // Seteo inicial a cero
    scrollEl.scrollTop = 0;

    // Rutina de cálculo cinético de proximidad al fondo
    const evaluarVisibilidadFlecha = () => {
      const restante = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      // Absorbe desviaciones por subpíxeles en dispositivos móviles (25px)
      if (restante < 25) {
        hint.classList.add("oculto");
      } else {
        hint.classList.remove("oculto");
      }
    };

    // Forzamos una ejecución inmediata síncrona al renderizar
    evaluarVisibilidadFlecha();

    // Gestión limpia del ciclo de vida del listener para evitar fugas de memoria
    if (scrollEl._scrollHintListener) {
      scrollEl.removeEventListener("scroll", scrollEl._scrollHintListener);
    }
    scrollEl._scrollHintListener = evaluarVisibilidadFlecha;
    scrollEl.addEventListener("scroll", scrollEl._scrollHintListener, { passive: true });
  });
}

/* ==========================================================
   CENTRADOR AUTOMÁTICO CAROUSEL BAZAR (MÓVIL + TABLET)
   ========================================================= */
function initCarouselCenter() {
  const grids = document.querySelectorAll(".services-grid");
  if (!grids.length) return;

  const centerMiddleCard = () => {
    if (!window.matchMedia("(max-width: 1024px)").matches) return;

    grids.forEach(grid => {
      if (grid.hidden) return;

      const cards = grid.querySelectorAll(".service-card");
      if (cards.length < 2) return;

      const middleCard = cards[1];
      const offsetCenter = middleCard.offsetLeft - (grid.clientWidth - middleCard.clientWidth) / 2;
      grid.scrollLeft = offsetCenter;
    });
  };

  requestAnimationFrame(centerMiddleCard);

  window.addEventListener("resize", centerMiddleCard, { passive: true });
  window.addEventListener("orientationchange", () => {
    setTimeout(centerMiddleCard, 250); 
  }, { passive: true });
}
