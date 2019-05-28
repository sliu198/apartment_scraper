const https = require('https');
const mtz = require('moment-timezone');

const community = 'Soma Square';

module.exports.query = () => {
    return new Promise((resolve, reject) => {
        const req = https.request(`https://www.equityapartments.com/san-francisco-bay/soma/soma-square-apartments`, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(res.statusMessage));
            }
            let data = '';
            res.on('data', d => data += d);
            res.on('close', () => {
                resolve(data.match(/<ea5-unit(.|[\n\r])*?<\/ea5-unit/g).filter(r => /Newly Renovated with W\/D/.test(r)).map(r => {
                    return {
                        community,
                        rent: Number.parseFloat(
                            r.match(/<span class="pricing".*?(?<rent>[\d,]+)/).groups.rent.replace(/,/g,'')
                        ),
                        area: Number.parseFloat(
                            r.match(/<span.*?(?<area>[\d]+) sq.ft./).groups.area
                        ),
                        moveIn: mtz(r.match(/Available ([\d\/]+)/),'M/D/YYYY').format('YYYY-MM-DD')
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
