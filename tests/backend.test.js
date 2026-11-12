import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const A='10000000-0000-4000-8000-000000000001',B='10000000-0000-4000-8000-000000000002',C='10000000-0000-4000-8000-000000000003',U='10000000-0000-4000-8000-000000000004';
test('Supabase-Schema: Konten, Eigentumsprüfung, Matching und vertrauliche Chats',async t=>{
 const db=new PGlite();
 await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz); create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated;`);
 for(const id of [A,B,C,U])await db.query('insert into auth.users values($1,$2)',[id,id===U?null:new Date().toISOString()]);
 for(const file of ['202611120001_themenfunke.sql','202611120002_topics.sql'])await db.exec(await readFile(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
 async function as(id,sql,params=[]){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec('set role authenticated');return db.query(sql,params);}
 const snapshot=async id=>(await as(id,'select public.tf_snapshot() as data')).rows[0].data;
 const command=async(id,action,payload)=>(await as(id,'select public.tf_command($1,$2::jsonb) as data',[action,JSON.stringify(payload||{})])).rows[0].data;
 await t.test('Nur bestätigte Konten können zugreifen; Tabellen und Hilfsfunktionen sind gesperrt',async()=>{
   await assert.rejects(snapshot(null));await assert.rejects(snapshot(U));
   await assert.rejects(as(A,'select * from public.tf_profiles'));
   await assert.rejects(as(A,'select public.tf_profile_json($1)',[B]));
 });
 for(const id of [A,B,C])await snapshot(id);
 await t.test('Profil und Themen gehören immer dem angemeldeten Konto',async()=>{
   await command(A,'profile',{id:B,name:'A-Fuchs',avatar:'orbit',color:'sage',bio:'A'});
   assert.equal((await snapshot(A)).profile.name,'A-Fuchs');assert.notEqual((await snapshot(B)).profile.name,'A-Fuchs');
   for(const id of [A,B])await command(id,'topic',{topicId:'meerestiere',role:'exchange',mode:'day',text:'Kraken',expiresAt:99999999999999});
   await command(C,'topic',{topicId:'haustiere',role:'open',mode:'always',text:''});
   const mine=(await snapshot(A)).interests[0];assert.ok(mine.expiresAt-Date.now()<86401000);assert.ok(mine.expiresAt>Date.now());
   assert.deepEqual((await snapshot(A)).people.map(p=>p.id),[B]);
   assert.equal((await snapshot(C)).people.length,0);
 });
 let request,chat;
 await t.test('Nur der Empfänger kann annehmen; ohne Annahme ist kein Chat zugänglich',async()=>{
   request=await command(A,'request',{personId:B,topicId:'meerestiere'});
   assert.equal((await snapshot(B)).requests[0].direction,'in');assert.equal((await snapshot(C)).requests.length,0);
   await assert.rejects(command(A,'accept',{id:request.id}));await assert.rejects(command(C,'accept',{id:request.id}));
   chat=await command(B,'accept',{id:request.id});assert.ok(chat.id);
 });
 await t.test('Nachrichten sind nur für Teilnehmer lesbar und gegen doppelte Zustellung geschützt',async()=>{
   const clientId='20000000-0000-4000-8000-000000000001';
   await command(A,'message',{id:chat.id,text:'Vertraulicher Text',clientId});
   await command(A,'message',{id:chat.id,text:'Vertraulicher Text',clientId});
   const history=(await snapshot(B)).chats[0].messages;
   assert.equal(history.length,1);assert.equal(history[0].text,'Vertraulicher Text');assert.equal(history[0].from,'peer');
   assert.equal((await snapshot(C)).chats.length,0);
   await assert.rejects(command(C,'message',{id:chat.id,text:'Unbefugt',clientId:crypto.randomUUID()}));
   await assert.rejects(as(C,'select * from public.tf_messages'));
 });
 await t.test('Themenablauf beendet keine bestehenden Chats',async()=>{
   await db.exec('reset role');await db.query("update public.tf_interests set expires_at=now()-interval '1 day' where owner_id=$1",[A]);
   assert.ok((await snapshot(A)).interests[0].expiresAt<Date.now());
   await command(A,'message',{id:chat.id,text:'Weiter nach Ablauf',clientId:crypto.randomUUID()});
   assert.equal((await snapshot(B)).chats[0].messages.length,2);
 });
 await t.test('Meldungen werden serverseitig mit Kontext gespeichert und sind für Dritte gesperrt',async()=>{
   await command(A,'report',{personId:B,reason:'Test',text:'Testmeldung',block:false});
   await assert.rejects(command(C,'report',{personId:B,reason:'Unbefugt',text:''}));
   await assert.rejects(as(B,'select * from public.tf_reports'));
   await db.exec('reset role');const reports=(await db.query('select context from public.tf_reports')).rows;
   assert.equal(reports.length,1);assert.equal(reports[0].context.messages.length,2);
 });
 await t.test('Blockieren wirkt beidseitig, endet Nachrichtenversand und erhält bisherigen Verlauf',async()=>{
   await command(A,'block',{personId:B});
   await assert.rejects(command(B,'message',{id:chat.id,text:'Blockierter Versand',clientId:crypto.randomUUID()}));
   const history=(await snapshot(A)).chats[0];assert.equal(history.ended,true);assert.equal(history.messages.length,2);
   await command(A,'unblock',{personId:B});await command(B,'end_chat',{id:chat.id});
   await assert.rejects(command(A,'message',{id:chat.id,text:'Nach Ende',clientId:crypto.randomUUID()}));
 });
 await t.test('Kontolöschung entfernt ausschließlich das eigene Konto und ungültige Sessions verlieren Zugriff',async()=>{
   const result=await command(A,'delete_account',{});assert.equal(result.deleted,true);
   await assert.rejects(snapshot(A));assert.ok((await snapshot(B)).profile.name);assert.ok((await snapshot(C)).profile.name);
   assert.equal((await snapshot(B)).chats.length,0);
 });
 await db.close();
});
