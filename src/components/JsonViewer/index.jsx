import React, { useState } from "react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

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
        <div
          style={{
            background: "#111827",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontFamily: "monospace",
          }}
        >
          <JsonView
            src={data}
            theme="a11y"
            dark={true}
            collapsed={2}
            enableClipboard={false}
            displaySize={true}
            style={{
              background: "transparent",
              fontSize: "13px",
            }}
          />
        </div>
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
          }}
        >
          {String(data)}
        </pre>
      )}
    </div>
  );
}

export default JsonViewer;