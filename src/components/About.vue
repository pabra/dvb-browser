<template lang="pug">
    div(v-html="text")
</template>

<script>
    import readmeEn from '@/../README.md';
    import readmeDe from '@/../README.de.md';

    export default {
        name: 'about',
        computed: {
            text() { return this.$translate.lang === 'de' ? readmeDe : readmeEn; },
        },
    };
</script>
