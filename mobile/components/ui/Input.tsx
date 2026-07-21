import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

export function Input({ className, ...rest }: TextInputProps & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor="rgba(255,255,255,0.4)"
      className={cn(
        "h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white",
        "focus:border-primary-500/40",
        className,
      )}
      {...rest}
    />
  );
}
