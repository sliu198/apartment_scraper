const https = require('https');
const mtz = require('moment-timezone');

module.exports.create = (community, path, beds) => {
    return {
        query: () => {
            return Promise.all([0,1,2].map(i => new Promise((resolve, reject) => {
                const req = https.request(`https://www.udr.com/${path}?beds=${i}`, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        const units = [];
                        JSON.parse(
                            data.match(/window[.]udr[.]jsonObjPropertyViewModel = (?<object>{.*})/).groups.object
                        ).floorPlans.forEach(fp => {
                            units.push(...fp.units.map(u => {
                                return {
                                    community,
                                    rent: u.rentMin,
                                    area: u.sqFt,
                                    moveIn: mtz.utc(Number.parseFloat(/\d+/.exec(u.availableDate)[0])).format('YYYY-MM-DD')
                                }
                            }))
                        });
                        resolve(units);
                    })
                });

                req.on('error', e => {
                    reject(e);
                });

                req.end();
            }))).then(data => Array.prototype.concat.apply([],data));
        }
    }
};
