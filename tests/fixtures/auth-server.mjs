// Lokaler Supabase-Transportersatz für Browserprüfungen. Keine echten Zugangsdaten.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {PGlite} from '@electric-sql/pglite';
const root=path.resolve(import.meta.dirname,'../..');
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to anon,authenticated;`);
const users=[['10000000-0000-4000-8000-000000000001','alpha@test.invalid'],['10000000-0000-4000-8000-000000000002','beta@test.invalid']];
for(const [id]of users)await db.query('insert into auth.users values($1,now())',[id]);
for(const file of ['202611120001_themenfunke.sql','202611120002_topics.sql'])await db.exec(await readFile(path.join(root,'supabase/migrations',file),'utf8'));
const sessions=new Map();
function session(id,email){
 const now=Math.floor(Date.now()/1000),encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
 const token=encode({alg:'HS256',typ:'JWT'})+'.'+encode({sub:id,role:'authenticated',aud:'authenticated',iat:now,exp:now+3600,email})+'.test-only';
 sessions.set(token,id);
 return {access_token:token,token_type:'bearer',expires_in:3600,expires_at:now+3600,refresh_token:'r-'+id,user:{id,email,aud:'authenticated',role:'authenticated',email_confirmed_at:new Date().toISOString(),created_at:new Date().toISOString(),app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[]}};
}
let queue=Promise.resolve();
const serial=fn=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/test-reset'&&req.method==='POST'){
   await serial(async()=>{await db.exec('reset role');await db.exec('delete from auth.users');for(const [id] of users)await db.query('insert into auth.users values($1,now())',[id]);sessions.clear();});
   res.writeHead(200,{'Content-Type':'application/json'});res.end('{}');return;
  }
  if(url.pathname.startsWith('/mock/')){
   let text='';for await(const chunk of req)text+=chunk;
   const body=text?JSON.parse(text):{};const route=url.pathname.slice(5);
   const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data));};
   if(req.method==='OPTIONS'){send(200,{});return;}
   if(route==='/auth/v1/token'){
    const user=url.searchParams.get('grant_type')==='refresh_token'?users.find(([id])=>'r-'+id===body.refresh_token):users.find(([,email])=>email===body.email&&body.password==='TestPasswort-123!');
    if(!user){send(400,{msg:'Invalid login credentials'});return;}send(200,session(...user));return;
   }
   const token=(req.headers.authorization||'').replace(/^Bearer /,'');const id=sessions.get(token);
   if(route==='/auth/v1/logout'){send(200,{});return;}
   if(!id){send(401,{message:'Not authenticated'});return;}
   if(route==='/auth/v1/user'){send(200,session(...users.find(([uid])=>uid===id)).user);return;}
   if(route.startsWith('/rest/v1/rpc/')){
    try{
     const data=await serial(async()=>{
      await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');
      const result=route.endsWith('/tf_snapshot')?await db.query('select public.tf_snapshot() as data'):await db.query('select public.tf_command($1,$2::jsonb) as data',[body.action,JSON.stringify(body.payload||{})]);
      return result.rows[0].data;
     });send(200,data);
    }catch(error){send(error.code==='42501'?403:400,{code:error.code,message:error.message});}return;
   }
   send(404,{message:'Unknown test route: '+route});return;
  }
  const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
  const file=path.resolve(root,'docs','.'+relative);
  if(!file.startsWith(path.join(root,'docs')+'/')){res.writeHead(403);res.end();return;}
  const body=await readFile(file);const ext=path.extname(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.png':'image/png'})[ext]||'application/octet-stream'});res.end(body);
 }catch(error){res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({message:error.message}));}
});
server.listen(0,'127.0.0.1',()=>{const url='http://127.0.0.1:'+server.address().port;console.log(url);import('node:fs').then(fs=>fs.writeFileSync('/tmp/themenfunke-auth-test-url',url));});
