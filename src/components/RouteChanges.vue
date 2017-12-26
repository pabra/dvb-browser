<template lang="pug">
    div.root(
        :class="{ loading: routeChangesLoading }"
        :style="{ maxHeight: height }"
    )
        h1 {{ t('Route changes') }}
        p ids: {{ ids.join(', ') }}
        div.route-change(v-for="rc in relevantChanges")
            h2 {{ rc.title }}
            p(v-html="rc.description")
</template>

<script>
    import _ from 'lodash';
    import { mapState } from 'vuex';

    export default {
        name: 'routeChanges',
        data() {
            return {
                ids: this.props.ids || [],
            };
        },
        props: {
            props: {
                type: Object,
                default: () => ({}),
            },
        },
        computed: {
            ...mapState(['routeChanges', 'routeChangesLoading', 'windowHeight']),
            relevantChanges() {
                const list = [];
                const { routeChanges } = this;
                this.ids.forEach((id) => {
                    const rc = _.get(routeChanges, id);
                    if (rc) list.push(rc);
                });

                return list;
            },
            height() {
                const heightInt = Math.ceil((this.windowHeight - 30) * 0.89);
                return `${heightInt}px`;
            },
        },
        created() {
            this.$store.dispatch('getRouteChanges');
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'Route changes': 'Linienänderungen',
            },
        },
    };
</script>

<style lang="css" scoped>
    .root {
        overflow: auto;
    }

    .route-change {
        margin: 25px 0 50px 0;
    }

    .route-change >>> h2 {
        font-size: 1.6em;
    }

    .route-change > h2:first-child {
        border-bottom: 1px solid #aaa;
    }
</style>
