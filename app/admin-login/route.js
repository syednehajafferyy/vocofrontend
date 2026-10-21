import { readFile } from "../../lib/render";
import { authed, configured } from "../../lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req) {
  if (authed(req)) return Response.redirect(new URL("/admin", req.url), 302);
  const warn = configured() ? "" : "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local, then restart the server.";
  return new Response(readFile("lib", "login.html").replace("{{WARN}}", warn), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
