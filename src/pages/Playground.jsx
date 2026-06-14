import React, { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RequestBuilder from "../components/RequestBuilder";
import useAppStore from "../store/useAppStore";
import "./Playground.css";

function Playground() {
  const { collections, saveToCollection, addCollection } = useAppStore();

  // Track the "loaded" request from sidebar clicks
  // Person B's RequestBuilder is self-contained (has its own state),
  // but we can reload it by changing its key to force a remount.
  const [loadedRequest, setLoadedRequest] = useState(null);
  const [builderKey, setBuilderKey] = useState(0);

  const handleLoadRequest = useCallback((req) => {
    setLoadedRequest(req);
    setBuilderKey((k) => k + 1);
  }, []);

  // Quick-save popup state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTarget, setSaveTarget] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleQuickSave = () => {
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    if (saveTarget === "__new__" && newCollectionName.trim()) {
      const id = addCollection(newCollectionName.trim());
      if (loadedRequest) saveToCollection(id, loadedRequest);
    } else if (saveTarget) {
      if (loadedRequest) saveToCollection(saveTarget, loadedRequest);
    }
    setShowSaveModal(false);
    setSaveTarget("");
    setNewCollectionName("");
  };

  return (
    <div className="playground" id="playground-page">
      <Navbar />
      <div className="playground-body">
        <Sidebar onLoadRequest={handleLoadRequest} />
        <main className="playground-main" id="workspace-main">
          <RequestBuilder key={builderKey} />
        </main>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="save-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Save to Collection</h3>
            <div className="save-options">
              {collections.map((c) => (
                <label key={c.id} className="save-option">
                  <input
                    type="radio"
                    name="save-target"
                    value={c.id}
                    checked={saveTarget === c.id}
                    onChange={() => setSaveTarget(c.id)}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
              <label className="save-option">
                <input
                  type="radio"
                  name="save-target"
                  value="__new__"
                  checked={saveTarget === "__new__"}
                  onChange={() => setSaveTarget("__new__")}
                />
                <span>+ New Collection</span>
              </label>
              {saveTarget === "__new__" && (
                <input
                  type="text"
                  className="save-new-input"
                  placeholder="Collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  autoFocus
                />
              )}
            </div>
            <div className="save-actions">
              <button
                className="save-cancel"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button className="save-confirm" onClick={confirmSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Playground;
