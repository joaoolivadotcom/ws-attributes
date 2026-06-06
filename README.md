# WS Attributes

A growing attribute-based component library for Webstudio. Built around `data-ws-*` attributes and hosted via jsDelivr.

Inspired by [Finsweet Attributes](https://finsweet.com/attributes) — built specifically for Webstudio.

---

## How it works

Each component is a standalone JS file. Load it via jsDelivr, add the right attributes to your Webstudio elements, and it works.

All components share one naming system:
- `data-ws-element="..."` defines the role of an element inside a component
- `data-ws-*="..."` defines behavior options on the root element

---

## Components

| Component | Status | Script |
|-----------|--------|--------|
| Accordion | ✅ v1.0.0 | `dist/accordion.min.js` |
| Slider | 🚧 In progress | `dist/slider.min.js` |

---

## Usage

### Accordion

```html
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@latest/dist/accordion.min.js"></script>
```

### Slider

```html
<!-- Load GSAP first -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Draggable.min.js"></script>

<!-- Then load the slider -->
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@latest/dist/slider.min.js"></script>
```

---

## Documentation

Full documentation coming soon on GitBook.

---

## License

MIT
