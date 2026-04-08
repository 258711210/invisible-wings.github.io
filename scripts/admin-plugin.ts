import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../src/data')

export function adminPlugin() {
  return {
    name: 'vite-plugin-admin-api',
    configureServer(server: any) {
      server.middlewares.use('/api/admin', async (req: any, res: any, next: any) => {
        // Simple Body Parser for JSON
        let body = ''
        if (req.method === 'POST') {
          for await (const chunk of req) {
            body += chunk
          }
        }

        const url = new URL(req.url, `http://${req.headers.host}`)
        const endpoint = url.pathname

        res.setHeader('Content-Type', 'application/json')

        // 1. Get Data List
        if (req.method === 'GET' && endpoint === '/files') {
          try {
            const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.ts'))
            res.end(JSON.stringify({ success: true, files }))
          } catch (e: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: e.message }))
          }
          return
        }

        // 2. Read File Data
        if (req.method === 'GET' && endpoint === '/read') {
          const fileName = url.searchParams.get('file')
          if (!fileName) {
            res.statusCode = 400
            res.end(JSON.stringify({ success: false, error: 'Missing file param' }))
            return
          }

          try {
            const filePath = path.join(DATA_DIR, fileName)
            const content = fs.readFileSync(filePath, 'utf-8')
            
            // Extract constants
            // Pattern: export const Name = [...]
            const matches = content.matchAll(/export const (\w+) = (\[[\s\S]*?\]);/g)
            const data: Record<string, any> = {}
            for (const match of matches) {
              try {
                // Safety: evaluating the array string
                // In a production env this is dangerous, but for local dev tool it's okay
                data[match[1]] = JSON.parse(match[2].replace(/'/g, '"')) 
              } catch (parseErr) {
                // If simple replace fails, try a more robust approach or just keep the string
                data[match[1]] = match[2]
              }
            }

            res.end(JSON.stringify({ success: true, data }))
          } catch (e: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: e.message }))
          }
          return
        }

        // 3. Save File Data
        if (req.method === 'POST' && endpoint === '/save') {
          try {
            const { fileName, data } = JSON.parse(body)
            const filePath = path.join(DATA_DIR, fileName)
            
            let content = ''
            for (const [key, value] of Object.entries(data)) {
              const valueStr = JSON.stringify(value, null, 2)
              content += `export const ${key} = ${valueStr};\n`
            }

            fs.writeFileSync(filePath, content, 'utf-8')
            res.end(JSON.stringify({ success: true }))
          } catch (e: any) {
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: e.message }))
          }
          return
        }

        // 4. Delete File Entry (Optional)
        // ...

        next()
      })
    }
  }
}
