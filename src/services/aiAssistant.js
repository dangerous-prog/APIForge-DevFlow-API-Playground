const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function describeEndpoint({ url, method, responseData, statusCode }) {
  const bodyPreview =
    typeof responseData === "object"
      ? JSON.stringify(responseData, null, 2).slice(0, 1500)
      : String(responseData).slice(0, 1500);

  const prompt = `You are an API documentation expert. Analyze this API response and explain it clearly.

Endpoint: ${method} ${url}
Status: ${statusCode}
Response:
${bodyPreview}

Respond in JSON with exactly this structure:
{
  "summary": "One sentence describing what this endpoint does",
  "purpose": "2-3 sentences about its use case",
  "data_type": "What kind of data is returned",
  "notable_fields": ["field1: description", "field2: description"],
  "suggestions": ["A follow-up request to try", "Another thing to explore"]
}

Return ONLY valid JSON, no markdown, no explanation.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  console.log("Groq response:", data);

  if (!response.ok) {
    throw new Error(`Groq API error: ${data.error?.message || response.status}`);
  }

  const raw = data.choices[0].message.content.trim();
  console.log("Raw AI response:", raw);

  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return { summary: "Could not parse AI response", raw };
  }
}