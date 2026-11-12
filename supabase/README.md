# Echte Konten einrichten

Dieser Entwicklungsstand ergänzt die lokale Demo um echte, pseudonyme Konten über Supabase. Die öffentliche App-Konfiguration steht in `backend-config.js`; dort stehen ausschließlich die Projekt-URL und der ausdrücklich für Browser bestimmte Publishable Key. Niemals einen Secret Key oder `service_role` eintragen.

## 1. Datenbank

In einem neuen Projekt den vollständigen Inhalt von `setup.sql` einmal im SQL Editor ausführen. Das Skript enthält die beiden Migrationen in Reihenfolge. Es legt die Themen, Profile, Gesprächswünsche, Anfragen, Chats, Nachrichten, Blockierungen, Gesehen-Markierungen und Meldungen an.

Das Projekt wurde über die verbundene Supabase-Anbindung eingerichtet; die Migrationen sind als `20261112073430_themenfunke_accounts` und `20261112073440_themenfunke_topics` registriert. Ein manuelles Einfügen in den SQL-Editor ist für dieses Projekt nicht mehr erforderlich. Es wurden keine persönlichen Konten angelegt oder fremde Tabellen gelöscht. Nicht mehrfach als komplettes Skript ausführen. Für spätere Änderungen neue Migrationen hinzufügen; bereits angewendete Migrationen unverändert lassen.

Direkter Zugriff durch Browser-Benutzer auf sämtliche App-Tabellen ist gesperrt. Die beiden zugänglichen Funktionen `tf_snapshot` und `tf_command` prüfen die angemeldete, bestätigte Benutzeridentität. Privilegierte Implementierungen und Hilfsfunktionen liegen im nicht exponierten Schema `app_private`. Öffentliche Wrapper laufen als Security Invoker; nur die beiden erforderlichen privaten Operationen haben explizite Ausführungsrechte für angemeldete Benutzer. Hilfsfunktionen sind für anonyme und angemeldete Browser-Benutzer gesperrt. Explizite ablehnende RLS-Regeln sichern den direkten Tabellenzugriff zusätzlich ab. Themenablauf und Nachrichtenberechtigungen werden auf dem Server geprüft.

## 2. Erste eingeladene Testkonten ohne zusätzlichen Mail-Dienst

Im Supabase-Dashboard unter **Authentication → Users → Add user → Create new user** je Testperson ein App-Konto mit E-Mail und eigenem Passwort anlegen und als bestätigt markieren. Das Supabase-Dashboard-Konto ist kein automatisches Themenfunke-Konto. Passwörter niemals in GitHub-Dateien oder Chatnachrichten ablegen.

Unter Authentication die öffentliche Selbstregistrierung für die eingeladene Testrunde deaktivieren; die Bestätigungspflicht für E-Mail-Konten aktiviert lassen. `signupEnabled` und `passwordResetEnabled` bleiben in `backend-config.js` zunächst `false`. Administrativ angelegte, bestätigte Testkonten können sich mit E-Mail und Passwort anmelden. Einladungs-, Bestätigungs- und Wiederherstellungs-E-Mails werden in dieser Stufe nicht versendet. Falls jemand sein Passwort verliert, muss der Betreiber den Zugang über die Benutzerverwaltung wiederherstellen.

## 3. Spätere Selbstregistrierung und Wiederherstellung

Vor Aktivierung einen eigenen SMTP-Dienst für Supabase Auth einrichten, Site URL und erlaubte Redirect URLs auf die tatsächliche App-Adresse setzen und den E-Mail-Ablauf testen. Der eingebaute Supabase-Testversand ist auf Projekt-Teammitglieder beschränkt. Erst anschließend öffentliche Sign-ups in Supabase sowie `signupEnabled` und `passwordResetEnabled` in der App aktivieren. Passwörter werden durch Supabase Auth verarbeitet und in keiner App-Tabelle gespeichert.

## 4. Gemeinsamen Chat testen

1. Zwei bestätigte Testkonten in unterschiedlichen Browsern oder auf unterschiedlichen Geräten anmelden.
2. Pseudonyme im Profil ändern und jeweils Meerestiere aktivieren.
3. Auf Matches wechseln. Die zweite Person sollte spätestens nach der nächsten Aktualisierung erscheinen.
4. Konto A sendet eine Anfrage. Nur Konto B kann sie annehmen.
5. Beide schreiben im Chat. Neue Inhalte werden bei geöffneter App etwa alle fünf Sekunden abgefragt.
6. Blockieren stoppt neue Nachrichten beidseitig. Ein abgelaufenes Thema beendet keinen begonnenen Chat.
7. Abmelden und erneut anmelden: Kontodaten und Chats werden wieder vom Server geladen. Die Demo bleibt unabhängig davon lokal erhalten.

## Betrieb und derzeitige Grenzen

- Die ersten 100 passenden Personen und letzten 100 Nachrichten pro Chat werden geladen. Eine Paginierung für größere Nutzung ist noch nicht enthalten.
- Nachrichten haben maximal 3.000 Zeichen. Der Server begrenzt neue Kontaktanfragen auf 10 pro Stunde und den Nachrichtenversand auf 40 pro Minute je Konto. Meldungen sind auf 10 pro Tag begrenzt.
- Neue Anfragen und Matches erscheinen innerhalb der geöffneten App. Es gibt noch kein System-Push.
- Die App speichert echte Chattexte nicht in `localStorage` oder im Offline-Cache. Die Anmeldung und persönliche Hinweis-Einstellungen werden lokal gespeichert. Das Projekt verwendet keine Ende-zu-Ende-Verschlüsselung.
- Meldungen landen in `public.tf_reports`. Der Betreiber muss den Eingang im Supabase-Dashboard tatsächlich prüfen. Erfasst werden das aktuelle öffentliche Profil und bis zu 50 letzte Chatnachrichten. Direkter Lesezugriff auf Meldungen ist für normale App-Benutzer gesperrt.
- Kontolöschung entfernt das eigene Auth-Konto und abhängige Themen, Anfragen und Chats. Dadurch entfallen die betroffenen Chats auch für Gesprächspartner. Bereits übermittelte Meldungen können zur Prüfung erhalten bleiben; die App weist vor dem Löschen darauf hin.
- Vor einem offenen Start sind Zielaltersgruppe, Datenschutzhinweise, tatsächlicher Moderationsbetrieb und benötigte Aufbewahrungsfristen festzulegen. Die jetzige Stufe ist für einen kleinen eingeladenen Testkreis gedacht.

## Verifikation

`npm test` führt neben den bisherigen Demo-Tests eine echte lokale PostgreSQL-Prüfung mit PGlite aus: Kontentrennung, bestätigte Identitäten, verbotener Tabellen-/Hilfsfunktionszugriff, serverseitige Themenfristen, Annahme nur durch den Empfänger, private und idempotente Nachrichten, Blockieren, Meldungen und Kontolöschung.

Der Entwicklungs-Testserver unter `tests/fixtures/auth-server.mjs` bildet ausschließlich den Auth-Transport mit fiktiven Testkonten nach. Er verwendet dasselbe SQL-Schema und ist kein Server für echte Nutzer. Die lokale Browserprüfung ersetzt keine Anmeldung gegen das tatsächlich eingerichtete Supabase-Projekt.

Für die optionale Browserprüfung werden Python und Playwright mit Chromium benötigt. Zuerst `npm run build`, danach in einem Terminal `node tests/fixtures/auth-server.mjs` und in einem zweiten `python tests/browser-online.py` ausführen. Der Test verwendet einen isolierten `.invalid`-Endpunkt und lokale Testkonten; die echte Supabase-Anmeldung wird nicht angesprochen. Er prüft auch einen Kontowechsel und die Abmeldung in mehreren Tabs.

Im verbundenen Supabase-Projekt wurden Matching, Anfrageannahme und Nachrichtenaustausch zusätzlich in einer zurückgerollten Transaktion mit temporären Prüfdaten verifiziert. Der Security Advisor meldete nach Einrichtung keine Befunde. Der Performance Advisor zeigt nach frischer Einrichtung lediglich noch ungenutzte Indizes ([Erklärung](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)); diese unterstützen die vorgesehenen Abfragen und Fremdschlüssel.
