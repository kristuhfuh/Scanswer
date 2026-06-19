import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a precise answer extraction assistant. Your job is to read the provided knowledge base and answer questions from it.

Rules:
- For multiple choice questions (options A, B, C, D etc.): respond with ONLY the letter(s) of the correct option, e.g. "A" or "B and C".
- For short-answer questions: respond with a single brief phrase or sentence — never more than one line.
- Never explain your reasoning. Never add "The answer is". Never restate the question.
- If the answer is genuinely not found in the knowledge base, respond with exactly: "Not found in documents"`

type SupportedMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
const SUPPORTED_TYPES: SupportedMimeType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

function toSupportedMime(mime: string): SupportedMimeType {
  return (SUPPORTED_TYPES as string[]).includes(mime) ? (mime as SupportedMimeType) : 'image/jpeg'
}

export async function queryKnowledgeBase(
  apiKey: string,
  question: string,
  knowledgeContent: string,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const knowledgeSection =
    knowledgeContent.trim().length > 0
      ? `<knowledge_base>\n${knowledgeContent}\n</knowledge_base>`
      : '<knowledge_base>(empty — no documents added yet)</knowledge_base>'

  type ContentBlock =
    | { type: 'text'; text: string }
    | { type: 'image'; source: { type: 'base64'; media_type: SupportedMimeType; data: string } }

  const userContent: ContentBlock[] = []

  if (imageBase64 && imageMimeType) {
    userContent.push({
      type: 'image',
      source: { type: 'base64', media_type: toSupportedMime(imageMimeType), data: imageBase64 },
    })
    userContent.push({
      type: 'text',
      text: `${knowledgeSection}\n\nThe image above contains the question. Answer it using only the knowledge base above.`,
    })
  } else {
    userContent.push({
      type: 'text',
      text: `${knowledgeSection}\n\nQuestion: ${question}`,
    })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userContent }],
  })

  const block = message.content[0]
  if (block.type === 'text') return block.text.trim()
  return 'No answer returned'
}
