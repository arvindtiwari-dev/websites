# 🤖 Web Development Coding Agent

> A token-efficient AI coding agent supporting HTML, PHP, React, jQuery, and any UI library.  
> Uses **patch mode** by default — only changed lines are sent, minimizing token usage.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Supported Technologies](#supported-technologies)
- [Agent Architecture](#agent-architecture)
- [Token Optimization Strategy](#token-optimization-strategy)
- [System Prompt](#system-prompt)
- [Agent Core (JavaScript)](#agent-core-javascript)
- [Patch Engine](#patch-engine)
- [Language Handlers](#language-handlers)
  - [HTML Handler](#html-handler)
  - [PHP Handler](#php-handler)
  - [React Handler](#react-handler)
  - [jQuery Handler](#jquery-handler)
  - [UI Library Handler](#ui-library-handler)
- [Context Manager](#context-manager)
- [Usage Examples](#usage-examples)
- [API Integration](#api-integration)
- [Configuration](#configuration)

---

## Overview

This agent is designed to write, edit, and refactor code across all major web technologies while using the **minimum number of tokens possible**. Instead of sending entire files on every request, it uses a **diff-patch system** that sends only changed lines to the AI.

```
User Request → Context Analyzer → Patch Builder → AI (minimal tokens) → Apply Patch → Output
```

**Token savings:** A 500-line file in full mode = ~7,500 tokens. A 3-line patch = ~45 tokens. **99% reduction.**

---

## Supported Technologies

| Technology     | File Extensions         | Mode           | Notes                          |
|----------------|-------------------------|----------------|--------------------------------|
| HTML5          | `.html`, `.htm`         | Patch / Full   | Semantic, accessible markup    |
| PHP 8+         | `.php`                  | Patch / Full   | PSR-12 compliant output        |
| React          | `.jsx`, `.tsx`, `.js`   | Patch / Full   | Hooks, context, functional     |
| jQuery         | `.js`                   | Patch / Full   | v3.x compatible                |
| Tailwind CSS   | `.html`, `.jsx`         | Patch / Full   | Utility-first classes          |
| Bootstrap 5    | `.html`, `.php`         | Patch / Full   | Component-based                |
| Vue.js 3       | `.vue`                  | Patch / Full   | Composition API                |
| Alpine.js      | `.html`                 | Patch / Full   | Lightweight reactivity         |
| SASS/SCSS      | `.scss`, `.sass`        | Patch / Full   | Nested, variables, mixins      |
| TypeScript     | `.ts`, `.tsx`           | Patch / Full   | Strict mode                    |

---

## Agent Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    WEB DEV AGENT                        │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  File Store  │    │   Context    │                  │
│  │  (in-memory) │    │   Manager    │                  │
│  └──────┬───────┘    └──────┬───────┘                  │
│         │                   │                           │
│  ┌──────▼───────────────────▼───────┐                  │
│  │         Patch Engine             │                  │
│  │  diff → minimal context → patch  │                  │
│  └──────────────┬───────────────────┘                  │
│                 │                                        │
│  ┌──────────────▼───────────────────┐                  │
│  │       Language Detector          │                  │
│  │  HTML / PHP / React / jQuery     │                  │
│  └──────────────┬───────────────────┘                  │
│                 │                                        │
│  ┌──────────────▼───────────────────┐                  │
│  │       Anthropic API              │                  │
│  │  claude-sonnet-4-20250514        │                  │
│  └──────────────┬───────────────────┘                  │
│                 │                                        │
│  ┌──────────────▼───────────────────┐                  │
│  │       Patch Applier              │                  │
│  │  apply diff → update file store  │                  │
│  └──────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

---

## Token Optimization Strategy

### Mode 1: Patch Mode (Default — Minimum Tokens)

Only the **changed lines + 3 lines of context** are sent to the AI.

```
SEND:  filename + line range + patch instructions
AVOID: sending entire file content
SAVE:  up to 99% of tokens on large files
```

**Patch request format sent to AI:**
```
File: index.html (328 lines total)
Task: Change hero title text
Context (lines 10-14):
  <header class="hero">
→   <h1>Welcome</h1>        ← target line
    <p>Subtitle here</p>
    <button>CTA</button>
  </header>
Instruction: Replace the h1 text with "Launch Fast"
```

### Mode 2: Section Mode (Medium Tokens)

Send only the **relevant function/component/block** — not the whole file.

```
SEND:  function or component block (~20-80 lines)
AVOID: unrelated code
SAVE:  60-85% of tokens
```

### Mode 3: Full Mode (Maximum Context)

Send the entire file. Use only when:
- Doing a full refactor
- First-time analysis
- Cross-file dependencies need resolution

---

## System Prompt

Save this as your agent's system prompt. Paste into your API call's `system` field.

```
You are an expert web development coding agent. You write clean, production-quality code for HTML, PHP, React, jQuery, Vue, Alpine.js, Tailwind CSS, Bootstrap, SCSS, and TypeScript.

PATCH MODE (default):
- You will receive: filename, total line count, a small code snippet with line numbers, and an instruction.
- Respond ONLY with a unified diff patch. Nothing else.
- Format: standard unified diff (--- a/file, +++ b/file, @@ hunk header, - removed, + added, context lines)
- Keep context lines to 3 per hunk.
- Do NOT include any explanation, markdown, or prose.
- If no change is needed, respond with: NO_CHANGE

FULL MODE:
- You will receive: filename, full file content, and an instruction.
- Respond with the complete updated file content, no markdown fences.
- Preserve all formatting, indentation, and comments unless instructed otherwise.

CODING STANDARDS:
- HTML: semantic HTML5, ARIA labels, BEM class naming
- PHP: PSR-12, type hints, null coalescing, arrow functions (PHP 8+)
- React: functional components only, hooks, no class components, TypeScript-friendly
- jQuery: use $(document).ready, prefer $.ajax over $.get for control
- CSS/SCSS: mobile-first, CSS custom properties, BEM naming
- All code must be accessible (WCAG 2.1 AA)
- Prefer modern APIs: fetch over XMLHttpRequest, const/let over var

NEVER:
- Add TODO comments unless asked
- Change unrelated code
- Add unsolicited console.log statements
- Modify indentation style of unchanged lines
- Include backtick code fences in PATCH MODE responses
```

---

## Agent Core (JavaScript)

```javascript
// agent.js — Web Development Coding Agent Core
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import { detectLanguage } from "./language-detector.js";
import { PatchEngine } from "./patch-engine.js";
import { ContextManager } from "./context-manager.js";

const client = new Anthropic();

export class WebDevAgent {
  constructor(config = {}) {
    this.model = "claude-sonnet-4-20250514";
    this.maxTokens = 1000;
    this.mode = config.mode || "patch"; // 'patch' | 'section' | 'full'
    this.fileStore = new Map(); // filename → content
    this.patchEngine = new PatchEngine();
    this.contextManager = new ContextManager();
    this.systemPrompt = config.systemPrompt || DEFAULT_SYSTEM_PROMPT;
  }

  // ─── Load a file into the agent's store ───────────────────────────────
  async loadFile(filePath) {
    const content = await fs.readFile(filePath, "utf-8");
    const name = path.basename(filePath);
    this.fileStore.set(name, {
      content,
      lines: content.split("\n"),
      language: detectLanguage(name),
      path: filePath,
    });
    return name;
  }

  // ─── Main entry: edit a file based on natural language instruction ─────
  async edit(fileName, instruction) {
    const file = this.fileStore.get(fileName);
    if (!file) throw new Error(`File "${fileName}" not loaded. Call loadFile() first.`);

    const tokens = this.estimateTokens(file.content);
    console.log(`[Agent] Mode: ${this.mode} | File: ${fileName} | Lines: ${file.lines.length} | Est. tokens: ${tokens}`);

    let userMessage;
    if (this.mode === "patch") {
      userMessage = this.buildPatchRequest(fileName, file, instruction);
    } else if (this.mode === "section") {
      userMessage = this.buildSectionRequest(fileName, file, instruction);
    } else {
      userMessage = this.buildFullRequest(fileName, file, instruction);
    }

    const response = await client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: this.systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = response.content[0].text.trim();
    if (raw === "NO_CHANGE") {
      console.log("[Agent] No changes needed.");
      return { changed: false, file: fileName };
    }

    const updated = this.mode === "full"
      ? raw
      : this.patchEngine.apply(file.content, raw);

    this.fileStore.set(fileName, {
      ...file,
      content: updated,
      lines: updated.split("\n"),
    });

    console.log(`[Agent] Applied changes to ${fileName}`);
    return { changed: true, file: fileName, patch: raw, content: updated };
  }

  // ─── Build minimal patch-mode request ──────────────────────────────────
  buildPatchRequest(fileName, file, instruction) {
    const relevant = this.contextManager.findRelevantLines(file.lines, instruction);
    const snippet = relevant.lines
      .map((line, i) => `${relevant.start + i + 1}: ${line}`)
      .join("\n");

    return [
      `File: ${fileName} (${file.lines.length} lines total, ${file.language})`,
      `Task: ${instruction}`,
      ``,
      `Relevant context (lines ${relevant.start + 1}–${relevant.end + 1}):`,
      snippet,
      ``,
      `Respond with unified diff patch only. No prose.`,
    ].join("\n");
  }

  // ─── Build section-mode request (function/component scope) ─────────────
  buildSectionRequest(fileName, file, instruction) {
    const section = this.contextManager.findSection(file.lines, instruction, file.language);
    const snippet = section.lines
      .map((line, i) => `${section.start + i + 1}: ${line}`)
      .join("\n");

    return [
      `File: ${fileName} (${file.language})`,
      `Task: ${instruction}`,
      ``,
      `Section to modify (lines ${section.start + 1}–${section.end + 1}):`,
      snippet,
      ``,
      `Respond with unified diff patch only. No prose.`,
    ].join("\n");
  }

  // ─── Build full-file request ────────────────────────────────────────────
  buildFullRequest(fileName, file, instruction) {
    return [
      `File: ${fileName} (${file.language})`,
      `Task: ${instruction}`,
      ``,
      `Full file content:`,
      file.content,
      ``,
      `Respond with the complete updated file. No markdown fences.`,
    ].join("\n");
  }

  // ─── Save updated file back to disk ────────────────────────────────────
  async saveFile(fileName, outputPath) {
    const file = this.fileStore.get(fileName);
    if (!file) throw new Error(`File "${fileName}" not in store.`);
    const dest = outputPath || file.path;
    await fs.writeFile(dest, file.content, "utf-8");
    console.log(`[Agent] Saved: ${dest}`);
  }

  // ─── Rough token estimator (4 chars ≈ 1 token) ─────────────────────────
  estimateTokens(content) {
    return Math.ceil(content.length / 4);
  }

  // ─── Switch mode at runtime ─────────────────────────────────────────────
  setMode(mode) {
    if (!["patch", "section", "full"].includes(mode)) throw new Error("Invalid mode");
    this.mode = mode;
    console.log(`[Agent] Mode switched to: ${mode}`);
  }
}
```

---

## Patch Engine

```javascript
// patch-engine.js — Apply unified diffs to file content

export class PatchEngine {
  // Apply a unified diff string to original content
  apply(original, diffText) {
    const lines = original.split("\n");
    const hunks = this.parseHunks(diffText);

    // Apply hunks in reverse order to preserve line numbers
    for (const hunk of hunks.reverse()) {
      this.applyHunk(lines, hunk);
    }

    return lines.join("\n");
  }

  parseHunks(diffText) {
    const hunks = [];
    let current = null;

    for (const line of diffText.split("\n")) {
      if (line.startsWith("@@")) {
        // @@ -oldStart,oldCount +newStart,newCount @@
        const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (match) {
          if (current) hunks.push(current);
          current = {
            oldStart: parseInt(match[1]) - 1, // 0-indexed
            oldCount: parseInt(match[2] ?? 1),
            newStart: parseInt(match[3]) - 1,
            newCount: parseInt(match[4] ?? 1),
            lines: [],
          };
        }
      } else if (current && (line.startsWith("+") || line.startsWith("-") || line.startsWith(" "))) {
        current.lines.push(line);
      }
    }

    if (current) hunks.push(current);
    return hunks;
  }

  applyHunk(lines, hunk) {
    const { oldStart, oldCount, lines: hunkLines } = hunk;
    const newLines = [];

    for (const hl of hunkLines) {
      if (hl.startsWith("+")) newLines.push(hl.slice(1));
      else if (hl.startsWith(" ")) newLines.push(hl.slice(1));
      // '-' lines are dropped (deleted)
    }

    lines.splice(oldStart, oldCount, ...newLines);
  }

  // Generate a diff between two strings (for preview)
  diff(original, updated, fileName = "file") {
    const a = original.split("\n");
    const b = updated.split("\n");
    const hunks = [];
    // Simplified: find changed regions
    let i = 0;
    while (i < Math.max(a.length, b.length)) {
      if (a[i] !== b[i]) {
        const start = Math.max(0, i - 3);
        const hunkLines = [];
        while (i < b.length && (a[i] !== b[i] || (a[i + 1] !== b[i + 1] && i < b.length - 1))) {
          if (a[i] !== undefined && a[i] !== b[i]) hunkLines.push(`-${a[i]}`);
          if (b[i] !== undefined) hunkLines.push(`+${b[i]}`);
          i++;
        }
        if (hunkLines.length) {
          hunks.push(`@@ -${start + 1} +${start + 1} @@\n${hunkLines.join("\n")}`);
        }
      }
      i++;
    }
    return `--- a/${fileName}\n+++ b/${fileName}\n${hunks.join("\n")}`;
  }
}
```

---

## Language Handlers

### HTML Handler

```javascript
// handlers/html-handler.js
export const htmlHandler = {
  language: "html",
  extensions: [".html", ".htm"],

  // Build HTML-specific context for AI
  buildContext(lines, instruction) {
    const lower = instruction.toLowerCase();

    // Map common intent words to HTML selectors
    const selectorMap = {
      "hero|header|banner": (l) => l.includes("hero") || l.includes("<header"),
      "nav|navigation|menu": (l) => l.includes("<nav") || l.includes("navbar"),
      "footer": (l) => l.includes("<footer"),
      "button|cta|link": (l) => l.includes("<button") || l.includes("<a "),
      "form|input|field": (l) => l.includes("<form") || l.includes("<input"),
      "card|grid|section": (l) => l.includes("card") || l.includes("<section"),
      "title|heading|h1|h2": (l) => l.match(/<h[1-6]/),
      "image|img|picture": (l) => l.includes("<img") || l.includes("<picture"),
    };

    for (const [pattern, matcher] of Object.entries(selectorMap)) {
      if (new RegExp(pattern).test(lower)) {
        const idx = lines.findIndex(matcher);
        if (idx !== -1) return { start: Math.max(0, idx - 2), end: Math.min(lines.length, idx + 10) };
      }
    }
    return null; // fallback to full search
  },

  // Validate generated HTML snippet
  validate(code) {
    const openTags = (code.match(/<[a-z][^/]*>/gi) || []).length;
    const closeTags = (code.match(/<\/[a-z]+>/gi) || []).length;
    const selfClose = ["img", "input", "br", "hr", "meta", "link"];
    return { valid: true, warnings: [] }; // extend with real parser if needed
  },

  // Standard HTML boilerplate
  boilerplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page Title</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- content here -->
  <script src="app.js"><\/script>
</body>
</html>`,
};
```

### PHP Handler

```javascript
// handlers/php-handler.js
export const phpHandler = {
  language: "php",
  extensions: [".php"],

  buildContext(lines, instruction) {
    const lower = instruction.toLowerCase();

    const patterns = {
      "function|method": (l) => l.match(/function\s+\w+/),
      "class": (l) => l.match(/^class\s+/),
      "route|endpoint": (l) => l.match(/Route::|->get|->post/),
      "query|sql|database": (l) => l.match(/\$pdo|mysqli|->query|SELECT/i),
      "session|auth|login": (l) => l.match(/session_start|\$_SESSION|\$_POST/),
      "if|condition|check": (l) => l.match(/^\s*(if|elseif|else)\s*[\({]/),
    };

    for (const [pattern, matcher] of Object.entries(patterns)) {
      if (new RegExp(pattern).test(lower)) {
        const idx = lines.findIndex(matcher);
        if (idx !== -1) {
          // Find end of function/block
          let depth = 0, end = idx;
          for (let i = idx; i < lines.length; i++) {
            depth += (lines[i].match(/\{/g) || []).length;
            depth -= (lines[i].match(/\}/g) || []).length;
            end = i;
            if (i > idx && depth === 0) break;
          }
          return { start: Math.max(0, idx - 1), end: Math.min(lines.length, end + 2) };
        }
      }
    }
    return null;
  },

  boilerplate: `<?php
declare(strict_types=1);

namespace App;

class Example
{
    public function __construct(
        private readonly string $name
    ) {}

    public function run(): void
    {
        echo "Hello, {$this->name}!";
    }
}`,
};
```

### React Handler

```javascript
// handlers/react-handler.js
export const reactHandler = {
  language: "react",
  extensions: [".jsx", ".tsx"],

  buildContext(lines, instruction) {
    const lower = instruction.toLowerCase();

    const patterns = {
      "state|usestate|hook": (l) => l.match(/useState|useReducer|useRef/),
      "effect|useeffect": (l) => l.match(/useEffect/),
      "return|render|jsx": (l) => l.match(/^\s+return\s*\(/),
      "prop|interface|type": (l) => l.match(/interface\s+|type\s+\w+\s*=/),
      "button|click|handler": (l) => l.match(/onClick|<button/),
      "form|submit|input": (l) => l.match(/onSubmit|<form|<input/),
      "fetch|api|data": (l) => l.match(/fetch\(|axios\.|useQuery/),
      "context|provider": (l) => l.match(/createContext|useContext|Provider/),
    };

    for (const [pattern, matcher] of Object.entries(patterns)) {
      if (new RegExp(pattern).test(lower)) {
        const idx = lines.findIndex(matcher);
        if (idx !== -1) return { start: Math.max(0, idx - 3), end: Math.min(lines.length, idx + 15) };
      }
    }
    return null;
  },

  boilerplate: `import React, { useState, useEffect } from 'react';

interface Props {
  title?: string;
}

export default function Component({ title = 'Default' }: Props) {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    // fetch data here
  }, []);

  return (
    <div className="component">
      <h1>{title}</h1>
      {data && <p>{data}</p>}
    </div>
  );
}`,
};
```

### jQuery Handler

```javascript
// handlers/jquery-handler.js
export const jqueryHandler = {
  language: "javascript",
  extensions: [".js"],

  buildContext(lines, instruction) {
    const lower = instruction.toLowerCase();

    const patterns = {
      "click|button|event": (l) => l.match(/\.on\(|\.click\(|\.trigger\(/),
      "ajax|fetch|request": (l) => l.match(/\$\.ajax|\.ajax\(|\.get\(|\.post\(/),
      "dom|element|selector": (l) => l.match(/\$\(['"`]/),
      "animation|fade|slide": (l) => l.match(/\.fadeIn|\.slideDown|\.animate\(/),
      "form|submit|validate": (l) => l.match(/\.submit\(|serializeArray|\.val\(/),
      "ready|init": (l) => l.match(/\$\(document\)|\.ready\(/),
    };

    for (const [pattern, matcher] of Object.entries(patterns)) {
      if (new RegExp(pattern).test(lower)) {
        const idx = lines.findIndex(matcher);
        if (idx !== -1) return { start: Math.max(0, idx - 2), end: Math.min(lines.length, idx + 12) };
      }
    }
    return null;
  },

  boilerplate: `$(document).ready(function () {
  'use strict';

  // DOM references
  const $btn = $('#submit-btn');
  const $form = $('#main-form');

  // Event handlers
  $btn.on('click', function (e) {
    e.preventDefault();
    handleSubmit();
  });

  function handleSubmit() {
    $.ajax({
      url: '/api/endpoint',
      method: 'POST',
      data: $form.serialize(),
      success: function (response) {
        console.log('Success:', response);
      },
      error: function (xhr) {
        console.error('Error:', xhr.statusText);
      },
    });
  }
});`,
};
```

### UI Library Handler

```javascript
// handlers/ui-library-handler.js

// Detect which UI library is in use
export function detectUILibrary(content) {
  const checks = [
    { name: "tailwind",   pattern: /class="[^"]*(?:flex|grid|text-|bg-|p-|m-)[^"]*"/ },
    { name: "bootstrap",  pattern: /class="[^"]*(?:btn|container|row|col-|navbar)[^"]*"/ },
    { name: "material",   pattern: /@mui\/|MuiButton|<Button variant=/ },
    { name: "shadcn",     pattern: /@\/components\/ui\/|from "lucide-react"/ },
    { name: "chakra",     pattern: /@chakra-ui|<Box|<Stack|<Button colorScheme/ },
    { name: "ant-design", pattern: /from 'antd'|import \{.*\} from 'antd'/ },
    { name: "daisyui",    pattern: /class="[^"]*(?:btn|card|badge|alert|modal)[^"]*"/ },
    { name: "bulma",      pattern: /class="[^"]*(?:is-primary|column|hero|navbar)[^"]*"/ },
    { name: "alpine",     pattern: /x-data=|x-bind:|x-on:|@click=/ },
    { name: "vue",        pattern: /v-bind:|v-on:|v-model|<template>/ },
  ];

  for (const { name, pattern } of checks) {
    if (pattern.test(content)) return name;
  }
  return "vanilla";
}

// Library-specific instructions appended to system prompt
export const libraryInstructions = {
  tailwind: "Use Tailwind CSS utility classes. Prefer responsive prefixes (sm:, md:, lg:). Use dark: variants for dark mode.",
  bootstrap: "Use Bootstrap 5 classes. Prefer utility classes over custom CSS. Use component classes correctly.",
  material: "Use MUI v5 components. Use sx prop for styling. Prefer theme tokens over hardcoded values.",
  shadcn: "Use shadcn/ui components. Import from @/components/ui/. Use cn() for conditional classes.",
  chakra: "Use Chakra UI v2. Use ChakraProvider at root. Use theme tokens and responsive syntax.",
  "ant-design": "Use Ant Design v5. Import individual components. Use Space and Row/Col for layout.",
  daisyui: "Use DaisyUI classes on top of Tailwind. Keep class names semantic (btn, card, etc.).",
  bulma: "Use Bulma classes. Use Columns system for layout. Keep markup clean.",
  alpine: "Use Alpine.js directives (x-data, x-bind, @click). Keep logic close to markup.",
  vue: "Use Vue 3 Composition API. Use <script setup>. Use reactive() and ref().",
  vanilla: "Write plain CSS and JavaScript. No framework assumptions.",
};
```

---

## Context Manager

```javascript
// context-manager.js — Find the right lines to send (minimize tokens)

export class ContextManager {
  constructor(config = {}) {
    this.contextLines = config.contextLines || 3;   // lines of context around changes
    this.maxSectionLines = config.maxSectionLines || 80; // max lines in section mode
  }

  // Find lines most relevant to the instruction
  findRelevantLines(lines, instruction) {
    const keywords = this.extractKeywords(instruction);
    let bestIdx = -1;
    let bestScore = 0;

    lines.forEach((line, i) => {
      const score = keywords.reduce((acc, kw) => {
        return acc + (line.toLowerCase().includes(kw) ? 1 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    });

    if (bestIdx === -1) bestIdx = 0;

    const start = Math.max(0, bestIdx - this.contextLines);
    const end = Math.min(lines.length - 1, bestIdx + this.contextLines + 5);

    return { start, end, lines: lines.slice(start, end + 1) };
  }

  // Find a complete block (function, component, class)
  findSection(lines, instruction, language) {
    const keywords = this.extractKeywords(instruction);

    // Find anchor line
    let anchorIdx = lines.findIndex((line) => {
      const low = line.toLowerCase();
      return keywords.some((kw) => low.includes(kw));
    });

    if (anchorIdx === -1) return this.findRelevantLines(lines, instruction);

    // Walk back to block start
    let start = anchorIdx;
    const blockStarts = {
      react: /^(export\s+)?(default\s+)?function\s+|^const\s+\w+\s*=\s*(\(|async)/,
      php: /function\s+\w+|^class\s+/,
      javascript: /function\s+\w+|const\s+\w+\s*=\s*function|\$\.fn\./,
      html: /<(section|div|header|footer|nav|main|article)/,
    };

    const pattern = blockStarts[language] || blockStarts.javascript;
    for (let i = anchorIdx; i >= 0; i--) {
      if (pattern.test(lines[i])) { start = i; break; }
    }

    // Walk forward to block end (brace matching)
    let depth = 0, end = start;
    for (let i = start; i < lines.length; i++) {
      depth += (lines[i].match(/[\{(<]/g) || []).length;
      depth -= (lines[i].match(/[\})>]/g) || []).length;
      end = i;
      if (i > start && depth <= 0) break;
      if (i - start > this.maxSectionLines) break; // safety cap
    }

    return { start, end, lines: lines.slice(start, end + 1) };
  }

  extractKeywords(instruction) {
    const stopWords = new Set(["the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or", "with", "make", "change", "update", "add", "remove", "fix", "edit"]);
    return instruction
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  }
}
```

---

## Usage Examples

### Basic Usage

```javascript
import { WebDevAgent } from "./agent.js";

const agent = new WebDevAgent({ mode: "patch" });

// Load files
await agent.loadFile("./src/index.html");
await agent.loadFile("./src/style.css");
await agent.loadFile("./src/App.jsx");

// Edit with natural language
await agent.edit("index.html", "Change the hero title to 'Launch Fast'");
await agent.edit("style.css", "Make the CTA button background blue (#185FA5)");
await agent.edit("App.jsx", "Add a loading spinner when data is being fetched");

// Save changes
await agent.saveFile("index.html");
await agent.saveFile("style.css");
await agent.saveFile("App.jsx");
```

### Batch Edits (Chained)

```javascript
const edits = [
  { file: "index.html",  task: "Add a sticky nav bar at the top" },
  { file: "style.css",   task: "Add dark mode support using @media prefers-color-scheme" },
  { file: "App.jsx",     task: "Wrap the app in a React.Suspense boundary" },
  { file: "api.js",      task: "Add retry logic with 3 attempts on network failure" },
];

for (const { file, task } of edits) {
  const result = await agent.edit(file, task);
  console.log(`[${file}] Changed: ${result.changed}`);
}
```

### Mode Switching

```javascript
// Start in patch mode (default — fewest tokens)
const agent = new WebDevAgent({ mode: "patch" });
await agent.loadFile("./App.jsx");
await agent.edit("App.jsx", "Fix the button color");  // ~40 tokens

// Switch to section for bigger refactors
agent.setMode("section");
await agent.edit("App.jsx", "Refactor the data fetching logic into a custom hook");  // ~300 tokens

// Switch to full for complete rewrites
agent.setMode("full");
await agent.edit("App.jsx", "Convert entire component to TypeScript");  // full file
```

### Generate New File from Scratch

```javascript
import { WebDevAgent } from "./agent.js";
import { htmlHandler } from "./handlers/html-handler.js";

const agent = new WebDevAgent({ mode: "full" });

// Bootstrap with boilerplate, then extend
agent.fileStore.set("landing.html", {
  content: htmlHandler.boilerplate,
  lines: htmlHandler.boilerplate.split("\n"),
  language: "html",
  path: "./landing.html",
});

await agent.edit("landing.html", "Add a hero section with headline, subtitle, and two CTA buttons. Use Tailwind classes.");
await agent.edit("landing.html", "Add a 3-column features grid below the hero with icons and descriptions.");
await agent.saveFile("landing.html");
```

---

## API Integration

### Express.js Server Wrapper

```javascript
// server.js — Expose agent as REST API
import express from "express";
import { WebDevAgent } from "./agent.js";

const app = express();
app.use(express.json());

const agent = new WebDevAgent({ mode: "patch" });

// POST /edit — Edit a file
app.post("/edit", async (req, res) => {
  const { file, content, instruction, mode } = req.body;

  // Load file from request body
  agent.fileStore.set(file, {
    content,
    lines: content.split("\n"),
    language: detectLanguage(file),
    path: file,
  });

  if (mode) agent.setMode(mode);

  try {
    const result = await agent.edit(file, instruction);
    res.json({
      success: true,
      changed: result.changed,
      content: agent.fileStore.get(file).content,
      patch: result.patch || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /generate — Generate a new file
app.post("/generate", async (req, res) => {
  const { file, instruction, language } = req.body;
  agent.setMode("full");

  agent.fileStore.set(file, {
    content: `<!-- empty ${language} file -->`,
    lines: [""],
    language,
    path: file,
  });

  const result = await agent.edit(file, instruction);
  res.json({ success: true, content: result.content });
});

app.listen(3000, () => console.log("Web Dev Agent running on :3000"));
```

---

## Configuration

### `agent.config.json`

```json
{
  "model": "claude-sonnet-4-20250514",
  "defaultMode": "patch",
  "contextLines": 3,
  "maxSectionLines": 80,
  "maxTokensPerRequest": 1000,
  "tokenBudget": {
    "patch": 50,
    "section": 400,
    "full": 8000
  },
  "languages": {
    "html":  { "handler": "html-handler",    "formatter": "prettier" },
    "php":   { "handler": "php-handler",     "formatter": "php-cs-fixer" },
    "jsx":   { "handler": "react-handler",   "formatter": "prettier" },
    "tsx":   { "handler": "react-handler",   "formatter": "prettier" },
    "js":    { "handler": "jquery-handler",  "formatter": "prettier" },
    "scss":  { "handler": "scss-handler",    "formatter": "stylelint" },
    "vue":   { "handler": "ui-lib-handler",  "formatter": "prettier" }
  },
  "autoDetectLibrary": true,
  "validateAfterEdit": true,
  "saveHistory": true,
  "historyDepth": 20
}
```

### Environment Variables

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
AGENT_MODE=patch
AGENT_MAX_TOKENS=1000
AGENT_LOG_LEVEL=info
```

### Installation

```bash
# Clone or copy agent files
npm install @anthropic-ai/sdk express

# Run the agent server
node server.js

# Or use directly in your project
import { WebDevAgent } from './agent.js';
```

---

## Token Usage Summary

| Mode     | Typical Tokens | Best For                        | Savings vs Full |
|----------|---------------|---------------------------------|-----------------|
| patch    | 30 – 80       | Single-line or small edits      | ~98%            |
| section  | 150 – 500     | Function / component refactors  | ~85%            |
| full     | 1,000 – 8,000 | Full rewrites, new files        | 0%              |

> **Rule of thumb:** Start with patch mode. Escalate to section only when the AI needs more surrounding context. Use full only for generation or complete rewrites.

---

*Generated by Web Dev Agent · Anthropic Claude · Patch-first, token-efficient*
