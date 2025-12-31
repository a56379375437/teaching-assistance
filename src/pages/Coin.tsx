import { Typography } from "antd";
import CoinTossSimulation from "../components/CoinTossSimulation";
const { Title, Paragraph } = Typography;

export default function Coin() {
  return (
    <div>
      <Typography>
        <Title>相关知识</Title>
        <Paragraph>
          抛硬币实验也被称为伯努利实验，但凡预先可列实验仅有两种结果的随机实验，均可称为是伯努利试验。
          <br/>
          许多著名的数学家都进行过抛硬币实验，如：德摩根、浦丰、费勒等。他们的实验表明，多次抛硬币中正面与反面的次数比总是趋近于1:1。
          这为后来人们建立古典概型、几何概率模型等数学模型奠定了基础。
        </Paragraph>
        <Title>实验模拟</Title>
        <Paragraph>
          <CoinTossSimulation/>
        </Paragraph>
      </Typography>
    </div>
  );
}
