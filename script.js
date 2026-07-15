/* ==========================================================
   SOY AUTOCONOCIMIENTO 2.5 - ARQUITECTURA DE CONTROL DE FLUIDEZ
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderOfferingCards();
  renderTestimonials();
  initBazarTabs();
  initEngineScrollSnap();
  initOnDemandAboutModal();
  initServiceModal();
  initLabyrinth();
  initCarouselCenter();
  initLazyVisuals();
});

/* ==========================================================
   RENDERIZADO DE TARJETAS (Servicios y Cursos) DESDE data.js
   ========================================================== */
function renderOfferingCards() {
  if (typeof SITE_DATA === "undefined") return;

  /* U1: una muestra acotada por tipo antes de extender la carta full-bleed
     al catálogo completo. El resto conserva exactamente su markup actual. */
  const fullBleedSliceIds = new Set(["constelaciones", "curso-tarot-2026"]);

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
   CARGA DIFERIDA (LAZY) DE IMÁGENES DE TARJETAS
   La imagen solo se pide a la red cuando la tarjeta está por
   entrar en pantalla; al llegar, hace un fundido suave en vez
   de aparecer de golpe.
   ========================================================== */
function initLazyVisuals() {
  const visuals = document.querySelectorAll(".service-visual[data-bg]");
  if (!visuals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const src = el.dataset.bg;
      const img = new Image();
      img.onload = () => {
        el.style.backgroundImage = `url('${src}')`;
        requestAnimationFrame(() => el.classList.add("is-loaded"));
      };
      img.src = src;
      obs.unobserve(el);
    });
  }, { rootMargin: "150px" });

  visuals.forEach(el => observer.observe(el));
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
   LABERINTO UNICURSAL GENERATIVE SVG
   ========================================================== */
function initLabyrinth() {
  const heroContainer = document.getElementById("hero-labyrinth");
  if (!heroContainer) return;

  const shouldAnimate = window.innerWidth > 1024;
  createLabyrinth(heroContainer, shouldAnimate);
}

/* Construye el "d" de un path SVG con anillos concéntricos conectados
   entre sí: cada anillo abre un hueco alternado (arriba/abajo), y ese
   hueco se une con un puente al anillo siguiente. El resultado es un
   único trazo desde el borde hasta el centro, sin ramificaciones. */
function buildLabyrinthPath(center, rings, baseRadius, step, gapDeg) {
  const toPoint = (radius, angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad)
    };
  };

  let d = "";

  for (let i = rings; i >= 1; i--) {
    const radius = baseRadius + i * step;
    // Misma costura radial en todos los anillos: el puente entre uno y
    // otro queda corto (mismo ángulo, distinto radio) en vez de cruzar
    // el diámetro completo, que es lo que rompía la lectura de espiral.
    const gapAngle = 90;
    const startAngle = gapAngle + gapDeg / 2;
    const sweep = 360 - gapDeg;
    const midAngle = startAngle + sweep / 2;
    const endAngle = startAngle + sweep;

    const start = toPoint(radius, startAngle);
    const mid = toPoint(radius, midAngle);
    const end = toPoint(radius, endAngle);

    d += i === rings ? `M ${start.x} ${start.y} ` : `L ${start.x} ${start.y} `;
    d += `A ${radius} ${radius} 0 0 1 ${mid.x} ${mid.y} `;
    d += `A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} `;
  }

  d += `L ${center} ${center}`;
  return d;
}

function createLabyrinth(container, animated = true) {
  if (!container) return;

  const size = 750;
  const center = size / 2;
  const svgNS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");

  const labyrinth = document.createElementNS(svgNS, "g");
  labyrinth.setAttribute("opacity", "0.58");

  const roseSize = 400; 
  const rosePosition = (size - roseSize) / 2;

  const rose = document.createElementNS(svgNS, "image");
  rose.setAttribute("href", "assets/rosa.svg");
  rose.setAttribute("x", rosePosition);
  rose.setAttribute("y", rosePosition);
  rose.setAttribute("width", roseSize);
  rose.setAttribute("height", roseSize);

  const rotation = Math.floor(Math.random() * 360);
  labyrinth.setAttribute("transform", `rotate(${rotation} ${center} ${center})`);

  // Laberinto unicursal clásico: un solo trazo continuo, sin
  // bifurcaciones ni callejones sin salida — la referencia arqueológica
  // real detrás del mito del laberinto de Creta y el Minotauro.
  // En vez de anillos independientes con huecos al azar, cada anillo
  // se conecta con el siguiente por un puente, formando un único
  // camino desde el borde hasta el centro.
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", buildLabyrinthPath(center, 6, 120, 38, 9));
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#c8a15a");
  path.setAttribute("stroke-width", "6");
  path.setAttribute("stroke-linecap", "round");
  labyrinth.appendChild(path);

  svg.appendChild(labyrinth);
  svg.appendChild(rose);
  container.innerHTML = "";
  container.appendChild(svg);

  if (animated) {
    let current = rotation;
    let isElementVisible = false;
    let animationFrameId = null;

    function animateRotation() {
      if (!isElementVisible) return; 
      current += 0.015;
      labyrinth.setAttribute("transform", `rotate(${current} ${center} ${center})`);
      animationFrameId = requestAnimationFrame(animateRotation);
    }

    const performanceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isElementVisible = entry.isIntersecting;
        if (isElementVisible) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(animateRotation);
        }
      });
    }, { threshold: 0.05 }); 

    performanceObserver.observe(container);
  }
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
