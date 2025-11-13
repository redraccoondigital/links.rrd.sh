import { file } from "bun";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import Mustache from "mustache";

const DIST_DIR = "dist";

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await Array.fromAsync(
    new Bun.Glob("**/*").scan({ cwd: src })
  );

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const srcFile = file(srcPath);

    if (await srcFile.exists()) {
      const stat = await srcFile.stat();
      if (stat.isFile()) {
        await Bun.write(destPath, srcFile);
      } else if (stat.isDirectory()) {
        await mkdir(destPath, { recursive: true });
      }
    }
  }
}

async function build() {
  console.log("🔨 Building site...");

  // Clean dist directory
  await rm(DIST_DIR, { recursive: true, force: true });
  await mkdir(DIST_DIR, { recursive: true });

  // Read config
  const configFile = file("links.yaml");
  const configText = await configFile.text();
  const config = Bun.YAML.parse(configText);

  // Read templates
  const indexTemplate = await file("templates/index.html").text();
  const pageTemplate = await file("templates/page.html").text();
  const qrTemplate = await file("templates/qr.html").text();

  // Generate index page
  const indexHTML = Mustache.render(indexTemplate, config);
  await Bun.write(join(DIST_DIR, "index.html"), indexHTML);

  // Generate individual pages
  const baseUrl = "https://links.rrd.sh";
  for (const page of config.pages) {
    const pageDir = join(DIST_DIR, page.slug);
    await mkdir(pageDir, { recursive: true });
    const pageHTML = Mustache.render(pageTemplate, page);
    await Bun.write(join(pageDir, "index.html"), pageHTML);

    // Generate QR page
    const qrDir = join(pageDir, "qr");
    await mkdir(qrDir, { recursive: true });
    const qrHTML = Mustache.render(qrTemplate, { ...page, baseUrl });
    await Bun.write(join(qrDir, "index.html"), qrHTML);
  }

  // Copy assets
  await copyDir("assets", join(DIST_DIR, "assets"));

  // Bundle QRCode library for browser
  const qrcodeBundle = await Bun.build({
    entrypoints: ["node_modules/qrcode/lib/browser.js"],
    outdir: join(DIST_DIR, "assets"),
    naming: "qrcode.min.js",
    minify: true,
    format: "esm",
  });

  if (!qrcodeBundle.success) {
    console.error("Failed to bundle qrcode library");
  }

  // Copy CNAME for custom domain
  const cnameFile = file("CNAME");
  if (await cnameFile.exists()) {
    await Bun.write(join(DIST_DIR, "CNAME"), cnameFile);
  }

  console.log("✅ Build complete! Output in dist/");
}

build().catch(console.error);
