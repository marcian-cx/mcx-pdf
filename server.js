import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))

const DOCUMENTS_DIR = path.join(__dirname, 'documents')

await fs.mkdir(DOCUMENTS_DIR, { recursive: true })

app.get('/api/documents', async (req, res) => {
  try {
    const files = await fs.readdir(DOCUMENTS_DIR)
    const mdFiles = files.filter(f => f.endsWith('.md'))
    res.json({ files: mdFiles })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/documents/:filename', async (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, req.params.filename)
    const content = await fs.readFile(filePath, 'utf-8')
    const imagesPath = filePath.replace('.md', '.images.json')
    let images = {}
    try {
      const imagesContent = await fs.readFile(imagesPath, 'utf-8')
      images = JSON.parse(imagesContent)
    } catch {}
    res.json({ content, images })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/documents/:filename', async (req, res) => {
  try {
    const { content, images } = req.body
    const filePath = path.join(DOCUMENTS_DIR, req.params.filename)
    await fs.writeFile(filePath, content, 'utf-8')
    if (images) {
      const imagesPath = filePath.replace('.md', '.images.json')
      await fs.writeFile(imagesPath, JSON.stringify(images, null, 2), 'utf-8')
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/documents/:filename', async (req, res) => {
  try {
    const filePath = path.join(DOCUMENTS_DIR, req.params.filename)
    await fs.unlink(filePath)
    const imagesPath = filePath.replace('.md', '.images.json')
    try {
      await fs.unlink(imagesPath)
    } catch {}
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`MCX PDF Styler API running on http://localhost:${PORT}`)
})


