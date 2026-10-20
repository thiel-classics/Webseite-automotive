(() => {
  const hero = document.querySelector('.mural-hero');
  if (!hero) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let previous = '';

  function updateFade() {
    frame = 0;
    if (reducedMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -bounds.top / Math.max(1, bounds.height))).toFixed(3);
    if (progress === previous) return;
    hero.style.setProperty('--mural-fade', progress);
    previous = progress;
  }

  function scheduleFade() {
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(updateFade);
  }

  function configureMotion() {
    window.removeEventListener('scroll', scheduleFade);
    window.removeEventListener('resize', scheduleFade);
    cancelAnimationFrame(frame);
    frame = 0;
    previous = '';
    hero.style.removeProperty('--mural-fade');
    if (reducedMotion.matches) return;
    window.addEventListener('scroll', scheduleFade, {passive: true});
    window.addEventListener('resize', scheduleFade);
    scheduleFade();
  }

  reducedMotion.addEventListener('change', configureMotion);
  configureMotion();
})();
