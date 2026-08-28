# Dialogue Room — Design Language

The bar: the app should look like an experienced product designer specced it and a developer implemented that spec faithfully. Think Linear/Vercel/Stripe-level polish, not Bootstrap-era admin panels. Every screen must hold up in BOTH light and dark mode.

## Foundations

- **Typography**: `next/font` — Geist Sans for UI (fallback Inter), tight tracking on headings (`tracking-tight`), generous line-height on body. Scale: 12/14/16 body, 18/20 section titles, 30–60 display (landing hero). Never more than 2 weights per screen (regular + semibold/bold).
- **Color**: brand palette (`--color-brand-*`, blue) is defined in `globals.css`. Use neutral slate/zinc surfaces; brand color is for PRIMARY actions, active states, focus rings, and small accents only — never large filled areas except the landing hero. Light: white/slate-50 surfaces, slate-200 hairline borders. Dark: layered `#0b1220`-family surfaces (not pure black), slate-800 hairlines, slightly desaturated brand tones.
- **Depth**: subtle. `rounded-xl`/`rounded-2xl` cards, 1px borders + very soft shadows (`shadow-sm`, colored `shadow-brand-500/10` only on primary CTAs). No heavy drop shadows.
- **Spacing**: 4px grid. Cards `p-5`/`p-6`; page gutters `px-4 sm:px-6 lg:px-8`; section gaps `gap-6`/`gap-8`. Max content width `max-w-6xl` (marketing `max-w-7xl`).
- **Motion**: `transition-colors duration-150` on all interactive elements; `transition-all duration-200` for hover-lift (`hover:-translate-y-0.5` on cards max); subtle `animate-in` fades for lists/messages (CSS keyframes in globals if needed). Nothing bouncy.
- **Focus**: visible focus ring everywhere — `focus-visible:ring-2 ring-brand-500/60 ring-offset-2` (offset uses surface color; dark-mode offset `ring-offset-slate-900`).

## Patterns

- **Buttons**: primary = brand-600 filled, hover brand-700; secondary = surface + hairline border; ghost for tertiary; destructive = rose-600. Heights: h-9 (sm), h-10 (md), h-11 (lg, auth/CTAs). Loading state = inline spinner replacing label, width preserved.
- **Inputs**: h-10, rounded-lg, surface background, hairline border, brand focus ring, label above in 13px medium slate-600/dark:slate-300, error text 12px rose-600 with 4px gap. Never browser-default selects without styling.
- **Cards / list rows**: hairline border + `bg-white dark:bg-slate-900/60`. Hover on interactive rows: `bg-slate-50 dark:bg-slate-800/50`.
- **Avatars**: circular, ring-1 ring-black/5; presence dot = absolute bottom-right, 10px, emerald-500 with white/dark ring, only when online.
- **Chat bubbles**: mine = brand-600 white text, rounded-2xl with small tail-side corner (`rounded-br-md`); theirs = slate-100/dark:slate-800, `rounded-bl-md`. Max width 72%. Group consecutive messages from the same sender (tighter gap, avatar/timestamp only on the last). Timestamps 11px muted, on hover or group end. Read receipt = tiny double-check in brand-300 when read.
- **Empty states**: centered icon in a soft brand-50/dark:brand-950 circle, 15px title, 13px muted description, optional CTA. Never a blank pane.
- **Loading**: skeletons (`animate-pulse` rounded blocks matching the real layout) for lists/pages; spinners only for actions.
- **Toasts**: sonner `richColors`, short sentences.
- **Badges**: pill, 11px medium, tinted background (e.g. brand-50 text-brand-700 / dark:brand-950 dark:text-brand-300).

## Screens (the feel)

- **Landing**: a dark, Clearmots-inspired art direction — always-dark marketing canvas (warm charcoal `#1a1d21`-family, scoped locally via a `.marketing-surface` wrapper class, independent of the app's light/dark toggle; the toggle itself is removed from the marketing header). Each section is a giant full-width `rounded-3xl` panel in a slightly different charcoal tone, with the page background visible between panels for a stacked-cards feel. Accents: golden amber (`amber-400`) strictly for primary CTAs, icon chips, badges, and accordion chevrons; soft sky blue (`sky-300`) for exactly one accented word per headline plus decorative elements; white display type; slate-300/400 body text. Simple hand-drawn-style outlined cloud SVGs float near headlines, and a cloud-notch corner mask (CSS `mask-image`) bites a soft scalloped corner out of one or two corners of each feature photo. Display type: hero `clamp(3rem,7vw,4.5rem)` bold tracking-tight, section headlines `clamp(2rem,4vw,3rem)`. Structure: sticky translucent-charcoal header (blurs in on scroll) with logo + nav pill group + amber CTA that switches label with auth state; hero panel with staggered entrance motion, amber primary CTA + white secondary pill, floating clouds, and a sky-blue illustration card; features panel (3 cards with cloud-notched photos + amber icon chips); "how it works" panel (3 numbered amber steps + illustration); FAQ panel (dark accordion rows with amber chevron chips); footer panel (Product/Legal columns, social placeholders). Motion (via `motion/react`): hero staggered entrance on load, `whileInView` fade+rise (`once: true`, ~40px) with staggered children for card grids/FAQ rows, gentle infinite cloud float/parallax, header blur-on-scroll — all gated behind `useReducedMotion()` so reduced-motion users get simplified/no animation. Policy pages and `not-found` share the same dark charcoal treatment with cloud-notched banner images for coherence; `(auth)` pages are unaffected. The old project's artwork in `public/images` + `public/icons` + `/logo.png` is licensed for reuse — modern execution, old illustrations; cloud motifs and panel treatment are original, not cloned from any reference site. **Copy rule: never use "partner(s)" in user-facing text (dating-app connotation) — say "language learners", "language buddy", "meet learners", etc.**
- **Auth pages**: split or centered card on a subtle gradient/grid background, logo on top, generous whitespace, single-column form, 15px inputs.
- **App shell**: sidebar 260px, surface slightly offset from content background, nav items rounded-lg with active = brand-50/dark:brand-950 + brand-600 text + 3px left indicator; user card pinned bottom. Content area has a page header (title + subtitle 13px muted) and breathing room.
- **Search**: filter bar as a card (or left rail on lg), results in a responsive grid of profile cards: avatar, name+age, country with flag-ish subtlety, language chips ("Speaks X · Learning Y"), relation-aware action button.
- **Friends**: tabs (Friends / Incoming / Sent) with count badges; rows with avatar+presence, languages, actions right-aligned.
- **Chat**: two-pane (list 320px + thread). List rows: avatar+presence, name, last-message preview truncated, relative time, unread count pill (brand-600). Thread: sticky header with partner identity + online status, messages area with date separators (11px centered pills), composer pinned bottom — auto-growing textarea in a rounded-2xl container with send icon-button (disabled when empty), typing indicator as three animated dots above composer.

## Rules

- Light AND dark verified for every screen — no unreadable combos, no pure-black dark mode.
- Real `next/font` (no FOUT hacks), consistent icon set (lucide, 16–20px, stroke-width 1.75–2).
- No layout shift on load: reserve space via skeletons and fixed header/sidebar sizes.
- Responsive: sidebar collapses to a mobile drawer / bottom-safe layouts; chat becomes single-pane with back navigation on <lg.
- No emoji as UI icons; no default-blue links in app chrome; no unstyled scrollbar jumps in the chat pane (use `scrollbar-thin` styling in globals).
