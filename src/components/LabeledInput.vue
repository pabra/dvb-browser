<template lang="html">
    <label :class="labelClass">
        <span class="label-body">{{ label }}</span>

        <input v-if="type==='text'"
            ref="valueEl"
            type="text"
            class="u-full-width"
            :readonly="readonly"
            :disabled="disabled"
            v-model.trim="localValue"
            @keyup.enter="emitInput"
            />
        <input v-if="type==='url'"
            ref="valueEl"
            type="url"
            class="u-full-width"
            :readonly="readonly"
            :disabled="disabled"
            v-model.trim="localValue"
            />
        <input v-if="type==='checkbox'"
            ref="valueEl"
            type="checkbox"
            :readonly="readonly"
            :disabled="disabled"
            v-model="localValue"
            />
        <textarea v-if="type==='textarea'"
            ref="valueEl"
            class="u-full-width"
            :class="{monospace}"
            :readonly="readonly"
            :disabled="disabled"
            v-model.trim="localValue"
            @input="autoHeight"
            />
        <button v-if="type==='button'"
            type="button"
            @click.stop.prevent="click"
            class="button-primary"
            >{{ value }}</button>

        <span class="message" v-show="errorMessage">{{ errorMessage }}</span>
    </label>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: 'labeledInput',
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
        props: {
            className: {
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
                default: () => {},
            },
            monospace: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            labelClass() {
                return Object.assign(
                    {},
                    this.className,
                    { disabled: this.disabled, readonly: this.readonly },
                );
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
        watch: {
            value() { this.$nextTick(() => { this.autoHeight(); }); },
            localValue() {
                if (this.debounce) this.debouncer();
                else this.emitInput();
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
