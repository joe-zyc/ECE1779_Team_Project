# Frontend Interface Guidelines (Vercel-Aligned)

Source: https://vercel.com/design/guidelines  
Reference command spec: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

Use these rules for all frontend changes in this repository, with highest priority in `frontend/src`.

## Accessibility
- Icon-only buttons must have `aria-label`.
- Inputs must have labels (or `aria-label` when labels are not possible).
- Use semantic elements first (`button`, `a`, `label`, etc.).
- Images require meaningful `alt` (or empty for decorative).
- Async feedback should use polite live regions (`aria-live="polite"`).
- Keep heading hierarchy logical.

## Focus & Keyboard
- All interactive controls must have visible `:focus-visible` styles.
- Never remove outlines unless replaced with equivalent focus treatment.
- Use `button` for actions and links for navigation.

## Forms
- Use appropriate `type` (`email`, `tel`, `number`, etc.).
- Include `name` and relevant `autocomplete` on controls.
- Do not block paste.
- Keep labels clickable by wrapping controls or using `htmlFor`.
- Use clear field errors and loading states.

## Motion & Interaction
- Respect `prefers-reduced-motion` for non-essential animation.
- Animate `transform` and `opacity` preferentially.
- Avoid `transition: all`.
- Provide clear hover, active, and focus states.

## Typography & Copy
- Use ellipsis character `…` for loading/continuation states.
- Prefer concise, specific button labels.
- Use active voice and actionable error messages.
- Use tabular numerals where numerical comparisons matter.

## Content Resilience
- Handle empty states gracefully.
- Prevent overflow issues for long content.
- Ensure flex/grid children can shrink (`min-width` handling).

## Images & Performance
- Provide explicit `width` and `height` attributes for images.
- Use `loading="lazy"` for below-fold images.
- For large lists, paginate or virtualize.

## Navigation & State
- Prefer URL-reflective UI state for filter/tab/page where practical.
- Preserve expected link behaviors (`open in new tab`, etc.).

## Layout & Mobile
- Avoid horizontal overflow.
- Use responsive grid/flex layouts instead of JS measurements.
- Apply touch-friendly interaction defaults (`touch-action: manipulation`).

## Anti-Patterns to Avoid
- `transition: all`
- `outline: none` without replacement
- click handlers on non-semantic elements for primary interactions
- image tags without dimensions
- unlabeled form controls

