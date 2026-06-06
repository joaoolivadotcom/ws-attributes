# Slider

A looping slider built on GSAP's `horizontalLoop()` helper. Supports infinite loop, drag, autoplay, pagination dots, prev/next controls, and active slide state.

---

## Load the scripts

GSAP must load before the slider script.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@main/src/slider.js"></script>
```

For drag support, also add the Draggable plugin.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@main/src/slider.js"></script>
```

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

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-ws-element` | `slider` | Required. Marks the slider root. |
| `data-ws-loop` | `true` / `false` | Enable infinite looping. Default: `true`. |
| `data-ws-draggable` | `true` / `false` | Enable drag to slide. Requires GSAP Draggable. Default: `false`. |
| `data-ws-autoplay` | `true` / `false` | Enable autoplay. Default: `false`. |
| `data-ws-autoplay-delay` | number in ms | Delay between autoplay slides. Default: `4000`. |
| `data-ws-speed` | number | Slide speed multiplier. Default: `1`. |
| `data-ws-gap` | number in px | Gap between slides. Default: `0`. |
| `data-ws-center` | `true` / `false` | Center the active slide. Default: `true`. |
| `data-ws-active-class` | any string | Class applied to the active slide and active dot. Default: `is-active-slide`. |

### On child elements

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-ws-element` | `track` | The moving container. |
| `data-ws-element` | `slide` | Each individual slide. |
| `data-ws-element` | `prev` | Previous button. |
| `data-ws-element` | `next` | Next button. |
| `data-ws-element` | `dots` | Container for pagination dots (auto-populated). |
| `data-ws-element` | `current` | Outputs the current slide number. |
| `data-ws-element` | `total` | Outputs the total slide count. |

---

## Examples

### Basic looping slider

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

### Draggable slider

```html
<div data-ws-element="slider" data-ws-draggable="true">
  ...
</div>
```

### Slide counter

```html
<span data-ws-element="current"></span> / <span data-ws-element="total"></span>
```
