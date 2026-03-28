import React, { useRef, useState, useEffect, useCallback } from "react";
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
import { ReloadOutlined } from "@ant-design/icons";
import type { Needle } from "../types";
import { getSecureRandom } from "../utils";

const { Title, Text } = Typography;

// 蒲丰投针模拟组件
const BuffonNeedleSimulation: React.FC = () => {
  // 核心参数：线间距d、针长L、投针次数n
  const [lineDistance, setLineDistance] = useState<number>(10); // 平行线间距，默认10
  const [needleLength, setNeedleLength] = useState<number>(6); // 针长，默认6（需小于线间距）
  const [totalTrials, setTotalTrials] = useState<number>(1000000); // 总投针次数
  const [intersectCount, setIntersectCount] = useState<number>(0); // 相交次数
  const [piApproximation, setPiApproximation] = useState<number>(0); // π的近似值
  const [, setNeedles] = useState<Needle[]>([]); // 存储针的数据
  const canvasRef = useRef<HTMLCanvasElement>(null); // Canvas 引用

  // 初始化/重置画布
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置画布尺寸（适配容器）
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = 500;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#213211";
    ctx.lineWidth = 1.5; // 线条加粗
    ctx.setLineDash([5, 3]); // 虚线样式
    const step = lineDistance * 10;
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]); // 重置为实线，避免影响针的绘制
    // ========================================================
  }, [lineDistance]);

  // 绘制单根针
  const drawNeedle = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      length: number,
      intersect: boolean,
    ) => {
      ctx.strokeStyle = intersect ? "#ef4444" : "#3b82f6"; // 相交红色，不相交蓝色
      ctx.lineWidth = 2;

      // 计算针的两个端点
      const halfLen = length / 2;
      const x1 = x - halfLen * Math.cos(angle);
      const y1 = y - halfLen * Math.sin(angle);
      const x2 = x + halfLen * Math.cos(angle);
      const y2 = y + halfLen * Math.sin(angle);

      // 绘制针
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    [],
  );

  // 模拟投针并绘制
  const simulateNeedles = useCallback(() => {
    initCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newNeedles: Needle[] = [];
    let newIntersectCount = 0;
    const step = lineDistance * 10;
    const scaledNeedleLength = needleLength * 10;

    for (let i = 0; i < totalTrials; i++) {
      // 使用高质量安全随机数
      const x = getSecureRandom() * canvas.width;
      const y = getSecureRandom() * canvas.height;
      const angle = getSecureRandom() * Math.PI;

      // 相交判断
      const distanceToLine = y % step;
      const criticalDistance = (scaledNeedleLength / 2) * Math.sin(angle);
      const intersect =
        distanceToLine < criticalDistance ||
        step - distanceToLine < criticalDistance;

      if (intersect) newIntersectCount++;
      newNeedles.push({ x, y, angle, intersect });

      // 只绘制前1000根针
      if (i < 1000) {
        drawNeedle(ctx, x, y, angle, scaledNeedleLength, intersect);
      }
    }

    setNeedles(newNeedles);
    setIntersectCount(newIntersectCount);

    // 计算π
    const probability = newIntersectCount / totalTrials;
    const pi =
      probability > 0 ? (2 * needleLength) / (lineDistance * probability) : 0;
    setPiApproximation(pi);
  }, [initCanvas, lineDistance, needleLength, totalTrials, drawNeedle]);

  // 重置模拟
  const resetSimulation = () => {
    setIntersectCount(0);
    setPiApproximation(0);
    setNeedles([]);
    initCanvas();
  };

  // 初始化画布
  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [initCanvas]);

  // 点击模拟
  const handleSimulate = () => {
    if (totalTrials <= 0 || needleLength <= 0 || lineDistance <= 0) return;
    simulateNeedles();
  };

  // 参数限制
  const handleNeedleLengthChange = (value: number | null) => {
    if (value !== null) {
      const clampedValue = Math.min(value, lineDistance);
      setNeedleLength(clampedValue);
    }
  };

  const handleLineDistanceChange = (value: number | null) => {
    if (value !== null) {
      setLineDistance(value);
      if (needleLength > value) {
        setNeedleLength(value);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="shadow-lg mb-6">
        <Title level={3} className="mb-4">
          蒲丰投针问题模拟
        </Title>
        <Text type="secondary" className="mb-6 block">
          原理：通过随机投针模拟计算π的近似值，公式：π ≈ 2L / (d *
          p)（L=针长，d=线间距，p=相交概率）
        </Text>

        {/* 参数调节 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={8}>
            <Space className="w-full">
              <Text>平行线间距 (d)：{lineDistance} cm</Text>
              <InputNumber
                min={5}
                max={20}
                step={0.5}
                value={lineDistance}
                onChange={handleLineDistanceChange}
                className="w-full"
              />
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <Space className="w-full">
              <Text>针长 (L)：{needleLength} cm（≤线间距）</Text>
              <InputNumber
                min={1}
                max={lineDistance}
                step={0.5}
                value={needleLength}
                onChange={handleNeedleLengthChange}
                className="w-full"
              />
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <Space className="w-full">
              <Text>投针总次数：{totalTrials} 次</Text>
              <InputNumber
                min={10}
                max={1000000}
                step={100}
                value={totalTrials}
                onChange={(value) => value !== null && setTotalTrials(value)}
                className="w-full"
              />
            </Space>
          </Col>
        </Row>

        {/* 按钮 */}
        <Space className="mb-6">
          <Button
            type="primary"
            onClick={handleSimulate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            开始模拟
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={resetSimulation}
            className="bg-gray-200 hover:bg-gray-300"
          >
            重置
          </Button>
        </Space>

        {/* 结果 */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={8}>
            <Statistic title="相交次数" value={intersectCount} />
          </Col>
          <Col xs={8}>
            <Statistic
              title="相交概率"
              value={
                totalTrials > 0
                  ? (intersectCount / totalTrials).toFixed(4)
                  : "0.0000"
              }
            />
          </Col>
          <Col xs={8}>
            <Statistic title="π的近似值" value={piApproximation.toFixed(4)} />
          </Col>
        </Row>

        {/* 画布 */}
        <div className="w-full h-125 border border-gray-300 rounded-lg overflow-hidden bg-white">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </Card>
    </div>
  );
};

export default BuffonNeedleSimulation;
