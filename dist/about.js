(() => {
  'use strict';
  const story = document.querySelector('.about-story');
  const hero = document.querySelector('.about-hero');
  const title = document.querySelector('.about-title');
  const lines = [...document.querySelectorAll('.about-title-line>span')];
  const visual = document.querySelector('.about-visual');
  const portrait = document.querySelector('.about-portrait');
  const image = document.querySelector('.about-portrait-image');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Reference spring: mass 1, stiffness 480, damping 80; line delays 0 / .2 s.
  const root = Math.sqrt(80 * 80 - 4 * 480);
  const r1 = (-80 + root) / 2, r2 = (-80 - root) / 2;
  const clamp = n => Math.max(0,Math.min(1,n));
  const remaining = t => t <= 0 ? 1 : (-r2 * Math.exp(r1*t) + r1 * Math.exp(r2*t)) / (r1-r2);
  let dimensions, frame, lastTime, startTime = performance.now();
  const titleSpring = {value:1,velocity:0};
  const imageSpring = {value:1.5,velocity:0};
  function measure() {
    dimensions = {top:story.offsetTop + hero.offsetHeight,height:visual.offsetHeight,imageTop:story.offsetTop + hero.offsetHeight + 12,imageHeight:portrait.offsetHeight};
    schedule();
  }
  function advance(state,target,dt) {
    const distance = state.value-target;
    const a = (state.velocity-r2*distance)/(r1-r2), b = distance-a;
    const first = a*Math.exp(r1*dt), second = b*Math.exp(r2*dt);
    state.value = target+first+second;
    state.velocity = r1*first+r2*second;
    return Math.abs(state.value-target)>.0001 || Math.abs(state.velocity)>.0001;
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(update); }
  function update(now) {
    frame=0;
    const dt=Math.min((now-(lastTime??now-16))/1000,.1); lastTime=now;
    if (reduced.matches) {
      title.style.transform='none';image.style.transform='none';visual.style.transform='none';visual.style.opacity='1';
      lines.forEach(line=>{line.style.transform='none';line.style.opacity='1';});
      return;
    }
    const elapsed=(now-startTime)/1000;
    lines.forEach((line,index)=>{const progress=remaining(elapsed-index*.2);line.style.transform=`translateY(${120*progress}px)`;line.style.opacity=String(1-progress);});
    const entering=remaining(elapsed-.4);
    visual.style.transform=`translateY(${120*entering}px)`;visual.style.opacity=String(1-entering);
    // The title shrinks as the portrait section crosses the viewport midpoint.
    const titleTarget=1-clamp((scrollY+innerHeight*.5-dimensions.top)/dimensions.height);
    const imageTarget=1+.5*clamp((scrollY+innerHeight-dimensions.imageTop)/dimensions.imageHeight);
    const titleMoving=advance(titleSpring,titleTarget,dt),imageMoving=advance(imageSpring,imageTarget,dt);
    title.style.transform=`scale(${titleSpring.value})`;
    image.style.transform=`scale(${imageSpring.value})`;
    if (elapsed<2 || titleMoving || imageMoving) schedule();
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',measure);
  reduced.addEventListener('change',measure);
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(visual);
  measure();
})();
