<template lang="pug">
    div
        h1 Departure

        p.station-name {{ apiData.city }}, {{ apiData.stop }} ({{ stationId }})

        button(
            class="reload"
            :class="{loading}"
            :disabled="loading"
            @click="getData"
        )
            div.text &#8635;

        pre(v-if="!apiData.status || !apiData.status.Code || apiData.status.Code !== 'Ok'") {{ apiData.status }}

        table.u-full-width
            thead
                tr
                    th(colspan="2") line
                    th(class="direction") direction
                    th(colspan="2") time
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
                        //-     v-if="modes[d.mode.name.toLowerCase()]"
                        //-     :src="modes[d.mode.name.toLowerCase()].icon_url"
                        //- )
                        i(
                            v-if="modes[d.mode.name.toLowerCase()]"
                        ).material-icons
                            | {{ modes[d.mode.name.toLowerCase()].ligature }}
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
                    td.time {{ d.arrivalTimeRelative }}
</template>

<script>
    import _ from 'lodash';
    import Stations from '@/components/Stations';
    import { modes } from '@/lib/utils';
    import { fetchDeparture } from '@/lib/fetch';

    export default {
        name: 'departure',
        data() {
            return {
                stationsName: Stations.name,
                modes,
                now: new Date(),
                intervalRef: null,
                loading: false,
                apiData: {},
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
                const vehicleOrder = [
                    'tram',
                    'citybus',
                    'intercitybus',
                    'suburbanrailway',
                    'train',
                    'cableway',
                    'ferry',
                    'hailedsharedtaxi',
                ];
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

                        d.arrivalTimeRelative = this.formatDateDiff(d.arrivalTime - this.now);

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
                // if (!this.stationId || 1) return;
                this.loading = true;
                const res = await fetchDeparture(this.stationId);
                window.console.log('res', res);
                this.apiData = res;
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
        },
        created() {
            this.getData();
            this.intervalRef = setInterval(() => {
                this.now = new Date();
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
    };
</script>

<style lang="scss" scoped>
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
        }
    }

    .station-name {
        font-weight: bold;
    }

    button.reload.loading {
        .text {
            animation-name: spin;
            animation-duration: 1s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
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

    $v-colors: (
        tram: #DD0B2F,
        tram2: #f44336,
        citybus: #005E79,
        citybus2: #2196f3,
        intercitybus: #005E79,
        intercitybus2: #2196f3,
        suburbanrailway: #009551,
        suburbanrailway2: #4caf50,
        train: #00A15E,
        train2: #009688,
        cableway: #95C11F,
        cableway2: #8bc34a,
        ferry: #00A5DF,
        ferry2: #03a9f4,
        hailedsharedtaxi: #FDC400,
        hailedsharedtaxi2: #ffc107,
    );

    @function line($color, $eo) {
        @if $eo == 'even' { @return $color; }
        @if $eo == 'odd' { @return darken($color, 3%); }
    }

    @function direction($color, $eo) {
        @if $eo == 'even' { @return $color; }
        @if $eo == 'odd' { @return lighten($color, 3%); }
    }

    @function departure($color, $eo) {
        @if $eo == 'even' { @return $color; }
        @if $eo == 'odd' { @return darken($color, 3%); }
    }

    @each $vehicle in tram, citybus, intercitybus, suburbanrailway, train, cableway, ferry, hailedsharedtaxi {
        $vehicle-class: 'tr.#{$vehicle}';
        $vehicle-bg-color: hsl(hue(map-get($v-colors, '#{$vehicle}2')), 25%, 85%);
        $vehicle-color: hsl(hue(map-get($v-colors, '#{$vehicle}2')), 70%, 50%);

        @each $line-eo in even, odd {
            $line-class: '.line-#{$line-eo}';
            $line-bg-color: line($vehicle-bg-color, $line-eo);
            #{$vehicle-class}#{$line-class} {
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
