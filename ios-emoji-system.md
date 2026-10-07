# iOS Emoji System Implementation Plan

## Overview
Implement a system in the web application that detects standard unicode emojis and replaces them with iOS-style emojis, both during user input and when rendering text. This ensures a consistent iOS emoji experience across all devices (Windows, Android, etc.) via the responsive web browser.

## Project Type
WEB

## Success Criteria
- Emojis in text elements render as iOS-style emojis instead of system default emojis on non-Apple devices.
- User input fields that accept emojis (e.g. textareas, inputs) visually present iOS emojis or convert them upon rendering.
- Solution works performantly across modern browsers on both desktop and mobile.

## Tech Stack
- **Next.js / React**: Existing application framework.
- **emoji-mart / react-twemoji (or similar)**: To parse strings for unicode emojis and replace them with Apple-style or Twemoji SVG/PNG assets. (Note: True Apple assets may have licensing restrictions, so a visually similar open-source set like JoyPixels or Twemoji may be used, or a direct sprite sheet if provided by the user).
- **Tailwind CSS**: For styling any necessary picker or replacement wrappers.

## File Structure
- `lib/emoji-utils.ts`: Helper functions for parsing text and replacing unicode emojis with image tags.
- `components/EmojiText.tsx`: A reusable React component that takes a string and renders it with iOS emojis.
- `components/EmojiInput.tsx`: A specialized input component for rich text emoji replacement during active typing.

## Task Breakdown

### Task 1: Setup Emoji Processing Library
- **agent**: `frontend-specialist`
- **skills**: `clean-code`, `frontend-architecture`
- **priority**: P0
- **dependencies**: None
- **INPUT**: Next.js project setup.
- **OUTPUT**: Installed emoji parsing library and a utility function (`lib/emoji-utils.ts`) that takes a string and returns an array of text/React nodes with iOS emoji images.
- **VERIFY**: Unit test or manual verification that calling the utility with "Hello 🌎" returns text nodes with the correct `<img>` tag for the globe emoji.

### Task 2: Create EmojiText Component
- **agent**: `frontend-specialist`
- **skills**: `frontend-architecture`, `clean-code`
- **priority**: P1
- **dependencies**: Task 1
- **INPUT**: `lib/emoji-utils.ts`.
- **OUTPUT**: `components/EmojiText.tsx` which accepts a `text` prop and renders it safely, passing the text through the emoji utility.
- **VERIFY**: Component renders properly in the app, showing iOS emojis instead of native ones on Windows/Android.

### Task 3: Implement Emoji Input Handling
- **agent**: `frontend-specialist`
- **skills**: `frontend-architecture`
- **priority**: P2
- **dependencies**: Task 1, Task 2
- **INPUT**: Requirements for emoji replacement during typing.
- **OUTPUT**: An input wrapper or custom textarea (`components/EmojiInput.tsx`) that intercepts emoji insertion to render them as iOS emojis, or seamlessly updates the rendered view so users see iOS emojis as they type. (e.g., using `react-contenteditable` if true WYSIWYG emoji replacement is needed in the input field itself).
- **VERIFY**: Entering an emoji on a Windows/Android keyboard reflects as an iOS emoji in the UI immediately.

### Task 4: Integrate and Apply Across App
- **agent**: `frontend-specialist`
- **skills**: `frontend-architecture`
- **priority**: P2
- **dependencies**: Task 2, Task 3
- **INPUT**: Existing UI components.
- **OUTPUT**: Replaced standard text rendering with `EmojiText` and inputs with `EmojiInput` where applicable.
- **VERIFY**: The entire app successfully displays iOS emojis.

## Phase X Verification Checklist
- [ ] Run Lint & Type Check (`npm run lint && npx tsc --noEmit`)
- [ ] Run Security Scan (`python .agents/skills/vulnerability-scanner/scripts/security_scan.py .`)
- [ ] UX Audit (`python .agents/skills/frontend-design/scripts/ux_audit.py .`)
- [ ] Build Verification (`npm run build`)
- [ ] Manual test on local dev server (`npm run dev`) confirming iOS emojis appear correctly on non-Apple OS.
- [ ] Socratic Gate was respected.
- [ ] No standard template layouts or purple/violet hex codes used inappropriately.
