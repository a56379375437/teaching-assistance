import { create } from 'zustand'
import { type QuestionState } from '../types'

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  userAnswers: {},
  currentStep: 0,
  isFinished: false,
  showReview: false,
  score: 0,
  setQuestions: questions =>
    set({
      questions,
      userAnswers: {},
      currentStep: 0,
      isFinished: false,
      showReview: false,
      score: 0,
    }),

  setAnswer: (questionId, answer) =>
    set(state => ({
      userAnswers: { ...state.userAnswers, [questionId]: answer },
    })),

  nextStep: () =>
    set(state => ({
      currentStep: Math.min(state.currentStep + 1, state.questions.length - 1),
    })),

  prevStep: () =>
    set(state => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  setShowReview: (showReview: boolean) => set({ showReview }),

  finishQuestion: () => {
    const { questions, userAnswers } = get()
    let totalScore = 0

    questions.forEach(q => {
      const userAnswer = userAnswers[q.id]

      // 计分逻辑
      if (q.type === 'SINGLE_CHOICE' || q.type === 'JUDGMENT') {
        const correctOpt = q.options?.find((o: any) => o.isCorrect)
        if (correctOpt && userAnswer === correctOpt.id) totalScore += q.score
      } else if (q.type === 'MULTIPLE_CHOICE') {
        const correctIds = q.options
          ?.filter((o: any) => o.isCorrect)
          .map((o: any) => o.id)
          .sort()
        const userIds = (userAnswer || []).sort()
        if (JSON.stringify(correctIds) === JSON.stringify(userIds))
          totalScore += q.score
      } else if (['FILL_BLANK', 'CALCULATION'].includes(q.type)) {
        const standard =
          q.fillBlank?.standardAnswer || q.calculation?.standardAnswer
        if (userAnswer?.trim() === standard?.trim()) totalScore += q.score
      }
    })

    set({ score: totalScore, isFinished: true, showReview: true })
  },

  resetQuestion: () =>
    set({
      userAnswers: {},
      currentStep: 0,
      isFinished: false,
      showReview: true,
      score: 0,
    }),
}))
