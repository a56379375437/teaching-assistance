// 该文件主要配置类型、路由映射、数据格式

// 主要网址：
// 线上模拟实验
export const experimentkey = '/knowledge-unit'
// 学习效果测评
export const evaluationkey = '/evaluation'

//路由映射
export const CONFIG_ROUTE = {
  // 后端路由
  backendQuestion: '/api/questions', // 题目
  backendAiQuestion: '/api/aiquestion', // ai生成题目
}

//针定义(用于浦丰投针实验)
export type Needle = {
  x: number
  y: number
  angle: number
  intersect: boolean
}

// 题目类型定义
export const QUESTION_TYPES = [
  { label: '单选题', value: 'SINGLE_CHOICE' },
  { label: '多选题', value: 'MULTIPLE_CHOICE' },
  { label: '判断题', value: 'JUDGMENT' },
  { label: '填空题', value: 'FILL_BLANK' },
  { label: '计算题', value: 'CALCULATION' },
  { label: '简答题', value: 'SHORT_ANSWER' },
]

// 知识点枚举映射
export const KNOWLEDGE_UNIT_OPTIONS = [
  { label: '概率论基础', value: 'PROBABILITY_BASE' },
  { label: '随机变量', value: 'RANDOM_VARIABLE' },
  { label: '数字特征', value: 'DIGITAL_CHARACTER' },
  { label: '大数定律', value: 'LARGE_NUMBER_LAW' },
  { label: '数理统计', value: 'MATHEMATICAL_STAT' },
  { label: '点估计', value: 'POINT_ESTIMATION' },
  { label: '假设检验', value: 'HYPOTHESIS_TEST' },
]

// 题目难度枚举映射
export const QUESTION_LEVELS = [
  { label: '简单', value: 'EASY' },
  { label: '中等', value: 'MEDIUM' },
  { label: '困难', value: 'HARD' },
]

// 单一问题属性定义
export interface Question {
  id?: number
  title: string
  type: string
  level: string
  knowledgeUnit: string
  score: number
  options?: { content: string; isCorrect: boolean }[]
  answer?: string
  creator?: string
  createdAt?: Date
  updatedAt?: Date
}

// 问题列表属性定义
export interface QuestionList {
  total: number
  pagesize: number
  skip: number
  QUESTION_TYPES: string[]
  QUESTION_LEVELS: string[]
  KNOWLEDGE_UNIT_OPTIONS: string[]
  questions: Question[]
  totalPages: number
}

// 使用zustand存储的数据格式
export interface QuestionStore {
  // 数据状态
  questions: Question[]
  total: number
  pageNum: number
  pageSize: number

  //筛选状态
  searchText: string
  selectedType: string // 对应 QUESTION_TYPES
  selectedLevel: string // 对应 QUESTION_LEVELS
  selectedKnowledgeUnit: string // 对应 KNOWLEDGE_UNIT_OPTIONS

  //操作
  setQuestions: (questions: Question[]) => void
  setTotal: (total: number) => void
  setPageNum: (pageNum: number) => void
  setPageSize: (pageSize: number) => void

  // 筛选设置
  setSearchText: (text: string) => void
  setFilterType: (type: string) => void
  setFilterLevel: (level: string) => void
  setFilterKnowledgeUnit: (unit: string) => void

  // 重置
  resetFilters: () => void
  resetAll: () => void
}