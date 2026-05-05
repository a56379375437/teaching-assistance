import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
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
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { CONFIG_ROUTE, KNOWLEDGE_UNIT_OPTIONS, QUESTION_TYPES, type Question } from '../types'
import { useAuthStore } from '../store'

const { Title } = Typography
const { Option } = Select

export default function QuestionManagement() {
  const [data, setData] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const {user} = useAuthStore.getState();

  // 1. 获取列表数据 (GET 请求)
  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      // Fetch发起请求
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      })
      const response = await fetch(`/api/questions?${params.toString()}`)

      if (!response.ok) throw new Error('网络响应错误')

      const resData = await response.json()

      if (resData.success) {
        setData(resData.data)
        setPagination({
          ...pagination,
          current: page,
          total: resData.pagination.total,
        })
      }
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 2. 删除题目 (DELETE 请求)
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 3. 提交表单 (POST/PUT 请求)
  const handleFinish = async (values: any) => {
    try {
      // 数据预处理
      const submitData = { ...values,creatorId:user?.id }

      // 如果是判断题，将字符串 "true"/"false" 转为 Boolean 类型
      if (values.type === 'JUDGMENT') {
        submitData.answer = values.answer === 'true'
      }

      //处理选择题选项，添加缺失的 order 字段
      if (values.options && Array.isArray(values.options)) {
         submitData.options = values.options.map((opt: any, index: number) => ({
           content: opt.content,
           isCorrect: !!opt.isCorrect, // 强制转布尔
           order: opt.order || index + 1, // 如果 AI 没给 order，按索引生成
         }))
      } else {
        // 如果是非选择题，确保 options 是空数组
        submitData.options = []
      }

      const url = editingId ? CONFIG_ROUTE.backendQuestion+`/${editingId}` : CONFIG_ROUTE.backendQuestion
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData), // 发送转换后的数据
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

  // 4. AI 自动生成题目 (POST 请求)
  const handleAIGenerate = async () => {
    // 获取当前表单已选的值，作为 AI 的参考上下文
    const currentValues = form.getFieldsValue([
      'title',
      'type',
      'knowledgeUnit',
    ])

    if (!currentValues.title || currentValues.title.length < 5) {
      return message.warning('请先在题干处输入大致的题目要求(5个字以上)')
    }

    setAiLoading(true)
    try {
      const response = await fetch(CONFIG_ROUTE.backendAiQuestion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentValues.title,
          type: currentValues.type,
          knowledgeUnit: currentValues.knowledgeUnit,
        }),
      })

      if (!response.ok) throw new Error('AI生成失败')

      const resData = await response.json()
      if (resData.code !== 200) throw new Error(resData.message)

      const aiResult = resData.data

      // 用 AI 润色后的结果填充表单
      form.setFieldsValue({
        title: aiResult.title, // 更新为 AI 润色后的专业标题
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

      message.success('AI 已根据您的要求成功润色并生成题目')
    } catch (error: any) {
      console.error(error)
      // 失败兜底
      message.error('AI请求失败: ' + error.message)
    } finally {
      setAiLoading(false)
    }
  }

  // UI部分
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
    { title: '分值', dataIndex: 'score', key: 'score' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button
            type="link"
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
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space
          style={{
            marginBottom: 16,
            justifyContent: 'space-between',
            display: 'flex',
          }}
        >
          <Title level={3}>题目管理系统</Title>
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
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑题目' : '新增题目'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        confirmLoading={loading}
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

          <div style={{ display: 'flex', gap: '16px' }}>
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
          </div>

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
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'content']}
                      rules={[{ required: true, message: '请输入选项内容' }]}
                    >
                      <Input placeholder="选项内容" style={{ width: 400 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'isCorrect']}
                      valuePropName="checked"
                    >
                      <Select placeholder="是否正确答案" style={{ width: 120 }}>
                        <Option value={true}>正确答案</Option>
                        <Option value={false}>干扰项</Option>
                      </Select>
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加选项 (选择题使用)
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type')

              // 如果是判断题，显示下拉框选择 正确/错误
              if (type === 'JUDGMENT') {
                return (
                  <Form.Item
                    name="answer"
                    label="标准答案"
                    rules={[{ required: true, message: '请选择答案' }]}
                  >
                    <Select placeholder="请选择正确项">
                      <Option value="true">正确 (True)</Option>
                      <Option value="false">错误 (False)</Option>
                    </Select>
                  </Form.Item>
                )
              }

              // 其他题型保持原样
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
