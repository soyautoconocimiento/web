(() => {
  const pages = [
    { id: 'inicio', label: 'El camino' },
    { id: 'acompanamientos', label: 'Acompañamientos' },
    { id: 'tucontu', label: 'Colores del alma' }
  ];
  const stage = document.getElementById('main');
  const layeredExperiencePrototype = new URLSearchParams(location.search).get('experiencia') === 'capas';
  const viewportExperience = window.SoyViewportExperience;
  const stageScrollStorageKey = `soyautoconocimiento:stage-scroll:${location.pathname}${location.search}`;
  let stageScrollSaveTimer = 0;
  function saveStageScrollPosition() {
    window.clearTimeout(stageScrollSaveTimer);
    try {
      sessionStorage.setItem(stageScrollStorageKey, String(Math.round(stage.scrollTop)));
    } catch {}
  }
  function scheduleStageScrollSave() {
    window.clearTimeout(stageScrollSaveTimer);
    stageScrollSaveTimer = window.setTimeout(saveStageScrollPosition, 120);
  }
  window.addEventListener('pagehide', saveStageScrollPosition);
  const sections = pages.map(page => document.getElementById(page.id));
  let experienceState = viewportExperience.createState(
    sections.find(section => `#${section.id}` === location.hash)?.id || 'inicio'
  );
  let experienceStep = experienceState.focus === 'acompanamientos' ? 'services' : experienceState.focus;
  if (layeredExperiencePrototype) document.body.classList.add('viewport-experience-prototype');
  function syncViewportExperience() {
    if (!layeredExperiencePrototype) return;
    stage.dataset.experienceFocus = experienceState.focus;
    stage.dataset.experienceAnchors = experienceState.anchors.join(' ');
    stage.dataset.experienceStep = experienceStep;
    sections.forEach(section => {
      const role = section.id === experienceState.focus ? 'focus'
        : experienceState.anchors.includes(section.id) ? 'anchor' : 'resting';
      const inactive = role === 'resting';
      section.dataset.experienceRole = role;
      section.inert = inactive;
      section.setAttribute('aria-hidden', String(inactive));
    });
    const returningToHome = experienceState.focus === 'acompanamientos' && experienceState.anchors.includes('inicio');
    prototypeReturn.hidden = !layeredExperiencePrototype || !returningToHome;
    prototypeReturn.querySelector('span').textContent = experienceStep === 'services' ? 'Volver a Terapia Floral' : 'Volver a Inicio';
    prototypeReturn.setAttribute('aria-label', experienceStep === 'services' ? 'Volver a Terapia Floral' : 'Volver a Inicio');
    const floralCard = document.getElementById('prototype-floral-card');
    floralCard.hidden = !(experienceState.focus === 'acompanamientos' && experienceState.anchors.includes('inicio'));
    floralCard.inert = experienceStep !== 'floral';
    floralCard.setAttribute('aria-hidden', String(experienceStep !== 'floral'));
  }
  const navLinks = [...document.querySelectorAll('[data-link]')];
  const prototypeReturn = document.getElementById('prototype-return');
  const menu = document.getElementById('main-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const journeyNumber = document.getElementById('journey-number');
  const journeyName = document.getElementById('journey-name');
  const previousPage = document.getElementById('page-prev');
  const nextPage = document.getElementById('page-next');
  const video = document.getElementById('tucontu-video');
  const aboutDialog = document.getElementById('about-dialog');
  const aboutOpen = document.getElementById('about-open');
  const aboutClose = document.getElementById('about-close');
  const { serviceWhatsAppHref } = window.SoyContactLinks;
  const { createDialogCloseController } = window.SoyDialogClose;
  const aboutCloseController = createDialogCloseController(aboutDialog, {
    reducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches
  });
  let aboutTrigger = null;
  const aboutMobileViewport = matchMedia('(max-width: 47.5rem)');
  const aboutMobileReader = document.getElementById('about-mobile-reader');
  const aboutMobileStep = document.getElementById('about-mobile-step');
  const aboutReadingPosition = document.getElementById('about-reading-position');
  const aboutReadingMarker = document.getElementById('about-reading-marker');
  const aboutReadingPrevious = document.getElementById('about-reading-prev');
  const aboutReadingNext = document.getElementById('about-reading-next');
  const aboutCopyOne = document.getElementById('about-copy-one');
  const aboutCopyTwo = document.getElementById('about-copy-two');
  const aboutQuote = document.getElementById('about-quote');
  const aboutSignoff = document.querySelector('.about-signoff');
  const aboutSignature = document.querySelector('.about-copy .signature');
  let aboutPassages = [];
  let aboutPassageIndex = 0;
  function showAboutPassage(index) {
    aboutPassageIndex = Math.max(0, Math.min(index, aboutPassages.length - 1));
    aboutPassages.forEach((passage, passageIndex) => {
      passage.hidden = passageIndex !== aboutPassageIndex;
      passage.classList.remove('is-revealing');
    });
    const activePassage = aboutPassages[aboutPassageIndex];
    if (aboutDialog.open && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void activePassage.offsetWidth;
      activePassage.classList.add('is-revealing');
    }
    aboutReadingPrevious.disabled = aboutPassageIndex === 0;
    aboutReadingNext.disabled = aboutPassageIndex === aboutPassages.length - 1;
    aboutReadingPosition.textContent = `${String(aboutPassageIndex + 1).padStart(2, '0')} / ${String(aboutPassages.length).padStart(2, '0')}`;
    aboutReadingPosition.setAttribute('aria-label', `Pasaje ${aboutPassageIndex + 1} de ${aboutPassages.length}`);
    aboutReadingMarker.style.transform = `translateX(${aboutPassageIndex * 100}%)`;
    if (aboutMobileViewport.matches) aboutDialog.setAttribute('aria-describedby', aboutPassages[aboutPassageIndex].id);
  }
  function prepareAboutReader() {
    const firstPassage = document.createElement('section');
    firstPassage.className = 'about-mobile-passage about-reading-passage';
    firstPassage.id = 'about-reading-passage-1';
    const intro = document.createElement('p');
    intro.textContent = aboutCopyOne.textContent;
    const originalProfessionalCopy = aboutCopyTwo.textContent.trim();
    const splitAt = originalProfessionalCopy.indexOf('Asumí nuevos desafíos,');
    const firstProfessionalPart = splitAt < 0 ? originalProfessionalCopy : originalProfessionalCopy.slice(0, splitAt).trim();
    const secondProfessionalPart = splitAt < 0 ? '' : originalProfessionalCopy.slice(splitAt).trim();
    const professionalBeginning = document.createElement('p');
    professionalBeginning.textContent = firstProfessionalPart;
    firstPassage.append(intro, professionalBeginning);

    const finalPassage = document.createElement('section');
    finalPassage.className = 'about-mobile-passage about-reading-passage';
    finalPassage.id = 'about-reading-passage-2';
    const professionalEnding = document.createElement('p');
    professionalEnding.textContent = secondProfessionalPart;
    const invitation = document.createElement('blockquote');
    invitation.textContent = aboutQuote.textContent;
    const closing = document.createElement('p');
    closing.className = 'about-mobile-closing';
    const farewell = document.createElement('span');
    farewell.textContent = `${aboutSignoff.textContent.trim()},`;
    const signature = document.createElement('span');
    signature.className = 'about-mobile-signature';
    signature.textContent = aboutSignature.textContent.trim();
    const rose = document.createElement('span');
    rose.className = 'about-mobile-rose';
    rose.setAttribute('aria-hidden', 'true');
    rose.textContent = '🌹';
    closing.append(farewell, signature, rose);
    finalPassage.append(professionalEnding, invitation, closing);
    aboutPassages = [firstPassage, finalPassage];
    aboutMobileStep.replaceChildren(...aboutPassages);
    showAboutPassage(0);
    updateAboutReaderMode();
  }
  function updateAboutReaderMode() {
    const mobile = aboutMobileViewport.matches;
    aboutMobileReader.hidden = !mobile;
    aboutDialog.setAttribute('aria-describedby', mobile ? aboutPassages[aboutPassageIndex]?.id || 'about-quote' : 'about-quote');
    if (mobile) showAboutPassage(aboutPassageIndex);
  }
  aboutReadingPrevious.addEventListener('click', () => showAboutPassage(aboutPassageIndex - 1));
  aboutReadingNext.addEventListener('click', () => showAboutPassage(aboutPassageIndex + 1));
  aboutMobileViewport.addEventListener('change', () => {
    if (aboutMobileViewport.matches) aboutPassageIndex = 0;
    updateAboutReaderMode();
  });
  prepareAboutReader();
  let currentIndex = 0;
  let scheduleLayoutCheck = () => {};
  const { textInkRect, textRectsOverlap } = window.SoyCollisionGeometry;
  function updateJourney() {
    const stageTop = stage.getBoundingClientRect().top;
    const index = layeredExperiencePrototype
      ? Math.max(0, pages.findIndex(page => page.id === experienceState.focus))
      : sections.reduce((nearest, section, candidate) =>
        Math.abs(section.getBoundingClientRect().top - stageTop) <
          Math.abs(sections[nearest].getBoundingClientRect().top - stageTop)
          ? candidate : nearest, 0);
    const sectionChanged = index !== currentIndex;
    currentIndex = index;
    navLinks.forEach(link => {
      const selected = link.dataset.link === pages[index].id;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    journeyNumber.textContent = `${String(index + 1).padStart(2, '0')} / 03`;
    journeyName.textContent = pages[index].label;
    previousPage.disabled = index === 0;
    nextPage.disabled = index === pages.length - 1;
    if (location.hash !== `#${pages[index].id}`) {
      history.replaceState(null, '', `${location.pathname}${location.search}#${pages[index].id}`);
    }
    if (index !== pages.length - 1) video.pause();
    if (sectionChanged) scheduleLayoutCheck();
  }

  function setStageScrollPositionImmediately(top) {
    const previousBehavior = stage.style.scrollBehavior;
    stage.style.scrollBehavior = 'auto';
    stage.scrollTop = top;
    stage.style.scrollBehavior = previousBehavior;
  }

  let activeDepthAnimation = null;
  let depthTransitionResetTimer = 0;
  let depthTransitionToken = 0;
  let activeDepthFlight = null;
  function transitionLayeredTo(targetId, requestedStep = null) {
    const previous = experienceState;
    const next = viewportExperience.navigate(previous, targetId);
    const nextStep = targetId === 'acompanamientos' ? (requestedStep || 'services') : targetId;
    const stepChanged = next === previous && nextStep !== experienceStep;
    if (next === previous && !stepChanged) return;
    const transitionToken = ++depthTransitionToken;
    activeDepthAnimation?.cancel();
    activeDepthAnimation = null;
    activeDepthFlight?.remove();
    activeDepthFlight = null;
    window.clearTimeout(depthTransitionResetTimer);
    const isDepthTransition = (previous.focus === 'inicio' && targetId === 'acompanamientos') ||
      (previous.focus === 'acompanamientos' && targetId === 'inicio' && previous.anchors.includes('inicio'));
    const frame = isDepthTransition ? document.querySelector('#inicio .arch-frame') : null;
    const before = frame?.getBoundingClientRect();
    const beforeRadius = frame ? getComputedStyle(frame).borderRadius : '';
    let flight = null;
    if (isDepthTransition && frame && before && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frameStyle = getComputedStyle(frame);
      const sourceImage = frame.querySelector('img');
      if (sourceImage) {
        flight = document.createElement('div');
        flight.className = 'z-transition-flight';
        Object.assign(flight.style, {
          position: 'fixed', left: `${before.left}px`, top: `${before.top}px`,
          width: `${before.width}px`, height: `${before.height}px`, margin: '0',
          padding: frameStyle.padding, border: frameStyle.border, borderRadius: frameStyle.borderRadius,
          boxShadow: frameStyle.boxShadow, background: frameStyle.backgroundColor,
          overflow: 'hidden', pointerEvents: 'none', zIndex: '2147483000',
          transformOrigin: 'top left', willChange: 'left, top, width, height, border-radius'
        });
        const image = sourceImage.cloneNode(false);
        const imageStyle = getComputedStyle(sourceImage);
        Object.assign(image.style, {
          display: 'block', width: '100%', height: '100%', objectFit: 'cover',
          objectPosition: imageStyle.objectPosition, borderRadius: imageStyle.borderRadius
        });
        flight.append(image);
        document.body.append(flight);
        activeDepthFlight = flight;
      }
    }
    if (isDepthTransition) stage.dataset.zTransition = targetId === 'acompanamientos' ? 'forward' : 'back';
    else if (stepChanged) stage.dataset.zTransition = `step-${nextStep}`;
    else delete stage.dataset.zTransition;
    experienceState = next;
    experienceStep = nextStep;
    syncViewportExperience();
    updateJourney();
    if (!isDepthTransition || !frame || !before || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (isDepthTransition) depthTransitionResetTimer = window.setTimeout(() => {
        if (transitionToken === depthTransitionToken) delete stage.dataset.zTransition;
      }, 0);
      else if (stepChanged) depthTransitionResetTimer = window.setTimeout(() => {
        if (transitionToken === depthTransitionToken) delete stage.dataset.zTransition;
      }, 760);
      return;
    }
    requestAnimationFrame(() => {
      if (transitionToken !== depthTransitionToken) return;
      const after = frame.getBoundingClientRect();
      if (!after.width || !after.height || !before.width || !before.height) {
        flight?.remove();
        activeDepthFlight = null;
        delete stage.dataset.zTransition;
        return;
      }
      const afterRadius = getComputedStyle(frame).borderRadius;
      const animation = flight?.animate([
        { left: `${before.left}px`, top: `${before.top}px`, width: `${before.width}px`, height: `${before.height}px`, borderRadius: beforeRadius },
        { left: `${after.left}px`, top: `${after.top}px`, width: `${after.width}px`, height: `${after.height}px`, borderRadius: afterRadius }
      ], { duration: 850, easing: 'cubic-bezier(.18,.72,.22,1)' });
      if (!animation) {
        delete stage.dataset.zTransition;
        return;
      }
      activeDepthAnimation = animation;
      animation.finished.catch(() => {}).finally(() => {
        if (transitionToken !== depthTransitionToken) return;
        activeDepthAnimation = null;
        depthTransitionResetTimer = window.setTimeout(() => {
          if (transitionToken !== depthTransitionToken) return;
          delete stage.dataset.zTransition;
          requestAnimationFrame(() => {
            if (transitionToken !== depthTransitionToken) return;
            flight.remove();
            activeDepthFlight = null;
          });
        }, 40);
      });
    });
  }

  function goToSection(index, addHistoryEntry = true) {
    const target = sections[index];
    if (!target) return;
    if (layeredExperiencePrototype) {
      if (target.id === experienceState.focus) return;
      if (addHistoryEntry) {
        const state = history.state && typeof history.state === 'object' ? history.state : {};
        history.pushState({ ...state, soyExperienceFocus: target.id, soyExperienceStep: target.id === 'acompanamientos' ? 'services' : target.id }, '', `${location.pathname}${location.search}#${target.id}`);
      }
      transitionLayeredTo(target.id);
      return;
    }
    if (addHistoryEntry) history.pushState(null, '', `${location.pathname}${location.search}#${target.id}`);
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    stage.scrollTo({ top: target.offsetTop, behavior });
  }

  window.SoySiteNavigation = Object.freeze({
    goToSectionById(sectionId) {
      const index=sections.findIndex(section=>section.id===sectionId);
      if(index>=0)goToSection(index);
    }
  });

  function closeMenu() {
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
  }

  let scrollTick = false;
  stage.addEventListener('scroll', () => {
    scheduleStageScrollSave();
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      updateJourney();
      scrollTick = false;
    });
  }, { passive: true });
  previousPage.addEventListener('click', () => goToSection(Math.max(0, currentIndex - 1)));
  nextPage.addEventListener('click', () => goToSection(Math.min(pages.length - 1, currentIndex + 1)));
  prototypeReturn.addEventListener('click', () => {
    if (history.state?.soyExperienceFocus === experienceState.focus) history.back();
    else goToSection(0);
  });
  document.getElementById('prototype-more-services').addEventListener('click', () => {
    const state = history.state && typeof history.state === 'object' ? history.state : {};
    history.pushState({ ...state, soyExperienceFocus: 'acompanamientos', soyExperienceStep: 'services' }, '', `${location.pathname}${location.search}#acompanamientos`);
    transitionLayeredTo('acompanamientos', 'services');
  });
  document.getElementById('prototype-go-tucontu').addEventListener('click', () => goToSection(2));
  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    scheduleLayoutCheck();
  });
  document.addEventListener('click', event => {
    if (menu.classList.contains('is-open') && !event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus({ preventScroll: true });
    }
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const targetId = link.getAttribute('href').slice(1);
    const sectionIndex = sections.findIndex(section => section.id === targetId);
    if (sectionIndex < 0) return;
    link.addEventListener('click', event => {
      event.preventDefault();
      closeMenu();
      if (aboutDialog.open) aboutCloseController.requestClose();
      goToSection(sectionIndex);
    });
  });
  aboutOpen.addEventListener('click', () => {
    closeMenu();
    aboutTrigger = aboutOpen;
    aboutDialog.showModal();
    if (aboutMobileViewport.matches) showAboutPassage(aboutPassageIndex);
    scheduleLayoutCheck();
  });
  aboutClose.addEventListener('click', () => aboutCloseController.requestClose());
  aboutDialog.addEventListener('cancel', event => {
    event.preventDefault();
    aboutCloseController.requestClose();
  });
  aboutDialog.addEventListener('click', event => {
    if (event.target === aboutDialog) aboutCloseController.requestClose();
  });
  const initialSection = sections.find(section => `#${section.id}` === location.hash);
  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
  const legacyNavigationType = performance.navigation?.type;
  const isRestoringPage = navigationEntry?.type === 'reload' || navigationEntry?.type === 'back_forward' || legacyNavigationType === 1 || legacyNavigationType === 2;
  if (layeredExperiencePrototype) {
    syncViewportExperience();
    history.replaceState({ ...(history.state && typeof history.state === 'object' ? history.state : {}), soyExperienceFocus: experienceState.focus, soyExperienceStep: experienceStep }, '', location.href);
  } else if (isRestoringPage) {
    try {
      const savedStageScrollValue = sessionStorage.getItem(stageScrollStorageKey);
      const savedStageScroll = savedStageScrollValue === null ? NaN : Number(savedStageScrollValue);
      if (Number.isFinite(savedStageScroll) && savedStageScroll >= 0) setStageScrollPositionImmediately(savedStageScroll);
    } catch {}
  } else if (initialSection) {
    setStageScrollPositionImmediately(initialSection.offsetTop);
  }
  function followLocationHash() {
    const index = sections.findIndex(section => `#${section.id}` === location.hash);
    if (index < 0) return;
    if (layeredExperiencePrototype) {
      const focus = sections[index].id;
      const step = history.state?.soyExperienceFocus === focus ? history.state?.soyExperienceStep : null;
      transitionLayeredTo(focus, step);
      return;
    }
    goToSection(index, false);
  }
  window.addEventListener('hashchange', followLocationHash);
  window.addEventListener('popstate', followLocationHash);
  if (layeredExperiencePrototype) {
    let lastGestureNavigation = 0;
    function moveByGesture(direction) {
      const now = performance.now();
      if (now - lastGestureNavigation < 650) return;
      const targetIndex = Math.max(0, Math.min(pages.length - 1, currentIndex + direction));
      if (targetIndex === currentIndex) return;
      lastGestureNavigation = now;
      goToSection(targetIndex);
    }
    stage.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) < 24 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      moveByGesture(Math.sign(event.deltaY));
    }, { passive: false });
    let touchStart = null;
    stage.addEventListener('touchstart', event => {
      if (event.touches.length !== 1 || event.target.closest('a,button:not(.service-card),input,textarea,select,[role="tab"]')) {
        touchStart = null;
        return;
      }
      touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: true });
    stage.addEventListener('touchend', event => {
      if (!touchStart || event.changedTouches.length !== 1) return;
      const deltaX = event.changedTouches[0].clientX - touchStart.x;
      const deltaY = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(deltaY) < 56 || Math.abs(deltaY) <= Math.abs(deltaX)) return;
      moveByGesture(deltaY < 0 ? 1 : -1);
    }, { passive: true });
    stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
    window.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]')) return;
      if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (event.key === 'PageDown') {
        event.preventDefault();
        moveByGesture(1);
      } else if (event.key === 'PageUp') {
        event.preventDefault();
        moveByGesture(-1);
      }
    });
  }
  updateJourney();

  const serviceGrid = document.getElementById('service-grid');
  const serviceRailCount = document.getElementById('service-rail-count');
  const serviceRailProgress = document.getElementById('service-rail-progress');
  const serviceRailTrack = serviceRailProgress.parentElement;
  const categoryTabs = [...document.querySelectorAll('[data-category]')];
  const dialog = document.getElementById('service-dialog');
  const dialogClose = document.getElementById('dialog-close');
  const serviceCloseController = createDialogCloseController(dialog, {
    reducedMotion: () => matchMedia('(prefers-reduced-motion: reduce)').matches
  });
  const dialogImage = document.getElementById('dialog-image');
  const dialogTitle = document.getElementById('dialog-title');
  const dialogDescription = document.getElementById('dialog-description');
  const dialogFormat = document.getElementById('dialog-format');
  const dialogDetail = document.getElementById('dialog-detail');
  const dialogCalendar = document.getElementById('dialog-calendar');
  const dialogWhatsApp = document.getElementById('dialog-whatsapp');
  let lastServiceTrigger = null;
  let activeOffer = null;
  const mobileDialogViewport = matchMedia('(max-width: 47.5rem)');
  const previewCardImages = Object.freeze({
    tarot: 'service-tarot-fool-display.jpg',
    'curso-tarot-2026': 'assets/curso_tarot-marcela-20261009.webp',
    constelaciones: 'service-constelaciones-stone-display.jpg',
    'carta-astral': 'service-carta-astral-astrolabe-display.jpg'
  });

  function updateServiceRailPosition() {
    const cards = [...serviceGrid.querySelectorAll('.service-card')];
    if (!cards.length) return;
    const index = cards.reduce((best, card, cardIndex) =>
      Math.abs(card.offsetLeft - serviceGrid.scrollLeft) < Math.abs(cards[best].offsetLeft - serviceGrid.scrollLeft) ? cardIndex : best, 0);
    serviceGrid.classList.toggle('is-at-start', index === 0);
    serviceGrid.classList.toggle('is-at-end', index === cards.length - 1);
    serviceRailCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    const travel = Math.max(0, serviceRailTrack.clientWidth - serviceRailProgress.offsetWidth);
    const fraction = cards.length < 2 ? 0 : index / (cards.length - 1);
    serviceRailProgress.style.transform = `translate(${travel * fraction}px, -50%)`;
  }
  window.updateServiceRailPosition = updateServiceRailPosition;
  let serviceRailFrame = 0;
  serviceGrid.addEventListener('scroll', () => {
    if (serviceRailFrame) return;
    serviceRailFrame = requestAnimationFrame(() => {
      serviceRailFrame = 0;
      updateServiceRailPosition();
    });
  }, { passive: true });

  function offerTitle(offer) {
    return offer.heroTitle || [offer.title, offer.subtitle].filter(Boolean).join(' ');
  }
  function offerImage(offer) {
    return previewCardImages[offer.id] || offer.image;
  }
  function mobileOfferMotif(offer) {
    const motifs = {
      floral: '<path d="M120 92V37m0 24C98 51 91 36 95 27c15 1 25 13 25 34Zm0-12c21-10 29-25 25-35-15 1-25 13-25 35Z"/><circle cx="120" cy="24" r="9"/><path d="m120 9 2 6m13-1-5 5m10 9-7 1m-19 10 2-7m-14-5 7 1"/>',
      tarot: '<rect x="91" y="13" width="58" height="84" rx="3"/><path d="m120 28 4 11 11 4-11 4-4 11-4-11-11-4 11-4Zm0 38v15m-9-7h18"/><circle cx="120" cy="48" r="28"/>',
      celestial: '<circle cx="120" cy="55" r="31"/><circle cx="120" cy="55" r="17"/><path d="m120 15 3 9m26 1-7 7m20 23-10 1m-4 27-8-6m-20 18-1-10m-27-5 7-7m-13-23 10-1m5-25 8 6"/><path d="m120 36 3 14 14 5-14 4-3 14-4-14-14-4 14-5Z"/>',
      lineage: '<path d="M120 93V56m0 0L91 34m29 22 29-22M91 34 75 18m16 16-1-19m30 41 1-23m28 1 17-16m-17 16 2-19"/><circle cx="75" cy="18" r="6"/><circle cx="106" cy="31" r="6"/><circle cx="134" cy="31" r="6"/><circle cx="166" cy="18" r="6"/><circle cx="91" cy="34" r="6"/><circle cx="149" cy="34" r="6"/><circle cx="120" cy="56" r="7"/>'
    };
    const tarot = offer.id === 'tarot' || offer.id === 'curso-tarot-2026';
    const celestial = offer.id === 'carta-astral' || offer.id === 'curso-astrologia';
    const markup = offer.id === 'floral' ? motifs.floral : tarot ? motifs.tarot : celestial ? motifs.celestial : motifs.lineage;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 110" fill="none" stroke="#866333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${markup}</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
  function openOffer(offer, trigger) {
    lastServiceTrigger = trigger;
    activeOffer = offer;
    const mobile = mobileDialogViewport.matches;
    dialog.dataset.offerId = offer.id;
    dialogTitle.textContent = offerTitle(offer);
    dialogImage.src = mobile ? mobileOfferMotif(offer) : offerImage(offer);
    dialogImage.alt = mobile ? '' : offerTitle(offer);
    dialogImage.classList.toggle('is-mobile-motif', mobile);
    dialogDescription.replaceChildren();
    offer.description.split(/\n+/).filter(Boolean).forEach(part => {
      const isQuote = part.startsWith('“') && part.endsWith('”');
      const element = document.createElement(isQuote ? 'blockquote' : 'p');
      if (isQuote) element.className = 'dialog-quote';
      element.textContent = part;
      dialogDescription.append(element);
    });
    dialogFormat.textContent = offer.format;
    const isCourse = offer.type === 'course';
    const detail = isCourse ? offer.requirement : offer.duration;
    dialogDetail.textContent = isCourse ? `Requisito · ${detail}` : detail;
    dialogDetail.setAttribute('aria-label', `${isCourse ? 'Requisito' : 'Duración'}: ${detail}`);
    const serviceName = offerTitle(offer);
    if (offer.urlAgenda) {
      dialogCalendar.href = offer.urlAgenda;
      dialogCalendar.setAttribute('aria-label', `Agendar ${serviceName}`);
      dialogCalendar.hidden = false;
    } else {
      dialogCalendar.hidden = true;
      dialogCalendar.removeAttribute('href');
      dialogCalendar.removeAttribute('aria-label');
    }
    if (serviceName) {
      dialogWhatsApp.href = serviceWhatsAppHref(serviceName);
      dialogWhatsApp.setAttribute('aria-label', `Conversar por WhatsApp sobre ${serviceName}`);
      dialogWhatsApp.hidden = false;
    } else {
      dialogWhatsApp.hidden = true;
      dialogWhatsApp.removeAttribute('href');
      dialogWhatsApp.removeAttribute('aria-label');
    }
    dialog.showModal();
    scheduleLayoutCheck();
  }
  mobileDialogViewport.addEventListener('change', event => {
    if (!dialog.open || !activeOffer) return;
    dialogImage.src = event.matches ? mobileOfferMotif(activeOffer) : offerImage(activeOffer);
    dialogImage.alt = event.matches ? '' : offerTitle(activeOffer);
    dialogImage.classList.toggle('is-mobile-motif', event.matches);
  });
  document.getElementById('hero-floral-link').addEventListener('click', event => {
    if (layeredExperiencePrototype) {
      const state = history.state && typeof history.state === 'object' ? history.state : {};
      history.pushState({ ...state, soyExperienceFocus: 'acompanamientos', soyExperienceStep: 'floral' }, '', `${location.pathname}${location.search}#acompanamientos`);
      transitionLayeredTo('acompanamientos', 'floral');
      return;
    }
    const floralOffer = SITE_DATA.services.find(offer => offer.id === SITE_DATA.hero) ||
      SITE_DATA.services.find(offer => offerTitle(offer).toLocaleLowerCase('es').includes('terapia floral evolutiva'));
    if (floralOffer) openOffer(floralOffer, event.currentTarget);
    else goToSection(1);
  });
  let offerRenderVersion = 0;
  async function renderOffers(category) {
    const renderVersion = ++offerRenderVersion;
    const offers = (category === 'courses' ? SITE_DATA.courses : SITE_DATA.services)
      .filter(offer => !SITE_DATA.hero || offer.id !== SITE_DATA.hero);
    const cards = [];
    offers.forEach((offer, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'service-card';
      card.dataset.offerId = offer.id;
      card.style.setProperty('--card-index', String(index));
      card.setAttribute('aria-label', `Abrir detalles de ${offerTitle(offer)}`);
      const visual = document.createElement('span');
      visual.className = 'service-card-image';
      const image = document.createElement('img');
      image.src = offerImage(offer);
      image.alt = '';
      image.loading = 'eager';
      image.decoding = 'sync';
      visual.append(image);
      const body = document.createElement('span');
      body.className = 'service-card-body';
      const title = document.createElement('span');
      title.className = 'service-card-name';
      title.textContent = offerTitle(offer);
      const action = document.createElement('span');
      action.className = 'service-card-action';
      action.textContent = 'CONOCER';
      body.append(title, action);
      card.append(visual, body);
      card.addEventListener('click', () => openOffer(offer, card));
      cards.push(card);
    });
    await Promise.all(cards.map(card => {
      const image = card.querySelector('img');
      if (!image) return Promise.resolve();
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      if (typeof image.decode === 'function') return image.decode().catch(() => undefined);
      return new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }));
    if (renderVersion !== offerRenderVersion) return;
    serviceGrid.replaceChildren(...cards);
    serviceGrid.classList.toggle('is-courses', category === 'courses');
    serviceGrid.scrollTop = 0;
    if (category === 'services' && matchMedia('(max-width: 68.75rem)').matches && cards.length) {
      const middleCard = cards[Math.floor(cards.length / 2)];
      requestAnimationFrame(() => {
        if (renderVersion !== offerRenderVersion) return;
        const gridBounds = serviceGrid.getBoundingClientRect();
        const cardBounds = middleCard.getBoundingClientRect();
        serviceGrid.scrollLeft += cardBounds.left - gridBounds.left - (gridBounds.width - cardBounds.width) / 2;
        updateServiceRailPosition();
      });
    } else {
      serviceGrid.scrollLeft = 0;
    }
    updateServiceRailPosition();
    scheduleLayoutCheck();
  }
  let categorySwitchToken = 0;
  async function selectCategoryTab(tab, moveFocus = false) {
    const switchToken = ++categorySwitchToken;
    categoryTabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    serviceGrid.setAttribute('aria-labelledby', tab.id);
    if (moveFocus) tab.focus();
    serviceGrid.setAttribute('aria-busy', 'true');
    serviceGrid.classList.add('is-switching');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await new Promise(resolve => window.setTimeout(resolve, 140));
    }
    if (switchToken !== categorySwitchToken) return;
    await renderOffers(tab.dataset.category);
    if (switchToken !== categorySwitchToken) return;
    serviceGrid.classList.remove('is-switching');
    serviceGrid.removeAttribute('aria-busy');
  }
  categoryTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCategoryTab(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % categoryTabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + categoryTabs.length) % categoryTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = categoryTabs.length - 1;
      else return;
      event.preventDefault();
      selectCategoryTab(categoryTabs[nextIndex], true);
    });
  });
  document.getElementById('dialog-close').addEventListener('click', () => serviceCloseController.requestClose());
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    serviceCloseController.requestClose();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) serviceCloseController.requestClose(); });
  dialog.addEventListener('close', () => {
    lastServiceTrigger?.focus();
    scheduleLayoutCheck();
  });
  renderOffers('services');

  const gallery = document.getElementById('gallery-grid');
  const galleryFeatured = document.getElementById('gallery-featured');
  const galleryDialog = document.getElementById('tucontu-gallery-dialog');
  const galleryTitle = document.getElementById('tucontu-gallery-title');
  const galleryOpen = document.getElementById('tucontu-gallery-open');
  const manualOpen = document.getElementById('tucontu-manual-open');
  const galleryClose = document.getElementById('tucontu-gallery-close');
  const homePhoto = document.getElementById('tucontu-home-photo');
  const homePhotoCaption = document.getElementById('tucontu-home-caption');
  const galleryInlineViewport = matchMedia('(min-width: 0rem)');
  const gallerySelectionCount = document.getElementById('gallery-selection-count');
  const galleryModes = [...document.querySelectorAll('[data-gallery-mode]')];
  const galleryPanels = [...document.querySelectorAll('[data-gallery-panel]')];
  let historyWriteStarted = false;
  let galleryDialogIsModal = false;
  function writeHistoryOnce(){
    if(historyWriteStarted)return;
    historyWriteStarted=true;
    const lines=[...document.querySelectorAll('[data-write-once]')];
    lines.forEach((line,index)=>{
      const fullText=line.textContent.trim();
      line.removeAttribute('aria-label');
      const accessible=document.createElement('span');accessible.className='visually-hidden';accessible.textContent=fullText;
      const ink=document.createElement('span');ink.className='story-ink';ink.setAttribute('aria-hidden','true');
      line.replaceChildren(accessible,ink);
      line.style.setProperty('--reveal-order',String(index));
      ink.textContent=fullText;
      line.classList.add('is-revealing');
    });
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)lines.forEach(line=>line.classList.remove('is-revealing'));
  }
  const galleryPhotos = [
    { src: 'assets/tucontu/product/img-3332.webp', thumb: 'assets/tucontu/product/thumbs/img-3332-thumb.webp', aspect: '830 / 1744', alt: 'Marcela en su taller sosteniendo un TuconTu con colet negro y cordones artesanales.' },
    { src: 'assets/tucontu/product/tucontu-hanging-pieces.webp', thumb: 'assets/tucontu/product/thumbs/tucontu-hanging-pieces-thumb.webp', aspect: '682 / 1024', alt: 'Piezas TuconTu de diversos colores y trenzas colgando de un soporte rústico.' },
    { src: 'assets/tucontu/product/tucontu-rack-collection.webp', thumb: 'assets/tucontu/product/thumbs/tucontu-rack-collection-thumb.webp', aspect: '1024 / 934', alt: 'Colección de piezas TuconTu exhibidas en perchero artesanal de madera.' },
    { src: 'assets/tucontu/product/img-3343.webp', thumb: 'assets/tucontu/product/thumbs/img-3343-thumb.webp', aspect: '1373 / 1800', alt: 'TuconTu de cordones blancos y negros sobre cabello castaño.' },
    { src: 'assets/tucontu/product/img-3340.webp', thumb: 'assets/tucontu/product/thumbs/img-3340-thumb.webp', aspect: '1369 / 1800', alt: 'Una mujer coloca un TuconTu de cordones trenzados en su cabello.' },
    { src: 'assets/tucontu/product/img-3342.webp', thumb: 'assets/tucontu/product/thumbs/img-3342-thumb.webp', aspect: '1468 / 1800', alt: 'TuconTu de cordones verdes, crudos y terracota en una coleta.' },
    { src: 'assets/tucontu/product/img-3344.webp', thumb: 'assets/tucontu/product/thumbs/img-3344-thumb.webp', aspect: '1373 / 1800', alt: 'Una mujer lleva un TuconTu rojo y blanco en el cabello.' },
    { src: 'assets/tucontu/product/img-3345.webp', thumb: 'assets/tucontu/product/thumbs/img-3345-thumb.webp', aspect: '1346 / 1800', alt: 'Detalle de un TuconTu de colores cálidos junto al cabello.' },
    { src: 'assets/tucontu/product/img-3346.webp', thumb: 'assets/tucontu/product/thumbs/img-3346-thumb.webp', aspect: '1362 / 1800', alt: 'TuconTu de cordones rojos, verdes y crudos, visto de cerca.' },
    { src: 'assets/tucontu/product/img-3341.webp', thumb: 'assets/tucontu/product/thumbs/img-3341-thumb.webp', aspect: '1139 / 1800', alt: 'TuconTu azul y gris sujeto en un recogido.' },
    { src: 'assets/tucontu/product/img-3331.webp', thumb: 'assets/tucontu/product/thumbs/img-3331-thumb.webp', aspect: '854 / 1800', alt: 'Detalle cercano de un TuconTu de fibras crudas y terracota junto al cabello.' }
  ];
  galleryPhotos.forEach(p => {
    const preThumb = new Image();
    preThumb.src = p.thumb;
    const preImg = new Image();
    preImg.src = p.src;
    const preJpg = new Image();
    preJpg.src = p.src.replace(/\.webp$/i, '-display-940.jpg');
  });
  function selectGallery(index, updateHomePhoto = true) {
    const photo = galleryPhotos[index];
    if (!photo) return;
    if (galleryFeatured) { galleryFeatured.src = photo.src; galleryFeatured.alt = photo.alt; }
    if (updateHomePhoto && homePhoto) {
      const photoFrame = homePhoto.closest('.tucontu-piece-photo');
      if (photoFrame && photo.aspect) {
        photoFrame.style.setProperty('--cover-aspect', photo.aspect);
      }
      homePhoto.style.opacity = '0.3';
      setTimeout(() => {
        homePhoto.src = photo.src;
        homePhoto.srcset = `${photo.src.replace(/\.webp$/i, '-display-260.jpg')} 260w, ${photo.src.replace(/\.webp$/i, '-display-940.jpg')} 940w`;
        homePhoto.sizes = '(max-width: 47.5rem) 8.5rem, 29.5rem';
        homePhoto.alt = photo.alt;
        requestAnimationFrame(() => {
          homePhoto.style.opacity = '1';
        });
      }, 100);
    }
    if (updateHomePhoto && homePhotoCaption) homePhotoCaption.textContent = photo.alt;
    const order = index + 1;
    if (gallerySelectionCount) gallerySelectionCount.textContent = 'Fotografía ' + order + ' de ' + galleryPhotos.length;
    [...gallery.children].forEach(button => {
      const selected = Number(button.dataset.index) === index;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  galleryPhotos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = String(index);
    button.setAttribute('aria-label', 'Ver fotografía ' + (index + 1) + ' de ' + galleryPhotos.length);
    button.classList.toggle('is-selected', index === 0);
    button.setAttribute('aria-pressed', String(index === 0));
    const image = document.createElement('img');
    image.src = photo.thumb;
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';
    button.append(image);
    button.addEventListener('click', () => selectGallery(index));
    gallery.append(button);
  });
  function selectGalleryMode(mode, animateHistory = true) {
    const titles = { concepto: 'Concepto', manual: 'Concepto', historia: 'Historia', galeria: 'Galería', fotos: 'Galería', video: 'Video' };
    if (galleryTitle) galleryTitle.textContent = titles[mode] || 'TuconTu';
    const tucontuSection = document.getElementById('tucontu');
    if (tucontuSection) tucontuSection.dataset.activeMode = mode;
    const tabsContainer = document.querySelector('.tucontu-gallery-tabs');
    if (tabsContainer) tabsContainer.dataset.activeMode = mode;
    galleryModes.forEach(tab => {
      const active = tab.dataset.galleryMode === mode || (mode === 'galeria' && tab.dataset.galleryMode === 'fotos') || (mode === 'fotos' && tab.dataset.galleryMode === 'galeria') || (mode === 'concepto' && tab.dataset.galleryMode === 'manual') || (mode === 'manual' && tab.dataset.galleryMode === 'concepto');
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    galleryPanels.forEach(panel => {
      const active = panel.dataset.galleryPanel === mode || (mode === 'galeria' && panel.dataset.galleryPanel === 'fotos') || (mode === 'fotos' && panel.dataset.galleryPanel === 'galeria') || (mode === 'concepto' && panel.dataset.galleryPanel === 'manual') || (mode === 'manual' && panel.dataset.galleryPanel === 'concepto');
      panel.hidden = !active;
    });
    if (mode !== 'video') video.pause();
    else { video.poster = 'assets/tucontu/video-cover-marcela.webp'; video.preload = 'metadata'; video.load(); }
    if (mode === 'historia' && animateHistory) writeHistoryOnce();
  }
  function setGalleryPresentation() {
    const inline = galleryInlineViewport.matches;
    galleryDialog.dataset.presentation = inline ? 'inline' : 'dialog';
    galleryDialog.setAttribute('role', inline ? 'region' : 'dialog');
    galleryModes.forEach(tab => { tab.hidden = false; });
    const urlMode = new URLSearchParams(window.location.search).get('tucontuMode');
    const initialMode = urlMode || 'concepto';
    galleryPanels.forEach(panel => {
      const active = panel.dataset.galleryPanel === initialMode || (initialMode === 'galeria' && panel.dataset.galleryPanel === 'fotos') || (initialMode === 'concepto' && panel.dataset.galleryPanel === 'manual');
      panel.hidden = !active;
      panel.setAttribute('role', 'tabpanel');
      const tabId = panel.dataset.galleryPanel === 'concepto' || panel.dataset.galleryPanel === 'manual' ? 'concept'
        : panel.dataset.galleryPanel === 'historia' ? 'history'
        : 'photos';
      panel.setAttribute('aria-labelledby', `tucontu-${tabId}-tab`);
    });
    if (inline) {
      if (galleryDialogIsModal) {
        galleryDialog.close();
        galleryDialogIsModal = false;
      }
      if (!galleryDialog.open) galleryDialog.setAttribute('open', '');
      selectGallery(0);
      selectGalleryMode(initialMode, false);
      galleryOpen.removeAttribute('aria-haspopup');
      galleryOpen.setAttribute('aria-controls', 'tucontu-gallery-dialog');
    } else {
      if (galleryDialog.open && !galleryDialogIsModal) galleryDialog.close();
      selectGallery(0, false);
      selectGalleryMode(initialMode, false);
      galleryOpen.setAttribute('aria-haspopup', 'dialog');
      galleryOpen.setAttribute('aria-controls', 'tucontu-gallery-dialog');
    }
  }
  let gallerySwipeStart=null;
  galleryDialog.addEventListener('pointerdown',event=>{
    if(!galleryDialog.open||event.button!==0||event.target.closest('button,a,input,textarea,select,video,.gallery-grid'))return;
    gallerySwipeStart={id:event.pointerId,x:event.clientX,y:event.clientY};
  });
  galleryDialog.addEventListener('pointerup',event=>{
    if(!gallerySwipeStart||gallerySwipeStart.id!==event.pointerId){gallerySwipeStart=null;return;}
    const dx=event.clientX-gallerySwipeStart.x,dy=event.clientY-gallerySwipeStart.y;
    gallerySwipeStart=null;
    if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.25)return;
    const activeIndex=galleryModes.findIndex(tab=>tab.getAttribute('aria-selected')==='true');
    const nextIndex=(activeIndex+(dx<0?1:-1)+galleryModes.length)%galleryModes.length;
    galleryModes[nextIndex].focus({preventScroll:true});
    selectGalleryMode(galleryModes[nextIndex].dataset.galleryMode);
  });
  galleryDialog.addEventListener('pointercancel',()=>{gallerySwipeStart=null;});
  galleryModes.forEach((tab, index) => {
    tab.addEventListener('click', () => selectGalleryMode(tab.dataset.galleryMode));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % galleryModes.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + galleryModes.length) % galleryModes.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = galleryModes.length - 1;
      else return;
      event.preventDefault();
      galleryModes[next].focus();
      selectGalleryMode(galleryModes[next].dataset.galleryMode);
    });
  });
  galleryInlineViewport.addEventListener('change', setGalleryPresentation);
  setGalleryPresentation();
  galleryOpen.addEventListener('click', () => {
    if (galleryInlineViewport.matches) {
      galleryDialog.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    selectGalleryMode('concepto');
    galleryDialog.showModal();
    galleryDialogIsModal = true;
    document.getElementById('tucontu-concept-tab')?.focus({ preventScroll: true });
  });
  galleryClose.addEventListener('click', () => galleryDialog.close());
  galleryDialog.addEventListener('click', event => { if (event.target === galleryDialog) galleryDialog.close(); });
  galleryDialog.addEventListener('close', () => { galleryDialogIsModal = false; galleryOpen.focus({ preventScroll: true }); });

  // Lector paginado de Concepto
  let currentConceptIndex = 0;
  const conceptSlides = Array.from(document.querySelectorAll('.concept-slide'));
  const conceptTotal = conceptSlides.length;
  const conceptPageNumber = document.getElementById('concept-page-number');
  const conceptProgressMarker = document.getElementById('concept-reading-marker');
  const conceptStepperProgress = document.getElementById('concept-stepper-progress');
  const conceptStepperNodes = Array.from(document.querySelectorAll('.concept-stepper-node'));
  const conceptPrevBtn = document.getElementById('concept-prev-btn');
  const conceptNextBtn = document.getElementById('concept-next-btn');

  function showConceptSlide(index) {
    if (index < 0 || index >= conceptTotal) return;
    currentConceptIndex = index;
    conceptSlides.forEach((slide, i) => {
      slide.hidden = i !== index;
      slide.classList.toggle('is-active', i === index);
    });
    conceptStepperNodes.forEach((node, i) => {
      const active = i === index;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-selected', active ? 'true' : 'false');
      node.setAttribute('tabindex', active ? '0' : '-1');
    });
    if (conceptStepperProgress) {
      const pct = conceptTotal > 1 ? (index / (conceptTotal - 1)) * 100 : 0;
      conceptStepperProgress.style.setProperty('--concept-step-pct', `${pct}%`);
      conceptStepperProgress.style.width = `${pct}%`;
      conceptStepperProgress.style.height = `${pct}%`;
    }
    if (conceptPageNumber) {
      conceptPageNumber.textContent = `${String(index + 1).padStart(2, '0')} / ${String(conceptTotal).padStart(2, '0')}`;
    }
    if (conceptProgressMarker) {
      conceptProgressMarker.style.width = `${((index + 1) / conceptTotal) * 100}%`;
    }
    if (conceptPrevBtn) conceptPrevBtn.disabled = index === 0;
    if (conceptNextBtn) conceptNextBtn.disabled = index === conceptTotal - 1;
  }

  conceptStepperNodes.forEach(node => {
    node.addEventListener('click', () => {
      const step = parseInt(node.dataset.conceptStep, 10);
      if (!isNaN(step)) showConceptSlide(step);
    });
  });

  conceptPrevBtn?.addEventListener('click', () => showConceptSlide(currentConceptIndex - 1));
  conceptNextBtn?.addEventListener('click', () => showConceptSlide(currentConceptIndex + 1));

  const conceptReader = document.getElementById('concept-reader');
  conceptReader?.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      showConceptSlide(currentConceptIndex + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      showConceptSlide(currentConceptIndex - 1);
    }
  });

  const urlSlideParam = new URLSearchParams(window.location.search).get('conceptSlide');
  const initialSlide = urlSlideParam ? Math.max(0, Math.min(conceptTotal - 1, parseInt(urlSlideParam, 10) - 1)) : 0;
  if (conceptTotal > 0) {
    showConceptSlide(initialSlide);
  }

  const tucontuVideoDialog = document.getElementById('tucontu-video-dialog');
  const tucontuVideoTrigger = document.getElementById('tucontu-video-trigger');
  const tucontuVideoClose = document.getElementById('tucontu-video-close');
  if (tucontuVideoDialog && tucontuVideoTrigger) {
    tucontuVideoTrigger.addEventListener('click', () => {
      tucontuVideoDialog.showModal();
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
      tucontuVideoClose?.focus({ preventScroll: true });
    });
  }
  if (tucontuVideoDialog && tucontuVideoClose) {
    tucontuVideoClose.addEventListener('click', () => {
      if (video) video.pause();
      tucontuVideoDialog.close();
    });
  }
  if (tucontuVideoDialog) {
    tucontuVideoDialog.addEventListener('click', event => {
      if (event.target === tucontuVideoDialog) {
        if (video) video.pause();
        tucontuVideoDialog.close();
      }
    });
    tucontuVideoDialog.addEventListener('close', () => {
      if (video) video.pause();
      tucontuVideoTrigger?.focus({ preventScroll: true });
    });
  }

  const tucontuDossierDialog = document.getElementById('tucontu-dossier-dialog');
  const tucontuDossierTrigger = document.getElementById('tucontu-dossier-open-btn');
  const tucontuDossierClose = document.getElementById('tucontu-dossier-close');
  const tucontuDossierIframe = document.getElementById('tucontu-dossier-iframe');
  if (tucontuDossierDialog && tucontuDossierTrigger) {
    tucontuDossierTrigger.addEventListener('click', () => {
      if (tucontuDossierIframe && !tucontuDossierIframe.src && tucontuDossierIframe.dataset.src) {
        tucontuDossierIframe.src = tucontuDossierIframe.dataset.src;
      }
      tucontuDossierDialog.showModal();
      tucontuDossierClose?.focus({ preventScroll: true });
    });
  }
  if (tucontuDossierDialog && tucontuDossierClose) {
    tucontuDossierClose.addEventListener('click', () => {
      tucontuDossierDialog.close();
      tucontuDossierTrigger?.focus({ preventScroll: true });
    });
  }
  if (tucontuDossierDialog) {
    tucontuDossierDialog.addEventListener('click', event => {
      if (event.target === tucontuDossierDialog) {
        tucontuDossierDialog.close();
        tucontuDossierTrigger?.focus({ preventScroll: true });
      }
    });
    tucontuDossierDialog.addEventListener('cancel', () => {
      tucontuDossierTrigger?.focus({ preventScroll: true });
    });
  }

  function installLayoutCollisionChecker() {
    const badge = document.getElementById('layout-collision-status');
    const audit = document.getElementById('layout-audit');
    const detailList = document.getElementById('layout-collision-details');
    if (!badge) return;
    badge.dataset.state = 'checking';
    badge.textContent = 'Checking layout…';
    audit.hidden = false;
    const blockSelector = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'button', 'a', 'summary', 'label', 'legend',
      'li', 'dt', 'dd', 'td', 'th', 'figcaption', 'output', '[role="tab"]', '[role="button"]', '[role="link"]',
      '.eyebrow', '.visual-quote', '.home-note', '.service-card-name',
      '.story-page', '.ritual', '.image-label', '.page-count', '.gallery-intro', '.video-intro',
      '.dialog-meta span', '.brand strong', '.brand small', '.main-nav a', '.nav-modal-trigger',
      '.journey-position', '.journey-position > span', '.journey-controls button', '.footer-motto'
    ].join(',');
    const ignored = '.layout-audit, .dialog-close, .visual-mark, [aria-hidden="true"]';
    const viewportRect = () => ({ left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight });
    const intersection = (a, b) => {
      if (!a || !b) return null;
      const rect = { left: Math.max(a.left, b.left), top: Math.max(a.top, b.top), right: Math.min(a.right, b.right), bottom: Math.min(a.bottom, b.bottom) };
      return rect.right > rect.left && rect.bottom > rect.top ? rect : null;
    };
    const textBlockSelector = blockSelector;
    const isVisible = node => {
      const element = node.parentElement;
      if (!element || !node.nodeValue.trim() || element.closest(ignored)) return false;
      for (let parent = element; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse' || Number(style.opacity) === 0) return false;
      }
      return true;
    };
    const clipRectFor = (node, baseClip) => {
      let clip = baseClip;
      for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        const clipX = style.overflowX !== 'visible';
        const clipY = style.overflowY !== 'visible';
        if (!clipX && !clipY) continue;
        const box = parent.getBoundingClientRect();
        clip = {
          left: clipX ? Math.max(clip.left, box.left) : clip.left,
          right: clipX ? Math.min(clip.right, box.right) : clip.right,
          top: clipY ? Math.max(clip.top, box.top) : clip.top,
          bottom: clipY ? Math.min(clip.bottom, box.bottom) : clip.bottom
        };
        if (clip.right <= clip.left || clip.bottom <= clip.top) return null;
      }
      return clip;
    };
    const labelFor = block => {
      const text = (block.getAttribute('aria-label') || block.textContent || block.id || block.tagName).replace(/\s+/g, ' ').trim().slice(0, 44);
      const region = block.closest('dialog[open]') || block.closest('#inicio, #acompanamientos, #tucontu') || block.closest('header, footer');
      const name = region?.id === 'inicio' ? 'El camino' : region?.id === 'acompanamientos' ? 'Acompañamientos'
        : region?.id === 'tucontu' ? 'TuconTu' : region?.tagName === 'HEADER' ? 'Encabezado'
          : region?.tagName === 'FOOTER' ? 'Pie' : region?.id === 'about-dialog' ? 'Quién soy'
            : region?.id === 'service-dialog' ? 'Detalles' : 'Vista';
      return `${name}: “${text}”`;
    };
    const blocksIn = (root, baseClip) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const grouped = new Map();
      let node;
      while ((node = walker.nextNode())) {
        if (!isVisible(node)) continue;
        const clip = clipRectFor(node, baseClip);
        if (!clip) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const style = getComputedStyle(node.parentElement);
        const fontSize = Number.parseFloat(style.fontSize) || 16;
        const rangeRects = [...range.getClientRects()];
        const rects = rangeRects.map(rect => {
          const clipped = intersection(textInkRect(rect, fontSize, node.nodeValue, style), clip);
          return clipped && { rect: clipped, fontSize };
        }).filter(Boolean);
        if (!rects.length) continue;
        const block = node.parentElement.closest(textBlockSelector) || node.parentElement;
        if (block.closest(ignored)) continue;
        const item = grouped.get(block) || { label: labelFor(block), rects: [] };
        item.rects.push(...rects);
        grouped.set(block, item);
      }
      return [...grouped.values()];
    };
    const measure = () => {
      const screen = viewportRect();
      const openDialogs = [...document.querySelectorAll('dialog[open]')];
      const roots = openDialogs.length
        ? openDialogs.map(dialog => ({ element: dialog, clip: intersection(dialog.getBoundingClientRect(), screen) })).filter(item => item.clip)
        : [{ element: document.body, clip: screen }];
      const blocks = roots.flatMap(root => blocksIn(root.element, root.clip));
      const collisions = [];
      for (let left = 0; left < blocks.length; left++) {
        for (let right = left + 1; right < blocks.length; right++) {
          if (blocks[left].rects.some(a => blocks[right].rects.some(b => textRectsOverlap(a.rect, b.rect, a.fontSize, b.fontSize)))) {
            collisions.push(`${blocks[left].label} ↔ ${blocks[right].label}`);
          }
        }
      }
      return { collisions, count: blocks.length };
    };
    const metrics = count => {
      const mode = window.matchMedia('(max-width: 47.5rem)').matches ? 'móvil'
        : window.matchMedia('(max-width: 68.75rem)').matches ? 'tableta' : 'escritorio';
      const title = document.querySelector('#inicio h1');
      const frame = document.querySelector('#inicio .arch-frame');
      const titleSize = Number.parseFloat(getComputedStyle(title).fontSize);
      const box = frame.getBoundingClientRect();
      return `Vista ${mode} · ventana ${window.innerWidth} × ${window.innerHeight} CSS px · título ${titleSize} CSS px · arco ${Math.round(box.width)} × ${Math.round(box.height)} CSS px · ${count} bloques de texto`;
    };
    let fontsReady = !document.fonts;
    let pending = false;
    scheduleLayoutCheck = () => {
      badge.dataset.state = 'checking';
      badge.textContent = 'Checking layout…';
      badge.title = '';
      badge.setAttribute('aria-label', 'Checking layout');
      if (!fontsReady || pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const result = measure();
        const detail = metrics(result.count);
        badge.title = detail;
        detailList.replaceChildren();
        if (!result.count) {
          badge.dataset.state = 'fail';
          badge.textContent = 'Layout FAIL · No visible text could be measured';
        } else if (result.collisions.length) {
          badge.dataset.state = 'fail';
          badge.textContent = `Layout FAIL · ${result.collisions.length} overlaps`;
          result.collisions.forEach(collision => {
            const item = document.createElement('li');
            item.textContent = collision;
            detailList.append(item);
          });
        } else {
          badge.dataset.state = 'pass';
          badge.textContent = 'Layout PASS';
        }
        badge.setAttribute('aria-label', `${badge.textContent}. ${detail}`);
      });
    };
    if (document.fonts) {
      document.fonts.ready.then(() => { fontsReady = true; scheduleLayoutCheck(); }, () => { fontsReady = true; scheduleLayoutCheck(); });
      document.fonts.addEventListener?.('loadingdone', scheduleLayoutCheck);
    }
    window.addEventListener('resize', scheduleLayoutCheck, { passive: true });
    window.visualViewport?.addEventListener('resize', scheduleLayoutCheck, { passive: true });
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(scheduleLayoutCheck);
      resizeObserver.observe(stage);
      sections.forEach(section => resizeObserver.observe(section));
    }
    const mutationObserver = new MutationObserver(records => {
      if (records.some(record => !record.target.parentElement?.closest(ignored) && !record.target.closest?.(ignored))) scheduleLayoutCheck();
    });
    mutationObserver.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden', 'style', 'open'] });
    scheduleLayoutCheck();
  }

  aboutDialog.addEventListener('close', () => {
    if (aboutTrigger?.isConnected) aboutTrigger.focus();
    aboutTrigger = null;
    scheduleLayoutCheck();
  });

  function initPreviewMode() {
    document.body.classList.add('editorial-preview');
    document.getElementById('layout-collision-status').hidden = false;
    installLayoutCollisionChecker();
  }
  initPreviewMode();
})();
