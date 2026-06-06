"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const REDIRECT_SECONDS = 6;

export function LoginRedirectNotice() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);
    const redirect = window.setTimeout(() => {
      router.replace("/login");
    }, REDIRECT_SECONDS * 1000);

    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(redirect);
    };
  }, [router]);

  return (
    <p className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-50">
      Redirecionando para a tela de login em {secondsLeft} segundo{secondsLeft === 1 ? "" : "s"}.
    </p>
  );
}
