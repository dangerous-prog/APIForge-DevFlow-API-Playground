const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Post-request: Analyze an API response and explain the endpoint.
 */
export async function describeEndpoint({ url, method, responseData, statusCode }) {
  if (!GROQ_API_KEY) {
    return {
      summary: "API Key Missing",
      purpose: "Please add VITE_GROQ_API_KEY to your .env file to enable AI features.",
      data_type: "N/A",
      notable_fields: [],
      suggestions: []
    };
  }

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

  if (!response.ok) {
    throw new Error(`Groq API error: ${data.error?.message || response.status}`);
  }

  const raw = data.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return { summary: "Could not parse AI response", raw };
  }
}

/**
 * Pre-request: Analyze a URL before sending and suggest method, headers, body.
 */
export async function analyzeUrlBeforeSend(url) {
  if (!GROQ_API_KEY) {
    return {
      method: "",
      description: "API Key Missing. Please add VITE_GROQ_API_KEY to your .env file to enable AI auto-fill.",
      suggestedHeaders: [],
      suggestedBody: null,
      suggestedParams: [],
      tips: ["AI features are currently disabled."]
    };
  }

  const prompt = `You are an API expert. Analyze this API endpoint URL and suggest the best way to call it.

URL: ${url}

Respond in JSON with exactly this structure:
{
  "method": "GET or POST or PUT etc",
  "description": "One sentence explaining what this endpoint likely does",
  "suggestedHeaders": [
    {"key": "Accept", "value": "application/json"}
  ],
  "suggestedBody": null,
  "suggestedParams": [],
  "tips": ["Any useful tips for this API"]
}

If the URL looks like it needs a request body (like a POST endpoint), include a sample JSON body as a string in "suggestedBody".
For suggestedParams, provide an array of {"key": "...", "value": "..."} objects for likely query parameters.
Return ONLY valid JSON, no markdown, no explanation.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Groq API error: ${data.error?.message || response.status}`);
  }

  const raw = data.choices[0].message.content.trim();
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return { description: "Could not parse AI suggestion", raw };
  }
}