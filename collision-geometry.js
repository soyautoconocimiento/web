(function (root, factory) {
  const geometry = factory();
  if (typeof module === 'object' && module.exports) module.exports = geometry;
  else root.SoyCollisionGeometry = geometry;
})(globalThis, function () {
  let measureContext;

  function textInkRect(lineRect, fontSize, text, style) {
    if (measureContext === undefined) {
      const canvas = document.createElement('canvas');
      measureContext = canvas.getContext('2d');
    }
    const rect = { left: lineRect.left, top: lineRect.top, right: lineRect.right, bottom: lineRect.bottom, width: lineRect.width, height: lineRect.height };
    if (!measureContext) return rect;

    const font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
    measureContext.font = font;
    const metrics = measureContext.measureText(text);
    const fontAscent = metrics.fontBoundingBoxAscent || fontSize * 0.8;
    const fontDescent = metrics.fontBoundingBoxDescent || fontSize * 0.2;
    const inkAscent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
    const inkDescent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
    const leading = Math.max(0, (lineRect.height - fontAscent - fontDescent) / 2);
    const baseline = lineRect.top + leading + fontAscent;
    // Canvas glyph metrics can exceed a tight CSS line box (especially for
    // display fonts with compact line-height). Range fragments are the actual
    // rendered text fragments, so keep estimated ink within that fragment.
    // This prevents a large heading's metric overhang from falsely colliding
    // with the next line when the visible glyphs have a clear gap.
    const inkTop = Math.max(lineRect.top, baseline - inkAscent);
    const inkBottom = Math.min(lineRect.bottom, baseline + inkDescent);
    return { ...rect, top: inkTop, bottom: Math.max(inkTop, inkBottom) };
  }

  function textRectsOverlap(a, b, fontSizeA, fontSizeB) {
    const fontSize = Math.max(1, Math.min(fontSizeA, fontSizeB));
    const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    const tolerance = fontSize * 0.045;
    const minimumArea = fontSize * fontSize * 0.012;
    return overlapX > tolerance && overlapY > tolerance && overlapX * overlapY > minimumArea;
  }

  return { textInkRect, textRectsOverlap };
});
