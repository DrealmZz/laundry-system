const API_BASE = 'http://localhost:3000/api/v1';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
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
