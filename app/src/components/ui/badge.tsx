import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-slate-800 text-slate-200 ring-white/10",
  success: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
  warning: "bg-amber-400/10 text-amber-100 ring-amber-300/20",
  danger: "bg-red-400/10 text-red-100 ring-red-300/20",
  info: "bg-cyan-400/10 text-cyan-100 ring-cyan-300/20",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: ComponentPropsWithoutRef<"span"> & { variant?: keyof typeof variants }) {
  return <span className={cn("inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", variants[variant], className)} {...props} />;
}
