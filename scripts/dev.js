#!/usr/bin/env node
/**
 * Bilibili-BlackList 一键开发脚本
 * -----------------------------------------------------------
 * 功能：
 *   1. 首次构建 dist/bilibili-blacklist.user.js
 *   2. 监听 src/ 目录，代码变更后自动重新构建（防抖 150ms）
 *   3. 在 http://localhost:5173 启动静态服务器（no-cache + CORS）
 *
 * 用法：
 *   npm run dev          # 或 node scripts/dev.js
 *
 * 配合油猴加载器（只安装一次，之后永远不用再改）：
 *   test/bilibili-blacklist.dev.user.js
 *
 * 工作流程：
 *   改代码 -> 保存 -> 自动重建 -> 刷新 B 站页面，立即生效
 * -----------------------------------------------------------
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const PORT = Number(process.env.PORT) || 5173;
const HOST = process.env.HOST || '127.0.0.1';
const BUILD_URL = `http://${HOST}:${PORT}/dist/bilibili-blacklist.user.js`;
const LOADER_URL = `http://${HOST}:${PORT}/test/bilibili-blacklist.dev.user.js`;

/* ---------------- 构建 ---------------- */
function build() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'build.js')], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`build.js 退出码 ${code}`))
    );
  });
}

/* ---------------- 监听 src 变化 ---------------- */
function watchSrc() {
  let timer = null;
  const scheduleRebuild = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log('\n[dev] 检测到 src/ 变更，重新构建...');
      build()
        .then(() => console.log('[dev] 构建完成，刷新 B 站页面即可生效\n'))
        .catch((e) => console.error('[dev] 构建失败：', e.message));
    }, 150);
  };

  // 优先使用递归监听（Windows / macOS 上 Node >= 19.1 支持）
  try {
    fs.watch(SRC_DIR, { recursive: true }, (_event, filename) => {
      if (filename) scheduleRebuild();
    });
    console.log('[dev] 已监听 src/ 目录（fs.watch recursive）');
  } catch (_e) {
    // 降级方案：每 500ms 轮询文件 mtime（Linux 等不支持递归监听的平台）
    console.log('[dev] 递归监听不可用，降级为轮询模式（500ms）');
    let snapshot = '';
    const scan = () => {
      const parts = [];
      const walk = (dir) => {
        for (const name of fs.readdirSync(dir)) {
          const p = path.join(dir, name);
          let st;
          try {
            st = fs.statSync(p);
          } catch (_e) {
            continue; // 文件可能刚被删除/重命名
          }
          if (st.isDirectory()) walk(p);
          else parts.push(name + ':' + st.mtimeMs);
        }
      };
      walk(SRC_DIR);
      const sig = parts.join('|');
      if (snapshot && sig !== snapshot) scheduleRebuild();
      snapshot = sig;
    };
    scan();
    setInterval(scan, 500);
  }
}

/* ---------------- 静态服务器（no-cache + CORS） ---------------- */
const MIME = {
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch (_e) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }
    if (urlPath === '/') urlPath = '/index.html';

    // 防目录穿越
    const filePath = path.normalize(path.join(ROOT, urlPath));
    const insideRoot = filePath === ROOT || filePath.startsWith(ROOT + path.sep);
    if (!insideRoot) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found: ' + urlPath);
        return;
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        // 关键：彻底禁用缓存，加载器每次都能拿到最新构建
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
        // 方便以后从页面环境直接 fetch 调试
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    });
  });

  server.listen(PORT, HOST, () => {
    console.log('\n==============================================');
    console.log('[dev] 本地服务器已启动:   http://localhost:' + PORT);
    console.log('[dev] 构建产物地址:       ' + BUILD_URL);
    console.log('[dev] 油猴加载器(装一次): ' + LOADER_URL);
    console.log('[dev] 流程: 改代码 -> 自动重建 -> 刷新B站页面');
    console.log('==============================================\n');
  });
}

/* ---------------- 启动 ---------------- */
async function main() {
  console.log('[dev] 首次构建...');
  try {
    await build();
  } catch (e) {
    console.error('[dev] 首次构建失败：', e.message);
    process.exit(1);
  }
  watchSrc();
  startServer();
}

main();
