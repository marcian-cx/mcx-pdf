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

## Page Breaks

Force a new page with:

\`\`\`
:::pagebreak:::
\`\`\`

or simply:

\`\`\`
:::page:::
\`\`\`

:::pagebreak:::

## Centering

:::center
# This Heading is Centered
;;;

:::center
Regular text can be centered too.
;;;

:::center
![Centered Image](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80 "w=300")
;;;

---

## Full-Page Background Images

Use the "background" modifier on any image:

\`\`\`
![](image-url "background")
![](image-url "background,opacity=0.5")
\`\`\`

Or use the :::background syntax:

\`\`\`
:::background https://... ;;;
:::background https://... opacity=0.5 ;;;
\`\`\`

:::pagebreak:::

![](https://images.unsplash.com/photo-1519681393784-d120267933ba?w=816&h=1056&fit=crop&q=80 "background")

:::pagebreak:::

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
  light: { name: 'MCX Light', id: 'light', builtin: true },
  neon: { name: 'Neon Nights', id: 'neon', builtin: true }
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
  const mods = { width: null, x: 0, y: 0, center: false, inline: false, background: false, opacity: 1 }
  if (!titleStr) return mods
  
  titleStr.split(',').forEach(part => {
    const p = part.trim()
    if (p === 'center') mods.center = true
    else if (p === 'inline') mods.inline = true
    else if (p === 'background' || p === 'bg') mods.background = true
    else if (p.startsWith('w=')) mods.width = parseInt(p.slice(2))
    else if (p.startsWith('x=')) mods.x = parseInt(p.slice(2))
    else if (p.startsWith('y=')) mods.y = parseInt(p.slice(2))
    else if (p.startsWith('opacity=')) mods.opacity = parseFloat(p.slice(8))
  })
  return mods
}

const API_URL = 'http://localhost:3001/api'

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [images, setImages] = useState({})
  const [themes, setThemes] = useState(defaultThemes)
  const [activeTheme, setActiveTheme] = useState('dark')
  const [customCSS, setCustomCSS] = useState({})
  const [pages, setPages] = useState([])
  const [currentFile, setCurrentFile] = useState('untitled.md')
  const [filesList, setFilesList] = useState([])
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editorCollapsed, setEditorCollapsed] = useState(false)
  const [previewCollapsed, setPreviewCollapsed] = useState(false)
  const fileInputRef = useRef(null)
  const cssInputRef = useRef(null)
  const mdInputRef = useRef(null)
  const measureRef = useRef(null)
  const pagesContainerRef = useRef(null)
  const textareaRef = useRef(null)
  const previewContainerRef = useRef(null)
  const syncingScroll = useRef(false)

  const processedMarkdown = useMemo(() => {
    let processed = markdown.replace(/\n{3,}/g, (match) => {
      const extraLines = match.length - 2
      return '\n\n' + '&nbsp;\n\n'.repeat(extraLines)
    })
    
    processed = processed.replace(/:::center\n([\s\S]*?)\n;;;/g, (match, content) => {
      return `<div class="centered-content">\n\n${content}\n\n</div>`
    })
    
    processed = processed.replace(/:::background[\s\n]+(https?:\/\/[^\s\n;]+)(?:[\s\n]+opacity=([\d.]+))?[\s\n]*;;;/g, (match, url, opacity) => {
      const cleanUrl = url.trim()
      const opacityValue = opacity || '1'
      return `<div class="background-page" data-bg-url="${cleanUrl}" data-bg-opacity="${opacityValue}" style="background-image: url('${cleanUrl}'); background-size: cover; background-position: center; opacity: ${opacityValue};"></div>`
    })
    
    return processed
  }, [markdown])

  useEffect(() => {
    fetchFilesList()
  }, [])

  useEffect(() => {
    const loadBuiltinThemeCSS = async () => {
      if (themes[activeTheme]?.builtin && activeTheme !== 'dark') {
        try {
          const response = await fetch(`/mcx-${activeTheme}.css`)
          const css = await response.text()
          setCustomCSS(prev => ({ ...prev, [activeTheme]: css }))
        } catch (error) {
          console.error(`Failed to load ${activeTheme} theme CSS:`, error)
        }
      }
    }
    loadBuiltinThemeCSS()
  }, [activeTheme, themes])

  const fetchFilesList = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/documents`)
      const data = await response.json()
      setFilesList(data.files)
    } catch (error) {
      console.error('Failed to fetch files:', error)
    }
  }, [])

  const handleSaveDocument = useCallback(async () => {
    try {
      setIsSaving(true)
      await fetch(`${API_URL}/documents/${currentFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: markdown, images })
      })
      await fetchFilesList()
      setIsSaving(false)
    } catch (error) {
      console.error('Failed to save:', error)
      setIsSaving(false)
    }
  }, [currentFile, markdown, images, fetchFilesList])

  const handleLoadDocument = useCallback(async (filename) => {
    try {
      const response = await fetch(`${API_URL}/documents/${filename}`)
      const data = await response.json()
      setMarkdown(data.content)
      setImages(data.images || {})
      setCurrentFile(filename)
      setShowFileMenu(false)
    } catch (error) {
      console.error('Failed to load:', error)
    }
  }, [])

  const handleNewDocument = useCallback(() => {
    const filename = prompt('Enter filename (without .md extension):')
    if (filename) {
      const mdFilename = filename.endsWith('.md') ? filename : `${filename}.md`
      setCurrentFile(mdFilename)
      setMarkdown('')
      setImages({})
    }
  }, [])

  const handleDeleteDocument = useCallback(async (filename, e) => {
    e.stopPropagation()
    if (confirm(`Delete ${filename}?`)) {
      try {
        await fetch(`${API_URL}/documents/${filename}`, { method: 'DELETE' })
        await fetchFilesList()
        if (currentFile === filename) {
          setCurrentFile('untitled.md')
          setMarkdown('')
          setImages({})
        }
      } catch (error) {
        console.error('Failed to delete:', error)
      }
    }
  }, [currentFile, fetchFilesList])

  useEffect(() => {
    const autoSave = setInterval(() => {
      if (markdown && currentFile !== 'untitled.md') {
        handleSaveDocument()
      }
    }, 30000)
    return () => clearInterval(autoSave)
  }, [markdown, currentFile, handleSaveDocument])

  useEffect(() => {
    const textarea = textareaRef.current
    const previewContainer = previewContainerRef.current

    if (!textarea || !previewContainer) return

    const handleEditorScroll = () => {
      if (syncingScroll.current) return
      syncingScroll.current = true
      const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)
      previewContainer.scrollTop = scrollPercentage * (previewContainer.scrollHeight - previewContainer.clientHeight)
      setTimeout(() => { syncingScroll.current = false }, 10)
    }

    const handlePreviewScroll = () => {
      if (syncingScroll.current) return
      syncingScroll.current = true
      const scrollPercentage = previewContainer.scrollTop / (previewContainer.scrollHeight - previewContainer.clientHeight)
      textarea.scrollTop = scrollPercentage * (textarea.scrollHeight - textarea.clientHeight)
      setTimeout(() => { syncingScroll.current = false }, 10)
    }

    textarea.addEventListener('scroll', handleEditorScroll)
    previewContainer.addEventListener('scroll', handlePreviewScroll)

    return () => {
      textarea.removeEventListener('scroll', handleEditorScroll)
      previewContainer.removeEventListener('scroll', handlePreviewScroll)
    }
  }, [])

  useEffect(() => {
    const getLineBreaks = (element, containerTop) => {
      const lines = []
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false)
      let node
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue
        const range = document.createRange()
        range.selectNodeContents(node)
        const rects = range.getClientRects()
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i]
          const relativeTop = rect.top - containerTop
          const relativeBottom = rect.bottom - containerTop
          if (lines.length === 0 || Math.abs(relativeTop - lines[lines.length - 1].top) > 2) {
            lines.push({ top: relativeTop, bottom: relativeBottom, height: rect.height })
          } else {
            lines[lines.length - 1].bottom = Math.max(lines[lines.length - 1].bottom, relativeBottom)
          }
        }
      }
      const imgs = element.querySelectorAll('img')
      imgs.forEach(img => {
        const rect = img.getBoundingClientRect()
        const relativeTop = rect.top - containerTop
        const relativeBottom = rect.bottom - containerTop
        lines.push({ top: relativeTop, bottom: relativeBottom, height: rect.height, isImage: true })
      })
      lines.sort((a, b) => a.top - b.top)
      return lines
    }

    const splitElementAtHeight = (element, maxHeight, containerTop) => {
      const tagName = element.tagName.toLowerCase()
      
      if (tagName === 'table') {
        const rows = Array.from(element.querySelectorAll('tr'))
        const thead = element.querySelector('thead')
        const theadHtml = thead ? thead.outerHTML : ''
        let firstPart = []
        let secondPart = []
        let cumHeight = 0
        const tableTop = element.getBoundingClientRect().top
        
        rows.forEach((row, idx) => {
          if (row.parentElement.tagName.toLowerCase() === 'thead') return
          const rowRect = row.getBoundingClientRect()
          const rowHeight = rowRect.height
          if (cumHeight + rowHeight <= maxHeight) {
            firstPart.push(row.outerHTML)
            cumHeight += rowHeight
          } else {
            secondPart.push(row.outerHTML)
          }
        })
        
        if (firstPart.length === 0) return null
        
        const firstTable = `<table>${theadHtml}<tbody>${firstPart.join('')}</tbody></table>`
        const secondTable = secondPart.length > 0 ? `<table>${theadHtml}<tbody>${secondPart.join('')}</tbody></table>` : null
        return { first: firstTable, second: secondTable }
      }
      
      if (tagName === 'ul' || tagName === 'ol') {
        const items = Array.from(element.children)
        let firstPart = []
        let secondPart = []
        let cumHeight = 0
        
        items.forEach(item => {
          const itemRect = item.getBoundingClientRect()
          const itemHeight = itemRect.height
          if (cumHeight + itemHeight <= maxHeight) {
            firstPart.push(item.outerHTML)
            cumHeight += itemHeight
          } else {
            secondPart.push(item.outerHTML)
          }
        })
        
        if (firstPart.length === 0) return null
        
        const firstList = `<${tagName}>${firstPart.join('')}</${tagName}>`
        const secondList = secondPart.length > 0 ? `<${tagName}>${secondPart.join('')}</${tagName}>` : null
        return { first: firstList, second: secondList }
      }
      
      const lines = getLineBreaks(element, containerTop)
      if (lines.length <= 1) return null
      
      let splitIndex = 0
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].bottom <= maxHeight) {
          splitIndex = i
        } else {
          break
        }
      }
      
      if (splitIndex === 0 && lines[0].bottom > maxHeight) return null
      
      const clone = element.cloneNode(true)
      const elementRect = element.getBoundingClientRect()
      const splitY = lines[splitIndex].bottom
      const splitRatio = splitY / elementRect.height
      
      const originalHtml = element.innerHTML
      const textContent = element.textContent || ''
      const approxCharSplit = Math.floor(textContent.length * splitRatio)
      
      let charCount = 0
      let splitNode = null
      let splitOffset = 0
      
      const findSplitPoint = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const len = node.textContent.length
          if (charCount + len >= approxCharSplit) {
            splitNode = node
            splitOffset = approxCharSplit - charCount
            return true
          }
          charCount += len
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          for (let child of node.childNodes) {
            if (findSplitPoint(child)) return true
          }
        }
        return false
      }
      
      findSplitPoint(element)
      
      if (!splitNode) return null
      
      const range1 = document.createRange()
      range1.setStart(element, 0)
      range1.setEnd(splitNode, Math.min(splitOffset, splitNode.textContent.length))
      
      const range2 = document.createRange()
      range2.setStart(splitNode, Math.min(splitOffset, splitNode.textContent.length))
      range2.setEndAfter(element.lastChild || element)
      
      const frag1 = range1.cloneContents()
      const frag2 = range2.cloneContents()
      
      const temp1 = document.createElement(tagName)
      temp1.className = element.className
      temp1.appendChild(frag1)
      
      const temp2 = document.createElement(tagName)
      temp2.className = element.className
      temp2.appendChild(frag2)
      
      if (!temp1.textContent.trim()) return null
      
      return {
        first: temp1.outerHTML,
        second: temp2.textContent.trim() ? temp2.outerHTML : null
      }
    }

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

      const containerTop = measureRef.current.getBoundingClientRect().top
      const pagesData = []
      let currentPage = []
      let currentHeight = 0
      let currentPageBgUrl = null
      let currentPageBgOpacity = '1'
      let i = 0

      while (i < children.length) {
        const child = children[i]
        const rect = child.getBoundingClientRect()
        const height = rect.height
        
        if (child.classList.contains('page-break-marker')) {
          if (currentPage.length > 0 || currentPageBgUrl) {
            pagesData.push({ 
              elements: [...currentPage], 
              isBackground: !!currentPageBgUrl, 
              bgUrl: currentPageBgUrl, 
              bgOpacity: currentPageBgOpacity 
            })
            currentPage = []
            currentHeight = 0
            currentPageBgUrl = null
            currentPageBgOpacity = '1'
          }
          i++
          continue
        }
        
        if (height === 0 || height < 1) {
          currentPage.push(child.outerHTML)
          i++
          continue
        }

        const computedStyle = getComputedStyle(child)
        const marginTop = parseFloat(computedStyle.marginTop) || 0
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0
        const totalHeight = height + marginTop + marginBottom

        const bgPageElement = child.querySelector('.background-page')
        if (child.classList.contains('background-page') || bgPageElement) {
          const targetElement = bgPageElement || child
          const bgUrl = targetElement.dataset.bgUrl || targetElement.style.backgroundImage.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1')
          const bgOpacity = targetElement.dataset.bgOpacity || '1'
          currentPageBgUrl = `url('${bgUrl}')`
          currentPageBgOpacity = bgOpacity
          i++
          continue
        }

        const remainingSpace = CONTENT_HEIGHT_PX - currentHeight

        if (totalHeight <= remainingSpace) {
          currentPage.push(child.outerHTML)
          currentHeight += totalHeight
          i++
        } else if (remainingSpace > 50 && totalHeight > 50) {
          const splitResult = splitElementAtHeight(child, remainingSpace - marginTop - marginBottom, child.getBoundingClientRect().top)
          
          if (splitResult) {
            currentPage.push(splitResult.first)
            pagesData.push({ 
              elements: [...currentPage], 
              isBackground: !!currentPageBgUrl, 
              bgUrl: currentPageBgUrl, 
              bgOpacity: currentPageBgOpacity 
            })
            currentPage = []
            currentHeight = 0
            currentPageBgUrl = null
            currentPageBgOpacity = '1'
            
            if (splitResult.second) {
              const tempDiv = document.createElement('div')
              tempDiv.innerHTML = splitResult.second
              tempDiv.style.position = 'absolute'
              tempDiv.style.visibility = 'hidden'
              tempDiv.style.width = CONTENT_WIDTH_PX + 'px'
              measureRef.current.appendChild(tempDiv)
              const newHeight = tempDiv.firstChild?.getBoundingClientRect().height || 0
              measureRef.current.removeChild(tempDiv)
              
              currentPage.push(splitResult.second)
              currentHeight = newHeight + marginTop + marginBottom
            }
            i++
          } else {
            if (currentPage.length > 0) {
              pagesData.push({ 
                elements: [...currentPage], 
                isBackground: !!currentPageBgUrl, 
                bgUrl: currentPageBgUrl, 
                bgOpacity: currentPageBgOpacity 
              })
              currentPage = []
              currentHeight = 0
              currentPageBgUrl = null
              currentPageBgOpacity = '1'
            } else {
              currentPage.push(child.outerHTML)
              currentHeight += totalHeight
              i++
            }
          }
        } else {
          if (currentPage.length > 0) {
            pagesData.push({ 
              elements: [...currentPage], 
              isBackground: !!currentPageBgUrl, 
              bgUrl: currentPageBgUrl, 
              bgOpacity: currentPageBgOpacity 
            })
            currentPage = []
            currentHeight = 0
            currentPageBgUrl = null
            currentPageBgOpacity = '1'
          } else {
            currentPage.push(child.outerHTML)
            pagesData.push({ 
              elements: [...currentPage], 
              isBackground: !!currentPageBgUrl, 
              bgUrl: currentPageBgUrl, 
              bgOpacity: currentPageBgOpacity 
            })
            currentPage = []
            currentHeight = 0
            currentPageBgUrl = null
            currentPageBgOpacity = '1'
            i++
          }
        }
      }

      if (currentPage.length > 0 || currentPageBgUrl) {
        pagesData.push({ 
          elements: [...currentPage], 
          isBackground: !!currentPageBgUrl, 
          bgUrl: currentPageBgUrl, 
          bgOpacity: currentPageBgOpacity 
        })
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
      const textarea = textareaRef.current
      if (textarea) {
        const cursorPos = textarea.selectionStart
        const textToInsert = `\n\n![${file.name}](${id} "w=400")\n\n`
        setMarkdown(prev => prev.slice(0, cursorPos) + textToInsert + prev.slice(cursorPos))
        setTimeout(() => {
          textarea.focus()
          textarea.setSelectionRange(cursorPos + textToInsert.length, cursorPos + textToInsert.length)
        }, 0)
      } else {
        setMarkdown(prev => prev + `\n\n![${file.name}](${id} "w=400")\n\n`)
      }
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
        const textarea = textareaRef.current
        if (textarea) {
          const cursorPos = textarea.selectionStart
          const textToInsert = `![${file.name}](${id} "inline") `
          setMarkdown(prev => prev.slice(0, cursorPos) + textToInsert + prev.slice(cursorPos))
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(cursorPos + textToInsert.length, cursorPos + textToInsert.length)
          }, 0)
        } else {
          setMarkdown(prev => prev + `![${file.name}](${id} "inline") `)
        }
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
        const textarea = textareaRef.current
        if (textarea) {
          const cursorPos = textarea.selectionStart
          const textToInsert = `\n\n:::pagebreak:::\n\n![](${id} "background")\n\n:::pagebreak:::\n\n`
          setMarkdown(prev => prev.slice(0, cursorPos) + textToInsert + prev.slice(cursorPos))
          setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(cursorPos + textToInsert.length, cursorPos + textToInsert.length)
          }, 0)
        } else {
          setMarkdown(prev => prev + `\n\n:::pagebreak:::\n\n![](${id} "background")\n\n:::pagebreak:::\n\n`)
        }
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
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      const pagesContainer = pagesContainerRef.current
      if (!pagesContainer || pages.length === 0) return

      const bgColor = activeTheme === 'light' ? '#FDFCF9' : '#111111'
      const pdfFilename = currentFile.replace('.md', '.pdf')
      
      const pageElements = pagesContainer.querySelectorAll('.pdf-page')
      if (pageElements.length === 0) return

      const pdf = new jsPDF({
        unit: 'px',
        format: [PAGE_WIDTH_PX, PAGE_HEIGHT_PX],
        orientation: 'portrait',
        hotfixes: ['px_scaling']
      })

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i]
        
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: bgColor,
          width: PAGE_WIDTH_PX,
          height: PAGE_HEIGHT_PX,
          windowWidth: PAGE_WIDTH_PX,
          logging: false
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.98)
        
        if (i > 0) {
          pdf.addPage([PAGE_WIDTH_PX, PAGE_HEIGHT_PX], 'portrait')
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH_PX, PAGE_HEIGHT_PX)
      }

      pdf.save(pdfFilename)
    } catch (error) {
      console.error('PDF Export Error:', error)
      alert('Failed to export PDF. Check console for details.')
    }
  }, [activeTheme, currentFile, pages])


  const renderImage = useCallback(({ src, alt, title }) => {
    const actualSrc = images[src] || src
    const mods = parseImageModifiers(title)
    
    if (mods.background) {
      return <div className="background-page" data-bg-url={actualSrc} data-bg-opacity={mods.opacity} style={{ backgroundImage: `url('${actualSrc}')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: mods.opacity }} />
    }
    
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
    
    if (text === ':::pagebreak:::' || text === ':::page:::') {
      return <div className="page-break-marker" data-pagebreak="true"></div>
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
          <div className="file-controls">
            <button className="btn btn-ghost btn-sm" onClick={handleNewDocument}>New</button>
            <div className="file-dropdown">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowFileMenu(!showFileMenu)}>
                {currentFile} ▾
              </button>
              {showFileMenu && (
                <div className="file-menu">
                  {filesList.length === 0 ? (
                    <div className="file-menu-empty">No saved documents</div>
                  ) : (
                    filesList.map(file => (
                      <div key={file} className="file-menu-item" onClick={() => handleLoadDocument(file)}>
                        <span>{file}</span>
                        <button className="file-delete-btn" onClick={(e) => handleDeleteDocument(file, e)}>×</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleSaveDocument} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
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
        <div className={`editor-panel ${editorCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <span className="panel-title">Markdown</span>
            <div className="panel-header-actions">
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
              <button className="collapse-btn" onClick={() => setEditorCollapsed(!editorCollapsed)}>
                {editorCollapsed ? '→' : '←'}
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Paste or type your markdown here..."
            spellCheck={false}
          />
        </div>

        <div className={`preview-panel ${previewCollapsed ? 'collapsed' : ''}`}>
          <div className="panel-header">
            <div className="panel-header-left">
              <button className="collapse-btn" onClick={() => setPreviewCollapsed(!previewCollapsed)}>
                {previewCollapsed ? '←' : '→'}
              </button>
              <span className="panel-title">Preview</span>
            </div>
            <span className="page-count">{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="preview-container" ref={previewContainerRef}>
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
              {pages.map((page, pageIndex) => {
                const contentHTML = page.elements.join('')
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = contentHTML
                const bgPageInContent = tempDiv.querySelector('.background-page')
                
                let isBackgroundPage = page.isBackground
                let bgUrl = page.bgUrl
                let bgOpacity = page.bgOpacity || 1
                
                if (bgPageInContent && !isBackgroundPage) {
                  isBackgroundPage = true
                  bgUrl = bgPageInContent.dataset.bgUrl ? `url('${bgPageInContent.dataset.bgUrl}')` : bgPageInContent.style.backgroundImage
                  bgOpacity = bgPageInContent.dataset.bgOpacity || 1
                  bgPageInContent.remove()
                }
                
                const finalHTML = tempDiv.innerHTML
                
                return (
                  <div 
                    key={pageIndex} 
                    className={`pdf-page mcx-preview theme-${activeTheme} ${isBackgroundPage ? 'background-page-container' : ''}`}
                  >
                    {isBackgroundPage && (
                      <div 
                        className="page-background-layer"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundImage: bgUrl,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          opacity: bgOpacity,
                          zIndex: 0
                        }}
                      />
                    )}
                    {finalHTML && (
                      <div className="page-content" dangerouslySetInnerHTML={{ __html: finalHTML }} />
                    )}
                    {pageIndex > 0 && <div className="page-number">{pageIndex + 1}</div>}
                  </div>
                )
              })}
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
