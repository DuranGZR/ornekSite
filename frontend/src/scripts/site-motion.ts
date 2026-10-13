import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

export function initSiteMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector<HTMLElement>('.scroll-progress i');
  const topLink = document.querySelector<HTMLElement>('.back-to-top');
  let lenis: Lenis | undefined;
  let frame = 0;

  const update = () => {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const fraction =
      distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0;
    if (progress) progress.style.transform = `scaleX(${fraction})`;
    if (topLink)
      topLink.hidden =
        scrollY < innerHeight ||
        (document.querySelector('footer')?.getBoundingClientRect().top ??
          Infinity) < innerHeight;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const tick = (time: number) => lenis?.raf(time * 1000);
  const configure = () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = undefined;
    if (!reduced.matches) {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) =>
          Boolean(node.closest('#mobile-nav, [data-native-scroll]')),
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    schedule();
  };
  configure();
  const followAnchor = (event: MouseEvent) => {
    if (
      !lenis ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href]',
    );
    if (!link || link.hasAttribute('download') || link.target === '_blank')
      return;
    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      url.pathname !== location.pathname ||
      url.search !== location.search ||
      !url.hash
    )
      return;
    let id: string;
    try {
      id = decodeURIComponent(url.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    lenis.scrollTo(target, {
      immediate: link.classList.contains('skip-link'),
      onComplete: () => {
        const temporary = !target.hasAttribute('tabindex');
        if (temporary) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (temporary)
          target.addEventListener(
            'blur',
            () => target.removeAttribute('tabindex'),
            { once: true },
          );
      },
    });
  };
  document.addEventListener('click', followAnchor);
  reduced.addEventListener('change', configure);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', () => {
    lenis?.resize();
    ScrollTrigger.refresh();
    schedule();
  });
  const dimensions = new ResizeObserver(schedule);
  dimensions.observe(document.body);

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    gsap.ticker.remove(tick);
    lenis?.destroy();
    dimensions.disconnect();
    reduced.removeEventListener('change', configure);
    document.removeEventListener('click', followAnchor);
    if (frame) cancelAnimationFrame(frame);
  });
}
