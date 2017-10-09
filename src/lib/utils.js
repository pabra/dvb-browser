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


export const modes = {
    tram: {
        title: 'Straßenbahn',
        name: 'tram',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-tram.svg',
    },
    citybus: {
        title: 'Stadtbus',
        name: 'citybus',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
    },
    intercitybus: {
        title: 'Regionalbus',
        name: 'intercitybus',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-bus.svg',
    },
    suburbanrailway: {
        title: 'S-Bahn',
        name: 'SuburbanRailway',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-metropolitan.svg',
    },
    train: {
        title: 'Zug',
        name: 'train',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-train.svg',
    },
    cableway: {
        title: 'Seil-/Schwebebahn',
        name: 'cableway',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-lift.svg',
    },
    ferry: {
        title: 'Fähre',
        name: 'ferry',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-ferry.svg',
    },
    hailedsharedtaxi: {
        title: 'Anrufsammeltaxi (AST)/ Rufbus',
        name: 'hailedsharedtaxi',
        icon_url: 'https://www.dvb.de/assets/img/trans-icon/transport-alita.svg',
    },
};

function between(val, min, max) {
    return val >= min && val <= max;
}

function matches(val, regex) {
    const match = val.match(regex);
    return match !== undefined && matches.length > 0;
}

export function parseMot(name) {
    return modes[name.toLowerCase()];
}

export function parseMode(id) {
    const intId = parseInt(id, 10);
    if (intId !== undefined) {
        if (between(intId, 0, 59)) return modes.tram;
        if (between(intId, 60, 99)) return modes.citybus;
        if (between(intId, 100, 1000)) return modes.intercitybus;
    }
    if (id === 'SWB' || id === 'STB') return modes.cableway;

    if (matches(id, /^E\d+/)) {
        const match = id.match(/^E(\d+)/);
        if (match && parseInt(match[1], 10) <= 59) return modes.tram;
        return modes.citybus;
    }

    if (matches(id, /^\D$|^\D\/\D$/)) return modes.intercitybus;
    if (matches(id, /^F/)) return modes.ferry;
    if (matches(id, /^RE|^IC|^TL|^RB|^SB|^SE|^U\d/)) return modes.train;
    if (matches(id, /^S/)) return modes.suburbanrailway;
    if (matches(id, /alita/)) return modes.hailedsharedtaxi;

    return undefined;
}
