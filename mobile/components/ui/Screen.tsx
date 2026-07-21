import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export function Screen({ className, children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("flex-1 bg-dark-950", className)}
      {...rest}
    >
      {children}
    </View>
  );
}
