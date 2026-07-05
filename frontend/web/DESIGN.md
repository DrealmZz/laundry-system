---
name: LuxeWash
description: Premium laundromat POS and management system for Laundaja Group
colors:
  navy-deep: "#0f172a"
  navy-medium: "#1e3a5f"
  navy-surface: "#1e40af"
  gold: "#d4a843"
  gold-light: "#e8c36a"
  teal: "#0891b2"
  teal-light: "#22d3ee"
  surface-page: "#dfe6ef"
  surface-card: "rgba(255,255,255,0.55)"
  surface-sidebar-footer: "#0a1628"
  surface-sidebar-deep: "#070f1e"
  ink-primary: "#0f172a"
  ink-secondary: "#334155"
  ink-muted: "#64748b"
  ink-subtle: "#94a3b8"
  status-success: "#00a854"
  status-success-bg: "#ecfdf5"
  status-warning: "#d4a843"
  status-warning-bg: "#fffbeb"
  status-error: "#ef4444"
  status-error-bg: "#fef2f2"
  status-info: "#0891b2"
  status-info-bg: "#ecfeff"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 900
    lineHeight: 1.2
  body:
    fontFamily: "Plus Jakarta Sans, Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    fontSize: "10px"
    letterSpacing: "0.1em"
    textTransform: uppercase
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    background: "linear-gradient(135deg, #1e3a5f, #0891b2)"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-primary-hover:
    background: "linear-gradient(135deg, #1a3358, #0e7490)"
  button-gold:
    background: "linear-gradient(135deg, #d4a843, #e8c36a)"
    textColor: "#0f172a"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card-glass:
    backgroundColor: "rgba(255,255,255,0.55)"
    backdropFilter: "blur(16px)"
    border: "1px solid rgba(255,255,255,0.5)"
    rounded: "{rounded.lg}"
    padding: "20px"
  sidebar:
    background: "linear-gradient(180deg, #0f172a, #1e3a5f)"
    textColor: "#94a3b8"
---

# Design System: LuxeWash

## 1. Overview

**Creative North Star: "The Glass Vault"**

A premium financial interface built on glassmorphism principles—frosted glass cards floating over cool blue-gray gradient backgrounds, with deep royal blue sidebars and metallic gold accents. The system conveys luxury through transparency, depth, and restraint: every element earns its place through function and visual harmony.

This is a working tool for staff who need instant visual clarity, wrapped in a premium aesthetic that matches the "Luxe" brand positioning. The frosted glass cards and subtle gradients create depth without heaviness—modern luxury through transparency, not through ornament.

**Key Characteristics:**
- **Glassmorphic architecture**: Frosted glass cards (`backdrop-filter: blur`) over cool blue-gray gradient backgrounds create layered depth
- **Deep blue sidebar**: Rich royal blue gradient sidebar framing light glass content area creates clear spatial hierarchy
- **Gold as signal, not noise**: Metallic gold (#d4a843) appears sparingly—primary CTAs, key actions, brand moments—never decoration
- **Teal as functional accent**: Rich teal (#0891b2) for interactive elements, links, and active states throughout the interface
- **Dense but breathable**: Tables and dashboards pack information efficiently while maintaining generous whitespace between groups
- **Status-driven color**: Semantic colors (green/gold/red) appear only in status indicators and feedback, never as decoration
- **Typography as hierarchy**: Weight and case (uppercase labels, black headings) do the work; minimal font size variation reduces noise

## 2. Colors

A restrained glassmorphic palette: deep royal blue anchors the sidebar architecture while frosted glass cards with metallic gold and rich teal accents provide interactive emphasis against cool blue-gray gradient backgrounds.

### Primary
- **Deep Royal Navy** (#0f172a): The foundational dark tone. Used for the sidebar gradient start, primary text, and key headings. It's the "night sky" that makes the teal and gold glow.
- **Medium Navy** (#1e3a5f): Sidebar gradient end, elevated surfaces within the dark sidebar.

### Accent
- **Rich Teal** (#0891b2): The primary functional accent. Used for: active navigation indicators, interactive elements, links, focus rings, and chart accents. Appears frequently but always purposefully.
- **Metallic Gold** (#d4a843): The brand's signature warmth. Used exclusively for: primary CTA buttons, key action icons, and emphasis moments. Its rarity is the point.

### Glass
- **Glass Card** (rgba(255,255,255,0.55) + blur(16px)): Standard frosted card surface
- **Glass Elevated** (rgba(255,255,255,0.7) + blur(24px)): Modals, elevated surfaces
- **Glass Input** (rgba(255,255,255,0.45) + blur(8px)): Form fields

### Neutral
- **Page Gradient**: Linear gradient from #c8d5e3 to #d5dde8 — cool blue-gray background
- **Ink Primary** (#0f172a): Main body text and headings. Maximum contrast against glass.
- **Ink Secondary** (#334155): Supporting labels and secondary information.
- **Ink Muted** (#64748b): Tertiary text, placeholder content, disabled states.
- **Ink Subtle** (#94a3b8): The lightest readable text—sidebar inactive items, subtle hints.

### Status
- **Success Green** (#00a854 on #ecfdf5): Completed transactions, active status, positive trends.
- **Warning Gold** (#d4a843 on #fffbeb): In-progress items, attention needed, caution states.
- **Error Red** (#ef4444 on #fef2f2): Failed states, rejection actions, critical alerts.
- **Info Teal** (#0891b2 on #ecfeff): Neutral informational callouts, special categories.

### Named Rules
**The Gold-Ration Rule.** The metallic gold (#d4a843) appears on ≤5% of any screen. It marks the ONE primary action or the ONE active state. If two elements on the same screen both use gold, one is wrong.

**The Glass-Depth Rule.** All content cards use glassmorphism (backdrop-filter blur + semi-transparent white). Never use solid white backgrounds for cards. The frosted glass effect creates depth through transparency, not shadows.

**The Sidebar-Content Divide.** The sidebar is always a deep blue gradient; the content area is always a cool blue-gray gradient with glass cards. Never mix—no light sidebars, no dark content backgrounds.

## 3. Typography

**Display Font:** Plus Jakarta Sans (with Inter fallback)
**Body Font:** Plus Jakarta Sans (with Inter fallback)
**Mono Font:** JetBrains Mono

**Character:** A single geometric-humanist sans family in multiple weights carries the entire interface. Plus Jakarta Sans brings warmth through its rounded terminals while maintaining the precision needed for a professional tool. The mono companion handles transaction IDs and timestamps.

### Hierarchy
- **Display** (Black 900, 20px, line-height 1.2): Page titles, dashboard headings. Always in the brand's deep navy.
- **Headline** (Black 900, 16px, line-height 1.3): Section headers within cards and panels.
- **Title** (Bold 700, 14px, line-height 1.4): Subsection headings, table headers, card titles.
- **Body** (SemiBold 600, 12px, line-height 1.5): Primary body text, table cells, list items. Max line length 75ch for prose; tables can run denser.
- **Label** (Black 900, 10px, letter-spacing 0.1em, uppercase): Metadata labels, column headers, status indicators. Always uppercase with wide tracking. Used with JetBrains Mono for an operational feel.
- **Mono** (Regular 400, 12px): Transaction IDs, timestamps, numeric data. JetBrains Mono for technical clarity.

### Named Rules
**The Weight-Over-Size Rule.** Hierarchy comes from weight (Black → Bold → SemiBold), not from dramatic size changes. The scale is tight (10px → 20px); exaggerated contrast creates noise in a dense dashboard.

**The Uppercase-Label Rule.** All metadata labels (column headers, section markers, status text) use 10px uppercase with 0.1em tracking in the mono font. This creates an "operational terminal" feel without being cold.

## 4. Elevation

A glassmorphic system where depth is conveyed through frosted glass transparency, backdrop blur, and layered semi-transparent surfaces rather than heavy drop shadows.

### Shadow Vocabulary
- **Glass Shadow** (`box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08)`): Standard glass cards at rest. Subtle depth through transparency.
- **Glass Elevated** (`box-shadow: 0 16px 48px rgba(15, 23, 42, 0.12)`): Modals, elevated surfaces, hover states on cards.
- **Sidebar Depth** (`box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)`): The sidebar itself, creating a "floating panel" effect against the content area.

### Named Rules
**The Glass-By-Default Rule.** All content surfaces use glassmorphism (backdrop-filter blur + semi-transparent white). Shadows enhance but never replace the glass effect.

## 5. Components

### Buttons
- **Shape:** Gently curved edges (12px radius). Consistent across all button types.
- **Primary:** Gradient from deep navy (#1e3a5f) to teal (#0891b2), white text, semi-bold 12px. Padding 10px 20px. The "do the thing" action.
- **Hover:** Slightly shifted gradient with teal glow shadow. Subtle transition (200ms).
- **Gold Accent:** Gradient from gold (#d4a843) to light gold (#e8c36a), navy text. Used sparingly for brand moments (logo, key CTA on dark surfaces).
- **Ghost:** Transparent with navy text. For secondary actions, less visual weight.

### Cards / Containers (Glassmorphic)
- **Corner Style:** Generously rounded (16px radius for major cards, 12px for nested elements)
- **Background:** Frosted glass (rgba(255,255,255,0.55)) with backdrop-filter blur(16px)
- **Border:** 1px solid rgba(255,255,255,0.5)—subtle white border for glass definition
- **Shadow:** Glass shadow at rest, glass elevated on hover for interactive cards
- **Internal Padding:** 20px (p-5) for standard cards, 24px (p-6) for feature cards

### Inputs / Fields
- **Style:** Frosted glass background (rgba(255,255,255,0.45)), white border (rgba(255,255,255,0.5)), 12px radius
- **Focus:** Ring treatment—2px teal/15 ring, border shifts to teal, background brightens
- **Placeholder:** Muted text with sufficient contrast

### Tables
- **Header:** 10px uppercase mono labels in muted text, frosted glass background (rgba(255,255,255,0.2))
- **Rows:** Transparent with white/15 hover state for interactivity
- **Cells:** 12px semi-bold body text, generous padding (16px vertical)
- **Status Badges:** Rounded pills with semantic background colors and subtle borders

### Navigation (Sidebar)
- **Style:** Deep blue gradient background (linear-gradient(180deg, #0f172a, #1e3a5f)), light text (#94a3b8 default, white active)
- **Active State:** White/10 background with teal left indicator bar
- **Hover:** Subtle white/5 background shift, text brightens to white
- **Icons:** 16px Lucide icons, teal-light when active, white/30 when inactive
- **Mobile:** Fixed sidebar, collapses on small screens

### Status Indicators
- **Pills/Badges:** Rounded-full capsules with semantic colors and subtle borders. 9-10px uppercase mono text. Colors: green (success), gold (warning), red (error), teal (info).
- **Dot Indicators:** 8-10px circles for online/status indicators. Pulsing animation for active states.

## 6. Do's and Don'ts

### Do:
- **Do** use the deep blue gradient sidebar as the primary spatial anchor. Every screen should feel grounded by it.
- **Do** reserve gold (#d4a843) for exactly ONE primary CTA or emphasis per screen. Its scarcity creates emphasis.
- **Do** use frosted glass cards (`glass-card` class) for all content containers. The glassmorphism creates premium depth.
- **Do** use teal (#0891b2) for interactive elements, links, and active navigation states.
- **Do** use uppercase mono labels (10px, JetBrains Mono, 0.1em tracking) for all metadata and column headers. This creates the "operational terminal" aesthetic.
- **Do** maintain the tight typography scale (10-20px). Dramatic size jumps create noise in dense dashboards.
- **Do** use semantic status colors (green/gold/red) consistently for transaction states, employee status, and system feedback.
- **Do** use soft gradients on buttons and KPI card icons. Flat colors with subtle shadows convey premium restraint.

### Don't:
- **Don't** use gold as a background color, border treatment, or decoration. It's a signal color, not a surface.
- **Don't** use solid white backgrounds for cards. Always use glassmorphism (`glass-card` class).
- **Don't** mix light and dark backgrounds in the content area. Sidebar is dark blue gradient; content is cool blue-gray with glass cards. No exceptions.
- **Don't** use display fonts (Plus Jakarta Sans Black) for labels, buttons, or data. Reserve Black weight for headings only.
- **Don't** add decorative motion or choreographed animations. Motion conveys state (hover, loading, success), not delight.
- **Don't** use gradients on text surfaces. Flat colors with subtle glass effects convey premium restraint.
- **Don't** invent non-standard form controls or navigation patterns. Stick to familiar POS/dashboard conventions.
- **Don't** use the SAP/Oracle anti-reference: avoid overwhelming form density, complex multi-step wizards, or information overload. Every screen should have clear visual hierarchy.
- **Don't** use tiny uppercase tracked eyebrows above every section. Reserve the uppercase-label pattern for data tables and status indicators only.
