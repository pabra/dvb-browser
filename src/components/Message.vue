<template lang="pug">
    div(@click="message.remove" :class="message.level").message
        i(v-if="message.level").material-icons.level
        span(v-if="message.subject").subject {{ message.subject }}
        span {{ message.text }}
</template>

<script>
    export default {
        name: 'Message',
        props: {
            message: {
                type: Object,
                default: () => ({}),
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    div.message {
        background-color: white;
        margin: 5px;
        padding: 5px;
        border-radius: 4px;
        box-shadow: 0 0 50px -13px black;
        border-width: 1px;
        border-style: solid;
        clear: both;

        .level {
            float: right;
            margin: 0 0 5px 5px;
        }

        .subject {
            font-weight: bold;
            display: block;
        }

        &.info {
            background-color: palette(Light Blue, 50);
            border-color: palette(Light Blue, 400);

            .level {
                color: palette(Light Blue, 400);

                &::after {
                    content: 'info_outline';
                }
            }
        }

        &.warning {
            background-color: palette(Amber, 50);
            border-color: palette(Amber, 600);

            .level {
                color: palette(Amber, 500);

                &::after {
                    content: 'warning';
                }
            }
        }

        &.error {
            background-color: palette(Red, 50);
            border-color: palette(Red, 400);

            .level {
                color: palette(Red, 400);

                &::after {
                    content: 'error';
                }
            }
        }
    }
</style>
