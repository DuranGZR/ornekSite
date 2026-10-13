# Homepage motion direction

The light opening draws the H, S and D contours sequentially on arrival. A small ink nib follows each SVG contour; surface, depth and nodes appear after the drawing completes. The artwork is decorative lettering, not an official logo.

Scrolling holds the opening while the HSD artwork centers and straightens, then enlarges and dissolves into the overlapping “Bir merak. Bin olasılık.” section. The transition reverses naturally when scrolling up. Fast scrolling completes the entrance drawing before the zoom. There is no intermediate gallery.

`HeroBlueprint.astro` owns the SVG, `Hero.astro` owns semantic content, `hero.css` owns responsive presentation, and `home-motion.ts` owns GSAP timelines. No WebGL runtime is required.

`site-motion.ts` adds shared Lenis wheel smoothing on every route, synchronized with GSAP through one ticker. Touch scrolling stays native. Same-page anchors update the URL and focus the destination; the skip link moves immediately. A fixed progress line and back-to-top link reflect the real document position. Interior page sections reveal once, while homepage scroll choreography remains reversible. Expensive animated brightness filters are avoided on stacked event photographs.

On mobile, event cards stay in normal flow without stacking or scale animations. The community photograph displays at its natural aspect ratio with all copy below it; image zoom and clipping remain desktop-only. Hero descriptions use 16 px or larger type, and meaningful section labels use at least 11 px.

The closing card starts at 180 × 260 px and uses the HSD vector wordmark, campus identity, a restrained rim and layered light treatment. Its decorative face fades before expansion; border, rounding and shadow dissolve as the card fills the stage. Expansion uses the card's measured layout dimensions at refresh to cover both mobile and desktop viewports. Reduced-motion and no-JavaScript layouts hide the decorative face and show the closing copy on a plain full-stage background.

Homepage events are divided into upcoming (ascending date) and past (descending date) at build time. Rebuild the static site to refresh that division as dates pass. The first upcoming card is highlighted and every card includes Istanbul date/time and location. `isDemo` marks example events; only a confirmed upcoming event (`isDemo: false`) can appear in the hero announcement. All current events remain explicitly demo content.

Reduced-motion mode skips drawing, smoothing and scroll choreography, including changes to the preference while the page is open. Without JavaScript, the complete static illustration and navigation remain available. Event photographs are representative placeholders; the community photograph belongs to HSD İnönü.

The transparent `public/hsd-logo.svg` is a vector adaptation based on the HSD Mersin community wordmark at https://medium.com/@hsdmeu/about, not an official brand master. All lettering uses paths, so no font download or white background is required. The optional `docs/create-logo.py` helper regenerates it with fontTools and Windows Arial fonts.
