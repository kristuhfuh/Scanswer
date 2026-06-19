import { GoogleGenAI } from '@google/genai'

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
  const ai = new GoogleGenAI({ apiKey })

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

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-lite',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 150,
    },
    contents: [{ role: 'user', parts }],
  })

  return (response.text ?? '').trim()
}
