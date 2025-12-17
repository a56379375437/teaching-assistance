import React from "react";
import { Flex, Tabs } from "antd";
import type { TabsProps } from "antd";
import { createStyles } from "antd-style";

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
    key: "1",
    label: "线上实验",
    children: "可以在此处进行不同的线上实验。只需设置、调整数据，就可以通过计算机仿真进行概率论与数理统计相关实验",
  },
  {
    key: "2",
    label: "试题练习",
    children: "涉及线上实验相关知识的练习。可在实验结束后测试知识点掌握情况",
  },
  {
    key: "3",
    label: "未完待续",
    children: "...",
  },
];

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
