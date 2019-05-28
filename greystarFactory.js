"use strict";
const https = require('https');
const moment = require('moment-timezone');

const postData = 'action=floorplans';

module.exports.create = (community, url) => {
    return {
        query: () => {
            return new Promise((resolve, reject) => {
                const req = https.request(`${url}/floorplans/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                }, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        data = JSON.parse(data);
                        data = Object.values(data);
                        data = Array.prototype.concat.apply([], data.filter(d => !!d.availability).map(d => {
                            return d.availability.map(a => {
                                return {
                                    community,
                                    rent: d.min_rent,
                                    area: d.sq_ft,
                                    moveIn: moment.utc(/\d{4}-\d{2}-\d{2}/.exec(a)[0]).format('YYYY-MM-DD')
                                }
                            })
                        }));
                        resolve(data);
                    })
                });

                req.on('error', e => {
                    reject(e);
                });

                req.write(postData);
                req.end();
            });
        }
    }
};