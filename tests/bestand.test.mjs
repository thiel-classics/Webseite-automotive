import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeVehicles, vehiclePrice} from '../dist/bestand-data.js';

const vehicle = (id, status, price = '') => ({id, title: id, year: 1966, status, price, image: '/assets/vehicles/example.jpg'});

test('available and for sale precede sold, keeping order inside each group', () => {
  const result = normalizeVehicles([vehicle('sold-one', 'sold'), vehicle('available-one', 'available'), vehicle('sold-two', 'sold'), vehicle('available-two', 'for sale')]);
  assert.deepEqual(result.map(item => item.id), ['available-one', 'available-two', 'sold-one', 'sold-two']);
  assert.equal(result[1].status, 'available');
});
test('sold never exposes a stale number or textual price', () => {
  for (const price of [89900, '89.900 €', 'Preis auf Anfrage']) {
    assert.equal(vehiclePrice(normalizeVehicles([vehicle('sold', 'sold', price)])[0]), '');
  }
  assert.equal(vehiclePrice(normalizeVehicles([vehicle('available', 'available', '')])[0]), '');
  assert.match(vehiclePrice(normalizeVehicles([vehicle('available', 'available', 89900)])[0]), /89\.900.*€/);
  assert.equal(vehiclePrice(normalizeVehicles([vehicle('available', 'available', 'Preis auf Anfrage')])[0]), 'Preis auf Anfrage');
});
test('invalid records fail visibly instead of silently changing sale status', () => {
  assert.throws(() => normalizeVehicles({}));
  assert.throws(() => normalizeVehicles([vehicle('duplicate', 'sold'), vehicle('duplicate', 'available')]));
  assert.throws(() => normalizeVehicles([vehicle('bad-status', 'unknown')]));
  assert.throws(() => normalizeVehicles([{...vehicle('external', 'available'), image: 'https://example.com/image.jpg'}]));
  assert.throws(() => normalizeVehicles([{...vehicle('escape', 'available'), image: '/assets/vehicles/../../secret.jpg'}]));
  assert.deepEqual(normalizeVehicles([]), []);
});
test('editable inventory remains valid and all referenced local images exist', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../dist/data/vehicles.json', import.meta.url), 'utf8'));
  const vehicles = normalizeVehicles(data);
  for (const item of vehicles) assert.ok(fs.statSync(new URL('../dist' + item.image, import.meta.url)).isFile());
});
