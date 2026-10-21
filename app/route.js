import { renderPage } from "../lib/render";
export const dynamic = "force-dynamic";
export async function GET() {
  return new Response(renderPage(), { headers: { "content-type": "text/html; charset=utf-8" } });
}
