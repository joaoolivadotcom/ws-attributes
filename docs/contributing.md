# Adding New Components

WS Attributes is designed to grow over time. Each new component follows the same pattern as accordion and slider so the API stays consistent and predictable.

---

## Naming conventions

All attributes use the `data-ws-*` namespace.

- `data-ws-element="..."` defines the role of an element inside a component
- `data-ws-[option]="..."` on the root element defines behavior config

Keep element names short and descriptive. `trigger`, `content`, `track`, `slide`, `dots` are good examples. Avoid abbreviations.

---

## File structure

Each component lives in its own file inside `src/`.

```
src/
├── accordion.js
├── slider.js
└── your-component.js
```

The script should be wrapped in an IIFE and use `data-ws-element` as the entry point selector.

---

## Script pattern

```js
(function () {
  'use strict';

  function initComponent(root) {
    if (root.dataset.wsInit) return;
    root.dataset.wsInit = 'true';

    // read config from root dataset
    // query child elements using data-ws-element
    // wire up events
  }

  function init() {
    document
      .querySelectorAll('[data-ws-element="your-component"]')
      .forEach((root) => initComponent(root));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

---

## Checklist for new components

- Uses `data-ws-element` for all child roles
- Uses `data-ws-[option]` for all config
- Guards against double-init with `data.wsInit`
- Handles accessibility (ARIA, keyboard where relevant)
- Documented in `docs/` with attributes table and examples
- Added to the components table in `docs/introduction.md`
- Added to `SUMMARY.md`
- Added to `README.md` components table
- Entry in `CHANGELOG.md`
