import puppeteer, { Browser } from 'puppeteer';
import logger from '../logger';

const localLogger = logger('bravis.cz');
const sleep = (timeout = 1000) => new Promise<void>(r => setTimeout(() => r(), timeout));

// let nodes = Array.from(document.querySelectorAll('strong.price'))
// trimmedValues = nodes.map(node => node.textContent.trim().replace(/[\s\.,]+/g, ''))
// let splitedValues = trimmedValues.map(value => value.split('CZK/month'))
// splitedValues.map(values => values[1].replace(/czk/i, '').match(/(CZK)?\d+/))

export default () => puppeteer.launch().then(async (browser: Browser) => {
  const page = await browser.newPage();
  const PRICE_TEXT_SELECTOR = 'strong.price';
  const NEXT_PAGE_SELECTOR = 'li.pagination a.next';
  const waitForSelectorOptions = { timeout: 20000 };
  const RETRY_COUNT = 5;
  const RETRY_WAIT_TIME = 5000;
  const PAGE_LIMIT = 10;
  let nextPageExists = false;
  let pageCounter = 1;

  let nextPageURL = 'https://www.bravis.cz/en/flats-for-rent?typ-nemovitosti-byt+1=&typ-nemovitosti-byt+2=&typ-nabidky=flats-for-rent&lokalita=cele-brno&vybavenost=nezalezi&q=&action=search&s=1-40-price-0';
  let rawPrices = [];
  let fullPrices: number[] = [];
  let utilityPrices: number[] = [];
  
  localLogger('Opening Bravis.cz...');

  do {
    localLogger('Processing page ' + pageCounter + '...');

    const recursiveWaitForSelector = async (tryNumber = 1): Promise<unknown> => {
      if (tryNumber > RETRY_COUNT) throw new Error('Tried too many times...');

      try {
        await page.goto(nextPageURL);
        await page.waitForSelector(PRICE_TEXT_SELECTOR, waitForSelectorOptions);
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
        .map(node => {
          const values = node.textContent!.trim()
            .replace(/[\s\.,]+/g, '')
            .split('CZK/month');
          return[values[0], values[1].replace(/czk/i, '').match(/(CZK)?\d+/)]
        });
    }, PRICE_TEXT_SELECTOR);

    const cleanPrices = rawPrices.map(price => {
      let rentPrice = Number(price[0]);
      if (price[1]) {
        rentPrice += Number(price[1][0]);
        utilityPrices = [...utilityPrices, Number(price[1][0])];
      }

      return rentPrice;
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
        return document.querySelector<HTMLAnchorElement>(pageSel)?.href ?? '';
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

  localLogger('Finished processing Bravis.cz data... Exiting.')
  
  await browser.close();
  return {
    name: 'bravis.cz',
    fullPrices,
    utilityPrices 
  };
});
