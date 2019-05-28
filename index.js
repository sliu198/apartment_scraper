const csv = require('csv');

const greystar = require('./greystarFactory');
const olume = greystar.create('Olume', 'https://liveolume.com');
const argenta = greystar.create('Argenta', 'https://argentaliving.com');

const tehema = require('./33Tehema');
const nema = require('./nema');
const lSeven = require('./lSeven');

const avalon = require('./avalonFactory');
const ava55Ninth = avalon.create('Ava 55 Ninth', 'CA100');
const avalonDogpatch = avalon.create('Avalon Dogpatch', 'CA117');
const avalonMissionBay = avalon.create('Avalon Mission Bay', 'CA067');

const rentcafe = require('./rentcafeFactory');
const potreroLaunch = rentcafe.create('Potrero Launch', 'https://www.potrerolaunch.com/availableunits.aspx');
const arcLight = rentcafe.create('Arc Light', 'https://www.arclightco.com/availableunits.aspx');
const solaire = rentcafe.create('Solaire', 'https://solairesf.securecafe.com/onlineleasing/solaire-0/availableunits.aspx');
const windsorDogpatch = rentcafe.create('Windsor Dogpatch', 'https://www.windsoratdogpatch.com/availableunits.aspx');
const omDogpatch = rentcafe.create('O&M Dogpatch', 'https://oandmsf.securecafe.com/onlineleasing/o-m-dogpatch/availableunits.aspx');
const missionBayWindsor = rentcafe.create('Mission Bay by Windsor', 'https://www.missionbaybywindsor.com/availableunits.aspx');
const theGantry = rentcafe.create('The Gantry', 'https://www.thegantryapts.com/availableunits.aspx');
const stevensonLofts = rentcafe.create('Stevenson Lofts', 'https://www.stevensonloftssf.com/availableunits.aspx');

const rentcafe2 = require('./rentcafe2Factory');
const strataMissionBay = rentcafe2.create('Strata Mission Bay', 'https://www.stratasf.com/availableunits.aspx');

const rentcafe3 = require('./rentcafe3Factory');
const theLanding = rentcafe3.create('The Landing', 'https://thelandingsf.securecafe.com/onlineleasing/the-landing-5/oleapplication.aspx?stepname=Apartments');

const equity = require('./equityFactory');
const brannan = equity.create('855 Brannan', 'san-francisco/soma/855-brannan-apartments');
const fremont340 = equity.create('340 Fremont', 'san-francisco/rincon-hill/340-fremont-apartments');
const oneHenryAdams = equity.create('One Henry Adams', 'san-francisco/design-district/one-henry-adams-apartments');

const somaSquare = require('./somaSquare');

const udr = require('./udrFactory');
const edgewater = udr.create('Edgewater', 'san-francisco-bay-area-apartments/san-francisco/edgewater/apartments-pricing/',[0,1,2]);
const fremont399 = udr.create('399 Fremont', 'san-francisco-bay-area-apartments/san-francisco/399-fremont/apartments-pricing/',[0,1,2,3]);
const channelMissionBay = udr.create('Channel Mission Bay', 'san-francisco-bay-area-apartments/san-francisco/channel-mission-bay/apartments-pricing/',[0,1,2]);
const beale = udr.create('388 Beale', 'san-francisco-bay-area-apartments/san-francisco/388-beale/apartments-pricing/',[1,2,3]);

const emerald = require('./emeraldFactory');
const rinconGreen = emerald.create('Rincon Green', 'https://www.rincongreen.com');
const soma788 = emerald.create('Soma 788', 'https://somaat788.com');

const essex = require('./essexFactory');
const mb360 = essex.create('MB360','582');

(async () => {
    const communities = [
        olume, argenta,
        tehema, nema, lSeven,
        ava55Ninth, avalonDogpatch, avalonMissionBay,
        potreroLaunch, arcLight, solaire, windsorDogpatch, omDogpatch, missionBayWindsor, theGantry, stevensonLofts,
        strataMissionBay,
        theLanding,
        brannan, fremont340, oneHenryAdams,
        somaSquare,
        edgewater, fremont399, channelMissionBay, beale,
        rinconGreen, soma788,
        mb360
    ].map((promise, i) => promise.query().catch((e) => {
        console.error(e);
        return [{
            community: i
        }]
    }));
    const results = [];
    const promisesResults = await Promise.all(communities);
    for (let i = 0; i < promisesResults.length; i++) {
        results.push(...promisesResults[i]);
    }
    csv.stringify(results.filter(d => d.rent < 5000 && d.area >= 500 && d.moveIn < '2019-08-01' || !d.moveIn),
        {header: true, columns: ['community','moveIn','area','rent']},
        (err, data) => {
            if (err) {
                console.error(err)
            }
            console.log(data);
        });
})();