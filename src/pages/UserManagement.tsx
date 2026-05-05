import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Tag,
  Card,
  Typography,
} from 'antd'
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined,
  UserOutlined,
} from '@ant-design/icons'

const { Title} = Typography
const { Option } = Select

const UserManagement: React.FC = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: undefined,
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { page, limit, search, role } = queryParams
      let url = `/api/users?page=${page}&limit=${limit}&search=${search}`
      if (role) url += `&role=${role}`

      const res = await fetch(url)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
        setTotal(result.meta?.pagination.total || 0)
      }
    } catch (e) {
      message.error('加载用户数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [queryParams])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const url = editingId ? `/api/users/${editingId}` : '/api/users'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await res.json()
      if (result.success) {
        message.success(editingId ? '用户信息已更新' : '新用户创建成功')
        setIsModalOpen(false)
        fetchData()
      } else {
        message.error(result.message)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const openEdit = (record: any) => {
    setEditingId(record.id)
    setIsModalOpen(true)
    setTimeout(() => {
      // 编辑时不回填密码
      form.setFieldsValue({ ...record, password: '' })
    }, 0)
  }

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if ((await res.json()).success) {
      message.success('用户已删除')
      fetchData()
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '账号',
      dataIndex: 'username',
      key: 'username',
      fontWeight: 'bold',
    },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colors = { ADMIN: 'red', TEACHER: 'purple', STUDENT: 'blue' }
        const labels = { ADMIN: '管理员', TEACHER: '教师', STUDENT: '学生' }
        return (
          <Tag color={colors[role as keyof typeof colors]}>
            {labels[role as keyof typeof labels]}
          </Tag>
        )
      },
    },
    {
      title: '积分/权重',
      dataIndex: 'score',
      key: 'score',
      render: (score: number, record: any) =>
        record.role === 'STUDENT' ? <Tag color="gold">{score}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定注销此账号吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>全系统用户管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null)
            setIsModalOpen(true)
            setTimeout(() => form.resetFields(), 0)
          }}
        >
          新增用户
        </Button>
      </div>

      <Space className="mb-4" size="middle">
        <Input
          placeholder="搜索账号或姓名"
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          onPressEnter={e =>
            setQueryParams({
              ...queryParams,
              search: e.currentTarget.value,
              page: 1,
            })
          }
        />
        <Select
          placeholder="按角色筛选"
          style={{ width: 150 }}
          allowClear
          onChange={val =>
            setQueryParams({ ...queryParams, role: val, page: 1 })
          }
        >
          <Option value="ADMIN">管理员</Option>
          <Option value="TEACHER">教师</Option>
          <Option value="STUDENT">学生</Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.limit,
          total: total,
          onChange: page => setQueryParams({ ...queryParams, page }),
        }}
      />

      <Modal
        title={editingId ? '编辑用户信息' : '创建新用户'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="role" label="用户角色" rules={[{ required: true }]}>
            <Select>
              <Option value="STUDENT">学生</Option>
              <Option value="TEACHER">教师</Option>
              <Option value="ADMIN">管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="username"
            label="登录账号"
            rules={[{ required: true }]}
          >
            <Input
              disabled={!!editingId}
              prefix={<UserOutlined />}
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item name="name" label="真实姓名" rules={[{ required: true }]}>
            <Input autoComplete='name'/>
          </Form.Item>
          <Form.Item
            name="password"
            label={editingId ? '重置密码 (留空则不修改)' : '登录密码'}
            rules={[{ required: !editingId, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<KeyOutlined />}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('role') === 'STUDENT' ? (
                <Form.Item name="score" label="学生积分" initialValue={0}>
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default UserManagement
