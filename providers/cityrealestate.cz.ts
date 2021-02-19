import puppeteer, { Browser } from 'puppeteer';
import logger from '../logger';

const localLogger = logger('cityrealestate.cz');
const sleep = (timeout = 1000) => new Promise<void>(r => setTimeout(() => r(), timeout));

export default () => puppeteer.launch().then(async (browser: Browser) => {
  const page = await browser.newPage();
  const DESCRIPTION_TEXT = '.post-excerpt p';
  const NEXT_PAGE_SELECTOR = 'nav#pagination .pull-right a';
  const waitForSelectorOptions = { timeout: 20000 };
  const RETRY_COUNT = 5;
  const RETRY_WAIT_TIME = 5000;
  const PAGE_LIMIT = 10;
  let nextPageExists = false;
  let pageCounter = 1;

  let nextPageURL = 'http://www.cityrealestate.cz/en/category/advertisements/';
  let fullPrices: number[] = [];
  let utilityPrices: number[] = [];
  
  localLogger('Opening cityrealestate.cz...');

  do {
    localLogger('Processing page ' + pageCounter + '...');

    const recursiveWaitForSelector = async (tryNumber = 1): Promise<unknown> => {
      if (tryNumber > RETRY_COUNT) throw new Error('Tried too many times...');

      try {
        await page.goto(nextPageURL);
        await page.waitForSelector(DESCRIPTION_TEXT, waitForSelectorOptions);
      } catch {
        localLogger('Scheduling a retry. Sleeping for ' + RETRY_WAIT_TIME / 1000 + ' secs');
        await sleep(RETRY_WAIT_TIME);
        localLogger('Retrying...');
        await page.reload();
        return recursiveWaitForSelector(tryNumber + 1);
      }
    }

    await recursiveWaitForSelector();
  
    const rawPrices = await page.evaluate((wordSel) => {
      return Array.from(document.querySelectorAll(wordSel))
        .map(v => v.textContent.trim().replace(/[\.\s,]/g, ''));
    }, DESCRIPTION_TEXT);

    const cleanPrices = rawPrices.map(price => {
      // price.match(/(\d{4,})CZK(.*\+.*(\d{3,})CZK)?/i))
      if (price.indexOf('+') !== -1) {
        const [price1, price2] = price.split('+');
        utilityPrices = [...utilityPrices, Number(price2)];
        return Number(price1) + Number(price2);
      } else {
        return Number(price);
      }
    });

    localLogger(cleanPrices.length + ' prices extracted from the page');

    fullPrices = [...fullPrices, ...cleanPrices];

    // Identify if there are still any pages left
    // We do this here in the beginning since we'll
    // navigate away to prirucka website below
    try {
      await page.waitForSelector(NEXT_PAGE_SELECTOR, { timeout: 5000 });
      nextPageExists = true;
      nextPageURL = await page.evaluate((pageSel) => {
        return document.querySelector(pageSel).href;
      }, NEXT_PAGE_SELECTOR);

      if (nextPageURL) {
        pageCounter++;
        nextPageExists = true;
      } else {
        nextPageURL = '';
        nextPageExists = false;
      }
    } catch (e) {
      nextPageExists = false;
      nextPageURL = '';
    }

    if (pageCounter > PAGE_LIMIT) {
      nextPageExists = false;
    }
  } while (nextPageExists);

  localLogger('Finished processing cityrealestate.cz data... Exiting.')
  
  await browser.close();
  return {
    name: 'cityrealestate.cz',
    fullPrices,
    utilityPrices 
  };
});
