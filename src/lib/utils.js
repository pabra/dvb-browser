import _ from 'lodash';
import proj4 from 'proj4';

proj4.defs('GK4', '+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m');

export function GK4toWGS84(lat, lng) {
    return proj4('GK4', 'WGS84', [lng, lat]).reverse();
}

export function WGS84toGK4(lat, lng) {
    return proj4('WGS84', 'GK4', [lng, lat]);
}

export const vehicles = {
    tram: {
        title: 'Straßenbahn',
        name: 'tram',
        mot: 'Tram',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg',
        ligature: 'tram',
    },
    citybus: {
        title: 'Stadtbus',
        name: 'citybus',
        mot: 'CityBus',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
        ligature: 'directions_bus',
    },
    intercitybus: {
        title: 'Regionalbus',
        name: 'intercitybus',
        mot: 'IntercityBus',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
        ligature: 'directions_bus',
    },
    plusbus: {
        title: 'PlusBus',
        name: 'plusbus',
        mot: 'PlusBus',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
        ligature: 'directions_bus',
    },
    suburbanrailway: {
        title: 'S-Bahn',
        name: 'suburbanrailway',
        mot: 'SuburbanRailway',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg',
        ligature: 'directions_railway',
    },
    train: {
        title: 'Zug',
        name: 'train',
        mot: 'Train',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-train.svg',
        ligature: 'train',
    },
    cableway: {
        title: 'Seil-/Schwebebahn',
        name: 'cableway',
        mot: 'Cableway',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-lift.svg',
        ligature: 'subway',
    },
    ferry: {
        title: 'Fähre',
        name: 'ferry',
        mot: 'Ferry',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-ferry.svg',
        ligature: 'directions_boat',
    },
    hailedsharedtaxi: {
        title: 'Anrufsammeltaxi (AST)/ Rufbus',
        name: 'hailedsharedtaxi',
        mot: 'HailedSharedTaxi',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-alita.svg',
        ligature: 'local_taxi',
    },
};

export const vehicleOrder = [
    'tram',
    'citybus',
    'intercitybus',
    'suburbanrailway',
    'train',
    'cableway',
    'ferry',
    'hailedsharedtaxi',
];

function between(val, min, max) {
    return val >= min && val <= max;
}

function matches(val, regex) {
    const match = val.match(regex);
    return match !== undefined && matches.length > 0;
}

export function parseMot(name) {
    return vehicles[name.toLowerCase()];
}

export function parseMode(id) {
    const intId = parseInt(id, 10);
    if (intId !== undefined) {
        if (between(intId, 0, 59)) return vehicles.tram;
        if (between(intId, 60, 99)) return vehicles.citybus;
        if (between(intId, 100, 1000)) return vehicles.intercitybus;
    }
    if (id === 'SWB' || id === 'STB') return vehicles.cableway;

    if (matches(id, /^E\d+/)) {
        const match = id.match(/^E(\d+)/);
        if (match && parseInt(match[1], 10) <= 59) return vehicles.tram;
        return vehicles.citybus;
    }

    if (matches(id, /^\D$|^\D\/\D$/)) return vehicles.intercitybus;
    if (matches(id, /^F/)) return vehicles.ferry;
    if (matches(id, /^RE|^IC|^TL|^RB|^SB|^SE|^U\d/)) return vehicles.train;
    if (matches(id, /^S/)) return vehicles.suburbanrailway;
    if (matches(id, /alita/)) return vehicles.hailedsharedtaxi;

    return undefined;
}

function testLocalStorageAvailable() {
    const storage = window.localStorage;
    const x = '__storage_test__';
    try {
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

// localStorage might not be available eg. android browser runs in private mode
export const localStorageAvailable = testLocalStorageAvailable();

export function getJsonStorage(storageKey, defaultValue = null) {
    const value = localStorageAvailable ? localStorage.getItem(storageKey) : null;
    if (value === null) return defaultValue;

    let jsonValue;
    try {
        jsonValue = JSON.parse(value);
        return jsonValue;
    } catch (err) {
        return defaultValue;
    }
}

/**
 * tryInt - Description
 *
 * @param {any} value the value to test if it's an integer
 *
 * @return {any} if value look like an integer, it's return as an int or value otherwise
 */
export function tryInt(value) {
    const int = parseInt(value, 10);
    return String(int) === String(value) ? int : value;
}

/**
 * ensureInt - Description
 *
 * @param {type}   value            the value to ensure to be an int
 * @param {number} [defaultValue=0] this will be returned if value does not look like an int
 *
 * @return {type} Description
 */
export function ensureInt(value, defaultValue = 0) {
    const int = tryInt(value);
    return _.isInteger(int) ? int : defaultValue;
}

export function toLocaleDateTime(date) {
    return date.toLocaleString(
        'de-DE',
        {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
        },
    );
}

export function stationName(obj) {
    let str = obj.stop;
    if (obj.city !== 'Dresden') str += ` in ${obj.city}`;
    return str;
}
