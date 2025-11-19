# Email Builder WYSIWYG

A **Resend Template-style WYSIWYG Email Editor** built with Next.js and TipTap. Create beautiful, email-safe templates with a Notion-like editing experience.

## ✨ Features

- **Notion-Style Editing** – Intuitive block-based editor with slash commands (`/`), drag-and-drop, and real-time formatting
- **Email-Safe Output** – Generates React Email components that render to email-safe HTML with inline styles
- **WYSIWYG Preview** – What you see in the editor is what you get in the email
- **Rich Content Blocks** – Headings, paragraphs, lists, images, code blocks, quotes, and more
- **Global Styles** – Customize container width, padding, typography, colors, and more
- **Block-Level Styling** – Fine-tune individual blocks with custom backgrounds, borders, padding, and alignment
- **Markdown Support** – Full markdown compatibility for content authoring
- **AI-Powered** – Built-in AI completion and content generation (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/email-editor` to start building.

## 🏗️ Architecture

### Tech Stack

- **[TipTap](https://tiptap.dev/)** – Rich text editing foundation (ProseMirror-based)
- **[React Email](https://react.email/)** – Email-safe HTML generation
- **[Next.js](https://nextjs.org/)** – React framework
- **[shadcn/ui](https://ui.shadcn.com/)** – UI component library
- **[Novel.sh](https://novel.sh/)** – Editor components and extensions

### Data Flow

```
User edits in TipTap
  → EmailTemplate JSON (header + globalStyles + content)
    → content = ProseMirror JSON (extended nodes with email attrs)
      → Transformer layer
        → React Email components
          → Email HTML (inline styles, email-safe)
```

## 📝 Usage

### Creating Templates

1. **Start typing** – The editor supports markdown and slash commands
2. **Use slash commands** – Type `/` to see available blocks (headings, lists, images, etc.)
3. **Format text** – Select text to see the bubble menu with formatting options
4. **Customize styles** – Click the "Styles" button to adjust global styles
5. **Edit block attributes** – Click the attributes button on any block for fine-grained control

### Exporting Templates

The editor transforms your content into React Email components. Use the "Test Transform" button to preview the generated HTML output.

## 🎨 Block Types

### Text Blocks

- Paragraph
- Heading 1, 2, 3
- Bullet List
- Numbered List
- Blockquote
- Code Block

### Media Blocks

- Image (with upload support)
- YouTube embed
- Twitter/X embed

### Layout Blocks

- Button
- Divider
- Section

## 🔧 Development

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build for production
pnpm build
```

## 📚 Project Structure

```
├── app/
│   └── email-editor/     # Main editor page
├── components/
│   ├── email-template-editor.tsx  # Main editor component
│   ├── attributes-panel/          # Block styling controls
│   └── selectors/                 # Formatting selectors
├── lib/
│   ├── email-transform/           # React Email transformer
│   ├── email-template-context.tsx # Template state management
│   └── novel/                     # Editor components
└── types/
    └── email-template.ts          # TypeScript definitions
```

## 🎯 Roadmap

- [ ] Preview mode
- [ ] Export to Resend format
- [ ] Template variables
- [ ] More block types (sections, columns, social links)
- [ ] Email client testing
- [ ] Template library

## 📄 License

MIT

---

Built with ❤️ using TipTap, React Email, and Next.js
