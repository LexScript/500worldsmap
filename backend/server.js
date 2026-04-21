const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const dataFilePath = path.join(__dirname, '/data.json')
const frontendDir = path.join(process.cwd(), '/frontend')

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.ico': 'image/x-icon'
}

const saveData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8')
}

const loadData = (asString) => {
    if (!fs.existsSync(dataFilePath)) return {}
    const file = fs.readFileSync(dataFilePath, 'utf8')
    return asString ? file : JSON.parse(file)
}

module.exports = class Server {
    constructor() {
        this.port = 3456
        this.server = null
    }

    start() {
        this.server = http.createServer((req, res) => {

            if (req.method === 'POST') {
                let body = ''

                req.on('data', chunk => {
                    body += chunk
                })

                req.on('end', () => {
                    if (body) {
                        saveData(JSON.parse(body))
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    return res.end(loadData(true))
                })

                return
            }

            if (req.method !== 'GET') {
                res.writeHead(405)
                return res.end('Method Not Allowed')
            }

            let parsedUrl = url.parse(req.url)
            let pathname = decodeURIComponent(parsedUrl.pathname)

            if (pathname === '/') {
                pathname = '/index.html'
            }

            const safePath = path.normalize(path.join(frontendDir, pathname))

            if (!safePath.startsWith(frontendDir)) {
                res.writeHead(403)
                return res.end('Forbidden')
            }

            fs.stat(safePath, (err, stats) => {
                if (err) {
                    res.writeHead(404)
                    return res.end('Not Found')
                }

                if (stats.isDirectory()) {
                    const indexFile = path.join(safePath, 'index.html')

                    return fs.readFile(indexFile, (err, data) => {
                        if (err) {
                            res.writeHead(404)
                            return res.end('Not Found')
                        }

                        res.writeHead(200, { 'Content-Type': 'text/html' })
                        res.end(data)
                    })
                }

                const ext = path.extname(safePath)
                const contentType = mimeTypes[ext] || 'application/octet-stream'

                fs.readFile(safePath, (err, data) => {
                    if (err) {
                        res.writeHead(500)
                        return res.end('Server Error')
                    }

                    res.writeHead(200, { 'Content-Type': contentType })
                    res.end(data)
                })
            })
        })

        this.server.listen(this.port, '0.0.0.0', () => {
            console.log(`läuft auf http://localhost:${this.port}`)
        })
    }
}