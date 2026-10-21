import { credsOk, configured, token, cookie } from "../../../lib/auth";
export const dynamic = "force-dynamic";
export async function POST(req) {
  if (!configured()) return new Response("ADMIN_EMAIL and ADMIN_PASSWORD are not set in .env.local", { status: 500 });
  const { email, password } = await req.json().catch(() => ({}));
  if (!credsOk(email, password)) {
    await new Promise((r) => setTimeout(r, 700));
    return new Response("Incorrect email or password", { status: 401 });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie(token(), 604800) } });
}
