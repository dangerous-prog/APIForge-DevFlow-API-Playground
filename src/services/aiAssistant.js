const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

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

  console.log("API Key loaded:", ANTHROPIC_API_KEY ? "YES" : "NO - MISSING");

  const requestBody = {
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  };

  console.log("Sending request to Anthropic...");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(requestBody),
  });

  console.log("Response status:", response.status);

  const data = await response.json();
  console.log("Response data:", data);

  if (!response.ok) {
    throw new Error(`API error: ${data.error?.message || response.status}`);
  }

  const raw = data.content[0].text.trim();

  try {
    return JSON.parse(raw);
  } catch {
    return { summary: "Could not parse AI response", raw };
  }
}