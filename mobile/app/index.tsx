import { useEffect, useRef } from "react";
import { View, Image, Dimensions, Animated } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");
const LOGO_SIZE = Math.min(width * 0.6, 280);
const SPLASH_DURATION_MS = 1600;

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [opacity, scale, router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0a0a10",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar style="light" backgroundColor="#0a0a10" />

      <Animated.Image
        source={require("@/assets/md.png")}
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          opacity,
          transform: [{ scale }],
        }}
        resizeMode="contain"
      />
    </View>
  );
}
