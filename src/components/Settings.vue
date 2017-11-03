<template lang="pug">
    div
        h1 Settings

        div
            a.material-icons(
                href="#"
                v-for="vehicle of vehicleOrder"
                :class="{chosen: chosenVehicles.indexOf(vehicle) > -1, ignored: chosenVehicles.indexOf(vehicle) === -1}"
                :title="vehicles[vehicle].title"
                @click.prevent="click(vehicle)"
            )
                | {{ vehicles[vehicle].ligature }}
</template>

<script>
    import { mapState } from 'vuex';
    import LabeledInput from '@/components/LabeledInput';
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
        },
        components: {
            LabeledInput,
        },
    };
</script>

<style lang="scss" scoped>
    .ignored {
        color: #e0e0e0;
    }
</style>
