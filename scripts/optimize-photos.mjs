import { readdir, mkdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../", import.meta.url).pathname.replace(/^\//, "");
const SRC = join(ROOT, "assets/photography-originals");
const OUT = join(ROOT, "public/photography");

const MAX_WIDTH = 1600;
const QUALITY = 82;
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const isImage = (f) => EXTS.has(extname(f).toLowerCase());

async function run() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(SRC)).filter(isImage);

  if (!files.length) {
    console.log(`No images in ${SRC}`);
    return;
  }

  let totalIn = 0;
  let totalOut = 0;

  for (const file of files) {
    const inPath = join(SRC, file);
    const outName = basename(file).replace(/\.(jpe?g|png|webp)(\.(jpe?g|png|webp))?$/i, ".jpg");
    const outPath = join(OUT, outName);

    const inStat = await stat(inPath);
    await sharp(inPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outPath);
    const outStat = await stat(outPath);

    totalIn += inStat.size;
    totalOut += outStat.size;
    const pct = ((1 - outStat.size / inStat.size) * 100).toFixed(1);
    console.log(
      `  ${file}  ${(inStat.size / 1e6).toFixed(2)}MB → ${(outStat.size / 1e6).toFixed(2)}MB  (-${pct}%)  ${outName}`
    );
  }

  const totalPct = ((1 - totalOut / totalIn) * 100).toFixed(1);
  console.log(
    `\nTotal: ${(totalIn / 1e6).toFixed(2)}MB → ${(totalOut / 1e6).toFixed(2)}MB  (-${totalPct}%)`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
