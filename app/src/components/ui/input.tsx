import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "min-h-10 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/20",
        className,
      )}
      {...props}
    />
  );
}
