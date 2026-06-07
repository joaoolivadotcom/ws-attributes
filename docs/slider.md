# Slider

A physical drag slider built on GSAP Draggable. Supports inertia, snap-to-slide, center mode, pagination dots, prev/next controls, autoplay, breakpoint-based destroy, and active slide state.

Infinite loop support is planned and will be added as a layer on top of this engine.

---

## Load the scripts

GSAP, Draggable, and InertiaPlugin must load before `slider.js`. InertiaPlugin is a [GSAP Club](https://gsap.com/pricing/) plugin and required for momentum-based throw on drag release.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/Draggable.min.js"></script>
<!-- Club license required for InertiaPlugin -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/InertiaPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@main/src/slider.js"></script>
```

The slider works without InertiaPlugin but drag release will snap cold with no throw momentum.

---

## HTML structure

```html
<div data-ws-element="slider">

  <div data-ws-element="track">
    <div data-ws-element="slide">Slide 1</div>
    <div data-ws-element="slide">Slide 2</div>
    <div data-ws-element="slide">Slide 3</div>
  </div>

  <button data-ws-element="prev">Prev</button>
  <button data-ws-element="next">Next</button>

  <!-- Optional -->
  <div data-ws-element="dots"></div>
  <span data-ws-element="current"></span>
  <span data-ws-element="total"></span>

</div>
```

---

## Attributes

### On the root element

| Attribute | Value | Default | Description |
|---|---|---|---|
| `data-ws-element` | `slider` | — | Required. Marks the slider root. |
| `data-ws-draggable` | `true` / `false` | `false` | Enable drag and inertia. Requires GSAP Draggable. |
| `data-ws-autoplay` | `true` / `false` | `false` | Enable autoplay. |
| `data-ws-autoplay-delay` | number in ms | `4000` | Delay between autoplay advances. |
| `data-ws-center` | `true` / `false` | `true` | Center the active slide inside the wrapper. |
| `data-ws-active-class` | string | `is-active-slide` | Class applied to the active slide and active dot. |
| `data-ws-breakpoint` | number in px | `0` | Destroy the slider below this viewport width. `0` means always active. |
| `data-ws-edge-resistance` | `0`–`1` | `0.5` | Rubber band resistance when dragging past the first or last slide. Higher = more resistance. |
| `data-ws-throw-resistance` | number | `2500` | Controls throw distance on drag release. Higher = shorter throw. |
| `data-ws-loop` | `true` / `false` | `false` | Reserved. Infinite loop via clone-and-teleport is planned but not yet active. |

### On child elements

| Attribute | Value | Description |
|---|---|---|
| `data-ws-element` | `track` | The moving container wrapping all slides. |
| `data-ws-element` | `slide` | Each individual slide. |
| `data-ws-element` | `prev` | Previous button. |
| `data-ws-element` | `next` | Next button. |
| `data-ws-element` | `dots` | Container for pagination dots. Auto-populated with `<button>` elements. |
| `data-ws-element` | `current` | Outputs the current slide number (1-based). |
| `data-ws-element` | `total` | Outputs the total slide count. |

---

## Examples

### Basic slider

```html
<div data-ws-element="slider">
  <div data-ws-element="track">
    <div data-ws-element="slide">Slide 1</div>
    <div data-ws-element="slide">Slide 2</div>
    <div data-ws-element="slide">Slide 3</div>
  </div>
  <button data-ws-element="prev">Prev</button>
  <button data-ws-element="next">Next</button>
</div>
```

### Draggable with inertia

```html
<div data-ws-element="slider" data-ws-draggable="true">
  <div data-ws-element="track">
    <div data-ws-element="slide">Slide 1</div>
    <div data-ws-element="slide">Slide 2</div>
    <div data-ws-element="slide">Slide 3</div>
  </div>
  <button data-ws-element="prev">Prev</button>
  <button data-ws-element="next">Next</button>
</div>
```

### Tuned drag feel

```html
<div
  data-ws-element="slider"
  data-ws-draggable="true"
  data-ws-edge-resistance="0.65"
  data-ws-throw-resistance="2000"
>
  ...
</div>
```

Lower `throw-resistance` = longer, more energetic throws. Higher `edge-resistance` = stronger rubber band at the ends.

### Autoplay with dots

```html
<div data-ws-element="slider" data-ws-autoplay="true" data-ws-autoplay-delay="3000">
  <div data-ws-element="track">
    <div data-ws-element="slide">Slide 1</div>
    <div data-ws-element="slide">Slide 2</div>
    <div data-ws-element="slide">Slide 3</div>
  </div>
  <div data-ws-element="dots"></div>
</div>
```

### Disabled below 768px

```html
<div data-ws-element="slider" data-ws-breakpoint="768" data-ws-draggable="true">
  ...
</div>
```

Below 768px the slider destroys itself, resets track position, and hides controls. It re-initialises automatically on resize.

### Slide counter

```html
<span data-ws-element="current"></span> / <span data-ws-element="total"></span>
```

---

## Active slide styling

The active slide and the active dot both receive the class set in `data-ws-active-class` (default `is-active-slide`). Use it to style the focused state.

```css
.is-active-slide {
  opacity: 1;
}

[data-ws-element="slide"]:not(.is-active-slide) {
  opacity: 0.4;
}
```

---

## Roadmap

- Infinite loop via clone-and-teleport (`data-ws-loop="true"`)
- Keyboard arrow navigation
- Touch pause on autoplay
