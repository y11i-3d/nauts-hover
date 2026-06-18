import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { optimize } from "svgo";
import { glob } from "tinyglobby";

if (existsSync(".env")) {
  process.loadEnvFile();
}

const SRC_DIR = "public-raw";
const DST_DIR = "public";
const WEBP_QUALITY = Number(process.env.OPTIMIZE_IMAGES_WEBP_QUALITY) || 90;
const EXCLUDE = JSON.parse(process.env.OPTIMIZE_IMAGES_EXCLUDE ?? "[]");

const color = {
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};

const formatBytes = (n) => {
  const units = ["B", "kB", "MB", "GB"];
  let value = n;
  let i = 0;
  while (value >= 1000 && i < units.length - 1) {
    value /= 1000;
    i += 1;
  }
  return `${i === 0 ? value : value.toFixed(2)} ${units[i]}`;
};

const report = async (srcPath, destPath, destSize) => {
  const srcSize = (await stat(srcPath)).size;
  console.log(
    destPath,
    color.yellow(formatBytes(srcSize)),
    "=>",
    color.green(formatBytes(destSize)),
    color.red(`${Math.round((destSize / srcSize) * 100)}%`),
  );
};

const svgFiles = await glob("**/*.svg", { cwd: SRC_DIR, ignore: EXCLUDE });
await Promise.all(
  svgFiles.map(async (rel) => {
    const srcPath = path.join(SRC_DIR, rel);
    const destPath = path.join(DST_DIR, rel);
    const { data } = optimize(await readFile(srcPath, "utf8"), {
      path: srcPath,
    });
    await mkdir(path.dirname(destPath), { recursive: true });
    await writeFile(destPath, data);
    await report(srcPath, destPath, Buffer.byteLength(data));
  }),
);

const rasterFiles = await glob("**/*.{jpg,png}", {
  cwd: SRC_DIR,
  ignore: EXCLUDE,
});
await Promise.all(
  rasterFiles.map(async (rel) => {
    const srcPath = path.join(SRC_DIR, rel);
    const destPath = path.join(DST_DIR, rel).replace(/\.(jpg|png)$/, ".webp");
    const data = await sharp(srcPath)
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await mkdir(path.dirname(destPath), { recursive: true });
    await writeFile(destPath, data);
    await report(srcPath, destPath, data.length);
  }),
);
