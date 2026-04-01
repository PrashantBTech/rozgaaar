import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { appsAPI } from "../services/api";
import toast from "react-hot-toast";

export default function BusinessVerificationModal({ application, type, onClose }) {
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    generateCode();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let timer;
    if (verificationData && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && verificationData) {
      setVerificationData(null);
    }
    return () => clearInterval(timer);
  }, [verificationData, timeLeft]);

  const generateCode = async () => {
    setLoading(true);
    try {
      const { data } = await appsAPI.generateVerification(application._id, type);
      setVerificationData(data.data);
      
      const expiry = new Date(data.data.expiresAt).getTime();
      const left = Math.floor((expiry - Date.now()) / 1000);
      setTimeLeft(left > 0 ? left : 0);
      toast.success(`${type === 'start' ? 'Start' : 'End'} verification code generated!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate code");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isStart = type === "start";

  return (
    <div className="card fade-in" style={{ marginTop: 16, border: "1px dashed var(--accent)", background: "var(--bg-elevated)", position: "relative" }}>
        <h3 style={{ marginBottom: 4, fontSize: 16 }}>
          {isStart ? "Start Work QR & OTP" : "End Work QR & OTP"}
        </h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 13 }}>
          Ask <strong>{application.worker?.name || "the worker"}</strong> to enter the OTP or scan this QR code to {isStart ? "check in" : "check out"}.
        </p>

        {loading ? (
          <div style={{ padding: 40, color: "var(--text-muted)" }}>Generating secure code...</div>
        ) : !verificationData ? (
          <div style={{ padding: 40, color: "var(--text-muted)" }}>
            <p>Code expired or invalid.</p>
            <button className="btn btn-secondary" onClick={generateCode} style={{ marginTop: 12 }}>
              Generate New Code
            </button>
          </div>
        ) : (
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}>
            {/* QR Code */}
            <div style={{ background: "#fff", padding: 10, borderRadius: 8, flexShrink: 0 }}>
              <QRCodeSVG 
                value={verificationData.qrToken} 
                size={120}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <div style={{ flex: 1, minWidth: 200, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                OR ENTER OTP
              </div>
              
              <div style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "0.2em",
                color: "var(--text-primary)",
                marginBottom: 12,
                fontFamily: "monospace"
              }}>
                {verificationData.otp}
              </div>

              <div style={{
                display: "inline-block",
                padding: "4px 12px",
                background: timeLeft < 60 ? "rgba(244,67,54,0.1)" : "var(--bg-card)",
                color: timeLeft < 60 ? "var(--urgent)" : "var(--text-secondary)",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600
              }}>
                ⏱ Expires in {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ border: "none" }}>
            Close Panel
          </button>
        </div>
    </div>
  );
}
