import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function ApiUnavailable({
  message = "Não foi possível carregar os dados. Verifique se a API está rodando e tente novamente.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <AlertCircle className="size-12 text-muted-foreground" aria-hidden />
      <p className="font-heading text-sm text-muted-foreground">{message}</p>
      <Link
        href="/"
        className="font-heading text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Tente novamente
      </Link>
    </div>
  );
}
