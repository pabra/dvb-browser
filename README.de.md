DVB Browser
===========

Suche nach Haltestellen und Abfahrtszeiten für jede Haltestelle der DVB (Dresdner Verkehrsbetriebe)
und VVO (Verkehrsverbund Oberelbe).

Ich habe dieses Repository erstellt weil:
* DVB/VVO App schlecht benutzbar/langsam ist
* [Öffi] großartig/schnell ist aber keine Echtzeit-Daten für Dresden liefert
* [dvbjs] zu groß für eine Browser-App über mobiles Internet wird
* ich nach einem Projekt gesucht hab, um mit [Vue.js] zu spielen

There is always the current master version running at [https://dvb.peppnet.de]().

Please do not use this app/service if accurate data is absolutely
important to you. This is all pretty beta currently.


Build Setup
-----------

```bash
# install dependencies
npm install

# you can also use yarn
yarn install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```


credits
-------

The part that communicates with DVB/VVO API is taken from [@kiliankoe]'s
repositories [dvbjs] and [vvo]
and made suitable for a single page application in your browser.


[Öffi]: https://oeffi.schildbach.de/
[Vue.js]: https://vuejs.org/
[@kiliankoe]: https://github.com/kiliankoe
[dvbjs]: https://github.com/kiliankoe/dvbjs
[vvo]: https://github.com/kiliankoe/vvo
