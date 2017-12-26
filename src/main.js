// import 'normalize-scss/sass/_normalize.scss';
import 'normalize-scss/sass/normalize/_import-now.scss';
import 'skeleton-scss/scss/skeleton.scss';
import 'material-design-icons/iconfont/material-icons.css';

import 'whatwg-fetch';
import 'babel-polyfill';

import Vue from 'vue';
import _ from 'lodash';
import '@/locales';
import { vueErrorHandler, vueWarnHandler, vueRouterErrorHandler } from '@/lib/logger';
import router from '@/router';
import store from '@/store';
import App from '@/App';

import '@/assets/scss/base.scss';

Vue.config.productionTip = false;
Vue.config.errorHandler = vueErrorHandler;
Vue.config.warnHandler = vueWarnHandler;

router.onReady(_.noop, vueRouterErrorHandler);
router.onError(vueRouterErrorHandler);

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
