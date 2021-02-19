export const getAverage = (values: number[] = []) => {
  const average = values.reduce((acc, next) => {
    return acc + BigInt(next);
  }, BigInt(0)) / BigInt(values.length || 1);

  return Number(average);
};
export const getMax = (values = [0]) => Math.max(...(values.length ? values : [0]));
export const getMin = (values = [0]) => Math.min(...(values.length ? values : [0]));
