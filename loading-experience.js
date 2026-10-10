(() => {
  const stage = document.getElementById('main');
  if (!stage || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observed = new WeakSet();
  const watch = element => {
    if (observed.has(element)) return;
    observed.add(element);
    observer.observe(element);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      observer.unobserve(element);
      element.classList.add('loading-reveal', 'loading-reveal-pending');
      void element.getBoundingClientRect().height;
      requestAnimationFrame(() => element.classList.remove('loading-reveal-pending'));
    });
  }, { root: stage, rootMargin: '0px 0px 48px 0px', threshold: 0.08 });

  const serviceGrid = document.getElementById('service-grid');
  const observeText = root => root.querySelectorAll(root === serviceGrid
    ? '.service-card-body'
    : '#acompanamientos .section-heading, #service-grid .service-card-body, #tucontu .tucontu-content, #tucontu .tucontu-actions'
  ).forEach(watch);
  const observeImages = root => root.querySelectorAll(root === serviceGrid
    ? '.service-card-image img'
    : '#service-grid .service-card-image img, #tucontu .tucontu-visual img'
  ).forEach(image => {
    const observeWhenReady = () => { if (image.naturalWidth > 0) watch(image); };
    if (image.complete) observeWhenReady();
    else image.addEventListener('load', observeWhenReady, { once: true });
  });

  observeText(document);
  observeImages(document);
  if (serviceGrid) new MutationObserver(() => { observeText(serviceGrid); observeImages(serviceGrid); })
    .observe(serviceGrid, { childList: true, subtree: true });
})();
