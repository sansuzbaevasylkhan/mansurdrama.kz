import { apiFetch, tokenStore } from "./api";
import { userStore, type PublicUser } from "./token-store";
import type {
  Drama,
  Episode,
  Payment,
} from "./types";

// ─── Публичный API ──────────────────────────────────────────────
export const dramasApi = {
  list: (q?: string) =>
    apiFetch<Drama[]>(`/api/dramas${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  byId: (id: string) => apiFetch<Drama>(`/api/dramas/${id}`),
  bySlug: async (slug: string) => {
    const all = await apiFetch<Drama[]>(
      `/api/dramas?q=${encodeURIComponent(slug)}`,
    );
    return all.find((d) => d.slug === slug) ?? null;
  },
  episodes: (id: string) => apiFetch<Episode[]>(`/api/dramas/${id}/episodes`),
  checkAccess: (params: {
    email: string;
    dramaId: string;
    episodeNumber: number;
  }) =>
    apiFetch<{ allowed: boolean; userExists: boolean; matched?: boolean }>(
      "/api/access",
      { method: "POST", body: params },
    ),
};

// ─── Төлем ─────────────────────────────────────────────────────
export const paymentsApi = {
  submit: (formData: FormData) =>
    apiFetch<{ ok: true; paymentId: string }>("/api/payments", {
      method: "POST",
      formData,
    }),
};

// ─── User auth ─────────────────────────────────────────────
export const userApi = {
  login: async (email: string, name?: string) => {
    const res = await apiFetch<{ ok: true; token: string; user: PublicUser }>(
      "/api/auth/user-login",
      { method: "POST", body: { email, name } },
    );
    if (res.token) {
      await userStore.setToken(res.token);
      await userStore.setUser(res.user);
    }
    return res;
  },
  logout: async () => {
    try {
      await apiFetch("/api/auth/user-logout", { method: "POST" });
    } catch {
      // ignore
    }
    await userStore.clear();
  },
  me: () => apiFetch<{ user: PublicUser | null }>("/api/auth/me"),
};
