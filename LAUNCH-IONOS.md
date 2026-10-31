# THIEL-Relaunch · 31. Oktober 2026

Ziel: https://thiel-classics.de/
GitHub: https://github.com/thiel-classics/Webseite-automotive
IONOS-Projekt: 03028982-a5a2-4f9f-9ecd-9441b725d5e1
Veröffentlichter Ordner: dist

Der Betreiber hat den Ersatz der bisherigen Website und den Push ausdrücklich
beauftragt. Er hat außerdem bestätigt: jetzt mit direkten E-Mail-/Telefonlinks
starten, Kontaktformular bis zur SMTP-Einrichtung sichtbar deaktiviert lassen.

## Rückfallstand

Vorheriger Live-Commit: 7f42012e6fc98e531b7214f6aa3ead280d143592.
Gesicherter GitHub-Branch: backup/pre-thiel-relaunch-2026-10-31.
Die ursprüngliche Historie bleibt erhalten. Ein Rollback wird als neuer Commit
auf main veröffentlicht, kein erzwungenes Zurücksetzen des Branches.

## Auslieferung

Die vorhandenen drei IONOS-Workflows bleiben erhalten. Der Build verwendet dist.
Die neue .htaccess stellt die Erweiterungslosen Seiten /about, /kontakt,
/impressum und /datenschutz bereit und leitet die alten .html-Seiten passend um.
Die bestehende Domain-Verbindung und die Mail-/DNS-Konfiguration werden nicht geändert.

## Kontakt und Datenschutz

Der Launch ist statisch. Das Formular trägt data-contact-mode="direct".
Alle Eingabe- und Sendeelemente sind bereits im HTML deaktiviert. E-Mail-/Telefon-
und Datenschutzlinks funktionieren. kontakt.js ruft im direkten Modus keine
Kontakt-API auf und verhindert Submit. Es werden keine Formulareingaben übertragen.
Der vorbereitete Node-Mailserver liegt ausschließlich im Quellcode und wird von
IONOS Deploy Now nicht als Runtime gestartet. SMTP und PRIVACY_NOTICE_READY
bleiben unkonfiguriert. Keine Zugangsdaten sind im Auslieferungsordner enthalten.

Die Datenschutzerklärung beschreibt den öffentlichen IONOS-Betrieb und das
deaktivierte Formular. Vor dessen späterer Freischaltung sind Laufzeit,
SMTP-Konfiguration, Rechtstexte und Zustellung gesondert zu prüfen.
