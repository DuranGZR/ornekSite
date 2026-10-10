# Homepage motion direction

Reference inspected: https://lusion.co/ (11 October 2026).

Observed patterns: large type moving with scroll, expanding media frames, spacious image-led project sections, a dark immersive closing scene, and compact navigation. These informed the motion rhythm; reference assets and branding were not copied.

HSD adaptation:

- Original Three.js laptop, notebook, community pass, pencil and keycap replace the abstract rings.
- A sticky opening assembles these objects as the visitor scrolls.
- Offset headline lines, progressive word emphasis and an expanding community photograph connect the sections.
- Sticky event panels layer over each other; each remains a real event-detail link.
- A community card expands into the closing invitation.

Implementation: `home-motion.ts` owns GSAP ScrollTrigger timelines. `scene/student-objects.ts` owns model construction. `scene/campus-scene.ts` owns rendering and resource lifecycle. `home.css` is homepage-only. Other page routes and content remain intact.

Native scrolling is preserved. Reduced-motion preference removes scroll timelines and long sticky sections. WebGL failure retains a CSS laptop illustration. Rendering pauses offscreen, while the document is hidden, or when the visitor pauses live movement. Mobile rendering uses a capped pixel ratio and separate framing.

Content photographs, event records and the wordmark remain demo placeholders.
