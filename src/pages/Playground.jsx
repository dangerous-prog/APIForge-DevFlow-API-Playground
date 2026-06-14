import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RequestBuilder from "../components/RequestBuilder";
import useAppStore from "../store/useAppStore";
import "./Playground.css";

function Playground() {
  const { collections, saveToCollection, addCollection, activeRequest, loadRequestIntoBuilder } = useAppStore();

  // Quick-save popup state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTarget, setSaveTarget] = useState("");
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleLoadRequest = (req) => {
    loadRequestIntoBuilder(req);
  };

  const handleQuickSave = () => {
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    const reqData = {
      method: activeRequest.method,
      url: activeRequest.url,
      headers: activeRequest.headers,
      body: activeRequest.body,
    };

    if (saveTarget === "__new__" && newCollectionName.trim()) {
      const id = addCollection(newCollectionName.trim());
      saveToCollection(id, reqData);
    } else if (saveTarget) {
      saveToCollection(saveTarget, reqData);
    }
    setShowSaveModal(false);
    setSaveTarget("");
    setNewCollectionName("");
  };

  return (
    <div className="playground" id="playground-page">
      <Navbar onQuickSave={handleQuickSave} />
      <div className="playground-body">
        <Sidebar onLoadRequest={handleLoadRequest} />
        <main className="playground-main" id="workspace-main">
          <RequestBuilder />
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
