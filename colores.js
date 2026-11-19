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
let T, D, foco = null;

function arma([dest, lineas]) {
  // cada tarjeta y lo que trae adentro; abre: lo que hace tocar un ítem
  T = [
    // Terapia Floral vive en el Inicio: aquí no se repite
    { id: 'acompanamientos', n: 'Acompañamientos', l: 'Constelaciones, tarot y carta astral', f: 'service-constelaciones-stone-display.jpg',
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
  ${T.map(t => `<button class="cda-p cda-card" data-id="${t.id}"><img class="${t.tag ? 'cda-tag' : ''}" src="${t.f}" alt=""><span>${t.l}</span><b>${t.n}</b></button>
    <div class="cda-p cda-escena" data-escena="${t.id}">${t.items.map(x => `
      <button class="cda-item${t.tag ? ' cda-entero' : ''}" data-item="${x.id}"><img src="${x.f}" alt="" loading="lazy"><b>${x.n}</b><span>${x.l}</span></button>`).join('')}</div>`).join('')}</div>`;
  // ?abre=cursos&item=curso-tarot-2026 llega con esa tarjeta abierta (un QR, un enlace)
  const q = new URLSearchParams(location.search);
  pon(T.some(t => t.id === q.get('abre')) ? q.get('abre') : null, q.get('item'));
  carrusel();
}

// dónde está cada tarjeta: en reposo, o con una abierta
const reposo = { acompanamientos: [37, 0, 49.3, 37], cursos: [37, 50.7, 49.3, 37], tucontu: [77, 0, 49.3, 23], gift: [77, 50.7, 49.3, 23] };
function pon(f, item) {
  foco = f; root.classList.toggle('abierta', !!f);
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
  setInterval(() => { if (!foco && !document.hidden && Date.now() - quieto > 8000) ve(actual + 1); }, 6000);
  ve(0);
}

root.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.dataset.punto || Date.now() - arrastre < 300) return;
  if (b.dataset.abre) pon(b.dataset.abre, b.dataset.item);
  else if (b.dataset.id) pon(foco === b.dataset.id ? null : b.dataset.id);
  else if (b.dataset.item) { const x = T.find(t => t.id === foco).items.find(x => x.id === b.dataset.item);
    if (window.openOffer) openOffer(x.abre, b); }
});
addEventListener('keydown', e => { if (e.key === 'Escape' && foco && !document.querySelector('dialog[open]')) pon(null); });
// al irse de la sección, todo vuelve a su lugar
new IntersectionObserver(([e]) => { if (!e.isIntersecting && foco) pon(null); }).observe(root.closest('section') || root);

Promise.all(['tienda/destacados.json', 'tienda/lineas.json'].map(u => fetch(u).then(r => r.json())))
  .then(([d, l]) => arma([d, l.lineas]));
})();
