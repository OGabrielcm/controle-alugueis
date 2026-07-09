# Controle de aluguéis — Design system

## Register
Product UI for a private family workflow. Warm and restrained, with high readability over visual novelty.

## Palette
- Theme mode: light by default, with a user-controlled dark mode persisted in local storage.
- Light canvas: `oklch(0.9856 0.0084 56.3169)`.
- Light surface: `oklch(1 0 0)` with muted surface `oklch(0.9656 0.0176 39.4009)`.
- Primary: `oklch(0.7357 0.1641 34.7091)`.
- Accent: `oklch(0.8278 0.1131 57.9984)`.
- Dark canvas: `oklch(0.2569 0.0169 352.4042)` with card `oklch(0.3184 0.0176 341.4465)`.
- Destructive: `oklch(0.6122 0.2082 22.241)` in both themes.

## Typography and layout
- Keep Geist for application UI.
- Use the foreground token for readable text in both modes; reserve the primary coral for actions, focus and selected states.
- Use the card and border tokens rather than hard-coded light surfaces.
- Use rounded corners as grouping, not decoration.

## Component rules
- Primary actions: primary fill with `primary-foreground` text.
- Secondary actions: secondary/muted surface with the semantic foreground token.
- Statuses: readable text plus border/background treatment; never depend on hue alone.
- Inputs: white surface, sand border, terracotta focus ring.
- Remove cyan/green as global brand colors. They may remain only where semantic status requires a distinct tone.

## Accessibility
- Maintain a visible keyboard focus ring.
- Keep body text and labels at high contrast against off-white surfaces.
- Do not encode a selected or error state with color alone.
