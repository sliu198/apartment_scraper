const https = require('https');
const mtz = require('moment-timezone');

module.exports.create = (community, url) => {
    return {
        query: () => {
            return new Promise((resolve, reject) => {
                const req = https.request(url, {
                    headers: {
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
                    }
                },(res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        resolve(data.match(/<tr[^>]*class='AvailUnitRow'[^>]*>.*/g).map(r => {
                            const dateText = r.match(/data-label='Date Available'.*?(?<moveIn>(\d{1,2}\/){2}\d{4}).*?<\/td/);
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
                                reject(e)
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
