const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4444;

const server = http.createServer((req, res) => {
  // 处理 SSE 连接
  if (req.url === '/sse') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // 立即推送一次
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

    // 客户端断开时清理定时器
    req.on('close', () => {
      clearInterval(timer);
      console.log('客户端断开连接');
    });

    return;
  }

  // 提供静态 HTML 页面
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

server.listen(PORT, () => {
  console.log(`SSE 服务器已启动: http://localhost:${PORT}`);
});
