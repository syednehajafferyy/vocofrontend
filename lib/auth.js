import crypto from "crypto";
const E = () => process.env.ADMIN_EMAIL || "";
const P = () => process.env.ADMIN_PASSWORD || "";
export const configured = () => !!(E() && P());
export const token = () => crypto.createHmac("sha256", P()).update("voco-admin-v1|" + E().toLowerCase()).digest("hex");
const same = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); };
export const credsOk = (email, pw) => configured() && same(String(email || "").trim().toLowerCase(), E().toLowerCase()) && same(pw || "", P());
export function authed(req) {
  if (!configured()) return false;
  const m = (req.headers.get("cookie") || "").match(/(?:^|; )voco_admin=([a-f0-9]+)/);
  return !!m && same(m[1], token());
}
export const cookie = (v, age) => `voco_admin=${v}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${age}`;
