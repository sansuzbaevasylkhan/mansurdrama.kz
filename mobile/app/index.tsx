import { View, Image, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");
const LOGO_SIZE = Math.min(width * 0.6, 280);

export default function HomeScreen() {
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

      <Image
        source={require("@/assets/md.png")}
        style={{
          width: LOGO_SIZE,
          height: LOGO_SIZE,
        }}
        resizeMode="contain"
      />
    </View>
  );
}
