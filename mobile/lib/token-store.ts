import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "./types";

export type PublicUser = User;

const TOKEN_KEY = "md_user_token";
const USER_KEY = "md_user_profile";

export const userStore = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async setToken(token: string) {
    return AsyncStorage.setItem(TOKEN_KEY, token);
  },
  async getUser(): Promise<PublicUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  },
  async setUser(user: PublicUser) {
    return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async clear() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
