<template lang="pug">
    div
        h3(v-translate=1) _Settings

        h4(v-translate=1) Language
        div
            router-link.button.language(
                :to="{ params: { lang: 'de' }}"
                :class="langButtonClass('de')"
            ) de
            router-link.button.language(
                :to="{ params: { lang: 'en' }}"
                :class="langButtonClass('en')"
            ) en

        h4(v-translate=1) Vehicles
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

        h4(v-translate=1) Reset
        p(v-translate=1) This will delete all data this app stored in your browser.
        button(@click="clearData" v-translate=1) clear data
</template>

<script>
    import { mapState } from 'vuex';
    import { vehicles, vehicleOrder } from '@/lib/utils';

    export default {
        name: 'Settings',
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
            langButtonClass(lang) {
                if (lang === this.$translate.lang) return 'button-primary';
                return 'ignored';
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
                Vehicles: 'Means of transport',
            },
            de: {
                'clear data': 'Daten löschen',
                'This will delete all data this app stored in your browser.': 'Das wird alle Daten löschen, die diese App in Ihrem Browser gespeichert hat.',
                Language: 'Sprache',
                Reset: 'Zurücksetzen',
                Vehicles: 'Transportmittel',
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    h4 {
        font-size: 1.4em;
        border-bottom: 1px solid #ddd;
        margin-top: 1em;
    }

    button.vehicle, .button.language {
        margin-right: 2px !important;

        &.chosen {
            @each $vehicle in $vehicles {
                &.#{$vehicle} {
                    background-color: palette(vehicle-color-name($vehicle), 100);
                    color: palette(vehicle-color-name($vehicle), 700);
                }
            }
        }
        &.ignored {
            color: #e0e0e0;
            color: palette(Blue Grey, 100);
        }
    }

</style>
