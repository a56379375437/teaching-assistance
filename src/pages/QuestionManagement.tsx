import { useState, useEffect, useCallback } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Tag,
  Popconfirm,
  Card,
  Typography,
  Divider,
  Flex,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import {
  CONFIG_ROUTE,
  KNOWLEDGE_UNIT_OPTIONS,
  QUESTION_TYPES,
  type Question,
} from '../types'
import { useAuthStore } from '../store'

const { Title} = Typography
const { Option } = Select
const { Search } = Input

export default function QuestionManagement() {
  const [data, setData] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  // 筛选条件状态
  const [filters, setFilters] = useState({
    search: '',
    type: undefined,
    level: undefined,
    knowledgeUnit: undefined,
  })

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const { user } = useAuthStore.getState()

  //修改获取列表逻辑，加入筛选参数
  const fetchData = useCallback(
    async (page = 1, pageSize = 10) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        })

        // 动态添加筛选条件
        if (filters.search) params.append('search', filters.search)
        if (filters.type) params.append('type', filters.type)
        if (filters.level) params.append('level', filters.level)
        if (filters.knowledgeUnit)
          params.append('knowledgeUnit', filters.knowledgeUnit)

        const response = await fetch(`/api/questions?${params.toString()}`)
        if (!response.ok) throw new Error('网络响应错误')

        const resData = await response.json()
        if (resData.success) {
          setData(resData.data)
          setPagination(prev => ({
            ...prev,
            current: page,
            total: resData.pagination.total,
          }))
        }
      } catch (error) {
        message.error('获取数据失败')
      } finally {
        setLoading(false)
      }
    },
    [filters]
  ) // 依赖 filters，当 filters 改变时重新生成函数

  useEffect(() => {
    fetchData(1, pagination.pageSize)
  }, [fetchData])

  // 处理筛选变化
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // 重置筛选
  const handleReset = () => {
    setFilters({
      search: '',
      type: undefined,
      level: undefined,
      knowledgeUnit: undefined,
    })
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('删除失败')
      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleFinish = async (values: any) => {
    try {
      const submitData = { ...values, creatorId: user?.id }
      if (values.type === 'JUDGMENT')
        submitData.answer = values.answer === 'true'
      if (values.options && Array.isArray(values.options)) {
        submitData.options = values.options.map((opt: any, index: number) => ({
          content: opt.content,
          isCorrect: !!opt.isCorrect,
          order: opt.order || index + 1,
        }))
      } else {
        submitData.options = []
      }

      const url = editingId
        ? CONFIG_ROUTE.backendQuestion + `/${editingId}`
        : CONFIG_ROUTE.backendQuestion
      const method = editingId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorResult = await response.json()
        throw new Error(errorResult.msg || '操作失败')
      }

      message.success(editingId ? '更新成功' : '创建成功')
      setIsModalVisible(false)
      fetchData(editingId ? pagination.current : 1)
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  const handleAIGenerate = async () => {
    const currentValues = form.getFieldsValue([
      'title',
      'type',
      'knowledgeUnit',
    ])
    if (!currentValues.title || currentValues.title.length < 5)
      return message.warning('请先在题干处输入大致要求')
    setAiLoading(true)
    try {
      const response = await fetch(CONFIG_ROUTE.backendAiQuestion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentValues.title,
          type: currentValues.type,
          knowledgeUnit: currentValues.knowledgeUnit,
        }),
      })
      const resData = await response.json()
      if (resData.code !== 200) throw new Error(resData.message)
      const aiResult = resData.data
      form.setFieldsValue({
        title: aiResult.title,
        type: aiResult.type,
        level: aiResult.level,
        knowledgeUnit: aiResult.knowledgeUnit,
        score: aiResult.score || 5,
        answer: aiResult.answer,
        options: aiResult.options?.map((opt: any, index: number) => ({
          ...opt,
          order: index + 1,
        })),
      })
      message.success('AI 已成功润色题目')
    } catch (error: any) {
      message.error('AI请求失败: ' + error.message)
    } finally {
      setAiLoading(false)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: '题干', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">
          {QUESTION_TYPES.find(t => t.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: '知识单元',
      dataIndex: 'knowledgeUnit',
      key: 'knowledgeUnit',
      render: (val: string) =>
        KNOWLEDGE_UNIT_OPTIONS.find(opt => opt.value === val)?.label || val,
    },
    {
      title: '难度',
      dataIndex: 'level',
      key: 'level',
      render: (l: string) => {
        const colors: any = { EASY: 'green', MEDIUM: 'orange', HARD: 'red' }
        const labels: any = { EASY: '容易', MEDIUM: '中等', HARD: '困难' }
        return <Tag color={colors[l]}>{labels[l]}</Tag>
      },
    },
    { title: '分值', dataIndex: 'score', key: 'score', width: 80 },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Question) => (
        <Flex gap="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record.id!)
              form.setFieldsValue(record)
              setIsModalVisible(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Flex>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Flex
          justify="space-between"
          align="center"
          style={{ marginBottom: 24 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            题目管理系统
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              setIsModalVisible(true)
            }}
          >
            手动新增题目
          </Button>
        </Flex>

        {/* 筛选工具栏 */}
        <Card
          size="small"
          style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
        >
          <Flex gap="middle" wrap="wrap">
            <Search
              placeholder="搜索题干关键词"
              onSearch={val => handleFilterChange('search', val)}
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              style={{ width: 250 }}
              allowClear
            />

            <Select
              placeholder="题目类型"
              style={{ width: 140 }}
              allowClear
              value={filters.type}
              onChange={val => handleFilterChange('type', val)}
            >
              {QUESTION_TYPES.map(t => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="难度"
              style={{ width: 100 }}
              allowClear
              value={filters.level}
              onChange={val => handleFilterChange('level', val)}
            >
              <Option value="EASY">容易</Option>
              <Option value="MEDIUM">中等</Option>
              <Option value="HARD">困难</Option>
            </Select>

            <Select
              placeholder="知识单元"
              style={{ width: 180 }}
              allowClear
              value={filters.knowledgeUnit}
              onChange={val => handleFilterChange('knowledgeUnit', val)}
            >
              {KNOWLEDGE_UNIT_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>

            <Tooltip title="重置筛选">
              <Button icon={<SyncOutlined />} onClick={handleReset} />
            </Tooltip>
          </Flex>
        </Card>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
        />
      </Card>

      {/* Modal 部分保持不变 */}
      <Modal
        title={editingId ? '编辑题目' : '新增题目'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={loading}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{ type: 'SINGLE_CHOICE', level: 'EASY', score: 5 }}
        >
          <Form.Item
            name="title"
            label="题干内容"
            rules={[{ required: true, message: '请输入题干' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入题目描述，或输入简短描述后点击下方 AI 生成"
            />
          </Form.Item>
          <div style={{ marginBottom: 24 }}>
            <Button
              type="dashed"
              icon={<RobotOutlined />}
              onClick={handleAIGenerate}
              loading={aiLoading}
              block
            >
              使用 AI 自动完善题目详情 (基于当前标题)
            </Button>
          </div>
          <Flex gap="16px">
            <Form.Item
              name="type"
              label="题目类型"
              style={{ flex: 1 }}
              rules={[{ required: true }]}
            >
              <Select>
                {QUESTION_TYPES.map(t => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="level" label="难度" style={{ flex: 1 }}>
              <Select>
                <Option value="EASY">容易</Option>
                <Option value="MEDIUM">中等</Option>
                <Option value="HARD">困难</Option>
              </Select>
            </Form.Item>
            <Form.Item name="score" label="建议分值" style={{ flex: 1 }}>
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Flex>
          <Form.Item
            name="knowledgeUnit"
            label="所属知识单元"
            rules={[{ required: true, message: '请输入知识单元' }]}
          >
            <Select placeholder="请选择知识单元">
              {KNOWLEDGE_UNIT_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Divider orientation="horizontal">答案与选项</Divider>
          <Form.List name="options">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Flex
                    key={key}
                    gap="small"
                    align="baseline"
                    style={{ marginBottom: 8 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      style={{ flex: 1 }}
                      rules={[{ required: true, message: '内容必填' }]}
                    >
                      <Input placeholder="选项内容" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'isCorrect']}>
                      <Select placeholder="正确项？" style={{ width: 120 }}>
                        <Option value={true}>正确答案</Option>
                        <Option value={false}>干扰项</Option>
                      </Select>
                    </Form.Item>
                    <DeleteOutlined
                      onClick={() => remove(name)}
                      style={{ color: 'red' }}
                    />
                  </Flex>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加选项
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type')
              if (type === 'JUDGMENT') {
                return (
                  <Form.Item
                    name="answer"
                    label="标准答案"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="请选择正确项">
                      <Option value="true">正确 (True)</Option>
                      <Option value="false">错误 (False)</Option>
                    </Select>
                  </Form.Item>
                )
              }
              return (
                <Form.Item name="answer" label="标准答案 (非选择题使用)">
                  <Input.TextArea placeholder="请输入详细标准答案" />
                </Form.Item>
              )
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
