const axios = require('axios');
const logger = require('../logger');

const localLogger = logger('sreality.cz');

let fullPrices: number[] = [];
let utilityPrices: number[] = [];
const searchURL = 'https://www.sreality.cz/api/en/v2/estates?category_main_cb=1&category_sub_cb=2|3&category_type_cb=2&czk_price_summary_order2=0|20000&locality_district_id=72&locality_region_id=14&per_page=100&pois_in_place=1|2|10|9|11|5|3|4&pois_in_place_distance=2&tms=1613334365739&page=';
const MAX_PAGE_NUMBER = 5;

const finish = () => {
  localLogger('Finished processing Sreality.cz data... Exiting.');
  return {
    name: 'sreality.cz',
    fullPrices,
    utilityPrices 
  };
}

const getOffers = (pageNumber = 1) => {
  if (pageNumber > MAX_PAGE_NUMBER) {
    return finish();
  }

  localLogger('Getting data of page: ', pageNumber);
  return axios.get(`${searchURL}${pageNumber}`)
    .then(({ data } : { data: { _embedded: { estates: Array<{ price: string }> }} }) => {
      // Stop recursion and return data
      if (data && data._embedded && data._embedded.estates && !data._embedded.estates.length) {
        return finish();
      } 

      data._embedded.estates.forEach(offer => {
        let utilityPrice = 0;

        // if (offer.price_monthly_fee) {
        //   utilityPrice = Number(offer.price_monthly_fee);
        //   utilityPrices = [...utilityPrices, utilityPrice];
        // } else {
        //   // price_note will usually contain the required info in case price_monthly_fee is not specified
        //   if (offer.price_note) {
        //     const parsedValues = offer.price_note.replace(/[\.\s,]/g, '').match(/\d+/g);

        //     if (parsedValues && parsedValues.length > 0) {
        //       if (parsedValues.length === 1) {
        //         const parcedValue = Number(parsedValues[0]);
        //         // prevent false-positive values
        //         utilityPrice = parcedValue > 100 ? parcedValue : utilityPrice;
        //       } else {
        //         const filteredValue = parsedValues
        //           .map(v => parseInt(v, 10))
        //           .filter(v => v < 10000 && v > 500);
        //         if (filteredValue.length) {
        //           utilityPrice = Math.min(...filteredValue);
        //         }
        //       }
        //       utilityPrices = [...utilityPrices, utilityPrice];
        //     }
        //   }
        // }
        fullPrices = [...fullPrices, Number(offer.price) + utilityPrice];
        // if (
        //   !Number.isFinite(Number(offer.price_rental) + utilityPrice) ||
        //   (Number(offer.price_rental) + utilityPrice) === null
        // ) {
        //   localLogger(offer);
        //   console.log('utilityPrice', utilityPrice);
        //   console.log('rentalPrice', Number(offer.price_rental));
        // }
      });
      return getOffers(pageNumber + 1);
    });
}

export default getOffers;

// (async () => {
//   await getOffers();
//   localLogger('fullprices 3 pages', JSON.stringify(fullPrices));
//   console.log(fullPrices.reduce((acc, next) => {
//     return acc + BigInt(next);
//   }, BigInt(0)) / BigInt(fullPrices.length));
// })();
