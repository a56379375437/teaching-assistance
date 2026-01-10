import { Typography } from "antd";
const { Title, Paragraph } = Typography;

export default function Hongbao() {
  return (
    <div>
      <Typography>
        <Title>相关知识</Title>
        <Paragraph>
          抢红包这一趣味活动蕴含着丰富的概率论与数理统计知识。从概率论角度看，在固定红包总金额与个数的前提下，每个红包金额的分配可看作是一个随机事件，不同分配方式对应不同概率，例如采用随机算法时，每个红包金额大小在理论上有多种可能组合，每种组合出现都有其相应概率；从数理统计角度，大量抢红包数据收集后，可运用统计方法分析红包金额的分布特征，如计算均值了解平均每个红包的金额大小，通过方差衡量红包金额的离散程度，判断金额波动情况，还能利用统计图表直观呈现红包金额的分布形态，进而深入探究抢红包背后的规律与特性
          。
        </Paragraph>
        <Title>实验模拟</Title>
        <Paragraph></Paragraph>
      </Typography>
    </div>
  );
}
