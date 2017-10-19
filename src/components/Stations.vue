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
                        button(title="add to favorites" @click="addStation(station)")
                            i.material-icons star

                tr(v-if="favoriteStations.length")
                    th(colspan="2") favorite stations

                tr(v-for="station in favoriteStations" :key="station.id")
                    td
                        a(href="#" @click.prevent="showDeparture(station)")
                            | {{ station.city }}, {{ station.stop }}
                    td
                        button(title="remove from favorites" @click="removeStation(station)")
                            i.material-icons delete_forever
</template>

<script>
    import { mapState } from 'vuex';
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
            ...mapState(['favoriteStations']),
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
        }

        th {
            padding-top: 10px;
        }
    }
</style>
