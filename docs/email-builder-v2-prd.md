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

**Duration**: ~1-2 days

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

**Duration**: ~1-2 days

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

### Phase 3: Block Identity & Selection System

**Goal**: Give each block a stable identity and implement block selection/tracking infrastructure

**Duration**: ~2-3 days

**Deliverables**:

1. Add UniqueID to all block nodes:
   - Install/configure TipTap's UniqueID extension, or
   - Create custom `BlockID` extension
   - Add `id` attribute to all block-level node schemas

2. Create `BlockMetaExtension`:
   ```ts
   // /lib/extensions/block-meta.ts
   const BlockMeta = Extension.create({
     name: 'blockMeta',
     
     addStorage() {
       return {
         activeBlock: null, // { id, type, pos, domRect }
       };
     },
     
     addProseMirrorPlugins() {
       return [
         new Plugin({
           state: {
             init: () => ({ activeBlockId: null, pos: null }),
             apply: (tr, value) => {
               // Track selection changes, update active block
             },
           },
           props: {
             handleDOMEvents: {
               mousemove: (view, event) => {
                 // Find block node under cursor
                 // Update plugin state
               },
             },
           },
         }),
       ];
     },
   });
   ```

3. Implement block position/rect calculation:
   - Use `view.domAtPos()` and `view.nodeDOM()` to get DOM elements
   - Calculate bounding rects for positioning UI
   - Store in plugin state and expose via storage API

4. Add React context/hook for block metadata:
   ```ts
   // /hooks/use-active-block.ts
   const useActiveBlock = () => {
     const { editor } = useEditor();
     const [activeBlock, setActiveBlock] = useState(null);
     
     useEffect(() => {
       // Subscribe to block metadata updates
       // Update React state when active block changes
     }, [editor]);
     
     return activeBlock;
   };
   ```

5. Visual feedback for active block:
   - Add decoration to highlight active block background
   - Subtle border or background color change
   - Clear visual indicator without disrupting editing

**Success Criteria**:
- Every block node in JSON has a unique, stable `id`
- IDs persist across edits and page reloads
- Can log active block metadata in dev console
- Active block updates on cursor movement and hover
- No performance degradation from tracking

**Files to Create**:
- `/lib/extensions/block-id.ts` – Block ID extension
- `/lib/extensions/block-meta.ts` – Block selection/tracking
- `/hooks/use-active-block.ts` – React hook for active block
- Update `/components/extensions.ts` to include new extensions

---

### Phase 4: Side Rail UI (Drag Handle + Attributes Button)

**Goal**: Add Resend-style hover rail with drag handle and attributes button

**Duration**: ~2-3 days

**Deliverables**:

1. Verify and style GlobalDragHandle:
   - Confirm `GlobalDragHandle` extension is active
   - Adjust `.drag-handle` CSS for email editor aesthetic
   - Ensure drag behavior works with email blocks

2. Create `BlockSideRail` component:
   ```tsx
   // /components/block-side-rail.tsx
   const BlockSideRail = () => {
     const activeBlock = useActiveBlock();
     const [showAttributes, setShowAttributes] = useState(false);
     
     if (!activeBlock) return null;
     
     const { domRect } = activeBlock;
     
     return (
       <div
         className="block-side-rail"
         style={{
           position: 'absolute',
           left: domRect.left - 40, // Position to left of block
           top: domRect.top,
           // ... positioning logic
         }}
       >
         {/* Drag handle icon (can reuse .drag-handle or custom) */}
         <button className="drag-handle-button">
           <GripVertical size={16} />
         </button>
         
         {/* Attributes button */}
         <button
           className="attributes-button"
           onClick={() => setShowAttributes(true)}
         >
           <Settings size={16} />
         </button>
       </div>
     );
   };
   ```

3. Position side rail dynamically:
   - Subscribe to active block metadata
   - Calculate rail position based on block's DOM rect
   - Handle scroll events to keep rail aligned
   - Hide when no active block

4. Integrate with drag behavior:
   - Wire drag handle button to trigger ProseMirror drag
   - Or rely on GlobalDragHandle if it already covers the block
   - Ensure smooth drag experience

5. Stub attributes panel:
   - Create basic Sheet component
   - Opens when attributes button clicked
   - Shows active block type and ID for now
   - Close button functional

6. Hover states and animations:
   - Fade in/out transitions for rail
   - Hover effects on buttons
   - Visual feedback for drag start

**Success Criteria**:
- Side rail appears when hovering over any block
- Rail positioned correctly to the left of the block
- Rail follows block on scroll
- Drag handle allows block reordering
- Attributes button opens stub panel
- Rail hides when cursor leaves block area
- Smooth, non-janky UX

**Files to Create**:
- `/components/block-side-rail.tsx` – Side rail component
- `/components/attributes-panel.tsx` – Stub panel
- Update `/components/email-template-editor.tsx` to render rail
- Update `/styles/prosemirror.css` for rail styling

---

### Phase 5: Block Attributes Panel v1 (Text Blocks)

**Goal**: Implement real attributes panel for text blocks with appearance and typography controls

**Duration**: ~3-4 days

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
           parseHTML: element => JSON.parse(element.getAttribute('data-styles') || '{}'),
           renderHTML: attributes => ({
             'data-styles': JSON.stringify(attributes.styles || {}),
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
       editor.chain()
         .updateAttributes(blockType, {
           styles: { ...styles, [key]: value }
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

**Files to Create/Modify**:
- `/types/block-styles.ts` – Styles type definitions
- `/lib/extensions/email-paragraph.ts` – Extended paragraph node
- `/lib/extensions/email-heading.ts` – Extended heading node
- `/components/attributes-panel.tsx` – Full panel implementation
- `/components/attributes-panel/appearance-section.tsx` – Appearance controls
- `/components/attributes-panel/typography-section.tsx` – Typography controls
- `/components/attributes-panel/layout-section.tsx` – Layout controls
- Update `/components/extensions.ts` to use extended nodes

---

### Phase 6: Global Styles + Template Header UI

**Goal**: Add global email styling controls and editable template header fields

**Duration**: ~3-4 days

**Deliverables**:

1. Implement GlobalStyles in EmailTemplate:
   - Already defined in Phase 1 type
   - Create defaults with sensible values
   - Wire to template state

2. Build GlobalStylesPanel:
   ```tsx
   // /components/global-styles-panel.tsx
   const GlobalStylesPanel = ({ open, onClose }) => {
     const [template, setTemplate] = useEmailTemplate();
     const { globalStyles } = template;
     
     const updateGlobalStyle = (path: string, value: any) => {
       // Deep update globalStyles
       setTemplate({
         ...template,
         globalStyles: deepSet(globalStyles, path, value)
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
         header: { ...header, [field]: value }
       });
     };
     
     return (
       <div className="template-header">
         <div className="grid grid-cols-2 gap-4">
           <div>
             <Label>From</Label>
             <Input
               value={header.from}
               onChange={(e) => updateHeader('from', e.target.value)}
               placeholder="sender@example.com"
             />
           </div>
           <div>
             <Label>Reply-To</Label>
             <Input
               value={header.replyTo}
               onChange={(e) => updateHeader('replyTo', e.target.value)}
               placeholder="reply@example.com"
             />
           </div>
         </div>
         <div className="mt-4">
           <Label>Subject</Label>
           <Input
             value={header.subject}
             onChange={(e) => updateHeader('subject', e.target.value)}
             placeholder="Your email subject"
           />
         </div>
         <div className="mt-4">
           <Label>Preview Text</Label>
           <Input
             value={header.preview}
             onChange={(e) => updateHeader('preview', e.target.value)}
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

**Duration**: ~4-5 days

**Deliverables**:

1. Install React Email:
   ```bash
   pnpm add @react-email/components
   ```

2. Create transformer module:
   ```ts
   // /lib/email-transform/index.ts
   import { JSONContent } from '@tiptap/react';
   import { EmailTemplate } from '@/types/email-template';
   import * as ReactEmail from '@react-email/components';
   
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
   
   const transformContent = (content: JSONContent, globalStyles: GlobalStyles) => {
     return content.content?.map((node, idx) => {
       switch (node.type) {
         case 'paragraph':
           return <ReactEmail.Text key={idx} style={getNodeStyles(node, globalStyles)}>
             {transformInlineContent(node.content)}
           </ReactEmail.Text>;
           
         case 'heading':
           return <ReactEmail.Heading
             key={idx}
             as={`h${node.attrs.level}`}
             style={getNodeStyles(node, globalStyles)}
           >
             {transformInlineContent(node.content)}
           </ReactEmail.Heading>;
           
         case 'image':
           return <ReactEmail.Img
             key={idx}
             src={node.attrs.src}
             alt={node.attrs.alt}
             style={getNodeStyles(node, globalStyles)}
           />;
           
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
       backgroundColor: blockStyles.background || 'transparent',
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
             width: '100%',
             minHeight: '600px',
             border: '1px solid #e5e7eb',
             borderRadius: '8px',
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
       const blob = new Blob([html], { type: 'text/html' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `${template.header.subject || 'email'}.html`;
       a.click();
     };
     
     const copyHTML = async () => {
       const jsx = transformToReactEmail(template);
       const html = await render(jsx);
       await navigator.clipboard.writeText(html);
       toast.success('HTML copied to clipboard');
     };
     
     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button variant="outline">Export</Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent>
           <DropdownMenuItem onClick={copyHTML}>
             Copy HTML
           </DropdownMenuItem>
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
       if (node.type === 'text') {
         let text: React.ReactNode = node.text;
         
         node.marks?.forEach(mark => {
           switch (mark.type) {
             case 'bold':
               text = <strong key={idx}>{text}</strong>;
               break;
             case 'italic':
               text = <em key={idx}>{text}</em>;
               break;
             case 'link':
               text = <ReactEmail.Link
                 key={idx}
                 href={mark.attrs.href}
                 style={getLinkStyles(globalStyles)}
               >
                 {text}
               </ReactEmail.Link>;
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

**Duration**: ~5-6 days

**Deliverables**:

1. **Button Block**:
   ```ts
   // /lib/extensions/button-block.ts
   const ButtonBlock = Node.create({
     name: 'buttonBlock',
     group: 'block',
     atom: true,
     
     addAttributes() {
       return {
         id: { default: null },
         text: { default: 'Click me' },
         href: { default: '#' },
         styles: { default: {} },
       };
     },
     
     parseHTML() {
       return [{ tag: 'div[data-type="button-block"]' }];
     },
     
     renderHTML({ node, HTMLAttributes }) {
       return [
         'div',
         mergeAttributes(HTMLAttributes, {
           'data-type': 'button-block',
           style: getButtonStyles(node.attrs.styles),
         }),
         ['a', { href: node.attrs.href }, node.attrs.text],
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
     name: 'dividerBlock',
     group: 'block',
     atom: true,
     
     addAttributes() {
       return {
         id: { default: null },
         styles: { default: {} },
       };
     },
     
     renderHTML({ node, HTMLAttributes }) {
       return [
         'hr',
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
     name: 'sectionBlock',
     group: 'block',
     content: 'block+',
     
     addAttributes() {
       return {
         id: { default: null },
         columns: { default: 1 }, // 1 or 2
         styles: { default: {} },
       };
     },
     
     renderHTML({ node, HTMLAttributes }) {
       return [
         'div',
         mergeAttributes(HTMLAttributes, {
           'data-type': 'section-block',
           'data-columns': node.attrs.columns,
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
     name: 'socialLinksBlock',
     group: 'block',
     atom: true,
     
     addAttributes() {
       return {
         id: { default: null },
         links: {
           default: [
             { platform: 'twitter', url: '' },
             { platform: 'facebook', url: '' },
             { platform: 'linkedin', url: '' },
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
     name: 'unsubscribeFooterBlock',
     group: 'block',
     content: 'inline*',
     
     addAttributes() {
       return {
         id: { default: null },
         unsubscribeUrl: { default: '{{unsubscribe_url}}' },
         styles: { default: {} },
       };
     },
   });
   ```

6. **HTML Block**:
   ```ts
   const HTMLBlock = Node.create({
     name: 'htmlBlock',
     group: 'block',
     atom: true,
     
     addAttributes() {
       return {
         id: { default: null },
         html: { default: '' },
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

**Duration**: ~3-4 days

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
     name: 'variable',
     group: 'inline',
     inline: true,
     atom: true,
     
     addAttributes() {
       return {
         name: { default: '' },
         fallback: { default: '' },
       };
     },
     
     parseHTML() {
       return [{ tag: 'span[data-type="variable"]' }];
     },
     
     renderHTML({ node }) {
       return [
         'span',
         {
           'data-type': 'variable',
           class: 'variable-node',
           contenteditable: 'false',
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
             name: 'newVariable',
             type: 'string',
             defaultValue: '',
           },
         ],
       });
     };
     
     const updateVariable = (id: string, updates: Partial<Variable>) => {
       setTemplate({
         ...template,
         variables: variables.map(v => 
           v.id === id ? { ...v, ...updates } : v
         ),
       });
     };
     
     const deleteVariable = (id: string) => {
       setTemplate({
         ...template,
         variables: variables.filter(v => v.id !== id),
       });
     };
     
     return (
       <Sheet open={open} onOpenChange={onClose}>
         <SheetContent>
           <SheetHeader>
             <SheetTitle>Template Variables</SheetTitle>
           </SheetHeader>
           
           <div className="space-y-4">
             {variables.map(variable => (
               <div key={variable.id} className="border rounded p-4">
                 <Input
                   label="Name"
                   value={variable.name}
                   onChange={(e) => updateVariable(variable.id, { name: e.target.value })}
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
                   onChange={(e) => updateVariable(variable.id, { defaultValue: e.target.value })}
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

**Duration**: ~5-7 days

**Deliverables**:

1. **Email safety linting**:
   ```ts
   // /lib/email-linting.ts
   interface LintIssue {
     severity: 'error' | 'warning' | 'info';
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

**Phase**: Planning complete, ready to begin Phase 1

**Next Steps**: 
1. Review and approve this PRD
2. Set up project board with phase tickets
3. Begin Phase 1 implementation
4. Establish testing/review cadence for each phase

---

*Last updated: [Auto-generated timestamp]*
*Version: 2.0*

