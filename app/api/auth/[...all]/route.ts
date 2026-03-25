import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const url = `${BACKEND_URL}${path}${search}`;

  const headers = new Headers(req.headers);
  headers.set("x-forwarded-host", req.nextUrl.host);

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD"
      ? await req.blob()
      : undefined,
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export const GET = handler;
export const POST = handler;