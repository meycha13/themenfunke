import { worlds, topics, people, roles, durations, avatars } from './data.js';
import { DAY, STORE, initialState, active, focused, upsertInterest, extendInterest, findMatches, createRequest, acceptRequest, blockPerson, loadState, escapeHtml as esc } from './core.js';

let state;
try { state=loadState(localStorage); } catch { state=initialState(); }
let tab=['discover','topics','messages','profile'].includes(location.hash.slice(1))?location.hash.slice(1):'discover';
let modal=null, topicFilter='all', messageTab='chats', currentChat=null, installPrompt=null, storageFailed=false, toastTimer;
const app=document.querySelector('#app'), modalRoot=document.querySelector('#modal-root');
const paths={
  leaf:'M20 4c-8-1-16 2-16 9a7 7 0 0 0 7 7c7 0 10-8 9-16ZM4 20l10-10',
  spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  orbit:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 5c3-4 20 8 18 13S0 10 3 5Z',
  code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 20',
  sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  columns:'m3 7 9-4 9 4H3Zm2 3v8m7-8v8m7-8v8M3 21h18',
  people:'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 21v-3a7 7 0 0 1 14 0v3M19 5a3 3 0 0 1 1 6m0 3a5 5 0 0 1 3 5',
  coffee:'M4 8h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm13 1h2a3 3 0 0 1 0 6h-2M8 2v3m5-3v3',
  compass:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-6-4-3 5-5 3 3-5 5-3Z',
  book:'M12 5C8 2 3 3 2 4v16c3-2 7-1 10 1m0-16c4-3 9-2 10-1v16c-3-2-7-1-10 1V5Z',
  game:'M7 7h10c3 0 5 10 4 12-1 3-4-1-6-3H9c-2 2-5 6-6 3C2 17 4 7 7 7Zm0 3v5m-2-2h4m7-2h.01m2 3h.01',
  palette:'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h4c6 0 4-10-5-10ZM7 8h.01M12 6h.01M17 8h.01M5 13h.01',
  home:'m3 11 9-8 9 8M5 9v12h14V9m-10 12v-7h6v7',
  mountain:'m2 20 8-15 5 9 3-5 5 11H2Zm5-9 3 2 2-2',
  waves:'M2 7c4-6 6 6 10 0s6 6 10 0M2 13c4-6 6 6 10 0s6 6 10 0M2 19c4-6 6 6 10 0s6 6 10 0',
  sprout:'M12 21V11M12 15C3 16 2 9 3 6c7-1 9 3 9 9Zm0-4c0-7 6-9 9-8 0 7-3 9-9 8Z',
  arrow:'M4 12h16m-6-6 6 6-6 6', chevron:'m9 5 7 7-7 7', back:'m15 5-7 7 7 7', close:'m6 6 12 12M6 18 18 6',
  plus:'M12 5v14M5 12h14', check:'m5 12 4 4L20 5', clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2',
  chat:'M21 11a9 9 0 0 1-9 9H4l-2 2V11a9 9 0 0 1 19 0Z', user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3',
  search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6', grid:'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',
  tree:'M12 3v7m-7 4v-4h14v4M2 15h6v6H2Zm7-12h6v5H9Zm7 12h6v6h-6Z', cards:'m6 6 13-3 4 16-13 3L6 6ZM3 5 1 18l6 1',
  more:'M5 12h.01M12 12h.01M19 12h.01', send:'m22 2-7 20-4-9L2 9l20-7ZM11 13 22 2',
  shield:'m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-4 10 3 3 5-6', download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  infinity:'M12 12C5-1-3 12 3 16c5 4 9-4 9-4s4-8 9-4c6 4-2 17-9 4Z', pause:'M8 4v16M16 4v16', trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7', edit:'m4 16 12-12 4 4L8 20l-5 1 1-5Zm10-10 4 4'
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.spark}"/></svg>`;
const avatar=(p,size='')=>`<span class="avatar ${esc(p.color||'sage')} ${size}">${icon(p.avatar||'sprout')}</span>`;
const button=(text,action,cls='btn',extra='')=>`<button type="button" class="${cls}" data-action="${action}" ${extra}>${text}</button>`;
const label=id=>topics.get(id)?.label||'Thema';
const topicPath=id=>topics.get(id)?.path.map(label).join(' › ')||'';
const worldFor=id=>worlds.find(w=>w.id===topics.get(id)?.world)||worlds[0];
const personById=id=>people.find(p=>p.id===id);
const formatTime=time=>new Intl.DateTimeFormat('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(time);
function status(i) {
  if(i.paused) return 'Pausiert';
  if(focused(i)) return `Heute im Fokus · bis ${formatTime(i.expiresAt)}`;
  if(i.always) return 'Darüber könnte ich immer sprechen';
  return i.expiresAt>Date.now()?`Aktiv bis ${formatTime(i.expiresAt)}`:'Abgelaufen';
}
function save() {
  try { localStorage.setItem(STORE,JSON.stringify(state)); storageFailed=false; }
  catch { storageFailed=true; toast('Der Browser kann gerade nicht speichern. Deine Änderungen gelten für diese Sitzung.'); }
}
function toast(text) {
  const element=document.querySelector('#toast');
  element.textContent=text; element.classList.add('visible');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>element.classList.remove('visible'),4200);
}
function go(next) { tab=next; currentChat=null; topicFilter='all'; location.hash=next; render(); window.scrollTo({top:0,behavior:'instant'}); }
const navItems=[['discover','compass','Entdecken'],['topics','grid','Themen'],['messages','chat','Nachrichten'],['profile','user','Profil']];
function render() {
  const incoming=state.requests.filter(r=>r.direction==='in').length;
  app.innerHTML=`<aside class="sidebar"><a class="brand" href="#discover">${icon('spark')}<span>themen<span class="brand-light">funke</span><small>GEMEINSAM INS GESPRÄCH</small></span></a>
    <nav aria-label="Hauptnavigation">${navItems.map(([id,i,title])=>button(`${icon(i)}<span>${title}</span>${id==='messages'&&incoming?`<span class="nav-count">${incoming}</span>`:''}`,'nav',`nav-item ${tab===id?'selected':''}`,`data-tab="${id}" ${tab===id?'aria-current="page"':''}`)).join('')}</nav>
    <div class="sidebar-bottom"><div class="privacy-note">${icon('shield')}<div>Du entscheidest,<br>was du teilst.</div></div>${button(`${avatar(state.profile)}<span>${esc(state.profile.name)}<small>Dein Profil</small></span>${icon('chevron')}`,'nav','profile-shortcut','data-tab="profile"')}</div></aside>
    <div class="app-body"><header class="topbar"><a href="#discover" class="brand mobile-brand">${icon('spark')}<span>themen<span class="brand-light">funke</span></span></a><span class="desktop-greeting">Ein guter Moment für ein gutes Gespräch.</span>${button('<span class="status-dot"></span> Demo entdecken','about','demo-pill')}</header>
    <main id="main" tabindex="-1">${storageFailed?'<div class="notice">Speichern ist in diesem Browser derzeit nicht möglich. Änderungen gelten nur für diese Sitzung.</div>':''}${tab==='discover'?discoverView():tab==='topics'?topicsView():tab==='messages'?messagesView():profileView()}</main>
    <footer class="app-footer">Ein Thema verbindet. Du entscheidest, was daraus wird.<span>Prototyp · Beispielpersonen · Speicherung auf diesem Gerät</span></footer></div>
    <nav class="mobile-nav" aria-label="Mobile Hauptnavigation">${navItems.map(([id,i,title])=>button(`${icon(i)}<span>${title}</span>${id==='messages'&&incoming?'<i class="notification-dot"></i>':''}`,'nav',`${tab===id?'selected':''}`,`data-tab="${id}" ${tab===id?'aria-current="page"':''}`)).join('')}</nav>`;
  renderModal();
}
function discoverView() {
  const interests=state.interests.filter(i=>active(i));
  const allMatches=findMatches(state,people);
  const matches=topicFilter==='all'?allMatches:allMatches.filter(m=>m.pairs.some(p=>p.mine.topicId===topicFilter));
  return `<section class="hero"><div class="hero-copy"><span class="eyebrow">WENIGER SMALLTALK. MEHR GEMEINSAMKEITEN.</span><h1>Dein Thema.<br>Ein neuer <em>Funke.</em></h1><p>Finde Menschen, die darüber sprechen möchten,<br class="desktop-only"> was dich gerade beschäftigt. Ganz ohne Profilshow.</p>${button(`Themen entdecken ${icon('arrow')}`,'catalog','btn primary')}</div><div class="hero-art" aria-hidden="true"><div class="art-orbit"></div><div class="art-tile tile-one">${icon('leaf')}</div><div class="art-tile tile-two">${icon('orbit')}</div><div class="art-bubble">${icon('chat')}<span>Ein Thema verbindet.</span></div><span class="art-star">✳</span><span class="art-dot"></span></div></section>
    <div class="discover-grid"><section class="people-section"><div class="section-heading"><div><span class="eyebrow">GEMEINSAMER GESPRÄCHSSTOFF</span><h2>Vielleicht passt es ja.</h2></div><span class="subtle-count">${matches.length} ${matches.length===1?'Vorschlag':'Vorschläge'}</span></div>
    ${interests.length?`<div class="filter-row" aria-label="Nach Thema filtern">${button('Alle Themen','filter',`chip ${topicFilter==='all'?'active':''}`,'data-id="all"')}${interests.map(i=>button(esc(label(i.topicId)),'filter',`chip ${topicFilter===i.topicId?'active':''}`,`data-id="${i.topicId}"`)).join('')}</div>`:''}
    <p class="demo-caption">${icon('info')} Alle Personen hier sind Beispiele. Anfragen und Antworten werden nur auf deinem Gerät simuliert.</p>
    ${matches.length?`<div class="match-list">${matches.map(matchCard).join('')}</div>`:emptyState(interests.length?'Gerade kein gemeinsamer Funke.':'Was ist gerade dein Thema?',interests.length?'Für deine aktuellen Themen gibt es gerade keine weiteren Beispielpersonen. Wähle ein weiteres Thema oder sieh später wieder vorbei.':'Wähle dein erstes Thema. Danach siehst du Menschen, deren Gesprächswünsche dazu passen.',button(`${icon('plus')} Thema wählen`,'catalog','btn primary')+(state.hidden.length?button('Übersprungene Vorschläge zeigen','unhide','btn secondary'):''),'compass')}
    </section><aside class="right-rail"><section class="rail-card"><div class="section-heading"><h3>Dein Gesprächsstoff</h3>${icon('spark')}</div>${interests.length?interests.slice(0,4).map(i=>`<button class="rail-topic" data-action="edit-topic" data-id="${i.topicId}"><span class="topic-symbol ${worldFor(i.topicId).color}">${icon(worldFor(i.topicId).icon)}</span><span><strong>${esc(label(i.topicId))}</strong><small>${focused(i)?'Heute im Fokus':i.always?'Immer ein Thema':'Gerade aktiv'}</small></span>${icon('chevron')}</button>`).join(''):'<p>Deine Interessen sind der Anfang. Ein Thema genügt.</p>'}${button(`${icon('plus')} Thema hinzufügen`,'catalog','btn soft full')}</section><section class="rail-note"><span class="note-mark">“</span><h3>Neugier braucht<br>kein Profilbild.</h3><p>Ein Pseudonym, ein Thema und Lust auf Austausch. Mehr musst du nicht mitbringen.</p>${icon('sprout')}</section></aside></div>`;
}
function matchCard(match) {
  const {person,pairs}=match, pair=pairs[0], world=worldFor(pair.mine.topicId);
  const extra=[...new Set(pairs.slice(1).filter(p=>p.kind==='exact'&&p.mine.topicId!==pair.mine.topicId).map(p=>label(p.mine.topicId)))];
  return `<article class="match-card"><div class="match-topic ${world.color}">${icon(world.icon)}<span>${pair.kind==='exact'?'Gemeinsam:':'Verwandtes Interesse:'} <strong>${esc(label(pair.mine.topicId))}</strong></span>${pair.kind==='exact'?icon('check'):''}</div><div class="match-content"><div class="person-heading">${avatar(person)}<div><h3>${esc(person.name)}</h3><span>${focused(pair.theirs)?'<span class="little-dot"></span> Heute besonders aktuell':pair.theirs.always?'Ein dauerhaftes Interesse':'Gerade aktiv'}</span></div><span class="example-tag">Beispiel</span></div><span class="role-label">${icon(pair.theirs.role==='learn'?'book':'chat')}${esc(roles[pair.theirs.role])}</span><p class="person-quote">„${esc(pair.theirs.text)}“</p>${pair.kind==='related'?`<p class="related-note">Die andere Person hat „${esc(label(pair.theirs.topicId))}“ gewählt.</p>`:''}${extra.length?`<div class="also-shared">Auch gemeinsam: ${extra.slice(0,2).map(esc).join(' · ')}</div>`:''}<div class="card-actions">${button(`Vorschlag ansehen ${icon('arrow')}`,'person','btn primary',`data-id="${person.id}"`)}${button('Weiter','skip','btn text',`data-id="${person.id}"`)}</div></div></article>`;
}
function emptyState(title,text,actions='',symbol='spark') {
  return `<div class="empty-state"><span class="empty-symbol">${icon(symbol)}</span><h3>${title}</h3><p>${text}</p><div class="empty-actions">${actions}</div></div>`;
}
function topicsView() {
  const live=state.interests.filter(i=>active(i));
  const groups=[['Heute besonders aktuell',live.filter(i=>focused(i))],['Weitere aktive Themen',live.filter(i=>!focused(i)&&!i.always)],['Darüber könnte ich immer sprechen',live.filter(i=>!focused(i)&&i.always)],['Inaktive Themen',state.interests.filter(i=>!active(i))]];
  return `<div class="page-heading"><div><span class="eyebrow">DEIN GESPRÄCHSSTOFF</span><h1>Was dich bewegt.</h1><p>Für heute, für eine Weile oder immer wieder.</p></div>${button(`${icon('plus')} Thema hinzufügen`,'catalog','btn primary')}</div>${!state.interests.length?emptyState('Ein Thema ist ein guter Anfang.','Du musst dich nicht festlegen. Wähle, worüber du jetzt gern sprechen möchtest.',button('Themen entdecken','catalog','btn primary'),'tree'):groups.filter(([,items])=>items.length).map(([title,items])=>`<section class="topic-group"><h2>${title}<span>${items.length}</span></h2><div class="interest-grid">${items.map(interestCard).join('')}</div></section>`).join('')}
    <section class="world-section"><div class="section-heading"><div><span class="eyebrow">FOLGE DEINER NEUGIER</span><h2>14 Welten. Viele Möglichkeiten.</h2></div></div><div class="world-grid">${worlds.map(w=>button(`<span class="topic-symbol ${w.color}">${icon(w.icon)}</span><strong>${esc(w.label)}</strong><small>${esc(w.description)}</small>${icon('arrow')}`,'world','world-card',`data-id="${w.id}"`)).join('')}</div></section>`;
}
function interestCard(i) {
  const world=worldFor(i.topicId);
  return `<article class="interest-card ${!active(i)?'inactive':''}"><div class="interest-top"><span class="topic-symbol ${world.color}">${icon(world.icon)}</span>${button(icon('edit'),'edit-topic','icon-btn',`data-id="${i.topicId}" aria-label="${esc(label(i.topicId))} bearbeiten"`)}</div><span class="tiny-path">${esc(topics.get(i.topicId).path.slice(0,-1).map(label).join(' › '))}</span><h3>${esc(label(i.topicId))}</h3><p class="interest-status">${icon(i.always&&!focused(i)?'infinity':'clock')}${esc(status(i))}</p>${focused(i)&&i.always?'<span class="badge">Auch dauerhaft aktiv</span>':''}<span class="role-label">${esc(roles[i.role])}</span>${i.text?`<p class="interest-text">„${esc(i.text)}“</p>`:''}<div class="interest-actions">${!active(i)?button('Wieder aktivieren','edit-topic','btn soft',`data-id="${i.topicId}"`):i.always&&!focused(i)?button('Heute in den Fokus','focus','btn soft',`data-id="${i.topicId}"`):button('+24 Stunden','extend','btn soft',`data-id="${i.topicId}"`)}${button(icon(i.paused?'check':'pause'),'pause','icon-btn',`data-id="${i.topicId}" aria-label="${i.paused?'Fortsetzen':'Pausieren'}"`)}${button(icon('trash'),'remove-topic','icon-btn',`data-id="${i.topicId}" aria-label="Thema entfernen"`)}</div></article>`;
}
function messagesView() {
  if(currentChat) return chatView(state.chats.find(c=>c.id===currentChat));
  return `<div class="page-heading"><div><span class="eyebrow">AUS THEMEN WERDEN GESPRÄCHE</span><h1>Einfach ins Gespräch.</h1><p>Du entscheidest, mit wem du schreiben möchtest.</p></div></div><div class="segmented message-tabs">${button(`Gespräche <span>${state.chats.length}</span>`,'message-tab',messageTab==='chats'?'selected':'','data-id="chats"')}${button(`Anfragen <span>${state.requests.length}</span>`,'message-tab',messageTab==='requests'?'selected':'','data-id="requests"')}</div>
    <div class="notice demo-notice">${icon('spark')}<div><strong>Dein Testbereich</strong><p>Alle Kontakte sind Beispielpersonen. Du kannst eine eingehende Anfrage erzeugen oder eine versandte Anfrage testweise annehmen.</p>${button('Demo-Anfrage erhalten','demo-incoming','btn text')}</div></div>
    ${messageTab==='chats'?(state.chats.length?`<div class="conversation-list">${state.chats.map(c=>{const p=personById(c.personId);const last=c.messages.at(-1);return button(`${avatar(p)}<span class="conversation-info"><strong>${esc(p.name)}${state.blocked.includes(p.id)?' · Blockiert':c.ended?' · Beendet':''}</strong><small>${esc(last?.text||'Euer Gespräch kann beginnen.')}</small><span class="badge">${esc(label(c.pair.mine.topicId))}</span></span>${icon('chevron')}`,'open-chat','conversation-row',`data-id="${c.id}"`);}).join('')}</div>`:emptyState('Hier ist Platz für ein gutes Gespräch.','Sobald eine Kontaktanfrage angenommen wird, erscheint euer Chat hier.',button('Menschen entdecken','nav','btn primary','data-tab="discover"'),'chat')):(state.requests.length?`<div class="request-list">${state.requests.map(requestCard).join('')}</div>`:emptyState('Noch keine offenen Anfragen.','Entdecke passende Menschen oder spiele eine eingehende Anfrage im Demo-Modus durch.',button('Menschen entdecken','nav','btn primary','data-tab="discover"'),'chat'))}`;
}
function requestCard(r) {
  const p=personById(r.personId),incoming=r.direction==='in';
  const interest=state.interests.find(i=>i.topicId===r.pair.mine.topicId);
  return `<article class="request-card"><div class="person-heading">${avatar(p)}<div><h3>${esc(p.name)}</h3><span>${incoming?'Möchte sich mit dir austauschen':'Deine Anfrage ist offen'}</span></div><span class="example-tag">Beispiel</span></div><span class="badge">${esc(label(r.pair.mine.topicId))}</span><p>„${esc(r.pair.theirs.text)}“</p><small>${!interest||!active(interest)?'Zum Zeitpunkt der Anfrage aktiv · ':''}Angaben vom ${formatTime(r.createdAt)}</small><div class="card-actions">${button(incoming?'Annehmen':'Demo: Annahme testen','accept','btn primary',`data-id="${r.id}"`)}${button(incoming?'Ablehnen':'Zurückziehen','decline','btn secondary',`data-id="${r.id}"`)}${button(icon('more'),'person-menu','icon-btn',`data-id="${p.id}" aria-label="Weitere Kontaktaktionen"`)}</div></article>`;
}
function chatView(chat) {
  if(!chat) { currentChat=null; return messagesView(); }
  const p=personById(chat.personId),locked=state.blocked.includes(p.id)||chat.ended;
  return `<section class="chat-layout"><header class="chat-header">${button(icon('back'),'chat-back','icon-btn','aria-label="Zurück zu Gesprächen"')}${avatar(p,'small')}<div><h2>${esc(p.name)}</h2><small>Beispielperson · Demo-Chat</small></div>${button(icon('more'),'person-menu','icon-btn',`data-id="${p.id}" aria-label="Kontaktaktionen"`)}</header><details class="chat-context"><summary>Euer Gesprächseinstieg: ${esc(label(chat.pair.mine.topicId))}</summary><p><strong>Du:</strong> ${esc(chat.pair.mine.text||roles[chat.pair.mine.role])}</p><p><strong>${esc(p.name)}:</strong> ${esc(chat.pair.theirs.text)}</p><small>Stand bei der Kontaktanfrage. Das Thema darf sich im Gespräch frei entwickeln.</small></details><div class="chat-messages" aria-live="polite"><div class="chat-start">${icon('sprout')}<p>Ein gemeinsames Thema. Der Rest liegt bei euch.</p><small>Es gibt keine vorgegebene Frage.</small></div>${chat.messages.map(m=>`<div class="message ${m.from==='me'?'mine':'theirs'}"><p>${esc(m.text).replaceAll('\n','<br>')}</p><small>${m.from==='demo'?'Simulierte Antwort · ':''}${new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit'}).format(m.time)}</small></div>`).join('')}</div>${locked?`<div class="notice">${state.blocked.includes(p.id)?'Du hast diese Person blockiert.':'Dieses Gespräch wurde beendet.'} Der Verlauf bleibt für dich lesbar.</div>`:`<div class="demo-reply">${button(`${icon('spark')} Demo-Antwort simulieren`,'demo-reply','btn text',`data-id="${chat.id}"`)}</div><form id="chat-form" class="chat-compose" data-id="${chat.id}"><label class="sr-only" for="message-input">Nachricht</label><textarea id="message-input" name="message" rows="1" maxlength="3000" placeholder="Was möchtest du erzählen?" required>${esc(chat.draft||'')}</textarea><button class="send-button" type="submit" aria-label="Nachricht senden">${icon('send')}</button></form>`}</section>`;
}
function profileView() {
  return `<div class="page-heading"><div><span class="eyebrow">SO VIEL DU MÖCHTEST. SO WENIG DU MUSST.</span><h1>Ganz du. Ganz frei.</h1><p>Deine Themen sagen schon viel. Alles Weitere ist freiwillig.</p></div></div><div class="profile-grid"><section class="panel"><form id="profile-form"><div class="profile-intro">${avatar(state.profile,'large')}<div><h2>Dein Auftritt</h2><p>Ein Pseudonym genügt.</p></div></div><label for="profile-name">Pseudonym</label><input id="profile-name" name="name" maxlength="28" required value="${esc(state.profile.name)}" autocomplete="nickname"><fieldset><legend>Dein Avatar</legend><div class="avatar-options">${avatars.map(a=>button(avatar({...state.profile,avatar:a}),'avatar',`avatar-option ${state.profile.avatar===a?'selected':''}`,`data-id="${a}" aria-label="Avatar ${a}" aria-pressed="${state.profile.avatar===a}"`)).join('')}</div></fieldset><fieldset><legend>Deine Farbe</legend><div class="color-options">${['sage','peach','lavender','blue','sand'].map(c=>button(state.profile.color===c?icon('check'):'','color',`color-option ${c}`,`data-id="${c}" aria-label="Farbe ${c}" aria-pressed="${state.profile.color===c}"`)).join('')}</div></fieldset><label for="profile-bio">Ein paar Worte über dich <span class="optional">optional</span></label><textarea id="profile-bio" name="bio" rows="3" maxlength="300" placeholder="Was möchtest du anderen mitgeben?">${esc(state.profile.bio)}</textarea><p class="field-hint">Dein Pseudonym, Avatar, aktive Themen und dieser Text sind für passende Kontakte sichtbar.</p><button class="btn primary" type="submit">Änderungen speichern</button></form></section><div class="profile-aside"><section class="panel"><h2>Auf deinem Handy</h2><p>Öffne Themenfunke wie eine App direkt vom Startbildschirm.</p>${button(`${icon('download')} App hinzufügen`,'install','btn secondary full')}<small>Auf iPhone: Safari → Teilen → Zum Home-Bildschirm. Auf Android: Browsermenü → App installieren.</small></section><section class="panel"><h2>Deine Daten</h2><p>Dieser Prototyp speichert dein Profil, Themen und Demo-Chats nur in diesem Browser. Es gibt keine Registrierung und keinen Versand an andere Personen.</p><p>Nach dem ersten Laden funktioniert die App auch offline. Zwischen verschiedenen Geräten wird noch nichts synchronisiert.</p>${button('Blockierte Personen verwalten','blocked','btn text')}${button('Demo und Datenschutz','about','btn text')}${button('Lokale Daten zurücksetzen','reset','btn text danger')}</section></div></div>`;
}

function openModal(next) { modal=next; renderModal(); }
function closeModal() { modal=null; renderModal(); }
function renderModal() {
  if(!modal) { modalRoot.innerHTML=''; return; }
  const content=modal.type==='welcome'?welcomeModal():modal.type==='catalog'?catalogModal():modal.type==='editor'?editorModal():modal.type==='person'?personModal():modal.type==='menu'?menuModal():modal.type==='report'?reportModal():modal.type==='blocked'?blockedModal():modal.type==='confirm'?confirmModal():aboutModal();
  modalRoot.innerHTML=`<dialog class="modal ${modal.type==='catalog'?'catalog-modal':''}" aria-labelledby="modal-title"><div class="modal-heading">${modal.type==='catalog'&&modal.parent?button(icon('back'),'catalog-back','icon-btn','aria-label="Übergeordnetes Thema"'):'<span></span>'}${button(icon('close'),'close-modal','icon-btn','aria-label="Schließen"')}</div>${content}</dialog>`;
  const dialog=modalRoot.querySelector('dialog'); dialog.showModal();
  dialog.addEventListener('cancel',()=>{modal=null;});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) closeModal();}});
}
function welcomeModal() {
  return `<div class="welcome-content"><span class="welcome-symbol">${icon('spark')}</span><span class="eyebrow">WILLKOMMEN BEI THEMENFUNKE</span><h2 id="modal-title">Gute Gespräche<br>fangen mit Neugier an.</h2><p>Entdecke Menschen über gemeinsame Themen. Ohne Foto-Pflicht, ohne Profilfragebogen. Mit so viel Persönlichkeit, wie du teilen möchtest.</p><div class="welcome-points"><span>${icon('tree')} Themen statt Profilshow</span><span>${icon('clock')} Heute oder immer wieder</span><span>${icon('shield')} Du entscheidest über Kontakt</span></div>${button(`Mein erstes Thema wählen ${icon('arrow')}`,'start','btn primary full')}${button('Mit Meerestieren ausprobieren','quickstart','btn secondary full')}<small>Testversion mit Beispielpersonen. Deine Eingaben bleiben auf diesem Gerät.</small></div>`;
}
function catalogModal() {
  const parent=topics.get(modal.parent);
  return `<span class="eyebrow">FOLGE DEINER NEUGIER</span><h2 id="modal-title">${parent?esc(parent.label):'Worüber möchtest du sprechen?'}</h2>${parent?`<p class="breadcrumb">${esc(topicPath(parent.id))}</p>`:'<p>Du kannst jeden Bereich auswählen oder tiefer eintauchen.</p>'}<label class="search-field">${icon('search')}<input id="topic-search" type="search" placeholder="Thema suchen" value="${esc(modal.query||'')}" aria-label="Thema im gesamten Katalog suchen"></label><div class="segmented catalog-toggle">${button(`${icon('tree')} Themenbaum`,'catalog-view',modal.view!=='cards'?'selected':'','data-id="tree"')}${button(`${icon('cards')} Themenkarten`,'catalog-view',modal.view==='cards'?'selected':'','data-id="cards"')}</div><div id="catalog-results">${catalogResults()}</div>${parent&&!modal.query?button(`„${esc(parent.label)}“ auswählen ${icon('check')}`,'select-topic','btn primary full sticky-select',`data-id="${parent.id}"`):''}`;
}
function catalogEntries() {
  if(modal.query?.trim()) {
    const query=modal.query.trim().toLocaleLowerCase('de');
    return [...topics.values()].filter(t=>t.label.toLocaleLowerCase('de').includes(query)).slice(0,45);
  }
  const parent=topics.get(modal.parent);
  if(modal.view==='cards'&&!parent) return ['meerestiere','weltraum','windenergie','steinzeit','astrologie','fotografie','fantasy','zimmerpflanzen','brettspiele','wandern','freundschaften','programmieren','sprachen','kochen'].map(id=>topics.get(id));
  return parent?.children||worlds;
}
function catalogResults() {
  const entries=catalogEntries();
  if(!entries.length) return `<div class="catalog-empty"><h3>${modal.query?'Noch kein eigener Eintrag.':'Hier kannst du dein Thema auswählen.'}</h3><p>${modal.query?'Wähle einen passenden Oberbegriff und ergänze dein besonderes Interesse im Freitext.':'Spezielle Interessen kannst du im nächsten Schritt ergänzen.'}</p>${modal.query?button('Alle Themenwelten ansehen','catalog-clear','btn secondary'):''}</div>`;
  if(modal.view==='cards'&&!modal.query) {
    const item=entries[(modal.index||0)%entries.length],world=worldFor(item.id);
    return `<div class="swipe-card ${world.color}" data-swipe="${item.id}"><span class="swipe-hint">${((modal.index||0)%entries.length)+1} / ${entries.length}</span><div class="swipe-illustration">${icon(world.icon)}</div><span class="tiny-path">${esc(topicPath(item.id).split(' › ').slice(0,-1).join(' › '))}</span><h3>${esc(item.label)}</h3>${item.children.length?button('Unterthemen ansehen','browse','btn text',`data-id="${item.id}"`):'<p>Dein genauer Schwerpunkt kommt in den Freitext.</p>'}</div><div class="swipe-actions">${button(`${icon('close')} Weiter`,'next-card','btn secondary')}${button(`${icon('check')} Auswählen`,'select-topic','btn primary',`data-id="${item.id}"`)}</div><p class="field-hint centered">Nach links weiter · nach rechts auswählen. Beides geht auch per Schaltfläche.</p>`;
  }
  return `<div class="catalog-list">${entries.map(item=>{const world=worldFor(item.id);return `<div class="catalog-row"><button class="catalog-row-main" data-action="${item.children.length?'browse':'select-topic'}" data-id="${item.id}"><span class="topic-symbol ${world.color}">${icon(world.icon)}</span><span><strong>${esc(item.label)}</strong><small>${modal.query?esc(topicPath(item.id).split(' › ').slice(0,-1).join(' › ')):item.children.length?`${item.children.length} Unterbereiche`:'Thema auswählen'}</small></span>${icon(item.children.length?'chevron':'plus')}</button>${item.children.length?button(icon('plus'),'select-topic','icon-btn',`data-id="${item.id}" aria-label="${esc(item.label)} direkt auswählen"`):''}</div>`;}).join('')}</div>`;
}
function editorModal() {
  const i=state.interests.find(x=>x.topicId===modal.topicId),world=worldFor(modal.topicId);
  const mode=i?.always&&!focused(i)?'always':i?.mode||'day';
  return `<span class="topic-symbol ${world.color}">${icon(world.icon)}</span><p class="breadcrumb">${esc(topicPath(modal.topicId))}</p><h2 id="modal-title">${esc(label(modal.topicId))}</h2><form id="interest-form" data-id="${modal.topicId}"><fieldset><legend>Wie möchtest du darüber sprechen? <span class="optional">optional</span></legend><div class="option-grid">${Object.entries(roles).map(([id,title])=>`<label class="radio-option"><input type="radio" name="role" value="${id}" ${(i?.role||'open')===id?'checked':''}><span>${esc(title)}</span></label>`).join('')}</div></fieldset><fieldset><legend>Wie lange soll dein Thema aktiv bleiben?</legend><div class="duration-options">${Object.entries(durations).map(([id,title])=>`<label class="radio-option duration-option"><input type="radio" name="mode" value="${id}" ${mode===id?'checked':''} required><span><strong>${title}</strong>${id==='day'?'<small>Heute besonders aktuell</small>':id==='always'?'<small>Darüber könnte ich immer sprechen</small>':''}</span></label>`).join('')}</div>${i?.always?`<label class="checkbox-label"><input type="checkbox" name="keepAlways" checked> Zusätzlich dauerhaft aktiv lassen</label>`:''}</fieldset><label for="interest-text">Was interessiert dich daran gerade besonders? <span class="optional">optional</span></label><textarea id="interest-text" name="text" maxlength="300" rows="3" placeholder="Zum Beispiel: Mich interessieren vor allem Kraken.">${esc(i?.text||'')}</textarea><p class="field-hint">Dieser Text wird anderen bei passenden Vorschlägen angezeigt. Maximal 300 Zeichen.</p><button type="submit" class="btn primary full">${i?'Gesprächswunsch speichern':'Thema aktivieren'} ${icon('arrow')}</button></form>`;
}
function personModal() {
  const match=findMatches(state,people).find(m=>m.person.id===modal.personId);
  if(!match) return `<h2 id="modal-title">Dieser Vorschlag hat sich geändert.</h2><p>Die Themenverbindung ist nicht mehr aktiv oder es besteht bereits ein Kontakt.</p>${button('Zurück zu Entdecken','close-modal','btn primary')}`;
  const {person,pairs}=match,pair=pairs[0];
  return `<span class="eyebrow">${pair.kind==='exact'?'GEMEINSAMER GESPRÄCHSSTOFF':'VERWANDTES INTERESSE'}</span><h2 id="modal-title">${esc(label(pair.mine.topicId))}</h2><div class="person-heading detail-person">${avatar(person)}<div><h3>${esc(person.name)}</h3><span>Beispielperson</span></div></div>${pair.kind==='related'?`<div class="notice">Du hast „${esc(label(pair.mine.topicId))}“ gewählt, ${esc(person.name)} „${esc(label(pair.theirs.topicId))}“. Die Themen liegen im selben Zweig.</div>`:''}<div class="compare-card"><strong>${esc(person.name)} möchte ${esc(roles[pair.theirs.role].toLocaleLowerCase('de'))}.</strong><p>„${esc(pair.theirs.text)}“</p><small>${esc(status(pair.theirs))}</small></div><div class="compare-card mine"><strong>Dein Gesprächswunsch</strong><span class="role-label">${esc(roles[pair.mine.role])}</span><p>${pair.mine.text?`„${esc(pair.mine.text)}“`:'Du hast keinen Freitext ergänzt.'}</p><small>${esc(status(pair.mine))}</small></div><p class="detail-bio">${esc(person.bio)}</p><p class="field-hint">Mit der Anfrage werden dein Pseudonym, Avatar und der oben gezeigte Gesprächswunsch geteilt. Schreiben könnt ihr nach Annahme. In dieser Demo bleibt alles auf deinem Gerät.</p>${button(`Kontakt anfragen ${icon('arrow')}`,'send-request','btn primary full',`data-id="${person.id}"`)}<div class="detail-secondary">${button('Weiter','skip','btn text',`data-id="${person.id}"`)}${button('Blockieren oder melden','person-menu','btn text',`data-id="${person.id}"`)}</div>`;
}
function menuModal() {
  const person=personById(modal.personId),chat=state.chats.find(c=>c.personId===person.id);
  return `<h2 id="modal-title">Kontakt mit ${esc(person.name)}</h2><p>Du entscheidest, wie es weitergeht.</p><div class="menu-actions">${button(`${icon('shield')} ${state.blocked.includes(person.id)?'Blockierung aufheben':'Person blockieren'}`,'block','btn secondary',`data-id="${person.id}"`)}${button('Inhalt melden','report','btn secondary',`data-id="${person.id}"`)}${chat&&!chat.ended?button('Gespräch beenden','end-chat','btn secondary',`data-id="${chat.id}"`):''}</div><p class="field-hint">Blockieren stoppt weitere Anfragen und Nachrichten. Ein vorhandener Verlauf bleibt für dich lesbar.</p>`;
}
function reportModal() {
  const p=personById(modal.personId);
  const chat=state.chats.find(c=>c.personId===p.id),request=state.requests.find(r=>r.personId===p.id);
  const context=chat?chat.messages.map(m=>`${m.from==='me'?'Du':p.name}: ${m.text}`).join('\n'):(request?.pair.theirs.text||p.interests.map(i=>i.text).join('\n'));
  return `<h2 id="modal-title">Inhalt melden</h2><div class="notice">Demo: Es gibt noch keinen echten Meldeeingang. Diese Meldung wird nur lokal gespeichert.</div><form id="report-form" data-id="${p.id}"><label for="report-reason">Grund</label><select id="report-reason" name="reason"><option>Belästigung</option><option>Spam</option><option>Unangemessene Inhalte</option><option>Anderer Grund</option></select><label for="report-text">Erläuterung <span class="optional">optional</span></label><textarea id="report-text" name="text" rows="3" maxlength="1000"></textarea><details><summary>Vorschau der erfassten Inhalte</summary><p>Pseudonym: ${esc(p.name)}</p><pre class="report-preview">${esc(context||'Noch keine Nachrichten.')}</pre></details><label class="checkbox-label"><input name="block" type="checkbox" checked> Zusätzlich blockieren</label><button type="submit" class="btn primary full">Demo-Meldung lokal speichern</button></form>`;
}
function blockedModal() {
  return `<h2 id="modal-title">Blockierte Personen</h2>${state.blocked.length?state.blocked.map(id=>{const p=personById(id);return `<div class="blocked-row">${avatar(p,'small')}<strong>${esc(p.name)}</strong>${button('Freigeben','block','btn secondary',`data-id="${id}"`)}</div>`;}).join(''):'<p>Du hast niemanden blockiert.</p>'}`;
}
function confirmModal() {
  if(modal.kind==='remove') return `<h2 id="modal-title">Thema entfernen?</h2><p>„${esc(label(modal.topicId))}“ wird aus deinen Gesprächswünschen entfernt. Bestehende Chats bleiben erhalten.</p>${button('Entfernen','confirm-remove','btn primary full',`data-id="${modal.topicId}"`)}`;
  if(modal.kind==='end') return `<h2 id="modal-title">Gespräch beenden?</h2><p>Ihr könnt danach keine weiteren Nachrichten schreiben. Der Verlauf bleibt lesbar und die Person wird dir nicht erneut vorgeschlagen.</p>${button('Gespräch beenden','confirm-end','btn primary full',`data-id="${modal.chatId}"`)}`;
  return `<h2 id="modal-title">Lokale Daten zurücksetzen?</h2><p>Dein Profil, deine Themen, Anfragen und Demo-Chats in diesem Browser werden gelöscht. Das lässt sich nicht rückgängig machen.</p>${button('Zurücksetzen','confirm-reset','btn primary full')}`;
}
function aboutModal() {
  return `<span class="eyebrow">EIN ERSTER FUNKE</span><h2 id="modal-title">Dein Prototyp zum Ausprobieren.</h2><p>Themenfunke bringt Menschen über gemeinsame Gesprächsthemen zusammen. In dieser Version kannst du den gesamten Ablauf mit Beispielpersonen testen.</p><ul class="about-list"><li>Alle Personen und Antworten sind fiktiv.</li><li>Anfragen, Chats und Meldungen bleiben in deinem Browser.</li><li>Es gibt keine echten Push-Nachrichten, Konten oder Kontakte.</li><li>Nach dem ersten Laden kannst du die App offline öffnen.</li><li>Deine Eingaben werden nicht zwischen Geräten synchronisiert.</li></ul><p>Gehostet wird die App über GitHub Pages. Beim Laden gelten zusätzlich die Datenschutzbedingungen des Hosting-Anbieters.</p>${button('Verstanden','close-modal','btn primary full')}`;
}

async function action(element) {
  const a=element.dataset.action,id=element.dataset.id;
  switch(a) {
    case 'nav': closeModal(); go(element.dataset.tab); break;
    case 'about': openModal({type:'about'}); break;
    case 'start': state.started=true;save();openModal({type:'catalog',view:'tree'});break;
    case 'quickstart': state.started=true;upsertInterest(state,'meerestiere',{role:'learn',mode:'day',text:'Mich interessieren vor allem Kraken.'});save();closeModal();go('discover');toast('Dein erster Gesprächswunsch ist für 24 Stunden aktiv.');break;
    case 'catalog': openModal({type:'catalog',view:'tree'});break;
    case 'world': openModal({type:'catalog',parent:id,view:'tree'});break;
    case 'catalog-view': modal.view=id;modal.index=0;renderModal();break;
    case 'browse': modal.parent=id;modal.query='';modal.index=0;renderModal();break;
    case 'catalog-back': {const path=topics.get(modal.parent)?.path||[];modal.parent=path.at(-2)||'';modal.query='';modal.index=0;renderModal();break;}
    case 'catalog-clear': openModal({type:'catalog',view:'tree'});break;
    case 'next-card': modal.index=(modal.index||0)+1;renderModal();break;
    case 'select-topic': case 'edit-topic': openModal({type:'editor',topicId:id});break;
    case 'close-modal': closeModal();break;
    case 'filter': topicFilter=id;render();break;
    case 'person': openModal({type:'person',personId:id});break;
    case 'skip': state.hidden.push(id);save();closeModal();render();toast('Vorschlag übersprungen. Du kannst ihn später wieder einblenden.');break;
    case 'unhide': state.hidden=[];save();render();break;
    case 'send-request': {const match=findMatches(state,people).find(m=>m.person.id===id);if(!match)throw new Error('Dieser Vorschlag ist nicht mehr aktiv.');createRequest(state,match.person,match.pairs[0]);save();closeModal();messageTab='requests';go('messages');toast('Demo-Anfrage gesendet. Du kannst die Annahme jetzt testen.');break;}
    case 'focus': {const i=state.interests.find(t=>t.topicId===id);i.mode='day';i.expiresAt=Date.now()+DAY;i.paused=false;save();render();toast('Für 24 Stunden im Fokus. Dein dauerhaftes Interesse bleibt bestehen.');break;}
    case 'extend': {extendInterest(state.interests.find(t=>t.topicId===id));save();render();toast('Um 24 Stunden verlängert.');break;}
    case 'pause': {const i=state.interests.find(t=>t.topicId===id);if(i.paused){openModal({type:'editor',topicId:id});}else{i.paused=true;save();render();toast('Thema pausiert. Bestehende Chats bleiben erhalten.');}break;}
    case 'remove-topic': openModal({type:'confirm',kind:'remove',topicId:id});break;
    case 'confirm-remove': state.interests=state.interests.filter(i=>i.topicId!==id);save();closeModal();render();toast('Thema entfernt.');break;
    case 'message-tab': messageTab=id;render();break;
    case 'demo-incoming': {const match=findMatches(state,people)[0];if(!match){toast('Wähle ein weiteres aktives Thema, um eine passende Demo-Anfrage zu erzeugen.');break;}createRequest(state,match.person,match.pairs[0],'in');save();messageTab='requests';render();toast('Eine eingehende Demo-Anfrage wurde erzeugt.');break;}
    case 'accept': {const chat=acceptRequest(state,id);currentChat=chat.id;save();render();break;}
    case 'decline': state.requests=state.requests.filter(r=>r.id!==id);save();render();toast('Anfrage geschlossen.');break;
    case 'open-chat': currentChat=id;render();scrollChat();break;
    case 'chat-back': currentChat=null;render();break;
    case 'demo-reply': {const chat=state.chats.find(c=>c.id===id);if(chat.ended||state.blocked.includes(chat.personId))throw new Error('Dieses Gespräch ist nicht mehr aktiv.');const replies=['Das klingt spannend. Was interessiert dich daran gerade besonders?','Ich mag es, wie viele verschiedene Seiten dieses Thema hat. Erzähl gern mehr.','Danke fürs Teilen! Genau für solche Gedanken ist ein Gespräch schön.'];chat.messages.push({from:'demo',text:replies[chat.messages.filter(m=>m.from==='demo').length%replies.length],time:Date.now()});save();render();scrollChat();break;}
    case 'person-menu': openModal({type:'menu',personId:id});break;
    case 'block': {if(state.blocked.includes(id)){state.blocked=state.blocked.filter(p=>p!==id);toast('Blockierung aufgehoben.');}else{blockPerson(state,id);toast('Person blockiert.');}save();closeModal();render();break;}
    case 'report': openModal({type:'report',personId:id});break;
    case 'blocked': openModal({type:'blocked'});break;
    case 'end-chat': openModal({type:'confirm',kind:'end',chatId:id});break;
    case 'confirm-end': {const c=state.chats.find(c=>c.id===id);c.ended=true;if(!state.ended.includes(c.personId))state.ended.push(c.personId);save();closeModal();render();break;}
    case 'avatar': case 'color': {const form=document.querySelector('#profile-form');if(form){state.profile.name=form.elements.name.value;state.profile.bio=form.elements.bio.value;}state.profile[a]=id;save();render();break;}
    case 'install': if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;}else openModal({type:'about'});toast('iPhone: Safari → Teilen → Zum Home-Bildschirm. Android: Browsermenü → App installieren.');break;
    case 'reset': openModal({type:'confirm',kind:'reset'});break;
    case 'confirm-reset': {state=initialState();save();currentChat=null;tab='discover';topicFilter='all';location.hash='discover';modal={type:'welcome'};render();break;}
  }
}
document.addEventListener('click',event=>{
  const element=event.target.closest('[data-action]');
  if(element) action(element).catch(error=>toast(error.message||'Das hat gerade nicht funktioniert.'));
});
document.addEventListener('submit',event=>{
  const form=event.target;
  if(!['interest-form','profile-form','chat-form','report-form'].includes(form.id)) return;
  event.preventDefault();
  const data=new FormData(form);
  try {
    if(form.id==='interest-form') {
      const item=upsertInterest(state,form.dataset.id,{role:data.get('role')||'open',mode:data.get('mode'),text:data.get('text').trim()});
      if(form.elements.keepAlways&&!data.has('keepAlways')&&data.get('mode')!=='always')item.always=false;
      state.started=true;save();closeModal();render();toast('Gesprächswunsch gespeichert. Entdecke jetzt passende Menschen.');
    } else if(form.id==='profile-form') {
      state.profile.name=data.get('name').trim()||'Wolkenfuchs';state.profile.bio=data.get('bio').trim();save();render();toast('Dein Profil wurde gespeichert.');
    } else if(form.id==='chat-form') {
      const text=data.get('message').trim();if(!text)return;
      const chat=state.chats.find(c=>c.id===form.dataset.id);
      if(chat.ended||state.blocked.includes(chat.personId))throw new Error('Dieses Gespräch ist nicht mehr aktiv.');
      chat.messages.push({from:'me',text,time:Date.now()});chat.draft='';save();render();scrollChat();document.querySelector('#message-input')?.focus();
    } else {
      const personId=form.dataset.id,p=personById(personId),chat=state.chats.find(c=>c.personId===personId),request=state.requests.find(r=>r.personId===personId);
      state.reports.push({personId,reason:data.get('reason'),text:data.get('text'),time:Date.now(),context:structuredClone(chat?.messages||request?.pair||p.interests)});
      if(data.has('block'))blockPerson(state,personId);
      save();closeModal();render();toast('Demo-Meldung lokal gespeichert. Sie wird an niemanden versendet.');
    }
  } catch(error) { toast(error.message); }
});
document.addEventListener('input',event=>{
  if(event.target.id==='topic-search'&&modal?.type==='catalog'){modal.query=event.target.value;document.querySelector('#catalog-results').innerHTML=catalogResults();const sticky=document.querySelector('.sticky-select');if(sticky)sticky.hidden=Boolean(modal.query);}
  if(event.target.id==='message-input'&&currentChat){const chat=state.chats.find(c=>c.id===currentChat);chat.draft=event.target.value;save();}
});
let swipeStart=null;
document.addEventListener('pointerdown',event=>{if(event.target.closest('[data-swipe]'))swipeStart={x:event.clientX,y:event.clientY,id:event.target.closest('[data-swipe]').dataset.swipe};});
document.addEventListener('pointerup',event=>{if(!swipeStart||modal?.type!=='catalog')return;const dx=event.clientX-swipeStart.x,dy=event.clientY-swipeStart.y,id=swipeStart.id;swipeStart=null;if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.5){if(dx>0)openModal({type:'editor',topicId:id});else{modal.index=(modal.index||0)+1;renderModal();}}});
document.addEventListener('pointercancel',()=>{swipeStart=null;});
function scrollChat(){requestAnimationFrame(()=>{const box=document.querySelector('.chat-messages');if(box)box.scrollTop=box.scrollHeight;});}
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(navItems.some(([id])=>id===next)){tab=next;currentChat=null;render();}});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
window.addEventListener('offline',()=>toast('Du bist offline. Der Demo-Prototyp funktioniert auf deinem Gerät weiter.'));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!modal){render();}});
setInterval(()=>{if(!modal&&!currentChat&&!document.querySelector('#profile-form'))render();},60000);
if('serviceWorker'in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
if(!state.started)modal={type:'welcome'};
render();
