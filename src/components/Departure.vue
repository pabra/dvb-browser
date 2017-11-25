<template lang="pug">
    div
        //- Because departure times are updated every second, for some reason translations
        //- done with v-translate are also updated every second. At least in my Chromium
        //- browser that's the case. I expect this to be an unnecessary performance issue
        //- specially on mobile devices.
        h1 {{ t('_Departures') }}

        p.station-name {{ apiData.city }}, {{ apiData.stop }} ({{ stationId }})

        button(
            class="reload"
            :class="{loading}"
            :disabled="loading"
            @click="onReloadClicked"
        )
            i.material-icons autorenew

        pre(v-if="!apiData.status || !apiData.status.Code || apiData.status.Code !== 'Ok'") {{ apiData.status }}

        table.u-full-width
            thead
                tr
                    th(colspan="2") {{ t('line') }}
                    th(class="direction") {{ t('direction') }}
                    th(colspan="2") {{ t('time') }}
            tbody
                tr(
                    v-for="d in departureTable"
                    :class="d.rowClass"
                )
                    td.vehicle(
                        v-if="d.departuresPerLine"
                        :rowspan="d.departuresPerLine"
                        :title="`${d.mode.title}: ${d.line}`"
                    )
                        //- img(
                        //-     v-if="vehicles[d.mode.name.toLowerCase()]"
                        //-     :src="vehicles[d.mode.name.toLowerCase()].icon_url"
                        //- )
                        i(
                            v-if="vehicles[d.mode.name.toLowerCase()]"
                        ).material-icons
                            | {{ vehicles[d.mode.name.toLowerCase()].ligature }}
                        span.vehicle(v-else) {{ d.mode.name }}

                    td.line(
                        v-if="d.departuresPerLine"
                        :rowspan="d.departuresPerLine"
                        :title="`${d.mode.title}: ${d.line}`"
                    ) {{ d.line }}

                    td.direction(
                        v-if="d.departuresPerDirection"
                        :rowspan="d.departuresPerDirection"
                    ) {{ d.direction }}

                    td.delay {{ d.delayTimeStr }}
                    td.time(:class="{arrivalIsNear: d.arrivalIsNear}") {{ d.arrivalTimeRelative }}
</template>

<script>
    import _ from 'lodash';
    import Stations from '@/components/Stations';
    import { vehicles, vehicleOrder } from '@/lib/utils';
    import { fetchDeparture } from '@/lib/fetch';

    export default {
        name: 'departure',
        data() {
            return {
                stationsName: Stations.name,
                vehicles,
                now: new Date(),
                pageLoaded: new Date(),
                intervalRef: null,
                loading: false,
                apiData: {},
                apiCalled: null,
            };
        },
        props: {
            stationId: {
                type: Number,
                default: null,
            },
        },
        computed: {
            departureTable() {
                const tryInt = this.tryInt;
                const departureCount = {};
                let vehiclePrev = '';
                let vehicleEvenOdd = '';
                let linePrev = '';
                let lineEvenOdd = '';
                let directionPrev = '';
                let directionEvenOdd = '';
                let departureEvenOdd = '';

                if (!this.apiData.departures) return [];
                return this.apiData.departures
                    .filter((d) => {
                        // 3 departures per direction
                        const key = `${d.line}_${d.direction}`;
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

                        if (a.direction < b.direction) return -1;
                        if (a.direction > b.direction) return 1;

                        if (a.arrivalTime < b.arrivalTime) return -1;
                        if (a.arrivalTime > b.arrivalTime) return 1;

                        return 0;
                    })
                    .map((d, idx, self) => {
                        /* eslint-disable no-param-reassign */
                        if (d.delayTime > 0) d.delayTimeStr = `+${d.delayTime}`;
                        else if (d.delayTime < 0) d.delayTimeStr = `-${d.delayTime}`;
                        else d.delayTimeStr = '';

                        d.arrivalTimeRelativeInt = d.arrivalTime - this.now;
                        d.arrivalTimeRelative = this.formatDateDiff(d.arrivalTimeRelativeInt);
                        d.arrivalIsNear = d.arrivalTimeRelativeInt <= 5 * 60 * 1000;

                        if (d.mode.name !== vehiclePrev) {
                            d.departuresPerVehicle = self.reduce(
                                (sum, value) => (value.mode.name === d.mode.name ? sum + 1 : sum),
                                0,
                            );
                            vehiclePrev = d.mode.name;
                            vehicleEvenOdd = vehicleEvenOdd === 'even' ? 'odd' : 'even';
                        }

                        if (d.line !== linePrev) {
                            d.departuresPerLine = self.reduce(
                                (sum, value) => (value.line === d.line ? sum + 1 : sum),
                                0,
                            );
                            linePrev = d.line;
                            if (d.departuresPerVehicle) lineEvenOdd = 'even';
                            else lineEvenOdd = lineEvenOdd === 'even' ? 'odd' : 'even';
                        }

                        if (`${d.line}\t${d.direction}` !== directionPrev) {
                            d.departuresPerDirection = self.reduce(
                                (sum, value) => (`${value.line}\t${value.direction}` === `${d.line}\t${d.direction}` ? sum + 1 : sum),
                                0,
                            );
                            directionPrev = `${d.line}\t${d.direction}`;
                            if (d.departuresPerLine) directionEvenOdd = 'even';
                            else directionEvenOdd = directionEvenOdd === 'even' ? 'odd' : 'even';
                        }

                        if (d.departuresPerDirection) departureEvenOdd = 'even';
                        else departureEvenOdd = departureEvenOdd === 'even' ? 'odd' : 'even';

                        d.rowClass = [
                            d.mode.name,
                            `vehicle-${vehicleEvenOdd}`,
                            `line-${lineEvenOdd}`,
                            `direction-${directionEvenOdd}`,
                            `departure-${departureEvenOdd}`,
                        ];

                        return d;
                    });
            },
        },
        methods: {
            async getData() {
                if (!this.stationId) return;
                if (this.loading) return;
                // if (!this.stationId || 1) return;
                this.loading = true;
                const res = await fetchDeparture(this.stationId);
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
            tryInt(string) {
                const int = parseInt(string, 10);
                return String(int) === String(string) ? int : string;
            },
            onReloadClicked() {
                this.pageLoaded = new Date();
                this.getData();
            },
        },
        created() {
            this.getData();
            this.intervalRef = setInterval(() => {
                const now = new Date();
                if (this.loading) return;

                const minute = 60 * 1000;
                if (now - this.pageLoaded > 60 * minute && now - this.apiCalled > 10 * minute) {
                    this.getData();
                } else if (now - this.pageLoaded > 10 * minute && now - this.apiCalled > 5 * minute) {
                    this.getData();
                } else if (now - this.apiCalled > minute) {
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
        components: {
            Stations,
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                direction: 'Richtung',
                line: 'Linie',
                time: 'Zeit',
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~@/assets/scss/variables.scss";

    th,
    td {
        padding: 2px 2px 2px 0;

        &.vehicle {
            img {
                width: 20px;
            }
        }

        &.direction {
            width: 100%;
        }

        &.line,
        &.delay {
            padding-right: 8px;
        }

        &.time {
            text-align: right;
            white-space: nowrap;

            &.arrivalIsNear {
                font-weight: bold;
            }
        }
    }

    .station-name {
        font-weight: bold;
    }

    button.reload {
        i {
            font-size: 26px;
        }

        &.loading {
            i {
                animation-name: spin;
                animation-duration: 1s;
                animation-iteration-count: infinite;
                animation-timing-function: linear;
            }
        }
    }

    @keyframes spin {
        from {
            transform:rotate(0deg);
        }
        to {
            transform:rotate(360deg);
        }
    }

    @function line($color, $eo) {
        @if $eo == 'even' { @return $color; }
        @if $eo == 'odd' { @return darken($color, 1.2%); }
    }

    @function direction($color, $eo) {
        @if $eo == 'even' { @return $color; }
        @if $eo == 'odd' { @return lighten($color, 1.2%); }
    }

    @function departure($color, $eo) {
        @if $eo == 'even' { @return $color; }
        @if $eo == 'odd' { @return darken($color, 1.2%); }
    }

    @each $vehicle in tram, citybus, intercitybus, suburbanrailway, train, cableway, ferry, hailedsharedtaxi {
        $vehicle-class: 'tr.#{$vehicle}';
        $vehicle-bg-color: hsl(hue(map-get($vehicle-colors, '#{$vehicle}2')), 90%, 97%);
        $vehicle-color: hsl(hue(map-get($vehicle-colors, '#{$vehicle}2')), 50%, 40%);

        @each $line-eo in even, odd {
            $line-class: '.line-#{$line-eo}';
            $line-bg-color: line($vehicle-bg-color, $line-eo);
            #{$vehicle-class}#{$line-class} {
                td.vehicle {
                    color: $vehicle-color;
                }
                td.vehicle, td.line {
                    background-color: $line-bg-color;
                }
            }

            @each $direction-eo in even, odd {
                $direction-class: '.direction-#{$direction-eo}';
                $direction-bg-color: direction($line-bg-color, $direction-eo);
                #{$vehicle-class}#{$line-class}#{$direction-class} {
                    td.direction {
                        background-color: $direction-bg-color;
                    }
                }

                @each $departure-eo in even, odd {
                    $departure-class: '.departure-#{$departure-eo}';
                    $departure-bg-color: departure($direction-bg-color, $departure-eo);
                    #{$vehicle-class}#{$line-class}#{$direction-class}#{$departure-class} {
                        td.delay, td.time {
                            background-color: $departure-bg-color;
                        }
                    }
                }
            }
        }
    }
</style>
