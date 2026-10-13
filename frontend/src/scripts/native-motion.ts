// Interior pages use native scrolling instead of loading animation packages.
export function initNativeNavigation() {
  const progress = document.querySelector<HTMLElement>('.scroll-progress i');
  const topLink = document.querySelector<HTMLElement>('.back-to-top');
  const footer = document.querySelector('footer');
  let frame = 0;
  const update = () => {
    frame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const fraction = distance > 0 ? scrollY / distance : 0;
    if (progress)
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, fraction))})`;
    if (topLink)
      topLink.hidden =
        scrollY < innerHeight ||
        (footer?.getBoundingClientRect().top ?? Infinity) < innerHeight;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  const dimensions = new ResizeObserver(schedule);
  dimensions.observe(document.body);
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    dimensions.disconnect();
    if (frame) cancelAnimationFrame(frame);
  });
  update();
}
