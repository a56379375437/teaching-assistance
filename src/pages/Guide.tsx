import React from "react";
import { Flex, Tabs,Typography } from "antd";
import type { TabsProps } from "antd";
import { createStyles } from "antd-style";

const { Text } = Typography;

const useStyle = createStyles(() => ({
  root: {
    borderWidth: 2,
    borderStyle: "dashed",
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
  },
}));

const stylesObject: TabsProps["styles"] = {
  root: {
    borderWidth: 2,
    borderStyle: "hidden",
    padding: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  header: { backgroundColor: "rgba(245,245,245,0.5)" },
  item: { fontWeight: "bold", color: "#1890ff", padding: `6px 10px` },
  indicator: { backgroundColor: "rgba(70, 65, 96, 0.3)", height: 4 },
  content: { backgroundColor: "rgba(230,247,255,0.8)", padding: 16 },
};

// 指南分节和内容
const items = [
  {
    key: '1',
    label: '模拟实验',
    children: (
      <div className="space-y-2">
        <p>
          本系统集成高度可视化的数字仿真实验。您可以在
          <strong>“知识单元”</strong>模块中进行以下探索：
        </p>
        <ul className="list-disc ml-6">
          <li>
            <strong>动态模拟</strong>
            ：通过调整样本量，实时观察“抛硬币”实验的频率收敛过程。
          </li>
          <li>
            <strong>几何概率</strong>
            ：通过“蒲丰投针”实验，利用统计学方法估算圆周率 π。
          </li>
          <li>
            <strong>数值积分</strong>
            ：运用“蒙特卡洛模拟”，通过随机投点技术计算复杂函数的定积分近似值。
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: '2',
    label: '知识测评',
    children: (
      <div className="space-y-2">
        <p>
          实验结束后，您可以通过<strong>“随堂测评”</strong>组件检验学习效果：
        </p>
        <ul className="list-disc ml-6">
          <li>
            <strong>即时反馈</strong>
            ：提交后自动判分，并提供完整的解析回顾模式。
          </li>
          <li>
            <strong>积分体系</strong>：学生用户完成测评后，所得分数将自动转化为
            <strong color="gold">个人累计积分</strong>，展示在顶部导航栏。
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: '3',
    label: '角色管理权限',
    children: (
      <div className="space-y-2">
        <p>系统根据登录身份自动切换功能权限：</p>
        <ul className="list-disc ml-6">
          <li>
            <strong>教师/管理员</strong>：拥有“测评管理”权限，可实时进行
            <Text code>试题录入</Text>、<Text code>学生积分调整</Text>及
            <Text code>账号注销</Text>。
          </li>
          <li>
            <strong>系统管理员</strong>
            ：拥有最高权限，可进行全系统的用户身份调度与角色分配。
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: '4',
    label: '账户与安全',
    children: (
      <div className="space-y-2">
        <p>点击右上角用户头像，您可以进行：</p>
        <ul className="list-disc ml-6">
          <li>
            <strong>密码修改</strong>：支持自主重置登录密码，确保个人账户安全。
          </li>
          <li>
            <strong>身份切换</strong>：退出当前登录以切换至其他教学角色。
          </li>
        </ul>
      </div>
    ),
  },
]

const App: React.FC = () => {
  const { styles: classNames } = useStyle();
  const shareProps: TabsProps = {
    items,
    defaultActiveKey: "1",
    classNames,
  };

  return (
    <Flex vertical gap="middle">
      <Tabs {...shareProps} styles={stylesObject} />
    </Flex>
  );
};

export default App;
