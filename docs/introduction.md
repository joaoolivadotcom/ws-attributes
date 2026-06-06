# WS Attributes

WS Attributes is a growing attribute-based component library built for [Webstudio](https://webstudio.is). It works the same way Finsweet Attributes works for Webflow — you add `data-ws-*` attributes to your elements and the script handles the rest.

No JavaScript knowledge needed to use it. Just add the right attributes in Webstudio, load the script, and it works.

---

## How it works

Every component follows the same two-attribute pattern.

`data-ws-element` defines the role of an element inside a component. For example, `data-ws-element="trigger"` tells the script that this element opens or closes an accordion item.

`data-ws-*` on the root element defines behavior options. For example, `data-ws-single="true"` makes an accordion close other items when one opens.

---

## Loading a script

Each component is a standalone script hosted on jsDelivr. Load it in your Webstudio page settings under **Custom Code**, in the `<head>` or before `</body>`.

```html
<!-- Accordion -->
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@main/src/accordion.js"></script>

<!-- Slider (load GSAP first) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@main/src/slider.js"></script>
```

For client projects, pin to a version tag instead of `@main` so a future update never breaks a live site.

```html
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@1.0.0/src/accordion.js"></script>
```

---

## Components

| Component | Status | Script |
|-----------|--------|--------|
| Accordion | Ready | `src/accordion.js` |
| Slider | In progress | `src/slider.js` |
