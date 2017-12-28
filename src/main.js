// import 'normalize-scss/sass/_normalize.scss';
import 'normalize-scss/sass/normalize/_import-now.scss';
import 'skeleton-scss/scss/skeleton.scss';
import 'material-design-icons/iconfont/material-icons.css';

import 'regenerator-runtime/runtime';

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
    return (
        typeof window.fetch === 'function' &&
        typeof window.Promise === 'function' &&
        typeof Object.assign === 'function' &&
        typeof Array.prototype.find === 'function' &&
        typeof Array.prototype.findIndex === 'function' &&
        typeof window.Set === 'function'
    );
}

function loadScript(done) {
    /* eslint-disable prefer-arrow-callback */
    import(/* webpackChunkName: "polyfills" */ '@/polyfills').then(function _fn() {
        done();
    }).catch(function _fn(error) {
        if (error) throw error;
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
