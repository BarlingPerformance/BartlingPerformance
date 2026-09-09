const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const error = new Error(data?.error || 'Ein Fehler ist aufgetreten.');
    error.status = res.status;
    error.payload = data;
    throw error;
  }
  return data;
}

export const api = {
  getVehicles: () => request('/vehicles'),
  getBookings: () => request('/bookings'),
  getBooking: (id) => request(`/bookings/${id}`),
  createBooking: (payload) =>
    request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  updateBooking: (id, payload) =>
    request(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),
  checkConflict: (payload) =>
    request('/bookings/check-conflict', { method: 'POST', body: JSON.stringify(payload) }),
  contractPdfUrl: (id) => `${BASE}/documents/${id}/contract.pdf`,
  handoverPdfUrl: (id) => `${BASE}/documents/${id}/handover.pdf`,
};
