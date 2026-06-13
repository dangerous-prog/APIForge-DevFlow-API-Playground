import React, { useState } from "react";
import HeaderTable from "../HeaderTable";
import BodyEditor from "../BodyEditor";
import ResponseViewer from "../ResponseViewer";
import { sendRequest } from "../../services/apiClient";

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

  const handleSend = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    // Build enabled headers only
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
      });
      setResponse(result);

      // Tell teammate's Zustand store about the new request
      if (window.__addToHistory) {
        window.__addToHistory({
          method,
          url,
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
          : { status: 0, statusText: err.message, data: null, elapsed: 0, size: 0 }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSend();
    }
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
        {/* Method Selector */}
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
            <option
              key={m}
              value={m}
              style={{ color: METHOD_COLORS[m] }}
            >
              {m}
            </option>
          ))}
        </select>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://api.example.com/endpoint"
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

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={loading || !url.trim()}
          style={{
            background:
              loading || !url.trim()
                ? "rgba(34,197,94,0.3)"
                : "#22c55e",
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

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid #1f2937",
          paddingTop: "16px",
        }}
      >
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
        <ResponseViewer
          response={error || response}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default RequestBuilder;