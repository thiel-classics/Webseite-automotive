'use strict';

// Reference: an on-in-view spring (mass 1, stiffness 480, damping 80),
// with 160 px vertical travel, -10 degrees of rotation and 0.1 s stagger.
(() => {
  const section = document.querySelector('.services');
  if (!section || !('IntersectionObserver' in window)) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const discriminant = Math.sqrt(80 * 80 - 4 * 480);
  const slow = (-80 + discriminant) / 2;
  const fast = (-80 - discriminant) / 2;
  let frame = 0;
  let previousTime = 0;
  const states = [...section.querySelectorAll('.service-row')].map((row, index) => ({
    row, word: row.querySelector('.service-word'), index,
    value: 0, velocity: 0, target: 0, visible: false, timer: 0
  }));

  function render(state) {
    const remaining = 1 - state.value;
    state.word.style.opacity = state.value;
    state.word.style.transform = `perspective(1200px) translateY(${160 * remaining}px) rotate(${-10 * remaining}deg)`;
  }

  function tick(time) {
    const dt = Math.min((time - previousTime) / 1000, .064);
    previousTime = time;
    let moving = false;
    for (const state of states) {
      const displacement = state.value - state.target;
      const a = (state.velocity - fast * displacement) / (slow - fast);
      const b = displacement - a;
      const slowDecay = Math.exp(slow * dt);
      const fastDecay = Math.exp(fast * dt);
      state.value = state.target + a * slowDecay + b * fastDecay;
      state.velocity = a * slow * slowDecay + b * fast * fastDecay;
      if (Math.abs(state.value - state.target) < .00005 && Math.abs(state.velocity) < .001) {
        state.value = state.target;
        state.velocity = 0;
      } else moving = true;
      render(state);
    }
    frame = moving ? requestAnimationFrame(tick) : 0;
  }

  function moveTo(state, target) {
    state.target = target;
    if (!frame) {
      previousTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = states.find(item => item.row === entry.target);
      state.visible = entry.isIntersecting;
      clearTimeout(state.timer);
      if (motion.matches) continue;
      if (state.visible) state.timer = setTimeout(() => moveTo(state, 1), state.index * 100);
      else moveTo(state, 0);
    }
  });

  function applyMotionPreference() {
    cancelAnimationFrame(frame);
    frame = 0;
    for (const state of states) {
      clearTimeout(state.timer);
      state.value = motion.matches || state.visible ? 1 : 0;
      state.target = state.value;
      state.velocity = 0;
      render(state);
    }
  }

  applyMotionPreference();
  states.forEach(state => observer.observe(state.row));
  motion.addEventListener('change', applyMotionPreference);
})();
