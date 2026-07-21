import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";
import { cn } from "@/lib/utils";
import { tv } from "@/lib/tv";

const button = tv({
  base: "inline-flex items-center justify-center rounded-2xl font-semibold flex-row gap-2 active:opacity-80 disabled:opacity-50",
  variants: {
    variant: {
      primary: "bg-primary-500 active:bg-primary-600",
      outline: "border border-white/15 bg-white/5 active:bg-white/10",
      ghost: "active:bg-white/10",
      danger: "bg-red-500/15 border border-red-500/30 active:bg-red-500/25",
      success: "bg-emerald-500/15 border border-emerald-500/30 active:bg-emerald-500/25",
    },
    size: {
      sm: "h-9 px-3 text-sm",
      md: "h-12 px-4 text-base",
      lg: "h-14 px-6 text-base",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

interface Props extends Omit<PressableProps, "children"> {
  title: string;
  variant?: "primary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  textClassName,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={isDisabled}
      className={cn(button({ variant, size }), className)}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          className={cn(
            "font-semibold text-white",
            size === "sm" ? "text-sm" : "text-base",
            textClassName,
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
