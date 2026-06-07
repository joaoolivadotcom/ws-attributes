/*
  WS Attributes — Slider
  Requires GSAP loaded before this script.
  Draggable plugin required only when data-ws-draggable="true".

  Attribute API
  ─────────────────────────────────────────────────────────────
  data-ws-element="slider"               Root wrapper
  data-ws-element="track"                Moving track containing slides
  data-ws-element="slide"                Individual slide item
  data-ws-element="prev"                 Previous button
  data-ws-element="next"                 Next button
  data-ws-element="dots"                 Pagination dot container (auto-populated)
  data-ws-element="current"              Current slide number output
  data-ws-element="total"                Total slide count output

  Config attributes on the root element
  ─────────────────────────────────────────────────────────────
  data-ws-loop="true"                    Enable looping (default: true)
  data-ws-draggable="true"               Enable drag (requires GSAP Draggable)
  data-ws-autoplay="true"                Enable autoplay (default: false)
  data-ws-autoplay-delay="4000"          Autoplay delay in ms (default: 4000)
  data-ws-speed="1"                      Slide speed multiplier (default: 1)
  data-ws-gap="16"                       Gap between slides in px (default: 0)
  data-ws-center="true"                  Center active slide (default: true)
  data-ws-active-class="is-active-slide" Class applied to active slide and dot
*/

// ─────────────────────────────────────────────────────────────────────────────
// Register GSAP plugins
// ─────────────────────────────────────────────────────────────────────────────
if (typeof Draggable !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

// ─────────────────────────────────────────────────────────────────────────────
// Inject base CSS
// ─────────────────────────────────────────────────────────────────────────────
(function injectStyles() {
  const id = 'ws-slider-styles';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = [
    '[data-ws-element="slider"] { overflow: hidden; position: relative; }',
    '[data-ws-element="track"] { display: flex; will-change: transform; }',
    '[data-ws-element="slide"] { flex-shrink: 0; }',
  ].join(' ');
  document.head.appendChild(style);
})();

// ─────────────────────────────────────────────────────────────────────────────
// horizontalLoop() — GSAP Helper Function
// Source: https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/
// ─────────────────────────────────────────────────────────────────────────────
function horizontalLoop(items, config) {
  items = gsap.utils.toArray(items);
  config = config || {};
  let tl = gsap.timeline({
    repeat: config.repeat,
    paused: config.paused,
    defaults: { ease: 'none' },
    onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
  }),
    length = items.length,
    startX = items[0].offsetLeft,
    times = [],
    widths = [],
    xPercents = [],
    curIndex = 0,
    pixelsPerSecond = (config.speed || 1) * 100,
    snap =
      config.snap === false
        ? (v) => v
        : gsap.utils.snap(config.snap || 1),
    totalWidth,
    curX,
    distanceToStart,
    distanceToLoop,
    item,
    i;

  gsap.set(items, {
    xPercent: (i, el) => {
      let w = (widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px')));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, 'x', 'px')) / w) * 100 +
          gsap.getProperty(el, 'xPercent')
      );
      return xPercents[i];
    },
  });

  gsap.set(items, { x: 0 });

  totalWidth =
    items[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    items[length - 1].offsetWidth *
      gsap.getProperty(items[length - 1], 'scaleX') +
    (parseFloat(config.paddingRight) || 0);

  for (i = 0; i < length; i++) {
    item = items[i];
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop =
      distanceToStart + widths[i] * gsap.getProperty(item, 'scaleX');

    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(
            ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
          ),
        },
        {
          xPercent: xPercents[i],
          duration:
            (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add('label' + i, distanceToStart / pixelsPerSecond);

    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index, vars) {
    vars = vars || {};
    Math.abs(index - curIndex) > length / 2 &&
      (index += index > curIndex ? -length : length);
    let newIndex = gsap.utils.wrap(0, length, index),
      time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index, vars) => toIndex(index, vars);
  tl.times = times;
  tl.progress(1, true).progress(0, true);

  if (config.reversed) {
    tl.vars.onReverseComplete();
    tl.reverse();
  }

  return tl;
}

// ─────────────────────────────────────────────────────────────────────────────
// WSSlider
// ─────────────────────────────────────────────────────────────────────────────
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
