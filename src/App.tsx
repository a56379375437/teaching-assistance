import React, { useState } from "react";
import { Layout, Menu, theme, type MenuProps } from "antd";
import { Outlet, useLocation, useNavigate, type To } from "react-router";
import { FileOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { evaluationkey, experimentkey } from "./types";

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
  getItem('知识单元', experimentkey, <UserOutlined />, [
    getItem('大数定理', experimentkey + '/lln'),
    getItem('蒲丰投针问题', experimentkey + '/buffon-needle'),
    getItem('测试', experimentkey + '/test'),
    getItem('抛硬币', experimentkey + '/coin'),
    getItem('抢红包', experimentkey + '/hongbao'),
  ]),
  getItem('测评管理', evaluationkey, <TeamOutlined />, [
    getItem('试题管理', evaluationkey + '/question'),
    getItem('测评效果', '8'),
  ]),
  getItem('使用指南', '/guide', <FileOutlined />),
]

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
