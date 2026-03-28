import { Typography } from "antd";
import BuffonNeedleSimulation from "../components/BuffonNeedleSimulation";
import CoinTossSimulation from "../components/CoinTossSimulation";
import MonteCarloPiSimulation from "../components/MonteCarloPiSimulation";
const { Title, Paragraph } = Typography;

export default function Lln() {
  return (
    <div>
      <Typography>
        <Title>实验概述</Title>
        <Paragraph>
          大数定律是概率论与数理统计的核心理论之一，揭示了
          <strong>随机事件大量重复试验后，频率趋近于概率</strong>
          的客观规律。本实验通过计算机动态模拟抛硬币、蒲丰投针等随机试验，实时展示样本均值随试验次数增加趋于稳定的过程，帮助学习者直观理解大数定律的内涵、条件与应用场景，实现抽象知识可视化、实践化学习。

        </Paragraph>
        <Title>抛硬币相关知识</Title>
        <Paragraph>
          抛硬币实验也被称为伯努利实验，但凡预先可列实验仅有两种结果的随机实验，均可称为是伯努利试验。
          <br />
          许多著名的数学家都进行过抛硬币实验，如：德摩根、浦丰、费勒等。他们的实验表明，多次抛硬币中正面与反面的次数比总是趋近于1:1。
          这为后来人们建立古典概型、几何概率模型等数学模型奠定了基础。
        </Paragraph>
        <Paragraph>
          <CoinTossSimulation />
        </Paragraph>
        <Title>蒲丰投针相关知识</Title>
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
        <Paragraph>
          <BuffonNeedleSimulation />
        </Paragraph>
        <Paragraph>
          <MonteCarloPiSimulation/>
        </Paragraph>
      </Typography>
    </div>
  );
}
