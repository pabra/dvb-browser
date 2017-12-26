import Logger from 'js-logger';
import qs from 'querystring';

export function stringifyObj(obj, indent = null) {
    let str;
    try {
        str = JSON.stringify(obj, null, indent);
    } catch (err) {
        str = String(obj).toString();
    }
    return str;
}

const isDev = process.env && process.env.NODE_ENV === 'development';
const qsData = qs.parse(window.location.search.replace(/^\?/, ''));
const logShow = !!qsData.logShow || !!qsData.logshow;
const logLevel = qsData.logLevel || qsData.loglevel;
let uncoughtErrorCounter = 0;
let bodyErrorEl = null;
let clearBtnEl = null;

if (logShow) {
    bodyErrorEl = document.createElement('pre');
    clearBtnEl = document.createElement('button');
    clearBtnEl.textContent = 'clear log';
    clearBtnEl.onclick = () => {
        clearBtnEl.style.display = 'none';
        bodyErrorEl.textContent = '';
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

const accessLogHandler = (messages, context) => {
    const data = qs.stringify({
        name: context.name,
        level: context.level.name,
        messages: stringifyObj(messages),
        time: new Date().toISOString(),
    });

    try {
        fetch(`/?${data}`, { method: 'GET' });
    } catch (err) {
        Logger.error('error while fetch', err);
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
window.onerror = (message, url, line, column, error) => {
    if (uncoughtErrorCounter > 10) return;

    uncoughtErrorCounter += 1;
    let stack = error instanceof Error && error.stack;
    if (!stack) ({ stack } = new Error());
    windowLogger.error({
        uncoughtErrorCounter,
        message,
        url,
        line,
        column,
        error,
        stack,
    });
};

const vueLogger = Logger.get('vue');
export const vueErrorHandler = (error, vm, info) => {
    if (uncoughtErrorCounter > 10) return;

    uncoughtErrorCounter += 1;
    vueLogger.error({
        uncoughtErrorCounter,
        error,
        vm,
        info,
    });
};

const vueRouterLogger = Logger.get('vue');
export const vueRouterErrorHandler = (error) => {
    if (uncoughtErrorCounter > 10) return;

    uncoughtErrorCounter += 1;
    let stack = error instanceof Error && error.stack;
    if (!stack) ({ stack } = new Error());
    vueRouterLogger.error({
        error,
        stack,
    });
};

export const vueWarnHandler = (message, vm, trace) => {
    vueLogger.warn({ message, vm, trace });
};

export default Logger;
