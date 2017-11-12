import Vue from 'vue';
import Router from 'vue-router';

import Index from '@/components/Index';
import Stations from '@/components/Stations';
import Departure from '@/components/Departure';
import About from '@/components/About';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: Index.name,
            component: Index,
        },
        {
            path: '/stations',
            name: Stations.name,
            component: Stations,
        },
        {
            path: '/departure/:stationId',
            name: Departure.name,
            component: Departure,
            props(route) { return { stationId: parseInt(route.params.stationId, 10) }; },
        },
        {
            path: '/about',
            name: About.name,
            component: About,
        },
    ],
});
