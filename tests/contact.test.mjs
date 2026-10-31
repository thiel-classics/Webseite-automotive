import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createContactHandler} from '../contact-handler.mjs';

const origin='http://127.0.0.1:4173';
const body={name:'Test Person', email:'test@example.com', message:'Ein klassischer Porsche.', website:''};
const env={SMTP_HOST:'smtp.example.com', SMTP_PORT:'465', SMTP_SECURE:'true', SMTP_USER:'local-test', SMTP_PASS:'not-a-real-secret', SMTP_FROM:'website@example.com', PRIVACY_NOTICE_READY:'true'};
async function request(handler, {method='POST', pathname='/api/contact', data=body, raw, headers={}, address='127.0.0.1', encrypted=false}={}) {
  const req=Readable.from([Buffer.from(raw ?? JSON.stringify(data))]);
  req.method=method;
  req.headers={host:'127.0.0.1:4173', origin, 'content-type':'application/json', ...headers};
  req.socket={remoteAddress:address, encrypted};
  const result={};
  const res={writeHead(status, responseHeaders){result.status=status;result.headers=responseHeaders;}, end(value){result.body=JSON.parse(value);}};
  await handler(req,res,pathname);
  return result;
}

test('unconfigured SMTP and missing privacy never claim success or send',async t=>{
  let calls=0;
  const transport={sendMail:async()=>{calls++;}};
  for(const options of [{env:{}},{env,privacyPath:null},{env:{...env,PRIVACY_NOTICE_READY:'false'},privacyPath:'/datenschutz'}]) {
    const handler=createContactHandler({...options,transport}); t.after(()=>handler.close());
    const result=await request(handler);
    assert.equal(result.status,503);assert.equal(result.body.ok,false);
  }
  assert.equal(calls,0);
});
test('existing privacy page is linked before review while SMTP remains blocked',async t=>{
  let calls=0;
  const handler=createContactHandler({env:{...env,PRIVACY_NOTICE_READY:'false'},privacyPath:'/datenschutz',transport:{sendMail:async()=>{calls++;}}});
  t.after(()=>handler.close());
  const result=await request(handler,{method:'GET',pathname:'/api/contact/status'});
  assert.equal(result.status,200);assert.equal(result.body.privacyUrl,'/datenschutz');assert.equal(result.body.ready,false);
  assert.equal((await request(handler)).status,503);assert.equal(calls,0);
});
test('origin, host, JSON, malformed and oversized requests are rejected',async t=>{
  const handler=createContactHandler({env:{}});t.after(()=>handler.close());
  assert.equal((await request(handler,{headers:{origin:'https://foreign.example'}})).status,403);
  assert.equal((await request(handler,{headers:{origin:undefined}})).status,403);
  assert.equal((await request(handler,{headers:{host:'foreign.example',origin:'http://foreign.example'}})).status,403);
  assert.equal((await request(handler,{headers:{'sec-fetch-site':'cross-site'}})).status,403);
  assert.equal((await request(handler,{headers:{'content-type':'text/plain'}})).status,415);
  assert.equal((await request(handler,{raw:'{'})).status,400);
  assert.equal((await request(handler,{headers:{'content-length':'30000'}})).status,413);
  assert.equal((await request(handler,{raw:'x'.repeat(25000)})).status,413);
});
test('honeypot, lengths, header injection and missing fields are validated on server',async t=>{
  const handler=createContactHandler({env:{}});t.after(()=>handler.close());
  assert.equal((await request(handler,{data:{...body,website:'bot.example'}})).status,400);
  let result=await request(handler,{data:{name:'',email:'invalid',message:''}});
  assert.equal(result.status,422);assert.deepEqual(Object.keys(result.body.fields),['name','email','message']);
  result=await request(handler,{data:{...body,name:'A'.repeat(101),message:'A'.repeat(5001)}});
  assert.equal(result.status,422);assert.ok(result.body.fields.name);assert.ok(result.body.fields.message);
  assert.equal((await request(handler,{data:{...body,email:'a@example.com\r\nBcc:other@example.com'}})).status,422);
});
test('rate limit expires and does not accept spoofed forwarding headers',async t=>{
  let clock=1000;
  const handler=createContactHandler({env:{},now:()=>clock});t.after(()=>handler.close());
  for(let i=0;i<5;i++)assert.equal((await request(handler)).status,503);
  const result=await request(handler,{headers:{'x-forwarded-for':'1.2.3.4'}});
  assert.equal(result.status,429);assert.equal(result.headers['Retry-After'],'900');
  clock+=900001;assert.equal((await request(handler)).status,503);
});
test('success goes only to fixed recipient as plaintext, visitor address is Reply-To',async t=>{
  let mail;
  const handler=createContactHandler({env,privacyPath:'/datenschutz',transport:{sendMail:async message=>{mail=message;return {accepted:['thieltrading@web.de']};}}});t.after(()=>handler.close());
  const result=await request(handler,{data:{...body,message:'<script>alert(1)</script>'}});
  assert.equal(result.status,200);assert.equal(result.body.ok,true);
  assert.equal(mail.to,'thieltrading@web.de');assert.equal(mail.from.address,env.SMTP_FROM);
  assert.equal(mail.replyTo.address,body.email);assert.equal(mail.html,undefined);
  assert.ok(mail.text.includes('<script>alert(1)</script>'));
  assert.equal(mail.disableFileAccess,true);assert.equal(mail.disableUrlAccess,true);
  assert.ok(!JSON.stringify(result).includes(body.email));
});
test('SMTP rejection does not return success or leak error details',async t=>{
  for(const sendMail of [async()=>{throw new Error('private credential and address');},async()=>({accepted:[]})]){
    const handler=createContactHandler({env,privacyPath:'/datenschutz',transport:{sendMail}});t.after(()=>handler.close());
    const result=await request(handler);
    assert.equal(result.status,502);assert.equal(result.body.ok,false);
    assert.ok(!JSON.stringify(result).includes('private credential'));
  }
});
test('production requires configured HTTPS origin and verified TLS or trusted local proxy',async t=>{
  const handler=createContactHandler({env:{NODE_ENV:'production',PUBLIC_ORIGIN:'https://thiel.example',TRUST_PROXY:'loopback'}});t.after(()=>handler.close());
  const headers={host:'thiel.example',origin:'https://thiel.example'};
  assert.equal((await request(handler,{headers})).status,403);
  assert.equal((await request(handler,{headers,encrypted:true})).status,503);
  assert.equal((await request(handler,{headers:{...headers,'x-forwarded-proto':'https'}})).status,503);
  assert.equal((await request(handler,{headers:{...headers,'x-forwarded-proto':'https'},address:'203.0.113.1'})).status,403);
});
