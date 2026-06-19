import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are a precise answer extraction assistant. Your job is to read the provided knowledge base and answer questions from it.

Rules:
- For multiple choice questions (options A, B, C, D etc.): respond with ONLY the letter(s) of the correct option, e.g. "A" or "B and C".
- For short-answer questions: respond with a single brief phrase or sentence — never more than one line.
- Never explain your reasoning. Never add "The answer is". Never restate the question.
- If the answer is genuinely not found in the knowledge base, respond with exactly: "Not found in documents"`

export async function queryKnowledgeBase(
  apiKey: string,
  question: string,
  knowledgeContent: string,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  })

  const knowledgeSection =
    knowledgeContent.trim().length > 0
      ? `<knowledge_base>\n${knowledgeContent}\n</knowledge_base>`
      : '<knowledge_base>(empty — no documents added yet)</knowledge_base>'

  type Part =
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }

  const parts: Part[] = []

  if (imageBase64 && imageMimeType) {
    parts.push({ inlineData: { data: imageBase64, mimeType: imageMimeType } })
    parts.push({ text: `${knowledgeSection}\n\nThe image above contains the question. Answer it using only the knowledge base above.` })
  } else {
    parts.push({ text: `${knowledgeSection}\n\nQuestion: ${question}` })
  }

  const result = await model.generateContent(parts)
  return result.response.text().trim()
}
