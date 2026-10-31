import {createHmac, randomBytes} from 'node:crypto';
import nodemailer from 'nodemailer';

const RECIPIENT = 'thieltrading@web.de';
const MAX_BODY = 24576;
const WINDOW_MS = 15 * 60 * 1000;
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

export function createContactHandler({env = process.env, privacyPath = null, transport, now = Date.now} = {}) {
  const production = env.NODE_ENV === 'production';
  const secret = randomBytes(32); // Ephemeral key: no raw IPs or persistent identifiers.
  const attempts = new Map();
  let mailTransport = transport;
  function smtpConfigured() {
    return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && EMAIL.test(env.SMTP_FROM || '') &&
      Number.isInteger(Number(env.SMTP_PORT)) && Number(env.SMTP_PORT) > 0 && Number(env.SMTP_PORT) <= 65535 &&
      ['true', 'false'].includes(env.SMTP_SECURE));
  }
  function config() {
    const mailReady = smtpConfigured();
    const privacyReady = env.PRIVACY_NOTICE_READY === 'true' && Boolean(privacyPath);
    return {
      ready: mailReady && privacyReady,
      privacyUrl: privacyPath,
      message: !mailReady
        ? 'Der Formularversand ist noch nicht eingerichtet. Bitte kontaktiere uns per E-Mail oder Telefon.'
        : !privacyReady
          ? 'Der Formularversand wird nach Prüfung der Datenschutzhinweise freigeschaltet. Bitte kontaktiere uns per E-Mail oder Telefon.'
          : ''
    };
  }
  function send(res, status, body, extra = {}) {
    res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff', ...extra});
    res.end(JSON.stringify(body));
  }
  function sameOrigin(req, required) {
    let expected;
    try {
      if (env.PUBLIC_ORIGIN) {
        expected = new URL(env.PUBLIC_ORIGIN);
        if (expected.origin !== env.PUBLIC_ORIGIN || !['http:', 'https:'].includes(expected.protocol)) return false;
      } else {
        if (production) return false;
        expected = new URL(`http://${req.headers.host}`);
        if (!['127.0.0.1', 'localhost', '[::1]'].includes(expected.hostname)) return false;
      }
      if (production && expected.protocol !== 'https:') return false;
      if (req.headers.host !== expected.host) return false;
      if (req.headers.origin && req.headers.origin !== expected.origin) return false;
      if (required && !req.headers.origin) return false;
      if (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site'])) return false;
      return true;
    } catch { return false; }
  }
  function encrypted(req) {
    if (req.socket.encrypted) return true;
    // Only an explicitly trusted loopback reverse proxy may attest to HTTPS.
    return env.TRUST_PROXY === 'loopback' && LOOPBACK.has(req.socket.remoteAddress) && req.headers['x-forwarded-proto'] === 'https';
  }
  function rateLimit(req) {
    const time = now();
    for (const [key, value] of attempts) if (value.expires <= time) attempts.delete(key);
    const key = createHmac('sha256', secret).update(req.socket.remoteAddress || 'unknown').digest('hex');
    let bucket = attempts.get(key);
    if (!bucket) {
      if (attempts.size >= 10000) return 60;
      bucket = {count:0, expires:time + WINDOW_MS}; attempts.set(key, bucket);
    }
    if (++bucket.count > 5) return Math.max(1, Math.ceil((bucket.expires - time) / 1000));
    return 0;
  }
  // Expire in-memory buckets even when no further requests arrive.
  const cleanup = setInterval(() => {
    const time = now();
    for (const [key, value] of attempts) if (value.expires <= time) attempts.delete(key);
  }, 60000);
  cleanup.unref();

  async function handle(req, res, pathname) {
    if (!['/api/contact', '/api/contact/status'].includes(pathname)) return false;
    if (production && !encrypted(req)) {
      send(res, 403, {ok:false, message:'Bitte verwende eine verschlüsselte Verbindung.'}); return true;
    }
    if (pathname === '/api/contact/status') {
      if (req.method !== 'GET') { send(res, 405, {ok:false, message:'Methode nicht erlaubt.'}, {Allow:'GET'}); return true; }
      if (!sameOrigin(req, false)) { send(res, 403, {ok:false, message:'Anfrage nicht erlaubt.'}); return true; }
      send(res, 200, config()); return true;
    }
    if (req.method !== 'POST') { send(res, 405, {ok:false, message:'Methode nicht erlaubt.'}, {Allow:'POST'}); return true; }
    if (!sameOrigin(req, true)) { send(res, 403, {ok:false, message:'Anfrage nicht erlaubt.'}); return true; }
    const retry = rateLimit(req);
    if (retry) { send(res, 429, {ok:false, message:'Zu viele Anfragen. Bitte versuche es in einigen Minuten erneut.'}, {'Retry-After':String(retry)}); return true; }
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '')) {
      send(res, 415, {ok:false, message:'Bitte verwende das Kontaktformular.'}); return true;
    }
    if (Number(req.headers['content-length']) > MAX_BODY) {
      send(res, 413, {ok:false, message:'Die Anfrage ist zu groß.'}); return true;
    }
    let data;
    try {
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_BODY) { send(res, 413, {ok:false, message:'Die Anfrage ist zu groß.'}); return true; }
        chunks.push(chunk);
      }
      data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch { send(res, 400, {ok:false, message:'Die Anfrage konnte nicht gelesen werden.'}); return true; }
    if (!data || Array.isArray(data) || typeof data !== 'object' || Object.keys(data).some(key => !['name','email','message','website'].includes(key))) {
      send(res, 400, {ok:false, message:'Bitte prüfe die Formularangaben.'}); return true;
    }
    if (data.website !== undefined && (typeof data.website !== 'string' || data.website.trim())) {
      send(res, 400, {ok:false, message:'Die Anfrage konnte nicht verarbeitet werden.'}); return true;
    }
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    const message = typeof data.message === 'string' ? data.message.trim().replace(/\r\n?/g, '\n') : '';
    const fields = {};
    if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) fields.name = 'Bitte gib einen gültigen Namen mit höchstens 100 Zeichen ein.';
    if (!email || email.length > 254 || !EMAIL.test(email) || /[\r\n]/.test(email)) fields.email = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    if (!message || message.length > 5000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) fields.message = 'Bitte schreibe eine Nachricht mit höchstens 5000 Zeichen.';
    if (Object.keys(fields).length) { send(res, 422, {ok:false, message:'Bitte prüfe die markierten Felder.', fields}); return true; }
    const state = config();
    if (!state.ready) { send(res, 503, {ok:false, message:state.message}); return true; }
    try {
      mailTransport ||= nodemailer.createTransport({
        host:env.SMTP_HOST, port:Number(env.SMTP_PORT), secure:env.SMTP_SECURE === 'true',
        requireTLS:true, auth:{user:env.SMTP_USER, pass:env.SMTP_PASS},
        tls:{minVersion:'TLSv1.2', rejectUnauthorized:true},
        connectionTimeout:10000, greetingTimeout:10000, socketTimeout:20000,
        logger:false, debug:false, disableFileAccess:true, disableUrlAccess:true
      });
      const result = await mailTransport.sendMail({
        from:{name:'THIEL Website', address:env.SMTP_FROM}, to:RECIPIENT,
        replyTo:{address:email}, subject:'Neue Fahrzeuganfrage — THIEL',
        text:`Name: ${name}\nE-Mail: ${email}\n\n${message}`,
        disableFileAccess:true, disableUrlAccess:true
      });
      if (!result.accepted?.some(address => String(address).toLowerCase() === RECIPIENT)) throw new Error('Mail not accepted');
      send(res, 200, {ok:true, message:'Vielen Dank! Deine Nachricht wurde an unseren Mailserver übergeben. Wir melden uns bei dir.'});
    } catch {
      // Deliberately do not log SMTP errors: they can contain addresses or credentials.
      send(res, 502, {ok:false, message:'Die Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut oder kontaktiere uns direkt.'});
    }
    return true;
  }
  handle.close = () => { clearInterval(cleanup); attempts.clear(); mailTransport?.close?.(); };
  return handle;
}
