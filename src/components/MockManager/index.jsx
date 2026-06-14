import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Server, Edit2, Check, X } from "lucide-react";
import Editor from "@monaco-editor/react";
import useAppStore from "../../store/useAppStore";
import "./MockManager.css";

const METHOD_COLORS = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  PATCH: "#8b5cf6",
  DELETE: "#ef4444",
  HEAD: "#6b7280",
  OPTIONS: "#6b7280",
};

function MockManager() {
  const { mocks, addMock, updateMock, deleteMock } = useAppStore();
  const [showNew, setShowNew] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // New mock form
  const [newMock, setNewMock] = useState({
    method: "GET",
    path: "/",
    responseBody: '{\n  "message": "Hello from mock!"\n}',
    statusCode: 200,
    latency: 200,
    description: "",
  });

  const handleAdd = () => {
    if (newMock.path.trim()) {
      addMock(newMock);
      setNewMock({
        method: "GET",
        path: "/",
        responseBody: '{\n  "message": "Hello from mock!"\n}',
        statusCode: 200,
        latency: 200,
        description: "",
      });
      setShowNew(false);
    }
  };

  return (
    <div className="mock-manager">
      <div className="mock-header">
        <div className="mock-header-left">
          <Server size={16} className="mock-header-icon" />
          <span className="mock-header-title">Mock API Endpoints</span>
        </div>
        <button
          className="mock-add-btn"
          onClick={() => setShowNew(!showNew)}
          title="Add Mock Endpoint"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="mock-hint">
        Use <code>mock://path</code> as URL to trigger mocks
      </div>

      {/* New Mock Form */}
      {showNew && (
        <div className="mock-new-form">
          <div className="mock-form-row">
            <select
              value={newMock.method}
              onChange={(e) => setNewMock({ ...newMock, method: e.target.value })}
              className="mock-form-method"
              style={{ color: METHOD_COLORS[newMock.method] }}
            >
              {Object.keys(METHOD_COLORS).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={newMock.path}
              onChange={(e) => setNewMock({ ...newMock, path: e.target.value })}
              placeholder="/users"
              className="mock-form-path"
            />
          </div>

          <div className="mock-form-row">
            <input
              type="text"
              value={newMock.description}
              onChange={(e) => setNewMock({ ...newMock, description: e.target.value })}
              placeholder="Description (optional)"
              className="mock-form-desc"
            />
          </div>

          <div className="mock-form-row small">
            <div className="mock-form-field">
              <label>Status Code</label>
              <input
                type="number"
                value={newMock.statusCode}
                onChange={(e) => setNewMock({ ...newMock, statusCode: parseInt(e.target.value) || 200 })}
                className="mock-form-input"
              />
            </div>
            <div className="mock-form-field">
              <label>Latency (ms)</label>
              <input
                type="number"
                value={newMock.latency}
                onChange={(e) => setNewMock({ ...newMock, latency: parseInt(e.target.value) || 0 })}
                className="mock-form-input"
              />
            </div>
          </div>

          <div className="mock-form-editor">
            <label>Response Body (JSON)</label>
            <div className="mock-editor-wrapper">
              <Editor
                height="120px"
                language="json"
                theme="vs-dark"
                value={newMock.responseBody}
                onChange={(v) => setNewMock({ ...newMock, responseBody: v || "" })}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 2,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <div className="mock-form-actions">
            <button className="mock-cancel" onClick={() => setShowNew(false)}>
              Cancel
            </button>
            <button className="mock-save" onClick={handleAdd}>
              <Check size={14} /> Save Mock
            </button>
          </div>
        </div>
      )}

      {/* Mock List */}
      {mocks.length === 0 && !showNew ? (
        <div className="mock-empty">
          <Server size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p>No mock endpoints yet</p>
          <span>Click + to create one</span>
        </div>
      ) : (
        <div className="mock-list">
          {mocks.map((mock) => (
            <MockItem
              key={mock.id}
              mock={mock}
              expanded={expandedId === mock.id}
              onToggle={() => setExpandedId(expandedId === mock.id ? null : mock.id)}
              onUpdate={(updates) => updateMock(mock.id, updates)}
              onDelete={() => deleteMock(mock.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MockItem({ mock, expanded, onToggle, onUpdate, onDelete }) {
  return (
    <div className="mock-item">
      <div className="mock-item-header" onClick={onToggle}>
        <span className="mock-item-chevron">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span
          className="mock-item-method"
          style={{ color: METHOD_COLORS[mock.method] || "#6b7280" }}
        >
          {mock.method}
        </span>
        <span className="mock-item-path">mock:/{mock.path}</span>
        <span className="mock-item-status">{mock.statusCode}</span>
        <div className="mock-item-actions" onClick={(e) => e.stopPropagation()}>
          <button className="icon-btn-tiny danger" onClick={onDelete} title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mock-item-details">
          {mock.description && (
            <div className="mock-item-desc">{mock.description}</div>
          )}
          <div className="mock-detail-row">
            <span className="mock-detail-label">Status:</span>
            <span>{mock.statusCode}</span>
            <span className="mock-detail-sep">·</span>
            <span className="mock-detail-label">Latency:</span>
            <span>{mock.latency}ms</span>
          </div>
          <div className="mock-item-body">
            <div className="mock-body-label">Response Body</div>
            <pre className="mock-body-code">{mock.responseBody}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default MockManager;
