import Vue from 'vue';
import Vuex from 'vuex';
import { getJsonStorage, vehicles } from '@/lib/utils';

Vue.use(Vuex);

export default new Vuex.Store({
    // In strict mode, whenever Vuex state is mutated outside of mutation handlers,
    // an error will be thrown.
    // Do not enable strict mode when deploying for production!
    strict: process.env.NODE_ENV !== 'production',
    state: {
        favoriteStations: getJsonStorage('favoriteStations', []),
        chosenVehicles: getJsonStorage('chosenVehicles', ['tram', 'citybus', 'cableway', 'ferry', 'hailedsharedtaxi']),
    },
    getters: {
        chosenMots(state) {
            return state.chosenVehicles.reduce((mots, vehicle) => {
                mots.push(vehicles[vehicle].mot);
                return mots;
            }, []);
        },
        sortedFavoriteStations(state) {
            return state.favoriteStations
                .slice()
                .sort((a, b) => {
                    if (!a.city || !a.stop) return -1;
                    if (!b.city || !b.stop) return 1;

                    if (a.city < b.city) return -1;
                    if (a.city > b.city) return 1;

                    if (a.stop < b.stop) return -1;
                    if (a.stop > b.stop) return 1;

                    return 0;
                });
        },
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
        addVehicle(state, vehicle) {
            const idx = state.chosenVehicles.indexOf(vehicle);
            if (idx > -1) return;
            state.chosenVehicles.push(vehicle);
            localStorage.setItem('chosenVehicles', JSON.stringify(state.chosenVehicles));
        },
        removeVehicle(state, vehicle) {
            const idx = state.chosenVehicles.indexOf(vehicle);
            if (idx === -1) return;
            state.chosenVehicles.splice(idx, 1);
            localStorage.setItem('chosenVehicles', JSON.stringify(state.chosenVehicles));
        },
    },
});
