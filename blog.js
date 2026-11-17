// El blog como modo lectura: ✎ en el header abre la lista; ← o el "atrás"
// del teléfono vuelve (entrada → lista → el sitio, donde se estaba).
(() => {
const pluma = document.querySelector('.blog-open'), lectura = document.querySelector('.lectura');
const html = document.documentElement;
const vt = fn => { if (!document.startViewTransition) return fn();
  html.classList.add('blog-cambia');
  document.startViewTransition(fn).finished.finally(() => html.classList.remove('blog-cambia')); };
const img = src => src ? `<img src="${src}" alt="">` : '';
const meta = e => `<span class="lectura-meta">${e.minutos} min · ${e.tema}</span>`;
let E = [];

const lista = () => '<h2>Lecturas</h2>' + E.map(e => `<button class="lectura-entrada" data-leer="${e.id}">
  ${img(e.imagen)}<h3>${e.titulo}</h3>${meta(e)}<p>${e.resumen}</p></button>`).join('');
const entrada = e => `${img(e.imagen)}${meta(e)}<h2>${e.titulo}</h2>${e.texto.map(p => `<p>${p}</p>`).join('')}`;

function lee() {
  const l = history.state?.leer, e = E.find(x => x.id === l);
  document.body.classList.toggle('leyendo', !!l); lectura.hidden = !l;
  pluma.textContent = l ? '← Volver' : 'Blog';
  pluma.setAttribute('aria-label', l ? 'Volver' : 'Blog');
  if (l) { lectura.innerHTML = e ? entrada(e) : lista(); lectura.scrollTop = 0; }
}
// el estado del sitio (sección) se conserva; solo se suma "leer"
const ve = leer => { history.pushState({ ...history.state, leer }, ''); vt(lee); };
addEventListener('popstate', () => vt(lee));
pluma.addEventListener('click', () => history.state?.leer ? history.back() : ve('lista'));
lectura.addEventListener('click', e => { const b = e.target.closest('[data-leer]'); if (b) ve(b.dataset.leer); });

fetch('blog/entradas.json').then(r => r.json()).then(j => { E = j.entradas; lee(); });
})();
