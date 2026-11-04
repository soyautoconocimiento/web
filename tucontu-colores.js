/* ==========================================================
   COLORES DEL ALMA · DISEÑO POR DEFECTO (móvil primero)
   0. Bienvenida y vitrina: tienda/vitrina.json. Primero se
      llega a Colores del Alma (palabras de Marcela), luego la
      vitrina de lo que hay (TuconTu, Gift Cards y estantes
      futuros, que aparecen solo cuando tienen datos).
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
  const VITRINA_URL = 'tienda/vitrina.json';
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
  // Con bienvenida, TuconTu pasa a ser una parte de Colores del Alma: sus títulos bajan un nivel.
  let welcomed = false;
  const h = n => `h${n + (welcomed ? 1 : 0)}`;
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
     0 · BIENVENIDA Y VITRINA (tienda/vitrina.json)
     ========================================================== */
  // Los servicios de data.js (El Bazar): las Gift Cards toman de ahí su nombre exacto y su texto.
  const services = typeof SITE_DATA !== 'undefined' ? [...(SITE_DATA.services || []), ...(SITE_DATA.courses || [])] : [];
  const scrollToBlock = id => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  };

  function renderWelcome(v) {
    const w = v.bienvenida || {};
    if (!text(w.titulo)) return null;
    const browse = el('button', { type: 'button', class: 'tc-primary', 'aria-controls': 'tc-vitrina' }, el('span', { text: 'Vitrinear' }));
    browse.addEventListener('click', () => scrollToBlock('tc-vitrina'));
    const toTucontu = el('button', { type: 'button', class: 'tc-secondary', 'aria-controls': 'tc-tucontu' }, el('span', { text: 'Ir a TuconTu' }));
    toTucontu.addEventListener('click', () => scrollToBlock('tc-tucontu'));
    const photo = w.foto && text(w.foto.src) ? el('figure', { class: 'tc-welcome-photo' }, el('img', { src: w.foto.src, alt: text(w.foto.alt), loading: 'eager', decoding: 'async' })) : null;
    return el('header', { class: 'tc-welcome', 'aria-labelledby': 'tc-welcome-title' }, [
      el('div', { class: 'tc-welcome-text' }, [
        text(w.antetitulo) ? el('p', { class: 'tc-eyebrow', text: w.antetitulo }) : null,
        el('h2', { class: 'tc-display', id: 'tc-welcome-title', text: w.titulo }),
        text(w.lema) ? el('p', { class: 'tc-welcome-lead', text: `«${text(w.lema)}»` }) : null,
        text(w.cita) ? el('blockquote', { class: 'tc-welcome-quote' }, [
          el('p', { text: `«${text(w.cita)}»` }),
          text(w.firma) ? el('cite', { text: w.firma }) : null
        ]) : null,
        el('div', { class: 'tc-welcome-actions' }, [browse, toTucontu])
      ]),
      photo
    ]);
  }

  // Un estante sin tarjetas no se muestra. El de TuconTu es una sola tarjeta que lleva a su parte.
  function shelfCards(v) {
    return (Array.isArray(v.estantes) ? v.estantes : [])
      .filter(s => s && text(s.id) && s.publicado !== false)
      .flatMap(s => {
        if (text(s.ir_a)) {
          return [{ kind: 'go', id: s.id, to: s.ir_a, label: text(s.etiqueta) || text(s.nombre), name: text(s.nombre),
            sub: s.id === 'tucontu' ? story.intro : text(s.bajada),
            foto: s.foto && text(s.foto.src) ? s.foto : (homePhoto ? { src: homePhoto.getAttribute('src'), alt: text(homePhoto.alt) } : null) }];
        }
        return (Array.isArray(s.items) ? s.items : [])
          .filter(it => it && text(it.id) && it.publicado !== false && it.foto && text(it.foto.src))
          .map(it => {
            const svc = text(it.servicio) ? services.find(x => x.id === it.servicio) : null;
            if (text(it.servicio) && !svc) return null; // un servicio que ya no existe no se muestra
            return {
              kind: 'item', id: it.id, label: text(s.etiqueta) || text(s.nombre), shelf: s.id, gift: Boolean(svc),
              name: svc ? text(svc.title) : text(it.nombre),
              description: svc ? text(svc.description) : text(it.descripcion),
              session: svc ? [svc.format, svc.duration].map(text).filter(Boolean).join(' · ') : '',
              foto: it.foto
            };
          })
          .filter(it => it && it.name);
      });
  }

  function itemMessage(it) {
    const what = it.gift ? `una Gift Card de «${it.name}»` : `«${it.name}»`;
    return `Hola Marcela, me interesa ${what} de la vitrina de Colores del Alma (ref. ${it.id}). ¿Cómo la pido y cuál es su precio?`;
  }

  function renderVitrina(v) {
    const cards = shelfCards(v);
    if (!cards.length) return null;
    const head = v.vitrina || {};
    const list = el('ul', { class: 'tc-vitrina-grid', 'aria-labelledby': 'tc-vitrina-title' }, cards.map(c => {
      const go = c.kind === 'go';
      const b = el('button', {
        type: 'button', class: 'tc-vcard' + (go ? ' is-go' : ''),
        'aria-haspopup': go ? null : 'dialog',
        'aria-label': go ? `${c.name}: ${c.sub || ''}. Ver ${c.name}` : `${c.label}: ${c.name}. Ver detalle`,
        dataset: go ? { vitrinaGo: c.to } : { offerId: c.id, storeItem: c.id, storeName: `${c.label} ${c.name}` }
      }, [
        c.foto ? el('span', { class: 'tc-vcard-media' }, el('img', { src: c.foto.src, alt: '', loading: 'lazy', decoding: 'async' })) : null,
        el('span', { class: 'tc-vcard-body' }, [
          el('span', { class: 'tc-vcard-label', text: go ? (c.sub || c.label) : c.label }),
          el('span', { class: 'tc-vcard-name', text: c.name }),
          el('span', { class: 'tc-vcard-cue', 'aria-hidden': 'true', text: go ? 'Ver ↓' : 'Ver detalle' })
        ])
      ]);
      b.addEventListener('click', () => (go ? scrollToBlock(c.to) : detail.show(() => fillItem(c), b)));
      return el('li', {}, b);
    }));
    return el('section', { class: 'tc-vitrina', id: 'tc-vitrina', tabindex: '-1', 'aria-labelledby': 'tc-vitrina-title' }, [
      el('div', { class: 'tc-vitrina-head' }, [
        el('h3', { class: 'tc-h3', id: 'tc-vitrina-title', text: text(head.titulo) || 'La vitrina' }),
        text(head.bajada) ? el('p', { class: 'tc-sub', text: head.bajada }) : null
      ]),
      list
    ]);
  }

  /* ==========================================================
     1 · APERTURA: qué es TuconTu (un accesorio)
     ========================================================== */
  function renderOpening(store) {
    const c = store.colecciones.find(x => x.id === 'tucontu') || {};
    return el('header', { class: 'tc-open', id: 'tc-tucontu', tabindex: '-1', 'aria-labelledby': 'tc-title' }, [
      el('div', { class: 'tc-open-text' }, [
        el('p', { class: 'tc-eyebrow', text: 'Colores del Alma' }),
        el(h(2), { class: 'tc-display', id: 'tc-title', text: 'TuconTu' }),
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
          el(h(4), { class: 'tc-slide-name', text: nameOf(p) }),
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
          el(h(3), { class: 'tc-h3', id: 'tc-pieces-title', text: text(store.tienda.titulo) || 'Tienda' }),
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
          el(h(3), { class: 'tc-h3', id: 'tc-colors-title', text: 'Elige tus colores' }),
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

    // Ficha de una tarjeta de la vitrina (Gift Card u otro estante): se pide directo por WhatsApp.
    function fillItemInto(it) {
      dialog.dataset.offerId = it.id;
      const close = el('button', { type: 'button', class: 'tc-detail-close', 'aria-label': 'Cerrar detalle', dataset: { storeClose: '' } }, el('span', { text: 'Cerrar' }));
      close.addEventListener('click', api.close);
      const order = el('a', { class: 'tc-order tc-detail-order', href: S.whatsAppHref(itemMessage(it)), target: '_blank', rel: 'noopener noreferrer', dataset: { storeOrder: '', storeName: `${it.label} ${it.name}` } }, [
        el('span', { class: 'tc-wa-mark', 'aria-hidden': 'true' }), el('span', { text: 'Pedir por WhatsApp' })
      ]);
      dialog.replaceChildren(el('div', { class: 'tc-detail-shell' }, [
        el('div', { class: 'tc-detail-top' }, [el('span', { class: 'tc-grip', 'aria-hidden': 'true' }), close]),
        el('div', { class: 'tc-detail-body' }, [
          el('figure', { class: 'tc-item-photo' + (it.gift ? ' is-gift' : '') }, [
            el('img', { src: it.foto.src, alt: text(it.foto.alt), decoding: 'async' }),
            it.gift ? el('span', { class: 'tc-gift-tag', 'aria-hidden': 'true', text: it.label }) : null
          ]),
          el('div', { class: 'tc-detail-info' }, [
            el('p', { class: 'tc-eyebrow', text: it.label }),
            el('h2', { id: 'tc-detail-title', text: it.name }),
            it.description ? el('div', { class: 'tc-detail-desc' }, it.description.split(/\n+/).filter(Boolean).map(line => el('p', { text: line }))) : null,
            it.session ? el('dl', { class: 'tc-specs' }, [el('dt', { text: 'Sesión' }), el('dd', { text: it.session })]) : null
          ])
        ]),
        el('div', { class: 'tc-detail-actions' }, [order])
      ]));
      return close;
    }

    const api = {
      isOpen: () => dialog.open,
      show(fillFn, from) {
        trigger = from || document.activeElement;
        const close = fillFn();
        dialog.scrollTop = 0;
        if (!dialog.open) dialog.showModal();
        close.focus({ preventScroll: true });
        if (!pushed) { history.pushState({ tcDetail: dialog.dataset.offerId || '' }, '', location.href); pushed = true; }
      },
      open(p, from) { api.show(() => fill(p), from); },
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
    api.fillItem = fillItemInto;
    return api;
  })();
  const fillItem = it => detail.fillItem(it);

  /* ---------- Carga ---------- */
  const colorsReady = fetch(COLORS_URL, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() => null);

  const vitrinaReady = fetch(VITRINA_URL, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .catch(() => null);

  Promise.all([S.ready, colorsReady, vitrinaReady])
    .then(([store, colorData, vitrina]) => {
      // Sin vitrina.json la sección queda como antes: empieza en TuconTu.
      const v = vitrina || {};
      const welcome = renderWelcome(v);
      welcomed = Boolean(welcome);
      S.store = store;
      pieces = store.productos;
      const data = colorData || {};
      palette = (Array.isArray(data.colores) ? data.colores : [])
        .filter(c => c && text(c.codigo) && text(c.nombre) && c.publicado !== false)
        .map(c => ({ codigo: text(c.codigo), nombre: text(c.nombre), hex: /^#[0-9a-f]{6}$/i.test(text(c.hex)) ? text(c.hex) : 'transparent' }));
      maxColors = Number.isInteger(data.max_colores) && data.max_colores > 0 ? data.max_colores : 3;
      root.replaceChildren(...[
        welcome,
        welcome ? renderVitrina(v) : null,
        renderOpening(store),
        renderCatalog(store),
        palette.length ? renderColors(data) : null,
        renderMore(),
        renderBar()
      ].filter(Boolean));
      // Con bienvenida, la barra de pedido aparece recién al llegar a TuconTu: la bienvenida no empuja al producto.
      const bar = root.querySelector('.tc-bar');
      const opening = document.getElementById('tc-tucontu');
      if (welcomed && bar && opening) {
        const place = () => {
          const away = opening.getBoundingClientRect().top > root.getBoundingClientRect().bottom - 96;
          bar.classList.toggle('is-away', away);
          bar.inert = away;
        };
        root.addEventListener('scroll', place, { passive: true });
        window.addEventListener('resize', place);
        place();
      }
      changed();
    })
    .catch(() => {
      const link = el('a', { href: S.whatsAppHref('Hola Marcela, quiero ver las piezas de Colores del Alma.'), target: '_blank', rel: 'noopener noreferrer', text: 'escríbele a Marcela por WhatsApp' });
      root.replaceChildren(el('p', { class: 'tc-empty' }, [document.createTextNode('No pudimos mostrar las piezas ahora. Puedes '), link, document.createTextNode('.')]));
    });
})();
