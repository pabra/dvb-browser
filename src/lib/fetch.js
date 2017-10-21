// https://gist.github.com/kiliankoe/928c3ddf851fb47aa62bdc950ca5bb56
// https://github.com/kiliankoe/vvo/wiki/WebAPI

import { isObject, GK4toWGS84, parseMot } from '@/lib/utils';

function handleError(err) {
    return {
        ok: false,
        text: String(err),
        data: {},
        status: null,
    };
}

// const response = require('./response.json');
//
// async function fetchJson() {
//     return {
//         ok: true,
//         error: handleError(isObject('test')),
//         text: '',
//         data: response,
//         status: 200,
//     };
// }
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

    if (!res.ok || !res.data || !res.data.Status || !res.data.Points || !res.data.Status.Code || res.data.Status.Code.toLowerCase() !== 'ok') {
        throw new Error(`not ok result ${JSON.stringify(res)}`);
    } else {
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
                    id: p[0],
                    coords: GK4toWGS84(parseInt(p[4], 10), parseInt(p[5], 10)),
                };
            });
    }
}

export async function fetchDeparture(stationId, offset = 0, limit = 30) {
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
            mot: [
                'Tram',
                'CityBus',
                'IntercityBus',
                'SuburbanRailway',
                'Train',
                'Cableway',
                'Ferry',
                'HailedSharedTaxi',
            ],
        },
    });
    window.console.log('res', res);
    // debugger;

    if (!res.ok || !res.data || !res.data.Status) {
        throw new Error(`not ok result ${JSON.stringify(res)}`);
    } else {
        if (!res.data.Departures) res.data.Departures = [];

        return {
            city: res.data.Place,
            stop: res.data.Name,
            status: res.data.Status,
            departures: res.data.Departures.map((d) => {
                // window.console.log('d', d);
                const arrivalTime = new Date(parseInt(d.RealTime ? d.RealTime.match(/\d+/)[0] : d.ScheduledTime.match(/\d+/)[0], 10));
                const scheduledTime = new Date(parseInt(d.ScheduledTime.match(/\d+/)[0], 10));

                return {
                    arrivalTime,
                    scheduledTime,
                    line: d.LineName,
                    direction: d.Direction,
                    platform: d.Platform ?
                        { name: d.Platform.Name, type: d.Platform.Type } :
                        undefined,
                    arrivalTimeRelative: Math.round((arrivalTime - now) / 1000 / 60),
                    scheduledTimeRelative: Math.round((scheduledTime - now) / 1000 / 60),
                    delayTime: Math.round((arrivalTime - scheduledTime) / 1000 / 60),
                    state: d.State ? d.State : 'Unknown',
                    mode: parseMot(d.Mot),
                    diva: d.Diva ?
                        { number: parseInt(d.Diva.Number, 10), network: d.Diva.Network } :
                        undefined,
                };
            }),
        };
    }
}

// for debugging in browser
if (process.env && process.env.NODE_ENV === 'development') {
    window.fetchJson = fetchJson;
    window.fetchSations = fetchSations;
    window.fetchDeparture = fetchDeparture;
}
