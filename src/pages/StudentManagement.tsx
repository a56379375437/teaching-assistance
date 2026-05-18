import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
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
  UserOutlined,
} from '@ant-design/icons'

const { Title } = Typography

const StudentManagement: React.FC = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: '',
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editingId, setEditingId] = useState<number | null>(null)

  // 获取数据
  const fetchData = async () => {
    setLoading(true)
    try {
      const { page, limit, search } = queryParams
      // 强制只查询 STUDENT 角色
      const url = `/api/users?role=STUDENT&page=${page}&limit=${limit}&search=${search}`
      const res = await fetch(url)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
        const serverTotal = result.pagination?.total || result.total || 0;
        setTotal(serverTotal)
      }
    } catch (e) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [queryParams])

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        message.success('删除成功')
        fetchData()
      }
    } catch (e) {
      message.error('删除失败')
    }
  }

  // 提交表单（新增或编辑）
  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const url = editingId ? `/api/users/${editingId}` : '/api/users'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, role: 'STUDENT' }),
      })

      const result = await res.json()
      if (result.success) {
        message.success(editingId ? '更新成功' : '创建成功')
        setIsModalOpen(false)
        fetchData()
      } else {
        message.error(result.message)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 打开编辑弹窗
  const openEdit = (record: any) => {
    setEditingId(record.id)
    setIsModalOpen(true)
    setTimeout(() => {
      form.setFieldsValue(record);
    },0);
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '登录账号', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '当前积分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <Tag color="gold">{score}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该学生账号吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger>
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
        <Title level={3}>学生账号管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null)
            form.resetFields()
            setIsModalOpen(true)
            setTimeout(() => form.resetFields(), 0)
          }}
        >
          新增学生
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="搜索姓名或账号..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          onPressEnter={e =>
            setQueryParams({
              ...queryParams,
              search: e.currentTarget.value,
              page: 1,
            })
          }
        />
      </div>

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

      {isModalOpen && (
        <Modal
          title={editingId ? '修改学生信息' : '新增学生账号'}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={() => setIsModalOpen(false)}
        >
          <Form form={form} layout="vertical" className="mt-4">
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
            <Form.Item
              name="name"
              label="学生姓名"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            {!editingId && (
              <Form.Item
                name="password"
                label="初始密码"
                rules={[{ required: true }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            )}
            <Form.Item name="score" label="积分设置" initialValue={0}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Card>
  )
}

export default StudentManagement
