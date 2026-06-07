/*
  WS Attributes — Slider
  Requires GSAP + Draggable loaded before this script.
  InertiaPlugin strongly recommended for throw feel.

  Attribute API
  ─────────────────────────────────────────────────────────────────────────────
  data-ws-element="slider"               Root wrapper
  data-ws-element="track"                Moving track containing slides
  data-ws-element="slide"                Individual slide item
  data-ws-element="prev"                 Previous button
  data-ws-element="next"                 Next button
  data-ws-element="dots"                 Pagination dot container (auto-populated)
  data-ws-element="current"              Current slide number output
  data-ws-element="total"                Total slide count output

  Config attributes on the root element
  ─────────────────────────────────────────────────────────────────────────────
  data-ws-draggable="true"               Enable drag + inertia (default: false)
  data-ws-autoplay="true"                Enable autoplay (default: false)
  data-ws-autoplay-delay="4000"          Autoplay delay in ms (default: 4000)
  data-ws-center="true"                  Center active slide in wrapper (default: true)
  data-ws-active-class="is-active-slide" Class applied to active slide and dot
  data-ws-breakpoint="768"               Disable slider below this px width (default: 0 = always on)
  data-ws-edge-resistance="0.5"          Drag resistance past first/last slide 0–1 (default: 0.5)
  data-ws-throw-resistance="2500"        Higher = shorter throw distance (default: 2500)

  Loop support
  ─────────────────────────────────────────────────────────────────────────────
  data-ws-loop="true" is reserved for a future clone-and-teleport
  infinite loop layer. The attribute is read but does nothing yet.
  Non-looping physical drag is the current stable engine.
*/

// ─────────────────────────────────────────────────────────────────────────────
// Register GSAP plugins
// ─────────────────────────────────────────────────────────────────────────────
if (typeof gsap === 'undefined') {
  console.error('[WS Slider] GSAP is required. Load it before slider.js.');
}
if (typeof Draggable !== 'undefined') gsap.registerPlugin(Draggable);
if (typeof InertiaPlugin !== 'undefined') gsap.registerPlugin(InertiaPlugin);

// ─────────────────────────────────────────────────────────────────────────────
// Inject base CSS
// ─────────────────────────────────────────────────────────────────────────────
(function injectStyles() {
  const id = 'ws-slider-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = [
    '[data-ws-element="slider"] { overflow: hidden; position: relative; user-select: none; }',
    '[data-ws-element="track"] { display: flex; will-change: transform; cursor: grab; }',
    '[data-ws-element="track"].is-dragging { cursor: grabbing; }',
    '[data-ws-element="slide"] { flex-shrink: 0; }',
  ].join(' ');
  document.head.appendChild(style);
})();

// ─────────────────────────────────────────────────────────────────────────────
// WSSlider
// ─────────────────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  class WSSlider {
    constructor(root) {
      this.root     = root;
      this.track    = root.querySelector('[data-ws-element="track"]');
      this.slides   = [...root.querySelectorAll('[data-ws-element="slide"]')];
      this.prevBtn  = root.querySelector('[data-ws-element="prev"]');
      this.nextBtn  = root.querySelector('[data-ws-element="next"]');
      this.dotsWrap = root.querySelector('[data-ws-element="dots"]');
      this.currentEl = root.querySelector('[data-ws-element="current"]');
      this.totalEl   = root.querySelector('[data-ws-element="total"]');

      this.config = {
        draggable:       root.dataset.wsDraggable === 'true',
        autoplay:        root.dataset.wsAutoplay === 'true',
        autoplayDelay:   parseInt(root.dataset.wsAutoplayDelay  || 4000, 10),
        center:          root.dataset.wsCenter !== 'false',
        activeClass:     root.dataset.wsActiveClass || 'is-active-slide',
        breakpoint:      parseInt(root.dataset.wsBreakpoint     || 0, 10),
        edgeResistance:  parseFloat(root.dataset.wsEdgeResistance || 0.5),
        throwResistance: parseFloat(root.dataset.wsThrowResistance || 2500),
        // reserved — clone-and-teleport engine coming later
        loop:            root.dataset.wsLoop === 'true',
      };

      this.index        = 0;
      this.snapX        = [];
      this.minX         = 0;
      this.maxX         = 0;
      this.drag         = null;
      this.dots         = [];
      this.autoplayTimer = null;
      this.isActive     = false;
      this.resizeObserver = null;

      this._init();
    }

    // ── Bootstrap ────────────────────────────────────────────────────────────

    _init() {
      if (!this.slides.length || !this.track) return;
      if (this.root.dataset.wsInit) return;
      this.root.dataset.wsInit = 'true';

      if (this.totalEl) this.totalEl.textContent = this.slides.length;

      this._buildDots();
      this._bindControls();
      this._apply();

      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => {
          this._apply();
          if (this.isActive) this._goTo(this.index, { duration: 0 });
        }, 150);
      });
      this.resizeObserver.observe(this.root);
    }

    // ── Apply / Destroy ───────────────────────────────────────────────────────

    _apply() {
      if (this.config.breakpoint && window.innerWidth < this.config.breakpoint) {
        this._destroy();
        return;
      }

      this.isActive = true;

      // Show controls that may have been hidden
      [this.prevBtn, this.nextBtn, this.dotsWrap].forEach(el => {
        if (el) el.style.display = '';
      });

      this._recalc();

      if (this.config.draggable) this._initDrag();
      if (this.config.autoplay)  this._startAutoplay();
    }

    _destroy() {
      if (!this.isActive) return;
      this.isActive = false;

      this._stopAutoplay();

      if (this.drag) {
        this.drag.kill();
        this.drag = null;
      }

      gsap.set(this.track, { x: 0, clearProps: 'x' });

      [this.prevBtn, this.nextBtn, this.dotsWrap].forEach(el => {
        if (el) el.style.display = 'none';
      });
    }

    // ── Calculations ─────────────────────────────────────────────────────────

    _recalc() {
      const wrapWidth  = this.root.clientWidth;
      const trackWidth = this.track.scrollWidth;

      this.maxX = 0;
      this.minX = Math.min(0, wrapWidth - trackWidth);

      this.snapX = this.slides.map(slide => {
        if (this.config.center) {
          const center = slide.offsetLeft + slide.offsetWidth / 2;
          return this._clamp(-(center - wrapWidth / 2));
        }
        return this._clamp(-slide.offsetLeft);
      });
    }

    _clamp(x) {
      return gsap.utils.clamp(this.minX, this.maxX, x);
    }

    _closestIndex(x) {
      let best = 0;
      let bestDist = Infinity;
      this.snapX.forEach((snap, i) => {
        const d = Math.abs(snap - x);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    // ── Navigation ───────────────────────────────────────────────────────────

    _goTo(i, vars) {
      if (!this.isActive || !this.snapX.length) return;

      this.index = Math.max(0, Math.min(this.snapX.length - 1, i));

      gsap.to(this.track, Object.assign({
        x: this.snapX[this.index],
        duration: 0.85,
        ease: 'power3.out',
        overwrite: 'auto',
        onUpdate: () => { if (this.drag) this.drag.update(); },
        onComplete: () => this._updateActive(this.index),
      }, vars || {}));

      this._updateActive(this.index);
    }

    // ── Drag ─────────────────────────────────────────────────────────────────

    _initDrag() {
      if (typeof Draggable === 'undefined') {
        console.warn('[WS Slider] Draggable plugin not found. Load it from https://gsap.com/docs/v3/Plugins/Draggable/');
        return;
      }

      if (this.drag) this.drag.kill();

      this.drag = Draggable.create(this.track, {
        type:                    'x',
        inertia:                 true,
        edgeResistance:          this.config.edgeResistance,
        throwResistance:         this.config.throwResistance,
        dragResistance:          0.01,
        overshootTolerance:      0.5,
        allowNativeTouchScrolling: true,
        bounds: { minX: this.minX, maxX: this.maxX },
        onPress: () => {
          this._stopAutoplay();
          gsap.killTweensOf(this.track);
          this.track.classList.add('is-dragging');
        },
        onDrag: () => {
          const i = this._closestIndex(gsap.getProperty(this.track, 'x'));
          if (i !== this.index) this._updateActive(i);
        },
        onThrowUpdate: () => {
          const i = this._closestIndex(gsap.getProperty(this.track, 'x'));
          if (i !== this.index) this._updateActive(i);
        },
        onRelease: () => {
          this.track.classList.remove('is-dragging');
        },
        onThrowComplete: () => {
          this.index = this._closestIndex(gsap.getProperty(this.track, 'x'));
          this._updateActive(this.index);
        },
        snap: value => {
          const i = this._closestIndex(value);
          return this.snapX[i];
        },
      })[0];
    }

    // ── Active state ─────────────────────────────────────────────────────────

    _updateActive(index) {
      this.index = index;

      this.slides.forEach((slide, i) => {
        slide.classList.toggle(this.config.activeClass, i === index);
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });

      if (this.currentEl) this.currentEl.textContent = index + 1;

      this._updateDots(index);
    }

    // ── Dots ─────────────────────────────────────────────────────────────────

    _buildDots() {
      if (!this.dotsWrap) return;
      this.dotsWrap.innerHTML = '';
      this.slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        btn.addEventListener('click', () => {
          this._stopAutoplay();
          this._goTo(i);
        });
        this.dotsWrap.appendChild(btn);
      });
      this.dots = [...this.dotsWrap.querySelectorAll('button')];
    }

    _updateDots(index) {
      if (!this.dotsWrap || !this.dots.length) return;

      this.dots.forEach((dot, i) => {
        dot.classList.toggle(this.config.activeClass, i === index);
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
      });

      // Scroll pagination into view if it overflows
      const activeDot = this.dots[index];
      if (!activeDot) return;
      const wrapWidth  = this.dotsWrap.clientWidth;
      const innerWidth = this.dotsWrap.scrollWidth;
      if (innerWidth <= wrapWidth) return;
      const target   = -(activeDot.offsetLeft - wrapWidth / 2 + activeDot.offsetWidth / 2);
      const minPag   = Math.min(0, wrapWidth - innerWidth);
      const clampedX = gsap.utils.clamp(minPag, 0, target);
      gsap.to(this.dots, { x: clampedX, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    }

    // ── Controls ─────────────────────────────────────────────────────────────

    _bindControls() {
      this.nextBtn?.addEventListener('click', () => {
        this._stopAutoplay();
        this._goTo(this.index + 1);
      });

      this.prevBtn?.addEventListener('click', () => {
        this._stopAutoplay();
        this._goTo(this.index - 1);
      });

      this.slides.forEach((slide, i) => {
        slide.addEventListener('click', () => {
          this._stopAutoplay();
          this._goTo(i);
        });
      });
    }

    // ── Autoplay ─────────────────────────────────────────────────────────────

    _startAutoplay() {
      this._stopAutoplay();
      this.autoplayTimer = setTimeout(() => {
        this._goTo(this.index + 1);
        this._startAutoplay();
      }, this.config.autoplayDelay);
    }

    _stopAutoplay() {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  // ── Boot ───────────────────────────────────────────────────────────────────

  function init() {
    document
      .querySelectorAll('[data-ws-element="slider"]')
      .forEach(root => new WSSlider(root));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
