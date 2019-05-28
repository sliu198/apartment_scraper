const https = require('https');
const mtz = require('moment-timezone');

module.exports.create = (community, code) => {
    return {
        query: () => {
            return new Promise((resolve, reject) => {
                const req = https.request(`https://api.avalonbay.com/json/reply/ApartmentSearch?communityCode=${code}`, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(res.statusMessage));
                    }
                    let data = '';
                    res.on('data', d => data += d);
                    res.on('close', () => {
                        data = JSON.parse(data);
                        const apartments = [];
                        data.results.availableFloorPlanTypes.forEach(afpt => {
                            afpt.availableFloorPlans.forEach(afp => {
                                afp.finishPackages.forEach(fp => {
                                    apartments.push(...fp.apartments.map(a => {
                                        return {
                                            community,
                                            rent: a.pricing.effectiveRent,
                                            area: a.apartmentSize,
                                            moveIn: mtz.utc(Number.parseFloat(/\d+/.exec(a.pricing.availableDate)[0])).format('YYYY-MM-DD')
                                        };
                                    }));
                                })
                            })
                        });
                        resolve(apartments);
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
