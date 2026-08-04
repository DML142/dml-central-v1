(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const liveRegion = document.querySelector('[data-live-region]');

  const announce = (message) => {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  };

  /* ======================================================================
     Locale (tech.md 19)
     ====================================================================== */

  const LOCALES = ['en', 'uk', 'ru'];
  const FALLBACK_LOCALE = 'en';
  const STORAGE_KEY = 'dml-locale';
  const dictionaries = window.DICTIONARIES;

  const readStoredLocale = () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return LOCALES.includes(stored) ? stored : FALLBACK_LOCALE;
    } catch {
      return FALLBACK_LOCALE;
    }
  };

  let locale = readStoredLocale();

  const t = (key, vars) => {
    const value = dictionaries[locale][key] ?? dictionaries[FALLBACK_LOCALE][key] ?? key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
  };

  const applyTranslations = (root = document) => {
    root.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    root.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
      node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel));
    });
  };

  /* ======================================================================
     Constellation — static stand-in for the WebGL field (tech.md 5.5).
     Seeded so the layout is identical on every load and reviewable in a diff.
     ====================================================================== */

  const createRandom = (seed) => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const renderConstellation = (host) => {
    const WIDTH = 1200;
    const HEIGHT = 800;
    const COUNT = 150;
    const MAX_DISTANCE = 132;

    const random = createRandom(20260804);
    const points = Array.from({ length: COUNT }, () => {
      const depth = random();
      return {
        x: random() * WIDTH,
        y: random() * HEIGHT,
        depth,
      };
    });

    const lines = [];
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const a = points[i];
        const b = points[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance > MAX_DISTANCE) continue;
        const alpha = (1 - distance / MAX_DISTANCE) * 0.28 * (1 - (a.depth + b.depth) / 2.6);
        lines.push(
          `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="#B388FF" stroke-opacity="${alpha.toFixed(3)}" stroke-width="0.6" />`,
        );
      }
    }

    const dots = points
      .map((point) => {
        const radius = 0.9 + point.depth * 2.4;
        const opacity = 0.85 - point.depth * 0.6;
        return `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${radius.toFixed(2)}" fill="#B388FF" fill-opacity="${opacity.toFixed(3)}" />`;
      })
      .join('');

    host.innerHTML = `<svg viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" focusable="false"><g>${lines.join('')}</g><g>${dots}</g></svg>`;
  };

  const constellationHost = document.querySelector('[data-constellation]');
  if (constellationHost) renderConstellation(constellationHost);

  /* ======================================================================
     Modal plumbing — fade, focus trap, scroll lock, focus restore
     ====================================================================== */

  const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let activeModal = null;
  let lastFocused = null;
  let scrollY = 0;

  const exitDuration = () => (prefersReducedMotion.matches ? 0 : 320);

  const focusableIn = (root) =>
    Array.from(root.querySelectorAll(FOCUSABLE)).filter(
      (element) =>
        element.tabIndex >= 0 &&
        (element.offsetParent !== null || element === document.activeElement),
    );

  const lockScroll = () => {
    scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('is-scroll-locked');
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  };

  const unlockScroll = () => {
    document.body.classList.remove('is-scroll-locked');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
  };

  const exitTimers = new WeakMap();

  const openModal = (modal, trigger) => {
    if (activeModal) closeModal();
    lastFocused = trigger || document.activeElement;
    window.clearTimeout(exitTimers.get(modal));
    modal.hidden = false;
    modal.dataset.visible = 'true';
    // Force a reflow so the browser has a rendered 0-opacity frame to transition from.
    void modal.offsetWidth;
    modal.dataset.open = 'true';
    activeModal = modal;
    lockScroll();
    const [first] = focusableIn(modal);
    if (first) first.focus();
  };

  const closeModal = () => {
    if (!activeModal) return;
    const modal = activeModal;
    modal.dataset.open = 'false';
    activeModal = null;
    unlockScroll();
    // Focus goes back immediately; the keyboard never waits on the fade (tech.md 9.3).
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    lastFocused = null;
    exitTimers.set(
      modal,
      window.setTimeout(() => {
        if (modal.dataset.open === 'true') return;
        modal.dataset.visible = 'false';
        modal.hidden = true;
      }, exitDuration()),
    );
  };

  document.addEventListener('click', (event) => {
    if (!activeModal) return;
    if (event.target.closest('[data-close-modal]')) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (!activeModal) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = focusableIn(activeModal);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ======================================================================
     Stack accordion
     ====================================================================== */

  const setPanel = (trigger, open) => {
    const region = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', String(open));
    if (region) region.dataset.open = String(open);
  };

  const stackTriggers = Array.from(document.querySelectorAll('.stack-trigger'));

  stackTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      setPanel(trigger, trigger.getAttribute('aria-expanded') !== 'true');
    });
  });

  const applyDefaultPanels = () => {
    if (window.location.hash) return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    stackTriggers.forEach((trigger, index) => setPanel(trigger, isDesktop && index === 0));
  };

  const openPanelFromHash = () => {
    const hash = window.location.hash;
    if (!hash) return false;
    const panel = document.querySelector(`${hash}.stack-panel`);
    if (!panel) return false;
    const trigger = panel.querySelector('.stack-trigger');
    if (!trigger) return false;
    setPanel(trigger, true);
    panel.scrollIntoView({
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    });
    return true;
  };

  /* ======================================================================
     Gallery
     ====================================================================== */

  const PROJECT_TITLES = {
    'saas-ai-fullstack-portfolio': 'SaaS AI Fullstack Portfolio',
    'dmls-solutions': 'DMLs Solutions',
  };

  // Slide order is the trailing number in each file name (tech.md 6.2).
  const GALLERIES = {
    'saas-ai-fullstack-portfolio': [
      'hero1.png',
      'about2.png',
      'features3.png',
      'reviews4.png',
      'qna5.png',
      'pricing6.png',
      'dashboard7.jpg',
      'settings8.jpg',
      'settings2_9.jpg',
      'rename10.jpg',
      'avatar11.jpg',
      'admin12.jpg',
      'import_export13.jpg',
    ].map((file, index) => ({ src: `gallery/saas/${file}`, altKey: `alt.saas.${index + 1}` })),
    'dmls-solutions': [
      'hero1.png',
      'about2.png',
      'next3.png',
      'threejs4.png',
      'black5.png',
    ].map((file, index) => ({
      src: `gallery/dmls-solutions/${file}`,
      altKey: `alt.dmls.${index + 1}`,
    })),
  };

  const galleryModal = document.getElementById('gallery-modal');
  const galleryStage = galleryModal.querySelector('[data-gallery-stage]');
  const galleryThumbs = galleryModal.querySelector('[data-gallery-thumbs]');
  const galleryCounter = galleryModal.querySelector('[data-gallery-counter]');
  const galleryTitle = galleryModal.querySelector('[data-gallery-title]');

  let slides = [];
  let thumbs = [];
  let activeSlide = 0;
  let activeProjectId = null;

  const labelGallery = () => {
    if (!activeProjectId) return;
    const title = PROJECT_TITLES[activeProjectId] || activeProjectId;
    galleryTitle.textContent = t('gallery.title', { project: title });
    slides.forEach((slide) => {
      slide.alt = t(slide.dataset.altKey);
    });
    thumbs.forEach((thumb, index) => {
      thumb.setAttribute('aria-label', t('gallery.thumb', { n: index + 1 }));
    });
  };

  // Only the active slide and its neighbours are fetched, so opening a 13-image
  // gallery does not pull every file at once (tech.md 6.4).
  const ensureLoaded = (index) => {
    const slide = slides[((index % slides.length) + slides.length) % slides.length];
    if (slide && !slide.src) slide.src = slide.dataset.src;
  };

  const renderSlide = (index) => {
    activeSlide = ((index % slides.length) + slides.length) % slides.length;

    [activeSlide - 1, activeSlide, activeSlide + 1].forEach(ensureLoaded);

    slides.forEach((slide, i) => {
      slide.dataset.active = String(i === activeSlide);
    });

    thumbs.forEach((thumb, i) => {
      const current = i === activeSlide;
      thumb.setAttribute('aria-current', String(current));
      thumb.setAttribute('tabindex', current ? '0' : '-1');
      if (current) {
        thumb.scrollIntoView({
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }
    });

    const position = `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    galleryCounter.textContent = position;
    announce(t('gallery.announce', { n: position }));
  };

  const buildGallery = (projectId) => {
    activeProjectId = projectId;
    const entries = GALLERIES[projectId] || [];

    galleryStage.querySelectorAll('.gallery-slide').forEach((node) => node.remove());
    galleryThumbs.innerHTML = '';

    slides = entries.map((entry) => {
      const image = document.createElement('img');
      image.className = 'gallery-slide';
      image.decoding = 'async';
      image.dataset.src = entry.src;
      image.dataset.altKey = entry.altKey;
      galleryStage.append(image);
      return image;
    });

    thumbs = entries.map((entry, index) => {
      const thumb = document.createElement('button');
      thumb.className = 'gallery-thumb';
      thumb.type = 'button';
      const preview = document.createElement('img');
      preview.src = entry.src;
      preview.loading = 'lazy';
      preview.decoding = 'async';
      preview.alt = '';
      thumb.append(preview);
      thumb.addEventListener('click', () => renderSlide(index));
      galleryThumbs.append(thumb);
      return thumb;
    });

    labelGallery();
    renderSlide(0);
  };

  document.querySelectorAll('[data-open-gallery]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      buildGallery(trigger.dataset.openGallery);
      openModal(galleryModal, trigger);
    });
  });

  galleryModal.querySelector('[data-gallery-prev]').addEventListener('click', () => {
    renderSlide(activeSlide - 1);
  });

  galleryModal.querySelector('[data-gallery-next]').addEventListener('click', () => {
    renderSlide(activeSlide + 1);
  });

  document.addEventListener('keydown', (event) => {
    if (activeModal !== galleryModal) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      renderSlide(activeSlide - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      renderSlide(activeSlide + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      renderSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      renderSlide(slides.length - 1);
    }
  });

  let swipeStart = null;

  galleryStage.addEventListener('pointerdown', (event) => {
    swipeStart = { x: event.clientX, y: event.clientY };
  });

  galleryStage.addEventListener('pointerup', (event) => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    // Vertical swipes are ignored so a scroll gesture never changes the slide.
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
    renderSlide(dx < 0 ? activeSlide + 1 : activeSlide - 1);
  });

  galleryStage.addEventListener('pointercancel', () => {
    swipeStart = null;
  });

  /* ======================================================================
     Contact form
     ====================================================================== */

  const MESSAGE_LIMIT = 2000;
  const COUNTER_THRESHOLD = MESSAGE_LIMIT * 0.8;
  const MIN_FILL_TIME_MS = 2000;
  const TELEGRAM_PATTERN = /^@?[a-zA-Z0-9_]{4,32}$/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const contactModal = document.getElementById('contact-modal');
  const form = contactModal.querySelector('[data-contact-form]');
  const successPanel = contactModal.querySelector('[data-form-success]');
  const banner = contactModal.querySelector('[data-form-banner]');
  const submitButton = contactModal.querySelector('[data-submit]');
  const submitLabel = contactModal.querySelector('[data-submit-label]');
  const counter = contactModal.querySelector('[data-counter]');
  const messageField = form.elements.message;

  let startedAt = 0;
  let isPending = false;
  const touched = new Set();

  // Validators return a translation key, so a locale switch re-renders live errors.
  const validators = {
    name: (value) => {
      if (value.length === 0) return 'err.nameRequired';
      if (value.length < 2) return 'err.nameShort';
      if (value.length > 64) return 'err.nameLong';
      return '';
    },
    email: (value) => {
      if (value.length === 0) return 'err.emailRequired';
      if (value.length > 254) return 'err.emailLong';
      if (!EMAIL_PATTERN.test(value)) return 'err.emailInvalid';
      return '';
    },
    telegram: (value) => {
      if (value.length === 0) return '';
      if (!TELEGRAM_PATTERN.test(value)) return 'err.telegramInvalid';
      return '';
    },
    message: (value) => {
      if (value.length === 0) return 'err.messageRequired';
      if (value.length < 10) return 'err.messageShort';
      if (value.length > MESSAGE_LIMIT) return 'err.messageLong';
      return '';
    },
  };

  const showError = (name, key) => {
    const field = form.elements[name];
    const output = form.querySelector(`[data-error-for="${name}"]`);
    output.dataset.errorKey = key;
    output.textContent = key ? t(key, { n: MESSAGE_LIMIT }) : '';
    field.setAttribute('aria-invalid', String(Boolean(key)));
  };

  const validateField = (name) => {
    const key = validators[name](form.elements[name].value.trim());
    showError(name, key);
    return key === '';
  };

  const validateAll = () =>
    Object.keys(validators).reduce((valid, name) => {
      touched.add(name);
      return validateField(name) && valid;
    }, true);

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];

    field.addEventListener('blur', () => {
      touched.add(name);
      validateField(name);
    });

    field.addEventListener('input', () => {
      if (touched.has(name)) validateField(name);
    });
  });

  messageField.addEventListener('input', () => {
    const { length } = messageField.value;
    counter.hidden = length < COUNTER_THRESHOLD;
    counter.textContent = `${length} / ${MESSAGE_LIMIT}`;
    counter.dataset.warn = String(length > MESSAGE_LIMIT);
  });

  const resetForm = () => {
    form.reset();
    touched.clear();
    Object.keys(validators).forEach((name) => showError(name, ''));
    banner.hidden = true;
    delete banner.dataset.errorKey;
    counter.hidden = true;
    startedAt = Date.now();
  };

  const setPending = (pending) => {
    isPending = pending;
    submitButton.disabled = pending;
    submitLabel.textContent = t(pending ? 'form.sending' : 'form.submit');
  };

  const failWith = (key) => {
    banner.dataset.errorKey = key;
    banner.textContent = t(key);
    banner.hidden = false;
    announce(t(key));
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    banner.hidden = true;

    if (!validateAll()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      announce(t('err.announce'));
      return;
    }

    if (form.elements.company.value !== '' || Date.now() - startedAt < MIN_FILL_TIME_MS) {
      failWith('err.banner');
      return;
    }

    setPending(true);

    // Prototype stub — the real POST /api/contact arrives with phase 7 (tech.md 7.2).
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    setPending(false);
    form.hidden = true;
    successPanel.hidden = false;
    announce(t('form.successTitle'));
    successPanel.querySelector('[data-send-another]').focus();
  });

  contactModal.querySelector('[data-send-another]').addEventListener('click', () => {
    successPanel.hidden = true;
    form.hidden = false;
    resetForm();
    form.elements.name.focus();
  });

  document.querySelectorAll('[data-open-contact]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      successPanel.hidden = true;
      form.hidden = false;
      resetForm();
      openModal(contactModal, trigger);
    });
  });

  /* ======================================================================
     Locale switching — applied last, so every dynamic label exists by now
     ====================================================================== */

  const localeButtons = Array.from(document.querySelectorAll('[data-locale]'));

  const setLocale = (next, persist = true) => {
    locale = LOCALES.includes(next) ? next : FALLBACK_LOCALE;

    document.documentElement.lang = t('html.lang');
    localeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.locale === locale));
    });

    applyTranslations();

    // Re-render anything whose text is built in JS rather than read from the DOM.
    form.querySelectorAll('[data-error-for]').forEach((output) => {
      const key = output.dataset.errorKey;
      output.textContent = key ? t(key, { n: MESSAGE_LIMIT }) : '';
    });
    if (banner.dataset.errorKey) banner.textContent = t(banner.dataset.errorKey);
    if (isPending) submitLabel.textContent = t('form.sending');
    if (slides.length > 0) labelGallery();

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, locale);
      } catch {
        /* private mode — the switch still works for this session */
      }
    }
  };

  localeButtons.forEach((button) => {
    button.addEventListener('click', () => setLocale(button.dataset.locale));
  });

  setLocale(locale, false);

  if (!openPanelFromHash()) applyDefaultPanels();
  window.addEventListener('hashchange', openPanelFromHash);
})();
