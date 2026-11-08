import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const root=path.resolve('dist');
const pages=['index.html','about/index.html','ankauf/index.html','bestand/index.html','kontakt/index.html','impressum/index.html','datenschutz/index.html'];
for(const page of pages){
  const html=fs.readFileSync(path.join(root,page),'utf8');
  assert.equal((html.match(/<h1\b/g)||[]).length,1,page+': heading');
  assert.ok(html.includes('rel="canonical"'),page+': canonical');
  assert.ok(!/FormSubmit|reCAPTCHA|Made in Framer|FREE REMIX|BUILT AND DESIGNED|ALISON/i.test(html),page+': outdated content');
  assert.ok(!html.includes('thieltrading@web.de'),page+': outdated contact address');
  const footer=html.match(/<footer[\s\S]*?<\/footer>/)?.[0]||'';
  for(const target of ['/impressum','/datenschutz','#top','https://www.instagram.com/thiel_classics/'])assert.ok(footer.includes('href="'+target+'"'),page+': footer '+target);
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const link=match[1];if(/^(?:https?:|mailto:|tel:|#)/.test(link))continue;
    const url=link.split(/[?#]/)[0];
    const resource=path.resolve(url.startsWith('/')?root:path.dirname(path.join(root,page)),'.'+(url.startsWith('/')?url:'/'+url));
    assert.ok(resource.startsWith(root+path.sep)||resource===root,page+': path scope');
    assert.ok(fs.existsSync(resource),page+': missing '+url);
    if(fs.statSync(resource).isDirectory())assert.ok(fs.existsSync(path.join(resource,'index.html')),page+': directory '+url);
  }
}
const contact=fs.readFileSync(path.join(root,'kontakt/index.html'),'utf8');
assert.ok(contact.includes('data-contact-mode="direct"'));
for(const tag of contact.matchAll(/<(?:input|textarea|button)\b[^>]*>/g)){
  if(/contact-(name|email|message|website)|privacy-acknowledgement|kontakt-send/.test(tag[0]))assert.ok(/\bdisabled\b/.test(tag[0]),'contact enabled: '+tag[0]);
}
assert.ok(contact.includes('mailto:info@thiel-classics.de')&&contact.includes('tel:+491734209980'));
assert.match(contact,/<form\b[^>]*action="\/api\/contact"[^>]*method="post"/);
assert.ok(fs.readFileSync(path.join(root,'bestand.js'),'utf8').includes('mailto:info@thiel-classics.de'));
assert.ok(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('aria-label="CLASSIC´N SPORTSCARS"'));
assert.ok(!fs.existsSync(path.join(root,'.env')),'secret file in public folder');
const apache=fs.readFileSync(path.join(root,'.htaccess'),'utf8');
for(const old of ['ueber-uns','impressum','datenschutz','ankauf','automobile','bestand'])assert.ok(apache.includes(old),'missing old route '+old);
for(const js of ['app.js','about.js','services.js','timeless.js','kontakt.js','bestand-data.js','bestand.js','ankauf.js'])execFileSync(process.execPath,['--check',path.join(root,js)]);
console.log('Launch geprüft: 7 Seiten, lokale Links, Metadaten, Footer, Formular-Fallback, Weiterleitungen und JavaScript.');
