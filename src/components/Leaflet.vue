<template lang="pug">
    div.map-wrap
        v-map(:zoom="zoom" :center="center")
            v-tilelayer(url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
            v-marker(v-if="marker" :lat-lng="marker")
</template>

<script>
    import { mapState } from 'vuex';
    import vue2leaflet from 'vue2-leaflet';
    import Logger from '@/lib/logger';
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
                logger: Logger.get(`${this.$options.name} component`),
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
        },
        created() {
            this.logger.debug('center', this.center);
            this.logger.debug('zoom', this.zoom);
            this.logger.debug('marker', this.marker);
        },
        components: {
            'v-map': vue2leaflet.LMap,
            'v-tilelayer': vue2leaflet.LTileLayer,
            'v-marker': vue2leaflet.LMarker,
        },
    };
</script>

<style lang="scss" scoped>
    @import "~leaflet/dist/leaflet.css";

    .map-wrap {
        height: 100%;
        width: 100%;
    }
</style>
