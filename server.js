const http = require('http');
const fs = require('fs');
const path = require('path');

const SSE_PORT = 4444;
const HTTP_PORT = 3323;

// ---- SSE 服务器 (端口 4444) ----
const sseServer = http.createServer((req, res) => {
  if (req.url === '/sse') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendTime = () => {
      const now = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      res.write(`data: ${now}\n\n`);
    };

    sendTime();
    const timer = setInterval(sendTime, 3000);

    req.on('close', () => {
      clearInterval(timer);
      console.log('客户端断开连接');
    });

    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// ---- HTTP 静态服务器 (端口 3000) ----
const httpServer = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

sseServer.listen(SSE_PORT, () => {
  console.log(`SSE  服务器已启动: http://localhost:${SSE_PORT}/sse`);
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP 服务器已启动: http://localhost:${HTTP_PORT}`);
});
