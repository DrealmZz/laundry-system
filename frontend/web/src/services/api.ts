export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const authRole = localStorage.getItem('lw_auth_role');
  const token = authRole ? localStorage.getItem(`lw_token_${authRole}`) : null;
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (authRole) localStorage.removeItem(`lw_token_${authRole}`);
    localStorage.removeItem('lw_auth_role');
    localStorage.removeItem('lw_user');
    window.location.reload();
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
