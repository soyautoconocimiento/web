/* ==========================================================
   SOY AUTOCONOCIMIENTO 2.5 - ARQUITECTURA DE CONTROL DE FLUIDEZ
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initEngineScrollSnap();
  initOnDemandAboutModal();
  initServiceModal();
  initLabyrinth();
  initCarouselCenter();
});

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
        
        dots.forEach(dot => {
          if (dot.dataset.target === activeId) {
            dot.classList.add("active");
          } else {
            dot.classList.remove("active");
          }
        });
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
    if (btnConversar) {
      const phone = "56962391328"; // Su número real
      const serviceName = dataSource.dataset.title || "";
      const message = encodeURIComponent(`Hola, me interesa saber más sobre: ${serviceName}`);
      btnConversar.setAttribute("href", `https://wa.me/${phone}?text=${message}`);
      btnConversar.setAttribute("target", "_blank");
    }

    if (btnAgenda) {
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
    initScrollHint(document.getElementById("modal-description"));
  };

  // FLUJO A: Escuchador para las Tarjetas del Bazar de Servicios
  const cards = document.querySelectorAll(".service-card");
  cards.forEach(card => {
    const button = card.querySelector(".service-button");
    if (!button) return;

    button.addEventListener("click", () => {
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

  const rings = 6;
  for (let i = rings; i > 0; i--) {
    const circle = document.createElementNS(svgNS, "circle");
    const radius = 120 + (i * 38);
    circle.setAttribute("cx", center);
    circle.setAttribute("cy", center);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "#c8a15a");
    circle.setAttribute("stroke-width", i % 2 === 0 ? 8 : 6);
    circle.setAttribute("stroke-linecap", "butt");

    const perimeter = Math.PI * 2 * radius;
    const gap = perimeter * (0.12 + Math.random() * 0.16);
    circle.setAttribute("stroke-dasharray", `${perimeter - gap} ${gap}`);
    circle.setAttribute("stroke-dashoffset", Math.random() * perimeter);
    labyrinth.appendChild(circle);
  }

  const spokes = 4 + Math.floor(Math.random() * 4);
  for (let i = 0; i < spokes; i++) {
    const angle = (Math.PI * 2 * i) / spokes + Math.random() * 0.45;
    const inner = 150 + Math.random() * 45;
    const outer = 300 + Math.random() * 40;

    const x1 = center + Math.cos(angle) * inner;
    const y1 = center + Math.sin(angle) * inner;
    const x2 = center + Math.cos(angle) * outer;
    const y2 = center + Math.sin(angle) * outer;

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#c8a15a");
    line.setAttribute("stroke-width", "5");
    labyrinth.appendChild(line);
  }

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
  const grid = document.querySelector(".services-grid");
  if (!grid) return;

  const centerMiddleCard = () => {
    if (!window.matchMedia("(max-width: 1024px)").matches) return;

    const cards = grid.querySelectorAll(".service-card");
    if (cards.length < 2) return;

    const middleCard = cards[1]; 
    const offsetCenter = middleCard.offsetLeft - (grid.clientWidth - middleCard.clientWidth) / 2;
    grid.scrollLeft = offsetCenter;
  };

  requestAnimationFrame(centerMiddleCard);

  window.addEventListener("resize", centerMiddleCard, { passive: true });
  window.addEventListener("orientationchange", () => {
    setTimeout(centerMiddleCard, 250); 
  }, { passive: true });
}
