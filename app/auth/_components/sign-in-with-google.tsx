"use client";

import { useState } from "react";
import Image from "next/image";
import { authClient } from "../../_lib/auth-client";
import { Button } from "@/components/ui/button";

function formatAuthError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const m = (error as { message: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Não foi possível entrar com o Google.";
}

export const SignInWithGoogle = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    if (error) {
      setErrorMessage(formatAuthError(error));
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
