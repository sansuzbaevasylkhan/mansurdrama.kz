import { useEffect } from "react";
import { View, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");
const LOGO_SIZE = Math.min(width * 0.55, 240);

export default function SplashScreen() {
  const router = useRouter();

  // ── Логотип анимациясы ──
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-8);
  const glow = useSharedValue(0);

  const navigateToHome = () => {
    router.replace("/(tabs)");
  };

  useEffect(() => {
    // 1) Логотип пайда болады (fade-in + scale)
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withSequence(
      withTiming(1.08, {
        duration: 700,
        easing: Easing.out(Easing.back(1.4)),
      }),
      withTiming(1.0, {
        duration: 250,
        easing: Easing.inOut(Easing.quad),
      })
    );
    rotate.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // 2) Glow эффект (пульсация)
    glow.value = withDelay(
      600,
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.quad) })
      )
    );

    // 3) 2.4 секундтан кейін негізгі бетке өту
    const timeout = setTimeout(() => {
      // Шығу анимациясы: fade-out + scale-up
      opacity.value = withTiming(
        0,
        { duration: 400, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(navigateToHome)();
        }
      );
      scale.value = withTiming(1.3, {
        duration: 400,
        easing: Easing.in(Easing.cubic),
      });
    }, 2400);

    return () => clearTimeout(timeout);
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: `${rotate.value}deg` as `${number}deg` },
      ] as any,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glow.value * 0.55,
      transform: [{ scale: 0.85 + glow.value * 0.25 }] as any,
    };
  });

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

      {/* Glow halo (пульсация) */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: LOGO_SIZE * 1.8,
            height: LOGO_SIZE * 1.8,
            borderRadius: LOGO_SIZE * 0.9,
            backgroundColor: "#ec4899",
          },
          glowStyle,
        ]}
      />

      {/* Логотип */}
      <Animated.View style={logoStyle}>
        <Image
          source={require("@/assets/md.png")}
          style={{
            width: LOGO_SIZE,
            height: LOGO_SIZE,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
