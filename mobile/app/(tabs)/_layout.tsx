import { View, Text, Image } from "react-native";
import { Tabs } from "expo-router";
import { Tv, Search, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

function HeaderTitle() {
  return (
    <View className="flex-row items-center gap-1">
      <Image
        source={require("@/assets/md.png")}
        style={{ width: 99, height: 77, borderRadius: 10 }}
        resizeMode="contain"
      />
      <Text className="text-xl font-extrabold text-white">Mansur Drama</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { height: 96 },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerTitle: () => <HeaderTitle />,
        headerTitleContainerStyle: { marginLeft: -12 },
        headerBackground: () => (
          <LinearGradient
            colors={["#ec4899", "#a855f7", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        ),
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 64,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={["#ec4899", "#a855f7", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        ),
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.65)",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Каталог",
          tabBarIcon: ({ color, size }) => <Tv color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Іздеу",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Профиль",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
