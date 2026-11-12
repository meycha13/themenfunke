-- Themenfunke: gemeinsamer Datenbestand und zugriffsgeschützte RPC-Schnittstelle.
-- In einem neuen Supabase-Projekt einmal im SQL Editor ausführen.
begin;
create table public.tf_topics (
  id text primary key, label text not null, path text[] not null
);
create table public.tf_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check(char_length(name) between 1 and 28),
  avatar text not null default 'orbit' check(avatar in ('sprout','orbit','waves','sun','mountain','spark')),
  color text not null default 'sage' check(color in ('sage','peach','lavender','blue','sand')),
  bio text not null default '' check(char_length(bio)<=300),
  match_alerts boolean not null default true, created_at timestamptz not null default now()
);
create table public.tf_interests (
  owner_id uuid not null references public.tf_profiles(id) on delete cascade,
  topic_id text not null references public.tf_topics(id),
  role text not null check(role in ('open','share','learn','exchange')),
  mode text not null check(mode in ('day','three','week','always')),
  text text not null default '' check(char_length(text)<=300),
  always_active boolean not null default false, paused boolean not null default false,
  expires_at timestamptz, primary key(owner_id,topic_id)
);
create table public.tf_requests (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references public.tf_profiles(id) on delete cascade,
  recipient uuid not null references public.tf_profiles(id) on delete cascade,
  pair jsonb not null, status text not null default 'pending' check(status in ('pending','accepted','declined','withdrawn')),
  created_at timestamptz not null default now(), check(sender<>recipient)
);
create unique index tf_request_pair on public.tf_requests(least(sender,recipient),greatest(sender,recipient));
create table public.tf_chats (
  id uuid primary key default gen_random_uuid(), request_id uuid not null unique references public.tf_requests(id) on delete cascade,
  a uuid not null references public.tf_profiles(id) on delete cascade,
  b uuid not null references public.tf_profiles(id) on delete cascade,
  pair jsonb not null, ended_by uuid, created_at timestamptz not null default now()
);
create table public.tf_messages (
  id uuid primary key default gen_random_uuid(), chat_id uuid not null references public.tf_chats(id) on delete cascade,
  sender uuid not null references public.tf_profiles(id) on delete cascade,
  text text not null check(char_length(btrim(text)) between 1 and 3000),
  client_id uuid not null, created_at timestamptz not null default now(), unique(sender,client_id)
);
create index tf_messages_chat_time on public.tf_messages(chat_id,created_at);
create table public.tf_blocks (
  owner_id uuid not null references public.tf_profiles(id) on delete cascade,
  target_id uuid not null references public.tf_profiles(id) on delete cascade,
  primary key(owner_id,target_id), check(owner_id<>target_id)
);
create table public.tf_hidden (
  owner_id uuid not null references public.tf_profiles(id) on delete cascade,
  target_id uuid not null references public.tf_profiles(id) on delete cascade, primary key(owner_id,target_id)
);
create table public.tf_seen (
  owner_id uuid not null references public.tf_profiles(id) on delete cascade,
  target_id uuid not null references public.tf_profiles(id) on delete cascade, primary key(owner_id,target_id)
);
create table public.tf_reports (
  id uuid primary key default gen_random_uuid(), reporter uuid references public.tf_profiles(id) on delete set null,
  target uuid references public.tf_profiles(id) on delete set null,
  reason text not null check(char_length(reason) between 1 and 100),
  explanation text not null default '' check(char_length(explanation)<=1000),
  context jsonb not null, created_at timestamptz not null default now()
);
-- Direkter Tabellenzugriff ist grundsätzlich gesperrt. Alle Operationen laufen
-- durch die nachfolgend explizit freigegebenen Funktionen mit Identitätsprüfung.
do $$ declare t text; begin
  foreach t in array array['tf_topics','tf_profiles','tf_interests','tf_requests','tf_chats','tf_messages','tf_blocks','tf_hidden','tf_seen','tf_reports'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
  end loop;
end $$;
create function public.tf_uid() returns uuid language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); begin
  if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then
    raise exception 'Bitte melde dich mit einem bestätigten Konto an.' using errcode='42501';
  end if;
  return u;
end $$;
create function public.tf_blocked(a uuid,b uuid) returns boolean language sql security definer set search_path='' as $$
  select exists(select 1 from public.tf_blocks x where (x.owner_id=a and x.target_id=b) or (x.owner_id=b and x.target_id=a));
$$;
create function public.tf_interest_json(i public.tf_interests) returns jsonb language sql immutable set search_path='' as $$
  select jsonb_build_object('topicId',i.topic_id,'role',i.role,'text',i.text,'mode',i.mode,'always',i.always_active,'paused',i.paused,'expiresAt',extract(epoch from i.expires_at)*1000);
$$;
create function public.tf_profile_json(u uuid) returns jsonb language sql security definer set search_path='' as $$
  select jsonb_build_object('id',id,'name',name,'avatar',avatar,'color',color,'bio',bio,'isReal',true,
    'interests',coalesce((select jsonb_agg(public.tf_interest_json(i)) from public.tf_interests i where i.owner_id=u and not i.paused and (i.always_active or i.expires_at>now())),'[]'::jsonb))
  from public.tf_profiles where id=u;
$$;
create function public.tf_pair(u uuid,v uuid,topic text) returns jsonb language sql security definer set search_path='' as $$
  select jsonb_build_object('mine',public.tf_interest_json(m),'theirs',public.tf_interest_json(o),'kind',case when m.topic_id=o.topic_id then 'exact' else 'related' end,'score',case when m.topic_id=o.topic_id then 100 else 35 end)
  from public.tf_interests m join public.tf_topics mt on mt.id=m.topic_id
  join public.tf_interests o on o.owner_id=v join public.tf_topics ot on ot.id=o.topic_id
  where m.owner_id=u and m.topic_id=topic
  and not m.paused and (m.always_active or m.expires_at>now())
  and not o.paused and (o.always_active or o.expires_at>now())
  and (m.topic_id=o.topic_id or m.topic_id=any(ot.path) or o.topic_id=any(mt.path))
  order by (m.topic_id=o.topic_id) desc, o.topic_id limit 1;
$$;
create function public.tf_snapshot() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=public.tf_uid(); candidates uuid[]; contacts uuid[]; result jsonb; begin
  insert into public.tf_profiles(id,name) values(u,'Wolkenfuchs-'||left(u::text,6)) on conflict(id) do nothing;
  select coalesce(array_agg(id),'{}'::uuid[]) into candidates from (
    select p.id from public.tf_profiles p where p.id<>u and not public.tf_blocked(u,p.id)
    and not exists(select 1 from public.tf_hidden h where h.owner_id=u and h.target_id=p.id)
    and not exists(select 1 from public.tf_requests r where (r.sender=u and r.recipient=p.id) or (r.recipient=u and r.sender=p.id))
    and exists(select 1 from public.tf_interests m join public.tf_topics mt on mt.id=m.topic_id
      join public.tf_interests o on o.owner_id=p.id join public.tf_topics ot on ot.id=o.topic_id
      where m.owner_id=u and not m.paused and (m.always_active or m.expires_at>now())
      and not o.paused and (o.always_active or o.expires_at>now())
      and (m.topic_id=o.topic_id or m.topic_id=any(ot.path) or o.topic_id=any(mt.path)))
    order by p.created_at,p.id limit 100
  ) x;
  select coalesce(array_agg(distinct peer),'{}'::uuid[]) into contacts from (
    select case when r.sender=u then r.recipient else r.sender end as peer from public.tf_requests r where r.sender=u or r.recipient=u
    union select target_id from public.tf_blocks where owner_id=u
  ) x;
  select jsonb_build_object(
    'serverNow',extract(epoch from now())*1000,
    'profile',public.tf_profile_json(u)-'interests'-'isReal'-'id',
    'matchAlerts',(select match_alerts from public.tf_profiles where id=u),
    'interests',coalesce((select jsonb_agg(public.tf_interest_json(i)) from public.tf_interests i where i.owner_id=u),'[]'::jsonb),
    'people',coalesce((select jsonb_agg(public.tf_profile_json(id)) from (select distinct unnest(candidates||contacts) as id) peers),'[]'::jsonb),
    'blocked',coalesce((select jsonb_agg(target_id) from public.tf_blocks where owner_id=u),'[]'::jsonb),
    'hidden',coalesce((select jsonb_agg(target_id) from public.tf_hidden where owner_id=u),'[]'::jsonb),
    'seenMatches',coalesce((select jsonb_agg(target_id) from public.tf_seen where owner_id=u),'[]'::jsonb),
    'requests',coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'personId',case when r.sender=u then r.recipient else r.sender end,'direction',case when r.sender=u then 'out' else 'in' end,'createdAt',extract(epoch from r.created_at)*1000,'pair',case when r.sender=u then r.pair else jsonb_build_object('mine',r.pair->'theirs','theirs',r.pair->'mine','kind',r.pair->'kind') end)) from public.tf_requests r where r.status='pending' and (r.sender=u or r.recipient=u) and not public.tf_blocked(r.sender,r.recipient)),'[]'::jsonb),
    'chats',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'personId',case when c.a=u then c.b else c.a end,'createdAt',extract(epoch from c.created_at)*1000,'ended',c.ended_by is not null or public.tf_blocked(c.a,c.b),'pair',case when c.a=u then c.pair else jsonb_build_object('mine',c.pair->'theirs','theirs',c.pair->'mine','kind',c.pair->'kind') end,
      'messages',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'from',case when m.sender=u then 'me' else 'peer' end,'text',m.text,'time',extract(epoch from m.created_at)*1000) order by m.created_at,m.id) from (select * from public.tf_messages where chat_id=c.id order by created_at desc,id desc limit 100) m),'[]'::jsonb))) from public.tf_chats c where c.a=u or c.b=u),'[]'::jsonb)
  ) into result;
  return result;
end $$;
create function public.tf_command(action text,payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=public.tf_uid(); target uuid; identifier uuid; topic text; i public.tf_interests; r public.tf_requests; c public.tf_chats; pair jsonb; duration interval; new_id uuid; ctx jsonb;
begin
  insert into public.tf_profiles(id,name) values(u,'Wolkenfuchs-'||left(u::text,6)) on conflict(id) do nothing;
  if action='profile' then
    update public.tf_profiles set name=btrim(payload->>'name'),avatar=payload->>'avatar',color=payload->>'color',bio=coalesce(payload->>'bio','') where id=u;
  elsif action='alerts' then
    update public.tf_profiles set match_alerts=(payload->>'enabled')::boolean where id=u;
  elsif action='topic' then
    topic:=payload->>'topicId';
    if payload->>'mode' not in ('day','three','week','always') or payload->>'role' not in ('open','learn','share','exchange') then raise exception 'Ungültiger Gesprächswunsch.'; end if;
    duration:=case payload->>'mode' when 'day' then interval '1 day' when 'three' then interval '3 days' when 'week' then interval '7 days' else null end;
    insert into public.tf_interests(owner_id,topic_id,role,mode,text,always_active,expires_at)
    values(u,topic,payload->>'role',payload->>'mode',coalesce(payload->>'text',''),payload->>'mode'='always' or coalesce((payload->>'keepAlways')::boolean,false),now()+duration)
    on conflict(owner_id,topic_id) do update set role=excluded.role,mode=excluded.mode,text=excluded.text,always_active=excluded.always_active,expires_at=excluded.expires_at,paused=false;
  elsif action in ('extend','focus','pause','remove_topic') then
    topic:=payload->>'topicId';select * into i from public.tf_interests where owner_id=u and topic_id=topic for update;
    if not found then raise exception 'Thema nicht mehr vorhanden.'; end if;
    if action='remove_topic' then delete from public.tf_interests where owner_id=u and topic_id=topic;
    elsif action='pause' then update public.tf_interests set paused=true where owner_id=u and topic_id=topic;
    elsif action='focus' then update public.tf_interests set mode='day',paused=false,expires_at=now()+interval '1 day' where owner_id=u and topic_id=topic;
    else update public.tf_interests set mode=case when mode='always' then 'day' else mode end,paused=false,expires_at=greatest(now(),coalesce(expires_at,now()))+interval '1 day' where owner_id=u and topic_id=topic;
    end if;
  elsif action='request' then
    target:=(payload->>'personId')::uuid;
    if target=u or public.tf_blocked(u,target) then raise exception 'Kontakt nicht verfügbar.'; end if;
    if (select count(*) from public.tf_requests where sender=u and created_at>now()-interval '1 hour')>=10 then raise exception 'Bitte warte etwas, bevor du weitere Anfragen sendest.'; end if;
    pair:=public.tf_pair(u,target,payload->>'topicId');if pair is null then raise exception 'Die gemeinsame Themenverbindung ist nicht mehr aktiv.'; end if;
    insert into public.tf_requests(sender,recipient,pair) values(u,target,pair) returning id into new_id;
  elsif action in ('accept','decline','withdraw') then
    identifier:=(payload->>'id')::uuid;select * into r from public.tf_requests where id=identifier and (sender=u or recipient=u) for update;
    if not found or r.status<>'pending' then raise exception 'Anfrage nicht mehr verfügbar.'; end if;
    if action='withdraw' and r.sender=u then update public.tf_requests set status='withdrawn' where id=r.id;
    elsif action='decline' and r.recipient=u then update public.tf_requests set status='declined' where id=r.id;
    elsif action='accept' and r.recipient=u and not public.tf_blocked(r.sender,r.recipient) then
      update public.tf_requests set status='accepted' where id=r.id;
      insert into public.tf_chats(request_id,a,b,pair) values(r.id,r.sender,r.recipient,r.pair) returning id into new_id;
    else raise exception 'Diese Aktion ist nicht erlaubt.' using errcode='42501';end if;
  elsif action in ('message','end_chat') then
    identifier:=(payload->>'id')::uuid;select * into c from public.tf_chats where id=identifier and (a=u or b=u) for update;
    if not found then raise exception 'Gespräch nicht verfügbar.' using errcode='42501';end if;
    if action='end_chat' then update public.tf_chats set ended_by=coalesce(ended_by,u) where id=c.id;
    else
      if c.ended_by is not null or public.tf_blocked(c.a,c.b) then raise exception 'Dieses Gespräch ist nicht mehr aktiv.';end if;
      if (select count(*) from public.tf_messages where sender=u and created_at>now()-interval '1 minute')>=40 then raise exception 'Bitte warte einen Moment vor der nächsten Nachricht.';end if;
      insert into public.tf_messages(chat_id,sender,text,client_id) values(c.id,u,btrim(payload->>'text'),(payload->>'clientId')::uuid) on conflict(sender,client_id) do nothing;
    end if;
  elsif action in ('block','unblock','hide','seen','unhide') then
    if action='unhide' then delete from public.tf_hidden where owner_id=u;
    else
      target:=(payload->>'personId')::uuid;if target=u then raise exception 'Ungültiger Kontakt.';end if;
      if action='block' then
        insert into public.tf_blocks values(u,target) on conflict do nothing;
        update public.tf_requests set status='declined' where status='pending' and ((sender=u and recipient=target) or (sender=target and recipient=u));
      elsif action='unblock' then delete from public.tf_blocks where owner_id=u and target_id=target;
      elsif action='hide' then insert into public.tf_hidden values(u,target) on conflict do nothing;
      else insert into public.tf_seen values(u,target) on conflict do nothing;
      end if;
    end if;
  elsif action='report' then
    target:=(payload->>'personId')::uuid;
    if not exists(select 1 from public.tf_requests where (sender=u and recipient=target) or (sender=target and recipient=u)) and public.tf_pair(u,target,payload->>'topicId') is null then raise exception 'Kontakt nicht verfügbar.';end if;
    if (select count(*) from public.tf_reports where reporter=u and created_at>now()-interval '1 day')>=10 then raise exception 'Das tägliche Meldelimit ist erreicht.';end if;
    select jsonb_build_object('profile',public.tf_profile_json(target),'messages',coalesce((select jsonb_agg(to_jsonb(m)) from (select m.text,m.sender,m.created_at from public.tf_messages m join public.tf_chats conv on conv.id=m.chat_id where (conv.a=u and conv.b=target) or (conv.a=target and conv.b=u) order by m.created_at desc limit 50) m),'[]'::jsonb)) into ctx;
    insert into public.tf_reports(reporter,target,reason,explanation,context) values(u,target,payload->>'reason',coalesce(payload->>'text',''),ctx);
    if coalesce((payload->>'block')::boolean,false) then
      insert into public.tf_blocks values(u,target) on conflict do nothing;
      update public.tf_requests set status='declined' where status='pending' and ((sender=u and recipient=target) or (sender=target and recipient=u));
    end if;
  elsif action='delete_account' then
    delete from auth.users where id=u;return jsonb_build_object('deleted',true);
  else raise exception 'Unbekannte Aktion.';end if;
  return jsonb_build_object('id',new_id);
end $$;
revoke all on function public.tf_uid(),public.tf_blocked(uuid,uuid),public.tf_interest_json(public.tf_interests),public.tf_profile_json(uuid),public.tf_pair(uuid,uuid,text),public.tf_snapshot(),public.tf_command(text,jsonb) from public,anon,authenticated;
grant execute on function public.tf_snapshot(),public.tf_command(text,jsonb) to authenticated;
commit;
-- Themenkatalog aus data.js, 212 Themen.
insert into public.tf_topics(id,label,path) values
('natur','Tiere & Natur',array['natur']),
('tierwelt','Tierwelt',array['natur','tierwelt']),
('wassertiere','Wassertiere',array['natur','tierwelt','wassertiere']),
('meerestiere','Meerestiere',array['natur','tierwelt','wassertiere','meerestiere']),
('suesswasser','Süßwassertiere',array['natur','tierwelt','wassertiere','suesswasser']),
('landtiere','Tiere an Land',array['natur','tierwelt','landtiere']),
('wildtiere','Wildtiere',array['natur','tierwelt','landtiere','wildtiere']),
('haustiere','Haustiere',array['natur','tierwelt','landtiere','haustiere']),
('voegel','Vögel',array['natur','tierwelt','voegel']),
('pflanzen','Pflanzenwelt',array['natur','pflanzen']),
('baeume','Bäume & Wälder',array['natur','pflanzen','baeume']),
('wildpflanzen','Blumen & Wildpflanzen',array['natur','pflanzen','wildpflanzen']),
('zimmerpflanzen','Zimmerpflanzen',array['natur','pflanzen','zimmerpflanzen']),
('lebensraeume','Lebensräume',array['natur','lebensraeume']),
('meere','Meere & Küsten',array['natur','lebensraeume','meere']),
('waelder','Wälder',array['natur','lebensraeume','waelder']),
('wuesten','Wüsten & Polarregionen',array['natur','lebensraeume','wuesten']),
('wissenschaft','Wissenschaft & Weltraum',array['wissenschaft']),
('weltraum','Weltraum',array['wissenschaft','weltraum']),
('himmelskoerper','Himmelskörper',array['wissenschaft','weltraum','himmelskoerper']),
('planeten','Planeten & Monde',array['wissenschaft','weltraum','himmelskoerper','planeten']),
('sterne','Sterne & Schwarze Löcher',array['wissenschaft','weltraum','himmelskoerper','sterne']),
('universum','Entstehung des Universums',array['wissenschaft','weltraum','universum']),
('ausserirdisch','Außerirdisches Leben',array['wissenschaft','weltraum','ausserirdisch']),
('physik','Physik',array['wissenschaft','physik']),
('quanten','Quantenphysik',array['wissenschaft','physik','quanten']),
('raumzeit','Relativität & Raumzeit',array['wissenschaft','physik','raumzeit']),
('biologie','Biologie',array['wissenschaft','biologie']),
('evolution','Evolution',array['wissenschaft','biologie','evolution']),
('genetik','Genetik',array['wissenschaft','biologie','genetik']),
('chemie','Chemie',array['wissenschaft','chemie']),
('alltagschemie','Chemie im Alltag',array['wissenschaft','chemie','alltagschemie']),
('materialien','Materialien & Eigenschaften',array['wissenschaft','chemie','materialien']),
('technik','Technik & digitale Welt',array['technik']),
('ki','Künstliche Intelligenz',array['technik','ki']),
('ki-alltag','KI im Alltag',array['technik','ki','ki-alltag']),
('ki-kreativ','Kreatives Arbeiten mit KI',array['technik','ki','ki-kreativ']),
('ki-entwicklung','Entwicklung von KI',array['technik','ki','ki-entwicklung']),
('computer','Computer & Software',array['technik','computer']),
('programmieren','Programmieren',array['technik','computer','programmieren']),
('web','Webentwicklung',array['technik','computer','programmieren','web']),
('apps','Appentwicklung',array['technik','computer','programmieren','apps']),
('opensource','Betriebssysteme & freie Software',array['technik','computer','opensource']),
('internet','Internet',array['technik','internet']),
('datenschutz','Datenschutz & Privatsphäre',array['technik','internet','datenschutz']),
('socialmedia','Soziale Netzwerke',array['technik','internet','socialmedia']),
('maschinen','Maschinen & Erfindungen',array['technik','maschinen']),
('robotik','Robotik',array['technik','maschinen','robotik']),
('elektronik','Elektronik & eigene Technikprojekte',array['technik','maschinen','elektronik']),
('umwelt','Umwelt, Klima & Energie',array['umwelt']),
('energie','Energie',array['umwelt','energie']),
('strom','Stromerzeugung',array['umwelt','energie','strom']),
('windenergie','Windenergie',array['umwelt','energie','strom','windenergie']),
('solar','Solarenergie',array['umwelt','energie','strom','solar']),
('atomkraft','Atomkraft',array['umwelt','energie','strom','atomkraft']),
('speicher','Energiespeicherung',array['umwelt','energie','speicher']),
('klima','Klima',array['umwelt','klima']),
('klimaforschung','Klimaforschung',array['umwelt','klima','klimaforschung']),
('klimaschutz','Klimaschutz & Anpassung',array['umwelt','klima','klimaschutz']),
('naturschutz','Naturschutz',array['umwelt','naturschutz']),
('meeresschutz','Meeresschutz',array['umwelt','naturschutz','meeresschutz']),
('artenvielfalt','Artenvielfalt',array['umwelt','naturschutz','artenvielfalt']),
('ressourcen','Ressourcen & Konsum',array['umwelt','ressourcen']),
('recycling','Recycling & Kreislaufwirtschaft',array['umwelt','ressourcen','recycling']),
('nachhaltigkeit','Nachhaltigkeit im Alltag',array['umwelt','ressourcen','nachhaltigkeit']),
('geschichte','Geschichte & Archäologie',array['geschichte']),
('epochen','Epochen',array['geschichte','epochen']),
('fruehgeschichte','Vor- & Frühgeschichte',array['geschichte','epochen','fruehgeschichte']),
('steinzeit','Steinzeit',array['geschichte','epochen','fruehgeschichte','steinzeit']),
('landwirtschaft-frueh','Frühe Landwirtschaft & Besiedlung',array['geschichte','epochen','fruehgeschichte','landwirtschaft-frueh']),
('antike','Antike',array['geschichte','epochen','antike']),
('aegypten','Altes Ägypten',array['geschichte','epochen','antike','aegypten']),
('rom','Griechenland & Römisches Reich',array['geschichte','epochen','antike','rom']),
('mittelalter','Mittelalter',array['geschichte','epochen','mittelalter']),
('neuzeit','Neuzeit & Zeitgeschichte',array['geschichte','epochen','neuzeit']),
('historischer-alltag','Historischer Alltag',array['geschichte','historischer-alltag']),
('historisches-leben','Wohnen, Essen & Arbeiten',array['geschichte','historischer-alltag','historisches-leben']),
('handel','Reisen & Handel',array['geschichte','historischer-alltag','handel']),
('archaeologie','Archäologie',array['geschichte','archaeologie']),
('ausgrabungen','Ausgrabungen & Fundstätten',array['geschichte','archaeologie','ausgrabungen']),
('archaeologie-methoden','Methoden & Entdeckungen',array['geschichte','archaeologie','archaeologie-methoden']),
('gesellschaft','Gesellschaft & Politik',array['gesellschaft']),
('zusammenleben','Zusammenleben',array['gesellschaft','zusammenleben']),
('stadt-land','Stadt & Land',array['gesellschaft','zusammenleben','stadt-land']),
('ehrenamt','Gemeinschaft & Ehrenamt',array['gesellschaft','zusammenleben','ehrenamt']),
('vielfalt','Kulturelle Vielfalt',array['gesellschaft','zusammenleben','vielfalt']),
('politik','Politik',array['gesellschaft','politik']),
('demokratie','Demokratie & Beteiligung',array['gesellschaft','politik','demokratie']),
('international','Internationale Beziehungen',array['gesellschaft','politik','international']),
('politische-ideen','Politische Ideen',array['gesellschaft','politik','politische-ideen']),
('wirtschaft','Wirtschaft',array['gesellschaft','wirtschaft']),
('wirtschaftssysteme','Wirtschaftssysteme',array['gesellschaft','wirtschaft','wirtschaftssysteme']),
('globalisierung','Konsum & Globalisierung',array['gesellschaft','wirtschaft','globalisierung']),
('wandel','Gesellschaftlicher Wandel',array['gesellschaft','wandel']),
('gleichberechtigung','Gleichberechtigung',array['gesellschaft','wandel','gleichberechtigung']),
('zukunft-zusammenleben','Zukunft des Zusammenlebens',array['gesellschaft','wandel','zukunft-zusammenleben']),
('philosophie','Philosophie, Glaube & Weltbilder',array['philosophie']),
('philosophieren','Philosophie',array['philosophie','philosophieren']),
('ethik','Ethik',array['philosophie','philosophieren','ethik']),
('gerechtigkeit','Gerechtigkeit',array['philosophie','philosophieren','ethik','gerechtigkeit']),
('verantwortung','Verantwortung für Mensch & Natur',array['philosophie','philosophieren','ethik','verantwortung']),
('bewusstsein','Bewusstsein & freier Wille',array['philosophie','philosophieren','bewusstsein']),
('sinn','Sinn & gutes Leben',array['philosophie','philosophieren','sinn']),
('religion','Religion',array['philosophie','religion']),
('traditionen','Religiöse Traditionen',array['philosophie','religion','traditionen']),
('glaube','Glaube im Alltag',array['philosophie','religion','glaube']),
('spiritualitaet','Spiritualität & Weltdeutung',array['philosophie','spiritualitaet']),
('meditation','Meditation & spirituelle Praxis',array['philosophie','spiritualitaet','meditation']),
('astrologie','Astrologie & Sternzeichen',array['philosophie','spiritualitaet','astrologie']),
('mythen','Mythen & Symbolik',array['philosophie','spiritualitaet','mythen']),
('alltag','Gefühle, Beziehungen & Alltag',array['alltag']),
('zwischenmenschen','Zwischenmenschliches',array['alltag','zwischenmenschen']),
('freundschaften','Freundschaften',array['alltag','zwischenmenschen','freundschaften']),
('familie','Familie',array['alltag','zwischenmenschen','familie']),
('kommunikation','Kommunikation & Konflikte',array['alltag','zwischenmenschen','kommunikation']),
('gefuehle','Gefühle & Selbstverständnis',array['alltag','gefuehle']),
('motivation','Motivation & Selbstvertrauen',array['alltag','gefuehle','motivation']),
('erholung','Stress & Erholung',array['alltag','gefuehle','erholung']),
('veraenderung','Persönliche Veränderungen',array['alltag','gefuehle','veraenderung']),
('alltag-gestalten','Alltag gestalten',array['alltag','alltag-gestalten']),
('gewohnheiten','Gewohnheiten & Routinen',array['alltag','alltag-gestalten','gewohnheiten']),
('zeit-fuer-sich','Zeit für sich',array['alltag','alltag-gestalten','zeit-fuer-sich']),
('erfolge','Kleine Erfolge & Herausforderungen',array['alltag','alltag-gestalten','erfolge']),
('lernen','Lernen, Beruf & eigene Projekte',array['lernen']),
('lernen-neu','Lernen',array['lernen','lernen-neu']),
('lernmethoden','Lernmethoden',array['lernen','lernen-neu','lernmethoden']),
('sprachen','Sprachen lernen',array['lernen','lernen-neu','sprachen']),
('selbstlernen','Selbstständig Neues lernen',array['lernen','lernen-neu','selbstlernen']),
('beruf','Ausbildung & Berufsleben',array['lernen','beruf']),
('ausbildung','Schule, Ausbildung & Studium',array['lernen','beruf','ausbildung']),
('berufswechsel','Berufsorientierung & Berufswechsel',array['lernen','beruf','berufswechsel']),
('arbeitsalltag','Arbeitsalltag & Zusammenarbeit',array['lernen','beruf','arbeitsalltag']),
('vorhaben','Eigene Vorhaben',array['lernen','vorhaben']),
('gruenden','Selbstständigkeit & Gründung',array['lernen','vorhaben','gruenden']),
('ehrenamt-projekte','Ehrenamtliche Projekte',array['lernen','vorhaben','ehrenamt-projekte']),
('ideen','Ideen entwickeln & umsetzen',array['lernen','vorhaben','ideen']),
('medien','Bücher, Filme, Serien & Medien',array['medien']),
('buecher','Bücher & Literatur',array['medien','buecher']),
('belletristik','Belletristik',array['medien','buecher','belletristik']),
('fantasy','Fantasy & Science-Fiction',array['medien','buecher','belletristik','fantasy']),
('krimis','Krimis & Thriller',array['medien','buecher','belletristik','krimis']),
('sachbuecher','Sachbücher',array['medien','buecher','sachbuecher']),
('manga','Comics & Manga',array['medien','buecher','manga']),
('filme','Filme & Serien',array['medien','filme']),
('genres','Genres & Erzählwelten',array['medien','filme','genres']),
('figuren','Figuren & Geschichten',array['medien','filme','figuren']),
('filmkunst','Filmkunst & Produktion',array['medien','filme','filmkunst']),
('weitere-medien','Weitere Medien',array['medien','weitere-medien']),
('podcasts','Podcasts & Hörbücher',array['medien','weitere-medien','podcasts']),
('dokus','Dokumentationen',array['medien','weitere-medien','dokus']),
('gaming','Spiele & Gaming',array['gaming']),
('videospiele','Videospiele',array['gaming','videospiele']),
('spielrichtungen','Spielrichtungen',array['gaming','videospiele','spielrichtungen']),
('rollenspiele','Rollen- & Abenteuerspiele',array['gaming','videospiele','spielrichtungen','rollenspiele']),
('strategie','Strategie & Simulation',array['gaming','videospiele','spielrichtungen','strategie']),
('action','Action & Wettkampf',array['gaming','videospiele','spielrichtungen','action']),
('indie','Indie-Spiele',array['gaming','videospiele','indie']),
('retro','Retrospiele',array['gaming','videospiele','retro']),
('analog','Analoge Spiele',array['gaming','analog']),
('brettspiele','Brett- & Kartenspiele',array['gaming','analog','brettspiele']),
('penpaper','Pen-&-Paper-Rollenspiele',array['gaming','analog','penpaper']),
('spielkultur','Spielkultur',array['gaming','spielkultur']),
('spielwelten','Geschichten & Welten in Spielen',array['gaming','spielkultur','spielwelten']),
('gamedesign','Spieleentwicklung & Spieldesign',array['gaming','spielkultur','gamedesign']),
('kreativ','Kreativität, Musik & Selbermachen',array['kreativ']),
('gestalten','Gestalten',array['kreativ','gestalten']),
('zeichnen','Zeichnen & Malen',array['kreativ','gestalten','zeichnen']),
('fotografie','Fotografie',array['kreativ','gestalten','fotografie']),
('digitalgestaltung','Digitales Gestalten',array['kreativ','gestalten','digitalgestaltung']),
('musik','Musik',array['kreativ','musik']),
('musik-hoeren','Musik entdecken & hören',array['kreativ','musik','musik-hoeren']),
('instrumente','Instrumente & Gesang',array['kreativ','musik','instrumente']),
('produzieren','Komponieren & Produzieren',array['kreativ','musik','produzieren']),
('schreiben','Schreiben',array['kreativ','schreiben']),
('geschichten','Geschichten & Gedichte',array['kreativ','schreiben','geschichten']),
('schreibprojekte','Eigene Schreibprojekte',array['kreativ','schreiben','schreibprojekte']),
('diy','Handwerk & DIY',array['kreativ','diy']),
('textil','Nähen, Stricken & Textilarbeit',array['kreativ','diy','textil']),
('holz','Holzarbeiten & Bauen',array['kreativ','diy','holz']),
('reparieren','Reparieren & Wiederverwenden',array['kreativ','diy','reparieren']),
('zuhause','Essen, Wohnen & Garten',array['zuhause']),
('essen','Essen & Trinken',array['zuhause','essen']),
('kochen','Kochen',array['zuhause','essen','kochen']),
('alltagskueche','Alltagsküche',array['zuhause','essen','kochen','alltagskueche']),
('weltkueche','Regionale & internationale Küchen',array['zuhause','essen','kochen','weltkueche']),
('backen','Backen',array['zuhause','essen','backen']),
('kaffee','Kaffee & Tee',array['zuhause','essen','kaffee']),
('wohnen','Wohnen',array['zuhause','wohnen']),
('einrichten','Einrichten & Raumgestaltung',array['zuhause','wohnen','einrichten']),
('kleine-raeume','Kleine Räume & gemeinschaftliches Wohnen',array['zuhause','wohnen','kleine-raeume']),
('garten','Garten & Anbau',array['zuhause','garten']),
('balkon','Balkon & kleiner Garten',array['zuhause','garten','balkon']),
('anbau','Obst, Gemüse & Kräuter',array['zuhause','garten','anbau']),
('naturgarten','Naturnahes Gärtnern',array['zuhause','garten','naturgarten']),
('freizeit','Bewegung, Freizeit & Reisen',array['freizeit']),
('sport','Sport & Bewegung',array['freizeit','sport']),
('ausdauer','Ausdauer',array['freizeit','sport','ausdauer']),
('laufen','Laufen',array['freizeit','sport','ausdauer','laufen']),
('rad-schwimmen','Radfahren & Schwimmen',array['freizeit','sport','ausdauer','rad-schwimmen']),
('kraft','Kraft & Beweglichkeit',array['freizeit','sport','kraft']),
('teamsport','Mannschaftssport',array['freizeit','sport','teamsport']),
('fans','Sport verfolgen & Fankultur',array['freizeit','sport','fans']),
('draussen','Draußen unterwegs',array['freizeit','draussen']),
('wandern','Wandern & Trekking',array['freizeit','draussen','wandern']),
('camping','Camping',array['freizeit','draussen','camping']),
('ausfluege','Ausflüge & Naturerlebnisse',array['freizeit','draussen','ausfluege']),
('reisen','Reisen & Entdecken',array['freizeit','reisen']),
('reisearten','Reisearten',array['freizeit','reisen','reisearten']),
('staedte','Städtereisen',array['freizeit','reisen','reisearten','staedte']),
('backpacking','Individuelles Reisen & Backpacking',array['freizeit','reisen','reisearten','backpacking']),
('regionen','Länder & Regionen',array['freizeit','reisen','regionen']),
('braeuche','Sprachen, Bräuche & Begegnungen',array['freizeit','reisen','braeuche'])
on conflict(id) do update set label=excluded.label,path=excluded.path;
