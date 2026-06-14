import React, { useState } from "react";
import JsonViewer from "../JsonViewer";

function ResponseViewer({ response, loading }) {
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter JSON based on search term
  const filterData = (data, term) => {
    if (!term.trim()) return data;
    if (typeof data !== "object" || data === null) return data;

    const lower = term.toLowerCase();

    if (Array.isArray(data)) {
      return data.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(lower)
      );
    }

    const filtered = {};
    Object.entries(data).forEach(([key, value]) => {
      if (
        key.toLowerCase().includes(lower) ||
        String(value).toLowerCase().includes(lower)
      ) {
        filtered[key] = value;
      }
    });
    return Object.keys(filtered).length > 0 ? filtered : null;
  };

  const filteredData = filterData(response.data, searchTerm);

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

        {/* Search Bar */}
        <div style={{ marginLeft: "auto" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search response..."
            style={{
              background: "#1f2937",
              border: "1px solid #374151",
              color: "#f9fafb",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              outline: "none",
              width: "180px",
            }}
          />
        </div>
      </div>

      {/* Response Body */}
      {filteredData !== null ? (
        <JsonViewer data={filteredData} />
      ) : (
        <div
          style={{
            padding: "16px",
            color: "#6b7280",
            fontSize: "13px",
            textAlign: "center",
            background: "#111827",
            borderRadius: "8px",
          }}
        >
          No results found for "{searchTerm}"
        </div>
      )}
    </div>
  );
}

export default ResponseViewer;