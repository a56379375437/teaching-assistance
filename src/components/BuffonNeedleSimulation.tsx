import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  InputNumber,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
} from 'antd'
import { ReloadOutlined, PlayCircleOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const BuffonNeedleSimulation: React.FC = () => {
  // 参数状态
  const [lineDistance, setLineDistance] = useState<number>(10)
  const [needleLength, setNeedleLength] = useState<number>(8)
  const [totalTrials, setTotalTrials] = useState<number>(100000)

  // 结果状态
  const [intersectCount, setIntersectCount] = useState<number>(0)
  const [piApproximation, setPiApproximation] = useState<number>(0)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 初始化画布（仅绘制背景平行线）
  const drawBackground = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = 400
    const d = lineDistance * 20 // 缩放比例

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#00FF00'
    ctx.lineWidth = 1

    for (let y = 0; y < canvas.height; y += d) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
  }, [lineDistance])

  useEffect(() => {
    drawBackground()
  }, [drawBackground])

  // 执行模拟
  const runSimulation = async () => {
    setIsSimulating(true)
    setIntersectCount(0)
    setProgress(0)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (ctx) drawBackground()

    let currentIntersects = 0
    const batchSize = 10000 // 分批处理防止卡顿
    const total = totalTrials
    const L = needleLength
    const d = lineDistance

    // 内部运行逻辑
    for (let i = 0; i < total; i += batchSize) {
      const currentBatch = Math.min(batchSize, total - i)

      for (let j = 0; j < currentBatch; j++) {
        // 核心数学改进
        // 针中心距离最近平行线的距离 h，范围 [0, d/2]
        const h = Math.random() * (d / 2)
        // 针与平行线的夹角 theta，范围 [0, PI/2]
        const theta = Math.random() * (Math.PI / 2)

        // 判断相交条件: h <= (L/2) * sin(theta)
        if (h <= (L / 2) * Math.sin(theta)) {
          currentIntersects++
        }

        // 仅可视化前 500 根针
        if (i + j < 500 && ctx && canvas) {
          drawSingleNeedle(ctx, canvas, L, d)
        }
      }

      // 更新进度和临时结果
      setIntersectCount(currentIntersects)
      const prob = currentIntersects / (i + currentBatch)
      setPiApproximation(prob > 0 ? (2 * L) / (d * prob) : 0)
      setProgress(Math.round(((i + currentBatch) / total) * 100))

      // 给浏览器喘息机会，防止 UI 冻结
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    setIsSimulating(false)
  }

  // 随机绘制一根针（仅用于展示）
  const drawSingleNeedle = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    L: number,
    d: number
  ) => {
    const scale = 20
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const angle = Math.random() * Math.PI * 2

    const x1 = x - ((L * scale) / 2) * Math.cos(angle)
    const y1 = y - ((L * scale) / 2) * Math.sin(angle)
    const x2 = x + ((L * scale) / 2) * Math.cos(angle)
    const y2 = y + ((L * scale) / 2) * Math.sin(angle)

    // 判断这根可视化的针是否相交
    const dPixels = d * scale
    const yMin = Math.min(y1, y2)
    const yMax = Math.max(y1, y2)
    // 如果针跨越了 n * dPixels 的线
    const isIntersect =
      Math.floor(yMin / dPixels) !== Math.floor(yMax / dPixels)

    ctx.beginPath()
    ctx.strokeStyle = isIntersect
      ? 'rgba(239, 68, 68, 0.6)'
      : 'rgba(59, 130, 246, 0.4)'
    ctx.lineWidth = 1
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  return (
    <Card className="mx-auto my-10 shadow-2xl">
      <Title level={2} className="text-center">
        蒲丰投针（Buffon's Needle）实验
      </Title>

      <Row gutter={24}>
        <Col span={16}>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative">
            <canvas ref={canvasRef} className="w-full block" />
            {isSimulating && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <Progress type="circle" percent={progress} />
              </div>
            )}
          </div>
        </Col>

        <Col span={8}>
          <div className="w-full flex flex-col gap-4">
            {/* 数据统计展示区域 */}
            <Space size="middle" className="w-full justify-between flex-wrap">
              <Statistic
                title="π 近似值"
                value={piApproximation}
                precision={6}
                styles={{ content: { color: '#3f8600' } }}
              />
              <Statistic title="相交次数" value={intersectCount} />
              <Statistic title="总尝试次数" value={totalTrials} />
            </Space>

            {/* 模拟参数配置区域 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <Text strong className="text-base">
                参数设置
              </Text>
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <Text>线间距 (d)</Text>
                  <InputNumber
                    min={5}
                    max={20}
                    value={lineDistance}
                    onChange={v => setLineDistance(v || 10)}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Text>针长 (L)</Text>
                  <InputNumber
                    min={1}
                    max={lineDistance}
                    value={needleLength}
                    onChange={v => setNeedleLength(v || 8)}
                    className="w-full mt-1"
                  />
                </div>
                <div>
                  <Text>模拟样本量</Text>
                  <InputNumber
                    min={1000}
                    max={10000000}
                    step={10000}
                    value={totalTrials}
                    onChange={v => setTotalTrials(v || 100000)}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            </div>

            {/* 功能操作按钮区域 */}
            <div className="flex flex-col gap-3">
              <Button
                type="primary"
                block
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={runSimulation}
                loading={isSimulating}
              >
                开始计算
              </Button>
              <Button
                block
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              >
                重置
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default BuffonNeedleSimulation
