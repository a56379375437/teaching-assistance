import React from "react";
import { Flex, Tabs, Typography, Tag, Divider } from "antd";
import type { TabsProps } from "antd";
import { createStyles } from "antd-style";

const { Text, Title } = Typography;

const useStyle = createStyles(() => ({
  root: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
  },
}));

const stylesObject: TabsProps["styles"] = {
  root: {
    borderWidth: 0,
    fontSize: 16,
  },
  header: { backgroundColor: "rgba(250,250,250,0.8)", borderRadius: '8px 8px 0 0' },
  item: { fontWeight: "bold", padding: '12px 20px' },
  indicator: { height: 3, borderRadius: '3px' },
  content: {
    backgroundColor: "#fff",
    padding: '24px',
    border: '1px solid #f0f0f0',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px'
  },
};

// 指南内容定义
const items = [
  {
    key: '1',
    label: '核心实验单元',
    children: (
      <div className="space-y-4 text-gray-600">
        <p>本系统集成了三个高可视化的统计模拟单元，带您探索随机现象中的数学规律：</p>

        <div className="pl-4 border-l-4 border-blue-500">
          <Title level={5}>1. 大数定律 (LLN)</Title>
          <ul className="list-disc ml-6 text-sm">
            <li><strong>抛硬币/蒲丰投针</strong>：观察随着样本量 N 的增加，频率如何稳定收敛于理论概率。</li>
            <li><strong>蒙特卡洛积分</strong>：体验利用“随机投点命中率”计算复杂图形面积的数值计算魅力。</li>
          </ul>
        </div>

        <div className="pl-4 border-l-4 border-green-500">
          <Title level={5}>2. 中心极限定理 (CLT)</Title>
          <ul className="list-disc ml-6 text-sm">
            <li><strong>高尔顿钉板</strong>：通过物理下落模拟，见证大量独立随机路径最终形成的“正态分布”钟形曲线。</li>
            <li><strong>均值抽样</strong>：尝试从指数分布等非正态总体中抽样，验证样本均值分布的正态趋向。</li>
          </ul>
        </div>

        <div className="pl-4 border-l-4 border-orange-500">
          <Title level={5}>3. 参数估计 (CI)</Title>
          <ul className="list-disc ml-6 text-sm">
            <li><strong>区间捕获模拟</strong>：直观理解置信区间的哲学定义——捕获率代表的是过程的可靠性。</li>
            <li><strong>t-分布演示</strong>：观察小样本情况下，t-分布如何通过“肥尾”特性弥补不确定性。</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    key: '2',
    label: '测评与积分系统',
    children: (
      <div className="space-y-4">
        <p>每个实验单元末尾均配有<strong>“知识测评”</strong>模块：</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>自动判分</strong>：系统支持单选、多选、判断及填空题，提交后立即反馈得分并开启回看模式。
          </li>
          <li>
            <strong>积分激励</strong>：学生用户每次测评的得分将通过
            <Tag color="gold" className="ml-1">原子化自增</Tag>
            存入数据库，并实时显示在导航栏右上角的个人成就中。
          </li>
          <li>
            <strong>智能纠错</strong>：回看模式下，系统会用<Text type="danger">红色</Text>标记错项，<Text type="success">绿色</Text>标记标准答案。
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: '3',
    label: '管理权限说明',
    children: (
      <div className="space-y-4">
        <p>权限角色矩阵</p>
        <ul className="list-disc ml-6 space-y-3">
          <li>
            <Tag color="blue">学生 (STUDENT)</Tag>
            ：可访问所有实验模块，参与测评并累积个人积分。
          </li>
          <li>
            <Tag color="purple">教师 (TEACHER)</Tag>
            ：拥有“测评管理”菜单。可录入/修改试题（支持 <Text strong>AI 自动润色题目</Text>），管理学生账号并调整其积分。
          </li>
          <li>
            <Tag color="red">管理员 (ADMIN)</Tag>
            ：拥有全系统最高权限。除教师功能外，可进入“用户管理”页面进行全员账号调度、角色授权及强制密码重置。
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: '4',
    label: '账户与安全指南',
    children: (
      <div className="space-y-4">
        <p>本系统采用 <strong>Bcrypt 工业级哈希加密</strong> 存储所有账户密码，确保您的信息安全：</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>自主改密</strong>：点击头像选择“修改密码”，输入新旧密码即可完成即时变更（需重新登录生效）。
          </li>
          <li>
            <strong>防呆设计</strong>：管理员在后台编辑用户信息时，若密码框留空，则系统不会变更原始密码，防止误操作。
          </li>
          <li>
            <strong>环境建议</strong>：推荐使用 Chrome 或 Edge 浏览器以获得最佳的 Canvas 动画与 ECharts 交互体验。
          </li>
        </ul>
      </div>
    ),
  },
]

const Guide: React.FC = () => {
  const { styles: classNames } = useStyle();

  const shareProps: TabsProps = {
    items,
    defaultActiveKey: "1",
    classNames,
    type: "line",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Title level={2} className="text-center mb-8">系统使用手册</Title>
      <Flex vertical gap="middle">
        <Tabs {...shareProps} styles={stylesObject} />
      </Flex>
    </div>
  );
};

export default Guide;