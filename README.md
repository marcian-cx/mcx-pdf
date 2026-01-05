# MCX PDF Styler

A markdown-to-PDF converter with the MCX design language — classical typography, dark aesthetic, and warrior-philosopher vibes.

## Features

- **Markdown Editor** with live preview
- **MCX Design Language** — Cinzel headings, Roboto Condensed body, high contrast
- **PDF Export** with proper pagination
- **Image Control** — size, position, centering via markdown syntax
- **Charts** via mathematical equations
- **Custom Themes** — upload your own CSS
- **Page Break Visualization**

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Syntax Guide

### Images

Control images with modifiers in the title (text in quotes):

```markdown
![alt](url "w=400")              # 400px wide
![alt](url "w=300,center")       # 300px, centered
![alt](url "w=250,x=100")        # 250px, offset 100px right
![alt](url "w=200,x=50,y=20")    # With x and y offset
![alt](url "inline")             # Inline with text
```

**Modifiers:**
- `w=###` — Width in pixels
- `x=###` — Horizontal offset (positive = right, negative = left)
- `y=###` — Vertical offset (positive = down, negative = up)
- `center` — Horizontally center the image
- `inline` — Small image that flows with text

### Centering Content

Wrap any content (headings, text, images) with `:::center` fences:

```markdown
:::center
# This Heading is Centered
:::

:::center
This paragraph is centered.
:::

:::center
![Centered Image](url "w=400")
:::
```

### Background Images

Full-page background images:

```markdown
:::background
https://example.com/image.jpg
:::
```

### Extra Spacing

Use `&nbsp;` on its own line for blank vertical space:

```markdown
Some text.

&nbsp;

&nbsp;

More text with two blank lines above.
```

Or just type 3+ blank lines — they auto-convert to spacers.

### Charts

Create mathematical curves:

```markdown
```chart
title: Figure 1-4
yLabel: Muscle Growth
equation: -(x-7)^2 + 49
xRange: 0, 14
xMarkers: 1 set @ 1, 7 sets @ 7
```
```

**Chart Config:**
- `title` — Caption below chart
- `yLabel` — Y-axis label (rotated)
- `equation` — Math expression (use `x` as variable, `^2` for power)
- `xRange` — Min, max for x-axis
- `xMarkers` — Label @ value, Label @ value (comma-separated)

### Tables

Standard markdown tables:

```markdown
| Virtue | Description |
|--------|-------------|
| Courage | Facing fear |
| Discipline | Mastery over self |
```

## Themes

**Built-in:**
- MCX Dark (default)
- MCX Light

**Custom CSS:**
Click "+ CSS" in the header to upload your own stylesheet.

## Design Language

### Typography
- **Headings:** Cinzel (serif, classical)
- **Body:** Roboto Condensed (sans-serif, clean)
- **Code:** IBM Plex Mono

### Colors
- **Dark Theme:** `#111111` background, `#FFFFFF` text, `#DC3545` crimson accents
- **Light Theme:** `#FDFCF9` background, `#1a1a1a` text, `#DC3545` crimson accents

### Sizing
- Letter size pages: 8.5" × 11" (816×1056px at 96dpi)
- 72px padding per side
- Crisp, high-contrast aesthetic

## Export

Click **Export PDF** to generate `mcx-document.pdf` with:
- Edge-to-edge background color
- Proper page breaks
- All images and charts rendered
- MCX styling preserved

## File Structure

```
pdf_styler/
├── src/
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── styles.css        # MCX design language CSS
├── public/
│   └── mcx-light.css     # Light theme
├── index.html
├── package.json
└── vite.config.js
```

## Technologies

- React 18
- Vite
- ReactMarkdown + remarkGfm + rehypeRaw
- html2pdf.js
- Google Fonts (Cinzel, Montserrat, Roboto Condensed, IBM Plex Mono)

---

Built with discipline. Designed for warriors.



