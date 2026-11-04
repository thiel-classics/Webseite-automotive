import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContactHandler} from './contact-handler.mjs';
// Optional local .env; production may supply the same variables through its host.
try { process.loadEnvFile?.(path.join(path.dirname(fileURLToPath(import.meta.url)), '.env')); }
catch (error) { if (error.code !== 'ENOENT') throw new Error('Lokale Mail-Konfiguration konnte nicht geladen werden.'); }
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.env.PORT || 4173);
const privacyPath=fs.existsSync(path.join(root,'datenschutz/index.html'))?'/datenschutz':fs.existsSync(path.join(root,'datenschutz.html'))?'/datenschutz.html':null;
const contactHandler=createContactHandler({privacyPath});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer(async (req,res)=>{
  let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end('Bad request');}
  try { if(await contactHandler(req,res,url))return; }
  catch { if(!res.headersSent)res.writeHead(500,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end('{"ok":false,"message":"Die Anfrage konnte nicht verarbeitet werden."}'); }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end('Method not allowed');}
  const route=url==='/'?'/index.html':/^\/(about|kontakt|impressum|datenschutz|bestand|ankauf)\/?$/.test(url)?`${url.replace(/\/$/,'')}/index.html`:url;
  const file=path.resolve(root,'.'+route);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(req.method==='HEAD'?undefined:data);});
});
server.requestTimeout=30000;
server.headersTimeout=15000;
server.listen(port,'127.0.0.1',()=>console.log(`Local preview: http://127.0.0.1:${port}`));
