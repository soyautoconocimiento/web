/* ==========================================================
   COLORES DEL ALMA · TRES CONCEPTOS (prototipos)
   Solo actúa con ?concept=1, ?concept=2 o ?concept=3.
   Sin ese parámetro no hace nada: la sección queda como está.
   1 · Relato vertical de piezas
   2 · Galería deslizable con hoja inferior
   3 · Catálogo por colecciones
   Los datos vienen de tienda/productos.json (vía window.SoyStore,
   tucontu-store.js). Los textos del concepto se leen del propio
   index.html, para no copiarlos ni inventarlos.
   Comparación y fuentes: tucontu/REDESIGN.md
   ========================================================== */
(() => {
  const concept = new URLSearchParams(location.search).get('concept');
  if (!/^[123]$/.test(concept || '')) return;
  const section = document.getElementById('tucontu');
  const S = window.SoyStore;
  if (!section || !S) return;

  const { el, text } = S;
  section.dataset.concept = concept;
  const root = el('div', { class: `cx-root cx-${concept}`, id: 'cx-root' });
  section.append(root);

  /* ---------- Textos que ya existen en index.html ---------- */
  const one = selector => text(document.querySelector(selector)?.textContent);
  const all = selector => [...document.querySelectorAll(selector)];
  const story = {
    intro: one('#tucontu .tucontu-intro'),
    // preview.js reescribe estas líneas para la animación (texto oculto + tinta): se lee solo una copia.
    history: all('#concept-slide-0 .tucontu-history-main p').map(p => text((p.querySelector('.visually-hidden') || p).textContent)),
    quote: one('#concept-slide-0 .tucontu-ordinary-quote p'),
    quoteBy: one('#concept-slide-0 .tucontu-ordinary-quote cite'),
    specs: all('#concept-slide-1 .tucontu-spec-item').map(i => [text(i.querySelector('strong')?.textContent), text(i.querySelector('span')?.textContent)]),
    lines: all('#concept-slide-2 .tucontu-goddess-item').map(i => ({
      name: text(i.querySelector('.goddess-header strong')?.textContent),
      kind: text(i.querySelector('.goddess-header span')?.textContent),
      role: text(i.querySelector('.goddess-role')?.textContent)
    })),
    symbols: all('#concept-slide-4 .tucontu-symbolic-details li').map(li => ({
      name: text(li.querySelector('strong')?.textContent),
      meaning: text(li.querySelector('span')?.textContent)
    })),
    closingTitle: one('#concept-slide-6 .concept-closing-card strong'),
    closing: one('#concept-slide-6 .concept-closing-card p')
  };
  const DOSSIER = 'assets/tucontu/manual-tecnico-tucontu.pdf';

  /* ---------- Piezas: botones y enlaces con las convenciones de GA4 y del contador QR ---------- */
  const nameOf = p => text(p.nombre) || p.id;
  const sold = p => p.disponible === false;
  const priceLabel = p => (sold(p) ? 'Vendida' : S.priceText(p));
  const collectionLabel = p => { const c = S.collectionOf(p); return [c.nombre, c.etiqueta].map(text).filter(Boolean).join(' · '); };

  // Abre la ficha. Sin id: el contador QR lo nombra ver-<id>; GA4 envía view_item (data-store-item).
  function openButton(p, children, cls, label) {
    const b = el('button', {
      type: 'button', class: cls, 'aria-haspopup': 'dialog',
      'aria-label': label || `${nameOf(p)}, ${priceLabel(p)}. Ver ficha`,
      dataset: { offerId: p.id, storeItem: p.id, storeName: nameOf(p) }
    }, children);
    b.addEventListener('click', () => detail.open(p, b));
    return b;
  }

  // Pedido: el único WhatsApp de Marcela, con la pieza nombrada (mismo mensaje que la Tienda).
  function orderLink(p, id, label) {
    return el('a', {
      class: 'cx-order', id, href: S.whatsAppHref(S.orderMessage(p)), target: '_blank', rel: 'noopener noreferrer',
      dataset: { storeOrder: '', storeName: nameOf(p) }
    }, [el('span', { class: 'cx-wa-mark', 'aria-hidden': 'true' }), el('span', { text: label || (sold(p) ? 'Pedir una parecida' : 'Pedir por WhatsApp') })]);
  }

  // "Personaliza el tuyo": abre el creador que ya existe (#tucontu-create) y devuelve el foco aquí al cerrarlo.
  function customizeButton(label, cls = 'cx-customize') {
    const b = el('button', { type: 'button', class: cls, dataset: { storeCustomize: '' } }, el('span', { text: label }));
    b.addEventListener('click', () => {
      if (detail.isOpen()) detail.close();
      const builder = document.getElementById('tucontu-builder-dialog');
      document.getElementById('tucontu-create')?.click();
      builder?.addEventListener('close', () => b.isConnected && b.focus({ preventScroll: true }), { once: true });
    });
    return b;
  }

  function videoButton() {
    const pill = document.getElementById('gallery-video-pill-btn');
    if (!pill) return null;
    const b = el('button', { type: 'button', class: 'cx-link-button', 'aria-haspopup': 'dialog' }, el('span', { text: 'Ver el video con Marcela' }));
    b.addEventListener('click', () => pill.click());
    return b;
  }
  const dossierLink = () => el('a', { class: 'cx-link-button', href: DOSSIER, target: '_blank', rel: 'noopener' }, el('span', { text: 'Dossier en PDF' }));

  /* ---------- Fotos de una pieza: deslizar (con miniaturas opcionales) o apiladas ---------- */
  function gallery(p, { layout = 'swipe', thumbs = false, counter = true, eager = false } = {}) {
    const wrap = el('div', { class: `cx-gal cx-gal--${layout}` });
    const track = el('div', { class: 'cx-gal-track', role: 'group', 'aria-label': `Fotografías de ${nameOf(p)}`, tabindex: layout === 'swipe' && p.fotos.length > 1 ? '0' : null });
    const slides = p.fotos.map((f, i) => el('figure', { class: 'cx-gal-slide' },
      el('img', { src: f.src, alt: text(f.alt), loading: eager && i === 0 ? 'eager' : 'lazy', decoding: 'async' })));
    track.append(...slides);
    wrap.append(track);
    if (layout !== 'swipe' || p.fotos.length < 2) return wrap;

    const count = counter ? el('span', { class: 'cx-gal-count', 'aria-hidden': 'true', text: `1 / ${p.fotos.length}` }) : null;
    const thumbRow = thumbs ? el('div', { class: 'cx-gal-thumbs', role: 'group', 'aria-label': 'Elegir fotografía' }) : null;
    const thumbButtons = thumbs ? p.fotos.map((f, i) => {
      const b = el('button', { type: 'button', class: 'cx-gal-thumb', 'aria-label': `Foto ${i + 1} de ${p.fotos.length}`, 'aria-pressed': String(i === 0), dataset: { storePhoto: String(i) } },
        el('img', { src: f.src, alt: '', loading: 'lazy', decoding: 'async' }));
      b.addEventListener('click', () => track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' }));
      return b;
    }) : [];
    if (thumbRow) { thumbRow.append(...thumbButtons); wrap.append(thumbRow); }
    if (count) wrap.append(count);

    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const i = slides.indexOf(entry.target);
      if (count) count.textContent = `${i + 1} / ${slides.length}`;
      thumbButtons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    }), { root: track, threshold: 0.6 });
    slides.forEach(s => io.observe(s));
    return wrap;
  }

  /* ---------- Ficha accesible (diálogo modal, patrón W3C APG) ----------
     variant: 'pliego' (1, fotos apiladas) · 'sheet' (2, hoja inferior) · 'page' (3, página completa).
     Foco al botón cerrar, Tab gira dentro, Escape cierra, el foco vuelve a quien la abrió.
     En 2 y 3 el botón Atrás del teléfono también la cierra. */
  const detail = (() => {
    const variant = { 1: 'pliego', 2: 'sheet', 3: 'page' }[concept];
    const useHistory = variant !== 'pliego';
    const closeText = { pliego: 'Cerrar', sheet: 'Cerrar', page: '← Volver' }[variant];
    const dialog = el('dialog', { class: `cx-detail cx-detail--${variant}`, 'aria-labelledby': 'cx-detail-title' });
    document.body.append(dialog);
    let trigger = null;
    let pushed = false;

    function fill(p) {
      const c = S.collectionOf(p);
      const description = text(p.descripcion) || text(c.descripcion);
      const specs = [['Medidas', p.medidas], ['Materiales', p.materiales]].filter(([, v]) => text(v));
      const note = [sold(p) ? 'Esta pieza ya fue vendida. Puedes pedir una parecida.' : '', text(S.store?.tienda?.nota_compra)].filter(Boolean).join(' ');
      dialog.dataset.offerId = p.id; // el contador QR registra el WhatsApp con este id
      const close = el('button', { type: 'button', class: 'cx-detail-close', 'aria-label': 'Cerrar ficha de la pieza', dataset: { storeClose: '' } }, el('span', { 'aria-hidden': 'true', text: closeText }));
      close.addEventListener('click', api.close);
      const info = el('div', { class: 'cx-detail-info' }, [
        el('p', { class: 'cx-eyebrow', text: collectionLabel(p) }),
        el('h2', { id: 'cx-detail-title', text: nameOf(p) }),
        el('p', { class: 'cx-price' + (S.hasPrice(p) ? '' : ' is-ask'), text: priceLabel(p) }),
        el('div', { class: 'cx-detail-desc' }, description.split(/\n+/).filter(Boolean).map(line => el('p', { text: line }))),
        specs.length ? el('dl', { class: 'cx-specs' }, specs.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: text(v) })])) : null,
        note ? el('p', { class: 'cx-note', text: note }) : null
      ]);
      const actions = el('div', { class: 'cx-detail-actions' }, [orderLink(p, 'cx-detail-order'), customizeButton('Prefiero personalizar el mío', 'cx-customize cx-customize--quiet')]);
      const media = gallery(p, variant === 'pliego' ? { layout: 'stack' } : { layout: 'swipe', thumbs: variant === 'page', eager: true });
      const top = el('div', { class: 'cx-detail-top' }, [variant === 'sheet' ? el('span', { class: 'cx-grip', 'aria-hidden': 'true' }) : null, close]);
      dialog.replaceChildren(el('div', { class: 'cx-detail-shell' }, [top, el('div', { class: 'cx-detail-body' }, [media, info]), actions]));
      return close;
    }

    const api = {
      isOpen: () => dialog.open,
      open(p, from) {
        trigger = from || document.activeElement;
        const close = fill(p);
        dialog.scrollTop = 0;
        if (!dialog.open) dialog.showModal();
        close.focus({ preventScroll: true });
        if (useHistory && !pushed) { history.pushState({ cxDetail: p.id }, '', location.href); pushed = true; }
      },
      close() { if (dialog.open) dialog.close(); }
    };

    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusables = [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')].filter(n => n.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) api.close(); });
    dialog.addEventListener('close', () => {
      if (pushed) { pushed = false; history.back(); }
      const target = trigger;
      trigger = null;
      if (target && target.isConnected) target.focus({ preventScroll: true });
    });
    window.addEventListener('popstate', () => { if (dialog.open) { pushed = false; dialog.close(); } });
    return api;
  })();

  /* ==========================================================
     1 · RELATO VERTICAL: una pieza por capítulo, el pedido siempre a mano
     ========================================================== */
  function renderStory(store) {
    const pieces = store.productos;
    const cover = el('header', { class: 'cx1-cover' }, [
      el('p', { class: 'cx-eyebrow', text: 'Colores del Alma' }),
      el('h2', { class: 'cx-display', text: 'TuconTu' }),
      story.intro ? el('p', { class: 'cx1-kicker', text: story.intro }) : null,
      el('div', { class: 'cx1-history' }, story.history.map(line => el('p', { text: line }))),
      pieces.length ? el('nav', { class: 'cx1-index', 'aria-label': 'Ir a una pieza' }, el('ul', {}, pieces.map(p =>
        el('li', {}, el('a', { href: `#cx-piece-${p.id}`, class: 'cx1-index-link', 'aria-label': `${nameOf(p)}` },
          el('img', { src: p.fotos[0].src, alt: '', loading: 'eager', decoding: 'async' })))))) : null,
      el('p', { class: 'cx1-scroll-cue', 'aria-hidden': 'true', text: `${pieces.length} piezas · desliza hacia abajo` })
    ]);
    const chapters = [];
    pieces.forEach((p, i) => {
      chapters.push(el('article', { class: 'cx1-piece', id: `cx-piece-${p.id}`, 'aria-labelledby': `cx-name-${p.id}`, dataset: { piece: p.id } }, [
        gallery(p, { layout: 'swipe', eager: i === 0 }),
        el('div', { class: 'cx1-piece-text' }, [
          el('p', { class: 'cx-eyebrow', text: `${String(i + 1).padStart(2, '0')} / ${String(pieces.length).padStart(2, '0')} · ${collectionLabel(p)}` }),
          el('h3', { id: `cx-name-${p.id}`, class: 'cx1-name', text: nameOf(p) }),
          el('p', { class: 'cx-price' + (S.hasPrice(p) ? '' : ' is-ask'), text: priceLabel(p) }),
          text(p.descripcion) ? el('p', { class: 'cx1-desc', text: text(p.descripcion).split(/\n+/)[0] }) : null,
          openButton(p, el('span', { text: 'Ver detalles' }), 'cx-secondary')
        ])
      ]));
      // Entre capítulos, una línea del lenguaje simbólico de TuconTu (texto de Marcela).
      const symbol = story.symbols[i];
      if (symbol && i < pieces.length - 1 && i % 2 === 1) {
        chapters.push(el('aside', { class: 'cx1-interlude', 'aria-label': symbol.name }, [
          el('span', { class: 'cx-star', 'aria-hidden': 'true', text: '✦' }),
          el('p', { class: 'cx1-interlude-name', text: symbol.name }),
          el('p', { text: symbol.meaning })
        ]));
      }
    });
    const end = el('section', { class: 'cx1-end', 'aria-labelledby': 'cx1-end-title' }, [
      el('span', { class: 'cx-star', 'aria-hidden': 'true', text: '✦' }),
      el('h3', { id: 'cx1-end-title', class: 'cx-display-sm', text: '¿Sueñas otra combinación?' }),
      el('p', { text: 'Elige el largo, las fibras y los colores, y Marcela la teje para ti.' }),
      story.lines.length ? el('ul', { class: 'cx-lines' }, story.lines.map(l => el('li', {}, [el('strong', { text: l.name }), el('span', { text: [l.kind, l.role].filter(Boolean).join(' · ') })]))) : null,
      customizeButton('Personaliza el tuyo', 'cx-primary'),
      el('div', { class: 'cx-more' }, [videoButton(), dossierLink()]),
      story.quote ? el('blockquote', { class: 'cx-quote' }, [el('p', { text: story.quote }), story.quoteBy ? el('cite', { text: story.quoteBy }) : null]) : null
    ]);

    // Barra fija de pedido: siempre nombra la pieza que está en pantalla.
    const barThumb = el('img', { class: 'cx1-bar-thumb', alt: '', decoding: 'async' });
    const barName = el('span', { class: 'cx1-bar-name' });
    const barPrice = el('span', { class: 'cx1-bar-price' });
    const barSlot = el('span', { class: 'cx1-bar-slot' });
    const bar = el('div', { class: 'cx1-bar', 'aria-label': 'Pedido de la pieza en pantalla', role: 'region', hidden: true }, [
      barThumb, el('span', { class: 'cx1-bar-text' }, [barName, barPrice]), barSlot
    ]);
    let current = '';
    function setBar(p) {
      if (!p) { bar.hidden = true; current = ''; return; }
      if (p.id === current) return;
      current = p.id;
      bar.hidden = false;
      bar.dataset.offerId = p.id;
      barThumb.src = p.fotos[0].src;
      barName.textContent = nameOf(p);
      barPrice.textContent = priceLabel(p);
      const link = orderLink(p, 'cx-bar-order', sold(p) ? 'Pedir parecida' : 'Pedir');
      link.setAttribute('aria-label', `${sold(p) ? 'Pedir una parecida a' : 'Pedir'} ${nameOf(p)} por WhatsApp`);
      barSlot.replaceChildren(link);
    }
    const visible = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => visible.set(e.target.dataset.piece, e.intersectionRatio));
      const best = [...visible.entries()].filter(([, r]) => r > 0.35).sort((a, b) => b[1] - a[1])[0];
      setBar(best ? pieces.find(p => p.id === best[0]) : null);
    }, { root, threshold: [0, 0.35, 0.6, 0.9] });

    root.replaceChildren(cover, ...chapters, end, bar);
    chapters.filter(c => c.dataset.piece).forEach(c => io.observe(c));
    // Los enlaces del índice desplazan dentro de la sección, sin cambiar el #tucontu de la dirección.
    root.querySelectorAll('.cx1-index-link').forEach(a => a.addEventListener('click', event => {
      event.preventDefault();
      const target = root.querySelector(a.getAttribute('href'));
      if (!target) return;
      root.scrollTo({ top: target.offsetTop - 8, behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }));
  }

  /* ==========================================================
     2 · GALERÍA DESLIZABLE: una pieza por pantalla, la ficha sube desde abajo
     ========================================================== */
  function renderGallery(store) {
    const pieces = store.productos;
    const slides = [];
    slides.push(el('div', { class: 'cx2-slide cx2-slide--intro' }, [
      el('p', { class: 'cx-eyebrow', text: 'Colores del Alma' }),
      el('h2', { class: 'cx-display', text: 'TuconTu' }),
      story.intro ? el('p', { class: 'cx1-kicker', text: story.intro }) : null,
      el('div', { class: 'cx2-history' }, story.history.map(line => el('p', { text: line }))),
      el('p', { class: 'cx2-cue', 'aria-hidden': 'true', text: `Desliza para ver ${pieces.length} piezas →` })
    ]));
    pieces.forEach((p, i) => {
      slides.push(el('div', { class: 'cx2-slide cx2-slide--piece' }, [
        el('img', { class: 'cx2-photo', src: p.fotos[0].src, alt: text(p.fotos[0].alt), loading: i < 2 ? 'eager' : 'lazy', decoding: 'async' }),
        el('div', { class: 'cx2-caption' }, [
          el('p', { class: 'cx2-caption-eyebrow', text: collectionLabel(p) }),
          el('h3', { class: 'cx2-name', text: nameOf(p) }),
          el('p', { class: 'cx2-price', text: priceLabel(p) + (p.fotos.length > 1 ? ` · ${p.fotos.length} fotos` : '') }),
          openButton(p, [el('span', { text: 'Ver pieza' }), el('span', { 'aria-hidden': 'true', text: ' ↑' })], 'cx-primary cx2-open')
        ])
      ]));
    });
    slides.push(el('div', { class: 'cx2-slide cx2-slide--end' }, [
      el('span', { class: 'cx-star', 'aria-hidden': 'true', text: '✦' }),
      el('h3', { class: 'cx-display-sm', text: '¿Sueñas otra combinación?' }),
      el('p', { text: 'Elige el largo, las fibras y los colores, y Marcela la teje para ti.' }),
      story.lines.length ? el('ul', { class: 'cx-lines' }, story.lines.map(l => el('li', {}, [el('strong', { text: l.name }), el('span', { text: l.kind })]))) : null,
      customizeButton('Personaliza el tuyo', 'cx-primary'),
      el('div', { class: 'cx-more' }, [videoButton(), dossierLink()])
    ]));
    slides.forEach((s, i) => { s.setAttribute('role', 'group'); s.setAttribute('aria-roledescription', 'diapositiva'); s.setAttribute('aria-label', `${i + 1} de ${slides.length}`); });

    // Patrón carrusel de W3C APG: región con nombre, botones nativos anterior/siguiente, sin giro automático.
    const track = el('div', { class: 'cx2-track', 'aria-live': 'polite', tabindex: '0' }, slides);
    const prev = el('button', { type: 'button', class: 'cx2-nav', id: 'cx2-prev', 'aria-controls': 'cx2-track', 'aria-label': 'Pieza anterior' }, el('span', { 'aria-hidden': 'true', text: '←' }));
    const next = el('button', { type: 'button', class: 'cx2-nav', id: 'cx2-next', 'aria-controls': 'cx2-track', 'aria-label': 'Pieza siguiente' }, el('span', { 'aria-hidden': 'true', text: '→' }));
    track.id = 'cx2-track';
    const count = el('span', { class: 'cx2-count', text: `1 / ${slides.length}` });
    const progress = el('span', { class: 'cx2-progress', 'aria-hidden': 'true' }, el('span'));
    const carousel = el('section', { class: 'cx2-carousel', 'aria-roledescription': 'carrusel', 'aria-label': 'Piezas TuconTu' }, [
      track,
      el('div', { class: 'cx2-controls' }, [prev, el('span', { class: 'cx2-where' }, [count, progress]), next])
    ]);
    root.replaceChildren(carousel);

    let index = 0;
    const go = i => {
      const target = slides[Math.max(0, Math.min(slides.length - 1, i))];
      track.scrollTo({ left: target.offsetLeft - track.offsetLeft - (parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0), behavior: 'smooth' });
    };
    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      index = slides.indexOf(e.target);
      count.textContent = `${index + 1} / ${slides.length}`;
      progress.firstChild.style.width = `${((index + 1) / slides.length) * 100}%`;
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    }), { root: track, threshold: 0.6 });
    slides.forEach(s => io.observe(s));
    prev.disabled = true;
  }

  /* ==========================================================
     3 · CATÁLOGO POR COLECCIONES: cada colección es un estante; la ficha es una página
     ========================================================== */
  function renderCatalog(store) {
    const used = store.colecciones.filter(c => store.productos.some(p => p.coleccion === c.id));
    const header = el('header', { class: 'cx3-header' }, [
      el('p', { class: 'cx-eyebrow', text: 'Colores del Alma' }),
      el('h2', { class: 'cx-display', text: text(store.tienda.titulo) || 'Tienda' }),
      text(store.tienda.bajada) ? el('p', { class: 'cx3-lead', text: text(store.tienda.bajada) }) : null
    ]);
    // Con 2 o más colecciones aparece un índice de estantes (GA4: store_collection_select).
    const nav = used.length >= 2 ? el('nav', { class: 'cx3-shelves-nav', 'aria-label': 'Colecciones' }, used.map(c => {
      const a = el('a', { href: `#cx-col-${c.id}`, class: 'cx3-chip', dataset: { storeFilter: c.id } }, [el('span', { text: c.nombre }), el('span', { class: 'cx3-chip-count', text: String(store.productos.filter(p => p.coleccion === c.id).length) })]);
      a.addEventListener('click', event => { event.preventDefault(); const t = root.querySelector(`#cx-col-${c.id}`); root.scrollTo({ top: t.offsetTop - 8, behavior: 'smooth' }); });
      return a;
    })) : null;

    const shelves = used.map(c => {
      const items = store.productos.filter(p => p.coleccion === c.id);
      const rows = items.map(p => el('li', {}, openButton(p, [
        el('span', { class: 'cx3-row-img' }, el('img', { src: p.fotos[0].src, alt: '', loading: 'lazy', decoding: 'async' })),
        el('span', { class: 'cx3-row-text' }, [
          el('span', { class: 'cx3-row-name', text: nameOf(p) }),
          el('span', { class: 'cx3-row-price' + (sold(p) ? ' is-sold' : ''), text: priceLabel(p) }),
          el('span', { class: 'cx3-row-meta', text: p.fotos.length > 1 ? `${p.fotos.length} fotos` : '1 foto' })
        ]),
        el('span', { class: 'cx3-row-chevron', 'aria-hidden': 'true', text: '›' })
      ], 'cx3-row')));
      const about = c.id === 'tucontu' ? el('details', { class: 'cx3-about' }, [
        el('summary', {}, el('span', { text: `Sobre ${c.nombre}: historia, ficha y líneas` })),
        el('div', { class: 'cx3-about-body' }, [
          ...story.history.map(line => el('p', { text: line })),
          story.specs.length ? el('dl', { class: 'cx-specs' }, story.specs.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])) : null,
          story.lines.length ? el('ul', { class: 'cx-lines' }, story.lines.map(l => el('li', {}, [el('strong', { text: l.name }), el('span', { text: [l.kind, l.role].filter(Boolean).join(' · ') })]))) : null,
          el('div', { class: 'cx-more' }, [videoButton(), dossierLink()])
        ])
      ]) : null;
      const custom = c.id === 'tucontu' ? el('li', { class: 'cx3-custom' }, [
        el('p', { class: 'cx3-custom-title', text: '¿Sueñas otra combinación?' }),
        el('p', { text: 'Elige el largo, las fibras y los colores, y Marcela la teje para ti.' }),
        customizeButton('Personaliza el tuyo', 'cx-secondary')
      ]) : null;
      return el('section', { class: 'cx3-shelf', id: `cx-col-${c.id}`, 'aria-labelledby': `cx-col-title-${c.id}` }, [
        el('div', { class: 'cx3-shelf-head' }, [
          el('h3', { id: `cx-col-title-${c.id}`, class: 'cx3-shelf-title', text: c.nombre }),
          el('span', { class: 'cx3-shelf-count', text: items.length === 1 ? '1 pieza' : `${items.length} piezas` })
        ]),
        text(c.etiqueta) ? el('p', { class: 'cx3-tag', text: c.etiqueta }) : null,
        text(c.descripcion) ? el('p', { class: 'cx3-shelf-desc', text: c.descripcion }) : null,
        about,
        el('ul', { class: 'cx3-list', 'aria-label': `Piezas de ${c.nombre}` }, [...rows, custom])
      ]);
    });
    root.replaceChildren(...[header, nav, ...shelves].filter(Boolean));
    if (!shelves.length) root.append(el('p', { class: 'cx-empty', text: 'Muy pronto habrá piezas aquí.' }));
  }

  /* ---------- Carga ---------- */
  S.ready
    .then(store => {
      S.store = store;
      ({ 1: renderStory, 2: renderGallery, 3: renderCatalog })[concept](store);
    })
    .catch(() => {
      const link = el('a', { href: S.whatsAppHref('Hola Marcela, quiero ver las piezas de Colores del Alma.'), target: '_blank', rel: 'noopener noreferrer', text: 'escríbele a Marcela por WhatsApp' });
      root.replaceChildren(el('p', { class: 'cx-empty' }, [document.createTextNode('No pudimos mostrar las piezas ahora. Puedes '), link, document.createTextNode('.')]));
    });
})();
