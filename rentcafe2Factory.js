const https = require('https');
const mtz = require('moment-timezone');

module.exports.create = (community, url) => {
    return {
        query: () => {
            return new Promise((resolve, reject) => {
                const req = https.request(url, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        resolve(data.match(/<tr[^>]*class='AvailUnitRow'[^>]*>.*?<\/tr/g).map(r => {
                            const dateText = r.match(/SetTermsUrl\(.*?(?<moveIn>(\d{1,2}\/){2}\d{4}).*?\)/);
                            if (!dateText) {
                                return;
                            }
                            try {
                                return {
                                    community,
                                    area: Number.parseFloat(r.match(/data-label='Sq. Ft.'.*?(?<area>[0-9,]+).*?<\/td/).groups.area),
                                    rent: Number.parseFloat(r.match(/data-label='Rent'.*?(?<rent>[0-9,]+).*?<\/td/).groups.rent.replace(/,/g,'')),
                                    moveIn: mtz(dateText.groups.moveIn,'M/D/YYYY').format('YYYY-MM-DD')
                                }
                            } catch (e) {
                                reject (e)
                            }

                        }).filter(data => !!data));
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
