const fs = require('fs');
const path = require('path');
const generateFullReport = require('./utility/generateFullReport');
const getProviderConifg = require('./utility/getProviderConfig');
const analyzerFactory = require('./provider-analyzer');

export type Provider = {
  name: string,
  fullPrices: number[],
  utilityPrices: number[]
}

export default (data: Provider[]) => {
  let allReportData: Provider[] = [];

  data.forEach(provider => {
    // create analysis function with provider specifig configuration
    const runProviderAnalysis = analyzerFactory(getProviderConifg(provider.name));
    console.log(provider.name + ' data fetched');

    // run analysis
    const providerReport = runProviderAnalysis(provider);
    // and collect its results
    allReportData = [...allReportData, providerReport];
  });

  // generate a full report
  const fullReport = generateFullReport(allReportData);

  fs.writeFile(path.join(__dirname, 'reports', `full-report.txt`), JSON.stringify(fullReport, null, 2), (err: Error) => {
    if (err) throw err;
    console.log(`Successfully Written to full-report.txt`);
  })
};
