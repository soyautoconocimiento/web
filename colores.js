// Colores del Alma, la tienda entera, en una sola escena.
// Tocar una tarjeta la vuelve título, entra lo suyo y las otras
// quedan chicas abajo; tocar el título vuelve. Nada sale de aquí.
// Se monta en .cda; lo usa index.html. Datos: data.js,
// tienda/lineas.json y tienda/destacados.json.
(() => {
const root = document.querySelector('.cda'); if (!root) return;
const S = SITE_DATA, svc = id => S.services.concat(S.courses).find(s => s.id === id);
// la foto de cada servicio, la misma que en todo el sitio
const foto = s => window.offerImage ? offerImage(s) : s.image;
// visto: la tienda está en pantalla; inicio: el carrusel a su primera
let T, D, A, foco = null, visto = false, inicio = () => {};

// la historia de TuconTu: una lectura aparte, a pantalla completa, de
// lado, en tres páginas: la historia, la galería (todas las fotos en
// una página; tocada, una se ve de cerca) y el video. El botón dice
// adónde lleva: «Ver galería», «Ver video». ✕ o Esc la cierran y el
// video se detiene
const leer = document.body.appendChild(document.createElement('dialog'));
leer.className = 'cda-leer'; leer.setAttribute('aria-label', 'Historia de TuconTu');
function historia(h) {
  const g = h.galeria || [], sigue = ['Ver galería', 'Ver video'];
  leer.innerHTML = `<button class="cda-cerrar" aria-label="Cerrar">✕</button><div class="cda-pags">
    <div><h2>${h.titulo}</h2><p class="cda-lema">${h.lema}</p><p>${h.intro}</p>
      ${h.partes.map(p => `<p><b>${p.nombre}</b><br>${p.texto}</p>`).join('')}<p class="cda-lema">${h.cierre}</p></div>
    <div class="cda-galeria"><div>${g.map((f, i) => `<img src="${f}" alt="TuconTu, foto ${i + 1} de ${g.length}" loading="lazy">`).join('')}</div></div>
    <div><video src="${h.video}" poster="${h.portada}" controls playsinline preload="none"></video></div></div>
    <div class="cda-pie"><i class="on"></i><i></i><i></i><button class="cda-sigue">${sigue[0]} →</button></div>`;
  const pags = leer.querySelector('.cda-pags'), boton = leer.querySelector('.cda-sigue');
  pags.addEventListener('scroll', () => { const i = Math.round(pags.scrollLeft / pags.clientWidth);
    leer.querySelectorAll('.cda-pie i').forEach((p, k) => p.classList.toggle('on', k === i));
    boton.hidden = i > 1; if (i < 2) boton.textContent = sigue[i] + ' →'; }, { passive: true });
  leer.addEventListener('click', e => {
    if (e.target.closest('.cda-cerrar')) leer.close();
    if (e.target.closest('.cda-sigue')) pags.scrollBy({ left: pags.clientWidth, behavior: 'smooth' });
    const im = e.target.closest('.cda-galeria img'); if (im) { zImg.src = im.src; zImg.alt = im.alt; zoom.showModal(); } });
  leer.addEventListener('close', () => leer.querySelector('video').pause());
}
const lee = () => { leer.showModal(); leer.querySelector('.cda-pags').scrollLeft = 0; };

function arma([dest, { lineas, historia: h }, alg]) {
  A = alg;
  historia(h);
  // cada tarjeta y lo que trae adentro; abre: lo que hace tocar un ítem
  T = [
    // Terapia Floral vive en el Inicio: aquí no se repite
    { id: 'acompanamientos', n: 'Consultas', l: 'Constelaciones, tarot y carta astral', f: 'assets/tarjeta-consultas.jpg',
      items: S.services.filter(s => s.id !== S.hero).map(s => ({ id: s.id, n: s.title, l: s.format + ' · ' + s.duration, f: foto(s), abre: s })) },
    { id: 'cursos', n: 'Cursos', l: 'Astrología y Tarot', f: 'assets/tarjeta-cursos.jpg',
      items: S.courses.map(s => ({ id: s.id, n: s.title, l: s.format, f: foto(s), abre: s })) },
    { id: 'tucontu', n: 'TuconTu', l: 'Accesorios artesanales para el cabello', f: 'assets/tucontu/tarjeta-tucontu.jpg',
      items: lineas.map(x => ({ id: x.id, n: x.nombre, l: x.largo + ' cm · ' + x.linea, f: x.fotos[0],
        abre: { id: 'tucontu-' + x.id, title: 'TuconTu ' + x.nombre, heroTitle: x.nombre, description: x.arquetipo + '\n' + x.valores.join(' · '),
          format: x.largo + ' cm', duration: x.linea, image: x.fotos[0], fotos: x.fotos.slice(1), foto: true, urlAgenda: null } })) },
    { id: 'gift', n: 'Gift card', l: 'Regala un viaje de autoconocimiento', f: 'assets/gift/gift-card.jpg',
      items: ['tarot', 'carta-astral', 'constelaciones'].map(id => [id, `assets/gift/gift-${id}.jpg`])
        .map(([id, f]) => ({ id: 'gift-' + id, n: svc(id).title, l: 'Gift Card · ' + svc(id).duration, f,
          abre: { ...svc(id), heroTitle: 'Gift Card · ' + svc(id).title, image: f, foto: true, urlAgenda: null } })) }
  ];
  D = dest.destacados;
  root.innerHTML = `<div class="cda-esc"><section class="cda-p cda-dest" aria-label="Destacados"><div class="cda-slides">${D.map(d => `
    <div class="cda-slide"><img src="${d.foto}"${d.foto_chica ? ` srcset="${d.foto_chica} 900w, ${d.foto} 1600w" sizes="(max-width: 600px) 100vw, 1200px"` : ''} alt="">
      <small>${d.antetitulo}</small><h2>${d.titulo}</h2><p>${d.bajada}</p>
      ${d.abre ? `<button class="cda-ver" data-abre="${d.abre}" data-item="${d.item || ''}">Ver →</button>` : ''}</div>`).join('')}</div>
    <div class="cda-puntos">${D.map((_, i) => `<button data-punto="${i}" aria-label="Destacado ${i + 1}"></button>`).join('')}</div></section>
  ${rama('Autoconocimiento', 31)}${rama('La Tienda', 70)}
  <button class="cda-p cda-historia" data-historia="1"><img src="assets/rama.svg" alt="">Historia</button>
  ${T.map(t => `<button class="cda-p cda-card" data-id="${t.id}" style="--f:url('${t.f}')"><img src="${t.f}" alt=""><b>${t.n}</b></button>
    <div class="cda-p cda-escena" data-escena="${t.id}">${t.items.map(x => `
      <button class="cda-item" data-item="${x.id}"><img src="${x.f}" alt=""><b>${x.n}</b><span>${x.l}</span></button>`).join('')}</div>`).join('')}</div>`;
  // ?abre=cursos&item=curso-tarot-2026 llega con esa tarjeta abierta (un QR, un enlace)
  const q = new URLSearchParams(location.search);
  coloca(T.some(t => t.id === q.get('abre')) ? q.get('abre') : null, q.get('item'));
  carrusel();
}

// una rama de olivo a cada lado del nombre de una fila
const rama = (t, top) => `<p class="cda-p cda-rama" style="top:${top}%"><img src="assets/rama.svg" alt="">${t}<img src="assets/rama.svg" alt=""></p>`;

// dónde está cada tarjeta: en reposo, o con una abierta
const reposo = { acompanamientos: [38, 0, 49.3, 32], cursos: [38, 50.7, 49.3, 32], tucontu: [77, 0, 49.3, 23], gift: [77, 50.7, 49.3, 23] };
// cambiar de vista: ninguna tarjeta viaja, ni la tocada; todas se
// apagan en su lugar y aparecen ya en el suyo: nada pasa por encima
let muda;
function pon(f, item) {
  const cs = [...root.querySelectorAll('.cda-card')], otras = cs;
  clearTimeout(muda); cs.forEach(c => c.classList.remove('apaga', 'quieta', 'llega'));
  otras.forEach(c => c.classList.add('apaga'));
  muda = setTimeout(() => { otras.forEach(c => c.classList.add('quieta')); coloca(f, item); root.offsetWidth;
    otras.forEach(c => { c.classList.remove('quieta', 'apaga'); c.classList.add('llega'); });
    muda = setTimeout(() => otras.forEach(c => c.classList.remove('llega')), 300); }, 120);
}
function coloca(f, item) {
  foco = f; root.classList.toggle('abierta', !!f); root.dataset.foco = f || '';
  root.querySelector('.cda-historia').inert = f !== 'tucontu';
  if (!f) inicio();
  const otros = T.map(t => t.id).filter(i => i !== f);
  root.querySelectorAll('.cda-card').forEach(c => { const i = c.dataset.id;
    const r = !f ? reposo[i] : i === f ? [0, 0, 100, 9] : [83, otros.indexOf(i) * 33.8, 32.4, 17];
    c.classList.toggle('titulo', i === f); c.classList.toggle('chica', !!f && i !== f);
    c.setAttribute('aria-label', i === f ? 'Volver a Colores del Alma' : T.find(t => t.id === i).n);
    Object.assign(c.style, { top: r[0] + '%', left: r[1] + '%', width: r[2] + '%', height: r[3] + '%' }); });
  root.querySelectorAll('.cda-escena').forEach(e => { e.classList.toggle('on', e.dataset.escena === f); e.inert = e.dataset.escena !== f; });
  root.querySelector('.cda-dest').inert = !!f;
  root.querySelectorAll('.cda-item').forEach(x => x.classList.toggle('luz', !!item && x.dataset.item === item));
  // lo destacado queda al centro de su fila
  const x = item && root.querySelector(`[data-escena="${f}"] [data-item="${item}"]`);
  if (x) x.parentElement.scrollLeft = x.offsetLeft - (x.parentElement.clientWidth - x.offsetWidth) / 2;
}

// el carrusel avanza solo; si alguien lo mueve, espera. Se mueve
// con transform, sin scroll: en iPhone, un scroll programado dentro
// de la sección hacía que la página volviera arriba
let arrastre = 0;
function carrusel() {
  const s = root.querySelector('.cda-slides'), puntos = [...root.querySelectorAll('[data-punto]')];
  let actual = 0, quieto = 0, x0 = null, rueda = 0;
  const ve = i => { actual = (i + D.length) % D.length; s.style.transform = `translateX(${-actual * 100}%)`;
    puntos.forEach((p, k) => p.classList.toggle('on', k === actual)); };
  const mueve = d => { quieto = Date.now(); ve(actual + d); };
  // el dedo: deslizar a un lado cambia; arriba o abajo es de la página
  s.addEventListener('pointerdown', e => { x0 = e.clientX; quieto = Date.now(); });
  s.addEventListener('pointercancel', () => x0 = null);
  s.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) { arrastre = Date.now(); mueve(dx < 0 ? 1 : -1); } });
  s.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20 && Date.now() - rueda > 700) {
    rueda = Date.now(); mueve(e.deltaX > 0 ? 1 : -1); } }, { passive: true });
  root.addEventListener('click', e => { const b = e.target.closest('[data-punto]'); if (b) { quieto = Date.now(); ve(+b.dataset.punto); } });
  setInterval(() => { if (visto && !foco && !document.hidden && Date.now() - quieto > 8000) ve(actual + 1); }, 6000);
  // volver a la tienda es volver a Colores del Alma, la primera
  inicio = () => { quieto = Date.now(); ve(0); };
  ve(0);
}

root.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.dataset.punto || Date.now() - arrastre < 300) return;
  if (b.dataset.historia) lee();
  else if (b.dataset.abre) pon(b.dataset.abre, b.dataset.item);
  else if (b.dataset.id) pon(foco === b.dataset.id ? null : b.dataset.id);
  else if (b.dataset.item) { const x = T.find(t => t.id === foco).items.find(x => x.id === b.dataset.item);
    if (window.openOffer) { openOffer(x.abre, b); if (foco === 'tucontu') elige(x.abre); } }
});
// pedir un TuconTu: en su modal se eligen exactamente sus colores
// (max_colores de colores-algodon.json); recién entonces el botón
// de WhatsApp lleva el pedido. Una sola fila: el color tocado salta
// al principio y ahí se queda aunque el resto se deslice; tocado otra
// vez, vuelve a su lugar.
const caja = document.getElementById('dialog-colores'), wa = document.getElementById('dialog-whatsapp');
const claro = h => { const n = parseInt(h.slice(1), 16); return (n >> 16) * .3 + (n >> 8 & 255) * .59 + (n & 255) * .11 > 150; };
let pieza, elegidos = [];
function elige(p) { pieza = p; elegidos = []; caja.hidden = false; fotos(p); pinta(); }
// una foto de cerca: tocada, se abre a pantalla completa; tocada otra
// vez, se acerca al doble donde se tocó y se recorre con el dedo; la ×
// va en su franja, nunca sobre la foto
const zoom = document.body.appendChild(document.createElement('dialog'));
zoom.className = 'dc-zoom'; zoom.setAttribute('aria-label', 'Foto de cerca');
zoom.innerHTML = '<div class="dc-zoom-barra"><button type="button" aria-label="Cerrar">✕</button></div><div class="dc-zoom-foto"><img alt=""></div>';
const zImg = zoom.querySelector('img'), zCaja = zoom.querySelector('.dc-zoom-foto');
zoom.querySelector('button').addEventListener('click', () => zoom.close());
zImg.addEventListener('click', e => { const r = zImg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  if (!zoom.classList.toggle('cerca')) return;
  zCaja.scrollLeft = x * zCaja.scrollWidth - zCaja.clientWidth / 2; zCaja.scrollTop = y * zCaja.scrollHeight - zCaja.clientHeight / 2; });
zoom.addEventListener('close', () => zoom.classList.remove('cerca'));
// sus fotos: una por vista, en un marco cuadrado, se deslizan; los puntos, debajo
function fotos(p) {
  const d = caja.closest('dialog'), sitio = d.querySelector('.dialog-image'), fs = p.fotos.length ? p.fotos : [p.image];
  d.classList.add('es-tucontu');
  sitio.insertAdjacentHTML('beforeend', `<div class="dc-fotos">${fs.map((f, i) => `<div class="dc-foto" style="--f:url('${f}')"><img src="${f}" alt="${p.heroTitle}, foto ${i + 1} de ${fs.length}"></div>`).join('')}</div>`
    + (fs.length > 1 ? `<div class="dc-fotos-puntos">${fs.map((_, i) => `<button type="button" aria-label="Foto ${i + 1}"></button>`).join('')}</div>` : ''));
  const tira = sitio.querySelector('.dc-fotos'), ps = [...sitio.querySelectorAll('.dc-fotos-puntos button')];
  const marca = () => { const i = Math.round(tira.scrollLeft / (tira.clientWidth || 1)); ps.forEach((b, j) => b.setAttribute('aria-current', String(j === i))); };
  tira.addEventListener('scroll', marca, { passive: true }); marca();
  ps.forEach((b, j) => b.addEventListener('click', () => tira.scrollTo({ left: j * tira.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })));
  tira.addEventListener('click', e => { const im = e.target.closest('img'); if (!im) return; zImg.src = im.src; zImg.alt = im.alt; zoom.showModal(); });
}
function pinta() {
  const n = A.max_colores, cs = A.colores.filter(c => c.publicado !== false), lleno = elegidos.length === n;
  const col = k => A.colores.find(c => c.codigo === k), x = caja.querySelector('.dc-puntos')?.scrollLeft || 0;
  const punto = (c, i) => `<button type="button" class="dc-punto${claro(c.hex) ? ' dc-claro' : ''}" style="--c:${c.hex}" data-color="${c.codigo}"
      aria-pressed="${i >= 0}"${lleno && i < 0 ? ' aria-disabled="true"' : ''} aria-label="${i >= 0 ? 'Quitar ' : ''}${c.nombre}" title="${c.nombre}">${i >= 0 ? i + 1 : ''}</button>`;
  caja.innerHTML = `<p class="dc-pide">Elige ${n} colores <b>${elegidos.length}/${n}</b></p>
    <div class="dc-fila">${elegidos.length ? `<div class="dc-elegidos" role="group" aria-label="Elegidos">${elegidos.map((k, i) => punto(col(k), i)).join('')}</div>` : ''}
      <div class="dc-puntos" role="group" aria-label="Colores">${cs.filter(c => !elegidos.includes(c.codigo)).map(c => punto(c, -1)).join('')}</div></div>
    <p class="dc-nombres">${elegidos.map(k => col(k).nombre).join(' · ')}</p>`;
  caja.querySelector('.dc-puntos').scrollLeft = x;
  const nombres = elegidos.map(col).map(c => `${c.nombre} (${c.codigo})`).join(', ');
  wa.firstChild.textContent = 'Pedir ';
  if (lleno) { wa.href = SoyContactLinks.whatsAppHref(`Hola Marcela, quiero un ${pieza.title} de ${pieza.format} en estos colores: ${nombres}.`); wa.removeAttribute('aria-disabled'); }
  else { wa.removeAttribute('href'); wa.setAttribute('aria-disabled', 'true'); }
  wa.setAttribute('aria-label', lleno ? `Pedir ${pieza.title} por WhatsApp` : `Elige ${n} colores para pedir`);
}
caja.addEventListener('click', e => { const b = e.target.closest('[data-color]'); if (!b) return;
  const k = b.dataset.color, i = elegidos.indexOf(k);
  if (i >= 0) elegidos.splice(i, 1); else if (elegidos.length < A.max_colores) elegidos.push(k); else return;
  pinta(); caja.querySelector(`[data-color="${k}"]`)?.focus({ preventScroll: true }); });
// al cerrar, el modal vuelve a ser el de siempre
caja.closest('dialog').addEventListener('close', () => { if (caja.hidden) return;
  caja.hidden = true; caja.innerHTML = ''; wa.firstChild.textContent = 'Conversar '; wa.removeAttribute('aria-disabled');
  const d = caja.closest('dialog'); d.classList.remove('es-tucontu'); d.querySelectorAll('.dc-fotos, .dc-fotos-puntos').forEach(e => e.remove()); });
addEventListener('keydown', e => { if (e.key === 'Escape' && foco && !document.querySelector('dialog[open]')) pon(null); });
// al volver a la sección, el carrusel en la primera; al irse, todo vuelve a su lugar
new IntersectionObserver(([e]) => { visto = e.isIntersecting; if (T) visto ? inicio() : coloca(null); })
  .observe(root.closest('section') || root);

Promise.all(['tienda/destacados.json', 'tienda/lineas.json', 'tienda/colores-algodon.json'].map(u => fetch(u).then(r => r.json()))).then(arma);
})();
