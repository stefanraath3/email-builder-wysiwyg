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

### Phase 7: React Email Transformer + Preview/Export

**Goal**: Convert EmailTemplate to React Email components and enable preview/export

**Deliverables**:

1. Install React Email:

   ```bash
   pnpm add @react-email/components
   ```

2. Create transformer module:

   ```ts
   // /lib/email-transform/index.ts
   import { JSONContent } from "@tiptap/react";
   import { EmailTemplate } from "@/types/email-template";
   import * as ReactEmail from "@react-email/components";

   export const transformToReactEmail = (template: EmailTemplate) => {
     const { header, globalStyles, content } = template;

     // Map TipTap JSON to React Email JSX
     const body = transformContent(content, globalStyles);

     return (
       <ReactEmail.Html>
         <ReactEmail.Head>
           <title>{header.subject}</title>
         </ReactEmail.Head>
         <ReactEmail.Preview>{header.preview}</ReactEmail.Preview>
         <ReactEmail.Body style={getBodyStyles(globalStyles)}>
           <ReactEmail.Container style={getContainerStyles(globalStyles)}>
             {body}
           </ReactEmail.Container>
         </ReactEmail.Body>
       </ReactEmail.Html>
     );
   };

   const transformContent = (
     content: JSONContent,
     globalStyles: GlobalStyles
   ) => {
     return content.content?.map((node, idx) => {
       switch (node.type) {
         case "paragraph":
           return (
             <ReactEmail.Text
               key={idx}
               style={getNodeStyles(node, globalStyles)}
             >
               {transformInlineContent(node.content)}
             </ReactEmail.Text>
           );

         case "heading":
           return (
             <ReactEmail.Heading
               key={idx}
               as={`h${node.attrs.level}`}
               style={getNodeStyles(node, globalStyles)}
             >
               {transformInlineContent(node.content)}
             </ReactEmail.Heading>
           );

         case "image":
           return (
             <ReactEmail.Img
               key={idx}
               src={node.attrs.src}
               alt={node.attrs.alt}
               style={getNodeStyles(node, globalStyles)}
             />
           );

         // ... more node types

         default:
           return null;
       }
     });
   };
   ```

3. Implement style transformation:

   ```ts
   // /lib/email-transform/styles.ts
   const getNodeStyles = (node: JSONContent, globalStyles: GlobalStyles) => {
     const blockStyles = node.attrs?.styles || {};

     return {
       // Merge global defaults with block-specific overrides
       backgroundColor: blockStyles.background || "transparent",
       borderRadius: blockStyles.borderRadius || globalStyles.borderRadius,
       padding: blockStyles.padding
         ? `${blockStyles.padding.top}px ${blockStyles.padding.right}px ${blockStyles.padding.bottom}px ${blockStyles.padding.left}px`
         : undefined,
       color: blockStyles.textColor || globalStyles.typography.color,
       fontSize: blockStyles.fontSize || globalStyles.typography.fontSize,
       // ... all style mappings
     };
   };
   ```

4. Build Preview component:

   ```tsx
   // /components/email-preview.tsx
   const EmailPreview = ({ template }: { template: EmailTemplate }) => {
     const reactEmailJSX = transformToReactEmail(template);
     const html = render(reactEmailJSX); // Use React Email's render

     return (
       <div className="email-preview">
         <iframe
           srcDoc={html}
           style={{
             width: "100%",
             minHeight: "600px",
             border: "1px solid #e5e7eb",
             borderRadius: "8px",
           }}
         />
       </div>
     );
   };
   ```

5. Add Preview tab to editor:

   - Tabs component: "Edit" | "Preview"
   - Edit shows normal editor
   - Preview shows rendered email in iframe
   - Toggle between views

6. Build Export functionality:

   ```tsx
   // /components/export-menu.tsx
   const ExportMenu = ({ template }: { template: EmailTemplate }) => {
     const exportHTML = async () => {
       const jsx = transformToReactEmail(template);
       const html = await render(jsx);

       // Download as file
       const blob = new Blob([html], { type: "text/html" });
       const url = URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = url;
       a.download = `${template.header.subject || "email"}.html`;
       a.click();
     };

     const copyHTML = async () => {
       const jsx = transformToReactEmail(template);
       const html = await render(jsx);
       await navigator.clipboard.writeText(html);
       toast.success("HTML copied to clipboard");
     };

     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button variant="outline">Export</Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent>
           <DropdownMenuItem onClick={copyHTML}>Copy HTML</DropdownMenuItem>
           <DropdownMenuItem onClick={exportHTML}>
             Download HTML
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
     );
   };
   ```

7. Handle inline content (bold, italic, links):

   ```ts
   const transformInlineContent = (content?: JSONContent[]) => {
     return content?.map((node, idx) => {
       if (node.type === "text") {
         let text: React.ReactNode = node.text;

         node.marks?.forEach((mark) => {
           switch (mark.type) {
             case "bold":
               text = <strong key={idx}>{text}</strong>;
               break;
             case "italic":
               text = <em key={idx}>{text}</em>;
               break;
             case "link":
               text = (
                 <ReactEmail.Link
                   key={idx}
                   href={mark.attrs.href}
                   style={getLinkStyles(globalStyles)}
                 >
                   {text}
                 </ReactEmail.Link>
               );
               break;
             // ... more marks
           }
         });

         return text;
       }
       return null;
     });
   };
   ```

**Success Criteria**:

- Clicking "Preview" tab shows email rendered via React Email
- Preview visually matches editor (WYSIWYG validated)
- Export > Copy HTML produces valid email HTML string
- Export > Download HTML downloads file
- HTML works in browser (open downloaded file)
- All block types transform correctly
- Global styles + block styles both applied in output
- Inline formatting (bold, italic, links) preserved

**Files to Create**:

- `/lib/email-transform/index.ts` – Main transformer
- `/lib/email-transform/styles.ts` – Style mapping utilities
- `/lib/email-transform/nodes.ts` – Node type transformers
- `/components/email-preview.tsx` – Preview iframe component
- `/components/export-menu.tsx` – Export dropdown
- Update `/components/email-template-editor.tsx` to add tabs and export

---

### Phase 8: Email-Specific Block Nodes

**Goal**: Implement custom nodes for email-specific blocks (Button, Divider, Section, etc.)

**Deliverables**:

1. **Button Block**:

   ```ts
   // /lib/extensions/button-block.ts
   const ButtonBlock = Node.create({
     name: "buttonBlock",
     group: "block",
     atom: true,

     addAttributes() {
       return {
         id: { default: null },
         text: { default: "Click me" },
         href: { default: "#" },
         styles: { default: {} },
       };
     },

     parseHTML() {
       return [{ tag: 'div[data-type="button-block"]' }];
     },

     renderHTML({ node, HTMLAttributes }) {
       return [
         "div",
         mergeAttributes(HTMLAttributes, {
           "data-type": "button-block",
           style: getButtonStyles(node.attrs.styles),
         }),
         ["a", { href: node.attrs.href }, node.attrs.text],
       ];
     },

     addNodeView() {
       return ReactNodeViewRenderer(ButtonBlockView);
     },
   });
   ```

   Button NodeView (for editing):

   ```tsx
   const ButtonBlockView = ({ node, updateAttributes }: NodeViewProps) => {
     const [editing, setEditing] = useState(false);

     return (
       <NodeViewWrapper>
         {editing ? (
           <div>
             <Input
               value={node.attrs.text}
               onChange={(e) => updateAttributes({ text: e.target.value })}
             />
             <Input
               value={node.attrs.href}
               onChange={(e) => updateAttributes({ href: e.target.value })}
             />
             <Button onClick={() => setEditing(false)}>Done</Button>
           </div>
         ) : (
           <div onDoubleClick={() => setEditing(true)}>
             <a
               href={node.attrs.href}
               style={getButtonStyles(node.attrs.styles)}
               onClick={(e) => e.preventDefault()}
             >
               {node.attrs.text}
             </a>
           </div>
         )}
       </NodeViewWrapper>
     );
   };
   ```

   React Email transformation:

   ```tsx
   case 'buttonBlock':
     return (
       <ReactEmail.Button
         key={idx}
         href={node.attrs.href}
         style={getNodeStyles(node, globalStyles)}
       >
         {node.attrs.text}
       </ReactEmail.Button>
     );
   ```

2. **Divider Block**:

   ```ts
   // /lib/extensions/divider-block.ts
   const DividerBlock = Node.create({
     name: "dividerBlock",
     group: "block",
     atom: true,

     addAttributes() {
       return {
         id: { default: null },
         styles: { default: {} },
       };
     },

     renderHTML({ node, HTMLAttributes }) {
       return [
         "hr",
         mergeAttributes(HTMLAttributes, {
           style: getDividerStyles(node.attrs.styles),
         }),
       ];
     },
   });
   ```

   React Email transformation:

   ```tsx
   case 'dividerBlock':
     return (
       <ReactEmail.Hr
         key={idx}
         style={getNodeStyles(node, globalStyles)}
       />
     );
   ```

3. **Section Block** (supports columns):

   ```ts
   // /lib/extensions/section-block.ts
   const SectionBlock = Node.create({
     name: "sectionBlock",
     group: "block",
     content: "block+",

     addAttributes() {
       return {
         id: { default: null },
         columns: { default: 1 }, // 1 or 2
         styles: { default: {} },
       };
     },

     renderHTML({ node, HTMLAttributes }) {
       return [
         "div",
         mergeAttributes(HTMLAttributes, {
           "data-type": "section-block",
           "data-columns": node.attrs.columns,
           style: getSectionStyles(node.attrs.styles),
         }),
         0, // content hole
       ];
     },
   });
   ```

   React Email transformation (using table-based layout):

   ```tsx
   case 'sectionBlock':
     const columns = node.attrs.columns || 1;
     return (
       <ReactEmail.Section key={idx} style={getNodeStyles(node, globalStyles)}>
         <ReactEmail.Row>
           {/* Split content into columns */}
           {transformSectionContent(node.content, columns, globalStyles)}
         </ReactEmail.Row>
       </ReactEmail.Section>
     );
   ```

4. **Social Links Block**:

   ```ts
   const SocialLinksBlock = Node.create({
     name: "socialLinksBlock",
     group: "block",
     atom: true,

     addAttributes() {
       return {
         id: { default: null },
         links: {
           default: [
             { platform: "twitter", url: "" },
             { platform: "facebook", url: "" },
             { platform: "linkedin", url: "" },
           ],
         },
         styles: { default: {} },
       };
     },
   });
   ```

5. **Unsubscribe Footer Block**:

   ```ts
   const UnsubscribeFooterBlock = Node.create({
     name: "unsubscribeFooterBlock",
     group: "block",
     content: "inline*",

     addAttributes() {
       return {
         id: { default: null },
         unsubscribeUrl: { default: "{{unsubscribe_url}}" },
         styles: { default: {} },
       };
     },
   });
   ```

6. **HTML Block**:

   ```ts
   const HTMLBlock = Node.create({
     name: "htmlBlock",
     group: "block",
     atom: true,

     addAttributes() {
       return {
         id: { default: null },
         html: { default: "" },
       };
     },

     addNodeView() {
       return ReactNodeViewRenderer(HTMLBlockView);
     },
   });

   // View with code editor (monaco/codemirror)
   const HTMLBlockView = ({ node, updateAttributes }: NodeViewProps) => {
     return (
       <NodeViewWrapper>
         <textarea
           value={node.attrs.html}
           onChange={(e) => updateAttributes({ html: e.target.value })}
           className="font-mono"
         />
       </NodeViewWrapper>
     );
   };
   ```

7. Update slash command with real nodes:

   - Wire LAYOUT category items to new nodes
   - Remove placeholder implementations

8. Add block-specific attributes panels:
   - ButtonBlock: text, href, background, text color, padding, border radius
   - SectionBlock: columns (1 or 2), background, padding
   - SocialLinksBlock: add/remove/edit links, icon size, spacing
   - UnsubscribeFooterBlock: text content, URL, styling
   - HTMLBlock: raw HTML editor with syntax highlighting

**Success Criteria**:

- Can insert Button block, edit text & URL, style it
- Button exports correctly to React Email `<Button>`
- Divider block renders as HR and exports correctly
- Section block supports 1-2 columns
- Social links block allows editing platforms and URLs
- Unsubscribe footer block includes unsubscribe link
- HTML block allows raw HTML input
- All blocks draggable and have attributes panels
- All blocks export correctly to React Email

**Files to Create**:

- `/lib/extensions/button-block.ts` + NodeView
- `/lib/extensions/divider-block.ts`
- `/lib/extensions/section-block.ts` + NodeView
- `/lib/extensions/social-links-block.ts` + NodeView
- `/lib/extensions/unsubscribe-footer-block.ts` + NodeView
- `/lib/extensions/html-block.ts` + NodeView
- `/components/attributes-panel/button-attributes.tsx`
- `/components/attributes-panel/section-attributes.tsx`
- etc.
- Update transformer to handle all new node types
- Update slash command

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
- 🚧 **Phase 7**: React Email Transformer + Preview/Export - NEXT
- 📋 **Phase 8**: Email-Specific Block Nodes - PENDING
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

**Next Phase**: Phase 6 - Global Styles + Template Header UI

---

_Last updated: November 18, 2024_
_Version: 2.1_
