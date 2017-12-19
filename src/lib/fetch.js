// https://gist.github.com/kiliankoe/928c3ddf851fb47aa62bdc950ca5bb56
// https://github.com/kiliankoe/vvo/wiki/WebAPI

import _ from 'lodash';
import { isObject, GK4toWGS84, parseMot } from '@/lib/utils';
import store from '@/store';

function handleError(err) {
    return {
        ok: false,
        text: String(err),
        data: {},
        status: null,
    };
}

function isApiResponseOk(res) {
    return [
        _.isPlainObject(res),
        res.ok,
        _.get(res, 'data.Status.Code', '').toLowerCase() === 'ok',
    ].every(entry => !!entry);
}

function parseApiDate(string) {
    if (!_.isString(string)) return string;

    // for departures on the same day: /Date(1513736087770+0100)/
    // departures on the next day: /Date(1513751520000-0000)/
    const match = string.match(/Date\((\d{13})[+-]\d{4}\)/);
    if (!match) throw TypeError(`unable to parse Date in "${string}"`);

    return new Date(parseInt(match[1], 10));
}

async function fetchJson(options) {
    const defaults = {
        url: null,
        method: 'GET',
        username: null,
        password: null,
        data: null,
        type: 'application/json',
    };

    const opts = Object.assign({}, defaults, options);

    if (!opts.url) return handleError(new Error('url required'), opts);

    const fetchArgs = {
        method: opts.method,
        headers: {},
    };

    if (opts.username && opts.password) {
        fetchArgs.headers.Authorization = `BASIC ${btoa(`${opts.username}:${opts.password}`)}`;
        fetchArgs.credentials = 'include';
    }

    if (opts.data) {
        fetchArgs.headers['Content-Type'] = `${opts.type}; charset=utf-8`;
        fetchArgs.body = isObject(opts.data) ? JSON.stringify(opts.data) : opts.data;
    }

    let response;
    try {
        response = await fetch(opts.url, fetchArgs);
    } catch (err) {
        return handleError(err, opts);
    }

    let json;
    try {
        json = await response.json();
    } catch (err) {
        return handleError(err, opts);
    }

    return {
        ok: response.status === 200,
        text: '',
        data: json,
        status: response.status,
    };
}

export async function fetchSations(query) {
    const res = await fetchJson({
        url: 'https://webapi.vvo-online.de/tr/pointfinder',
        method: 'POST',
        data: {
            query,
            stopsOnly: true,
            limit: 5,
            assignedStops: true,
            dvb: true,
        },
    });

    if (!isApiResponseOk(res) || !res.data.Points) {
        throw new Error(`not ok result ${JSON.stringify(res)}`);
    }

    return res.data.Points
        .map(p => p.split('|'))
        .filter(p => p[3])
        // remove duplicates
        .filter((point, idx, arr) => idx === arr.findIndex(p => p[0] === point[0]))
        .map((p) => {
            const city = p[2] === '' ? 'Dresden' : p[2];
            return {
                city,
                stop: p[3],
                id: parseInt(p[0], 10),
                coords: GK4toWGS84(parseInt(p[4], 10), parseInt(p[5], 10)),
            };
        });
}

export async function fetchDeparture(stationId, offset = 0, limit = 30) {
    if (store.getters.chosenMots.length === 0) return {};
    const now = new Date();
    const time = new Date(now.getTime() + (offset * 60 * 1000)).toISOString();
    const res = await fetchJson({
        url: 'https://webapi.vvo-online.de/dm',
        method: 'POST',
        data: {
            time,
            limit,
            stopid: String(stationId),
            isarrival: false,
            shorttermchanges: true,
            mentzonly: false,
            mot: store.getters.chosenMots,
        },
    });
    window.console.log('res', res);

    if (!isApiResponseOk(res)) throw new Error(`not ok result ${JSON.stringify(res)}`);

    if (!res.data.Departures) res.data.Departures = [];

    return {
        city: res.data.Place,
        stop: res.data.Name,
        status: res.data.Status,
        departures: res.data.Departures.map((d) => {
            // window.console.log('d', d);
            const scheduledTime = parseApiDate(d.ScheduledTime);
            const arrivalTime = d.RealTime ? parseApiDate(d.RealTime) : scheduledTime;

            return {
                id: parseInt(d.Id, 10),
                arrivalTime,
                scheduledTime,
                line: d.LineName,
                direction: d.Direction,
                platform: d.Platform ?
                    { name: d.Platform.Name, type: d.Platform.Type } :
                    {},
                arrivalTimeRelative: Math.round((arrivalTime - now) / 1000 / 60),
                scheduledTimeRelative: Math.round((scheduledTime - now) / 1000 / 60),
                delayTime: Math.round((arrivalTime - scheduledTime) / 1000 / 60),
                state: d.State ? d.State : 'Unknown',
                mode: parseMot(d.Mot),
                diva: d.Diva ?
                    { number: parseInt(d.Diva.Number, 10), network: d.Diva.Network } :
                    {},
                routeChanges: d.RouteChanges ?
                    d.RouteChanges.map(x => parseInt(x, 10)) :
                    [],
            };
        }),
    };
}

export async function fetchRouteChanges() {
    const res = await fetchJson({
        url: 'https://webapi.vvo-online.de/rc',
        method: 'POST',
        data: { shortterm: true },
    });
    window.console.log('res', res);

    if (!isApiResponseOk(res)) throw new Error(`not ok result ${JSON.stringify(res)}`);

    return res.data.Changes.reduce((indexedChanges, change) => {
        /* eslint-disable no-param-reassign */
        const cleanChange = {
            id: parseInt(change.Id, 10),
            lines: change.LineIds.map(line => parseInt(line, 10)),
            title: change.Title,
            description: change.Description,
            type: change.Type,
            published: parseApiDate(change.PublishDate),
            valid: change.ValidityPeriods ?
                change.ValidityPeriods.map(p => ({
                    begin: parseApiDate(p.Begin),
                    end: parseApiDate(p.End),
                })) :
                [],
        };

        indexedChanges[cleanChange.id] = cleanChange;

        return indexedChanges;
    }, {});
}

// for debugging in browser
if (process.env && process.env.NODE_ENV === 'development') {
    window.fetchJson = fetchJson;
    window.fetchSations = fetchSations;
    window.fetchDeparture = fetchDeparture;
    window.fetchRouteChanges = fetchRouteChanges;
}
