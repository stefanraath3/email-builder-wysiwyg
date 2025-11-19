# Phase 6 Breakdown: Global Styles + Template Header UI

## Overview

Phase 6 adds global email styling controls and makes the template header editable. The goal is to ensure **all modifiable styles** are accessible through global styles, and that changes are visually reflected in the editor in real-time.

## Current State Analysis

✅ **What we have:**

- `GlobalStyles` interface is comprehensive (matches PRD)
- Defaults centralized in `email-template-defaults.ts`
- Context has `updateGlobalStyles()` with deep merge
- `mergeWithGlobalStyles()` utility exists (but not used in editor yet)
- Template header component exists (read-only)

❌ **What's missing:**

- Global styles aren't visually applied to editor
- Template header is read-only
- No GlobalStylesPanel UI
- No "Styles" button in top bar
- Global styles changes don't affect existing blocks

## Architecture Decision: Centralized Global Styles

**Answer: YES, we already have a good central place:**

1. **Type Definition**: `/types/email-template.ts` - `GlobalStyles` interface
2. **Defaults**: `/lib/email-template-defaults.ts` - `createDefaultGlobalStyles()`
3. **State Management**: `/lib/email-template-context.tsx` - `updateGlobalStyles()`
4. **Utilities**: `/lib/email-blocks.ts` - `mergeWithGlobalStyles()`, `getDefaultStylesForBlockType()`

**This is the right approach** - we don't need external JSON/store. The defaults are in code (version-controlled), and runtime state is in React context + localStorage.

## Verification: Are All Styles Covered?

Let's verify `GlobalStyles` covers everything:

### ✅ Covered in GlobalStyles:

- Container: width, align, padding
- Typography: fontFamily, fontSize, lineHeight, color
- Link: color, textDecoration
- Image: borderRadius
- Button: backgroundColor, textColor, borderRadius, padding
- CodeBlock: backgroundColor, borderRadius, padding
- InlineCode: backgroundColor, textColor, borderRadius

### ⚠️ Potential Gaps:

- **List styles**: No global defaults for lists (bullet/ordered) - should we add?
- **Blockquote styles**: No global defaults - should we add?
- **Heading styles**: Typography covers base, but headings might need separate defaults

**Decision**: We'll add these during Part 1 if needed, but for now the current structure is sufficient. Lists and blockquotes inherit typography defaults.

---

## Sub-Parts Breakdown

### Part 1: Verify & Enhance GlobalStyles Interface ✅

**Goal**: Ensure GlobalStyles interface contains ALL modifiable styles

**Tasks**:

1. Review current `GlobalStyles` interface against all block types
2. Check if we need global defaults for:
   - Lists (bullet/ordered)
   - Blockquotes
   - Headings (separate from base typography?)
3. Update `GlobalStyles` interface if needed
4. Update `createDefaultGlobalStyles()` with new defaults
5. Update `mergeWithGlobalStyles()` to handle new categories

**Success Criteria**:

- All block types have appropriate global defaults
- Interface is comprehensive and future-proof
- Defaults match email industry standards

**Files to Modify**:

- `/types/email-template.ts` (if interface changes)
- `/lib/email-template-defaults.ts` (add new defaults)
- `/lib/email-blocks.ts` (update merge function)

---

### Part 2: Make Template Header Editable ✅

**Goal**: Transform read-only header into editable form fields

**Tasks**:

1. Update `TemplateHeader` component:
   - Replace read-only divs with Input components
   - Wire up `updateHeader()` from context
   - Add proper labels and placeholders
   - Handle validation (email format for from/replyTo)
2. Add visual feedback for changes
3. Ensure changes persist (already handled by context)

**Success Criteria**:

- All header fields are editable
- Changes save automatically
- Visual feedback on changes
- Validation prevents invalid email addresses

**Files to Modify**:

- `/components/template-header.tsx` (transform to editable)

---

### Part 3: Build GlobalStylesPanel UI ✅

**Goal**: Create Resend-inspired global styles panel with all style categories

**Tasks**:

1. Create `/components/global-styles-panel.tsx`:
   - Use shadcn Sheet (right-side, 400px width)
   - Accordion sections for each category:
     - Container
     - Typography
     - Link
     - Image
     - Button
     - Code Block
     - Inline Code
     - Custom CSS (advanced)
2. Build form controls for each category:
   - Container: width (number), align (select), padding (unified control)
   - Typography: fontFamily (select/input), fontSize (slider+number), lineHeight (slider+number), color (color picker)
   - Link: color (color picker), textDecoration (select)
   - Image: borderRadius (slider+number)
   - Button: backgroundColor, textColor, borderRadius, padding
   - CodeBlock: backgroundColor, borderRadius, padding
   - InlineCode: backgroundColor, textColor, borderRadius
   - Custom CSS: textarea (monospace)
3. Wire up to `updateGlobalStyles()` from context
4. Real-time updates (no "Apply" button needed)

**Success Criteria**:

- Panel opens/closes correctly
- All style categories have controls
- Changes update template.globalStyles immediately
- Panel shows current values correctly
- Form controls match Resend UX (sliders, color pickers, etc.)

**Files to Create**:

- `/components/global-styles-panel.tsx`

**Files to Reuse**:

- `/components/attributes-panel/color-picker-input.tsx`
- `/components/attributes-panel/padding-control.tsx`
- `/components/attributes-panel/slider-number-input.tsx`
- `/components/attributes-panel/alignment-control.tsx` (can adapt for container align)

---

### Part 4: Add "Styles" Button to Top Bar ✅

**Goal**: Add button that opens GlobalStylesPanel

**Tasks**:

1. Update `/app/email-editor/page.tsx`:
   - Add "Styles" button next to existing buttons
   - Use Palette or Sliders icon from lucide-react
   - Wire up to open GlobalStylesPanel
   - Remove `disabled` prop (currently disabled for Phase 6)
2. Add state management for panel open/close

**Success Criteria**:

- Button visible in top bar
- Clicking opens GlobalStylesPanel
- Button has proper styling and hover states

**Files to Modify**:

- `/app/email-editor/page.tsx`

---

### Part 5: Apply Global Styles to Editor (CSS Variables) ✅

**Goal**: Make global styles visually affect the editor in real-time

**Tasks**:

1. Create CSS variable injection system:
   - Update `/components/email-template-editor.tsx`:
     - Read `template.globalStyles` from context
     - Inject CSS variables into editor wrapper
     - Use CSS custom properties for dynamic values
2. Update `/styles/prosemirror.css`:
   - Use CSS variables for typography (font-family, font-size, line-height, color)
   - Use CSS variables for link colors
   - Apply container width/padding to editor wrapper
3. Update editor wrapper in `EmailTemplateEditor`:
   - Apply container width from globalStyles
   - Apply container padding
   - Apply container alignment (center via margin auto)
4. Ensure CSS variables update when globalStyles change

**Success Criteria**:

- Typography changes (font size, family, line height, color) affect all text blocks
- Link color changes affect all links
- Container width changes resize editor canvas
- Container padding affects editor spacing
- Changes apply immediately (no refresh needed)

**Files to Modify**:

- `/components/email-template-editor.tsx` (inject CSS variables)
- `/styles/prosemirror.css` (use CSS variables)

**Files to Create**:

- `/lib/global-styles-css.ts` (utility to convert GlobalStyles to CSS variables)

---

### Part 6: Apply Global Styles to Block Rendering ✅

**Goal**: Ensure new blocks and existing blocks without overrides use global defaults

**Tasks**:

1. Update block extensions to use `mergeWithGlobalStyles()`:
   - Check if extensions already use it (they don't currently)
   - Update `renderHTML` in email extensions to merge global styles
2. Update AttributesPanel "Reset to Defaults":
   - When resetting, should clear block styles (not set to global)
   - Blocks without styles should inherit from CSS variables
3. Test that:
   - New blocks use global defaults
   - Existing blocks without overrides use global defaults
   - Blocks with overrides keep their overrides
   - Changing global styles updates blocks without overrides

**Success Criteria**:

- New blocks inherit global styles correctly
- Existing blocks without overrides use global styles
- Block overrides still work
- Global style changes propagate to blocks without overrides

**Files to Modify**:

- `/lib/extensions/email-paragraph.ts` (if needed)
- `/lib/extensions/email-heading.ts` (if needed)
- `/lib/extensions/email-blockquote.ts` (if needed)
- `/lib/extensions/email-code-block.ts` (if needed)
- `/lib/extensions/email-image.ts` (if needed)
- `/lib/extensions/email-lists.ts` (if needed)
- `/components/attributes-panel.tsx` (reset behavior)

---

## Implementation Order

1. **Part 1** - Verify & Enhance GlobalStyles (foundation)
2. **Part 2** - Make Template Header Editable (independent, quick win)
3. **Part 3** - Build GlobalStylesPanel UI (core feature)
4. **Part 4** - Add Styles Button (trivial, depends on Part 3)
5. **Part 5** - Apply Global Styles to Editor (visual feedback)
6. **Part 6** - Apply Global Styles to Block Rendering (completeness)

## Testing Strategy

After each part:

- ✅ Verify changes persist in localStorage
- ✅ Verify JSON debug panel shows updates
- ✅ Test undo/redo (if applicable)
- ✅ Test with existing content
- ✅ Test with new content

## Notes

- **CSS Variables vs Inline Styles**: We'll use CSS variables for global styles (better performance, easier to update). Block-level overrides remain inline styles.
- **Performance**: CSS variable updates are instant and don't require re-rendering blocks.
- **Backwards Compatibility**: Existing templates without global styles will use defaults from `createDefaultGlobalStyles()`.
