<template lang="pug">
    div.map-wrap
        v-map(
            :zoom="zoom"
            :center="center"
            :bounds="bounds"
            :padding="[10, 20]"
        )
            v-tilelayer(url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
            v-circle(
                v-for="m of markers"
                v-if="m.accuracy"
                :key="'c'+m.id"
                :lat-lng="[m.latitude,m.longitude]"
                :radius="m.accuracy"
            )
            v-marker(
                v-for="m of markers"
                :key="m.id"
                :lat-lng="[m.latitude,m.longitude]"
                @add="markerAdded(m, $event.target)"
                :icon="m.type === 'position' ? positionIcon : stationIcon"
            )
                v-tooltip(v-if="m.name" :content="m.name")
</template>

<script>
    /* global L */
    /* eslint-disable no-underscore-dangle */
    import { mapState } from 'vuex';
    import vue2leaflet from 'vue2-leaflet';
    import Logger from '@/lib/logger';

    export default {
        name: 'Leaflet',
        components: {
            'v-map': vue2leaflet.LMap,
            'v-tilelayer': vue2leaflet.LTileLayer,
            'v-marker': vue2leaflet.LMarker,
            'v-circle': vue2leaflet.LCircle,
            'v-tooltip': vue2leaflet.LTooltip,
        },
        props: {
            props: {
                type: Object,
                default: () => ({}),
            },
        },
        data() {
            return {
                logger: Logger.get(`${this.$options.name} component`),
                zoom: this.props.zoom || 13,
                markers: this.props.markers || [],
                positionIcon: L.divIcon({
                    className: 'material-marker',
                    html: this.getMarkerHtml('position'),
                    iconSize: [40, 40],
                    bgPos: [20, 20],
                    iconAnchor: [20, 40],
                    tooltipAnchor: [15, -25],
                }),
                stationIcon: L.divIcon({
                    className: 'material-marker',
                    html: this.getMarkerHtml('station'),
                    iconSize: [40, 40],
                    bgPos: [20, 20],
                    iconAnchor: [20, 40],
                    tooltipAnchor: [15, -25],
                }),
                allMarkersAdded: false,
                markerPopupTimeout: null,
            };
        },
        computed: {
            ...mapState(['windowWidth', 'windowHeight']),
            bounds() {
                if (!this.allMarkersAdded) return null;
                if (this.markers.length === 0) return null;
                // bounds of one marker will crash in vue2leaflet
                if (this.markers.length === 1) {
                    return [
                        [this.markers[0].latitude, this.markers[0].longitude],
                        [this.markers[0].latitude, this.markers[0].longitude],
                    ];
                }
                return this.markers.map(m => [m.latitude, m.longitude]);
            },
            center() {
                if (this.markers.length === 0) return null;
                return [this.markers[0].latitude, this.markers[0].longitude];
            },
        },
        watch: {
            allMarkersAdded(value) {
                if (!value) return;
                let chain = new Promise(resolve => setTimeout(resolve, 1000));
                this.markers.forEach((m) => {
                    chain = chain.then(() => {
                        m.element.openTooltip();

                        return new Promise((resolve) => {
                            this.markerPopupTimeout = setTimeout(() => {
                                m.element.closeTooltip();
                                resolve();
                            }, 1500);
                        });
                    });
                });
            },
        },
        created() {
            this.logger.debug('markers', this.markers);
        },
        beforeDestroy() {
            clearInterval(this.markerPopupTimeout);
        },
        methods: {
            getMarkerHtml(type) {
                const classNames = ['material-icons', 'marker'];
                if (type === 'station') {
                    classNames.push('station');
                } else if (type === 'position') {
                    classNames.push('position');
                } else {
                    return '';
                }
                return `<i ${this.$options._scopeId} class="${classNames.join(' ')}"></i>`;
            },
            markerAdded(marker, element) {
                marker.element = element;
                marker.added = true;
                this.allMarkersAdded = this.markers.every(m => m.added);
            },
        },
    };
</script>

<style lang="scss" scoped>
    @import "~leaflet/dist/leaflet.css";
    @import "~@/assets/scss/palette.scss";

    .map-wrap {
        height: 100%;
        width: 100%;

        .material-marker {
            .marker {
                font-size: 40px;
                transform: translateY(3px);

                /* markers shadow */
                &::before {
                    color: black;
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    transform: scale(0.8, 0.3) translateY(42px);
                    filter: blur(4px);
                    opacity: 0.6;
                }

                /* actual marker */
                &::after {
                    position: relative;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }

                &.station::after {
                    color: palette(Light Blue, 800);
                }

                &.station::before, &.station::after {
                    content: "place";
                }

                &.position::after {
                    color: palette(Red, 800);
                }

                &.position::before, &.position::after {
                    content: "person_pin_circle";
                }
            }
        }
    }
</style>
