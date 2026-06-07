/*
  WS Attributes — Slider
  Requires GSAP loaded before this script.
  Draggable plugin required only when data-ws-draggable="true".
  InertiaPlugin required for momentum-based drag snapping.

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
if (typeof InertiaPlugin !== 'undefined') {
  gsap.registerPlugin(InertiaPlugin);
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
// horizontalLoop() — Full version with draggable, center, onChange, resize
// Source: https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop/
// ─────────────────────────────────────────────────────────────────────────────
function horizontalLoop(items, config) {
  let timeline;
  items = gsap.utils.toArray(items);
  config = config || {};
  gsap.context(() => {
    let onChange = config.onChange,
      lastIndex = 0,
      tl = gsap.timeline({
        repeat: config.repeat,
        onUpdate:
          onChange &&
          function () {
            let i = tl.closestIndex();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(items[i], i);
            }
          },
        paused: config.paused,
        defaults: { ease: 'none' },
        onReverseComplete: () =>
          tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap =
        config.snap === false
          ? (v) => v
          : gsap.utils.snap(config.snap || 1),
      timeOffset = 0,
      container =
        center === true
          ? items[0].parentNode
          : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth *
          gsap.getProperty(items[length - 1], 'scaleX') +
        (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(), b2;
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px'));
          xPercents[i] = snap(
            (parseFloat(gsap.getProperty(el, 'x', 'px')) / widths[i]) * 100 +
              gsap.getProperty(el, 'xPercent')
          );
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, { xPercent: (i) => xPercents[i] });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center
          ? tl.duration() * (container.offsetWidth / 2) / totalWidth
          : 0;
        center &&
          times.forEach((t, i) => {
            times[i] = timeWrap(
              tl.labels['label' + i] +
                tl.duration() * widths[i] / 2 / totalWidth -
                timeOffset
            );
          });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0,
          d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) d = wrap - d;
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart =
            item.offsetLeft + curX - startX + spaceBefore[0];
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
                  (curX - distanceToLoop + totalWidth - curX) /
                  pixelsPerSecond,
                immediateRender: false,
              },
              distanceToLoop / pixelsPerSecond
            )
            .add('label' + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable
          ? tl.time(times[curIndex], true)
          : tl.progress(progress, true);
      },
      onResize = () => refresh(true),
      proxy;

    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener('resize', onResize);

    function toIndex(index, vars) {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length);
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars);
    }

    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = (setCurrent) => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars) => toIndex(tl.current() - 1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true);

    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }

    if (config.draggable && typeof Draggable === 'function') {
      proxy = document.createElement('div');
      let wrap = gsap.utils.wrap(0, 1),
        ratio,
        startProgress,
        draggable,
        lastSnap,
        initChangeX,
        wasPlaying,
        align = () =>
          tl.progress(
            wrap(startProgress + (draggable.startX - draggable.x) * ratio)
          ),
        syncIndex = () => tl.closestIndex(true);

      typeof InertiaPlugin === 'undefined' &&
        console.warn(
          '[WS Slider] InertiaPlugin required for momentum-based drag snapping. Load it from https://gsap.com/docs/v3/Plugins/InertiaPlugin/'
        );

      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: 'x',
        onPressInit() {
          let x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) {
            return lastSnap + initChangeX;
          }
          let time = -(value * ratio) * tl.duration(),
            wrappedTime = timeWrap(time),
            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
            dif = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 &&
            (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          draggable.isThrowing && (indexIsDirty = true);
        },
        onThrowComplete: () => {
          syncIndex();
          wasPlaying && tl.play();
        },
      })[0];

      tl.draggable = draggable;
    }

    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    timeline = tl;
    return () => window.removeEventListener('resize', onResize);
  });
  return timeline;
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
