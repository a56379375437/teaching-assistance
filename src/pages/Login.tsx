import React, { useState } from 'react'
import { Card, Form, Input, Button, Radio, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate,useLocation } from 'react-router'

const { Title } = Typography

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore(state => state.setUser)
  const navigate = useNavigate()
  const location = useLocation()

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (result.success) {
        message.success('登录成功')
        setUser(result.data)

        // 根据角色重定向
        const role = result.data.role

        // 检查是否有拦截前的路径
        const state = location.state as LocationState
        const from = state?.from?.pathname

        if (from && from !== '/login') {
          navigate(from, { replace: true })
        } else {
          // 根据角色去往不同的“首页”
          if (role === 'STUDENT') {
            navigate('/', { replace: true }) // 学生去大屏首页或实验页
          } else if (role === 'TEACHER' || role === 'ADMIN') {
            navigate('/evaluation/question', { replace: true }) // 老师直接去题目管理
          } else {
            navigate('/', { replace: true })
          }
        }
      } else {
        message.error(result.message)
      }
    } catch (error) {
      message.error('网络连接异常')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-xl border-none">
        <div className="text-center mb-8">
          <Title level={2} className="mb-2!">
            系统登录
          </Title>
          <div className="text-slate-400">请输入您的账号密码</div>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ role: 'STUDENT' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名"  autoComplete='user'/>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete='123456' />
          </Form.Item>

          <Form.Item name="role" label="身份选择">
            <Radio.Group className="w-full flex justify-between">
              <Radio value="STUDENT">学生</Radio>
              <Radio value="TEACHER">教师</Radio>
              <Radio value="ADMIN">管理员</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 text-lg mt-2"
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
