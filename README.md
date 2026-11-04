# THIEL CLASSIC’N SPORTCARS

Website für https://thiel-classics.de/ mit lokal gespeicherten Bildern und Schriften.
Die sieben Seiten liegen in dist: Startseite, /about, /ankauf, /bestand,
/kontakt, /impressum und /datenschutz. .htaccess erhält die früheren
.html-Adressen als Weiterleitungen.

Fahrzeuge manuell über GitHub pflegen: [Anleitung](bestand/README.md).
Die Fahrzeugliste liegt in `dist/data/vehicles.json`, die Bilder in
`dist/assets/vehicles/`. Verfügbare Fahrzeuge stehen vor verkauften; ein
verkauftes Fahrzeug zeigt keinen Preis.

## Entwicklung

Node 22+ verwenden, pnpm install --frozen-lockfile und pnpm run dev.
Die Vorschau läuft unter http://127.0.0.1:4173/.
Prüfung vor Veröffentlichung: node scripts/check-launch.mjs.

## Veröffentlichung

Die vorhandenen IONOS-Workflows übernehmen main und veröffentlichen ausschließlich
dist. Es ist kein Frontend-Build notwendig. Keine .env oder Zugangsdaten hochladen.

Das Kontaktformular ist auf Betreiberwunsch bis zur SMTP-Einrichtung sichtbar
deaktiviert. Direkte E-Mail-/Telefonlinks funktionieren. Der vorbereitete
Node-Mailserver gehört zum Quellcode, wird im aktuellen statischen IONOS-Projekt
aber nicht ausgeführt. Einrichtung: KONTAKT-KONFIGURATION.md.

Relaunch, gesicherte Vorgängerversion und spätere Freischaltung: LAUNCH-IONOS.md.
Datenschutz-Abgleich: RECHTSTEXTE-PRUEFUNG.md.
