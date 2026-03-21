// Simple API helper using the Fetch API.
// NOTE: In this setup we avoid using process.env on the client
// to keep the bundle simple. If your backend runs elsewhere,
// change the URL below.
const BASE_URL = 'https://iq-test-p8jm.onrender.com/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('iq_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Generic request wrapper
const request = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// Auth APIs
export const registerUser = (payload) =>
  request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const loginUser = (payload) =>
  request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

// Question (Admin) APIs
export const createQuestion = (payload) =>
  request('/questions', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const fetchAllQuestions = () =>
  request('/questions', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

export const updateQuestion = (id, payload) =>
  request(`/questions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

export const deleteQuestion = (id) =>
  request(`/questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

// Test APIs
export const fetchTestQuestions = (params = {}) => {
  const search = new URLSearchParams();
  if (params.difficulty) {
    search.set('difficulty', params.difficulty);
  }
   if (params.std) {
    search.set('std', params.std);
  }
  const queryString = search.toString();
  const endpoint =
    '/test/questions' + (queryString ? `?${queryString}` : '');

  return request(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
};

export const submitTest = (answers) =>
  request('/test/submit', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ answers }),
  });

export const fetchResults = () =>
  request('/test/results', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

export const fetchResultDetailsByPin = (pin) =>
  request(`/test/result/${pin}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

