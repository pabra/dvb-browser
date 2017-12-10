<template lang="pug">
    div
        h1(v-translate=1) _Stations

        LabeledInput(
            v-model.trim="findStation"
            :label="t('find station') + ':'"
            :debounce=500
            :inputClassName="{loading: loadingStations}"
        )

        table.u-full-width(v-if="foundStations.length")
            thead
                tr
                    th(colspan="2" v-translate=1) found stations

            transition-group(name="list" tag="tbody")
                tr(v-for="station in foundStations" :key="station.id")
                    td.station
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ station.city }}, {{ station.stop }}
                    td.buttons
                        button.location(@click="showLocaton(station)")
                            i.material-icons
                                | location_on

                        button.favorites.add(@click="addStation(station)" :class="{added: isFavorite(station)}")
                            i.material-icons

        table.u-full-width(v-if="sortedFavoriteStations.length")
            thead
                tr
                    th(colspan="2" v-translate=1) favorite stations

            transition-group(name="list" tag="tbody")
                tr(
                    v-for="station of sortedFavoriteStations"
                    :key="station.id"
                    :class="{highlight: hightlightStations.indexOf(station.id) !== -1}"
                )
                    td.station
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ station.city }}, {{ station.stop }}
                    td.buttons
                        button.location(@click="showLocaton(station)")
                            i.material-icons
                                | location_on

                        button.favorites.remove(@click="removeStation(station)")
                            i.material-icons
</template>

<script>
    import { mapGetters } from 'vuex';
    import LabeledInput from '@/components/LabeledInput';
    import Departure from '@/components/Departure';
    import { fetchSations } from '@/lib/fetch';
    import Leaflet from '@/components/Leaflet';

    export default {
        name: 'stations',
        data() {
            return {
                loadingStations: false,
                foundStations: [],
                findStation: '',
                hightlightStations: [],
            };
        },
        computed: {
            ...mapGetters(['sortedFavoriteStations']),
        },
        methods: {
            highlight(station) {
                this.hightlightStations.push(station.id);
                setTimeout(() => { this.hightlightStations.shift(); }, 200);
            },
            addStation(station) {
                this.$store.commit('addStation', station);
                this.highlight(station);
            },
            removeStation(station) {
                this.$store.commit('removeStation', station);
            },
            showDeparture(station) {
                this.$router.push({
                    name: Departure.name,
                    params: { stationId: parseInt(station.id, 10) },
                });
            },
            isFavorite(station) {
                return !!this.sortedFavoriteStations.find(s => s.id === station.id);
            },
            showLocaton(station) {
                window.console.log('station', station);
                this.$emit('onShowOverlay', {
                    component: Leaflet,
                    props: {
                        center: station.coords,
                        marker: station.coords,
                        zoom: 18,
                    },
                });
            },
        },
        watch: {
            async findStation(value) {
                if (!value) return;
                if (value.length < 3) return;

                let res;
                this.loadingStations = true;
                try {
                    res = await fetchSations(value);
                } catch (err) {
                    this.loadingStations = false;
                    window.console.error(err);
                    return;
                }
                this.loadingStations = false;
                this.foundStations = res;
            },
        },
        components: {
            LabeledInput,
            Leaflet,
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
