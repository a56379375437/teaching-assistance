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

//生成随机的函数
/**
 * 生成密码学安全的 [0, 1) 随机数（CSPRNG）
 * @returns 0 ~ 1 之间的随机浮点数
 */
export function getSecureRandom(): number {
  // 创建 32 位无符号整数缓冲区
  const array = new Uint32Array(1);
  // 密码学安全随机填充
  window.crypto.getRandomValues(array);
  // 归一化到 [0, 1)
  return array[0] / (0xFFFFFFFF + 1);
}