// v2: one 'scan' on arrival, then one anonymous 'visit' summary the first time the page is left.
// Exact definitions: see the data dictionary. No IDs, no cookies; sessionStorage only prevents double counting in a tab.
(() => {
  try {
    const SLUG = /^[a-z0-9_-]{1,40}$/;
    const code = String(new URLSearchParams(location.search).get('utm_source') || '').toLowerCase();
    if (!SLUG.test(code) || sessionStorage.getItem('qr-counted')) return;
    sessionStorage.setItem('qr-counted', '1');

    const send = params => navigator.sendBeacon('/api/count?' + new URLSearchParams({ c: code, ...params }));
    send({ e: 'scan' });

    const start = Date.now();
    const sections = [];
    const buttons = [];
    let whatsapp = '';
    let sent = false;

    const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

    // Topic of a WhatsApp message, read from the text the site already writes into the link.
    function topicOf(href) {
      const text = new URL(href).searchParams.get('text') || '';
      const service = text.match(/sobre: (.+)$/);
      if (service) return slug(service[1]);
      const piece = text.match(/TuconTu (\S+)/);
      if (piece) return slug('tucontu ' + piece[1]);
      return 'otro';
    }

    function bucket(ms) {
      const s = ms / 1000;
      if (s < 10) return '0-10s';
      if (s < 30) return '10-30s';
      if (s < 120) return '30s-2m';
      if (s < 300) return '2-5m';
      return '5m+';
    }

    // Seen = at least half of the section is visible, or it fills at least half the screen.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.rootBounds) return;
        const needed = Math.min(entry.rootBounds.height, entry.boundingClientRect.height) * 0.5;
      
        // While the "coming soon" curtain covers a section, record it as <id>-curtain.
        const curtained = entry.target.classList.contains('has-coming-curtain');
        const id = entry.target.id + (curtained ? '-curtain' : '');

        if (needed > 0 && entry.intersectionRect.height >= needed && !sections.includes(id)) sections.push(id);
      });
    }, { root: document.getElementById('main'), threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    document.querySelectorAll('section.view[id]').forEach(section => observer.observe(section));

    // Named buttons and links, in order of first press. Capture phase, so the site's own handlers can't hide a click.
    document.addEventListener('click', event => {
      const named = event.target.closest('a[id], button[id]');
      const id = named ? named.id.toLowerCase() : '';
      if (SLUG.test(id) && !buttons.includes(id) && buttons.length < 20) buttons.push(id);
      const wa = event.target.closest('a[href^="https://wa.me/"]');
      if (wa && !whatsapp) whatsapp = topicOf(wa.href);
    }, true);

    function summarize() {
      if (sent) return;
      sent = true;
      send({ e: 'visit', s: sections.join(','), b: buttons.join(','), w: whatsapp, d: bucket(Date.now() - start) });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') summarize();
    });
    window.addEventListener('pagehide', summarize);
  } catch (e) {}
})();
