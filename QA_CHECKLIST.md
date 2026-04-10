# Manual QA Checklist (Post-change)

Use this after each frontend patch to guard against regressions.

## 1) Global sanity
- [ ] `index.html` loads `styles/main.css` with no 404.
- [ ] `index.html` loads `js/main.js` with `defer` and no 404.
- [ ] No broken image links (check logo, portrait, icons, decorative graphics).
- [ ] Header/mobile/footer social icons render local recognizable logos from `images/vk.svg` and `images/tg.svg`.
- [ ] Browser console has no errors.

## 2) Desktop layout (>= 769px)
- [ ] Sticky header stays visible on scroll and does not overlap content incorrectly.
- [ ] Navigation links highlight/active state behaves correctly while scrolling.
- [ ] Nav highlight pill animates on desktop hover/click.
- [ ] Hero, About, Benefits, FAQ, Footer spacing/alignment follow the updated rhythm (more title breathing room, consistent section paddings).
- [ ] Benefits section background reads neutral (no gray slab effect), and resting `.carousel-card` has no permanent fill and no permanent box-shadow.
- [ ] Hover lift on stats/cards/FAQ feels stable (no jitter or slow post-reveal hover response).

## 3) Mobile layout (< 769px)
- [ ] Burger button opens/closes menu.
- [ ] Menu open state locks body scroll and closes after nav link click.
- [ ] Mobile nav remains aligned and usable.
- [ ] No sticky hover states on touch for buttons, phone, social icons, footer socials, or slider controls.

## 4) Navigation and anchors
- [ ] Header links scroll to correct sections (`#services`, `#about`, `#value`, `#faq`).
- [ ] Footer/top links scroll correctly (`#top`).
- [ ] Scroll offset is correct (section headings not hidden under sticky header).

## 5) CTA and links
- [ ] Primary CTA buttons work (Telegram, phone links).
- [ ] External links with new tabs still open correctly where expected.

## 6) Interactive components
- [ ] Reveal/scroll animations trigger correctly.
- [ ] Counter animation in stats section reaches expected values.
- [ ] With reduced motion enabled, counters render final values immediately and transitions are effectively disabled.
- [ ] Benefits carousel prev/next buttons scroll cards as expected.
- [ ] Carousel progress indicator updates while scrolling.
- [ ] FAQ accordion opens/closes correctly from a fully collapsed initial state.
- [ ] FAQ items toggle independently and keep correct `aria-expanded`/`aria-hidden` state.
- [ ] FAQ height animation remains smooth when opening/closing one or multiple items.

## 7) Asset/path checks
- [ ] About wave background is visible (path resolves from module CSS via `../images/wave.svg`).
- [ ] About quote card shows subtle heart accent (`images/heart-icon.svg`) without breaking spacing.

## 8) Breakpoint regression check
- [ ] Layout remains identical at `1100px`, `768px`, and `560px` breakpoints.
- [ ] No unintended typography/color/spacing/shadow changes beyond approved polish updates (hero scale, About typography cleanup, benefits card contrast).
- [ ] No clipping/overflow issues introduced.

## 9) Static deployment check
- [ ] Site works when opening `index.html` directly as static files (no build tooling required).
