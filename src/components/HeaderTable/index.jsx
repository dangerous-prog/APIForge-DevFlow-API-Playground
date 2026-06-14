import React from "react";

function HeaderTable({ headers, onChange }) {
  const addRow = () => {
    onChange([...headers, { key: "", value: "", enabled: true }]);
  };

  const removeRow = (index) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    const updated = headers.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {headers.length === 0 && (
        <div style={{ color: "#6b7280", fontSize: "13px", fontStyle: "italic", padding: "4px 0" }}>
          No headers configured.
        </div>
      )}
      {headers.map((row, index) => (
        <div
          key={index}
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
        >
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(index, "enabled", e.target.checked)}
          />
          <input
            type="text"
            placeholder="Header name"
            value={row.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
            style={{
              flex: 1,
              background: "#1f2937",
              border: "1px solid #374151",
              color: "#f9fafb",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <input
            type="text"
            placeholder="Value"
            value={row.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
            style={{
              flex: 1,
              background: "#1f2937",
              border: "1px solid #374151",
              color: "#f9fafb",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <button
            onClick={() => removeRow(index)}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              fontSize: "18px",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}

      <button
        onClick={addRow}
        style={{
          alignSelf: "flex-start",
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          color: "#22c55e",
          padding: "6px 14px",
          borderRadius: "6px",
          fontSize: "12px",
          cursor: "pointer",
          marginTop: "4px",
        }}
      >
        + Add Header
      </button>
    </div>
  );
}

export default HeaderTable;