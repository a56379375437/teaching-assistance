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

const { Text } = Typography

// 积分参数
const f = (x: number) => Math.sin(x)
const a = 0
const b = Math.PI
const maxY = 1
const rectArea = (b - a) * maxY

const MonteCarloIntegral: React.FC = () => {
  const [totalPoints, setTotalPoints] = useState<number>(100000)
  const [isSimulating, setIsSimulating] = useState(false)

  // 核心统计数据 (使用 Ref 保证计算效率)
  const statsRef = useRef({
    under: 0,
    total: 0,
    lineData: [] as [number, number][],
    scatterUnder: [] as [number, number][],
    scatterAbove: [] as [number, number][],
  })

  // 用于触发 UI 刷新的状态
  const [displayStats, setDisplayStats] = useState({
    total: 0,
    under: 0,
    integral: 0,
  })

  const scatRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const scatChart = useRef<echarts.ECharts | null>(null)
  const lineChart = useRef<echarts.ECharts | null>(null)
  const requestRef = useRef<number>(0)

  // 初始化图表
  useEffect(() => {
    if (scatRef.current && lineRef.current) {
      scatChart.current = echarts.init(scatRef.current)
      lineChart.current = echarts.init(lineRef.current)

      scatChart.current.setOption({
        title: {
          text: '随机投点可视化 (仅展示最近样本)',
          left: 'center',
          textStyle: { fontSize: 14 },
        },
        xAxis: { min: a, max: b },
        yAxis: { min: 0, max: maxY },
        series: [
          {
            name: 'f(x)',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: Array.from({ length: 100 }, (_, i) => [
              a + (i / 99) * (b - a),
              f(a + (i / 99) * (b - a)),
            ]),
            lineStyle: { color: 'red' },
          },
          {
            name: '下方',
            type: 'scatter',
            data: [],
            symbolSize: 3,
            itemStyle: { color: '#1677ff' },
          },
          {
            name: '上方',
            type: 'scatter',
            data: [],
            symbolSize: 3,
            itemStyle: { color: '#bfbfbf' },
          },
        ],
      })

      lineChart.current.setOption({
        title: {
          text: '积分值收敛过程',
          left: 'center',
          textStyle: { fontSize: 14 },
        },
        xAxis: { type: 'value', name: '次数' },
        yAxis: { min: 1.8, max: 2.2, name: '积分值' },
        series: [
          { name: '近似值', type: 'line', data: [], showSymbol: false },
          {
            name: '真实值',
            type: 'line',
            data: [
              [0, 2],
              [totalPoints, 2],
            ],
            lineStyle: { type: 'dashed', color: 'red' },
          },
        ],
      })
    }
    return () => {
      scatChart.current?.dispose()
      lineChart.current?.dispose()
    }
  }, [])

  // 模拟主循环
  const animate = () => {
    const s = statsRef.current
    if (s.total >= totalPoints) {
      setIsSimulating(false)
      return
    }

    // 批量处理
    const batchSize = Math.ceil(totalPoints / 200)
    const newScatterUnder: [number, number][] = []
    const newScatterAbove: [number, number][] = []

    for (let i = 0; i < batchSize && s.total < totalPoints; i++) {
      const x = a + Math.random() * (b - a)
      const y = Math.random() * maxY
      s.total++
      if (y <= f(x)) {
        s.under++
        if (newScatterUnder.length < 500) newScatterUnder.push([x, y])
      } else {
        if (newScatterAbove.length < 500) newScatterAbove.push([x, y])
      }
    }

    const currentIntegral = (s.under / s.total) * rectArea

    // 散点图只保留最新的一批点，防止 O(N) 渲染变慢
    s.scatterUnder = newScatterUnder
    s.scatterAbove = newScatterAbove

    // 收敛曲线采样：每完成 1% 记录一个点
    if (
      s.total % Math.ceil(totalPoints / 100) === 0 ||
      s.total === totalPoints
    ) {
      s.lineData.push([s.total, currentIntegral])
    }

    // 更新图表
    scatChart.current?.setOption({
      series: [{}, { data: s.scatterUnder }, { data: s.scatterAbove }],
    })
    lineChart.current?.setOption({
      xAxis: { max: totalPoints },
      series: [
        { data: s.lineData },
        {
          data: [
            [0, 2],
            [totalPoints, 2],
          ],
        },
      ],
    })

    // 统计
    setDisplayStats({
      total: s.total,
      under: s.under,
      integral: currentIntegral,
    })

    requestRef.current = requestAnimationFrame(animate)
  }

  const handleToggle = () => {
    if (isSimulating) {
      cancelAnimationFrame(requestRef.current!)
      setIsSimulating(false)
    } else {
      if (statsRef.current.total >= totalPoints) reset()
      setIsSimulating(true)
      requestRef.current = requestAnimationFrame(animate)
    }
  }

  const reset = () => {
    cancelAnimationFrame(requestRef.current!)
    setIsSimulating(false)
    statsRef.current = {
      under: 0,
      total: 0,
      lineData: [],
      scatterUnder: [],
      scatterAbove: [],
    }
    setDisplayStats({ total: 0, under: 0, integral: 0 })
    scatChart.current?.setOption({ series: [{}, { data: [] }, { data: [] }] })
    lineChart.current?.setOption({ series: [{ data: [] }] })
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card title="蒙特卡洛定积分模拟" className="max-w-6xl mx-auto shadow">
        <Row gutter={24}>
          <Col span={7}>
            <Space className="w-full" size="large">
              <div className="p-4 bg-white border rounded">
                <Text strong>设置投点总数 (N):</Text>
                <Slider
                  min={1000}
                  max={1000000}
                  step={1000}
                  value={totalPoints}
                  onChange={setTotalPoints}
                  disabled={isSimulating}
                />
                <InputNumber
                  className="w-full"
                  value={totalPoints}
                  onChange={v => setTotalPoints(v || 1000)}
                  disabled={isSimulating}
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    type="primary"
                    block
                    icon={
                      isSimulating ? (
                        <PauseCircleOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )
                    }
                    onClick={handleToggle}
                  >
                    {isSimulating ? '暂停' : '开始'}
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={reset} />
                </div>
              </div>

              <div className="space-y-4">
                <Statistic title="已投点数" value={displayStats.total} />
                <Statistic
                  title="落在曲线下方 (m)"
                  value={displayStats.under}
                  styles={{ content: { color: '#1677ff' } }}
                />
                <Statistic
                  title="当前积分近似值"
                  value={displayStats.integral}
                  precision={6}
                  styles={{ content: { color: '#cf1322' } }}
                  suffix={
                    <div style={{ fontSize: 12, color: '#999' }}>
                      真实值: 2.000000
                    </div>
                  }
                />
              </div>
            </Space>
          </Col>

          <Col span={17}>
            <div className="flex flex-col gap-4">
              <div
                ref={scatRef}
                className="w-full h-72 bg-white rounded border"
              />
              <div
                ref={lineRef}
                className="w-full h-72 bg-white rounded border"
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default MonteCarloIntegral
