const https = require('https');

const community = '33 Tehema';

module.exports.query = () => {
    return new Promise((resolve, reject) => {
        const req = https.request('https://sightmap.com/app/api/v1/4yjp2kmepxl/sightmaps/974', (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(res.statusMessage));
            }
            let data = '';
            res.on('data', d => data += d);
            res.on('close', () => {
                data = JSON.parse(data);
                resolve(data.data.units.map(d => {
                    return {
                        community,
                        area: d.area,
                        rent: d.price,
                        moveIn: d.available_on
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
