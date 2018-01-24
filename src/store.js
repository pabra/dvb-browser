import Vue from 'vue';
import Vuex from 'vuex';
import { getJsonStorage, vehicles, localStorageAvailable } from '@/lib/utils';
import { fetchRouteChanges } from '@/lib/fetch';
import Logger, { errorToObject } from '@/lib/logger';

Vue.use(Vuex);

const logger = Logger.get('vuex store');
const defaultStates = {
    favoriteStations() { return []; },
    chosenVehicles() { return ['tram', 'citybus', 'cableway', 'ferry', 'hailedsharedtaxi']; },
};

export default new Vuex.Store({
    // In strict mode, whenever Vuex state is mutated outside of mutation handlers,
    // an error will be thrown.
    // Do not enable strict mode when deploying for production!
    strict: process.env.NODE_ENV !== 'production',
    state: {
        favoriteStations: getJsonStorage('favoriteStations', defaultStates.favoriteStations()),
        chosenVehicles: getJsonStorage('chosenVehicles', defaultStates.chosenVehicles()),
        isVisible: true,
        isOnline: undefined,
        windowWidth: 0,
        windowHeight: 0,
        routeChanges: {},
        routeChangesLoading: false,
        routeChangesFetched: null,
        // localStorage might not be available eg. android browser runs in private mode
        localStorageAvailable: localStorageAvailable(),
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
        /* eslint-disable no-param-reassign */
        addStation(state, station) {
            const idx = state.favoriteStations.findIndex(s => s.id === station.id);
            if (idx > -1) return;
            state.favoriteStations.push(station);
            if (!state.localStorageAvailable) return;
            localStorage.setItem('favoriteStations', JSON.stringify(state.favoriteStations));
        },
        removeStation(state, station) {
            const idx = state.favoriteStations.findIndex(s => s.id === station.id);
            if (idx === -1) return;
            state.favoriteStations.splice(idx, 1);
            if (!state.localStorageAvailable) return;
            localStorage.setItem('favoriteStations', JSON.stringify(state.favoriteStations));
        },
        addVehicle(state, vehicle) {
            const idx = state.chosenVehicles.indexOf(vehicle);
            if (idx > -1) return;
            state.chosenVehicles.push(vehicle);
            if (!state.localStorageAvailable) return;
            localStorage.setItem('chosenVehicles', JSON.stringify(state.chosenVehicles));
        },
        removeVehicle(state, vehicle) {
            const idx = state.chosenVehicles.indexOf(vehicle);
            if (idx === -1) return;
            state.chosenVehicles.splice(idx, 1);
            if (!state.localStorageAvailable) return;
            localStorage.setItem('chosenVehicles', JSON.stringify(state.chosenVehicles));
        },
        clearStorage(state) {
            if (state.localStorageAvailable) localStorage.clear();
            state.favoriteStations = defaultStates.favoriteStations();
            state.chosenVehicles = defaultStates.chosenVehicles();
        },
        setIsVisible(state, isVisible) {
            state.isVisible = !!isVisible;
        },
        setIsOnline(state, isOnline) {
            state.isOnline = !!isOnline;
        },
        setWindowWidth(state, width) {
            state.windowWidth = width;
        },
        setWindowHeight(state, height) {
            state.windowHeight = height;
        },
        setRouteChangesLoading(state, isLoading) {
            state.routeChangesLoading = !!isLoading;
        },
        setRouteChanges(state, changes) {
            state.routeChanges = changes;
            state.routeChangesFetched = new Date();
        },
    },
    actions: {
        async getRouteChanges({ commit, state }) {
            if (
                state.isOnline === false ||
                state.setRouteChangesLoading || (
                    state.routeChangesFetched &&
                    new Date() - state.routeChangesFetched < 60 * 60 * 1000
                )
            ) return;

            commit('setRouteChangesLoading', true);
            let res;
            try {
                res = await fetchRouteChanges();
            } catch (err) {
                logger.error('getRouteChanges cought error', {
                    error: await errorToObject(err),
                });
                res = {};
            }
            commit('setRouteChanges', res);
            commit('setRouteChangesLoading', false);
        },
    },
});
