import axios from 'axios';
import posthtml from 'posthtml';
import matchHelper from 'posthtml-match-helper';
import querystring from 'querystring';
import logger from '../logger';
import { Provider } from '../analysis';

const localLogger = logger('amigro.cz');

const fullPrices: number[] = [];
const utilityPrices: number[] = [];
const searchURL = 'http://www.amigro.cz/reality/';
const MAX_PAGE_NUMBER = 1;

const initialRequestBody = {
  typ_prodeje:3,
  typ_nemovitosti:7,
  set_okres_kod:3702,
  search_lokalita:'',
  cena_od:'',
  cena_do:20000,
  plocha_od:'',
  plocha_do:'',
  search_ec:'',
  Submit:'Vyhledat:'
};

const finish = (): Provider => {
  localLogger('Finished processing amigro.cz data... Exiting.');
  return {
    name: 'amigro.cz',
    fullPrices,
    utilityPrices 
  };
}

const getOffers = (pageNumber = 1): Promise<unknown> | Provider => {
  if (pageNumber > MAX_PAGE_NUMBER) {
    return finish();
  }

  localLogger('Getting data of page: ', pageNumber);
  return axios.post(searchURL, querystring.stringify(initialRequestBody))
    .then(({ data }) => {
      // Stop recursion and return data
      
      posthtml()
        .use(function postHTMLPluginName (tree) {
          // do something for tree
          tree.match(matchHelper('p.prehled-cena'), (node) => {
            fullPrices.push(
              // @ts-ignore
              node.content
                // @ts-ignore
                .filter(c => c.tag === 'strong')
                // @ts-ignore
                .map(c => parseInt(c.content[0].replace(/\s/g, '').match(/\d+/)[0], 10))[0]
            );
            return node
          })
        })
        // @ts-ignore
        .process(data, { sync: true }).html;

      return getOffers(pageNumber + 1);
    });
}

export default getOffers;
