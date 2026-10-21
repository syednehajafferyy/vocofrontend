import { readFile } from "../../lib/render";
import { authed } from "../../lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req) {
  if (!authed(req)) return Response.redirect(new URL("/admin-login", req.url), 302);
  return new Response(readFile("lib", "admin.html"), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
