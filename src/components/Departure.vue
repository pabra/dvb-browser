<template lang="pug">
    div
        h1 {{ stationName }}

        button(
            class="reload"
            :class="reloadButtonClassNames"
            :disabled="loading || isOnline === false"
            @click="onReloadClicked"
        )
            i.material-icons autorenew

        span.fetched {{ t('fetched') }}: {{ formatDateDiff( apiCalled - now ) }}

        table.u-full-width
            thead
                tr
                    th(colspan="2") {{ t('line') }}
                    th.direction(colspan="2")
                        span.platform(v-if="somePlatforms") {{ t('platform') + ' ' }}
                        | {{ t('direction') }}
                    th(colspan="2") {{ t('time') }}
            tbody
                tr(
                    v-for="d in departureTable"
                    :class="d.rowClass"
                )
                    td.vehicle(
                        v-if="d.nextSameLine"
                        :rowspan="d.nextSameLine"
                        :title="`${d.mode.title}: ${d.line}`"
                    )
                        span(
                            :class=`{
                                button: d.routeChangesPerLine.size,
                                'show-reroute': d.routeChangesPerLine.size &&
                                    parseInt(now / 1000) % 2,
                            }`
                            @click="onClickRouteChange(d.routeChangesPerLine)"
                        )
                            i.material-icons.vehicle-icon(
                                v-if="vehicles[d.mode.name.toLowerCase()]"
                            ) {{ vehicles[d.mode.name.toLowerCase()].ligature }}
                            span.vehicle(v-else) {{ d.mode.name }}
                            i.material-icons.reroute-icon trending_down

                    td.line(
                        v-if="d.nextSameLine"
                        :rowspan="d.nextSameLine"
                        :title="`${d.mode.title}: ${d.line}`"
                    ) {{ d.line }}

                    td.platform(
                        v-if="d.nextSamePlatform"
                        :rowspan="d.nextSamePlatform"
                    ) {{ d.platform.name }}

                    td.direction(
                        v-if="d.nextSameDirection"
                        :rowspan="d.nextSameDirection"
                    ) {{ d.direction }}

                    td.delay {{ d.delayTimeStr }}
                    td.time {{ d.arrivalTimeRelative }}
</template>

<script>
    import _ from 'lodash';
    import { mapState } from 'vuex';
    import Stations from '@/components/Stations';
    import RouteChanges from '@/components/RouteChanges';
    import Logger, { errorToObject } from '@/lib/logger';
    import { vehicles, vehicleOrder, tryInt, stationName } from '@/lib/utils';
    import { fetchDeparture } from '@/lib/fetch';

    export default {
        name: 'Departure',
        components: {
            Stations,
            RouteChanges,
        },
        props: {
            stationId: {
                type: Number,
                default: null,
            },
        },
        data() {
            return {
                stationsName: Stations.name,
                vehicles,
                now: new Date(),
                pageLoaded: new Date(),
                intervalRef: null,
                loading: false,
                reloadWaitClassName: 'reload-wait-60s',
                apiData: {},
                apiCalled: null,
                logger: Logger.get(`${this.$options.name} component`),
            };
        },
        computed: {
            ...mapState(['isVisible', 'isOnline']),
            departureTable() {
                const departureCount = {};
                const getSchama = (obj, schema) => schema.map(s => _.get(obj, s)).join('\t');

                const vehicleSchema = ['mode.name'];
                let vehicleAccuStr = '';
                let vehicleAccu;

                const lineSchema = ['line'];
                let lineAccuStr = '';
                let lineAccu;

                const platformSchema = ['line', 'platform.name'];
                let platformAccuStr = '';
                let platformAccu;

                const directionSchema = ['line', 'platform.name', 'direction'];
                let directionAccuStr = '';
                let directionAccu;

                if (!this.apiData.departures) return [];
                return this.apiData.departures
                    .filter((d) => {
                        // 3 departures per platform or direction
                        let key;
                        if (d.platform.name) key = `${d.line}\t${d.platform.name}`;
                        else key = `${d.line}\t${d.direction}`;

                        if (!(key in departureCount)) departureCount[key] = 0;
                        departureCount[key] += 1;

                        return departureCount[key] <= 3;
                    })
                    .sort((a, b) => {
                        const aVehIdx = vehicleOrder.indexOf(a.mode.name.toLowerCase());
                        const bVehIdx = vehicleOrder.indexOf(b.mode.name.toLowerCase());
                        if (aVehIdx < bVehIdx) return -1;
                        if (aVehIdx > bVehIdx) return 1;

                        const aLine = tryInt(a.line);
                        const bLine = tryInt(b.line);
                        if (typeof aLine === 'number' && typeof bLine === 'string') return -1;
                        if (typeof aLine === 'string' && typeof bLine === 'number') return 1;
                        if (tryInt(a.line) < tryInt(b.line)) return -1;
                        if (tryInt(a.line) > tryInt(b.line)) return 1;

                        if (a.platform.name && b.platform.name) {
                            if (a.platform.name < b.platform.name) return -1;
                            if (a.platform.name > b.platform.name) return 1;
                        } else {
                            if (a.direction < b.direction) return -1;
                            if (a.direction > b.direction) return 1;
                        }

                        if (a.arrivalTime < b.arrivalTime) return -1;
                        if (a.arrivalTime > b.arrivalTime) return 1;

                        return 0;
                    })
                    .map((d) => {
                        if (d.delayTime > 0) d.delayTimeStr = `+${d.delayTime}′`;
                        else if (d.delayTime < 0) d.delayTimeStr = `-${d.delayTime}′`;
                        else d.delayTimeStr = '';

                        d.arrivalTimeRelativeInt = d.arrivalTime - this.now;
                        d.arrivalTimeRelative = this.formatDateDiff(d.arrivalTimeRelativeInt);
                        const arrivalIsSoon = d.arrivalTimeRelativeInt <= 5 * 60 * 1000;

                        const vehicleStr = getSchama(d, vehicleSchema);
                        if (vehicleStr !== vehicleAccuStr) {
                            vehicleAccuStr = vehicleStr;
                            vehicleAccu = d;
                            d.nextSameVehicle = 0;
                        }
                        vehicleAccu.nextSameVehicle += 1;

                        let newLine = false;
                        const lineStr = getSchama(d, lineSchema);
                        if (lineStr !== lineAccuStr) {
                            newLine = true;
                            lineAccuStr = lineStr;
                            lineAccu = d;
                            lineAccu.routeChangesPerLine = new Set();
                            d.nextSameLine = 0;
                        }
                        lineAccu.nextSameLine += 1;
                        if (d.routeChanges.length) {
                            d.routeChanges.forEach(rc => lineAccu.routeChangesPerLine.add(rc));
                        }

                        let newPlatform = false;
                        const platformStr = getSchama(d, platformSchema);
                        if (platformStr !== platformAccuStr) {
                            newPlatform = true;
                            platformAccuStr = platformStr;
                            platformAccu = d;
                            d.nextSamePlatform = 0;
                        }
                        platformAccu.nextSamePlatform += 1;

                        let newDirection = false;
                        const directionStr = getSchama(d, directionSchema);
                        if (directionStr !== directionAccuStr) {
                            newDirection = true;
                            directionAccuStr = directionStr;
                            directionAccu = d;
                            d.nextSameDirection = 0;
                        }
                        directionAccu.nextSameDirection += 1;


                        d.rowClass = [
                            d.mode.name,
                        ];

                        if (newLine) d.rowClass.push('newLine');
                        if (arrivalIsSoon) d.rowClass.push('arrivalIsSoon');
                        if (newPlatform || (newDirection && !d.platform.name)) {
                            d.rowClass.push('newPlatformOrDirection');
                        }

                        return d;
                });
            },
            somePlatforms() {
                return this.departureTable.some(d => d.platform.name);
            },
            reloadButtonClassNames() {
                if (this.loading) return ['loading'];
                return [this.reloadWaitClassName];
            },
            stationName() {
                return stationName(this.apiData);
            },
        },
        watch: {
            isVisible(value) {
                if (value) {
                    this.pageLoaded = new Date();
                    this.reloadWaitClassName = 'reload-wait-60s';
                }
            },
        },
        created() {
            this.getData();
            this.intervalRef = setInterval(() => {
                // don't update anything if app is not visible
                if (!this.isVisible) return;

                const now = new Date();
                const minute = 60 * 1000;
                if (now - this.pageLoaded > 60 * minute) {
                    this.reloadWaitClassName = `reload-wait-${60 * 60}s`;
                    if (now - this.apiCalled > 10 * minute) this.getData();
                } else if (now - this.pageLoaded > 10 * minute) {
                    this.reloadWaitClassName = `reload-wait-${10 * 60}s`;
                    if (now - this.apiCalled > 5 * minute) this.getData();
                } else if (now - this.apiCalled > minute) {
                    this.reloadWaitClassName = 'reload-wait-60s';
                    this.getData();
                } else {
                    this.now = now;
                }
            }, 1000);
        },
        beforeDestroy() {
            if (this.intervalRef !== null) {
                clearInterval(this.intervalRef);
            }
        },
        methods: {
            msg(text, subject = null) {
                this.$store.dispatch('messageAddAndReturn', { text, subject });
            },
            async getData() {
                // do not fetch data if there is no stationId
                if (!this.stationId) return;
                // ... or offline
                if (this.isOnline === false) return;
                // ... or not visible
                if (!this.isVisible) return;
                // ... or already/still loading
                if (this.loading) return;

                this.loading = true;
                let res;
                try {
                    res = await fetchDeparture(this.stationId);
                } catch (err) {
                    if (err.code === 1) {
                        this.msg(this.t('We got no data from server. Please try again.'));
                    } else if (err.code === 2) {
                        this.msg(this.t('No serving lines found. Check your selected vehicles in settings.'));
                    } else {
                        this.logger.error('getData cought error', {
                            error: await errorToObject(err),
                            stationId: this.stationId,
                        });
                    }
                    res = {};
                }
                this.apiData = res;
                this.apiCalled = new Date();
                this.loading = false;
            },
            departureTitle(departure) {
                return `${departure.scheduledTime.toLocaleString()} (${departure.arrivalTime.toLocaleString()})`;
            },
            shortTime(dateTime) {
                return `${_.padStart(dateTime.getHours(), 2, '0')}:${_.padStart(dateTime.getMinutes(), 2, '0')}`;
            },
            formatDateDiff(msec) {
                const totalSec = Math.round(msec / 1000);
                const min = Math.floor(Math.abs(totalSec / 60));

                let sec;
                if (Math.abs(totalSec) > 5 * 60) sec = 0;
                else sec = Math.abs(totalSec % 60);

                const neg = totalSec < 0 ? '-' : '';
                return `${neg}${min}:${_.padStart(sec, 2, '0')}`;
            },
            onReloadClicked() {
                this.pageLoaded = new Date();
                this.reloadWaitClassName = 'reload-wait-60s';
                this.getData();
            },
            onClickRouteChange(ids) {
                const idArray = _.isSet(ids) ? [...ids] : ids;
                this.logger.debug('ids', idArray);
                this.logger.debug('click route change ids', idArray);
                if (!idArray.length) return;
                this.$emit('onShowOverlay', {
                    component: RouteChanges,
                    props: {
                        ids: idArray,
                    },
                });
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'We got no data from server. Please try again.':
                    'Wir haben keine Daten vom Server bekommen. Bitte versuche es erneut.',
                'No serving lines found. Check your selected vehicles in settings.':
                    'Keine Linen gefunden. Prüfe deine ausgewählten Verkehrsmittel in den Einstellungen.',
                platform: 'Plattform',
                direction: 'Richtung',
                line: 'Linie',
                time: 'Zeit',
                fetched: 'abgerufen',
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    .fetched {
        margin-left: 10px;
    }

    .platform, .delay {
        color: palette(Blue Grey, 300);
    }

    th,
    td {
        padding: 2px 2px 2px 0;
        border: 0 none transparent;

        &.vehicle {
            .reroute-icon {
                display: none;
                position: absolute;
                top: 4px;
                left: 2px;
                font-weight: bold;
                transform: rotate(-45deg);
                color: $reroute-color;
            }

            .button {
                color: inherit;
                width: 30px;
                overflow: hidden;
                position: relative;

                &.show-reroute {
                    .reroute-icon {
                        display: inline-block;
                    }
                }
            }
        }

        &.platform {
            padding-right: 8px;
        }

        &.direction {
            width: 100%;
        }

        &.line,
        &.delay {
            padding-right: 8px;
            white-space: nowrap;
        }

        &.time {
            white-space: nowrap;
        }

        &.time, &.delay, &.platform {
            text-align: right;
        }
    }

    button.reload {
        i {
            vertical-align: baseline !important;
            font-size: 26px;
            // use -webkit prefixes here so IE11 ignores it (can't handle it)
            // all other major browsers (even edge) can deal with the prefix
            background-image:
                -webkit-linear-gradient(
                    315deg,
                    $main-color 0%,
                    $main-color-darker 50%,
                    $main-color-lighter 51%,
                    $main-color 100%,
                );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        &.loading {
            i {
                animation-name: spin;
                animation-duration: 1s;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
            }
        }

        $wait-times: 60s, 10 * 60s, 60 * 60s;
        @each $i in $wait-times {
            &.reload-wait-#{$i} {
                i {
                    animation-name: spin-back;
                    animation-duration: $i;
                    animation-iteration-count: 1;
                    animation-timing-function: linear;
                }
            }
        }
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes spin-back {
        from {
            transform: rotate(360deg);
        }
        to {
            transform: rotate(0deg);
        }
    }

    @each $vehicle in $vehicles {
        $vehicle-color-name: vehicle-color-name($vehicle);
        $vehicle-color: palette($vehicle-color-name, 700);

        tr.#{$vehicle} {
            td {
                background-color: palette($vehicle-color-name, 50);
            }

            td.vehicle {
                color: $vehicle-color;

                .button.show-reroute {
                    .vehicle-icon {
                        color: palette($vehicle-color-name, 100);
                    }
                }
            }

            td.delay, td.platform {
                color: palette($vehicle-color-name, 300);
            }

            &.arrivalIsSoon td {
                &.direction, &.time, &.delay, &.platform {
                    font-weight: bold;
                }

                &.direction, &.time {
                    text-shadow: 0 0 15px $vehicle-color;
                }

                &.delay, &.platform {
                    text-shadow: 0 0 15px #aaa;
                }

            }

            &.newPlatformOrDirection {
                td {
                    border-top: 1px solid palette($vehicle-color-name, 100);
                }
            }

            &.newLine {
                td {
                    border-top: 2px solid palette($vehicle-color-name, 100);
                }
            }
        }
    }
</style>
