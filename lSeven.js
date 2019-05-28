const https = require('https');
const mtz = require('moment-timezone');

const community = 'L Seven';

module.exports.query = () => {
    return new Promise((resolve, reject) => {
        const req = https.request(`https://www.l7sf.com/san-francisco/l-seven/`, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(res.statusMessage));
            }
            let data = '';
            res.on('data', d => data += d);
            res.on('close', () => {
                resolve(data.match(/<li class="fp-group-item".*/g).map(m => {
                    return m.match(/https:\/\/www\.l7sf\.com\/\?module=check_availability[^"]*/) + '&action=view_unit_spaces'
                }));
            })
        });

        req.on('error', e => {
            reject(e);
        });

        req.end();
    }).then(links => {
        return Promise.all(links.map(l => new Promise((resolve,reject) => {
            const req = https.request(l, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(res.statusMessage));
                }
                let data = '';
                res.on('data', d => data += d);
                res.on('close', () => {
                    const units = [];
                    units.push(...data.match(/<div class="unit-row js-unit-row"(.|[\r\n])*?<div class="unit-col sqft"(.|[\r\n])*?<\/div>/g).map(u => {
                        return {
                            community,
                            moveIn: mtz(u.match(/data-movein="(?<movein>[\d\/]*)"/).groups.movein, 'MM/DD/YYYY').format('YYYY-MM-DD'),
                            rent: Number.parseFloat(u.match(/data-rent="(?<rent>[\d.]*)"/).groups.rent),
                            area: Number.parseFloat(u.match(/<div class="unit-col sqft"(.|[\r\n])*?(?<sqft>\d+)/).groups.sqft)
                        }
                    }));
                    resolve(units);
                })
            });

            req.on('error', e => {
                reject(e);
            });

            req.end();
        })));
    }).then(unitsArrayArray => {
        return Array.prototype.concat([],...unitsArrayArray);
    });
};
