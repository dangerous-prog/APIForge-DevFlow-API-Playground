import React from "react";
import Editor from "@monaco-editor/react";

function BodyEditor({ body, onChange, method }) {
  const showEditor = ["POST", "PUT", "PATCH"].includes(method.toUpperCase());

  if (!showEditor) {
    return (
      <div
        style={{
          padding: "16px",
          color: "#6b7280",
          fontSize: "13px",
          textAlign: "center",
          background: "#111827",
          borderRadius: "8px",
          border: "1px solid #1f2937",
        }}
      >
        Body is not available for {method} requests
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #374151",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Editor
        height="200px"
        language="json"
        theme="vs-dark"
        value={body}
        onChange={(value) => onChange(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default BodyEditor;