// import 'normalize-scss/sass/_normalize.scss';
import 'normalize-scss/sass/normalize/_import-now.scss';
import 'skeleton-scss/scss/skeleton.scss';
import 'material-design-icons/iconfont/material-icons.css';

// import 'whatwg-fetch';
// import 'babel-polyfill';
// import 'regenerator-runtime';
import 'regenerator-runtime/runtime';
// import 'core-js';
// // import 'babel-runtime';
// import 'babel-core/register';
// import 'babel-runtime/regenerator';

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

function browserSupportsAllFeatures() {
    // return window.Promise && window.fetch && window.Symbol;
    // return window.fetch;
    return false;
}

function loadScript(done) {
    import(/* webpackChunkName: "polyfills" */ '@/polyfills').then(() => {
        done();
    }).catch((error) => {
        throw error;
    });
}

function main(err) {
    // Initiate all other code paths.
    // If there's an error loading the polyfills, handle that
    // case gracefully and track that the error occurred.
    if (err) throw err;

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
}

// window.fetch = undefined;
// eslint-disable-next-line
// debugger;
if (browserSupportsAllFeatures()) {
    // Browsers that support all features run `main()` immediately.
    main();
} else {
    // All other browsers loads polyfills and then run `main()`.
    loadScript(main);
}
