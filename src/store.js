import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
    // In strict mode, whenever Vuex state is mutated outside of mutation handlers,
    // an error will be thrown.
    // Do not enable strict mode when deploying for production!
    strict: process.env.NODE_ENV !== 'production',
    state: {
        favoriteStations: (localStorage.getItem('favoriteStations') && JSON.parse(localStorage.getItem('favoriteStations')))
            || [],
    },
    mutations: {
        addStation(state, station) {
            const idx = state.favoriteStations.findIndex(s => s.id === station.id);
            if (idx > -1) return;
            state.favoriteStations.push(station);
            localStorage.setItem('favoriteStations', JSON.stringify(state.favoriteStations));
        },
        removeStation(state, station) {
            const idx = state.favoriteStations.findIndex(s => s.id === station.id);
            if (idx === -1) return;
            state.favoriteStations.splice(idx, 1);
            localStorage.setItem('favoriteStations', JSON.stringify(state.favoriteStations));
        },
    },
});
