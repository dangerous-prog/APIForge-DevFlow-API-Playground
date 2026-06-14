import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Send,
  FolderOpen,
  Clock,
  Code2,
  Globe,
  Braces,
  ArrowRight,
  Terminal,
  Sparkles,
} from "lucide-react";
import "./Home.css";

const FEATURES = [
  {
    icon: Send,
    title: "Send Requests",
    desc: "Fire GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests instantly from your browser.",
    color: "#22c55e",
  },
  {
    icon: FolderOpen,
    title: "Save Collections",
    desc: "Organize your APIs into named collections. Everything persists in localStorage — no account needed.",
    color: "#3b82f6",
  },
  {
    icon: Clock,
    title: "Request History",
    desc: "Every request is auto-logged. One click to reload any past request with full details.",
    color: "#8b5cf6",
  },
  {
    icon: Braces,
    title: "JSON Viewer",
    desc: "Pretty-printed, syntax-highlighted responses with expand/collapse and one-click copy.",
    color: "#f59e0b",
  },
  {
    icon: Globe,
    title: "Environment Variables",
    desc: "Define {{BASE_URL}} and {{TOKEN}} — they auto-replace in URLs and headers before sending.",
    color: "#06b6d4",
  },
  {
    icon: Code2,
    title: "Code Generation",
    desc: "Convert any request to JavaScript fetch, Axios, Python requests, or cURL in one click.",
    color: "#ec4899",
  },
];

function Home() {
  return (
    <div className="home" id="home-page">
      {/* ── Hero ── */}
      <section className="hero" id="hero-section">
        <div className="hero-bg-grid" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>100% Browser-Based · Zero Login Required</span>
          </div>

          <h1 className="hero-title">
            Test APIs <span className="hero-highlight">Faster.</span>
            <br />
            <span className="hero-gradient-text">Without Postman.</span>
          </h1>

          <p className="hero-subtitle">
            A frictionless API playground with collections, environment variables,
            code generation, and instant JSON inspection — all running in your
            browser.
          </p>

          <div className="hero-actions">
            <Link to="/playground" className="hero-cta" id="start-testing-cta">
              <Terminal size={18} />
              Start Testing
              <ArrowRight size={16} className="cta-arrow" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-secondary"
              id="github-cta"
            >
              View on GitHub
            </a>
          </div>

          {/* ── Code Mockup ── */}
          <div className="hero-mockup">
            <div className="mockup-bar">
              <div className="mockup-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <span className="mockup-title">APIForge Playground</span>
            </div>
            <div className="mockup-body">
              <div className="mockup-request">
                <span className="mock-method">GET</span>
                <span className="mock-url">
                  https://api.example.com/users
                </span>
                <span className="mock-send">Send →</span>
              </div>
              <div className="mockup-response">
                <span className="mock-status">200 OK</span>
                <span className="mock-time">124ms</span>
                <span className="mock-size">2.4 KB</span>
              </div>
              <pre className="mockup-json">{`{
  "users": [
    { "id": 1, "name": "Ada Lovelace" },
    { "id": 2, "name": "Alan Turing" }
  ],
  "total": 2
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features" id="features-section">
        <div className="features-header">
          <h2 className="features-title">
            Everything you need.{" "}
            <span className="text-accent">Nothing you don't.</span>
          </h2>
          <p className="features-subtitle">
            A developer-first API playground packed with powerful features, all
            running client-side with zero setup.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              className="feature-card"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="feature-icon"
                style={{
                  background: `${feat.color}15`,
                  color: feat.color,
                }}
              >
                <feat.icon size={22} />
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Strip ── */}
      <section className="cta-strip" id="bottom-cta">
        <div className="cta-strip-content">
          <h2>Ready to forge your API workflow?</h2>
          <p>Jump into the playground — it takes zero seconds to start.</p>
          <Link to="/playground" className="hero-cta">
            <Zap size={18} />
            Launch Playground
            <ArrowRight size={16} className="cta-arrow" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer" id="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Zap size={18} className="text-accent" />
            <span>
              API<span className="text-accent">Forge</span>
            </span>
          </div>
          <div className="footer-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="#features-section">Features</a>
            <a href="mailto:hello@apiforge.dev">Contact</a>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} APIForge. Built for Devlynix Buildathon 2.0.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
