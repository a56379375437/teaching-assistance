// 置信区间捕获模拟(CaptureRateSimulation)

import React, { useState, useRef, useEffect } from 'react'
import { Row, Col, Statistic, Button, Slider, Typography, Flex } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'

const { Text } = Typography

const TRUE_MEAN = 50
const STD_DEV = 10

const CICaptureSimulation: React.FC = () => {
  const [n, setN] = useState(30)
  const [confidence, setConfidence] = useState(0.95)
  const [Intervals ,setIntervals] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, captured: 0 })

  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
      drawChart([])
    }
  }, [])

  const drawChart = (data: any[]) => {
    chartInstance.current?.setOption({
      animation: false,
      grid: { left: 40, right: 20, top: 20, bottom: 40 },
      xAxis: { min: 40, max: 60, name: '均值估计' },
      yAxis: { type: 'value', name: '实验序号', inverse: true },
      series: [
        {
          type: 'custom',
          renderItem: (_params: any, api: any) => {
            const y = api.value(0)
            const low = api.coord([api.value(1), y])
            const high = api.coord([api.value(2), y])
            const color = api.value(3) === 1 ? '#1890ff' : '#ff4d4f'
            return {
              type: 'group',
              children: [
                {
                  type: 'line',
                  shape: { x1: low[0], y1: low[1], x2: high[0], y2: high[1] },
                  style: { stroke: color, lineWidth: 2 },
                },
                {
                  type: 'circle',
                  shape: { cx: (low[0] + high[0]) / 2, cy: low[1], r: 3 },
                  style: { fill: color },
                },
              ],
            }
          },
          data: data,
        },
        {
          type: 'line',
          markLine: {
            symbol: 'none',
            label: { formatter: '真值 μ=50' },
            data: [{ xAxis: 50, lineStyle: { color: 'red', type: 'dashed' } }],
          },
        },
      ],
    })
  }

  const runExperiment = () => {
    const newIntervals = []
    let captured = 0
    const count = 50 // 每次生成 50 条

    // 计算 Z 临界值
    const z = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.58 : 1.64
    const marginOfError = z * (STD_DEV / Math.sqrt(n))

    for (let i = 1; i <= count; i++) {
      // 模拟抽样并计算均值
      const sample = Array.from(
        { length: n },
        () => TRUE_MEAN + (Math.random() * 2 - 1) * STD_DEV * 1.5 // 简化模拟
      )
      const sampleMean = sample.reduce((a, b) => a + b) / n
      const low = sampleMean - marginOfError
      const high = sampleMean + marginOfError
      const isCaptured = low <= TRUE_MEAN && high >= TRUE_MEAN
      if (isCaptured) captured++
      newIntervals.push([i, low, high, isCaptured ? 1 : 0])
    }

    setIntervals(newIntervals)
    setStats({ total: count, captured })
    drawChart(newIntervals)
  }

  return (
    <Row gutter={24} align="middle">
      <Col span={15}>
        <div ref={chartRef} style={{ width: '100%', height: '380px' }} />
      </Col>
      <Col span={9} className="border-l pl-6">
        <Flex vertical gap="large">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text strong>控制参数</Text>
            <div className="my-4">
              <Text className="text-xs">样本量 n: {n}</Text>
              <Slider min={5} max={200} value={n} onChange={setN} />
              <Text className="text-xs">置信水平: {confidence * 100}%</Text>
              <Slider
                min={0.8}
                max={0.99}
                step={0.01}
                value={confidence}
                onChange={setConfidence}
              />
            </div>
            <Button
              type="primary"
              block
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={runExperiment}
            >
              重复抽样实验
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Statistic title="生成区间数" value={stats.total} />
            <Statistic
              title="成功包含真值"
              value={stats.captured}
              styles={{content: {color: '#52c41a'}}}
            />
            <Statistic
              title="实时覆盖率"
              value={stats.total > 0 ? (stats.captured / stats.total) * 100 : 0}
              suffix="%"
              precision={1}
              className="col-span-2"
            />
          </div>
        </Flex>
      </Col>
    </Row>
  )
}

export default CICaptureSimulation