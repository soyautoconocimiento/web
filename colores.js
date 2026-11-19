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
let T, D, foco = null, visto = false, inicio = () => {};

// la historia de TuconTu: una lectura aparte, a pantalla completa,
// de lado, página a página; ✕ o Esc la cierran y el video se detiene
const leer = document.body.appendChild(document.createElement('dialog'));
leer.className = 'cda-leer'; leer.setAttribute('aria-label', 'Historia de TuconTu');
function historia(h) {
  leer.innerHTML = `<button class="cda-cerrar" aria-label="Cerrar">✕</button><div class="cda-pags">
    <div><h2>${h.titulo}</h2><p class="cda-lema">${h.lema}</p>
      <video src="${h.video}" poster="${h.portada}" controls playsinline preload="none"></video></div>
    <div><p>${h.intro}</p>${h.partes.map(p => `<p><b>${p.nombre}</b><br>${p.texto}</p>`).join('')}</div>
    <div><p class="cda-lema">${h.cierre}</p></div></div>
    <div class="cda-pie"><i class="on"></i><i></i><i></i><button class="cda-sigue" aria-label="Seguir">→</button></div>`;
  const pags = leer.querySelector('.cda-pags');
  pags.addEventListener('scroll', () => { const i = Math.round(pags.scrollLeft / pags.clientWidth);
    leer.querySelectorAll('.cda-pie i').forEach((p, k) => p.classList.toggle('on', k === i));
    leer.querySelector('.cda-sigue').hidden = i === 2; }, { passive: true });
  leer.addEventListener('click', e => {
    if (e.target.closest('.cda-cerrar')) leer.close();
    if (e.target.closest('.cda-sigue')) pags.scrollBy({ left: pags.clientWidth, behavior: 'smooth' }); });
  leer.addEventListener('close', () => leer.querySelector('video').pause());
}
const lee = () => { leer.showModal(); leer.querySelector('.cda-pags').scrollLeft = 0; };

function arma([dest, { lineas, historia: h }]) {
  historia(h);
  // cada tarjeta y lo que trae adentro; abre: lo que hace tocar un ítem
  T = [
    // Terapia Floral vive en el Inicio: aquí no se repite
    { id: 'acompanamientos', n: 'Consultas', l: 'Constelaciones, tarot y carta astral', f: 'service-constelaciones-stone-display.jpg',
      items: S.services.filter(s => s.id !== S.hero).map(s => ({ id: s.id, n: s.title, l: s.format + ' · ' + s.duration, f: foto(s), abre: s })) },
    { id: 'cursos', n: 'Cursos', l: 'Astrología y Tarot', f: 'assets/curso_astrologia.webp',
      items: S.courses.map(s => ({ id: s.id, n: s.title, l: s.format, f: foto(s), abre: s })) },
    { id: 'tucontu', n: 'TuconTu', l: 'Accesorios artesanales para el cabello', f: 'assets/tucontu/etiqueta-frente.jpg', tag: 1,
      items: lineas.map(x => ({ id: x.id, n: x.nombre, l: x.largo + ' cm · ' + x.linea, f: x.fotos[0],
        abre: { id: 'tucontu-' + x.id, title: 'TuconTu ' + x.nombre, description: x.arquetipo + '\n' + x.valores.join(' · '),
          format: x.largo + ' cm', duration: x.linea, image: x.fotos[0], urlAgenda: null } })) },
    { id: 'gift', n: 'Gift card', l: 'Regala un viaje de autoconocimiento', f: 'service-tarot-fool-display.jpg',
      items: [['tarot', 'service-tarot-fool-display.jpg'], ['carta-astral', 'service-carta-astral-astrolabe-display.jpg'], ['constelaciones', 'service-constelaciones-stone-display.jpg']]
        .map(([id, f]) => ({ id: 'gift-' + id, n: svc(id).title, l: 'Gift Card · ' + svc(id).duration, f,
          abre: { ...svc(id), heroTitle: 'Gift Card · ' + svc(id).title, urlAgenda: null } })) }
  ];
  D = dest.destacados;
  root.innerHTML = `<div class="cda-esc"><section class="cda-p cda-dest" aria-label="Destacados"><div class="cda-slides">${D.map(d => `
    <div class="cda-slide"><img src="${d.foto}"${d.foto_chica ? ` srcset="${d.foto_chica} 900w, ${d.foto} 1600w" sizes="(max-width: 600px) 100vw, 1200px"` : ''} alt="">
      <small>${d.antetitulo}</small><h2>${d.titulo}</h2><p>${d.bajada}</p>
      ${d.abre ? `<button class="cda-ver" data-abre="${d.abre}" data-item="${d.item || ''}">Ver →</button>` : ''}</div>`).join('')}</div>
    <div class="cda-puntos">${D.map((_, i) => `<button data-punto="${i}" aria-label="Destacado ${i + 1}"></button>`).join('')}</div></section>
  ${rama('Autoconocimiento', 31)}${rama('La Tienda', 70)}
  <button class="cda-p cda-historia" data-historia="1"><img src="assets/rama.svg" alt="">Historia</button>
  ${T.map(t => `<button class="cda-p cda-card" data-id="${t.id}"><img class="${t.tag ? 'cda-tag' : ''}" src="${t.f}" alt=""><span>${t.l}</span><b>${t.n}</b></button>
    <div class="cda-p cda-escena" data-escena="${t.id}">${t.items.map(x => `
      <button class="cda-item${t.tag ? ' cda-entero' : ''}" data-item="${x.id}"><img src="${x.f}" alt="" loading="lazy"><b>${x.n}</b><span>${x.l}</span></button>`).join('')}</div>`).join('')}</div>`;
  // ?abre=cursos&item=curso-tarot-2026 llega con esa tarjeta abierta (un QR, un enlace)
  const q = new URLSearchParams(location.search);
  pon(T.some(t => t.id === q.get('abre')) ? q.get('abre') : null, q.get('item'));
  carrusel();
}

// una rama de olivo a cada lado del nombre de una fila
const rama = (t, top) => `<p class="cda-p cda-rama" style="top:${top}%"><img src="assets/rama.svg" alt="">${t}<img src="assets/rama.svg" alt=""></p>`;

// dónde está cada tarjeta: en reposo, o con una abierta
const reposo = { acompanamientos: [38, 0, 49.3, 32], cursos: [38, 50.7, 49.3, 32], tucontu: [77, 0, 49.3, 23], gift: [77, 50.7, 49.3, 23] };
function pon(f, item) {
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
    if (window.openOffer) openOffer(x.abre, b); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && foco && !document.querySelector('dialog[open]')) pon(null); });
// al volver a la sección, el carrusel en la primera; al irse, todo vuelve a su lugar
new IntersectionObserver(([e]) => { visto = e.isIntersecting; if (T) visto ? inicio() : pon(null); })
  .observe(root.closest('section') || root);

Promise.all(['tienda/destacados.json', 'tienda/lineas.json'].map(u => fetch(u).then(r => r.json()))).then(arma);
})();
