# Email Builder WYSIWYG - Product Requirements Document

## Vision

Build a Notion-like WYSIWYG email builder inspired by Resend's Template builder. Users create email templates through an intuitive block-based editor with slash commands, drag-and-drop, and real-time editing. The editor outputs email-safe HTML via React Email.

## Core Principles

- **WYSIWYG is the preview** - No separate preview pane needed
- **Start simple, iterate fast** - Get basics working, then expand
- **Block-based everything** - Every piece of content is a block
- **Email-safe output** - Always render to proper email HTML

## Technical Architecture

### Data Flow

```
User edits in TipTap
  → ProseMirror JSON (with custom extensions)
    → Transformer layer
      → React Email components
        → Email HTML
```

### Core Technologies

- **TipTap/ProseMirror** - Rich text editing foundation
- **React Email** - Email-safe HTML generation
- **shadcn/ui** - UI components (Sheet, Command, etc.)
- **Next.js** - Application framework

### Key Technical Decisions

1. **TipTap Extensions Strategy**: Each block type is a custom TipTap node extension

   - Defines schema and attributes
   - Handles editor rendering
   - Stores email-specific metadata

2. **Styling Architecture**: Two-level system

   - Global styles (container, typography, defaults)
   - Block-level styles (instance-specific overrides)

3. **Block Manipulation**

   - Hover-activated side rail
   - Drag handle for reordering
   - Attributes button for customization

4. **JSON as Source of Truth**
   - Document stored as extended ProseMirror JSON
   - Includes content, styles, and metadata
   - Transformable to React Email components

## Block Types

### TEXT

- Text (paragraph)
- Heading 1
- Heading 2
- Heading 3
- Bullet List
- Numbered List
- Quote
- Code Block

### MEDIA

- Image
- YouTube
- X (Twitter)

### LAYOUT

- Button
- Divider
- Section
- Social Links
- Unsubscribe Footer

### UTILITY

- HTML
- Variable

## Features

### Editor Canvas

- 600px centered container
- Clean, minimalist aesthetic
- Slash commands for block insertion
- Hover-activated block controls
- Drag-and-drop reordering

### Template Header

- From field
- Reply-To field
- Subject line
- Preview text

### Block Controls

- **Drag Handle**: Reorder blocks via drag-and-drop
- **Attributes Button**: Opens right-side panel for block configuration

### Attributes Panel

Block-specific customization options:

**Appearance**

- Background
- Border Radius (all corners)
- Border Width/Style/Color

**Typography**

- Text color
- Font size
- Font weight
- Line height
- Text decoration

**Layout**

- Padding (all sides)
- Alignment

### Global Styles

Top-level styling system accessible via "Styles" button:

**Body/Container**

- Align
- Width
- Padding

**Typography**

- Font size
- Line height

**Link**

- Color
- Decoration

**Image**

- Border radius

**Button**

- Background
- Text color
- Radius
- Padding

**Code Block**

- Border radius
- Padding

**Inline Code**

- Background
- Text color
- Radius

**Global CSS**

- Custom CSS injection

### Image Upload

- Upload via slash command
- Paste screenshots directly
- Loading overlay during upload
- Adheres to template styles

### Variables

- Define template variables
- Insert into content
- Use in subject/preview/body
- String or number types
- Fallback values

---

## Implementation Phases

### Phase 1: Foundation - Basic TipTap + Single Block Type

**Goal**: Get TipTap editor working with ONE block type (paragraph) and prove we can render it

**Deliverables**:

- Next.js page with TipTap editor
- Basic paragraph node
- Simple JSON output
- Minimal styling (clean, centered)

**Success Criteria**: Can type in editor, see JSON update, content persists

---

### Phase 2: Slash Commands + Block Menu

**Goal**: Make the `/` command work and add 3-4 basic text block types

**Deliverables**:

- Slash command extension for TipTap
- Command palette UI (shadcn Command component)
- Block types: Paragraph, H1, H2, H3
- Block insertion logic

**Success Criteria**: Can type `/`, see menu, insert different block types

---

### Phase 3: Block Selection + Side Rail

**Goal**: Get the block manipulation UI working

**Deliverables**:

- Hover detection on blocks
- Side rail with drag handle + attributes button
- Drag-to-reorder functionality
- Visual feedback

**Success Criteria**: Can hover block, see buttons, drag to reorder

---

### Phase 4: Attributes Panel (Basic)

**Goal**: Right-side sheet that shows block attributes

**Deliverables**:

- Sheet component for attributes panel
- Context/state management for selected block
- Basic attributes form (alignment, padding)
- Block attribute updates in JSON

**Success Criteria**: Click attributes button, see panel, change attribute, see update in editor

---

### Phase 5: Global Styles Panel

**Goal**: Top-level styling system

**Deliverables**:

- Styles button in top bar
- Modal/sheet with global style controls
- Global styles object in document JSON
- Apply global styles to editor preview

**Success Criteria**: Change global font size, see all text update

---

### Phase 6: More Block Types

**Goal**: Expand block library

**Deliverables**:

- Lists (bullet, numbered)
- Button block
- Divider
- Quote
- Code block

**Success Criteria**: Can insert and use all basic block types

---

### Phase 7: Image Upload + Media Blocks

**Goal**: Handle media properly

**Deliverables**:

- Image upload system
- Paste detection
- Image block with email rendering
- Loading states

**Success Criteria**: Paste image, see it upload and render

---

### Phase 8: React Email Output

**Goal**: Convert to actual sendable email

**Deliverables**:

- Transformer: JSON → React Email components
- Block type mapping to email-safe components
- Preview/export functionality
- Test sending through Resend

**Success Criteria**: Click "send test", receive properly formatted email

---

### Phase 9: Template Header + Variables

**Goal**: Add email metadata and personalization

**Deliverables**:

- From, Reply-To, Subject, Preview fields at top
- Variable system (define, insert, use)
- Variable rendering in output

**Success Criteria**: Can use variables in subject/body, see them in output

---

### Phase 10: Advanced Blocks + Polish

**Goal**: Remaining blocks and refinements

**Deliverables**:

- Section/column layouts
- Social links
- Unsubscribe footer
- HTML block
- YouTube/Twitter embeds
- Polish all interactions

**Success Criteria**: All block types functional, smooth UX throughout

---

## Current Phase

**Status**: Phase 1 - Foundation

**Next Steps**:

1. Install TipTap dependencies
2. Create `/components/email-editor.tsx`
3. Basic TipTap setup with paragraph node
4. Style to match Resend aesthetic
5. Show JSON output for debugging

---

## Notes

- Each phase builds on previous
- Plan may adapt as we learn
- Focus on getting each phase solid before moving on
- WYSIWYG means no separate preview component needed
