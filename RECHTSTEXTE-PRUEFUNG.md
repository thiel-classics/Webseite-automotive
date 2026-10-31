# Rechtstexte: Stand 31. Oktober 2026

Die Seiten `/impressum` und `/datenschutz` sind lokal ergänzt. Das Impressum
übernimmt die vom Betreiber vorgegebenen Inhalte. Die Datenschutzerklärung ist
an den vorhandenen Code angepasst, keine abschließende rechtliche Prüfung.

## Bestätigte Entscheidungen

- Verantwortlicher und Anschrift: Thiel Classics, Inhaber Nils Thiel,
  Heinrich-Fries-Str. 90, 74229 Oedheim, Deutschland.
- Kontakt: thieltrading@web.de, +49 173 4209980.
- IONOS Deploy Now und WEB.DE sind für den öffentlichen Betrieb vorgesehen,
  vom Betreiber im Chat ausdrücklich bestätigt.
- Keine pauschale feste Löschfrist für erledigte Kontaktanfragen:
  nach Abschluss und Wegfall des Zwecks löschen, vorbehaltlich einschlägiger
  gesetzlicher Pflichten und berechtigter weiterer Zwecke. Die frühere
  30-Tage-Frist wurde auf ausdrückliche Entscheidung des Betreibers ersetzt.
  Die Löschung im Postfach muss der Betreiber umsetzen; der Websitecode
  löscht oder verwaltet das Postfach nicht.

## Gegen den vorhandenen Code geprüft

- Name, E-Mail-Adresse und Nachricht, alle erforderlich; kein Upload.
- Eigener JSON-Endpunkt `/api/contact`; keine externe Formularplattform.
- SMTP mit festem Empfänger, Besucheradresse nur als Antwortadresse.
- Keine dauerhafte Speicherung oder Inhaltsprotokollierung in der Anwendung.
- Eingabeprüfung, Honeypot, Ratenbegrenzung mit flüchtigem HMAC der
  Verbindungsadresse plus Zähler und Ablauf. 15-Minuten-Fenster,
  Bereinigung spätestens im folgenden Minutenlauf.
- Keine externen Schriften, Videos, Karten, Tracker oder CAPTCHA-Einbindung.
- Suche im Browser mit Nachladen ausschließlich der eigenen Startseite.
- Instagram nur als gewöhnlicher externer Link.
- Lokale `.env` ist nicht eingerichtet. Keine SMTP-Zugangsdaten ergänzt,
  keine E-Mails versendet und `PRIVACY_NOTICE_READY` nicht aktiviert.

## Vor dem öffentlichen Betrieb noch zu klären

1. **IONOS-Laufzeit:** Deploy Now unterstützt statische und PHP-Projekte,
   bietet aber keine Node-Laufzeit für den vorhandenen `server.mjs`-Mailserver.
   Vor Veröffentlichung entweder den eigenen Endpunkt für die unterstützte
   IONOS-Laufzeit umsetzen oder ein passendes Backend-Hosting festlegen.
   Ein reiner Upload von `dist/` stellt keinen Formularversand bereit.
   Dies ist eine separate Implementierungsaufgabe; hier wurde kein Hosting
   geändert und keine Veröffentlichung vorgenommen.
2. **WEB.DE-SMTP:** Tatsächlichen Tarif, gewerbliche Nutzung, Zugang und
   autorisierte Absenderadresse sowie SMTP-Einstellungen im Betreiberkonto
   prüfen. Die öffentliche Erklärung nennt WEB.DE als geplanten Versandweg,
   nicht als bereits eingerichteten SMTP-Zugang. Keine Geheimnisse in `dist/`.
3. **Verarbeitungsverhältnisse:** Tatsächliche Hosting-/Mailverträge,
   erforderliche Auftragsverarbeitung, Unterauftragnehmer und etwaige
   Drittlandvorgänge des gewählten Tarifs prüfen. Es wird keine abgeschlossene
   Vereinbarung oder ausschließlich deutsche Verarbeitung behauptet.
4. **Betrieb:** Reale Log-/Proxy-Konfiguration, Zugriffsberechtigungen,
   Postfachlöschung, Backups und gesetzliche Aufbewahrungspflichten prüfen.
   Anbieterangaben zu Log-Verfügbarkeit sind keine selbst erfundenen
   Löschfristen für Nachrichten. Die gelieferte Erklärung beschränkt diese
   Angaben entsprechend auf den jeweiligen Vorgang.
5. **Finalisierung:** Hinweise auf die lokale Vorschau und den geplanten Betrieb
   vor Veröffentlichung an den dann tatsächlich eingerichteten Zustand anpassen.
   Erst nach inhaltlicher Prüfung und vollständiger Versand-/HTTPS-Konfiguration
   `PRIVACY_NOTICE_READY=true` setzen und einen autorisierten Zustelltest durchführen.

## Lokale Prüfung

Syntaxprüfung und alle acht Formular-Endpunkttests bestanden. Die zusätzliche
Statusprüfung bestätigt: vorhandene Datenschutzseite wird erkannt, ohne die
Versandsperre vor abgeschlossener Prüfung aufzuheben. Kein echter SMTP-Versand.
Alle fünf Seiten wurden mit 1440, 1024 und 390 Pixel Breite im Browser geprüft,
zusätzlich Impressum und Formular mit 320 Pixel. Keine horizontale Seitenüberbreite
oder überlappenden Footerlinks; alle vier Footer-Klickflächen mindestens 44 Pixel
hoch. Neue Links, weißer Startseitenfooter, Menü, Suche, BACK TO TOP und sichtbarer
Tastaturfokus am Datenschutzlink funktionieren. Lokale Link- und Assetziele sind
vorhanden. Screenshots liegen unter `qa/impressum-*.png` und `qa/datenschutz-*.png`.

## Quellen

- [IONOS Deploy Now: Laufzeit und unterstützte Projekte](https://docs.ionos.space/docs/faq/)
- [IONOS Deploy Now: Serverprotokolle, höchstens acht Wochen verfügbar](https://docs.ionos.space/docs/deployment-viewer/)
- [IONOS Deploy Now: Besucherstatistik aus Logs](https://docs.ionos.space/docs/visitor-statistics/)
- [IONOS-Datenschutzhinweise](https://www.ionos.de/terms-gtc/datenschutzerklaerung/)
- [WEB.DE: Datenschutzhinweise](https://agb-server.web.de/datenschutz/)
- [WEB.DE: Anbieterangaben](https://web.de/impressum/)
- [DSGVO, amtliches Handbuch des Bundesfinanzministeriums](https://amtliche-handbuecher.bundesfinanzministerium.de/ao/2024/Datenschutz-Grundverordnung/inhalt.html)
- [Informationspflichten, Sächsische Datenschutzbehörde](https://www.datenschutz.sachsen.de/informationspflichten.html)
- [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html)
- [LfDI Baden-Württemberg: Kontaktdaten](https://www.baden-wuerttemberg.datenschutz.de/kontakt-aufnehmen/)
