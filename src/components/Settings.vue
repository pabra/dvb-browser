<template lang="pug">
    div
        h1 Settings

        h4 vehicles
        div
            button(
                v-for="vehicle of vehicleOrder"
                :class="[getVehicleClass(vehicle), 'vehicle']"
                :title="vehicles[vehicle].title"
                @click.prevent="toggleVehicle(vehicle)"
            )
                i.material-icons(
                    :class="vehicle"
                ) {{ vehicles[vehicle].ligature }}

        h4 reset
        p This will delete all stored data in you browser.
        button(@click="clearData") clear data
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
            toggleVehicle(vehicle) {
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
            clearData() {
                this.$store.commit('clearStorage');
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    button.vehicle {
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
