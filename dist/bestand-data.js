// Shared by the browser and the inventory checks. Vehicle edits only need JSON.
export function normalizeVehicles(records) {
  if (!Array.isArray(records)) throw new Error('Fahrzeugdaten müssen eine Liste sein.');
  const ids = new Set();
  return records.map(record => {
    if (!record || typeof record !== 'object') throw new Error('Ungültiger Fahrzeugeintrag.');
    const {id, title, year, image} = record;
    if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || ids.has(id)) throw new Error('Fahrzeug-ID fehlt, ist ungültig oder doppelt.');
    ids.add(id);
    if (typeof title !== 'string' || !title.trim()) throw new Error('Fahrzeugtitel fehlt.');
    if (!Number.isInteger(year) || year < 1886 || year > 2100) throw new Error('Ungültiges Baujahr.');
    if (typeof image !== 'string' || !/^\/assets\/vehicles\/[a-zA-Z0-9_./-]+\.(?:jpe?g|png|webp|avif)$/i.test(image) || image.includes('..')) throw new Error('Bild muss im lokalen Fahrzeugordner liegen.');
    const status = record.status === 'for sale' ? 'available' : record.status;
    if (!['available', 'sold'].includes(status)) throw new Error('Status muss available oder sold sein.');
    for (const field of ['location', 'description', 'imageAlt']) {
      if (record[field] != null && typeof record[field] !== 'string') throw new Error('Ungültiger Text: ' + field);
    }
    const price = record.price ?? '';
    if (!['string', 'number'].includes(typeof price) || (typeof price === 'number' && (!Number.isFinite(price) || price < 0))) throw new Error('Ungültiger Preis.');
    const details = record.details ?? [];
    if (!Array.isArray(details) || details.some(detail => !detail || typeof detail.label !== 'string' || typeof detail.value !== 'string')) throw new Error('Ungültige Fahrzeugdetails.');
    const imagePosition = typeof record.imagePosition === 'string' && /^\d{1,3}% \d{1,3}%$/.test(record.imagePosition) ? record.imagePosition : '50% 50%';
    return {...record, title: title.trim(), status, price, location: record.location || '', description: record.description || '', imageAlt: record.imageAlt || `${title}, Baujahr ${year}`, imagePosition, details};
  }).sort((a, b) => Number(a.status === 'sold') - Number(b.status === 'sold'));
}

export function vehiclePrice(vehicle) {
  // A stale price in a sold record must never reach either visible view.
  if (vehicle.status === 'sold') return '';
  return typeof vehicle.price === 'number'
    ? new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(vehicle.price)
    : vehicle.price.trim();
}
