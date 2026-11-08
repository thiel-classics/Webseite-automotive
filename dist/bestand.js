import {normalizeVehicles, vehiclePrice} from './bestand-data.js';

const grid = document.querySelector('#vehicle-grid');
const message = document.querySelector('#inventory-message');
const retry = document.querySelector('#inventory-retry');
const count = document.querySelector('#inventory-count');
const modal = document.querySelector('#vehicle-dialog');
const content = document.querySelector('#vehicle-detail');
const close = document.querySelector('.vehicle-close');
let origin;
let pointerStartedOutside = false;
let loading = false;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
function statusLabel(vehicle) {
  return element('span', `vehicle-status${vehicle.status === 'sold' ? ' is-sold' : ''}`, vehicle.status === 'sold' ? 'SOLD' : 'VERFÜGBAR');
}
function vehicleImage(vehicle, lazy = false) {
  const image = element('img');
  image.src = vehicle.image;
  image.alt = vehicle.imageAlt;
  image.style.objectPosition = vehicle.imagePosition;
  image.decoding = 'async';
  if (lazy) image.loading = 'lazy';
  return image;
}
function openVehicle(vehicle, trigger) {
  origin = trigger;
  const visual = element('div', 'vehicle-detail-visual');
  visual.append(vehicleImage(vehicle));
  const info = element('div', 'vehicle-detail-info');
  const top = element('div', 'vehicle-detail-eyebrow');
  top.append(element('span', '', 'THIEL CLASSIC’N SPORTCARS'), statusLabel(vehicle));
  const title = element('h2', 'vehicle-detail-title', vehicle.title);
  title.id = 'vehicle-detail-title';
  info.append(top, title);
  const price = vehiclePrice(vehicle);
  if (price) info.append(element('p', 'vehicle-detail-price', price));
  const facts = element('dl', 'vehicle-facts');
  const items = [{label: 'Baujahr', value: String(vehicle.year)}];
  if (vehicle.location) items.push({label: 'Herkunft', value: vehicle.location});
  items.push(...vehicle.details.filter(detail => detail.label.trim() && detail.value.trim()));
  for (const item of items) {
    const row = element('div');
    row.append(element('dt', '', item.label), element('dd', '', item.value));
    facts.append(row);
  }
  info.append(facts);
  if (vehicle.description) info.append(element('p', 'vehicle-description', vehicle.description));
  const contact = element('div', 'vehicle-contact');
  contact.append(element('p', 'vehicle-contact-label', 'IM GESPRÄCH BLEIBEN'));
  const mail = element('a', 'text-link', 'info@thiel-classics.de');
  mail.href = 'mailto:info@thiel-classics.de';
  const phone = element('a', 'text-link', '+49 173 4209980');
  phone.href = 'tel:+491734209980';
  contact.append(mail, phone);
  info.append(contact);
  content.replaceChildren(visual, info);
  document.body.classList.add('vehicle-open');
  modal.showModal();
  modal.scrollTop = 0;
  close.focus({preventScroll: true});
}
function closeVehicle() { if (modal.open) modal.close(); }
close.addEventListener('click', closeVehicle);
modal.addEventListener('cancel', event => { event.preventDefault(); closeVehicle(); });
modal.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...modal.querySelectorAll('button,a[href]')];
  const first = controls[0], last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
});
modal.addEventListener('close', () => {
  document.body.classList.remove('vehicle-open');
  origin?.focus({preventScroll: true});
});
function outside(event) {
  const bounds = modal.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
}
modal.addEventListener('pointerdown', event => { pointerStartedOutside = outside(event); });
modal.addEventListener('click', event => {
  if (event.target === modal && pointerStartedOutside && outside(event)) closeVehicle();
  pointerStartedOutside = false;
});

function vehicleCard(vehicle, index) {
  const article = element('article', 'vehicle-card');
  const button = element('button', 'vehicle-button');
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'vehicle-dialog');
  button.setAttribute('aria-label', `${vehicle.title}, ${vehicle.year}${vehicle.status === 'sold' ? ', verkauft' : ''} – Details öffnen`);
  const media = element('span', 'vehicle-media');
  media.append(vehicleImage(vehicle, index > 1));
  const year = element('span', 'vehicle-year', String(vehicle.year));
  const arrow = element('span', 'vehicle-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  media.append(year, arrow);
  const meta = element('span', 'vehicle-meta');
  const heading = element('span', 'vehicle-card-heading');
  heading.append(element('span', 'vehicle-name', vehicle.title), statusLabel(vehicle));
  meta.append(heading);
  const price = vehiclePrice(vehicle);
  if (price) meta.append(element('span', 'vehicle-price', price));
  button.append(media, meta);
  button.addEventListener('click', () => openVehicle(vehicle, button));
  article.append(button);
  return article;
}
async function loadVehicles() {
  if (loading) return;
  loading = true;
  grid.setAttribute('aria-busy', 'true');
  retry.hidden = true;
  message.hidden = false;
  message.textContent = 'Fahrzeuge werden geladen …';
  try {
    const response = await fetch('/data/vehicles.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('Fahrzeugdaten nicht erreichbar.');
    const vehicles = normalizeVehicles(await response.json());
    grid.replaceChildren(...vehicles.map(vehicleCard));
    count.textContent = `${String(vehicles.length).padStart(2, '0')} ${vehicles.length === 1 ? 'FAHRZEUG' : 'FAHRZEUGE'}`;
    message.textContent = vehicles.length ? '' : 'Aktuell sind keine Fahrzeuge im Bestand hinterlegt.';
    message.hidden = vehicles.length > 0;
  } catch {
    count.textContent = 'BESTAND';
    message.textContent = 'Der Bestand kann gerade nicht geladen werden. Bitte versuche es erneut oder kontaktiere uns per E-Mail oder Telefon.';
    retry.hidden = false;
  } finally {
    grid.removeAttribute('aria-busy');
    loading = false;
  }
}
retry.addEventListener('click', loadVehicles);
loadVehicles();
