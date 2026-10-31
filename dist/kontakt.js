(() => {
  'use strict';
  const form = document.querySelector('.kontakt-form');
  if (form.dataset.contactMode === 'direct') {
    form.addEventListener('submit', event => event.preventDefault());
    return;
  }
  const status = form.querySelector('.kontakt-status');
  const button = form.querySelector('.kontakt-send');
  const fields = ['name', 'email', 'message'];
  let sending = false;
  function setStatus(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }
  function fieldError(name, message) {
    const field = form.elements.namedItem(name);
    const error = document.getElementById(`${name}-error`);
    field.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message || '';
    error.hidden = !message;
  }
  function validate(name) {
    const field = form.elements.namedItem(name);
    const value = field.value.trim();
    let error = '';
    if (!value) error = {name:'Bitte gib deinen Namen ein.', email:'Bitte gib deine E-Mail-Adresse ein.', message:'Bitte schreibe eine Nachricht.'}[name];
    else if (name === 'email' && (field.validity.typeMismatch || !/^[^\s@<>;,"\\]+@[^\s@<>;,"\\]+\.[^\s@<>;,"\\]+$/.test(value))) error = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    else if (value.length > Number(field.maxLength)) error = `Bitte verwende höchstens ${field.maxLength} Zeichen.`;
    else if (name !== 'message' && /[\r\n\u0000-\u001f\u007f]/.test(value)) error = 'Bitte prüfe deine Eingabe.';
    fieldError(name, error);
    return !error;
  }
  fields.forEach(name => {
    const field = form.elements.namedItem(name);
    field.addEventListener('blur', () => { if (field.value || field.getAttribute('aria-invalid') === 'true') validate(name); });
    field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(name); });
  });
  fetch('/api/contact/status', {credentials:'same-origin', cache:'no-store'})
    .then(response => { if (!response.ok) throw new Error(); return response.json(); })
    .then(config => {
      if (!config.ready) setStatus(config.message);
    }).catch(() => setStatus('Der Formularversand ist momentan nicht verfügbar. Bitte kontaktiere uns per E-Mail oder Telefon.'));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const valid = fields.map(validate).every(Boolean);
    if (!valid) { setStatus('Bitte prüfe die markierten Felder.', true); form.querySelector('[aria-invalid="true"]').focus(); return; }
    sending = true; button.disabled = true; button.textContent = 'WIRD GESENDET …';
    form.setAttribute('aria-busy', 'true'); setStatus('Deine Nachricht wird übermittelt …');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('/api/contact', {
        method:'POST', credentials:'same-origin', signal:controller.signal,
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(Object.fromEntries([...fields, 'website'].map(name => [name, form.elements.namedItem(name).value.trim()])))
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        if (result.fields) fields.forEach(name => fieldError(name, result.fields[name]));
        setStatus(result.message || 'Die Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut.', true);
        if (result.fields) form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      form.reset(); fields.forEach(name => fieldError(name, '')); setStatus(result.message);
    } catch {
      setStatus('Der Versand konnte nicht bestätigt werden. Deine Eingaben bleiben erhalten. Bitte versuche es später erneut oder kontaktiere uns direkt.', true);
    } finally {
      clearTimeout(timeout); sending = false; button.disabled = false; button.textContent = 'SENDEN'; form.removeAttribute('aria-busy');
    }
  });
})();
