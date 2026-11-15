// Prototipo: Colores del Alma en una sola pantalla, sin scroll vertical.
// Se monta en el elemento .ca; lo usan index.html y prototipo-colores.html.
(() => {
const root = document.querySelector('.ca'); if (!root) return;
root.innerHTML = '<header class="ca-head"><button class="ca-back" hidden>‹</button><h2></h2><span class="ca-mini" hidden></span></header><div class="ca-main"></div><div class="ca-foot"></div>';
const hoja = document.body.appendChild(document.createElement('dialog')); hoja.className = 'ca-hoja';
const $ = s => root.querySelector(s);
const wa = t => 'https://wa.me/56962391328?text=' + encodeURIComponent(t);
const clp = n => n ? '$ ' + n.toLocaleString('es-CL') : '';
// la primera foto de una línea, o una muestra dibujada con su largo
const foto = l => l.fotos.length ? `<img src="${l.fotos[0]}" alt="TuconTu ${l.nombre}">`
  : `<div class="ca-muestra"><i style="height:${l.largo / 90 * 78}%"></i><small>muestra · ${l.nombre}</small></div>`;
let D, path = ['tienda'], linea = null, colores = [];

// cada momento devuelve su título, su contenido y su pie
const momentos = {
  tienda: ({ l, gifts }) => ['Colores del Alma', `
    <div class="ca-row"><p class="ca-rotulo">TuconTu · elige tu línea</p><button class="ca-link" data-historia>Historia</button></div>
    <div class="ca-rail">${l.map((x, i) => `
      <article class="ca-linea"><div class="ca-foto">${foto(x)}
        ${x.fotos.length ? `<button class="ca-ver" data-fotos="${i}">Ver fotos</button>` : ''}</div>
        <div class="ca-row"><b>${x.nombre}</b><span>${x.largo} cm</span></div>
        <p class="ca-nota">${x.arquetipo} · ${x.linea}<br>${x.valores.join(' · ')}</p>
        <div class="ca-row"><span>${clp(x.precio)}</span><button class="ca-btn" data-elegir="${i}">Elegir</button></div>
      </article>`).join('')}</div>`,
    `<p class="ca-rotulo">Gift Cards</p>
     <div class="ca-gifts">${gifts.map((g, i) => `<button data-gift="${i}">
       <img src="${g.foto}" alt=""><span>${g.s.title}</span></button>`).join('')}</div>`],
  colores: ({ c, max }) => ['Tus colores', `<div class="ca-dots">${c.map(x => `
    <button class="ca-dot" style="background:${x.hex}" aria-label="${x.nombre}" aria-pressed="${colores.includes(x.nombre)}" data-color="${x.nombre}"></button>`).join('')}</div>`,
    `<p class="ca-nota">${linea.nombre} · ${linea.largo} cm · ${colores.length ? colores.join(' · ') : 'elige hasta ' + max + ' colores'}</p>
     <div class="ca-cta"><a class="ca-btn" href="${wa(`Hola Marcela, me interesa un TuconTu ${linea.nombre} (${linea.largo} cm)${colores.length ? ' en los colores ' + colores.join(' y ') : ''}. ¿Cuál es su precio?`)}">Pedir por WhatsApp</a></div>`]
};

// las hojas que suben desde abajo: fotos de una línea, o la historia
const hojas = {
  fotos: x => `<div class="ca-galeria">${x.fotos.map(f => `<img src="${f}" alt="TuconTu ${x.nombre}">`).join('')}</div>
    <p class="ca-nota">${x.nombre} · ${x.largo} cm · ${x.fotos.length} foto${x.fotos.length > 1 ? 's' : ''}</p>`,
  historia: h => `<h3>${h.titulo}</h3><p class="ca-lema">${h.lema}</p>
    <video src="${h.video}" poster="${h.portada}" controls playsinline preload="none"></video>
    <p>${h.intro}</p>${h.partes.map(p => `<p><b>${p.nombre}.</b> ${p.texto}</p>`).join('')}
    <p class="ca-lema">${h.cierre}</p>`
};
const abre = html => { hoja.innerHTML = `<button class="ca-cerrar" aria-label="Cerrar">✕</button>${html}`; hoja.showModal(); };
hoja.addEventListener('click', e => { if (e.target === hoja || e.target.closest('.ca-cerrar')) { hoja.querySelector('video')?.pause(); hoja.close(); } });

function pinta() {
  const [t, m, f] = momentos[path.at(-1)](D);
  $('h2').textContent = t; $('.ca-main').innerHTML = m; $('.ca-foot').innerHTML = f;
  $('.ca-back').hidden = path.length < 2;
  const mini = $('.ca-mini'); mini.hidden = path.at(-1) !== 'colores';
  if (linea) mini.textContent = linea.nombre;
}
const ir = fn => document.startViewTransition ? document.startViewTransition(() => { fn(); pinta(); }) : (fn(), pinta());

root.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset;
  if (b.matches('.ca-back')) ir(() => path.pop());
  else if (d.elegir) ir(() => { linea = D.l[d.elegir]; colores = []; path.push('colores'); });
  else if (d.fotos) abre(hojas.fotos(D.l[d.fotos]));
  else if ('historia' in d) abre(hojas.historia(D.h));
  else if (d.gift) { const s = D.gifts[d.gift].s;
    // el mismo modal de los servicios, sin Agendar: solo WhatsApp
    if (window.openOffer) openOffer({ ...s, heroTitle: 'Gift Card · ' + s.title, urlAgenda: null }, b);
    else location.href = wa(`Hola Marcela, me interesa una Gift Card de «${s.title}».`); }
  else if (d.color) { const i = colores.indexOf(d.color);
    if (i >= 0) colores.splice(i, 1); else if (colores.length < D.max) colores.push(d.color);
    pinta(); }
});

Promise.all(['tienda/vitrina.json', 'tienda/lineas.json', 'tienda/colores-algodon.json']
  .map(u => fetch(u).then(r => r.json()))).then(([v, l, c]) => {
  const gifts = v.estantes.find(e => e.id === 'gift-cards').items.map(g => ({
    foto: g.foto.src, s: SITE_DATA.services.find(s => s.id === g.servicio) }));
  D = { gifts, l: l.lineas, h: l.historia, c: c.colores.filter(x => x.publicado), max: c.max_colores || 3 };
  pinta();
});
})();
