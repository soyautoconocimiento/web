/**
 * SOYAUTOCONOCIMIENTO · CAPA DE AUTOR Y SIMULADOR DE HARDWARE
 * Se activa solo cuando:
 * 1. La URL contiene ?modo=autor o ?editor=1
 * 2. O el usuario presiona la tecla 'E' o 'H'.
 */
(function(root) {
  'use strict';

  let isAuthorMode = false;
  let currentSim = 'fluid';
  let isHudCollapsed = false;

  function init() {
    const params = new URLSearchParams(window.location.search);
    const wantsAuthor = params.has('modo') || params.has('editor') || params.has('autor');

    if (wantsAuthor) {
      enableAuthorMode();
    }

    // Atajos de teclado globales
    document.addEventListener('keydown', (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      if (isInput) return;

      // Tecla E: Alternar Drawer de Edición
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (!isAuthorMode) enableAuthorMode();
        toggleAuthorDrawer();
      }

      // Tecla H: Alternar visibilidad del HUD
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        if (isAuthorMode) toggleHud();
      }
    });
  }

  function enableAuthorMode() {
    if (isAuthorMode) return;
    isAuthorMode = true;
    document.body.classList.add('author-mode-active');

    // Cargar estilos del modo autor dinámicamente si no están presentes
    ensureAuthorCSS();

    // Renderizar HUD superior
    createAuthorDock();

    // Renderizar Drawer lateral
    createAuthorDrawer();

    console.info('[SoyAuthorMode] Modo autor activado');
  }

  function ensureAuthorCSS() {
    if (document.getElementById('soy-author-mode-css')) return;
    const link = document.createElement('link');
    link.id = 'soy-author-mode-css';
    link.rel = 'stylesheet';
    link.href = 'css/soy-author-mode.css';
    document.head.appendChild(link);
  }

  function createAuthorDock() {
    if (document.getElementById('author-control-dock')) return;

    const dock = document.createElement('aside');
    dock.id = 'author-control-dock';
    dock.className = 'author-control-dock';
    dock.setAttribute('aria-label', 'Barra de control de autor y simulador de dispositivos');

    dock.innerHTML = `
      <div class="author-dock-badge">Modo Autor ✦ Marcela</div>

      <div class="author-device-group">
        <button type="button" class="author-dev-btn is-active" data-sim="fluid">100% Fluido</button>
        <button type="button" class="author-dev-btn" data-sim="desktop">🖥️ PC (1440)</button>
        <button type="button" class="author-dev-btn" data-sim="tablet">📱 Tablet (768)</button>
        <button type="button" class="author-dev-btn" data-sim="tablet-rotated">🔄 Tablet (1024)</button>
        <button type="button" class="author-dev-btn" data-sim="mobile">📱 Móvil (390)</button>
      </div>

      <div class="author-tools-group">
        <button type="button" class="author-tool-btn btn-edit" id="author-btn-drawer">✏️ Editor (Tecla E)</button>
        <button type="button" class="author-tool-btn btn-publish" id="author-btn-publish">💾 Guardar / Publicar</button>
        <button type="button" class="author-tool-btn" id="author-btn-hide-hud" title="Ocultar HUD (Tecla H)">Ocultar HUD (H)</button>
      </div>
    `;

    document.body.appendChild(dock);

    // Eventos de botones de dispositivo
    dock.querySelectorAll('.author-dev-btn').forEach(btn => {
      btn.onclick = () => setSimulator(btn.dataset.sim);
    });

    document.getElementById('author-btn-drawer').onclick = toggleAuthorDrawer;
    document.getElementById('author-btn-hide-hud').onclick = toggleHud;
    document.getElementById('author-btn-publish').onclick = handlePublish;
  }

  function setSimulator(simKey) {
    currentSim = simKey;

    document.querySelectorAll('.author-dev-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.sim === simKey);
    });

    document.body.classList.remove('sim-mobile', 'sim-tablet', 'sim-tablet-rotated', 'sim-desktop');

    if (simKey === 'mobile') document.body.classList.add('sim-mobile');
    else if (simKey === 'tablet') document.body.classList.add('sim-tablet');
    else if (simKey === 'tablet-rotated') document.body.classList.add('sim-tablet-rotated');
    else if (simKey === 'desktop') document.body.classList.add('sim-desktop');

    // Forzar redibujo en el motor para que aplique reglas de densidad
    if (root.SoyUnifiedEngine) {
      root.SoyUnifiedEngine.reloadContent();
    }
  }

  function toggleHud() {
    isHudCollapsed = !isHudCollapsed;
    document.body.classList.toggle('hud-collapsed', isHudCollapsed);
  }

  // Drawer de Edición
  function createAuthorDrawer() {
    if (document.getElementById('author-drawer')) return;

    const drawer = document.createElement('aside');
    drawer.id = 'author-drawer';
    drawer.className = 'author-drawer';
    drawer.setAttribute('aria-label', 'Panel lateral de edición de contenidos');

    drawer.innerHTML = `
      <div class="author-drawer-header">
        <h3 class="author-drawer-title">Editor de Contenidos en Vivo</h3>
        <button type="button" class="author-drawer-close" id="author-drawer-close">×</button>
      </div>

      <div class="author-drawer-body">
        <!-- SELECCIÓN DE PROTAGONISTA HERO -->
        <div class="author-field-group">
          <label for="ed-hero-select">Acompañamiento Protagonista en el Hero:</label>
          <select id="ed-hero-select" class="author-select"></select>
          <small style="color:#8d6c36; font-size:.8rem;">* La oferta elegida en el Hero se excluye automáticamente del Bazar.</small>
        </div>

        <!-- SELECCIÓN DE ESTILO DE TARJETAS -->
        <div class="author-field-group">
          <label for="ed-style-select">Estilo Visual de Tarjetas en el Bazar:</label>
          <select id="ed-style-select" class="author-select">
            <option value="atelier">1. Lámina Atelier (Editorial & Botánica)</option>
            <option value="portal">2. Portal Arquetípico (Arco Sagrado)</option>
            <option value="notebook">3. Cuaderno de Sabiduría (Nota & Cita)</option>
            <option value="alchemy">4. Atmósfera Alquímica (Noche & Oro)</option>
            <option value="baseline">0. Baseline Actual en Sitio</option>
          </select>
        </div>

        <hr style="border:none; border-top:1px solid rgba(141,108,54,.25); margin:.5rem 0;">

        <!-- EDICIÓN DE TEXTOS DE LA OFERTA HERO ACTIVA -->
        <div class="author-field-group">
          <label for="ed-hero-title">Título del Hero:</label>
          <input type="text" id="ed-hero-title" class="author-input">
        </div>

        <div class="author-field-group">
          <label for="ed-hero-lead">Bajada en Itálica:</label>
          <input type="text" id="ed-hero-lead" class="author-input">
        </div>

        <div class="author-field-group">
          <label for="ed-hero-body">Cuerpo de Texto (Escritorio / Tablet):</label>
          <textarea id="ed-hero-body" class="author-textarea" rows="3"></textarea>
        </div>

        <div class="author-field-group">
          <label for="ed-hero-body-mobile">Cuerpo de Texto (Versión Móvil):</label>
          <textarea id="ed-hero-body-mobile" class="author-textarea" rows="2"></textarea>
        </div>

        <div class="author-field-group">
          <label for="ed-hero-quote">Cita sobre la Imagen:</label>
          <input type="text" id="ed-hero-quote" class="author-input">
        </div>
      </div>

      <div class="author-drawer-footer">
        <button type="button" class="author-tool-btn" id="author-btn-reset-default">Restablecer Valores</button>
        <button type="button" class="author-tool-btn btn-publish" id="author-btn-save-drawer">Listo ✦</button>
      </div>
    `;

    document.body.appendChild(drawer);

    document.getElementById('author-drawer-close').onclick = toggleAuthorDrawer;
    document.getElementById('author-btn-save-drawer').onclick = toggleAuthorDrawer;
    document.getElementById('author-btn-reset-default').onclick = handleResetDefaults;

    populateDrawerFields();
    bindDrawerInputs();
  }

  function toggleAuthorDrawer() {
    const drawer = document.getElementById('author-drawer');
    if (!drawer) return;
    drawer.classList.toggle('is-open');
    if (drawer.classList.contains('is-open')) {
      populateDrawerFields();
    }
  }

  function populateDrawerFields() {
    if (!root.SoySiteContent) return;
    const content = root.SoySiteContent.load();

    const heroSelect = document.getElementById('ed-hero-select');
    heroSelect.innerHTML = '';
    Object.values(content.offers).forEach(offer => {
      const opt = document.createElement('option');
      opt.value = offer.id;
      opt.textContent = `${offer.title} (${offer.category === 'courses' ? 'Curso' : 'Servicio'})`;
      opt.selected = offer.id === content.settings.activeHeroId;
      heroSelect.appendChild(opt);
    });

    const styleSelect = document.getElementById('ed-style-select');
    styleSelect.value = content.settings.activeCardStyle || 'atelier';

    const activeHero = content.offers[content.settings.activeHeroId];
    if (activeHero) {
      document.getElementById('ed-hero-title').value = activeHero.title || '';
      document.getElementById('ed-hero-lead').value = activeHero.heroLead || '';
      document.getElementById('ed-hero-body').value = activeHero.heroBody || '';
      document.getElementById('ed-hero-body-mobile').value = activeHero.heroBodyMobile || '';
      document.getElementById('ed-hero-quote').value = activeHero.heroQuote || '';
    }
  }

  function bindDrawerInputs() {
    const heroSelect = document.getElementById('ed-hero-select');
    const styleSelect = document.getElementById('ed-style-select');

    heroSelect.onchange = (e) => {
      const content = root.SoySiteContent.load();
      content.settings.activeHeroId = e.target.value;
      root.SoySiteContent.save(content);
      populateDrawerFields();
      if (root.SoyUnifiedEngine) root.SoyUnifiedEngine.reloadContent();
    };

    styleSelect.onchange = (e) => {
      const content = root.SoySiteContent.load();
      content.settings.activeCardStyle = e.target.value;
      root.SoySiteContent.save(content);
      if (root.SoyUnifiedEngine) root.SoyUnifiedEngine.reloadContent();
    };

    const updateActiveHeroProp = (key, val) => {
      const content = root.SoySiteContent.load();
      const heroId = content.settings.activeHeroId;
      if (content.offers[heroId]) {
        content.offers[heroId][key] = val;
        root.SoySiteContent.save(content);
        if (root.SoyUnifiedEngine) root.SoyUnifiedEngine.reloadContent();
      }
    };

    document.getElementById('ed-hero-title').oninput = (e) => updateActiveHeroProp('title', e.target.value);
    document.getElementById('ed-hero-lead').oninput = (e) => updateActiveHeroProp('heroLead', e.target.value);
    document.getElementById('ed-hero-body').oninput = (e) => updateActiveHeroProp('heroBody', e.target.value);
    document.getElementById('ed-hero-body-mobile').oninput = (e) => updateActiveHeroProp('heroBodyMobile', e.target.value);
    document.getElementById('ed-hero-quote').oninput = (e) => updateActiveHeroProp('heroQuote', e.target.value);
  }

  function handleResetDefaults() {
    if (confirm('¿Restablecer todos los textos y configuraciones a los valores de fábrica?')) {
      root.SoySiteContent.reset();
      populateDrawerFields();
      if (root.SoyUnifiedEngine) root.SoyUnifiedEngine.reloadContent();
    }
  }

  function handlePublish() {
    const content = root.SoySiteContent.load();
    const jsonStr = JSON.stringify(content, null, 2);
    
    // Descarga automática del archivo data/site-content.json
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site-content-publicado.json';
    a.click();
    URL.revokeObjectURL(url);

    alert('✦ ¡Configuración y contenidos guardados localmente!\nSe ha generado un archivo de respaldo descargable para publicación.');
  }

  // Exportar API
  root.SoyAuthorMode = {
    init: init,
    enable: enableAuthorMode,
    setSimulator: setSimulator,
    toggleDrawer: toggleAuthorDrawer,
    toggleHud: toggleHud
  };

  // Arrancar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
