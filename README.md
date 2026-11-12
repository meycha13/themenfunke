# themenfunke

Eine mobile, installierbare Web-App für anonyme Kontakte über gemeinsame Gesprächsthemen. Die lokale Demo bleibt erhalten. Der Entwicklungsstand für echte pseudonyme Konten ergänzt Supabase-Anmeldung, gemeinsame Themen, Kontaktanfragen und geschützte Chats. Die Einrichtung ist in [supabase/README.md](supabase/README.md) beschrieben.

## Auf dem Handy testen

Nach Aktivierung von GitHub Pages:

**https://meycha13.github.io/themenfunke/**

1. Link in Safari oder Chrome öffnen.
2. Ein erstes Thema wählen oder „Mit Meerestieren ausprobieren“ verwenden.
3. Gesprächsart, Laufzeit und optionalen Freitext festlegen.
4. Passende Beispielperson ansehen und eine Anfrage senden.
5. Unter Nachrichten die Demo-Annahme testen und den Chat ausprobieren. Antworten entstehen nur über „Demo-Antwort simulieren“.
6. Alternativ oben unter „Demo testen“ eine „Kontaktanfrage testen“.

**Matches und Hinweise jederzeit testen:** Oben auf **Demo testen** tippen und **Neues Match testen** oder **Kontaktanfrage testen** wählen. Die Aktionen sind auch in der Benachrichtigungsglocke verfügbar. Jeder Klick legt einen neuen, klar bezeichneten Testkontakt an. Das funktioniert auch, wenn die bisherigen Beispielkontakte bereits gesehen, übersprungen oder in einem Chat sind. Vorhandene Chats bleiben erhalten. Ist kein Thema aktiv, wird ein zusätzliches Beispielthema für 24 Stunden angelegt. Manuell gestartete Tests zeigen ihren Hinweis auch dann, wenn automatische Match-Hinweise ausgeschaltet sind; die gespeicherte Einstellung bleibt unverändert.

**Als App hinzufügen:** iPhone: Safari → Teilen → Zum Home-Bildschirm. Android: Browsermenü → App installieren / Zum Startbildschirm hinzufügen. Nach dem ersten vollständigen Laden ist der Prototyp offline nutzbar. Die Speicherung gilt für diesen Browser auf diesem Gerät; sie wird nicht mit anderen Geräten oder App-Installationen synchronisiert.

## GitHub Pages einmalig aktivieren

Repository → **Settings → Pages → Build and deployment**:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**
- **Save**

Direktlink: https://github.com/meycha13/themenfunke/settings/pages

Bei einem privaten Repository ist Pages vom GitHub-Tarif abhängig. Falls GitHub die Veröffentlichung dort nicht anbietet, ist ein geeigneter Tarif oder eine bewusst gewählte öffentliche Sichtbarkeit nötig. Die Sichtbarkeit wird nicht automatisch geändert. Auch aus einem privaten Quellcode-Repository kann eine Pages-Website öffentlich erreichbar sein; die Oberfläche enthält ausschließlich den Demo-Prototyp und keine gespeicherten Nutzereingaben.

Der Ordner `docs/` enthält die fertig erzeugte Website einschließlich `.nojekyll`. Nach Aktivierung veröffentlicht GitHub Änderungen an diesem Ordner automatisch. Ein zusätzlicher Hosting-Dienst ist nicht nötig.

## Funktionen

- Kompakte Startübersicht mit Matches, eingehenden Anfragen und aktiven Chats.
- Sichtbare Neu-Zähler in Navigation und Benachrichtigungsglocke sowie ein Filter für neue Matches.
- Kurzer Hinweis in der App bei neuen passenden Kontakten und Demo-Anfragen; bereits gemeldete Kontakte erzeugen beim erneuten Laden keinen weiteren Hinweis.
- Gemeinsame Themen stehen auf den Kontaktkarten zuerst; verwandte Interessen werden separat erklärt.
- Match-Hinweise lassen sich unter Profil → Benachrichtigungen ausschalten. Neu-Zähler bleiben verfügbar. Es handelt sich um Hinweise innerhalb der geöffneten App, nicht um System-Push.
- Bestehende Profile, Themen und Chats bleiben beim Update erhalten.

- Alle 14 Themenwelten mit mehrstufigem Themenbaum, Suche und wischbaren Themenkarten.
- Jeder sinnvolle Oberbegriff ist direkt auswählbar; keine Pflicht, bis zu einem Blatt zu navigieren.
- Gesprächsart: teilen, dazulernen, austauschen oder offen.
- Themenfreitext mit maximal 300 Zeichen.
- 24 Stunden, drei Tage, eine Woche oder dauerhaft aktiv.
- Dauerhaftes Thema zusätzlich für 24 Stunden in den Fokus setzen.
- Verlängern, pausieren, bearbeiten und entfernen.
- Nachvollziehbare Vorschläge: gleiche Themen und verwandte Ober-/Unterthemen werden unterschieden.
- Kontaktanfragen mit gespeichertem Themenkontext und gegenseitiger Annahme.
- Lokale Demo-Chats, Entwürfe und ausdrücklich simulierte Antworten.
- Blockieren, Gespräch beenden und lokale Demo-Meldungen mit Inhaltsvorschau.
- Pseudonyme und abstrakte Avatare, keine Foto-Pflicht.
- Offline-Grundfunktion und Installationsmanifest für den Startbildschirm.

## Grenzen dieses Prototyps

Im Demo-Modus gibt es ausschließlich lokale Beispielkontakte. Mit eingerichteter Supabase-Anbindung stehen echte Konten, gemeinsame Speicherung und private Chats zur Verfügung. System-Push ist noch nicht enthalten. Nicht auf Ablaufzeiten reagierende Interessen werden automatisch inaktiv; bestehende Chats bleiben erhalten. Eine offene oder abgelehnte Systemberechtigung wird nicht vorausgesetzt.

Die aktuelle Profilmaske enthält Pseudonym, Avatar und einen optionalen Beschreibungstext. Weitere freiwillige Profilangaben sowie Systembenachrichtigungen sind für die nächste Ausbaustufe vorgesehen. Es gibt keine Demografie-Filter.

Im Demo-Modus liegen Profildaten und Gespräche ausschließlich in `localStorage`. Im Kontomodus werden echte Profile und Gespräche bei Supabase gespeichert; echte Chattexte werden nicht in den Browser-Speicher oder Offline-Cache geschrieben. Zum Zurücksetzen: Profil → Lokale Daten zurücksetzen. GitHub verarbeitet beim Aufruf die üblichen Hosting-Zugriffe. Der Prototyp enthält keine Analyse- oder Werbe-Skripte. Die Schrift verwendet lokale Systemschriften.

## Lokal entwickeln

Voraussetzung: Node.js 22 oder neuer. Abhängigkeiten mit `npm ci` installieren. Der Build bündelt den offiziellen Supabase-Client lokal, sodass kein externer JavaScript-CDN erforderlich ist.

```bash
npm ci
npm run check
npm test
npm run build
```

Nach `npm run build` kann eine beliebige statische HTTP-Entwicklungsumgebung die Dateien im Projektstamm oder `docs/` ausliefern. ES-Module benötigen HTTP(S); `index.html` nicht einfach per `file://` öffnen.

Bei Änderungen erst die Tests ausführen und anschließend `npm run build` starten. Sowohl Quellcode als auch erzeugte `docs/`-Dateien committen. Bei einer neuen App-Version die Versionskennungen in `package.json`, `index.html`, den Modulimporten in `app.js` und `core.js` sowie in `sw.js` gemeinsam erhöhen. Dadurch erhalten auch bestehende Installationen zueinander passende aktuelle Dateien. Die GitHub-Action prüft Logik, Syntax und den Gleichstand von Quellcode und veröffentlichten Dateien.

## Projektaufbau

| Datei | Aufgabe |
| --- | --- |
| `app.js` | Ansichten, Navigation, Dialoge und Interaktion |
| `core.js` | Themenaktivität, Matching, Anfragen und lokale Speicherung |
| `data.js` | Vollständiger Startkatalog und Beispielpersonen |
| `styles.css` | Responsive Oberfläche und mobile Navigation |
| `manifest.webmanifest`, `sw.js` | Installation und Offline-Betrieb |
| `tests/core.test.js` | Tests für fachliche Regeln und Zustandswechsel |
| `scripts/build.js` | Erzeugt die GitHub-Pages-Dateien in `docs/` |
| `konzept/bildschirmkonzept-v1.md` | Ursprünglicher Produkt- und Bildschirmplan |

## Weitere Entwicklung

Echte Konten sind für einen kleinen eingeladenen Testkreis vorbereitet. Voraussetzung ist die Einrichtung des Supabase-Schemas und bestätigter App-Konten. Weitere Schritte: Selbstregistrierung mit zuverlässigem E-Mail-Versand, System-Push, erweiterte Verlaufspaginierung und zusätzliche freiwillige Profilangaben. Vor der Veröffentlichung mit echten Menschen müssen Zugriffsregeln, Löschung, Zielaltersgruppe und Missbrauchsschutz konkret umgesetzt werden.
