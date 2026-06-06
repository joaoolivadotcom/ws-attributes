(function () {
  'use strict';

  function initAccordion(group) {
    if (group.dataset.wsInit) return;
    group.dataset.wsInit = 'true';

    const isSingle = group.dataset.wsSingle === 'true';
    const activeClass = group.dataset.wsActiveClass || 'is-active';
    const initialRaw = group.dataset.wsInitial;
    const initialIndexes =
      initialRaw && initialRaw !== 'none'
        ? initialRaw.split(',').map((n) => parseInt(n.trim(), 10) - 1)
        : [];

    const items = [...group.querySelectorAll(':scope > [data-ws-element="accordion"]')];

    items.forEach((item, index) => {
      const trigger = item.querySelector('[data-ws-element="trigger"]');
      const content = item.querySelector('[data-ws-element="content"]');
      const arrow = item.querySelector('[data-ws-element="arrow"]');

      if (!trigger || !content) return;

      // IDs for accessibility
      const id = 'ws-acc-' + Math.random().toString(36).slice(2, 8);
      trigger.setAttribute('aria-controls', id);
      trigger.setAttribute('aria-expanded', 'false');
      content.setAttribute('id', id);
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', id + '-trigger');
      trigger.setAttribute('id', id + '-trigger');
      if (arrow) arrow.setAttribute('aria-hidden', 'true');

      // CSS for smooth transition (height animation via grid)
      content.style.display = 'grid';
      content.style.gridTemplateRows = '0fr';
      content.style.overflow = 'hidden';
      content.style.transition = 'grid-template-rows 0.35s ease';

      const inner = content.firstElementChild;
      if (inner) inner.style.minHeight = '0';

      function open() {
        content.style.gridTemplateRows = '1fr';
        trigger.setAttribute('aria-expanded', 'true');
        item.classList.add(activeClass);
        if (arrow) arrow.classList.add(activeClass);
      }

      function close() {
        content.style.gridTemplateRows = '0fr';
        trigger.setAttribute('aria-expanded', 'false');
        item.classList.remove(activeClass);
        if (arrow) arrow.classList.remove(activeClass);
      }

      function toggle() {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        if (isSingle && !isOpen) {
          items.forEach((otherItem) => {
            const otherTrigger = otherItem.querySelector('[data-ws-element="trigger"]');
            const otherContent = otherItem.querySelector('[data-ws-element="content"]');
            const otherArrow = otherItem.querySelector('[data-ws-element="arrow"]');
            if (otherTrigger && otherTrigger !== trigger) {
              otherContent.style.gridTemplateRows = '0fr';
              otherTrigger.setAttribute('aria-expanded', 'false');
              otherItem.classList.remove(activeClass);
              if (otherArrow) otherArrow.classList.remove(activeClass);
            }
          });
        }
        isOpen ? close() : open();
      }

      trigger.addEventListener('click', toggle);

      // Keyboard support
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = items[index + 1];
          if (next) next.querySelector('[data-ws-element="trigger"]')?.focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = items[index - 1];
          if (prev) prev.querySelector('[data-ws-element="trigger"]')?.focus();
        }
        if (e.key === 'Home') {
          e.preventDefault();
          items[0]?.querySelector('[data-ws-element="trigger"]')?.focus();
        }
        if (e.key === 'End') {
          e.preventDefault();
          items[items.length - 1]?.querySelector('[data-ws-element="trigger"]')?.focus();
        }
      });

      // Initial open state
      if (initialIndexes.includes(index)) {
        if (!isSingle || initialIndexes[0] === index) {
          open();
        }
      }
    });
  }

  function init() {
    document
      .querySelectorAll('[data-ws-element="group"]')
      .forEach((group) => initAccordion(group));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
