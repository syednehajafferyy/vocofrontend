import { renderMenuPage } from "../../lib/render";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(renderMenuPage(), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}
