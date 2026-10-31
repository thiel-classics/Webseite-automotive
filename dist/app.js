'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = $('#menu');
const menuButton = $('.menu-toggle');
const menuLabel = $('[data-scramble]', menuButton);
const main = $('main');
const footer = $('.footer');
let menuIsOpen = false;
let menuTimer;
const scramblers = new WeakMap();
function scramble(el) {
  const original = el.dataset.original || el.textContent;
  el.dataset.original = original;
  clearInterval(scramblers.get(el));
  if (reduceMotion.matches) { el.textContent = original; return; }
  let step = 0;
  const replacements = { A:'4', E:'3', I:'1', O:'0', S:'5', T:'7', B:'8' };
  const timer = setInterval(() => {
    el.textContent = [...original].map((char,i) => i < step / 2 || !replacements[char] ? char : (Math.random() > .4 ? replacements[char] : char)).join('');
    step++;
    if (step > original.length * 2 + 1) { el.textContent = original; clearInterval(timer); }
  }, 36);
  scramblers.set(el,timer);
}
$$('[data-scramble]').forEach(el => {
  const interactive = el.closest('a,button');
  interactive?.addEventListener('pointerenter',() => scramble(el));
  interactive?.addEventListener('focus',() => scramble(el));
});
$$('.menu-item').forEach(link => {
  const text = `[ VIEW ${$('.menu-word',link).textContent} ]`;
  $$('.marquee > span',link).forEach(group => {
    for (let i = 0; i < 8; i++) { const label = document.createElement('b'); label.textContent = text; group.append(label); }
  });
});
function toggleMenu(open = !menuIsOpen, restoreFocus = true) {
  menuIsOpen = open;
  clearTimeout(menuTimer);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label',open ? 'Close menu' : 'Open menu');
  clearInterval(scramblers.get(menuLabel));
  menuLabel.textContent = open ? '[ CLOSE ]' : 'MENU';
  menuLabel.dataset.original = menuLabel.textContent;
  document.body.classList.toggle('menu-open', open);
  main.inert = open; footer.inert = open;
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    scramble(menuLabel);
  } else {
    menu.classList.remove('is-open');
    menuTimer = setTimeout(() => { menu.hidden = true; }, reduceMotion.matches ? 0 : 650);
    if (restoreFocus) menuButton.focus({preventScroll:true});
  }
}
menuButton.addEventListener('click', () => toggleMenu());
$$('.menu-item').forEach(link => link.addEventListener('click',() => toggleMenu(false,false)));
$$('[data-home-link]').forEach(link => link.addEventListener('click', event => {
  if (!['/', '/index.html'].includes(location.pathname)) return;
  event.preventDefault();
  if (menuIsOpen) toggleMenu(false,false);
  window.scrollTo({top:0,behavior:reduceMotion.matches?'instant':'smooth'});
}));
$$('a[href="#top"],a[href="#projects"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  if (menuIsOpen) toggleMenu(false,false);
  const target = $(link.getAttribute('href'));
  target?.scrollIntoView({behavior:reduceMotion.matches ? 'instant' : 'smooth',block:'start'});
}));
const dialog = $('.search-dialog');
const input = $('input',dialog);
const results = $('#search-results');
const projectEntries = root => $$('.project-card',root).map(card => ({title:$('.category',card).textContent,description:$('.project-image',card).alt,id:card.id}));
let entries = projectEntries(document);
// Read the current homepage cards so both pages share the same search content.
if (!entries.length) {
  fetch('/').then(response => {
    if (!response.ok) throw new Error('Homepage search could not load');
    return response.text();
  }).then(html => {
    entries = projectEntries(new DOMParser().parseFromString(html,'text/html'));
    if (dialog.open) renderSearchResults();
  }).catch(() => { if (dialog.open) renderSearchResults(); });
}
let searchOrigin;
function openSearch(event) {
  searchOrigin = event.currentTarget;
  if (menuIsOpen) toggleMenu(false,false);
  input.value = ''; results.replaceChildren(); document.body.classList.add('search-open'); dialog.showModal(); input.focus();
}
function closeSearch() { dialog.close(); document.body.classList.remove('search-open'); searchOrigin?.focus({preventScroll:true}); }
$('.search-toggle').addEventListener('click',openSearch);
$('.search-close').addEventListener('click',closeSearch);
dialog.addEventListener('click',event => {if(event.target === dialog) closeSearch();});
dialog.addEventListener('cancel',event => {event.preventDefault();closeSearch();});
function renderSearchResults() {
  results.replaceChildren();
  const query = input.value.toLowerCase().trim();
  if (!query) return;
  const matches = entries.filter(item => `${item.title} ${item.description}`.toLowerCase().includes(query));
  if (!matches.length) {const empty=document.createElement('p');empty.className='search-empty';empty.textContent='No results found.';results.append(empty);return;}
  matches.forEach(item => {
    const link=document.createElement('a');link.className='search-result';link.href=document.getElementById(item.id)?`#${item.id}`:`/#${item.id}`;
    const title=document.createElement('span');title.textContent=`THIEL — ${item.title}`;
    const detail=document.createElement('small');detail.textContent=`#${item.id}`;
    link.append(title,detail);results.append(link);
    link.addEventListener('click',event=>{const card=document.getElementById(item.id);if(!card)return;event.preventDefault();closeSearch();card.scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'center'});card.focus({preventScroll:true});});
  });
}
input.addEventListener('input', renderSearchResults);
input.addEventListener('keydown', event => {
  if(event.key === 'Escape') {event.preventDefault();event.stopPropagation();closeSearch();return;}
  if(event.key === 'ArrowDown') {event.preventDefault();$('.search-result',results)?.focus();}
  if(event.key === 'Enter') {event.preventDefault();$('.search-result',results)?.click();}
});
results.addEventListener('keydown',event=>{
  if(!['ArrowDown','ArrowUp'].includes(event.key))return;
  event.preventDefault();const links=$$('.search-result',results);const index=links.indexOf(document.activeElement);const next=index+(event.key==='ArrowDown'?1:-1);
  if(next<0) input.focus();else links[Math.min(next,links.length-1)]?.focus();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && menuIsOpen)toggleMenu(false);
  if(event.key==='Tab' && menuIsOpen && !dialog.open){
    const controls=[...$$('a,button',$('.site-header')),...$$('a,button',menu)].filter(el=>el.getClientRects().length);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  }
});
