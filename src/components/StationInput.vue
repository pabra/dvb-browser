<template lang="pug">
    div
        label
            span(
                v-translate=1
            ).label-body
                | find station
            div.input-wrapper
                input(
                    v-model.trim="localValue"
                    type="search"
                    name="stationName"
                    class="u-full-width"
                    @keyup.enter="emitInput"
                    @focus="$event.target.select()"
                    :disabled="disabledAll"
                    :class="{loading: loadingStations}"
                )

                button.showLocation(
                    v-if="showLocation"
                    @click="onShowLocation"
                )
                    i.material-icons location_on

                button.getLocation(
                    v-if="showGps"
                    :disabled="disabledAll || disabledGps"
                    :class="{loading: loadingGps}"
                    @click="onGetGps"
                )
                    i.material-icons gps_not_fixed
</template>

<script>
    import _ from 'lodash';
    import Logger from '@/lib/logger';

    export default {
        name: 'StationInput',
        props: {
            value: {
                type: String,
                default: '',
            },
            showGps: {
                type: Boolean,
                default: false,
            },
            showLocation: {
                type: Boolean,
                default: false,
            },
            disabledAll: {
                type: Boolean,
                default: false,
            },
            disabledGps: {
                type: Boolean,
                default: false,
            },
            loadingStations: {
                type: Boolean,
                default: false,
            },
            loadingGps: {
                type: Boolean,
                default: false,
            },
        },
        data() {
            return {
                // we need to define the debouncer function here in data to have
                // access to this.debounce prop(erty)
                debouncer: _.debounce(
                    this.emitInput,
                    500,
                ),
                localValue: this.value,
                logger: Logger.get(`${this.$options.name} component`),
            };
        },
        watch: {
            localValue() {
                this.debouncer();
            },
            value(newValue) {
                this.localValue = newValue;
            },
        },
        methods: {
            emitInput() {
                this.$emit('input', this.localValue);
            },
            onGetGps() {
                this.localValue = '';
                this.emitInput();
                this.$emit('getLocation');
            },
            onShowLocation() {
                this.$emit('showLocationOverlay');
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'find station': 'Haltestelle finden',
            },
        },
    };
</script>

<style lang="scss" scoped>
    div.input-wrapper {
        position: relative;
        margin: 0 -3px 0 0;
    }

    button {
        background-color: #fff;
        position: absolute;
        top: 4px;
    }

    button.getLocation {
        right: 4px;
    }

    button.showLocation {
        right: 36px;
    }

    input[disabled],
    button[disabled] {
        background-color: #EEE;
    }
</style>
