import http from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
    const url=new URL(req.url,'http://localhost');
    const pathname=decodeURIComponent(url.pathname);
    let file=path.resolve(root,'.'+pathname);
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403).end();return;}
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    const {size}=await stat(file);
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Content-Length':size};
    if(path.extname(file)==='.mp4')headers['Accept-Ranges']='bytes';
    const range=path.extname(file)==='.mp4'&&req.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
    let start=0,end=size-1,status=200;
    if(range&&(range[1]||range[2])){
      start=range[1]?Number(range[1]):Math.max(0,size-Number(range[2]));
      end=range[1]&&range[2]?Math.min(size-1,Number(range[2])):size-1;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;headers['Content-Length']=end-start+1;
    }
    res.writeHead(status,headers);
    if(req.method==='HEAD'){res.end();return;}
    const stream=createReadStream(file,{start,end});
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Nicht gefunden');}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
