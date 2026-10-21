import fs from "fs";
import { contentPath } from "../../../lib/render";
import { authed } from "../../../lib/auth";

export const dynamic = "force-dynamic";

const getBackendUrl = () => {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  return url.replace(/\/+$/, "");
};

export async function POST(req) {
  if (!authed(req)) return new Response("Sign in required", { status: 401 });
  const b = await req.json();
  if (!Array.isArray(b.zones) || !Array.isArray(b.dishes) || typeof b.menu !== "object") {
    return new Response("Invalid content", { status: 400 });
  }

  const backend = getBackendUrl();
  if (backend) {
    try {
      await fetch(`${backend}/api/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b)
      });
    } catch (e) {
      console.error("Backend fetch error on POST /api/content:", e.message);
    }
  }

  try {
    fs.writeFileSync(contentPath(), JSON.stringify(b));
  } catch (e) {
    // Read-only filesystem in Vercel serverless environment
  }

  return Response.json({ ok: true });
}
