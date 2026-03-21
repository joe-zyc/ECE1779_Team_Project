const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api/v1";

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    isFormData = false,
    signal,
  } = options;

  const requestHeaders = { ...headers };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (body !== undefined) {
    if (isFormData) {
      payload = body;
    } else {
      requestHeaders["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: payload,
    signal,
  });

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.code = data?.error?.code || "REQUEST_FAILED";
    error.details = data?.error?.details || null;
    throw error;
  }

  return data;
}

export const authApi = {
  signup: (payload) => apiRequest("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  refresh: (refreshToken) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),
  me: (token) => apiRequest("/auth/me", { token }),
  logout: (token) => apiRequest("/auth/logout", { method: "POST", token }),
};

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const listingsApi = {
  listPublic: (params = {}) => apiRequest(`/listings${toQueryString(params)}`),
  getById: (id) => apiRequest(`/listings/${id}`),
};

export { API_BASE_URL };
