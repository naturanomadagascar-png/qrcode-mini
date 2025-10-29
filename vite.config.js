import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({ babel: { plugins: [['babel-plugin-react-compiler']] } }),

    // GET /api/health : ping local
    {
      name: 'mock-api-health',
      configureServer(server) {
        server.middlewares.use('/api/health', (req, res) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ ok: true, service: 'vite-dev', ts: Date.now() }))
        })
      }
    },

    // GET /api/openapi : spec pour ChatGPT
    {
      name: 'mock-openapi-spec',
      configureServer(server) {
        server.middlewares.use('/api/openapi', (req, res) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          const host  = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173'
          const proto = (req.headers['x-forwarded-proto'] || 'http').toString().split(',')[0].trim()
          const baseUrl = `${proto}://${host}`
          const spec = {
            openapi: "3.1.0",
            info: { title: "NATURANO React Agent", version: "1.0.0" },
            servers: [{ url: baseUrl }],
            paths: {
              "/api/agent/health": {
                get: {
                  operationId: "driveHealth",
                  summary: "Ping Apps Script doGet via proxy",
                  responses: { "200": { description: "OK" } }
                }
              },
              "/api/agent/rename": {
                post: {
                  operationId: "driveRename",
                  summary: "Renommer un fichier Drive via Apps Script",
                  requestBody: {
                    required: true,
                    content: {
                      "application/json": {
                        schema: {
                          type: "object",
                          properties: {
                            fileId: { type: "string" },
                            date: { type: "string", nullable: true },
                            project: { type: "string", nullable: true },
                            site: { type: "string", nullable: true },
                            docType: { type: "string", nullable: true },
                            version: { type: "string", nullable: true },
                            lang: { type: "string", nullable: true },
                            previewOnly: { type: "boolean", nullable: true }
                          },
                          required: ["fileId"]
                        }
                      }
                    }
                  },
                  responses: { "200": { description: "OK" } }
                }
              }
            }
          }
          res.end(JSON.stringify(spec))
        })
      }
    },

    // Proxy GET → Apps Script doGet
{
  name: 'mock-agent-health',
  configureServer(server) {
    server.middlewares.use('/api/agent/health', async (req, res) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      const url = process.env.VITE_AGENT_URL || process.env.AGENT_URL;
      const key = process.env.VITE_AGENT_KEY || process.env.AGENT_KEY;

      if (!url) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ ok: false, error: 'AGENT_URL manquant (env)' }));
      }

      try {
        const up = await fetch(url, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            ...(key ? { 'X-API-Key': key } : {})
          }
        });

        // Essaie JSON, sinon renvoie le texte brut dans "raw"
        let data;
        try {
          data = await up.json();
        } catch {
          data = { raw: await up.text() };
        }

        return res.end(JSON.stringify({
          ok: up.ok,
          status: up.status,
          upstream: data
        }));
      } catch (e) {
        res.statusCode = 502;
        return res.end(JSON.stringify({
          ok: false,
          error: 'Upstream unreachable',
          detail: String(e)
        }));
      }
    });
  }
}
,

    // Proxy POST → Apps Script doPost
    {
      name: 'proxy-agent-rename',
      configureServer(server) {
        server.middlewares.use('/api/agent/rename', async (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ ok:false, error:'Method Not Allowed' })) }
          try {
            const chunks = []
            for await (const c of req) chunks.push(c)
            const bodyStr = Buffer.concat(chunks).toString('utf8') || '{}'
            const url = process.env.VITE_AGENT_URL
            const r = await fetch(url, {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
                'X-API-Key': process.env.VITE_AGENT_KEY || ''
              },
              body: bodyStr
            })
            const text = await r.text()
            res.setHeader('Content-Type', 'application/json')
            res.end(text)
          } catch (e) {
            res.statusCode = 502
            res.end(JSON.stringify({ ok:false, error:'Upstream unreachable', detail:String(e) }))
          }
        })
      }
    },
  ],

  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    host: true,
    allowedHosts: ['localhost', '.trycloudflare.com', 'reflection-bath-summary-expects.trycloudflare.com'],
    hmr: {
      protocol: 'wss',
      host: 'reflection-bath-summary-expects.trycloudflare.com',
      clientPort: 443
    }
  },
})
