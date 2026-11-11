import { topics } from './data.js?v=0.2.0';
export const DAY = 86400000;
export const STORE = 'themenfunke-v1';
export function initialState() {
  return { version:1, started:false, profile:{ name:'Wolkenfuchs',avatar:'orbit',color:'sage',bio:'' }, interests:[], requests:[], chats:[], blocked:[], hidden:[], ended:[], reports:[], seenMatches:[], notifiedMatches:[], matchAlerts:true, demoStart:Date.now() };
}
export function active(interest, now = Date.now()) {
  return !interest.paused && (interest.always || interest.expiresAt > now);
}
export function focused(interest, now = Date.now()) {
  return !interest.paused && interest.mode === 'day' && interest.expiresAt > now;
}
export function upsertInterest(state, topicId, { role='open',text='',mode='day' }, now=Date.now()) {
  if (!topics.has(topicId)) throw new Error('Unbekanntes Thema');
  const previous = state.interests.find(i=>i.topicId===topicId);
  const item = {
    topicId, role, text:text.slice(0,300), mode, paused:false,
    always: mode==='always' || Boolean(previous?.always),
    expiresAt: mode==='always' ? null : now + DAY * ({day:1,three:3,week:7}[mode] || 1)
  };
  state.interests = [...state.interests.filter(i=>i.topicId!==topicId),item];
  return item;
}
export function extendInterest(interest, now=Date.now()) {
  interest.expiresAt = Math.max(interest.expiresAt || 0, now) + DAY;
  interest.paused = false;
  if(interest.mode==='always') interest.mode='day';
}
export function overlap(a,b) {
  if(a===b) return 'exact';
  const first=topics.get(a), second=topics.get(b);
  if(!first || !second) return null;
  return first.path.includes(b) || second.path.includes(a) ? 'related' : null;
}
export function demoInterests(person, state) {
  return person.interests.map(i=>({...i,always:i.mode==='always',expiresAt:state.demoStart + DAY,paused:false}));
}
export function findMatches(state, people, now=Date.now()) {
  const mine=state.interests.filter(i=>active(i,now));
  const excluded=new Set([...state.blocked,...state.hidden,...state.ended,...state.requests.map(r=>r.personId),...state.chats.map(c=>c.personId)]);
  return people.filter(p=>!excluded.has(p.id)).map(person=>{
    const theirs=demoInterests(person,state).filter(i=>active(i,now));
    const pairs=[];
    for(const a of mine) for(const b of theirs) {
      const kind=overlap(a.topicId,b.topicId);
      if(!kind) continue;
      const complementary=(a.role==='learn'&&b.role==='share')||(a.role==='share'&&b.role==='learn');
      const score=(kind==='exact'?100:35)+(focused(a,now)&&focused(b,now)?25:0)+(complementary?10:0);
      pairs.push({ mine:a,theirs:b,kind,score });
    }
    pairs.sort((a,b)=>b.score-a.score);
    return {person,pairs,score:pairs[0]?.score||0};
  }).filter(m=>m.pairs.length).sort((a,b)=>b.score-a.score || a.person.name.localeCompare(b.person.name,'de'));
}
export function createRequest(state, person, pair, direction='out', now=Date.now()) {
  if(state.blocked.includes(person.id)||state.ended.includes(person.id)) throw new Error('Kontakt nicht verfügbar');
  if(state.requests.some(r=>r.personId===person.id)||state.chats.some(c=>c.personId===person.id)) throw new Error('Kontakt besteht bereits');
  if(!pair || !active(pair.mine,now)||!active(pair.theirs,now)||!overlap(pair.mine.topicId,pair.theirs.topicId)) throw new Error('Die Themenverbindung ist nicht mehr aktiv');
  const request={id:crypto.randomUUID(),personId:person.id,direction,createdAt:now,pair:structuredClone(pair)};
  state.requests.push(request);
  return request;
}
export function acceptRequest(state,id) {
  const request=state.requests.find(r=>r.id===id);
  if(!request || state.blocked.includes(request.personId)) throw new Error('Anfrage nicht mehr verfügbar');
  const chat={id:crypto.randomUUID(),personId:request.personId,pair:request.pair,messages:[],createdAt:Date.now()};
  state.chats.push(chat);
  state.requests=state.requests.filter(r=>r.id!==id);
  return chat;
}
export function blockPerson(state,id) {
  if(!state.blocked.includes(id)) state.blocked.push(id);
  state.requests=state.requests.filter(r=>r.personId!==id);
}
export function unseenMatches(state,matches) {
  const seen=new Set(state.seenMatches);
  return matches.filter(match=>!seen.has(match.person.id));
}
export function registerMatchNotice(state,matches) {
  const notified=new Set(state.notifiedMatches);
  const fresh=unseenMatches(state,matches).filter(match=>!notified.has(match.person.id));
  state.notifiedMatches=[...new Set([...state.notifiedMatches,...fresh.map(match=>match.person.id)])];
  return fresh;
}
export function markMatchesSeen(state,ids) {
  state.seenMatches=[...new Set([...state.seenMatches,...ids])];
}
export function loadState(storage) {
  try {
    const saved=JSON.parse(storage.getItem(STORE));
    if(saved?.version===1 && Array.isArray(saved.interests) && Array.isArray(saved.requests) && Array.isArray(saved.chats)) {
      const state={...initialState(),...saved};
      state.profile={...initialState().profile,...saved.profile};
      state.interests=state.interests.filter(i=>topics.has(i.topicId));
      for(const key of ['blocked','hidden','ended','reports','seenMatches','notifiedMatches']) if(!Array.isArray(state[key])) state[key]=[];
      state.matchAlerts=saved.matchAlerts!==false;
      return state;
    }
  } catch { /* Ungültige oder gesperrte lokale Speicherung: neue Sitzung. */ }
  return initialState();
}
export function escapeHtml(value='') {
  return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
