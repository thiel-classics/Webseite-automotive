# Kontaktformular: lokale Vorschau und Produktivbetrieb

Die Seite liegt unter `/kontakt`, der eigene Versand-Endpunkt unter `POST /api/contact`.
Es wird kein Formulardienst verwendet. Der Versand erfolgt mit Nodemailer per SMTP
vom eigenen Node-Server an ausschließlich **info@thiel-classics.de** (IONOS
Hosted Microsoft Exchange, bearbeitet in Outlook). Hosting- und
E-Mail-Anbieter bleiben an der technischen Verarbeitung beteiligt.

## Lokale Vorschau ohne E-Mail-Versand

Mit `node server.mjs --preview-contact` starten und `http://127.0.0.1:4173/kontakt`
öffnen. Die Vorschau ignoriert die lokale `.env` und benutzt einen Test-Transport
ohne Netzwerkzugriff. Die Erfolgsanzeige kennzeichnet die Simulation. Die
öffentliche Kontaktseite aktiviert das Formular erst, wenn ihr eigener Endpunkt
die Versandbereitschaft meldet.

## Lokale Einrichtung

Node.js 22 oder neuer verwenden. Abhängigkeiten aus `pnpm-lock.yaml` installieren
(`pnpm install --frozen-lockfile`). `.env.example` lokal nach `.env` kopieren und
die tatsächlichen SMTP-Einstellungen des Mailanbieters einsetzen. Die lokale
`.env` wird beim Serverstart geladen und ist vom Webserver nicht erreichbar.
Zugangsdaten nie in `dist/`, Browsercode oder Versionsverwaltung ablegen.

Benötigt werden SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS und
SMTP_FROM. SMTP_FROM ist eine beim Anbieter zugelassene Absenderadresse. Die
Besucheradresse wird nur als Reply-To verwendet; Empfänger und Betreff sind fest.
Der Mailinhalt wird ausschließlich als Klartext gesendet. Anhänge, Datei- und
URL-Zugriffe sind deaktiviert. TLS und Zertifikatsprüfung sind vorgeschrieben.

Ohne vollständige SMTP-Konfiguration antwortet der Server mit 503. Es wird dann
keine Mail gesendet und kein Erfolg angezeigt. Browser-Eingaben bleiben erhalten.
SMTP-Annahme bestätigt die Übergabe an den Mailserver, keine Zustellgarantie.
Technische Referenz: [Nodemailer SMTP](https://nodemailer.com/smtp) und
[Nachrichtenkonfiguration](https://nodemailer.com/message).

## Datenschutzseite und Freischaltung

Die lokale Datenschutzerklärung liegt unter `/datenschutz` in
`dist/datenschutz/index.html`, das Impressum unter `/impressum`.
Beide Seiten sind in allen Footern verlinkt; die Formularhinweise führen auch
ohne JavaScript direkt zur vorhandenen Datenschutzseite. Der API-Status meldet
deren URL unabhängig von der Versandfreigabe.
Bis die Erklärung geprüft wurde und `PRIVACY_NOTICE_READY=true` gesetzt ist,
bleibt auch bei vorhandenem SMTP der echte Versand gesperrt.
Die Kenntnisnahme-Checkbox ist freiwillig und wird nicht übermittelt;
sie dient nicht als pauschale Einwilligung oder festgelegte Rechtsgrundlage.

Vor Freischaltung sind durch den Betreiber zu ergänzen bzw. prüfen:

- Verantwortlicher, tatsächliche ladungsfähige Anschrift und Kontakt.
- Zweck (Bearbeitung von Fahrzeug-/Kontaktanfragen) und passende Rechtsgrundlage.
- Daten: Name, E-Mail-Adresse, Nachricht. Kein Budget, Upload oder weiteres Feld.
- Tatsächlich eingesetzter Hoster, E-Mail-Anbieter, Empfänger/Zugriffsberechtigte,
  Vertrags-/Auftragsverarbeitungsverhältnisse und ggf. Drittlandtransfers.
- Aufbewahrung und Löschung im Postfach einschließlich Backups und gesetzlicher
  Pflichten. Es wurde keine pauschale Frist erfunden.
- Betroffenenrechte, zuständige Aufsichtsbehörde und Beschwerdemöglichkeiten.
- Technische Server-/Proxyprotokolle, deren Inhalte, Zwecke und Löschfristen.

Diese Dokumentation beschreibt die Umsetzung, nicht eine fertige Rechtsprüfung.
Der aktuelle Abgleich und die offenen Angaben stehen in `RECHTSTEXTE-PRUEFUNG.md`.

## Technische Datenverarbeitung

Die Anwendung speichert keine Nachrichten in einer Datenbank, Datei, Session,
Analytics oder localStorage. Formulardaten bestehen während der Bearbeitung im
Arbeitsspeicher und nach Versand im Empfängerpostfach. Fehlerprotokolle enthalten
keine Formularinhalte, SMTP-Antworten oder Zugangsdaten. Das SMTP-Logging ist aus.

Origin, Host und Fetch-Site werden geprüft; JSON ist der einzige akzeptierte
Inhaltstyp. Name max. 100, E-Mail max. 254, Nachricht max. 5000 Zeichen; Request
max. 24 KiB. Serverseitige Prüfung ist unabhängig vom Browser. Ein gefülltes
Honeypot-Feld wird zurückgewiesen. Es gibt kein externes CAPTCHA und keine Cookies.

Zur Missbrauchsbegrenzung sind 5 POST-Versuche je 15 Minuten pro Verbindungs-IP
zulässig. Gespeichert werden nur ein HMAC der IP mit zufälligem, nicht dauerhaft
gespeichertem Serverschlüssel, Anzahl und Ablaufzeit im RAM. Einträge werden nach
Ablauf spätestens im nächsten Minutenlauf gelöscht; Neustart verwirft alles.
Diese kurzlebigen pseudonymen Merkmale sind in der Datenschutzerklärung zu nennen.
Der Server liest bewusst keine frei mitgeschickten X-Forwarded-For-Adressen.

## Späterer Produktivbetrieb

Das derzeitige Deploy-Now-Projekt liefert `dist/` statisch aus und startet
den Node-Server nicht. Ein Push der statischen Dateien allein schaltet das
Formular daher nicht frei. Für einen Betrieb innerhalb von Deploy Now wäre
ein PHP-Projekt mit serverseitigem Endpunkt und SMTP-Konfiguration erforderlich.
Alternativ kann der vorhandene Node-Endpunkt auf einer kompatiblen Serverlaufzeit
hinter einem Reverse Proxy derselben Website betrieben werden. Laufzeit und
autorisierter SMTP-Absender müssen vor einer Freischaltung feststehen.
[IONOS: Laufzeitkonfiguration](https://docs.ionos.space/docs/runtime-configuration/)

`NODE_ENV=production`, exakte `PUBLIC_ORIGIN=https://…` und HTTPS konfigurieren.
Der Server bindet weiterhin an Loopback. Bei einem lokalen Reverse Proxy kann
`TRUST_PROXY=loopback` gesetzt werden. Der Proxy muss den öffentlichen Host
erhalten, Client-Forwarding-Header entfernen und selbst `X-Forwarded-Proto: https`
setzen. Unverschlüsselte API-Anfragen werden in Produktion abgelehnt.

Beim Proxy wären ohne eigene, vertrauenswürdige IP-Auflösung alle Besucher eine
Rate-Limit-Gruppe. Deshalb dort zusätzlich ein datensparsames Limit je Besucher
konfigurieren bzw. die Vertrauenskette vor Veröffentlichung prüfen. Für mehrere
Serverinstanzen muss die Begrenzung entsprechend gemeinsam gelöst werden.
Proxy-/Hoster-Logs separat datensparsam konfigurieren (keine Request-Bodies,
kurze erforderliche Fristen). Öffentliche Website samt TLS und Datenschutzerklärung
prüfen, bevor der Versand freigeschaltet wird. Diese Aufgabe veröffentlicht nichts.

## Prüfung

`pnpm run check` prüft die Syntax, `pnpm test` prüft den Endpunkt mit einem rein
lokalen Test-Transport. Dabei wird keine echte E-Mail verschickt. Ein echter
SMTP-Versandtest steht bis zur Einrichtung der Zugangsdaten noch aus.
