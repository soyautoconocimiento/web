/**
 * SOYAUTOCONOCIMIENTO · MOTOR UNIFICADO DE EXPERIENCIA
 * Gestiona el Hero, el Bazar dinámico, la exclusión mutua, y el modal de 2 pantallas.
 */
(function(root) {
  'use strict';

  let siteContent = null;
  let currentCategory = 'services';
  let activeOfferForModal = null;
  let currentModalScreen = 'detail';
  let lastTriggerElement = null;

  function init() {
    if (!root.SoySiteContent) {
      console.error('[SoyUnifiedEngine] SoySiteContent no encontrado');
      return;
    }

    siteContent = root.SoySiteContent.load();

    // 1. Inyectar o asegurar el diálogo de 2 pantallas
    ensureModalDOM();

    // 2. Sincronizar el Hero
    syncHeroDOM();

    // 3. Renderizar el Bazar con tarjetas enriquecidas
    renderBazarGrid();

    // 4. Conectar los tabs de servicios vs cursos
    bindCategoryTabs();

    // 5. Aplicar reglas de densidad según viewport
    applyCurrentDeviceRules();
    window.addEventListener('resize', debounce(applyCurrentDeviceRules, 100));

    console.info('[SoyUnifiedEngine] Motor unificado listo');
  }

  // Sincronización del Hero
  function syncHeroDOM() {
    const heroId = siteContent.settings.activeHeroId || 'floral';
    const heroOffer = siteContent.offers[heroId];
    if (!heroOffer) return;

    const titleEl = document.getElementById('home-title');
    const leadEl = document.getElementById('home-lead');
    const bodyEl = document.querySelector('.home-body');
    const noteEl = document.querySelector('.home-note');
    const quoteEl = document.querySelector('.visual-quote');
    const heroImg = document.querySelector('.arch-frame img');
    const heroSource = document.querySelector('.arch-frame source');
    const ctaBtn = document.getElementById('hero-floral-link');

    if (titleEl) titleEl.textContent = heroOffer.title;
    if (leadEl) leadEl.innerHTML = `<em>${heroOffer.heroLead || ''}</em>`;
    
    const isMobile = window.innerWidth <= 760;
    const bodyText = (isMobile && heroOffer.heroBodyMobile) ? heroOffer.heroBodyMobile : heroOffer.heroBody;
    if (bodyEl) bodyEl.textContent = bodyText;

    if (noteEl) {
      noteEl.innerHTML = `<span>${heroOffer.heroNoteNum || '01'}</span><div>${heroOffer.heroNoteText || 'Observación consciente'}</div>`;
    }

    if (quoteEl) {
      quoteEl.textContent = heroOffer.heroQuote || 'Conocernos profundamente.';
    }

    if (heroImg) {
      heroImg.src = heroOffer.imageDisplay || heroOffer.image;
      heroImg.alt = `${heroOffer.title} - Marcela`;
    }

    if (heroSource) {
      heroSource.srcset = heroOffer.imageMobile || heroOffer.image;
    }

    if (ctaBtn) {
      ctaBtn.onclick = (e) => {
        e.preventDefault();
        openOfferModal(heroOffer.id, ctaBtn);
      };
    }
  }

  // Renderizado del Bazar
  function renderBazarGrid(optCategory) {
    if (optCategory) currentCategory = optCategory;
    const grid = document.getElementById('service-grid');
    if (!grid) return;

    grid.classList.add('as-bazar-matrix');
    grid.classList.toggle('is-courses', currentCategory === 'courses');

    const heroId = siteContent.settings.activeHeroId || 'floral';
    const cardStyle = siteContent.settings.activeCardStyle || 'atelier';

    // REGLA FUNDAMENTAL: Excluir el servicio protagonista del Hero
    const items = Object.values(siteContent.offers).filter(item => {
      return item.category === currentCategory && item.id !== heroId;
    });

    grid.innerHTML = '';

    items.forEach((item, index) => {
      const card = createCardElement(item, cardStyle, index);
      grid.appendChild(card);
    });

    // Resetear posición de scroll y notificar al rail de progreso
    grid.scrollLeft = 0;
    if (typeof window.updateServiceRailPosition === 'function') {
      window.updateServiceRailPosition();
    }
    setTimeout(() => {
      grid.dispatchEvent(new Event('scroll'));
      if (typeof window.updateServiceRailPosition === 'function') {
        window.updateServiceRailPosition();
      }
    }, 50);
  }

  // Generador de Tarjetas según estilo
  function createCardElement(item, style, index) {
    const article = document.createElement('article');
    article.className = 'service-card card-interactive';
    article.dataset.offerId = item.id;
    article.style.setProperty('--card-index', String(index || 0));
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `Abrir detalles de ${item.title}`);

    const isMobile = window.innerWidth <= 760;
    const descText = (isMobile && item.cardDescMobile) ? item.cardDescMobile : item.cardDesc;

    if (style === 'baseline') {
      article.classList.add('card-baseline');
      article.innerHTML = `
        <div class="baseline-photo"><img src="${item.image}" alt="" loading="lazy"></div>
        <div class="baseline-content">
          <span class="baseline-badge">${item.kicker || item.tag}</span>
          <h3 class="baseline-title">${item.title}</h3>
          <p class="baseline-desc">${descText}</p>
          <span class="baseline-action">Conocer ↗</span>
        </div>
      `;
    } else if (style === 'portal') {
      article.classList.add('card-portal');
      article.innerHTML = `
        <div class="portal-arch"><img src="${item.image}" alt="" loading="lazy"></div>
        <span class="portal-symbol" aria-hidden="true">✦</span>
        <h3 class="portal-title">${item.title}</h3>
        <p class="portal-desc">${descText}</p>
        <button type="button" class="portal-btn" tabindex="-1">Conocer ↗</button>
      `;
    } else if (style === 'notebook') {
      article.classList.add('card-notebook');
      article.innerHTML = `
        <div class="notebook-top">
          <span class="notebook-meta">${item.kicker || ''}</span>
          <span class="notebook-tag">${item.tag || 'Sesión'}</span>
        </div>
        <h3 class="notebook-title">${item.title}</h3>
        ${item.modalQuote ? `<blockquote class="notebook-quote">${item.modalQuote}</blockquote>` : ''}
        <p class="notebook-desc">${descText}</p>
        <div class="notebook-footer">
          <span class="notebook-duration">${item.duration || 'Online'}</span>
          <span class="notebook-action">Ver más ↗</span>
        </div>
      `;
    } else if (style === 'alchemy') {
      article.classList.add('card-alchemy');
      article.innerHTML = `
        <div class="alchemy-photo"><img src="${item.image}" alt="" loading="lazy"></div>
        <span class="alchemy-meta">${item.kicker || item.tag}</span>
        <h3 class="alchemy-title">${item.title}</h3>
        <p class="alchemy-desc">${descText}</p>
        <div class="alchemy-footer">
          <span class="alchemy-duration">${item.duration || '1 hora'}</span>
          <span class="alchemy-action">Agendar ✦</span>
        </div>
      `;
    } else {
      // Estilo por defecto: 'atelier' (Lámina de autor)
      article.classList.add('card-atelier');
      article.innerHTML = `
        <div class="atelier-photo"><img src="${item.image}" alt="" loading="lazy"></div>
        <span class="atelier-meta">${item.kicker || item.tag}</span>
        <h3 class="atelier-title">${item.title}</h3>
        <p class="atelier-desc">${descText}</p>
        <div class="atelier-footer">
          <span class="atelier-duration">${item.duration || '1 hora · Online'}</span>
          <span class="atelier-action">Explorar <span>↗</span></span>
        </div>
      `;
    }

    article.onclick = () => openOfferModal(item.id, article);
    article.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openOfferModal(item.id, article);
      }
    };

    return article;
  }

  // Alternador de categorías
  function bindCategoryTabs() {
    const servTab = document.getElementById('services-tab');
    const courTab = document.getElementById('courses-tab');
    const grid = document.getElementById('service-grid');

    if (servTab && courTab) {
      servTab.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentCategory = 'services';
        servTab.classList.add('is-active');
        servTab.setAttribute('aria-selected', 'true');
        servTab.tabIndex = 0;
        courTab.classList.remove('is-active');
        courTab.setAttribute('aria-selected', 'false');
        courTab.tabIndex = -1;
        if (grid) grid.classList.remove('is-courses');
        renderBazarGrid();
      };

      courTab.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentCategory = 'courses';
        courTab.classList.add('is-active');
        courTab.setAttribute('aria-selected', 'true');
        courTab.tabIndex = 0;
        servTab.classList.remove('is-active');
        servTab.setAttribute('aria-selected', 'false');
        servTab.tabIndex = -1;
        if (grid) grid.classList.add('is-courses');
        renderBazarGrid();
      };
    }
  }

  // Inyección del Modal de 2 Pantallas
  function ensureModalDOM() {
    let dialog = document.getElementById('bazar-unified-dialog');
    if (dialog) return dialog;

    dialog = document.createElement('dialog');
    dialog.id = 'bazar-unified-dialog';
    dialog.className = 'bazar-modal-dialog';
    dialog.setAttribute('aria-labelledby', 'bazar-modal-title');

    dialog.innerHTML = `
      <div class="modal-deck-container">
        <div class="modal-media-col">
          <img id="bazar-modal-img" src="" alt="" loading="eager">
          <div class="modal-media-overlay">
            <div class="modal-quote-text" id="bazar-modal-quote"></div>
          </div>
        </div>

        <div class="modal-screens-viewport">
          <!-- PANTALLA 1: DETALLE COMPLETO -->
          <div class="modal-screen screen-detail" id="bazar-screen-detail">
            <div class="modal-header-meta">
              <span class="modal-kicker" id="bazar-modal-kicker"></span>
              <button type="button" class="modal-close-btn" id="bazar-modal-close" aria-label="Cerrar modal">×</button>
            </div>

            <h2 class="modal-offer-title" id="bazar-modal-title"></h2>
            <div class="modal-body-desc" id="bazar-modal-desc"></div>

            <div class="modal-specs-bar">
              <span class="modal-spec-chip" id="bazar-modal-format"></span>
              <span class="modal-spec-chip" id="bazar-modal-duration"></span>
            </div>

            <div class="modal-actions-row">
              <a class="btn-modal-primary" id="bazar-modal-agenda-btn" target="_blank" rel="noopener noreferrer">
                <span>Agendar en Calendar</span>
                <span aria-hidden="true">↗</span>
              </a>
              <button type="button" class="btn-modal-whatsapp" id="bazar-modal-go-wa-btn">
                <span>Personalizar WhatsApp</span>
                <span aria-hidden="true">💬</span>
              </button>
            </div>
          </div>

          <!-- PANTALLA 2: PERSONALIZADOR WHATSAPP -->
          <div class="modal-screen screen-whatsapp" id="bazar-screen-whatsapp">
            <div class="wa-screen-header">
              <button type="button" class="btn-wa-back" id="bazar-wa-back-btn">← Volver al detalle</button>
              <h3 class="wa-screen-title">Mensaje WhatsApp</h3>
            </div>

            <p class="wa-intro-text">
              Adapta el mensaje a tu consulta personal antes de enviarlo. Puedes agregar temas con un toque:
            </p>

            <div class="wa-chips-section">
              <span class="wa-chips-label">Temas sugeridos:</span>
              <div class="wa-chips-list" id="bazar-wa-chips-list"></div>
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
    document.getElementById('bazar-modal-close').onclick = closeOfferModal;
    document.getElementById('bazar-modal-go-wa-btn').onclick = () => switchModalScreen('whatsapp');
    document.getElementById('bazar-wa-back-btn').onclick = () => switchModalScreen('detail');
    document.getElementById('bazar-wa-reset-btn').onclick = resetWhatsAppMessage;
    document.getElementById('bazar-wa-send-btn').onclick = sendWhatsAppMessage;

    const textarea = document.getElementById('bazar-wa-textarea');
    textarea.addEventListener('input', () => {
      document.getElementById('bazar-wa-char-count').textContent = `${textarea.value.length} caracteres`;
    });

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeOfferModal();
    });

    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (currentModalScreen === 'whatsapp') {
        switchModalScreen('detail');
      } else {
        closeOfferModal();
      }
    });

    return dialog;
  }

  function openOfferModal(offerId, triggerEl) {
    const offer = siteContent.offers[offerId];
    if (!offer) return;

    activeOfferForModal = offer;
    lastTriggerElement = triggerEl || document.activeElement;

    const dialog = ensureModalDOM();

    // Rellenar datos
    document.getElementById('bazar-modal-img').src = offer.imageDisplay || offer.image;
    document.getElementById('bazar-modal-quote').textContent = offer.modalQuote || offer.heroQuote || '';
    document.getElementById('bazar-modal-kicker').textContent = offer.kicker || offer.tag;
    document.getElementById('bazar-modal-title').textContent = offer.title;
    document.getElementById('bazar-modal-desc').textContent = offer.fullDesc || offer.cardDesc;
    document.getElementById('bazar-modal-format').textContent = `📍 ${offer.format || 'Online'}`;
    document.getElementById('bazar-modal-duration').textContent = `⏱️ ${offer.duration || '1 hora'}`;

    const agendaBtn = document.getElementById('bazar-modal-agenda-btn');
    if (offer.agendaUrl) {
      agendaBtn.href = offer.agendaUrl;
      agendaBtn.hidden = false;
    } else {
      agendaBtn.hidden = true;
    }

    // Inicializar pantalla WhatsApp
    resetWhatsAppMessage();

    // Rellenar chips sugeridos
    const chipsList = document.getElementById('bazar-wa-chips-list');
    chipsList.innerHTML = '';
    const chips = offer.waChips || ['📅 Fecha y hora', '🌿 Sobre el proceso', '💳 Medio de pago'];
    chips.forEach(chipText => {
      const chipBtn = document.createElement('button');
      chipBtn.type = 'button';
      chipBtn.className = 'wa-topic-chip';
      chipBtn.textContent = chipText;
      chipBtn.onclick = () => {
        const textarea = document.getElementById('bazar-wa-textarea');
        const cleanText = chipText.replace(/^[^\wáéíóúÁÉÍÓÚñÑ]+/, '').trim();
        if (!textarea.value.includes(cleanText)) {
          textarea.value = textarea.value.trim() + `\n- Consulta sobre: ${cleanText}`;
          chipBtn.classList.add('is-added');
        }
        document.getElementById('bazar-wa-char-count').textContent = `${textarea.value.length} caracteres`;
        textarea.focus();
      };
      chipsList.appendChild(chipBtn);
    });

    switchModalScreen('detail');
    dialog.showModal();
  }

  function switchModalScreen(screenName) {
    currentModalScreen = screenName;
    const dialog = document.getElementById('bazar-unified-dialog');
    if (!dialog) return;

    if (screenName === 'whatsapp') {
      dialog.classList.add('state-whatsapp');
      setTimeout(() => document.getElementById('bazar-wa-textarea')?.focus(), 150);
    } else {
      dialog.classList.remove('state-whatsapp');
      document.getElementById('bazar-modal-close')?.focus();
    }
  }

  function resetWhatsAppMessage() {
    if (!activeOfferForModal) return;
    const textarea = document.getElementById('bazar-wa-textarea');
    textarea.value = activeOfferForModal.defaultMsg || `Hola Marcela, me gustaría consultar sobre ${activeOfferForModal.title}. Muchas gracias.`;
    document.getElementById('bazar-wa-char-count').textContent = `${textarea.value.length} caracteres`;
    document.querySelectorAll('.wa-topic-chip').forEach(c => c.classList.remove('is-added'));
  }

  function sendWhatsAppMessage() {
    const textarea = document.getElementById('bazar-wa-textarea');
    const msg = encodeURIComponent(textarea.value.trim());
    window.open(`https://wa.me/56992388057?text=${msg}`, '_blank', 'noopener,noreferrer');
  }

  function closeOfferModal() {
    const dialog = document.getElementById('bazar-unified-dialog');
    if (!dialog || !dialog.open) return;

    dialog.classList.add('is-closing');
    setTimeout(() => {
      dialog.close();
      dialog.classList.remove('is-closing', 'state-whatsapp');
      switchModalScreen('detail');
      if (lastTriggerElement && typeof lastTriggerElement.focus === 'function') {
        lastTriggerElement.focus();
      }
    }, 200);
  }

  // Aplicar reglas de densidad de datos por dispositivo
  function applyCurrentDeviceRules() {
    if (!siteContent) return;

    const width = window.innerWidth;
    let devKey = 'desktop';
    if (width <= 640) devKey = 'mobile';
    else if (width <= 1024) devKey = 'tablet';

    const rules = siteContent.deviceRules[devKey] || siteContent.deviceRules.desktop;
    const body = document.body;

    body.classList.toggle('hide-hero-note', !rules.heroNote);
    body.classList.toggle('hide-hero-quote', !rules.heroQuote);
    body.classList.toggle('hide-hero-secondary', !rules.heroSecondaryBtn);
    body.classList.toggle('hide-card-desc', !rules.cardDesc);
    body.classList.toggle('clamp-card-desc', devKey === 'tablet' || (devKey === 'mobile' && rules.cardDesc));
    body.classList.toggle('hide-card-kicker', !rules.cardKicker);
    body.classList.toggle('hide-card-duration', !rules.cardDuration);
    body.classList.toggle('hide-card-quote', !rules.cardQuote);
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // API Pública
  root.SoyUnifiedEngine = {
    init: init,
    syncHeroDOM: syncHeroDOM,
    renderBazarGrid: renderBazarGrid,
    openOfferModal: openOfferModal,
    reloadContent: () => {
      siteContent = root.SoySiteContent.load();
      syncHeroDOM();
      renderBazarGrid();
      applyCurrentDeviceRules();
    }
  };

  // Autoiniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
