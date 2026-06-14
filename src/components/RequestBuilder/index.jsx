import React, { useState, useCallback } from "react";
import { Sparkles, Zap } from "lucide-react";
import HeaderTable from "../HeaderTable";
import BodyEditor from "../BodyEditor";
import ResponseViewer from "../ResponseViewer";
import { sendRequest } from "../../services/apiClient";
import { generateAllSnippets } from "../../utils/codeGenerator";
import { describeEndpoint, analyzeUrlBeforeSend } from "../../services/aiAssistant";
import useAppStore from "../../store/useAppStore";
import "./RequestBuilder.css";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const METHOD_COLORS = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  PATCH: "#8b5cf6",
  DELETE: "#ef4444",
  HEAD: "#6b7280",
  OPTIONS: "#6b7280",
};

function RequestBuilder() {
  // Global store
  const activeRequest = useAppStore((s) => s.activeRequest);
  const updateActiveField = useAppStore((s) => s.updateActiveField);
  const setActiveResponse = useAppStore((s) => s.setActiveResponse);
  const setActiveLoading = useAppStore((s) => s.setActiveLoading);
  const setActiveError = useAppStore((s) => s.setActiveError);
  const addToHistory = useAppStore((s) => s.addToHistory);
  const getActiveEnvVars = useAppStore((s) => s.getActiveEnvVars);
  const findMock = useAppStore((s) => s.findMock);
  const environments = useAppStore((s) => s.environments);
  const activeEnvironment = useAppStore((s) => s.activeEnvironment);
  const setActiveEnvironment = useAppStore((s) => s.setActiveEnvironment);

  const {
    method,
    url,
    headers,
    queryParams,
    authType,
    authToken,
    authApiKey,
    body,
    response,
    loading,
    error,
    activeTab,
  } = activeRequest;

  // Local UI state
  const [snippets, setSnippets] = useState(null);
  const [activeSnippet, setActiveSnippet] = useState("curl");
  const [showSnippets, setShowSnippets] = useState(false);
  const [aiDescription, setAiDescription] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAutoFill, setAiAutoFill] = useState(null);
  const [aiAutoFillLoading, setAiAutoFillLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // ── Query Params ↔ URL sync ──
  const buildUrlFromParams = useCallback(
    (params) => {
      try {
        const base = url.split("?")[0];
        const active = params.filter((p) => p.enabled && p.key.trim());
        if (active.length === 0) return base;
        const qs = active.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
        return `${base}?${qs}`;
      } catch {
        return url;
      }
    },
    [url]
  );

  const parseParamsFromUrl = useCallback((rawUrl) => {
    try {
      const qIndex = rawUrl.indexOf("?");
      if (qIndex === -1) return [{ key: "", value: "", enabled: true }];
      const qs = rawUrl.slice(qIndex + 1);
      const pairs = qs.split("&").map((pair) => {
        const [k, ...rest] = pair.split("=");
        return {
          key: decodeURIComponent(k || ""),
          value: decodeURIComponent(rest.join("=") || ""),
          enabled: true,
        };
      });
      return [...pairs, { key: "", value: "", enabled: true }];
    } catch {
      return [{ key: "", value: "", enabled: true }];
    }
  }, []);

  const handleUrlChange = (newUrl) => {
    updateActiveField("url", newUrl);
    updateActiveField("queryParams", parseParamsFromUrl(newUrl));
  };

  const handleParamsChange = (newParams) => {
    updateActiveField("queryParams", newParams);
    updateActiveField("url", buildUrlFromParams(newParams));
  };

  // ── Build final headers including auth ──
  const buildFinalHeaders = () => {
    const h = {};
    headers
      .filter((row) => row.enabled && row.key.trim())
      .forEach((row) => {
        h[row.key] = row.value;
      });

    if (authType === "bearer" && authToken.trim()) {
      h["Authorization"] = `Bearer ${authToken}`;
    } else if (authType === "apikey" && authApiKey.value.trim()) {
      if (authApiKey.addTo === "header") {
        h[authApiKey.key || "X-API-Key"] = authApiKey.value;
      }
    }
    return h;
  };

  // ── Build final URL including auth (API Key in query) ──
  const buildFinalUrl = () => {
    let finalUrl = url;
    if (
      authType === "apikey" &&
      authApiKey.addTo === "query" &&
      authApiKey.value.trim()
    ) {
      const sep = finalUrl.includes("?") ? "&" : "?";
      finalUrl += `${sep}${encodeURIComponent(authApiKey.key || "api_key")}=${encodeURIComponent(authApiKey.value)}`;
    }
    return finalUrl;
  };

  // ── Send Request ──
  const handleSend = async () => {
    if (!url.trim()) return;

    setActiveLoading(true);
    setActiveError(null);
    setActiveResponse(null);
    setSnippets(null);
    setAiDescription(null);
    setShowSnippets(false);

    const finalHeaders = buildFinalHeaders();
    const finalUrl = buildFinalUrl();
    const envVars = getActiveEnvVars();
    const mockMatch = findMock(method, finalUrl);

    try {
      const result = await sendRequest({
        method,
        url: finalUrl,
        headers: finalHeaders,
        body,
        envVars,
        mockMatch,
      });

      setActiveResponse(result);

      // Generate code snippets automatically
      const generatedSnippets = generateAllSnippets({
        method,
        url: result.resolvedUrl || finalUrl,
        headers: finalHeaders,
        body,
      });
      setSnippets(generatedSnippets);

      // Save to history
      addToHistory({
        method,
        url: result.resolvedUrl || finalUrl,
        status: result.status,
        elapsed: result.elapsed,
      });
    } catch (err) {
      setActiveError(
        err.response
          ? {
              status: err.response.status,
              statusText: err.response.statusText,
              data: err.response.data,
              elapsed: 0,
              size: 0,
            }
          : {
              status: 0,
              statusText: err.message,
              data: null,
              elapsed: 0,
              size: 0,
            }
      );
    } finally {
      setActiveLoading(false);
    }
  };

  // ── AI Describe Endpoint ──
  const handleAiDescribe = async () => {
    if (!response) return;
    setAiLoading(true);
    try {
      const description = await describeEndpoint({
        url: response.resolvedUrl || url,
        method,
        responseData: response.data,
        statusCode: response.status,
      });
      setAiDescription(description);
    } catch (err) {
      console.error("AI describe failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // ── AI URL Auto-Fill ──
  const handleAiAutoFill = async () => {
    if (!url.trim()) return;
    setAiAutoFillLoading(true);
    setAiAutoFill(null);
    try {
      const suggestion = await analyzeUrlBeforeSend(url);
      setAiAutoFill(suggestion);
    } catch (err) {
      console.error("AI auto-fill failed:", err);
    } finally {
      setAiAutoFillLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiAutoFill) return;
    if (aiAutoFill.method) updateActiveField("method", aiAutoFill.method);
    if (aiAutoFill.suggestedHeaders?.length) {
      const newHeaders = aiAutoFill.suggestedHeaders.map((h) => ({
        key: h.key,
        value: h.value,
        enabled: true,
      }));
      updateActiveField("headers", [...newHeaders, { key: "", value: "", enabled: true }]);
    }
    if (aiAutoFill.suggestedBody) updateActiveField("body", aiAutoFill.suggestedBody);
    setAiAutoFill(null);
  };

  const handleCopySnippet = () => {
    if (!snippets) return;
    navigator.clipboard.writeText(snippets[activeSnippet]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1500);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSend();
  };

  const displayResponse = error || response;

  return (
    <div className="rb-root">
      {/* ── URL Bar ── */}
      <div className="rb-url-bar">
        <select
          value={method}
          onChange={(e) => updateActiveField("method", e.target.value)}
          className="rb-method-select"
          style={{ color: METHOD_COLORS[method] || "#fff" }}
        >
          {METHODS.map((m) => (
            <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://api.example.com/endpoint or {{BASE_URL}}/users"
          className="rb-url-input"
          id="url-input"
        />

        <button
          onClick={handleAiAutoFill}
          disabled={aiAutoFillLoading || !url.trim()}
          className="rb-ai-btn"
          title="AI Auto-Fill: analyze URL and suggest method, headers, body"
        >
          <Sparkles size={14} />
          {aiAutoFillLoading ? "..." : "AI"}
        </button>

        <button
          onClick={handleSend}
          disabled={loading || !url.trim()}
          className="rb-send-btn"
          id="send-btn"
        >
          <Zap size={14} />
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* ── Environment Selector ── */}
      <div className="rb-env-bar">
        <span className="rb-env-label">ENV</span>
        <select
          value={activeEnvironment || ""}
          onChange={(e) => setActiveEnvironment(e.target.value)}
          className="rb-env-select"
        >
          {environments.map((env) => (
            <option key={env.id} value={env.id}>
              {env.name} ({Object.keys(env.variables).length} vars)
            </option>
          ))}
        </select>
        <span className="rb-env-hint">
          Use {"{{VAR}}"} in URL or headers
        </span>
      </div>

      {/* ── AI Auto-Fill Suggestion ── */}
      {aiAutoFill && (
        <div className="rb-ai-suggestion">
          <div className="rb-ai-suggestion-header">
            <Sparkles size={14} />
            <span>AI Suggestion</span>
            <button className="rb-ai-dismiss" onClick={() => setAiAutoFill(null)}>×</button>
          </div>
          <p className="rb-ai-desc">{aiAutoFill.description}</p>
          {aiAutoFill.method && (
            <div className="rb-ai-chip">
              Method: <strong style={{ color: METHOD_COLORS[aiAutoFill.method] }}>{aiAutoFill.method}</strong>
            </div>
          )}
          {aiAutoFill.suggestedHeaders?.length > 0 && (
            <div className="rb-ai-chip">
              Headers: {aiAutoFill.suggestedHeaders.map((h) => `${h.key}: ${h.value}`).join(", ")}
            </div>
          )}
          {aiAutoFill.tips?.length > 0 && (
            <div className="rb-ai-tips">
              {aiAutoFill.tips.map((t, i) => (
                <span key={i}>💡 {t}</span>
              ))}
            </div>
          )}
          <button className="rb-ai-apply" onClick={applyAiSuggestion}>
            Apply Suggestions
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="rb-tabs">
        {["params", "headers", "body", "auth"].map((tab) => (
          <button
            key={tab}
            onClick={() => updateActiveField("activeTab", tab)}
            className={`rb-tab ${activeTab === tab ? "active" : ""}`}
          >
            {tab === "params" ? "Params" : tab === "auth" ? "Auth" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "params" && queryParams.filter((p) => p.key.trim()).length > 0 && (
              <span className="rb-tab-badge">{queryParams.filter((p) => p.key.trim()).length}</span>
            )}
            {tab === "headers" && headers.filter((h) => h.enabled && h.key.trim()).length > 0 && (
              <span className="rb-tab-badge">{headers.filter((h) => h.enabled && h.key.trim()).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="rb-tab-content">
        {activeTab === "params" && (
          <QueryParamsEditor
            params={queryParams}
            onChange={handleParamsChange}
          />
        )}
        {activeTab === "headers" && (
          <HeaderTable
            headers={headers}
            onChange={(h) => updateActiveField("headers", h)}
          />
        )}
        {activeTab === "body" && (
          <BodyEditor
            body={body}
            onChange={(b) => updateActiveField("body", b)}
            method={method}
          />
        )}
        {activeTab === "auth" && (
          <AuthEditor
            authType={authType}
            authToken={authToken}
            authApiKey={authApiKey}
            onChangeType={(t) => updateActiveField("authType", t)}
            onChangeToken={(t) => updateActiveField("authToken", t)}
            onChangeApiKey={(k) => updateActiveField("authApiKey", k)}
          />
        )}
      </div>

      {/* ── Response Section ── */}
      <div className="rb-response-section">
        <div className="rb-response-label">Response</div>

        <ResponseViewer response={displayResponse} loading={loading} />

        {/* Code Snippets */}
        {snippets && (
          <div className="rb-snippets">
            <div className="rb-snippets-header">
              <div className="rb-snippets-tabs">
                {["curl", "fetch", "axios", "python"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setActiveSnippet(lang);
                      setShowSnippets(true);
                    }}
                    className={`rb-snippet-tab ${activeSnippet === lang && showSnippets ? "active" : ""}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <button onClick={handleCopySnippet} className="rb-copy-btn">
                {copiedSnippet ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {showSnippets && (
              <pre className="rb-snippet-code">{snippets[activeSnippet]}</pre>
            )}
          </div>
        )}

        {/* AI Assistant */}
        {response && !error && (
          <button
            onClick={handleAiDescribe}
            disabled={aiLoading}
            className="rb-ai-describe-btn"
          >
            <span>✦</span>
            {aiLoading ? "Analyzing with AI..." : "Explain this endpoint with AI"}
          </button>
        )}

        {/* AI Description */}
        {aiDescription && (
          <div className="rb-ai-result">
            <div className="rb-ai-result-title">✦ AI Analysis</div>
            <div className="rb-ai-result-summary">{aiDescription.summary}</div>
            <div className="rb-ai-result-purpose">{aiDescription.purpose}</div>
            {aiDescription.notable_fields?.length > 0 && (
              <>
                <div className="rb-ai-result-section-title">Notable Fields</div>
                {aiDescription.notable_fields.map((f, i) => (
                  <div key={i} className="rb-ai-result-field">• {f}</div>
                ))}
              </>
            )}
            {aiDescription.suggestions?.length > 0 && (
              <>
                <div className="rb-ai-result-section-title" style={{ marginTop: "10px" }}>
                  Try Next
                </div>
                {aiDescription.suggestions.map((s, i) => (
                  <div key={i} className="rb-ai-result-suggestion">→ {s}</div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*          QUERY PARAMS EDITOR           */
/* ═══════════════════════════════════════ */
function QueryParamsEditor({ params, onChange }) {
  const addRow = () => {
    onChange([...params, { key: "", value: "", enabled: true }]);
  };

  const removeRow = (index) => {
    const next = params.filter((_, i) => i !== index);
    onChange(next.length ? next : [{ key: "", value: "", enabled: true }]);
  };

  const updateRow = (index, field, value) => {
    const updated = params.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onChange(updated);
  };

  return (
    <div className="rb-kv-editor">
      {params.map((row, index) => (
        <div key={index} className="rb-kv-row">
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(index, "enabled", e.target.checked)}
            className="rb-kv-check"
          />
          <input
            type="text"
            placeholder="Parameter name"
            value={row.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
            className="rb-kv-input"
          />
          <input
            type="text"
            placeholder="Value"
            value={row.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
            className="rb-kv-input"
          />
          <button onClick={() => removeRow(index)} className="rb-kv-remove">
            ×
          </button>
        </div>
      ))}
      <button onClick={addRow} className="rb-kv-add">
        + Add Parameter
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*             AUTH EDITOR                */
/* ═══════════════════════════════════════ */
function AuthEditor({ authType, authToken, authApiKey, onChangeType, onChangeToken, onChangeApiKey }) {
  return (
    <div className="rb-auth-editor">
      <div className="rb-auth-type-row">
        <label className="rb-auth-label">Auth Type</label>
        <select
          value={authType}
          onChange={(e) => onChangeType(e.target.value)}
          className="rb-auth-select"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="apikey">API Key</option>
        </select>
      </div>

      {authType === "bearer" && (
        <div className="rb-auth-field">
          <label className="rb-auth-label">Token</label>
          <input
            type="text"
            value={authToken}
            onChange={(e) => onChangeToken(e.target.value)}
            placeholder="Enter your bearer token"
            className="rb-auth-input"
          />
          <span className="rb-auth-hint">
            Adds header: Authorization: Bearer &lt;token&gt;
          </span>
        </div>
      )}

      {authType === "apikey" && (
        <div className="rb-auth-field">
          <div className="rb-auth-apikey-row">
            <div>
              <label className="rb-auth-label">Key Name</label>
              <input
                type="text"
                value={authApiKey.key}
                onChange={(e) =>
                  onChangeApiKey({ ...authApiKey, key: e.target.value })
                }
                placeholder="X-API-Key"
                className="rb-auth-input"
              />
            </div>
            <div>
              <label className="rb-auth-label">Value</label>
              <input
                type="text"
                value={authApiKey.value}
                onChange={(e) =>
                  onChangeApiKey({ ...authApiKey, value: e.target.value })
                }
                placeholder="Your API key"
                className="rb-auth-input"
              />
            </div>
          </div>
          <div className="rb-auth-addto">
            <label className="rb-auth-label">Add to</label>
            <div className="rb-auth-addto-options">
              <label className="rb-auth-radio">
                <input
                  type="radio"
                  name="apikey-addto"
                  value="header"
                  checked={authApiKey.addTo === "header"}
                  onChange={() =>
                    onChangeApiKey({ ...authApiKey, addTo: "header" })
                  }
                />
                Header
              </label>
              <label className="rb-auth-radio">
                <input
                  type="radio"
                  name="apikey-addto"
                  value="query"
                  checked={authApiKey.addTo === "query"}
                  onChange={() =>
                    onChangeApiKey({ ...authApiKey, addTo: "query" })
                  }
                />
                Query Param
              </label>
            </div>
          </div>
        </div>
      )}

      {authType === "none" && (
        <div className="rb-auth-none">
          No authentication configured for this request.
        </div>
      )}
    </div>
  );
}

export default RequestBuilder;