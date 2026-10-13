export function initCommunityFilm() {
  document.querySelectorAll<HTMLElement>('[data-film]').forEach((section) => {
    const dialog = section.querySelector<HTMLDialogElement>('.film-lightbox')!;
    const fullImage = dialog.querySelector<HTMLImageElement>('img')!;
    const loadError = dialog.querySelector<HTMLElement>('.film-load-error')!;
    fullImage.addEventListener('error', () => {
      fullImage.hidden = true;
      loadError.hidden = false;
    });
    let previousOverflow = '';
    let returnFocus: HTMLElement | null = null;
    const openPhoto = (button: HTMLElement, reel: HTMLElement) => {
      const photo = button.querySelector('img');
      if (!photo || dialog.open) return;
      fullImage.hidden = false;
      loadError.hidden = true;
      fullImage.src = photo.src;
      fullImage.alt = photo.alt;
      returnFocus = button.closest('[aria-hidden="true"]') ? reel : button;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    };
    dialog
      .querySelector('button')!
      .addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus({ preventScroll: true });
    });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reduced.matches;
    let visible = false;
    reduced.addEventListener('change', (event) => {
      paused = event.matches;
    });
    const reels = Array.from(
      section.querySelectorAll<HTMLElement>('.film-reel'),
    ).map((element, index) => {
      const track = element.querySelector<HTMLElement>('.film-track')!;
      const group = track.querySelector<HTMLElement>('.film-group')!;
      const originals = Array.from(group.children).map(
        (child) => child.cloneNode(true) as HTMLElement,
      );
      let period = 1;
      let offset = index * 180;
      let pointer: number | null = null;
      let startX = 0;
      let lastX = 0;
      let dragging = false;
      let suppressClick = false;
      let pressedPhoto: HTMLElement | null = null;
      let hovered = false;
      element.addEventListener('pointerenter', (event) => {
        hovered = event.pointerType === 'mouse';
      });
      element.addEventListener('pointerleave', () => {
        hovered = false;
      });
      const render = () => {
        offset = ((offset % period) + period) % period;
        track.style.transform = `translate3d(${offset - period}px, 0, 0)`;
      };
      const measure = () => {
        track.querySelectorAll('[data-copy]').forEach((copy) => copy.remove());
        group.replaceChildren(
          ...originals.map((child) => child.cloneNode(true)),
        );
        // Make each repeated period wider than the viewport, even with one photo.
        while (
          group.getBoundingClientRect().width <
          element.clientWidth + 400
        ) {
          originals.forEach((child) => {
            const copy = child.cloneNode(true) as HTMLElement;
            copy.setAttribute('aria-hidden', 'true');
            copy.setAttribute('tabindex', '-1');
            group.append(copy);
          });
        }
        period = group.getBoundingClientRect().width;
        for (let i = 0; i < 2; i++) {
          const copy = group.cloneNode(true) as HTMLElement;
          copy.dataset.copy = '';
          copy.setAttribute('aria-hidden', 'true');
          copy
            .querySelectorAll('button')
            .forEach((button) => (button.tabIndex = -1));
          track.append(copy);
        }
        render();
      };
      new ResizeObserver(measure).observe(element);
      element.addEventListener('pointerdown', (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        // Repeated frames stay out of the keyboard order; avoid focusing a copy.
        if (event.pointerType === 'mouse') event.preventDefault();
        pointer = event.pointerId;
        startX = lastX = event.clientX;
        dragging = false;
        suppressClick = false;
        pressedPhoto = (event.target as HTMLElement).closest('.film-frame');
        element.setPointerCapture(pointer);
      });
      element.addEventListener('pointermove', (event) => {
        if (pointer !== event.pointerId) return;
        if (Math.abs(event.clientX - startX) > 8) dragging = true;
        if (dragging) {
          offset += event.clientX - lastX;
          render();
        }
        lastX = event.clientX;
      });
      const release = () => {
        pointer = null;
        dragging = false;
      };
      element.addEventListener('pointerup', (event) => {
        if (pointer !== event.pointerId) return;
        suppressClick = dragging;
        release();
      });
      element.addEventListener('click', (event) => {
        const targetButton = (event.target as HTMLElement).closest<HTMLElement>(
          '.film-frame',
        );
        // Open after the click finishes targeting the reel. Opening on pointerup
        // lets the same touch produce a backdrop click and immediately close it.
        const button =
          event.detail === 0 ? targetButton : (pressedPhoto ?? targetButton);
        if (button && (event.detail === 0 || !suppressClick))
          openPhoto(button, element);
        pressedPhoto = null;
      });
      element.addEventListener('pointercancel', () => {
        suppressClick = true;
        pressedPhoto = null;
        release();
      });
      element.addEventListener('lostpointercapture', release);
      element.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        offset += event.key === 'ArrowLeft' ? 160 : -160;
        render();
      });
      return {
        tick(delta: number) {
          if (
            !dialog.open &&
            (pointer !== null ||
              hovered ||
              element.matches(':focus-visible') ||
              element.querySelector(':focus-visible'))
          )
            return;
          offset +=
            Number(element.dataset.direction) * (index === 1 ? 30 : 24) * delta;
          render();
        },
      };
    });
    let frame = 0;
    let last = 0;
    const animate = (now: number) => {
      if (!paused && visible && !document.hidden)
        reels.forEach((reel) => reel.tick(Math.min((now - last) / 1000, 0.05)));
      last = now;
      frame = requestAnimationFrame(animate);
    };
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }).observe(section);
    frame = requestAnimationFrame(animate);
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame), {
      once: true,
    });
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        last = 0;
        frame = requestAnimationFrame(animate);
      }
    });
  });
}
