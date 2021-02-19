const axios = require('axios');
const logger = require('../logger');

const localLogger = logger('ulovdomov.cz');

let fullPrices: number[] = [];
let utilityPrices: number[] = [];
const searchURL = 'https://www.ulovdomov.cz/fe-api/find?offers_only=true';
const MAX_PAGE_NUMBER = 5;

const initialRequestBody = {
  "query": "Brno",
  "offer_type_id": "1",
  "dispositions": [
    "2",
    "3"
  ],
  "price_from": "",
  "price_to": "20000",
  "acreage_from": "",
  "acreage_to": "",
  "added_before": "",
  "furnishing": [],
  "conveniences": [],
  "is_price_commision_free": null,
  "sort_by": "",
  "page": 1,
  "limit": 100,
  "text": null,
  "zoom": null,
  "ne_lat": null,
  "ne_lng": null,
  "sw_lat": null,
  "sw_lng": null,
  "bounds": {
    "north_east": {
      "lng": 16.859207153320316,
      "lat": 49.27273288621373
    },
    "south_west": {
      "lng": 16.29684448242188,
      "lat": 49.1314084139986
    }
  },
  "banner_panel_width_type": 480,
  "average_first_contact_in_seconds": 840,
  "test_1": null,
  "test_2": null,
  "is_banner_premium_board": false,
  "is_banner_premium_board_brno": true
};

const finish = () => {
  localLogger('Finished processing Ulovdomov.cz data... Exiting.');
  return {
    name: 'ulovdomov.cz',
    fullPrices,
    utilityPrices
  };
};

const getOffers = (pageNumber = 1) => {
  if (pageNumber > MAX_PAGE_NUMBER) {
    return finish();
  }

  localLogger('Getting data of page: ', pageNumber);
  return axios.post(searchURL, Object.assign({}, initialRequestBody, { page: pageNumber }))
    .then(({ data }: { data: { offers: Array<{ price_monthly_fee: string, price_note: string, price_rental: string}> } }) => {
      // Stop recursion and return data
      if (data && data.offers && !data.offers.length) {
        return finish();
      }

      data.offers.forEach(offer => {
        let utilityPrice = 0;

        if (offer.price_monthly_fee) {
          utilityPrice = Number(offer.price_monthly_fee);
          utilityPrices = [...utilityPrices, utilityPrice];
        } else {
          // price_note will usually contain the required info in case price_monthly_fee is not specified
          if (offer.price_note) {
            const parsedValues = offer.price_note.replace(/[\.\s,]/g, '').match(/\d+/g);

            if (parsedValues && parsedValues.length > 0) {
              if (parsedValues.length === 1) {
                const parcedValue = Number(parsedValues[0]);
                // prevent false-positive values
                utilityPrice = parcedValue > 100 ? parcedValue : utilityPrice;
              } else {
                const filteredValue = parsedValues
                  .map((v: string) => parseInt(v, 10))
                  .filter((v: number) => v < 10000 && v > 500);
                if (filteredValue.length) {
                  utilityPrice = Math.min(...filteredValue);
                }
              }
              utilityPrices = [...utilityPrices, utilityPrice];
            }
          }
        }
        fullPrices = [...fullPrices, Number(offer.price_rental) + utilityPrice];
      });
      return getOffers(pageNumber + 1);
    });
}

export default getOffers;
