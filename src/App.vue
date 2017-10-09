<template>
    <div id="app">
        <nav class="container">
            <template v-for="component in linkedComponents">
                <router-link :to="{name: component.name }" active-class="button-primary" class="button">
                    {{ component.name }}
                </router-link>
            </template>
        </nav>
        <main class="container">
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
    import Stations from '@/components/Stations';

    export default {
        name: 'app',
        data() {
            return {
                linkedComponents: [Stations],
                loading: false,
            };
        },
    };
</script>

<style lang="scss">
    // @import "../node_modules/normalize-scss/sass/normalize/import-now";
    // @import "../node_modules/normalize-scss/sass/normalize/variables";
    // @import "../node_modules/normalize-scss/sass/normalize/vertical-rhythm";
    // @import "../node_modules/normalize-scss/sass/normalize/normalize-mixin";

    body {
        background-color: #eee;
        background-color: #f4fbfe;;
        // margin: 100px;

        * {
            transition-duration: 200ms;
            transition-property: color, background-color, border-color, box-shadow, height, display;
        }

        #app {
            margin-top: 10px;
        }

        main {
            button {
                height: 30px;
                line-height: 30px;
                padding: 0 15px;
                margin: 0;
                font-size: 20px;

            }
        }
    }
</style>
