/* ==========================================================
   COLORES DEL ALMA · TIENDA
   Lee tienda/productos.json y arma el catálogo, los filtros
   (solo si hay 2+ colecciones) y la ficha de cada producto.
   Para agregar un producto se edita SOLO el JSON (ver
   tucontu/DESIGN.md). Este archivo no se toca para eso.
   ========================================================== */
(() => {
  const DATA_URL = 'tienda/productos.json';
  const panel = document.getElementById('tucontu-store-panel');
  const grid = document.getElementById('store-grid');
  const dialog = document.getElementById('store-dialog');
  if (!panel || !grid || !dialog) return;

  const $ = id => document.getElementById(id);
  const filters = $('store-filters');
  const status = $('store-status');
  const lead = $('store-lead');
  const title = $('store-title');
  const ui = {
    image: $('store-dialog-image'),
    thumbs: $('store-dialog-thumbs'),
    collection: $('store-dialog-collection'),
    title: $('store-dialog-title'),
    price: $('store-dialog-price'),
    desc: $('store-dialog-desc'),
    specs: $('store-dialog-specs'),
    note: $('store-dialog-note'),
    order: $('store-order'),
    orderLabel: $('store-order-label'),
    customize: $('store-customize'),
    close: $('store-dialog-close')
  };
  const whatsAppHref = window.SoyContactLinks?.whatsAppHref
    || (message => `https://wa.me/56962391328?text=${encodeURIComponent(message)}`);
  const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  let store = { tienda: {}, colecciones: [], productos: [] };
  let activeCollection = 'todas';
  let lastTrigger = null;

  const text = value => (typeof value === 'string' ? value.trim() : '');
  const collectionOf = product => store.colecciones.find(c => c.id === product.coleccion) || { id: product.coleccion || '', nombre: '' };
  const priceText = product => (typeof product.precio === 'number' && product.precio > 0 ? clp.format(product.precio) : 'Precio a consultar');
  const hasPrice = product => typeof product.precio === 'number' && product.precio > 0;

  // Normaliza: solo productos publicados, con id y al menos una foto.
  function normalize(raw) {
    const colecciones = Array.isArray(raw?.colecciones) ? raw.colecciones.filter(c => c && c.id) : [];
    const productos = (Array.isArray(raw?.productos) ? raw.productos : [])
      .filter(p => p && text(p.id) && p.publicado !== false)
      .map(p => ({ ...p, fotos: (Array.isArray(p.fotos) ? p.fotos : []).filter(f => f && text(f.src)) }))
      .filter(p => p.fotos.length);
    return { tienda: raw?.tienda || {}, colecciones, productos };
  }

  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else node.setAttribute(key, value === true ? '' : value);
    });
    [].concat(children).forEach(child => child && node.append(child));
    return node;
  }

  /* ---------- Catálogo ---------- */

  function card(product, index) {
    const collection = collectionOf(product);
    const [first, second] = product.fotos;
    const media = el('span', { class: 'store-card-media' + (second ? ' has-alt' : '') }, [
      el('img', { class: 'store-card-img', src: first.src, alt: '', loading: index < 3 ? 'eager' : 'lazy', decoding: 'async' }),
      second && el('img', { class: 'store-card-img store-card-img-alt', src: second.src, alt: '', loading: 'lazy', decoding: 'async' }),
      el('span', { class: 'store-card-cue', 'aria-hidden': 'true', text: 'Ver pieza' })
    ]);
    const body = el('span', { class: 'store-card-body' }, [
      el('span', { class: 'store-card-collection', text: [collection.nombre, collection.etiqueta].map(text).filter(Boolean).join(' · ') }),
      el('span', { class: 'store-card-name', text: text(product.nombre) || product.id }),
      el('span', { class: 'store-card-price' + (product.disponible === false ? ' is-sold' : ''), text: product.disponible === false ? 'Vendida' : priceText(product) })
    ]);
    // Sin id propio: el contador QR lo nombra ver-<id>, como a los servicios.
    const button = el('button', {
      type: 'button',
      class: 'store-card',
      'aria-haspopup': 'dialog',
      'aria-controls': 'store-dialog',
      'aria-label': `${text(product.nombre) || product.id}, ${product.disponible === false ? 'vendida' : priceText(product)}. Ver ficha`,
      dataset: { offerId: product.id, storeItem: product.id, storeName: text(product.nombre) || product.id }
    }, [media, body]);
    button.addEventListener('click', () => openProduct(product, button));
    return el('li', { class: 'store-grid-item' }, button);
  }

  // Cierre del catálogo: invita a encargar una pieza a medida (pestaña existente).
  function customizeCard() {
    const button = el('button', { type: 'button', class: 'store-invite', dataset: { storeCustomize: '' } }, [
      el('span', { class: 'store-invite-mark', 'aria-hidden': 'true', text: '✦' }),
      el('span', { class: 'store-invite-title', text: '¿Sueñas otra combinación?' }),
      el('span', { class: 'store-invite-text', text: 'Elige el largo, las fibras y los colores, y Marcela la teje para ti.' }),
      el('span', { class: 'store-invite-link', text: 'Personaliza el tuyo →' })
    ]);
    button.addEventListener('click', goToCustomize);
    return el('li', { class: 'store-grid-item store-grid-invite' }, button);
  }

  function renderGrid() {
    const visible = store.productos.filter(p => activeCollection === 'todas' || p.coleccion === activeCollection);
    grid.replaceChildren(...visible.map(card), customizeCard());
    if (!store.productos.length) {
      grid.prepend(el('li', { class: 'store-empty', text: 'Muy pronto habrá piezas aquí.' }));
    }
    status.textContent = visible.length === 1 ? '1 pieza' : `${visible.length} piezas`;
  }

  // Filtros: solo aparecen si los datos traen 2 o más colecciones con productos.
  function renderFilters() {
    const used = store.colecciones.filter(c => store.productos.some(p => p.coleccion === c.id));
    if (used.length < 2) { filters.hidden = true; return; }
    const options = [{ id: 'todas', nombre: 'Todo' }, ...used];
    filters.replaceChildren(...options.map(option => {
      const count = option.id === 'todas' ? store.productos.length : store.productos.filter(p => p.coleccion === option.id).length;
      const button = el('button', {
        type: 'button',
        class: 'store-filter',
        'aria-pressed': String(option.id === activeCollection),
        dataset: { storeFilter: option.id }
      }, [el('span', { text: option.nombre }), el('span', { class: 'store-filter-count', text: String(count) })]);
      button.addEventListener('click', () => {
        activeCollection = option.id;
        filters.querySelectorAll('[data-store-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        renderGrid();
      });
      return button;
    }));
    filters.hidden = false;
  }

  /* ---------- Ficha (modal) ---------- */

  function showPhoto(product, index) {
    const photo = product.fotos[index];
    ui.image.src = photo.src;
    ui.image.alt = text(photo.alt);
    ui.thumbs.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
  }

  function orderMessage(product) {
    const collection = collectionOf(product);
    const name = text(product.nombre) || product.id;
    const what = text(collection.nombre) && !name.startsWith(collection.nombre) ? `${collection.nombre} «${name}»` : `«${name}»`;
    if (product.disponible === false) {
      return `Hola Marcela, vi en la tienda de Colores del Alma la pieza ${what} (ref. ${product.id}). Me gustaría pedir una parecida.`;
    }
    const ask = hasPrice(product) ? '¿Está disponible?' : '¿Está disponible y cuál es su precio?';
    return `Hola Marcela, me interesa la pieza ${what} de la tienda de Colores del Alma (ref. ${product.id}). ${ask}`;
  }

  function openProduct(product, trigger) {
    const collection = collectionOf(product);
    lastTrigger = trigger || document.activeElement;
    dialog.dataset.offerId = product.id; // el contador QR registra el WhatsApp con este id

    ui.collection.textContent = [collection.nombre, collection.etiqueta].map(text).filter(Boolean).join(' · ');
    ui.title.textContent = text(product.nombre) || product.id;
    ui.price.textContent = priceText(product);
    ui.price.classList.toggle('is-ask', !hasPrice(product));

    const description = text(product.descripcion) || text(collection.descripcion);
    ui.desc.replaceChildren(...description.split(/\n+/).filter(Boolean).map(line => el('p', { text: line })));

    const specs = [['Medidas', product.medidas], ['Materiales', product.materiales]].filter(([, v]) => text(v));
    ui.specs.replaceChildren(...specs.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: text(v) })]));
    ui.specs.hidden = !specs.length;

    const note = [product.disponible === false ? 'Esta pieza ya fue vendida. Puedes pedir una parecida.' : '', text(store.tienda.nota_compra)].filter(Boolean).join(' ');
    ui.note.textContent = note;
    ui.note.hidden = !note;

    ui.thumbs.replaceChildren(...product.fotos.map((photo, i) => {
      const b = el('button', { type: 'button', class: 'store-thumb', 'aria-label': `Foto ${i + 1} de ${product.fotos.length}`, 'aria-pressed': String(i === 0), dataset: { storePhoto: String(i) } },
        el('img', { src: photo.src, alt: '', loading: 'lazy', decoding: 'async' }));
      b.addEventListener('click', () => showPhoto(product, i));
      return b;
    }));
    ui.thumbs.hidden = product.fotos.length < 2;
    showPhoto(product, 0);

    ui.order.href = whatsAppHref(orderMessage(product));
    ui.order.dataset.storeName = text(product.nombre) || product.id;
    ui.orderLabel.textContent = product.disponible === false ? 'Pedir una parecida' : 'Pedir por WhatsApp';

    if (!dialog.open) dialog.showModal();
    ui.close.focus({ preventScroll: true });
  }

  function closeProduct() { if (dialog.open) dialog.close(); }

  // Trampa de foco explícita (además del inert de showModal): Tab y Shift+Tab giran dentro.
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusables = [...dialog.querySelectorAll('a[href], button:not([disabled])')].filter(n => n.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  // Escape: el navegador dispara "cancel"; cerramos nosotros para devolver el foco igual que con ×.
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeProduct(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) closeProduct(); });
  ui.close.addEventListener('click', closeProduct);
  dialog.addEventListener('close', () => {
    const target = lastTrigger;
    lastTrigger = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
  });

  // Lleva a la pestaña existente "Personaliza el tuyo".
  function goToCustomize() {
    closeProduct();
    const tab = document.getElementById('tucontu-catalog-tab');
    if (!tab) return;
    tab.click();
    tab.focus({ preventScroll: true });
  }
  ui.customize.addEventListener('click', goToCustomize);

  /* ---------- Carga ---------- */

  function applyCopy() {
    if (text(store.tienda.titulo)) title.textContent = store.tienda.titulo;
    lead.textContent = text(store.tienda.bajada);
    lead.hidden = !lead.textContent;
  }

  fetch(DATA_URL, { cache: 'no-cache' })
    .then(response => { if (!response.ok) throw new Error(response.status); return response.json(); })
    .then(raw => {
      store = normalize(raw);
      applyCopy();
      renderFilters();
      renderGrid();
    })
    .catch(() => {
      const link = el('a', { href: whatsAppHref('Hola Marcela, quiero ver las piezas de Colores del Alma.'), target: '_blank', rel: 'noopener noreferrer', text: 'escríbele a Marcela por WhatsApp' });
      grid.replaceChildren(el('li', { class: 'store-empty' }, [document.createTextNode('No pudimos mostrar las piezas ahora. Puedes '), link, document.createTextNode('.')]));
    });
})();
