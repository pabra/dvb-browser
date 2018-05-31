<template lang="pug">
    div
        label
            span(
                v-translate=1
            ).label-body
                | find station
            div
                input(
                    v-model.trim="localValue"
                    type="search"
                    name="stationName"
                    class="u-full-width"
                    @keyup.enter="emitInput"
                    :disabled="disabledAll"
                    :class="{loading: loadingStations}"
                )
                button(
                    :disabled="disabledAll || disabledGps"
                    :class="{loading: loadingGps}"
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
    div {
        position: relative;
    }

    button {
        background-color: #fff;
        position: absolute;
        right: 4px;
        top: 4px;
    }

    input[disabled],
    button[disabled] {
        background-color: #EEE;
    }
</style>
