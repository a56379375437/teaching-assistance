// t分布模拟(TDistributionSimulation)

import React, { useState, useRef, useEffect } from 'react'
import {
  Row,
  Col,
  Statistic,
  Slider,
  Typography,
  Flex,
  Alert,
  Switch,
  Tag,
} from 'antd'
import * as echarts from 'echarts'

const { Text } = Typography

// 数学辅助函数：伽马函数近似 (用于计算 t 分布 PDF)
const gamma = (n: number): number => {
  const g = 7
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (n < 0.5) return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n))
  n -= 1
  let x = p[0]
  for (let i = 1; i < g + 2; i++) x += p[i] / (n + i)
  let t = n + g + 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x
}

// t 分布概率密度函数
const tPDF = (t: number, v: number): number => {
  return (
    (gamma((v + 1) / 2) / (Math.sqrt(v * Math.PI) * gamma(v / 2))) *
    Math.pow(1 + (t * t) / v, -(v + 1) / 2)
  )
}

// 标准正态分布 PDF
const normalPDF = (x: number): number => {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x)
}

const TDistributionSimulation: React.FC = () => {
  const [n, setN] = useState(4) // 样本量
  const [showNormal, setShowZ] = useState(true) // 是否显示正态对照

  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  const df = n - 1 // 自由度

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [])

  useEffect(() => {
    updateChart()
  }, [n, showNormal])

  const updateChart = () => {
    if (!chartInstance.current) return

    const xData = []
    const tData = []
    const zData = []

    // 生成 -4 到 4 之间的曲线数据
    for (let x = -4; x <= 4; x += 0.1) {
      xData.push(x.toFixed(1))
      tData.push(tPDF(x, df))
      if (showNormal) zData.push(normalPDF(x))
    }

    chartInstance.current.setOption({
      animation: false,
      tooltip: { trigger: 'axis', precision: 3 },
      legend: { bottom: 0 },
      grid: { top: 40, right: 20, bottom: 60, left: 50 },
      xAxis: { type: 'category', data: xData, name: 't / z' },
      yAxis: { type: 'value', min: 0, max: 0.45, name: '概率密度' },
      series: [
        {
          name: `t 分布 (df=${df})`,
          type: 'line',
          data: tData,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color: '#1890ff' },
          areaStyle: { color: 'rgba(24, 144, 255, 0.1)' },
        },
        showNormal
          ? {
              name: '标准正态分布 (Z)',
              type: 'line',
              data: zData,
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 2, type: 'dashed', color: '#ff4d4f' },
            }
          : null,
      ].filter(Boolean),
    })
  }

  return (
    <Row gutter={24} align="middle">
      <Col span={15}>
        <div
          ref={chartRef}
          style={{ width: '100%', height: '380px', touchAction: 'none' }}
        />
      </Col>

      <Col span={9} className="border-l border-gray-100 pl-6">
        <Flex vertical gap="large" className="w-full">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <Text strong className="block mb-2 text-base">
                样本量 (n): <span className="text-blue-600">{n}</span>
              </Text>
              <Slider min={2} max={100} value={n} onChange={setN} />
              <Text type="secondary" className="text-[11px]">
                自由度 df = n - 1 = {df}
              </Text>
            </div>

            <Flex justify="space-between" align="center" className="mb-6">
              <Text strong>显示标准正态对照</Text>
              <Switch checked={showNormal} onChange={setShowZ} />
            </Flex>

            <div className="grid grid-cols-1 gap-3">
              <Statistic
                title="95% 临界值 (t_0.025)"
                // 简化模拟，实际应查表或用反函数
                value={n < 30 ? (1.96 + 2 / df).toFixed(3) : 1.96}
                precision={3}
                styles={{ content: { color: '#1890ff' } }}
                suffix={
                  showNormal ? <Tag className="ml-2">vs Z=1.96</Tag> : null
                }
              />
            </div>
          </div>

          <Alert
            description={
              <ul className="text-xs pl-4 mt-1 list-disc">
                <li>
                  当 <strong>n 较小</strong> 时，t 曲线比标准正态分布
                  曲线更低平，尾部更高。
                </li>
                <li>
                  这意味着小样本下，我们需要更大的临界值来保证相同的置信水平。
                </li>
                <li>
                  随着 <strong>n 增加</strong>（观察 n{'>'}30），t
                  分布迅速向标准正态分布收敛。
                </li>
              </ul>
            }
            type="info"
          />

          <div className="p-3 bg-blue-50 rounded">
            <Text
              type="secondary"
              className="text-[11px] leading-relaxed italic"
            >
              "Student's t-distribution" 由戈塞特 (W.S. Gosset) 在 1908 年以笔名
              "Student" 发表，主要用于处理总体方差未知的小样本估计问题。
            </Text>
          </div>
        </Flex>
      </Col>
    </Row>
  )
}

export default TDistributionSimulation