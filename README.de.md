DVB Browser
===========

Suche nach Haltestellen und Abfahrtszeiten für jede Haltestelle der DVB (Dresdner Verkehrsbetriebe)
und VVO (Verkehrsverbund Oberelbe).

Ich habe dieses Repository erstellt weil:
* DVB/VVO App schlecht benutzbar/langsam ist
* [Öffi] großartig/schnell ist aber keine Echtzeit-Daten für Dresden liefert
* [dvbjs] zu groß für eine Browser-App über mobiles Internet wird
* ich nach einem Projekt gesucht hab, um mit [Vue.js] zu spielen

Die kompilierte und gepackte aktuelle Version kann auf [dvb.peppnet.de](https://dvb.peppnet.de)
abgerufen werden. Der Quellcode liegt auf [github](https://github.com/pabra/dvb-browser).

Wer auf akkurate und verlässliche Daten angewiesen sollte diese App vorsichtshalber
nicht benutzen. Das ist alles noch ziemlich beta.

Build Setup
-----------

```bash
# Abhängigkeiten installieren
npm install

# yarn geht auch
yarn install

# dev server starten auf localhost:8080
npm run dev

# für Produktion bauen
npm run build

# für Produktion bauen und bundle analyzer ansehen
npm run build --report
```


credits
-------

Der Teil zur Kommunikation mit der DVB/VVO API ist von [@kiliankoe]'s
Repositories [dvbjs] und [vvo] entnommen und für den Einsatz als Single Page
Application im Browser optimiert.


[Öffi]: https://oeffi.schildbach.de/
[Vue.js]: https://vuejs.org/
[@kiliankoe]: https://github.com/kiliankoe
[dvbjs]: https://github.com/kiliankoe/dvbjs
[vvo]: https://github.com/kiliankoe/vvo
