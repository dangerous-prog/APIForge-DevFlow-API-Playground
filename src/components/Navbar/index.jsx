import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, Moon, Sun, ExternalLink, Download, Upload, Save } from "lucide-react";
import useAppStore from "../../store/useAppStore";
import "./Navbar.css";

function Navbar({ onQuickSave }) {
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const exportData = useAppStore((s) => s.exportData);
  const importData = useAppStore((s) => s.importData);
  const location = useLocation();
  const isPlayground = location.pathname === "/playground";

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apiforge-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = importData(ev.target.result);
        if (success) {
          alert("Data imported successfully!");
        } else {
          alert("Invalid file format.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand" id="navbar-logo">
          <div className="navbar-logo-icon">
            <Zap size={20} />
          </div>
          <span className="navbar-logo-text">
            API<span className="navbar-logo-accent">Forge</span>
          </span>
        </Link>
      </div>

      <div className="navbar-right">
        {isPlayground && (
          <>
            <button
              className="navbar-btn"
              onClick={onQuickSave}
              title="Save Request"
              id="quick-save-btn"
            >
              <Save size={16} />
              <span className="navbar-btn-label">Save</span>
            </button>
            <button
              className="navbar-btn"
              onClick={handleImport}
              title="Import data"
              id="import-btn"
            >
              <Upload size={16} />
              <span className="navbar-btn-label">Import</span>
            </button>
            <button
              className="navbar-btn"
              onClick={handleExport}
              title="Export data"
              id="export-btn"
            >
              <Download size={16} />
              <span className="navbar-btn-label">Export</span>
            </button>
          </>
        )}

        <button
          className="navbar-btn"
          onClick={toggleDarkMode}
          title="Toggle dark mode"
          id="dark-mode-toggle"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="navbar-btn"
          id="github-link"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
