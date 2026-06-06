/*
  WS Attributes — Slider
  Requires GSAP + Draggable loaded before this script.
  Uses the GSAP horizontalLoop() helper for seamless looping.

  data-ws-element="slider"        Root wrapper
  data-ws-element="track"         Moving track containing slides
  data-ws-element="slide"         Individual slide item
  data-ws-element="prev"          Previous button
  data-ws-element="next"          Next button
  data-ws-element="dots"          Pagination dot container (auto-generated)
  data-ws-element="current"       Current slide number output
  data-ws-element="total"         Total slide count output

  data-ws-loop="true"             Enable looping (default: true)
  data-ws-draggable="true"        Enable drag (requires Draggable plugin)
  data-ws-autoplay="false"        Enable autoplay
  data-ws-autoplay-delay="4000"   Autoplay delay in ms
  data-ws-speed="1"               Loop speed
  data-ws-gap="16"                Gap between slides in px
  data-ws-center="true"           Center active slide
  data-ws-active-class="is-active-slide"  Class applied to active slide and dot
*/

// TODO: Replace this with the real horizontalLoop helper from GSAP docs
// https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/
// Paste the horizontalLoop() helper function here before this class.

(function () {
  'use strict';

  class WSSlider {
    constructor(root) {
      this.root = root;
      this.track = root.querySelector('[data-ws-element="track"]');
      this.slides = [...root.querySelectorAll('[data-ws-element="slide"]')];
      this.prevBtn = root.querySelector('[data-ws-element="prev"]');
      this.nextBtn = root.querySelector('[data-ws-element="next"]');
      this.dotsWrap = root.querySelector('[data-ws-element="dots"]');
      this.currentEl = root.querySelector('[data-ws-element="current"]');
      this.totalEl = root.querySelector('[data-ws-element="total"]');

      this.config = {
        loop: root.dataset.wsLoop !== 'false',
        draggable: root.dataset.wsDraggable === 'true',
        autoplay: root.dataset.wsAutoplay === 'true',
        autoplayDelay: parseInt(root.dataset.wsAutoplayDelay || 4000, 10),
        speed: parseFloat(root.dataset.wsSpeed || 1),
        gap: parseFloat(root.dataset.wsGap || 0),
        center: root.dataset.wsCenter !== 'false',
        activeClass: root.dataset.wsActiveClass || 'is-active-slide',
      };

      this.activeIndex = 0;
      this.loop = null;
      this.autoplayTimer = null;

      this.init();
    }

    init() {
      if (!this.slides.length) return;
      if (this.root.dataset.wsInit) return;
      this.root.dataset.wsInit = 'true';

      if (this.totalEl) this.totalEl.textContent = this.slides.length;

      this.buildDots();
      this.createLoop();
      this.bindControls();
      this.setActive(0);

      if (this.config.autoplay) this.startAutoplay();
    }

    createLoop() {
      if (typeof horizontalLoop === 'undefined') {
        console.warn('WS Attributes Slider: horizontalLoop() helper not found. Please include it before slider.js.');
        return;
      }

      this.loop = horizontalLoop(this.slides, {
        paused: true,
        center: this.config.center,
        draggable: this.config.draggable,
        paddingRight: this.config.gap,
        speed: this.config.speed,
        onChange: (slide, index) => {
          this.setActive(index);
        },
      });
    }

    setActive(index) {
      this.activeIndex = index;

      this.slides.forEach((slide, i) => {
        slide.classList.toggle(this.config.activeClass, i === index);
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });

      if (this.currentEl) this.currentEl.textContent = index + 1;

      if (this.dotsWrap) {
        [...this.dotsWrap.children].forEach((dot, i) => {
          dot.classList.toggle(this.config.activeClass, i === index);
          dot.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      }
    }

    buildDots() {
      if (!this.dotsWrap) return;
      this.dotsWrap.innerHTML = '';
      this.slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        btn.addEventListener('click', () => {
          this.stopAutoplay();
          this.loop?.toIndex(i, { duration: 0.8, ease: 'power2.inOut' });
        });
        this.dotsWrap.appendChild(btn);
      });
    }

    bindControls() {
      this.nextBtn?.addEventListener('click', () => {
        this.stopAutoplay();
        this.loop?.next({ duration: 0.8, ease: 'power2.inOut' });
      });

      this.prevBtn?.addEventListener('click', () => {
        this.stopAutoplay();
        this.loop?.previous({ duration: 0.8, ease: 'power2.inOut' });
      });

      this.slides.forEach((slide, i) => {
        slide.addEventListener('click', () => {
          this.stopAutoplay();
          this.loop?.toIndex(i, { duration: 0.8, ease: 'power2.inOut' });
        });
      });
    }

    startAutoplay() {
      this.autoplayTimer = setTimeout(() => {
        this.loop?.next({ duration: 0.8, ease: 'power2.inOut' });
        this.startAutoplay();
      }, this.config.autoplayDelay);
    }

    stopAutoplay() {
      clearTimeout(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  function init() {
    document
      .querySelectorAll('[data-ws-element="slider"]')
      .forEach((root) => new WSSlider(root));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
