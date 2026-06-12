import React from "react";
import JsonViewer from "../JsonViewer";

function ResponseViewer({ response, loading }) {
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Sending request...
      </div>
    );
  }

  if (!response) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          color: "#6b7280",
          fontSize: "14px",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "36px" }}>⚡</span>
        <span>Send a request to see the response here</span>
      </div>
    );
  }

  const statusColor =
    response.status >= 200 && response.status < 300
      ? "#22c55e"
      : response.status >= 400
      ? "#ef4444"
      : "#f59e0b";

  const statusBg =
    response.status >= 200 && response.status < 300
      ? "rgba(34,197,94,0.1)"
      : response.status >= 400
      ? "rgba(239,68,68,0.1)"
      : "rgba(245,158,11,0.1)";

  const sizeKb = (response.size / 1024).toFixed(2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Status Ribbon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            background: statusBg,
            color: statusColor,
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {response.status} {response.statusText}
        </span>

        <span
          style={{
            background: "#1f2937",
            color: "#94a3b8",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
          }}
        >
          ⏱ {response.elapsed}ms
        </span>

        <span
          style={{
            background: "#1f2937",
            color: "#94a3b8",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
          }}
        >
          📦 {sizeKb}KB
        </span>
      </div>

      {/* Response Body */}
      <JsonViewer data={response.data} />
    </div>
  );
}

export default ResponseViewer;