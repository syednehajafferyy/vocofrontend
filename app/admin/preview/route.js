import { renderPage } from "../../../lib/render";
import { authed } from "../../../lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req) {
  if (!authed(req)) return new Response("Sign in at /admin", { status: 401 });
  return new Response(renderPage(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
