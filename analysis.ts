import fs from 'fs';
import path from 'path';
import generateFullReport from './utility/generateFullReport';
import getProviderConfig from './utility/getProviderConfig';
import analyzerFactory from './provider-analyzer';

export type Provider = {
  name: string,
  fullPrices: number[],
  utilityPrices: number[]
}

export default (data: Provider[]) => {
  let allReportData: Provider[] = [];

  // create the reports directory
  if (!fs.existsSync(path.resolve('reports'))) {
    fs.mkdirSync(path.resolve('reports'));
  }

  data.forEach(provider => {
    // create analysis function with provider specific configuration
    const runProviderAnalysis = analyzerFactory(getProviderConfig(provider.name));
    console.log(provider.name + ' data fetched');

    // run analysis
    const providerReport = runProviderAnalysis(provider);
    // and collect its results
    //@ts-ignore
    allReportData = [...allReportData, providerReport];
  });

  // generate a full report
  const fullReport = generateFullReport(allReportData);

  fs.writeFile(path.join(__dirname, '../reports', `full-report.txt`), JSON.stringify(fullReport, null, 2), (err: any) => {
    if (err) throw err;
    console.log(`Successfully Written to full-report.txt`);
  })
};
