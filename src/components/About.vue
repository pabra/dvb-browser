<template lang="pug">
    div
        h1 Meta

        table
            tbody
                tr(v-for="item in packageData")
                    td(v-translate=1) {{ item.name }}
                    td
                        a(v-if="item.target" :href="item.target" target="_blank") {{ item.value }}
                        template(v-else) {{ item.value }}

        div(v-html="text")
</template>

<script>
    import _ from 'lodash';
    import readmeEn from '@/../README.md';
    import readmeDe from '@/../README.de.md';
    import packageData from '@/../package.json';

    export default {
        name: 'about',
        data() {
            return {
                metaData: [
                    ['name', 'name'],
                    ['version', 'version'],
                    ['homepage', 'homepage'],
                    ['author', 'author'],
                    ['repository url', 'repository.url'],
                    ['bug tracker', 'bugs.url'],
                ],
            };
        },
        computed: {
            text() { return this.$translate.lang === 'de' ? readmeDe : readmeEn; },
            packageData() {
                return this.metaData.map((entry) => {
                    const [name, path] = entry;
                    const value = _.get(packageData, path);
                    const matchEmail = value.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/);
                    const item = { name, value };
                    if (value.startsWith('http://') || value.startsWith('https://')) {
                        item.target = value;
                    } else if (matchEmail) {
                        item.target = `mailto:${matchEmail[0]}`;
                    }
                    return item;
                });
            },
        },
        locales: {
            en: {
                // most strings did not need to be added here as the key usually equals
                // the translation in english
            },
            de: {
                'bug tracker': 'Bug Tracker',
                'repository url': 'Repository-URL',
                author: 'Autor',
                homepage: 'Homepage',
                name: 'Name',
                version: 'Version',
            },
        },
    };
</script>
