const http = require('http');
const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '/data.json');
const frontendDir = path.join(process.cwd(), '/frontend')


const saveData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data), 'utf8');
};

const loadData = (asString) => {
    if (!fs.existsSync(dataFilePath)) return {}
    const file = fs.readFileSync(dataFilePath, 'utf8');
    return asString ? file : JSON.parse(file);
}


module.exports = class Server {
    constructor() {
        this.port = 3456;
        this.server = null;
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
                            saveData(JSON.parse(body));
                        }
                        res.writeHead(200, {'Content-Type': 'application/json'})
                        return res.end(loadData(true))
                    });

                } else if (req.method === 'GET') {
                    if (req.url === '/') {
                        res.writeHead(200, {'Content-Type': 'text/html'})
                        return res.end(fs.readFileSync(path.join(frontendDir, 'index.html'), 'utf8'))

                    } else if (req.url === '/script.js') {
                        res.writeHead(200, {'Content-Type': 'application/javascript'})
                        return res.end(fs.readFileSync(path.join(frontendDir, 'script.js'), 'utf8'))
                    } else if (req.url === '/definitions.js') {
                        res.writeHead(200, {'Content-Type': 'application/javascript'})
                        return res.end(fs.readFileSync(path.join(frontendDir, 'definitions.js'), 'utf8'))

                    } else if (req.url === '/style.css') {
                        res.writeHead(200, {'Content-Type': 'text/css'})
                        return res.end(fs.readFileSync(path.join(frontendDir, 'style.css'), 'utf8'))

                    } else if (req.url === '/map.webp') {
                        res.writeHead(200, {'Content-Type': 'image/webp'})
                        return res.end(fs.readFileSync(path.join(frontendDir, 'map.webp')))

                    } else if (req.url === '/background.png') {
                        res.writeHead(200, {'Content-Type': 'image/png'})
                        return res.end(fs.readFileSync(path.join(frontendDir, 'background.png')))
                    }
                } else {
                    res.writeHead(404)
                    return res.end();
                }
            }
        )

        this.server.listen(this.port, () => {
            console.log(`läuft auf http://localhost:${this.port}`)
        })
    }
}