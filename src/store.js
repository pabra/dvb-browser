import Vue from 'vue';
import Vuex from 'vuex';
import { getJsonStorage, vehicles, localStorageAvailable } from '@/lib/utils';
import { fetchRouteChanges } from '@/lib/fetch';
import Logger, { errorToObject } from '@/lib/logger';
import { ValueError } from '@/lib/errors';

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
        messageNextId: 0,
        messages: [],
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
            if (!localStorageAvailable) return;
            localStorage.setItem('favoriteStations', JSON.stringify(state.favoriteStations));
        },
        removeStation(state, station) {
            const idx = state.favoriteStations.findIndex(s => s.id === station.id);
            if (idx === -1) return;
            state.favoriteStations.splice(idx, 1);
            if (!localStorageAvailable) return;
            localStorage.setItem('favoriteStations', JSON.stringify(state.favoriteStations));
        },
        addVehicle(state, vehicle) {
            const idx = state.chosenVehicles.indexOf(vehicle);
            if (idx > -1) return;
            state.chosenVehicles.push(vehicle);
            if (!localStorageAvailable) return;
            localStorage.setItem('chosenVehicles', JSON.stringify(state.chosenVehicles));
        },
        removeVehicle(state, vehicle) {
            const idx = state.chosenVehicles.indexOf(vehicle);
            if (idx === -1) return;
            state.chosenVehicles.splice(idx, 1);
            if (!localStorageAvailable) return;
            localStorage.setItem('chosenVehicles', JSON.stringify(state.chosenVehicles));
        },
        clearStorage(state) {
            if (localStorageAvailable) localStorage.clear();
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
        messageAdd(state, message) {
            if (!message.text) throw new ValueError('no empty messages allowed');
            if (typeof message.setRemoveTimeout !== 'function') throw new TypeError('message lacks setRemoveTimeout function');
            if (typeof message.remove !== 'function') throw new TypeError('message lacks remove function');
            if (['info', 'warning', 'error'].indexOf(message.level) === -1) {
                throw new ValueError(`unknown message level: ${message.level}`);
            }
            message.id = state.messageNextId;
            state.messages.push(message);
            state.messageNextId += 1;
        },
        messageRemove(state, msg) {
            const idx = state.messages.indexOf(msg);
            if (idx === -1) return;
            msg.remove();
            state.messages.splice(idx, 1);
            logger.debug('stored messages left', state.messages.length);
        },
    },
    actions: {
        async getRouteChanges({ commit, state }) {
            if (
                state.isOnline === false ||
                state.setRouteChangesLoading ||
                (
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
        messageAddAndReturn({ commit }, data) {
            let removeTimeout = null;
            let removed = false;
            const message = Object.assign(
                {
                    text: '',
                    subject: null,
                    level: 'info',
                    timeToDisplay: 20000,
                },
                data,
                {
                    setRemoveTimeout() {
                        if (removeTimeout !== null) return;
                        if (!message.timeToDisplay) return;
                        removeTimeout = setTimeout(message.remove, message.timeToDisplay);
                    },
                    remove() {
                        if (removeTimeout) {
                            clearTimeout(removeTimeout);
                            removeTimeout = null;
                        }
                        if (removed) return;
                        removed = true;
                        commit('messageRemove', message);
                    },
                },
            );
            commit('messageAdd', message);

            return message;
        },
    },
});
