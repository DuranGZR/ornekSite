export function initImageFallbacks() {
  const template = document.querySelector<HTMLTemplateElement>(
    '#image-fallback-template',
  );
  if (!template) return;
  document.querySelectorAll<HTMLImageElement>('main img').forEach((image) => {
    // Dialog images receive their source only when opened and manage errors locally.
    if (image.hasAttribute('data-dynamic-image')) return;
    const width = Number(image.getAttribute('width'));
    const height = Number(image.getAttribute('height'));
    // Reserve declared dimensions even when the browser cannot decode the file.
    if (
      width > 0 &&
      height > 0 &&
      getComputedStyle(image).aspectRatio === 'auto'
    ) {
      image.style.aspectRatio = `${width} / ${height}`;
    }
    const showFallback = () => {
      const parent =
        image.parentElement?.tagName === 'PICTURE'
          ? image.parentElement.parentElement
          : image.parentElement;
      if (!parent || parent.classList.contains('has-image-fallback')) return;
      const fallback = template.content.firstElementChild?.cloneNode(true) as
        HTMLElement | undefined;
      if (!fallback) return;
      parent.classList.add('has-image-fallback');
      image.style.visibility = 'hidden';
      image.setAttribute('aria-hidden', 'true');
      // Keep the original image box, so a failed download cannot shift the page.
      fallback.setAttribute('role', 'img');
      fallback.setAttribute(
        'aria-label',
        image.alt ? `${image.alt}: görsel yüklenemedi` : 'Görsel yüklenemedi',
      );
      parent.append(fallback);
      const fit = () => {
        const box = image.getBoundingClientRect();
        const container = parent.getBoundingClientRect();
        fallback.style.left = `${box.left - container.left - parent.clientLeft}px`;
        fallback.style.top = `${box.top - container.top - parent.clientTop}px`;
        fallback.style.width = `${box.width}px`;
        fallback.style.height = `${box.height}px`;
      };
      const observer = new ResizeObserver(fit);
      observer.observe(image);
      fit();
      window.addEventListener(
        'pagehide',
        (event) => {
          if (!event.persisted) observer.disconnect();
        },
        { once: true },
      );
    };
    image.addEventListener('error', showFallback, { once: true });
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
}
