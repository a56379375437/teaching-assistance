import React, { useState, useRef, useEffect } from 'react'
import {
  InputNumber,
  Button,
  Card,
  Typography,
  Space,
  Row,
  Col,
  Statistic,
  Slider,
} from 'antd'
import {
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts'

const { Title, Text } = Typography

const CoinTossSimulation: React.FC = () => {
  // 状态定义
  const [totalTosses, setTotalTosses] = useState<number>(10000)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  // 使用 Ref 存储核心数据，避免 React 异步更新导致的逻辑错误
  const statsRef = useRef({
    heads: 0,
    tails: 0,
    total: 0,
    dataPoints: [] as [number, number][],
  })

  // 用于触发 UI 渲染的状态
  const [displayStats, setDisplayStats] = useState({
    heads: 0,
    tails: 0,
    freq: 0,
  })

  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const requestRef = useRef<number>(0)

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.init(chartRef.current)
    chartInstanceRef.current = chart

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (p: any) =>
          `次数: ${p[0].data[0]}<br/>频率: ${p[0].data[1].toFixed(5)}`,
      },
      xAxis: { type: 'value', name: '次数', min: 0, max: totalTosses },
      yAxis: {
        type: 'value',
        name: '频率',
        min: 0.4,
        max: 0.6,
        interval: 0.02,
      }, // 缩窄视口看清收敛
      series: [
        {
          name: '正面频率',
          type: 'line',
          showSymbol: false,
          data: [],
          lineStyle: { width: 2, color: '#1677ff' },
          markLine: {
            symbol: 'none',
            label: { position: 'end', formatter: '理论值 0.5' },
            data: [
              { yAxis: 0.5, lineStyle: { color: '#ff4d4f', type: 'dashed' } },
            ],
          },
        },
      ],
    })

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [])

  // 监听总次数调整图表
  useEffect(() => {
    chartInstanceRef.current?.setOption({ xAxis: { max: totalTosses } })
  }, [totalTosses])

  // 模拟核心逻辑
  const runSimulation = () => {
    const stats = statsRef.current

    if (stats.total >= totalTosses) {
      setIsSimulating(false)
      return
    }

    // 每帧批量抛币 100 次，极大提高收敛速度
    const batchSize = Math.max(1, Math.floor(totalTosses / 200))
    for (let i = 0; i < batchSize && stats.total < totalTosses; i++) {
      stats.total++
      if (Math.random() > 0.5) {
        stats.heads++
      } else {
        stats.tails++
      }
    }

    const currentFreq = stats.heads / stats.total

    // 记录数据点（降低采样率，避免图表卡顿）
    // 只有在次数跨越 1% 步长或结束时才记录点
    const sampleStep = Math.max(1, Math.floor(totalTosses / 500))
    if (stats.total % sampleStep === 0 || stats.total === totalTosses) {
      stats.dataPoints.push([stats.total, currentFreq])

      // 更新图表
      chartInstanceRef.current?.setOption({
        series: [{ data: stats.dataPoints }],
      })
    }

    // 更新 UI 显示
    setDisplayStats({
      heads: stats.heads,
      tails: stats.tails,
      freq: currentFreq,
    })

    requestRef.current = requestAnimationFrame(runSimulation)
  }

  const toggleSimulation = () => {
    if (isSimulating) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      setIsSimulating(false)
    } else {
      if (statsRef.current.total >= totalTosses) {
        resetSimulation()
      }
      setIsSimulating(true)
      requestRef.current = requestAnimationFrame(runSimulation)
    }
  }

  const resetSimulation = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    setIsSimulating(false)
    statsRef.current = { heads: 0, tails: 0, total: 0, dataPoints: [] }
    setDisplayStats({ heads: 0, tails: 0, freq: 0 })
    chartInstanceRef.current?.setOption({ series: [{ data: [] }] })
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-6xl mx-auto shadow-md border-0">
        <Title level={2} className="text-center mb-8">
          大数定律：抛硬币模拟器
        </Title>

        <Row gutter={24}>
          <Col span={8}>
            <Space className="w-full" size="large">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Text strong>实验配置</Text>
                <div className="mt-4">
                  <Text type="secondary">计划实验总次数:</Text>
                  <InputNumber
                    className="w-full mt-2"
                    min={100}
                    max={1000000}
                    value={totalTosses}
                    onChange={v => setTotalTosses(v || 1000)}
                    disabled={isSimulating}
                  />
                  <Slider
                    min={100}
                    max={1000000}
                    step={1000}
                    value={totalTosses}
                    onChange={setTotalTosses}
                    disabled={isSimulating}
                  />
                </div>
                <div className="mt-6 flex gap-2">
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
                    onClick={toggleSimulation}
                    danger={isSimulating}
                  >
                    {isSimulating ? '暂停实验' : '开始实验'}
                  </Button>
                  <Button
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={resetSimulation}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Statistic
                  title="正面 (Heads)"
                  value={displayStats.heads}
                  styles={{ content: { color: '#1677ff' } }}
                />
                <Statistic title="反面 (Tails)" value={displayStats.tails} />
                <Statistic
                  title="当前频率"
                  value={displayStats.freq}
                  precision={5}
                  styles={{ content: { color: '#cf1322' } }}
                  suffix={
                    <Text type="secondary" style={{ fontSize: 14 }}>
                      {' '}
                      (理论值 0.5)
                    </Text>
                  }
                />
              </div>
            </Space>
          </Col>

          <Col span={16}>
            <div
              ref={chartRef}
              className="w-full h-125 bg-white p-4 rounded-lg"
              style={{ border: '1px solid #f0f0f0' }}
            />
          </Col>
        </Row>

        <div className="mt-8 p-4 bg-gray-100 rounded">
          <Text type="secondary">
            注：大数定律指出，随着实验次数n的增大，事件发生的频率
            会依概率收敛于其概率。 在 n较小时，波动属于随机误差；当 n达到10^5
            级别时，频率通常能稳定在 0.5+-0.001范围内。
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default CoinTossSimulation
