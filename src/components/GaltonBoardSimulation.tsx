// 高尔顿钉板模拟

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Row,
  Col,
  Statistic,
  Button,
  Slider,
  Typography,
  Tag,
  Flex,
  Tooltip,
} from 'antd'
import {
  PlayCircleOutlined,
  ReloadOutlined,
  PauseCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

const { Text } = Typography

interface Ball {
  x: number
  y: number
  layer: number
  vx: number
  vy: number
}

const GaltonBoardSimulation: React.FC = () => {
  const [ballCount, setBallCount] = useState(500)
  const [layers, setLayers] = useState(12)
  const [isSimulating, setIsSimulating] = useState(false)
  const [processedCount, setProcessedCount] = useState(0) // 已产生的球
  const [finishedCount, setFinishedCount] = useState(0) // 已进入槽位的球

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resultsRef = useRef<number[]>([])
  const activeBallsRef = useRef<Ball[]>([])
  const requestRef = useRef<number>(0)

  const BALL_RADIUS = 3.5
  const GRAVITY = 0.25
  const BIN_COUNT = layers + 1

  const initBoard = useCallback(() => {
    resultsRef.current = new Array(layers + 1).fill(0)
    activeBallsRef.current = []
    setProcessedCount(0)
    setFinishedCount(0)
    draw()
  }, [layers])

  useEffect(() => {
    initBoard()
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initBoard])

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.offsetWidth
    const height = 400
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height

    ctx.clearRect(0, 0, width, height)

    const spacingY = (height - 160) / layers
    const spacingX = Math.min(width / (layers + 4), spacingY * 1.2)
    const startY = 40
    const centerX = width / 2

    // 1. 绘制钉子
    ctx.fillStyle = '#d9d9d9'
    for (let i = 0; i < layers; i++) {
      const rowY = startY + i * spacingY
      const rowCount = i + 1
      const rowWidth = (rowCount - 1) * spacingX
      const startX = centerX - rowWidth / 2
      for (let j = 0; j < rowCount; j++) {
        ctx.beginPath()
        ctx.arc(startX + j * spacingX, rowY, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 2. 绘制正在下落的小球
    ctx.fillStyle = '#ff4d4f'
    activeBallsRef.current.forEach(ball => {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    })

    // 3. 绘制统计柱状图
    const binWidth = width / BIN_COUNT
    const maxInBin = Math.max(...resultsRef.current, 5)
    resultsRef.current.forEach((count, i) => {
      const barHeight = (count / (maxInBin * 1.1)) * 120
      const x = i * binWidth
      ctx.fillStyle = 'rgba(24, 144, 255, 0.75)'
      ctx.fillRect(
        x + binWidth * 0.1,
        height - barHeight,
        binWidth * 0.8,
        barHeight
      )
      ctx.strokeStyle = '#f0f0f0'
      ctx.strokeRect(x, height - 120, binWidth, 120)
    })
  }

  const updatePhysics = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = canvas.width
    const height = canvas.height
    const spacingY = (height - 160) / layers
    const spacingX = Math.min(width / (layers + 4), spacingY * 1.2)
    const startY = 40

    activeBallsRef.current = activeBallsRef.current.filter(ball => {
      ball.vy += GRAVITY
      ball.x += ball.vx
      ball.y += ball.vy

      const currentLayerY = startY + ball.layer * spacingY
      if (ball.layer < layers && ball.y >= currentLayerY) {
        const direction = Math.random() > 0.5 ? 1 : -1
        ball.vx = direction * (spacingX / 12)
        ball.vy = 1.5
        ball.layer++
      }

      if (ball.y >= height - 5) {
        const binWidth = width / BIN_COUNT
        let binIdx = Math.floor(ball.x / binWidth)
        binIdx = Math.max(0, Math.min(layers, binIdx))
        resultsRef.current[binIdx]++
        setFinishedCount(prev => prev + 1) // 每落入一个球，更新一次计数
        return false
      }
      return true
    })
  }

  const animate = () => {
    // 核心停止逻辑：如果已入槽球数达到了总数，彻底停止
    if (finishedCount >= ballCount) {
      setIsSimulating(false)
      cancelAnimationFrame(requestRef.current)
      return
    }

    // 产生球逻辑
    if (
      isSimulating &&
      processedCount < ballCount &&
      activeBallsRef.current.length < 20
    ) {
      activeBallsRef.current.push({
        x: canvasRef.current!.width / 2 + (Math.random() - 0.5) * 4,
        y: 10,
        layer: 0,
        vx: 0,
        vy: 1,
      })
      setProcessedCount(prev => prev + 1)
    }

    updatePhysics()
    draw()

    // 只要还有球在空中，或者模拟开关开着且还没发完球，就继续动画
    if (isSimulating || activeBallsRef.current.length > 0) {
      requestRef.current = requestAnimationFrame(animate)
    }
  }

  // 监听 finishedCount 的变化，当达到目标时停止模拟
  useEffect(() => {
    if (finishedCount >= ballCount && ballCount > 0) {
      setIsSimulating(false)
    }
  }, [finishedCount, ballCount])

  // 快速演算
  const runQuickCalc = () => {
    setIsSimulating(false)
    cancelAnimationFrame(requestRef.current)
    const newResults = new Array(layers + 1).fill(0)
    for (let i = 0; i < ballCount; i++) {
      let position = 0
      for (let l = 0; l < layers; l++) {
        if (Math.random() > 0.5) position++
      }
      newResults[position]++
    }
    resultsRef.current = newResults
    setProcessedCount(ballCount)
    setFinishedCount(ballCount)
    setTimeout(draw, 50)
  }

  useEffect(() => {
    if (isSimulating) {
      requestRef.current = requestAnimationFrame(animate)
    }
    return () => cancelAnimationFrame(requestRef.current)
  }, [isSimulating])

  const handleToggle = () => {
    // 如果已经完成了一轮，点击按钮则重置
    if (finishedCount >= ballCount) {
      initBoard()
      // 使用 setTimeout，确保 initBoard 的状态已同步
      setTimeout(() => setIsSimulating(true), 0)
    } else {
      setIsSimulating(!isSimulating)
    }
  }

  return (
    <Row gutter={24} align="middle">
      <Col span={15}>
        <div className="relative bg-white p-2 rounded border border-gray-100 overflow-hidden shadow-inner">
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '400px',
              display: 'block',
              touchAction: 'none',
            }}
          />

          {isSimulating && (
            <div className="absolute top-4 left-4">
              <Tag color="processing" className="animate-pulse">
                实时物理模拟中...
              </Tag>
            </div>
          )}
          {!isSimulating && finishedCount >= ballCount && finishedCount > 0 && (
            <div className="absolute top-4 left-4">
              <Tag color="success">模拟完成</Tag>
            </div>
          )}
        </div>
      </Col>

      <Col span={9} className="border-l border-gray-100 pl-6">
        <Flex vertical gap="middle" className="w-full">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <Text strong className="block mb-1">
                下落总球数 (N)
              </Text>
              <Slider
                min={100}
                max={5000}
                step={100}
                value={ballCount}
                onChange={setBallCount}
                disabled={
                  isSimulating ||
                  (finishedCount > 0 && finishedCount < ballCount)
                }
              />
            </div>

            <div className="mb-4">
              <Text strong className="block mb-1">
                钉子层数 (Layers)
              </Text>
              <Slider
                min={5}
                max={20}
                step={1}
                value={layers}
                onChange={setLayers}
                disabled={isSimulating || finishedCount > 0}
              />
            </div>

            <Flex vertical gap="small">
              <Button
                type="primary"
                block
                size="large"
                icon={
                  isSimulating ? (
                    <PauseCircleOutlined />
                  ) : (
                    <PlayCircleOutlined />
                  )
                }
                onClick={handleToggle}
                danger={isSimulating}
              >
                {isSimulating
                  ? '暂停模拟'
                  : finishedCount >= ballCount
                    ? '重新开始'
                    : '开始下落'}
              </Button>

              <Tooltip title="跳过动画，直接获取统计结果">
                <Button
                  block
                  icon={<ThunderboltOutlined />}
                  onClick={runQuickCalc}
                  disabled={
                    isSimulating ||
                    (finishedCount > 0 && finishedCount < ballCount)
                  }
                >
                  快速演算 (极速)
                </Button>
              </Tooltip>

              <Button
                block
                icon={<ReloadOutlined />}
                onClick={() => {
                  setIsSimulating(false)
                  initBoard()
                }}
              >
                重置实验
              </Button>
            </Flex>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Statistic
              title="已入槽球数"
              value={finishedCount}
              suffix={`/ ${ballCount}`}
            />
            <Statistic title="当前层数" value={layers} />

            <div className="col-span-2 p-3 bg-blue-50 rounded">
              <Text type="secondary" className="text-[11px] leading-relaxed">
                <strong>原理：</strong>
                每个球在每层钉子有50%概率左右弹跳。根据中心极限定理，大量小球路径的叠加将形成经典的钟形曲线。
              </Text>
            </div>
          </div>
        </Flex>
      </Col>
    </Row>
  )
}

export default GaltonBoardSimulation