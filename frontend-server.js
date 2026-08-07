/* ==========================================================================
   SKILLFORGE AI — SIMPLE STATIC FRONTEND SERVER
   Serves the /frontend folder on http://localhost:5500 with zero dependencies.
   Run:  node frontend-server.js
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const ROOT = path.join(__dirname, 'frontend');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, ''));

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 — Not Found</h1><p>' + urlPath + '</p>');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🌐 SkillForge Frontend running at http://localhost:${PORT}`);
    console.log(`   Serving: ${ROOT}`);
});
