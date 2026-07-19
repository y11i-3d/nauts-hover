import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { glob } from "tinyglobby";

if (existsSync(".env")) {
  process.loadEnvFile();
}

const SRC_DIR = "public-raw";
const DST_DIR = "public";
const H264_CRF = Number(process.env.OPTIMIZE_VIDEOS_H264_CRF) || 23;
const H264_PRESET = process.env.OPTIMIZE_VIDEOS_H264_PRESET;
const AAC_BITRATE = process.env.OPTIMIZE_VIDEOS_AAC_BITRATE || "128k";
const REMOVE_AUDIO = ["true", "1"].includes(
  process.env.OPTIMIZE_VIDEOS_REMOVE_AUDIO ?? "",
);
const EXCLUDE = JSON.parse(process.env.OPTIMIZE_VIDEOS_EXCLUDE ?? "[]");

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

const encode = (srcPath, destPath) =>
  new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", [
      "-loglevel",
      "error",
      "-i",
      srcPath,
      "-c:v",
      "libx264",
      "-crf",
      String(H264_CRF),
      ...(H264_PRESET ? ["-preset", H264_PRESET] : []),
      "-pix_fmt",
      "yuv420p",
      ...(REMOVE_AUDIO ? ["-an"] : ["-c:a", "aac", "-b:a", AAC_BITRATE]),
      "-movflags",
      "+faststart",
      "-y",
      destPath,
    ]);

    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`));
      }
    });
  });

const videoFiles = await glob("**/*.mp4", { cwd: SRC_DIR, ignore: EXCLUDE });
for (const rel of videoFiles) {
  const srcPath = path.join(SRC_DIR, rel);
  const destPath = path.join(DST_DIR, rel);
  await mkdir(path.dirname(destPath), { recursive: true });
  await encode(srcPath, destPath);
  await report(srcPath, destPath, (await stat(destPath)).size);
}
