import providers from './providers';
import runAnalysis from './analysis';
import { Provider } from './analysis';

// run all providers in parallel
const dataArray = Promise.all(providers.map((p: () => Promise<unknown> | Provider) => p()));

(async () => {
  const data = await dataArray;

  runAnalysis((data as Provider[]));
})();
