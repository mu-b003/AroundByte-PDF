// Zero-dependency static server: node serve.mjs [port]
import http from 'http';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const root=path.dirname(fileURLToPath(import.meta.url)),port=+process.argv[2]||8080;
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.json':'application/json'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('Not found')}
  r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(port,()=>console.log('http://localhost:'+port));
