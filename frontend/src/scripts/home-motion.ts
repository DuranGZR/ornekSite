import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
export function initHomeMotion() {
  const media = gsap.matchMedia();
  media.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      mobile: '(max-width: 700px)',
      desktop: '(min-width: 701px)',
    },
    (context) => {
      const { reduce, mobile } = context.conditions!;
      document.documentElement.classList.toggle(
        'home-motion',
        !reduce && !mobile,
      );

      // Mobile content appears immediately, without entrance or scroll timelines.
      if (reduce || mobile) {
        return;
      }
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      entrance
        .from('.campus-kicker', { opacity: 0, y: 10, duration: 0.45 }, 0)
        .from(
          '.campus-line > span',
          { yPercent: 115, duration: 0.5, stagger: 0.08 },
          0.12,
        )
        .from(
          '.campus-description',
          { opacity: 0, y: 16, duration: 0.55 },
          0.15,
        )
        .from('.campus-actions', { opacity: 0, y: 8, duration: 0.35 }, 0.25);
      // Draw each contour in order; the small nib follows the actual SVG path.
      const drawing = gsap.timeline({ delay: 0.25 });
      const pen = document.querySelector<SVGCircleElement>('.blueprint-pen');
      gsap.set('.blueprint-surface,.blueprint-depth,.blueprint-nodes', {
        opacity: 0,
      });
      document
        .querySelectorAll<SVGPathElement>('.blueprint-trace')
        .forEach((path) => {
          const length = path.getTotalLength();
          const cursor = { progress: 0 };
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
          drawing.to(cursor, {
            progress: 1,
            duration: length / 1050,
            ease: 'none',
            onStart: () => {
              if (pen) gsap.set(pen, { opacity: 1 });
            },
            onUpdate: () => {
              path.style.strokeDashoffset = String(
                length * (1 - cursor.progress),
              );
              const point = path.getPointAtLength(length * cursor.progress);
              pen?.setAttribute('cx', String(point.x));
              pen?.setAttribute('cy', String(point.y));
            },
          });
        });
      drawing
        .to('.blueprint-pen', { opacity: 0, duration: 0.2 })
        .to(
          '.blueprint-surface,.blueprint-depth,.blueprint-nodes',
          { opacity: 1, duration: 0.7, stagger: 0.1 },
          '<',
        );

      if (!mobile) {
        const blueprint =
          document.querySelector<HTMLElement>('.hero-blueprint')!;
        const stage = document.querySelector<HTMLElement>('.campus-stage')!;
        // Center using layout coordinates so viewport changes do not drift the artwork.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: '.campus-hero',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.7,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (self.progress > 0.03 && entrance.progress() < 1)
                  entrance.progress(1);
                if (self.progress > 0.03 && drawing.progress() < 1)
                  drawing.progress(1);
              },
            },
          })
          .to('.campus-heading', { y: -45, autoAlpha: 0, duration: 0.25 }, 0)
          .to(
            blueprint,
            {
              x: () =>
                stage.clientWidth / 2 -
                blueprint.offsetLeft -
                blueprint.offsetWidth / 2,
              y: () =>
                Math.min(stage.clientHeight, window.innerHeight) / 2 -
                blueprint.offsetTop -
                blueprint.offsetHeight / 2,
              rotation: 0,
              rotationX: 0,
              rotationY: 0,
              scale: mobile ? 1.05 : 1.2,
              duration: 0.42,
              ease: 'power2.inOut',
            },
            0,
          )
          .to(
            '.blueprint-label,.blueprint-foot,.blueprint-guides,.blueprint-detail',
            { opacity: 0, duration: 0.32, ease: 'power1.inOut' },
            0.02,
          )
          .to(
            blueprint,
            { scale: mobile ? 3.5 : 4, duration: 0.58, ease: 'power2.in' },
            0.42,
          )
          .to(
            blueprint,
            { autoAlpha: 0, duration: 0.3, ease: 'power1.in' },
            0.7,
          );
      }
      gsap.utils.toArray<HTMLElement>('.story-title span').forEach((line, i) =>
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
        { opacity: 0.48 },
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
      if (!mobile) {
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
        const panels = gsap.utils.toArray<HTMLElement>(
          '.event-stack .showcase-panel',
        );
        panels.forEach((panel, i) => {
          if (panels[i + 1])
            gsap.to(panel, {
              scale: 0.92,
              scrollTrigger: {
                trigger: panels[i + 1],
                start: 'top 95%',
                end: 'top 14%',
                scrub: 0.5,
              },
            });
        });
      }
      gsap.utils
        .toArray<HTMLElement>('[data-rise],.home-article')
        .forEach((element) =>
          gsap.from(element, {
            y: 28,
            opacity: 0,
            duration: 0.7,
            scrollTrigger: {
              trigger: element,
              start: 'top 92%',
              once: true,
            },
          }),
        );
      if (!mobile) {
        const journeyStage =
          document.querySelector<HTMLElement>('.journey-stage')!;
        const journeyCard =
          document.querySelector<HTMLElement>('.journey-door')!;
        // Hide the copy before the scroll trigger starts, including its first paint.
        gsap.set('.journey-copy', { autoAlpha: 0, y: 40 });
        const journey = gsap.timeline({
          scrollTrigger: {
            trigger: '.join-journey',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        });
        journey
          .to(
            '.journey-door',
            {
              scale: () =>
                Math.max(
                  journeyStage.clientWidth / journeyCard.offsetWidth,
                  journeyStage.clientHeight / journeyCard.offsetHeight,
                ) * 1.08,
              rotation: 0,
              borderRadius: 0,
              borderColor: 'transparent',
              boxShadow: '0 0 0 transparent',
              duration: 0.62,
              ease: 'power2.inOut',
            },
            0,
          )
          .to('.journey-card-face', { autoAlpha: 0, duration: 0.18 }, 0)
          .to(
            '.journey-copy',
            { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
            0.65,
          );
      }
      return () => document.documentElement.classList.remove('home-motion');
    },
  );
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('pageshow', () => ScrollTrigger.refresh());
  window.addEventListener(
    'pagehide',
    (event) => {
      if (!event.persisted) {
        media.revert();
      }
    },
    { once: true },
  );
}
