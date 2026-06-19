export async function queryKnowledgeBase(
  password: string,
  question: string,
  knowledgeContent: string,
  imageBase64?: string,
  imageMimeType?: string,
): Promise<string> {
  const res = await fetch('/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, question, knowledgeContent, imageBase64, imageMimeType }),
  })

  const data = await res.json() as { answer?: string; error?: string }

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`)
  }

  return data.answer ?? 'No answer returned'
}
