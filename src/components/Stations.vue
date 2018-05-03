<template lang="pug">
    div
        h1(v-translate=1) _Stations

        div.station-input
            div.text-input-wrapper
                LabeledInput(
                    v-model.trim="findStation"
                    :label="t('find station') + ':'"
                    :debounce=500
                    :disabled="isOnline === false"
                    :inputClassName="{loading: loadingStations}"
                )
            div.button-input-wrapper(v-if="geolocationAvailable")
                button(
                    @click="onGetGeolocation"
                    :class="{loading: loadingGeoLocation}"
                    :disabled="isOnline === false"
                )
                    i.material-icons gps_not_fixed

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
    import LabeledInput from '@/components/LabeledInput';
    import Departure from '@/components/Departure';
    import { fetchSations } from '@/lib/fetch';
    import Leaflet from '@/components/Leaflet';
    import Logger, { errorToObject } from '@/lib/logger';
    import { ensureInt, stationName, WGS84toGK4 } from '@/lib/utils';

    export default {
        name: 'Stations',
        components: {
            LabeledInput,
            Leaflet,
        },
        data() {
            return {
                loadingStations: false,
                loadingGeoLocation: false,
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
                if (!value) return;
                if (value.length < 3) return;

                this.foundStations = await this.getData(value);
            },
        },
        created() {
            this.updateOneStation();
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
                this.$emit('onShowOverlay', {
                    component: Leaflet,
                    props: {
                        center: station.coords,
                        marker: station.coords,
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
            onGetGeolocation() {
                this.loadingGeoLocation = true;
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        this.loadingGeoLocation = false;
                        const gk4 = WGS84toGK4(pos.coords.latitude, pos.coords.longitude);
                        this.foundStations = await this.getData(`coord:${Math.round(gk4[0])}:${Math.round(gk4[1])}`);
                    },
                    (err) => {
                        this.loadingGeoLocation = false;
                        window.console.log('err', err);
                        this.logger.error('geolocation.getCurrentPosition cought error', errorToObject(err));
                    },
                    {
                        maximumAge: 15000,
                        timeout: 10000,
                    },
                );
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'favorite stations': 'favorisierte Haltestellen',
                'find station': 'Haltestelle finden',
                'found stations': 'gefundene Haltestellen',
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    .station-input {
        display: flex;
        flex-direction: row;

        .text-input-wrapper {
            flex: 1 1 0%;
        }

        .button-input-wrapper {
            flex: 0 1 0%;
            align-self: center;
        }
    }

    table {
        tr.highlight {
            td {
                background-color: $main-color-very-light;
                transition-duration: 200ms;
            }
        }

        tr.list-move {
            transition: all 500ms;
        }

        tr.list-enter, .list-leave-to {
            opacity: 0;
            transform: translateX(-30px);
        }
        tr.list-leave, tr.list-leave-active {
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
