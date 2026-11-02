(() => {
  try {
    const c = new URLSearchParams(location.search).get('utm_source');
    if (!c || sessionStorage.getItem('qr-counted')) return;
    sessionStorage.setItem('qr-counted', '1');
    navigator.sendBeacon('/api/count?c=' + encodeURIComponent(c));
  } catch (e) {}
})();
