'use strict';
(() => {
  const main = document.querySelector('.ankauf-main');
  if (!main) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...main.querySelectorAll('.purchase-card')];
  const anchors = [...main.querySelectorAll('.purchase-anchor')];
  const dive = main.querySelector('.photo-dive');
  const stage = main.querySelector('.photo-dive-stage');
  const mask = main.querySelector('.photo-dive-mask');
  const text = main.querySelector('#purchase-mask-text');
  const hint = main.querySelector('.photo-dive-hint');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);
  let target = {x: 720, y: 500};
  let frame = 0;

  function fitMask() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    mask.setAttribute('viewBox', `0 0 ${width} ${height}`);
    text.removeAttribute('textLength');
    text.removeAttribute('lengthAdjust');
    text.setAttribute('font-size', '200');
    const natural = text.getComputedTextLength();
    if (!natural) return;
    const fontSize = 200 * width * .94 / natural;
    const baseline = height * .5 + fontSize * .35;
    text.setAttribute('font-size', String(fontSize));
    text.setAttribute('x', String(width / 2));
    text.setAttribute('y', String(baseline));
    // Aim into the solid left stem of H, so the letter opens onto the photo.
    const letter = text.getExtentOfChar(6);
    target = {x: letter.x + letter.width * .16, y: baseline - fontSize * .35};
    mask.style.transformOrigin = `${target.x}px ${target.y}px`;
  }

  function render() {
    frame = 0;
    if (reduced.matches) {
      cards.forEach(card => { card.style.transform = ''; });
      mask.style.transform = '';
      mask.style.opacity = '';
      hint.style.opacity = '';
      return;
    }
    const height = innerHeight;
    const mobile = innerWidth < 700;
    const stickyTop = mobile ? 120 : 140;
    cards.forEach((card, index) => {
      // The opening card starts upright; only the following card flies in.
      if (index === 0) {
        card.style.transform = 'none';
        return;
      }
      const entry = anchors[index].getBoundingClientRect().top;
      const progress = smooth(clamp((height - entry) / (height - stickyTop)));
      const remaining = 1 - progress;
      card.style.transform = `translateY(${remaining * 40}px) rotate(${remaining * (mobile ? 6 : 30)}deg)`;
    });
    const progress = clamp(-dive.getBoundingClientRect().top / Math.max(1, dive.offsetHeight - stage.offsetHeight));
    const zoom = smooth(clamp((progress - .09) / .76));
    const scale = Math.exp(zoom * Math.log(120));
    const pan = smooth(clamp((progress - .09) / .45));
    const x = (stage.clientWidth / 2 - target.x) * pan;
    const y = (stage.clientHeight / 2 - target.y) * pan;
    mask.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    mask.style.opacity = String(1 - smooth(clamp((progress - .82) / .06)));
    hint.style.opacity = String(1 - clamp(progress / .1));
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function resize() {
    // Tall cards stay in normal flow on short screens, keeping every line reachable.
    main.classList.toggle('ankauf-flow-cards', cards.some(card => card.offsetHeight > innerHeight - 160));
    fitMask();
    schedule();
  }
  main.classList.add('ankauf-motion');
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', resize, {passive: true});
  addEventListener('pageshow', resize);
  reduced.addEventListener('change', resize);
  new ResizeObserver(resize).observe(stage);
  document.fonts.ready.then(resize);
  resize();
})();
