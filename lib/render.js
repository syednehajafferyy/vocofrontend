import fs from "fs";
import path from "path";
import { templateHtml, menuHtml, adminHtml, loginHtml, defaultContent } from "./templates.js";

const p = (...a) => path.join(process.cwd(), ...a);
export const contentPath = () => p("data", "content.json");

export function readFile(...segments) {
  const filePath = p(...segments);
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  } catch (e) {}

  const filename = segments[segments.length - 1];
  if (filename === "template.html") return templateHtml;
  if (filename === "menu.html") return menuHtml;
  if (filename === "admin.html") return adminHtml;
  if (filename === "login.html") return loginHtml;
  if (filename === "content.json") return defaultContent;

  return "";
}

export function renderPage() {
  let content = null;
  try {
    const raw = readFile("data", "content.json");
    if (raw) content = JSON.parse(raw);
  } catch (e) {}

  if (!content) {
    try {
      content = JSON.parse(defaultContent);
    } catch (e) {
      content = {};
    }
  }

  const safe = JSON.stringify(content).split("</").join("<\\/").split("<!--").join("<\\u0021--");
  const tpl = readFile("lib", "template.html") || templateHtml;
  return tpl.replace("{{CONTENT}}", () => safe).replace("{{TPL}}", () => "");
}

export function renderMenuPage() {
  let content = null;
  try {
    const raw = readFile("data", "content.json");
    if (raw) content = JSON.parse(raw);
  } catch (e) {}

  if (!content) {
    try {
      content = JSON.parse(defaultContent);
    } catch (e) {
      content = {};
    }
  }

  const safe = JSON.stringify(content).split("</").join("<\\/").split("<!--").join("<\\u0021--");
  const tpl = readFile("lib", "menu.html") || menuHtml;
  return tpl.replace("{{CONTENT}}", () => safe).replace("{{TPL}}", () => "");
}
