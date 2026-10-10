/*
 * Navigation state for the layered viewport experience.
 * Presentation and scroll behavior stay outside this module.
 */
(function (root, factory) {
  const experience = factory();
  if (typeof module === 'object' && module.exports) module.exports = experience;
  else root.SoyViewportExperience = experience;
})(globalThis, function () {
  const SECTIONS = Object.freeze(['inicio', 'acompanamientos', 'tucontu']);
  const order = new Map(SECTIONS.map((id, index) => [id, index]));

  function createState(focus = SECTIONS[0], anchors = []) {
    if (!order.has(focus)) throw new RangeError(`Unknown focused section: ${focus}`);
    if (!Array.isArray(anchors)) throw new TypeError('Anchors must be an array');

    const seen = new Set();
    for (const anchor of anchors) {
      if (!order.has(anchor)) throw new RangeError(`Unknown anchor section: ${anchor}`);
      if (anchor === focus || seen.has(anchor)) throw new RangeError(`Invalid repeated anchor section: ${anchor}`);
      seen.add(anchor);
    }

    return Object.freeze({ focus, anchors: Object.freeze([...anchors]) });
  }

  function navigate(state, target) {
    if (!order.has(target) || target === state.focus) return state;

    const anchorIndex = state.anchors.indexOf(target);
    if (anchorIndex >= 0) {
      return createState(target, state.anchors.slice(0, anchorIndex));
    }

    if (order.get(target) < order.get(state.focus)) {
      const earlierAnchors = state.anchors.filter(anchor => order.get(anchor) < order.get(target));
      return createState(target, earlierAnchors);
    }

    return createState(target, [...state.anchors, state.focus]);
  }

  function back(state) {
    if (state.anchors.length === 0) return state;
    const anchors = [...state.anchors];
    const focus = anchors.pop();
    return createState(focus, anchors);
  }

  function visibleSections(state) {
    return [...state.anchors, state.focus];
  }

  return Object.freeze({ SECTIONS, createState, navigate, back, visibleSections });
});
