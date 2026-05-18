//中心极限定理（Central Limit Theorem）

import { Typography, Divider, Card, Alert, Flex } from 'antd'
import ExperimentQuestion from '../components/ExperimentQuestion'
import SamplingMeanSimulation from '../components/SamplingMeanSimulation'
import GaltonBoardSimulation from '../components/GaltonBoardSimulation'
import DiceSumSimulation from '../components/DiceSumSimulation'

const { Title, Paragraph, Text } = Typography

export default function Clt() {

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
          中心极限定理：随机之中的必然秩序
        </Title>

        <section style={sectionStyle}>
          <Title level={3}>1. 理论概述</Title>
          <Paragraph>
            <strong>中心极限定理 (Central Limit Theorem)</strong>{' '}
            解释了自然界中正态分布无处不在的原因：
            大量相互独立的随机变量，其求和（或平均值）在数量足够大时，其分布将趋向于
            <strong>正态分布</strong>，而与其原始分布无关。
          </Paragraph>
          <Alert
            description="观察从均匀分布、指数分布等非正态分布抽样时，样本均值是如何逐渐形成“钟形曲线”的。"
            type="info"
            showIcon
          />
        </section>

        <Divider />

        <Flex vertical gap={40}>
          <section>
            <Title level={4}>1.1 高尔顿钉板：正态分布的物理呈现</Title>
            <Paragraph>
              小球自顶落下，每一步都是一次二项分布实验。随着层数增加，底部小球的分布将呈现完美的正态曲线。
            </Paragraph>
            <Card style={cardStyle}>
              <GaltonBoardSimulation />
            </Card>
          </section>

          <section>
            <Title level={4}>1.2 独立同分布：骰子点数之和</Title>
            <Paragraph>
              单枚骰子服从均匀分布。当投掷 <Text code>n</Text>{' '}
              枚骰子时，点数总和的分布会随 <Text code>n</Text>{' '}
              增大而迅速向正态分布收敛。
            </Paragraph>
            <Card style={cardStyle}>
              <DiceSumSimulation />
            </Card>
          </section>

          <section style={sectionStyle}>
            <Title level={4}>1.3 均值抽样：打破分布的边界</Title>
            <Paragraph>
              从极端非正态（如指数分布）的总体中抽取样本。观察不论总体长什么样，只要单次抽样量增加，其{' '}
              <Text code>均值的分布</Text> 始终向正态分布收敛。
            </Paragraph>
            <Card style={cardStyle}>
              <SamplingMeanSimulation />
            </Card>
          </section>
        </Flex>

        <Divider />

        <section style={{ marginTop: '50px' }}>
          <Title level={3}>2. 知识测评</Title>
          <ExperimentQuestion knowledgeUnit="CENTRAL_LIMIT_THEOREM" />
        </section>
      </Typography>
    </div>
  )
}
