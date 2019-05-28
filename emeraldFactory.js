const https = require('https');
const mtz = require('moment-timezone');

module.exports.create = (community, url) => {
    return {
        query: () => {
            return new Promise((resolve, reject) => {
                const req = https.request(`${url}/CmsSiteManager/callback.aspx?act=Proxy/GetUnits&available=true`, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        try {
                            data = JSON.parse(data);
                            resolve(data.units.map(u => {
                                return {
                                    community,
                                    rent: u.rent,
                                    area: u.squareFeet,
                                    moveIn: mtz.utc(/\d{4}-\d{2}-\d{2}/.exec(u.internalAvailableDate)[0]).format('YYYY-MM-DD')
                                }
                            }));
                        } catch (e) {
                            reject(e);
                        }
                    });
                });

                req.on('error', e => {
                    reject(e);
                });

                req.end();
            });
        }
    }
};
