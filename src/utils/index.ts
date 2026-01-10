// 主要存储组件中可能会被复用的方法，大部分不涉及发送请求，发送请求方法大部分位于request包中的文件

// 计算异常值的辅助函数
export const findOutliers = (data: number[]): number[] => {
  if (data.length < 4) return [];

  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  const q1Index = Math.floor(n / 4);
  const q3Index = Math.ceil((3 * n) / 4);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return data.filter(val => val < lowerBound || val > upperBound);
};
