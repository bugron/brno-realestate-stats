const puppeteer = require('puppeteer');
const logger = require('../logger');

const localLogger = logger('bezrealitky.com');
const sleep = (timeout = 1000) => new Promise(r => setTimeout(() => r(), timeout));

const mockData = [
  "CZK 11,000 + CZK 2,200",
  "CZK 9,500 + CZK 2,000",
  "CZK 10,000 + CZK 1,500",
  "CZK 12,500 + CZK 2,000",
  "CZK 9,000 + CZK 2,900",
  "CZK 12,000 + CZK 1,300",
  "CZK 12,375 + CZK 4,125",
  "",
  "CZK 10,500 + CZK 2,000",
  "CZK 10,500 + CZK 2,500",
  "CZK 11,000 + CZK 1,000",
  "CZK 11,800 + CZK 3,000",
  "CZK 15,500 + CZK 2,500",
  "CZK 11,000 + CZK 1,500",
  "CZK 13,800 + CZK 1,700",
  "CZK 12,375 + CZK 4,125",
  "",
  "CZK 11,800 + CZK 2,200",
  "CZK 10,500 + CZK 1,600",
  "CZK 8,000 + CZK 1,700",
  "CZK 10,500 + CZK 1,800",
  "CZK 14,000 + CZK 3,000",
  "CZK 9,500 + CZK 1,400",
  "CZK 10,500 + CZK 1,400",
  "CZK 13,500 + CZK 3,000",
  "CZK 13,990 + CZK 2,000",
  "CZK 12,000 + CZK 3,000",
  "CZK 16,000 + CZK 3,200",
  "CZK 6,500 + CZK 1,500",
  "CZK 13,500 + CZK 4,500",
  "",
  "CZK 14,000 + CZK 3,800",
  "CZK 8,800 + CZK 2,600",
  "CZK 12,000 + CZK 2,900",
  "CZK 14,625 + CZK 4,875",
  "",
  "CZK 14,500 + CZK 1",
  "CZK 9,250 + CZK 1,000",
  "CZK 10,500",
  "CZK 14,000 + CZK 2,500",
  "CZK 10,505 + CZK 1,600",
  "CZK 10,505 + CZK 1,600",
  "CZK 10,505 + CZK 1,600",
  "CZK 10,505 + CZK 1,600",
  "CZK 12,000 + CZK 3,000",
  "CZK 10,505 + CZK 1,600",
  "CZK 10,505 + CZK 1,600",
  "CZK 11,175 + CZK 3,725",
  "",
  "CZK 10,505 + CZK 1,600",
  "CZK 10,505 + CZK 1,600",
  "CZK 7,200 + CZK 800",
  "CZK 18,000 + CZK 2,000",
  "CZK 12,000 + CZK 1,500",
  "CZK 9,200 + CZK 2,500",
  "CZK 8,500 + CZK 1,500",
  "CZK 10,000 + CZK 1,800",
  "CZK 13,800 + CZK 1,500",
  "CZK 8,438 + CZK 2,812",
  "",
  "CZK 8,000 + CZK 3,200",
  "CZK 10,000 + CZK 2,000",
  "CZK 16,000",
  "CZK 16,000 + CZK 3,000",
  "CZK 8,500",
  "CZK 11,600 + CZK 3,195",
  "CZK 11,000 + CZK 3,195",
  "CZK 13,500 + CZK 3,000",
  "CZK 8,000 + CZK 2,500",
  "CZK 10,500 + CZK 1,400",
  "CZK 10,700 + CZK 2,300",
  "CZK 8,500 + CZK 1,700",
  "CZK 9,000 + CZK 2,500",
  "CZK 9,500 + CZK 2,500",
  "CZK 9,000 + CZK 2,000",
  "CZK 14,500 + CZK 2,000",
  "CZK 12,900 + CZK 2,100",
  "CZK 8,500 + CZK 2,090",
  "CZK 8,200 + CZK 2,300",
  "CZK 16,000 + CZK 4,000",
  "CZK 13,000 + CZK 2,700",
  "CZK 16,500 + CZK 3,000",
  "CZK 9,000 + CZK 500",
  "CZK 8,890 + CZK 1,950",
  "CZK 12,000 + CZK 3,000",
  "CZK 14,000 + CZK 1,000",
  "CZK 14,900 + CZK 2,750",
  "CZK 10,505 + CZK 1,600",
  "CZK 10,900 + CZK 2,500",
  "CZK 11,000 + CZK 2,500",
  "CZK 14,000 + CZK 2,000",
  "CZK 10,500 + CZK 2,000",
  "CZK 12,900 + CZK 3,890",
  "CZK 11,200 + CZK 1,700",
  "CZK 12,500 + CZK 2,500",
  "CZK 16,000 + CZK 2,000",
  "CZK 7,500 + CZK 2,300",
  "CZK 9,900 + CZK 2,200",
  "CZK 11,500",
  "CZK 8,000 + CZK 2,000",
  "CZK 15,000 + CZK 2,850",
  "CZK 7,500 + CZK 3,500",
  "CZK 9,900 + CZK 2,650",
  "CZK 9,000 + CZK 1,500",
  "CZK 9,000 + CZK 2,000",
  "CZK 7,013 + CZK 2,987",
  "CZK 13,000 + CZK 3,500",
  "CZK 12,000 + CZK 4,000",
  "CZK 15,000 + CZK 2,500",
  "CZK 11,500 + CZK 1,500",
  "CZK 14,500 + CZK 3,282",
  "CZK 16,000 + CZK 3,270",
  "CZK 15,000 + CZK 3,317",
  "CZK 10,500 + CZK 2,200",
  "CZK 12,000 + CZK 1,500",
  "CZK 9,500 + CZK 2,500",
  "CZK 10,505 + CZK 1,600",
  "CZK 10,000 + CZK 2,000",
  "CZK 9,990 + CZK 2,300",
  "CZK 8,500 + CZK 2,000",
  "CZK 11,000 + CZK 3,599",
  "CZK 11,000 + CZK 1,000",
  "CZK 14,500 + CZK 3,000",
  "CZK 10,250 + CZK 2,250",
  "CZK 900",
  "CZK 12,450 + CZK 3,050",
  "CZK 9,000 + CZK 2,050",
  "CZK 8,000 + CZK 1,850",
  "CZK 11,800 + CZK 2,200",
  "CZK 11,000 + CZK 3,800",
  "CZK 13,900 + CZK 4,000",
  "CZK 9,500 + CZK 3,500",
  "CZK 9,000 + CZK 2,000",
  "CZK 12,000",
  "CZK 9,800 + CZK 2,500",
  "CZK 14,000 + CZK 3,000",
  "CZK 14,000 + CZK 4,500",
  "CZK 11,600 + CZK 3,195",
  "CZK 9,500 + CZK 2,000",
  "CZK 10,500 + CZK 1,900",
  "CZK 13,000 + CZK 3,000",
  "CZK 7,500 + CZK 3,000",
  "CZK 8,500 + CZK 2,300",
  "CZK 15,199 + CZK 250",
  "CZK 12,000",
  "CZK 11,500 + CZK 2,000",
  "CZK 10,500 + CZK 3,000",
  "CZK 9,600 + CZK 2,100",
  "CZK 9,500 + CZK 2,000",
  "CZK 8,000 + CZK 2,000",
  "CZK 10,500 + CZK 2,000",
  "CZK 15,000 + CZK 2,000",
  "CZK 11,000 + CZK 2,500",
  "CZK 12,000 + CZK 1,700",
  "CZK 12,500 + CZK 2,800",
  "CZK 10,000 + CZK 2,000",
  "CZK 13,500 + CZK 2,500",
  "CZK 9,700 + CZK 1",
  "CZK 14,800 + CZK 2,600",
  "CZK 11,200 + CZK 3,000",
  "CZK 9,500 + CZK 2,520",
  "CZK 15,000 + CZK 2,500",
  "CZK 12,480 + CZK 2,300",
  "CZK 13,500 + CZK 2,000",
  "CZK 8,000 + CZK 2,000",
  "CZK 10,000 + CZK 2,500",
  "CZK 15,500 + CZK 2,500",
  "CZK 6,900 + CZK 400",
  "CZK 12,000 + CZK 1,800",
  "CZK 15,000 + CZK 2,500",
  "CZK 9,000 + CZK 2,000",
  "CZK 8,476 + CZK 3,024",
  "CZK 13,100 + CZK 1,900",
  "CZK 8,800 + CZK 3,200",
  "CZK 9,000 + CZK 3,400",
  "CZK 8,000 + CZK 2,300",
  "CZK 10,000 + CZK 2,000",
  "CZK 13,500 + CZK 2,500",
  "CZK 17,000 + CZK 3,000",
  "CZK 14,000 + CZK 2,000",
  "CZK 10,400 + CZK 1,600",
  "CZK 8,900 + CZK 3,600",
  "CZK 18,000",
  "CZK 9,000 + CZK 2,900",
  "CZK 9,000 + CZK 2,500",
  "CZK 14,000 + CZK 4,000",
  "CZK 8,000 + CZK 3,000",
  "CZK 12,000 + CZK 3,500",
  "CZK 13,495 + CZK 2,636",
  "CZK 7,500 + CZK 2,500",
  "CZK 14,000",
  "CZK 14,800 + CZK 1,500",
  "CZK 9,000 + CZK 1,500",
  "CZK 9,000 + CZK 3,000",
  "CZK 14,000 + CZK 1,500",
  "CZK 14,000 + CZK 2,500",
  "CZK 13,000 + CZK 1,940",
  "CZK 8,905 + CZK 1,600",
  "CZK 10,505 + CZK 1,600",
  "CZK 9,300 + CZK 1,600",
  "CZK 17,000 + CZK 2,500",
  "CZK 13,900 + CZK 1,850",
  "CZK 17,500 + CZK 1,600"
];

module.exports = () => {
  let fullPrices = [];
  let utilityPrices = [];

  const rawPrices = mockData.map(t => t.trim().replace(/[\s\.,]+/g, '').replace(/czk/ig, ''));

  const cleanPrices = rawPrices.map(price => {
    if (price.indexOf('+') !== -1) {
      const [price1, price2] = price.split('+');
      utilityPrices = [...utilityPrices, Number(price2)];
      return Number(price1) + Number(price2);
    } else {
      return Number(price);
    }
  }).filter(n => n !== 0);

  fullPrices = [...fullPrices, ...cleanPrices];

  return {
    name: 'bezrealitky.com',
    fullPrices,
    utilityPrices 
  };
}

// module.exports = () => puppeteer.launch({ headless: false }).then(async browser => {
//   const page = await browser.newPage();
//   const LISTING_ICONS_SELECTOR = 'strong.product__value';
//   const NEXT_PAGE_SELECTOR = '.b-search__footer-item .btn.btn-secondary.btn-icon';
//   const waitForSelectorOptions = { timeout: 60000 };
//   const RETRY_COUNT = 5;
//   const RETRY_WAIT_TIME = 5000;
//   const PAGE_LIMIT = 10;
//   let nextPageExists = false;
//   let pageCounter = 1;

//   let nextPageURL = 'https://www.bezrealitky.com/search#offerType=pronajem&estateType=byt&priceTo=20000&disposition=1-kk%2Cgarsoniera%2C1-1%2C2-kk&ownership=&construction=&equipped=castecne%2Cvybaveny&balcony=&order=timeOrder_desc&center=%5B16.60119918069995%2C49.1993541536427%5D&zoom=10.599505946955846&locationInput=Brno%2C%20South%20Moravian%20Region%2C%20Czechia&limit=15';
//   let rawPrices = [];
//   let fullPrices = [];
//   let utilityPrices = [];
  
//   localLogger('Opening bezrealitky.com...');

//   do {
//     localLogger('Processing page ' + pageCounter + '...');

//     const recursiveWaitForSelector = async (tryNumber = 1) => {
//       if (tryNumber > RETRY_COUNT) throw new Error('Tried too many times...');

//       try {
//         await page.goto(nextPageURL);
//         await page.waitForSelector(LISTING_ICONS_SELECTOR, waitForSelectorOptions);
//       } catch {
//         localLogger('Scheduling a retry. Sleeping for ' + RETRY_WAIT_TIME / 1000 + ' secs');
//         await sleep(RETRY_WAIT_TIME);
//         localLogger('Retrying...');
//         await page.reload(nextPageURL);
//         return recursiveWaitForSelector(tryNumber + 1);
//       }
//     }

//     await recursiveWaitForSelector();
  
//     const rawPrices = await page.evaluate((wordSel) => {
//       return Array.from(document.querySelectorAll(wordSel))
//         .map(node => node.textContent
//           .trim().replace(/[\s\.,]+/g, '').replace(/czk/i, '')
//         );
//     }, LISTING_ICONS_SELECTOR);

//     const cleanPrices = rawPrices.map(price => {
//       if (price.indexOf('+') !== -1) {
//         const [price1, price2] = price.split('+');
//         utilityPrices = [...utilityPrices, Number(price2)];
//         return Number(price1) + Number(price2);
//       } else {
//         return Number(price);
//       }
//     });

//     return console.log(cleanPrices);

//     localLogger(cleanPrices.length + ' prices extracted from the page');

//     fullPrices = [...fullPrices, ...cleanPrices];

//     // Identify if there are still any pages left
//     // We do this here in the beginning since we'll
//     // navigate away to prirucka website below
//     try {
//       await page.waitForSelector(NEXT_PAGE_SELECTOR, { timeout: 5000 });
//       nextPageExists = true;
//       nextPageURL = await page.evaluate((pageSel) => {
//         return document.querySelector(pageSel).href;
//       }, NEXT_PAGE_SELECTOR);

//       if (nextPageURL) {
//         pageCounter++;
//         nextPageExists = true;
//       } else {
//         nextPageURL = '';
//         nextPageExists = false;
//       }
//     } catch (e) {
//       nextPageExists = false;
//       nextPageURL = '';
//     }

//     if (pageCounter > PAGE_LIMIT) {
//       nextPageExists = false;
//     }
//   } while (nextPageExists);

//   localLogger('Finished processing bezrealitky.com data... Exiting.')
  
//   await browser.close();
//   return {
//     name: 'bezrealitky.com',
//     fullPrices,
//     utilityPrices 
//   };
// });
