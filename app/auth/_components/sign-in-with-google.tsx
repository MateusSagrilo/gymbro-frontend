"use client";

import { useState } from "react";
import Image from "next/image";
import { authClient } from "../../_lib/auth-client";
import { Button } from "@/components/ui/button";

type FetchStyleError = {
  message?: unknown;
  status?: unknown;
  statusText?: unknown;
  code?: unknown;
};

function formatAuthError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "object" && error !== null) {
    const e = error as FetchStyleError;
    if (typeof e.message === "string" && e.message.trim()) return e.message;
    if (typeof e.code === "string" && e.code.trim()) return e.code;
    if (typeof e.statusText === "string" && e.statusText.trim()) {
      const status =
        typeof e.status === "number"
          ? ` (${e.status})`
          : typeof e.status === "string"
            ? ` (${e.status})`
            : "";
      return `${e.statusText}${status}`;
    }
  }

  return "Não foi possível entrar com o Google.";
}

export const SignInWithGoogle = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    try {
      const callbackURL =
        typeof window !== "undefined"
          ? `${window.location.origin}/`
          : `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/`;

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (error) {
        setErrorMessage(formatAuthError(error));
      }
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Button
        type="button"
        onClick={handleGoogleLogin}
        className="h-[38px] rounded-full bg-white px-6 text-black hover:bg-white/90"
      >
        <Image
          src="/google-icon.svg"
          alt=""
          width={16}
          height={16}
          className="shrink-0"
        />
        Fazer login com Google
      </Button>
      {errorMessage ? (
        <p className="w-full text-center text-sm text-red-200" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};
