import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export function authConfig(token) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export default api;
