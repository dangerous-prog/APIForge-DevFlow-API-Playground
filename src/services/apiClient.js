import axios from "axios";

/**
 * Sends an API request directly to the target URL.
 * No backend — pure browser Axios call.
 */
export async function sendRequest({ method, url, headers = {}, body = null }) {
  const config = {
    method: method.toLowerCase(),
    url: url,
    headers: headers,
  };

  if (body && ["post", "put", "patch"].includes(method.toLowerCase())) {
    try {
      config.data = JSON.parse(body);
    } catch {
      config.data = body;
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
  };
}