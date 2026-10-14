'use strict';

// One frame per input, no animation loop. Only transforms/opacity change while scrolling.
(() => {
  const hero = document.querySelector('[data-studio-hero]');
  if (!hero) return;
  const scene = hero.querySelector('.studio-hero__scene');
  const photo = hero.querySelector('.studio-hero__photo');
  const continuation = hero.querySelector('.studio-hero__continuation');
  const transition = hero.querySelector('.studio-hero__transition');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const portrait = matchMedia('(max-aspect-ratio: 1/1)');
  let frame = 0;
  let height = 1;
  let lastOpacity = '';
  let lastAngle = '';
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

  const render = () => {
    frame = 0;
    const y = Math.max(0, window.scrollY);
    const opening = smooth((y - 4) / 120);
    const fading = 1 - smooth((y - height * .7) / (height * .4));
    const opacity = (opening * fading).toFixed(4);
    const angle = `${reduced.matches ? 0 : (12 * (1 - opening) + 3 * clamp(y / height)).toFixed(3)}deg`;
    if (opacity !== lastOpacity) hero.style.setProperty('--fold-opacity', lastOpacity = opacity);
    if (angle !== lastAngle) hero.style.setProperty('--fold-angle', lastAngle = angle);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };

  const measure = () => {
    // View boxes are measured only on resize, never in the scroll handler.
    const width = hero.clientWidth;
    height = hero.clientHeight;
    // Desktop keeps the photographed floor all the way to the lower edge.
    const sourceWidth = portrait.matches ? 1100 : Math.min(1536, width * 916 / height);
    const sourceX = (1536 - sourceWidth) / 2;
    const sourceHeight = height * sourceWidth / width;
    const sourceY = 108 - (portrait.matches ? Math.max(0, sourceHeight - 916) * .22 : 0);
    scene.setAttribute('viewBox', `${sourceX} ${sourceY} ${sourceWidth} ${sourceHeight}`);
    photo.setAttribute('mask', portrait.matches ? 'url(#studio-photo-mask)' : 'none');
    continuation.setAttribute('viewBox', `${sourceX} ${sourceY + sourceHeight} ${sourceWidth} ${transition.clientHeight * sourceWidth / width}`);
    schedule();
  };

  new ResizeObserver(measure).observe(hero);
  portrait.addEventListener('change', measure);
  reduced.addEventListener('change', schedule);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('pageshow', measure);
  measure();
})();
