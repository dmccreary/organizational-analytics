# ONA Timeline MicroSim — Build Log

**Date:** 2026-02-09
**MicroSim:** `docs/sims/ona-timeline/`
**Embedded in:** `docs/chapters/01-intro-to-organizational-analytics/index.md`
**Library:** vis-timeline 7.7.3 (CDN)

## Summary

Created an interactive timeline MicroSim tracing the history of Organizational Network Analysis from Moreno's sociograms (1934) to AI-powered digital twins (2023). The timeline uses 12 events across 8 category groups loaded from an existing `ona_vis_timeline.json` data file. It was embedded in Chapter 1 with an introduction to the term "ONA" as a bridge between the five contributing disciplines and the rest of the course.

## Files Created

| File | Purpose |
|------|---------|
| `docs/sims/ona-timeline/main.html` | vis-timeline visualization with groups, filters, nav buttons |
| `docs/sims/ona-timeline/style.css` | Aria-themed styling (indigo/amber palette) |
| `docs/sims/ona-timeline/index.md` | Documentation page with iframe embed, lesson plan, references |
| `docs/sims/ona-timeline/metadata.json` | Dublin Core metadata |

## Files Modified

| File | Change |
|------|--------|
| `mkdocs.yml` | Added `ONA Timeline: sims/ona-timeline/index.md` to MicroSims nav |
| `docs/chapters/01-intro-to-organizational-analytics/index.md` | Added ONA section with iframe after the Disciplines diagram |

## Iterative Fixes

### Issue 1: Scroll Hijacking in iframe Mode

**User prompt:** *"The Microsim does hijack the chapter scrolling experience. Take a look at this guide: https://dmccreary.github.io/intelligent-textbooks/concepts/scroll-hijacking/"*

**First attempt (reverted):** Added site-wide `pointer-events: none` overlay to `extra.css` and `extra.js` that wrapped every iframe with a "Click to interact" overlay.

**User prompt:** *"Please undo this change. 99% of the Microsims do not hijack the scrolling. I don't want the extra overhead for all MicroSims. I only want you to disable the scroll hijack for this one microsim."*

**Lesson learned:** Don't apply site-wide fixes for a problem that only affects one MicroSim. Fix it locally.

**Second attempt:** Set `moveable: !isInIframe` and `zoomable: !isInIframe` in the vis-timeline options so both drag-to-pan and scroll-to-zoom were disabled in iframe mode.

**User prompt:** *"it still interrupts the scrolling - I can see the scrollbar appear inside the iframe. But first, let's clean up the UI. Remove the 'How to Use' text and the legend text from within the iframe. Put that in the text below the iframe in the index.md page. That will make the height MUCH smaller."*

**Final fix — three changes:**

1. **Removed info panel from iframe mode:** The info panel (how-to instructions, legend, event detail panel) is hidden via `style="display:none"` and only shown in fullscreen via `isInIframe` detection. Added `document.body.style.overflow = 'hidden'` in iframe mode to eliminate internal scrollbar.

2. **Moved legend to chapter markdown:** Category legend rendered as an inline color-coded line below the iframe in the chapter `index.md`. Added "View fullscreen" link for the full experience.

3. **Reduced iframe height:** Dropped from 850px to 550px with `scrolling="no"` and `overflow: hidden` on the iframe element.

### Issue 2: Pan Right Button Broken

**User prompt:** *"The pan right button does not work"*

**Root cause:** JavaScript `Date + number` coercion bug. `range.start` and `range.end` are Date objects. The expression `range.start + span * 0.3` concatenates (Date.toString() + number) instead of performing arithmetic. Subtraction worked by accident because `Date - number` coerces correctly to milliseconds.

**Fix:** Changed pan functions to use explicit `.getTime()`:

```javascript
// Before (broken for panRight — string concatenation)
timeline.setWindow(range.start + span * 0.3, range.end + span * 0.3, ...);

// After (explicit millisecond arithmetic)
const shift = span * 0.3;
timeline.setWindow(
    new Date(range.start.getTime() + shift),
    new Date(range.end.getTime() + shift),
    { animation: true }
);
```

### Issue 3: moveable Disabled Unnecessarily

**User prompt (after moveable was disabled in iframe):** *"Please enable dragging the timeline to the right or left with the mouse, but not change the scroll mode."*

**Fix:** Set `moveable: true` (always enabled). Drag-to-pan does not cause scroll hijacking — only `zoomable` (scroll wheel zoom) does. The pan buttons were initially removed but then restored at user request:

**User prompt:** *"put the pan left and right buttons back"*

## Final Configuration

### vis-timeline Options (iframe vs fullscreen)

| Option | iframe | Fullscreen | Rationale |
|--------|--------|------------|-----------|
| `moveable` | `true` | `true` | Drag-to-pan doesn't hijack scroll |
| `zoomable` | `false` | `true` | Scroll-wheel zoom hijacks page scroll |
| `body.overflow` | `hidden` | default | Eliminates internal scrollbar |
| Info panel | hidden | visible | Keeps iframe compact; content in chapter markdown |

### Key Design Decisions

- **iframe detection:** `window.self !== window.top` — reliable cross-browser check
- **Edge clipping fix:** CSS overflow overrides + padded `setWindow()` instead of `timeline.fit()`
- **Category colors:** Aria-themed palette (indigo, amber, teal, magenta, purple)
- **Data format:** Uses existing vis-timeline JSON with `items[]` and `groups[]` arrays
- **Chapter placement:** After the "Organizational Analytics Disciplines" diagram in Chapter 1, introducing ONA as the practical application of those disciplines
