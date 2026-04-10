import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { appsAPI } from "../services/api";
import toast from "react-hot-toast";

export default function WorkerScanModal({ application, type, onClose }) {
  const [method, setMethod] = useState("otp"); // 'qr' or 'otp'
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      if (type === "start") {
        await appsAPI.checkIn(application._id, payload);
        toast.success("Successfully Checked In!");
      } else {
        await appsAPI.checkOut(application._id, payload);
        toast.success("Successfully Checked Out!");
      }
      onClose(true); // pass true to indicate success
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  const onScan = (result) => {
    if (result && result[0] && result[0].rawValue && !loading) {
      handleSubmit({ qrToken: result[0].rawValue });
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) return toast.error("Enter a 4-digit OTP");
    handleSubmit({ otp });
  };

  return (
    <div className="card fade-in" style={{ marginTop: 16, border: "1px dashed var(--border)", background: "var(--bg-elevated)", position: "relative", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, marginBottom: 2 }}>
              {type === "start" ? "Check In to Work" : "Check Out of Work"}
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 12, margin: 0 }}>
              Use the OTP or QR from the business.
            </p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onClose(false)} style={{ border: "none" }}>
            ✕ Cancel
          </button>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "var(--bg-surface)", padding: 4, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", width: "100%" }}>
          <button 
            type="button"
            className={`btn ${method === "otp" ? "btn-primary" : ""}`} 
            style={{ flex: 1, background: method !== "otp" ? "transparent" : "", color: method !== "otp" ? "var(--text-primary)" : "", border: "none", padding: "10px 4px", fontSize: "13px" }}
            onClick={() => setMethod("otp")}
          >
            🔢 Enter OTP
          </button>
          <button 
            type="button"
            className={`btn ${method === "qr" ? "btn-primary" : ""}`} 
            style={{ flex: 1, background: method !== "qr" ? "transparent" : "", color: method !== "qr" ? "var(--text-primary)" : "", border: "none", padding: "10px 4px", fontSize: "13px" }}
            onClick={() => setMethod("qr")}
          >
            📷 Scan QR
          </button>
        </div>

        {method === "qr" ? (
          <div style={{ maxWidth: 240, background: "#000", borderRadius: 12, overflow: "hidden", aspectRatio: "1/1", position: "relative" }}>
            <Scanner
              onScan={onScan}
              onError={(err) => console.log(err)}
              constraints={{ facingMode: "environment" }}
            />
            {loading && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Verifying...
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleOtpSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input 
              type="text" 
              className="input" 
              maxLength={4}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              style={{ fontSize: 28, letterSpacing: "0.15em", textAlign: "center", padding: "8px 16px", width: 140, fontWeight: 700 }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ height: "auto", padding: "12px 24px", fontSize: 14 }} disabled={loading || otp.length !== 4}>
              {loading ? "..." : "Verify"}
            </button>
          </form>
        )}
    </div>
  );
}
