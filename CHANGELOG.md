# Changelog

## v1.0.0 — 2026-06-06

### Added
- Accordion component (`src/accordion.js`)
  - Group, single-open mode, initial open state
  - Active class support
  - Accessible: aria-expanded, aria-controls, keyboard navigation
  - Smooth height animation via CSS grid-template-rows
- Slider component scaffold (`src/slider.js`)
  - Attribute API defined: slider, track, slide, prev, next, dots, current, total
  - Config options: loop, draggable, autoplay, speed, gap, center, active-class
  - Requires GSAP + horizontalLoop() helper
- Base repo structure: src/, dist/, package.json, README
