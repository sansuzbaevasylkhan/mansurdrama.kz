import Constants from "expo-constants";

/**
 * API негізгі URL.
 *  - Vercel-де деплой қылғаннан кейін осы жерді өзгертіңіз (немесе app.json → extra.apiBaseUrl).
 *  - Expo Go + WiFi арқылы тестілеу: жергілікті IP-ні қойыңыз, мысалы http://192.168.1.10:3000
 */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "https://mansurdrama.vercel.app";
