# MCX Design Language

A comprehensive guide to the visual language, styling conventions, and design patterns used across the Marcian CX website.

---

## Brand Identity

### Philosophy

MCX embodies a **warrior-philosopher aesthetic**—commanding, classical, and unapologetically masculine. The design draws from Orthodox Christian tradition, classical antiquity, and medieval military orders. Every visual choice reinforces the brand's mission: *Master yourself through God's design.*

### Tone

- **Authoritative** but not aggressive
- **Classical** but not antiquated
- **Serious** but not severe
- **Aspirational** but grounded

---

## Color Palette

### Brand Colors

| Token             | Hex       | Usage                                      |
|-------------------|-----------|---------------------------------------------|
| `brand-black`     | `#000000` | Deepest backgrounds, modal overlays         |
| `brand-charcoal`  | `#1a1a1a` | Primary background color                    |
| `brand-ivory`     | `#F5F1E6` | Primary text, headings                      |
| `brand-silver`    | `#9A9A9A` | Secondary text, body paragraphs             |
| `brand-crimson`   | `#DC3545` | Accent color, CTAs, interactive elements    |

### CSS Custom Properties

```css
:root {
  --brand-black: #000000;
  --brand-charcoal: #1a1a1a;
  --brand-ivory: #F5F1E6;
  --brand-silver: #9A9A9A;
  --brand-crimson: #DC3545;
}
```

### Tailwind Extensions

```javascript
colors: {
  brand: {
    black: '#000000',
    charcoal: '#222222',
    ivory: '#F8F4E3',
    silver: '#C0C0C0',
    crimson: '#E34749',
  },
}
```

### Color Usage Principles

1. **Dark-first design**: Backgrounds are always dark (charcoal/black), text is light
2. **Crimson as the hero**: Use sparingly for maximum impact—CTAs, headings, interactive states
3. **Silver for secondary content**: Body text, descriptions, metadata
4. **Ivory for emphasis**: Headings, strong elements, primary text

### Opacity Patterns

- `white/5` — Subtle borders and dividers
- `white/10` — Standard card borders
- `brand-crimson/30` — Highlighted card borders
- `brand-silver/60` — Muted secondary text
- `black/40` — Card backgrounds, overlays

---

## Typography

### Font Families

| Role       | Font Stack                                      | Purpose                        |
|------------|------------------------------------------------|--------------------------------|
| `heading`  | `'Cinzel', serif`                              | All headings (h1-h6)           |
| `subtitle` | `'Montserrat', 'Helvetica Neue', sans-serif`   | Subtitles, labels              |
| `body`     | `'Roboto Condensed', sans-serif`               | Body text, paragraphs          |
| `accent`   | `'Engravers Old English BT', 'Old London'`     | Decorative, medieval accents   |
| `accent-cursive` | `'Ballet', cursive`                       | Flourishes, signatures         |
| `mono`     | `'IBM Plex Mono', monospace`                   | Code, technical content        |

### Google Fonts Import

```html
Cinzel:wght@400;500;600;700
Montserrat:wght@400;500;600
Roboto Condensed:wght@400;500
```

### Typography Scale

**Headings** use Cinzel with:
- `font-weight: 600`
- `line-height: 1.2`
- `letter-spacing: 0.02em`
- Color: `brand-ivory` (default) or `brand-crimson` (accent)

**Body text** uses Roboto Condensed with:
- `line-height: 1.6`
- `letter-spacing: 0.01em`
- Color: `brand-silver`

### Responsive Font Sizing

```css
html { font-size: 16px; }

@media (min-width: 768px) {
  html { font-size: 17px; }
}

@media (min-width: 1024px) {
  html { font-size: 18px; }
}
```

### Heading Size Classes

| Size           | Desktop     | Mobile      |
|----------------|-------------|-------------|
| Hero H1        | `text-6xl`  | `text-4xl`  |
| Page H1        | `text-5xl`  | `text-3xl`  |
| Section H2     | `text-2xl`  | `text-xl`   |
| Card H3        | `text-lg`   | `text-base` |
| Label H4       | `text-base` | `text-sm`   |

---

## Layout System

### Container

```css
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}
```

Tailwind usage: `container mx-auto px-4`

### Content Width Constraints

| Context      | Max Width       | Usage                          |
|--------------|-----------------|--------------------------------|
| Full content | `max-w-4xl`     | Standard pages (WTM, Quiz)     |
| Narrow       | `max-w-3xl`     | Profile pages                  |
| Single col   | `max-w-lg`      | Focused forms, CTAs            |
| Cards        | `max-w-xl`      | Centered CTA blocks            |
| Module       | `max-w-md`      | Quiz/assessment panels         |

### Section Padding

```css
.section {
  padding: 2.5rem 1.25rem;
}

@media (min-width: 768px) {
  .section {
    padding: 3.5rem 2rem;
  }
}
```

### Grid Patterns

**Feature Cards (3-column)**
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
```

**Profile Cards (6-column responsive)**
```html
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
```

**Two-column comparison**
```html
<div class="grid md:grid-cols-2 gap-5">
```

**Info grid (2x3)**
```html
<div class="grid grid-cols-2 md:grid-cols-3 gap-5">
```

---

## Component Patterns

### Cards

**Standard Card**
```html
<article class="bg-brand-black/40 border border-white/5 p-6">
  <h3 class="text-lg font-heading text-brand-crimson mb-3">Title</h3>
  <p class="text-base text-brand-silver mb-3">Description</p>
</article>
```

**Highlighted Card** (with crimson border)
```html
<article class="bg-brand-black border border-brand-crimson/30 p-6">
```

**CTA Card**
```html
<aside class="bg-brand-black border border-white/10 p-8 text-center">
  <h3 class="text-xl font-heading text-brand-ivory mb-3">Title</h3>
  <p class="text-base text-brand-silver mb-6">Description</p>
  <!-- Button -->
</aside>
```

**Profile Card**
- Aspect ratio: `3:4`
- Image with gradient overlay: `bg-gradient-to-t from-black via-black/50 to-transparent`
- Hover: `scale-105` on image, `border-brand-crimson/50`

### Buttons

**Variants**

| Variant     | Base State                                          | Hover State                                 |
|-------------|-----------------------------------------------------|---------------------------------------------|
| `primary`   | `bg-brand-crimson text-white border-brand-crimson`  | `bg-transparent text-brand-crimson`         |
| `secondary` | `bg-transparent text-brand-crimson border-crimson`  | `bg-brand-crimson text-white`               |
| `ghost`     | `bg-transparent text-brand-silver`                  | `text-brand-ivory`                          |
| `tertiary`  | `text-brand-silver/60`                              | `text-brand-ivory bg-brand-silver/10`       |

**Sizes**

| Size | Padding           | Font Size  |
|------|-------------------|------------|
| `sm` | `px-4 py-2.5`     | `text-sm`  |
| `md` | `px-6 py-3`       | `text-base`|
| `lg` | `px-8 py-3.5`     | `text-lg`  |

**Disabled State**
```
opacity-50 cursor-not-allowed
```

### Links

```css
a {
  color: var(--brand-crimson);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--brand-ivory);
}
```

Arrow links: `Text →`

### Hero Sections

```html
<section 
  class="hero min-h-[70vh]"
  style="background-image: url('/img/image.jpeg');"
>
  <div class="hero-content">
    <h1 class="text-4xl sm:text-5xl md:text-6xl text-brand-crimson mb-4 uppercase tracking-wider">
      Title
    </h1>
    <p class="text-base sm:text-lg text-brand-ivory/90 font-medium max-w-md mx-auto">
      Subtitle
    </p>
  </div>
</section>
```

**Hero Overlay Gradient**
```css
.hero::before {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(26, 26, 26, 1) 100%
  );
}
```

---

## Header & Navigation

### Header Structure

- Sticky: `sticky top-0 z-50`
- Background: `bg-brand-charcoal/95 backdrop-blur-sm`
- Border: `border-b border-white/5`
- Height: `h-14`

### Logo

```html
<a href="/" class="text-base font-heading font-semibold text-brand-ivory tracking-wide">
  MCX
</a>
```

### Navigation Links

**Desktop**
```html
<a href="/page" class="text-sm text-brand-silver hover:text-brand-ivory transition-colors">
  Link
</a>
```

**CTA Link** (highlighted)
```html
<a href="/quiz" class="text-sm font-medium text-brand-crimson hover:text-brand-ivory transition-colors">
  Find Your Type
</a>
```

### Dropdown Menu

```html
<div class="invisible group-hover:visible opacity-0 group-hover:opacity-100 
            absolute top-full left-0 mt-1 w-40 
            bg-brand-charcoal border border-white/10 rounded shadow-xl 
            transition-all duration-150">
```

### Mobile Menu

- Toggle: `md:hidden`
- Border: `border-t border-white/5`
- Subsections use `border-l border-white/10` for visual hierarchy

---

## Footer

```html
<footer class="bg-brand-black border-t border-white/5">
  <div class="container mx-auto px-4 py-8">
    <!-- Disclaimer: text-xs text-brand-silver/60 -->
    <!-- Copyright: text-xs text-brand-silver/40 -->
  </div>
</footer>
```

---

## Interactive Module (Quiz)

### Module Container

```html
<div class="min-h-screen bg-[#1a1a1a] flex flex-col">
  <!-- Progress bar -->
  <div class="w-full bg-black h-1">
    <div class="bg-[#DC3545] h-1 transition-all" style="width: X%" />
  </div>
  <!-- Content centered -->
  <div class="flex-1 flex items-center justify-center px-4 py-6">
    <div class="w-full max-w-md">
```

### Panel Cards

```html
<div class="bg-black/40 border border-white/10 p-5">
```

### Selection Buttons

```html
<button class="w-full p-4 text-left border transition-all 
               border-white/10 bg-black/30 hover:border-[#DC3545]/50">
  <!-- Selected state -->
  <!-- border-[#DC3545] bg-[#DC3545]/20 -->
</button>
```

### Likert Scale

- Compact buttons in a row: `flex gap-1`
- Labels at ends: `justify-between text-xs text-[#9A9A9A]/60`

### Dot Indicator (Progress)

```html
<div class="flex justify-center gap-2 my-4">
  <div class="w-2 h-2 rounded-full bg-[#DC3545]" /> <!-- Current -->
  <div class="w-2 h-2 rounded-full bg-[#9A9A9A]/30" /> <!-- Inactive -->
</div>
```

### Modal

```html
<div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
  <div class="bg-[#1a1a1a] border border-[#DC3545]/30 p-5 max-w-xs w-full">
```

---

## Forms

### Text Input

```html
<input
  type="email"
  class="w-full px-4 py-2.5 text-sm 
         bg-brand-charcoal border border-white/10 
         text-brand-ivory placeholder-brand-silver/50 
         focus:outline-none focus:border-brand-crimson/50"
/>
```

### Submit Button (Full Width)

```html
<button type="submit" 
        class="w-full px-4 py-2.5 text-sm font-medium 
               bg-brand-crimson text-white border border-brand-crimson 
               hover:bg-transparent hover:text-brand-crimson transition-colors">
  Submit
</button>
```

---

## Semantic Patterns

### Best/Worst Cards (Profile Pages)

**Positive (Best)**
```html
<div class="bg-green-900/20 border border-green-700/30 p-5">
  <h3 class="text-sm font-heading text-green-400 mb-2">At His Best</h3>
</div>
```

**Negative (Worst)**
```html
<div class="bg-red-900/20 border border-red-700/30 p-5">
  <h3 class="text-sm font-heading text-brand-crimson mb-2">At His Worst</h3>
</div>
```

### List Items

**Bullet points**
```html
<li class="text-xs text-brand-silver flex items-start gap-2">
  <span class="text-green-500">•</span>
  <span>Text</span>
</li>
```

### Tags/Badges

```html
<span class="text-xs uppercase tracking-wide text-brand-crimson 
             border border-brand-crimson/30 px-2 py-1">
  Recommended
</span>
```

---

## Transitions & Animation

### Default Transition

```css
transition-all duration-200
```

### Hover Scales

- Image zoom: `group-hover:scale-105 transition-transform duration-300`

### Color Transitions

```css
transition-colors
```

Used on: links, buttons, navigation items

---

## Responsive Breakpoints

Following Tailwind defaults:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

### Mobile-First Patterns

```html
<!-- Stacked on mobile, row on tablet+ -->
<div class="flex flex-col sm:flex-row gap-4">

<!-- Single column, then multi-column -->
<div class="grid grid-cols-1 md:grid-cols-3">

<!-- Responsive text sizing -->
<h1 class="text-3xl sm:text-4xl md:text-5xl">
```

---

## Image Handling

### Profile Images

- Circular avatar: `rounded-full overflow-hidden border-2 border-brand-crimson/40`
- Card images: `object-cover`, lazy loaded

### Background Images

- Hero sections: inline `style="background-image: url(...)"`
- Overlay gradient always applied via `::before` pseudo-element

### Lazy Loading

```html
<img loading="lazy" />
```

---

## Accessibility

### Focus States

- Buttons rely on browser defaults with color transitions
- Inputs: `focus:outline-none focus:border-brand-crimson/50`

### Screen Reader Support

- `sr-only` class for label hiding with screen reader access
- `aria-label` on icon buttons
- `aria-labelledby` for section headings
- Semantic HTML: `<article>`, `<section>`, `<aside>`, `<nav>`

### Skip Links

Navigation uses semantic structure with proper heading hierarchy.

---

## Dark Theme Considerations

This site is **dark-only**. There is no light theme. All colors, contrasts, and design decisions are optimized for dark backgrounds.

### Contrast Ratios

- Primary text (`brand-ivory` on `brand-charcoal`): ~11:1
- Secondary text (`brand-silver` on `brand-charcoal`): ~5.5:1
- Accent (`brand-crimson` on `brand-charcoal`): ~4.5:1

---

## File Structure

```
src/
├── components/
│   ├── Button.astro          # Astro button variants
│   ├── ButtonLink.astro      # Link styled as button
│   ├── Footer.astro
│   ├── Header.astro
│   ├── ProfileCard.astro
│   ├── SEO.astro
│   └── react/
│       ├── Button.tsx        # React button (same styles)
│       └── ModuleApp.tsx     # Quiz/assessment module
├── layouts/
│   ├── BaseLayout.astro      # HTML wrapper, global styles
│   └── MainLayout.astro      # Header + Footer wrapper
└── styles/                   # (Empty - Tailwind only)
```

---

## Tailwind Configuration

### Extended Theme

```javascript
theme: {
  extend: {
    colors: { brand: {...} },
    fontFamily: {
      heading: ['Cinzel', 'serif'],
      subtitle: ['Montserrat', 'Helvetica Neue', 'sans-serif'],
      accent: ['Engravers Old English BT', 'Old London', 'serif'],
      'accent-cursive': ['Ballet', 'cursive'],
      body: ['Roboto Condensed', 'sans-serif'],
      mono: ['IBM Plex Mono', 'monospace'],
    },
    backgroundColor: {...},
    textColor: {...},
  },
}
```

---

## Quick Reference

### Most Used Classes

**Backgrounds**
- `bg-brand-charcoal` — Page background
- `bg-brand-black` — Deep sections
- `bg-brand-black/40` — Card background
- `bg-brand-crimson` — Primary buttons

**Text**
- `text-brand-ivory` — Primary headings
- `text-brand-silver` — Body text
- `text-brand-crimson` — Accent headings, links

**Borders**
- `border border-white/5` — Subtle dividers
- `border border-white/10` — Card borders
- `border border-brand-crimson/30` — Highlighted borders

**Typography**
- `font-heading` — Cinzel for headings
- `uppercase tracking-wider` — Hero titles
- `text-sm text-brand-silver` — Body paragraphs

---

## Summary

The MCX design language creates a cohesive, commanding aesthetic through:

1. **A restrained, dark color palette** with crimson as the singular accent
2. **Classical typography** (Cinzel for authority, Roboto Condensed for readability)
3. **Generous spacing** with consistent padding/margin patterns
4. **Card-based layouts** with subtle borders and overlays
5. **Hero sections** with dramatic imagery and gradient overlays
6. **Minimal animation** focused on hover states and transitions
7. **Mobile-first responsive design** scaling elegantly to desktop

The result is a digital environment that feels like walking into a military chapel or philosophical academy—serious, purposeful, and designed for men seeking mastery.

