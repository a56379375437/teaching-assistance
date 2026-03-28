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

// 数据类型定义
interface ConvergenceDataItem {
  count: number;
  integral: number;
}

// 被积函数：y = f(x)，可自行修改
const f = (x: number): number => {
  return Math.sin(x); // 演示：sin(x)
  // return x * x;    // 也可以换成 x²
  // return Math.exp(-x * x); // 高斯函数
};

// 积分区间 [a, b]
const a = 0;
const b = Math.PI;

// 函数最大值（用于确定矩形上界）
const maxY = 1;

const MonteCarloIntegral: React.FC = () => {
  // 核心参数
  const [totalPoints, setTotalPoints] = useState<number>(2000);
  const [underCount, setUnderCount] = useState<number>(0); // 曲线下方点数
  const [totalCount, setTotalCount] = useState<number>(0); // 总点数
  const [currentIntegral, setCurrentIntegral] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 图表引用
  const scatChartRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const scatChartRefCur = useRef<echarts.ECharts | null>(null);
  const lineChartRefCur = useRef<echarts.ECharts | null>(null);
  const timerRef = useRef<number | null>(null);

  // 真实积分值（用于对比）
  const realIntegral = 2; // ∫0^π sinx dx = 2

  // ====================== 初始化两个图表 ======================
  useEffect(() => {
    // 散点图
    if (scatChartRef.current) {
      const chart = echarts.init(scatChartRef.current);
      scatChartRefCur.current = chart;
      renderScatChart([], chart);
    }
    // 收敛图
    if (lineChartRef.current) {
      const chart = echarts.init(lineChartRef.current);
      lineChartRefCur.current = chart;
      renderLineChart([], chart);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      scatChartRefCur.current?.dispose();
      lineChartRefCur.current?.dispose();
    };
  }, []);

  // ====================== 绘制散点图 ======================
  const renderScatChart = (
    points: { x: number; y: number; type: 0 | 1 }[],
    chart: echarts.ECharts,
  ) => {
    const under = points.filter((p) => p.type === 0);
    const above = points.filter((p) => p.type === 1);

    const option = {
      title: { text: "蒙特卡洛投点可视化", left: "center" },
      xAxis: { min: a, max: b, name: "x" },
      yAxis: { min: 0, max: maxY, name: "y" },
      tooltip: { trigger: "item" },
      series: [
        // 曲线
        {
          name: "f(x)=sin(x)",
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: { color: "red", width: 3 },
          data: Array.from({ length: 100 }, (_, i) => {
            const x = a + (i / 99) * (b - a);
            return [x, f(x)];
          }),
        },
        // 下方点
        {
          name: "曲线下方",
          type: "scatter",
          data: under.map((p) => [p.x, p.y]),
          symbolSize: 4,
          itemStyle: { color: "blue" },
        },
        // 上方点
        {
          name: "曲线上方",
          type: "scatter",
          data: above.map((p) => [p.x, p.y]),
          symbolSize: 4,
          itemStyle: { color: "gray" },
        },
      ],
    };
    chart.setOption(option);
  };

  // ====================== 绘制收敛曲线 ======================
  const renderLineChart = (
    data: ConvergenceDataItem[],
    chart: echarts.ECharts,
  ) => {
    const seriesData = data.map((item) => [item.count, item.integral]);
    const realLine = data.map((item) => [item.count, realIntegral]);

    const option = {
      title: { text: "积分值收敛曲线", left: "center" },
      xAxis: { name: "投点次数", type: "value" },
      yAxis: { name: "积分近似值", min: 1.5, max: 2.5 },
      series: [
        {
          name: "模拟积分值",
          type: "line",
          smooth: true,
          data: seriesData,
          lineStyle: { color: "#1677ff" },
          areaStyle: { opacity: 0.2 },
        },
        {
          name: "真实值",
          type: "line",
          data: realLine,
          lineStyle: { color: "red", type: "dashed" },
          symbol: "none",
        },
      ],
    };
    chart.setOption(option);
  };

  // ====================== 单次投点 ======================
  const throwOnePoint = () => {
    const x = a + Math.random() * (b - a);
    const y = Math.random() * maxY;
    const fx = f(x);
    return { x, y, isUnder: y <= fx };
  };

  // ====================== 开始模拟 ======================
  const startSimulate = () => {
    if (isSimulating) return;
    reset();
    setIsSimulating(true);

    let count = 0;
    let under = 0;
    const points: { x: number; y: number; type: 0 | 1 }[] = [];
    const convData: ConvergenceDataItem[] = [];

    timerRef.current = window.setInterval(() => {
      if (count >= totalPoints) {
        clearInterval(timerRef.current!);
        setIsSimulating(false);
        return;
      }

      count++;
      const p = throwOnePoint();
      if (p.isUnder) under++;

      // 每10次更新一次图表，避免卡顿
      if (count % 10 === 0 || count === totalPoints) {
        const integral = (under / count) * (b - a) * maxY;
        points.push({ x: p.x, y: p.y, type: p.isUnder ? 0 : 1 });
        convData.push({ count, integral });

        setTotalCount(count);
        setUnderCount(under);
        setCurrentIntegral(integral);

        if (scatChartRefCur.current)
          renderScatChart(points, scatChartRefCur.current);
        if (lineChartRefCur.current)
          renderLineChart(convData, lineChartRefCur.current);
      }
    }, 10);
  };

  // ====================== 重置 ======================
  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSimulating(false);
    setTotalCount(0);
    setUnderCount(0);
    setCurrentIntegral(0);
    if (scatChartRefCur.current) renderScatChart([], scatChartRefCur.current);
    if (lineChartRefCur.current) renderLineChart([], lineChartRefCur.current);
  };

  // ====================== 界面 ======================
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="shadow-md">
        <Title level={4}>蒙特卡洛法求定积分 ∫₀^π sin(x) dx</Title>
        <Text type="secondary">直观展示随机投点、积分值收敛过程</Text>

        <Row gutter={16} className="mt-4 mb-4">
          <Col xs={16}>
            <Space>
              <Text>投点总数：</Text>
              <InputNumber
                min={500}
                max={20000}
                step={500}
                value={totalPoints}
                onChange={(v) => v && setTotalPoints(v)}
                disabled={isSimulating}
              />
            </Space>
          </Col>
          <Col xs={8}>
            <Space>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={startSimulate}
                disabled={isSimulating}
              >
                开始模拟
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={reset}
                disabled={isSimulating}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>

        <Row gutter={16} className="mb-4">
          <Col xs={8}>
            <Statistic
              title="总投点数"
              value={totalCount}
              valueStyle={{ color: "#666" }}
            />
          </Col>
          <Col xs={8}>
            <Statistic
              title="曲线下方点数"
              value={underCount}
              valueStyle={{ color: "blue" }}
            />
          </Col>
          <Col xs={8}>
            <Statistic
              title="当前积分值"
              value={currentIntegral.toFixed(4)}
              valueStyle={{ color: "red" }}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div ref={scatChartRef} className="w-full h-100" />
          </Col>
          <Col xs={24} md={12}>
            <div ref={lineChartRef} className="w-full h-100" />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MonteCarloIntegral;
