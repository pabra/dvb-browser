/* eslint no-use-before-define: ["error", { "functions": false }] */

import _ from 'lodash';

import Logger, { errorToObject } from '@/lib/logger';


const logger = Logger.get('location');

const rectVvo = {
    latitudeFrom: 50.70,
    latitudeTo: 51.60,
    longitudeFrom: 12.08,
    longitudeTo: 14.85,
};

const rectGermany = {
    latitudeFrom: 47.48,
    latitudeTo: 55.20,
    longitudeFrom: 5.30,
    longitudeTo: 15.34,
};

function positionToCoords(position) {
    const { latitude, longitude, accuracy } = position.coords;
    return { latitude, longitude, accuracy };
}

function getPosition(resolve, reject, options) {
    logger.debug('get position', options);
    navigator.geolocation.getCurrentPosition(
        pos => locationSuccess(resolve, pos),
        err => locationError(resolve, reject, options, err),
        options,
    );
}

function locationSuccess(resolve, position) {
    const posObj = positionToCoords(position);
    logger.debug('got position', posObj);
    resolve(posObj);
}

async function locationError(resolve, reject, options, err) {
    if (err.code === 1) {
        // PERMISSION_DENIED
        logger.debug('PERMISSION_DENIED', await errorToObject(err));
        reject(err);
    } else if (err.code === 2) {
        // POSITION_UNAVAILABLE
        logger.debug('POSITION_UNAVAILABLE', await errorToObject(err));
        reject(err);
    } else if (err.code === 3) {
        // TIMEOUT
        if (options.enableHighAccuracy === false) {
            logger.debug('enableHighAccuracy');
            options.enableHighAccuracy = true;
            getPosition(resolve, reject, options);
        } else {
            logger.debug('TIMEOUT', await errorToObject(err));
            reject(err);
        }
    } else {
        // unknown
        logger.error('unknown error', await errorToObject(err));
        reject(err);
    }
}

export function coordsToGeo(latitude, longitude, uncertainty = null) {
    if (!_.isnumber(latitude) || !_.isNumber(longitude)) return null;
    const precision = 4;
    const div = 10 ** precision;
    const rndLat = Math.round(latitude * div) / div;
    const rndLong = Math.round(longitude * div) / div;
    let geoStr = `geo:${rndLat},${rndLong}`;

    if (uncertainty !== null) geoStr += `;u=${Math.round(uncertainty)}`;
    return geoStr;
}

export function geoToCoords(geo) {
    if (!geo.startsWith('geo:')) return null;
    const geoSplit = geo.split(':', 2);
    if (geoSplit.length !== 2) return null;
    let latitude;
    let longitude;
    let uncertainty;
    geoSplit[1].split(';').forEach((val, idx) => {
        if (idx === 0) {
            // must be coordinates
            const coords = val.split(',');
            if (coords.length !== 2) return;
            const latFloat = parseFloat(coords[0]);
            const longFloat = parseFloat(coords[1]);
            latitude = Number.isFinite(latFloat) ? latFloat : null;
            longitude = Number.isFinite(longFloat) ? longFloat : null;
        } else {
            const valSplit = val.split('=', 2);
            if (valSplit.length !== 2) return;
            if (valSplit[0] === 'u') {
                const valFloat = parseFloat(valSplit[1]);
                uncertainty = Number.isFinite(valFloat) && valFloat > 0 ? valFloat : null;
            }
        }
    });
    if (!latitude || !longitude) return null;
    return { latitude, longitude, uncertainty };
}

export function geolocationAvailable() {
    return 'geolocation' in navigator;
}

export function Position() {
    const options = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
    };

    return {
        get() {
            window.console.log('this:', this); // TODO: remove DEBUG
            return new Promise((resolve, reject) => {
                getPosition(resolve, reject, options);
            });
        },
    };
}

function withinRect(latitude, longitude, rect) {
    if (
        !rect.latitudeFrom ||
        !rect.latitudeTo ||
        !rect.longitudeFrom ||
        !rect.longitudeTo ||
        rect.latitudeFrom > rect.latitudeTo ||
        rect.longitudeFrom > rect.longitudeTo
    ) {
        return null;
    }
    return (
        latitude >= rect.latitudeFrom &&
        latitude <= rect.latitudeTo &&
        longitude >= rect.longitudeFrom &&
        longitude <= rect.longitudeTo
    );
}

export function withinVvo(latitude, longitude) {
    return withinRect(latitude, longitude, rectVvo);
}

export function withinGermany(latitude, longitude) {
    return withinRect(latitude, longitude, rectGermany);
}
