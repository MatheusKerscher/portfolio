# Lenis: how it scrolls to an anchor, and what stopping it does

Read in `node_modules/lenis/dist/lenis.mjs` and measured on 2026-10-04 with Lenis 1.3.26, React 19.3 and
Next.js 16.3.8, in the `2026-10-04_mobile-experience` spec. The site creates Lenis with `anchors: true`
(`src/app/components/smooth-scroll-provider.tsx`).

- **Lenis reads anchor clicks in a listener on `window` and does not prevent the default action.**
  Evidence: `this.options.wrapper.addEventListener("click", this.onClick)`, and `onClick` calls
  `this.scrollTo(target)` without `preventDefault`. So the browser also jumps to the fragment and sets
  the hash; Lenis then animates from where the page was. Measured in Chromium after a click on a link
  to `#contact`: `scrollY` reads 3413 at once (the jump), then 1096, 2440, 3244 and 3413 (the
  animation). WebKit read 457, 1276, 2493, 3221, 3373.
- **`scrollTo` does nothing while Lenis is stopped.** Evidence: `if ((this.isStopped ||
this.isLocked) && !force) return`. `stop()` and `start()` also reset the animated position.
- **A state change in a React click handler runs the cleanup of its effect before the event reaches
  `window`.** Evidence: the menu stops Lenis in an effect while it is open. A link of the menu only sets
  the state that closes it, and the page still scrolls smoothly to the section: the same samples as
  above were read with and without a second `lenis.start()` in the click handler, in Chromium and in
  WebKit. A stopped Lenis would have left only the jump of the browser, a constant `scrollY`.
- **Lenis leaves the scroll of a touch screen to the browser.** Evidence: `syncTouch` defaults to
  `false` in its constructor. Stopping Lenis therefore does not hold the page still on a phone, and the
  menu also sets `overflow: hidden` on the root.
- **Rule:** something that has to hold the page still (a full-screen menu, a dialog) stops Lenis and
  sets `overflow: hidden` on the root in an effect, and undoes both in its cleanup.
