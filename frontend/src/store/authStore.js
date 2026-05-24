import { create } from "zustand";
import toast from "react-hot-toast";

const tokenFromStorage = localStorage.getItem("humanai-token");
const refreshFromStorage = localStorage.getItem("humanai-refresh");
const userFromStorage = localStorage.getItem("humanai-user");

export const useAuthStore = create((set, get) => ({
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  token: tokenFromStorage,
  refreshToken: refreshFromStorage,
  isBootstrapped: false,

  setSession(payload) {
    localStorage.setItem("humanai-token", payload.tokens.access);
    localStorage.setItem("humanai-refresh", payload.tokens.refresh);
    localStorage.setItem("humanai-user", JSON.stringify(payload.user));
    set({ user: payload.user, token: payload.tokens.access, refreshToken: payload.tokens.refresh });
  },

  async login(email, password) {
    const authApi = await import("../api/auth");
    const payload = await authApi.login(email, password);
    get().setSession(payload);
    return payload;
  },

  async loginWithGoogle(googleCredential) {
    const authApi = await import("../api/auth");
    const payload = await authApi.googleAuth(googleCredential);
    get().setSession(payload);
    return payload.user;
  },

  async register(email, password, full_name) {
    const authApi = await import("../api/auth");
    const payload = await authApi.register(email, password, full_name);
    if (payload.tokens) {
      get().setSession(payload);
    }
    return payload.user;
  },

  async logout(callApi = true) {
    const refreshToken = get().refreshToken;
    if (callApi && refreshToken) {
      try {
        const authApi = await import("../api/auth");
        await authApi.logout(refreshToken);
      } catch (error) {
        toast.error("Signed out locally.");
      }
    }
    localStorage.removeItem("humanai-token");
    localStorage.removeItem("humanai-refresh");
    localStorage.removeItem("humanai-user");
    set({ user: null, token: null, refreshToken: null });
  },

  async fetchMe() {
    if (!get().token) {
      set({ isBootstrapped: true });
      return null;
    }
    try {
      const authApi = await import("../api/auth");
      const user = await authApi.me();
      localStorage.setItem("humanai-user", JSON.stringify(user));
      set({ user, isBootstrapped: true });
      return user;
    } catch (error) {
      set({ isBootstrapped: true });
      return null;
    }
  },

  async refreshWordsUsed(newUsed) {
    if (typeof newUsed === "number") {
      const user = get().user;
      if (user) {
        const updated = {
          ...user,
          words_used_this_month: newUsed,
          words_remaining: Math.max(0, user.words_limit - newUsed),
        };
        localStorage.setItem("humanai-user", JSON.stringify(updated));
        set({ user: updated });
      }
      return;
    }
    await get().fetchMe();
  },
}));

if (tokenFromStorage) {
  queueMicrotask(() => useAuthStore.getState().fetchMe());
}
