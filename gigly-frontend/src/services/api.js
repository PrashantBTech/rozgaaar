import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({ baseURL: API_BASE, withCredentials: true });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
        localStorage.setItem("accessToken", data.accessToken);
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (d) => api.post("/auth/register", d),
  login: (d) => api.post("/auth/login", d),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  getAll: (params) => api.get("/jobs", { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (d) => api.post("/jobs", d),
  update: (id, d) => api.put(`/jobs/${id}`, d),
  delete: (id) => api.delete(`/jobs/${id}`),
  getMine: () => api.get("/jobs/my"),
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const appsAPI = {
  apply: (jobId, coverNote, resumeFile) => {
    // If a resume file is provided, send multipart/form-data so backend can upload it.
    if (resumeFile) {
      const fd = new FormData();
      fd.append("jobId", jobId);
      if (coverNote) fd.append("coverNote", coverNote);
      fd.append("resume", resumeFile);
      return api.post("/applications", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post("/applications", { jobId, coverNote });
  },
  getMine: () => api.get("/applications/my"),
  getForJob: (jobId) => api.get(`/applications/job/${jobId}`),
  getContact: (applicationId) => api.get(`/applications/${applicationId}/contact`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  generateVerification: (id, type) => api.post(`/applications/${id}/generate-verification`, { type }),
  checkIn: (id, data) => api.patch(`/applications/${id}/checkin`, data),
  checkOut: (id, data) => api.patch(`/applications/${id}/checkout`, data),
  withdraw: (id) => api.patch(`/applications/${id}/withdraw`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (d) => api.put("/users/profile", d),
  changePassword: (d) => api.put("/users/change-password", d),
  uploadAvatar: (file) => {
    const fd = new FormData(); fd.append("avatar", file);
    return api.post("/users/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  create: (d) => api.post("/reviews", d),
  getForUser: (id) => api.get(`/reviews/user/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifsAPI = {
  getAll: (unreadOnly) => api.get("/notifications", { params: { unreadOnly } }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  getWallet: () => api.get("/payments/wallet"),
  getHistory: () => api.get("/payments/history"),
  createIntent: (applicationId) => api.post("/payments/create-payment-intent", { applicationId }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  banUser: (id, d) => api.patch(`/admin/users/${id}/ban`, d),
  verifyId: (id, approved) => api.patch(`/admin/users/${id}/verify-id`, { approved }),
  getPendingVerifications: () => api.get("/admin/pending-verifications"),
};

export default api;
