'use strict';

// All pages are complete HTML documents; JavaScript only enhances their controls.
const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));mobileNav.hidden=!open;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(!document.querySelector('#header').contains(event.target))closeMenu();});
document.querySelector('#header').addEventListener('focusout',event=>{if(event.relatedTarget&&!document.querySelector('#header').contains(event.relatedTarget))closeMenu();});
matchMedia('(min-width:851px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
document.querySelector('#copyright-year').textContent=String(new Date().getFullYear());
const header=document.querySelector('#header');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',window.scrollY>40),{passive:true});

// Keep old bookmarks usable after the move from the one-page website.
const legacyRoutes={automobile:'automobile.html','ueber-uns':'ueber-uns.html',ankauf:'ankauf.html','fahrzeug-anbieten':'ankauf.html',referenzen:'automobile.html#einblicke',impressum:'impressum.html',datenschutz:'datenschutz.html'};
if(document.body.dataset.page==='index'&&legacyRoutes[location.hash.slice(1)]){
  const destination=new URL(legacyRoutes[location.hash.slice(1)],location.href);destination.search=location.search;location.replace(destination.href);
}

const galleries={
  porsche:{title:'Klassische Automobile',images:[['porsche-silber','Silberner Porsche vor einem historischen Hof'],['porsche-weiss','Weißer Porsche vor einem historischen Gebäude'],['porsche-duo','Silberner und grüner Porsche unter Bäumen']]},
  details:{title:'Ein Blick fürs Detail',images:[['porsche-front','Scheinwerfer und Front eines weißen Porsche'],['porsche-detail','Carrera Schriftzug und Rückleuchten']]},
  moments:{title:'Bleibende Eindrücke',images:[['porsche-trio','Drei klassische Porsche vor einer Scheune'],['porsche-detail','Heck eines silbernen Porsche Carrera'],['porsche-duo','Zwei Porsche-Klassiker unter alten Bäumen']]},
  wheel:{title:'Unsere Welt der Klassiker',images:[['porsche-weiss','Weißer Porsche vor einem historischen Gebäude'],['auto-porsche-pink','Nahaufnahme des Hecks eines pinkfarbenen Porsche mit schwarzem Rad und Heckspoiler'],['porsche-detail','Silberner Porsche Carrera im Detail'],['porsche-silber','Silberner Porsche vor einem historischen Hof'],['auto-porsche-duo','Silberner und grüner klassischer Porsche unter Bäumen auf einem Hof'],['porsche-trio','Drei Generationen klassischer Porsche'],['lifestyle','Ein Abend mit einem roten Klassiker'],['porsche-front','Die zeitlose Front eines weißen Porsche']]}
};
// This additional collection is used only by the Automobile page.
if (document.body.dataset.page === 'automobile') {
  galleries['auto-editorial'] = {
    title: 'Klassische Automobile',
    images: [
      ['auto-silber-hof', 'Silberner Porsche vor einem historischen Gebäude im Abendlicht'],
      ['auto-porsche-duo', 'Silberner und grüner Porsche unter einem großen Baum'],
      ['auto-porsche-weiss', 'Weißer Porsche vor einem historischen Gebäude'],
      ['auto-porsche-pink', 'Pinkes Porsche-Heck mit schwarzem Heckflügel und Hinterrad']
    ]
  };
}
const galleryDialog=document.querySelector('#gallery-dialog');
let galleryKey='porsche',galleryIndex=0,galleryTrigger=null;
function renderGallery(){const gallery=galleries[galleryKey];const[file,alt]=gallery.images[galleryIndex];const img=galleryDialog.querySelector('.gallery-image');img.src=`./assets/${file}-1440.webp`;img.alt=alt;galleryDialog.querySelector('#gallery-title').textContent=gallery.title;galleryDialog.querySelector('.gallery-count').textContent=`${galleryIndex+1} / ${gallery.images.length}`;}
function changeImage(direction){galleryIndex=(galleryIndex+direction+galleries[galleryKey].images.length)%galleries[galleryKey].images.length;renderGallery();}
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{galleryTrigger=button;galleryKey=button.dataset.gallery;galleryIndex=Number(button.dataset.image||0);renderGallery();galleryDialog.showModal();document.body.classList.add('modal-open');galleryDialog.querySelector('.dialog-close').focus();}));
galleryDialog.addEventListener('click',event=>{if(event.target===galleryDialog||event.target.closest('.dialog-close'))galleryDialog.close();const control=event.target.closest('[data-direction]');if(control)changeImage(Number(control.dataset.direction));});
galleryDialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();changeImage(1);}if(event.key==='ArrowLeft'){event.preventDefault();changeImage(-1);}});
galleryDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');galleryTrigger?.focus({preventScroll:true});});

// Project cards onto a shallow tilted ring. A frame is requested only after input.
const wheel=document.querySelector('[data-image-wheel]');
if(wheel){
  const cards=[...wheel.querySelectorAll('.wheel-card')];
  const section=wheel.closest('.wheel-section');
  // Use the existing phone query, including touch phones turned to landscape.
  const mobile=matchMedia(wheel.querySelector('source').media);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const count=cards.length;
  const wrap=value=>((value%count)+count)%count;
  const offset=index=>wrap(index-position+count/2)-count/2;
  let width=wheel.clientWidth,cardWidth=0,angle=.12,frame=0,visible=false,lastY=window.scrollY;
  let position=0,snap=null,wasMobile=null;
  let drag=null,moved=false,suppressClick=false;
  const render=()=>{
    frame=0;
    if(mobile.matches){
      const active=wrap(Math.round(position));
      cards.forEach((card,index)=>{
        const distance=offset(index),depth=Math.min(1,Math.abs(distance));
        const easing=depth*depth*(3-2*depth);
        const scale=reduced.matches?1:1-easing*.055;
        card.style.transform=`translate(-50%,-50%) translate3d(${(distance*cardWidth*.975).toFixed(2)}px,0,0) scale(${scale.toFixed(4)})`;
        card.style.zIndex=String(100-Math.round(Math.abs(distance)*20));
        card.style.opacity=String(reduced.matches?1:1-easing*.12);
        const visibleRange=width/(2*cardWidth*.975)+.55;
        card.style.visibility=Math.abs(distance)>visibleRange?'hidden':'visible';
        card.tabIndex=index===active?0:-1;
        card.setAttribute('aria-label',`${galleries.wheel.images[index][1]} – Bild ${index+1} von ${count} vergrößern`);
      });
      return;
    }
    // Preserve the established desktop ring geometry and motion exactly.
    const radius=Math.max(0,Math.min(550,width*.35,width/2-cardWidth*.55-16));
    const rise=width<600?48:80;
    cards.forEach((card,index)=>{
      const theta=index/cards.length*Math.PI*2+angle;
      const depth=(Math.cos(theta)+1)/2;
      const x=Math.sin(theta)*radius;
      const y=Math.cos(theta)*rise+x*.065;
      const scale=.64+depth*.36;
      card.style.transform=`translate(-50%,-50%) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${(-9+Math.sin(theta)*5).toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      card.style.zIndex=String(Math.round(depth*100));
    });
  };
  const schedule=()=>{if(!frame&&!snap)frame=requestAnimationFrame(render);};
  const stopSnap=()=>{if(frame)cancelAnimationFrame(frame);frame=0;snap=null;};
  const snapTo=target=>{
    stopSnap();
    if(reduced.matches||Math.abs(target-position)<.001){position=wrap(target);render();return;}
    snap={from:position,to:target,start:performance.now(),duration:Math.min(520,340+Math.abs(target-position)*100)};
    const tick=now=>{
      frame=0;
      const progress=Math.min(1,(now-snap.start)/snap.duration);
      position=snap.from+(snap.to-snap.from)*(1-Math.pow(1-progress,4));
      render();
      if(progress<1)frame=requestAnimationFrame(tick);
      else{position=wrap(snap.to);snap=null;render();}
    };
    frame=requestAnimationFrame(tick);
  };
  const measure=()=>{
    const changing=wasMobile!==null&&wasMobile!==mobile.matches;
    stopSnap();
    if(changing){
      if(mobile.matches)position=wrap(Math.round(-angle/(Math.PI*2)*count));
      else angle=-Math.round(position)/count*Math.PI*2;
    }
    position=wrap(Math.round(position));
    const previousDrag=drag;drag=null;moved=false;
    if(previousDrag&&wheel.hasPointerCapture(previousDrag.id))wheel.releasePointerCapture(previousDrag.id);
    wheel.classList.remove('dragging');
    wasMobile=mobile.matches;
    section.setAttribute('aria-labelledby',mobile.matches?'wheel-mobile-title':'wheel-title');
    if(!mobile.matches)cards.forEach((card,index)=>{
      card.style.removeProperty('opacity');card.style.removeProperty('visibility');card.removeAttribute('tabindex');
      card.setAttribute('aria-label',`${galleries.wheel.images[index][1]} – Bild vergrößern`);
    });
    width=wheel.clientWidth;cardWidth=cards[0].offsetWidth;lastY=window.scrollY;render();
  };
  wheel.classList.add('wheel-ready');measure();
  mobile.addEventListener('change',measure);
  reduced.addEventListener('change',()=>{if(mobile.matches)snapTo(Math.round(snap?.to??position));});
  new ResizeObserver(measure).observe(wheel);
  // Card width also changes when a phone rotates without crossing the mobile query.
  new ResizeObserver(measure).observe(cards[0]);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastY=window.scrollY;},{rootMargin:'60px'}).observe(wheel);
  window.addEventListener('scroll',()=>{const y=window.scrollY;const delta=y-lastY;lastY=y;if(!mobile.matches&&visible&&!reduced.matches&&!drag&&!galleryDialog.open){angle+=delta*.0017;schedule();}},{passive:true});
  cards.forEach((card,index)=>card.addEventListener('focus',()=>{
    if(!card.matches(':focus-visible'))return;
    if(mobile.matches)snapTo(Math.round(position+offset(index)));
    else{angle=-index/cards.length*Math.PI*2;schedule();}
  }));
  wheel.addEventListener('keydown',event=>{
    if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
    event.preventDefault();
    const direction=event.key==='ArrowRight'?1:-1;
    if(mobile.matches){
      const target=Math.round(snap?.to??position)+direction;
      cards[wrap(target)].focus({preventScroll:true});snapTo(target);
    }
    else{angle+=direction*Math.PI*2/cards.length;schedule();}
  });
  wheel.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary)return;
    if(mobile.matches)stopSnap();
    suppressClick=false;moved=false;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:mobile.matches?position:angle,lastX:event.clientX,lastTime:event.timeStamp,velocity:0};
  });
  wheel.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!moved&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){
      drag=null;if(mobile.matches)snapTo(Math.round(position));return;
    }
    if(Math.abs(dx)>8){moved=true;suppressClick=true;wheel.classList.add('dragging');if(!wheel.hasPointerCapture(event.pointerId))wheel.setPointerCapture(event.pointerId);}
    if(!moved)return;
    if(mobile.matches){
      const elapsed=event.timeStamp-drag.lastTime;
      if(elapsed>0)drag.velocity=drag.velocity*.35+(event.clientX-drag.lastX)/elapsed*.65;
      drag.lastX=event.clientX;drag.lastTime=event.timeStamp;
      position=drag.start-dx/(cardWidth*.975);
    }else angle=drag.start+dx*.006;
    schedule();
  });
  const release=event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const gesture=drag;drag=null;wheel.classList.remove('dragging');
    if(wheel.hasPointerCapture(event.pointerId))wheel.releasePointerCapture(event.pointerId);
    if(mobile.matches){
      const velocity=event.type==='pointercancel'||event.timeStamp-gesture.lastTime>100?0:gesture.velocity;
      const momentum=reduced.matches?0:Math.max(-1,Math.min(1,-velocity*140/(cardWidth*.975)));
      snapTo(Math.round(position+(moved?momentum:0)));
    }
  };
  wheel.addEventListener('pointerup',release);wheel.addEventListener('pointercancel',release);
  // Touch starts with implicit capture on the card; transferring it to the wheel is not a release.
  wheel.addEventListener('lostpointercapture',event=>{if(drag&&(!mobile.matches||event.target===wheel)){release(event);}});
  wheel.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
}

const form=document.querySelector('#offer-form');
if(form){
  const config=window.THIEL_CONFIG||{};
  // Native multipart POST keeps attachments and the provider's spam check reliable.
  if(config.formEndpoint){const endpoint=new URL(config.formEndpoint);if(endpoint.protocol==='https:'&&endpoint.hostname==='formsubmit.co')form.action=endpoint.href;}
  form.noValidate=true;
  const vehicleType=new URLSearchParams(location.search).get('art');
  if(['Automobil','Zweirad'].includes(vehicleType))form.querySelector(`[name="Fahrzeugart"][value="${vehicleType}"]`).checked=true;
  const year=new Date().getFullYear();document.querySelector('#year').max=String(year);
  const photoInput=document.querySelector('#photos'),photoErrors=document.querySelector('#photo-errors'),preview=document.querySelector('#photo-previews'),statusBox=document.querySelector('#form-status');
  const fields=[...form.querySelectorAll('.field input:not([type="radio"]),.field select,.field textarea,#consent')];
  const submit=form.querySelector('[type="submit"]');
  const allowed=new Set(['image/jpeg','image/png','image/webp']);
  const MAX_BYTES=9_000_000,MAX_FILES=6;
  let photos=[],reading=false,submitting=false,dirty=false;
  const queue=[];
  function status(message){statusBox.textContent=message;statusBox.hidden=false;}
  function dirtyForm(){dirty=true;statusBox.hidden=true;}
  form.addEventListener('input',dirtyForm);
  window.addEventListener('beforeunload',event=>{if(dirty&&!submitting){event.preventDefault();event.returnValue='';}});
  const syncFiles=()=>{const transfer=new DataTransfer();photos.forEach(photo=>transfer.items.add(photo.file));photoInput.files=transfer.files;};
  function renderPhotos(){
    preview.replaceChildren();
    photos.forEach(photo=>{const figure=document.createElement('figure');figure.className='photo-preview';const img=document.createElement('img');img.src=photo.url;img.alt=`Ausgewähltes Fahrzeugbild: ${photo.file.name}`;img.width=160;img.height=110;const caption=document.createElement('figcaption');caption.textContent=photo.file.name;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`${photo.file.name} entfernen`);remove.disabled=submitting;remove.addEventListener('click',()=>{URL.revokeObjectURL(photo.url);photos=photos.filter(item=>item!==photo);syncFiles();renderPhotos();dirtyForm();photoInput.focus();});figure.append(img,caption,remove);preview.append(figure);});
  }
  async function processPhotos(){
    if(reading)return;reading=true;
    const errors=[];photoErrors.textContent='Bilder werden geprüft …';
    while(queue.length){const file=queue.shift();
      if(photos.some(p=>p.file.name===file.name&&p.file.size===file.size&&p.file.lastModified===file.lastModified))continue;
      if(!allowed.has(file.type)){errors.push(`${file.name}: Bitte JPG, PNG oder WebP auswählen.`);continue;}
      if(photos.length>=MAX_FILES){errors.push('Bitte höchstens 6 Bilder auswählen.');continue;}
      if(photos.reduce((sum,p)=>sum+p.file.size,0)+file.size>MAX_BYTES){errors.push(`${file.name}: Die Bilder dürfen zusammen höchstens 9 MB groß sein. Bitte kleinere Bilder auswählen.`);continue;}
      const url=URL.createObjectURL(file);
      try{await new Promise((resolve,reject)=>{const img=new Image();const timer=setTimeout(()=>{img.src='';reject(new Error('timeout'));},12000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(new Error('image'));};img.src=url;});photos.push({file,url});}catch{URL.revokeObjectURL(url);errors.push(`${file.name}: Das Bild konnte nicht gelesen werden. Bitte eine andere Datei auswählen.`);}
    }
    reading=false;syncFiles();renderPhotos();photoErrors.textContent=[...new Set(errors)].join(' ');dirtyForm();
  }
  const addPhotos=files=>{if(submitting)return;queue.push(...files);void processPhotos();};
  photoInput.addEventListener('change',()=>addPhotos([...photoInput.files]));
  const zone=document.querySelector('#upload-zone');
  ['dragenter','dragover'].forEach(type=>zone.addEventListener(type,event=>{event.preventDefault();zone.classList.add('dragover');}));
  ['dragleave','drop'].forEach(type=>zone.addEventListener(type,event=>{event.preventDefault();zone.classList.remove('dragover');}));
  zone.addEventListener('drop',event=>addPhotos([...event.dataTransfer.files]));
  function validate(field){let message='';if(field.required&&(field.type==='checkbox'?!field.checked:!field.value.trim()))message=field.type==='checkbox'?'Bitte bestätigen Sie die Datenschutzhinweise.':'Bitte füllen Sie dieses Feld aus.';else if(field.validity.typeMismatch)message='Bitte geben Sie eine gültige E-Mail-Adresse ein.';else if(field.validity.badInput||field.validity.stepMismatch)message='Bitte geben Sie eine ganze Zahl ein.';else if(field.validity.rangeUnderflow||field.validity.rangeOverflow)message=field.id==='year'?`Bitte geben Sie ein Baujahr zwischen 1885 und ${year} ein.`:'Bitte geben Sie einen Wert innerhalb des zulässigen Bereichs ein.';else if(field.validity.tooLong)message='Bitte kürzen Sie diese Angabe.';document.getElementById(field.id+'-error').textContent=message;field.setAttribute('aria-invalid',String(Boolean(message)));return !message;}
  fields.forEach(field=>{field.setAttribute('aria-describedby',field.id+'-error');if(!field.autocomplete)field.autocomplete='off';field.addEventListener('blur',()=>{if(field.value||field.getAttribute('aria-invalid')==='true')validate(field);});field.addEventListener('input',()=>{if(field.getAttribute('aria-invalid')==='true')validate(field);});});
  // Separate, documented attachment fields instead of relying on duplicate field parsing.
  form.addEventListener('formdata',event=>{event.formData.delete('attachment');photos.forEach((photo,i)=>event.formData.append(i===0?'attachment':`attachment${i+1}`,photo.file,photo.file.name));});
  form.addEventListener('submit',event=>{
    if(submitting){event.preventDefault();return;}
    const invalid=fields.filter(field=>!validate(field));
    if(invalid.length){event.preventDefault();status('Bitte prüfen Sie die markierten Felder.');invalid[0].focus();return;}
    if(reading){event.preventDefault();status('Die Bilder werden noch geprüft. Bitte versuchen Sie es gleich erneut.');photoInput.focus();return;}
    if(!navigator.onLine){event.preventDefault();status('Keine Internetverbindung. Ihre Angaben bleiben hier erhalten. Bitte verbinden Sie sich und senden Sie erneut.');statusBox.focus();return;}
    submitting=true;submit.disabled=true;submit.setAttribute('aria-busy','true');submit.querySelector('.submit-label').textContent='Wird übermittelt …';
    // No fabricated success screen: FormSubmit confirms submission on its own response page.
  });
  window.addEventListener('pageshow',()=>{
    submitting=false;submit.disabled=false;submit.removeAttribute('aria-busy');submit.querySelector('.submit-label').textContent='Anfrage senden';
    dirty=fields.some(field=>field.type==='checkbox'?field.checked!==field.defaultChecked:field.value!==field.defaultValue&&Boolean(field.value));
    // Browsers may restore native fields without restoring this script's in-memory previews.
    if(!photos.length&&photoInput.files.length)addPhotos([...photoInput.files]);
    else if(!photos.length&&performance.getEntriesByType('navigation')[0]?.type==='back_forward')status('Zurück im Formular. Bitte prüfen Sie Ihre Angaben und wählen Sie Bilder bei Bedarf erneut aus.');
  });
}

// Automobile headline: absolute scroll progress makes the two lines reversible.
const automobileStage = document.querySelector('body[data-page="automobile"] [data-auto-stage]');
if (automobileStage) {
  const first = automobileStage.querySelector('[data-auto-line="first"]');
  const second = automobileStage.querySelector('[data-auto-line="second"]');
  const photo = automobileStage.querySelector('.auto-hero-photo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const stacked = matchMedia('(max-width: 1000px)');
  let frame = 0, visible = true, start = 0, distance = 1;
  let firstTravel = 0, secondTravel = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  function render() {
    frame = 0;
    const progress = reduced.matches ? 0 : clamp((window.scrollY - start) / distance);
    automobileStage.style.setProperty('--auto-first-x', `${(-firstTravel * progress).toFixed(2)}px`);
    automobileStage.style.setProperty('--auto-second-x', `${(secondTravel * progress).toFixed(2)}px`);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function measure() {
    const rect = automobileStage.getBoundingClientRect();
    const picture = photo.getBoundingClientRect();
    start = Math.max(0, rect.top + window.scrollY - window.innerHeight * .28);
    distance = Math.max(1, rect.height * .72);
    const firstLeft = first.firstElementChild;
    const firstRight = first.lastElementChild;
    const secondLeft = second.firstElementChild;
    const secondRight = second.lastElementChild;
    const desired = stacked.matches ? Math.min(28, rect.width * .045) : Math.min(68, rect.width * .052);
    // Preserve space around both words and the rotated photograph at every size.
    const leftRoom = first.offsetLeft + firstLeft.offsetLeft - 8;
    const rightRoom = rect.width - second.offsetLeft - secondRight.offsetLeft - secondRight.offsetWidth - 8;
    const firstPhotoRoom = stacked.matches ? desired : first.offsetLeft + firstRight.offsetLeft - (picture.right - rect.left) - 10;
    const secondPhotoRoom = stacked.matches ? desired : picture.left - rect.left - second.offsetLeft - secondLeft.offsetLeft - secondLeft.offsetWidth - 10;
    firstTravel = Math.max(0, Math.min(desired, leftRoom, firstPhotoRoom));
    secondTravel = Math.max(0, Math.min(desired, rightRoom, secondPhotoRoom));
    schedule();
  }
  window.addEventListener('scroll', () => { if (visible && !reduced.matches) schedule(); }, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  reduced.addEventListener('change', measure);
  stacked.addEventListener('change', measure);
  new ResizeObserver(measure).observe(automobileStage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) schedule();
  }, { rootMargin: '100px' }).observe(automobileStage);
  document.fonts.ready.then(measure);
  measure();
}

// Home-page services: all words stay still; only colour and the visual description change.
const porscheServices = document.querySelector('body[data-page="index"] [data-porsche-services]');
if (porscheServices) {
  const pin = porscheServices.querySelector('.porsche-services__pin');
  const panels = [...porscheServices.querySelectorAll('.porsche-services__panel')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const glass = document.createElement('div');
  glass.className = 'porsche-services__glass';
  // This visual duplicate is excluded from accessibility; the original article text remains readable.
  glass.setAttribute('aria-hidden', 'true');
  const descriptions = panels.map(panel => {
    const copy = document.createElement('p');
    copy.className = 'porsche-services__glass-copy';
    copy.textContent = panel.querySelector('.porsche-services__copy').textContent;
    glass.append(copy);
    return copy;
  });
  porscheServices.querySelector('.porsche-services__stage').append(glass);
  let frame = 0, visible = true, start = 0, distance = 1;
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => value * value * (3 - 2 * value);
  function render() {
    frame = 0;
    if (reduced.matches) return;
    const progress = clamp((window.scrollY - start) / distance);
    const phase = ease(clamp((progress - .14) / .26)) + ease(clamp((progress - .60) / .26));
    panels.forEach((panel, index) => {
      const offset = index - phase;
      const weight = clamp(1 - Math.abs(offset));
      panel.style.setProperty('--services-active', `${(weight * 100).toFixed(3)}%`);
      // Fade out before the next text enters, so two descriptions never overlap visibly.
      const opacity = ease(clamp((.5 - Math.abs(offset)) / .22));
      descriptions[index].style.setProperty('--services-copy-opacity', opacity.toFixed(4));
      descriptions[index].style.setProperty('--services-copy-y', `${(Math.max(-1, Math.min(1, offset)) * 10).toFixed(3)}px`);
    });
  }
  function schedule() { if (!frame && !reduced.matches) frame = requestAnimationFrame(render); }
  function measure() {
    start = porscheServices.getBoundingClientRect().top + window.scrollY;
    distance = Math.max(1, porscheServices.offsetHeight - pin.offsetHeight);
    schedule();
  }
  function configure() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    porscheServices.classList.toggle('porsche-services--motion', !reduced.matches);
    panels.forEach(panel => panel.style.removeProperty('--services-active'));
    descriptions.forEach(copy => {
      copy.style.removeProperty('--services-copy-opacity');
      copy.style.removeProperty('--services-copy-y');
    });
    measure();
  }
  window.addEventListener('scroll', () => { if (visible) schedule(); }, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  reduced.addEventListener('change', configure);
  new ResizeObserver(measure).observe(pin);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) measure();
  }, { rootMargin: '100px' }).observe(porscheServices);
  document.fonts.ready.then(measure);
  configure();
}
