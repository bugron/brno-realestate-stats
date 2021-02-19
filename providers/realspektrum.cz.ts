import puppeteer, { Browser } from 'puppeteer';
import logger from '../logger';

const localLogger = logger('realspektrum.cz');
const sleep = (timeout = 1000) => new Promise<void>(r => setTimeout(() => r(), timeout));

export default () => puppeteer.launch().then(async (browser: Browser) => {
  const page = await browser.newPage();
  const PRICE_TEXT = '.cena';
  const NEXT_PAGE_SELECTOR = 'nav#pagination .pull-right a';
  const waitForSelectorOptions = { timeout: 20000 };
  const RETRY_COUNT = 5;
  const RETRY_WAIT_TIME = 5000;
  const PAGE_LIMIT = 10;
  let nextPageExists = false;
  let pageCounter = 1;

  let nextPageURL = 'https://www.realspektrum.cz/bydleni/hledam-nemovitost?filterMaxPrice=20000&filterOptions%5B89%5D%5B2%5D=47&filterOptions%5B91%5D%5B1%5D=51&filterOptions%5B76%5D%5B1%5D=1&filterOptions%5B76%5D%5B2%5D=2&filterOptionsNonSelectable%5B93%5D%5B0%5D=Brno-m%C4%9Bsto';
  let fullPrices: number[] = [];
  let utilityPrices: number[] = [];
  
  localLogger('Opening realspektrum.cz...');

  do {
    localLogger('Processing page ' + pageCounter + '...');

    const recursiveWaitForSelector = async (tryNumber = 1): Promise<unknown> => {
      if (tryNumber > RETRY_COUNT) throw new Error('Tried too many times...');

      try {
        await page.goto(nextPageURL);
        await page.waitForSelector(PRICE_TEXT, waitForSelectorOptions);
      } catch {
        localLogger('Scheduling a retry. Sleeping for ' + RETRY_WAIT_TIME / 1000 + ' secs');
        await sleep(RETRY_WAIT_TIME);
        localLogger('Retrying...');
        await page.reload();
        return recursiveWaitForSelector(tryNumber + 1);
      }
    }

    await recursiveWaitForSelector();
  
    const rawPrices = await page.evaluate((wordSel: string) => {
      return Array.from(document.querySelectorAll(wordSel))
        .map(v => v.textContent?.trim().replace(/[\.\s,]/g, ''));
    }, PRICE_TEXT);

    const cleanPrices = rawPrices.map((price?: string) => {
      const parsedValues = price?.match(/\d+/)
      if (parsedValues?.length) {
        return Number(parsedValues[0]);
      } else {
        return 0;
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
      nextPageURL = await page.evaluate((pageSel: string) => {
        return (document.querySelector(pageSel) as HTMLAnchorElement)?.href;
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

  localLogger('Finished processing realspektrum.cz data... Exiting.')
  
  await browser.close();
  return {
    name: 'realspektrum.cz',
    fullPrices,
    utilityPrices 
  };
});
