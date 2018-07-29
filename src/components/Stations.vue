<template lang="pug">
    div
        h1(v-translate=1) _Stations

        StationInput(
            v-model="findStation"
            :disabledAll="isOnline === false || loadingGeoLocation"
            :disabledGps="loadingStations"
            :loadingStations="loadingStations"
            :loadingGps="loadingGeoLocation"
            :showGps="geolocationAvailable()"
            :showLocation="findStationGeo !== null || foundStations.length > 0"
            @getLocation="onGetGeolocation"
            @showLocationOverlay="onShowLocationOverlay"
            @clear="onClear"
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
    import { ensureInt, stationName, WGS84toGK4 } from '@/lib/utils';
    import {
        geolocationAvailable,
        Position,
        coordsToGeo,
        geoToCoords,
        withinGermany,
        withinVvo,
    } from '@/lib/location';

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
                findStationGeo: null,
                foundStations: [],
                findStation: '',
                highlightStations: [],
                logger: Logger.get(`${this.$options.name} component`),
                position: new Position(),
                location: null,
                stationName,
                geolocationAvailable,
            };
        },
        computed: {
            ...mapGetters(['sortedFavoriteStations']),
            ...mapState(['isOnline']),
            locationGeoUri() {
                // make geo URI from (GPS) locaton
                if (!this.location) return null;
                return coordsToGeo(
                    this.location.latitude,
                    this.location.longitude,
                    this.location.accuracy,
                );
            },
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
        },
        watch: {
            locationGeoUri(value) {
                if (!value) return;
                this.findStation = value;
            },
            async findStation(value) {
                this.findStationGeo = geoToCoords(value);
                if (this.findStationGeo) {
                    if (!withinVvo(this.findStationGeo.latitude, this.findStationGeo.longitude)) {
                        this.msg(this.t('This location is not within VVO boundaries.'));
                        return;
                    }

                    this.logger.debug('this.findStationGeo', this.findStationGeo);
                    const gk4 = WGS84toGK4(
                        this.findStationGeo.latitude,
                        this.findStationGeo.longitude,
                    );
                    this.logger.debug('gk4', gk4);
                    const coord = `coord:${Math.round(gk4[0])}:${Math.round(gk4[1])}`;
                    this.logger.debug('coord', coord);
                    this.foundStations = await this.getData(coord);
                } else {
                    if (!value) return;
                    if (value.length <= 3) return;
                    this.foundStations = await this.getData(value);
                }
            },
        },
        created() {
            this.updateOneStation();
        },
        methods: {
            msg(text, subject = null) {
                this.$store.dispatch('messageAddAndReturn', { text, subject });
            },
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
                this.showMapWithMarkers([{
                    latitude: station.coords[0],
                    longitude: station.coords[1],
                    id: station.id,
                    type: 'station',
                    name: station.stop,
                }]);
            },
            onShowLocationOverlay() {
                this.logger.debug('show current location', this.findStationGeo);
                const list = [];
                if (this.findStationGeo) {
                    list.push({
                        latitude: this.findStationGeo.latitude,
                        longitude: this.findStationGeo.longitude,
                        accuracy: this.findStationGeo.uncertainty,
                        id: 0,
                        type: 'position',
                        name: this.t('your position'),
                    });
                }
                this.foundStations.forEach((station) => {
                    if (!withinGermany(station.coords[0], station.coords[1])) {
                        return;
                    }
                    list.push({
                        latitude: station.coords[0],
                        longitude: station.coords[1],
                        id: station.id,
                        type: 'station',
                        name: station.stop,
                    });
                });
                this.showMapWithMarkers(list);
            },
            showMapWithMarkers(markers) {
                this.logger.debug('show map with markers', markers);
                this.$emit('onShowOverlay', {
                    component: Leaflet,
                    props: { markers },
                });
            },
            async getData(value) {
                if (this.offline === false) {
                    this.logger.debug('offine - won\'t fetch stations', value);
                    return [];
                }
                this.loadingStations = true;
                let res = [];
                try {
                    res = await fetchSations(value);
                } catch (err) {
                    if (err.code === 1 || err.code === 2) {
                        this.msg(this.t('No stations found.'));
                    } else {
                        this.logger.error('getData cought error', {
                            error: await errorToObject(err),
                            value,
                        });
                    }
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
            async onGetGeolocation() {
                this.loadingGeoLocation = true;
                this.location = null;
                try {
                    this.location = await this.position.get();
                    this.logger.debug('got location', this.location);
                } catch (err) {
                    if (err.code === 1) {
                        // PERMISSION_DENIED
                        this.msg(this.t('Location detection was denied.'));
                    } else if (err.code === 2) {
                        // POSITION_UNAVAILABLE
                        this.msg(this.t('Location detection unavailable.'));
                    } else if (err.code === 3) {
                        // TIMEOUT
                        this.msg(this.t('Location detection timed out.'));
                    } else {
                        this.logger.error('cought location error', await errorToObject(err));
                    }
                }
                this.loadingGeoLocation = false;
            },
            onClear() {
                this.foundStations = [];
                this.location = null;
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'Location detection timed out.': 'Zeitüberschreitung bei der Standortbestimmung.',
                'Location detection unavailable.': 'Standortbestimmung nicht verfügbar.',
                'Location detection was denied.': 'Standortbestimmung wurde abgelehnt.',
                'No stations found.': 'Keine Haltestellen gefunden.',
                'This location is not within VVO boundaries.': 'Dieser Standort liegt nicht innerhalb der VVO-Grenzen.',
                'favorite stations': 'favorisierte Haltestellen',
                'found stations': 'gefundene Haltestellen',
                'your position': 'deine Position',
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
