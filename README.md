# Starvix

Marketing site and case-study portfolio for the Starvix product engineering
studio, with a built-in CMS for editing content without a deploy.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase

## Getting started

```bash
cp .env.example .env.local   # then fill in the Supabase values
npm install
npm run dev
```

| Command         | Purpose                                     |
| --------------- | ------------------------------------------- |
| `npm run dev`   | Development server on :3000                 |
| `npm run build` | Production build (also runs `tsc`)          |
| `npm run start` | Serve the production build                  |
| `npm run lint`  | ESLint                                      |

## Architecture

### Content flows one way

```
Supabase ──> src/lib/content.ts ──> server components ──> HTML
                  (cached, typed)
```

`src/lib/content.ts` is the **only** module that reads public content from
Supabase. It does two jobs, and both matter:

- **Caching.** Every read is wrapped in `unstable_cache` with a tag and an hourly
  revalidation window, so pages serve from cache instead of querying the database
  per request. Public pages are static or ISR — none of them are `force-dynamic`.
- **Normalisation.** CMS rows are partial JSON where any field may be missing, and
  image columns hold either a bare storage path or an absolute URL. Everything is
  narrowed to the types in `src/lib/types.ts` with fallbacks there, so components
  never need a `?.` chain or a hardcoded default.

Public pages are server components. The only client components are the ones that
genuinely need the browser: the nav panel, the theme toggle, the gallery lightbox,
the local-time readout, the print button, and the inquiry form.

### Design tokens

`src/app/globals.css` defines two layers:

1. A **palette** of raw values (`--color-gray-*`, `--color-brand-*`). Never used
   directly by components.
2. **Semantic tokens** (`--color-surface`, `--color-fg-muted`, `--color-line`, …)
   that map a palette value to a role and flip between light and dark.

Components only use the semantic layer — `bg-surface`, `text-fg-muted`,
`border-line`. Adding a theme or changing the palette is a change in one file.

The brand accent is the exception: it is CMS-editable, so `BrandAccent` publishes
it as `--accent` at runtime. Both themes honour it.

**Light and dark work everywhere, including the admin.** The theme control writes one
global preference shared by the public site and the CMS — there is no separate admin
theme. The only deliberately fixed-dark elements are modal scrims and the case-study
photo viewer, which should dim the page behind them regardless of theme.

### Editing content

The CMS lives at `/admin` (Supabase Auth, gated by `src/proxy.ts`):

| Route              | Edits                                                      |
| ------------------ | ---------------------------------------------------------- |
| `/admin/dashboard` | Homepage hero copy, about-page copy and portrait            |
| `/admin/projects`  | Case studies — cover, gallery, stack, live link, ordering    |
| `/admin/team`      | Team members — photo, role, bio, links, ordering             |
| `/admin/brand`     | Studio name, logo, **favicon**, accent colour               |
| `/admin/stack`     | Capability list                                             |
| `/admin/footer`    | Footer copy, contact details, social links                  |
| `/admin/inbox`     | Submitted inquiries                                         |

The admin uses the same design tokens and primitives as the public site
(`src/components/admin/ui.tsx`), so the two don't drift apart — and it follows the
same light/dark preference, with a toggle in the sidebar and on the sign-in screen.

**Edits publish immediately.** The admin writes to Supabase from the browser, which
the server can't observe, so each editor calls the `revalidateContent` server action
after a successful save to clear the matching cache tag. Without that call an edit
would take up to the hourly revalidation window to appear.

Some content is deliberately **not** CMS-editable and lives in `src/lib/site.ts`:
service definitions, the delivery process, engagement models and operating
commitments. These are commercial claims, so they should change through code
review rather than a text field.

> **Fabricated social proof was removed in the rebuild** — client logos,
> testimonials and project-count statistics that named companies and people who
> were not real clients. Credibility now rests on the operating commitments in
> `src/lib/site.ts`, all of which are verifiable. Do not reintroduce placeholder
> proof; enterprise buyers check references.

### Favicon

There is no static `favicon.ico`. `src/app/icon.tsx` and `src/app/apple-icon.tsx`
generate the icons from the CMS at build time, resolving in order:

1. A dedicated favicon uploaded at `/admin/brand`
2. The studio logo
3. The studio initial on the brand accent colour

Using the file convention rather than `metadata.icons` means Next emits a
content-hashed URL (`/icon?abc123`), so changing the favicon actually invalidates the
browser's cached copy. Remote fetches are wrapped: if the asset is unreachable or is
an SVG (Satori has no SVG rasteriser), it degrades to the initial rather than failing
the build.

### Team

The team section on the About page renders **only when at least one member exists**
at `/admin/team`. That is deliberate, not an edge case: the studio is presented as a
studio but is not currently a team, and a one-person "Our team" section reads worse to
a prospective client than none at all. Adding people makes the section appear.

### Inquiries

`src/app/inquiry/actions.ts` is a server action:

1. Validate (`src/lib/validate.ts`) — the server is authoritative; browser
   attributes are a convenience only.
2. Screen for abuse — honeypot field, per-IP rate limit, duplicate-email window.
3. Persist to Supabase. **This is the commitment** — once the row is written, the
   lead is safe in `/admin/inbox`.
4. Email you an alert (`src/lib/mailer.ts`) — subject `New message on your
   portfolio — <name>`, with reply-to set to the prospect so hitting reply
   writes to them. Plain SMTP against your own mailbox; see `.env.example`.

**Run `supabase/inquiries.sql` once** in the Supabase SQL editor. It creates the
table and its row-level security policies: `anon` may insert (the public form),
`authenticated` may read/update/delete (you, at `/admin/inbox`). Without it, RLS
rejects every submission with `42501` and the inbox stays empty.

No third-party mail provider is used. The two legs back each other up: the
Supabase row is the record of truth, so a mail outage costs only a notification —
and if the *write* fails, the email is sent anyway, flagged `[ACTION NEEDED — not
saved]`, so the lead survives either failure alone.

### SEO

Per-page `metadata` with canonical URLs, generated OpenGraph cards
(`opengraph-image.tsx` at the root and per case study), `sitemap.ts`, `robots.ts`,
and JSON-LD (`ProfessionalService`, `WebSite`, `CreativeWork`, `BreadcrumbList`)
built in `src/lib/seo.ts`.

`robots.ts` **defaults to allowing indexing** and only disallows on positive
evidence of a preview or local deployment. The inverse would fail dangerously: a
host that doesn't set the expected environment variable would silently de-index
production with nothing in the build output to show it.

### Accessibility

Treated as a build requirement, not a later pass:

- Skip link to `<main>`; a single `<h1>` per page.
- Visible `:focus-visible` rings from one token.
- Focus trapped and restored in the nav panel and the gallery dialog; Escape closes.
- `prefers-reduced-motion` honoured in CSS **and** in JS — `Reveal` checks
  `useReducedMotion()` and renders a plain element, because Framer Motion animates
  via inline style and CSS overrides can't reach it.
- Every form control has a real `<label>`; errors use `aria-describedby` and
  `role="alert"`.
- Minimum text size is `--text-2xs` (11px), reserved for labels.

## Deployment

Deploys to Vercel with no extra configuration. Set the environment variables from
`.env.example` in the project settings — in particular `NEXT_PUBLIC_SITE_URL`,
without which canonical URLs point at the `*.vercel.app` domain.

Security headers (HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.
