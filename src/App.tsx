
//         <nav>
//           <Link to="/teaching-assistance">Home</Link>
//           <Link to="/teaching-assistance/list">List</Link>
//           <Link to="/teaching-assistance/about">About</Link>
//         </nav>



import "@ant-design/v5-patch-for-react-19"; // 避免antd和React 19不兼容
import React, { useState } from "react";
import { Layout, Menu, theme, type MenuProps } from "antd";
import { Outlet, useLocation, useNavigate, type To } from "react-router";
import { FileOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { mainkey } from "./types";

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

// 主页左部菜单项、对应的路由和图标
const items: MenuItem[] = [
  getItem("模拟实验", mainkey, <UserOutlined />, [
    getItem("Tom", "3"),
    getItem("Bill", "4"),
    getItem("Alex", "5"),
  ]),
  getItem("试题练习", "sub2", <TeamOutlined />, [
    getItem("Team 1", "6"),
    getItem("Team 2", "8"),
  ]),
  getItem("使用指南", "9", <FileOutlined />),
];

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate(); //提供菜单项路由导航
  const { pathname } = useLocation(); //获取当前路由

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 点击菜单项后跳转对应路由
  const onClick = (e: { key: To }) => {
    navigate(e.key, { replace: true });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <span style={{ marginLeft: 16, color: "white", fontSize: 20 }}>
          教学辅助系统
        </span>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <Menu
            theme="dark"
            defaultSelectedKeys={[pathname]}
            mode="inline"
            items={items}
            onClick={onClick}
          />
        </Sider>
        <Layout style={{ padding: "5px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
