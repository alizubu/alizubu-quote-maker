# Mobile Editor Redesign Plan

## Overview
Redesign the entire mobile editing experience to mimic modern editors like Canva and Adobe Express. This solves the issue of the bottom editing panel overlaying the canvas and hiding selected text/objects.

## Project Type
WEB (Mobile-responsive web application)

## Success Criteria
1. The bottom editing panel must never cover the selected text.
2. The Canvas preview must shrink dynamically when the panel opens.
3. The bottom sheet must be draggable (with states: closed, 35vh, 50vh, 75vh).
4. Auto-pan the canvas upward to ensure selected objects remain visible when the panel expands.
5. Safe areas must be respected (`env(safe-area-inset-bottom/top)`).
6. Performance remains high (60fps, no layout thrashing, using GPU-accelerated transforms).
7. Panel content sections (Text, Typography, Color, etc.) are collapsible.
8. Only panel content scrolls; the main page is locked from scrolling.

## Tech Stack
- **React / Next.js**: Component structure and logic.
- **Framer Motion**: For smooth spring animations and drag gestures on the bottom sheet, and scaling the canvas without layout thrashing.
- **Tailwind CSS**: For styling, backdrop blurs, and modern UX UI rounded corners.
- **Zustand**: State management integration (already in use via `useEditorStore`).

## File Structure
```
src/
├── components/editor/
│   ├── MobileEditorLayout.tsx   # New layout orchestrator
│   ├── EditorBottomSheet.tsx    # Draggable panel (framer-motion)
│   └── CanvasViewport.tsx       # Dynamic scaling canvas wrapper
├── hooks/
│   ├── useBottomSheet.ts        # Snap states and height calculations
│   └── useEnsureVisible.ts      # Auto-panning logic for selected layers
└── utils/
    └── canvasViewport.ts        # Calculate viewport scale based on panel state
```

## Task Breakdown

### Task 1: Create State & Calculation Utilities
- **task_id**: `T1`
- **name**: Implement Hooks and Utils
- **agent**: `@frontend-specialist`
- **skills**: `clean-code`, `frontend-architecture`
- **priority**: P1
- **dependencies**: None
- **INPUT**: Requirement to calculate scale and panel states.
- **OUTPUT**: `useBottomSheet.ts`, `useEnsureVisible.ts`, `canvasViewport.ts`
- **VERIFY**: Hooks correctly output percentage-based vh heights, auto-pan offsets, and target scaling down to 1.0.

### Task 2: Build EditorBottomSheet Component
- **task_id**: `T2`
- **name**: Create Draggable Bottom Sheet
- **agent**: `@frontend-specialist`
- **skills**: `frontend-design`, `tailwind-patterns`
- **priority**: P1
- **dependencies**: `T1`
- **INPUT**: Need a bottom panel with swipe-to-drag up/down.
- **OUTPUT**: `EditorBottomSheet.tsx`
- **VERIFY**: Panel snaps to 35vh, 50vh, 75vh. Uses `framer-motion` drag elasticity. Main page behind it doesn't scroll (`touch-none`, `overscroll-contain`).

### Task 3: Build CanvasViewport Component
- **task_id**: `T3`
- **name**: Create Scaling Canvas Wrapper
- **agent**: `@frontend-specialist`
- **skills**: `nextjs-react-expert`
- **priority**: P1
- **dependencies**: `T1`
- **INPUT**: Canvas must shrink dynamically without causing React layout thrashing.
- **OUTPUT**: `CanvasViewport.tsx`
- **VERIFY**: Wraps children in a `motion.div` that uses `transform-gpu` to scale and translate `x`/`y` at 60fps based on the panel height.

### Task 4: Assemble MobileEditorLayout
- **task_id**: `T4`
- **name**: Build Mobile Editor Root Layout
- **agent**: `@frontend-specialist`
- **skills**: `clean-code`, `frontend-architecture`
- **priority**: P1
- **dependencies**: `T2`, `T3`
- **INPUT**: Combine canvas, bottom sheet, and action bar into a mobile view.
- **OUTPUT**: `MobileEditorLayout.tsx`
- **VERIFY**: Bottom sheet state synchronizes with layer selection. Collapsible panel sections render properly. Layout respects `env(safe-area-inset)`.

### Task 5: Integration
- **task_id**: `T5`
- **name**: Mount New Architecture
- **agent**: `@frontend-specialist`
- **skills**: `clean-code`
- **priority**: P2
- **dependencies**: `T4`
- **INPUT**: The main `page.tsx` needs to utilize the new layout for mobile devices.
- **OUTPUT**: Updated `src/app/page.tsx`
- **VERIFY**: Mobile users experience the new Canva-style UI, while desktop retains its layout.

## Phase X: Verification (Checklist)
- [ ] **Lint & Type Check**: Run `npm run lint` and verify no TypeScript errors.
- [ ] **Performance Audit**: Run Lighthouse (or Chrome Profiler) and confirm animations hit 60fps. No expensive React re-renders on drag.
- [ ] **Touch Target / Mobile UX Check**: Verify touch targets in the bottom sheet are at least 44px. Verify swiping up/down feels native.
- [ ] **Build Check**: Run `npm run build` to ensure the new Framer Motion components compile cleanly.
- [ ] **Feature Check**: Select a text layer near the bottom; ensure the canvas pans up and scaling activates.
