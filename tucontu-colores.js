/* ==========================================================
   COLORES DEL ALMA · DISEÑO POR DEFECTO (móvil primero)
   1. Qué es TuconTu: un accesorio (palabras de Marcela, leídas
      del propio index.html y de tienda/productos.json).
   2. Las piezas: galería deslizable armada con
      tienda/productos.json, con ficha accesible (hoja inferior).
   3. Los colores de algodón: tienda/colores-algodon.json.
   4. Barra inferior fija: nombra la pieza y los colores
      elegidos y lleva el botón de pedido (el único WhatsApp).
   La cortina "Muy pronto" no se toca: la maneja preview.js.

   INTERRUPTOR DEL CREADOR "Personaliza el tuyo":
   en index.html, <section id="tucontu" data-builder="oculto">.
   Cambiar "oculto" por "visible" vuelve a mostrar su botón
   bajo los colores. Sus archivos (tucontu-builder-*) siguen
   cargados y sin cambios.
   Nota de diseño: tucontu/DESIGN.md
   ========================================================== */
(() => {
  const section = document.getElementById('tucontu');
  const S = window.SoyStore;
  if (!section || !S) return;

  const COLORS_URL = 'tienda/colores-algodon.json';
  const DOSSIER = 'assets/tucontu/manual-tecnico-tucontu.pdf';
  const builderVisible = section.dataset.builder === 'visible';
  const { el, text } = S;

  section.dataset.tc = '';
  const root = el('div', { class: 'tc-root', id: 'tc-root' });
  section.append(root);

  /* ---------- Textos que ya existen en index.html (no se copian ni se inventan) ---------- */
  const one = selector => text(document.querySelector(selector)?.textContent);
  const homePhoto = document.getElementById('tucontu-home-photo');
  const story = {
    intro: one('#tucontu .tucontu-intro'),
    // preview.js reescribe estas líneas para la animación (texto oculto + tinta): se lee solo una copia.
    history: [...document.querySelectorAll('#concept-slide-0 .tucontu-history-main p')]
      .map(p => text((p.querySelector('.visually-hidden') || p).textContent))
  };

  /* ---------- Estado: una pieza y hasta N colores ---------- */
  const state = { piece: null, colors: [] };
  let pieces = [];
  let palette = [];
  let maxColors = 3;
  const listeners = new Set();
  const changed = () => listeners.forEach(fn => fn());

  const nameOf = p => text(p.nombre) || p.id;
  const sold = p => p.disponible === false;
  const priceLabel = p => (sold(p) ? 'Vendida' : S.priceText(p));
  const collectionLabel = p => { const c = S.collectionOf(p); return [c.nombre, c.etiqueta].map(text).filter(Boolean).join(' · '); };
  const colorLabel = c => `${c.codigo} ${c.nombre}`;
  const joinY = items => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`);

  function choosePiece(p) {
    state.piece = state.piece?.id === p.id ? null : p;
    changed();
  }

  /* ---------- Mensaje de WhatsApp: nombra la pieza y los colores elegidos ---------- */
  function message() {
    const p = state.piece;
    const colors = joinY(state.colors.map(colorLabel));
    if (!p && !colors) return 'Hola Marcela, quiero ver las piezas de Colores del Alma.';
    if (!colors) return S.orderMessage(p);
    if (!p) return `Hola Marcela, me gustaría un TuconTu de Colores del Alma en los colores ${colors}.`;
    const c = S.collectionOf(p);
    const name = nameOf(p);
    const what = text(c.nombre) && !name.startsWith(c.nombre) ? `${c.nombre} «${name}»` : `«${name}»`;
    if (sold(p)) return `Hola Marcela, vi en la tienda de Colores del Alma la pieza ${what} (ref. ${p.id}). Me gustaría pedir una parecida en los colores ${colors}.`;
    return `Hola Marcela, me interesa la pieza ${what} de la tienda de Colores del Alma (ref. ${p.id}), en los colores ${colors}.${S.hasPrice(p) ? '' : ' ¿Cuál es su precio?'}`;
  }

  /* ==========================================================
     1 · APERTURA: qué es TuconTu (un accesorio)
     ========================================================== */
  function renderOpening(store) {
    const c = store.colecciones.find(x => x.id === 'tucontu') || {};
    return el('header', { class: 'tc-open', 'aria-labelledby': 'tc-title' }, [
      el('div', { class: 'tc-open-text' }, [
        el('p', { class: 'tc-eyebrow', text: 'Colores del Alma' }),
        el('h2', { class: 'tc-display', id: 'tc-title', text: 'TuconTu' }),
        story.intro ? el('p', { class: 'tc-kicker', text: story.intro }) : null,
        text(c.descripcion) ? el('p', { class: 'tc-lead', text: text(c.descripcion) }) : null,
        text(c.etiqueta) ? el('p', { class: 'tc-tag', text: c.etiqueta }) : null
      ]),
      homePhoto ? el('figure', { class: 'tc-open-photo' }, el('img', { src: homePhoto.getAttribute('src'), alt: text(homePhoto.alt), loading: 'eager', decoding: 'async' })) : null
    ]);
  }

  /* ==========================================================
     2 · CATÁLOGO: galería deslizable de piezas (patrón carrusel W3C APG)
     ========================================================== */
  function chooseButton(p, cls) {
    const b = el('button', { type: 'button', class: cls, 'aria-pressed': 'false', dataset: { storeChoose: p.id, storeName: nameOf(p) } }, [
      el('span', { class: 'tc-check', 'aria-hidden': 'true', text: '✓' }), el('span', { class: 'tc-choose-label' })
    ]);
    const paint = () => {
      const on = state.piece?.id === p.id;
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('.tc-choose-label').textContent = on ? 'Elegida' : 'Elegir';
      b.setAttribute('aria-label', on ? `${nameOf(p)} elegida. Tocar para quitarla` : `Elegir ${nameOf(p)}`);
    };
    b.addEventListener('click', () => choosePiece(p));
    listeners.add(paint);
    paint();
    return b;
  }

  function renderCatalog(store) {
    const slides = store.productos.map((p, i) => {
      const open = el('button', {
        type: 'button', class: 'tc-secondary tc-open-detail', 'aria-haspopup': 'dialog',
        'aria-label': `${nameOf(p)}, ${priceLabel(p)}. Ver ficha`,
        dataset: { offerId: p.id, storeItem: p.id, storeName: nameOf(p) }
      }, el('span', { text: 'Ver pieza' }));
      open.addEventListener('click', () => detail.open(p, open));
      const slide = el('li', { class: 'tc-slide', 'aria-roledescription': 'diapositiva', 'aria-label': `${i + 1} de ${store.productos.length}: ${nameOf(p)}`, dataset: { piece: p.id } }, [
        el('img', { class: 'tc-slide-photo', src: p.fotos[0].src, alt: text(p.fotos[0].alt), loading: i < 2 ? 'eager' : 'lazy', decoding: 'async' }),
        el('div', { class: 'tc-slide-caption' }, [
          el('p', { class: 'tc-slide-eyebrow', text: collectionLabel(p) }),
          el('h4', { class: 'tc-slide-name', text: nameOf(p) }),
          el('p', { class: 'tc-slide-price', text: priceLabel(p) + (p.fotos.length > 1 ? ` · ${p.fotos.length} fotos` : '') }),
          el('div', { class: 'tc-slide-actions' }, [open, chooseButton(p, 'tc-choose')])
        ])
      ]);
      return slide;
    });

    const track = el('ul', { class: 'tc-track', id: 'tc-track', tabindex: '0', 'aria-label': 'Piezas: desliza o usa las flechas' }, slides);
    const prev = el('button', { type: 'button', class: 'tc-nav', id: 'tc-prev', 'aria-controls': 'tc-track', 'aria-label': 'Pieza anterior', dataset: { storeNav: 'previous' } }, el('span', { 'aria-hidden': 'true', text: '←' }));
    const next = el('button', { type: 'button', class: 'tc-nav', id: 'tc-next', 'aria-controls': 'tc-track', 'aria-label': 'Pieza siguiente', dataset: { storeNav: 'next' } }, el('span', { 'aria-hidden': 'true', text: '→' }));
    const count = el('span', { class: 'tc-count', 'aria-live': 'polite', text: `1 de ${slides.length}` });

    let index = 0;
    const go = i => {
      const target = slides[Math.max(0, Math.min(slides.length - 1, i))];
      if (!target) return;
      track.scrollTo({ left: target.offsetLeft - track.offsetLeft - (parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0), behavior: 'smooth' });
    };
    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      index = slides.indexOf(e.target);
      count.textContent = `${index + 1} de ${slides.length}`;
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    }), { root: track, threshold: 0.6 });
    slides.forEach(s => io.observe(s));
    prev.disabled = true;
    next.disabled = slides.length < 2;

    return el('section', { class: 'tc-pieces', id: 'tc-pieces', 'aria-roledescription': 'carrusel', 'aria-labelledby': 'tc-pieces-title' }, [
      el('div', { class: 'tc-block-head' }, [
        el('p', { class: 'tc-step', 'aria-hidden': 'true', text: '1' }),
        el('div', {}, [
          el('h3', { class: 'tc-h3', id: 'tc-pieces-title', text: text(store.tienda.titulo) || 'Tienda' }),
          text(store.tienda.bajada) ? el('p', { class: 'tc-sub', text: text(store.tienda.bajada) }) : null
        ])
      ]),
      slides.length ? track : el('p', { class: 'tc-empty', text: 'Muy pronto habrá piezas aquí.' }),
      slides.length > 1 ? el('div', { class: 'tc-controls' }, [prev, count, next]) : null
    ]);
  }

  /* ==========================================================
     3 · COLORES DE ALGODÓN: botones reales, código y nombre siempre escritos
     ========================================================== */
  function renderColors(data) {
    const status = el('p', { class: 'tc-color-status', id: 'tc-color-status', 'aria-live': 'polite' });
    const counter = el('span', { class: 'tc-color-count' });
    const buttons = palette.map(c => {
      const order = el('span', { class: 'tc-swatch-order', 'aria-hidden': 'true' });
      const b = el('button', { type: 'button', class: 'tc-swatch', 'aria-pressed': 'false', dataset: { storeColor: c.codigo } }, [
        order,
        el('span', { class: 'tc-swatch-dot', 'aria-hidden': 'true', style: `--dot:${c.hex}` }),
        el('span', { class: 'tc-swatch-code', text: c.codigo }),
        el('span', { class: 'tc-swatch-name', text: c.nombre })
      ]);
      b.addEventListener('click', () => {
        const at = state.colors.findIndex(x => x.codigo === c.codigo);
        if (at >= 0) {
          state.colors.splice(at, 1);
          status.textContent = `Quitaste ${colorLabel(c)}.`;
        } else if (state.colors.length >= maxColors) {
          status.textContent = `Ya elegiste ${maxColors} colores. Quita uno para cambiarlo.`;
          return;
        } else {
          state.colors.push(c);
          status.textContent = `Elegiste ${colorLabel(c)}.`;
        }
        changed();
      });
      return { b, c, order };
    });
    listeners.add(() => {
      const full = state.colors.length >= maxColors;
      buttons.forEach(({ b, c, order }) => {
        const at = state.colors.findIndex(x => x.codigo === c.codigo);
        b.setAttribute('aria-pressed', String(at >= 0));
        order.textContent = at >= 0 ? String(at + 1) : '';
        // Lleno: los demás siguen enfocables (aria-disabled) para que se lea por qué no se pueden elegir.
        if (full && at < 0) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      });
      counter.textContent = `${state.colors.length} de ${maxColors}`;
    });

    const builder = builderVisible ? (() => {
      const b = el('button', { type: 'button', class: 'tc-secondary', dataset: { storeCustomize: '' } }, el('span', { text: 'Personaliza el tuyo' }));
      b.addEventListener('click', () => {
        document.getElementById('tucontu-create')?.click();
        document.getElementById('tucontu-builder-dialog')?.addEventListener('close', () => b.isConnected && b.focus({ preventScroll: true }), { once: true });
      });
      return el('div', { class: 'tc-builder' }, b);
    })() : null;

    return el('section', { class: 'tc-colors', id: 'tc-colors', 'aria-labelledby': 'tc-colors-title' }, [
      el('div', { class: 'tc-block-head' }, [
        el('p', { class: 'tc-step', 'aria-hidden': 'true', text: '2' }),
        el('div', {}, [
          el('h3', { class: 'tc-h3', id: 'tc-colors-title', text: 'Elige tus colores' }),
          el('p', { class: 'tc-sub', id: 'tc-colors-help' }, [
            document.createTextNode(`${text(data.material) || 'Algodón'}, ${text(data.composicion) || '100% algodón'}. Toca hasta ${maxColors} colores; tócalo otra vez para quitarlo. `),
            counter
          ])
        ])
      ]),
      el('div', { class: 'tc-swatches', role: 'group', 'aria-labelledby': 'tc-colors-title', 'aria-describedby': 'tc-colors-help' }, buttons.map(x => x.b)),
      status,
      el('p', { class: 'tc-fine', text: 'En pantalla el color es una referencia: el hilo real puede verse distinto.' }),
      builder
    ]);
  }

  function renderMore() {
    const pill = document.getElementById('gallery-video-pill-btn');
    const video = pill ? el('button', { type: 'button', class: 'tc-link', 'aria-haspopup': 'dialog' }, el('span', { text: 'Ver el video con Marcela' })) : null;
    video?.addEventListener('click', () => pill.click());
    return el('footer', { class: 'tc-more' }, [
      story.history.length ? el('div', { class: 'tc-history' }, story.history.map(line => el('p', { text: line }))) : null,
      el('div', { class: 'tc-more-links' }, [video, el('a', { class: 'tc-link', href: DOSSIER, target: '_blank', rel: 'noopener' }, el('span', { text: 'Dossier en PDF' }))])
    ]);
  }

  /* ==========================================================
     4 · BARRA INFERIOR: lo elegido y el pedido
     ========================================================== */
  function renderBar() {
    const piece = el('span', { class: 'tc-bar-piece' });
    const dots = el('span', { class: 'tc-bar-dots', 'aria-hidden': 'true' });
    const colors = el('span', { class: 'tc-bar-colors' });
    const order = el('a', { class: 'tc-order', id: 'tc-bar-order', target: '_blank', rel: 'noopener noreferrer', dataset: { storeOrder: '', storeName: '' } }, [
      el('span', { class: 'tc-wa-mark', 'aria-hidden': 'true' }), el('span', { text: 'Pedir' })
    ]);
    const bar = el('div', { class: 'tc-bar', role: 'region', 'aria-label': 'Tu elección' }, [
      el('div', { class: 'tc-bar-text', 'aria-live': 'polite' }, [piece, el('span', { class: 'tc-bar-line' }, [dots, colors])]),
      order
    ]);
    listeners.add(() => {
      const p = state.piece;
      piece.textContent = p ? nameOf(p) : 'Aún sin pieza';
      colors.textContent = state.colors.length ? state.colors.map(colorLabel).join(' · ') : 'Aún sin colores';
      dots.replaceChildren(...state.colors.map(c => el('span', { class: 'tc-bar-dot', style: `--dot:${c.hex}` })));
      order.href = S.whatsAppHref(message());
      order.dataset.storeName = p ? nameOf(p) : '';
      if (p) bar.dataset.offerId = p.id; else delete bar.dataset.offerId; // el contador QR registra el WhatsApp con este id
      const what = [p ? nameOf(p) : '', joinY(state.colors.map(colorLabel))].filter(Boolean).join(', en ');
      order.setAttribute('aria-label', what ? `Pedir ${what} por WhatsApp` : 'Escribir a Marcela por WhatsApp');
    });
    return bar;
  }

  /* ---------- Ficha accesible (diálogo modal, patrón W3C APG): hoja inferior en el teléfono ----------
     Foco al botón Cerrar, Tab gira dentro, Escape o Atrás cierran, el foco vuelve a quien la abrió. */
  const detail = (() => {
    const dialog = el('dialog', { class: 'tc-detail', 'aria-labelledby': 'tc-detail-title' });
    document.body.append(dialog);
    let trigger = null;
    let pushed = false;

    function gallery(p) {
      const wrap = el('div', { class: 'tc-gal' });
      const track = el('div', { class: 'tc-gal-track', role: 'group', 'aria-label': `Fotografías de ${nameOf(p)}`, tabindex: p.fotos.length > 1 ? '0' : null });
      const slides = p.fotos.map((f, i) => el('figure', { class: 'tc-gal-slide' }, el('img', { src: f.src, alt: text(f.alt), loading: i === 0 ? 'eager' : 'lazy', decoding: 'async' })));
      track.append(...slides);
      wrap.append(track);
      if (p.fotos.length < 2) return wrap;
      const thumbs = p.fotos.map((f, i) => {
        const b = el('button', { type: 'button', class: 'tc-gal-thumb', 'aria-label': `Foto ${i + 1} de ${p.fotos.length}`, 'aria-pressed': String(i === 0), dataset: { storePhoto: String(i) } },
          el('img', { src: f.src, alt: '', loading: 'lazy', decoding: 'async' }));
        b.addEventListener('click', () => track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' }));
        return b;
      });
      wrap.append(el('div', { class: 'tc-gal-thumbs', role: 'group', 'aria-label': 'Elegir fotografía' }, thumbs));
      const io = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const i = slides.indexOf(entry.target);
        thumbs.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
      }), { root: track, threshold: 0.6 });
      slides.forEach(s => io.observe(s));
      return wrap;
    }

    function fill(p) {
      const c = S.collectionOf(p);
      const description = text(p.descripcion) || text(c.descripcion);
      const specs = [['Medidas', p.medidas], ['Materiales', p.materiales]].filter(([, v]) => text(v));
      const note = [sold(p) ? 'Esta pieza ya fue vendida. Puedes pedir una parecida.' : '', text(S.store?.tienda?.nota_compra)].filter(Boolean).join(' ');
      dialog.dataset.offerId = p.id;
      const close = el('button', { type: 'button', class: 'tc-detail-close', 'aria-label': 'Cerrar ficha de la pieza', dataset: { storeClose: '' } }, el('span', { text: 'Cerrar' }));
      close.addEventListener('click', api.close);
      const choose = chooseButton(p, 'tc-primary tc-detail-choose');
      choose.addEventListener('click', () => { if (state.piece?.id === p.id) api.close(); });
      dialog.replaceChildren(el('div', { class: 'tc-detail-shell' }, [
        el('div', { class: 'tc-detail-top' }, [el('span', { class: 'tc-grip', 'aria-hidden': 'true' }), close]),
        el('div', { class: 'tc-detail-body' }, [
          gallery(p),
          el('div', { class: 'tc-detail-info' }, [
            el('p', { class: 'tc-eyebrow', text: collectionLabel(p) }),
            el('h2', { id: 'tc-detail-title', text: nameOf(p) }),
            el('p', { class: 'tc-price' + (S.hasPrice(p) ? '' : ' is-ask'), text: priceLabel(p) }),
            el('div', { class: 'tc-detail-desc' }, description.split(/\n+/).filter(Boolean).map(line => el('p', { text: line }))),
            specs.length ? el('dl', { class: 'tc-specs' }, specs.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: text(v) })])) : null,
            note ? el('p', { class: 'tc-note', text: note }) : null
          ])
        ]),
        el('div', { class: 'tc-detail-actions' }, [choose, el('p', { class: 'tc-fine', text: 'Después elige sus colores y pídela desde la barra de abajo.' })])
      ]));
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
        if (!pushed) { history.pushState({ tcDetail: p.id }, '', location.href); pushed = true; }
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
      const target = trigger;
      trigger = null;
      const refocus = () => { if (target && target.isConnected) target.focus({ preventScroll: true }); };
      // preview.js responde a popstate yendo otra vez a #tucontu, y eso suelta el foco:
      // se devuelve a la pieza después de ese paso.
      if (pushed) {
        pushed = false;
        window.addEventListener('popstate', () => setTimeout(refocus, 0), { once: true });
        history.back();
      }
      refocus();
    });
    window.addEventListener('popstate', () => { if (dialog.open) { pushed = false; dialog.close(); } });
    return api;
  })();

  /* ---------- Carga ---------- */
  const colorsReady = fetch(COLORS_URL, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() => null);

  Promise.all([S.ready, colorsReady])
    .then(([store, colorData]) => {
      S.store = store;
      pieces = store.productos;
      const data = colorData || {};
      palette = (Array.isArray(data.colores) ? data.colores : [])
        .filter(c => c && text(c.codigo) && text(c.nombre) && c.publicado !== false)
        .map(c => ({ codigo: text(c.codigo), nombre: text(c.nombre), hex: /^#[0-9a-f]{6}$/i.test(text(c.hex)) ? text(c.hex) : 'transparent' }));
      maxColors = Number.isInteger(data.max_colores) && data.max_colores > 0 ? data.max_colores : 3;
      root.replaceChildren(...[
        renderOpening(store),
        renderCatalog(store),
        palette.length ? renderColors(data) : null,
        renderMore(),
        renderBar()
      ].filter(Boolean));
      changed();
    })
    .catch(() => {
      const link = el('a', { href: S.whatsAppHref('Hola Marcela, quiero ver las piezas de Colores del Alma.'), target: '_blank', rel: 'noopener noreferrer', text: 'escríbele a Marcela por WhatsApp' });
      root.replaceChildren(el('p', { class: 'tc-empty' }, [document.createTextNode('No pudimos mostrar las piezas ahora. Puedes '), link, document.createTextNode('.')]));
    });
})();
