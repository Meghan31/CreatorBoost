import axios from 'axios';

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
	headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('access_token');
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// Auto refresh token on 401
api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		if (error.response?.status === 401 && !original._retry) {
			original._retry = true;
			try {
				const refresh = localStorage.getItem('refresh_token');
				const { data } = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
					{ refresh },
				);
				localStorage.setItem('access_token', data.access);
				if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
				original.headers.Authorization = `Bearer ${data.access}`;
				return api(original);
			} catch {
				localStorage.clear();
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	},
);

export default api;
