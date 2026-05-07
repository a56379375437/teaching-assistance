//骰子点数和模拟(DiceSumSimulation.tsx)

import React, { useState, useRef, useEffect } from 'react'
import {
  Row,
  Col,
  Statistic,
  Button,
  Slider,
  Typography,
  Flex,
  Tag,
} from 'antd'
import {
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts'

const { Text } = Typography

// 骰子点数对应的 Unicode 图标
const DICE_ICONS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

const DiceSumSimulation: React.FC = () => {
  // 实验参数
  const [diceCount, setDiceCount] = useState(3)
  const [trialCount, setTrialCount] = useState(10000)
  const [isSimulating, setIsSimulating] = useState(false)

  // 动态视觉状态：当前这组骰子的具体点数
  const [currentDice, setCurrentDice] = useState<number[]>([])

  // 统计数据
  const [stats, setStats] = useState({ currentN: 0, mean: 0, stdDev: 0 })

  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const resultsRef = useRef<number[]>([])
  const requestRef = useRef<number>(0)

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
      updateChart(diceCount, [])
    }
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  const updateChart = (n: number, data: number[]) => {
    if (!chartInstance.current) return

    const minSum = n
    const maxSum = n * 6
    const bins: { [key: number]: number } = {}
    for (let i = minSum; i <= maxSum; i++) bins[i] = 0
    data.forEach(v => bins[v]++)

    const xAxisData = Object.keys(bins)
    const seriesData = Object.values(bins)

    chartInstance.current.setOption({
      animation: false,
      tooltip: { trigger: 'axis' },
      grid: { top: 40, right: 30, bottom: 40, left: 60 },
      xAxis: { type: 'category', data: xAxisData, name: '和' },
      yAxis: {
        type: 'value',
        name: '频数',
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [
        {
          name: '分布',
          type: 'bar',
          data: seriesData,
          itemStyle: { color: '#1890ff' },
          large: true,
        },
      ],
    })
  }

  const runSimulation = () => {
    const totalCurrent = resultsRef.current.length
    if (totalCurrent >= trialCount) {
      setIsSimulating(false)
      return
    }

    // 为了平衡“视觉动画”和“演算速度”：
    // 每帧物理计算 100 次，但只更新一次视觉骰子面
    const batchSize = Math.max(1, Math.floor(trialCount / 200))
    const lastRoll: number[] = []

    for (
      let i = 0;
      i < batchSize && resultsRef.current.length < trialCount;
      i++
    ) {
      let sum = 0
      const currentRoll: number[] = []
      for (let j = 0; j < diceCount; j++) {
        const val = Math.floor(Math.random() * 6) + 1
        sum += val
        if (i === 0) currentRoll.push(val) // 只记录每批次的第一个用于视觉显示
      }
      resultsRef.current.push(sum)
      if (i === 0) lastRoll.push(...currentRoll)
    }

    // 更新视觉骰子
    setCurrentDice(lastRoll)

    // 计算统计
    const data = resultsRef.current
    const sumTotal = data.reduce((a, b) => a + b, 0)
    const mean = sumTotal / data.length
    const variance =
      data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length

    setStats({
      currentN: data.length,
      mean: mean,
      stdDev: Math.sqrt(variance),
    })

    updateChart(diceCount, data)
    requestRef.current = requestAnimationFrame(runSimulation)
  }

  const handleToggle = () => {
    if (resultsRef.current.length >= trialCount) reset()
    if (!isSimulating) {
      setIsSimulating(true)
      requestRef.current = requestAnimationFrame(runSimulation)
    } else {
      setIsSimulating(false)
      cancelAnimationFrame(requestRef.current)
    }
  }

  const reset = () => {
    cancelAnimationFrame(requestRef.current)
    setIsSimulating(false)
    resultsRef.current = []
    setCurrentDice([])
    setStats({ currentN: 0, mean: 0, stdDev: 0 })
    updateChart(diceCount, [])
  }

  return (
    <Row gutter={24} align="middle">
      <Col span={15}>
        <Flex vertical gap="middle">
          {/* 骰子动态显示区 */}
          <div className="bg-slate-100 p-6 rounded-xl flex flex-wrap justify-center items-center min-h-30 gap-4 transition-all border border-dashed border-slate-300">
            {currentDice.length > 0 ? (
              currentDice.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-white w-14 h-14 rounded-lg shadow-md flex items-center justify-center text-4xl text-blue-600 animate-bounce"
                  style={{ animationDuration: `${0.3 + Math.random() * 0.2}s` }}
                >
                  {DICE_ICONS[val - 1]}
                </div>
              ))
            ) : (
              <Text type="secondary" className="italic">
                准备开始掷骰子...
              </Text>
            )}
            {currentDice.length > 0 && (
              <div className="ml-4">
                <Tag
                  color="blue"
                  style={{ fontSize: '18px', padding: '5px 15px' }}
                >
                  本次和: {currentDice.reduce((a, b) => a + b, 0)}
                </Tag>
              </div>
            )}
          </div>

          <div
            ref={chartRef}
            className="w-full h-80 bg-white rounded"
            style={{ touchAction: 'none' }}
          />
        </Flex>
      </Col>

      <Col span={9} className="border-l border-gray-100 pl-6">
        <Flex vertical gap="middle" className="w-full">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <Text strong className="block mb-2 text-base">
                骰子数量 (n): <span className="text-blue-600">{diceCount}</span>
              </Text>
              <Slider
                min={1}
                max={15} // 限制下显示数量，避免 UI 过挤
                value={diceCount}
                onChange={v => {
                  setDiceCount(v)
                  reset()
                }}
                disabled={isSimulating}
              />
              <Text type="secondary" className="text-[11px]">
                注：独立同分布的骰子点数之和，其分布趋于正态分布。
              </Text>
            </div>

            <div className="mb-4">
              <Text strong className="block mb-2 text-base">
                实验样本量 (N):{' '}
                <span className="text-blue-600">{trialCount}</span>
              </Text>
              <Slider
                min={1000}
                max={100000}
                step={1000}
                value={trialCount}
                onChange={setTrialCount}
                disabled={isSimulating}
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
                {isSimulating ? '暂停模拟' : '开始掷骰子'}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={reset}>
                重置
              </Button>
            </Flex>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Statistic title="已掷次数" value={stats.currentN} />
            <Statistic
              title="当前平均和"
              value={stats.mean}
              precision={2}
              styles={{ content: { color: '#1890ff' } }}
            />
            <Statistic title="标准差" value={stats.stdDev} precision={2} />
            <Statistic title="理论期望" value={diceCount * 3.5} precision={1} />
          </div>

          <div className="p-3 bg-blue-50 rounded border border-blue-100">
            <Text type="secondary" className="text-xs leading-relaxed">
              <strong>教学提示：</strong>
              <br />当 $n=1$ 时分布是矩形；当 $n=2$ 时呈三角形；当 $n \ge 3$
              时，分布迅速向“钟形曲线”收敛。
            </Text>
          </div>
        </Flex>
      </Col>
    </Row>
  )
}

export default DiceSumSimulation