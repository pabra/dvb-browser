import Vue from 'vue';
import Router from 'vue-router';

import Stations from '@/components/Stations';
import Departure from '@/components/Departure';
import Settings from '@/components/Settings';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/stations',
            name: Stations.name,
            component: Stations,
        },
        {
            path: '/departure/:stationId',
            name: Departure.name,
            component: Departure,
            // props: true,
            props(route) { return { stationId: parseInt(route.params.stationId, 10) }; },
        },
        {
            path: '/settings',
            name: Settings.name,
            component: Settings,
        },
    ],
});
