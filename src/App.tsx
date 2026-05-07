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
  Form,
  message,
  Modal,
  Input,
} from 'antd'
import { Outlet, useLocation, useNavigate, type To } from 'react-router'
import {
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  TrophyOutlined,
  KeyOutlined,
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
  const [isPassModalOpen, setIsPassModalOpen] = useState(false) // 修改密码弹窗状态
  const [passForm] = Form.useForm()

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

  // 提交修改密码
  const handleChangePassword = async () => {
    try {
      const values = await passForm.validateFields()
      if (!user?.id) return

      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: values.password, // 发送新密码
          name: user.name, // 保持原有姓名
          role: user.role, // 保持原有角色
        }),
      })

      const result = await res.json()
      if (result.success) {
        message.success('密码修改成功，请重新登录')
        setIsPassModalOpen(false)
        handleLogout() // 强制重新登录
      } else {
        message.error(result.message)
      }
    } catch (error) {
      console.error('Validate Failed:', error)
    }
  }

  // 下拉菜单项
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'changePassword',
      icon: <KeyOutlined />,
      label: '修改密码',
      onClick: () => setIsPassModalOpen(true),
    },
    {
      type: 'divider',
    },
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
        getItem('中心极限定理', experimentkey + '/clt'),
      ]),
    ]

    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      const adminChildren = [
        getItem('试题管理', evaluationkey + '/question'),
        getItem('学生管理', evaluationkey + '/students'),
      ]

      // 只有管理员可见“用户管理”
      if (user?.role === 'ADMIN') {
        adminChildren.push(getItem('用户管理', evaluationkey + '/users'))
      }

      baseItems.push(
        getItem('测评管理', evaluationkey, <TeamOutlined />, adminChildren)
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
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            教学辅助系统
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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

          <Tag color={user?.role === 'STUDENT' ? 'blue' : 'magenta'}>
            {user?.role === 'STUDENT'
              ? '学生端'
              : user?.role === 'TEACHER'
                ? '教师端'
                : '管理员'}
          </Tag>

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

      {/* 修改密码弹窗 */}
      <Modal
        title="修改个人密码"
        open={isPassModalOpen}
        onOk={handleChangePassword}
        onCancel={() => setIsPassModalOpen(false)}
        destroyOnHidden
      >
        <Form form={passForm} layout="vertical" className="mt-4">
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少为6位' },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="请输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认新密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              placeholder="请再次输入新密码"
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default App
