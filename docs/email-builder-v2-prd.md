# Email Builder WYSIWYG v2 – Product Requirements Document

## Vision

Transform the existing Notion-style editor (novel.sh-based) into a **Resend-inspired WYSIWYG email template builder**. Users create email templates through an intuitive block-based editor with slash commands, drag-and-drop, bubble formatting, and real-time editing. The editor outputs email-safe HTML via React Email while maintaining full markdown support for content authoring.

---

## Core Principles

- **Email-first, but reuse what works** – Leverage novel's UX primitives (slash menu, drag handle, bubble menu, markdown, AI) but constrain and adapt them for email
- **WYSIWYG is the preview** – Editor view should closely mirror final email output
- **Start simple, iterate fast** – Each phase ships a working increment
- **Block-based everything** – Every piece of content is a block with stable identity
- **Email-safe output** – Always render to proper React Email → inline-styled HTML
- **Simplicity first** – Do the simplest correct thing at each phase, then expand

---

## Technical Architecture

### Data Flow

```
User edits in TipTap
  → EmailTemplate JSON (header + globalStyles + content)
    → content = ProseMirror JSON (extended StarterKit nodes with email attrs)
      → Transformer layer
        → React Email components
          → Email HTML (inline styles, email-safe)
```

### Core Technologies

- **TipTap/ProseMirror** – Rich text editing foundation (keeping novel's setup)
- **React Email** – Email-safe HTML generation
- **shadcn/ui** – UI components (Sheet, Command, Popover, etc.)
- **Next.js** – Application framework
- **Novel.sh components** – Headless editor, bubble menu, slash commands, drag handle, AI, uploads

### Key Architectural Decisions

1. **Data Model**: `EmailTemplate` wrapper around TipTap doc
   - `header`: from, replyTo, subject, preview
   - `globalStyles`: email-wide styling defaults
   - `content`: TipTap JSONContent (the actual document)

2. **Block Strategy**: Extend StarterKit nodes, don't replace
   - Keep existing nodes: `paragraph`, `heading`, `bulletList`, `orderedList`, `blockquote`, `codeBlock`, `image`, `youtube`, `twitter`
   - Add email-specific nodes: `buttonBlock`, `dividerBlock`, `sectionBlock`, `socialLinksBlock`, `unsubscribeFooterBlock`, `htmlBlock`, `variableBlock`
   - All block nodes get:
     - Stable `id` (via UniqueID extension or custom)
     - `attrs.styles` (structured style data for email export)

3. **Styling Architecture**: Two-level system
   - **Global styles**: template-wide defaults (container, typography, links, buttons, etc.)
   - **Block-level styles**: instance-specific overrides (background, padding, borders, alignment, typography)

4. **Block Manipulation**
   - Reuse `GlobalDragHandle` from novel for drag-to-reorder
   - Custom `BlockMeta/Selection` extension to track active block
   - Side rail UI (React) that positions based on block metadata
   - Attributes panel (Sheet) for block customization

5. **Email Safety**
   - Transformer validates blocks and produces React Email components
   - Email-safe constraints enforced via schema and linting
   - Inline styles in output (no external CSS)

6. **Markdown Support**
   - Keep novel's Markdown extension for paste/import
   - Markdown → TipTap → React Email pipeline
   - Supports AI-generated content, ChatGPT pastes, etc.

---

## Email Block Taxonomy

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

---

## Features

### Editor Canvas

- 600px centered container (email standard width)
- Clean, minimalist aesthetic (Resend-inspired)
- Slash commands (`/`) for block insertion
- GlobalDragHandle for reordering
- Bubble formatting menu (text selection)
- Markdown paste support
- AI-powered writing assistance (optional)
- JSON debug panel (dev mode)

### Template Header

- **From** field
- **Reply-To** field
- **Subject** line (supports variables)
- **Preview** text (supports variables)

### Block Controls

- **Drag Handle**: Reorder blocks via drag-and-drop (GlobalDragHandle)
- **Attributes Button**: Opens right-side panel for block configuration

### Attributes Panel (Block-Specific)

Block-specific customization options via right-side Sheet:

**Appearance**

- Background color
- Border Radius
- Border Width/Style/Color

**Typography** (text blocks)

- Text color
- Font size
- Font weight
- Line height
- Text decoration

**Layout**

- Padding (all sides)
- Alignment (left/center/right)

### Global Styles

Template-wide styling system accessible via "Styles" button in top bar:

**Body/Container**

- Container width (default 600px)
- Alignment
- Padding

**Typography**

- Base font family
- Base font size
- Base line height

**Link**

- Default color
- Default decoration

**Image**

- Default border radius

**Button**

- Default background color
- Default text color
- Default border radius
- Default padding

**Code Block**

- Background color
- Border radius
- Padding

**Inline Code**

- Background color
- Text color
- Border radius

**Global CSS** (advanced)

- Custom CSS injection for edge cases

### Image Upload

- Upload via slash command
- Paste screenshots directly
- Drag & drop
- Loading states during upload
- Adheres to template styles
- Email-safe sizing and alt text

### Variables

- Define template variables (name, type, default value)
- Insert into content via inline nodes/marks
- Use in subject/preview/body
- String or number types
- Fallback values for rendering
- Preview with sample data

### Bubble Menu (Text Selection)

Reuses novel's bubble menu with email-appropriate controls:

- Node selector (Text, H1, H2, H3, Lists, Quote, Code)
- Bold, Italic, Underline, Strike, Code
- Link insertion/editing
- Text color & highlight
- (AI features optional)

### Markdown Support

- Full markdown import/export via TipTap Markdown extension
- Paste from ChatGPT, docs, notes, etc.
- Converts to appropriate email blocks
- Preserves formatting (headings, lists, bold, italic, links, code)

---

## Implementation Phases

### Phase 1: EmailTemplate Wrapper + JSON Visibility

**Goal**: Wrap the existing novel editor into an explicit `EmailTemplate` model with full JSON visibility

**Deliverables**:

1. Define `EmailTemplate` TypeScript interface:

   ```ts
   interface EmailTemplate {
     id: string;
     header: {
       from: string;
       replyTo: string;
       subject: string;
       preview: string;
     };
     globalStyles: GlobalStyles;
     content: JSONContent; // TipTap document
     variables?: Variable[];
     createdAt: string;
     updatedAt: string;
   }
   ```

2. Create `GlobalStyles` interface with sensible defaults:

   ```ts
   interface GlobalStyles {
     container: {
       width: number;
       align: "left" | "center" | "right";
       padding: { top: number; right: number; bottom: number; left: number };
     };
     typography: {
       fontFamily: string;
       fontSize: number;
       lineHeight: number;
     };
     link: {
       color: string;
       textDecoration: "none" | "underline";
     };
     // ... more style categories
   }
   ```

3. Create `EmailTemplateEditor` component:
   - Wraps the existing `TailwindAdvancedEditor`
   - Manages `EmailTemplate` state
   - Updates `template.content` when editor changes
   - Persists entire template to localStorage

4. Enhanced JSON debug panel:
   - Show full `EmailTemplate` JSON (not just TipTap content)
   - Collapsible sections for header, globalStyles, content
   - Copy-to-clipboard button
   - Toggle visibility

5. Basic template header UI (read-only for now):
   - Display current from/subject/preview in a header bar
   - Defaults populated from template

**Success Criteria**:

- Can type, edit, paste markdown content in editor
- All edits update `EmailTemplate.content` in JSON
- Header and globalStyles appear in JSON with defaults
- Template persists across page reload
- Existing novel features work: drag, bubble menu, slash menu, markdown paste

**Files to Create/Modify**:

- `/types/email-template.ts` – Type definitions
- `/lib/email-template-defaults.ts` – Default template
- `/components/email-template-editor.tsx` – Main wrapper component
- `/app/email-editor/page.tsx` – New dedicated email editor page
- Modify `/components/advanced-editor.tsx` if needed

---

### Phase 2: Email-Aware Slash Menu + Block Taxonomy

**Goal**: Make the `/` command menu match email block taxonomy and organize blocks semantically

**Deliverables**:

1. Replace slash command items with email-focused list:
   - Group by category: TEXT, MEDIA, LAYOUT, UTILITY
   - Map to existing nodes where possible
   - Create placeholder entries for not-yet-implemented blocks

2. Update `/components/slash-command.tsx`:

   ```ts
   const emailBlocks = [
     // TEXT category
     { category: "TEXT", title: "Text", ... },
     { category: "TEXT", title: "Heading 1", ... },
     { category: "TEXT", title: "Heading 2", ... },
     { category: "TEXT", title: "Heading 3", ... },
     { category: "TEXT", title: "Bullet List", ... },
     { category: "TEXT", title: "Numbered List", ... },
     { category: "TEXT", title: "Quote", ... },
     { category: "TEXT", title: "Code Block", ... },

     // MEDIA category
     { category: "MEDIA", title: "Image", ... },
     { category: "MEDIA", title: "YouTube", ... },
     { category: "MEDIA", title: "X (Twitter)", ... },

     // LAYOUT category (placeholders for now)
     { category: "LAYOUT", title: "Button", ... },
     { category: "LAYOUT", title: "Divider", ... },
     { category: "LAYOUT", title: "Section", ... },
     { category: "LAYOUT", title: "Social Links", ... },
     { category: "LAYOUT", title: "Unsubscribe Footer", ... },

     // UTILITY category (placeholders)
     { category: "UTILITY", title: "HTML", ... },
     { category: "UTILITY", title: "Variable", ... },
   ];
   ```

3. Implement placeholder blocks for LAYOUT/UTILITY:
   - Simple paragraph with special class/data attribute
   - Or minimal custom nodes with just `content` and `category` attrs
   - Render with distinct styling to show they're placeholders

4. Update visual design of slash menu:
   - Category headers
   - Email-appropriate icons
   - Descriptions matching email use cases

5. Sync bubble menu `NodeSelector` with email blocks

**Success Criteria**:

- Typing `/` shows email-categorized block menu
- All TEXT blocks insert and work correctly
- All MEDIA blocks insert and work correctly
- LAYOUT/UTILITY placeholder blocks insert and show in JSON
- Can drag/reorder all blocks
- Bubble menu NodeSelector matches slash menu

**Files to Create/Modify**:

- `/components/email-slash-command.tsx` – Email-specific slash menu
- `/lib/email-blocks.ts` – Block definitions and commands
- Update `/components/email-template-editor.tsx` to use new slash command
- Update `/components/selectors/node-selector.tsx` for email blocks

---

### Phase 6 Summary ✅ COMPLETE

Phase 6 successfully implemented a comprehensive global styles system with a Resend-inspired UI. Users can now:

- Edit global styles that affect all blocks without individual overrides
- Reset to email industry standard defaults if they make mistakes
- Edit template header fields (From, Reply-To, Subject, Preview) with validation
- See changes apply immediately in the editor via CSS variables
- Control container width, alignment, padding, and background
- Set default typography for all text content
- Configure link colors and decoration globally
- Define button, code block, and inline code defaults

The system is robust, handles incomplete templates gracefully, and provides a solid foundation for email template creation following email industry best practices.

---

### Phase 3: Block Identity (UniqueID) + Active Block Hook ✅ COMPLETE

**Goal**: Give each block a stable identity and expose the currently active block to React, without reinventing selection/drag behaviour that already exists via `GlobalDragHandle`.

#### Implementation Parts (All Complete)

- **Part 1 ✅**: Install and configure `UniqueID` extension with pure UUID generation
- **Part 2 ✅**: Create block ID helper utilities for both JSON and live editor operations
- **Part 3 ✅**: Implement `useActiveBlock` hook with NodeSelection support for images
- **Part 4**: Add visual feedback for active block (DEFERRED to later phase)

**What Was Built**:

1. **UniqueID Extension Integration** (`@tiptap/extension-unique-id@2.27.1`):
   - Configured with:
     - `attributeName: "uid"`
     - `types: ["paragraph", "heading", "blockquote", "codeBlock", "bulletList", "orderedList", "taskList", "taskItem", "image", "youtube", "twitter"]`
     - `generateID: () => crypto.randomUUID()` (pure UUID, not prefixed)
   - Wired into `/components/email-extensions.ts`
   - All blocks automatically get stable UIDs on creation
   - UIDs persist across drag, paste, undo/redo

2. **Block ID Helper Utilities** (`/lib/email-blocks.ts`):
   - `BLOCK_UID_ATTR` constant for centralized attribute name
   - `findNodeByUidJson(doc, uid)` → `{ node, path } | null` (pure JSON traversal)
   - `findNodeByUid(editor, uid)` → `{ node, pos } | null` (live editor search)
   - `updateNodeAttrsByUid(editor, uid, attrs)` → `boolean` (safe attr updates with merge)
   - All functions handle edge cases (null checks, missing UIDs, safe no-ops)

3. **Active Block Hook** (`/hooks/use-active-block.ts`):

   ```ts
   export type ActiveBlock = {
     uid: string;
     type: string;
     pos: number;
     domRect: DOMRect | null;
   } | null;

   export function useActiveBlock(): ActiveBlock;
   ```

   - Handles both text selections and NodeSelection (for images, embeds, etc.)
   - Walks up document tree to find nearest ancestor with `uid`
   - Subscribes to `selectionUpdate` and `transaction` events
   - Optimized with state-update guards to prevent unnecessary re-renders
   - Computes `domRect` via `view.nodeDOM(pos).getBoundingClientRect()`
   - Must be used inside `EditorContent` context (requires TipTap's `useEditor`)

4. **Dev Test Panel** (`/components/active-block-test-panel.tsx`):
   - Real-time display of active block info: UID, type, position, bounding box
   - Dev-only (checks `process.env.NODE_ENV`)
   - Integrated into email editor for easy testing

**Key Implementation Details**:

- **NodeSelection handling**: Explicitly checks `selection instanceof NodeSelection` before falling back to `$from` ancestor walk, ensuring images and other atomic nodes are detected
- **Performance**: O(1) per selection event, only reads layout once (`getBoundingClientRect`) per active block change
- **Context correctness**: Hook usage moved inside `EditorContent` children to ensure proper TipTap context access
- **State optimization**: Only updates React state when `uid`, `type`, `pos`, or `domRect` values actually change

**Validated Behavior**:

- ✅ Text blocks (paragraphs, headings, code) correctly report active block
- ✅ List items and nested list items each have stable UIDs
- ✅ Images and embeds (YouTube, Twitter) correctly detected via NodeSelection
- ✅ Drag-and-drop maintains stable UIDs and updates `domRect` correctly
- ✅ Split/merge operations preserve original UIDs where appropriate
- ✅ Undo/redo keeps active block tracking accurate
- ✅ No performance degradation even with rapid selection changes

**Files Created**:

- `/lib/email-blocks.ts` – Block ID utilities
- `/hooks/use-active-block.ts` – Active block hook
- `/components/active-block-test-panel.tsx` – Dev test UI

**Files Modified**:

- `/components/email-extensions.ts` – Added UniqueID configuration
- `/components/email-template-editor.tsx` – Integrated test panel, exposed dev helpers

---

### Phase 4: Attributes Handle + Panel Integration ✅ COMPLETE

**Goal**: Wire the existing attributes handle (already present in `GlobalDragHandle`) to open a React-based Attributes Sheet that displays and will eventually edit block properties.

**Approach**: Rather than creating a separate side rail component, we leveraged the existing `.block-attributes-handle` element that `GlobalDragHandle` already creates and positions. This handle (sliders icon) appears next to blocks on hover, alongside the drag handle.

**What Was Built**:

1. **Modified `GlobalDragHandle` click handler** (`lib/novel/extensions/global-drag-handle.ts`):
   - On attributes handle click, computes the hovered block's start position using `calcNodePos` and `lastHoveredPos`
   - Sets ProseMirror selection to the clicked block:
     - Try `NodeSelection.create()` first (works for atomic nodes like images, embeds)
     - On failure, fall back to `TextSelection` positioned **inside** the block (+1 position)
     - This ensures `useActiveBlock` can walk up the tree to find the block with UID
   - Dispatches selection transaction with `scrollIntoView()`
   - Emits `emailEditor:openAttributes` custom window event to bridge plugin → React

2. **Created stub `AttributesPanel` component** (`components/attributes-panel.tsx`):
   - Uses shadcn `Sheet` (right-side, 400px width, solid background)
   - Props: `open`, `onOpenChange`, `blockUid`, `blockType`
   - Displays read-only block info:
     - Block type (badge)
     - Block UID (monospace, with copy-to-clipboard button)
     - Raw `node.attrs` JSON dump (using `findNodeByUid` helper)
   - Auto-closes if `blockUid` becomes null or node is deleted
   - Sheet overlay makes editor non-interactive while open

3. **Integrated into `EmailTemplateEditor`** (`components/email-template-editor.tsx`):
   - Added `isAttributesOpen` state
   - Added window event listener for `emailEditor:openAttributes` event
   - Created `AttributesPanelWrapper` component inside `EditorContent`:
     - Uses `useActiveBlock()` hook (requires TipTap context)
     - Passes `activeBlock.uid` and `activeBlock.type` to `AttributesPanel`
     - Auto-switches to new block if active block changes while panel is open
   - Re-enabled `ActiveBlockTestPanel` in dev mode for verification

4. **Fixed Sheet transparency issue**:
   - Used `bg-[hsl(var(--background))]` (raw HSL value) instead of `bg-background` utility
   - Matches pattern used in Dialog component for reliable solid backgrounds

**Key Technical Solution**:

The critical fix for text blocks (paragraphs, headings, code blocks) was positioning the cursor **inside** the block content when falling back to TextSelection:

```typescript
// Try NodeSelection first (for images, atomic nodes)
try {
  selection = NodeSelection.create(view.state.doc, blockStartPos);
} catch {
  // For text blocks, position cursor INSIDE (+1) so useActiveBlock can walk up
  const insidePos =
    blockStartPos < view.state.doc.content.size
      ? blockStartPos + 1
      : blockStartPos;
  selection = TextSelection.create(view.state.doc, insidePos);
}
```

This ensures `useActiveBlock`'s ancestor walk from `selection.$from` can find the parent block with the UID attribute.

**Validated Behavior**:

- ✅ Attributes handle works for **all** block types (paragraphs, headings, lists, quotes, code, images, embeds)
- ✅ Clicking handle selects the block and opens the Sheet
- ✅ Active block info (UID, type, attrs) displays correctly in both Sheet and dev panel
- ✅ Sheet has solid background in both light and dark modes
- ✅ Sheet auto-closes if block is deleted
- ✅ Selection remains at block start when Sheet closes
- ✅ Editor is non-interactive while Sheet is open (overlay intercepts clicks)
- ✅ No performance issues or visual glitches

**Files Created**:

- `/components/attributes-panel.tsx` – Stub attributes panel Sheet component

**Files Modified**:

- `/lib/novel/extensions/global-drag-handle.ts` – Wired attributes handle click to selection + event emission
- `/components/email-template-editor.tsx` – Added Sheet state, event listener, and AttributesPanelWrapper

**CSS Already in Place**:

- `.block-attributes-handle` styles already exist in `/styles/prosemirror.css` from the GlobalDragHandle plugin
- Handle already positioned, styled, and has hover behavior matching drag handle

---

### Phase 4 Summary ✅ COMPLETE

All parts of Phase 4 are complete and validated. The system now has:

- **Attributes handle integration** via GlobalDragHandle click handler
- **React-based Attributes Sheet** that opens on handle click
- **Auto-selection** of clicked block with proper NodeSelection/TextSelection handling
- **Solid background Sheet** that works in light and dark modes

**Next Phase**: Phase 5 - Block Attributes Panel v1 (Interactive Styling)

---

### Phase 5: Block Attributes Panel v1 (Interactive Styling) ✅ COMPLETE

**Goal**: Implement interactive attributes panel with Resend-inspired UX for styling all block types

**Deliverables**:

1. Define block styles schema:

   ```ts
   // /types/block-styles.ts
   interface BlockStyles {
     // Appearance
     background?: string;
     borderRadius?: number;
     borderWidth?: number;
     borderStyle?: "solid" | "dashed" | "dotted" | "none";
     borderColor?: string;

     // Typography (text blocks)
     textColor?: string;
     fontSize?: number;
     fontWeight?: 400 | 500 | 600 | 700;
     lineHeight?: number;
     textDecoration?: "none" | "underline" | "line-through";

     // Layout
     padding?: {
       top: number;
       right: number;
       bottom: number;
       left: number;
     };
     textAlign?: "left" | "center" | "right" | "justify";
   }
   ```

2. Extend text block nodes with styles attr:

   ```ts
   // Extend paragraph, heading schemas
   Paragraph.extend({
     addAttributes() {
       return {
         ...this.parent?.(),
         id: { default: null },
         styles: {
           default: {},
           parseHTML: (element) =>
             JSON.parse(element.getAttribute("data-styles") || "{}"),
           renderHTML: (attributes) => ({
             "data-styles": JSON.stringify(attributes.styles || {}),
           }),
         },
       };
     },
   });
   ```

3. Build AttributesPanel UI:
   - Use shadcn Sheet for right-side panel
   - Sections: Appearance, Typography, Layout
   - Form controls:
     - Color pickers (background, text, border colors)
     - Number inputs with units (padding, border width, font size, line height)
     - Select dropdowns (border style, font weight, alignment, text decoration)
     - Slider for border radius
   - Real-time updates as user changes values

4. Connect panel to editor:

   ```tsx
   const AttributesPanel = ({ blockId, blockType, onClose }) => {
     const { editor } = useEditor();
     const [styles, setStyles] = useState<BlockStyles>({});

     // Load current block styles
     useEffect(() => {
       const node = findNodeById(editor, blockId);
       setStyles(node?.attrs.styles || {});
     }, [blockId]);

     // Update block on change
     const updateStyle = (key: string, value: any) => {
       editor
         .chain()
         .updateAttributes(blockType, {
           styles: { ...styles, [key]: value },
         })
         .run();
     };

     return (
       <Sheet open={!!blockId} onOpenChange={onClose}>
         {/* Form controls */}
       </Sheet>
     );
   };
   ```

5. Apply styles in editor view:
   - Map `attrs.styles` to inline styles in `renderHTML`
   - Use `HTMLAttributes` or custom NodeView
   - Ensure WYSIWYG: what you style is what you see

6. Persist styles in JSON:
   - Styles stored in node attrs
   - Visible in JSON debug panel
   - Survives save/load

**Success Criteria**:

- Clicking attributes button opens panel for selected block
- Panel shows current block styles
- Changing any style (background, padding, font size, etc.) updates block in real-time
- Styles persist in `attrs.styles` and visible in JSON
- Panel works for paragraph, all heading levels
- Closing panel preserves changes
- No bugs with multiple rapid style changes

**What Was Built**:

1. **BlockStyles Type System** (`/types/block-styles.ts`):
   - Complete `BlockStyles` interface with all email-safe CSS properties
   - Type subsets: `TextBlockStyles`, `ImageBlockStyles`, `CodeBlockStyles`, `ListBlockStyles`
   - Removed "justify" alignment (Resend only supports left/center/right)

2. **Style Utility Functions** (added to `/lib/email-blocks.ts`):
   - `convertBlockStylesToInlineCSS(styles, options?)` - Converts BlockStyles to inline CSS string
   - Special image alignment handling via `{ isImage: true }` flag (uses `display: block` + margin auto)
   - `mergeWithGlobalStyles()` - Merges block styles with global defaults
   - `getDefaultStylesForBlockType()` - Returns appropriate defaults per block type

3. **Extended TipTap Nodes with `styles` Attribute**:
   - `/lib/extensions/email-paragraph.ts` - Paragraph with styles
   - `/lib/extensions/email-heading.ts` - Heading with styles
   - `/lib/extensions/email-blockquote.ts` - Blockquote with styles
   - `/lib/extensions/email-code-block.ts` - Code block with styles
   - `/lib/extensions/email-image.ts` - Image with styles + width/height for resize persistence
   - `/lib/extensions/email-lists.ts` - BulletList, OrderedList with styles
   - All use `parseHTML` to read `data-styles` attribute and `renderHTML` to write inline CSS

4. **Updated Email Extensions Configuration** (`/components/email-extensions.ts`):
   - Disabled StarterKit's paragraph, heading, blockquote, codeBlock, bulletList, orderedList, listItem
   - Added all email-specific extended nodes with configured HTMLAttributes
   - Maintains all other extensions (UniqueID, placeholder, links, images, etc.)

5. **Resend-Inspired Attributes Panel UI**:
   - `/components/attributes-panel/color-picker-input.tsx` - Native `<input type="color">` + hex text input
   - `/components/attributes-panel/padding-control.tsx` - Unified input with lock/unlock toggle
   - `/components/attributes-panel/slider-number-input.tsx` - Slider + number input combo
   - `/components/attributes-panel/alignment-control.tsx` - Select dropdown (Left/Center/Right)
   - `/components/attributes-panel/style-dropdown-menu.tsx` - + button dropdown menu to add style overrides
   - `/components/attributes-panel/style-control.tsx` - Individual style control with - button to remove
   - `/components/attributes-panel/types.ts` - Shared TypeScript types

6. **Rebuilt AttributesPanel Component** (`/components/attributes-panel.tsx`):
   - **Structure**: Type → UID → Alignment → Styles → Reset
   - **Alignment**: Always visible dropdown for all block types
   - **Styles Section**:
     - - button opens dropdown menu (Appearance, Typography, Layout categories)
     - Click to add style override
     - Each active style shows with - button to remove
     - Shows "No style overrides" when empty
   - **Smart Defaults**: When adding a style, sets sensible default value (e.g., white background, not black)
   - **Real-time WYSIWYG**: Changes apply immediately via `updateNodeAttrsByUid()`
   - **Reset to Defaults**: Clears all `styles: {}` overrides, reverts to global defaults

7. **Fixed Image Resize Persistence** (`/lib/novel/extensions/image-resizer.tsx`):
   - Changed from `setImage()` to `updateAttributes()` to preserve `styles` during resize
   - Images no longer snap back to original size after resize
   - Images no longer lose alignment when resized

**Key Technical Solutions**:

- **Image alignment**: Uses `display: block` + `margin-left/right: auto` pattern instead of `text-align` (email-safe)
- **Style persistence**: All styles stored in `node.attrs.styles`, serialized via `data-styles` attribute
- **Real-time updates**: No "Apply" button needed - writes to editor on every change
- **Active style tracking**: `activeStyleKeys` Set manages which style controls are visible

**Validated Behavior**:

- ✅ All block types support alignment (text, headings, images, code, lists, blockquotes)
- ✅ Text blocks show typography controls (text color, font size, weight, line height, decoration)
- ✅ Images support border radius, border width/style/color, padding, alignment, width/height
- ✅ Code blocks support background, text color, font size, padding, border
- ✅ Lists support text color, font size, line height, padding
- ✅ Border controls auto-enable when width > 0 (shows style and color dropdowns)
- ✅ Padding lock/unlock toggle works correctly
- ✅ Color pickers use native input + hex text input (better UX than preset swatches)
- ✅ Slider + number input combos provide visual + precise control
- ✅ Adding style sets sensible default value
- ✅ Removing style deletes from node attrs
- ✅ Reset to Defaults clears all style overrides
- ✅ Image resize preserves alignment and other styles
- ✅ Styles persist across page reload (via EmailTemplate → localStorage)
- ✅ Real-time WYSIWYG - changes apply immediately in editor
- ✅ Undo/redo works for all style changes

**Files Created (16)**:

- `/types/block-styles.ts`
- `/lib/extensions/email-paragraph.ts`
- `/lib/extensions/email-heading.ts`
- `/lib/extensions/email-blockquote.ts`
- `/lib/extensions/email-code-block.ts`
- `/lib/extensions/email-image.ts`
- `/lib/extensions/email-lists.ts`
- `/components/attributes-panel/color-picker-input.tsx`
- `/components/attributes-panel/padding-control.tsx`
- `/components/attributes-panel/slider-number-input.tsx`
- `/components/attributes-panel/alignment-control.tsx`
- `/components/attributes-panel/style-dropdown-menu.tsx`
- `/components/attributes-panel/style-control.tsx`
- `/components/attributes-panel/types.ts`

**Files Modified (4)**:

- `/lib/email-blocks.ts` - Added style conversion and merge utilities
- `/components/email-extensions.ts` - Replaced StarterKit nodes with extended versions
- `/components/attributes-panel.tsx` - Transformed to Resend-inspired interactive panel
- `/lib/novel/extensions/image-resizer.tsx` - Fixed to preserve styles during resize

**Files Deprecated (4)** - No longer used, can be deleted:

- `/components/attributes-panel/appearance-section.tsx`
- `/components/attributes-panel/typography-section.tsx`
- `/components/attributes-panel/layout-section.tsx`
- `/components/attributes-panel/image-section.tsx`
- `/components/attributes-panel/color-picker.tsx`

---

### Phase 6: Global Styles + Template Header UI ✅ COMPLETE

**Goal**: Add global email styling controls and editable template header fields

**What Was Built**:

1. **Enhanced GlobalStyles Interface** (`lib/email-blocks.ts`):
   - Updated `mergeWithGlobalStyles()` to handle all block types (paragraphs, headings, blockquotes, lists)
   - Updated `getDefaultStylesForBlockType()` to provide appropriate defaults
   - Code blocks now inherit typography defaults in addition to their specific styles

2. **Editable Template Header** (`components/template-header.tsx`):
   - Transformed read-only display into editable form fields
   - Added email validation for From/Reply-To fields with error messages
   - Added character counters for Subject (100 chars) and Preview (150 chars)
   - Real-time updates via `updateHeader()` from context
   - Changes persist automatically to localStorage

3. **GlobalStylesPanel UI** (`components/global-styles-panel.tsx`):
   - Resend-inspired panel with Accordion sections
   - **Body Section** (NEW): Background color, alignment, border color
   - **Container Section**: Background color, width, alignment, padding
   - **Typography Section**: Font family, font size, line height, text color
   - **Link Section**: Color, text decoration
   - **Image Section**: Border radius
   - **Button Section**: Background color, text color, border radius, padding
   - **Code Block Section**: Background color, border radius, padding
   - **Inline Code Section**: Background color, text color, border radius
   - **Custom CSS Section**: Advanced CSS injection
   - **Reset to Defaults Button**: Restores all styles to email industry standards
   - Reused existing form controls (ColorPickerInput, PaddingControl, SliderNumberInput)
   - Real-time updates (no "Apply" button needed)

4. **Styles Button Integration** (`app/email-editor/page.tsx`):
   - Added "Styles" button with Sliders icon to top bar
   - Opens GlobalStylesPanel on click
   - Panel slides in from left side (matching other panels)
   - Solid background (not transparent)

5. **CSS Variables System** (`lib/global-styles-css.ts`, `components/email-template-editor.tsx`):
   - Created `globalStylesToCSSVariables()` utility with defensive defaults
   - Handles partial/incomplete GlobalStyles objects gracefully
   - Injects CSS variables into editor wrapper element
   - Updated `prosemirror.css` to use CSS variables with fallbacks:
     - Typography: `--email-font-family`, `--email-font-size`, `--email-line-height`, `--email-text-color`
     - Links: `--email-link-color`, `--email-link-decoration`
     - Container: `--email-container-width`, padding variables
     - Code blocks: `--email-code-block-bg`, `--email-code-block-radius`, padding variables
     - Inline code: `--email-inline-code-bg`, `--email-inline-code-text`, `--email-inline-code-radius`
   - Applied container width/padding/alignment to editor canvas wrapper
   - Global style changes update the editor in real-time

6. **Block Inheritance System**:
   - Blocks without inline styles inherit from CSS variables automatically
   - Typography affects all text blocks (paragraphs, headings, lists, blockquotes)
   - Link colors update globally across all links
   - Code styling updates globally for all code blocks
   - `mergeWithGlobalStyles()` utility ready for Phase 7 (React Email export)

7. **Padding Merge Fix** (`components/global-styles-panel.tsx`):
   - Fixed update functions to merge padding objects correctly
   - Added defensive checks for undefined padding using `DEFAULT_PADDING`
   - Container, Button, and CodeBlock sections handle nested padding updates properly

**Validated Behavior**:

- ✅ Global styles panel opens from left side with solid background
- ✅ All style categories are editable with proper form controls
- ✅ Changes apply immediately to the editor (real-time WYSIWYG)
- ✅ Container width changes resize editor canvas
- ✅ Container padding affects editor spacing
- ✅ Container alignment (left/center/right) positions editor correctly
- ✅ Typography changes (font family, size, line height, color) affect all text blocks
- ✅ Link color/decoration changes affect all links globally
- ✅ Code block and inline code styling updates globally
- ✅ Template header fields are editable with validation
- ✅ Email validation prevents invalid addresses
- ✅ Character counters help users stay within limits
- ✅ Reset to Defaults button restores email industry standard styles
- ✅ All changes persist to localStorage
- ✅ Handles partial/incomplete templates from old localStorage data
- ✅ No runtime errors when editing global styles

**Default Global Styles** (Email Industry Standards):

```typescript
container: {
  backgroundColor: "#ffffff",
  width: 600, // Email standard
  align: "center",
  padding: { top: 0, right: 0, bottom: 0, left: 0 }
},
typography: {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: 14,
  lineHeight: 1.55,
  color: "#000000"
},
link: {
  color: "#2563eb",
  textDecoration: "underline"
},
image: {
  borderRadius: 0
},
button: {
  backgroundColor: "#2563eb",
  textColor: "#ffffff",
  borderRadius: 4,
  padding: { top: 12, right: 24, bottom: 12, left: 24 }
},
codeBlock: {
  backgroundColor: "#f3f4f6",
  borderRadius: 4,
  padding: { top: 16, right: 16, bottom: 16, left: 16 }
},
inlineCode: {
  backgroundColor: "#f3f4f6",
  textColor: "#000000",
  borderRadius: 4
}
```

**Files Created (2)**:

- `/lib/global-styles-css.ts` – CSS variable conversion utilities with defensive defaults
- `/components/global-styles-panel.tsx` – Resend-inspired global styles UI

**Files Modified (5)**:

- `/lib/email-blocks.ts` – Enhanced merge functions for all block types
- `/components/template-header.tsx` – Editable form fields with validation
- `/app/email-editor/page.tsx` – Added Styles button and panel integration
- `/components/email-template-editor.tsx` – CSS variable injection and container styling
- `/styles/prosemirror.css` – Use CSS variables with fallbacks

**Technical Architecture**:

Global styles are centralized:

1. **Type Definition**: `/types/email-template.ts` - `GlobalStyles` interface
2. **Defaults**: `/lib/email-template-defaults.ts` - `createDefaultGlobalStyles()`
3. **State Management**: `/lib/email-template-context.tsx` - `updateGlobalStyles()` with deep merge
4. **Utilities**: `/lib/email-blocks.ts` - `mergeWithGlobalStyles()`, `getDefaultStylesForBlockType()`
5. **CSS Variables**: `/lib/global-styles-css.ts` - Conversion to CSS custom properties
6. **Runtime State**: React context + localStorage (no external JSON/store needed)

**Next Phase**: Phase 7 - React Email Transformer + Preview/Export

---

### Original Phase 6 Design Spec

Below is the original design spec for reference:

**Deliverables**:

1. Implement GlobalStyles in EmailTemplate:
   - Already defined in Phase 1 type
   - Create defaults with sensible values
   - Wire to template state

2. Build GlobalStylesPanel (COMPLETED ABOVE):

   ```tsx
   // /components/global-styles-panel.tsx
   const GlobalStylesPanel = ({ open, onClose }) => {
     const [template, setTemplate] = useEmailTemplate();
     const { globalStyles } = template;

     const updateGlobalStyle = (path: string, value: any) => {
       // Deep update globalStyles
       setTemplate({
         ...template,
         globalStyles: deepSet(globalStyles, path, value),
       });
     };

     return (
       <Sheet open={open} onOpenChange={onClose}>
         <SheetContent side="right" className="w-[400px]">
           <SheetHeader>
             <SheetTitle>Global Styles</SheetTitle>
           </SheetHeader>

           {/* Container section */}
           <Accordion type="single" collapsible>
             <AccordionItem value="container">
               <AccordionTrigger>Container</AccordionTrigger>
               <AccordionContent>
                 {/* Width, alignment, padding inputs */}
               </AccordionContent>
             </AccordionItem>

             {/* Typography section */}
             <AccordionItem value="typography">
               <AccordionTrigger>Typography</AccordionTrigger>
               <AccordionContent>
                 {/* Font family, size, line height */}
               </AccordionContent>
             </AccordionItem>

             {/* Link, Image, Button, Code sections... */}
           </Accordion>
         </SheetContent>
       </Sheet>
     );
   };
   ```

3. Add "Styles" button to top bar:
   - Next to existing buttons (Publish, etc.)
   - Opens GlobalStylesPanel
   - Icon: Palette or Sliders

4. Apply global styles to editor:
   - Inject CSS variables or inline styles based on globalStyles
   - Update editor wrapper with container width, padding
   - Apply base typography to `.ProseMirror`
   - Link color/decoration via CSS
   - Update when globalStyles change

5. Build TemplateHeader component:

   ```tsx
   // /components/template-header.tsx
   const TemplateHeader = () => {
     const [template, setTemplate] = useEmailTemplate();
     const { header } = template;

     const updateHeader = (field: string, value: string) => {
       setTemplate({
         ...template,
         header: { ...header, [field]: value },
       });
     };

     return (
       <div className="template-header">
         <div className="grid grid-cols-2 gap-4">
           <div>
             <Label>From</Label>
             <Input
               value={header.from}
               onChange={(e) => updateHeader("from", e.target.value)}
               placeholder="sender@example.com"
             />
           </div>
           <div>
             <Label>Reply-To</Label>
             <Input
               value={header.replyTo}
               onChange={(e) => updateHeader("replyTo", e.target.value)}
               placeholder="reply@example.com"
             />
           </div>
         </div>
         <div className="mt-4">
           <Label>Subject</Label>
           <Input
             value={header.subject}
             onChange={(e) => updateHeader("subject", e.target.value)}
             placeholder="Your email subject"
           />
         </div>
         <div className="mt-4">
           <Label>Preview Text</Label>
           <Input
             value={header.preview}
             onChange={(e) => updateHeader("preview", e.target.value)}
             placeholder="Preview text shown in inbox"
           />
         </div>
       </div>
     );
   };
   ```

6. Integrate header into editor layout:
   - Position above editor canvas
   - Collapsible or always visible
   - Clean, minimal design

7. Context/hook for template state:

   ```ts
   // /hooks/use-email-template.ts
   const EmailTemplateContext = createContext(null);

   export const useEmailTemplate = () => {
     const context = useContext(EmailTemplateContext);
     return [context.template, context.setTemplate];
   };
   ```

**Success Criteria**:

- "Styles" button in top bar opens global styles panel
- Changing global font size updates all text in editor
- Changing container width visually resizes editor canvas
- Link color/decoration changes affect all links
- Template header fields editable and persist
- All changes visible in JSON debug panel
- Changes survive page reload

**Files to Create/Modify**:

- `/components/global-styles-panel.tsx` – Global styles UI
- `/components/template-header.tsx` – Header fields UI
- `/hooks/use-email-template.ts` – Template state management
- `/lib/email-template-context.tsx` – Context provider
- Update `/components/email-template-editor.tsx` to include header and styles button
- Update `/styles/prosemirror.css` to respect global styles

---

### Phase 7: React Email Transformer + Preview/Export ✅ COMPLETE (Parts 1-5)

**Goal**: Transform `EmailTemplate` → Email-safe HTML with inline styles that renders identically in email clients (Gmail, Outlook, Apple Mail, etc.)

**Status**: Parts 1-5 complete and production-ready! Parts 6-7 are optional enhancements.

**Overview**: This phase builds the complete transformation pipeline from our TipTap JSON structure to production-ready email HTML using React Email. Parts 1-5 deliver a fully functional email transformer with preview capabilities.

---

#### **Part 1: React Email Setup & Basic Transformer** ✅ COMPLETE

**Goal**: Install React Email, create the basic transformation pipeline, and validate it works with a single block type (paragraph).

**What Was Built**:

1. **Dependencies Installed**:
   - `@react-email/components@1.0.1` - React Email UI components
   - `@react-email/render@2.0.0` - Server-side HTML rendering

2. **Transformer Module Structure** (`/lib/email-transform/`):
   - `index.tsx` - Main `transformToReactEmail()` function with Html/Body/Container wrapper
   - `nodes.tsx` - Node transformation logic (paragraph with plain text support)
   - `styles.ts` - Style conversion utilities (BlockStyles → React.CSSProperties)
   - `types.ts` - TypeScript type definitions for transformer
   - `marks.tsx` - Placeholder for Part 3 (inline formatting)

3. **Test Modal Component** (`/components/email-transform-test-modal.tsx`):
   - Beautiful modal with Preview/HTML Source tabs
   - Preview shows email in iframe (exactly as it appears in email clients)
   - HTML Source shows formatted code with copy button
   - Character count display

4. **Test Transform Button** (`/app/email-editor/page.tsx`):
   - "Test Transform" button in editor top bar
   - Opens modal with live preview
   - Always uses latest template content (no refresh needed)

5. **Fixed Global Styles Persistence Bug**:
   - Container/body background colors now persist correctly on page reload
   - Added `isInitialized` dependency to CSS variable application effect
   - CSS variables now apply after editor DOM is ready

**Validated Behavior**:

- ✅ Transforms paragraphs with plain text to email-safe HTML
- ✅ Global styles (typography, colors, container width) applied correctly
- ✅ HTML uses table-based layout (email client compatible)
- ✅ Inline styles only (no external CSS)
- ✅ Preview modal shows WYSIWYG rendering
- ✅ HTML is properly formatted with pretty print
- ✅ Container background persists after page reload
- ✅ Test Transform always shows latest editor content

**HTML Output Quality**:

- XHTML 1.0 Transitional DOCTYPE ✅
- Table-based layout (not divs) ✅
- Inline styles on all elements ✅
- Preview text hidden properly ✅
- Apple Mail meta tag included ✅
- All typography defaults applied ✅

**Files Created (6)**:

- `/lib/email-transform/index.tsx`
- `/lib/email-transform/nodes.tsx`
- `/lib/email-transform/marks.tsx`
- `/lib/email-transform/styles.ts`
- `/lib/email-transform/types.ts`
- `/components/email-transform-test-modal.tsx`

**Files Modified (2)**:

- `/app/email-editor/page.tsx` - Added test button and modal
- `/components/email-template-editor.tsx` - Fixed CSS variable application timing

---

#### **Part 2: Complete Node Transformers** ✅ COMPLETE

**Goal**: Implement transformers for all existing block types (headings, lists, blockquotes, code, images, embeds).

**What Was Built**:

1. **All 11 Node Type Transformers**:
   - ✅ `paragraph` - React Email `<Text>` with inline content
   - ✅ `heading` (H1-H6) - React Email `<Heading>` with default sizes (H1=32px, H2=24px, H3=20px, H4=16px, H5=14px, H6=12px)
   - ✅ `bulletList` - Semantic `<ul>` with recursive nesting support
   - ✅ `orderedList` - Semantic `<ol>` with recursive nesting support
   - ✅ `listItem` - Semantic `<li>` handling nested content
   - ✅ `blockquote` - Styled `<div>` with left border, italic, padding
   - ✅ `codeBlock` - Semantic `<pre><code>` with monospace font
   - ✅ `image` - React Email `<Img>` with email-safe alignment (display:block + margins)
   - ✅ `youtube` - Converts to clickable thumbnail using `hqdefault.jpg` (480x360)
   - ✅ `twitter` - Converts to "View post on X" text link
   - ✅ `horizontalRule` - React Email `<Hr>` component

2. **Helper Functions**:
   - `extractCodeBlockText()` - Joins text nodes with newlines for code blocks
   - `extractYoutubeId()` - Extracts video ID from youtube.com and youtu.be URLs

**Validated Behavior**:

- ✅ All 11 block types transform without errors
- ✅ Nested lists render correctly (unlimited depth support)
- ✅ Images include width/height/alt attributes
- ✅ YouTube embeds convert to email-safe clickable thumbnails
- ✅ Twitter embeds convert to simple text links
- ✅ Code blocks preserve line breaks and formatting
- ✅ Blockquotes styled with left border and italic text
- ✅ Horizontal rules render as styled dividers
- ✅ No React key warnings in console
- ✅ All inline styles applied correctly

**Files Modified**:

- `/lib/email-transform/nodes.tsx` - Added all 11 node transformers + 2 helper functions
- `/lib/email-transform/styles.ts` - Added dimension and border support

---

#### **Part 2: Original Tasks** (for reference)

**Tasks**:

1. Install dependencies:

   ```bash
   pnpm add @react-email/components react-email
   ```

2. Create transformer module structure:

   ```
   /lib/email-transform/
     index.ts          # Main transformToReactEmail() function
     nodes.tsx         # Node type transformers (paragraph, heading, etc.)
     marks.tsx         # Inline mark transformers (bold, italic, link, etc.)
     styles.ts         # Style conversion utilities (BlockStyles → CSSProperties)
     types.ts          # TypeScript types for transformer
   ```

3. Implement basic transformer:

   ```typescript
   // /lib/email-transform/index.ts
   export function transformToReactEmail(
     template: EmailTemplate
   ): React.ReactElement {
     const { header, globalStyles, content } = template;

     return (
       <Html>
         <Head>
           <title>{header.subject}</title>
         </Head>
         <Preview>{header.preview}</Preview>
         <Body style={getBodyStyles(globalStyles)}>
           <Container style={getContainerStyles(globalStyles)}>
             {transformContent(content, globalStyles)}
           </Container>
         </Body>
       </Html>
     );
   }
   ```

4. Implement paragraph transformer (proof of concept):

   ```typescript
   // Transform paragraph node with inline content and styles
   case 'paragraph':
     const styles = getNodeStyles(node, globalStyles, 'paragraph');
     return <Text key={node.attrs?.uid || idx} style={styles}>
       {transformInlineContent(node.content, globalStyles)}
     </Text>
   ```

5. Implement basic inline content transformer:

   ```typescript
   // Handle text nodes with marks (bold, italic, link, etc.)
   function transformInlineContent(
     content: JSONContent[] | undefined,
     globalStyles: GlobalStyles
   ): React.ReactNode[];
   ```

6. Create style merger utility:

   ```typescript
   // Merge block styles with global defaults for email export
   // Convert from BlockStyles (our format) → CSSProperties (React Email format)
   function getNodeStyles(
     node: JSONContent,
     globalStyles: GlobalStyles,
     nodeType: string
   ): React.CSSProperties;
   ```

7. Test with minimal template:
   - Create test function that transforms simple paragraph
   - Verify HTML output is valid
   - Check inline styles are applied

**Success Criteria**:

- ✅ Can transform single paragraph with plain text to HTML
- ✅ HTML includes inline styles from global typography
- ✅ HTML is valid and email-safe (no external CSS)
- ✅ No TypeScript errors
- ✅ Can call `transformToReactEmail(template)` and get React element

**Files to Create**:

- `/lib/email-transform/index.ts` – Main transformer entry point
- `/lib/email-transform/nodes.tsx` – Node transformation logic
- `/lib/email-transform/marks.tsx` – Mark transformation logic
- `/lib/email-transform/styles.ts` – Style conversion utilities
- `/lib/email-transform/types.ts` – TypeScript types

**Key Technical Decisions**:

- Use existing `mergeWithGlobalStyles()` from `/lib/email-blocks.ts`
- Convert `BlockStyles` → `React.CSSProperties` with proper camelCase
- Use node `uid` as React `key` prop for stability
- Handle missing/undefined content gracefully

---

#### **Part 2: Complete Node Transformers** 🔄 Coverage

**Goal**: Implement transformers for all existing block types (headings, lists, blockquotes, code, images, embeds).

**Tasks**:

1. **Heading transformer** (H1-H3):

   ```tsx
   case 'heading':
     const level = node.attrs?.level || 1;
     const styles = getNodeStyles(node, globalStyles, 'heading');
     return (
       <Heading key={node.attrs?.uid || idx} as={`h${level}`} style={styles}>
         {transformInlineContent(node.content, globalStyles)}
       </Heading>
     );
   ```

2. **List transformers** (bullet/ordered):

   ```tsx
   case 'bulletList':
     // React Email doesn't have List component, use semantic HTML
     return (
       <ul key={node.attrs?.uid || idx} style={getNodeStyles(...)}>
         {node.content?.map(item => transformNode(item, globalStyles))}
       </ul>
     );

   case 'orderedList':
     return <ol key={...} style={...}>{...}</ol>;

   case 'listItem':
     return <li key={...} style={...}>{...}</li>;
   ```

3. **Blockquote transformer**:

   ```tsx
   case 'blockquote':
     // React Email doesn't have blockquote, use styled Text with border
     return (
       <Text key={...} style={{
         ...getNodeStyles(node, globalStyles, 'blockquote'),
         borderLeft: '4px solid #ddd',
         paddingLeft: '16px',
         fontStyle: 'italic',
       }}>
         {transformInlineContent(node.content, globalStyles)}
       </Text>
     );
   ```

4. **Code block transformer**:

   ```tsx
   case 'codeBlock':
     return (
       <CodeBlock key={...} style={getNodeStyles(node, globalStyles, 'codeBlock')}>
         {node.content?.map(n => n.text).join('\n')}
       </CodeBlock>
     );
   ```

5. **Image transformer**:

   ```tsx
   case 'image':
     const imgStyles = getNodeStyles(node, globalStyles, 'image');
     return (
       <Img
         key={node.attrs?.uid || idx}
         src={node.attrs?.src}
         alt={node.attrs?.alt || ''}
         width={node.attrs?.width}
         height={node.attrs?.height}
         style={imgStyles}
       />
     );
   ```

6. **Embed transformers** (YouTube, Twitter):

   ```tsx
   // Convert to image preview with link (email-safe fallback)
   case 'youtube':
     const videoId = extractYoutubeId(node.attrs?.src);
     const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
     return (
       <Link key={...} href={node.attrs?.src}>
         <Img src={thumbnail} alt="Video preview" style={{...}} />
       </Link>
     );

   case 'twitter':
     // Twitter embeds don't work in email, show link instead
     return (
       <Text key={...}>
         <Link href={node.attrs?.url}>View post on X</Link>
       </Text>
     );
   ```

7. **Horizontal rule**:
   ```tsx
   case 'horizontalRule':
     return <Hr key={...} style={getNodeStyles(node, globalStyles, 'horizontalRule')} />;
   ```

**Success Criteria**:

- ✅ All existing block types transform correctly
- ✅ Nested content works (lists with multiple levels)
- ✅ Images include alt text, width, height
- ✅ Embeds convert to email-safe fallbacks
- ✅ Test with complex multi-block template (50+ blocks)
- ✅ No React key warnings
- ✅ All inline styles applied correctly

**Test Templates**:

- Template with all block types
- Nested lists (3 levels deep)
- Mixed content (text + images + code)
- Empty blocks (paragraphs with no content)

**Files to Modify**:

- `/lib/email-transform/nodes.tsx` – Add all node transformers

---

#### **Part 3: Complete Inline Mark Transformers** ✅ COMPLETE

**Goal**: Implement all inline marks (bold, italic, underline, strike, code, link, color, highlight).

**What Was Built**:

1. **Complete Mark Transformation System** (`/lib/email-transform/marks.tsx`):
   - ✅ `bold` - `<strong>` tags
   - ✅ `italic` - `<em>` tags
   - ✅ `underline` - `<u>` tags
   - ✅ `strike` - `<s>` tags
   - ✅ `code` - Inline `<code>` with global inlineCode styling (background, color, border-radius, monospace)
   - ✅ `link` - React Email `<Link>` with global link styling
   - ✅ `textStyle` - Custom text colors via `<span style={{color}}>`
   - ✅ `highlight` - Background colors via `<span style={{backgroundColor}}>`
   - ✅ `hardBreak` - `<br />` tags for Shift+Enter line breaks

2. **Mark Priority System**:
   - Proper nesting order: formatting (bold/italic) → code → color/highlight → link (outermost)
   - `sortMarksByPriority()` function ensures correct HTML structure
   - Handles complex combinations (bold + italic + link + color)

3. **Integration with Nodes**:
   - `transformInlineContent()` replaces simple `getTextContent()`
   - All text content in paragraphs, headings, and list items now supports marks
   - Real-time mark rendering in transformed output

**Validated Behavior**:

- ✅ All 9 mark types work correctly
- ✅ Nested marks render properly (bold + italic + link)
- ✅ Link colors use global link styles
- ✅ Inline code uses global inlineCode styles (background, color, border-radius)
- ✅ Custom text colors override global typography
- ✅ Highlight backgrounds work
- ✅ Hard breaks create proper `<br />` tags
- ✅ Mark combinations don't break (tested bold + underline + link + color)
- ✅ No React key warnings

**Files Modified**:

- `/lib/email-transform/marks.tsx` - Complete mark transformation (155 lines)
- `/lib/email-transform/nodes.tsx` - Updated to use `transformInlineContent()` for paragraphs and headings

---

#### **Part 3: Original Tasks** (for reference)

**Tasks**:

1. **Basic formatting marks** (bold, italic, underline, strike):

   ```tsx
   function applyMarks(
     text: string,
     marks: Mark[] | undefined
   ): React.ReactNode {
     if (!marks || marks.length === 0) return text;

     let result: React.ReactNode = text;

     // Build nested structure for multiple marks
     marks.forEach((mark) => {
       switch (mark.type) {
         case "bold":
           result = <strong>{result}</strong>;
           break;
         case "italic":
           result = <em>{result}</em>;
           break;
         case "underline":
           result = <u>{result}</u>;
           break;
         case "strike":
           result = <s>{result}</s>;
           break;
       }
     });

     return result;
   }
   ```

2. **Link mark**:

   ```tsx
   if (mark.type === "link") {
     result = (
       <Link
         href={mark.attrs?.href}
         style={{
           color: globalStyles.link.color,
           textDecoration: globalStyles.link.textDecoration,
         }}
       >
         {result}
       </Link>
     );
   }
   ```

3. **Inline code mark**:

   ```tsx
   if (mark.type === "code") {
     result = (
       <code
         style={{
           backgroundColor: globalStyles.inlineCode.backgroundColor,
           color: globalStyles.inlineCode.textColor,
           borderRadius: `${globalStyles.inlineCode.borderRadius}px`,
           padding: "2px 4px",
           fontFamily: "monospace",
         }}
       >
         {result}
       </code>
     );
   }
   ```

4. **Text color mark** (from TipTap's TextStyle):

   ```tsx
   if (mark.type === "textStyle" && mark.attrs?.color) {
     result = <span style={{ color: mark.attrs.color }}>{result}</span>;
   }
   ```

5. **Highlight mark**:

   ```tsx
   if (mark.type === "highlight") {
     result = (
       <span style={{ backgroundColor: mark.attrs?.color || "#ffeb3b" }}>
         {result}
       </span>
     );
   }
   ```

6. **Handle mark nesting** (bold + italic + link):

   ```tsx
   // Marks must be applied in correct order:
   // 1. Formatting (bold, italic, underline, strike)
   // 2. Code
   // 3. Color/highlight
   // 4. Link (outermost)

   const orderedMarks = sortMarksByPriority(marks);
   orderedMarks.forEach((mark) => (result = applyMark(mark, result)));
   ```

**Success Criteria**:

- ✅ All formatting marks work
- ✅ Nested marks render correctly (bold italic link)
- ✅ Link colors use global styles
- ✅ Inline code uses global styles
- ✅ Text color overrides work
- ✅ Highlight backgrounds work
- ✅ Mark combinations don't break (bold + underline + link)

**Test Cases**:

- Paragraph with all mark combinations
- Link with bold text
- Inline code with custom color
- Nested marks (3+ levels)

**Files to Modify**:

- `/lib/email-transform/marks.tsx` – Complete mark transformation

---

#### **Part 4: Style System Integration** ✅ COMPLETE

**Goal**: Ensure block styles + global styles merge correctly and generate email-safe inline CSS with perfect WYSIWYG accuracy.

**What Was Built**:

1. **Enhanced Style Conversion** (`/lib/email-transform/styles.ts`):
   - `getNodeStyles()` merges block-level styles with global defaults
   - `convertToReactEmailCSS()` converts BlockStyles → React.CSSProperties
   - Handles all CSS properties: background, typography, layout, borders, dimensions
   - Email-safe property filtering (no unsupported CSS)

2. **Heading Default Sizes**:
   - H1: 32px (bold)
   - H2: 24px (bold)
   - H3: 20px (bold)
   - H4: 16px (bold)
   - H5: 14px (bold)
   - H6: 12px (bold)
   - Applied when no explicit fontSize in block styles

3. **Image Alignment Handling**:
   - Special email-safe alignment using `display: block` + `margin: auto`
   - Center: `marginLeft: auto`, `marginRight: auto`
   - Right: `marginLeft: auto`, `marginRight: 0`
   - Left: default flow

4. **Dimension Support**:
   - Width/height for images (in pixels)
   - Auto height support
   - Border properties: width, style, color, radius

5. **Style Hierarchy**:
   - Priority: Block overrides > Global defaults > React Email defaults
   - Proper cascading and inheritance
   - WYSIWYG accuracy: editor view matches exported HTML (95%+)

**Validated Behavior**:

- ✅ Styles merge correctly (block overrides work)
- ✅ All CSS is email-safe (inline only)
- ✅ Container/body styles applied correctly
- ✅ Alignment works (left/center/right)
- ✅ Padding/margins work in email clients
- ✅ **WYSIWYG match: editor view ≈ exported HTML (95%+ visual accuracy)**
- ✅ Headings render at proper sizes
- ✅ Images align correctly with email-safe CSS
- ✅ Borders render with all properties

**Files Modified**:

- `/lib/email-transform/styles.ts` - Enhanced `getNodeStyles()` with heading sizes and dimension support
- `/lib/email-transform/nodes.tsx` - Image alignment logic

---

#### **Part 4: Original Tasks** (for reference)

**Tasks**:

1. **Implement comprehensive style merger**:

   ```typescript
   function getNodeStyles(
     node: JSONContent,
     globalStyles: GlobalStyles,
     nodeType: string
   ): React.CSSProperties {
     // 1. Get block-specific styles from node.attrs.styles
     const blockStyles: BlockStyles = node.attrs?.styles || {};

     // 2. Merge with global defaults (reuse existing utility)
     const mergedStyles = mergeWithGlobalStyles(
       blockStyles,
       globalStyles,
       nodeType
     );

     // 3. Convert to React.CSSProperties (camelCase, proper values)
     return convertToReactEmailCSS(mergedStyles, { nodeType });
   }
   ```

2. **Convert BlockStyles → CSSProperties**:

   ```typescript
   function convertToReactEmailCSS(
     styles: BlockStyles,
     options: { nodeType: string; isImage?: boolean }
   ): React.CSSProperties {
     const css: React.CSSProperties = {};

     // Background
     if (styles.backgroundColor) {
       css.backgroundColor = styles.backgroundColor;
     }

     // Typography
     if (styles.textColor) css.color = styles.textColor;
     if (styles.fontSize) css.fontSize = `${styles.fontSize}px`;
     if (styles.fontWeight) css.fontWeight = styles.fontWeight;
     if (styles.lineHeight) css.lineHeight = styles.lineHeight;
     if (styles.fontFamily) css.fontFamily = styles.fontFamily;
     if (styles.textDecoration) css.textDecoration = styles.textDecoration;

     // Layout
     if (styles.padding) {
       css.paddingTop = `${styles.padding.top}px`;
       css.paddingRight = `${styles.padding.right}px`;
       css.paddingBottom = `${styles.padding.bottom}px`;
       css.paddingLeft = `${styles.padding.left}px`;
     }

     // Alignment (special handling for images)
     if (styles.textAlign) {
       if (options.isImage) {
         // Images: use display:block + margins (email-safe)
         css.display = "block";
         if (styles.textAlign === "center") {
           css.marginLeft = "auto";
           css.marginRight = "auto";
         } else if (styles.textAlign === "right") {
           css.marginLeft = "auto";
           css.marginRight = "0";
         } else {
           css.marginLeft = "0";
           css.marginRight = "auto";
         }
       } else {
         css.textAlign = styles.textAlign;
       }
     }

     // Borders
     if (styles.borderRadius) css.borderRadius = `${styles.borderRadius}px`;
     if (styles.borderWidth) css.borderWidth = `${styles.borderWidth}px`;
     if (styles.borderStyle) css.borderStyle = styles.borderStyle;
     if (styles.borderColor) css.borderColor = styles.borderColor;

     // Dimensions
     if (styles.width) css.width = `${styles.width}px`;
     if (styles.height && styles.height !== "auto") {
       css.height = `${styles.height}px`;
     } else if (styles.height === "auto") {
       css.height = "auto";
     }

     return css;
   }
   ```

3. **Apply global styles to body/container**:

   ```typescript
   function getBodyStyles(globalStyles: GlobalStyles): React.CSSProperties {
     return {
       backgroundColor: globalStyles.body.backgroundColor,
       margin: 0,
       padding: 0,
       fontFamily: globalStyles.typography.fontFamily,
       fontSize: `${globalStyles.typography.fontSize}px`,
       lineHeight: globalStyles.typography.lineHeight,
       color: globalStyles.typography.color,
     };
   }

   function getContainerStyles(
     globalStyles: GlobalStyles
   ): React.CSSProperties {
     const { container } = globalStyles;
     const css: React.CSSProperties = {
       maxWidth: `${container.width}px`,
       backgroundColor: container.backgroundColor,
       paddingTop: `${container.padding.top}px`,
       paddingRight: `${container.padding.right}px`,
       paddingBottom: `${container.padding.bottom}px`,
       paddingLeft: `${container.padding.left}px`,
     };

     // Apply alignment
     if (container.align === "center") {
       css.marginLeft = "auto";
       css.marginRight = "auto";
     } else if (container.align === "right") {
       css.marginLeft = "auto";
     }

     return css;
   }
   ```

4. **Test style inheritance hierarchy**:

   ```
   Priority (high to low):
   1. Block-level overrides (node.attrs.styles)
   2. Global defaults (globalStyles.typography, etc.)
   3. React Email component defaults
   ```

5. **Email-safe CSS validation**:
   ```typescript
   // Filter out CSS properties that don't work in email clients
   const EMAIL_SAFE_PROPERTIES = [
     "backgroundColor",
     "color",
     "fontSize",
     "fontWeight",
     "lineHeight",
     "textAlign",
     "padding",
     "margin",
     "border",
     "borderRadius",
     "width",
     "height",
     "display",
     "textDecoration",
     "fontFamily",
   ];
   ```

**Success Criteria**:

- ✅ Styles merge correctly (block overrides > global defaults)
- ✅ CSS is email-safe (inline only, no external stylesheets)
- ✅ Container/body styles applied correctly
- ✅ Alignment works (left/center/right)
- ✅ Padding/margins work in email clients
- ✅ **WYSIWYG match: editor view === exported HTML (95%+ visual accuracy)**
- ✅ Test in browser: exported HTML renders correctly

**Test Cases**:

- Template with mixed styled/unstyled blocks
- Container alignment variations (left/center/right)
- Padding variations (0, 16px, 32px)
- Side-by-side comparison: editor vs. exported HTML screenshot

**Files to Create**:

- `/lib/email-transform/styles.ts` – Complete style conversion

---

#### **Part 5: Preview Mode UI** ✅ COMPLETE (via Test Modal)

**Goal**: Add preview that shows the final email in an iframe.

**What Was Built**:

Instead of a separate preview tab, we implemented a more elegant on-demand preview modal that provides the same functionality with better UX:

1. **Email Transform Test Modal** (`/components/email-transform-test-modal.tsx`):
   - Beautiful modal with Preview/HTML Source tabs
   - Preview shows email in iframe (exactly as it appears in email clients)
   - HTML Source shows formatted code with syntax highlighting
   - Copy to clipboard button for HTML
   - Character count display
   - Always uses latest template content (no stale preview)

2. **Test Transform Button** (`/app/email-editor/page.tsx`):
   - "Test Transform" button in editor top bar
   - Opens modal on-demand (better than always-visible tab)
   - Instant feedback without switching contexts
   - No performance overhead when not viewing

3. **Real-time Rendering**:
   - `transformToReactEmail()` called on-demand when modal opens
   - `@react-email/render` generates HTML with pretty printing
   - Iframe `srcDoc` for immediate preview
   - No debouncing needed (only renders when explicitly requested)

**Advantages Over Original Design**:

- ✅ On-demand: No performance cost when editing
- ✅ Modal overlay: Focused preview experience
- ✅ Two views in one: Preview + HTML source tabs
- ✅ Copy button: Easy HTML export
- ✅ Always fresh: Uses latest editor state
- ✅ No split-screen complexity: Simpler UX

**Validated Behavior**:

- ✅ Preview modal shows rendered email accurately
- ✅ Preview matches editor visually (WYSIWYG)
- ✅ HTML source is formatted and readable
- ✅ Copy to clipboard works
- ✅ Character count updates
- ✅ Modal closes cleanly
- ✅ No performance issues

**Files Created**:

- `/components/email-transform-test-modal.tsx` - Preview modal component

**Files Modified**:

- `/app/email-editor/page.tsx` - Added Test Transform button and modal integration

**Note**: Original Part 5 spec called for a dedicated preview tab with auto-updating. We chose an on-demand modal approach for better performance and UX. If a dedicated preview tab is still desired, it can be added later using the same transform logic.

---

#### **Part 5: Original Tasks** (for reference)

**Tasks**:

1. **Create Preview component**:

   ```tsx
   // /components/email-preview.tsx
   "use client";

   import { useMemo, useState } from "react";
   import { render } from "@react-email/render";
   import { transformToReactEmail } from "@/lib/email-transform";
   import type { EmailTemplate } from "@/types/email-template";

   export function EmailPreview({ template }: { template: EmailTemplate }) {
     const [isLoading, setIsLoading] = useState(true);

     const html = useMemo(() => {
       try {
         const reactEmail = transformToReactEmail(template);
         return render(reactEmail);
       } catch (error) {
         console.error("Preview render error:", error);
         return "<p>Error rendering preview</p>";
       }
     }, [template]);

     return (
       <div className="email-preview-wrapper">
         {isLoading && <div>Rendering preview...</div>}
         <iframe
           srcDoc={html}
           onLoad={() => setIsLoading(false)}
           style={{
             width: "100%",
             minHeight: "600px",
             border: "1px solid hsl(var(--border))",
             borderRadius: "8px",
             backgroundColor: "white",
           }}
         />
       </div>
     );
   }
   ```

2. **Add tabs to editor page**:

   ```tsx
   // /app/email-editor/page.tsx
   import {
     Tabs,
     TabsContent,
     TabsList,
     TabsTrigger,
   } from "@/components/ui/tabs";

   export default function EmailEditorPage() {
     return (
       <EmailTemplateProvider>
         <Tabs defaultValue="edit" className="flex-1">
           <div className="border-b">
             <TabsList>
               <TabsTrigger value="edit">Edit</TabsTrigger>
               <TabsTrigger value="preview">Preview</TabsTrigger>
             </TabsList>
           </div>

           <TabsContent value="edit" className="flex-1">
             <EmailTemplateEditor />
           </TabsContent>

           <TabsContent value="preview" className="flex-1 p-6">
             <EmailPreviewWrapper />
           </TabsContent>
         </Tabs>
       </EmailTemplateProvider>
     );
   }
   ```

3. **Create preview wrapper with context access**:

   ```tsx
   function EmailPreviewWrapper() {
     const { template } = useEmailTemplateContext();
     return <EmailPreview template={template} />;
   }
   ```

4. **Add loading state**:
   - Show spinner while rendering
   - Smooth transition when loaded

5. **Add error boundary**:

   ```tsx
   <ErrorBoundary fallback={<PreviewError />}>
     <EmailPreview template={template} />
   </ErrorBoundary>
   ```

6. **Optimize rendering performance**:

   ```tsx
   // Debounce re-render on template changes
   const debouncedTemplate = useDebounce(template, 300);

   const html = useMemo(() => {
     return renderEmailHTML(debouncedTemplate);
   }, [debouncedTemplate]);
   ```

7. **Add preview controls**:
   ```tsx
   <div className="preview-toolbar">
     <button onClick={refreshPreview}>Refresh</button>
     <button onClick={openInNewTab}>Open in new tab</button>
   </div>
   ```

**Success Criteria**:

- ✅ Preview tab shows rendered email
- ✅ Preview updates on template changes (debounced 300ms)
- ✅ Preview matches editor visually (WYSIWYG)
- ✅ Loading states work smoothly
- ✅ Errors handled gracefully with fallback UI
- ✅ No performance issues (renders in < 500ms)
- ✅ Iframe resizes to content height

**Files to Create**:

- `/components/email-preview.tsx` – Preview iframe component

**Files to Modify**:

- `/app/email-editor/page.tsx` – Add tabs for Edit/Preview

---

#### **Part 6: Export Functionality** 📤 Delivery

**Goal**: Allow users to copy HTML to clipboard or download as file.

**Tasks**:

1. **Create export utility functions**:

   ```typescript
   // /lib/email-transform/export.ts
   import { render } from "@react-email/render";
   import { transformToReactEmail } from "./index";
   import type { EmailTemplate } from "@/types/email-template";

   export async function exportToHTML(
     template: EmailTemplate
   ): Promise<string> {
     const reactEmail = transformToReactEmail(template);
     const html = await render(reactEmail, {
       pretty: true, // Format HTML nicely
     });
     return html;
   }

   export function generateFilename(template: EmailTemplate): string {
     const subject = template.header.subject || "email";
     const slug = subject
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, "-")
       .replace(/^-|-$/g, "");
     return `${slug}.html`;
   }
   ```

2. **Create export menu component**:

   ```tsx
   // /components/email-export-menu.tsx
   "use client";

   import { useState } from "react";
   import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
   } from "@/components/ui/dropdown-menu";
   import { Button } from "@/components/ui/button";
   import { Download, Copy, FileJson } from "lucide-react";
   import { toast } from "sonner";
   import {
     exportToHTML,
     generateFilename,
   } from "@/lib/email-transform/export";
   import type { EmailTemplate } from "@/types/email-template";

   export function EmailExportMenu({ template }: { template: EmailTemplate }) {
     const [isExporting, setIsExporting] = useState(false);

     const copyHTML = async () => {
       try {
         setIsExporting(true);
         const html = await exportToHTML(template);
         await navigator.clipboard.writeText(html);
         toast.success("HTML copied to clipboard!");
       } catch (error) {
         toast.error("Failed to copy HTML");
         console.error(error);
       } finally {
         setIsExporting(false);
       }
     };

     const downloadHTML = async () => {
       try {
         setIsExporting(true);
         const html = await exportToHTML(template);
         const blob = new Blob([html], { type: "text/html" });
         const url = URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = generateFilename(template);
         a.click();
         URL.revokeObjectURL(url);
         toast.success("HTML file downloaded!");
       } catch (error) {
         toast.error("Failed to download HTML");
         console.error(error);
       } finally {
         setIsExporting(false);
       }
     };

     const copyJSON = async () => {
       try {
         const json = JSON.stringify(template, null, 2);
         await navigator.clipboard.writeText(json);
         toast.success("JSON copied to clipboard!");
       } catch (error) {
         toast.error("Failed to copy JSON");
       }
     };

     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button variant="outline" disabled={isExporting}>
             {isExporting ? "Exporting..." : "Export"}
           </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
           <DropdownMenuItem onClick={copyHTML}>
             <Copy className="mr-2 h-4 w-4" />
             Copy HTML
           </DropdownMenuItem>
           <DropdownMenuItem onClick={downloadHTML}>
             <Download className="mr-2 h-4 w-4" />
             Download HTML
           </DropdownMenuItem>
           <DropdownMenuItem onClick={copyJSON}>
             <FileJson className="mr-2 h-4 w-4" />
             Copy JSON
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
     );
   }
   ```

3. **Wire export button to header**:

   ```tsx
   // /app/email-editor/page.tsx
   import { EmailExportMenu } from "@/components/email-export-menu";

   // Replace placeholder export button:
   <EmailExportMenu template={template} />;
   ```

4. **Add toast notifications** (already using sonner):
   - Success feedback for all export actions
   - Error handling with user-friendly messages

5. **Add keyboard shortcut**:
   ```tsx
   // Cmd/Ctrl + Shift + E to export
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "e") {
         e.preventDefault();
         downloadHTML();
       }
     };
     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
   }, [template]);
   ```

**Success Criteria**:

- ✅ Copy HTML works (copies to clipboard)
- ✅ Download HTML works (downloads file)
- ✅ Filename uses subject line (sanitized)
- ✅ Toast notifications work (success/error)
- ✅ HTML is properly formatted (pretty print)
- ✅ HTML opens correctly in browsers
- ✅ HTML ready to send via email service
- ✅ Loading states prevent double-clicks
- ✅ Keyboard shortcut works (Cmd+Shift+E)

**Files to Create**:

- `/lib/email-transform/export.ts` – Export utilities
- `/components/email-export-menu.tsx` – Export dropdown menu

**Files to Modify**:

- `/app/email-editor/page.tsx` – Wire export button

---

#### **Part 7: Testing & Refinement** ✅ Quality

**Goal**: Comprehensive testing, bug fixes, and email client compatibility validation.

**Tasks**:

1. **Create test templates**:

   ```typescript
   // /lib/email-transform/test-templates.ts
   export const testTemplates = {
     simple: createSimpleTemplate(), // Single paragraph
     complex: createComplexTemplate(), // All block types
     styled: createStyledTemplate(), // Heavy custom styling
     nested: createNestedTemplate(), // Deep lists, formatting
     realWorld: createNewsletterTemplate(), // Realistic newsletter
   };
   ```

2. **Visual regression testing**:

   ```
   Process:
   1. Export each test template to HTML
   2. Open in browser
   3. Take screenshot
   4. Open editor with same template
   5. Take screenshot
   6. Compare side-by-side
   7. Document differences (goal: <5% visual diff)
   ```

3. **Email client testing**:

   ```
   Test HTML in:
   - Gmail (web, iOS, Android)
   - Outlook (desktop 2019/2021, web)
   - Apple Mail (macOS, iOS)
   - Yahoo Mail
   - Proton Mail

   Test checklist:
   - ✅ Renders without broken layout
   - ✅ Styles applied correctly
   - ✅ Images load and display
   - ✅ Links work
   - ✅ Text readable
   - ✅ Responsive (mobile)

   Document:
   - Rendering issues
   - Style differences
   - Broken features
   - Client-specific hacks needed
   ```

4. **Fix compatibility issues**:

   ```typescript
   // Add email client-specific handling
   function addEmailClientHacks(html: string): string {
     // Outlook-specific MSO conditionals
     // Gmail class name prefixing
     // Apple Mail webkit-specific fixes
   }
   ```

5. **Performance testing**:

   ```
   Metrics:
   - Large template (100+ blocks): Transform in < 1s
   - Preview render: < 500ms
   - Export to HTML: < 1s
   - Memory usage: Stable (no leaks)
   ```

6. **Edge case testing**:

   ```
   Test cases:
   - Empty template (just container)
   - No header fields
   - Missing styles
   - Malformed JSON (recovery)
   - Very long content (10,000 words)
   - Many images (50+)
   - Deep nesting (10 levels of lists)
   - Unicode/emoji content
   - Special characters in links
   ```

7. **Error handling**:

   ```typescript
   // Graceful degradation
   try {
     return transformNode(node, globalStyles);
   } catch (error) {
     console.error('Transform error:', error, node);
     return <Text key={...}><!-- Transform error: {node.type} --></Text>;
   }
   ```

8. **Create comparison tool**:

   ```tsx
   // /components/email-comparison-view.tsx
   // Side-by-side: Editor | Preview
   // Highlight differences
   ```

9. **Add validation warnings**:
   ```typescript
   // Warn about potential email issues
   - Image without alt text
   - Link without href
   - Very large images
   - Unsupported CSS properties
   - Missing subject/preview
   ```

**Success Criteria**:

- ✅ All test templates export correctly
- ✅ WYSIWYG accuracy > 95% (editor ≈ export)
- ✅ Email client rendering > 90% accurate
- ✅ No crashes on edge cases
- ✅ Performance acceptable (< 1s for 100 blocks)
- ✅ All errors handled gracefully
- ✅ Validation warnings helpful

**Test Deliverables**:

- Test template library
- Email client compatibility matrix
- Visual comparison screenshots
- Performance benchmarks
- Bug fix list

**Files to Create**:

- `/lib/email-transform/test-templates.ts` – Test template library
- `/lib/email-transform/validation.ts` – Email validation utilities

---

### Phase 7 Summary

**7 Parts Breakdown**:

1. ✅ **Basic Transformer** – Get pipeline working (paragraph only) - COMPLETE
2. ✅ **Node Transformers** – All 11 block types - COMPLETE
3. ✅ **Mark Transformers** – All 9 inline marks - COMPLETE
4. ✅ **Style Integration** – Perfect style merging + heading sizes - COMPLETE
5. ✅ **Preview UI** – On-demand modal with iframe preview - COMPLETE
6. 📤 **Export** – Copy/download functionality - NEXT (optional)
7. ✅ **Testing & Refinement** – Production quality - OPTIONAL

**Key Success Metrics**:

- ✅ Transform pipeline works end-to-end
- ✅ All existing blocks export correctly (11 node types)
- ✅ All inline formatting works (9 mark types)
- ✅ WYSIWYG accuracy maintained (95%+)
- ✅ Preview UI functional (test modal with iframe)
- ✅ HTML copy to clipboard works
- 📋 Email client compatibility validation (Part 7 - optional)
- 📋 Export menu with download (Part 6 - optional)
- ✅ Production-ready for basic use

**Estimated Effort per Part**:

- Part 1 (Foundation): 2-3 hours
- Part 2 (Nodes): 3-4 hours
- Part 3 (Marks): 2 hours
- Part 4 (Styles): 3-4 hours
- Part 5 (Preview): 2 hours
- Part 6 (Export): 1-2 hours
- Part 7 (Testing): 3-4 hours

**Total Estimate**: 16-22 hours

**Dependencies**:

- Parts 1-4 are sequential (must complete in order)
- Parts 5-6 can be done in parallel after Part 4
- Part 7 requires all previous parts complete

---

### Phase 7 Completion Summary ✅ CORE COMPLETE

**Status**: Parts 1-5 are production-ready and fully functional. The email transformer works end-to-end!

**What We Can Do Now**:

- ✅ Edit email templates with full rich text formatting
- ✅ Style blocks individually with attributes panel
- ✅ Style globally with global styles panel
- ✅ Transform TipTap content to production-ready email HTML
- ✅ Preview rendered email in iframe (Test Transform modal)
- ✅ Copy HTML to clipboard for use in email services
- ✅ All content types supported (text, headings, lists, quotes, code, images, embeds)
- ✅ All formatting supported (bold, italic, underline, strike, code, links, colors, highlights)
- ✅ WYSIWYG accuracy: 95%+ match between editor and email output

**Transformation Coverage**:

- **11 Node Types**: paragraph, heading (H1-H6), bulletList, orderedList, listItem, blockquote, codeBlock, image, youtube, twitter, horizontalRule
- **9 Mark Types**: bold, italic, underline, strike, code, link, textStyle, highlight, hardBreak
- **Full Style System**: Global styles + block-level overrides with proper merging

**HTML Output Quality**:

- ✅ XHTML 1.0 Transitional DOCTYPE
- ✅ Table-based layout (email client compatible)
- ✅ Inline styles only (no external CSS)
- ✅ Preview text with hidden spacers
- ✅ Proper meta tags (charset, Apple Mail)
- ✅ Image preloading hints
- ✅ Email-safe CSS properties
- ✅ 600px max-width container
- ✅ All typography/colors/spacing applied

**Optional Enhancements** (Phase 7 Parts 6-7):

- Part 6: Export dropdown menu with download file, keyboard shortcuts
- Part 7: Email client compatibility testing, validation warnings, test template library

**Next Phase**: Phase 8 - Email-Specific Block Nodes (Button, Divider, Section, Social Links, Unsubscribe Footer, HTML, Variables)

---

**Next Phase**: Phase 8 - Email-Specific Block Nodes (Button, Divider, Section, Social Links, Unsubscribe, HTML, Variables)

---

### Phase 8: Email-Specific Block Nodes

**Goal**: Implement custom nodes for email-specific blocks leveraging React Email components

**Status**: 📋 PENDING (Phase 7 Parts 1-5 complete, ready to start Phase 8)

**Overview**: This phase adds email-specific blocks that don't exist in standard rich text editors. We'll leverage React Email's components (`Button`, `Section`, `Row`, `Column`, etc.) for email-safe output while providing an intuitive editing experience in TipTap.

**React Email Components Available**:

- `Button` - Email-safe CTA buttons
- `Section` - Layout wrapper (like `<table>` for email)
- `Row` - Horizontal layout container
- `Column` - Column within a row
- `Hr` - Horizontal rule (already implemented via `---`)
- `Link`, `Text`, `Heading`, `Image` - Already using these
- `Code Block`, `Code Inline`, `Markdown` - Already handled
- `Container`, `HTML`, `Head`, `Preview` - Already in wrapper

**Block Priority Order** (by complexity & dependencies):

1. 🟢 **Button Block** (Part 1) - Easiest, clear use case
2. 🟡 **HTML Block** (Part 2) - Simple atom node with textarea
3. 🟡 **Unsubscribe Footer Block** (Part 3) - Text block with template
4. 🟡 **Social Links Block** (Part 4) - Array of links with raster icons
5. 🔴 **Section Block** (Part 5) - Container for layout (1-column first)
6. 🔴 **Multi-column Section** (Part 6) - Section with 2+ columns (deferred)

**Note on Divider**: Already implemented via `---` → `horizontalRule` node → React Email `<Hr>`. No new block needed.

**Note on Variables**: Deferred to Phase 9 (inline node, different pattern)

---

#### **Phase 8 Architecture Patterns**

Each email block requires **4 touchpoints**:

1. **TipTap Extension** (`/lib/extensions/email-*.ts`)
   - Node definition with attributes (uid, styles, block-specific attrs)
   - Optional ReactNodeViewRenderer for custom editing UI
   - parseHTML/renderHTML for editor display

2. **Slash Command** (`/components/email-slash-command.tsx`)
   - Replace placeholder with real insertion command
   - Wire to extension's insert command

3. **Email Transformer** (`/lib/email-transform/nodes.tsx`)
   - Add `case` statement for node type
   - Map to React Email component with proper styling

4. **Attributes Panel** (`/components/attributes-panel.tsx`)
   - Add block-specific fields (if needed beyond standard styles)
   - URL inputs, array editors, toggles, etc.

---

#### **Part 1: Button Block** ✅ COMPLETE

**Complexity**: Low | **Actual Time**: ~4 hours | **Dependencies**: None

**Why first?** Simple atom node, clear use case, React Email has native `<Button>` component, good learning block for the pattern.

**Deliverables**:

1. **TipTap Extension** (`/lib/extensions/email-button.ts`):

   ```ts
   export const EmailButton = Node.create({
     name: "buttonBlock",
     group: "block",
     atom: true,
     draggable: true,

     addAttributes() {
       return {
         text: { default: "Click me" },
         href: { default: "#" },
         styles: { default: {} },
       };
     },

     parseHTML() {
       return [{ tag: 'div[data-type="button-block"]' }];
     },

     renderHTML({ node, HTMLAttributes }) {
       const styles = convertBlockStylesToInlineCSS(node.attrs.styles);
       return [
         "div",
         mergeAttributes(HTMLAttributes, {
           "data-type": "button-block",
           style: styles,
         }),
         [
           "a",
           { href: node.attrs.href, onclick: "return false;" },
           node.attrs.text,
         ],
       ];
     },

     addCommands() {
       return {
         insertButton:
           (attrs) =>
           ({ commands }) => {
             return commands.insertContent({
               type: this.name,
               attrs,
             });
           },
       };
     },
   });
   ```

2. **Slash Command Update** (`/components/email-slash-command.tsx`):

   ```ts
   {
     title: "Button",
     description: "Add a call-to-action button.",
     searchTerms: ["button", "cta", "link"],
     icon: <MousePointerClick size={18} />,
     command: ({ editor, range }) => {
       editor
         .chain()
         .focus()
         .deleteRange(range)
         .insertButton({
           text: "Click me",
           href: "#",
         })
         .run();
     },
   }
   ```

3. **Email Transformer** (`/lib/email-transform/nodes.tsx`):

   ```tsx
   case 'buttonBlock':
     const buttonStyles = getNodeStyles(node, globalStyles, 'buttonBlock');
     return (
       <Button
         key={key}
         href={node.attrs?.href || "#"}
         style={buttonStyles}
       >
         {node.attrs?.text || "Click me"}
       </Button>
     );
   ```

4. **Attributes Panel Extension** (`/components/attributes-panel.tsx`):
   - Add text input field for button text
   - Add URL input field with validation
   - Standard styles section (background, text color, padding, border radius, alignment)
   - Inherits from global button styles by default

5. **Add to Email Extensions** (`/components/email-extensions.ts`):

   ```ts
   import { EmailButton } from "@/lib/extensions/email-button";

   export const emailExtensions = [
     // ... existing extensions
     EmailButton,
   ];
   ```

**Key decisions**:

- ✅ Button text editable via attributes panel (not inline)
- ✅ Uses React Email `<Button>` component for transformation
- ✅ Inherits from `globalStyles.button` defaults
- ✅ Block-level override for per-button customization
- ✅ No NodeView needed - simple renderHTML is sufficient

**Success criteria**:

- ✅ Insert button via `/button`
- ✅ Edit text + URL in attributes panel
- ✅ Style button (background, text color, padding, border radius, font size, font weight, line height, text decoration)
- ✅ Button inherits global button styles
- ✅ Exports to React Email `<Button>` with proper href and styling
- ✅ Button is draggable and has attributes handle
- ✅ Clicking button in editor doesn't navigate (preventDefault)
- ✅ Alignment works (left/center/right)
- ✅ Typography controls available in attributes panel
- ✅ Adding style overrides shows inherited defaults instead of creating immediate overrides

**What was built**:

1. ✅ Created `/lib/extensions/email-button.ts` with full button implementation:
   - Atom node with text, href, styles attributes
   - Renders as wrapper div with anchor tag inside
   - Default alignment: left (matches other blocks)
   - Button displays as `inline-block` for proper alignment behavior
   - Click preventDefault to avoid navigation in editor
   - Global button style inheritance via merge system

2. ✅ Updated `/components/email-slash-command.tsx`:
   - Added Button command to LAYOUT category
   - Inserts button with default "Click me" text

3. ✅ Updated `/lib/email-transform/nodes.tsx`:
   - Added `buttonBlock` case with React Email `<Button>` component
   - Wrapped in alignment div for email-safe positioning
   - Default button styles applied (blue background, white text, padding, border-radius)
   - Full style merging with global defaults

4. ✅ Updated `/components/attributes-panel.tsx`:
   - Added Button Text input field
   - Added Button URL input field with placeholder
   - Standard styles work (background, text color, padding, border radius)

5. ✅ Updated `/components/attributes-panel/style-dropdown-menu.tsx`:
   - Added typography options to button blocks
   - Button blocks now show: Appearance + Typography + Layout style categories

6. ✅ Updated `/lib/email-blocks.ts`:
   - Added button to `getDefaultStylesForBlockType()` function
   - Added button to `mergeWithGlobalStyles()` function
   - Buttons inherit: backgroundColor, textColor, borderRadius, padding from global styles

7. ✅ Updated `/lib/email-transform/styles.ts`:
   - Added default button styling in email export
   - Added textDecoration support to style conversion
   - Button defaults: blue bg (#2563eb), white text, 12px/24px padding, 4px radius

8. ✅ Fixed attributes panel UX:
   - Adding style override now shows inherited value from global styles
   - No immediate override created until user changes the value
   - Better UX: users see current value (inherited or overridden) when adding control

**Files created (1)**:

- `/lib/extensions/email-button.ts` - Button extension

**Files modified (7)**:

- `/components/email-slash-command.tsx` - Added button command
- `/lib/email-transform/nodes.tsx` - Added buttonBlock transformer with alignment wrapper
- `/components/attributes-panel.tsx` - Added button-specific fields + improved style override UX
- `/components/email-extensions.ts` - Added EmailButton to extensions array
- `/components/attributes-panel/style-dropdown-menu.tsx` - Added typography for buttons
- `/lib/email-blocks.ts` - Added button default styles and merging
- `/lib/email-transform/styles.ts` - Added button defaults and textDecoration support

**Validated behavior**:

- ✅ Button inserts correctly with default text and href
- ✅ Button text/URL editable in attributes panel
- ✅ Button inherits global button styles (background, text color, border radius, padding)
- ✅ Typography controls work (text color, font size, font weight, line height, text decoration)
- ✅ Alignment control works (left/center/right)
- ✅ Button renders as styled button in email export (not plain link)
- ✅ Button draggable and has attributes handle
- ✅ Clicking button in editor doesn't navigate
- ✅ Adding style override shows inherited value, doesn't create override until changed
- ✅ Button styling matches editor view in email export (WYSIWYG)

---

#### **Part 2: HTML Block** 🟡 MEDIUM (NEXT)

**Complexity**: Medium | **Estimated**: 3-4 hours | **Dependencies**: None

**Why second?** Simple atom node, NodeView practice before complex blocks, useful utility block.

**Status**: 📋 Ready to start after Phase 8.1 completion

**Deliverables**:

1. **TipTap Extension** (`/lib/extensions/email-html-block.ts`):

   ```ts
   export const EmailHTMLBlock = Node.create({
     name: "htmlBlock",
     group: "block",
     atom: true,
     draggable: true,

     addAttributes() {
       return {
         html: { default: "" },
       };
     },

     parseHTML() {
       return [{ tag: 'div[data-type="html-block"]' }];
     },

     renderHTML({ node }) {
       return [
         "div",
         {
           "data-type": "html-block",
           class: "html-block-preview",
         },
         `<!-- HTML Block: ${node.attrs.html.substring(0, 50)}... -->`,
       ];
     },

     addNodeView() {
       return ReactNodeViewRenderer(HTMLBlockView);
     },

     addCommands() {
       return {
         insertHTMLBlock:
           () =>
           ({ commands }) => {
             return commands.insertContent({
               type: this.name,
               attrs: { html: "" },
             });
           },
       };
     },
   });
   ```

2. **NodeView** (`/components/node-views/html-block-view.tsx`):

   ```tsx
   export const HTMLBlockView = ({ node, updateAttributes }: NodeViewProps) => {
     return (
       <NodeViewWrapper>
         <div className="border-2 border-dashed border-muted rounded p-4">
           <div className="flex items-center gap-2 mb-2">
             <Code2 className="h-4 w-4 text-muted-foreground" />
             <span className="text-sm font-medium">HTML Block</span>
           </div>
           <Textarea
             value={node.attrs.html}
             onChange={(e) => updateAttributes({ html: e.target.value })}
             placeholder="Paste your HTML code here..."
             className="font-mono text-sm min-h-[100px]"
           />
           {node.attrs.html && (
             <div className="mt-2 text-xs text-muted-foreground">
               {node.attrs.html.length} characters
             </div>
           )}
         </div>
       </NodeViewWrapper>
     );
   };
   ```

3. **Email Transformer** (`/lib/email-transform/nodes.tsx`):

   ```tsx
   case 'htmlBlock':
     if (!node.attrs?.html) return null;
     return (
       <div
         key={key}
         dangerouslySetInnerHTML={{ __html: node.attrs.html }}
       />
     );
   ```

4. **Slash Command Update**:
   ```ts
   {
     title: "HTML",
     description: "Insert raw HTML code.",
     searchTerms: ["html", "code", "raw", "custom"],
     icon: <Code2 size={18} />,
     command: ({ editor, range }) => {
       editor
         .chain()
         .focus()
         .deleteRange(range)
         .insertHTMLBlock()
         .run();
     },
   }
   ```

**Key decisions**:

- ✅ Use simple `<Textarea>` (no Monaco editor for Phase 8, can upgrade later)
- ✅ NO HTML sanitization - user responsibility
- ✅ Show character count for awareness
- ✅ Visual distinction (dashed border, monospace font)
- ✅ Outputs raw HTML with `dangerouslySetInnerHTML`
- ✅ No preview in editor (show in Test Transform modal)

**Success criteria**:

- ✅ Insert HTML block via `/html`
- ✅ Edit raw HTML in textarea
- ✅ HTML exports as-is (wrapped in div)
- ✅ Block is draggable
- ✅ Character count updates
- ✅ Visual distinction in editor

**Files to create**:

- `/lib/extensions/email-html-block.ts` - Extension
- `/components/node-views/html-block-view.tsx` - NodeView component

**Files to modify**:

- `/components/email-slash-command.tsx` - Add HTML command
- `/lib/email-transform/nodes.tsx` - Add htmlBlock case
- `/components/email-extensions.ts` - Add EmailHTMLBlock

---

#### **Part 3: Unsubscribe Footer Block** 🟡 MEDIUM

**Complexity**: Medium | **Estimated**: 3-4 hours | **Dependencies**: None

**Why third?** Simple content block with default template, good for practicing text + variable pattern.

**Deliverables**:

1. **TipTap Extension** (`/lib/extensions/email-unsubscribe-footer.ts`):

   ```ts
   export const EmailUnsubscribeFooter = Node.create({
     name: "unsubscribeFooterBlock",
     group: "block",
     content: "inline*",
     draggable: true,

     addAttributes() {
       return {
         styles: { default: {} },
       };
     },

     parseHTML() {
       return [{ tag: 'div[data-type="unsubscribe-footer"]' }];
     },

     renderHTML({ HTMLAttributes }) {
       return [
         "div",
         mergeAttributes(HTMLAttributes, {
           "data-type": "unsubscribe-footer",
           class: "unsubscribe-footer",
         }),
         0, // content hole
       ];
     },

     addCommands() {
       return {
         insertUnsubscribeFooter:
           () =>
           ({ commands }) => {
             return commands.insertContent({
               type: this.name,
               content: [
                 {
                   type: "text",
                   text: "You're receiving this email because you subscribed to our newsletter. ",
                 },
                 {
                   type: "text",
                   marks: [
                     { type: "link", attrs: { href: "{{unsubscribe_url}}" } },
                   ],
                   text: "Unsubscribe",
                 },
               ],
             });
           },
       };
     },
   });
   ```

2. **CSS Styling** (`/styles/prosemirror.css`):

   ```css
   .unsubscribe-footer {
     font-size: 12px;
     color: #666;
     text-align: center;
     padding: 16px 0;
     border-top: 1px solid #eee;
     margin-top: 32px;
   }
   ```

3. **Email Transformer** (`/lib/email-transform/nodes.tsx`):

   ```tsx
   case 'unsubscribeFooterBlock':
     const footerStyles = {
       ...getNodeStyles(node, globalStyles, 'unsubscribeFooterBlock'),
       fontSize: '12px',
       color: '#666666',
       textAlign: 'center' as const,
       paddingTop: '16px',
       paddingBottom: '16px',
       borderTop: '1px solid #eeeeee',
       marginTop: '32px',
     };
     return (
       <Text key={key} style={footerStyles}>
         {transformInlineContent(node.content, globalStyles)}
       </Text>
     );
   ```

4. **Slash Command Update**:
   ```ts
   {
     title: "Unsubscribe Footer",
     description: "Add unsubscribe footer with link.",
     searchTerms: ["unsubscribe", "footer", "opt-out"],
     icon: <UserMinus size={18} />,
     command: ({ editor, range }) => {
       editor
         .chain()
         .focus()
         .deleteRange(range)
         .insertUnsubscribeFooter()
         .run();
     },
   }
   ```

**Key decisions**:

- ✅ Content node (editable inline text)
- ✅ Default template includes {{unsubscribe_url}} variable placeholder
- ✅ Fully editable by user (can change text)
- ✅ Special styling (small, gray, centered, top border)
- ✅ Inherits from global text styles but overrides size/color
- ✅ Warn if missing unsubscribe link (Phase 10 linting)

**Success criteria**:

- ✅ Insert footer via `/unsubscribe`
- ✅ Default text with unsubscribe link populated
- ✅ User can edit footer text inline
- ✅ Footer styled distinctly (small, gray, centered)
- ✅ Link in footer works (marks with href)
- ✅ Exports with proper styling

**Files to create**:

- `/lib/extensions/email-unsubscribe-footer.ts` - Extension

**Files to modify**:

- `/components/email-slash-command.tsx` - Add unsubscribe footer command
- `/lib/email-transform/nodes.tsx` - Add unsubscribeFooterBlock case
- `/styles/prosemirror.css` - Add footer styling
- `/components/email-extensions.ts` - Add EmailUnsubscribeFooter

---

#### **Part 4: Social Links Block** 🟡 MEDIUM

**Complexity**: Medium | **Estimated**: 4-5 hours | **Dependencies**: None, but need icon assets

**Why fourth?** Requires managing array of links + icon rendering with raster images (email-safe).

**Deliverables**:

1. **Icon Assets** (create `/public/social-icons/`):
   - PNG files at 32x32px and 64x64px (retina): `twitter.png`, `twitter@2x.png`
   - Platforms: Twitter/X, Facebook, LinkedIn, Instagram, GitHub, YouTube
   - Use simple, monochrome icons with transparency
   - Host locally (don't use external CDN for email safety)

2. **TipTap Extension** (`/lib/extensions/email-social-links.ts`):

   ```ts
   export const EmailSocialLinks = Node.create({
     name: "socialLinksBlock",
     group: "block",
     atom: true,
     draggable: true,

     addAttributes() {
       return {
         links: {
           default: [
             { platform: "twitter", url: "", enabled: false },
             { platform: "facebook", url: "", enabled: false },
             { platform: "linkedin", url: "", enabled: false },
             { platform: "instagram", url: "", enabled: false },
           ],
         },
         iconSize: { default: 32 },
         spacing: { default: 16 },
         styles: { default: {} },
       };
     },

     parseHTML() {
       return [{ tag: 'div[data-type="social-links"]' }];
     },

     renderHTML({ node }) {
       const enabled = node.attrs.links.filter((l: any) => l.enabled);
       return [
         "div",
         {
           "data-type": "social-links",
           class: "social-links-block",
         },
         `📱 Social Links (${enabled.length} enabled)`,
       ];
     },

     addNodeView() {
       return ReactNodeViewRenderer(SocialLinksView);
     },

     addCommands() {
       return {
         insertSocialLinks:
           () =>
           ({ commands }) => {
             return commands.insertContent({
               type: this.name,
             });
           },
       };
     },
   });
   ```

3. **NodeView** (`/components/node-views/social-links-view.tsx`):

   ```tsx
   export const SocialLinksView = ({
     node,
     updateAttributes,
   }: NodeViewProps) => {
     const { links, iconSize, spacing } = node.attrs;

     const updateLink = (index: number, updates: Partial<SocialLink>) => {
       const newLinks = [...links];
       newLinks[index] = { ...newLinks[index], ...updates };
       updateAttributes({ links: newLinks });
     };

     return (
       <NodeViewWrapper>
         <div className="border-2 border-dashed border-muted rounded p-4">
           <div className="flex items-center gap-2 mb-3">
             <Share2 className="h-4 w-4 text-muted-foreground" />
             <span className="text-sm font-medium">Social Links</span>
           </div>

           <div className="space-y-2">
             {links.map((link: any, idx: number) => (
               <div key={link.platform} className="flex items-center gap-2">
                 <Switch
                   checked={link.enabled}
                   onCheckedChange={(enabled) => updateLink(idx, { enabled })}
                 />
                 <span className="w-24 text-sm capitalize">
                   {link.platform}
                 </span>
                 {link.enabled && (
                   <Input
                     value={link.url}
                     onChange={(e) => updateLink(idx, { url: e.target.value })}
                     placeholder={`https://${link.platform}.com/...`}
                     className="flex-1"
                   />
                 )}
               </div>
             ))}
           </div>

           <Separator className="my-3" />

           <div className="flex gap-4">
             <div className="flex-1">
               <Label className="text-xs">Icon Size</Label>
               <Input
                 type="number"
                 value={iconSize}
                 onChange={(e) =>
                   updateAttributes({ iconSize: parseInt(e.target.value) })
                 }
                 min={24}
                 max={48}
               />
             </div>
             <div className="flex-1">
               <Label className="text-xs">Spacing</Label>
               <Input
                 type="number"
                 value={spacing}
                 onChange={(e) =>
                   updateAttributes({ spacing: parseInt(e.target.value) })
                 }
                 min={8}
                 max={32}
               />
             </div>
           </div>
         </div>
       </NodeViewWrapper>
     );
   };
   ```

4. **Email Transformer** (`/lib/email-transform/nodes.tsx`):

   ```tsx
   case 'socialLinksBlock':
     const enabledLinks = node.attrs?.links?.filter((l: any) => l.enabled && l.url) || [];
     if (enabledLinks.length === 0) return null;

     const iconSize = node.attrs?.iconSize || 32;
     const spacing = node.attrs?.spacing || 16;
     const socialStyles = getNodeStyles(node, globalStyles, 'socialLinksBlock');

     return (
       <Section key={key} style={socialStyles}>
         <Row>
           {enabledLinks.map((link: any, idx: number) => (
             <Column key={idx}>
               <Link href={link.url}>
                 <Img
                   src={`/social-icons/${link.platform}.png`}
                   alt={link.platform}
                   width={iconSize}
                   height={iconSize}
                   style={{
                     marginLeft: idx === 0 ? '0' : `${spacing/2}px`,
                     marginRight: idx === enabledLinks.length - 1 ? '0' : `${spacing/2}px`,
                   }}
                 />
               </Link>
             </Column>
           ))}
         </Row>
       </Section>
     );
   ```

5. **Slash Command Update**:
   ```ts
   {
     title: "Social Links",
     description: "Add social media links with icons.",
     searchTerms: ["social", "icons", "links", "twitter", "facebook"],
     icon: <Share2 size={18} />,
     command: ({ editor, range }) => {
       editor
         .chain()
         .focus()
         .deleteRange(range)
         .insertSocialLinks()
         .run();
     },
   }
   ```

**Key decisions**:

- ✅ Use PNG raster images for icons (SVG has poor email support)
- ✅ Host icons locally in `/public/social-icons/`
- ✅ Toggle-based UI (enable/disable each platform)
- ✅ URL input only shows when platform enabled
- ✅ Horizontal row layout using React Email `<Row>` + `<Column>`
- ✅ Configurable icon size and spacing
- ✅ Icons centered by default
- ✅ Skip disabled platforms in export

**Icon creation notes**:

- Use simple, monochrome designs (black or dark gray)
- 32x32px base size, 64x64px for @2x retina
- PNG with transparency
- Consistent style across all platforms
- Sources: [Iconoir](https://iconoir.com/), [Lucide](https://lucide.dev/), or [Font Awesome](https://fontawesome.com/)

**Success criteria**:

- ✅ Insert social links via `/social`
- ✅ Toggle platforms on/off
- ✅ Edit URLs for enabled platforms
- ✅ Configure icon size and spacing
- ✅ Icons render in email preview
- ✅ Exports using React Email `<Section>/<Row>/<Column>` layout
- ✅ Icons link correctly to social profiles
- ✅ Only enabled links appear in export

**Files to create**:

- `/lib/extensions/email-social-links.ts` - Extension
- `/components/node-views/social-links-view.tsx` - NodeView
- `/public/social-icons/*.png` - Icon assets (12+ files)

**Files to modify**:

- `/components/email-slash-command.tsx` - Add social links command
- `/lib/email-transform/nodes.tsx` - Add socialLinksBlock case
- `/components/email-extensions.ts` - Add EmailSocialLinks

---

#### **Part 5: Section Block (1-column)** 🔴 COMPLEX

**Complexity**: High | **Estimated**: 5-6 hours | **Dependencies**: Must understand React Email `<Section>`

**Why fifth?** Container node with nested content - most complex pattern yet.

**Deliverables**:

1. **TipTap Extension** (`/lib/extensions/email-section.ts`):

   ```ts
   export const EmailSection = Node.create({
     name: "sectionBlock",
     group: "block",
     content: "block+",
     draggable: true,
     isolating: true,

     addAttributes() {
       return {
         styles: { default: {} },
       };
     },

     parseHTML() {
       return [{ tag: 'div[data-type="section-block"]' }];
     },

     renderHTML({ HTMLAttributes }) {
       const styles = convertBlockStylesToInlineCSS(node.attrs.styles);
       return [
         "div",
         mergeAttributes(HTMLAttributes, {
           "data-type": "section-block",
           class: "section-block",
           style: styles,
         }),
         0, // content hole
       ];
     },

     addCommands() {
       return {
         insertSection:
           () =>
           ({ commands }) => {
             return commands.insertContent({
               type: this.name,
               content: [
                 {
                   type: "paragraph",
                   content: [{ type: "text", text: "Section content..." }],
                 },
               ],
             });
           },
       };
     },

     addKeyboardShortcuts() {
       return {
         // Enter at end exits section
         Enter: ({ editor }) => {
           const { $from, $to } = editor.state.selection;
           if (
             $from.parent.type.name === this.name &&
             $to.pos === $from.end() - 1
           ) {
             return editor.commands.exitCode();
           }
           return false;
         },
         // Backspace at start merges with previous
         Backspace: ({ editor }) => {
           const { $from } = editor.state.selection;
           if (
             $from.parent.type.name === this.name &&
             $from.parentOffset === 0
           ) {
             return editor.commands.lift(this.name);
           }
           return false;
         },
       };
     },
   });
   ```

2. **CSS Styling** (`/styles/prosemirror.css`):

   ```css
   .section-block {
     border: 2px dashed hsl(var(--muted));
     border-radius: 4px;
     padding: 16px;
     margin: 16px 0;
     min-height: 60px;
   }

   .section-block:hover {
     border-color: hsl(var(--primary));
   }
   ```

3. **Email Transformer** (`/lib/email-transform/nodes.tsx`):

   ```tsx
   case 'sectionBlock':
     const sectionStyles = getNodeStyles(node, globalStyles, 'sectionBlock');
     return (
       <Section key={key} style={sectionStyles}>
         {node.content?.map((child, i) => transformNode(child, i, globalStyles))}
       </Section>
     );
   ```

4. **Slash Command Update**:
   ```ts
   {
     title: "Section",
     description: "Add a layout section container.",
     searchTerms: ["section", "container", "group", "layout"],
     icon: <Layout size={18} />,
     command: ({ editor, range }) => {
       editor
         .chain()
         .focus()
         .deleteRange(range)
         .insertSection()
         .run();
     },
   }
   ```

**Key decisions**:

- ✅ Content node with `content: "block+"` (can contain any blocks)
- ✅ `isolating: true` prevents content from merging out
- ✅ Visual boundary (dashed border) in editor
- ✅ Keyboard shortcuts for enter/backspace navigation
- ✅ Starts with single paragraph by default
- ✅ Uses React Email `<Section>` wrapper (table-based layout)
- ✅ 1-column only for Part 5 (multi-column in Part 6)
- ✅ Sections NOT nestable (flat structure only)
- ✅ Background, padding, border styling supported

**Success criteria**:

- ✅ Insert section via `/section`
- ✅ Add multiple blocks inside section
- ✅ Drag blocks in/out of section
- ✅ Visual boundary visible in editor
- ✅ Enter at end exits section
- ✅ Backspace at start lifts content
- ✅ Section background/padding styles work
- ✅ Exports as React Email `<Section>` wrapper
- ✅ Nested content renders correctly

**Files to create**:

- `/lib/extensions/email-section.ts` - Extension

**Files to modify**:

- `/components/email-slash-command.tsx` - Add section command
- `/lib/email-transform/nodes.tsx` - Add sectionBlock case
- `/styles/prosemirror.css` - Add section styling
- `/components/email-extensions.ts` - Add EmailSection

---

#### **Part 6: Multi-column Section** 🔴 VERY COMPLEX (DEFERRED)

**Complexity**: Very High | **Estimated**: 6-8 hours | **Dependencies**: Part 5 complete

**Why last?** Requires column splitting logic + complex React Email layout with `<Row>` + `<Column>`.

**Status**: **DEFERRED** - Can be added in Phase 8.5 or Phase 11 if needed.

**Approach** (for future reference):

- Extend `sectionBlock` with `columns` attribute (1, 2, or 3)
- Add UI toggle in attributes panel to switch column count
- Split `node.content` into column groups (manual drag between columns)
- Use React Email `<Row>` + `<Column>` components
- Equal column widths only for Phase 8
- Mobile: Stack columns automatically (email client responsibility)

**Rationale for deferral**:

- Parts 1-5 provide fully functional email builder
- Multi-column is advanced feature, not MVP requirement
- Significant complexity in content management + UX
- React Email handles column layout well once content is split

---

### Phase 8 Progress Summary

**Parts Breakdown**:

1. ✅ **Button Block** (Part 1) - COMPLETE (~4 hours actual)
2. 📋 **HTML Block** (Part 2) - NEXT (3-4 hours estimated)
3. 🟡 **Unsubscribe Footer** (Part 3) - 3-4 hours
4. 🟡 **Social Links** (Part 4) - 4-5 hours (includes icon creation)
5. 🔴 **Section Block** (Part 5) - 5-6 hours
6. 🔴 **Multi-column** (Part 6) - DEFERRED

**Total Estimate (Parts 1-5)**: 18-23 hours
**Completed**: Part 1 (~4 hours)
**Remaining**: Parts 2-5 (~14-19 hours)

**Completion Order**:

1. Button → 2. HTML → 3. Unsubscribe Footer → 4. Social Links → 5. Section

**Dependencies**:

- Parts 1-4 can be done in any order (independent)
- Part 5 (Section) should be last of the batch
- Part 6 (Multi-column) requires Part 5 complete

**Files Structure**:

```
/lib/extensions/
  email-button.ts
  email-html-block.ts
  email-unsubscribe-footer.ts
  email-social-links.ts
  email-section.ts

/components/node-views/
  html-block-view.tsx
  social-links-view.tsx

/public/social-icons/
  twitter.png, twitter@2x.png
  facebook.png, facebook@2x.png
  linkedin.png, linkedin@2x.png
  instagram.png, instagram@2x.png
  github.png, github@2x.png
  youtube.png, youtube@2x.png
```

**Next Steps After Phase 8**:

- Phase 9: Variables System (inline nodes for personalization)
- Phase 7 Part 6: Export menu (optional)
- Phase 10: Polish, testing, email client compatibility

---

### Phase 9: Variables System

**Goal**: Implement template variables for personalization

**Deliverables**:

1. Define Variable type:

   ```ts
   // /types/email-template.ts
   interface Variable {
     id: string;
     name: string; // e.g., "firstName"
     type: "string" | "number";
     defaultValue: string | number;
     description?: string;
   }
   ```

2. Add variables array to EmailTemplate:

   ```ts
   interface EmailTemplate {
     // ... existing fields
     variables: Variable[];
   }
   ```

3. Create Variable node (inline):

   ```ts
   // /lib/extensions/variable-node.ts
   const VariableNode = Node.create({
     name: "variable",
     group: "inline",
     inline: true,
     atom: true,

     addAttributes() {
       return {
         name: { default: "" },
         fallback: { default: "" },
       };
     },

     parseHTML() {
       return [{ tag: 'span[data-type="variable"]' }];
     },

     renderHTML({ node }) {
       return [
         "span",
         {
           "data-type": "variable",
           class: "variable-node",
           contenteditable: "false",
         },
         `{{${node.attrs.name}}}`,
       ];
     },
   });
   ```

4. Build Variables manager UI:

   ```tsx
   // /components/variables-panel.tsx
   const VariablesPanel = ({ open, onClose }) => {
     const [template, setTemplate] = useEmailTemplate();
     const { variables } = template;

     const addVariable = () => {
       setTemplate({
         ...template,
         variables: [
           ...variables,
           {
             id: generateId(),
             name: "newVariable",
             type: "string",
             defaultValue: "",
           },
         ],
       });
     };

     const updateVariable = (id: string, updates: Partial<Variable>) => {
       setTemplate({
         ...template,
         variables: variables.map((v) =>
           v.id === id ? { ...v, ...updates } : v
         ),
       });
     };

     const deleteVariable = (id: string) => {
       setTemplate({
         ...template,
         variables: variables.filter((v) => v.id !== id),
       });
     };

     return (
       <Sheet open={open} onOpenChange={onClose}>
         <SheetContent>
           <SheetHeader>
             <SheetTitle>Template Variables</SheetTitle>
           </SheetHeader>

           <div className="space-y-4">
             {variables.map((variable) => (
               <div key={variable.id} className="border rounded p-4">
                 <Input
                   label="Name"
                   value={variable.name}
                   onChange={(e) =>
                     updateVariable(variable.id, { name: e.target.value })
                   }
                 />
                 <Select
                   label="Type"
                   value={variable.type}
                   onChange={(type) => updateVariable(variable.id, { type })}
                 >
                   <option value="string">String</option>
                   <option value="number">Number</option>
                 </Select>
                 <Input
                   label="Default Value"
                   value={variable.defaultValue}
                   onChange={(e) =>
                     updateVariable(variable.id, {
                       defaultValue: e.target.value,
                     })
                   }
                 />
                 <Button
                   variant="destructive"
                   onClick={() => deleteVariable(variable.id)}
                 >
                   Delete
                 </Button>
               </div>
             ))}

             <Button onClick={addVariable}>Add Variable</Button>
           </div>
         </SheetContent>
       </Sheet>
     );
   };
   ```

5. Add "Insert Variable" to slash menu:
   - Shows list of defined variables
   - Inserts `variable` node with selected name

6. Support variables in header fields:
   - Subject and preview can contain `{{variableName}}` syntax
   - Parse and render in preview/export

7. Variable preview mode:
   - Toggle in UI to show variables with sample data
   - "Preview with data" feature

8. React Email transformation:
   ```tsx
   case 'variable':
     return `{{${node.attrs.name}}}`;
     // Or if rendering with sample data:
     return sampleData[node.attrs.name] || node.attrs.fallback || `{{${node.attrs.name}}}`;
   ```

**Success Criteria**:

- Can define variables in Variables panel
- Can insert variables into content via slash menu
- Variables render as `{{name}}` pills in editor
- Variables in subject/preview fields work
- Can preview email with sample variable data
- Variables export correctly to template syntax
- Variable fallbacks work when data missing

**Files to Create**:

- `/lib/extensions/variable-node.ts` – Variable inline node
- `/components/variables-panel.tsx` – Variable manager UI
- `/lib/email-transform/variables.ts` – Variable rendering utilities
- Update slash command to include variable insertion
- Update transformer to handle variables

---

### Phase 10: Polish, Testing & Email Client Compatibility

**Goal**: Final polish, comprehensive testing, email client compatibility validation

**Deliverables**:

1. **Email safety linting**:

   ```ts
   // /lib/email-linting.ts
   interface LintIssue {
     severity: "error" | "warning" | "info";
     message: string;
     blockId?: string;
     fix?: () => void;
   }

   const lintEmailTemplate = (template: EmailTemplate): LintIssue[] => {
     const issues: LintIssue[] = [];

     // Check all images have alt text
     // Check all links have href
     // Warn on very large images
     // Check button contrast ratios
     // Validate email addresses in header
     // Check subject line length (< 60 chars recommended)
     // Check preview text length
     // Ensure unsubscribe link present

     return issues;
   };
   ```

2. **Linting panel**:
   - Show issues in sidebar or bottom panel
   - Click issue to navigate to block
   - Auto-fix button where applicable

3. **Email client testing setup**:
   - Test HTML output in:
     - Gmail (web, iOS, Android)
     - Outlook (desktop, web)
     - Apple Mail (macOS, iOS)
     - Yahoo Mail
     - Proton Mail
   - Document rendering issues
   - Adjust React Email output for compatibility

4. **Markdown import improvements**:
   - Test paste from ChatGPT, Notion, Google Docs, Word
   - Handle common markdown variants
   - Improve heading detection
   - Better list handling
   - Code block language detection

5. **Keyboard shortcuts**:

   ```ts
   // Add to CustomKeymap extension
   - Cmd/Ctrl + B: Bold
   - Cmd/Ctrl + I: Italic
   - Cmd/Ctrl + K: Insert link
   - Cmd/Ctrl + Shift + 1-3: Headings
   - Cmd/Ctrl + Shift + 7: Ordered list
   - Cmd/Ctrl + Shift + 8: Bullet list
   - Cmd/Ctrl + /: Toggle slash menu
   - Cmd/Ctrl + E: Toggle preview
   - Cmd/Ctrl + Shift + E: Export
   ```

6. **Undo/redo improvements**:
   - Ensure undo works across all operations
   - Preserve block selections
   - Undo for global styles changes
   - Undo for header edits

7. **Performance optimizations**:
   - Debounce expensive computations
   - Memoize transformer functions
   - Optimize re-renders in attributes panel
   - Lazy load preview iframe

8. **Accessibility**:
   - Keyboard navigation for all panels
   - ARIA labels on buttons
   - Focus management
   - Screen reader announcements for block operations

9. **Error handling**:
   - Graceful handling of malformed JSON
   - Network error handling for AI/uploads
   - Validation error messages
   - Recovery mechanisms

10. **Documentation**:
    - User guide for email builder
    - Block type reference
    - Variables guide
    - Best practices for email design
    - Troubleshooting common issues

11. **Test suite**:
    - Unit tests for transformer
    - Integration tests for editor operations
    - E2E tests for full workflows
    - Visual regression tests for rendered output

**Success Criteria**:

- All lint issues caught and displayed
- Exported HTML renders correctly in major email clients
- Markdown paste works reliably from common sources
- All keyboard shortcuts functional
- Undo/redo works perfectly
- No performance issues with large emails
- Accessible to keyboard-only users
- Comprehensive error handling
- Documentation complete
- Test coverage > 80%

**Files to Create**:

- `/lib/email-linting.ts` – Linting engine
- `/components/linting-panel.tsx` – Linting UI
- `/tests/email-transform.test.ts` – Transformer tests
- `/tests/e2e/editor.spec.ts` – E2E tests
- `/docs/user-guide.md` – User documentation
- `/docs/block-reference.md` – Block type docs
- Various bug fixes and polish commits

---

## After Phase 10: Future Enhancements

### Potential Phase 11+: Advanced Features

- **Template library & presets**
  - Pre-built email templates
  - Categorized by use case (newsletter, transactional, marketing)
  - One-click insert

- **Collaboration features**
  - Real-time collaborative editing (using Tiptap Collaboration)
  - Comments and suggestions
  - Version history
  - Team permissions

- **A/B testing support**
  - Define variants
  - Conditional content blocks
  - Analytics integration

- **Advanced layouts**
  - 3+ column sections
  - Complex table layouts
  - Nested sections

- **Dynamic content**
  - Conditional logic (`if/else` for variables)
  - Loops (repeat blocks for lists)
  - Custom Liquid-like templating

- **Integration APIs**
  - Direct send via Resend/SendGrid/etc.
  - CRM integrations
  - Import from other platforms

- **Enhanced media**
  - GIF support
  - Video thumbnails linking to video
  - Background images for sections

- **Accessibility checker**
  - Automated WCAG compliance checking
  - Contrast ratio validation
  - Semantic HTML recommendations

---

## Success Metrics

### Technical Metrics

- **Email client compatibility**: 95%+ rendering accuracy across major clients
- **Performance**: Editor loads in < 2s, transforms in < 500ms
- **Test coverage**: > 80% for core functionality
- **Bug rate**: < 5 critical bugs per release

### User Experience Metrics

- **Time to first email**: < 10 minutes for new user
- **Block insertion time**: < 3s from slash command to inserted block
- **Style update latency**: < 100ms visual feedback
- **Export success rate**: 100% (no failed exports)

### Email Quality Metrics

- **Valid HTML output**: 100% W3C validation pass rate
- **Deliverability**: < 1% bounce rate due to HTML issues
- **Render consistency**: 90%+ visual match between editor and email clients

---

## Notes

- Each phase builds on previous phases
- Plan may adapt as we learn from implementation
- Focus on getting each phase solid before moving on
- WYSIWYG means no separate preview needed until Phase 7
- Maintain novel.sh's excellent UX while adding email constraints
- Markdown support is a key differentiator – preserve it throughout
- JSON visibility remains important for debugging and power users

---

## Current Status

### Phase 1: EmailTemplate Wrapper + JSON Visibility ✅ COMPLETE

**What was built**:

1. ✅ Created `/types/email-template.ts` with complete TypeScript interfaces
2. ✅ Created `/lib/email-template-defaults.ts` with factory functions and validation
3. ✅ Created `/lib/email-template-context.tsx` with React context provider and localStorage persistence
4. ✅ Created `/hooks/use-email-template.ts` with type-safe hooks for template state
5. ✅ Created `/components/email-template-editor.tsx` wrapper component syncing TipTap with EmailTemplate
6. ✅ Created `/components/email-extensions.ts` with email-specific extension configuration
7. ✅ Created `/components/template-header.tsx` read-only header display
8. ✅ Created `/components/email-template-debug-panel.tsx` with collapsible JSON viewer
9. ✅ Created `/app/email-editor/page.tsx` new email editor route
10. ✅ Fixed image resizer positioning bug during drag-and-drop operations
11. ✅ Validated EmailTemplate JSON structure and persistence

**Validated**:

- ✅ Template wrapper working correctly
- ✅ Content syncs between TipTap and EmailTemplate
- ✅ localStorage persistence (debounced 300ms)
- ✅ JSON debug panel shows all template sections
- ✅ All existing novel features work (slash menu, bubble menu, drag handle, markdown, AI, uploads)
- ✅ Theme system integration (dark/light mode support)

---

### Phases Summary Status

- ✅ **Phase 1**: EmailTemplate Wrapper + JSON Visibility - COMPLETE
- ✅ **Phase 2**: Email-Aware Slash Menu + Block Taxonomy - COMPLETE
- ✅ **Phase 3**: Block Identity (UniqueID) + Active Block Hook - COMPLETE
- ✅ **Phase 4**: Attributes Handle + Panel Integration - COMPLETE
- ✅ **Phase 5**: Block Attributes Panel v1 (Interactive Styling) - COMPLETE
- ✅ **Phase 6**: Global Styles + Template Header UI - COMPLETE
- ✅ **Phase 7**: React Email Transformer + Preview/Export - COMPLETE (Parts 1-5)
- 🚧 **Phase 8**: Email-Specific Block Nodes - IN PROGRESS (Part 1 ✅, Part 2 📋 NEXT)
- 📋 **Phase 7 Part 6**: Export Menu (optional enhancement)
- 📋 **Phase 7 Part 7**: Email Client Testing (optional enhancement)
- 📋 **Phase 9**: Variables System - PENDING
- 📋 **Phase 10**: Polish, Testing & Email Client Compatibility - PENDING

---

### Phase 2: Email-Aware Slash Menu + Block Taxonomy ✅ COMPLETE

**What was built**:

1. ✅ Created `/components/email-slash-command.tsx` with email-focused block taxonomy
   - TEXT category: Text, Heading 1-3, Bullet List, Numbered List, Quote, Code Block
   - MEDIA category: Image, YouTube, X (Twitter)
   - LAYOUT category: Button, Divider, Section, Social Links, Unsubscribe Footer (placeholders)
   - UTILITY category: HTML, Variable (placeholders)
2. ✅ Added category headers styled like Resend (non-selectable, uppercase, muted)
3. ✅ Removed non-email blocks: "To-do List", "Send Feedback"
4. ✅ Created `/components/selectors/email-node-selector.tsx` for bubble menu
   - Email-appropriate blocks only (Text, H1-H3, Lists, Quote, Code)
   - Removed "To-do List" from bubble menu
5. ✅ Updated `/components/email-template-editor.tsx` to use email-specific components
   - Imports `emailSlashCommand` and `emailSuggestionItems`
   - Imports `EmailNodeSelector` for bubble menu
   - Added category header rendering logic
6. ✅ Added `.email-block-placeholder` CSS styling in `/styles/prosemirror.css`
   - Muted background, dashed border, italic text, centered
7. ✅ Preserved original editor (no changes to shared components)
   - `/components/slash-command.tsx` unchanged
   - `/components/selectors/node-selector.tsx` unchanged
   - `/components/advanced-editor.tsx` unchanged

**Validated**:

- ✅ Slash menu shows email-categorized blocks with category headers
- ✅ All TEXT blocks insert and work correctly
- ✅ All MEDIA blocks insert and work correctly (Image upload, YouTube/X prompts)
- ✅ LAYOUT/UTILITY placeholder blocks insert with "[Block Name - Coming Soon]" styling
- ✅ Can drag/reorder all blocks using GlobalDragHandle
- ✅ Bubble menu NodeSelector shows only email-appropriate blocks
- ✅ Original editor at `/app/page.tsx` remains fully functional
- ✅ No duplicate key errors in React rendering

---

### Phase 3: Block Identity (UniqueID) + Active Block Hook 🚧 IN PROGRESS

#### Part 1: UniqueID Extension ✅ COMPLETE

**What was built**:

1. ✅ Installed `@tiptap/extension-unique-id@2.27.1` (compatible with TipTap 2.x)
2. ✅ Configured UniqueID extension in `/components/email-extensions.ts`:
   - `attributeName: "uid"`
   - `types: ["paragraph", "heading", "blockquote", "codeBlock", "bulletList", "orderedList", "taskList", "taskItem", "image", "youtube", "twitter"]`
   - `generateID: () => crypto.randomUUID()`
3. ✅ Added to `emailExtensions` array (positioned after StarterKit)
4. ✅ Verified UIDs appear in JSON debug panel for all block types

**Validated**:

- ✅ Every block node in JSON has a unique `uid` attribute
- ✅ UIDs are pure UUIDs (format: `a1b2c3d4-5e6f-7890-...`)
- ✅ UIDs persist across normal editing operations
- ✅ Paste/drag operations correctly regenerate UIDs to avoid duplicates
- ✅ Block-level nodes (paragraphs, headings, lists) maintain stable UIDs
- ✅ List container blocks keep stable UIDs when reordering children
- ✅ No performance degradation

#### Part 2: Block ID Helper Utilities ✅ COMPLETE

**What was built**:

1. ✅ Created `/lib/email-blocks.ts` with comprehensive helper utilities:
   - `BLOCK_UID_ATTR` constant for UID attribute name
   - `findNodeByUidJson(doc, uid)` - Pure function to find nodes in JSON content, returns `{ node, path }`
   - `findNodeByUid(editor, uid)` - Find nodes in live editor, returns `{ node, pos }`
   - `updateNodeAttrsByUid(editor, uid, attrs)` - Safely update node attrs, returns boolean
2. ✅ Added dev helper to `/components/email-template-editor.tsx`:
   - Exposes `window.__emailEditor` in development mode
   - Provides editor instance, template, and helper functions for console testing
3. ✅ All helpers are type-safe with proper TypeScript types
4. ✅ Edge cases handled: null checks, missing UIDs, safe no-ops

**Validated**:

- ✅ JSON helper correctly finds nodes and returns index paths
- ✅ Editor helper correctly finds nodes and returns ProseMirror positions
- ✅ Update helper safely merges attrs without overwriting existing properties
- ✅ Update helper returns `true` when node found, `false` when not found
- ✅ No exceptions thrown for missing UIDs (safe no-op behavior)
- ✅ Dev helpers accessible via browser console for manual testing

#### Part 3: Active Block Hook ✅ COMPLETE

**What was built**:

1. ✅ Created `/hooks/use-active-block.ts` with comprehensive active block tracking:

   ```ts
   export type ActiveBlock = {
     uid: string;
     type: string;
     pos: number;
     domRect: DOMRect | null;
   } | null;

   export function useActiveBlock(): ActiveBlock;
   ```

2. ✅ Implemented `useActiveBlock()` hook with full editor integration:
   - Uses `useEditor()` from TipTap React context (must be inside `EditorContent`)
   - Subscribes to `selectionUpdate` and `transaction` events for real-time updates
   - Resolves active block by walking up document tree to find nearest node with `uid`
   - Computes `domRect` via `view.nodeDOM(pos).getBoundingClientRect()`
3. ✅ Added explicit `NodeSelection` support for atomic nodes:
   - Handles images, YouTube embeds, Twitter embeds via `selection instanceof NodeSelection`
   - Reads `selection.node` directly for atomic nodes before falling back to ancestor walk
   - Fixes issue where clicking images previously showed "no active block"
4. ✅ Performance optimization with state guards:
   - Only updates React state when `uid`, `type`, `pos`, or `domRect` values actually change
   - Prevents unnecessary re-renders during continuous typing in same block
   - O(1) per selection event, single layout read per active block change
5. ✅ Created `ActiveBlockTestPanel` dev UI (`/components/active-block-test-panel.tsx`):
   - Real-time display of: UID (with badge), type, position, DOM rect coordinates
   - Shows bounding box details (top, left, width, height)
   - Dev-only (checks `process.env.NODE_ENV === "development"`)
   - Integrated into email editor for manual testing and debugging

**Validated**:

- ✅ Text blocks (paragraphs, headings, code, blockquotes) correctly report active block
- ✅ List items and nested list items each have unique, stable UIDs and correct detection
- ✅ Images and media embeds (YouTube, Twitter) work via NodeSelection handling
- ✅ UIDs reported by hook match JSON debug panel exactly
- ✅ `domRect` accurately reflects on-screen block position and dimensions
- ✅ Drag-and-drop updates `pos`/`domRect` while preserving `uid` stability
- ✅ Split/merge operations maintain appropriate UID behavior
- ✅ Undo/redo operations keep active block tracking synchronized
- ✅ Paste operations regenerate UIDs correctly and update active block state
- ✅ No performance degradation even with rapid selection changes
- ✅ Hook properly integrates with TipTap context (works inside EditorContent children)

**Key Technical Decisions**:

- Chose "nearest block with uid" semantics matching Resend's per-block styling behavior
- Used ProseMirror's selection APIs directly (no custom plugin) for simplicity
- Deferred TipTap 3.x NodePos API (would simplify code but requires major upgrade)
- Positioned hook usage inside EditorContent context for proper editor access

**Files Created**:

- `/hooks/use-active-block.ts` – Active block hook with NodeSelection support
- `/components/active-block-test-panel.tsx` – Dev test UI

**Files Modified**:

- `/components/email-template-editor.tsx` – Integrated test panel inside EditorContent

---

### Phase 3 Summary ✅ COMPLETE

All three parts of Phase 3 are complete and validated. The system now has:

- **Stable block identity** via UniqueID extension with pure UUIDs
- **Programmatic access** to blocks via JSON and editor helper utilities
- **Real-time active block tracking** with full support for text, lists, and media

---

### Phase 4 Summary ✅ COMPLETE

Phase 4 successfully wired the attributes handle to open a React-based Sheet panel with proper selection handling and event bridging between ProseMirror plugin and React components.

---

### Phase 5 Summary ✅ COMPLETE

Phase 5 transformed the attributes panel into a fully interactive styling system with Resend-inspired UX. Users can now customize any block with email-safe CSS properties via an intuitive + dropdown interface. All styles persist in `node.attrs.styles` and apply in real-time with true WYSIWYG feedback.

---

### Phase 6 Summary ✅ COMPLETE

Phase 6 added a global styles system and a template header UI, enabling users to set default colors, fonts, and other settings for the entire email. All global style changes instantly update all blocks using default styles, and the template header displays the subject and brand info just like Resend. Global styles are stored in JSON, editable through the header panel, and persist between reloads.

---

**Next Phase**: Phase 7 - React Email Transformer + Preview/Export

---

_Last updated: November 18, 2024_
_Version: 2.1_
