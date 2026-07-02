# Arch Engineering Pvt Ltd — Production Blueprint

A multi-page marketing site with a secure admin dashboard, built in a
single React (Vite) project. Public visitors browse the homepage, full
project archive, individual project pages, About Us pages, Service
pages, News, and Contact; authenticated admins manage Projects and News
at `/admin` — including secure image uploads to a **private** Supabase
Storage bucket.

Company details (name, address, phone, email) are sourced from Arch
Engineering's public Facebook Page and centralized in
`src/utils/constants.js` — edit that one file if any detail changes.

---

## 1. Stack

| Layer        | Choice                                  |
|--------------|------------------------------------------|
| Framework    | React 18 + Vite                          |
| Styling      | Tailwind CSS (custom design tokens)      |
| Routing      | React Router v6                          |
| Backend      | Supabase (Postgres + Auth + Storage)     |
| Icons        | lucide-react                             |

---

## 2. Site Map

```
/                          Homepage — Hero, About summary, Featured Projects
                            (Ongoing only, max 8, 4 per row), News & Media
/projects                  Full project archive — Ongoing AND Completed,
                            no cap, each as its own child section
/projects/:id              Single project detail page (gallery, Client/
                            Completion Date/Location/Project Manager facts)
/about/:slug                One of three About Us pages:
                              company-in-brief | vision-mission | core-values
/services/:slug             One of four Service pages:
                              construction-project-execution
                              architectural-structural-design
                              consultancy-services
                              quantity-surveying-cost-estimation
/contact                   Contact page — embedded map + contact form
/login                     Admin sign-in (no public sign-up)
/admin                     Admin dashboard — Manage Projects, Manage News
```

There is intentionally **no Careers page or feature** — it was removed
completely (public page, nav link, admin panel, database table, and all
related code). See `supabase/migration_remove_careers.sql` if migrating
an existing database that still has the old `careers` table.

---

## 3. Directory Structure

```
src/
├── components/
│   ├── ui/              # Atoms: Button, Input/Textarea/Select/FileInput, Card/Badge/Spinner, ImageCarousel
│   ├── layout/           # Navbar (About/Services dropdowns), Footer, Section, SmartLink (route vs anchor)
│   ├── sections/         # Hero, ProjectCard, NewsCard, HeroCarousel — presentational, data-agnostic
│   └── forms/            # ContactForm, ProjectForm, NewsForm — own their own state + submit logic
├── context/
│   └── AuthContext.jsx   # Supabase auth session, exposed via useAuth()
├── hooks/
│   ├── useProjects.js    # Fetch ALL projects + full image gallery + resolve every signed URL
│   ├── useProject.js     # Fetch ONE project by id (used by the detail page)
│   └── useNews.js        # Fetch news posts + resolve optional cover image
├── pages/
│   ├── Home.jsx            # Homepage — Hero, About summary, Featured Projects, News
│   ├── AllProjects.jsx      # /projects — full archive, Ongoing + Completed child sections
│   ├── ProjectDetail.jsx    # /projects/:id — fact grid + description + gallery
│   ├── AboutDetail.jsx      # /about/:slug — one template, driven by ABOUT_PAGES in constants.js
│   ├── ServiceDetail.jsx    # /services/:slug — one template, driven by SERVICES in constants.js
│   ├── Contact.jsx          # /contact — map embed + contact form
│   ├── Login.jsx            # Admin sign-in
│   └── AdminDashboard.jsx   # Split-screen CRUD dashboard: Projects / News
├── services/
│   └── supabase.js       # The ONLY file that imports @supabase/supabase-js directly
├── utils/
│   ├── formatters.js
│   └── constants.js      # Company info, nav structure, ABOUT_PAGES, SERVICES, project categories/statuses
└── App.jsx               # Router + ProtectedRoute
supabase/
├── schema.sql                              # Full schema — tables + RLS + storage policies (fresh projects)
├── migration_add_project_images.sql        # Adds ONLY project_images (multi-image carousel)
├── migration_add_news_and_status.sql       # Adds project status/client/completion_date/project_manager + news_posts table
└── migration_remove_careers.sql            # Drops the old careers table entirely (if upgrading an existing DB)
```

### About Us & Services — one template, several pages

Both follow the same pattern: a single page component
(`AboutDetail.jsx` / `ServiceDetail.jsx`) reads a `:slug` from the URL
and looks up its content in an array in `constants.js`
(`ABOUT_PAGES` / `SERVICES`). The Navbar's dropdowns for "About Us" and
"Services" are **generated from these same arrays**, so adding a 4th
About page or a 5th service is a single new entry in `constants.js` —
no new route, no new page file, no Navbar edit required.

### Multi-image carousel (per project)

Each project has one **cover image** (`projects.image_path`) plus up to
5 **gallery images** (rows in `project_images`, `sort_order` controls
sequence). `<ImageCarousel>` auto-rotates every 4.5s and pauses on
hover, with manual arrows and dot indicators. `useProjects` (list) and
`useProject` (single) both resolve every cover + gallery path into a
signed URL before handing `imageUrls` to the relevant component.

### Homepage vs. full archive

- **Homepage** (`Home.jsx`) shows a "Featured Projects" section: **Ongoing
  projects only**, capped at `MAX_FEATURED_PROJECTS` (8, in
  `constants.js`), displayed 4 per row on desktop.
- **`/projects`** (`AllProjects.jsx`) shows the complete archive — both
  Ongoing and Completed, each as its own child heading, with no cap.

### Project detail pages

Clicking any `<ProjectCard>` navigates to `/projects/:id`
(`ProjectDetail.jsx`), which shows a full-width gallery, then a fact grid
of **Client / Completion Date / Location / Project Manager** (each box
only renders if that field has data — all four are optional except
Location), then the full description, then a photo grid below.

### News & Media

A simple CMS module: `news_posts` table (title, summary, body, optional
cover image, published_at). Manageable from the admin's "Manage News"
panel, shown publicly in the News & Media section on the homepage via
`<NewsCard>`. A post's cover image is optional — text-only announcements
are supported.

### Route vs. same-page anchor links (`SmartLink.jsx`)

With the site now spanning many real routes, `NAV_LINKS` and
`FOOTER_LINKS` mix two kinds of `href`: real routes (`/contact`,
`/projects`) and same-page hash anchors (`#news`, only valid on the
homepage). `SmartLink.jsx` (shared by `Navbar.jsx` and `Footer.jsx`)
decides which to render: a router `<Link>` for real routes always; for
a hash anchor, a plain `<a>` if already on the homepage (just scrolls),
or a `<Link to="/#hash">` if on another page (navigates home first, then
scrolls).

---

## 4. Setup

```bash
npm install
cp .env.example .env       # then fill in your Supabase URL + anon key
npm run dev
```

Then, in the Supabase Dashboard:

1. **SQL Editor** → run the SQL that matches your situation:
   - **Brand new Supabase project** → run all of `supabase/schema.sql`
     (Careers is NOT included — this schema never creates that table).
   - **Already ran an earlier version of schema.sql that included
     `careers`** → run `supabase/migration_remove_careers.sql` to drop it.
   - **Already ran schema.sql but haven't run the other migrations yet**
     → run `migration_add_project_images.sql` then
     `migration_add_news_and_status.sql`, in that order. Both are safe to
     re-run and won't touch your existing data.
2. **Storage** → New Bucket → name it exactly `company-assets` → leave
   **Public** unchecked.
3. **Authentication → Users** → manually add your admin account(s) here.
   There is no public registration flow in this app by design.
4. **Hero photos** → drop 5 images into `public/hero/` named `hero-1.jpg`
   through `hero-5.jpg` (or edit the filenames in `Hero.jsx`'s
   `HERO_IMAGES` array to match whatever you use).

---

## 5. Security Architecture (the part that matters most)

### 5.1 Why no public bucket

A **public** Supabase Storage bucket serves files at a stable URL with
**zero auth check** — anyone with the URL can view it, forever. This
project uses a **private** bucket (`company-assets`) instead. The only
way to view an object in it is a **signed URL** — a token-bearing URL
Supabase issues on request, which expires after a set time (1 hour by
default, see `SIGNED_URL_EXPIRY_SECONDS` in `services/supabase.js`).

### 5.2 The signed-URL flow

```
Visitor loads Home.jsx, AllProjects.jsx, or ProjectDetail.jsx
        │
        ▼
useProjects() / useProject() / useNews() fires
        │
        ▼
fetchProjects() / fetchProjectById() / fetchNewsPosts()
        │   returns rows with `image_path` — a STORAGE PATH
        │   (e.g. "projects/123-tower.jpg"), NOT a usable URL
        ▼
getSignedImageUrls(paths) ─────►  supabase.storage.from('company-assets')
                                     .createSignedUrl(path, 3600)
                                   for each unique path, in parallel
        │
        ▼
Each row gets an `imageUrl` / `imageUrls` field — temporary URL(s) valid
for 1 hour — which is what the relevant component puts in its <img src>.
```

### 5.3 Row Level Security (RLS) — the real boundary

Client-side route guards (`<ProtectedRoute>` in `App.jsx`) only control
what the **UI** lets a visitor click into. They do nothing to stop someone
from opening devtools and calling `supabase.from('projects').insert(...)`
directly with the same public anon key your app already ships. **The only
real boundary is Postgres Row Level Security**, enforced server-side on
every request regardless of which client made it.

| Table              | `SELECT`                       | `INSERT` / `UPDATE` / `DELETE` |
|---------------------|----------------------------------|----------------------------------|
| `projects`          | Anyone                          | `authenticated` only            |
| `project_images`    | Anyone                          | `authenticated` only            |
| `news_posts`        | Anyone                          | `authenticated` only            |
| `contact_messages`  | `authenticated` only (admin inbox) | Anyone can `INSERT`; only `authenticated` can read/delete |
| `storage.objects` (bucket `company-assets`) | Anyone, but only via a signed URL (bucket stays non-public) | `authenticated` only |

Because this app provisions admin accounts manually (no sign-up form),
`auth.role() = 'authenticated'` is an acceptable stand-in for "is an
admin" here.

### 5.4 What `service_role` is and why it's never in this codebase

Supabase issues two keys: `anon` (safe for browsers, relies on RLS) and
`service_role` (bypasses RLS entirely — full admin power). This codebase
**only** ever uses the `anon` key, loaded from `VITE_SUPABASE_ANON_KEY`.
The `service_role` key must never be placed in any `VITE_`-prefixed env
variable or any client-side file.

---

## 6. A note on sourcing

Company facts (name, address, phone, email, "15+ years of experience")
were read from Arch Engineering's public Facebook Page and entered as
plain data in `constants.js` — no design, layout, or written copy was
copied from any other company's website. The project-detail-page
**pattern** (a fact grid of Client/Date/Location/Manager followed by a
description and gallery) is a common, non-proprietary way to present
portfolio projects.

---

## 7. Extending This Later

- **Add a 4th About page or 5th service:** add one object to `ABOUT_PAGES`
  or `SERVICES` in `constants.js` — the route, page rendering, and Navbar
  dropdown all update automatically.
- **More project detail fields:** add a column to `projects` via a new
  migration, select it in `fetchProjects`/`fetchProjectById`, add a field
  to `ProjectForm.jsx`, and add a box to the fact grid in
  `ProjectDetail.jsx` (it already skips any box whose value is empty).
- **Role-based admin tiers:** add a `profiles` table keyed to
  `auth.users.id` with a `role` column, and swap the `to authenticated`
  policies for a `using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))`
  check.
