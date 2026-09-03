import { useEffect, useRef } from "react";
import { Text, Dimensions, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const LOGO_SIZE = Math.min(width * 0.42, 200);
const NAVIGATE_DELAY_MS = 2400;

/**
 * Netflix стиліндегі кіру анимациясы:
 *  1) Логотип кішкентайдан серпіліп үлкейеді (spring bounce)
 *  2) Артында жұмсақ жарқыраған glow пайда болады
 *  3) "Mansur Drama" атауы астынан сырғып, бірте-бірте көрінеді
 *  4) Бәрі толық көрінген соң (tabs)-қа өтеді
 */
export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.4)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(12)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1) Glow бірте-бірте пайда болады
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 2) Логотип серпіліп үлкейеді, glow бірге кеңейеді
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1.4,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 3) Атауы астынан сырғып көрінеді
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(500),
      // 4) Бүкіл экран жұмсақ сөнеді
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, NAVIGATE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    textOpacity,
    textTranslateY,
    screenOpacity,
    router,
  ]);

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "#0a0a10",
        alignItems: "center",
        justifyContent: "center",
        opacity: screenOpacity,
      }}
    >
      <StatusBar style="light" backgroundColor="#0a0a10" />

      {/* Жарқыраған фон әсері (glow) */}
      <Animated.View
        style={{
          position: "absolute",
          width: LOGO_SIZE * 2.2,
          height: LOGO_SIZE * 2.2,
          borderRadius: LOGO_SIZE * 1.1,
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      >
        <LinearGradient
          colors={["rgba(236,72,153,0.45)", "rgba(139,92,246,0.25)", "transparent"]}
          style={{ flex: 1, borderRadius: LOGO_SIZE * 1.1 }}
        />
      </Animated.View>

      <Animated.Image
        source={require("@/assets/md.png")}
        resizeMode="contain"
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      />

      <Animated.Text
        style={{
          marginTop: 22,
          fontSize: 24,
          fontWeight: "800",
          color: "#fff",
          letterSpacing: 0.5,
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }],
        }}
      >
        Mansur Drama
      </Animated.Text>
    </Animated.View>
  );
}
