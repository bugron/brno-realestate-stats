import puppeteer, { Browser } from 'puppeteer';
import logger from '../logger';

const localLogger = logger('foreigners.cz');
const sleep = (timeout = 1000) => new Promise<void>(r => setTimeout(() => r(), timeout));

export default () => puppeteer.launch().then(async (browser: Browser) => {
  const page = await browser.newPage();
  const LISTING_ICONS_SELECTOR = 'span.estate-listing-icons > span:nth-child(3)';
  const NEXT_PAGE_SELECTOR = 'ul.pager > li.next:not(.disabled) > a[title="Next"]';
  const waitForSelectorOptions = { timeout: 20000 };
  const RETRY_COUNT = 5;
  const RETRY_WAIT_TIME = 5000;
  const PAGE_LIMIT = 10;
  let nextPageExists = false;
  let pageCounter = 1;

  let nextPageURL = 'https://www.foreigners.cz/real-estate/apartment/rent/prague?location=m-0-582786-0&area=15&furnished%5B0%5D=1&furnished%5B1%5D=2&rooms%5B0%5D=1&rooms%5B1%5D=2&price_from=5000&price_to=20000';
  let fullPrices: number[] = [];
  let utilityPrices: number[] = [];
  
  localLogger('Opening Foreigners.cz...');

  do {
    localLogger('Processing page ' + pageCounter + '...');

    const recursiveWaitForSelector = async (tryNumber = 1): Promise<unknown> => {
      if (tryNumber > RETRY_COUNT) throw new Error('Tried too many times...');

      try {
        await page.goto(nextPageURL);
        await page.waitForSelector(LISTING_ICONS_SELECTOR, waitForSelectorOptions);
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
        // @ts-ignore
        .map(node => node?.childNodes[2].textContent
          .trim().replace(/\s/g, '').replace(/czk/i, '')
        );
    }, LISTING_ICONS_SELECTOR);

    const cleanPrices = rawPrices.map(price => {
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
      nextPageURL = await page.evaluate((pageSel: string) => {
        return (document.querySelector(pageSel) as HTMLAnchorElement).href;
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

  localLogger('Finished processing Foreigners.cz data... Exiting.')
  
  await browser.close();
  return {
    name: 'foreigners.cz',
    fullPrices,
    utilityPrices 
  };
});
