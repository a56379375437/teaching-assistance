import React, { useState } from 'react'
import { Row, Col, Slider, Typography, Flex, Alert, Statistic } from 'antd'

const { Text } = Typography

// 动态计算 Z 值的数学函数
const calcZ = (confidence: number): number => {
  const p = 1 - (1 - confidence) / 2
  const t = Math.sqrt(-2 * Math.log(1 - p))
  const c0 = 2.515517,
    c1 = 0.802853,
    c2 = 0.010328
  const d1 = 1.432788,
    d2 = 0.189269,
    d3 = 0.001308
  return (
    t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t)
  )
}

const CIWidthSimulation: React.FC = () => {
  const [n, setN] = useState(30)
  const [level, setLevel] = useState(0.95)
  const sigma = 10

  const zScore = calcZ(level)
  const width = 2 * zScore * (sigma / Math.sqrt(n))

  return (
    <Row gutter={24} align="middle">
      <Col span={12}>
        <Flex vertical align="center" justify="center" className="h-55">
          <div className="text-gray-400 text-xs mb-2">总体参数真值 μ</div>
          <div className="relative w-full flex justify-center">
            {/* 中心参考虚线 */}
            <div className="absolute h-20 w-0 border-l-2 border-dashed border-red-400 z-0 -top-2" />

            {/* 动态区间盒 - 使用 Tailwind 类名和动态 style 结合 */}
            <div
              className="bg-blue-100 border-x-4 border-blue-500 h-10 shadow-sm transition-all duration-300 flex items-center justify-center relative z-10"
              style={{ width: `${width * 12}px`, minWidth: '4px' }}
            >
              <span className="text-[10px] text-blue-600 font-bold whitespace-nowrap">
                误差范围
              </span>
            </div>
          </div>

          <div className="mt-8">
            <Statistic
              title="区间全宽 (2 × Margin of Error)"
              value={width}
              precision={4}
              styles={{ content: { color: '#2563eb', fontWeight: 'bold' } }}
            />
          </div>
        </Flex>
      </Col>

      <Col span={12} className="border-l border-gray-100 pl-6">
        <Flex vertical gap="middle">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="mb-4">
              <Text strong className="text-slate-600 block mb-1">
                样本量 (n): {n}
              </Text>
              <Slider min={10} max={1000} step={10} value={n} onChange={setN} />
            </div>

            <div>
              <Text strong className="text-slate-600 block mb-1">
                置信水平 (1-α):{' '}
                <span className="text-blue-600">
                  {(level * 100).toFixed(1)}%
                </span>
              </Text>
              <Slider
                min={0.5}
                max={0.99}
                step={0.01}
                value={level}
                onChange={setLevel}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Statistic
              title="Z 临界值"
              value={zScore}
              precision={3}
              styles={{ content: { fontSize: '16px' } }}
            />
            <Statistic
              title="标准误 (SE)"
              value={sigma / Math.sqrt(n)}
              precision={3}
              styles={{ content: { fontSize: '16px' } }}
            />
          </div>

          <Alert
            description="观察滑动：增加 n 会使区间‘变窄’（提高精度）；提高置信水平会使区间‘变宽’（提高可靠性）。"
            type="info"
            showIcon
            className="text-xs"
          />
        </Flex>
      </Col>
    </Row>
  )
}

export default CIWidthSimulation
