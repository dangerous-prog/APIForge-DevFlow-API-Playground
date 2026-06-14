import axios from "axios";

/**
 * Replaces {{VARIABLE}} placeholders in a string with values from envVars object.
 */
export function replaceEnvVars(str, envVars = {}) {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return envVars[key] !== undefined ? envVars[key] : match;
  });
}

/**
 * Simulate a mock API response after a delay.
 */
function simulateMock(mock) {
  return new Promise((resolve) => {
    const start = performance.now();
    setTimeout(() => {
      const elapsed = Math.round(performance.now() - start);
      let data;
      try {
        data = JSON.parse(mock.responseBody);
      } catch {
        data = mock.responseBody;
      }
      resolve({
        status: mock.statusCode || 200,
        statusText: mock.statusCode === 200 ? "OK" : "Mock Response",
        headers: { "x-mock": "true", "content-type": "application/json" },
        data,
        elapsed,
        size: mock.responseBody.length,
        resolvedUrl: `mock://${mock.path.replace(/^\//, "")}`,
        isMock: true,
      });
    }, mock.latency || 200);
  });
}

/**
 * Sends an API request directly to the target URL.
 * Supports environment variable replacement in URL and headers.
 * Supports mock interception for URLs starting with "mock://".
 */
export async function sendRequest({
  method,
  url,
  headers = {},
  body = null,
  envVars = {},
  mockMatch = null,
}) {
  // Replace env vars in URL and headers
  const resolvedUrl = replaceEnvVars(url, envVars);
  const resolvedHeaders = {};
  Object.entries(headers).forEach(([key, value]) => {
    resolvedHeaders[replaceEnvVars(key, envVars)] = replaceEnvVars(
      value,
      envVars
    );
  });

  // Mock interception
  if (mockMatch) {
    return simulateMock(mockMatch);
  }

  const config = {
    method: method.toLowerCase(),
    url: resolvedUrl,
    headers: resolvedHeaders,
  };

  if (body && ["post", "put", "patch"].includes(method.toLowerCase())) {
    try {
      config.data = JSON.parse(replaceEnvVars(body, envVars));
    } catch {
      config.data = replaceEnvVars(body, envVars);
    }
  }

  const start = performance.now();
  const response = await axios(config);
  const elapsed = Math.round(performance.now() - start);

  return {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data,
    elapsed,
    size: JSON.stringify(response.data).length,
    resolvedUrl,
  };
}

/**
 * Fetches history from localStorage.
 */
export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("apiforge_history") || "[]");
  } catch {
    return [];
  }
}

/**
 * Saves a request to localStorage history.
 */
export function saveToHistory(entry) {
  const history = getHistory();
  const updated = [entry, ...history].slice(0, 50);
  localStorage.setItem("apiforge_history", JSON.stringify(updated));
}