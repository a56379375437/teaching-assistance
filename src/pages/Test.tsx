import React, { useState, useRef, useEffect } from "react";
import {
  InputNumber,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
} from "antd";
import { ReloadOutlined, PlayCircleOutlined } from "@ant-design/icons";
import * as echarts from "echarts";

const { Title, Text } = Typography;

// 1. 定义频率数据类型
interface FrequencyDataItem {
  toss: number;
  frequency: number;
}

// 抛硬币模拟组件
const CoinTossSimulation: React.FC = () => {
  // 核心参数
  const [totalTosses, setTotalTosses] = useState<number>(1000); // 总抛硬币次数
  const [headsCount, setHeadsCount] = useState<number>(0); // 正面次数
  const [tailsCount, setTailsCount] = useState<number>(0); // 反面次数
  const [, setFrequencyData] = useState<FrequencyDataItem[]>([]); // 频率数据
  const [isSimulating, setIsSimulating] = useState<boolean>(false); // 是否正在模拟
  const chartRef = useRef<HTMLDivElement>(null); // ECharts 容器引用
  const simulationRef = useRef<number | null>(null); // 定时器引用（浏览器环境为number）
  const chartInstanceRef = useRef<echarts.ECharts | null>(null); // ECharts 实例引用

  // 初始化 ECharts 实例
  useEffect(() => {
    if (!chartRef.current) return;

    // 创建 ECharts 实例
    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    // 配置图表基础选项（完全兼容ECharts类型）
    const chartOption = {
      title: {
        text: "抛硬币正面出现频率变化曲线",
        left: "center",
        textStyle: { fontSize: 14, color: "#333" },
      },
      xAxis: {
        name: "抛硬币次数",
        type: "value",
        min: 0,
        max: totalTosses,
        axisLabel: { fontSize: 12 },
      },
      yAxis: {
        name: "正面出现频率",
        type: "value",
        min: 0,
        max: 1,
        interval: 0.1,
        axisLabel: { fontSize: 12 },
      },
      tooltip: {
        trigger: "axis",
        // 修复：使用通用函数类型，避免依赖ECharts导出类型
        formatter: function (params: { data: [number, number] }[]) {
          // 从ECharts原生数据中提取次数和频率
          const toss = params[0].data[0] as number;
          const frequency = params[0].data[1] as number;
          return `次数：${toss}<br/>频率：${frequency.toFixed(4)}`;
        },
      },
      series: [
        {
          name: "正面频率",
          type: "line",
          data: [] as [number, number][], // [次数, 频率] 二维数组
          smooth: true,
          lineStyle: { color: "#1677ff", width: 2 },
          symbol: "none",
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(22, 119, 255, 0.3)" },
              { offset: 1, color: "rgba(22, 119, 255, 0.05)" },
            ]),
          },
        },
        {
          name: "理论概率(0.5)",
          type: "line",
          data: Array.from({ length: totalTosses + 1 }, (_, i) => [i, 0.5]) as [
            number,
            number
          ][],
          lineStyle: { color: "#f53f3f", type: "dashed", width: 1 },
          symbol: "none",
          tooltip: { show: false },
        },
      ],
      grid: {
        left: "5%",
        right: "5%",
        top: "15%",
        bottom: "10%",
      },
    };

    chart.setOption(chartOption);

    // 清理函数
    return () => {
      if (simulationRef.current !== null) {
        window.clearInterval(simulationRef.current);
      }
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // 监听总次数变化，更新图表X轴最大值
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    chartInstanceRef.current.setOption({
      xAxis: { max: totalTosses },
      series: [
        {
          name: "理论概率(0.5)",
          data: Array.from({ length: totalTosses + 1 }, (_, i) => [i, 0.5]) as [
            number,
            number
          ][],
        },
      ],
    });
  }, [totalTosses]);

  // 单次抛硬币（返回是否正面）
  const tossCoin = (): boolean => {
    return Math.random() > 0.5;
  };

  // 开始/暂停模拟
  const toggleSimulation = () => {
    if (isSimulating) {
      // 暂停模拟
      if (simulationRef.current !== null) {
        window.clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
      setIsSimulating(false);
      return;
    }

    // 重置之前的模拟数据
    resetSimulation();
    setIsSimulating(true);

    let currentToss = 0;
    let currentHeads = 0;
    const newFrequencyData: FrequencyDataItem[] = [];

    // 模拟定时器（浏览器环境使用window.setInterval）
    simulationRef.current = window.setInterval(() => {
      if (currentToss >= totalTosses) {
        // 模拟结束
        window.clearInterval(simulationRef.current!); // 非空断言：此时定时器一定存在
        simulationRef.current = null;
        setIsSimulating(false);
        return;
      }

      // 抛硬币并统计
      currentToss++;
      const isHead = tossCoin();
      if (isHead) currentHeads++;

      // 计算频率（每10次记录一次数据，减少渲染压力）
      if (currentToss % 10 === 0 || currentToss === totalTosses) {
        const frequency = currentHeads / currentToss;
        newFrequencyData.push({ toss: currentToss, frequency });

        // 更新状态
        setHeadsCount(currentHeads);
        setTailsCount(currentToss - currentHeads);
        setFrequencyData([...newFrequencyData]);

        // 更新图表数据
        if (chartInstanceRef.current) {
          const chartData = newFrequencyData.map((item) => [
            item.toss,
            item.frequency,
          ]) as [number, number][];
          chartInstanceRef.current.setOption({
            series: [
              {
                name: "正面频率",
                data: chartData,
              },
            ],
          });
        }
      }
    }, 10); // 模拟速度：数值越小越快
  };

  // 重置模拟
  const resetSimulation = () => {
    if (simulationRef.current !== null) {
      window.clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setIsSimulating(false);
    setHeadsCount(0);
    setTailsCount(0);
    setFrequencyData([]);
    // 重置图表
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption({
        series: [{ name: "正面频率", data: [] as [number, number][] }],
      });
    }
  };

  // 限制总次数范围（处理InputNumber的null值）
  const handleTossesChange = (value: number | null) => {
    if (value === null) return;
    const clampedValue = Math.max(100, Math.min(100000, value));
    setTotalTosses(clampedValue);
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg mb-6">
        <Title level={3} className="mb-4">
          多次抛硬币概率模拟
        </Title>
        <Text type="secondary" className="mb-6 block">
          原理：根据大数定律，随着抛硬币次数增加，正面出现的频率会逐渐趋近于理论概率
          0.5
        </Text>

        {/* 参数调节区域 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={16}>
            <Space className="w-full">
              <Text>总抛硬币次数：{totalTosses} 次</Text>
              {/* <Slider
                min={100}
                max={100000}
                step={100}
                value={totalTosses}
                onChange={handleTossesChange}
                disabled={isSimulating}
                // dots // 添加此属性使滑块只能在刻度点上移动
                className="w-full"
              /> */}
              <InputNumber
                min={100}
                max={100000}
                step={100}
                value={totalTosses}
                onChange={handleTossesChange}
                disabled={isSimulating}
                className="w-full"
              />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space className="h-full items-center justify-center">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={toggleSimulation}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="large"
              >
                {isSimulating ? "暂停模拟" : "开始模拟"}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetSimulation}
                disabled={isSimulating}
                className="bg-gray-200 hover:bg-gray-300"
                size="large"
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 结果统计 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={8}>
            <Statistic
              title="正面次数"
              value={headsCount}
              valueStyle={{ color: "#1677ff" }}
            />
          </Col>
          <Col xs={8}>
            <Statistic
              title="反面次数"
              value={tailsCount}
              valueStyle={{ color: "#767676" }}
            />
          </Col>
          <Col xs={8}>
            <Statistic
              title="正面频率"
              value={(headsCount / (headsCount + tailsCount) || 0).toFixed(4)}
              valueStyle={{ color: "#f53f3f" }}
            />
          </Col>
        </Row>

        {/* 可视化图表容器 */}
        <div
          ref={chartRef}
          className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white"
        />
      </Card>
    </div>
  );
};

export default CoinTossSimulation;
