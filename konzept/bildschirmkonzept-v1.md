# Bildschirmkonzept – anonyme Themenkontakte

Stand: 11. November 2026 · Version 1 · Grundlage für einen klickbaren Prototyp

## 1. Produkt und Umfang

Menschen entdecken andere Menschen anhand dessen, worüber sie sprechen möchten. Themen stehen vor Personenmerkmalen. Die App vermittelt Gespräche und Kontakte; ihre Gestaltung und Texte richten sich nicht auf Dating aus.

Andere sehen ein Pseudonym, einen frei gewählten Avatar, aktive Gesprächsthemen und die dazugehörigen freiwilligen Angaben. Ein persönliches Foto, Klarname, Alter, Geschlecht, Standort oder eine Biografie sind für die Nutzung nicht erforderlich. Alter, Geschlecht und Hobbys können später freiwillig im Profil hinterlegt werden; es gibt keine Aufforderung, sie einzutragen, keinen Profilfortschritt und keine entsprechenden Suchfilter in Version 1.

Der Prototyp arbeitet mit gekennzeichneten Beispielpersonen. Er prüft den Ablauf, vermittelt noch keine echten Kontakte und sendet keine Push-Nachrichten. Dauerhafte Konten, geräteübergreifender Zugang, Speicherung und Benachrichtigungen werden für die technische Umsetzung gesondert konkretisiert.

### In Version 1 enthalten

- Einstieg mit Pseudonym und Avatar.
- Themenbaum, Themensuche und alternative Themenkarten.
- Dauerhafte und zeitlich begrenzte Gesprächswünsche.
- Gesprächsart und optionaler Freitext je Thema.
- Personenvorschläge mit sichtbaren Gemeinsamkeiten.
- Gegenseitige Kontaktfreigabe und Einzelchat als Text.
- Themenverwaltung, Blockieren und Melden.
- Einstellbare Erinnerungen und Benachrichtigungen.

Gruppen, öffentliche Beiträge, Bewertungen von Personen, Sprach- und Videoanrufe gehören nicht zum ersten Umfang.

## 2. Navigation und Hauptablauf

Vier gleichbleibende Navigationspunkte:

| Bereich | Aufgabe |
| --- | --- |
| Themen | Eigene Gesprächswünsche ansehen, auswählen und verwalten |
| Entdecken | Passende Menschen und ihre gemeinsamen Themen ansehen |
| Nachrichten | Anfragen und freigegebene Gespräche verwalten |
| Profil | Eigene Darstellung, Einstellungen und Kontofunktionen |

Erster Besuch:

**Willkommen → Pseudonym und Avatar → Erstes Thema → Gesprächswunsch → Entdecken → Kontaktanfrage → Annahme → Chat**

Weitere Besuche beginnen bei „Entdecken“. Gibt es keine aktiven Gesprächsthemen, erscheint dort eine Einladung zur Themenauswahl. Nachrichten bleiben auch ohne aktives Thema zugänglich.

## 3. Bildschirm: Willkommen

**Ziel:** Den Zweck verstehen und ohne Profilfragebogen beginnen.

Textentwurf:

> Worüber möchtest du sprechen?
>
> Entdecke Menschen, die deine Gesprächsthemen teilen. Mit Pseudonym, frei gewähltem Avatar und so wenig persönlichen Angaben, wie du möchtest.

Hauptaktion: **„Themen entdecken“**.

Zweiter Zugang: **„Ich bin schon dabei“**, sobald die technische Kontolösung feststeht.

Es werden weder Fotozugriff noch Standort oder Push-Berechtigung beim Start angefragt.

## 4. Bildschirm: Dein Auftritt

**Ziel:** Für andere erkennbar werden, ohne persönliche Daten angeben zu müssen.

- Ein zufälliges Pseudonym ist bereits eingesetzt, zum Beispiel „Mooslicht“.
- Ein abstrakter Avatar ist vorausgewählt.
- Pseudonym und Avatar lassen sich ändern.
- Im Prototyp stehen Farben, Formen und Illustrationen als Avatare zur Wahl.
- Eine eigene Bilddatei ist für die spätere Version möglich; ein persönliches Foto wird nicht vorgeschlagen.
- Ein Hinweis erklärt: „Du kannst beides später ändern.“

Hauptaktion: **„Weiter zu den Themen“**.

Es gibt hier keine Felder für Alter, Geschlecht, Hobbys oder Biografie. Ein unverändertes vorgeschlagenes Pseudonym reicht zum Fortfahren. Die konkrete interne Kontoidentität ist unabhängig vom sichtbaren Namen.

## 5. Bildschirm: Themen entdecken

**Ziel:** Ein passendes Thema finden, ohne einen riesigen Katalog durchgehen zu müssen.

Oben steht eine Suche: **„Thema suchen“**. Darunter kann zwischen **„Themenbaum“** und **„Themenkarten“** gewechselt werden. Beide greifen auf denselben Katalog zu.

Die erste Ebene enthält die 14 erarbeiteten Themenwelten:

1. Tiere & Natur
2. Wissenschaft & Weltraum
3. Technik & digitale Welt
4. Umwelt, Klima & Energie
5. Geschichte & Archäologie
6. Gesellschaft & Politik
7. Philosophie, Glaube & Weltbilder
8. Gefühle, Beziehungen & persönlicher Alltag
9. Lernen, Beruf & eigene Projekte
10. Bücher, Filme, Serien & Medien
11. Spiele & Gaming
12. Kreativität, Musik & Selbermachen
13. Essen, Wohnen & Garten
14. Bewegung, Freizeit & Reisen

### Themenbaum

Ein Tippen auf einen Bereich öffnet seine Unterthemen. Der aktuelle Pfad bleibt sichtbar. Jeder sinnvoll benannte Themenbereich lässt sich über **„Dieses Thema auswählen“** direkt übernehmen; Unterthemen sind optional. Es gibt keine künstliche Mindesttiefe.

Beispiel:

```text
Tiere & Natur › Tierwelt › Wassertiere

Wassertiere

[ Meerestiere             › ]
[ Süßwassertiere          › ]

[ Dieses Thema auswählen   ]
```

### Themenkarten

Eine Karte zeigt den Themennamen, den zugehörigen Pfad und gegebenenfalls „Unterthemen ansehen“. Sie enthält keine vorgegebene Gesprächsfrage.

- Nach rechts: Thema auswählen und Gesprächswunsch einstellen.
- Nach links: Karte für diese Entdeckungsrunde überspringen.
- Gleichwertige Schaltflächen: „Auswählen“ und „Weiter“.
- Eine übersprungene Karte bleibt über Suche und Baum erreichbar. Überspringen wird nicht als dauerhaftes Desinteresse gespeichert.

### Suche und fehlende Themen

Die Suche findet Katalogthemen und hinterlegte Synonyme. Sie durchsucht keine privaten Nachrichten. Ein Suchbegriff wird nicht automatisch als neues Thema veröffentlicht.

Ohne Treffer: **„Dazu gibt es noch kein eigenes Thema. Wähle einen passenden Oberbegriff und ergänze dein Interesse im Freitext.“** Dazu „Themenwelten ansehen“ und optional „Thema vorschlagen“.

Ein Thema kann über mehrere Wege auffindbar sein, bleibt intern dasselbe Thema. So entstehen keine getrennten Gruppen für denselben Inhalt.

## 6. Bildschirm: Gesprächswunsch

**Ziel:** Festhalten, wie und wie lange jemand über das ausgewählte Thema sprechen möchte.

Der Themenname und der vollständige Pfad stehen oben. Darunter folgen drei kurze Abschnitte.

### Gesprächsart – freiwillig

**„Wie möchtest du darüber sprechen?“**

- Wissen & Erfahrungen teilen
- Dazulernen
- Gegenseitig austauschen
- Für alles offen

Ohne Auswahl wird „Für alles offen“ verwendet. Die Gesprächsart wird nicht aus dem Profil abgeleitet.

### Aktivität

**„Wie lange soll dein Thema aktiv bleiben?“**

- **24 Stunden:** „Darüber möchte ich heute sprechen.“
- **Dauerhaft:** „Darüber könnte ich immer sprechen.“
- **Weitere Laufzeiten:** Drei Tage oder eine Woche.

Beim erstmaligen Anlegen ist eine bewusste Auswahl der Laufzeit erforderlich. Die vier Möglichkeiten werden als einfache Auswahl dargestellt; die beiden Standardoptionen stehen zuerst.

### Freitext – freiwillig

**„Was interessiert dich daran gerade besonders?“**

Beispiel für Meerestiere:

> Mich interessieren vor allem Kraken. Ich kenne mich noch wenig aus und höre gern von spannenden Beobachtungen.

Maximal 300 Zeichen im ersten Entwurf. Der Text gehört ausschließlich zu diesem Gesprächswunsch. Neben dem Feld steht: **„Dieser Text wird anderen bei passenden Vorschlägen angezeigt.“**

Hauptaktion: **„Thema aktivieren“**. Danach erscheint eine kurze Bestätigung mit „Menschen entdecken“ und „Weiteres Thema wählen“. Ein einziges aktives Thema genügt für den Einstieg.

Wird das Thema bereits geführt, öffnet sich sein vorhandener Eintrag. Es entsteht kein Duplikat.

## 7. Bildschirm: Meine Themen

**Ziel:** Verstehen, welche Themen gerade zu Vorschlägen führen, und sie leicht ändern können.

Die Übersicht gruppiert aktive Themen in:

- **Heute besonders aktuell**
- **Weitere aktive Themen**
- **Darüber könnte ich immer sprechen**

Ein dauerhaftes Thema, das zusätzlich heute im Fokus steht, erscheint als eine Karte im ersten Abschnitt mit zusätzlicher Kennzeichnung „Auch dauerhaft aktiv“. Nach Ablauf des Fokus wechselt die Karte zurück zu den dauerhaften Themen.

Jede Karte zeigt Thema, Gesprächsart, Freitextvorschau und gegebenenfalls Ablaufzeit. Verfügbare Aktionen:

- Bearbeiten
- Weitere 24 Stunden, falls zeitlich befristet
- Heute in den Fokus setzen, falls dauerhaft
- Pausieren
- Entfernen

„Pausieren“ erhält die Angaben, stoppt aber die Nutzung für neue Vorschläge. „Entfernen“ entfernt den Gesprächswunsch; bestehende Chats bleiben erhalten. Eine kurze Rückgängig-Aktion fängt versehentliches Entfernen ab.

Ein eingeklappter Abschnitt **„Inaktiv“** enthält abgelaufene und pausierte Themen mit „Wieder aktivieren“. Die Reaktivierung zeigt Laufzeit und bisherigen Freitext vor dem Speichern.

## 8. Ablauf und Erinnerungen

- 24 Stunden beginnen beim Aktivieren, nicht um Mitternacht.
- Eine sichtbare Angabe wie „Bis morgen, 18:40 Uhr“ ergänzt die relative Restzeit.
- Bei aktivem Thema verlängert „Weitere 24 Stunden“ die bestehende Frist um 24 Stunden. Bei abgelaufenem Thema beginnen die 24 Stunden mit der erneuten Aktivierung.
- Ohne Verlängerung endet die befristete Aktivität automatisch.
- Abgelaufene Themen werden nicht automatisch neu aktiviert.
- Bleibt eine dauerhafte Auswahl desselben Themas bestehen, endet nur der heutige Schwerpunkt.
- Bestehende Chats und bereits versandte Kontaktanfragen bleiben erhalten. Der Ablauf verhindert neue Vorschläge aufgrund eines ausschließlich abgelaufenen Themas.
- Für die spätere Umsetzung entscheidet die maßgebliche gespeicherte Ablaufzeit über den Status; ein offen gebliebener Bildschirm darf ihn nicht verlängern.

Optional kann pro befristeter Aktivierung eine Erinnerung kurz vor Ablauf erfolgen. Diese ist standardmäßig aus. Wird sie gewählt, wird die Systemberechtigung erst in diesem Zusammenhang angefragt. Eine verweigerte Berechtigung verhindert die Nutzung der App nicht.

Beim nächsten Öffnen kann einmalig eine nicht blockierende Karte erscheinen:

> Dein Thema „Meerestiere“ ist abgelaufen.
>
> [Für 24 Stunden aktivieren] [Schließen]

Kein wiederkehrendes Pflichtfenster und keine automatische Verlängerung. Ein späterer Schwerpunkt startet eine neue Aktivierung.

## 9. Bildschirm: Menschen entdecken

**Ziel:** Anhand gemeinsamer Gesprächsthemen entscheiden können, ob ein Kontakt interessant ist.

Vorschläge sind als Liste lesbarer Karten gestaltet. Der Avatar bleibt klein; die Themen stehen zuerst. Personen werden nicht durch Wischgesten bewertet.

```text
Gemeinsames Thema: Meerestiere

◈ Mooslicht
Heute besonders aktuell · Möchte Erfahrungen teilen

„Ich tauche gern und interessiere mich besonders
für Tintenfische und Korallenriffe.“

Auch gemeinsam: Fotografie

[ Vorschlag ansehen ]  [ Weiter ]
```

„Heute besonders aktuell“ wird nur bei tatsächlich laufender 24-Stunden-Aktivierung oder einem aktiven Tagesfokus angezeigt. Zeitlich längere Aktivitäten werden als „Aktiv bis …“ dargestellt. Keine Auswahl wird als Beleg dafür verwendet, dass jemand online ist oder sofort antworten wird.

Über „Meine Themen“ kann die Liste auf einen eigenen aktiven Gesprächswunsch eingegrenzt werden. Alter, Geschlecht und Aussehen sind keine Filter in Version 1.

### Regeln für passende Vorschläge

1. Mindestens ein beiderseits aktives, gleiches Thema oder eine direkte Beziehung zwischen ausgewähltem Ober- und Unterthema ist erforderlich.
2. Dasselbe konkrete Thema und beiderseits aktuelle Schwerpunkte werden stärker gewichtet.
3. Ergänzende Gesprächsarten helfen bei der Reihenfolge. Zwei Lernende oder zwei Menschen mit Wissen werden nicht ausgeschlossen.
4. Ein Oberthema kann einen gewählten Unterbereich einschließen: „Tierwelt“ und „Meerestiere“ passen grundsätzlich zusammen. Die Karte zeigt die unterschiedlichen Auswahlen und bezeichnet die Verbindung als „Verwandtes Interesse“.
5. Zwei verschiedene Unterthemen werden nicht allein deshalb als passend vorgeschlagen, weil sie denselben sehr breiten Oberbegriff haben. „Haustiere“ und „Meerestiere“ ergeben in dieser ersten Version für sich noch keine Übereinstimmung.
6. Freitext ist in Version 1 eine Entscheidungshilfe für Menschen und keine unsichtbare Zugangshürde. Eine automatische semantische Analyse wird nicht vorausgesetzt.
7. Angezeigte Übereinstimmungen beziehen sich auf Themeninteresse, nicht auf gleiche Meinungen.
8. Blockierte Personen werden gegenseitig nicht vorgeschlagen. Bestehende Kontakte und laufende Anfragen werden nicht erneut als neue Kontakte angeboten.

Es gibt keine erfundene Prozentzahl für die persönliche Passung. Der konkrete gemeinsame Inhalt begründet jeden Vorschlag.

## 10. Bildschirm: Vorschlag im Detail

**Ziel:** Beide Gesprächswünsche vergleichen, bevor eine Anfrage entsteht.

Reihenfolge:

1. Gemeinsame oder verwandte Themen.
2. Pseudonym und Avatar.
3. Gesprächsart, Aktivität und vollständiger Themenfreitext der Person.
4. Eigener zugehöriger Gesprächswunsch zum Vergleich.
5. Weitere aktive Themen der Person.
6. Optional vorhandene allgemeine Profilbeschreibung und weitere freiwillige Profilangaben.

Beim verwandten Interesse steht beispielsweise:

> Du hast „Meerestiere“ gewählt, Mooslicht „Tierwelt“.
>
> Euer Interesse überschneidet sich bei Tieren. Ob dein Schwerpunkt passt, könnt ihr anhand eurer Texte einschätzen.

Hauptaktion: **„Kontakt anfragen“**. Zweite Aktion: **„Weiter“**. Im Menü befinden sich „Blockieren“ und „Melden“.

Eine Anfrage enthält das ausgewählte gemeinsame Thema, die zugehörigen Gesprächsarten und die Themenfreitexte, aber keine zusätzliche frei geschriebene Nachricht vor der Annahme. Die App zeigt vor dem Senden eine kurze Zusammenfassung der Informationen, die mitgehen.

Beim Senden wird geprüft, ob die für den Kontakt verwendete Themenverbindung noch aktiv ist. Ist sie abgelaufen, zeigt der Bildschirm den aktualisierten Zustand statt einer falschen Erfolgsmeldung. Eine andere weiterhin aktive Gemeinsamkeit kann neu ausgewählt werden.

Nach Versand: **„Anfrage gesendet. Ihr könnt schreiben, sobald die andere Person annimmt.“** Es ist nur eine offene Anfrage zwischen zwei Personen nötig, auch bei mehreren gemeinsamen Themen.

## 11. Bildschirm: Nachrichten und Anfragen

Zwei Reiter: **„Gespräche“** und **„Anfragen“**. Im zweiten Reiter sind eingegangene und gesendete Anfragen unterscheidbar.

Eingehende Anfrage:

- Avatar und Pseudonym.
- Thema und Zeitpunkt der Anfrage.
- Mitgesandte Themenfreitexte und Gesprächsarten.
- „Annehmen“, „Ablehnen“ und „Details“.
- „Blockieren“ und „Melden“ im Menü.

Die mitgesandten Themenangaben bleiben als Stand der Anfrage erkennbar. Spätere Profiländerungen dürfen diesen Kontext nicht unbemerkt austauschen. Ist das Thema inzwischen abgelaufen, steht darunter „Zum Zeitpunkt der Anfrage aktiv“. Die Anfrage kann weiterhin angenommen werden.

Annehmen öffnet einen gemeinsamen Chat. Ablehnen öffnet keinen Chat und verlangt keine Begründung. Gesendete Anfragen können zurückgezogen werden. Ein abgelaufenes Thema sendet keine wiederholten Anfragen aus.

## 12. Bildschirm: Chat

**Ziel:** Nach gegenseitiger Zustimmung frei miteinander schreiben.

Oben stehen Pseudonym und Avatar. Eine aufklappbare Zeile **„Euer Gesprächseinstieg: Meerestiere“** zeigt die beim Kontakt geteilten Themenangaben. Darunter folgen Nachrichten und Texteingabe.

- Es gibt keine automatisch vorgegebene Frage, die beantwortet werden muss.
- Der Austausch darf sich frei zu anderen Themen entwickeln.
- Der Ablauf oder das Entfernen eines Themas beendet keinen angenommenen Chat.
- Der erste Umfang unterstützt Textnachrichten.
- Ungesendeter Text bleibt bei einem vorübergehenden Verbindungsproblem erhalten.
- Fehlgeschlagene Nachrichten zeigen ihren Zustand und „Erneut senden“; sie werden nicht als zugestellt dargestellt.
- Bilder, Dateianhänge, Sprachnachrichten, Lesebestätigungen und ein öffentlicher Onlinestatus gehören nicht zum ersten Umfang.

Im Menü: **„Profil ansehen“**, **„Gespräch beenden“**, **„Blockieren“**, **„Melden“**.

„Gespräch beenden“ beendet den weiteren Nachrichtenaustausch und entfernt die Person aus neuen Vorschlägen, bis die beendende Person sie ausdrücklich wieder freigibt. Der bisherige Verlauf bleibt für die jeweilige Person lesbar. Eine eventuell spätere Löschfunktion ist von diesem Vorgang getrennt zu benennen.

## 13. Bildschirm: Eigenes Profil und Einstellungen

Zunächst sichtbar:

- Pseudonym und Avatar bearbeiten.
- Aktive Themen verwalten.
- Optionale allgemeine Beschreibung.
- „Weitere freiwillige Angaben“ als eingeklappter Bereich für Alter, Geschlecht und Hobbys; ohne Aufforderungen oder Belohnung für das Ausfüllen.
- Vorschau „So sehen dich andere“.

Einstellungen:

- Benachrichtigungen getrennt für Kontaktanfragen, Nachrichten und Themen-Erinnerungen.
- Blockierte Personen verwalten.
- Erläuterung, welche Angaben andere sehen.
- Hilfe und Rückmeldungen.
- Kontozugang und Kontolöschung, sobald die technische Kontolösung umgesetzt wird.

„Anonym“ meint im Produkt zunächst die Darstellung gegenüber anderen Personen. Es wird kein Versprechen vollständiger technischer Anonymität formuliert, bevor Infrastruktur und Datenverarbeitung feststehen.

## 14. Blockieren und Melden

**Blockieren** stoppt Nachrichten und Anfragen zwischen beiden Personen und verhindert gegenseitige neue Vorschläge. Der bisherige Verlauf bleibt für die betroffene Person zur Einsicht und als möglicher Meldekontext zugänglich. Es wird keine zusätzliche Nachricht an die blockierte Person versendet.

**Melden** öffnet eine kurze Auswahl, beispielsweise Belästigung, Spam, unangemessene Inhalte oder anderer Grund, mit optionaler Erläuterung. Vor dem Absenden wird angezeigt, welche Profil-, Anfrage- oder Nachrichteninhalte zur Prüfung mitgesendet werden. „Zusätzlich blockieren“ kann direkt gewählt werden.

Ein sichtbarer Meldeknopf setzt für eine reale Version einen tatsächlich bearbeiteten Meldeeingang voraus. Im Prototyp wird ausdrücklich erklärt, dass Meldungen nur den Ablauf demonstrieren.

## 15. Leere Zustände und Fehler

| Situation | Anzeige und nächste Aktion |
| --- | --- |
| Noch keine eigenen Themen | „Worüber möchtest du sprechen?“ · Thema auswählen |
| Noch keine passenden Personen | „Gerade haben wir keine passenden Vorschläge zu deinen aktiven Themen.“ · Später erneut ansehen, weiteres Thema wählen oder eigenen Oberbegriff bewusst aktivieren |
| Alle Vorschläge angesehen | „Du hast die aktuellen Vorschläge gesehen.“ · Themen verwalten |
| Thema abgelaufen | Status ändern · Freiwillig für 24 Stunden reaktivieren |
| Noch keine Nachrichten | „Hier erscheinen eure Gespräche nach einer angenommenen Anfrage.“ · Menschen entdecken |
| Anfrage noch offen | „Anfrage gesendet“ · Zurückziehen möglich |
| Anfrage zurückgezogen | Entfernen oder als nicht mehr verfügbar kennzeichnen · Keine Annahme mehr möglich |
| Gegenüber nicht mehr verfügbar | Keine neue Anfrage ermöglichen · Neutrale Statusmeldung |
| Keine Verbindung | Vorhandene Inhalte sichtbar lassen · Wiederholen anbieten |
| Speichern fehlgeschlagen | Eingaben erhalten · Keine Aktivierung vortäuschen · Erneut versuchen |
| Push nicht erlaubt | In-App-Nutzung bleibt vollständig möglich · Einstellungen erreichbar |

Leere Zustände enthalten keine erfundenen Personen oder vorgeschobenen Übereinstimmungen. Verwandte Interessen werden nicht ohne Erklärung als gleiche Interessen ausgegeben.

## 16. Gestaltung für den Prototyp

- Ruhige, freundliche Oberfläche mit gut lesbarer Schrift und wenigen Akzentfarben.
- Themenbegriffe und Freitexte erhalten mehr Platz als Avatare.
- Abstrakte Standardavatare statt Foto-Platzhalter.
- Keine Herzen, Attraktivitätsbewertungen oder Dating-Texte.
- Aktivitätszustände werden mit Text und Symbol erklärt, nicht ausschließlich durch Farbe.
- Alle Wischaktionen besitzen sichtbare Schaltflächen und sind per Tastatur bedienbar.
- Formulare haben sichtbare Beschriftungen; freiwillige Felder sind gekennzeichnet.
- Smartphone-Ansicht als Ausgangspunkt; dieselben Abläufe bleiben auf größeren Bildschirmen nutzbar.

## 17. Beispielreise für den ersten Prototyp

1. Eine neue Person übernimmt das Pseudonym „Wolkenfuchs“ und einen abstrakten Avatar.
2. Sie öffnet Tiere & Natur → Tierwelt → Wassertiere → Meerestiere.
3. Sie wählt „Dazulernen“, „24 Stunden“ und ergänzt „Mich interessieren vor allem Kraken“.
4. In Entdecken sieht sie „Mooslicht“, die ebenfalls Meerestiere aktiv hat und Erfahrungen teilen möchte.
5. Sie liest den Freitext über Tauchen und Tintenfische und sendet eine Kontaktanfrage.
6. Die Anfrage erscheint bei Mooslicht mit den Themenangaben von Wolkenfuchs.
7. Mooslicht nimmt an. Beide können ohne vorgegebene Frage schreiben.
8. Nach 24 Stunden endet Wolkenfuchs' Gesprächswunsch. Der Chat bleibt bestehen.
9. Wolkenfuchs aktiviert das Thema erneut oder speichert es dauerhaft und setzt es bei Bedarf wieder in den Tagesfokus.

Zusätzliche Prüfsituationen im Prototyp: keine passenden Personen, verwandtes Oberthema, übersprungene Themenkarte, bestehender dauerhafter Eintrag mit Tagesfokus, abgelaufene Anfragegrundlage, abgelehnte Anfrage, fehlgeschlagene Nachricht und blockierter Kontakt.

## 18. Woran wir den Entwurf prüfen

- Eine neue Person kann ohne persönliche Profilangaben ein Thema aktivieren.
- Baum und Karten führen zum selben Thema und erzeugen keine Duplikate.
- Freitext und Gesprächsart sind tatsächlich optional.
- Dauerhafte und befristete Aktivität sowie Tagesfokus sind verständlich unterscheidbar.
- Die Begründung eines Vorschlags ist aus den angezeigten Themen nachvollziehbar.
- Ohne Annahme gibt es keinen offenen Chat und keine frei geschriebene Direktnachricht.
- Ablaufzeiten verändern neue Vorschläge, aber nicht bestehende Gespräche.
- Niemand muss Push aktivieren oder ein persönliches Foto verwenden.
- Blockieren und Melden sind aus Anfrage, Vorschlag und Chat erreichbar.

Vor einer realen Veröffentlichung noch zu konkretisieren: Kontozugang und Wiederherstellung, technische Datenspeicherung und Löschung, Betrieb des Meldeeingangs, Umgang mit der Zielaltersgruppe und die konkrete Push-Infrastruktur. Diese Punkte blockieren den klickbaren Prototyp mit Beispieldaten nicht.
