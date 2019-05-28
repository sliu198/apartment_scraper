const https = require('https');
const mtz = require('moment-timezone');

module.exports.create = (community, path) => {
    return {
        query: () => {
            return new Promise((resolve, reject) => {
                const req = https.request(`https://www.equityapartments.com/${path}`, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        resolve(data.match(/<ea5-unit(.|[\n\r])*?<\/ea5-unit/g).map(r => {
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
        }
    }
};
