import React, { useMemo, useState } from 'react'
import {
  Layout,
  Menu,
  theme,
  type MenuProps,
  Avatar,
  Dropdown,
  Space,
  Button,
  Tag,
  Typography,
} from 'antd'
import { Outlet, useLocation, useNavigate, type To } from 'react-router'
import {
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { evaluationkey, experimentkey } from './types'
import { useAuthStore } from './store/index.ts'

const { Header, Content, Sider } = Layout
const { Text } = Typography

type MenuItem = Required<MenuProps>['items'][number]

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
  } as MenuItem
}

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // 处理退出登录
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // 下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true,
    },
  ]

  const menuItems = useMemo(() => {
    const baseItems: MenuItem[] = [
      getItem('知识单元', experimentkey, <UserOutlined />, [
        getItem('大数定理', experimentkey + '/lln'),
        getItem('蒲丰投针问题', experimentkey + '/buffon-needle'),
        getItem('测试', experimentkey + '/test'),
        getItem('抛硬币', experimentkey + '/coin'),
      ]),
    ]

    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      baseItems.push(
        getItem('测评管理', evaluationkey, <TeamOutlined />, [
          getItem('试题管理', evaluationkey + '/question'),
          getItem('测评效果', '8'),
        ])
      )
    }

    baseItems.push(getItem('使用指南', '/guide', <FileOutlined />))
    return baseItems
  }, [user])

  const onClick = (e: { key: To }) => {
    navigate(e.key, { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between', // 左右分布
          padding: '0 24px',
        }}
      >
        {/* 左侧：标题 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            教学辅助系统
          </span>
        </div>

        {/* 右侧：用户信息与积分 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* 学生专有：显示积分 */}
          {user?.role === 'STUDENT' && (
            <Tag
              color="gold"
              icon={<TrophyOutlined />}
              style={{
                fontSize: '14px',
                padding: '4px 10px',
                borderRadius: '15px',
              }}
            >
              累计积分: {user.score || 0}
            </Tag>
          )}

          {/* 角色标识 */}
          <Tag color={user?.role === 'STUDENT' ? 'blue' : 'magenta'}>
            {user?.role === 'STUDENT'
              ? '学生端'
              : user?.role === 'TEACHER'
                ? '教师端'
                : '管理员'}
          </Tag>

          {/* 用户下拉菜单 */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: 'white' }}>
              <Avatar
                style={{ backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
              />
              <Text style={{ color: 'white' }}>
                {user?.name || user?.username}
              </Text>
              <DownOutlined style={{ fontSize: '12px' }} />
            </Space>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
        >
          <Menu
            theme="dark"
            selectedKeys={[pathname]}
            mode="inline"
            items={menuItems}
            onClick={onClick}
          />
        </Sider>
        <Layout style={{ padding: '5px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflow: 'initial',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App
