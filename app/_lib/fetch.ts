const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export const customFetch = async <T>(
  url: string,
  init?: RequestInit,
): Promise<T> => {
  const targetUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (err) {
    // ECONNREFUSED, rede indisponível, etc. — devolve 500 para o caller tratar
    return {
      data: {
        error: "Serviço indisponível. Verifique se a API está rodando e tente novamente.",
        code: "NETWORK_ERROR",
      },
      status: 500,
      headers: new Headers(),
    } as T;
  }

  const contentType = response.headers.get("content-type");
  let data: unknown;
  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
