(function (root, factory) {
  const helpers = factory();
  if (typeof module === 'object' && module.exports) module.exports = helpers;
  else root.SoyContactLinks = helpers;
})(globalThis, function () {
  const phone = '56962391328';

  function serviceWhatsAppHref(serviceName) {
    const message = `Hola, me interesa saber más sobre: ${serviceName}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  return { serviceWhatsAppHref };
});
