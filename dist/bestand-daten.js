'use strict';

// Modell, Baujahr und Verkaufsstatus des weißen Porsche sind vom Betreiber bestätigt.
// Unbestätigte Detailangaben nicht als gesicherte Fahrzeugdaten ergänzen.
// Redaktionelle Pflege: siehe BESTAND-PFLEGEN.md. Kein Build erforderlich.
window.THIEL_INVENTORY = {
  contact: { email: 'thieltrading@web.de', phone: '+49 173 4209980', tel: '+491734209980' },
  vehicles: [
    {
      id: 'porsche-klassiker-weiss',
      category: 'automobile',
      name: 'Porsche 911 F-Modell',
      example: false,
      availability: 'sold',
      facts: [
        { label: 'Baujahr', value: '1966' },
        { label: 'Zustand', value: 'Noch zu bestätigen' },
        { label: 'Charakter', value: 'Weiß & Chrom' }
      ],
      teaser: 'Klare Linien. Feine Chromdetails. Ein Klassiker mit unverwechselbarer Silhouette.',
      description: [
        'Die helle Lackierung, die runden Scheinwerfer und die feinen Chromdetails prägen diesen klassischen Porsche. Ein erster Eindruck von der Art Fahrzeuge, die uns begeistert.',
        'Dieser Porsche 911 F-Modell aus dem Baujahr 1966 ist verkauft. Die Zuordnung der Detailaufnahme zum Fahrzeug ist noch zu prüfen. Laufleistung, Zustand und Preis sind nicht bestätigt.'
      ],
      images: [
        { src: './assets/porsche-weiss-1440.webp', thumb: './assets/porsche-weiss-640.webp', alt: 'Weißer Porsche-Klassiker vor einem historischen Gebäude', width: 1170, height: 1560, position: '50% 58%' },
        { src: './assets/porsche-front-1440.webp', thumb: './assets/porsche-front-640.webp', alt: 'Beispielaufnahme: Scheinwerfer und Chromdetails eines weißen Porsche', width: 1168, height: 772, position: '50% 50%' }
      ]
    }
  ]
};
