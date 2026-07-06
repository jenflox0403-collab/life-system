// 진단용 정적 서버: 요청이 들어올 때마다 콘솔에 기록해서
// 휴대폰이 실제로 PC에 도달하는지 눈으로 확인하기 위한 임시 도구.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url))
const PORT = 4173

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

const server = createServer(async (req, res) => {
  const ip = req.socket.remoteAddress
  console.log(`[요청] ${new Date().toLocaleTimeString()}  from ${ip}  ${req.method} ${req.url}`)

  let path = normalize(decodeURIComponent(req.url.split('?')[0]))
  if (path === '/' || path === '\\') path = '/index.html'
  const file = join(ROOT, path)

  try {
    const data = await readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' })
    res.end(data)
  } catch {
    // SPA 폴백
    try {
      const html = await readFile(join(ROOT, 'index.html'))
      res.writeHead(200, { 'Content-Type': MIME['.html'] })
      res.end(html)
    } catch {
      res.writeHead(404)
      res.end('not found')
    }
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`진단 서버 실행 중: http://0.0.0.0:${PORT}`)
  console.log('휴대폰에서 접속하면 아래에 [요청] 기록이 뜹니다.')
})
