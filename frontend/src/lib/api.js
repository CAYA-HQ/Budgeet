const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ─── Token helpers ─────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem("budgeet_token");
export const setToken = (token) => localStorage.setItem("budgeet_token", token);
export const removeToken = () => localStorage.removeItem("budgeet_token");

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("budgeet_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) =>
  localStorage.setItem("budgeet_user", JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem("budgeet_user");

// ─── Core fetch wrapper ────────────────────────────────────────────────────────

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // 204 No Content — no body to parse
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data?.message || "Something went wrong.");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload) =>
    request("/api/auth/register/", { method: "POST", body: payload, auth: false }),

  login: (payload) =>
    request("/api/auth/login/", { method: "POST", body: payload, auth: false }),

  googleCallback: (payload) =>
    request("/api/auth/google/", { method: "POST", body: payload, auth: false }),

  me: () => request("/api/auth/me/"),
};

// ─── Finance API ──────────────────────────────────────────────────────────────

export const financeApi = {
  // Budget
  getBudget: (month) =>
    request(`/api/finance/budget/${month ? `?month=${month}` : ""}`),

  setBudget: (payload) =>
    request("/api/finance/budget/", { method: "POST", body: payload }),

  // Expenses
  getExpenses: (month) =>
    request(`/api/finance/expenses/${month ? `?month=${month}` : ""}`),

  addExpense: (payload) =>
    request("/api/finance/expenses/", { method: "POST", body: payload }),

  updateExpense: (id, payload) =>
    request(`/api/finance/expenses/${id}/`, { method: "PATCH", body: payload }),

  deleteExpense: (id) =>
    request(`/api/finance/expenses/${id}/`, { method: "DELETE" }),

  // Incomes
  getIncomes: (month) =>
    request(`/api/finance/incomes/${month ? `?month=${month}` : ""}`),

  addIncome: (payload) =>
    request("/api/finance/incomes/", { method: "POST", body: payload }),

  updateIncome: (id, payload) =>
    request(`/api/finance/incomes/${id}/`, { method: "PATCH", body: payload }),

  deleteIncome: (id) =>
    request(`/api/finance/incomes/${id}/`, { method: "DELETE" }),

// Category breakdown (used by BudgetPage)
  getCategoryBreakdown: (month) =>
    request(`/api/finance/categories/${month ? `?month=${month}` : ""}`),
 
  // Summary (used by Insights)
  getSummary: (month) =>
    request(`/api/finance/summary/${month ? `?month=${month}` : ""}`),
};
// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationsApi = {
  /** GET /api/notifications/ → { unread_count, notifications: [...] } */
  getAll: () => request("/api/notifications/"),

  /** POST /api/notifications/read-all/ → marks every notification as read */
  markAllRead: () =>
    request("/api/notifications/read-all/", { method: "POST" }),

  /** POST /api/notifications/<id>/read/ → marks one notification as read */
  markRead: (id) =>
    request(`/api/notifications/${id}/read/`, { method: "POST" }),

  /** DELETE /api/notifications/<id>/ → removes one notification */
  delete: (id) =>
    request(`/api/notifications/${id}/`, { method: "DELETE" }),
};

// ─── Search API ─────── //
export const searchApi = {
  /**
   * GET /api/finance/search/?q=<query>&type=<all|expense|income>&month=<YYYY-MM>&category=<cat>
   *
   */
  search: ({ q, type = "all", month, category } = {}) => {
    const params = new URLSearchParams({ q });
    if (type && type !== "all") params.append("type", type);
    if (month)    params.append("month", month);
    if (category) params.append("category", category);
    return request(`/api/finance/search/?${params.toString()}`);
  },
};

// ─── Profile API ──────────────────────────────────────────────────────────────
 
export const profileApi = {
  /**
   * GET /api/profile/
   * Returns: { id, name, email, avatar_url }
   */
  get: () =>
    request("/api/profile/"),
 
  /**
   * PATCH /api/profile/
   * Returns: updated profile object
   */
  update: (payload) =>
    request("/api/profile/", { method: "PATCH", body: payload }),
 
  /**
   * POST /api/profile/avatar/
   */
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return fetch(`${BASE_URL}/api/profile/avatar/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        // browser handles it for multipart
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed.");
      return data;
    });
  },
 
  /**
   * POST /api/profile/change-password/
   */
  changePassword: (payload) =>
    request("/api/profile/change-password/", { method: "POST", body: payload }),
};