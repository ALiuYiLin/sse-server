# SSE 时间推送服务

一个基于 Node.js 原生 `http` 模块实现的 **Server-Sent Events (SSE)** 示例项目，服务端每隔 3 秒向客户端推送当前时间，客户端以列表形式实时展示。

## 快速开始

```bash
# 启动服务
node server.js

# 浏览器访问
http://localhost:3000
```

点击页面上的「开始」按钮即可接收时间推送，点击「停止」断开连接。

## 项目结构

```
sse-server/
├── server.js      # Node.js SSE 服务端
├── index.html     # 客户端页面 (HTML + CSS + JS)
├── package.json
└── README.md
```

## 什么是 SSE？

**Server-Sent Events (SSE)** 是 HTML5 规范中的一种服务器推送技术，允许服务器通过 HTTP 连接向客户端单向推送数据。

```
┌──────────┐     HTTP 长连接      ┌──────────┐
│  客户端  │ ◄────────────────── │  服务端  │
│ (浏览器) │   text/event-stream │ (Node.js)│
└──────────┘                      └──────────┘
```

客户端通过浏览器原生的 `EventSource` API 建立连接，服务端设置响应头 `Content-Type: text/event-stream` 后持续写入数据。

## SSE 数据格式

SSE 使用纯文本协议，每条消息以两个换行符 `\n\n` 结尾：

```
data: 这是一条普通消息\n\n

event: customEvent\n
data: {"key": "value"}\n\n

id: 42\n
data: 带 ID 的消息\n\n

retry: 5000\n\n
```

| 字段 | 说明 |
|------|------|
| `data` | 消息内容，可以是文本或 JSON |
| `event` | 自定义事件名，默认为 `message` |
| `id` | 消息 ID，用于断线重连时恢复 |
| `retry` | 重连间隔（毫秒） |

## SSE 的特点

| 特点 | 说明 |
|------|------|
| **基于 HTTP** | 使用标准 HTTP/HTTPS，无需额外协议或端口 |
| **单向通信** | 服务器 → 客户端，结构简单 |
| **自动重连** | 浏览器原生支持断线自动重连 |
| **轻量级** | 纯文本协议，无握手开销 |
| **天然兼容** | 可穿透大多数防火墙和代理，无需特殊配置 |
| **浏览器原生** | 通过 `EventSource` API 直接使用，无需第三方库 |

## SSE vs WebSocket

| 对比项 | SSE | WebSocket |
|--------|-----|-----------|
| 通信方向 | 单向（服务器→客户端） | 双向 |
| 底层协议 | HTTP | 独立的 `ws://` 协议 |
| 数据格式 | 纯文本 | 文本 + 二进制 |
| 断线重连 | 浏览器自动处理 | 需要手动实现 |
| 复杂度 | 低 | 较高 |
| 代理兼容性 | 好（标准 HTTP） | 部分代理需要额外配置 |

**选择建议**：如果只需要服务器向客户端推送数据，优先选 SSE；如果需要双向实时通信，选 WebSocket。

## 适用场景

- **实时通知** — 系统消息、告警推送
- **数据大屏** — 股票行情、监控指标实时刷新
- **日志流** — 实时查看服务端日志输出
- **进度反馈** — 文件上传/处理进度、部署状态
- **AI 流式输出** — ChatGPT 等大模型的逐字输出效果
- **新闻/社交动态** — 实时推送最新内容

## 核心代码说明

**服务端**（`server.js`）关键逻辑：

```js
res.writeHead(200, {
  'Content-Type': 'text/event-stream', // SSE 必需的响应头
  'Cache-Control': 'no-cache',         // 禁止缓存
  'Connection': 'keep-alive',          // 保持长连接
});

// 每 3 秒推送一次时间
const timer = setInterval(() => {
  res.write(`data: ${new Date().toLocaleString('zh-CN')}\n\n`);
}, 3000);

// 客户端断开时清理
req.on('close', () => clearInterval(timer));
```

**客户端**（`index.html`）关键逻辑：

```js
const eventSource = new EventSource('/sse');

eventSource.onmessage = (e) => {
  // e.data 即为服务端推送的时间字符串
  console.log(e.data);
};

// 关闭连接
eventSource.close();
```

## 浏览器兼容性

`EventSource` API 在主流浏览器中均已支持：

- Chrome 6+
- Firefox 6+
- Safari 5+
- Edge 79+
- Opera 11+

> IE 不支持，如需兼容可使用 [event-source-polyfill](https://github.com/Yaffle/EventSource)。
