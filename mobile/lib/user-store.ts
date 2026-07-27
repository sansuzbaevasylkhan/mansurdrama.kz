import { create } from "zustand";
import { apiFetch } from "./api";
import { userStore, type PublicUser } from "./token-store";

export type { PublicUser };

interface UserState {
  user: PublicUser | null;
  token: string | null;
  loading: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, name?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginResponse {
  ok: true;
  token: string;
  user: PublicUser;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  token: null,
  loading: false,
  hydrated: false,
  async hydrate() {
    const [token, user] = await Promise.all([
      userStore.getToken(),
      userStore.getUser(),
    ]);
    set({ token, user, hydrated: true });
  },
  async login(email, name) {
    set({ loading: true });
    try {
      const res = await apiFetch<LoginResponse>("/api/auth/user-login", {
        method: "POST",
        body: { email, name },
      });
      await userStore.setToken(res.token);
      await userStore.setUser(res.user);
      set({ token: res.token, user: res.user });
    } finally {
      set({ loading: false });
    }
  },
  async loginWithGoogle(idToken) {
    set({ loading: true });
    try {
      const res = await apiFetch<LoginResponse>("/api/auth/google", {
        method: "POST",
        body: { idToken },
      });
      await userStore.setToken(res.token);
      await userStore.setUser(res.user);
      set({ token: res.token, user: res.user });
    } finally {
      set({ loading: false });
    }
  },
  async logout() {
    await userStore.clear();
    set({ token: null, user: null });
  },
}));
