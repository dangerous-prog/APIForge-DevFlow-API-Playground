import React, { useState } from "react";

function JsonViewer({ data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (data === null || data === undefined) {
    return (
      <div
        style={{
          padding: "16px",
          color: "#6b7280",
          fontSize: "13px",
          textAlign: "center",
        }}
      >
        No response yet
      </div>
    );
  }

  const isJson = typeof data === "object";

  const colorizeJson = (json) => {
    return json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+\.?\d*([eE][+-]?\d+)?)/g,
        (match) => {
          let color = "#fbbf24"; // number
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              color = "#60a5fa"; // key
            } else {
              color = "#86efac"; // string
            }
          } else if (/true|false/.test(match)) {
            color = "#f97316"; // boolean
          } else if (/null/.test(match)) {
            color = "#94a3b8"; // null
          }
          return `<span style="color:${color}">${match}</span>`;
        }
      );
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#94a3b8",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>

      {isJson ? (
        <pre
          style={{
            background: "#111827",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontFamily: "monospace",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            margin: 0,
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{
            __html: colorizeJson(JSON.stringify(data, null, 2)),
          }}
        />
      ) : (
        <pre
          style={{
            background: "#111827",
            color: "#86efac",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontFamily: "monospace",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            margin: 0,
          }}
        >
          {String(data)}
        </pre>
      )}
    </div>
  );
}

export default JsonViewer;