# Human Resource — Department Scale

Internal AEG dashboard: department salary scale, pay-band alignment, and the data
quality of both. Presentation layer follows **AEG Dashboard — UI Design &
Formatting Specification v1.0**.

## Stack
- Next.js 14 (App Router), React 18, **Tailwind CSS 3.4**, **Recharts 2**, `xlsx` for exports
- Supabase Postgres (project `Human_Resource_Department_Scale`)
- Session auth against `app_users` — manual passwords, no auto-reset

The reference implementation is TypeScript; this build is plain JS. Nothing in the
spec's presentation layer depends on TS, and the tokens, components and layouts are
carried over unchanged.

## Environment variables (Vercel → Settings → Environment Variables)

| Name | Where it comes from |
|---|---|
| `SUPABASE_URL` | `https://qggbhaglaognrwfjxkeg.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase → Settings → API Keys → create a secret key (`sb_secret_…`) |
| `SESSION_SECRET` | any long random string, e.g. `openssl rand -base64 48` |

`SUPABASE_SECRET_KEY` must NOT carry the `NEXT_PUBLIC_` prefix. It bypasses RLS and
is only ever read server-side.

## Design tokens
`tailwind.config.js` carries the brand colors (`maroon #98012E`, `maroon-bright
#C4123F`, `charcoal #21201E`) and the Calibri font stack. `app/globals.css` carries
the five surface variables, the `html, body` rule and the sticky `thead th` rule.
Theme preference persists in `localStorage` under `aeg-theme`, applied before paint
by an inline script in `<head>`.

Two documented deviations from the spec, both to fix stated gaps rather than taste:

1. **`--brand-ink`.** Spec §1.1 puts brand text in maroon. On the dark surface
   `#98012E` measures ~2.5:1, below the text floor, so dark mode steps to the
   spec's own accent `#C4123F` for maroon *text* (org name, active nav label,
   tags). Fills, rules and pills stay `#98012E` in both modes.
2. **Global `:focus-visible`.** Spec §6.11 flags the reference build for having no
   focus ring outside the login inputs and asks new builds to add one. `globals.css`
   defines a maroon ring for every focusable control, and `MultiSelect` closes on
   `Escape` as well as outside click.

Chart series 2 uses `var(--text)` rather than `charcoal`, since charcoal is
invisible on the dark surface — consistent with §4.9 "charts consume `var(--*)`
tokens and therefore re-theme automatically."

## Navigation
232px expanded / 56px collapsed rail, one landing tab above two labeled sections,
Unicode glyph icons, collapse state persisted under `aeg.nav.collapsed` and
`aeg.nav.sections`.

| Route | Tab |
|---|---|
| `/` | Overview (Master) |
| `/scale` | Salary Scale |
| `/outlook` | Department Outlook |
| `/quality` | Data Quality |
| `/metrics` | Metrics & Budgets — awaiting a revenue source |
| `/market` | Market Analysis — awaiting job descriptions |

Every tab follows the canonical order: Header → Filters → KPIs → Insights →
Summary rollup → Detail table.

## Logo
`public/argents-logo.jpg` — the supplied no-tagline lockup, 1000×145 on white. It
sits on an explicit white plate so it stays clean in dark mode. If the file is ever
missing the login page falls back to a text lockup automatically, so a missing asset
can never break the page. `app/icon.png` is the favicon, cropped from the same
artwork's bar mark.

## Security model
Every table has RLS enabled with no policies, so the anon/publishable key reads
nothing. All data access happens in server components with the secret key, gated by
a signed httpOnly session cookie. Login attempts are written to `app_login_audit`.

## Creating users
Either set `password_input` on the row in the Supabase table editor — a trigger
bcrypts it into `password_hash` and blanks the field in the same statement — or:

```sql
select create_app_user('someone@argents.com', 'Full Name', 'admin', 'the-password');
select set_app_user_password('someone@argents.com', 'new-password');
```

`role` must be exactly `admin`, `editor` or `viewer`. Job titles go in `job_title`.

## Data refresh
The two Paylocity reports land in SharePoint every other Friday under
`Dashboards & Reports - Documents/Human Resource - Operations Overview/Paylocity_Report_Dumps/`.
Loading them into Supabase is currently manual; automating it needs an Azure app
registration with read access to that site.
