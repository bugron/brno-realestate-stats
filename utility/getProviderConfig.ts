// const providerConfigs: { default: { config: { reportAverage: boolean, reportNumber: boolean, reportMinMax: boolean, saveReport: boolean, cleanReport: boolean}}} = {
const providerConfigs = {
  default: {
    config: {
      reportAverage: true,
      reportNumber: true,
      reportMinMax: true,
      saveReport: true,
      cleanReport: true,
    }
  }
}

const getProviderConfig = (providerName = '') => {
  // @ts-ignore
  if (providerConfigs[providerName]) {
    // @ts-ignore
    return providerConfigs[providerName];
  }
  return providerConfigs.default;
};

export default getProviderConfig;
