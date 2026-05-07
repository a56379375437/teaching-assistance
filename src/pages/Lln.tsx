//大数定理知识单元（Law of Large Numbers, LLN）


import { Typography, Divider, Card } from 'antd'
import BuffonNeedleSimulation from '../components/BuffonNeedleSimulation'
import CoinTossSimulation from '../components/CoinTossSimulation'
import ExperimentQuestion from '../components/ExperimentQuestion'
import MonteCarloIntegralSimulation from '../components/MonteCarloIntergralSimulation'

const { Title, Paragraph, Text } = Typography

export default function Lln() {
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
          大数定律：随机性中的数学之美
        </Title>

        <section style={sectionStyle}>
          <Title level={3}>1. 实验概述</Title>
          <Paragraph style={{ fontSize: '15px', color: '#555' }}>
            大数定律揭示了<strong>频率随试验次数增加而趋向于理论概率</strong>
            的现象。本页面通过三项经典实验，带你从不同维度观察随机现象向确定性规律转化的过程。
          </Paragraph>
        </section>

        <Divider />

        <section style={sectionStyle}>
          <Title level={4}>1.1 伯努利试验：抛硬币实验</Title>
          <Paragraph>
            观察正面频率如何随着投掷次数的增加，最终稳定在 <Text code>0.5</Text>{' '}
            理论值附近。
          </Paragraph>
          <Card style={cardStyle}>
            <CoinTossSimulation />
          </Card>
        </section>

        <section style={sectionStyle}>
          <Title level={4}>1.2 几何概率：蒲丰投针实验</Title>
          <Paragraph>
            利用随机投针产生的相交概率来估算圆周率 <Text italic>π</Text>
            ，体现了概率论在数值计算中的应用。
          </Paragraph>
          <Card style={cardStyle}>
            <BuffonNeedleSimulation />
          </Card>
        </section>

        <section style={sectionStyle}>
          <Title level={4}>1.3 面积统计：蒙特卡洛积分实验</Title>
          <Paragraph>
            通过在特定区域内随机投点，利用“命中率”计算曲线围成的图形面积（即定积分值）。
          </Paragraph>
          <Card style={cardStyle}>
            <MonteCarloIntegralSimulation />
          </Card>
        </section>

        <Divider />

        <section style={{ marginTop: '50px' }}>
          <Title level={3}>2. 知识测评</Title>
          <ExperimentQuestion knowledgeUnit="LARGE_NUMBER_LAW" />
        </section>
      </Typography>
    </div>
  )
}
