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
    import Settings from '@/components/Settings';
    import About from '@/components/About';

    export default {
        name: 'app',
        data() {
            return {
                linkedComponents: [Stations, Settings, About],
                loading: false,
            };
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
            }
        }
    }
</style>
