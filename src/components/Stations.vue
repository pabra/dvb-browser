<template lang="pug">
    div
        h1 Stations

        LabeledInput(
            v-model.trim="findStation"
            label="find Station:"
            :debounce=1000
        )

        table.u-full-width
            //- thead
            //-     tr
            //-         th Station
            //-         th Action
            tbody
                tr(v-if="foundStations.length")
                    th(colspan="2") found stations

                tr(v-for="station in foundStations" :key="station.id")
                    td
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ station.city }}, {{ station.stop }}
                    td
                        button.favorites.add(title="add to favorites" @click="addStation(station)")
                            i.material-icons

                tr(v-if="sortedFavoriteStations.length")
                    th(colspan="2") favorite stations

                tr(v-for="station in sortedFavoriteStations" :key="station.id")
                    td
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ station.city }}, {{ station.stop }}
                    td
                        button.favorites.remove(title="remove from favorites" @click="removeStation(station)")
                            i.material-icons
</template>

<script>
    import { mapGetters } from 'vuex';
    import LabeledInput from '@/components/LabeledInput';
    import Departure from '@/components/Departure';
    import { fetchSations } from '@/lib/fetch';

    export default {
        name: 'stations',
        data() {
            return {
                foundStations: [],
                findStation: '',
            };
        },
        computed: {
            ...mapGetters(['sortedFavoriteStations']),
        },
        methods: {
            addStation(station) {
                window.console.log('station', station);
                this.$store.commit('addStation', station);
            },
            removeStation(station) {
                window.console.log('station', station);
                this.$store.commit('removeStation', station);
            },
            showDeparture(station) {
                window.console.log('station', station);
                this.$router.push({
                    name: Departure.name,
                    params: { stationId: parseInt(station.id, 10) },
                });
            },
        },
        watch: {
            async findStation(value) {
                if (!value) return;
                if (value.length < 3) return;

                let res;
                try {
                    res = await fetchSations(value);
                } catch (err) {
                    window.console.error(err);
                    return;
                }
                this.foundStations = res;
            },
        },
        components: {
            LabeledInput,
        },
    };
</script>

<style lang="scss" scoped>
    table {
        th,
        td {
            padding: 2px 2px 2px 0;

            &:first-child {
                width: 100%;
            }

            button.favorites {
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

                    &:hover {
                        i::before {
                            content: 'star';
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
