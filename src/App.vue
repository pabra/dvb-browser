<template lang="pug">
    div#app
        nav.container
            template(v-for="component in linkedComponents")
                router-link(
                    :to="{name: component.name }"
                    class="button"
                    active-class="button-primary"
                )
                    template {{ component.name }}

            a.button.ligature(
                title="settings"
                :class="{'button-primary': showSettings}"
                @click="onClickSettings"
            )
                i.material-icons settings

        main.container
            router-view
            transition(name="settings")
                Settings#settings(v-if="showSettings")
</template>

<script>
    import Stations from '@/components/Stations';
    import About from '@/components/About';
    import Settings from '@/components/Settings';

    export default {
        name: 'app',
        data() {
            return {
                linkedComponents: [Stations, About],
                loading: false,
                showSettings: false,
            };
        },
        methods: {
            onClickSettings() {
                this.showSettings = !this.showSettings;
            },
        },
        components: {
            Settings,
        },
    };
</script>

<style lang="scss">
    body {
        #app {
            margin-top: 10px;

            nav {
                a {
                    margin-right: 10px;
                    height: 38px;
                    line-height: 38px;

                    &.ligature {
                        padding: 0;
                        width: 38px;
                        font-size: 0;
                        vertical-align: bottom;
                        float: right;

                        i {
                            vertical-align: middle;
                        }
                    }
                }
            }

            main {
                button {
                    height: 30px;
                    line-height: 30px;
                    padding: 0 15px;
                    margin: 0;
                    font-size: 20px;
                }

                #settings {
                    box-shadow: 0 0 200px -30px black;
                    padding: 10px;
                    position: absolute;
                    top: 0;
                    left: 10px;
                    background-color: #fff;
                    border: 1px solid #999;
                    border-radius: 5px;
                }

                .settings-enter, .settings-leave-active {
                    opacity: 0;
                    top: -200px !important;
                }
            }
        }
    }
</style>
