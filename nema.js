const https = require('https');
const mtz = require('moment-timezone');

const community = 'NEMA';

module.exports.query = () => {
    return new Promise((resolve, reject) => {
        const req = https.request(`https://www.rentnema.com/availabilities`, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(res.statusMessage));
            }
            let data = '';
            res.on('data', d => data += d);
            res.on('close', () => {
                const units = [];
                resolve(data.match(/<div class="availabilities-list__item"[^>]*/g).map(m => {
                    return {
                        community,
                        rent: Number.parseFloat(m.match(/data-rent="(?<rent>[\d.]*)"/).groups.rent),
                        area: Number.parseFloat(m.match(/data-sqft="(?<area>[\d]*)"/).groups.area),
                        moveIn: mtz(m.match(/data-date="(?<date>[\d\/]*)"/).groups.date,'M/D/YYYY').format('YYYY-MM-DD')
                    }
                }));
            })
        });

        req.on('error', e => {
            reject(e);
        });

        req.end();
    });
};
