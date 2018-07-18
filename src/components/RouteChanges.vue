<template lang="pug">
    div.root.route-changes(
        :class="{ loading: routeChangesLoading }"
        :style="{ maxHeight: height }"
    )
        h1(v-translate=1) Route changes

        table(v-for="rc in relevantChanges")
            thead
                tr
                    th
                        i.material-icons.reroute-icon trending_down
                    th(:colspan="2") {{ rc.title }}
            tbody
                tr.meta
                    td(v-translate=1) type
                    td
                    td.max-width {{ explainType(rc.type) }}
                tr.meta
                    td(v-translate=1) published
                    td(v-translate=1) at
                    td {{ toLocaleDateTime(rc.published) }}
                template(v-for="data in rc.valid")
                    tr.meta
                        td(:rowspan="2" v-translate=1) valid
                        td.flat.no-border(v-translate="1") from
                        td.flat.no-border {{ data.begin ? toLocaleDateTime(data.begin) : '' }}
                    tr.meta
                        td.flat(v-translate="1") to
                        td.flat {{ data.end ? toLocaleDateTime(data.end) : '' }}
                tr.meta.lines(v-for="lineGroup, i in rc.lines.sortedGroups")
                    td(
                        :rowspan="rc.lines.sortedGroups.length"
                        v-if="i === 0"
                        v-translate=1
                    ) lines
                    td(:class="lineGroup.vehicle")
                        i.material-icons.vehicle-icon {{ vehicles[lineGroup.vehicle].ligature }}
                    td(:class="lineGroup.vehicle") {{ joinLines(lineGroup.lines) }}
                tr.description
                    td(colspan="3" v-html="rc.description")
</template>

<script>
    import _ from 'lodash';
    import { mapState } from 'vuex';
    import Logger from '@/lib/logger';
    import { vehicles, toLocaleDateTime } from '@/lib/utils';

    export default {
        name: 'RouteChanges',
        props: {
            props: {
                type: Object,
                default: () => ({}),
            },
        },
        data() {
            return {
                ids: this.props.ids || [],
                logger: Logger.get(`${this.$options.name} component`),
                vehicles,
                toLocaleDateTime,
            };
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
        methods: {
            joinLines(lines) {
                return lines.map(line => line.line).join(', ');
            },
            explainType(type) {
                switch (type) {
                    case 'Scheduled':
                        return this.$translate.text('scheduled');
                    case 'AmplifyingTransport':
                        return this.$translate.text('amplifying transport');
                    default:
                        this.logger.error('missing translation for route change type', type);
                        return type;
                }
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'amplifying transport': 'Verstärkung',
                'Route changes': 'Linienänderungen',
                lines: 'Linien',
                scheduled: 'geplant',
                type: 'Typ',
                published: 'veröffentlicht',
                at: 'am',
                valid: 'gültig',
                from: 'von',
                to: 'bis',
            },
        },
    };
</script>

<style lang="scss">
    @import "~@/assets/scss/variables.scss";
    .root.route-changes {
        table {
            $light-bg: lighten($reroute-color, 47%);

            th, td {
                padding: 10px 5px;
            }

            .max-width {
                width: 100%;
            }

            .no-border {
                border: none;
            }

            thead {
                th {
                    border-color: $reroute-color;
                    background: linear-gradient(to bottom, white, white 20%, $light-bg);

                    .reroute-icon {
                        vertical-align: middle;
                        transform: rotate(-45deg);
                        color: $reroute-color;
                        font-weight: bold;
                    }
                }
            }

            tbody {
                tr {
                    td.flat {
                        padding-top: 2px;
                        padding-bottom: 2px;
                        line-height: 0.5em;
                    }

                    &.meta {
                        td {
                            background-color: $light-bg;
                        }
                    }

                    &.lines {
                        @each $vehicle in $vehicles {
                            .#{$vehicle} {
                                background-color: palette(vehicle-color-name($vehicle), 50);

                                .vehicle-icon {
                                    color: palette(vehicle-color-name($vehicle), 700);
                                    vertical-align: middle;
                                    line-height: 0.5em;
                                }
                            }
                        }
                    }

                    &.description {
                        td {
                            background: linear-gradient(
                                to top,
                                white,
                                $light-bg 40px,
                                $light-bg,
                            );
                            border-bottom: none;
                        }

                        h1, h2 {
                            font-size: 1.5em;
                        }
                    }
                }
            }
        }
    }
</style>
