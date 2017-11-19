import Vue from 'vue';
import Router from 'vue-router';

import Stations from '@/components/Stations';
import Departure from '@/components/Departure';
import About from '@/components/About';

Vue.use(Router);

function getLang(route) {
    let lang = null;

    if (route.params.lang) {
        if (route.params.lang === 'de') lang = 'de';
        else lang = 'en';
    }

    return { lang };
}

function getLangGetter() {
    return getLang;
}

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect: { name: Stations.name },
        },
        {
            path: '/:lang?/stations',
            name: Stations.name,
            component: Stations,
            props: getLangGetter,
        },
        {
            path: '/:lang?/departure/:stationId',
            name: Departure.name,
            component: Departure,
            props(route) {
                return {
                    stationId: parseInt(route.params.stationId, 10),
                    ...getLangGetter()(route),
                };
            },
        },
        {
            path: '/:lang?/about',
            name: About.name,
            component: About,
            props: getLangGetter,
        },
    ],
});
