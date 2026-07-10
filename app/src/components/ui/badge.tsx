import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-surface-muted text-ink ring-line",
  success: "bg-primary-soft text-primary ring-primary/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  danger: "bg-danger/10 text-danger ring-danger/20",
  info: "bg-cyan-400/10 text-ink ring-cyan-300/20",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: ComponentPropsWithoutRef<"span"> & { variant?: keyof typeof variants }) {
  return <span className={cn("inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", variants[variant], className)} {...props} />;
}
