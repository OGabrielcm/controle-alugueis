import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary: "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-sm shadow-emerald-950/20",
  secondary: "bg-slate-900 text-slate-100 ring-1 ring-white/10 hover:bg-slate-800",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  danger: "bg-red-400/10 text-red-100 ring-1 ring-red-300/20 hover:bg-red-400/15",
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  children,
  className,
  href,
  variant = "primary",
}: {
  children: ReactNode;
  className?: string;
  href: string;
  variant?: ButtonProps["variant"];
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-300/40",
        variants[variant ?? "primary"],
        className,
      )}
    >
      {children}
    </Link>
  );
}
