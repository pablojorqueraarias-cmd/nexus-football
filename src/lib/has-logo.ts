import "server-only";
import fs from "node:fs";
import path from "node:path";

function fileExists(name: string) {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", name));
  } catch {
    return false;
  }
}

export function getLogoAssets() {
  return {
    dark: fileExists("logo.png") ? "/logo.png" : null,
    light: fileExists("logo-white.png") ? "/logo-white.png" : null,
  };
}
