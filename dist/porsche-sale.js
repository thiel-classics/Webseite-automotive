'use strict';

// This enhancement belongs only to the Porsche sale section. Native controls remain
// available without JavaScript and after playback starts, including on touch devices.
(() => {
  const section = document.querySelector('#porsche-verkaufen');
  if (!section) return;
  const player = section.querySelector('[data-porsche-film]');
  const video = player.querySelector('video');
  const play = player.querySelector('.porsche-sale__play');
  const status = player.querySelector('[role="status"]');
  let starting = false;
  video.controls = false;
  play.hidden = false;

  const showFailure = () => {
    video.controls = true;
    play.hidden = false;
    play.setAttribute('aria-label', 'Video erneut mit Ton abspielen');
    status.textContent = 'Das Video konnte nicht gestartet werden. Bitte versuchen Sie es erneut.';
    status.hidden = false;
  };

  play.addEventListener('click', async () => {
    if (starting) return;
    starting = true;
    play.setAttribute('aria-busy', 'true');
    status.hidden = true;
    video.controls = true;
    if (video.ended) video.currentTime = 0;
    try {
      if (video.error) video.load();
      await video.play();
    } catch (error) {
      if (error.name !== 'AbortError') showFailure();
    } finally {
      starting = false;
      play.removeAttribute('aria-busy');
    }
  });

  video.addEventListener('playing', () => {
    if (document.activeElement === play) video.focus({ preventScroll: true });
    play.hidden = true;
    status.hidden = true;
  });
  video.addEventListener('ended', () => {
    play.setAttribute('aria-label', 'Video erneut abspielen');
    play.hidden = false;
  });
  video.addEventListener('error', showFailure);

  // Reveal once; remain fully visible for keyboard navigation and reduced motion.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches && 'IntersectionObserver' in window) {
    section.classList.add('porsche-sale--waiting');
    const show = () => {
      section.classList.remove('porsche-sale--waiting');
      observer.disconnect();
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) show();
    }, { threshold: 0.08 });
    observer.observe(section);
    section.addEventListener('focusin', show, { once: true });
    reduced.addEventListener('change', event => { if (event.matches) show(); });
  }
})();
