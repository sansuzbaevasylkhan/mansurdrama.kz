import Constants from "expo-constants";

/**
 * API негізгі URL.
 *  - Vercel-де деплой қылғаннан кейін осы жерді өзгертіңіз (немесе app.json → extra.apiBaseUrl).
 *  - Expo Go + WiFi арқылы тестілеу: жергілікті IP-ні қойыңыз, мысалы http://192.168.1.10:3000
 */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "https://mansurdrama-kz.vercel.app";

/**
 * Google Sign-In client ID-лары.
 * Google Cloud Console → APIs & Services → Credentials жерінен алынады
 * және app.json → extra.googleWebClientId / googleAndroidClientId / googleIosClientId
 * өрістеріне қойылады.
 */
type GoogleExtra = {
  googleWebClientId?: string;
  googleAndroidClientId?: string;
  googleIosClientId?: string;
};

const extra = (Constants.expoConfig?.extra as GoogleExtra | undefined) ?? {};

export const GOOGLE_WEB_CLIENT_ID = extra.googleWebClientId ?? "";
export const GOOGLE_ANDROID_CLIENT_ID = extra.googleAndroidClientId ?? "";
export const GOOGLE_IOS_CLIENT_ID = extra.googleIosClientId ?? "";
export const GOOGLE_SIGN_IN_CONFIGURED = Boolean(
  GOOGLE_WEB_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID || GOOGLE_IOS_CLIENT_ID,
);
