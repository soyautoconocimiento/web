(function (root, factory) {
  const helpers = factory();
  if (typeof module === 'object' && module.exports) module.exports = helpers;
  else root.SoyScrollSettle = helpers;
})(globalThis, function () {
  function chooseSectionTarget(scrollTop, viewportExtent, sections) {
    if (!Number.isFinite(scrollTop) || !Number.isFinite(viewportExtent) || viewportExtent <= 0 || !sections?.length) return null;

    const tolerance = viewportExtent * 0.02;
    const entryZone = viewportExtent * 0.08;
    const positionTolerance = viewportExtent * 0.005;
    const candidates = sections
      .filter(section => Number.isFinite(section.top) && Number.isFinite(section.height) && section.height > 0)
      .map((section, order) => ({ ...section, order, end: section.top + section.height }));
    if (!candidates.length) return null;

    const overflowingSection = candidates.find(section =>
      section.height > viewportExtent + tolerance && scrollTop >= section.top && scrollTop < section.end
    );
    if (overflowingSection && scrollTop - overflowingSection.top > entryZone) return null;

    const nearest = candidates
      .map(section => ({ ...section, distance: Math.abs(section.top - scrollTop) }))
      .sort((a, b) => a.distance - b.distance || a.order - b.order)[0];
    if (nearest.distance <= positionTolerance) return null;
    return { index: nearest.index ?? nearest.order, top: nearest.top, distance: nearest.distance };
  }

  return { chooseSectionTarget };
});
