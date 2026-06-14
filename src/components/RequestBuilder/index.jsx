import React, { useState } from "react";
import HeaderTable from "../HeaderTable";
import BodyEditor from "../BodyEditor";
import ResponseViewer from "../ResponseViewer";
import { sendRequest, saveToHistory } from "../../services/apiClient";
import { generateAllSnippets } from "../../utils/codeGenerator";
import { describeEndpoint } from "../../services/aiAssistant";

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
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("headers");
  const [error, setError] = useState(null);

  // Phase 2 state
  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);
  const [showEnvPanel, setShowEnvPanel] = useState(false);
  const [snippets, setSnippets] = useState(null);
  const [activeSnippet, setActiveSnippet] = useState("curl");
  const [showSnippets, setShowSnippets] = useState(false);
  const [aiDescription, setAiDescription] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Build envVars object from array
  const getEnvVarsObject = () => {
    const obj = {};
    envVars.filter((e) => e.key.trim()).forEach((e) => {
      obj[e.key] = e.value;
    });
    return obj;
  };

  const handleSend = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setSnippets(null);
    setAiDescription(null);
    setShowSnippets(false);

    const enabledHeaders = {};
    headers
      .filter((h) => h.enabled && h.key.trim())
      .forEach((h) => {
        enabledHeaders[h.key] = h.value;
      });

    try {
      const result = await sendRequest({
        method,
        url,
        headers: enabledHeaders,
        body,
        envVars: getEnvVarsObject(),
      });

      setResponse(result);

      // Generate code snippets automatically
      const generatedSnippets = generateAllSnippets({
        method,
        url: result.resolvedUrl || url,
        headers: enabledHeaders,
        body,
      });
      setSnippets(generatedSnippets);

      // Save to localStorage history
      saveToHistory({
        id: Date.now(),
        method,
        url: result.resolvedUrl || url,
        status: result.status,
        elapsed: result.elapsed,
        timestamp: new Date().toISOString(),
      });

      // Notify teammate's Zustand store if available
      if (window.__addToHistory) {
        window.__addToHistory({
          method,
          url: result.resolvedUrl || url,
          status: result.status,
          elapsed: result.elapsed,
        });
      }
    } catch (err) {
      setError(
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
      setLoading(false);
    }
  };

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

  const handleCopySnippet = () => {
    if (!snippets) return;
    navigator.clipboard.writeText(snippets[activeSnippet]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 1500);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSend();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "20px",
        background: "#0f172a",
        minHeight: "100%",
      }}
    >
      {/* URL Bar */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          style={{
            background: "#1f2937",
            border: "1px solid #374151",
            color: METHOD_COLORS[method] || "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            outline: "none",
          }}
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
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://api.example.com/endpoint or {{BASE_URL}}/users"
          style={{
            flex: 1,
            background: "#1f2937",
            border: "1px solid #374151",
            color: "#f9fafb",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            outline: "none",
            fontFamily: "monospace",
          }}
        />

        <button
          onClick={() => setShowEnvPanel(!showEnvPanel)}
          style={{
            background: showEnvPanel
              ? "rgba(99,102,241,0.2)"
              : "rgba(255,255,255,0.05)",
            border: "1px solid #374151",
            color: "#94a3b8",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "12px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {"{ } ENV"}
        </button>

        <button
          onClick={handleSend}
          disabled={loading || !url.trim()}
          style={{
            background:
              loading || !url.trim() ? "rgba(34,197,94,0.3)" : "#22c55e",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "13px",
            cursor: loading || !url.trim() ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {/* ENV Variables Panel */}
      {showEnvPanel && (
        <div
          style={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#6366f1",
              fontWeight: "600",
              marginBottom: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Environment Variables — use as {"{{KEY}}"} in URL or headers
          </div>
          {envVars.map((v, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="KEY"
                value={v.key}
                onChange={(e) =>
                  setEnvVars((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, key: e.target.value } : x
                    )
                  )
                }
                style={{
                  flex: 1,
                  background: "#1f2937",
                  border: "1px solid #374151",
                  color: "#f9fafb",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
              <input
                type="text"
                placeholder="value"
                value={v.value}
                onChange={(e) =>
                  setEnvVars((prev) =>
                    prev.map((x, idx) =>
                      idx === i ? { ...x, value: e.target.value } : x
                    )
                  )
                }
                style={{
                  flex: 2,
                  background: "#1f2937",
                  border: "1px solid #374151",
                  color: "#f9fafb",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
              <button
                onClick={() =>
                  setEnvVars((prev) => prev.filter((_, idx) => idx !== i))
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => setEnvVars((prev) => [...prev, { key: "", value: "" }])}
            style={{
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "#818cf8",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            + Add Variable
          </button>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #1f2937",
          gap: "4px",
        }}
      >
        {["headers", "body"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab
                  ? "2px solid #22c55e"
                  : "2px solid transparent",
              color: activeTab === tab ? "#f9fafb" : "#6b7280",
              fontSize: "13px",
              cursor: "pointer",
              textTransform: "capitalize",
              marginBottom: "-1px",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "headers" && (
          <HeaderTable headers={headers} onChange={setHeaders} />
        )}
        {activeTab === "body" && (
          <BodyEditor body={body} onChange={setBody} method={method} />
        )}
      </div>

      {/* Response Section */}
      <div style={{ borderTop: "1px solid #1f2937", paddingTop: "16px" }}>
        <div
          style={{
            fontSize: "11px",
            color: "#4b5563",
            marginBottom: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Response
        </div>

        <ResponseViewer response={error || response} loading={loading} />

        {/* Code Snippets */}
        {snippets && (
          <div
            style={{
              marginTop: "16px",
              background: "#111827",
              border: "1px solid #374151",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                {["curl", "fetch", "axios", "python"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setActiveSnippet(lang);
                      setShowSnippets(true);
                    }}
                    style={{
                      padding: "4px 12px",
                      background:
                        activeSnippet === lang && showSnippets
                          ? "rgba(34,197,94,0.15)"
                          : "transparent",
                      border:
                        activeSnippet === lang && showSnippets
                          ? "1px solid rgba(34,197,94,0.3)"
                          : "1px solid transparent",
                      color:
                        activeSnippet === lang && showSnippets
                          ? "#22c55e"
                          : "#6b7280",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopySnippet}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid #374151",
                  color: "#94a3b8",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  cursor: "pointer",
                }}
              >
                {copiedSnippet ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {showSnippets && (
              <pre
                style={{
                  margin: 0,
                  padding: "16px",
                  color: "#86efac",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {snippets[activeSnippet]}
              </pre>
            )}
          </div>
        )}

        {/* AI Assistant */}
        {response && !error && (
          <button
            onClick={handleAiDescribe}
            disabled={aiLoading}
            style={{
              marginTop: "12px",
              width: "100%",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#a78bfa",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              cursor: aiLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>✦</span>
            {aiLoading ? "Analyzing with AI..." : "Explain this endpoint with AI"}
          </button>
        )}

        {/* AI Description */}
        {aiDescription && (
          <div
            style={{
              marginTop: "12px",
              background: "#111827",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: "10px",
              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#a78bfa",
                marginBottom: "10px",
              }}
            >
              ✦ AI Analysis
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#e2e8f0",
                marginBottom: "8px",
                lineHeight: "1.6",
              }}
            >
              {aiDescription.summary}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                marginBottom: "12px",
                lineHeight: "1.7",
              }}
            >
              {aiDescription.purpose}
            </div>
            {aiDescription.notable_fields?.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginBottom: "6px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  Notable Fields
                </div>
                {aiDescription.notable_fields.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      marginBottom: "4px",
                    }}
                  >
                    • {f}
                  </div>
                ))}
              </>
            )}
            {aiDescription.suggestions?.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginBottom: "6px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    marginTop: "10px",
                  }}
                >
                  Try Next
                </div>
                {aiDescription.suggestions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "12px",
                      color: "#6366f1",
                      marginBottom: "4px",
                    }}
                  >
                    → {s}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestBuilder;