// Colores del Alma en una sola pantalla, sin scroll vertical:
// bienvenida → vitrina → TuconTu → tus colores.
// O, con ?entrada=d, los valores en una sola pantalla.
// Se monta en el elemento .ca; lo usa index.html.
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
// maneras de entrar, para que Marcela elija: ?entrada=a|b|c|d|e
const entrada = new URLSearchParams(location.search).get('entrada') || 'a';
// d no tiene puerta: es una sola pantalla, la de los valores
const inicio = entrada === 'd' ? 'valores' : 'bienvenida';
let D, path = [inicio], linea = null, colores = [], foco = null;

// una franja de tarjetas: imagen y nombre encima
const franja = (xs, dato, val = i => i) => `<div class="ca-gifts">${xs.map((x, i) => `<button data-${dato}="${val(i)}">
  <img src="${x.foto}" alt=""><span>${x.nombre}</span></button>`).join('')}</div>`;
const giftCards = gifts => franja(gifts.map(g => ({ foto: g.foto, nombre: g.s.title })), 'gift');
// los colores, y el pedido de la línea elegida
const dots = ({ c }) => `<div class="ca-dots">${c.map(x => `
    <button class="ca-dot" style="background:${x.hex}" aria-label="${x.nombre}" aria-pressed="${colores.includes(x.nombre)}" data-color="${x.nombre}"></button>`).join('')}</div>`;
const pide = () => `<div class="ca-cta"><a class="ca-btn" href="${wa(`Hola Marcela, me interesa un TuconTu ${linea.nombre} (${linea.largo} cm)${colores.length ? ' en los colores ' + colores.join(' y ') : ''}. ¿Cuál es su precio?`)}">Pedir por WhatsApp</a></div>`;
const pedido = () => `<p class="ca-nota">${linea.nombre} · ${linea.largo} cm · ${colores.length ? colores.join(' · ') : 'elige hasta ' + D.max + ' colores'}</p>${pide()}`;
// d: el cuadrado. Tres celdas; la tocada es protagonista, las
// otras quedan como una franja sutil al borde. Nada sale de él.
// Sin view transitions: el cuadro queda y solo cambia lo de
// adentro; las columnas se mueven con CSS y lo nuevo aparece.
const regalo = `<svg class="ca-glifo" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 11h15v9h-15zM3.5 8h17v3h-17zM12 8v12M12 8c-1.5-3.5-5.5-4-5-1.5.3 1.3 5 1.5 5 1.5m0 0c1.5-3.5 5.5-4 5-1.5-.3 1.3-5 1.5-5 1.5"/></svg>`;
const fondo = src => `<img class="ca-fondo" src="${src}" alt="">`;
const enFoto = x => linea || x.l.find(l => l.fotos.length) || x.l[0];
const titulo = (id, n, mas = '') => `<div class="ca-row"><button class="ca-titulo" data-valor="${id}">‹ ${n}</button>${mas}</div>`;
let gift = null;
// cada celda: protagonista (on) o quieta; quieta y con otro en
// foco, el CSS la vuelve franja
const celdas = {
  tucontu: (x, e, on) => { const f = enFoto(x);
    return !on ? `${fondo(f.fotos[0])}<span class="ca-pie"><b>${e.nombre}</b><em>${e.frase}</em></span>` : `
    ${titulo(e.id, e.nombre, '<button class="ca-link" data-historia>Historia</button>')}
    <div class="ca-lineas">${x.l.map((l, i) => linea && linea !== l ? '' : `
      <button data-linea="${i}" aria-pressed="${linea === l}">${l.nombre}${linea ? `<small>${l.largo} cm</small>` : ''}</button>`).join('')}</div>
    ${linea ? `<p class="ca-lema">${x.h.cierre}</p>
      <div class="ca-elige"><div class="ca-vista">${fondo(f.fotos[0])}</div>${dots(x)}</div>${pide()}`
    : `<div class="ca-vista">${fondo(f.fotos[0])}</div><p class="ca-nota">${f.nombre} · ${f.arquetipo}</p>`}`; },
  'gift-cards': (x, e, on) => !on ? `${fondo(x.gifts[0].foto)}<span class="ca-pie"><small>${regalo} ${e.llamado}</small><b>${e.valor}</b></span>` : `
    ${titulo(e.id, e.valor, `<small class="ca-llamado">${regalo} ${e.llamado}</small>`)}
    <div class="ca-viajes">${x.gifts.map((g, i) => gift !== null && gift !== i ? '' : `
      <button data-gift="${i}">${fondo(g.foto)}<span>${g.s.title}</span></button>`).join('')}</div>
    ${gift === null ? '' : `<p class="ca-nota ca-centro">Gift Card · ${x.gifts[gift].s.format} · ${x.gifts[gift].s.duration}</p>
      ${regalar(x.gifts[gift].s)}`}`
};
const celda = (x, id) => { const e = x.v.estantes.find(s => s.id === id), on = foco === id;
  return `<div class="ca-celda ca-c-${id}${on ? ' on' : ''}"${on ? '' : ` data-valor="${id}" role="button" tabindex="0"`}>${celdas[id](x, e, on)}</div>`; };
const regalar = s => `<div class="ca-cta ca-centro"><a class="ca-btn" href="${wa(`Hola Marcela, quiero regalar una Gift Card de «${s.title}».`)}">${regalo} Regalar por WhatsApp</a></div>`;
// e: un solo layout que se reorganiza. Todo se dibuja una vez; un
// toque solo cambia data-foco, data-linea o data-gift, y el CSS
// trae al frente lo elegido y manda al fondo lo demás.
const E = { foco: null, linea: null, gift: null };
const capaE = x => { const tc = x.v.estantes.find(e => e.id === 'tucontu'), gc = x.v.estantes.find(e => e.id === 'gift-cards');
  return `<div class="ce">
  <p class="ce-titulo">${x.v.bienvenida.titulo}</p>
  <button class="ce-valor ce-tucontu" data-ce="tucontu"><b>${tc.nombre}</b><em>${tc.frase}</em></button>
  <button class="ce-valor ce-viajes" data-ce="gift-cards"><b>${regalo} ${gc.llamado}</b><em>${gc.frase}</em></button>
  <p class="ce-valor ce-pronto"><b>?</b><em>Algo más viene</em></p>
  <div class="ce-escena ce-e-tucontu">
    <div class="ce-fotos">${x.l.map(l => `<img src="${l.fotos[0]}" alt="TuconTu ${l.nombre}">`).join('')}</div>
    <p class="ce-lema">${x.h.lema}</p>
    <div class="ce-colores"><p class="ce-lema">${x.h.cierre}</p>${dots(x)}</div>
    <div class="ce-lineas">${x.l.map((l, i) => `<button data-ce-linea="${i}"><b>${l.nombre}</b><small>${l.arquetipo} · ${l.largo} cm</small></button>`).join('')}</div>
  </div>
  <div class="ce-escena ce-e-gift-cards">${x.gifts.map((g, i) => `
    <button class="ce-gift" data-ce-gift="${i}"><img src="${g.foto}" alt=""><span>${g.s.title}<small>Gift Card · ${g.s.format} · ${g.s.duration}</small></span></button>`).join('')}</div>
  <div class="ce-accion"></div>
</div>`; };
function eE(cambio) {
  Object.assign(E, cambio); const c = root.querySelector('.ce');
  for (const k in E) if (E[k] === null) delete c.dataset[k]; else c.dataset[k] = E[k];
  const marca = (s, i) => c.querySelectorAll(s).forEach((b, k) => b.classList.toggle('on', k === i));
  marca('.ce-fotos img', E.linea ?? 0); marca('[data-ce-linea]', E.linea); marca('[data-ce-gift]', E.gift);
  c.querySelectorAll('.ca-dot').forEach(d => d.setAttribute('aria-pressed', colores.includes(d.dataset.color)));
  linea = E.linea === null ? null : D.l[E.linea];
  c.querySelector('.ce-accion').innerHTML = E.foco === 'tucontu' && linea ? pide()
    : E.foco === 'gift-cards' && E.gift !== null ? regalar(D.gifts[E.gift].s) : '';
}

// cada momento devuelve su título, su contenido y su pie
const momentos = {
  // la puerta: se entra a mirar
  // a: la puerta, con foto · b: sin foto · c: el letrero, sin foto
  bienvenida: ({ v: { bienvenida: b } }) => ['', `
    <div class="ca-bienvenida"><p class="ca-rotulo">${entrada === 'c' ? 'Tienda' : b.antetitulo}</p><h3>${b.titulo}</h3>
      ${entrada === 'a' ? `<div class="ca-foto"><img src="${b.foto.src}" alt="${b.foto.alt}"></div>` : ''}
      <p class="ca-lema">${b.lema}</p></div>`,
    `<div class="ca-cta"><button class="ca-btn" data-ir="vitrina">${entrada === 'c' ? 'Entrar' : b.boton}</button></div>`],
  // b: la vitrina muestra solo los nombres de sus estantes
  vitrina: x => entrada === 'b' ? [x.v.vitrina.titulo, `
    <p class="ca-nota">${x.v.vitrina.bajada}</p>
    ${[['tucontu', 'TuconTu'], ['gifts', 'Gift Cards']].map(([ir, n]) => `
      <button class="ca-estante ca-nombre" data-ir="${ir}"><span class="ca-row"><b>${n}</b><i>→</i></span></button>`).join('')}
    ${x.pronto.length ? `<p class="ca-rotulo">Pronto</p><p class="ca-pronto">${x.pronto.map(e => e.nombre).join(' · ')}</p>` : ''}`, '']
    : vitrinaConFotos(x),
  gifts: ({ gifts }) => ['Gift Cards', giftCards(gifts), ''],
  valores: x => ['', `<div class="ca-d"><h3>${x.v.bienvenida.titulo}</h3>
    <div class="ca-cuadro"${foco ? ` data-foco="${foco}"` : ''}>${celda(x, 'tucontu')}${celda(x, 'gift-cards')}
      <div class="ca-celda ca-incognita"><i>?</i><em>Algo más viene</em></div></div></div>`, '']
};
// la vitrina con fotos: TuconTu, las Gift Cards, y los estantes que tengan piezas
function vitrinaConFotos({ v, l, gifts, otros, pronto }) { return [v.vitrina.titulo, `
    <p class="ca-nota">${v.vitrina.bajada}</p>
    <button class="ca-estante" data-ir="tucontu"><span class="ca-foto">${foto(l.find(x => x.fotos.length) || l[0])}</span>
      <span class="ca-row"><span><b>TuconTu</b><small>${l.map(x => x.nombre).join(' · ')}</small></span><i>→</i></span></button>
    ${otros.map((e, k) => `<p class="ca-rotulo">${e.nombre}</p>${franja(e.items.map(x => ({ foto: x.foto.src, nombre: x.nombre })), 'item', i => k + ':' + i)}`).join('')}
    <p class="ca-rotulo">Gift Cards</p>${giftCards(gifts)}
    ${pronto.length ? `<p class="ca-rotulo">Pronto</p><p class="ca-pronto">${pronto.map(e => e.nombre).join(' · ')}</p>` : ''}`, '']; }
Object.assign(momentos, {
  tucontu: ({ l }) => ['TuconTu', `
    <div class="ca-row"><p class="ca-rotulo">Elige tu línea</p><button class="ca-link" data-historia>Historia</button></div>
    <div class="ca-rail">${l.map((x, i) => `
      <article class="ca-linea"><div class="ca-foto">${foto(x)}
        ${x.fotos.length ? `<button class="ca-ver" data-fotos="${i}">Ver fotos</button>` : ''}</div>
        <div class="ca-row"><b>${x.nombre}</b><span>${x.largo} cm</span></div>
        <p class="ca-nota">${x.arquetipo} · ${x.linea}<br>${x.valores.join(' · ')}</p>
        <div class="ca-row"><span>${clp(x.precio)}</span><button class="ca-btn" data-elegir="${i}">Elegir</button></div>
      </article>`).join('')}</div>`, ''],
  colores: x => ['Tus colores', dots(x), pedido()]
});

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
  $('h2').textContent = t; $('.ca-foot').innerHTML = f;
  // d: el cuadro se queda; solo cambia su foco y lo de adentro
  const q = $('.ca-cuadro'), n = document.createElement('div'); n.innerHTML = m;
  const q2 = n.querySelector('.ca-cuadro');
  if (q && q2) { q.replaceChildren(...q2.childNodes);
    if (foco) q.dataset.foco = foco; else delete q.dataset.foco; }
  else $('.ca-main').innerHTML = m;
  $('.ca-back').hidden = path.length < 2;
  const mini = $('.ca-mini'); mini.hidden = path.at(-1) !== 'colores';
  if (linea) mini.textContent = linea.nombre;
}
// mientras un momento se funde con el siguiente, nadie vuelve a la puerta
let fundiendo = false;
const ir = fn => {
  if (entrada === 'd' || !document.startViewTransition) { fn(); pinta();
    const q = $('.ca-cuadro'); if (q) { q.classList.add('ca-entra'); setTimeout(() => q.classList.remove('ca-entra'), 600); }
    return; }
  fundiendo = true;
  document.startViewTransition(() => { fn(); pinta(); }).finished.finally(() => { fundiendo = false; });
};

root.addEventListener('click', e => {
  const b = e.target.closest('button, [data-valor]'); if (!b) return;
  const d = b.dataset;
  if (b.matches('.ca-back')) ir(() => path.pop());
  else if (d.ir) ir(() => path.push(d.ir));
  else if (d.ce) { colores = []; eE({ foco: E.foco === d.ce ? null : d.ce, linea: null, gift: null }); }
  else if (d.ceLinea) { colores = []; eE({ linea: E.linea === +d.ceLinea ? null : +d.ceLinea }); }
  else if (d.ceGift) eE({ gift: E.gift === +d.ceGift ? null : +d.ceGift });
  else if (d.valor) ir(() => { foco = foco === d.valor ? null : d.valor; linea = gift = null; colores = []; });
  else if (d.linea) ir(() => { linea = linea === D.l[d.linea] ? null : D.l[d.linea]; colores = []; });
  else if (d.item) { const [k, i] = d.item.split(':'), x = D.otros[k].items[i];
    abre(`<h3>${x.nombre}</h3><img class="ca-pieza" src="${x.foto.src}" alt="${x.foto.alt || ''}">
      <p>${x.descripcion || ''}</p><a class="ca-btn" href="${wa(`Hola Marcela, me interesa «${x.nombre}».`)}">Consultar por WhatsApp</a>`); }
  else if (d.elegir) ir(() => { linea = D.l[d.elegir]; colores = []; path.push('colores'); });
  else if (d.fotos) abre(hojas.fotos(D.l[d.fotos]));
  else if ('historia' in d) abre(hojas.historia(D.h));
  else if (d.gift && entrada === 'd') ir(() => { gift = gift === +d.gift ? null : +d.gift; });
  else if (d.gift) { const s = D.gifts[d.gift].s;
    // el mismo modal de los servicios, sin Agendar: solo WhatsApp
    if (window.openOffer) openOffer({ ...s, heroTitle: 'Gift Card · ' + s.title, urlAgenda: null }, b);
    else location.href = wa(`Hola Marcela, me interesa una Gift Card de «${s.title}».`); }
  else if (d.color) { const i = colores.indexOf(d.color);
    if (i >= 0) colores.splice(i, 1); else if (colores.length < D.max) colores.push(d.color);
    if (entrada === 'e') eE({}); else pinta(); }
});

Promise.all(['tienda/vitrina.json', 'tienda/lineas.json', 'tienda/colores-algodon.json']
  .map(u => fetch(u).then(r => r.json()))).then(([v, l, c]) => {
  const gifts = v.estantes.find(e => e.id === 'gift-cards').items.map(g => ({
    foto: g.foto.src, s: SITE_DATA.services.find(s => s.id === g.servicio) }));
  // los estantes futuros aparecen solo cuando tienen piezas
  const propios = v.estantes.filter(e => e.publicado && e.items && !['tucontu', 'gift-cards'].includes(e.id));
  const otros = propios.filter(e => e.items.length);
  // los que aún no tienen piezas se anuncian por su nombre
  const pronto = propios.filter(e => !e.items.length);
  D = { v, gifts, otros, pronto, l: l.lineas, h: l.historia, c: c.colores.filter(x => x.publicado), max: c.max_colores || 3 };
  if (entrada === 'e') { $('.ca-main').innerHTML = capaE(D); eE({}); } else pinta();
});

// cada vez que alguien llega a Colores del Alma, entra por la puerta
new IntersectionObserver(([e]) => {
  if (entrada === 'e') { if (!e.isIntersecting && D) { colores = []; eE({ foco: null, linea: null, gift: null }); } return; }
  if (!e.isIntersecting && !fundiendo && D && (path.length > 1 || foco)) { path = [inicio]; foco = linea = gift = null; colores = []; pinta(); }
}).observe(root.closest('section') || root);
})();
