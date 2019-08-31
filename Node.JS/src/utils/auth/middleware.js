'use strict';

import { config } from '../../../config';
import { conn } from '../../../app';
import { errorMessages } from '../../models/error-model';
import jwt from 'jsonwebtoken';

function decodeJWT(req, res) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    token.startsWith('Bearer ')
        ? (token = token.slice(7, token.length))
        : token.startsWith('Bearer: ')
        ? (token = token.slice(8, token.length))
        : (token = token);

    const now = Date.now().valueOf() / 1000;

    if (token) {
        jwt.verify(
            token,
            config.tokenKey,
            { ignoreExpiration: true },
            (err, decoded) => {
                if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
                    if (isDeviceDesktop(req)) {
                        res.status(401).send(
                            'Token expired. Please, login again!'
                        );
                        return;
                    } else {
                        req.token = jwt.sign(
                            {
                                id: decoded.id,
                                name: decoded.name,
                                email: decoded.email,
                                default_site_id: decoded.default_site_id,
                            },
                            config.tokenKey,
                            { expiresIn: config.tokenExpiration }
                        );
                        jwt.verify(
                            req.token,
                            config.tokenKey,
                            (error, newDecodedJWT) => {
                                req.decodedJWT = newDecodedJWT;
                                res.header(
                                    'Authorization',
                                    `Bearer ${req.token}`
                                );
                            }
                        );
                    }
                } else if (err) {
                    res.status(403).send(
                        `Invalid token provided! Reason: ${err.message}`
                    );
                    return;
                } else {
                    req.token = token;
                    req.decodedJWT = decoded;
                }
            }
        );
    } else {
        res.status(403).send('No token provided!');
        return;
    }
}

const protectedUserRoute = (req, res, next) => {
    decodeJWT(req, res);
    next();
};

const protectedAdminRoute = (req, res, next) => {
    decodeJWT(req, res);
    if (req.decodedJWT && req.token) {
        conn.query(
            'SELECT id FROM user WHERE id = ? AND is_admin = 1',
            [req.decodedJWT.id],
            function(err, result) {
                if (err) {
                    console.log('Error: ', err);
                    res.send(err, null);
                    return;
                } else {
                    if (result.length === 1) {
                        next();
                    } else {
                        res.status(403).send(errorMessages.get(403));
                        return;
                    }
                }
            }
        );
    }
};

function getIdForRequest(req) {
    return typeof req.params.id !== 'undefined'
        ? req.params.id
        : req.decodedJWT.id;
}

function isDeviceDesktop(req) {
    return (
        req.device.type
            .trim()
            .toLowerCase()
            .indexOf('desktop') > -1 ||
        req.device.type
            .trim()
            .toLowerCase()
            .indexOf('tablet') > -1
    );
}

module.exports = {
    protectedUserRoute: protectedUserRoute,
    protectedAdminRoute: protectedAdminRoute,
    getIdForRequest: getIdForRequest,
};
