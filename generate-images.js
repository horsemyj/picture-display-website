const fs = require('fs').promises;
const path = require('path');

//const ROOT = __dirname;
// 推荐替换：const ROOT = __dirname;
const ROOT = process.argv[2] ? require('path').resolve(process.argv[2]) : process.cwd();
const ASSETS = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'images.json');
const EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const items = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      items.push(...await walk(full));
    } else {
      if (EXT.has(path.extname(e.name).toLowerCase())) items.push(full);
    }
  }
  return items;
}

(async () => {
  try {
    await fs.access(ASSETS);
  } catch (err) {
    console.error('请先创建并添加图片到目录：', ASSETS);
    process.exit(1);
  }

  const files = await walk(ASSETS);
  const out = [];

  for (const f of files) {
    const stat = await fs.stat(f);
    out.push({
      filename: path.basename(f),
      relativePath: path.relative(ROOT, f).replace(/\\/g, '/'),
      url: path.relative(ROOT, f).replace(/\\/g, '/'),
      size: stat.size,
      mtime: stat.mtimeMs
    });
  }

  await fs.writeFile(OUT, JSON.stringify(out, null, 2), 'utf8');
  console.log('生成完成：', OUT);
})();