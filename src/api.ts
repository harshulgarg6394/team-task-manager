const API_URL = ""; // Relative URL since it's the same origin

async function request(endpoint: string, options: any = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Something went wrong");
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: any) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    signup: (data: any) => request("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  },
  projects: {
    getAll: () => request("/projects"),
    create: (data: any) => request("/projects", { method: "POST", body: JSON.stringify(data) }),
  },
  tasks: {
    getAll: (projectId?: string) => request(`/tasks${projectId ? `?projectId=${projectId}` : ""}`),
    create: (data: any) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, updates: any) => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
  },
  users: {
    getAll: () => request("/users"),
  },
};
