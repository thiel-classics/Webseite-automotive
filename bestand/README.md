# Fahrzeuge in BESTAND pflegen

Es gibt genau eine Fahrzeugliste: **`dist/data/vehicles.json`**.
Die Originalbilder liegen unter **`dist/assets/vehicles/`**.
Du musst keine HTML-, CSS- oder JavaScript-Dateien bearbeiten. Es wird kein CMS
und kein externer Fahrzeugdienst benötigt. Die Liste wird bei jedem Seitenaufruf
neu geladen. Verfügbare Fahrzeuge erscheinen automatisch vor verkauften.

## Ein neues Fahrzeug über GitHub hinzufügen

Die Fahrzeugverwaltung liegt im bestehenden Repository
**thiel-classics/Webseite-automotive**. Änderungen auf `main` werden über das
bestehende IONOS-Verfahren veröffentlicht.

1. Öffne das Repository auf GitHub und den Ordner `dist/assets/vehicles`.
2. Wähle **Add file → Upload files**. Lade das Fahrzeugbild hoch, zum Beispiel
   `porsche-993-1996.jpg`. Verwende kurze Namen ohne Leerzeichen/Umlaute.
3. Speichere die Änderung mit **Commit changes**.
4. Öffne `dist/data/vehicles.json` und klicke auf den Stift **Edit this file**.
5. Kopiere einen Eintrag, passe ihn an und speichere mit **Commit changes**.
   Zwischen zwei Einträgen steht ein Komma, hinter dem letzten keines.

Das bestehende IONOS-Verfahren veröffentlicht Änderungen an `main` automatisch.
Warte auf den erfolgreichen grünen Deploy-Lauf bei **Actions**, bevor du die
öffentliche Seite neu lädst. Lade zuerst das Bild hoch und danach die Daten,
damit zwischen den beiden Schritten kein fehlendes Fahrzeugbild erscheint.
Zum Vorbereiten ohne Veröffentlichung einen separaten Branch verwenden.

## Beispiel: zwei Fahrzeuge

`vehicles.json` ist eine Liste zwischen eckigen Klammern. Ein vollständiges
Beispiel mit dem vorhandenen verkauften Porsche und einem **Platzhalter** zum
Ersetzen durch echte, geprüfte Angaben:

```json
[
  {
    "id": "porsche-911-f-1966",
    "title": "Porsche 911 F-Modell",
    "year": 1966,
    "status": "sold",
    "price": "",
    "location": "Las Vegas, Nevada",
    "image": "/assets/vehicles/porsche-911-f-1966.jpg",
    "imageAlt": "Weißer klassischer Porsche 911 vor einem historischen Gebäude",
    "imagePosition": "50% 58%",
    "description": "Deine Beschreibung des Fahrzeugs.",
    "details": []
  },
  {
    "id": "eindeutige-fahrzeug-id",
    "title": "Marke und Modell",
    "year": 1996,
    "status": "available",
    "price": "Preis auf Anfrage",
    "location": "",
    "image": "/assets/vehicles/dein-neues-bild.jpg",
    "imageAlt": "Beschreibe das tatsächlich gezeigte Fahrzeug",
    "imagePosition": "50% 50%",
    "description": "Kurze Beschreibung mit ausschließlich bestätigten Angaben.",
    "details": []
  }
]
```

## Was du ändern kannst

| Feld | Bedeutung |
| --- | --- |
| `id` | Einmaliger Name mit kleinen Buchstaben, Ziffern und Bindestrichen. |
| `title` | Sichtbarer Fahrzeugname. |
| `year` | Baujahr als Zahl, ohne Anführungszeichen. |
| `status` | `available` = verfügbar, `sold` = verkauft. `for sale` wird ebenfalls als verfügbar erkannt. |
| `price` | Zahl in Euro, z. B. `89900`, oder Text wie `"Preis auf Anfrage"`. `""` blendet den Preis aus. |
| `location` | Herkunft, nur wenn bekannt; `""` lässt die Zeile entfallen. |
| `image` | Öffentlicher Bildpfad, beginnt mit `/assets/vehicles/` – hier **ohne** `dist`. Dateiname und Groß-/Kleinschreibung müssen stimmen. JPG, JPEG, PNG, WebP und AVIF funktionieren. |
| `imageAlt` | Kurze Bildbeschreibung, unter anderem für Screenreader. |
| `imagePosition` | Ausschnitt: `"50% 50%"` mittig, z. B. `"50% 65%"` weiter unten. Originaldatei bleibt unverändert. |
| `description` | Beschreibung für das weiße Detailfenster. |
| `details` | Optionale bestätigte Angaben. Mit `[]` leer lassen. |

Optionale zusätzliche Angaben im Detailfenster können so eingetragen werden:

```json
"details": [
  {"label": "Getriebe", "value": "Deine bestätigte Angabe"},
  {"label": "Laufleistung", "value": "Deine bestätigte Angabe"}
]
```

## Verkauft markieren, ändern oder entfernen

- **Verkauft:** `"status": "sold"` setzen. SOLD erscheint dezent rot. Ein Preis
  wird in Übersicht und Detailfenster automatisch unterdrückt, selbst wenn im
  Datensatz noch ein alter Preis steht. Am besten `"price": ""` setzen.
- **Ändern:** Den gewünschten Text oder Wert im Eintrag überschreiben.
- **Reihenfolge:** Innerhalb derselben Statusgruppe gilt die Reihenfolge in der
  Datei. Die Sortierung „verfügbar zuerst“ erledigt die Seite selbst.
- **Entfernen:** Den vollständigen Eintrag einschließlich passendem Komma aus
  der Liste löschen. Alle entfernen: `[]`. Ein ungenutztes Bild kann separat
  gelöscht werden, sobald es nirgendwo sonst verwendet wird.

Keine erfundenen Fahrzeugdaten ergänzen. Die Kontaktlinks im Detailfenster
verwenden die vorhandene THIEL-E-Mail und Telefonnummer.

## Wenn etwas nicht erscheint

Prüfe Kommas, Anführungszeichen, die einmalige ID und den Bildpfad. Ungültige
Daten erzeugen eine sichtbare Meldung mit „Erneut laden“. GitHub **History**
zeigt frühere Fassungen zum Wiederherstellen.

Lokal: `node server.mjs`, dann `http://127.0.0.1:4173/bestand` öffnen.
Prüfung: `node --test tests/bestand.test.mjs` (kein echter Mailversand).
