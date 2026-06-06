# Accordion

A fully accessible accordion component with smooth height animation, single-open mode, initial open state, and keyboard navigation.

---

## Load the script

```html
<script src="https://cdn.jsdelivr.net/gh/joaoolivadotcom/ws-attributes@main/src/accordion.js"></script>
```

---

## HTML structure

```html
<div data-ws-element="group">

  <div data-ws-element="accordion">
    <button data-ws-element="trigger">Question one</button>
    <div data-ws-element="content">
      <div>Answer one</div>
    </div>
  </div>

  <div data-ws-element="accordion">
    <button data-ws-element="trigger">Question two</button>
    <div data-ws-element="content">
      <div>Answer two</div>
    </div>
  </div>

</div>
```

The `content` element must have a single child wrapper div. The animation works by collapsing the grid row, so the inner div is required.

---

## Attributes

### On the group element

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-ws-element` | `group` | Required. Marks the accordion group. |
| `data-ws-single` | `true` | Close other items when one opens. Default: `false`. |
| `data-ws-initial` | `1` or `1,2` | Index of items to open on load (1-based). Use `none` to start all closed. |
| `data-ws-active-class` | any string | Class applied to the active item, trigger, and arrow. Default: `is-active`. |

### On each item element

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-ws-element` | `accordion` | Required. Marks each accordion item. |

### On the trigger element

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-ws-element` | `trigger` | Required. The clickable toggle. Use a `<button>` for accessibility. |

### On the content element

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-ws-element` | `content` | Required. The collapsible panel. |

### On the arrow element (optional)

| Attribute | Value | Description |
|-----------|-------|-------------|
| `data-ws-element` | `arrow` | Optional. Receives the active class when the item is open. Use for rotating icons. |

---

## CSS for the animation

The script sets the height animation via `grid-template-rows`. You need these base styles in your Webstudio page CSS or a global embed.

```css
[data-ws-element="content"] {
  display: grid;
  overflow: hidden;
  transition: grid-template-rows 0.35s ease;
}

[data-ws-element="content"] > * {
  min-height: 0;
}
```

For arrow rotation:

```css
[data-ws-element="arrow"] {
  transition: transform 0.35s ease;
}

.is-active [data-ws-element="arrow"] {
  transform: rotate(180deg);
}
```

---

## Examples

### Single open mode

```html
<div data-ws-element="group" data-ws-single="true">
  ...
</div>
```

### Open first item on load

```html
<div data-ws-element="group" data-ws-initial="1">
  ...
</div>
```

### Open first and third items on load

```html
<div data-ws-element="group" data-ws-initial="1,3">
  ...
</div>
```

### Custom active class

```html
<div data-ws-element="group" data-ws-active-class="open">
  ...
</div>
```

---

## Accessibility

The script handles all ARIA automatically.

- `aria-expanded` on the trigger reflects open/closed state
- `aria-controls` links the trigger to its content panel
- `role="region"` and `aria-labelledby` on the content panel
- Keyboard navigation: `Arrow Up/Down` moves between triggers, `Home/End` jumps to first/last
