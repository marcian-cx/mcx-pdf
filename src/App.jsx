import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

const PAGE_HEIGHT_PX = 1056
const PAGE_WIDTH_PX = 816
const PAGE_PADDING_PX = 72
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - (PAGE_PADDING_PX * 2)
const CONTENT_WIDTH_PX = PAGE_WIDTH_PX - (PAGE_PADDING_PX * 2)

const defaultMarkdown = `# Welcome to MCX PDF Styler

This is your **warrior-philosopher** document creator.

&nbsp;

&nbsp;

(The blank lines above create extra spacing - use &amp;nbsp; for empty lines)

## Features

- *Classical typography* with Cinzel headings
- Dark, commanding aesthetic
- Export to PDF with one click
- Proper page breaks

### Getting Started

Simply paste or type your markdown here.

> "Master yourself through God's design."

---

## Image Positioning

Control images with modifiers after the URL:

### Size Control
![Mountain](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80 "w=400")

### Centered Image
![Centered](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80 "w=300,center")

### Position Offset
![Offset](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80 "w=250,x=100")

### Inline Images
![icon](https://images.unsplash.com/photo-1590179068383-b9c69aacebd3?w=50&h=50&fit=crop&q=80 "inline") Text flows with inline images.

---

## Centering

:::center
# This Heading is Centered
:::

:::center
Regular text can be centered too.
:::

:::center
![Centered Image](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80 "w=300")
:::

---

## Chart Example

\`\`\`chart
title: Figure 1-4
yLabel: Muscle Growth
equation: -(x-7)^2 + 49
xRange: 0, 14
xMarkers: 1 set @ 1, 7 sets @ 7
\`\`\`

---

## Tables

| Virtue | Description |
|--------|-------------|
| Courage | Facing fear with resolve |
| Discipline | Mastery over self |
| Wisdom | Knowledge applied rightly |

---

### More Content

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

> The path of mastery is long, but every step brings you closer to your true self.

More text to demonstrate page breaks working correctly across multiple pages. The pagination will automatically split content across pages.

---

*Switch themes using the dropdown.*
`

const defaultThemes = {
  dark: { name: 'MCX Dark', id: 'dark', builtin: true },
  light: { name: 'MCX Light', id: 'light', builtin: true }
}

function ChartComponent({ config }) {
  const { title, yLabel, equation, xRange, xMarkers } = config
  const [xMin, xMax] = xRange.split(',').map(v => parseFloat(v.trim()))
  
  const evaluateEquation = (x, eq) => {
    let expr = eq.replace(/\^2/g, '**2').replace(/\^3/g, '**3').replace(/x/g, `(${x})`)
    try { return Function(`"use strict"; return (${expr})`)() } 
    catch { return 0 }
  }
  
  const points = []
  const step = (xMax - xMin) / 100
  let yMin = Infinity, yMax = -Infinity
  
  for (let x = xMin; x <= xMax; x += step) {
    const y = evaluateEquation(x, equation)
    points.push({ x, y })
    if (y < yMin) yMin = y
    if (y > yMax) yMax = y
  }
  
  const padding = 50, width = 500, height = 280
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  
  const scaleX = (x) => padding + ((x - xMin) / (xMax - xMin)) * chartWidth
  const scaleY = (y) => height - padding - ((y - yMin) / (yMax - yMin)) * chartHeight
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ')
  
  const markers = xMarkers ? xMarkers.split(',').map(m => {
    const match = m.trim().match(/(.+)\s*@\s*(\d+\.?\d*)/)
    if (match) return { label: match[1].trim(), x: parseFloat(match[2]) }
    return null
  }).filter(Boolean) : []

  return (
    <div className="chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" strokeWidth="1.5" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" strokeWidth="1.5" />
        {yLabel && <text x={15} y={height / 2} transform={`rotate(-90, 15, ${height / 2})`} className="chart-label">{yLabel}</text>}
        <path d={pathD} fill="none" stroke="currentColor" strokeWidth="1.5" />
        {markers.map((marker, i) => {
          const y = evaluateEquation(marker.x, equation)
          return (
            <g key={i}>
              <line x1={scaleX(marker.x)} y1={scaleY(y)} x2={scaleX(marker.x)} y2={height - padding} stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
              <text x={scaleX(marker.x)} y={height - padding + 18} textAnchor="middle" className="chart-marker-label">{marker.label}</text>
            </g>
          )
        })}
      </svg>
      {title && <div className="chart-title">{title}</div>}
    </div>
  )
}

function parseChartConfig(code) {
  const config = {}
  code.trim().split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length) config[key.trim()] = valueParts.join(':').trim()
  })
  return config
}

function parseImageModifiers(titleStr) {
  const mods = { width: null, x: 0, y: 0, center: false, inline: false }
  if (!titleStr) return mods
  
  titleStr.split(',').forEach(part => {
    const p = part.trim()
    if (p === 'center') mods.center = true
    else if (p === 'inline') mods.inline = true
    else if (p.startsWith('w=')) mods.width = parseInt(p.slice(2))
    else if (p.startsWith('x=')) mods.x = parseInt(p.slice(2))
    else if (p.startsWith('y=')) mods.y = parseInt(p.slice(2))
  })
  return mods
}

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [images, setImages] = useState({})
  const [themes, setThemes] = useState(defaultThemes)
  const [activeTheme, setActiveTheme] = useState('dark')
  const [customCSS, setCustomCSS] = useState({})
  const [pages, setPages] = useState([])
  const fileInputRef = useRef(null)
  const cssInputRef = useRef(null)
  const measureRef = useRef(null)
  const pagesContainerRef = useRef(null)

  const processedMarkdown = useMemo(() => {
    let processed = markdown.replace(/\n{3,}/g, (match) => {
      const extraLines = match.length - 2
      return '\n\n' + '&nbsp;\n\n'.repeat(extraLines)
    })
    
    processed = processed.replace(/:::center\n([\s\S]*?)\n:::/g, (match, content) => {
      return `<div class="centered-content">\n\n${content}\n\n</div>`
    })
    
    return processed
  }, [markdown])

  useEffect(() => {
    const paginateContent = async () => {
      if (!measureRef.current) return

      await new Promise(resolve => setTimeout(resolve, 300))

      const imgs = measureRef.current.querySelectorAll('img')
      await Promise.all(
        Array.from(imgs).map(img => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve()
          return new Promise((resolve) => {
            const checkImage = () => {
              if (img.complete && img.naturalWidth > 0) {
                resolve()
              }
            }
            img.onload = () => {
              setTimeout(resolve, 50)
            }
            img.onerror = resolve
            setTimeout(resolve, 3000)
            checkImage()
          })
        })
      )

      await new Promise(resolve => setTimeout(resolve, 100))

      const children = Array.from(measureRef.current.children)
      if (children.length === 0) {
        setPages([{ elements: [], isBackground: false }])
        return
      }

      const pagesData = []
      let currentPage = []
      let currentHeight = 0

      children.forEach((child) => {
        const rect = child.getBoundingClientRect()
        const height = rect.height
        
        if (height === 0 || height < 1) {
          currentPage.push(child.outerHTML)
          return
        }

        const computedStyle = getComputedStyle(child)
        const marginTop = parseFloat(computedStyle.marginTop) || 0
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0
        const totalHeight = height + marginTop + marginBottom

        if (child.classList.contains('background-page')) {
          if (currentPage.length > 0) {
            pagesData.push({ elements: [...currentPage], isBackground: false })
            currentPage = []
            currentHeight = 0
          }
          pagesData.push({ elements: [child.outerHTML], isBackground: true, bgUrl: child.style.backgroundImage })
          return
        }

        if (currentHeight + totalHeight > CONTENT_HEIGHT_PX && currentPage.length > 0) {
          pagesData.push({ elements: [...currentPage], isBackground: false })
          currentPage = []
          currentHeight = 0
        }

        currentPage.push(child.outerHTML)
        currentHeight += totalHeight
      })

      if (currentPage.length > 0) {
        pagesData.push({ elements: [...currentPage], isBackground: false })
      }

      if (pagesData.length === 0) {
        pagesData.push({ elements: [], isBackground: false })
      }

      setPages(pagesData)
    }

    const timer = setTimeout(paginateContent, 50)
    return () => clearTimeout(timer)
  }, [processedMarkdown, activeTheme, images])

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const id = `img-${Date.now()}`
      setImages(prev => ({ ...prev, [id]: event.target.result }))
      setMarkdown(prev => prev + `\n\n![${file.name}](${id} "w=400")\n\n`)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  const insertInlineImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        const id = `img-${Date.now()}`
        setImages(prev => ({ ...prev, [id]: event.target.result }))
        setMarkdown(prev => prev + `![${file.name}](${id} "inline") `)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [])

  const insertBackgroundImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        const id = `img-${Date.now()}`
        setImages(prev => ({ ...prev, [id]: event.target.result }))
        setMarkdown(prev => prev + `\n\n:::background\n${id}\n:::\n\n`)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [])

  const handleCSSUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const id = `custom-${Date.now()}`
      const name = file.name.replace('.css', '')
      setCustomCSS(prev => ({ ...prev, [id]: event.target.result }))
      setThemes(prev => ({ ...prev, [id]: { name, id, builtin: false } }))
      setActiveTheme(id)
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleExportPDF = useCallback(async () => {
    const html2pdf = (await import('html2pdf.js')).default
    const container = pagesContainerRef.current
    if (!container) return

    const clone = container.cloneNode(true)
    clone.querySelectorAll('.page-number').forEach(el => el.remove())
    
    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position:absolute;left:-9999px'
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    const bgColor = activeTheme === 'light' ? '#FDFCF9' : '#111111'
    const opt = {
      margin: 0,
      filename: 'mcx-document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: bgColor, width: PAGE_WIDTH_PX, windowWidth: PAGE_WIDTH_PX },
      jsPDF: { unit: 'px', format: [PAGE_WIDTH_PX, PAGE_HEIGHT_PX], orientation: 'portrait', hotfixes: ['px_scaling'] },
      pagebreak: { mode: ['css'], before: '.pdf-page' }
    }

    await html2pdf().set(opt).from(clone).save()
    document.body.removeChild(wrapper)
  }, [activeTheme])

  const renderImage = useCallback(({ src, alt, title }) => {
    const actualSrc = images[src] || src
    const mods = parseImageModifiers(title)
    
    const style = {}
    if (mods.width) style.width = `${mods.width}px`
    if (mods.x || mods.y) style.transform = `translate(${mods.x}px, ${mods.y}px)`
    
    if (mods.inline) {
      return <img src={actualSrc} alt={alt || ''} className="inline-image" crossOrigin="anonymous" />
    }
    
    if (mods.center) {
      return (
        <span className="centered-block">
          <img src={actualSrc} alt={alt || ''} style={style} crossOrigin="anonymous" />
        </span>
      )
    }
    
    return <img src={actualSrc} alt={alt || ''} style={style} crossOrigin="anonymous" />
  }, [images])

  const renderParagraph = useCallback(({ children, node }) => {
    const childArray = Array.isArray(children) ? children : [children]
    const text = childArray.map(c => typeof c === 'string' ? c : '').join('').trim()
    
    const hasNonTextContent = childArray.some(c => 
      typeof c === 'object' && c !== null
    )
    
    if ((text === '' || text === '\u00A0' || text === '&nbsp;') && !hasNonTextContent) {
      return <div className="spacer">&nbsp;</div>
    }
    
    const bgMatch = text.match(/^:::background\s*([\s\S]*?):::$/)
    if (bgMatch) {
      const imgSrc = images[bgMatch[1].trim()] || bgMatch[1].trim()
      return <div className="background-page" style={{ backgroundImage: `url(${imgSrc})` }} />
    }

    const hasInlineImage = childArray.some(c => 
      c?.props?.className === 'inline-image' || 
      (c?.props?.title && c.props.title.includes('inline'))
    )
    
    if (hasInlineImage) {
      return <p className="has-inline-image">{children}</p>
    }
    
    return <p>{children}</p>
  }, [images])

  const renderDiv = useCallback(({ node, children, className }) => {
    if (className === 'centered-content') {
      return <div className="centered-content">{children}</div>
    }
    return <div className={className}>{children}</div>
  }, [])

  const renderCode = useCallback(({ node, inline, className, children, ...props }) => {
    const lang = /language-(\w+)/.exec(className || '')?.[1] || ''
    const code = String(children).replace(/\n$/, '')
    
    if (lang === 'chart') return <ChartComponent config={parseChartConfig(code)} />
    if (inline) return <code className={className} {...props}>{children}</code>
    return <pre><code className={className} {...props}>{children}</code></pre>
  }, [])

  const wordCount = markdown.split(/\s+/).filter(w => w).length
  const charCount = markdown.length
  const pageCount = pages.length || 1

  return (
    <div className={`app-container theme-${activeTheme}`}>
      <header className="app-header">
        <div className="app-logo"><span>MCX</span> PDF Styler</div>
        <div className="header-actions">
          <div className="theme-selector">
            <select value={activeTheme} onChange={(e) => setActiveTheme(e.target.value)} className="theme-select">
              {Object.values(themes).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input ref={cssInputRef} type="file" accept=".css" onChange={handleCSSUpload} className="hidden-input" />
            <button className="btn btn-ghost btn-sm" onClick={() => cssInputRef.current?.click()}>+ CSS</button>
          </div>
          <button className="btn btn-ghost" onClick={() => window.print()}>Print</button>
          <button className="btn btn-primary" onClick={handleExportPDF}>Export PDF</button>
        </div>
      </header>

      <main className="main-content">
        <div className="editor-panel">
          <div className="panel-header">
            <span className="panel-title">Markdown</span>
            <div className="image-toolbar">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden-input" />
              <button className="image-btn" onClick={() => fileInputRef.current?.click()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                Block
              </button>
              <button className="image-btn" onClick={insertInlineImage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                Inline
              </button>
              <button className="image-btn" onClick={insertBackgroundImage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 15l5-5 4 4 5-5 6 6"/></svg>
                Background
              </button>
            </div>
          </div>
          <textarea
            className="editor-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Paste or type your markdown here..."
            spellCheck={false}
          />
        </div>

        <div className="preview-panel">
          <div className="panel-header">
            <span className="panel-title">Preview</span>
            <span className="page-count">{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="preview-container">
            {customCSS[activeTheme] && <style>{customCSS[activeTheme]}</style>}
            
            <div 
              ref={measureRef} 
              className={`mcx-preview theme-${activeTheme} measure-container`}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: CONTENT_WIDTH_PX, padding: 0, left: -9999 }}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{ img: renderImage, p: renderParagraph, code: renderCode, div: renderDiv }}
              >
                {processedMarkdown}
              </ReactMarkdown>
            </div>

            <div className="pages-container" ref={pagesContainerRef}>
              {pages.map((page, pageIndex) => (
                <div 
                  key={pageIndex} 
                  className={`pdf-page mcx-preview theme-${activeTheme} ${page.isBackground ? 'background-page-container' : ''}`}
                  style={page.isBackground ? { backgroundImage: page.bgUrl, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!page.isBackground && (
                    <div className="page-content" dangerouslySetInnerHTML={{ __html: page.elements.join('') }} />
                  )}
                  <div className="page-number">{pageIndex + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="status-bar">
        <div className="status-item"><span className="status-dot" /><span>Ready</span></div>
        <div className="status-item">{wordCount} words · {charCount} chars · {pageCount} pages</div>
      </div>
    </div>
  )
}

export default App
