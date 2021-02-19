import { ProviderReport } from '../provider-analyzer';

module.exports = (allReportData: ProviderReport[]) => {
  let fullReport = allReportData.reduce((acc, nextReport) => {
    return Object.assign({}, acc, {
      allPricesCount: acc.allPricesCount + Number(nextReport.allPricesCount),
      utilityPricesCount: acc.utilityPricesCount + Number(nextReport.utilityPricesCount),
      averageFullPrice: acc.averageFullPrice + Number(nextReport.averageFullPrice),
      averageUtilityPrice: acc.averageUtilityPrice + Number(nextReport.averageUtilityPrice),
    })
  }, {
    allPricesCount: 0,
    utilityPricesCount: 0,
    averageFullPrice: 0,
    averageUtilityPrice: 0,
  });

  // calculate actual average values
  fullReport = Object.assign({}, fullReport, {
    averageFullPrice: allReportData.length ? fullReport.averageFullPrice / allReportData.length : 0,
    averageUtilityPrice: fullReport.utilityPricesCount ? fullReport.averageUtilityPrice / allReportData.length : 0
  });

  return fullReport;
};
