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
 * Sends an API request directly to the target URL.
 * Supports environment variable replacement in URL and headers.
 */
export async function sendRequest({ method, url, headers = {}, body = null, envVars = {} }) {
  // Replace env vars in URL and headers
  const resolvedUrl = replaceEnvVars(url, envVars);
  const resolvedHeaders = {};
  Object.entries(headers).forEach(([key, value]) => {
    resolvedHeaders[replaceEnvVars(key, envVars)] = replaceEnvVars(value, envVars);
  });

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