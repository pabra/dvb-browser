<template lang="pug">
    div
        h1 Settings

        h4 vehicles

        div
            button(
                v-for="vehicle of vehicleOrder"
                :class="getVehicleClass(vehicle)"
                :title="vehicles[vehicle].title"
                @click.prevent="click(vehicle)"
            )
                i.material-icons(
                    :class="vehicle"
                ) {{ vehicles[vehicle].ligature }}
</template>

<script>
    import { mapState } from 'vuex';
    import { vehicles, vehicleOrder } from '@/lib/utils';

    export default {
        name: 'settings',
        data() {
            return {
                vehicles,
                vehicleOrder,
            };
        },
        computed: {
            ...mapState(['chosenVehicles']),
        },
        methods: {
            click(vehicle) {
                window.console.log('vehicle', vehicle);
                if (this.chosenVehicles.indexOf(vehicle) > -1) {
                    this.$store.commit('removeVehicle', vehicle);
                } else {
                    this.$store.commit('addVehicle', vehicle);
                }
            },
            getVehicleClass(vehicle) {
                return {
                    chosen: this.chosenVehicles.indexOf(vehicle) > -1,
                    ignored: this.chosenVehicles.indexOf(vehicle) === -1,
                    [vehicle]: true,
                };
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    button {
        padding: 2px !important;
        margin-right: 2px !important;
        color: #e0e0e0;

        &.chosen {
            @each $vehicle in tram, citybus, intercitybus, suburbanrailway, train, cableway, ferry, hailedsharedtaxi {
                $vehicle-bg-color: hsl(hue(map-get($vehicle-colors, '#{$vehicle}2')), 90%, 90%);
                $vehicle-color: hsl(hue(map-get($vehicle-colors, '#{$vehicle}2')), 50%, 50%);

                &.#{$vehicle} {
                    background-color: $vehicle-bg-color;
                    color: $vehicle-color;
                }
            }
        }
        &.ignored {
        }
    }

</style>
