import React, { useEffect, useState, useRef } from 'react'
import {
  Card,
  Button,
  Radio,
  Checkbox,
  Input,
  Space,
  Progress,
  Typography,
  Empty,
  Result,
  message,
  Tag,
} from 'antd'
import {
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useQuestionStore } from '../store/index'
import { QUESTION_TYPES, QUESTION_LEVELS } from '../types'

const { Title, Text } = Typography

interface Props {
  knowledgeUnit: string
}

const ExperimentQuestion: React.FC<Props> = ({ knowledgeUnit }) => {
  const {
    questions,
    setQuestions,
    userAnswers,
    setAnswer,
    currentStep,
    nextStep,
    prevStep,
    finishQuestion,
    isFinished,
    score,
    resetQuestion,
  } = useQuestionStore()

  //状态管理
  const [loading, setLoading] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [targetCount, setTargetCount] = useState<number>(0) // 0 表示还没开始，在选择题数页面
  const [seconds, setSeconds] = useState(0) // 计时器
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 计时器逻辑
  useEffect(() => {
    if (targetCount > 0 && !isFinished) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [targetCount, isFinished])

  // 格式化时间
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取题目逻辑
  const fetchQuestions = async (count: number) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/questions?knowledgeUnit=${knowledgeUnit}`
      )
      const result = await response.json()
      // 随机抽取指定数量
      const shuffled = (result.data || [])
        .sort(() => 0.5 - Math.random())
        .slice(0, count)

      if (shuffled.length === 0) {
        message.warning('该知识点题目不足')
      }
      setQuestions(shuffled)
      setTargetCount(count)
      setSeconds(0) // 重置时间
    } catch (e) {
      message.error('获取题目失败')
    } finally {
      setLoading(false)
    }
  }

  // 重新开始逻辑
  const handleRestart = () => {
    resetQuestion()
    setTargetCount(0)
    setShowReview(false)
    setSeconds(0)
  }

  //渲染初始选择页面
  if (targetCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm">
        <Title level={3}>请选择本次练习题量</Title>
        <Space size="large" className="mt-8">
          {[5, 10, 15].map(num => (
            <Button
              key={num}
              type="primary"
              size="large"
              shape="round"
              onClick={() => fetchQuestions(num)}
              loading={loading}
            >
              {num} 道题
            </Button>
          ))}
        </Space>
      </div>
    )
  }

  if (loading) return <Card loading />
  if (questions.length === 0) return <Empty description="暂无题目" />

  // 渲染结果完成页面
  if (isFinished && !showReview) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Result
          status={score >= 60 ? 'success' : 'warning'}
          title={`测评结束！得分：${score}`}
          subTitle={`用时：${formatTime(seconds)}。您可以查看解析或重新挑战新题。`}
          extra={[
            <Button
              type="primary"
              key="review"
              icon={<EyeOutlined />}
              onClick={() => setShowReview(true)}
            >
              查看错题与答案
            </Button>,
            <Button
              key="retry"
              icon={<ReloadOutlined />}
              onClick={handleRestart}
            >
              重新做新题
            </Button>,
          ]}
        />
      </div>
    )
  }

  // 核心渲染逻辑：区分“答题模式”和“查看回看模式”
  const currentQuestion = questions[currentStep]
  const isReviewMode = showReview // 是否是回看模式
  const progress = Math.round(((currentStep + 1) / questions.length) * 100)

  const renderInput = () => {
    const userAnswer = userAnswers[currentQuestion.id]

    switch (currentQuestion.type) {
      case 'SINGLE_CHOICE':
      case 'JUDGMENT':
      case 'MULTIPLE_CHOICE': {
        const isMultiple = currentQuestion.type === 'MULTIPLE_CHOICE'
        const Component = isMultiple ? Checkbox.Group : Radio.Group

        return (
          <Component
            value={userAnswer}
            disabled={isReviewMode} // 回看时禁用
            onChange={val =>
              !isReviewMode &&
              setAnswer(
                currentQuestion.id,
                isMultiple ? val : (val as any).target.value
              )
            }
            className="w-full"
          >
            <Space direction="vertical" className="w-full">
              {currentQuestion.options?.map((opt: any) => {
                // 颜色逻辑
                let bgColor = 'transparent'
                let textColor = 'inherit'

                if (isReviewMode) {
                  const isUserSelected = isMultiple
                    ? (userAnswer || []).includes(opt.id)
                    : userAnswer === opt.id

                  if (opt.isCorrect) {
                    bgColor = '#f6ffed' // 正确选项背景绿色
                    textColor = '#52c41a'
                  } else if (isUserSelected && !opt.isCorrect) {
                    bgColor = '#fff1f0' // 错选背景红色
                    textColor = '#ff4d4f'
                  }
                }

                return (
                  <div
                    key={opt.id}
                    style={{
                      backgroundColor: bgColor,
                      padding: '8px 12px',
                      borderRadius: '4px',
                      border:
                        bgColor !== 'transparent'
                          ? `1px solid ${textColor}`
                          : '1px solid #f0f0f0',
                    }}
                    className="flex items-center"
                  >
                    {isMultiple ? (
                      <Checkbox value={opt.id} style={{ color: textColor }}>
                        {opt.content}
                      </Checkbox>
                    ) : (
                      <Radio value={opt.id} style={{ color: textColor }}>
                        {opt.content}
                      </Radio>
                    )}
                    {isReviewMode && opt.isCorrect && (
                      <Tag color="success" className="ml-2">
                        正确答案
                      </Tag>
                    )}
                    {isReviewMode &&
                      !opt.isCorrect &&
                      (isMultiple
                        ? (userAnswer || []).includes(opt.id)
                        : userAnswer === opt.id) && (
                        <Tag color="error" className="ml-2">
                          你的选择
                        </Tag>
                      )}
                  </div>
                )
              })}
            </Space>
          </Component>
        )
      }

      default: // 填空/简答
        return (
          <div className="space-y-4">
            <Input.TextArea
              rows={4}
              placeholder="请输入你的答案"
              value={userAnswer}
              disabled={isReviewMode}
              onChange={e => setAnswer(currentQuestion.id, e.target.value)}
            />
            {isReviewMode && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <Text type="success" strong>
                  标准答案：
                </Text>
                <div className="mt-1">
                  {currentQuestion.answer || '暂无解析'}
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center mb-4">
        <Space>
          <ClockCircleOutlined />
          <Text strong className="text-lg">
            {formatTime(seconds)}
          </Text>
        </Space>
        {isReviewMode && (
          <Button icon={<ReloadOutlined />} onClick={handleRestart}>
            结束查看并重新出题
          </Button>
        )}
      </div>

      <Progress
        percent={progress}
        status={isReviewMode ? 'normal' : 'active'}
        className="mb-6"
      />

      <Card
        title={
          <Space>
            <Tag color="blue">
              {
                QUESTION_TYPES.find(t => t.value === currentQuestion.type)
                  ?.label
              }
            </Tag>
            <span>
              题目 {currentStep + 1} / {questions.length}
            </span>
            <Text type="secondary">({currentQuestion.score}分)</Text>
          </Space>
        }
        actions={[
          <Button disabled={currentStep === 0} onClick={prevStep}>
            上一题
          </Button>,
          currentStep === questions.length - 1 ? (
            isReviewMode ? (
              <Button type="primary" onClick={handleRestart}>
                重新挑战
              </Button>
            ) : (
              <Button type="primary" onClick={finishQuestion} danger>
                提交测评
              </Button>
            )
          ) : (
            <Button type="primary" onClick={nextStep}>
              下一题
            </Button>
          ),
        ]}
      >
        <Title level={4} className="mb-6">
          {currentQuestion.title}
        </Title>
        <div className="py-4">{renderInput()}</div>
      </Card>

      <div className="mt-4 text-right">
        <Tag color={currentQuestion.level === 'HARD' ? 'red' : 'green'}>
          难度：
          {QUESTION_LEVELS.find(l => l.value === currentQuestion.level)?.label}
        </Tag>
      </div>
    </div>
  )
}

export default ExperimentQuestion
