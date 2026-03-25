import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

async function handler(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname;
    const search = req.nextUrl.search;
    const url = `${BACKEND_URL}${path}${search}`;

    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD"
        ? await req.blob()
        : undefined,
      redirect: "manual",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (err) {
    console.error("Auth proxy error:", err);
    return NextResponse.json({ error: "Auth proxy failed" }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;