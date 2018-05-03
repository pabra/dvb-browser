<template lang="html">
    <label :class="labelClass">
        <span class="label-body">{{ label }}</span>

        <input
            v-if="type==='text'"
            ref="valueEl"
            :class="inputClass"
            :readonly="readonly"
            :disabled="disabled"
            v-model.trim="localValue"
            type="text"
            class="u-full-width"
            @keyup.enter="emitInput"
        >
        <input
            v-if="type==='url'"
            ref="valueEl"
            :class="inputClass"
            :readonly="readonly"
            :disabled="disabled"
            v-model.trim="localValue"
            type="url"
            class="u-full-width"
        >
        <input
            v-if="type==='checkbox'"
            ref="valueEl"
            :class="inputClass"
            :readonly="readonly"
            :disabled="disabled"
            v-model="localValue"
            type="checkbox"
        >
        <textarea
            v-if="type==='textarea'"
            ref="valueEl"
            :class="inputClass"
            :readonly="readonly"
            :disabled="disabled"
            v-model.trim="localValue"
            class="u-full-width"
            @input="autoHeight"
        />
        <button
            v-if="type==='button'"
            :class="inputClass"
            type="button"
            class="button-primary"
            @click.stop.prevent="click"
        >{{ value }}</button>

        <span
            v-show="errorMessage"
            class="message"
        >{{ errorMessage }}</span>
    </label>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: 'LabeledInput',
        props: {
            labelClassName: {
                type: Object,
                default: () => ({}),
            },
            inputClassName: {
                type: Object,
                default: () => ({}),
            },
            label: {
                type: String,
                required: true,
                default: 'type something',
            },
            value: {
                type: [String, Boolean],
                default: '',
            },
            type: {
                type: String,
                default: 'text',
            },
            errorMessage: {
                type: String,
                default: '',
            },
            debounce: {
                type: Number,
                default: 0,
            },
            readonly: {
                type: Boolean,
                default: false,
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            click: {
                type: Function,
                default: _.noop,
            },
            monospace: {
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
                    this.debounce,
                ),
                localValue: this.value,
            };
        },
        computed: {
            labelClass() {
                return Object.assign(
                    {},
                    this.labelClassName,
                    { disabled: this.disabled, readonly: this.readonly },
                );
            },
            inputClass() {
                return Object.assign(
                    {},
                    this.inputClassName,
                    { monospace: this.monospace },
                );
            },
        },
        watch: {
            value() { this.$nextTick(() => { this.autoHeight(); }); },
            localValue() {
                if (this.debounce) this.debouncer();
                else this.emitInput();
            },
        },
        methods: {
            autoHeight() {
                const el = this.$refs.valueEl;

                if (el && this.type === 'textarea') {
                    el.style.height = `${el.scrollHeight + 2}px`;
                }
            },
            emitInput() {
                this.$emit('input', this.localValue);
            },
        },
    };
</script>

<style lang="scss" scoped>
    .disabled input,
    .disabled textarea,
    input[disabled],
    input[readonly],
    textarea[disabled],
    textarea[readonly] {
        background-color: #EEE;
    }

    button,
    input,
    span.message,
    textarea {
        transition-duration: 200ms;
        transition-property: color, background-color, border-color, box-shadow, height, display;
    }

    textarea {
        max-height: 400px;
    }

    span.message {
        margin: 10px;
        display: inline-block;
    }

    .invalid {
        input,
        textarea {
            box-shadow: 0 0 3px 0 red;
        }

        span.message {
            color: red;
        }
    }

    .monospace {
        font-family: monospace;
    }
</style>
