import React, { useState } from "react";
import toast from "react-hot-toast";
import { appsAPI } from "../services/api";

export default function ContactButton({ applicationId }) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const reveal = async () => {
    setLoading(true);
    try {
      const { data } = await appsAPI.getContact(applicationId);
      setContact(data.data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reveal phone");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!contact?.phone) return;
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  if (!contact) {
    return (
      <button className="btn btn-secondary btn-sm" onClick={reveal} disabled={loading}>
        {loading ? "…" : "📞 View Phone"}
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--accent-dim)",
        border: "1px solid rgba(59,232,176,0.3)",
        borderRadius: "var(--radius-md)",
        padding: "6px 12px",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--accent)" }}>
        📞 {contact.phone}
      </span>
      <button className="btn btn-primary btn-sm" onClick={copy}>
        {copied ? "✓ Copied!" : "Copy"}
      </button>
      <a href={`tel:${contact.phone}`} className="btn btn-secondary btn-sm">
        Call
      </a>
    </div>
  );
}

