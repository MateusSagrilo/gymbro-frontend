import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}${search}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      "content-type": "application/json",
    },
    redirect: "manual",
  });

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
  });

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      nextResponse.headers.append("set-cookie", value);
    } else if (key.toLowerCase() !== "transfer-encoding") {
      nextResponse.headers.set(key, value);
    }
  });

  return nextResponse;
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const url = `${process.env.NEXT_PUBLIC_API_URL}${path}${search}`;

  const body = await req.blob();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") ?? "",
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    body,
    redirect: "manual",
  });

  const nextResponse = new NextResponse(response.body, {
    status: response.status,
  });

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      nextResponse.headers.append("set-cookie", value);
    } else if (key.toLowerCase() !== "transfer-encoding") {
      nextResponse.headers.set(key, value);
    }
  });

  return nextResponse;
}