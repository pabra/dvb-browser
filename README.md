DVB Browser
===========

[![GitHub package version](https://img.shields.io/github/package-json/v/pabra/dvb-browser.svg)]()
[![GitHub issues](https://img.shields.io/github/issues/pabra/dvb-browser.svg)](https://github.com/pabra/dvb-browser/issues)

Search for stations and see departures for each station of DVB (Dresdner Verkehrsbetriebe)
and VVO (Verkehrsverbund Oberelbe).

I created this repository because:
* DVB/VVO app is badly usable/slow
* [Öffi] is great/fast but no realtime data for Dresden
* [dvbjs] becomes too big for a browser app using mobile network
* searched for a project to play with [Vue.js]

The compiled and packed current version can be accessed at [dvb.peppnet.de](https://dvb.peppnet.de).
The source code can be found on [github](https://github.com/pabra/dvb-browser).

Please do not use this app/service if accurate data is absolutely
important to you. This is all pretty beta currently.


Build Setup
-----------

```bash
# install dependencies
npm install

# you can also use yarn
yarn install

# serve with hot reload at localhost:8008
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
