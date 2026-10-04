# Spec — Keyboard focus on a card that is outside its carousel

## Problem

The first run of the `E2E` workflow, on pull request #44, failed one test: "keyboard focus is never
obscured", in `mobile-safari` on its three tries and once in `webkit`. The pull request was merged with
that check red, so the defect is in production and the check fails for every pull request until it is
fixed.

The test is right. In WebKit, when focus moves to the link of a project card that is outside the visible
part of its carousel, the carousel is not scrolled to it:

- CI, `mobile-safari`, moving backwards: the links of "MyMock" and "Web Carros" are focused with their
  centre at x = −138 and −140, one card to the left of the screen.
- CI, `webkit`: "Dev Controle" at x = 19 moving backwards, and "MyMock" at x = 1442, past the right
  edge, moving forwards.
- Reproduced on macOS with Option+Tab, which moves focus to links there: the same cards, at −140 on an
  iPhone 15 and at 19 on the desktop.

A visitor who uses the keyboard in Safari focuses a card they cannot see (WCAG 2.4.11, Focus Not
Obscured). Chromium and Firefox scroll the carousel on their own.

The local gate never saw it: in WebKit on macOS the Tab key does not move focus to links, so the test
skipped every card there. On the Linux runner it does.

## Expected outcome

Whatever the browser, a card that receives keyboard focus is inside the visible part of its carousel,
and the local gate fails when it is not.

## Scope

1. `StackController`, which already scrolls the page to a focused element that a panel covers, also
   scrolls a carousel to the item that holds the focused element.
2. The focus test reaches links in WebKit on macOS as well.

## Out of scope

- **The dots, the buttons and the snap of the carousels.** They are not the cause.
- **Running the Linux build of WebKit locally.** The proof on Linux is the `E2E` workflow of the pull
  request.

## Acceptance criteria

- [ ] `npm run lint:eslint:check`, `npm run lint:prettier:check`, `npm run build` and `npm run test:e2e`
      exit 0.
- [ ] Moving focus through the page with the keyboard, forwards and backwards, in the five projects,
      every focused link, button and region has its centre on screen and nothing painted over it. In
      WebKit the walk includes the links: the test fails if it reaches fewer than ten.
- [ ] Without the fix that test fails locally in `webkit` and in `mobile-safari`.
- [ ] The `E2E` workflow passes on the pull request of this branch.

## Requester decisions

| Decision                           | Choice            | When       |
| ---------------------------------- | ----------------- | ---------- |
| Fix it now, on a branch of its own | "faça a correção" | 2026-10-04 |

## Dependencies and blockers

The last criterion needs the branch pushed and a pull request opened, which the requester does or asks
for.
