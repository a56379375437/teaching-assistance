import React, { useState, useRef, useEffect } from 'react'
import {
  InputNumber,
  Button,
  Typography,
  Flex,
  Row,
  Col,
  Statistic,
  Slider,
  Tag,
} from 'antd'
import {
  ReloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'
import * as echarts from 'echarts'

const { Text } = Typography

const CoinTossSimulation: React.FC = () => {
  // --- 状态定义 ---
  const [totalTosses, setTotalTosses] = useState<number>(10000)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [lastResult, setLastResult] = useState<'H' | 'T'>('H') // H:正面, T:反面

  const statsRef = useRef({
    heads: 0,
    tails: 0,
    total: 0,
    dataPoints: [] as [number, number][],
  })

  const [displayStats, setDisplayStats] = useState({
    heads: 0,
    tails: 0,
    total: 0,
    freq: 0,
  })

  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const requestRef = useRef<number>(0)

  // --- 初始化图表 ---
  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.init(chartRef.current)
    chartInstanceRef.current = chart

    chart.setOption({
      animation: false,
      tooltip: {
        trigger: 'axis',
        formatter: (p: any) =>
          `次数: ${p[0].data[0]}<br/>频率: ${p[0].data[1].toFixed(5)}`,
      },
      grid: { top: 40, right: 30, bottom: 40, left: 60 },
      xAxis: { type: 'value', name: '次数', min: 0, max: totalTosses },
      yAxis: {
        type: 'value',
        name: '频率',
        min: 0.4,
        max: 0.6,
        splitLine: { lineStyle: { type: 'dashed' } },
      },
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

  useEffect(() => {
    chartInstanceRef.current?.setOption({ xAxis: { max: totalTosses } })
  }, [totalTosses])

  // --- 模拟核心逻辑 ---
  const runSimulation = () => {
    const stats = statsRef.current
    if (stats.total >= totalTosses) {
      setIsSimulating(false)
      return
    }

    // 每帧批量计算
    const batchSize = Math.max(10, Math.floor(totalTosses / 200))
    let batchLast: 'H' | 'T' = 'H'

    for (let i = 0; i < batchSize && stats.total < totalTosses; i++) {
      stats.total++
      if (Math.random() > 0.5) {
        stats.heads++
        batchLast = 'H'
      } else {
        stats.tails++
        batchLast = 'T'
      }
    }

    const currentFreq = stats.heads / stats.total
    setLastResult(batchLast) // 更新视觉硬币状态

    // 绘图采样
    const sampleStep = Math.max(1, Math.floor(totalTosses / 400))
    if (stats.total % sampleStep === 0 || stats.total === totalTosses) {
      stats.dataPoints.push([stats.total, currentFreq])
      chartInstanceRef.current?.setOption({
        series: [{ data: stats.dataPoints }],
      })
    }

    setDisplayStats({
      heads: stats.heads,
      tails: stats.tails,
      total: stats.total,
      freq: currentFreq,
    })
    requestRef.current = requestAnimationFrame(runSimulation)
  }

  const toggleSimulation = () => {
    if (isSimulating) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      setIsSimulating(false)
    } else {
      if (statsRef.current.total >= totalTosses) resetSimulation()
      setIsSimulating(true)
      requestRef.current = requestAnimationFrame(runSimulation)
    }
  }

  const resetSimulation = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current)
    setIsSimulating(false)
    statsRef.current = { heads: 0, tails: 0, total: 0, dataPoints: [] }
    setDisplayStats({ heads: 0, tails: 0,total: 0, freq: 0 })
    setLastResult('H')
    chartInstanceRef.current?.setOption({ series: [{ data: [] }] })
  }

  return (
    <Row gutter={24} align="middle">
      <Col span={15}>
        <Flex vertical gap="middle">
          {/* 硬币动态显示区 */}
          <div className="bg-slate-100 p-6 rounded-xl flex flex-col justify-center items-center min-h-40 border border-dashed border-slate-300 relative overflow-hidden">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 transition-transform duration-100 shadow-lg ${
                lastResult === 'H'
                  ? 'bg-yellow-400 border-yellow-600 text-yellow-800 rotate-y-0'
                  : 'bg-slate-300 border-slate-500 text-slate-700 rotate-y-180'
              } ${isSimulating ? 'animate-spin' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {lastResult === 'H' ? '正' : '反'}
            </div>
            <div className="mt-4">
              <Tag
                color={lastResult === 'H' ? 'gold' : 'default'}
                style={{ fontSize: '14px' }}
              >
                本次结果: {lastResult === 'H' ? '正面 (Heads)' : '反面 (Tails)'}
              </Tag>
            </div>
          </div>

          <div
            ref={chartRef}
            className="w-full h-80 bg-white rounded border border-gray-100"
            style={{ touchAction: 'none' }}
          />
        </Flex>
      </Col>

      <Col span={9} className="border-l border-gray-100 pl-6">
        <Flex vertical gap="large">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text strong className="block mb-2 text-base">
              实验配置
            </Text>
            <div className="mb-4">
              <Text type="secondary" className="text-xs">
                计划抛掷总次数:
              </Text>
              <InputNumber
                className="w-full mt-2 mb-2"
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

            <Flex gap="small">
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
                {isSimulating
                  ? '暂停'
                  : displayStats.total >= totalTosses
                    ? '重新开始'
                    : '开始实验'}
              </Button>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={resetSimulation}
              />
            </Flex>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <Statistic
                title="正面 (Heads)"
                value={displayStats.heads}
                styles={{ content: { color: '#d48806', fontSize: '20px' } }}
              />
              <Statistic
                title="反面 (Tails)"
                value={displayStats.tails}
                styles={{ content: { color: '#595959', fontSize: '20px' } }}
              />
            </div>
            <Statistic
              title="当前频率"
              value={displayStats.freq}
              precision={5}
              styles={{ content: { color: '#cf1322' } }}
              suffix={
                <span className="text-xs text-gray-400 font-normal">
                  {' '}
                  (理论值 0.5)
                </span>
              }
            />
          </div>

          <div className="p-3 bg-blue-50 rounded border border-blue-100">
            <Text type="secondary" className="text-[11px] leading-relaxed">
              <strong>大数定律提示：</strong>
              <br />当 $n$ 较小时，频率波动剧烈（随机误差）；随着 $n \to
              10^5$，正面频率将极其稳定地收敛于 0.5。
            </Text>
          </div>
        </Flex>
      </Col>
    </Row>
  )
}

export default CoinTossSimulation
