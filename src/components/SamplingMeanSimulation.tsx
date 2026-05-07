//均值抽样模拟(SamplingMeanSimulation.tsx)

import React, { useState, useRef, useEffect } from 'react'
import {
  Row,
  Col,
  Statistic,
  Button,
  Slider,
  Typography,
  Select,
  Flex,
} from 'antd'
import {
  PlayCircleOutlined,
  ReloadOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts'

const { Text } = Typography
const { Option } = Select

// 总体分布生成器
const generatePopulation = (type: string) => {
  switch (type) {
    case 'uniform':
      return () => Math.random() * 10 // 0-10 均匀分布
    case 'exponential':
      return () => -Math.log(1 - Math.random()) * 5 // 指数分布
    case 'normal':
      return () => {
        // 正态分布 (Box-Muller)
        let u = 0,
          v = 0
        while (u === 0) u = Math.random()
        while (v === 0) v = Math.random()
        return (
          Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * 2 + 5
        )
      }
    default:
      return () => Math.random() * 10
  }
}

const SamplingMeanSimulation: React.FC = () => {
  const [popType, setPopType] = useState('exponential') // 默认用偏斜严重的指数分布
  const [sampleSize, setSampleSize] = useState(10) // 样本量 n
  const [trialCount] = useState(5000) // 抽样次数 N
  const [isSimulating, setIsSimulating] = useState(false)

  const [stats, setStats] = useState({
    currentN: 0,
    meanOfMeans: 0,
    stdError: 0,
  })

  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const meansRef = useRef<number[]>([])
  const requestRef = useRef<number>(0)

  // 初始化图表
  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
      updateChart([])
    }
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  const updateChart = (data: number[]) => {
    if (!chartInstance.current) return

    // 自动分箱逻辑
    const binCount = 40
    const min = 0
    const max = 10
    const bins = new Array(binCount).fill(0)
    const step = (max - min) / binCount

    data.forEach(val => {
      const idx = Math.floor((val - min) / step)
      if (idx >= 0 && idx < binCount) bins[idx]++
    })

    const xAxisData = Array.from({ length: binCount }, (_, i) =>
      (min + i * step + step / 2).toFixed(2)
    )

    chartInstance.current.setOption({
      animation: false,
      tooltip: { trigger: 'axis' },
      grid: { top: 40, right: 20, bottom: 40, left: 50 },
      xAxis: { type: 'category', data: xAxisData, name: '样本均值' },
      yAxis: { type: 'value', name: '频数' },
      series: [
        {
          name: '均值分布',
          type: 'bar',
          data: bins,
          itemStyle: { color: '#52c41a' },
          large: true,
        },
      ],
    })
  }

  const runSimulation = () => {
    if (meansRef.current.length >= trialCount) {
      setIsSimulating(false)
      return
    }

    const generator = generatePopulation(popType)
    const batchSize = 50
    const newMeans = [...meansRef.current]

    for (let i = 0; i < batchSize && newMeans.length < trialCount; i++) {
      let sum = 0
      for (let j = 0; j < sampleSize; j++) {
        sum += generator()
      }
      newMeans.push(sum / sampleSize)
    }

    meansRef.current = newMeans

    // 计算统计量
    const mTotal = newMeans.reduce((a, b) => a + b, 0)
    const mom = mTotal / newMeans.length
    const varMeans =
      newMeans.reduce((a, b) => a + Math.pow(b - mom, 2), 0) / newMeans.length

    setStats({
      currentN: newMeans.length,
      meanOfMeans: mom,
      stdError: Math.sqrt(varMeans),
    })

    updateChart(newMeans)
    requestRef.current = requestAnimationFrame(runSimulation)
  }

  const handleToggle = () => {
    if (meansRef.current.length >= trialCount) reset()
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
    meansRef.current = []
    setStats({ currentN: 0, meanOfMeans: 0, stdError: 0 })
    updateChart([])
  }

  return (
    <Row gutter={24} align="middle">
      <Col span={15}>
        <div
          ref={chartRef}
          className="w-full h-95 bg-white rounded"
          style={{ touchAction: 'none' }}
        />
      </Col>

      <Col span={9} className="border-l border-gray-100 pl-6">
        <Flex vertical gap="middle" className="w-full">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <Text strong className="block mb-2">
                选择总体分布
              </Text>
              <Select
                value={popType}
                onChange={v => {
                  setPopType(v)
                  reset()
                }}
                className="w-full"
                disabled={isSimulating}
              >
                <Option value="uniform">均匀分布 (Uniform)</Option>
                <Option value="exponential">
                  指数分布 (Exponential - 偏斜)
                </Option>
                <Option value="normal">正态分布 (Normal)</Option>
              </Select>
            </div>

            <div className="mb-4">
              <Text strong className="block mb-2">
                每次抽样量 (n): {sampleSize}
              </Text>
              <Slider
                min={1}
                max={100}
                value={sampleSize}
                onChange={v => {
                  setSampleSize(v)
                  reset()
                }}
                disabled={isSimulating}
              />
              <Text type="secondary" className="text-xs">
                n 越大，均值分布越瘦高且越接近正态
              </Text>
            </div>

            <div className="flex gap-2">
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
                {isSimulating ? '停止抽样' : '开始抽样'}
              </Button>
              <Button size="large" icon={<ReloadOutlined />} onClick={reset} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Statistic title="已抽取样本数" value={stats.currentN} />
            <Statistic
              title="所有均值的均值"
              value={stats.meanOfMeans}
              precision={3}
              styles={{ content: { color: '#52c41a' } }}
            />
            <Statistic
              title="标准误差 (SE)"
              value={stats.stdError}
              precision={3}
            />
            <Statistic title="样本量 n" value={sampleSize} />
          </div>

          <div className="p-3 bg-green-50 rounded">
            <Text
              type="secondary"
              className="text-xs leading-relaxed text-green-700"
            >
              <strong>CLT 实验观察：</strong>
              <br />
              即便总体是极度不规则的“指数分布”，只要 n 增加（试着调到 30
              以上），你会发现样本均值的分布依然会变成完美的对称钟形曲线。
            </Text>
          </div>
        </Flex>
      </Col>
    </Row>
  )
}

export default SamplingMeanSimulation