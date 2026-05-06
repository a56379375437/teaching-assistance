import React, { useState, useRef, useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, Slider, Typography, Space } from 'antd'
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'

const { Text } = Typography

// 待求解的函数: f(x) = sin(x)
const f = (x: number) => Math.sin(x)
const X_MIN = 0
const X_MAX = Math.PI
const Y_MIN = 0
const Y_MAX = 1
const RECT_AREA = (X_MAX - X_MIN) * Y_MAX // 矩形外框面积

const MonteCarloIntegralSimulation: React.FC = () => {
  const [totalPoints, setTotalPoints] = useState(10000)
  const [isSimulating, setIsSimulating] = useState(false)
  const [displayStats, setDisplayStats] = useState({
    total: 0,
    under: 0,
    integral: 0,
  })

  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const statsRef = useRef({
    total: 0,
    under: 0,
    scatterUnder: [] as any[],
    scatterAbove: [] as any[],
  })
  const requestRef = useRef<number>(0)

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
      // 绘制背景函数曲线
      const curveData = []
      for (let x = 0; x <= Math.PI; x += 0.05) {
        curveData.push([x, f(x)])
      }

      chartInstance.current.setOption({
        animation: false,
        grid: { top: 40, right: 20, bottom: 40, left: 50 },
        xAxis: { type: 'value', min: X_MIN, max: X_MAX },
        yAxis: { type: 'value', min: Y_MIN, max: Y_MAX },
        series: [
          {
            name: 'f(x) = sin(x)',
            type: 'line',
            data: curveData,
            smooth: true,
            showSymbol: false,
            lineStyle: { color: 'red', width: 3 },
            areaStyle: { color: 'rgba(255, 0, 0, 0.1)' },
            zIndex: 10,
          },
          {
            name: '下方点',
            type: 'scatter',
            data: [],
            symbolSize: 2,
            itemStyle: { color: '#1890ff' },
            large: true,
          },
          {
            name: '上方点',
            type: 'scatter',
            data: [],
            symbolSize: 2,
            itemStyle: { color: '#bfbfbf' },
            large: true,
          },
        ],
      })
    }
  }, [])

  const animate = () => {
    const s = statsRef.current
    if (s.total >= totalPoints) {
      setIsSimulating(false)
      return
    }

    const batchSize = Math.ceil(totalPoints / 100)
    const newUnder: any[] = []
    const newAbove: any[] = []

    for (let i = 0; i < batchSize && s.total < totalPoints; i++) {
      const rx = X_MIN + Math.random() * (X_MAX - X_MIN)
      const ry = Y_MIN + Math.random() * (Y_MAX - Y_MIN)
      s.total++
      if (ry <= f(rx)) {
        s.under++
        newUnder.push([rx, ry])
      } else {
        newAbove.push([rx, ry])
      }
    }

    // 更新增量点数据，限制显示的散点数量防止卡顿
    s.scatterUnder = [...s.scatterUnder, ...newUnder].slice(-2000)
    s.scatterAbove = [...s.scatterAbove, ...newAbove].slice(-2000)

    const currentIntegral = (s.under / s.total) * RECT_AREA

    chartInstance.current?.setOption({
      series: [{}, { data: s.scatterUnder }, { data: s.scatterAbove }],
    })

    setDisplayStats({
      total: s.total,
      under: s.under,
      integral: currentIntegral,
    })
    requestRef.current = requestAnimationFrame(animate)
  }

  const start = () => {
    if (statsRef.current.total >= totalPoints) reset()
    setIsSimulating(true)
    requestRef.current = requestAnimationFrame(animate)
  }

  const reset = () => {
    cancelAnimationFrame(requestRef.current)
    setIsSimulating(false)
    statsRef.current = {
      total: 0,
      under: 0,
      scatterUnder: [],
      scatterAbove: [],
    }
    setDisplayStats({ total: 0, under: 0, integral: 0 })
    chartInstance.current?.setOption({
      series: [{}, { data: [] }, { data: [] }],
    })
  }

  return (
    <div className="p-4 bg-white rounded">
      <Row gutter={24}>
        <Col span={16}>
          <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
        </Col>
        <Col span={8}>
          <Space direction="vertical" className="w-full">
            <div className="p-4 bg-gray-50 rounded">
              <Text strong>模拟配置</Text>
              <Slider
                min={1000}
                max={100000}
                step={5000}
                value={totalPoints}
                onChange={setTotalPoints}
                disabled={isSimulating}
              />
              <Button
                type="primary"
                block
                icon={<PlayCircleOutlined />}
                onClick={start}
                loading={isSimulating}
              >
                开始模拟
              </Button>
              <Button
                block
                icon={<ReloadOutlined />}
                onClick={reset}
                className="mt-2"
              >
                重置
              </Button>
            </div>

            <Statistic title="已投总点数" value={displayStats.total} />
            <Statistic
              title="命中点数 (落在曲线下方)"
              value={displayStats.under}
              styles={{ content: { color: '#1677ff' } }}
            />
            <Statistic
              title="积分近似值"
              value={displayStats.integral}
              precision={5}
              suffix="/ 2.0000"
            />
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default MonteCarloIntegralSimulation
