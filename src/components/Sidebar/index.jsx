import React, { useState } from "react";
import {
  FolderOpen,
  Clock,
  Globe,
  Plus,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Edit2,
  Search,
  Server,
  FileText,
} from "lucide-react";
import useAppStore from "../../store/useAppStore";
import MockManager from "../MockManager";
import DocsGenerator from "../DocsGenerator";
import "./Sidebar.css";

/* ─── Method badge color mapping ─── */
const METHOD_COLORS = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  PATCH: "#8b5cf6",
  DELETE: "#ef4444",
  HEAD: "#6b7280",
  OPTIONS: "#6b7280",
};

function Sidebar({ onLoadRequest }) {
  const {
    sidebarTab,
    setSidebarTab,
    collections,
    addCollection,
    deleteCollection,
    renameCollection,
    removeFromCollection,
    history,
    clearHistory,
    removeFromHistory,
    environments,
    activeEnvironment,
    setActiveEnvironment,
    addEnvironment,
    deleteEnvironment,
    updateEnvironment,
    renameEnvironment,
    favorites,
    toggleFavorite,
  } = useAppStore();

  const [docsCollection, setDocsCollection] = useState(null);

  const tabs = [
    { key: "collections", label: "Collections", icon: FolderOpen },
    { key: "history", label: "History", icon: Clock },
    { key: "favorites", label: "Favorites", icon: Star },
    { key: "environments", label: "Env", icon: Globe },
    { key: "mocks", label: "Mocks", icon: Server },
  ];

  return (
    <aside className="sidebar" id="app-sidebar">
      {/* Tab Switcher */}
      <div className="sidebar-tabs">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`sidebar-tab ${sidebarTab === key ? "active" : ""}`}
            onClick={() => setSidebarTab(key)}
            id={`sidebar-tab-${key}`}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="sidebar-content">
        {sidebarTab === "collections" && (
          <CollectionsPanel
            collections={collections}
            addCollection={addCollection}
            deleteCollection={deleteCollection}
            renameCollection={renameCollection}
            removeFromCollection={removeFromCollection}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onLoadRequest={onLoadRequest}
            onOpenDocs={setDocsCollection}
          />
        )}
        {sidebarTab === "history" && (
          <HistoryPanel
            history={history}
            clearHistory={clearHistory}
            removeFromHistory={removeFromHistory}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onLoadRequest={onLoadRequest}
          />
        )}
        {sidebarTab === "favorites" && (
          <FavoritesPanel
            history={history}
            collections={collections}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onLoadRequest={onLoadRequest}
          />
        )}
        {sidebarTab === "environments" && (
          <EnvironmentsPanel
            environments={environments}
            activeEnvironment={activeEnvironment}
            setActiveEnvironment={setActiveEnvironment}
            addEnvironment={addEnvironment}
            deleteEnvironment={deleteEnvironment}
            updateEnvironment={updateEnvironment}
            renameEnvironment={renameEnvironment}
          />
        )}
        {sidebarTab === "mocks" && <MockManager />}
      </div>

      {/* Docs Generator Overlay */}
      {docsCollection && (
        <DocsGenerator
          collection={docsCollection}
          onClose={() => setDocsCollection(null)}
        />
      )}
    </aside>
  );
}

/* ═══════════════════════════════════════ */
/*           COLLECTIONS PANEL            */
/* ═══════════════════════════════════════ */
function CollectionsPanel({
  collections,
  addCollection,
  deleteCollection,
  renameCollection,
  removeFromCollection,
  favorites,
  toggleFavorite,
  onLoadRequest,
  onOpenDocs,
}) {
  const [newName, setNewName] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const handleAdd = () => {
    if (newName.trim()) {
      addCollection(newName.trim());
      setNewName("");
      setShowInput(false);
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <span className="panel-title">Collections</span>
        <button
          className="panel-action-btn"
          onClick={() => setShowInput(!showInput)}
          title="New Collection"
          id="new-collection-btn"
        >
          <Plus size={14} />
        </button>
      </div>

      {showInput && (
        <div className="inline-input-row">
          <input
            type="text"
            className="inline-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="inline-confirm" onClick={handleAdd}>
            <Check size={14} />
          </button>
          <button
            className="inline-cancel"
            onClick={() => {
              setShowInput(false);
              setNewName("");
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {collections.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={28} className="empty-icon" />
          <p>No collections yet</p>
          <span>Click + to create one</span>
        </div>
      ) : (
        <div className="panel-list">
          {collections.map((col) => (
            <CollectionItem
              key={col.id}
              collection={col}
              expanded={expandedId === col.id}
              onToggle={() =>
                setExpandedId(expandedId === col.id ? null : col.id)
              }
              onDelete={() => deleteCollection(col.id)}
              onRename={(name) => renameCollection(col.id, name)}
              onRemoveRequest={(reqId) => removeFromCollection(col.id, reqId)}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onLoadRequest={onLoadRequest}
              onOpenDocs={onOpenDocs}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionItem({
  collection,
  expanded,
  onToggle,
  onDelete,
  onRename,
  onRemoveRequest,
  favorites,
  toggleFavorite,
  onLoadRequest,
  onOpenDocs,
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);

  const handleRename = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setEditing(false);
  };

  return (
    <div className="collection-item">
      <div className="collection-header" onClick={onToggle}>
        <span className="collection-chevron">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {editing ? (
          <input
            className="inline-input small"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            onBlur={handleRename}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="collection-name">{collection.name}</span>
        )}
        <span className="collection-count">{collection.requests.length}</span>
        <div className="collection-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="icon-btn-tiny"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDocs(collection);
            }}
            title="Generate Docs"
          >
            <FileText size={12} />
          </button>
          <button
            className="icon-btn-tiny"
            onClick={() => {
              setEditing(true);
              setEditName(collection.name);
            }}
            title="Rename"
          >
            <Edit2 size={12} />
          </button>
          <button className="icon-btn-tiny danger" onClick={onDelete} title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="collection-requests">
          {collection.requests.length === 0 ? (
            <div className="empty-requests">No saved requests</div>
          ) : (
            collection.requests.map((req) => (
              <div
                key={req.id}
                className="request-item"
                onClick={() => onLoadRequest && onLoadRequest(req)}
              >
                <span
                  className="method-badge"
                  style={{ color: METHOD_COLORS[req.method] || "#6b7280" }}
                >
                  {req.method}
                </span>
                <span className="request-url">{req.url}</span>
                <div className="request-actions">
                  <button
                    className="icon-btn-tiny"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(req.id);
                    }}
                  >
                    {favorites.includes(req.id) ? (
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    ) : (
                      <StarOff size={12} />
                    )}
                  </button>
                  <button
                    className="icon-btn-tiny danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRequest(req.id);
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*             HISTORY PANEL              */
/* ═══════════════════════════════════════ */
function HistoryPanel({
  history,
  clearHistory,
  removeFromHistory,
  favorites,
  toggleFavorite,
  onLoadRequest,
}) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? history.filter(
        (h) =>
          h.url.toLowerCase().includes(search.toLowerCase()) ||
          h.method.toLowerCase().includes(search.toLowerCase())
      )
    : history;

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <span className="panel-title">History</span>
        {history.length > 0 && (
          <button
            className="panel-action-btn danger"
            onClick={clearHistory}
            title="Clear history"
            id="clear-history-btn"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {history.length > 3 && (
        <div className="sidebar-search">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Filter history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Clock size={28} className="empty-icon" />
          <p>No history yet</p>
          <span>Send a request to see it here</span>
        </div>
      ) : (
        <div className="panel-list">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="request-item"
              onClick={() =>
                onLoadRequest &&
                onLoadRequest({
                  method: entry.method,
                  url: entry.url,
                })
              }
            >
              <span
                className="method-badge"
                style={{ color: METHOD_COLORS[entry.method] || "#6b7280" }}
              >
                {entry.method}
              </span>
              <div className="request-info">
                <span className="request-url">{entry.url}</span>
                <span className="request-meta">
                  {entry.status > 0 && (
                    <span
                      className="status-dot"
                      style={{
                        background:
                          entry.status >= 200 && entry.status < 300
                            ? "#22c55e"
                            : entry.status >= 400
                            ? "#ef4444"
                            : "#f59e0b",
                      }}
                    />
                  )}
                  {entry.status > 0 && `${entry.status} · `}
                  {entry.elapsed > 0 && `${entry.elapsed}ms · `}
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="request-actions">
                <button
                  className="icon-btn-tiny"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(entry.id);
                  }}
                >
                  {favorites.includes(entry.id) ? (
                     <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  ) : (
                    <StarOff size={12} />
                  )}
                </button>
                <button
                  className="icon-btn-tiny danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(entry.id);
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*            FAVORITES PANEL             */
/* ═══════════════════════════════════════ */
function FavoritesPanel({
  history,
  collections,
  favorites,
  toggleFavorite,
  onLoadRequest,
}) {
  const favRequests = [];
  
  collections.forEach(col => {
    col.requests.forEach(req => {
      if (favorites.includes(req.id)) {
        favRequests.push({ ...req, _source: `Collection: ${col.name}` });
      }
    });
  });

  history.forEach(req => {
    if (favorites.includes(req.id)) {
      favRequests.push({ ...req, _source: "History" });
    }
  });

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <span className="panel-title">Favorites</span>
      </div>

      {favRequests.length === 0 ? (
        <div className="empty-state">
          <Star size={28} className="empty-icon" />
          <p>No favorites</p>
          <span>Star a request to see it here</span>
        </div>
      ) : (
        <div className="panel-list">
          {favRequests.map((entry) => (
            <div
              key={entry.id}
              className="request-item"
              onClick={() =>
                onLoadRequest &&
                onLoadRequest({
                  method: entry.method,
                  url: entry.url,
                  headers: entry.headers,
                  body: entry.body,
                })
              }
            >
              <span
                className="method-badge"
                style={{ color: METHOD_COLORS[entry.method] || "#6b7280" }}
              >
                {entry.method}
              </span>
              <div className="request-info">
                <span className="request-url">{entry.url}</span>
                <span className="request-meta">{entry._source}</span>
              </div>
              <div className="request-actions">
                <button
                  className="icon-btn-tiny"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(entry.id);
                  }}
                >
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════ */
/*          ENVIRONMENTS PANEL            */
/* ═══════════════════════════════════════ */
function EnvironmentsPanel({
  environments,
  activeEnvironment,
  setActiveEnvironment,
  addEnvironment,
  deleteEnvironment,
  updateEnvironment,
  renameEnvironment,
}) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const handleAdd = () => {
    if (newName.trim()) {
      addEnvironment(newName.trim(), {});
      setNewName("");
      setShowNew(false);
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <span className="panel-title">Environments</span>
        <button
          className="panel-action-btn"
          onClick={() => setShowNew(!showNew)}
          title="New Environment"
          id="new-env-btn"
        >
          <Plus size={14} />
        </button>
      </div>

      {showNew && (
        <div className="inline-input-row">
          <input
            type="text"
            className="inline-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Environment name..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="inline-confirm" onClick={handleAdd}>
            <Check size={14} />
          </button>
          <button
            className="inline-cancel"
            onClick={() => {
              setShowNew(false);
              setNewName("");
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {environments.length === 0 ? (
        <div className="empty-state">
          <Globe size={28} className="empty-icon" />
          <p>No environments</p>
          <span>Click + to create one</span>
        </div>
      ) : (
        <div className="panel-list">
          {environments.map((env) => (
            <EnvironmentItem
              key={env.id}
              env={env}
              isActive={activeEnvironment === env.id}
              expanded={expandedId === env.id}
              onToggle={() =>
                setExpandedId(expandedId === env.id ? null : env.id)
              }
              onActivate={() => setActiveEnvironment(env.id)}
              onDelete={() => deleteEnvironment(env.id)}
              onUpdate={(vars) => updateEnvironment(env.id, vars)}
              onRename={(name) => renameEnvironment(env.id, name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EnvironmentItem({
  env,
  isActive,
  expanded,
  onToggle,
  onActivate,
  onDelete,
  onUpdate,
  onRename,
}) {
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const addVariable = () => {
    if (newKey.trim()) {
      onUpdate({ ...env.variables, [newKey.trim()]: newVal });
      setNewKey("");
      setNewVal("");
    }
  };

  const removeVariable = (key) => {
    const updated = { ...env.variables };
    delete updated[key];
    onUpdate(updated);
  };

  return (
    <div className={`env-item ${isActive ? "active" : ""}`}>
      <div className="env-header">
        <button className="env-radio" onClick={onActivate}>
          <div className={`radio-dot ${isActive ? "active" : ""}`} />
        </button>
        <span className="env-name" onClick={onToggle}>
          {env.name}
        </span>
        <span className="env-var-count">
          {Object.keys(env.variables).length} vars
        </span>
        <div className="env-actions">
          <button
            className="icon-btn-tiny"
            onClick={onToggle}
            title="Expand variables"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <button
            className="icon-btn-tiny danger"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="env-variables">
          {Object.entries(env.variables).map(([key, value]) => (
            <div key={key} className="env-var-row">
              <code className="env-var-key">{`{{${key}}}`}</code>
              <span className="env-var-eq">=</span>
              <span className="env-var-val">{value}</span>
              <button
                className="icon-btn-tiny danger"
                onClick={() => removeVariable(key)}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <div className="env-var-add">
            <input
              type="text"
              className="env-add-input"
              placeholder="KEY"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addVariable()}
            />
            <input
              type="text"
              className="env-add-input"
              placeholder="Value"
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addVariable()}
            />
            <button className="inline-confirm small" onClick={addVariable}>
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
