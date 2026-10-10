(function (root, factory) {
  const helpers = factory();
  if (typeof module === 'object' && module.exports) module.exports = helpers;
  else root.SoyDialogClose = helpers;
})(globalThis, function () {
  function createDialogCloseController(dialog) {
    function requestClose() {
      if (!dialog.open) return false;
      dialog.close();
      return true;
    }

    return { requestClose };
  }

  return { createDialogCloseController };
});
