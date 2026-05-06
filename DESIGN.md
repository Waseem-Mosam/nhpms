---
name: AgriTrack Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#40493e'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#707a6d'
  outline-variant: '#bfc9bb'
  surface-tint: '#1d6c2e'
  primary: '#0c6124'
  on-primary: '#ffffff'
  primary-container: '#2d7a3a'
  on-primary-container: '#b7ffb7'
  inverse-primary: '#89d98d'
  secondary: '#59605c'
  on-secondary: '#ffffff'
  secondary-container: '#dae1dc'
  on-secondary-container: '#5d6460'
  tertiary: '#a9081a'
  on-tertiary: '#ffffff'
  tertiary-container: '#cd2a2f'
  on-tertiary-container: '#ffe9e7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a5f5a7'
  primary-fixed-dim: '#89d98d'
  on-primary-fixed: '#002107'
  on-primary-fixed-variant: '#00531b'
  secondary-fixed: '#dde4de'
  secondary-fixed-dim: '#c1c8c3'
  on-secondary-fixed: '#161d1a'
  on-secondary-fixed-variant: '#414844'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  nav-link:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 220px
  container-padding: 32px
  gutter: 24px
  component-gap: 16px
  stack-tight: 8px
  stack-loose: 24px
---

## Brand & Style

The design system is rooted in the "Modern Corporate" aesthetic, specifically tailored for the agricultural technology sector. It balances the utilitarian needs of data management with a calm, high-end digital experience. The brand personality is professional, reliable, and grounded—evoking a sense of order and organic growth.

The interface prioritizes clarity and focus, drawing inspiration from modern productivity tools like Notion and Linear. By utilizing generous negative space and a restrained decorative palette, the UI reduces cognitive load for users who manage complex ecological and logistical data. The emotional response is one of "systematic tranquility," where the software feels like a silent, efficient partner in the field.

## Colors

The palette is anchored by a rich forest green, symbolizing vitality and agricultural expertise. This primary hue is reserved for high-priority actions and brand-defining moments. 

A "soft-tint" strategy is used for secondary states; for example, active navigation items or selected table rows utilize a very pale green-tinted background to provide clear feedback without visual clutter. The neutral scales are carefully balanced: deep charcoal (#1F2937) ensures high-contrast readability for data, while medium grays (#9CA3AF) are used for secondary metadata and inactive navigation states to maintain a clear hierarchy of importance.

## Typography

The design system utilizes **Inter** for its exceptional legibility and neutral, functional character. The typographic scale is compact and optimized for data-dense dashboard environments.

Navigation elements use a lightweight (400) weight to maintain the "lightweight" feel of the SaaS platform. To distinguish between data types, a strict hierarchy is enforced: labels for form inputs and table headers use a slightly smaller, medium-weight font to anchor the information, while primary data points use a larger, semi-bold weight for immediate recognition.

## Layout & Spacing

This design system employs a **fixed-fluid hybrid grid**. The sidebar is a fixed 220px vertical column, providing a constant anchor for navigation. The main content area is a fluid grid that adapts to the viewport, utilizing a 12-column structure for dashboard widgets and data tables.

Vertical spacing is intentionally generous ("stack-loose") to prevent the data from feeling claustrophobic. Components within cards follow a tighter 8px or 16px rhythm to maintain visual grouping. Margins of 32px are maintained around the primary content area to ensure the UI feels expansive and modern.

## Elevation & Depth

Visual hierarchy is established through **low-contrast outlines** and **ambient shadows**. Rather than heavy drop shadows, the system uses "ghost borders"—1px strokes in a very light gray (#E5E7EB)—to define container boundaries.

Depth is achieved through subtle elevation:
1. **Level 0 (Background):** The #FAFAFA canvas.
2. **Level 1 (Cards/Sidebar):** White surfaces (#FFFFFF) with a 1px border. 
3. **Level 2 (Popovers/Modals):** These use an extra-diffused, 10% opacity charcoal shadow with a 12px blur to separate them from the underlying data without breaking the minimalist aesthetic.

## Shapes

The shape language is "Soft" (0.25rem/4px radius). This slight rounding removes the harshness of sharp corners—aligning with the organic nature of agriculture—while maintaining the professional precision expected of a SaaS tool. 

Larger containers like primary dashboard cards may utilize "rounded-lg" (8px) to soften the overall layout. Interactive elements like segmented controls and buttons follow the 4px standard to ensure a crisp, web-native appearance.

## Components

### Buttons & Inputs
- **Primary Action:** Solid #2D7A3A background with white text. 4px border radius.
- **Form Inputs:** Top-aligned labels in #9CA3AF. Inputs feature a 1px #E5E7EB border that shifts to #2D7A3A on focus.
- **Segmented Controls:** Used for toggling views (e.g., Map vs. List). These should have a subtle gray background with a white "pill" indicating the active state.

### Navigation & Feedback
- **Sidebar Items:** Monoline icons (20px) paired with 14px text. The active state uses a #F0F7F1 background and a 2px vertical green "indicator" on the left edge.
- **Status Chips:** Small, rounded badges for "Growing," "Harvested," or "Alert." Use low-saturation background tints with high-saturation text for readability.
- **Logout:** Text or icon styled in a soft red to prevent accidental triggers while remaining distinct from the primary green theme.

### Cards
- **Dashboard Cards:** White background, 1px border, and a subtle 4px blur shadow. Content inside should have a padding of 24px to ensure data "breathes."
