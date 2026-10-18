/**
 * NativeWind-де tv() ресми жоқ, сондықтан clsx-ке негізделген қарапайым helper.
 */
import { clsx, type ClassValue } from "clsx";

export function tv<T extends Record<string, Record<string, ClassValue>>>(config: {
  base?: ClassValue;
  variants: T;
  defaultVariants: Record<string, string>;
}) {
  return (props?: Record<string, string> & { className?: ClassValue }) => {
    const merged: ClassValue[] = [];
    if (config.base) merged.push(config.base);

    const pv = props ?? {};

    for (const key in config.variants) {
      const variantKey = pv[key] || config.defaultVariants[key];
      if (variantKey && config.variants[key][variantKey]) {
        merged.push(config.variants[key][variantKey]);
      }
    }

    if (pv.className) merged.push(pv.className);
    return clsx(...merged);
  };
}
