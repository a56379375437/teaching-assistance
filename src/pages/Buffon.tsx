import { Typography } from "antd";
import BuffonNeedleSimulation from "../components/BuffonNeedleSimulation";
const { Title, Paragraph } = Typography;

export default function Buffon() {
  return (
    <div>
      <Typography>
        <Title>相关知识</Title>
        <Paragraph>
          法国数学家布丰（1707-1788）最早设计了投针试验。
          <br />
          这一方法的步骤是：
          <br />
          1）取一张白纸，在上面画上许多条间距为a的平行线。
          <br />
          2）取一根长度为l（l≤a）的针，随机地向画有平行直线的纸上掷n次，观察针与直线相交的次数，记为m。
          <br />
          3）计算针与直线相交的概率．
          <br />
          18世纪，法国数学家布丰提出的“投针问题”，记载于布丰1777年出版的著作中：“在平面上画有一组间距为a的平行线，将一根长度为l（l≤a）的针任意掷在这个平面上，求此针与平行线中任一条相交的概率。”
          <br />
          布丰本人证明了，这个概率是：p=2l/πa（其中π为圆周率）
          <br />
          由于它与π有关，于是人们想到利用投针试验来估计圆周率的值。
          <br />
          布丰惊奇地发现：有利的扔出与不利的扔出两者次数的比，是一个包含π的表示式．如果针的长度等于a/2，那么扔出的概率为1/π．扔的次数越多，由此能求出越为精确的π的值。
        </Paragraph>
        <Title>实验模拟</Title>
        <Paragraph>
          <BuffonNeedleSimulation />
        </Paragraph>
      </Typography>
    </div>
  );
}
