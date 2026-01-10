import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  InputNumber,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Select,
  Divider,
  Form,
  Input,
  Spin,
} from "antd";
import { PlayCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import * as echarts from "echarts/core";
import { BoxplotChart, LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// 注册ECharts模块
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  BoxplotChart,
  LineChart,
  BarChart,
  CanvasRenderer,
]);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 类型定义
interface RedPacketConfig {
  totalAmount: number; // 总金额
  packetCount: number; // 红包个数
  experimentTimes: number; // 实验次数
  distributionType: "uniform" | "normal" | "exponential"; // 分布类型
  paramA: number; // 分布参数a
  paramB: number; // 分布参数b
}

interface ExperimentResult {
  allAmounts: number[][]; // 所有实验的红包金额（二维数组：[实验次数][红包顺序]）
  avgByOrder: number[]; // 按顺序的数学期望
  varianceByOrder: number[]; // 按顺序的方差
  boxplotData: number[][]; // 箱型图数据
  frequencyData: number[][]; // 频率分布数据
}

// 工具函数：生成指定分布的随机数
const getRandomByDistribution = (
  type: RedPacketConfig["distributionType"],
  a: number,
  b: number,
  totalAmount: number,
): number => {
  switch (type) {
    case "uniform": // 均匀分布 [a, b]
      return (a + Math.random() * (b - a)) * totalAmount;
    case "normal": { // 正态分布（a=均值，b=标准差）
      let u = 0,
        v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return a + b * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    case "exponential": // 指数分布（a=速率参数λ）
      return -Math.log(Math.random()) / a;
    default:
      return Math.random();
  }
};

// 工具函数：计算方差
const calculateVariance = (arr: number[], avg: number): number => {
  return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
};

// 计算频率分布区间数据
const calculateFrequencyData = (
  tempData: number[][],
  config: RedPacketConfig
): number[][] => {
  const amountRange = (config.totalAmount / config.packetCount) * 2;
  const interval = amountRange / 5;
  const frequencyData: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const min = interval * i;
    const max = interval * (i + 1);
    frequencyData.push(
      tempData.map((orderData) => {
        const count = orderData.filter((val) => val >= min && val < max).length;
        return Number((count / config.experimentTimes).toFixed(4));
      })
    );
  }
  return frequencyData;
};

const RedPacketSimulation: React.FC = () => {
  // 配置参数状态
  const [config, setConfig] = useState<RedPacketConfig>({
    totalAmount: 100,
    packetCount: 20,
    experimentTimes: 500,
    distributionType: "uniform",
    paramA: 0,
    paramB: 1,
  });

  // 实验结果状态
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 引用类型
  const boxplotRef = useRef<HTMLDivElement>(null);//箱型图容器引用
  const meanVarianceLineRef = useRef<HTMLDivElement>(null);//均值/方差折线图容器引用
  const frequencyRef = useRef<HTMLDivElement>(null);//频率分布柱状图容器引用
  const amountOrderLineRef = useRef<HTMLDivElement>(null);//红包金额与红包顺序折线图容器引用
  const timerRef = useRef<number | null>(null);//定时器引用
  const echartsInstances = useRef<{//箱线图实例
    boxplot?: echarts.ECharts;
    meanVarianceLine?: echarts.ECharts;
    frequency?: echarts.ECharts;
    amountOrderLine?: echarts.ECharts;
  }>({});

  const commonEchartOptions = useMemo(
    () => ({
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      toolbox: {
        feature: { saveAsImage: {} },
      },
    }),
    []
  );
  // 初始化ECharts实例
  useEffect(() => {
    // 将当前实例保存到局部变量，避免清理时引用变化
    const currentInstances = echartsInstances.current;

    // 箱型图实例
    if (boxplotRef.current) {
      currentInstances.boxplot = echarts.init(boxplotRef.current);
    }
    // 均值/方差折线图实例
    if (meanVarianceLineRef.current) {
      currentInstances.meanVarianceLine = echarts.init(
        meanVarianceLineRef.current
      );
    }
    // 频率分布柱状图实例
    if (frequencyRef.current) {
      currentInstances.frequency = echarts.init(frequencyRef.current);
    }
    // 红包金额与红包顺序折线图实例
    if (amountOrderLineRef.current) {
      currentInstances.amountOrderLine = echarts.init(
        amountOrderLineRef.current
      );
    }

    // 清理函数
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      Object.values(currentInstances).forEach((instance) => {
        instance?.dispose();
      });
    };
  }, []);

  // 更新图表
  useEffect(() => {
    if (!result) return;

    // 1. 更新箱型图
    if (echartsInstances.current.boxplot) {
      const boxplotOption = {
        ...commonEchartOptions,
        title: { text: "红包金额箱型图（按抢红包顺序）", left: "center" },
        xAxis: {
          type: "category",
          data: Array.from(
            { length: config.packetCount },
            (_, i) => `第${i + 1}个`
          ),
          axisLabel: { rotate: 30 },
        },
        yAxis: { type: "value", name: "金额（元）" },
        series: [
          {
            name: "金额分布",
            type: "boxplot",
            data: result.boxplotData,
            itemStyle: { color: "#1890ff" },
            tooltip: {
              formatter: (params: {
                data: [number, number, number, number, number];
              }) => {
                const [min, q1, median, q3, max] = params.data;
                return `
                最小值：${min.toFixed(2)}<br/>
                下四分位：${q1.toFixed(2)}<br/>
                中位数：${median.toFixed(2)}<br/>
                上四分位：${q3.toFixed(2)}<br/>
                最大值：${max.toFixed(2)}
              `;
              },
            },
          },
        ],
      };
      echartsInstances.current.boxplot.setOption(boxplotOption);
    }

    // 2. 更新均值/方差折线图
    if (echartsInstances.current.meanVarianceLine) {
      const lineOption = {
        ...commonEchartOptions,
        title: { text: "数学期望 & 方差（按抢红包顺序）", left: "center" },
        legend: { data: ["数学期望", "方差"], top: 30 },
        xAxis: {
          type: "category",
          data: Array.from(
            { length: config.packetCount },
            (_, i) => `第${i + 1}个`
          ),
        },
        yAxis: [
          { type: "value", name: "数学期望（元）" },
          { type: "value", name: "方差", right: "5%" },
        ],
        series: [
          {
            name: "数学期望",
            type: "line",
            data: result.avgByOrder.map((v) => v.toFixed(2)),
            yAxisIndex: 0,
            itemStyle: { color: "#1890ff" },
            smooth: true,
          },
          {
            name: "方差",
            type: "line",
            data: result.varianceByOrder.map((v) => v.toFixed(4)),
            yAxisIndex: 1,
            itemStyle: { color: "#f5222d" },
            smooth: true,
          },
        ],
      };
      echartsInstances.current.meanVarianceLine.setOption(lineOption);
    }

    // 3. 更新频率分布柱状图
    if (echartsInstances.current.frequency) {
      const frequencyOption = {
        ...commonEchartOptions,
        title: { text: "红包金额频率分布", left: "center" },
        xAxis: {
          type: "category",
          data: Array.from(
            { length: config.packetCount },
            (_, i) => `第${i + 1}个`
          ),
        },
        yAxis: { type: "value", name: "出现频率" },
        series: result.frequencyData.map((data, idx) => ({
          name: `金额区间${idx + 1}`,
          type: "bar",
          data: data,
        })),
      };
      echartsInstances.current.frequency.setOption(frequencyOption);
    }

    // 4. 更新红包金额与红包顺序折线图
    if (echartsInstances.current.amountOrderLine) {
      const newLineOption = {
        ...commonEchartOptions,
        title: { text: "红包金额与红包顺序", left: "center" },
        xAxis: {
          type: "category",
          data: Array.from(
            { length: config.packetCount },
            (_, i) => `第${i + 1}个`
          ),
        },
        yAxis: { type: "value", name: "金额（元）" },
        series: result.allAmounts.map((data, idx) => ({
          name: `实验${idx + 1}`,
          type: "line",
          data: data.map((v) => v.toFixed(2)),
          smooth: true,
        })),
      };
      echartsInstances.current.amountOrderLine.setOption(newLineOption);
    }
  }, [result, config, commonEchartOptions]);

  // 单轮抢红包模拟
  const simulateSingleExperiment = useCallback((): number[] => {
    const { totalAmount, packetCount, distributionType, paramA, paramB } =
      config;
    const amounts: number[] = [];
    let remainingAmount = totalAmount;
    let remainingCount = packetCount;

    // 生成每个红包的金额
    for (let i = 0; i < packetCount - 1; i++) {
      // 生成随机数并归一化到 [0, remainingAmount/remainingCount * 2]
      const randomVal = Math.abs(
        getRandomByDistribution(distributionType, paramA, paramB,totalAmount,packetCount)
      );
      const maxAmount = (remainingAmount / remainingCount) * 2;
      const amount = Math.min(
        randomVal % maxAmount,
        remainingAmount - 0.01 * (remainingCount - 1)
      );
      amounts.push(Number(amount.toFixed(2)));
      remainingAmount -= amount;
      remainingCount--;
    }

    // 最后一个红包取剩余金额
    amounts.push(Number(remainingAmount.toFixed(2)));
    return amounts;
  }, [config]);

  // 批量模拟实验
  const runSimulation = useCallback(() => {
    if (isSimulating) return;

    setIsSimulating(true);
    const allAmounts: number[][] = [];
    const tempData: number[][] = Array.from(
      { length: config.packetCount },
      () => []
    );
    let currentExperiment = 0;

    // 定时器模拟（避免阻塞主线程）
    timerRef.current = window.setInterval(() => {
      if (currentExperiment >= config.experimentTimes) {
        window.clearInterval(timerRef.current!);
        timerRef.current = null;
        setIsSimulating(false);

        // 计算统计结果
        const avgByOrder: number[] = [];
        const varianceByOrder: number[] = [];
        const boxplotData: number[][] = [];
        const frequencyData: number[][] = [];

        // 1. 计算均值、方差、箱型图数据
        for (let i = 0; i < config.packetCount; i++) {
          const orderData = tempData[i].sort((a, b) => a - b);
          const avg =
            orderData.reduce((sum, val) => sum + val, 0) / orderData.length;
          const variance = calculateVariance(orderData, avg);

          avgByOrder.push(avg);
          varianceByOrder.push(variance);

          // 箱型图数据：[min, Q1, median, Q3, max]
          const len = orderData.length;
          const min = orderData[0];
          const max = orderData[len - 1];
          const median =
            len % 2 === 0
              ? (orderData[len / 2 - 1] + orderData[len / 2]) / 2
              : orderData[Math.floor(len / 2)];
          const q1 = orderData[Math.floor(len / 4)];
          const q3 = orderData[Math.floor((len * 3) / 4)];
          boxplotData.push([min, q1, median, q3, max]);
        }

        // 2. 计算频率分布
        frequencyData.push(...calculateFrequencyData(tempData, config));

        // 更新结果
        setResult({
          allAmounts,
          avgByOrder,
          varianceByOrder,
          boxplotData,
          frequencyData,
        });
        return;
      }

      // 执行单轮实验
      const amounts = simulateSingleExperiment();
      allAmounts.push(amounts);
      amounts.forEach((val, idx) => tempData[idx].push(val));
      currentExperiment++;
    }, 10); // 模拟速度：10ms/次
  }, [config, isSimulating, simulateSingleExperiment]);

  // 重置模拟
  const resetSimulation = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsSimulating(false);
    setResult(null);

    // 清空图表
    Object.values(echartsInstances.current).forEach((instance) => {
      instance?.clear();
    });
  }, []);

  // 处理参数变化
  const handleConfigChange = (key: keyof RedPacketConfig, value: number) => {
    if (isSimulating) return;
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleDistributionTypeChange = (value: string) => {
    if (isSimulating) return;
    setConfig((prev) => ({
      ...prev,
      distributionType: value as RedPacketConfig["distributionType"],
    }));
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <Card className="shadow-lg mb-6">
        <Title level={3} className="mb-4 text-center">
          抢红包概率模拟
        </Title>
        <Paragraph type="secondary" className="text-center mb-8">
          模拟不同分布规则下抢红包的金额分配规律，支持均匀分布、正态分布、指数分布，可视化展示金额分布特征
        </Paragraph>

        {/* 参数配置区域 */}
        <Form layout="vertical" className="mb-8">
          <Row gutter={[24, 24]}>
            {/* 基础参数 */}
            <Col xs={24} md={12} lg={6}>
              <Form.Item label="红包总金额（元）">
                <Space className="w-full">
                  <Text>{config.totalAmount} 元</Text>

                  <InputNumber
                    min={1}
                    max={1000}
                    value={config.totalAmount}
                    onChange={(v) =>
                      handleConfigChange("totalAmount", v ? v : 0)
                    }
                    disabled={isSimulating}
                    className="w-full"
                  />
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Form.Item label="红包个数">
                <Space className="w-full">
                  <Text>{config.packetCount} 个</Text>

                  <InputNumber
                    min={1}
                    max={100}
                    value={config.packetCount}
                    onChange={(v) =>
                      handleConfigChange("packetCount", v ? v : 0)
                    }
                    disabled={isSimulating}
                    className="w-full"
                  />
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Form.Item label="实验次数">
                <Space className="w-full">
                  <Text>{config.experimentTimes} 次</Text>

                  <InputNumber
                    min={100}
                    max={10000}
                    step={100}
                    value={config.experimentTimes}
                    onChange={(v) =>
                      handleConfigChange("experimentTimes", v ? v : 0)
                    }
                    disabled={isSimulating}
                    className="w-full"
                  />
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} md={12} lg={6}>
              <Form.Item label="随机数分布类型">
                <Select
                  value={config.distributionType}
                  onChange={handleDistributionTypeChange}
                  disabled={isSimulating}
                  className="w-full"
                >
                  <Option value="uniform">均匀分布</Option>
                  <Option value="normal">正态分布</Option>
                  <Option value="exponential">指数分布</Option>
                </Select>
                <Space className="mt-2 w-full">
                  <Input
                    placeholder={
                      config.distributionType === "uniform"
                        ? "分布参数A（均匀：最小值）"
                        : config.distributionType === "normal"
                        ? "分布参数A（正态：均值）"
                        : "分布参数A（指数：λ）"
                    }
                    value={config.paramA}
                    onChange={(e) =>
                      handleConfigChange("paramA", Number(e.target.value))
                    }
                    disabled={isSimulating}
                    type="number"
                  />
                  <Input
                    placeholder={
                      config.distributionType === "uniform"
                        ? "分布参数B（均匀：最大值，最大值为1）"
                        : config.distributionType === "normal"
                        ? "分布参数B（正态：标准差）"
                        : "分布参数B（指数：无）"
                    }
                    value={config.paramB}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (config.distributionType === "uniform" && value > 1) {
                        handleConfigChange("paramB", 1);
                      } else {
                        handleConfigChange("paramB", value);
                      }
                    }}
                    disabled={isSimulating}
                    type="number"
                    max={config.distributionType === "uniform" ? 1 : undefined}
                  />
                </Space>
              </Form.Item>
            </Col>
          </Row>

          {/* 操作按钮 */}
          <Space className="flex justify-center mt-4">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={runSimulation}
              disabled={isSimulating}
              size="large"
              className="bg-blue-600 hover:bg-blue-700"
            >
              开始模拟
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetSimulation}
              disabled={isSimulating}
              size="large"
              className="bg-gray-200 hover:bg-gray-300"
            >
              重置
            </Button>
          </Space>
        </Form>

        <Divider />

        {/* 统计结果 */}
        {result && (
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} md={8}>
              <Statistic
                title="平均单个红包金额"
                value={(config.totalAmount / config.packetCount).toFixed(2)}
                suffix="元"
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="整体数学期望"
                value={
                  result.avgByOrder.reduce((sum, val) => sum + val, 0) /
                    result.avgByOrder.length || 0
                }
                formatter={(value) => `${Number(value).toFixed(2)} 元`}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="整体方差"
                value={
                  result.varianceByOrder.reduce((sum, val) => sum + val, 0) /
                    result.varianceByOrder.length || 0
                }
                formatter={(value) => Number(value).toFixed(4)}
              />
            </Col>
          </Row>
        )}

        {/* 可视化图表区域 */}
        <Spin spinning={isSimulating} tip="模拟中...">
          <Row gutter={[24, 24]}>
            {/* 箱型图 */}
            <Col xs={24} md={12} lg={12}>
              <Card title="红包金额箱型图" className="h-full">
                <div
                  ref={boxplotRef}
                  className="w-full h-100 border-gray-200 rounded-lg overflow-hidden"
                />
              </Card>
            </Col>

            {/* 均值/方差折线图 */}
            <Col xs={24} md={12} lg={12}>
              <Card title="均值 & 方差趋势" className="h-full">
                <div
                  ref={meanVarianceLineRef}
                  className="w-full h-100  border-gray-200 rounded-lg overflow-hidden"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* 频率分布柱状图 */}
            <Col xs={24} md={12} lg={12}>
              <Card title="金额频率分布" className="h-full">
                <div
                  ref={frequencyRef}
                  className="w-full h-100  border-gray-200 rounded-lg overflow-hidden"
                />
              </Card>
            </Col>

            {/* 红包金额与红包顺序折线图 */}
            <Col xs={24} md={12} lg={12}>
              <Card title="红包金额与红包顺序" className="h-full">
                <div
                  ref={amountOrderLineRef}
                  className="w-full h-100  border-gray-200 rounded-lg overflow-hidden"
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </Card>
    </div>
  );
};

export default RedPacketSimulation;
