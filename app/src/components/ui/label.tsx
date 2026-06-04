import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: ComponentPropsWithoutRef<"label">) {
  return <label className={cn("flex flex-col gap-2 text-sm font-medium text-slate-300", className)} {...props} />;
}
