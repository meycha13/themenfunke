import test from 'node:test';
import assert from 'node:assert/strict';
import { worlds,topics,people } from '../data.js';
import { DAY,STORE,initialState,active,focused,upsertInterest,extendInterest,overlap,findMatches,createRequest,acceptRequest,blockPerson,loadState,unseenMatches,registerMatchNotice,markMatchesSeen,createDemoMatch,createDemoRequest,escapeHtml } from '../core.js';

const now=1800000000000;
function setup(){const state=initialState();state.demoStart=now;return state;}
function interest(state,id='meerestiere',options={}){return upsertInterest(state,id,{mode:'day',role:'learn',text:'Kraken',...options},now);}

test('14 Themenwelten mit eindeutigen IDs und gültigen Pfaden',()=>{
  assert.equal(worlds.length,14);
  const all=[];function walk(nodes){for(const n of nodes){all.push(n.id);walk(n.children);}}walk(worlds);
  assert.equal(new Set(all).size,all.length);assert.equal(topics.size,all.length);
  for(const t of topics.values()){assert.equal(t.path.at(-1),t.id);assert.ok(worlds.some(w=>w.id===t.world));}
  for(const p of people)for(const i of p.interests)assert.ok(topics.has(i.topicId));
});
test('24 Stunden beginnen bei der Aktivierung und laufen exakt ab',()=>{
  const state=setup(),i=interest(state);assert.ok(active(i,now));assert.ok(focused(i,now));
  assert.ok(active(i,now+DAY-1));assert.equal(active(i,now+DAY),false);
});
test('Dauerhaft plus Tagesfokus erzeugt kein zweites Thema und fällt auf dauerhaft zurück',()=>{
  const state=setup();interest(state,'meerestiere',{mode:'always'});interest(state);
  assert.equal(state.interests.length,1);const i=state.interests[0];
  assert.equal(i.always,true);assert.ok(focused(i,now));assert.ok(active(i,now+DAY));assert.equal(focused(i,now+DAY),false);
});
test('Pausierte dauerhafte Themen sind nicht aktiv',()=>{
  const i=interest(setup(),'meerestiere',{mode:'always'});i.paused=true;assert.equal(active(i,now),false);
});
test('Verlängern addiert zur bestehenden Frist oder beginnt nach Ablauf neu',()=>{
  const i=interest(setup());extendInterest(i,now+1000);assert.equal(i.expiresAt,now+2*DAY);
  extendInterest(i,now+4*DAY);assert.equal(i.expiresAt,now+5*DAY);
});
test('Gleiche Themen und Ober-/Unterthemen passen, Geschwisterthemen nicht',()=>{
  assert.equal(overlap('meerestiere','meerestiere'),'exact');assert.equal(overlap('tierwelt','meerestiere'),'related');
  assert.equal(overlap('meerestiere','tierwelt'),'related');assert.equal(overlap('meerestiere','haustiere'),null);
});
test('Ohne aktive Themen entstehen keine Vorschläge',()=>{
  const state=setup();assert.deepEqual(findMatches(state,people,now),[]);interest(state);assert.ok(findMatches(state,people,now).length);
  assert.deepEqual(findMatches(state,people,now+DAY),[]);
});
test('Exakte gemeinsame Themen werden vor Oberthemen gewichtet',()=>{
  const state=setup();interest(state);
  const custom=[{id:'general',name:'A',interests:[{topicId:'tierwelt',role:'share',text:'',mode:'always'}]},{id:'exact',name:'Z',interests:[{topicId:'meerestiere',role:'learn',text:'',mode:'always'}]}];
  const matches=findMatches(state,custom,now);assert.equal(matches[0].person.id,'exact');
  assert.equal(matches[0].pairs[0].theirs.role,'learn');
});
test('Anfrage speichert unveränderlichen Themenkontext und verhindert Duplikate',()=>{
  const state=setup();interest(state);const m=findMatches(state,people,now)[0];
  const request=createRequest(state,m.person,m.pairs[0],'out',now);state.interests[0].text='Anderer Text';
  assert.equal(request.pair.mine.text,'Kraken');assert.throws(()=>createRequest(state,m.person,m.pairs[0],'out',now));
});
test('Abgelaufene Verbindung kann keine neue Anfrage erzeugen',()=>{
  const state=setup();interest(state);const m=findMatches(state,people,now)[0];
  assert.throws(()=>createRequest(state,m.person,m.pairs[0],'out',now+DAY));assert.equal(state.requests.length,0);
});
test('Bereits versandte Anfrage kann nach Themenablauf angenommen werden',()=>{
  const state=setup();interest(state);const m=findMatches(state,people,now)[0],r=createRequest(state,m.person,m.pairs[0],'out',now);
  state.interests=[];const chat=acceptRequest(state,r.id);assert.equal(state.requests.length,0);assert.equal(state.chats.length,1);assert.equal(chat.pair.mine.topicId,'meerestiere');
  assert.equal(findMatches(state,people,now).length,0);
});
test('Blockieren entfernt Anfragen, erhält Chatverlauf und unterdrückt Vorschläge',()=>{
  const state=setup();interest(state);const m=findMatches(state,people,now)[0],r=createRequest(state,m.person,m.pairs[0],'in',now);
  const chat=acceptRequest(state,r.id);chat.messages.push({text:'Gespräch',from:'me',time:now});blockPerson(state,m.person.id);
  assert.equal(state.chats[0].messages[0].text,'Gespräch');assert.ok(!findMatches(state,people,now).some(x=>x.person.id===m.person.id));
  assert.throws(()=>createRequest(state,m.person,m.pairs[0],'in',now));
});
test('Beendete Kontakte werden nicht neu vorgeschlagen',()=>{
  const state=setup();interest(state);state.ended.push('mooslicht');assert.ok(!findMatches(state,people,now).some(x=>x.person.id==='mooslicht'));
});
test('Ungültige oder gesperrte Speicherung verhindert den Einstieg nicht',()=>{
  assert.equal(loadState({getItem:()=>'{broken'}).version,1);assert.equal(loadState({getItem:()=>{throw new Error('blocked');}}).version,1);
});
test('Gespeicherte Themen und freiwillige Texte werden geladen',()=>{
  const state=setup();interest(state);const storage={getItem:key=>{assert.equal(key,STORE);return JSON.stringify(state);}};
  assert.equal(loadState(storage).interests[0].text,'Kraken');
});
test('Freitexte werden als Text ausgegeben und auf 300 Zeichen begrenzt',()=>{
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  const state=setup();interest(state,'meerestiere',{text:'x'.repeat(400)});assert.equal(state.interests[0].text.length,300);
});
test('Ein Match wird nur einmal gemeldet, auch nach erneutem Laden',()=>{
  const state=setup();interest(state);
  const matches=findMatches(state,people,now);
  assert.ok(registerMatchNotice(state,matches).length);
  assert.equal(registerMatchNotice(state,matches).length,0);
  const reloaded=loadState({getItem:()=>JSON.stringify(state)});
  assert.equal(registerMatchNotice(reloaded,findMatches(reloaded,people,now)).length,0);
  assert.equal(unseenMatches(reloaded,matches).length,matches.length);
});
test('Gesehene Matches verlieren ihre Neu-Markierung und werden nicht erneut gemeldet',()=>{
  const state=setup();interest(state);
  const matches=findMatches(state,people,now);
  markMatchesSeen(state,matches.map(m=>m.person.id));
  assert.equal(unseenMatches(state,matches).length,0);
  assert.equal(registerMatchNotice(state,matches).length,0);
  markMatchesSeen(state,matches.map(m=>m.person.id));
  assert.equal(state.seenMatches.length,matches.length);
});
test('Zusätzliche Themen melden nur tatsächlich neue Personen',()=>{
  const state=setup();interest(state);
  const first=findMatches(state,people,now);registerMatchNotice(state,first);
  interest(state,'fotografie');
  const fresh=registerMatchNotice(state,findMatches(state,people,now));
  assert.ok(fresh.length);
  assert.ok(fresh.every(m=>!first.some(old=>old.person.id===m.person.id)));
});
test('Abgelaufene und blockierte Kontakte zählen nicht als neue Matches',()=>{
  const state=setup();interest(state);
  const first=findMatches(state,people,now);assert.ok(first.length);
  for(const match of first)blockPerson(state,match.person.id);
  assert.equal(unseenMatches(state,findMatches(state,people,now)).length,0);
  state.blocked=[];
  assert.equal(unseenMatches(state,findMatches(state,people,now+DAY)).length,0);
});
test('Bestehende Profile und Chats bleiben bei der Erweiterung um Match-Hinweise erhalten',()=>{
  const state=setup();interest(state);state.profile.name='Bestehendes Profil';
  const m=findMatches(state,people,now)[0],r=createRequest(state,m.person,m.pairs[0],'out',now);
  const chat=acceptRequest(state,r.id);chat.messages.push({from:'me',text:'Bleibt erhalten',time:now});
  delete state.seenMatches;delete state.notifiedMatches;delete state.matchAlerts;
  const loaded=loadState({getItem:()=>JSON.stringify(state)});
  assert.equal(loaded.profile.name,'Bestehendes Profil');assert.equal(loaded.interests.length,1);
  assert.equal(loaded.chats[0].messages[0].text,'Bleibt erhalten');
  assert.deepEqual(loaded.seenMatches,[]);assert.deepEqual(loaded.notifiedMatches,[]);assert.equal(loaded.matchAlerts,true);
});
test('Ein Test-Match funktioniert ohne aktive Themen und lässt sich wiederholen',()=>{
  const state=setup();
  const first=createDemoMatch(state,now),second=createDemoMatch(state,now);
  assert.notEqual(first.id,second.id);assert.equal(state.interests.length,1);assert.equal(state.demoPeople.length,2);
  const matches=findMatches(state,state.demoPeople,now);
  assert.equal(matches.length,2);assert.ok(matches.every(m=>m.pairs[0].kind==='exact'));
  assert.equal(unseenMatches(state,matches).length,2);
});
test('Neue Testkontakte funktionieren auch nach aufgebrauchten, blockierten und gesehenen Beispielen',()=>{
  const state=setup();interest(state);
  state.blocked=people.map(p=>p.id);state.seenMatches=people.map(p=>p.id);state.notifiedMatches=people.map(p=>p.id);
  assert.equal(findMatches(state,people,now).length,0);
  const person=createDemoMatch(state,now),matches=findMatches(state,[...people,...state.demoPeople],now);
  assert.equal(matches.length,1);assert.equal(matches[0].person.id,person.id);
  assert.equal(registerMatchNotice(state,matches).length,1);
});
test('Testanfragen sind wiederholbar und erhalten bestehende Chats und Einstellungen',()=>{
  const state=setup();interest(state,'meerestiere',{mode:'always'});state.matchAlerts=false;
  const first=createDemoRequest(state,now);const chat=acceptRequest(state,first.id);
  chat.messages.push({from:'me',text:'Bleibt erhalten',time:now});
  const second=createDemoRequest(state,now);
  assert.notEqual(first.personId,second.personId);assert.equal(second.direction,'in');
  assert.equal(state.chats[0].messages[0].text,'Bleibt erhalten');assert.equal(state.matchAlerts,false);
  assert.equal(state.interests.length,1);
  const loaded=loadState({getItem:()=>JSON.stringify(state)});
  assert.equal(loaded.demoPeople.length,2);assert.equal(loaded.requests[0].personId,second.personId);
  assert.ok(loaded.demoPeople.some(p=>p.id===loaded.chats[0].personId));
});
test('Ein Test mit pausierten Themen lässt deren Inhalt und Pausenstatus erhalten',()=>{
  const state=setup();const original=interest(state);original.paused=true;
  createDemoMatch(state,now);
  assert.equal(state.interests.find(i=>i.topicId==='meerestiere').paused,true);
  assert.equal(state.interests.find(i=>i.topicId==='meerestiere').text,'Kraken');
  assert.ok(state.interests.some(i=>active(i,now)));
});
