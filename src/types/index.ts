export interface KnowledgeDocument {
  id: string
  name: string
  content: string
  type: 'text' | 'pdf' | 'txt'
  addedAt: number
}

export type QuestionInputMode = 'text' | 'image'

export interface AnswerResult {
  answer: string
  questionText: string
  sourceDocs: string[]
  timestamp: number
}
