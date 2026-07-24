import React from "react";
import miniLogoImg from "../assets/mini_logo.png";
import nameLogoImg from "../assets/name_logo.png";
import fullLogoImg from "../assets/full_logo.png";

// Helper for image filter & style
const getLogoStyle = (textColor, customStyle = {}) => {
  const isLight = textColor === "#FFFFFF" || textColor === "#fff" || textColor === "white";
  return {
    width: "auto",
    objectFit: "contain",
    display: "inline-block",
    verticalAlign: "middle",
    filter: isLight ? "brightness(0) invert(1)" : "none",
    ...customStyle,
  };
};

// ── 1. Rozgaaar Mini Logo Image (Isolated 'R' Icon Image) ───────────────────
export const RozgaaarMiniLogo = ({ size = 44, textColor, style = {}, className = "" }) => (
  <img 
    src={miniLogoImg} 
    alt="Rozgaaar Icon" 
    style={getLogoStyle(textColor, { height: size, ...style })}
    className={className}
  />
);

// ── 2. Rozgaaar Name Logo Image (Isolated "Rozgaaar" Wordmark Image) ────────
export const RozgaaarNameLogo = ({ height = 34, textColor, style = {}, className = "" }) => (
  <img 
    src={nameLogoImg} 
    alt="Rozgaaar" 
    style={getLogoStyle(textColor, { height, ...style })}
    className={className}
  />
);

// ── 3. Rozgaaar Full Logo Image (Combined Icon + Wordmark Image) ────────────
export const RozgaaarFullLogo = ({ size = 44, height, textColor, style = {}, className = "" }) => {
  const h = height || size;
  return (
    <img 
      src={fullLogoImg} 
      alt="Rozgaaar Logo" 
      style={getLogoStyle(textColor, { height: h, ...style })}
      className={className}
    />
  );
};

export default RozgaaarFullLogo;
