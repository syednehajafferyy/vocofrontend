import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolvePath(...segments) {
  const attempts = [
    path.join(process.cwd(), ...segments),
    path.join(__dirname, "..", ...segments),
    path.join(__dirname, ...segments),
    path.resolve(process.cwd(), ...segments)
  ];
  for (const p of attempts) {
    if (fs.existsSync(p)) return p;
  }
  return attempts[0];
}

export const contentPath = () => resolvePath("data", "content.json");

export const readFile = (...a) => {
  const p = resolvePath(...a);
  try {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf8");
    }
  } catch (e) {
    console.error("readFile error for", p, e.message);
  }
  return "";
};

export function renderPage() {
  let content = {};
  try {
    const raw = readFile("data", "content.json");
    if (raw) content = JSON.parse(raw);
  } catch (e) {
    console.error("renderPage JSON error:", e.message);
  }
  const safe = JSON.stringify(content).split("</").join("<\\/").split("<!--").join("<\\u0021--");
  const tpl = readFile("lib", "template.html");
  if (!tpl) {
    return "<!DOCTYPE html><html><body><h1>VOCO Rooftop Restaurant</h1><p>Loading...</p></body></html>";
  }
  return tpl.replace("{{CONTENT}}", () => safe).replace("{{TPL}}", () => "");
}

export function renderMenuPage() {
  let content = {};
  try {
    const raw = readFile("data", "content.json");
    if (raw) content = JSON.parse(raw);
  } catch (e) {
    console.error("renderMenuPage JSON error:", e.message);
  }
  const safe = JSON.stringify(content).split("</").join("<\\/").split("<!--").join("<\\u0021--");
  const tpl = readFile("lib", "menu.html");
  if (!tpl) {
    return "<!DOCTYPE html><html><body><h1>VOCO Menu</h1><p>Loading...</p></body></html>";
  }
  return tpl.replace("{{CONTENT}}", () => safe).replace("{{TPL}}", () => "");
}
