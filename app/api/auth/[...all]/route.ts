import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const res = await fetch(`${BACKEND}${pathname}${search}`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    redirect: "manual",
  });

  const isRedirect = res.status >= 300 && res.status < 400;
  const body = isRedirect || res.status === 204 ? null : res.body;
  const next = new NextResponse(body, { status: res.status });

  res.headers.forEach((v, k) => {
    if (k === "set-cookie") {
      const modified = v
        .replace(/Domain=[^;]+;?\s*/gi, "")
        .replace(/SameSite=None/gi, "SameSite=Lax")
        .replace(/Secure;?\s*/gi, "");
      next.headers.append("set-cookie", modified);
    } else if (k === "location") {
      next.headers.set(k, v);
    } else if (k !== "transfer-encoding" && k !== "content-encoding") {
      next.headers.set(k, v);
    }
  });

  return next;
}

export async function POST(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const res = await fetch(`${BACKEND}${pathname}${search}`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    body: await req.blob(),
    redirect: "manual",
  });

  const body = res.status === 204 ? null : res.body;
  const next = new NextResponse(body, { status: res.status });

  res.headers.forEach((v, k) => {
    if (k === "set-cookie") {
      const modified = v
        .replace(/Domain=[^;]+;?\s*/gi, "")
        .replace(/SameSite=None/gi, "SameSite=Lax")
        .replace(/Secure;?\s*/gi, "");
      next.headers.append("set-cookie", modified);
    } else if (k !== "transfer-encoding" && k !== "content-encoding") {
      next.headers.set(k, v);
    }
  });

  return next;
}