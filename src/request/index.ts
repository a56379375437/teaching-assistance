// 该文件主要进行api请求，通常不由组件直接调用，而是经由utils包内的方法进行调用。当然，也可以在组件内进行调用

import { CONFIG_ROUTE } from "../types"

// 传入题目相关参数，获取ai返回结果
export const handleAiQuestion = async (data: {
  questionType: string
  questionCount: number
  language: string
}) => {
  try {
    const url = `${CONFIG_ROUTE.backendAiQuestion}?questionType=${data.questionType}&questionCount=${data.questionCount}&language=${data.language}`
    console.log(
      '%c [ url ]-197',
      'font-size:13px; background:pink; color:#bf2c9f;',
      url
    )
    console.log(
      '%c [  ]-198',
      'font-size:13px; background:pink; color:#bf2c9f;传入data为：' + data
    )
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return await res.json()
  } catch (error) {
    console.error('Failed to Ai create question:', error)
  }
}