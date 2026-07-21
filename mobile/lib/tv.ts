/**
 * NativeWind-де tv() ресми жоқ, сондықтан clsx-ке негізделген қарапайым helper.
 */
import { clsx, type ClassValue } from "clsx";
export type Variants<V extends Record<string, Record<string, ClassValue[]>>> = V;
export function tv<T extends Record<string, Record<string, ClassValue[]>>>(config: {
  base?: ClassValue;
  variants: T;
  defaultVariants: { [K in keyof T]?: keyof T[K] };
}) {
  return (props?: { [K in keyof T]?: keyof T[K] } & { className?: ClassValue }) => {
    const merged: ClassValue[] = [config.base];
    const pv = props ?? {};
    for (const key of Object.keys(config.variants) as (keyof T)[]) {
      const variantKey =
        (pv[key] as keyof T[typeof key]) ?? config.defaultVariants[key];
      if (variantKey) {
        const classes = config.variants[key][variantKey as string];
        if (classes) merged.push(...classes);
      }
    }
    if (pv.className) merged.push(pv.className);
    return clsx(...merged);
  };
}
