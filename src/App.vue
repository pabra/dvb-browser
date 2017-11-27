<template lang="pug">
    div#app
        nav.container
            template(v-for="entry in linkedComponents")
                router-link.button(
                    :to="{name: entry.component.name }"
                    :class="isActive(entry.component)"
                ) {{ t(entry.localeKey) }}

            a.button.ligature(
                :title="t('_Settings')"
                :class="{'button-primary': showOverlay === Settings}"
                @click="onClickSettings"
            )
                i.material-icons settings

        main.container
            router-view
            Overlay(
                v-if="!isNull(showOverlay)"
                :component="showOverlay"
                @destroy="onOverlayDestroy"
            )
</template>

<script>
    import _ from 'lodash';
    import Stations from '@/components/Stations';
    import About from '@/components/About';
    import Settings from '@/components/Settings';
    import Overlay from '@/components/Overlay';
    import { isArray, isObject } from '@/lib/utils';

    export default {
        name: 'app',
        data() {
            return {
                linkedComponents: [
                    { component: Stations, localeKey: '_Stations' },
                    { component: About, localeKey: '_About' },
                ],
                loading: false,
                showOverlay: null,
                isNull: _.isNull,
                Settings,
            };
        },
        methods: {
            onClickSettings() {
                this.showOverlay = _.isNull(this.showOverlay) ? this.showOverlay = Settings : null;
            },
            isActive(component) {
                if (component.name === this.$route.name) return ['button-primary'];
                return [];
            },
            setLang(lang) {
                this.$translate.setLang(lang);
                document.querySelector('html').setAttribute('lang', lang);
            },
            setHrefLang(route) {
                const langDefault = document.querySelector('link[hreflang=x-default]');
                const langDe = document.querySelector('link[hreflang=de]');
                const langEn = document.querySelector('link[hreflang=en]');
                const routeDefault = this.$router.resolve({
                    name: route.name,
                    params: Object.assign({}, route.params, { lang: undefined }),
                });
                const routeDe = this.$router.resolve({
                    name: route.name,
                    params: Object.assign({}, route.params, { lang: 'de' }),
                });
                const routeEn = this.$router.resolve({
                    name: route.name,
                    params: Object.assign({}, route.params, { lang: 'en' }),
                });
                langDefault.href = isObject(routeDefault) ? routeDefault.href : '';
                langDe.href = isObject(routeDe) ? routeDe.href : '';
                langEn.href = isObject(routeEn) ? routeEn.href : '';
            },
            onOverlayDestroy() {
                this.showOverlay = null;
            },
        },
        created() {
            let lang;
            let storeLang = false;

            if (this.$route.params.lang) {
                lang = this.$route.params.lang;
                storeLang = true;
            } else {
                lang = localStorage.getItem('language');
            }

            if (['de', 'en'].indexOf(lang) === -1) {
                if ('languages' in window.navigator && isArray(window.navigator.languages) && window.navigator.languages.length > 0) {
                    lang = window.navigator.languages[0].substr(0, 2);
                } else if (window.navigator.language) {
                    lang = window.navigator.language.substr(0, 2);
                } else if (window.navigator.userLanguage) {
                    lang = window.navigator.userLanguage.substr(0, 2);
                }
            }

            if (lang !== 'de') lang = 'en';

            this.setLang(lang);

            if (storeLang) localStorage.setItem('language', lang);

            this.$translate.$on('language:changed', (language) => {
                localStorage.setItem('language', language);
            });
            this.setHrefLang(this.$route);
        },
        components: {
            Settings,
            Overlay,
        },
        watch: {
            $route(to) {
                if (to.params.lang) this.setLang(to.params.lang);
                this.setHrefLang(to);
            },
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
                button, .button {
                    height: 30px;
                    line-height: 26px;
                    padding: 0 2px;
                    margin: 0;
                    min-width: 30px;
                }
            }
        }
    }
</style>
