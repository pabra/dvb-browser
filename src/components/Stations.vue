<template lang="pug">
    div
        h1 Stations

        LabeledInput(
            v-model.trim="findStation"
            label="find Station:"
            :debounce=1000
        )

        table.u-full-width(v-if="foundStations.length")
            thead
                tr
                    th(colspan="2") found stations

            transition-group(name="list" tag="tbody")
                tr(v-for="station in foundStations" :key="station.id")
                    td
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ station.city }}, {{ station.stop }}
                    td
                        button.favorites.add(title="add to favorites" @click="addStation(station)")
                            i.material-icons

        table.u-full-width(v-if="sortedFavoriteStations.length")
            thead
                tr
                    th(colspan="2") favorite stations

            transition-group(name="list" tag="tbody")
                tr(
                    v-for="station of sortedFavoriteStations"
                    :key="station.id"
                    :class="{highlight: hightlightStations.indexOf(station.id) !== -1}"
                )
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
                window.console.log('station', station);
                this.$store.commit('addStation', station);
                this.highlight(station);
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
