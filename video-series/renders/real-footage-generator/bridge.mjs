// Local reverse proxy: http://127.0.0.1:8787 -> https://salisauto.app via the
// agent proxy (same TLS path curl uses), so headless Chromium can browse the
// live site without fighting the tunnel's TLS restrictions.
import http from 'http';
import fs from 'fs';
import { ProxyAgent, request } from 'undici';

const TARGET = 'https://salisauto.app';
const CA = fs.readFileSync('/root/.ccr/ca-bundle.crt', 'utf8');
const agent = new ProxyAgent({
  uri: process.env.HTTPS_PROXY,
  requestTls: { ca: CA },
  proxyTls: {},
});

const HOP = new Set(['connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailer','transfer-encoding','upgrade','content-length','host','accept-encoding']);

const server = http.createServer(async (req, res) => {
  try {
    const headers = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (!HOP.has(k.toLowerCase())) headers[k] = v;
    }
    headers['host'] = 'salisauto.app';
    headers['accept-encoding'] = 'identity';
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const body = chunks.length ? Buffer.concat(chunks) : undefined;
    const r = await request(TARGET + req.url, {
      method: req.method, headers, body, dispatcher: agent,
      maxRedirections: 0,
    });
    const out = {};
    for (const [k, v] of Object.entries(r.headers)) {
      const lk = k.toLowerCase();
      if (HOP.has(lk) || lk === 'content-security-policy' || lk === 'strict-transport-security') continue;
      if (lk === 'set-cookie') {
        const arr = Array.isArray(v) ? v : [v];
        out[k] = arr.map(c => c.replace(/;\s*Domain=[^;]+/ig, ''));
      } else if (lk === 'location' && typeof v === 'string') {
        out[k] = v.replace(TARGET, '');
      } else out[k] = v;
    }
    res.writeHead(r.statusCode, out);
    for await (const c of r.body) res.write(c);
    res.end();
  } catch (e) {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end('bridge error: ' + e.message);
  }
});
server.listen(8787, '127.0.0.1', () => console.log('bridge up on http://127.0.0.1:8787 ->', TARGET));
