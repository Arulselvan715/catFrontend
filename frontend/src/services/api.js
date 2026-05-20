const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // Keep default message when the server returns no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  listContacts: () => request('/contacts/'),
  createContact: (payload) => request('/contacts/', { method: 'POST', body: JSON.stringify(payload) }),
  updateContact: (id, payload) => request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  listAlerts: () => request('/alerts/?limit=25'),
  alertStats: () => request('/alerts/stats'),
  createAlert: (payload) => request('/alerts/', { method: 'POST', body: JSON.stringify(payload) })
};
