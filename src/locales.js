import Vue from 'vue';
import VueTranslate from 'vue-translate-plugin';

Vue.use(VueTranslate);
Vue.locales({
    // all keys here have a leading underscore to make it easier in components to
    // recognice, where the translations is defined (in component or global/here).
    en: {
        _About: 'About',
        _Departures: 'Departures',
        _Settings: 'Settings',
        _Stations: 'Stations',
    },
    de: {
        _About: 'Über',
        _Departures: 'Abfahrten',
        _Settings: 'Einstellungen',
        _Stations: 'Haltestellen',
    },
});
