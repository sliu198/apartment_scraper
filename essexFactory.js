const https = require('https');
const mtz = require('moment-timezone');

module.exports.create = (community, code) => {
    return {
        query: () => {
            return new Promise((resolve, reject) => {
                const req = https.request(`https://www.essexapartmenthomes.com/api/get-available/${code}/${mtz().format('MM-DD-YYYY')}`, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        data = JSON.parse(data);
                        const units = [];
                        data.forEach(d => {
                            d.floorplans.forEach(fp => {
                                units.push(...fp.units.map(u=> {
                                    return {
                                        community,
                                        rent: u.rent,
                                        area: u.square_feet,
                                        moveIn: mtz(u.available_date,'M/D/YYYY').format('YYYY-MM-DD')
                                    }
                                }))
                            })
                        });
                        resolve(units);
                    })
                });

                req.on('error', e => {
                    reject(e);
                });

                req.end();
            });
        }
    }
};
