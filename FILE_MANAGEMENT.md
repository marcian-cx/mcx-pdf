# File Management Guide

## Overview
Your MCX PDF Styler now has persistent file storage that saves documents to the codebase.

## Getting Started

### Start the Application
```bash
npm start
```

This starts both the backend server (port 3001) and Vite dev server (port 5173).

Or start them separately:
```bash
npm run server  # Backend on port 3001
npm run dev     # Frontend on port 5173
```

## Features

### Create New Document
1. Click **"New"** button in the header
2. Enter a filename (without .md extension)
3. Start writing

### Save Document
- Click **"Save"** button to manually save
- Auto-saves every 30 seconds (except for "untitled.md")

### Load Existing Document
1. Click the filename dropdown (shows current file)
2. Select any saved document from the list
3. Document and images will load

### Delete Document
- Click the **×** button next to any file in the dropdown
- Confirm deletion

## File Storage

All documents are saved in:
```
/documents/
  - your-document.md
  - your-document.images.json
```

The `documents/` folder is gitignored by default.

## Notes

- Images are saved as base64 in `.images.json` files alongside markdown
- Documents auto-save every 30 seconds when named
- "untitled.md" won't auto-save (create a new named document first)

