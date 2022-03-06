import fs from 'fs';
import path from 'path';
import { getAverage, getMax, getMin } from './utility/analysis';
import { Provider } from './analysis';

export type ProviderReport = {
  name: string,
  allPricesCount?: Number,
  utilityPricesCount?: Number,
  averageFullPrice?: Number,
  averageUtilityPrice?: Number,
  maxFullPrice?: Number,
  minFullPrice?: Number,
  maxUtilityPrice?: Number,
  minUtilityPrice?: Number,
}

const factory = ({
  reporter = console.log,
  config = {
    reportNumber: false,
    reportAverage: false,
    reportMinMax: false,
    saveReport: false,
    cleanReport: true,
  },
}) => (provider: Provider) => {
  if (!provider || !Object.keys(provider)) {
    throw new Error('provider is either not specified or empty object');
  }

  const providerReport: ProviderReport = { name: provider.name };

  const report = ['\n', new Date().toString()];

  const enhancedReporter = config.saveReport ? (...args: any[]) => {
    report.push(...args);
    reporter(...args);
  } : reporter;

  enhancedReporter(`\n-----===== BEGIN Reporting stats for the following provider: ${provider.name} =====-----\n`);

  if (config.reportNumber) {
    providerReport.allPricesCount = provider.fullPrices.length;
    providerReport.utilityPricesCount = provider.utilityPrices.length;
    enhancedReporter(`Number of full prices collected:\t${providerReport.allPricesCount}`);
    enhancedReporter(`Number of utility prices collected:\t${providerReport.utilityPricesCount}`);
  }

  if (config.reportAverage) {
    providerReport.averageFullPrice = Number(getAverage(provider.fullPrices));
    providerReport.averageUtilityPrice = Number(getAverage(provider.utilityPrices));
    enhancedReporter(`Average of the full prices:\t\t${providerReport.averageFullPrice}`);
    enhancedReporter(`Average of the utility prices:\t\t${providerReport.averageUtilityPrice}`);
  }

  if (config.reportMinMax) {
    providerReport.maxFullPrice = getMax(provider.fullPrices);
    providerReport.minFullPrice = getMin(provider.fullPrices);
    providerReport.maxUtilityPrice = getMax(provider.utilityPrices);
    providerReport.minUtilityPrice = getMin(provider.utilityPrices);
    enhancedReporter(`Maximum rental price:\t\t${providerReport.maxFullPrice}`);
    enhancedReporter(`Minimum rental price:\t\t${providerReport.minFullPrice}`);
    enhancedReporter(`Maximum utility price:\t\t${providerReport.maxUtilityPrice}`);
    enhancedReporter(`Minimum utility price:\t\t${providerReport.minUtilityPrice}`);
  }

  enhancedReporter(`\n-----===== END Reporting stats for the following provider: ${provider.name} =====-----\n\n`);

  if (config.saveReport) {
    const writeOrAppend = config.cleanReport ? fs.writeFile : fs.appendFile;
    writeOrAppend(path.join(__dirname, '../reports', `${provider.name}.txt`), report.join('\n'), (err: any) => {
      if (err) throw err;
      console.log(`Successfully Written to ${provider.name}.txt`);
    });
  }

  return providerReport;
};

export default factory;
