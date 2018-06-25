<template lang="pug">
    div
        h1(v-translate=1) _Stations

        StationInput(
            v-model="findStation"
            :disabledAll="isOnline === false || loadingGeoLocation"
            :disabledGps="loadingStations"
            :loadingStations="loadingStations"
            :loadingGps="loadingGeoLocation"
            :showGps="geolocationAvailable"
            :showLocation="findStationGeo !== null"
            @getLocation="onGetGeolocation"
            @showLocationOverlay="onShowLocationOverlay"
            @clear="foundStations=[]"
        )

        table.u-full-width(v-if="foundStations.length")
            thead
                tr
                    th(colspan="2" v-translate=1) found stations

            transition-group(name="list" tag="tbody")
                tr(v-for="station in foundStations" :key="station.id")
                    td.station
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ stationName(station) }}
                    td.buttons
                        button.location(@click="showLocaton(station)"
                                :disabled="isOnline === false")
                            i.material-icons location_on

                        button.favorites.add(@click="addStation(station)"
                                :class="{added: isFavorite(station)}")
                            i.material-icons

        table.u-full-width(v-if="sortedFavoriteStations.length")
            thead
                tr
                    th(colspan="2" v-translate=1) favorite stations

            transition-group(name="list" tag="tbody")
                tr(
                    v-for="station of sortedFavoriteStations"
                    :key="station.id"
                    :class="{highlight: highlightStations.indexOf(station.id) !== -1}"
                )
                    td.station
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ stationName(station) }}
                    td.buttons
                        button.location(@click="showLocaton(station)"
                                :disabled="isOnline === false")
                            i.material-icons
                                | location_on

                        button.favorites.remove(@click="removeStation(station)")
                            i.material-icons
</template>

<script>
    import _ from 'lodash';
    import { mapState, mapGetters } from 'vuex';
    import StationInput from '@/components/StationInput';
    import Departure from '@/components/Departure';
    import { fetchSations } from '@/lib/fetch';
    import Leaflet from '@/components/Leaflet';
    import Logger, { errorToObject } from '@/lib/logger';
    import { ensureInt, stationName, WGS84toGK4, coordsToGeo, parseGeo } from '@/lib/utils';

    export default {
        name: 'Stations',
        components: {
            StationInput,
            Leaflet,
        },
        data() {
            return {
                loadingStations: false,
                loadingGeoLocation: false,
                locationWatchId: null,
                getLocationTime: null,
                findStationGeo: null,
                foundStations: [],
                findStation: '',
                highlightStations: [],
                logger: Logger.get(`${this.$options.name} component`),
                stationName,
            };
        },
        computed: {
            ...mapGetters(['sortedFavoriteStations']),
            ...mapState(['isOnline']),
            favoriteStationsToUpdate() {
                return this.sortedFavoriteStations
                    .filter((station) => {
                        const timeFetched = ensureInt(_.get(station, 'timeFetched'));
                        return Date.now() - timeFetched > 7 * 24 * 60 * 60 * 1000;
                    }).sort((a, b) => {
                        const aTimeFetched = ensureInt(_.get(a, 'timeFetched'));
                        const bTimeFetched = ensureInt(_.get(b, 'timeFetched'));
                        if (aTimeFetched < bTimeFetched) return -1;
                        if (aTimeFetched > bTimeFetched) return 1;
                        return 0;
                });
            },
            geolocationAvailable() {
                return 'geolocation' in navigator;
            },
        },
        watch: {
            async findStation(value) {
                this.findStationGeo = null;
                if (!value) return;
                if (value.length < 3) return;
                if (_.startsWith(value, 'geo:')) {
                    const parsedGeo = parseGeo(value);
                    if (parsedGeo === null) return;
                    this.logger.debug('parsedGeo', parsedGeo);
                    this.findStationGeo = parsedGeo;
                    const gk4 = WGS84toGK4(parsedGeo.latitude, parsedGeo.longitude);
                    this.logger.debug('gk4', gk4);
                    const coord = `coord:${Math.round(gk4[0])}:${Math.round(gk4[1])}`;
                    this.logger.debug('coord', coord);
                    this.foundStations = await this.getData(coord);
                } else {
                    this.foundStations = await this.getData(value);
                }
            },
        },
        created() {
            this.updateOneStation();
        },
        beforeDestroy() {
            this.clearLocationWatch();
        },
        methods: {
            highlight(station) {
                this.highlightStations.push(station.id);
                setTimeout(() => { this.highlightStations.shift(); }, 200);
            },
            addStation(station, highlight = true) {
                this.$store.commit('addStation', station);
                if (highlight) this.highlight(station);
            },
            removeStation(station) {
                this.$store.commit('removeStation', station);
            },
            showDeparture(station) {
                this.logger.debug('show departures of station', station);
                this.$router.push({
                    name: Departure.name,
                    params: { stationId: parseInt(station.id, 10) },
                });
            },
            isFavorite(station) {
                return !!this.sortedFavoriteStations.find(s => s.id === station.id);
            },
            showLocaton(station) {
                this.logger.debug('show location of station', station);
                this.showMapWithMarker(station.coords[0], station.coords[1]);
            },
            onShowLocationOverlay() {
                if (this.findStationGeo === null) return;
                this.logger.debug('show current location', this.findStationGeo);
                this.showMapWithMarker(this.findStationGeo.latitude, this.findStationGeo.longitude);
            },
            showMapWithMarker(latitude, longitude) {
                if (!_.isNumber(latitude) || !_.isNumber(longitude)) return;
                this.logger.debug('show map with marker', latitude, longitude);
                this.$emit('onShowOverlay', {
                    component: Leaflet,
                    props: {
                        center: [latitude, longitude],
                        marker: [latitude, longitude],
                        zoom: 18,
                    },
                });
            },
            async getData(value) {
                if (this.offline === false) {
                    this.logger.debug('offine - won\'t fetch stations', value);
                    return [];
                }
                this.loadingStations = true;
                let res;
                try {
                    res = await fetchSations(value);
                } catch (err) {
                    this.loadingStations = false;
                    res = [];
                    this.logger.error('getData cought error', {
                        error: await errorToObject(err),
                        value,
                    });
                }
                this.loadingStations = false;
                return res;
            },
            async updateOneStation() {
                const station = _.get(this.favoriteStationsToUpdate, '[0]');
                if (!_.isPlainObject(station)) return;

                this.logger.debug('update station', station);
                const stations = await this.getData(_.get(station, 'id'));
                this.removeStation(station);
                if (!stations.length) return;

                this.addStation(stations[0], false);
            },
            clearLocationWatch() {
                if (this.locationWatchId !== null) {
                    this.logger.debug('clear location watch', this.locationWatchId);
                    navigator.geolocation.clearWatch(this.locationWatchId);
                    this.locationWatchId = null;
                    this.getLocationTime = null;
                } else {
                    this.logger.debug('no location watcher to clear.');
                }
            },
            onGetGeolocation() {
                this.loadingGeoLocation = true;
                this.clearLocationWatch();
                this.getLocationTime = Date.now();
                this.locationWatchId = navigator.geolocation.watchPosition(
                    async (pos) => {
                        const runtime = Date.now() - this.getLocationTime;
                        const { latitude } = pos.coords;
                        const { longitude } = pos.coords;
                        const geo = coordsToGeo(pos.coords.latitude, pos.coords.longitude);
                        this.logger.debug(
                            'found position',
                            {
                                latitude,
                                longitude,
                                geo,
                                watcher: this.locationWatchId,
                                'runtime in ms': runtime,
                            },
                        );
                        this.clearLocationWatch();
                        this.loadingGeoLocation = false;
                        this.findStation = geo;
                    },
                    async (err) => {
                        const runtime = Date.now() - this.getLocationTime;
                        if (
                            err.code
                            && err.code === err.TIMEOUT
                            && runtime < 30000
                        ) {
                            this.logger.debug(
                                'location watcher soft timeout',
                                {
                                    watcher: this.locationWatchId,
                                    'runtime in ms': runtime,
                                },
                            );
                            return;
                        }
                        this.logger.error(
                            'geolocation.getCurrentPosition cought error',
                            await errorToObject(err),
                            {
                                watcher: this.locationWatchId,
                                'runtime in ms': runtime,
                            },
                        );
                        this.clearLocationWatch();
                        this.loadingGeoLocation = false;
                    },
                    {
                        maximumAge: 15000,
                        timeout: 3000,
                        enableHighAccuracy: false,
                    },
                );
                this.logger.debug('watchId', this.locationWatchId);
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'favorite stations': 'favorisierte Haltestellen',
                'found stations': 'gefundene Haltestellen',
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    table {
        tr.highlight {
            td {
                background-color: $main-color-very-light;
                transition-duration: 200ms;
            }
        }

        tr.list-move {
            transition: all 300ms;
        }

        tr.list-enter, .list-leave-to {
            opacity: 0;
            transform: translateX(-30px);
        }
        tr.list-leave-active {
            position: absolute;
        }

        th,
        td {
            padding: 2px 0;
            transition-duration: 2s;

            &.station {
                width: 100%;
            }

            &.buttons {
                // width: 65px;
                white-space: nowrap;
            }

            button {
                &.location {
                    margin-right: 2px !important;
                }

                &.favorites {
                    &.remove {
                        i::before {
                            content: 'delete';
                        }

                        &:hover {
                            i::before {
                                content: 'delete_forever';
                            }
                        }
                    }

                    &.add {
                        i::before {
                            content: 'star_border';
                        }

                        &.added {
                            i::before {
                                content: 'star';
                            }
                        }
                    }
                }
            }
        }

        th {
            padding-top: 10px;
        }
    }
</style>
