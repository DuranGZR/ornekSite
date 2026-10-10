import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { createCampusScene } from './scene/campus-scene';
gsap.registerPlugin(ScrollTrigger);
export function initHomeMotion() {
  let scene: ReturnType<typeof createCampusScene> | undefined;
  let progress = 0;
  const media = gsap.matchMedia();
  media.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      mobile: '(max-width: 700px)',
      desktop: '(min-width: 701px)',
    },
    (context) => {
      const { reduce, mobile } = context.conditions!;
      document.documentElement.classList.toggle('home-motion', !reduce);
      scene?.setReduced(Boolean(reduce));
      if (reduce) {
        scene?.setProgress(0);
        return;
      }
      const hero = gsap.timeline({
        scrollTrigger: {
          trigger: '.campus-hero',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.65,
          onUpdate: (self) => {
            progress = self.progress;
            scene?.setProgress(progress);
          },
        },
      });
      hero
        .to(
          '.campus-heading',
          { y: mobile ? -40 : -95, opacity: 0, duration: 0.3 },
          0,
        )
        .fromTo(
          '.campus-second',
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3 },
          0.65,
        )
        .fromTo(
          '.campus-progress i',
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: 'none' },
          0,
        );
      gsap.utils
        .toArray<HTMLElement>('.story-title span')
        .forEach((line, i) =>
          gsap.fromTo(
            line,
            { xPercent: (i ? 1 : -1) * (mobile ? 6 : 14) },
            {
              xPercent: 0,
              scrollTrigger: {
                trigger: '.story-title',
                start: 'top bottom',
                end: 'center center',
                scrub: 0.6,
              },
            },
          ),
        );
      gsap.fromTo(
        '.story-description p span',
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.12,
          scrollTrigger: {
            trigger: '.story-description',
            start: 'top 85%',
            end: 'bottom 45%',
            scrub: 0.4,
          },
        },
      );
      gsap.fromTo(
        '.story-star',
        { rotation: -50 },
        {
          rotation: 100,
          scrollTrigger: {
            trigger: '.story-description',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      );
      gsap.fromTo(
        '.community-frame',
        {
          clipPath: mobile
            ? 'inset(5% 5% round 22px)'
            : 'inset(12% 20% round 32px)',
        },
        {
          clipPath: 'inset(0% 0% round 0px)',
          scrollTrigger: {
            trigger: '.community-frame',
            start: 'top 85%',
            end: 'top 5%',
            scrub: 0.6,
          },
        },
      );
      gsap.fromTo(
        '.community-frame img',
        { scale: 1.18, yPercent: -5 },
        {
          scale: 1,
          yPercent: 5,
          scrollTrigger: {
            trigger: '.community-frame',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
          },
        },
      );
      const panels = gsap.utils.toArray<HTMLElement>('.showcase-panel');
      panels.forEach((panel, i) => {
        if (panels[i + 1])
          gsap.to(panel, {
            scale: mobile ? 0.96 : 0.92,
            filter: 'brightness(.65)',
            scrollTrigger: {
              trigger: panels[i + 1],
              start: 'top 95%',
              end: 'top 14%',
              scrub: 0.5,
            },
          });
      });
      gsap.utils
        .toArray<HTMLElement>('[data-rise],.home-article')
        .forEach((element) =>
          gsap.from(element, {
            y: 45,
            opacity: 0.2,
            duration: 0.8,
            scrollTrigger: {
              trigger: element,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          }),
        );
      const journey = gsap.timeline({
        scrollTrigger: {
          trigger: '.join-journey',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.75,
        },
      });
      journey
        .to(
          '.journey-door',
          { scale: mobile ? 7 : 10, rotation: 0, duration: 1 },
          0,
        )
        .to('.journey-door span', { opacity: 0, duration: 0.2 }, 0)
        .fromTo(
          '.journey-copy',
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.35 },
          0.6,
        );
      return () => document.documentElement.classList.remove('home-motion');
    },
  );
  const host = document.querySelector<HTMLElement>('#campus-scene');
  if (host)
    import('./scene/campus-scene')
      .then(({ createCampusScene }) => {
        scene = createCampusScene(host);
        scene.setProgress(progress);
      })
      .catch(() => {
        const button =
          document.querySelector<HTMLButtonElement>('.campus-motion');
        if (button) button.hidden = true;
      });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('pageshow', () => ScrollTrigger.refresh());
  window.addEventListener(
    'pagehide',
    (event) => {
      if (!event.persisted) {
        media.revert();
        scene?.dispose();
      }
    },
    { once: true },
  );
}
