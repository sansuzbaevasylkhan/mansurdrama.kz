import { View } from "react-native";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...rest }: React.ComponentProps<typeof View> & { className?: string }) {
  return (
    <View
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.02] p-4",
        className,
      )}
      {...rest}
    >
      {children}
    </View>
  );
}
