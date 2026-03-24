# Design System Document: High-Energy Dark Mode

## 1. Overview & Creative North Star
**Creative North Star: The Kinetic Terminal**
This design system is engineered to capture the high-velocity energy of a late-night hackathon. It rejects the static, "boxed-in" nature of traditional web layouts in favor of an interface that feels like a living OS. By leveraging deep obsidian depths and electric neon accents, we create a "Kinetic Terminal"—a space that feels both infinitely deep and hyper-focused.

To break the "template" look, we employ **Intentional Asymmetry**. Do not align every element to a rigid center; allow hero typography to bleed toward the edges and use overlapping "glass" containers to create a sense of mechanical layering. The goal is a technical, high-end editorial feel that honors the "Neon Onyx" aesthetic without ever feeling "default."

---

## 2. Colors & Surface Philosophy
The palette is rooted in the absence of light, using neon frequencies to guide the user's eye through a sophisticated hierarchy of darkness.

### The Palette (Core Tokens)
- **Background/Surface:** `#0E0E0E` (The void)
- **Primary (Neon Purple):** `#CC97FF` (High energy, primary actions)
- **Secondary (Neon Cyan):** `#53DDFC` (Technical precision, secondary actions)
- **Tertiary (Neon Pink/Red):** `#FF95A0` (Urgency and flair)

### The "No-Line" Rule
**Explicit Instruction:** Solid 1px borders are strictly prohibited for sectioning. We define space through **Tonal Transitions**. To separate a sidebar from a feed, move from `surface` (#0E0E0E) to `surface-container-low` (#131313). This creates a seamless, high-end feel that feels carved out of a single block of onyx rather than stitched together.

### The "Glass & Gradient" Rule
To inject "soul" into the technical void:
- **Floating Elements:** Use `surface-container-highest` (#262626) with a 60% opacity and a `24px` backdrop-blur. 
- **CTAs:** Never use a flat fill. Use a linear gradient from `primary` (#CC97FF) to `primary-dim` (#9C48EA) at a 135-degree angle. This mimics the glow of a physical neon tube.

---

## 3. Typography
We use a dual-font system to balance technical precision with collegiate authority.

*   **Display & Headlines (Lexend):** Chosen for its geometric, low-contrast forms. Use `display-lg` (3.5rem) with `-0.04em` letter spacing to create a "brutalist" impact in hero sections.
*   **Body & Labels (Inter):** The workhorse. Inter provides the legibility required for dense community threads. 
*   **Editorial Hierarchy:** Use extreme scale contrast. Pair a `display-md` headline with a `label-sm` in `secondary` (Cyan) to create a "technical spec" look that feels intentional and premium.

---

## 4. Elevation & Depth
Depth is not simulated with drop shadows; it is achieved through **Tonal Layering**.

### The Layering Principle
Think of the UI as a series of stacked obsidian plates:
1.  **Base:** `surface` (#0E0E0E)
2.  **Sectioning:** `surface-container-low` (#131313)
3.  **Cards/Content:** `surface-container-highest` (#262626)

### Ambient Shadows
When an element must float (e.g., a Modal or FAB), use a "Neon Bloom" shadow. Instead of black, use `primary` (#CC97FF) at 5% opacity with a `48px` blur. This suggests the element is emitting light rather than blocking it.

### The "Ghost Border" Fallback
If contrast is legally required for accessibility, use the `outline-variant` token at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-dim`), `1rem` (16px) border radius. Use `on-primary-fixed` (Black) for text to ensure maximum punch.
- **Secondary:** Ghost style. `Ghost Border` (15% opacity cyan) with `secondary` text. 
- **Interaction:** On hover, increase the "Bloom" (shadow) intensity.

### Cards & Lists
- **Rule:** No dividers. Use `8px` of vertical white space (Spacing Scale 2) and a slight background shift to `surface-container-high` on hover to indicate interactivity.
- **Radius:** Always use `lg` (2rem) for outer containers and `md` (1.5rem) for nested elements to create a "nested organic" feel.

### Input Fields
- **Base:** `surface-container-lowest` (Pure black).
- **Focus State:** Transition the "Ghost Border" to a 100% opaque `secondary` (Cyan) glow. No thick strokes; keep it at `1px`.

### Specialized Platform Components
- **The "Code-Snippet" Feed:** Use a mono-spaced variant of Inter for community-shared logic, wrapped in a `surface-container-highest` block with a `primary` left-accent glow.
- **Live Pulse Indicator:** A `secondary` (Cyan) dot with a keyframe-animated "ping" shadow to indicate active campus events.

---

## 6. Do's and Don'ts

### Do:
- **Do** use "Breathing Room." With such high-contrast neons, negative space is required to prevent visual fatigue.
- **Do** use `surface-bright` (#2C2C2C) sparingly for extreme highlights or "edge lighting" on components.
- **Do** lean into the "Late-Night" vibe. Use the `tertiary` (Pink) palette exclusively for notifications or "Live" states.

### Don't:
- **Don't** use pure white (#FFFFFF) for long-form body text. Use `on-surface-variant` (#ADAAAA) to reduce eye strain against the black background.
- **Don't** use sharp 90-degree corners. Everything must feel "molded" and ergonomic.
- **Don't** introduce warm colors. No yellows, oranges, or tans. If a warning is needed, use the `error` (#FF6E84) token, which leans cool/magenta.