import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <View
      className={cn(
        "rounded-lg bg-white/5 overflow-hidden",
        className,
      )}
    >
      <View className="absolute inset-0 opacity-40 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="items-center justify-center py-16 px-6 rounded-2xl bg-white/5 border border-dashed border-white/10">
      {icon ? <View className="mb-3 opacity-40">{icon}</View> : null}
      <Text className="text-lg font-semibold text-white">{title}</Text>
      {description ? (
        <Text className="mt-1 text-sm text-white/50 text-center">{description}</Text>
      ) : null}
      {action ? <View className="mt-4">{action}</View> : null}
    </View>
  );
}
