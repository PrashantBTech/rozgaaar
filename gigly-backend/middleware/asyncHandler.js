// ── asyncHandler.js ───────────────────────────────────────────────────────────
// Wraps async route handlers to catch errors without try/catch
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
