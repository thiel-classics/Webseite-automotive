# THIEL · aktueller Relaunch

Die neue Website ersetzt seit dem Relaunch die frühere Automotive-Gestaltung.
Maßgebliche Website-Dateien: dist. Keine Build-Abhängigkeit für die Auslieferung.
Vor Änderungen git status und relevante Diffs prüfen; bestehende Nutzeränderungen
erhalten. Alte Gestaltungsanweisungen nicht aus der Vorgängerversion übernehmen.

- Node 22+ und pnpm install für den lokalen Server; Vorschau: node server.mjs.
- Prüfung: node scripts/check-launch.mjs. Backend zusätzlich: pnpm test.
- Hosting: bestehendes IONOS Deploy Now, GitHub main, Auslieferung von dist.
- Die drei vorhandenen IONOS-Workflows und die Domain-Verbindung beibehalten.
- Kontaktformular ist auf Betreiberwunsch sichtbar deaktiviert (direct-Modus).
  E-Mail und Telefon sind aktiv. Keine externen Formulardienste ergänzen.
- Der vorbereitete Node-Mailserver läuft nicht bei IONOS Deploy Now. Vor einer
  Freischaltung eine unterstützte Backend-Laufzeit, SMTP und Rechtstexte prüfen.
- Keine Geheimnisse in dist, Git oder Browsercode; .env bleibt lokal/ignoriert.
- Änderungen an Navigation/Footer in allen fünf Seiten konsistent ausführen.
- Bestehende Animationen, reduzierte Bewegung und mobile Darstellung erhalten.
- Weitere Pushes/Deployments nur bei entsprechendem Nutzerauftrag.

Rückfallstand und Hosting-Einzelheiten: LAUNCH-IONOS.md.
