<template lang="pug">
    div
        h1 Departure
        div
            router-link(:to="{ name: stationsName }") &lArr;
        span station: {{ stationId }} - {{ dummyData.city }}, {{ dummyData.stop }}

        button(@click="getData") &#8635;

        pre(v-if="!dummyData.status.Code || dummyData.status.Code !== 'Ok'") {{ dummyData.status }}

        //- template(v-for="vehicle in Object.keys(departureModel).sort()")
        //-     div(v-for="line in Object.keys(departureModel[vehicle].data).sort()" class="per-line u-full-width")
        //-         div(class="vehicle-line")
        //-             img(
        //-                 v-if="modes[vehicle.toLowerCase()]"
        //-                 :src="modes[vehicle.toLowerCase()].icon_url"
        //-                 class="vehicle"
        //-             )
        //-             span(v-else class="vehicle") {{ vehicle }}
        //-             span(class="line") {{ line }}
        //-         div(class="directions")
        //-             div(v-for="direction in Object.keys(departureModel[vehicle].data[line].data).sort()" class="direction")
        //-                 div(class="direction-name") &rarr; {{ direction }}
        //-                 div(class="departures")
        //-                     div(v-for="departure in departureModel[vehicle].data[line].data[direction].data" class="departure")
        //-                         div(class="delay-time") {{ departure.delayTime > 0 ? `+${departure.delayTime}` : departure.delayTime < 0 ? `-${departure.delayTime}` : '' }}
        //-                         div(class="arrival-time") {{ shortTime(departure.arrivalTime) }}

        table(class="u-full-width")
            thead
                tr
                    th(colspan="2") line
                    th(class="direction") direction
                    th(colspan="2") time
            tbody
                template(v-for="vehicle in Object.keys(departureModel).sort()")
                    template(v-for="(line, lineIndex) in Object.keys(departureModel[vehicle].data).sort()")
                        template(v-for="(direction, directionIndex) in Object.keys(departureModel[vehicle].data[line].data).sort()")
                            template(v-for="(departure, departureIndex) in departureModel[vehicle].data[line].data[direction].data")
                                tr
                                    td(:rowspan="departureModel[vehicle].data[line].departureCount" v-if="directionIndex === 0 && departureIndex === 0")
                                        //- img(
                                        //-     v-if="modes[vehicle.toLowerCase()]"
                                        //-     :src="modes[vehicle.toLowerCase()].icon_url"
                                        //-     class="vehicle"
                                        //- )
                                        i(
                                            v-if="modes[vehicle.toLowerCase()]"
                                        ).material-icons
                                            | {{ modes[vehicle.toLowerCase()].ligature }}
                                        span(v-else class="vehicle") {{ vehicle }}
                                    td(:rowspan="departureModel[vehicle].data[line].departureCount" v-if="directionIndex === 0 && departureIndex === 0" class="line") {{ line }}
                                    td(:rowspan="departureModel[vehicle].data[line].data[direction].departureCount" v-if="departureIndex === 0" class="direction") &rarr; {{ direction }}
                                    td(class="delay") {{ departure.delayTime > 0 ? `+${departure.delayTime}` : departure.delayTime < 0 ? `-${departure.delayTime}` : '' }}
                                    //- absolute time
                                    //- td.time {{ shortTime(departure.arrivalTime) }}
                                    //- relative time
                                    td.time {{ formatDateDiff(departure.arrivalTime - now) }}

        pre {{ departureModel }}
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
                dummyData: {
                    status: {},
                    city: 'res.data.Place',
                    stop: 'res.data.Name',
                    departures: [
                        {
                            arrivalTime: new Date('2017-10-12T08:43:33.000Z'),
                            scheduledTime: new Date('2017-10-12T08:41:00.000Z'),
                            line: '64',
                            direction: 'Kaditz, Am Vorwerksfeld',
                            arrivalTimeRelative: 2,
                            scheduledTimeRelative: 0,
                            delayTime: 3,
                            state: 'Delayed',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T08:45:00.000Z'),
                            scheduledTime: new Date('2017-10-12T08:45:00.000Z'),
                            line: '64',
                            direction: 'Striesen',
                            arrivalTimeRelative: 4,
                            scheduledTimeRelative: 4,
                            delayTime: 0,
                            state: 'InTime',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T08:56:27.000Z'),
                            scheduledTime: new Date('2017-10-12T08:55:00.000Z'),
                            line: '64',
                            direction: 'Reick',
                            arrivalTimeRelative: 15,
                            scheduledTimeRelative: 14,
                            delayTime: 1,
                            state: 'Delayed',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T08:56:45.000Z'),
                            scheduledTime: new Date('2017-10-12T08:51:00.000Z'),
                            line: '64b',
                            direction: 'Kaditz, Riegelplatz',
                            arrivalTimeRelative: 15,
                            scheduledTimeRelative: 10,
                            delayTime: 6,
                            state: 'Delayed',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T09:01:35.000Z'),
                            scheduledTime: new Date('2017-10-12T09:01:00.000Z'),
                            line: '64',
                            direction: 'Kaditz, Am Vorwerksfeld',
                            arrivalTimeRelative: 20,
                            scheduledTimeRelative: 20,
                            delayTime: 1,
                            state: 'InTime',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T09:05:00.000Z'),
                            scheduledTime: new Date('2017-10-12T09:05:00.000Z'),
                            line: '64 ersatz',
                            direction: 'Striesen',
                            arrivalTimeRelative: 24,
                            scheduledTimeRelative: 24,
                            delayTime: 0,
                            state: 'InTime',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T09:12:18.000Z'),
                            scheduledTime: new Date('2017-10-12T09:11:00.000Z'),
                            line: '64',
                            direction: 'Kaditz, Riegelplatz',
                            arrivalTimeRelative: 31,
                            scheduledTimeRelative: 30,
                            delayTime: 1,
                            state: 'Delayed',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T09:15:00.000Z'),
                            scheduledTime: new Date('2017-10-12T09:15:00.000Z'),
                            line: '64',
                            direction: 'Reick',
                            arrivalTimeRelative: 34,
                            scheduledTimeRelative: 34,
                            delayTime: 0,
                            state: 'InTime',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T09:21:00.000Z'),
                            scheduledTime: new Date('2017-10-12T09:21:00.000Z'),
                            line: '64',
                            direction: 'Kaditz, Am Vorwerksfeld',
                            arrivalTimeRelative: 40,
                            scheduledTimeRelative: 40,
                            delayTime: 0,
                            state: 'InTime',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                        {
                            arrivalTime: new Date('2017-10-12T09:25:00.000Z'),
                            scheduledTime: new Date('2017-10-12T09:25:00.000Z'),
                            line: '64',
                            direction: 'Striesen',
                            arrivalTimeRelative: 44,
                            scheduledTimeRelative: 44,
                            delayTime: 0,
                            state: 'InTime',
                            mode: {
                                title: 'Stadtbus',
                                name: 'citybus',
                                icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
                            },
                            diva: {
                                number: 21064,
                                network: 'voe',
                            },
                        },
                    ],
                },
            };
        },
        props: {
            stationId: {
                type: Number,
                default: null,
            },
        },
        computed: {
            departureModel() {
                const mod = {};
                this.dummyData.departures.forEach((departure) => {
                    const vehicle = departure.mode.name;
                    // debugger;
                    // const line = parseInt(departure.line, 10) || departure.line;
                    const line = departure.line;
                    const direction = departure.direction;
                    if (!(vehicle in mod)) {
                        mod[vehicle] = { data: {}, departureCount: 0 };
                    }
                    if (!(line in mod[vehicle].data)) {
                        mod[vehicle].data[line] = { data: {}, departureCount: 0 };
                    }
                    if (!(direction in mod[vehicle].data[line].data)) {
                        mod[vehicle].data[line].data[direction] = { data: [], departureCount: 0 };
                    }

                    // limit nr of depatures per direction
                    if (mod[vehicle].data[line].data[direction].departureCount >= 3) return;

                    mod[vehicle].departureCount += 1;
                    mod[vehicle].data[line].departureCount += 1;
                    mod[vehicle].data[line].data[direction].departureCount += 1;
                    mod[vehicle].data[line].data[direction].data.push(departure);
                });
                // debugger;
                return mod;
            },
        },
        methods: {
            async getData() {
                if (!this.stationId) return;
                // if (!this.stationId || 1) return;
                const res = await fetchDeparture(this.stationId);
                window.console.log('res', res);
                this.dummyData = res;
            },
            departureTitle(departure) {
                return `${departure.scheduledTime.toLocaleString()} (${departure.arrivalTime.toLocaleString()})`;
            },
            shortTime(dateTime) {
                return `${_.padStart(dateTime.getHours(), 2, '0')}:${_.padStart(dateTime.getMinutes(), 2, '0')}`;
            },
            formatDateDiff(msec) {
                const totalSec = Math.round(msec / 1000);
                const min = Math.floor(totalSec / 60);
                const sec = Math.abs(totalSec % 60);
                return `${min}:${_.padStart(sec, 2, '0')}`;
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
    $vehicle-line-width: 60px;
    $departue-width: 60px;

    .vehicle-line,
    .directions,
    .direction-name,
    .departures,
    .delay-time,
    .arrival-time {
        display: inline-block;
    }

    .per-line {
        border: 1px solid #ccc;

        .vehicle-line {
            vertical-align: middle;
            width: $vehicle-line-width;
            word-wrap: break-word;

            img {
                width: 25px;
                vertical-align: middle;
            }

            .vehicle {
                margin-right: 5px;
            }
        }

        .directions {
            vertical-align: middle;
            width: calc(100% - #{$vehicle-line-width});

            .direction {
                border: 1px solid #ccc;

                .direction-name {
                    width: calc(100% - #{$departue-width});
                }

                .departures {
                    vertical-align: middle;
                    width: $departue-width;

                    .departure {
                        text-align: right;
                    }

                    .arrival-time {
                        margin-left: 5px;
                    }
                }
            }
        }
    }

    th,
    td {
        padding: 2px 2px 2px 0;

        img.vehicle {
            width: 20px;
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
</style>
