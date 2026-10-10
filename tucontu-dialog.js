(() => {
  const dialog = document.getElementById('tucontu-builder-dialog');
  const open = document.getElementById('tucontu-create');
  const close = document.getElementById('tucontu-builder-close');
  if (!dialog || !open || !close) return;
  const homePhoto = document.getElementById('tucontu-home-photo');
  const homeCaption = document.getElementById('tucontu-home-caption');
  document.querySelectorAll('[data-home-photo]').forEach(button => {
    button.addEventListener('click', () => {
      if (!homePhoto || !homeCaption) return;
      homePhoto.src = `assets/tucontu/${button.dataset.homePhoto}`;
      homePhoto.alt = button.dataset.homeAlt || '';
      homePhoto.closest('figure')?.classList.toggle('is-cover-photo', button.dataset.homePhoto === '034.webp');
      homePhoto.style.objectPosition = button.dataset.objectPosition || '';
      homeCaption.textContent = button.dataset.homeCaption || '';
      document.querySelectorAll('[data-home-photo]').forEach(option => {
        const selected = option === button;
        option.classList.toggle('is-selected', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
    });
  });
  open.addEventListener('click', () => {
    window.TUCONTU_BUILDER_APP?.showIntro();
    if (!dialog.open) dialog.showModal();
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (open.isConnected) open.focus({ preventScroll: true });
  });
})();
