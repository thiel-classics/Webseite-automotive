(() => {
  'use strict';
  const section = document.querySelector('.timeless-personal');
  if (!section) return;
  const heading = section.querySelector('.timeless-title');
  const words = [...heading.querySelectorAll('.timeless-word')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function fitHeading() {
    const size = parseFloat(getComputedStyle(heading).fontSize);
    const width = words.reduce((sum, word) => sum + word.getBoundingClientRect().width, 0);
    const nextSize = size * (heading.clientWidth - .5) / width;
    if (width > 0 && Math.abs(nextSize - size) > .01) {
      heading.style.setProperty('--timeless-size', `${nextSize}px`);
    }
  }
  // Fit the replacement word using the local font without stretching its glyphs.
  document.fonts.ready.then(fitHeading);
  new ResizeObserver(fitHeading).observe(heading);
  // The reference's page-load reveals start when this added section enters view.
  if (reduced.matches || !('IntersectionObserver' in window)) {
    section.classList.add('is-revealed');
  } else {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        section.classList.add('is-revealed');
        observer.disconnect();
      }
    }, {rootMargin:'0px 0px -12% 0px'});
    observer.observe(section);
  }
})();
