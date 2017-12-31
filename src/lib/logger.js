import Logger from 'js-logger';
import qs from 'querystring';
import _ from 'lodash';
import smst from 'sourcemapped-stacktrace';
import packageData from '@/../package.json';

const isDev = process.env && process.env.NODE_ENV === 'development';
const qsData = qs.parse(window.location.search.replace(/^\?/, ''));
const logShow = !!qsData.logShow || !!qsData.logshow;
const logLevel = qsData.logLevel || qsData.loglevel;
let uncoughtErrorCounter = 0;
let bodyErrorEl = null;
let clearBtnEl = null;

export function stringifyObj(obj, indent = null) {
    let str;
    try {
        str = JSON.stringify(obj, null, indent);
    } catch (err) {
        str = String(obj).toString();
    }
    return str;
}

async function errorToObject(error) {
    const errorObj = {
        errorMessage: _.get(error, 'message'),
        errorName: _.get(error, 'name'),
        // errorStack: _.get(error, 'stack'),
    };
    let errorStackStr = _.get(error, 'stack');

    if (!errorStackStr) {
        errorStackStr = new Error().stack;
        errorObj.errorStackForced = true;
    }

    errorObj.errorStack = errorStackStr.split('\n').map(line => line.trim());

    if (!isDev) {
        errorObj.errorSourceMappedStack = await new Promise((resolve) => {
            const stack = errorStackStr;
            smst.mapStackTrace(stack, mappedStack => resolve(mappedStack.map(line => line.trim())));
        });
    }

    return errorObj;
}

if (logShow) {
    bodyErrorEl = document.createElement('pre');
    clearBtnEl = document.createElement('button');
    clearBtnEl.textContent = 'clear log';
    clearBtnEl.onclick = () => {
        clearBtnEl.style.display = 'none';
        bodyErrorEl.textContent = '';
        document.body.style.backgroundColor = '';
    };
    bodyErrorEl.id = 'error';
    document.body.appendChild(clearBtnEl);
    document.body.appendChild(bodyErrorEl);
}

const consoleHandler = Logger.createDefaultHandler({
    formatter: (messages, context) => {
        if (context.name) messages.unshift(`[${context.name}]`);
        messages.unshift(new Date().toISOString());
    },
});

const htmlHandler = (messages, context) => {
    if (!logShow || !bodyErrorEl) return;
    let newContent = '';
    if (context.name) newContent += `[${context.name}] `;
    newContent += `${context.level.name}: ${stringifyObj(messages, 4)}\n`;
    bodyErrorEl.textContent += newContent;
    if (clearBtnEl.style.display === 'none') clearBtnEl.style.display = null;
    if (context.level.name === 'ERROR') document.body.style.backgroundColor = '#fcc';
};

const accessLogLogger = Logger.get('accessLogHandler');
const accessLogHandler = async (messages, context) => {
    const data = qs.stringify({
        name: context.name,
        level: context.level.name,
        messages: stringifyObj(messages),
        time: new Date().toISOString(),
        version: packageData.version,
    });

    try {
        fetch(`/?${data}`, { method: 'GET' });
    } catch (error) {
        if (uncoughtErrorCounter > 10) return;

        uncoughtErrorCounter += 1;
        accessLogLogger.error(await errorToObject(error));
    }
};

const levelToSet = (
    (logLevel && Logger[logLevel.toUpperCase()]) ||
    (isDev && Logger.DEBUG) ||
    Logger.ERROR
);

Logger.setLevel(levelToSet);
Logger.setHandler((messages, context) => {
    consoleHandler(messages, context);
    if (logShow) htmlHandler(messages, context);
    if (!isDev) accessLogHandler(messages, context);
});

if (logLevel && !Logger[logLevel.toUpperCase()]) {
    Logger.debug('no such log level', logLevel);
}
Logger.debug('logger set to level', levelToSet.name);

const windowLogger = Logger.get('window');
window.onerror = async (message, url, line, column, error) => {
    if (uncoughtErrorCounter > 10) return;

    uncoughtErrorCounter += 1;
    windowLogger.error({
        ...await errorToObject(error),
        uncoughtErrorCounter,
        message,
        url,
        line,
        column,
    });
};

const vueLogger = Logger.get('vue');
export const vueErrorHandler = async (error, vm, info) => {
    if (uncoughtErrorCounter > 10) return;

    uncoughtErrorCounter += 1;
    vueLogger.error({
        ...await errorToObject(error),
        uncoughtErrorCounter,
        info,
    });
};

export const vueWarnHandler = (message, vm, trace) => {
    vueLogger.warn({ message, trace });
};

const vueRouterLogger = Logger.get('vue-router');
export const vueRouterErrorHandler = async (error) => {
    if (uncoughtErrorCounter > 10) return;

    uncoughtErrorCounter += 1;
    vueRouterLogger.error(await errorToObject(error));
};

export default Logger;
