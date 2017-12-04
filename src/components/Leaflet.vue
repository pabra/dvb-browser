<template lang="pug">
    div.map-wrap(:style="{width: mapWidth}")
        v-map(:zoom="zoom" :center="center")
            v-tilelayer(url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
            v-marker(v-if="marker" :lat-lng="marker")
</template>

<script>
    import { mapState } from 'vuex';
    import vue2leaflet from 'vue2-leaflet';
    // leaflet is already dependency of vue2-leaflet - so we disable import/no-extraneous-dependencies
    /* eslint-disable import/no-extraneous-dependencies */
    import iconUrl from 'leaflet/dist/images/marker-icon.png';
    import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
    import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';

    /* global L */
    /* eslint-disable no-underscore-dangle */
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

    export default {
        name: 'leaflet',
        data() {
            return {
                zoom: this.props.zoom || 13,
                center: this.props.center || null,
                marker: this.props.marker || null,
            };
        },
        props: {
            props: {
                type: Object,
                default: () => ({}),
            },
        },
        computed: {
            ...mapState(['windowWidth', 'windowHeight']),
            mapWidth() {
                const map = vue2leaflet.Map;
                window.console.log('vue2leaflet.Map', vue2leaflet.Map);
                window.console.log('map', map);
                return this.windowWidth > 500 ? `${500 - 60}px` : `${this.windowWidth - 60}px`;
            },
        },
        components: {
            'v-map': vue2leaflet.Map,
            'v-tilelayer': vue2leaflet.TileLayer,
            'v-marker': vue2leaflet.Marker,
        },
    };
</script>

<style lang="scss" scoped>
    @import "~leaflet/dist/leaflet.css";

    .map-wrap {
        height: 400px;
        width: 400px;
    }
</style>
