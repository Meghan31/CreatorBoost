import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
	id: number;
	email: string;
	username: string;
	first_name: string;
	last_name: string;
	avatar_url: string;
	is_onboarded: boolean;
	has_youtube_connected: boolean;
}

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	setAuth: (user: User, access: string, refresh: string) => void;
	logout: () => void;
	isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			accessToken: null,
			refreshToken: null,

			setAuth: (user, accessToken, refreshToken) => {
				localStorage.setItem('access_token', accessToken);
				localStorage.setItem('refresh_token', refreshToken);
				document.cookie = `access_token=${accessToken}; path=/; max-age=7200`;
				set({ user, accessToken, refreshToken });
			},

			logout: () => {
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				document.cookie = 'access_token=; path=/; max-age=0';
				set({ user: null, accessToken: null, refreshToken: null });
			},

			isAuthenticated: () => !!get().accessToken,
		}),
		{ name: 'auth-storage' },
	),
);
