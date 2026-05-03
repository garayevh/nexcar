const BASE = 'http://98.88.80.199:8000';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('nexcar_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Xeta bas verdi');
  }
  return res.json();
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone: email, password }),
    }),
  register: (data: { full_name: string; email: string; password: string; phone?: string }) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: data.full_name, phone: data.phone || data.email, email: data.email, password: data.password }),
    }),
};
