import proj4 from 'proj4';

/**
 * isObject - test if argument is an Object
 *
 * @param {Object} obj thing to be tested
 *
 * @return {Boolean}
 */
export function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}


/**
 * isArray - test if argument is an Array
 *
 * @param {Array} arr thing to be tested
 *
 * @return {Boolean}
 */
export function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Object]';
}


proj4.defs('GK4', '+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m');

export function GK4toWGS84(lat, lng) {
    return proj4('GK4', 'WGS84', [lng, lat]).reverse();
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

export function getJsonStorage(storageKey, defaultValue = null) {
    const value = localStorage.getItem(storageKey);
    if (value === null) return defaultValue;

    let jsonValue;
    try {
        jsonValue = JSON.parse(value);
        return jsonValue;
    } catch (err) {
        return defaultValue;
    }
}
