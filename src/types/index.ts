// 该文件主要配置类型、路由映射、数据格式

// 主要网址：
export const mainkey = '/teaching-assistance'
export const experimentkey = mainkey + "/experiment";

//针定义
export type Needle = {
  x: number;
  y: number;
  angle: number;
  intersect: boolean;
};