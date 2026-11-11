const n = (id, label, children = []) => ({ id, label, children });
export const worlds = [
  { ...n('natur', 'Tiere & Natur', [
    n('tierwelt','Tierwelt',[n('wassertiere','Wassertiere',[n('meerestiere','Meerestiere'),n('suesswasser','Süßwassertiere')]),n('landtiere','Tiere an Land',[n('wildtiere','Wildtiere'),n('haustiere','Haustiere')]),n('voegel','Vögel')]),
    n('pflanzen','Pflanzenwelt',[n('baeume','Bäume & Wälder'),n('wildpflanzen','Blumen & Wildpflanzen'),n('zimmerpflanzen','Zimmerpflanzen')]),
    n('lebensraeume','Lebensräume',[n('meere','Meere & Küsten'),n('waelder','Wälder'),n('wuesten','Wüsten & Polarregionen')])
  ]), icon:'leaf', color:'sage', description:'Von der Tiefsee bis zur Fensterbank.' },
  { ...n('wissenschaft','Wissenschaft & Weltraum',[
    n('weltraum','Weltraum',[n('himmelskoerper','Himmelskörper',[n('planeten','Planeten & Monde'),n('sterne','Sterne & Schwarze Löcher')]),n('universum','Entstehung des Universums'),n('ausserirdisch','Außerirdisches Leben')]),
    n('physik','Physik',[n('quanten','Quantenphysik'),n('raumzeit','Relativität & Raumzeit')]),
    n('biologie','Biologie',[n('evolution','Evolution'),n('genetik','Genetik')]),n('chemie','Chemie',[n('alltagschemie','Chemie im Alltag'),n('materialien','Materialien & Eigenschaften')])
  ]), icon:'orbit', color:'lavender', description:'Für Neugier, die keine Grenzen kennt.' },
  { ...n('technik','Technik & digitale Welt',[
    n('ki','Künstliche Intelligenz',[n('ki-alltag','KI im Alltag'),n('ki-kreativ','Kreatives Arbeiten mit KI'),n('ki-entwicklung','Entwicklung von KI')]),
    n('computer','Computer & Software',[n('programmieren','Programmieren',[n('web','Webentwicklung'),n('apps','Appentwicklung')]),n('opensource','Betriebssysteme & freie Software')]),
    n('internet','Internet',[n('datenschutz','Datenschutz & Privatsphäre'),n('socialmedia','Soziale Netzwerke')]),
    n('maschinen','Maschinen & Erfindungen',[n('robotik','Robotik'),n('elektronik','Elektronik & eigene Technikprojekte')])
  ]), icon:'code', color:'blue', description:'Ideen, die unsere Welt verändern.' },
  { ...n('umwelt','Umwelt, Klima & Energie',[
    n('energie','Energie',[n('strom','Stromerzeugung',[n('windenergie','Windenergie'),n('solar','Solarenergie'),n('atomkraft','Atomkraft')]),n('speicher','Energiespeicherung')]),
    n('klima','Klima',[n('klimaforschung','Klimaforschung'),n('klimaschutz','Klimaschutz & Anpassung')]),
    n('naturschutz','Naturschutz',[n('meeresschutz','Meeresschutz'),n('artenvielfalt','Artenvielfalt')]),
    n('ressourcen','Ressourcen & Konsum',[n('recycling','Recycling & Kreislaufwirtschaft'),n('nachhaltigkeit','Nachhaltigkeit im Alltag')])
  ]), icon:'sun', color:'sage', description:'Unsere Welt und was sie morgen braucht.' },
  { ...n('geschichte','Geschichte & Archäologie',[
    n('epochen','Epochen',[n('fruehgeschichte','Vor- & Frühgeschichte',[n('steinzeit','Steinzeit'),n('landwirtschaft-frueh','Frühe Landwirtschaft & Besiedlung')]),n('antike','Antike',[n('aegypten','Altes Ägypten'),n('rom','Griechenland & Römisches Reich')]),n('mittelalter','Mittelalter'),n('neuzeit','Neuzeit & Zeitgeschichte')]),
    n('historischer-alltag','Historischer Alltag',[n('historisches-leben','Wohnen, Essen & Arbeiten'),n('handel','Reisen & Handel')]),
    n('archaeologie','Archäologie',[n('ausgrabungen','Ausgrabungen & Fundstätten'),n('archaeologie-methoden','Methoden & Entdeckungen')])
  ]), icon:'columns', color:'sand', description:'Vergangene Welten, neue Perspektiven.' },
  { ...n('gesellschaft','Gesellschaft & Politik',[
    n('zusammenleben','Zusammenleben',[n('stadt-land','Stadt & Land'),n('ehrenamt','Gemeinschaft & Ehrenamt'),n('vielfalt','Kulturelle Vielfalt')]),
    n('politik','Politik',[n('demokratie','Demokratie & Beteiligung'),n('international','Internationale Beziehungen'),n('politische-ideen','Politische Ideen')]),
    n('wirtschaft','Wirtschaft',[n('wirtschaftssysteme','Wirtschaftssysteme'),n('globalisierung','Konsum & Globalisierung')]),
    n('wandel','Gesellschaftlicher Wandel',[n('gleichberechtigung','Gleichberechtigung'),n('zukunft-zusammenleben','Zukunft des Zusammenlebens')])
  ]), icon:'people', color:'peach', description:'Verstehen, was uns miteinander verbindet.' },
  { ...n('philosophie','Philosophie, Glaube & Weltbilder',[
    n('philosophieren','Philosophie',[n('ethik','Ethik',[n('gerechtigkeit','Gerechtigkeit'),n('verantwortung','Verantwortung für Mensch & Natur')]),n('bewusstsein','Bewusstsein & freier Wille'),n('sinn','Sinn & gutes Leben')]),
    n('religion','Religion',[n('traditionen','Religiöse Traditionen'),n('glaube','Glaube im Alltag')]),
    n('spiritualitaet','Spiritualität & Weltdeutung',[n('meditation','Meditation & spirituelle Praxis'),n('astrologie','Astrologie & Sternzeichen'),n('mythen','Mythen & Symbolik')])
  ]), icon:'spark', color:'lavender', description:'Gedanken, die ein bisschen größer sind.' },
  { ...n('alltag','Gefühle, Beziehungen & Alltag',[
    n('zwischenmenschen','Zwischenmenschliches',[n('freundschaften','Freundschaften'),n('familie','Familie'),n('kommunikation','Kommunikation & Konflikte')]),
    n('gefuehle','Gefühle & Selbstverständnis',[n('motivation','Motivation & Selbstvertrauen'),n('erholung','Stress & Erholung'),n('veraenderung','Persönliche Veränderungen')]),
    n('alltag-gestalten','Alltag gestalten',[n('gewohnheiten','Gewohnheiten & Routinen'),n('zeit-fuer-sich','Zeit für sich'),n('erfolge','Kleine Erfolge & Herausforderungen')])
  ]), icon:'coffee', color:'peach', description:'Die kleinen und großen Dinge im Leben.' },
  { ...n('lernen','Lernen, Beruf & eigene Projekte',[
    n('lernen-neu','Lernen',[n('lernmethoden','Lernmethoden'),n('sprachen','Sprachen lernen'),n('selbstlernen','Selbstständig Neues lernen')]),
    n('beruf','Ausbildung & Berufsleben',[n('ausbildung','Schule, Ausbildung & Studium'),n('berufswechsel','Berufsorientierung & Berufswechsel'),n('arbeitsalltag','Arbeitsalltag & Zusammenarbeit')]),
    n('vorhaben','Eigene Vorhaben',[n('gruenden','Selbstständigkeit & Gründung'),n('ehrenamt-projekte','Ehrenamtliche Projekte'),n('ideen','Ideen entwickeln & umsetzen')])
  ]), icon:'compass', color:'blue', description:'Neues lernen. Eigene Wege finden.' },
  { ...n('medien','Bücher, Filme, Serien & Medien',[
    n('buecher','Bücher & Literatur',[n('belletristik','Belletristik',[n('fantasy','Fantasy & Science-Fiction'),n('krimis','Krimis & Thriller')]),n('sachbuecher','Sachbücher'),n('manga','Comics & Manga')]),
    n('filme','Filme & Serien',[n('genres','Genres & Erzählwelten'),n('figuren','Figuren & Geschichten'),n('filmkunst','Filmkunst & Produktion')]),
    n('weitere-medien','Weitere Medien',[n('podcasts','Podcasts & Hörbücher'),n('dokus','Dokumentationen')])
  ]), icon:'book', color:'sand', description:'Geschichten, die noch lange bleiben.' },
  { ...n('gaming','Spiele & Gaming',[
    n('videospiele','Videospiele',[n('spielrichtungen','Spielrichtungen',[n('rollenspiele','Rollen- & Abenteuerspiele'),n('strategie','Strategie & Simulation'),n('action','Action & Wettkampf')]),n('indie','Indie-Spiele'),n('retro','Retrospiele')]),
    n('analog','Analoge Spiele',[n('brettspiele','Brett- & Kartenspiele'),n('penpaper','Pen-&-Paper-Rollenspiele')]),
    n('spielkultur','Spielkultur',[n('spielwelten','Geschichten & Welten in Spielen'),n('gamedesign','Spieleentwicklung & Spieldesign')])
  ]), icon:'game', color:'lavender', description:'Gemeinsame Welten, neue Spielzüge.' },
  { ...n('kreativ','Kreativität, Musik & Selbermachen',[
    n('gestalten','Gestalten',[n('zeichnen','Zeichnen & Malen'),n('fotografie','Fotografie'),n('digitalgestaltung','Digitales Gestalten')]),
    n('musik','Musik',[n('musik-hoeren','Musik entdecken & hören'),n('instrumente','Instrumente & Gesang'),n('produzieren','Komponieren & Produzieren')]),
    n('schreiben','Schreiben',[n('geschichten','Geschichten & Gedichte'),n('schreibprojekte','Eigene Schreibprojekte')]),
    n('diy','Handwerk & DIY',[n('textil','Nähen, Stricken & Textilarbeit'),n('holz','Holzarbeiten & Bauen'),n('reparieren','Reparieren & Wiederverwenden')])
  ]), icon:'palette', color:'peach', description:'Für alles, was du selbst erschaffst.' },
  { ...n('zuhause','Essen, Wohnen & Garten',[
    n('essen','Essen & Trinken',[n('kochen','Kochen',[n('alltagskueche','Alltagsküche'),n('weltkueche','Regionale & internationale Küchen')]),n('backen','Backen'),n('kaffee','Kaffee & Tee')]),
    n('wohnen','Wohnen',[n('einrichten','Einrichten & Raumgestaltung'),n('kleine-raeume','Kleine Räume & gemeinschaftliches Wohnen')]),
    n('garten','Garten & Anbau',[n('balkon','Balkon & kleiner Garten'),n('anbau','Obst, Gemüse & Kräuter'),n('naturgarten','Naturnahes Gärtnern')])
  ]), icon:'home', color:'sage', description:'Ein guter Ort zum Wurzeln schlagen.' },
  { ...n('freizeit','Bewegung, Freizeit & Reisen',[
    n('sport','Sport & Bewegung',[n('ausdauer','Ausdauer',[n('laufen','Laufen'),n('rad-schwimmen','Radfahren & Schwimmen')]),n('kraft','Kraft & Beweglichkeit'),n('teamsport','Mannschaftssport'),n('fans','Sport verfolgen & Fankultur')]),
    n('draussen','Draußen unterwegs',[n('wandern','Wandern & Trekking'),n('camping','Camping'),n('ausfluege','Ausflüge & Naturerlebnisse')]),
    n('reisen','Reisen & Entdecken',[n('reisearten','Reisearten',[n('staedte','Städtereisen'),n('backpacking','Individuelles Reisen & Backpacking')]),n('regionen','Länder & Regionen'),n('braeuche','Sprachen, Bräuche & Begegnungen')])
  ]), icon:'mountain', color:'blue', description:'Rausgehen. Weiterdenken. Neues entdecken.' }
];

export const topics = new Map();
function index(nodes, path = []) {
  for (const node of nodes) {
    const entry = { ...node, path: [...path, node.id], world: path[0] || node.id };
    topics.set(node.id, entry);
    index(node.children, entry.path);
  }
}
index(worlds);
export const roles = { open:'Für alles offen', share:'Wissen & Erfahrungen teilen', learn:'Dazulernen', exchange:'Gegenseitig austauschen' };
export const durations = { day:'24 Stunden', always:'Dauerhaft', three:'3 Tage', week:'Eine Woche' };
export const avatars = ['sprout','orbit','waves','sun','mountain','spark'];

const person = (id, name, avatar, color, bio, interests) => ({ id, name, avatar, color, bio, interests: interests.map(([topicId, role, text, mode = 'always']) => ({ topicId, role, text, mode })) });
export const people = [
  person('mooslicht','Mooslicht','sprout','sage','Ich mag neugierige Menschen und Geschichten aus der Natur.',[
    ['meerestiere','share','Ich tauche gern. Mich interessieren besonders Tintenfische und Korallenriffe.','day'],['fotografie','exchange','Am liebsten fotografiere ich draußen, auch mit dem Handy.'],['tierwelt','exchange','Es gibt immer etwas Neues über Tiere zu entdecken.']]),
  person('sternstaub','Sternstaub','orbit','lavender','Für kleine Gedanken und ein sehr großes Universum.',[
    ['weltraum','exchange','Sterne beobachten und gemeinsam über das Universum staunen.','day'],['quanten','learn','Ich suche verständliche Erklärungen ohne Formelsammlung.'],['ki','exchange','Mich interessiert, wie wir KI sinnvoll einsetzen können.']]),
  person('kupferfuchs','Kupferfuchs','spark','peach','Bastle gern an Dingen und denke laut über Ideen nach.',[
    ['programmieren','share','Ich baue kleine Webprojekte und tausche gern Erfahrungen aus.','day'],['robotik','learn','Mein erster eigener Roboter ist noch eine Idee.'],['reparieren','exchange','Reparieren statt wegwerfen.']]),
  person('windspiel','Windspiel','waves','sage','Neugierig auf eine lebenswerte Zukunft.',[
    ['windenergie','exchange','Mich interessieren Alltagserfahrungen und technische Hintergründe.','day'],['atomkraft','open','Ich möchte verschiedene Sichtweisen besser verstehen.'],['meeresschutz','share','Ich beschäftige mich viel mit dem Schutz der Meere.']]),
  person('zeitreisend','Zeitreisend','mountain','sand','Geschichte ist für mich vor allem die Geschichte von Menschen.',[
    ['steinzeit','exchange','Wie Menschen damals zusammenlebten, fasziniert mich.','day'],['antike','share','Ich lese gerade viel über den Alltag in antiken Städten.'],['archaeologie','exchange','Funde und die Geschichten dahinter.']]),
  person('morgenrot','Morgenrot','sun','peach','Ich höre gern zu und entdecke andere Blickwinkel.',[
    ['demokratie','exchange','Wie können mehr Menschen im Alltag mitgestalten?','day'],['ehrenamt','share','Ich helfe in einem Gemeinschaftsprojekt mit.'],['zusammenleben','open','Mich interessieren gute Ideen für das Zusammenleben.']]),
  person('gedankenwald','Gedankenwald','sprout','lavender','Manche Gedanken brauchen ein Gegenüber.',[
    ['bewusstsein','exchange','Gedanken über Wahrnehmung und das eigene Ich.','day'],['astrologie','open','Ich tausche mich gern über Sternzeichen und ihre Deutung aus.'],['sinn','exchange','Was macht einen guten Alltag aus?']]),
  person('teepause','Teepause','waves','peach','Kleine Dinge verdienen auch ein Gespräch.',[
    ['freundschaften','exchange','Freundschaften pflegen, wenn alle viel zu tun haben.','day'],['gewohnheiten','open','Kleine Routinen, die den Tag schöner machen.'],['erholung','exchange','Was beim Abschalten hilft.']]),
  person('kompass','Kompass','orbit','blue','Lerne gern Neues und teile meine Umwege.',[
    ['sprachen','exchange','Ich lerne gerade eine neue Sprache und suche Lernideen.','day'],['ideen','share','Vom ersten Gedanken zum kleinen eigenen Projekt.'],['berufswechsel','exchange','Erfahrungen mit neuen beruflichen Wegen.']]),
  person('seitenwind','Seitenwind','mountain','sand','Immer irgendwo zwischen zwei Buchseiten.',[
    ['fantasy','exchange','Welten entdecken und über gute Geschichten sprechen.','day'],['filme','open','Gern auch Filme, die nicht alle schon gesehen haben.'],['podcasts','share','Ich sammle gern Empfehlungen.']]),
  person('pixelmoos','Pixelmoos','spark','lavender','Spiele sind für mich Geschichten zum Mitmachen.',[
    ['indie','exchange','Kleine Spiele mit großen Ideen.','day'],['brettspiele','share','Kooperative Brettspiele machen mir besonders Spaß.'],['rollenspiele','open','Welten, Figuren und gute Nebenquests.']]),
  person('farbenfroh','Farbenfroh','sun','peach','Nicht alles muss perfekt werden, um Freude zu machen.',[
    ['zeichnen','exchange','Skizzenbücher, kleine Übungen und kreative Pausen.','day'],['instrumente','share','Ich spiele Gitarre und spreche gern übers Üben.'],['fotografie','exchange','Licht, Blickwinkel und einfache Ausrüstung.']]),
  person('balkongruen','Balkongrün','sprout','sage','Ein kleiner Balkon, viele Pflanzentöpfe.',[
    ['balkon','share','Kräuter und Gemüse auf wenig Platz.','day'],['kochen','exchange','Einfache Rezepte und neue Lieblingszutaten.'],['zimmerpflanzen','exchange','Manchmal gedeihen sie. Manchmal lernen wir dazu.']]),
  person('fernweh','Fernweh','mountain','blue','Lieber einen Umweg mit Aussicht.',[
    ['wandern','exchange','Kleine Touren und große Pausen unterwegs.','day'],['backpacking','share','Ich reise gern mit leichtem Gepäck.'],['laufen','learn','Langsam anfangen und Freude an Bewegung finden.']])
];
