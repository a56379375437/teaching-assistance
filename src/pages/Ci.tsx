// 置信区间

import { Typography, Divider, Card, Alert, Flex } from 'antd'
import ExperimentQuestion from '../components/ExperimentQuestion'
import CICaptureSimulation from '../components/CaptureRateSimulation'
import CIWidthSimulation from '../components/IntervalWidthSimulation'
import TDistributionSimulation from '../components/TDistributionSimulation'

const { Title, Paragraph, Text } = Typography

export default function Ci() {
  const sectionStyle = { marginBottom: '40px' }
  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #f0f0f0',
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>
      <Typography>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
          参数估计：置信区间的含义与构造
        </Title>

        <section style={sectionStyle}>
          <Title level={3}>1. 理论概述</Title>
          <Paragraph>
            <strong>置信区间 (Confidence Interval)</strong>{' '}
            是对总体参数进行区间估计的一种方法。 95% 的置信水平并不代表参数有
            95% 的概率落在某个固定区间内，而是指：如果我们重复抽样 100 次并构造
            100 个区间，大约有 95 个区间会<strong>包含</strong>真实的总体参数。
          </Paragraph>
          <Alert
            description="本单元将通过动态模拟展示样本量 (n)、置信水平 (1-α) 和总体方差对区间估计的影响。"
            type="info"
            showIcon
          />
        </section>

        <Divider />

        <Flex vertical gap={40}>
          <section>
            <Title level={4}>1.1 区间捕获模拟：什么是“置信”？</Title>
            <Paragraph>
              观察不断生成的随机区间。你会发现大部分区间（蓝色）穿过了真值线（红虚线），而少数区间（红色）未能捕获到真值。
            </Paragraph>
            <Card style={cardStyle}>
              <CICaptureSimulation />
            </Card>
          </section>

          <section>
            <Title level={4}>1.2 精度与权衡：区间宽度的决定因素</Title>
            <Paragraph>
              增加样本量 <Text code>n</Text>{' '}
              会缩短区间（更精确），而提高置信水平（如从 90% 到
              99%）会加宽区间（更保险）。
            </Paragraph>
            <Card style={cardStyle}>
              <CIWidthSimulation />
            </Card>
          </section>

          <section style={sectionStyle}>
            <Title level={4}>1.3 未知方差：从标准正态分布到 t 分布</Title>
            <Paragraph>
              当总体方差未知时，我们必须使用样本标准差。观察当样本量较小时，
              <Text strong>t 分布</Text>{' '}
              是如何通过比正态分布更“肥”的尾部来弥补这种不确定性的。
            </Paragraph>
            <Card style={cardStyle}>
              <TDistributionSimulation />
            </Card>
          </section>
        </Flex>

        <Divider />

        <section style={{ marginTop: '50px' }}>
          <Title level={3}>2. 知识测评</Title>
          <ExperimentQuestion knowledgeUnit="CONFIDENCE_INTERVAL" />
        </section>
      </Typography>
    </div>
  )
}