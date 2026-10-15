import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { User } from "./types";

export type PublicUser = User;

const TOKEN_KEY = "md_user_token";
const USER_KEY = "md_user_profile";

export const userStore = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token: string) {
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async getUser(): Promise<PublicUser | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  },
  async setUser(user: PublicUser) {
    return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  },
};
