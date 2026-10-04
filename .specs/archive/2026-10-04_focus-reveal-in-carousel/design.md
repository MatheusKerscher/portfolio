# Design — Keyboard focus on a card that is outside its carousel

## Approach

`StackController` listens to `focusin` and, one frame later, scrolls the page when the focused element is
covered by a pinned panel. The same handler first looks sideways: if the element is inside an item of a
carousel and that item is not wholly inside the visible box of its region, the region is scrolled to the
position of that item, the same position its buttons and its snap use.

## Files affected

| File                                      | Role                                                          |
| ----------------------------------------- | ------------------------------------------------------------- |
| `src/app/components/stack-controller.tsx` | Scrolls a carousel to the item that holds the focused element |
| `e2e/stacking.spec.ts`                    | The focus walk reaches links in WebKit on macOS, and says so  |
| `.specs/memory/playwright-and-axe.md`     | The fact about Tab and links in WebKit, corrected             |

Reuse: the position of an item, `item.offsetLeft - first.offsetLeft`, is what `CarouselControls` and the
`scrollToNatural` helper of the tests already compute.

## Technical decisions

### In `StackController`, not in the carousel

**Choice:** the reveal lives next to the vertical one.
**Why:** it is the same job, "a focused element has to be visible", and that component already owns the
`focusin` listener and the frame of delay that lets the browser scroll first. The carousel itself is a
Server Component with no script; its controls are per carousel and know nothing about focus.

### The whole item, at its snap position

**Choice:** when the item is not wholly inside the region, the region scrolls to the item's own
position, capped at the end of the list.
**Why:** the card shows the focus ring around itself, so the card is what has to be seen. Its own
position is where a mandatory snap would leave it, so the browser has nothing to correct afterwards.
**Rejected alternative:** `scrollIntoView` on the link. It scrolls the page as well, which the vertical
reveal already decides, and it lands between two snap positions.

### The test presses Option+Tab in WebKit on macOS

**Choice:** `Alt+Tab` and `Alt+Shift+Tab` when the browser is WebKit and the platform is macOS; `Tab`
everywhere else. The test also counts the links it reached.
**Why:** Safari moves focus to links with Option+Tab by default. With plain Tab the walk skipped every
link there, which is why the gate was green with the defect in place.

## Known risks

| Risk                                         | How it shows up                                        | Mitigation                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| The fix works on macOS and not on Linux      | The `E2E` workflow still fails                         | Its run on the pull request is a criterion of the spec                                                                     |
| The sideways scroll fights the browser's own | A carousel jumps twice on focus in Chromium or Firefox | It runs one frame after the browser's scroll and only when the item is still outside; the `carousel` and `stacking` suites |

## Failing safely

Nothing destructive. Without JavaScript the browser's own scrolling is what there is, as before.
