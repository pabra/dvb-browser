// import 'normalize-scss/sass/_normalize.scss';
import 'normalize-scss/sass/normalize/_import-now.scss';
import 'skeleton-scss/scss/skeleton.scss';
import 'material-design-icons/iconfont/material-icons.css';

import 'whatwg-fetch';
import 'babel-polyfill';

import Vue from 'vue';
import App from '@/App';
import router from '@/router';
import store from '@/store';

import '@/assets/scss/base.scss';

Vue.config.productionTip = false;

/* eslint-disable no-new */
const app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
});

// for debugging in browser
if (process.env && process.env.NODE_ENV === 'development') {
    window.app = app;
}
