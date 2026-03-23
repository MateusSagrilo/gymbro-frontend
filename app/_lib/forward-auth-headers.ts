import { headers } from "next/headers";

/**
 * Forwards the incoming Cookie header to the backend. Server-side fetch does not
 * send the browser session to a cross-origin API unless cookies are passed explicitly.
 */
export async function forwardAuthHeadersInit(): Promise<RequestInit> {
  const cookie = (await headers()).get("cookie");
  return cookie ? { headers: { cookie } } : {};
}
