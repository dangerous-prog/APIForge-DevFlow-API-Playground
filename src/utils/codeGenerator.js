/**
 * Converts a request config into various code snippets.
 */

export function generateCurl({ method, url, headers = {}, body = null }) {
  let curl = `curl -X ${method.toUpperCase()} '${url}'`;

  Object.entries(headers).forEach(([key, value]) => {
    curl += ` \\\n  -H '${key}: ${value}'`;
  });

  if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    curl += ` \\\n  -d '${body}'`;
  }

  return curl;
}

export function generateFetch({ method, url, headers = {}, body = null }) {
  const options = {
    method: method.toUpperCase(),
    headers,
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    options.body = body;
  }

  return `const response = await fetch('${url}', ${JSON.stringify(options, null, 2)});
const data = await response.json();
console.log(data);`;
}

export function generateAxios({ method, url, headers = {}, body = null }) {
  const config = { headers };
  let snippet = `import axios from 'axios';\n\n`;

  if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    snippet += `const response = await axios.${method.toLowerCase()}('${url}', ${body}, ${JSON.stringify(config, null, 2)});`;
  } else {
    snippet += `const response = await axios.${method.toLowerCase()}('${url}', ${JSON.stringify(config, null, 2)});`;
  }

  snippet += `\nconsole.log(response.data);`;
  return snippet;
}

export function generatePython({ method, url, headers = {}, body = null }) {
  let snippet = `import requests\n\n`;
  snippet += `headers = ${JSON.stringify(headers, null, 2)}\n\n`;

  if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    snippet += `data = ${body}\n\n`;
    snippet += `response = requests.${method.toLowerCase()}('${url}', headers=headers, json=data)`;
  } else {
    snippet += `response = requests.${method.toLowerCase()}('${url}', headers=headers)`;
  }

  snippet += `\nprint(response.json())`;
  return snippet;
}

/**
 * Returns all snippets at once.
 */
export function generateAllSnippets(requestConfig) {
  return {
    curl: generateCurl(requestConfig),
    fetch: generateFetch(requestConfig),
    axios: generateAxios(requestConfig),
    python: generatePython(requestConfig),
  };
}