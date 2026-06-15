![preview](./assets/preview.png)
# StackShop — Modern E-Commerce Platform 🛒

> Built with TanStack Start · React 19 · Drizzle ORM · Supabase

---

## Table of Contents

**Overview**
- [🤔 What is this?](#overview)
- [🛠️ Core Technologies](#core-technologies)
- [💫 Application Features](#application-features)
- [👤 Demo users](#demo-users)
- [📁 Project Structure](#project-structure)
- [🗄️ Database Schema](#database-schema)
- [🔐 Environment Variables](#environment-variables)

**Build Log**
- [🏗️ Phase 1 — Project Foundation](#phase-1)
  - [Step 1 — Scaffold the project](#p1-s1)
  - [Step 2 — Cleanup, Header & product routes](#p1-s2)
  - [Step 3 — Add shadcn/ui on top of Tailwind](#p1-s3)
  - [Step 4 — Base Header design](#p1-s4)
- [📦 Phase 2 — Data Layer & Product Display](#phase-2)
  - [Step 1 — Fake product data & server loader](#p2-s1)
  - [Step 2 — ProductCard component](#p2-s2)
  - [Step 3 — Products catalog page](#p2-s3)
  - [Step 4 — Route Middleware](#p2-s4)
  - [Step 5 — TanStack Query integration](#p2-s5)
- [🐘 Phase 3 — Database Setup with Drizzle + Supabase](#phase-3)
  - [Step 1 — Install dependencies](#p3-s1)
  - [Step 2 — Create a Supabase project](#p3-s2)
  - [Step 3 — Configure .env](#p3-s3)
  - [Step 4 — Database client](#p3-s4)
  - [Step 5 — Define the schema](#p3-s5)
  - [Step 6 — Drizzle config](#p3-s6)
  - [Step 7 — Add scripts to package.json](#p3-s7)
  - [Step 8 — Generate and push the schema](#p3-s8)
  - [Step 9 — Seed the database](#p3-s9)
- [🔌 Phase 4 — Real Data Layer](#phase-4)
  - [Step 1 — Install Zod](#p4-s1)
  - [Step 2 — Create src/data/products.ts](#p4-s2)
  - [Step 3 — Wire routes to the data layer](#p4-s3)
  - [Step 4 — Product detail page](#p4-s4)
  - [Step 5 — Dynamic metadata](#p4-s5)
- [⚡ Phase 5 — Streaming UI & Loading States](#phase-5)
  - [Step 1 — Suspense + use() for streamed recommended products](#p5-s1)
- [📝 Phase 6 — Create Product Form](#phase-6)
  - [Step 1 — Install TanStack Form](#p6-s1)
  - [Step 2 — Install shadcn/ui form components](#p6-s2)
  - [Step 3 — productSchema & createProduct](#p6-s3)
  - [Step 4 — create-product.tsx route](#p6-s4)
- [🛒 Phase 7 — Cart Page](#phase-7)
  - [Step 1 — Add the empty component](#p7-s1)
  - [Step 2 — Cart page layout](#p7-s2)
  - [Step 3 — addToCart](#p7-s3)
  - [Step 4 — fetchCartItems](#p7-s4)
  - [Step 5 — removeFromCart](#p7-s5)
  - [Step 6 — updateCartQuantity](#p7-s6)
  - [Step 7 — clearCart](#p7-s7)
  - [Step 8 — Cart badge in the Header](#p7-s8)
- [🔐 Phase 8 — Authentication with Better Auth](#phase-8)
  - **Installation**
    - [Step 1 — Auth UI pages (shadcn/ui)](#p8-s1)
    - [Step 2 — Install better-auth](#p8-s2)
    - [Step 3 — Environment variables](#p8-s3)
    - [Step 4 — Create the auth instance](#p8-s4)
    - [Step 5 — Generate & merge auth schema](#p8-s5)
    - [Step 6 — Mount the API handler](#p8-s6)
    - [Step 7 — Create the client instance](#p8-s7)
  - **Register**
    - [Step 8 — Register User](#p8-s8)
  - **Login**
    - [Step 9 — Login User](#p8-s9)
  - **Sign Out**
    - [Step 10 — Sign Out](#p8-s10)
  - **Cache & Session Sync**
    - [Step 1 — Session in root context & `router.invalidate()`](#p9-s5)
  - **Protecting Resources**
    - [Step 1 — Auth server functions](#p9-s1)
    - [Step 2 — Protect routes with `beforeLoad`](#p9-s2)
    - [Step 3 — Hide nav links by role](#p9-s3)
    - [Step 4 — Protect the server function](#p9-s6)
    - [Step 5 — Adaptive Header & user dropdown](#p9-s4)
- [🔔 Phase 9 — Toast Notifications with Sonner](#phase-9)
  - [Step 1 — Install Sonner](#p10-s1)
  - [Step 2 — Mount the Toaster](#p10-s2)
  - [Step 3 — Trigger toasts from components](#p10-s3)
- [🖼️ Phase 10 — Image Upload with Supabase Storage](#phase-10)
  - [Step 1 — Create the Bucket](#p10-storage-s1)
  - [Step 2 — Configure RLS Policies](#p10-storage-s2)
  - [Step 3 — Environment variables](#p10-storage-s3)
  - [Step 4 — Install dependencies](#p10-storage-s4)
  - [Step 5 — Create the Supabase client](#p10-storage-s5)
  - [Step 6 — Server Function for image upload](#p10-storage-s6)
  - [Step 7 — Modify create-product.tsx](#p10-storage-s7)
- [🛡️ Phase 11 — Admin Product Management](#phase-11)
  - [Step 1 — Install dependencies](#p11-s1)
  - [Step 2 — Create the route](#p11-s2)
  - [Step 3 — Add link in the Header](#p11-s3)
  - [Step 4 — Create `updateProduct` and `deleteProduct`](#p11-s4)
  - [Step 5 — Connect server functions in `manage-products.tsx`](#p11-s5)
- [💳 Phase 12 — Stripe Checkout & Order History](#phase-12)
  - [Step 1 — Install Stripe & add environment variable](#p12-s1)
  - [Step 2 — Add orders and order_items tables to the schema](#p12-s2)
  - [Step 3 — Generate & push the new schema to Supabase](#p12-s3)
  - [Step 4 — Create /checkout/success route (layout)](#p12-s4)
  - [Step 5 — Create /checkout/cancel route (layout)](#p12-s5)
  - [Step 6 — Create src/data/checkout.ts](#p12-s6)
  - [Step 7 — Wire the Checkout button in cart.tsx](#p12-s7)
  - [Step 8 — Connect /checkout/success to confirmOrder](#p12-s8)
  - [Step 9 — Add "My Orders" link in the Header](#p12-s9)
  - [Step 10 — Create /orders route (layout with mock data)](#p12-s10)
  - [Step 11 — Create src/data/orders.ts](#p12-s11)
  - [Step 12 — Connect /orders to real data](#p12-s12)
- [🛠️ Phase 13 — Admin Orders Dashboard](#phase-13)
  - [Step 1 — Header link, route & mock layout with detail Dialog](#p13-s1)
  - [Step 2 — Create getAllOrders server function](#p13-s2)
  - [Step 3 — Connect the route to real data](#p13-s3)
  - [Step 4 — updateOrderStatus server function + connect in UI](#p13-s4)
- [📧 Phase 14 — Order Confirmation Email with Resend](#phase-14)
  - [Step 1 — Create an API key in Resend](#p14-s1)
  - [Step 2 — Install Resend](#p14-s2)
  - [Step 3 — Create src/lib/email.ts](#p14-s3)
  - [Step 4 — Wire into confirmOrder](#p14-s4)
- [👤 Phase 15 — User Profile & Avatar Upload](#phase-15)
  - [Step 1 — Profile page layout with edit Dialog](#p15-s1)
  - [Step 2 — Server functions & wiring the edit Dialog](#p15-s2)
- [🔍 Phase 16 — Search, Filter & Sort](#phase-16)
  - [Step 1 — Create src/components/DataToolbar.tsx](#p16-s1)
  - [Step 2 — Create src/hooks/useProductFilters.ts](#p16-s2)
  - [Step 3 — Create src/hooks/useOrderFilters.ts](#p16-s3)
  - [Step 4 — Wire into /products](#p16-s4)
  - [Step 5 — Wire into manage-products](#p16-s5)
  - [Step 6 — Wire into manage-orders](#p16-s6)
  - [How to implement DataToolbar on any page](#p16-implementation)
- [🚂 Phase 17 — Deploy to Railway](#phase-17)
  - [Step 1 — Install the Railway preset package](#p17-s1)
  - [Step 2 — Create tanstack.config.ts](#p17-s2)
  - [Step 3 — Configure nixpacks.toml](#p17-s3)
  - [Step 4 — Push to GitHub and create the Railway project](#p17-s4)
  - [Step 5 — Add environment variables on Railway](#p17-s5)
  - [Step 6 — Set the production domain](#p17-s6)
  - [Step 7 — Update BETTER_AUTH_URL and add VITE_BETTER_AUTH_URL](#p17-s7)
  - [Step 8 — Update src/lib/auth-client.ts](#p17-s8)
  - [Step 9 — Redeploy](#p17-s9)

---

<a id="overview"></a>

## What is this?

**StackShop** is a base project designed to serve as the foundation for any future e-commerce.

---

<a id="core-technologies"></a>

## 🛠️ Core Technologies

| Layer | Technology |
| --- | --- |
| **Framework** | [TanStack Start](https://tanstack.com/start) — SSR-first React meta-framework powered by Nitro |
| **Routing** | [TanStack Router](https://tanstack.com/router) — File-based, fully type-safe routing |
| **Server State** | [TanStack Query](https://tanstack.com/query) — Client-side caching, background refetch |
| **Forms** | [TanStack Form](https://tanstack.com/form) — Headless, field-level reactive forms |
| **Tables** | [TanStack Table](https://tanstack.com/table) — Headless table for admin dashboards |
| **Database** | [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) — Type-safe query builder + migrations |
| **Authentication** | [Better Auth](https://www.better-auth.com/) — Email/password auth with Drizzle adapter, role-based access |
| **Payments** | [Stripe](https://stripe.com/) — Checkout Sessions, line items, payment verification |
| **Storage** | [Supabase Storage](https://supabase.com/storage) — Product images + profile avatars via `@supabase/supabase-js` |
| **Email** | [Resend](https://resend.com/) — Transactional HTML order confirmation emails |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) — Toast notifications for mutations and errors |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Validation** | [Zod](https://zod.dev/) — Runtime schema validation |
| **Image Processing** | [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) — Client-side compression before upload |
| **Icons** | [Lucide React](https://lucide.dev/) + [HugeIcons](https://hugeicons.com/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5.7 |
| **Toolchain** | [Vite](https://vitejs.dev/) 8 + [Biome](https://biomejs.dev/) (lint & format) |

---

<a id="application-features"></a>

## 💫 Application Features

**Products**
- **Product catalog** — browsable grid with badges, ratings, reviews, and inventory status
- **Product detail page** — SSR with dynamic `<head>` metadata per product (title, description, canonical)
- **Streaming UI** — recommended products load via React 19 `use()` + `<Suspense>` with skeleton fallback
- **Create product form** — field-level Zod validation via TanStack Form, image upload to Supabase Storage
- **Admin product management** — inline edit and delete via Dialog; protected to `admin` role only
- **Search, filter & sort** — `DataToolbar` component with live search, inventory filter, and sort across the catalog and admin panel

**Cart & Checkout**
- **Shopping cart** — add, remove, update quantity, clear cart; upsert pattern for duplicates; all persisted in PostgreSQL
- **Cart badge in header** — live item count and total via `useQuery`, invalidated on every mutation
- **Stripe Checkout** — creates a Checkout Session with line items, redirects to Stripe-hosted payment page
- **Order confirmation** — verifies payment with Stripe on return, marks order as `paid`, clears the cart
- **Product snapshots** — `order_items` stores name, price, and image at purchase time — decoupled from catalog changes

**Orders**
- **Order history** — user-facing page listing all past orders with items, quantities, and status
- **Admin orders dashboard** — table of all orders joined with buyer info; update status (`pending` → `paid` → `failed`)
- **Order confirmation email** — HTML email sent via Resend on successful payment; themeable via `StoreConfig`

**Auth & Users**
- **Email/password authentication** — register, login, logout via Better Auth + Drizzle adapter
- **Session management** — session injected into root context via `beforeLoad`; `router.invalidate()` on auth changes
- **Role-based access** — `admin` and `user` roles; routes and server functions both enforce role checks independently
- **User profile** — view name, email, role, and avatar; edit via Dialog with client-side image compression + Supabase Storage upload
- **Adaptive Header** — shows user dropdown with role badge and logout when authenticated; hides admin links for regular users

**DX & Architecture**
- **Server Functions** — `createServerFn` for all data mutations and queries; type-safe HTTP endpoints callable from loaders and components
- **Middleware** — server-side request logging via `createMiddleware` on the `/products` route
- **Query caching** — `useQuery` with `initialData` from the loader; no duplicate network requests on mount
- **Selective SSR** — each route controls its own rendering strategy (`ssr: true`, `"data-only"`, `ssr: false`) independently
- **Toast notifications** — Sonner toasts on every mutation (add to cart, profile update, auth events, errors)

---

<a id="demo-users"></a>

## 👥 Demo Users

![Demo users](./assets/demo-users.svg)

---

<a id="project-structure"></a>

## 📁 Project Structure

```
src/
├── components/
│   ├── DataToolbar.tsx             ← search, filter & sort toolbar (Phase 16)
│   ├── Header.tsx                  ← global nav + cart badge + user dropdown
│   ├── ProductCard.tsx             ← card used in grids + add-to-cart button
│   ├── RecommndedProducts.tsx      ← unwraps streamed Promise via use()
│   ├── login-form.tsx              ← Better Auth sign-in form
│   ├── signup-form.tsx             ← Better Auth sign-up form
│   └── ui/                         ← shadcn/ui primitives (button, card, input…)
├── data/
│   ├── cart.ts                     ← addToCart · fetchCartItems · removeFromCart · updateCartQuantity · clearCart · getCartItemsCount
│   ├── checkout.ts                 ← createCheckoutSession · confirmOrder
│   ├── orders.ts                   ← getUserOrders · getAllOrders · updateOrderStatus
│   ├── products.ts                 ← getAllProducts · getProductById · createProduct · updateProduct · deleteProduct
│   └── user.ts                     ← updateUserProfile
├── db/
│   ├── index.ts                    ← Drizzle client + pg Pool
│   ├── schema.ts                   ← all tables, enums, inferred types
│   └── seed.ts                     ← sample data (8 products)
├── hooks/
│   ├── useOrderFilters.ts          ← search + status filter state for orders
│   └── useProductFilters.ts        ← search + sort state for products
├── lib/
│   ├── auth-client.ts              ← Browser auth client (signIn · signUp · useSession)
│   ├── auth.functions.ts           ← getSession · ensureSession · sessionQueryKey
│   ├── auth.ts                     ← Better Auth server instance (drizzle adapter + tanstackStartCookies)
│   ├── email.ts                    ← Resend email sender (order confirmation)
│   ├── supabase.ts                 ← Supabase Storage client (image uploads)
│   └── utils.ts                    ← cn() utility helper
├── routes/
│   ├── __root.tsx                  ← QueryClientProvider + Header + global shell
│   ├── api/
│   │   └── auth/
│   │       └── $.ts                ← Better Auth catch-all API handler
│   ├── cart.tsx                    ← /cart page
│   ├── checkout/
│   │   ├── cancel.tsx              ← /checkout/cancel
│   │   └── success.tsx             ← /checkout/success (confirms order)
│   ├── index.tsx                   ← / home (featured products, SSR loader)
│   ├── orders/
│   │   ├── index.tsx               ← /orders (user order history)
│   │   └── manage-orders.tsx       ← /orders/manage-orders (admin dashboard)
│   ├── products/
│   │   ├── $id.tsx                 ← /products/:id detail + streaming recommended
│   │   ├── create-product.tsx      ← /products/create-product form
│   │   ├── index.tsx               ← /products catalog (middleware + useQuery)
│   │   └── manage-products.tsx     ← /products/manage-products (admin CRUD)
│   ├── profile.tsx                 ← /profile (user profile + avatar upload)
│   ├── sign-in.tsx                 ← /sign-in
│   └── sign-up.tsx                 ← /sign-up
├── routeTree.gen.ts                ← auto-generated by TanStack Router
├── router.tsx                      ← router + QueryClient context injection
└── styles.css
```

---

<a id="database-schema"></a>

## 🗄️ Database Schema

### `products`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, auto-generated |
| `name` | `varchar(256)` | Product name |
| `description` | `text` | Full description |
| `price` | `numeric(10,2)` | Stored as numeric, arrives as `string` |
| `badge` | `enum` | `New` · `Sale` · `Featured` · `Limited` · `null` |
| `rating` | `numeric(3,2)` | Default `0` |
| `reviews` | `integer` | Default `0` |
| `image` | `varchar(512)` | URL to product image |
| `inventory` | `enum` | `in-stock` · `backorder` · `preorder` |
| `created_at` | `timestamp` | Auto-set on insert |

### `cart_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, auto-generated |
| `product_id` | `uuid` | FK → `products.id` (cascade delete) |
| `quantity` | `integer` | Default `1` |
| `created_at` | `timestamp` | Auto-set on insert |
| `updated_at` | `timestamp` | Updated on quantity change |

### `user` _(Better Auth)_

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key |
| `name` | `text` | Display name |
| `email` | `text` | Unique |
| `email_verified` | `boolean` | Default `false` |
| `image` | `text` | Avatar URL, nullable |
| `role` | `enum` | `admin` · `user` — default `user` |
| `created_at` | `timestamp` | Auto-set on insert |
| `updated_at` | `timestamp` | Auto-updated on change |

### `session` _(Better Auth)_

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key |
| `expires_at` | `timestamp` | Session expiry |
| `token` | `text` | Unique session token |
| `ip_address` | `text` | Nullable |
| `user_agent` | `text` | Nullable |
| `user_id` | `text` | FK → `user.id` (cascade delete) |
| `created_at` | `timestamp` | Auto-set on insert |
| `updated_at` | `timestamp` | Auto-updated on change |

### `account` _(Better Auth)_

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key |
| `account_id` | `text` | Provider account ID |
| `provider_id` | `text` | e.g. `credential` |
| `user_id` | `text` | FK → `user.id` (cascade delete) |
| `password` | `text` | Hashed, nullable |
| `access_token` | `text` | Nullable |
| `refresh_token` | `text` | Nullable |
| `created_at` | `timestamp` | Auto-set on insert |
| `updated_at` | `timestamp` | Auto-updated on change |

### `verification` _(Better Auth)_

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `text` | Primary key |
| `identifier` | `text` | Email or user identifier |
| `value` | `text` | Verification token |
| `expires_at` | `timestamp` | Token expiry |
| `created_at` | `timestamp` | Auto-set on insert |
| `updated_at` | `timestamp` | Auto-updated on change |

### `orders`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `text` | FK → `user.id` (cascade delete) |
| `stripe_session_id` | `text` | Stripe Checkout session ID, nullable |
| `status` | `enum` | `pending` · `paid` · `failed` — default `pending` |
| `total` | `numeric(10,2)` | Order total |
| `created_at` | `timestamp` | Auto-set on insert |

### `order_items`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, auto-generated |
| `order_id` | `uuid` | FK → `orders.id` (cascade delete) |
| `product_id` | `uuid` | FK → `products.id` (set null on delete) |
| `name` | `varchar(256)` | Product name snapshot at purchase time |
| `price` | `numeric(10,2)` | Price snapshot at purchase time |
| `quantity` | `integer` | Units purchased |
| `image` | `varchar(512)` | Image URL snapshot at purchase time |

> Types are derived via Drizzle's `$inferSelect` / `$inferInsert` — no manual interfaces needed.

---

<a id="environment-variables"></a>

## 🔐 Environment Variables

Create a `.env` file at the project root with the following variables:

```env
DATABASE_URL="postgresql://postgres.fceond?????????:?????????@aws-1-us-?????????-?????????.pooler.supabase.com:?????????/postgres"
BETTER_AUTH_SECRET=MYtcOnjaZUd....
BETTER_AUTH_URL=http://localhost:3000 # Base URL of your app
VITE_BETTER_AUTH_URL=http://localhost:3000 # Client-side base URL (must be VITE_ prefixed)

SUPABASE_URL=https://fceond?????????.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STRIPE_SECRET_KEY=

RESEND_API_KEY=re_your_full_key_here
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase session pooler) |
| `BETTER_AUTH_SECRET` | ✅ | Signs and verifies session tokens — keep this secret |
| `BETTER_AUTH_URL` | ✅ | Base URL used by Better Auth for redirects and callbacks |
| `VITE_BETTER_AUTH_URL` | ✅ | Client-side base URL — Vite only exposes `VITE_` prefixed vars to the browser bundle |
| `SUPABASE_URL` | ✅ | Supabase project URL — used by the storage client |
| `SUPABASE_ANON_KEY` | ✅ | Public anon key for Supabase Storage operations |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — used server-side for image uploads, bypasses RLS |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key for Checkout session creation |
| `RESEND_API_KEY` | ✅ | Resend API key for sending order confirmation emails |

---

---

<a id="build-log"></a>

## Build Log — Step by Step

This is a living document. Each step gets checked off as it's done.

<a id="phase-1"></a>

### Phase 1 — Project Foundation

- [x] <a id="p1-s1"></a>**Step 1 — Scaffold the project** with the TanStack CLI

  ```bash
  npx @tanstack/cli@latest create
  ```

  Selected options:
  - Framework → **React**
  - Toolchain → **Biome**
  - Deployment adapter → **Railway**
  - Add-ons → **Compiler**

- [x] <a id="p1-s2"></a>**Step 2 — Cleanup, Header & product routes** 🧹

  Stripped the boilerplate, built the first component, and added the product routes.

  ```
  src/
  ├── components/
  │   └── Header.tsx       ← basic header component
  └── routes/
      ├── products.tsx     ← static route /products
      └── products.$id.tsx ← dynamic route /products/$id
  ```

  What was done:
  - Removed unused boilerplate code and placeholder files
  - Created a basic `Header` component
  - Added static route `/products`
  - Added dynamic route `/products/$id`

- [x] <a id="p1-s3"></a>**Step 3 — Add shadcn/ui on top of Tailwind** 🎨

  TanStack Start ships with Tailwind by default — we keep it and layer shadcn/ui on top for a proper component library foundation.

  Go to https://ui.shadcn.com/create?preset=bcj03CWG&template=start&base=base and configure to your requirements:
  - Template → **TanStack Start**
  - Base UI → **Base**
  - Enable **pointer** on buttons

  Then run the generated init command:

  ```bash
  npx shadcn@latest init --preset bcj03CWG --base base --template start --pointer
  ```

  Add the `card` component:

  ```bash
  npx shadcn@latest add card
  ```

  Finally, remove the auto-generated import from `src/styles.css` — it's no longer needed:

  ```css
  /* remove this line */
  @import "shadcn/tailwind.css";
  ```

- [x] <a id="p1-s4"></a>**Step 4 — Base Header design** 🏠

  Styled the `Header` component and added the global layout wrapper in `__root.tsx`.

  In `src/routes/__root.tsx`, the `RootDocument` shell wraps the entire app with a background and constrains the content:

  What was done:
  - Outer `div` sets full-height background and base text colors (light + dark mode)
  - `<main>` centers content with `mx-auto`, caps width at `max-w-6xl`, and adds horizontal (`px-4`) and vertical (`py-6`) padding

---

<a id="phase-2"></a>

### Phase 2 — Data Layer & Product Display

- [x] <a id="p2-s1"></a>**Step 1 — Fake product data & server loader** 🗄️

  Wired up the home page with real data flow using TanStack Router's `loader` — the closest thing to a server function in this stack.

  Created a local seed file to act as the fake data source (same shape as a real product API like `fakestoreapi.com`):

  ```
  src/
  └── db/
      └── seed.ts    ← sampleProducts array — fake catalog data
  ```

  The `loader` in `src/routes/index.tsx` runs on the server, grabs the first 3 products, and passes them to the component via `Route.useLoaderData()`:

  ```ts
  export const Route = createFileRoute("/")({
    loader: async () => {
      return { products: sampleProducts.slice(0, 3) };
    },
    component: App,
  });
  ```

  Each product has this shape:

  | Field         | Type      | Description                                         |
  | ------------- | --------- | --------------------------------------------------- |
  | `name`        | `string`  | Product name                                        |
  | `description` | `string`  | Short description                                   |
  | `price`       | `string`  | Price as a string (e.g. `"99.99"`)                  |
  | `badge`       | `string?` | Optional label shown as a pill (e.g. `"New"`)       |
  | `rating`      | `string`  | Star rating (e.g. `"4.8"`)                          |
  | `reviews`     | `number`  | Total review count                                  |
  | `image`       | `string`  | Path to the product image                           |
  | `inventory`   | `string`  | Status: `"in-stock"` · `"backorder"` · `"preorder"` |

  What was done:
  - Created `src/db/seed.ts` with 8 sample products
  - Added a `loader` to the index route — runs server-side before render
  - Consumed loader data in the component via `Route.useLoaderData()`
  - Sliced the first 3 products for the featured section on the home page

- [x] <a id="p2-s2"></a>**Step 2 — ProductCard component** 🃏

  Built the base `ProductCard` component used to display individual products in the grid.

  ```
  src/
  └── components/
      └── ui/
          └── ProductCard.tsx    ← base product card component
  ```

  The card is wrapped in a `<Link>` to navigate to `/products/$id` and composes shadcn/ui primitives (`Card`, `CardHeader`, `CardContent`, `CardFooter`).

  Key design decisions:
  - Optional `badge` pill rendered conditionally (e.g. "New")
  - Rating + review count in the content area
  - Inventory status badge with color-coded styles:
    - `in-stock` → emerald
    - `backorder` → amber
    - `preorder` → indigo
  - "Add to Cart" button uses `e.preventDefault()` + `e.stopPropagation()` to prevent navigation while inside the `<Link>` wrapper

- [x] <a id="p2-s3"></a>**Step 3 — Products catalog page** 🗂️

  Built the full `/products` catalog page that fetches and displays all products using a **server function** — a step up from the plain `loader` used on the home page.

  ```
  src/
  └── routes/
      └── products/
          └── index.tsx    ← /products catalog route
  ```

  Key differences from the home page `loader`:

  | Feature        | Home (`/`)      | Catalog (`/products`)   |
  | -------------- | --------------- | ----------------------- |
  | Data source    | inline `loader` | `createServerFn`        |
  | Products shown | 3 (sliced)      | All 8                   |
  | Layout         | featured grid   | header card + full grid |

  The `createServerFn` pattern isolates the data-fetching logic and makes it independently callable — it's not tied to the route lifecycle like a `loader`:

  ```ts
  const fetchProducts = createServerFn({ method: "GET" }).handler(async () => {
    return sampleProducts;
  });

  export const Route = createFileRoute("/products/")({
    loader: async () => fetchProducts(),
    component: RouteComponent,
  });
  ```

- [x] <a id="p2-s4"></a>**Step 4 — Route Middleware** 🔍

  > **⚠️ This step is a demonstration only.** The middleware pattern shown here is useful for understanding how `createMiddleware` works in TanStack Start, but **you can skip implementing it** in your own project. For route protection and authorization, we will use `beforeLoad` + protected server functions — covered in Phase 8. Middleware is included here purely as a learning reference.

  Added server-side middleware to the `/products` route using `createMiddleware` from `@tanstack/react-start`.

  **What is middleware here?**

  In TanStack Start, middleware runs on the server **before** the route handler executes. It intercepts the request, can inspect or modify it, and must call `next()` to pass control forward — same mental model as Express or Hono middleware.

```ts
  // src/routes/products/index.tsx

  const loggerMiddleware = createMiddleware().server(
    async ({ next, request }) => {
      console.log(
        "-----loggerMiddleware----",
        request.url, // full URL of the incoming request
        "from",
        request.headers.get("origin"), // where the request came from
      );
      return next(); // REQUIRED — without this the route never loads
    },
  );
```

  **How it's wired to the route:**

  The `server` config key on `createFileRoute` accepts a `middleware` array. Every entry runs in order before any loader or handler on that route:

```ts
  export const Route = createFileRoute("/products/")({
    loader: async () => fetchProducts(),
    component: RouteComponent,
    server: {
      middleware: [loggerMiddleware], // ← runs first, on every request to /products
      handlers: {
        POST: async ({ request }) => {
          // ← custom HTTP verb handlers
          const body = await request.json().catch(() => ({}));
          return Response.json({ message: "Hello from POST", body });
        },
      },
    },
  });
```

  | Key          | What it does                                                               |
  | ------------ | -------------------------------------------------------------------------- |
  | `middleware` | Array of middleware that intercept every request to this route             |
  | `handlers`   | Custom HTTP method handlers (`POST`, `PUT`, etc.) beyond the default `GET` |
  | `next()`     | Passes control to the next middleware or to the route itself — mandatory   |

  **Middleware vs `beforeLoad` — which one to use?**

  This project uses `beforeLoad` (not middleware) for route protection. Here's why they're different tools:

  |                               | `middleware`                              | `beforeLoad`                                  |
  | ----------------------------- | ----------------------------------------- | --------------------------------------------- |
  | **Where it runs**             | Server only                               | Server + client                               |
  | **When it executes**          | Before loader and HTTP handlers           | Before loader, on every navigation            |
  | **Access to route context**   | ❌ No — only raw `request`               | ✅ Yes — `context.session`, params, etc.      |
  | **Can redirect?**             | ❌ Not directly                           | ✅ Yes — `throw redirect(...)`                |
  | **Can extend route context?** | ❌ No                                     | ✅ Yes — returned object is merged in         |
  | **Intercepts POST/PUT/etc.**  | ✅ Yes — all HTTP methods                 | ❌ No — GET navigations only                  |
  | **Best use case**             | Logging, rate limiting, raw HTTP concerns | Auth guards, role checks, redirects           |
  | **Passes control via**        | `return next()` — mandatory               | Returns value or throws `redirect`            |
  | **Reusable across routes?**   | ✅ Yes — import and add to array          | ⚠️ Requires extracting a shared function     |

  In this project, route protection looks like this with `beforeLoad`:

```ts
  // src/routes/products/create-product.tsx
  export const Route = createFileRoute("/products/create-product")({
    beforeLoad: async ({ context }) => {
      const session = context.session; // resolved once in __root.tsx beforeLoad
      if (!session) throw redirect({ to: "/sign-in" });
      if (session.user.role !== "admin") throw redirect({ to: "/" });
      return { user: session.user }; // merged into route context
    },
    component: RouteComponent,
  });
```

  And for complete security, the server function itself also validates the session independently — covered in Phase 8.

- [x] <a id="p2-s5"></a>**Step 5 — TanStack Query integration** ⚡

  Added `@tanstack/react-query` to enable client-side caching and background refetching on top of the existing server-fetched data.

  ```bash
  npm i @tanstack/react-query @tanstack/react-query-devtools
  ```

  **Why Query on top of loaders?**

  The `loader` already fetches on the server — but once the page is live, it does nothing. TanStack Query takes over on the client: it caches the data, can refetch in the background, and invalidates stale entries automatically. The `loader` becomes the "first paint" supplier; Query owns the lifecycle after that.

  ***

  **Change 1 — `createRootRouteWithContext`** in `src/routes/__root.tsx`

  Replaced `createRootRoute` with the typed context variant so every child route can access the `queryClient` with full type safety:

  ```ts
  // before
  export const Route = createRootRoute({ ... });

  // after
  export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({ ... });
  ```

  ***

  **Change 2 — `QueryClientProvider` wraps the app shell** in `src/routes/__root.tsx`

  Created a singleton `queryClient` and wrapped `RootDocument` so every component in the tree can call `useQuery`:

  ```ts
  const queryClient = new QueryClient();

  function RootDocument({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        ...
      </QueryClientProvider>
    );
  }
  ```

  ***

  **Change 3 — inject `queryClient` into the router context** in `src/router.tsx`

  Passed the client through the router's `context` option — this is what makes `context.queryClient` available inside any `loader`:

  ```ts
  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient: new QueryClient(),
    },
    ...
  });
  ```

  ***

  **Change 4 — `useQuery` with `initialData` in `/products`**

  The `loader` still runs on the server and returns the products. `useQuery` receives them via `initialData` — no duplicate network request on mount. After that, Query owns the cache:

  ```ts
  function RouteComponent() {
    const products = Route.useLoaderData(); // server data

    const { data } = useQuery({
      queryKey: ["products"],
      queryFn: () => fetchProducts(),
      initialData: products, // seed from loader, no extra fetch
    });
  }
  ```

  | Layer      | Runs on | Responsibility                              |
  | ---------- | ------- | ------------------------------------------- |
  | `loader`   | Server  | First fetch — data ready before first paint |
  | `useQuery` | Client  | Cache, background refetch, stale management |

  ***

  **Change 5 — React Query Devtools** in `src/routes/__root.tsx`

  Added the devtools panel so you can inspect the query cache, stale times, and refetch behavior directly in the browser:

  ```ts
  import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

  function RootDocument({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        ...
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }
  ```

  `initialIsOpen={false}` keeps it collapsed by default — click the React Query logo in the corner to open it.

  ***

  **Selective Server-Side Rendering (SSR)**

  TanStack Start lets you control how much of the rendering happens on the server, per route:

  | Mode          | HTML on server | Data on server | Use when                                      |
  | ------------- | -------------- | -------------- | --------------------------------------------- |
  | `ssr: true`   | ✅ Full HTML   | ✅ Yes         | SEO-critical pages, fast first paint needed   |
  | `"data-only"` | ❌ Empty shell | ✅ Yes         | Data ready but HTML rendered on client        |
  | `ssr: false`  | ❌ Nothing     | ❌ No          | Fully client-side, behind auth, no SEO needed |

  "Selective" means you don't pick one mode for the whole app — each route decides independently. A public `/products` page can run full SSR while a `/dashboard` behind a login runs `ssr: false`.

---

<a id="phase-3"></a>

### Phase 3 — Database Setup with Drizzle + Supabase

- [x] <a id="p3-s1"></a>**Step 1 — Install dependencies** 📦

  ```bash
  npm i drizzle-orm postgres pg
  npm i -D drizzle-kit
  npm i --save-dev @types/pg
  npm i drizzle-orm dotenv
  npm i -D drizzle-kit tsx
  ```

  | Package       | Role                                             |
  | ------------- | ------------------------------------------------ |
  | `drizzle-orm` | The ORM — type-safe query builder                |
  | `postgres`    | Native PostgreSQL driver (used by Drizzle)       |
  | `pg`          | Node.js PostgreSQL driver (for the Pool client)  |
  | `dotenv`      | Load `.env` vars before running scripts          |
  | `drizzle-kit` | CLI for migrations, codegen, and Drizzle Studio  |
  | `tsx`         | Run TypeScript files directly (used for seeding) |
  | `@types/pg`   | Type definitions for the `pg` driver             |
  | `cross-env`   | Set env variables cross-platform (Win/Mac/Linux) |

- [x] <a id="p3-s2"></a>**Step 2 — Create a Supabase project** ☁️
  1. Go to [supabase.com](https://supabase.com) and create a new project
  2. Once created, navigate to **Project Settings → Database**
  3. Under **Connection string**, select **Session pooler** mode and copy the URI:

  ```
  postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-1-us-west-2.pooler.supabase.com:5432/postgres
  ```

  Session pooler works over port `5432` — no firewall issues and compatible with Drizzle's `pg` driver.

- [x] <a id="p3-s3"></a>**Step 3 — Configure `.env`** 🔐

  Create a `.env` file at the project root and paste the connection string, replacing `[YOUR-PASSWORD]`:

  ```env
  DATABASE_URL="postgresql://postgres.fceondpyuqyitudbtnuw:<yourpassword>@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
  ```

- [x] <a id="p3-s4"></a>**Step 4 — Database client** `src/db/index.ts`

  The client creates a connection pool and exports a typed `db` instance wired to the schema:

  ```ts
  import { drizzle } from "drizzle-orm/node-postgres";
  import { Pool } from "pg";
  import * as schema from "./schema";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("supabase")
      ? { rejectUnauthorized: false }
      : false,
  });

  export const db = drizzle(pool, { schema });
  ```

  The `ssl` block is conditional — it enables SSL only when connecting to Supabase, so local development without SSL still works.

- [x] <a id="p3-s5"></a>**Step 5 — Define the schema** `src/db/schema.ts`

  Two tables: `products` (the catalog) and `cart_items` (shopping cart). Both use UUID primary keys and Drizzle enums for constrained string fields.

  ```ts
  import {
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
  } from "drizzle-orm/pg-core";

  export const badgeEnum = pgEnum("badge", [
    "New",
    "Sale",
    "Featured",
    "Limited",
  ]);
  export const inventoryEnum = pgEnum("inventory", [
    "in-stock",
    "backorder",
    "preorder",
  ]);

  export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    badge: badgeEnum("badge"),
    rating: numeric("rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0"),
    reviews: integer("reviews").notNull().default(0),
    image: varchar("image", { length: 512 }).notNull(),
    inventory: inventoryEnum("inventory").notNull().default("in-stock"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });

  export const cartItems = pgTable("cart_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  });

  // Inferred types — use these everywhere instead of manual interfaces
  export type ProductSelect = typeof products.$inferSelect;
  export type ProductInsert = typeof products.$inferInsert;
  export type CartItemSelect = typeof cartItems.$inferSelect &
    typeof products.$inferSelect;
  export type CartItemInsert = typeof cartItems.$inferInsert;
  ```

  `$inferSelect` and `$inferInsert` let Drizzle derive the TypeScript types directly from the schema — no duplication.

- [x] <a id="p3-s6"></a>**Step 6 — Drizzle config** `drizzle.config.ts`

  ```ts
  import "dotenv/config";
  import { defineConfig } from "drizzle-kit";

  export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
  });
  ```

  | Field     | Purpose                                           |
  | --------- | ------------------------------------------------- |
  | `out`     | Where Drizzle writes migration SQL files          |
  | `schema`  | Source of truth — your schema definition          |
  | `dialect` | Database engine (`postgresql`, `mysql`, `sqlite`) |

- [x] <a id="p3-s7"></a>**Step 7 — Add scripts to `package.json`** ⚙️

  ```json
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate":  "drizzle-kit migrate",
    "db:push":     "drizzle-kit push",
    "db:studio":   "drizzle-kit studio",
    "db:seed":     "cross-env NODE_ENV=production NITRO_PRESET=node-server tsx src/db/seedDb.ts"
  }
  ```

  | Script        | What it does                                              |
  | ------------- | --------------------------------------------------------- |
  | `db:generate` | Reads the schema and generates SQL migration files        |
  | `db:migrate`  | Applies pending migration files to the database           |
  | `db:push`     | Pushes the schema directly — no migration files generated |
  | `db:studio`   | Opens Drizzle Studio (visual DB browser)                  |
  | `db:seed`     | Populates the database with sample products               |

  > In production use `generate` + `migrate` for a proper migration history. `push` is fast for prototyping — it diffs and applies directly.

- [x] <a id="p3-s8"></a>**Step 8 — Generate and push the schema** 🚀

  Generate the SQL migration files from your schema:

  ```bash
  npm run db:generate
  ```

  This writes files to `./drizzle/`. Then push the schema to Supabase:

  ```bash
  npm run db:push
  ```

  Once done, open your Supabase project → **Table Editor** — the `products` and `cart_items` tables are there.

- [x] <a id="p3-s9"></a>**Step 9 — Seed the database** 🌱

  `src/db/seedDb.ts` inserts 8 sample products. It checks for existing rows before inserting — pass `--reset` to wipe and reseed.

  **Why not just run `tsx src/db/seedDb.ts` directly?**

  TanStack Start uses **Nitro** as its internal server engine. When you import the DB client (`src/db/index.ts`) inside a standalone script, Nitro detects the environment and tries to boot its full server runtime — which fails outside of the framework's normal startup process.

  The fix is to set two environment variables before the script runs:

  | Variable       | Value         | Effect                                                      |
  | -------------- | ------------- | ----------------------------------------------------------- |
  | `NODE_ENV`     | `production`  | Disables dev-mode behavior (HMR, Vite watchers, etc.)       |
  | `NITRO_PRESET` | `node-server` | Tells Nitro to use the plain Node.js adapter — no full boot |

  These are set at the very top of `seedDb.ts` as well, as a safety net:

  ```ts
  // Prevent Nitro/vite from initializing when running as a standalone script
  process.env.NITRO_PRESET = "node-server";
  process.env.NODE_ENV = process.env.NODE_ENV || "production";
  ```

  **`cross-env`** is also needed because the `VAR=value command` syntax for setting env vars only works on Mac/Linux. On Windows it fails silently. `cross-env` makes it work everywhere with the same syntax.

  Run the seed:

  ```bash
  npm run db:seed
  ```

  Output:

  ```
  🌱 Starting database seed...
  📦 Inserting sample products...
  ✅ Products inserted successfully!
  ```

  Run with reset flag to clear and repopulate:

  ```bash
  npm run db:seed -- --reset
  ```

---

<a id="phase-4"></a>

### Phase 4 — Real Data Layer

- [x] <a id="p4-s1"></a>**Step 1 — Install Zod** 📦

  ```bash
  npm install zod
  ```

  Zod is a TypeScript-first schema validation library. It validates data at **runtime** — something TypeScript alone can't do (types disappear after compile). We use it here to validate the `id` received by `getProductById` before it reaches the database.

- [x] <a id="p4-s2"></a>**Step 2 — Create `src/data/products.ts`** 🗄️

  Instead of writing `createServerFn` directly inside each route file, all server functions live in a dedicated data layer:

  ```
  src/
  └── data/
      └── products.ts    ← all server functions for the products domain
  ```

  This file exports three functions:

  ```ts
  import { createServerFn } from "@tanstack/react-start";
  import { eq } from "drizzle-orm";
  import { z } from "zod";
  import { db } from "@/db";
  import { products } from "@/db/schema";

  // Fetches every product — used in /products
  export const getAllProducts = createServerFn({ method: "GET" }).handler(
    async () => {
      const allProducts = await db.select().from(products);
      return allProducts;
    },
  );

  // Fetches the first 3 — used on the home page
  export const getRecommendedProducts = createServerFn({
    method: "GET",
  }).handler(async () => {
    const recommendedProducts = await db.select().from(products).limit(3);
    return recommendedProducts;
  });

  // Fetches a single product by id — used in /products/$id
  const idSchema = z.string();

  export const getProductById = createServerFn({ method: "GET" })
    .inputValidator((id: string) => id)
    .handler(async ({ data }) => {
      const id = idSchema.parse(data); // runtime validation with Zod
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);
      return product[0] ?? null;
    });
  ```

  **Why server functions live in `data/` and not inside the route files**

  `createServerFn` creates an HTTP endpoint that runs exclusively on the server. The function can be called from anywhere — a loader, a form action, another server function. If you write it inline in a route file, it's trapped there. Moving it to `data/products.ts` means:
  - `getRecommendedProducts` can be called from the home loader
  - `getAllProducts` can be called from the products loader AND from a `useQuery` on the client
  - `getProductById` can be called from the detail page loader

  Routes handle routing and rendering. The data layer handles data access. That separation is what makes the code reusable and easy to test.

  | Function                 | Called from                     | Returns                  |
  | ------------------------ | ------------------------------- | ------------------------ |
  | `getAllProducts`         | `/products` loader + `useQuery` | All products             |
  | `getRecommendedProducts` | `/` loader                      | First 3 products         |
  | `getProductById`         | `/products/$id` loader          | Single product or `null` |

- [x] <a id="p4-s3"></a>**Step 3 — Wire routes to the data layer** 🔌

  Each route now just imports and calls the right function. No data logic in the route:

  **`src/routes/index.tsx`** — home page:

  ```ts
  import { getRecommendedProducts } from "@/data/products";

  export const Route = createFileRoute("/")({
    loader: async () => getRecommendedProducts(),
    component: App,
  });
  ```

  **`src/routes/products/index.tsx`** — catalog:

  ```ts
  import { getAllProducts } from "#/data/products";

  export const Route = createFileRoute("/products/")({
    loader: async () => getAllProducts(),
    component: RouteComponent,
  });

  function RouteComponent() {
    const products = Route.useLoaderData();
    const { data } = useQuery({
      queryKey: ["products"],
      queryFn: () => getAllProducts(), // client-side cache
      initialData: products,
    });
  }
  ```

  **`src/routes/products/$id.tsx`** — product detail:

  ```ts
  import { getProductById } from "#/data/products";

  export const Route = createFileRoute("/products/$id")({
    loader: async ({ params }) => getProductById({ data: params.id }),
    component: RouteComponent,
  });
  ```

  The `params.id` from the URL is passed as `data` — which is the input that `.inputValidator()` receives, and Zod validates before the handler runs.

- [x] <a id="p4-s4"></a>**Step 4 — Product detail page** 🖼️

  Built the `/products/$id` route — the full product detail view consuming real data from the database.

  ```
  src/
  └── routes/
      └── products/
          └── $id.tsx    ← dynamic detail route
  ```

  The loader fetches the product by URL param and passes it to the component:

  ```ts
  export const Route = createFileRoute("/products/$id")({
    loader: async ({ params }) => getProductById({ data: params.id }),
    component: RouteComponent,
  });
  ```

  The component reads the loader result with `useLoaderData()` — no hooks, no client fetch, just typed data:

  ```ts
  function RouteComponent() {
    const product = Route.useLoaderData();
    // product is fully typed as ProductSelect | null (inferred from schema)
  }
  ```

  **How data flows from the DB to the template**

  The type comes from Drizzle's `$inferSelect` defined in `src/db/schema.ts`. You never write a manual interface — the schema IS the type:

  ```ts
  // src/db/schema.ts
  export type ProductSelect = typeof products.$inferSelect;
  // { id: string, name: string, price: string, badge: "New" | "Sale" | ... | null, ... }
  ```

  From there, mapping to the template is direct property access:

  | DB column           | Template usage                           | Notes                                       |
  | ------------------- | ---------------------------------------- | ------------------------------------------- |
  | `product.name`      | `<h1>{product?.name}</h1>`               | Optional chaining until null-check          |
  | `product.price`     | `<span>${product?.price}</span>`         | Stored as `numeric` → arrives as `string`   |
  | `product.badge`     | `{product?.badge && <span>{...}</span>}` | `null` collapses the badge pill             |
  | `product.inventory` | Ternary to resolve shipping text         | Enum: `in-stock` · `backorder` · `preorder` |
  | `product.image`     | `<img src={product?.image} />`           | URL string stored in DB                     |

  The `?.` optional chaining is needed because `getProductById` returns `Product | null` — if no row matches the `id`, `null` propagates safely instead of crashing.

- [x] <a id="p4-s5"></a>**Step 5 — Dynamic metadata on the product detail page** 🏷️

  Added the `head()` function to the `/products/$id` route so each product page gets its own SEO metadata — title, description, image, and canonical URL — all derived from the loader data.

  ```ts
  export const Route = createFileRoute("/products/$id")({
    loader: async ({ params }) => getProductById({ data: params.id }),
    head: ({ loaderData: product }) => {
      if (!product) return {};
      return {
        meta: [
          { title: product.name },
          { name: "description", content: product.description },
          { name: "image",       content: product.image },
          { name: "canonical",   content: `https://stackshop-prod.appwrite.network/products/${product.id}` },
        ],
      };
    },
  });
  ```

  `head()` runs on the server alongside the loader — `loaderData` is already resolved by the time it executes, so no extra fetch is needed. The canonical URL switches between production and `localhost` based on `NODE_ENV`.

---

<a id="phase-5"></a>

### Phase 5 — Streaming UI & Loading States

![phase5](./assets/phase5_streaming_ui_flow.svg)

- [x] <a id="p5-s1"></a>**Step 1 — Suspense + `use` for streamed recommended products** ⚡

  Added skeleton loading states to the product detail page using React 19's `use` hook, `<Suspense>`, and the shadcn/ui `Skeleton` component.

  Add the skeleton component:

  ```bash
  npx shadcn@latest add skeleton
  ```

  This generates `src/components/ui/skeleton.tsx` — a simple animated pulse div that composes via `className`:

  ```ts
  function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
      <div
        data-slot="skeleton"
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    );
  }
  ```

  ***

  **The key pattern — return a Promise, don't await it**

  In the `/products/$id` loader, the product detail is `await`ed (it must be ready before the page renders), but the recommended products are returned as an **unresolved Promise**:

  ```ts
  loader: async ({ params }) => {
    // awaited — page can't render without this
    const product = await getProductById({ data: params.id });
    if (!product) throw notFound();

    // NOT awaited — returned as a live Promise
    const recommendedProducts = getRecommendedProducts();

    return { product, recommendedProducts };
  },
  ```

  The component receives `recommendedProducts` as a `Promise<ProductSelect[]>`. The product detail section renders immediately with real data. The recommendations section renders a skeleton until the promise resolves.

  ***

  **`use()` unwraps the Promise inside the component**

  React 19's `use` hook reads a Promise and suspends the component until it resolves. It can only be called inside a component wrapped in `<Suspense>`:

  ```ts
  // src/components/RecommndedProducts.tsx

  import { use } from "react";

  export function RecommendedProducts({
    recommendedProducts,
  }: {
    recommendedProducts: Promise<ProductSelect[]>;
  }) {
    const recommendedProductsData = use(recommendedProducts);
    // ...render the grid
  }
  ```

  `use` is NOT a regular hook — it can be called conditionally and inside loops. Its job is specifically to unwrap thenables (Promises) and context values.

  ***

  **`<Suspense>` with a skeleton fallback**

  The `fallback` renders while the Promise is pending. Once `use()` resolves, React swaps in the real component:

  ```tsx
  <Suspense
    fallback={
      <div>
        <h2 className="my-4 text-2xl font-bold">Recommended Products</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="aspect-4/3 w-full rounded-xl" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    }
  >
    <RecommendedProducts recommendedProducts={recommendedProducts} />
  </Suspense>
  ```

  | Piece | Role |
  | --- | --- |
  | `getRecommendedProducts()` (no `await`) | Returns a live Promise to the component |
  | `use(promise)` | Suspends the component until the Promise resolves |
  | `<Suspense fallback={...}>` | Renders the skeleton while suspended |
  | `<Skeleton>` | Animated pulse placeholder matching the real card shape |

  The result: the product detail is visible immediately, and the recommended section fades in once the data arrives — no spinner, no layout shift.

---

<a id="phase-6"></a>

### Phase 6 — Create Product Form

- [x] <a id="p6-s1"></a>**Step 1 — Install TanStack Form** 📦

  ```bash
  npm i @tanstack/react-form
  ```

  TanStack Form is a headless, framework-agnostic form library. "Headless" means it manages **state and validation** but ships zero UI — you bring your own components. The key difference from something like React Hook Form: field state lives at the field level, not the form level. Each `<form.Field>` is its own subscriber and only re-renders itself when its value changes — the rest of the form stays untouched.

- [x] <a id="p6-s2"></a>**Step 2 — Install shadcn/ui form components** 🎨

  ```bash
  npx shadcn@latest add label input textarea select
  ```

  | Component  | What it is                                             |
  | ---------- | ------------------------------------------------------ |
  | `Label`    | Accessible `<label>` with proper `htmlFor` wiring      |
  | `Input`    | Styled `<input>` — text, number, url, etc.             |
  | `Textarea` | Styled multi-line `<textarea>`                         |
  | `Select`   | Accessible dropdown built on Radix UI's Select primitive |

- [x] <a id="p6-s3"></a>**Step 3 — Add `productSchema` and `createProduct` to `src/data/products.ts`** 🗄️

  The schema and the server function that writes to the DB both live in the data layer — next to the read functions already there.

  **`productSchema` — the validation contract**

  ```ts
  export const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z
      .string()
      .refine((val) => !isNaN(Number(val)), "Price must be a number"),
    badge: z.enum(["New", "Sale", "Featured", "Limited"]).nullable().optional(),
    image: z
      .string()
      .url("Image must be a valid URL")
      .max(512, "Image must be 512 chars or less"),
    inventory: z.enum(["in-stock", "backorder", "preorder"]),
  });
  ```

  Each rule in `productSchema` does two things at once:
  - It **validates** the value at runtime (server-side before hitting the DB, and client-side on each keystroke via TanStack Form's validators)
  - It **describes the error message** shown to the user when validation fails

  Notice `price` is a `string` — the `<input type="number">` always gives you a string. The `.refine()` checks it converts to a real number without coercing the type.

  `badge` is `.nullable().optional()` because it's genuinely optional: a product can have no badge at all.

  **`createProduct` — the server function that writes to the DB**

  ```ts
  export const createProduct = createServerFn({ method: "POST" })
    .inputValidator((data: z.infer<typeof productSchema>) =>
      productSchema.parse(data),
    )
    .handler(async ({ data }): Promise<ProductSelect> => {
      const { db } = await import("@/db");
      const result = await db
        .insert(products)
        .values({ ...data, badge: data.badge ?? null })
        .returning();
      const product = result[0];
      if (!product) {
        throw new Error("Failed to create product: no product returned from database");
      }
      return product;
    });
  ```

  How it works step by step:

  1. `createServerFn({ method: "POST" })` — registers this as an HTTP `POST` endpoint. TanStack Start handles the networking — you call the function like a normal async function, it runs on the server.
  2. `.inputValidator(...)` — before `handler` runs, the input is passed through `productSchema.parse()`. If the data is invalid, it throws and the handler never executes. This is the server-side safety net — validation here protects the DB even if someone bypasses the client form.
  3. `.handler(async ({ data }) => {...})` — `data` is the already-validated, typed payload. Drizzle inserts it and returns the created row via `.returning()`. `badge ?? null` normalizes `undefined` to `null` so Drizzle's nullable column is happy.

  | Chain piece        | What it does                                                          |
  | ------------------ | --------------------------------------------------------------------- |
  | `createServerFn`   | Creates an HTTP endpoint — runs exclusively on the server             |
  | `.inputValidator`  | Validates and parses the raw input before the handler sees it         |
  | `.handler`         | Receives clean, typed `data` — does the actual DB work                |
  | `.returning()`     | Drizzle returns the inserted row — required to get the generated `id` |

- [x] <a id="p6-s4"></a>**Step 4 — Create `src/routes/products/create-product.tsx`** 📝

  The create product route lives at `/products/create-product`. TanStack Router derives this from the file path automatically.

  ```
  src/
  └── routes/
      └── products/
          └── create-product.tsx    ← /products/create-product
  ```

  **How `useForm` is initialized**

  ```ts
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      badge: undefined as BadgeValue | undefined,
      image: "",
      inventory: "in-stock" as InventoryValue,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null);
        await createProduct({ data: value });
        await router.invalidate({ sync: true }); // bust the /products query cache
        navigate({ to: "/products" });
      } catch {
        setSubmitError("Something went wrong. Please try again.");
      }
    },
  });
  ```

  `useForm` accepts a config object with three key properties used here:

  | Property        | What it does                                                                |
  | --------------- | --------------------------------------------------------------------------- |
  | `defaultValues` | The initial state of every field — must match the shape of the form data    |
  | `onSubmit`      | Runs when the form is submitted and all validators pass — receives `value`  |
  | `validators`    | Form-level validators (field-level validators are set per `<form.Field>`)   |

  After `createProduct` succeeds, `router.invalidate({ sync: true })` tells TanStack Router to re-run all active loaders — the `/products` page data is refreshed before navigating to it, so the new product appears immediately.

  ***

  **The `fieldValidator` helper**

  Each field reuses this small adapter to connect Zod schemas to TanStack Form's validator API:

  ```ts
  function fieldValidator(schema: z.ZodTypeAny) {
    return ({ value }: { value: unknown }) => {
      const result = schema.safeParse(value);
      return result.success ? undefined : result.error.issues[0]?.message;
    };
  }
  ```

  TanStack Form's `onChange` validator expects a function that returns `undefined` (valid) or a `string` (the error message). Zod's `.safeParse()` returns `{ success: true }` or `{ success: false, error }`. This helper bridges the two: it runs Zod's parse and converts the result to what TanStack Form expects. Each field passes in its own slice of `productSchema`:

  ```ts
  validators={{ onChange: fieldValidator(productSchema.shape.name) }}
  ```

  `productSchema.shape.name` is just the `z.string().min(1, ...)` rule for that specific field — you're not running the whole object schema, only the relevant piece.

  ***

  **`<form.Field>` — how each field is wired**

  ```tsx
  <form.Field
    name="name"
    validators={{ onChange: fieldValidator(productSchema.shape.name) }}
  >
    {(field) => (
      <FormField field={field} label="Product Name *">
        <Input
          id={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </FormField>
    )}
  </form.Field>
  ```

  `<form.Field>` uses the **render prop pattern** — it passes a `field` object to its child function. That object contains everything about the field's current state:

  | `field` property          | What it holds                                         |
  | ------------------------- | ----------------------------------------------------- |
  | `field.name`              | The field key (`"name"`, `"price"`, etc.)             |
  | `field.state.value`       | Current value of the field                            |
  | `field.state.meta.errors` | Array of validation error messages                    |
  | `field.state.meta.isTouched` | Whether the user has interacted with the field     |
  | `field.state.meta.isValid` | Whether the field currently passes all validators    |
  | `field.handleChange(val)` | Update the field value and trigger `onChange` validators |

  The `name` prop on `<form.Field>` is **type-safe** — TypeScript infers it from `defaultValues`. If you type `name="namex"` it's a compile error.

  ***

  **`FormField` and `FieldMessage` — reusable layout helpers**

  Two small components handle the repetitive wrapper around each input:

  ```ts
  function FieldMessage({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="text-sm text-destructive">{error}</p>;
  }

  function FormField({ field, label, children }) {
    const error = field.state.meta.isTouched
      ? field.state.meta.errors[0]
      : undefined;

    return (
      <div className="space-y-2">
        <Label htmlFor={field.name}>{label}</Label>
        {children}
        <FieldMessage error={error} />
      </div>
    );
  }
  ```

  The error only shows after `isTouched` is true — this prevents blasting the user with red errors before they've typed anything. Once they leave a field (blur) or type in it, `isTouched` flips to `true` and errors become visible.

  ***

  **`<form.Subscribe>` — reading form-level state**

  The submit button reads two values from the form without subscribing to every field:

  ```tsx
  <form.Subscribe
    selector={(state) => [state.canSubmit, state.isSubmitting]}
  >
    {([canSubmit, isSubmitting]) => (
      <Button type="submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Product"}
      </Button>
    )}
  </form.Subscribe>
  ```

  `selector` works like a selector in Redux — it extracts only the values you need. The button re-renders only when `canSubmit` or `isSubmitting` changes. `canSubmit` is `false` when any field has a validation error or when the form is already submitting.

  ***

  **Full data flow — from input to database**

  ```
  User types in <Input>
      ↓
  field.handleChange(value)         ← updates field state
      ↓
  onChange validator runs (Zod)     ← validates on each keystroke
      ↓
  error shown if isTouched + invalid
      ↓
  User clicks "Create Product"
      ↓
  form.handleSubmit()               ← validates all fields
      ↓
  onSubmit({ value }) fires         ← only if all validators pass
      ↓
  createProduct({ data: value })    ← server function (POST to DB)
      ↓
  router.invalidate()               ← busts the /products loader cache
      ↓
  navigate({ to: "/products" })     ← user sees the updated catalog
  ```

---

---

<a id="phase-7"></a>

### Phase 7 — Cart Page

![phase8](./assets/phase8_auth_protection_layers.svg)

- [x] <a id="p7-s1"></a>**Step 1 — Add the `empty` shadcn/ui component** 📦

  ```bash
  npx shadcn@latest add empty
  ```

  Used in the cart page to render the empty-state UI when there are no items in the cart.

- [x] <a id="p7-s2"></a>**Step 2 — Cart page layout with mock data** 🛒

  Created `src/routes/cart.tsx` with the full layout: item list, quantity controls, order summary, and empty state — all wired to commented-out mock data so the shape is explicit:

  ```ts
  // Mock — same shape as the DB response, useful when copying to another project
  // const cart: CartItem[] = [
  //   { id: "1", name: "TanStack Router Pro", price: "99.99", quantity: 2, image: "...", inventory: "in-stock" },
  // ];
  ```

- [x] <a id="p7-s3"></a>**Step 3 — `addToCart`** ➕

  Created `src/data/cart.ts`. La función implementa un **upsert**: si el producto ya está en el cart incrementa `quantity`, si no inserta una fila nueva.

  ```ts
  // src/data/cart.ts
  export const addToCart = createServerFn({ method: "POST" })
    .inputValidator((data: { productId: string }) => data)
    .handler(async ({ data }) => {
      const { db } = await import("@/db");
      const [existing] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.productId, data.productId))
        .limit(1);

      if (existing) {
        await db
          .update(cartItems)
          .set({ quantity: existing.quantity + 1, updatedAt: new Date() })
          .where(eq(cartItems.id, existing.id));
      } else {
        await db.insert(cartItems).values({ productId: data.productId });
      }
    });
  ```

  El botón en `ProductCard` llama a la función. `e.preventDefault()` + `e.stopPropagation()` evitan que el `<Link>` padre navegue. Después del insert, `queryClient.invalidateQueries` marca el cache del badge como stale para que se refetchee inmediatamente.

  ```ts
  // src/components/ProductCard.tsx
  onClick={async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart({ data: { productId: product.id } });
    await queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
    router.invalidate();
    setAdding(false);
  }}
  ```

- [x] <a id="p7-s4"></a>**Step 4 — `fetchCartItems`** 📋

  `cart_items` solo guarda `productId` y `quantity` — los detalles del producto viven en `products`. Un `innerJoin` trae ambas tablas en una sola query. El resultado viene con la forma `{ cart_items: {...}, products: {...} }`, así que se aplana en un objeto plano antes de retornarlo al cliente.

  ```ts
  // src/data/cart.ts
  export const fetchCartItems = createServerFn({ method: "GET" }).handler(
    async () => {
      const { db } = await import("@/db");
      const rows = await db
        .select()
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id));

      return rows.map((row) => {
        const cartItem = row.cart_items;
        const product = row.products;
        return {
          id: cartItem.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: cartItem.quantity,
          image: product.image,
          inventory: product.inventory,
        };
      });
    },
  );
  ```

  La route la ejecuta en el `loader` antes de renderizar, y el componente lee el resultado con `useLoaderData`. El subtotal usa `Number(item.price)` porque Drizzle retorna `numeric` como `string`.

  ```ts
  // src/routes/cart.tsx
  export const Route = createFileRoute("/cart")({
    loader: async () => fetchCartItems(),
    component: CartPage,
  });

  function CartPage() {
    const cart = Route.useLoaderData();

    const subtotal = cart.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity,
      0,
    );
  }
  ```

- [x] <a id="p7-s5"></a>**Step 5 — `removeFromCart`** 🗑️

  ```ts
  // src/data/cart.ts
  export const removeFromCart = createServerFn({ method: "POST" })
    .inputValidator((data: { cartItemId: string }) => data)
    .handler(async ({ data }) => {
      const { db } = await import("@/db");
      await db.delete(cartItems).where(eq(cartItems.id, data.cartItemId));
    });
  ```

  El botón Remove usa un estado `removingId` para que solo los botones de esa fila se deshabiliten mientras el request está en curso — el resto de la lista sigue interactiva.

  ```ts
  // src/routes/cart.tsx
  onClick={async () => {
    setRemovingId(item.id);
    await removeFromCart({ data: { cartItemId: item.id } });
    await queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
    router.invalidate();
    setRemovingId(null);
  }}
  ```

- [x] <a id="p7-s6"></a>**Step 6 — `updateCartQuantity`** ➕➖

  Recibe un `delta` de `1` o `-1` en lugar de un número directo. Fetchea la fila actual, calcula la nueva cantidad y decide si actualizar o borrar (cuando llega a `0`).

  ```ts
  // src/data/cart.ts
  export const updateCartQuantity = createServerFn({ method: "POST" })
    .inputValidator((data: { cartItemId: string; delta: 1 | -1 }) => data)
    .handler(async ({ data }) => {
      const { db } = await import("@/db");
      const [item] = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, data.cartItemId))
        .limit(1);

      if (!item) return;

      const newQuantity = item.quantity + data.delta;

      if (newQuantity <= 0) {
        await db.delete(cartItems).where(eq(cartItems.id, data.cartItemId));
      } else {
        await db
          .update(cartItems)
          .set({ quantity: newQuantity, updatedAt: new Date() })
          .where(eq(cartItems.id, data.cartItemId));
      }
    });
  ```

  En `cart.tsx`, `handleUpdateQuantity` envuelve la llamada y trackea qué fila está actualizando con `updatingId`. El flag `isBusy` deshabilita los tres botones de esa fila mientras cualquier operación está en vuelo, previniendo doble-click y race conditions.

  ```ts
  // src/routes/cart.tsx
  async function handleUpdateQuantity(cartItemId: string, delta: 1 | -1) {
    setUpdatingId(cartItemId);
    await updateCartQuantity({ data: { cartItemId, delta } });
    await queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
    router.invalidate();
    setUpdatingId(null);
  }

  // por fila:
  const isBusy = updatingId === item.id || removingId === item.id;
  ```

- [x] <a id="p7-s7"></a>**Step 7 — `clearCart`** 🧹

  Sin cláusula `WHERE` — borra todas las filas de `cart_items`.

  ```ts
  // src/data/cart.ts
  export const clearCart = createServerFn({ method: "POST" }).handler(
    async () => {
      const { db } = await import("@/db");
      await db.delete(cartItems);
    },
  );
  ```

  El botón "Clear cart" pone `clearing` en `true` para deshabilitarse durante el request. Una vez que `router.invalidate()` refetchea el loader, `cart` queda como array vacío y el empty-state se renderiza automáticamente.

  ```ts
  // src/routes/cart.tsx
  onClick={async () => {
    setClearing(true);
    await clearCart();
    await queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
    router.invalidate();
    setClearing(false);
  }}
  ```

- [x] <a id="p7-s8"></a>**Step 8 — Cart badge in the Header** 🏷️

  The Header needed to show the total item count and cost without loading the full cart data. Four pieces work together to make this happen.

  ***

  **`getCartItemsCount` — a lightweight server function**

  Instead of reusing `fetchCartItems` (which fetches every field of every item), a dedicated function does a single join and returns only two numbers:

  ```ts
  export const getCartItemsCount = createServerFn({ method: "GET" }).handler(
    async () => {
      const rows = await db
        .select()
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id));

      const count = rows.reduce((acc, row) => acc + row.cart_items.quantity, 0);
      const total = rows.reduce(
        (acc, row) => acc + Number(row.products.price) * row.cart_items.quantity,
        0,
      );

      return { count, total };
    },
  );
  ```

  `count` is the sum of all quantities (not the number of rows) — if you have 3 units of the same product, it counts as 3, not 1.

  ***

  **`useQuery` in the Header**

  The Header is not a route — it has no loader. `useQuery` is the right tool here: it fetches and caches the data on the client, and refetches automatically on window focus.

  ```ts
  const { data: cartSummary } = useQuery({
    queryKey: cartCountQueryKey,   // ["cart-count"]
    queryFn: () => getCartItemsCount(),
    staleTime: 0,                  // always considered stale → refetch on window focus
    refetchInterval: 60_000,       // background refetch every 60 seconds
  });

  const itemCount = cartSummary?.count ?? 0;
  const total = cartSummary?.total ?? 0;
  ```

  `staleTime: 0` means the cached value is immediately considered stale after it's fetched. This makes React Query refetch automatically the next time the user focuses the window — a useful safety net if the cache ever gets out of sync.

  `refetchInterval: 60_000` adds a second layer: even if the user never leaves the tab, the badge silently re-syncs with the server every minute. This covers edge cases like another browser tab or device mutating the cart without triggering an explicit `invalidateQueries` in the current tab.

  ***

  **`cartCountQueryKey` — one source of truth for the cache key**

  The query key `["cart-count"]` is used in three different files: `Header.tsx`, `ProductCard.tsx`, and `cart.tsx`. If it were written as a plain string in each file, a typo would silently break the invalidation. Instead, it's exported once from `Header.tsx`:

  ```ts
  // Header.tsx
  export const cartCountQueryKey = ["cart-count"] as const;

  // ProductCard.tsx and cart.tsx
  import { cartCountQueryKey } from "@/components/Header";
  ```

  `as const` makes the type `readonly ["cart-count"]` instead of `string[]` — so TypeScript catches mismatches at compile time.

  ***

  **Invalidation on every cart mutation**

  `staleTime: 0` + window focus is a passive safety net. For the badge to update *immediately* when the user adds or removes items, every mutation explicitly invalidates the query:

  ```ts
  // ProductCard — after addToCart
  await queryClient.invalidateQueries({ queryKey: cartCountQueryKey });

  // cart.tsx — after updateCartQuantity, removeFromCart, and clearCart
  await queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
  ```

  `invalidateQueries` marks the cache entry as stale and triggers a refetch right away. The Header re-renders with the new count and total the moment the mutation completes — no navigation or window focus needed.

  | Trigger | What updates |
  |---|---|
  | Add to cart (ProductCard) | `invalidateQueries` → badge updates immediately |
  | Remove / update / clear (cart page) | `invalidateQueries` → badge updates immediately |
  | User switches tabs and comes back | `staleTime: 0` + `refetchOnWindowFocus` → badge syncs as fallback |

---

---

<a id="phase-8"></a>

### Phase 8 — Authentication with Better Auth

![phase8](./assets/phase8_auth_protection_layers.svg)

- [x] <a id="p8-s1"></a>**Step 1 — Auth UI pages (shadcn/ui)** 🎨

  Add the pre-built auth form components from shadcn:

  ```bash
  npx shadcn@latest add login-01
  npx shadcn@latest add signup-01
  ```

  Create two routes that render them:

  ```
  src/routes/
  └── auth/
      ├── sign-in.tsx    ← /auth/sign-in  (uses login-01 component)
      └── sign-up.tsx    ← /auth/sign-up  (uses signup-01 component)
  ```

- [x] <a id="p8-s2"></a>**Step 2 — Install better-auth** 📦

  ```bash
  npm install better-auth
  ```

- [x] <a id="p8-s3"></a>**Step 3 — Environment variables** 🔐

  Add to `.env` alongside the existing `DATABASE_URL`:

  ```env
  BETTER_AUTH_SECRET=MYtcOnjaZUdCXep01HdHEKcUVHrmZmQB
  BETTER_AUTH_URL=http://localhost:3000
  ```

  | Variable | Purpose |
  |---|---|
  | `BETTER_AUTH_SECRET` | Signs and verifies session tokens |
  | `BETTER_AUTH_URL` | Base URL used by Better Auth for redirects and callbacks |

- [x] <a id="p8-s4"></a>**Step 4 — Create the auth instance** `src/lib/auth.ts` 🔧

  Create `src/lib/auth.ts` and configure Better Auth with the Drizzle adapter:

  ```ts
  import { betterAuth } from "better-auth";
  import { drizzleAdapter } from "better-auth/adapters/drizzle";
  import { tanstackStartCookies } from "better-auth/tanstack-start";
  import { db } from "@/db";

  export const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "user",
        },
      },
    },
    plugins: [tanstackStartCookies()], // must be last in the array
  });
  ```

  Since we're using Drizzle, the `DATABASE_URL` configured in [Phase 3 — Database Setup with Drizzle + Supabase](#phase-3) is reused automatically — no second connection needed.

  **`tanstackStartCookies`** is required because TanStack Start handles cookies differently from a standard Node server. This plugin patches the response so that `Set-Cookie` headers from `signIn` / `signUp` are applied correctly. It must always be the **last plugin** in the array.

- [x] <a id="p8-s5"></a>**Step 5 — Generate and merge the auth schema** 🗄️

  Better Auth needs 4 tables in the database. Generate them with:

  ```bash
  npx auth@latest generate
  ```

  This creates `auth-schema.ts` with the `user`, `session`, `account`, and `verification` tables. **Copy the tables and imports into `src/db/schema.ts`, then delete `auth-schema.ts`.**

  Before pushing, add a `role` enum and wire it into the `user` table. Insert this **before the `user` table definition**:

  ```ts
  const roleValues = ["admin", "user"] as const;

  export const roleEnum = pgEnum("role", roleValues);

  export type RoleValue = (typeof roleValues)[number];
  ```

  Then add the `role` column inside the `user` table:

  ```ts
  export const user = pgTable("user", {
    // ...generated columns...
    role: roleEnum("role").notNull().default("user"),
  });
  ```

  Push the new tables to Supabase:

  ```bash
  npm run db:push
  ```

  After this, the four auth tables appear in Supabase alongside `products` and `cart_items`.

  | Table | Purpose |
  |---|---|
  | `user` | Registered user profiles |
  | `session` | Active login sessions |
  | `account` | Credential / OAuth provider links per user |
  | `verification` | Email verification tokens |

- [x] <a id="p8-s6"></a>**Step 6 — Mount the API handler** `src/routes/api/auth/$.ts` 🔌

  Create `src/routes/api/auth/$.ts`. The `$` is a TanStack Router **catch-all segment** — it captures every request to `/api/auth/*` and passes it to Better Auth:

  ```ts
  import { createFileRoute } from "@tanstack/react-router";
  import { auth } from "@/lib/auth";

  export const Route = createFileRoute("/api/auth/$")({
    server: {
      handlers: {
        GET: async ({ request }: { request: Request }) => {
          return await auth.handler(request);
        },
        POST: async ({ request }: { request: Request }) => {
          return await auth.handler(request);
        },
      },
    },
  });
  ```

  `auth.handler(request)` is Better Auth's internal router — it inspects the URL and dispatches to the right endpoint (`/sign-in`, `/sign-out`, `/session`, etc.).

- [x] <a id="p8-s7"></a>**Step 7 — Create the client instance** `src/lib/auth-client.ts` 🖥️

  Create `src/lib/auth-client.ts`. This runs in the browser and provides React hooks + methods to call the auth server:

  ```ts
  import { createAuthClient } from "better-auth/react";

  export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
  });

  export const { signIn, signUp, useSession, signOut } = authClient;
  ```

  | Export | What it does |
  |---|---|
  | `signIn` | Signs in a user — `signIn.email({ email, password, callbackURL })` |
  | `signUp` | Registers a user — `signUp.email({ name, email, password })` |
  | `useSession` | React hook — returns `{ data: session, isPending, error }` |
  | `signOut` | Signs out the current user — accepts `fetchOptions` with callbacks |

  That's it for setup. The next phase will wire these into the sign-in and sign-up forms.

- [x] <a id="p8-s8"></a>**Step 8 — Register User** `src/components/signup-form.tsx` 👤

  The signup form reuses the same patterns from Phase 6 (TanStack Form + Zod) and calls `signUp.email` from the auth client.

  **`signupSchema` — cross-field validation with `.refine()`**

  ```ts
  const signupSchema = z
    .object({
      name: z.string().min(2, "Name must be at least 2 characters."),
      email: z.string().email("Enter a valid email."),
      password: z.string().min(8, "Password must be at least 8 characters."),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    });
  ```

  `z.object()` validates each field in isolation. `.refine()` runs after and receives the whole object — that's how it can compare `password` and `confirmPassword`. The `path` tells Zod which field owns the error so it attaches to the right `<FieldMessage>`.

  **`fieldValidator` and `FieldMessage`** — same helpers from Phase 6, reused without changes:

  ```ts
  // bridges Zod's safeParse result to TanStack Form's onChange API
  function fieldValidator(schema: z.ZodTypeAny) {
    return ({ value }: { value: unknown }) => {
      const result = schema.safeParse(value);
      return result.success ? undefined : result.error.issues[0]?.message;
    };
  }

  // only renders when isTouched is true — no red errors on first load
  function FieldMessage({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="text-sm text-destructive">{error}</p>;
  }
  ```

  **`confirmPassword` — reactive cross-field validation**

  ```ts
  validators={{
    onChangeListenTo: ["password"],  // re-validates whenever password changes
    onChange: ({ value, fieldApi }) => {
      const password = fieldApi.form.getFieldValue("password");
      return value !== password ? "Passwords do not match." : undefined;
    },
  }}
  ```

  Without `onChangeListenTo`, `confirmPassword` would only re-validate when the user types in its own field — fixing a typo in `password` wouldn't clear the mismatch error.

  **`onSubmit` flow**

  ```ts
  onSubmit: async ({ value }) => {
    const result = signupSchema.safeParse(value);

    if (!result.success) {
      setSubmitError(result.error.issues[0]?.message ?? "Invalid form.");
      return;
    }

    try {
      setSubmitError(null);

      const response = await signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      });

      if (response.error) {
        setSubmitError(response.error.message ?? "Could not create account.");
        return;
      }
      await router.invalidate(); // Re-run __root beforeLoad to refresh the global session
      toast.success("Account created successfully.");
      navigate({ to: "/" });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  },
  ```

  The `onSubmit` runs only after TanStack Form's field-level validators pass. Then it does a second full `signupSchema.safeParse(value)` — this catches the cross-field `.refine()` (password match) which can't run at the field level. The `try/catch` wraps everything: `setSubmitError(null)` clears any previous error, `signUp.email` is called, and if `response.error` is set (Better Auth never throws — it always returns `{ error }`), the error message is surfaced. The `catch` block handles unexpected network failures as a fallback.

  > **Note:** `signUp.email` creates the account **and** establishes a session in a single call — no need to call `signIn` afterwards. `router.invalidate()` re-runs `__root.tsx` `beforeLoad`, which re-fetches the session server-side and propagates it through context so the Header updates immediately.

- [x] <a id="p8-s9"></a>**Step 9 — Login User** `src/components/login-form.tsx` 🔑

  The login form follows the same TanStack Form + Zod pattern as the signup form, but is simpler — no cross-field validation needed.

  **`loginSchema`**

  ```ts
  const loginSchema = z.object({
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
  });
  ```

  **`onSubmit` flow**

  ```ts
  onSubmit: async ({ value }) => {
    const result = loginSchema.safeParse(value);

    if (!result.success) {
      setSubmitError(result.error.issues[0]?.message ?? "Invalid form.");
      return;
    }

    try {
      setSubmitError(null);

      const response = await signIn.email({
        email: value.email,
        password: value.password,
      });

      if (response.error) {
        setSubmitError(response.error.message ?? "Could not login.");
        return;
      }
      await router.invalidate(); // Re-run __root beforeLoad to refresh the global session
      toast.success("Logged in successfully.");
      navigate({ to: "/" });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
  },
  ```

  Same structure as signup: `loginSchema.safeParse(value)` runs first as a safety net (TanStack Form's field validators already ran, but this ensures a clean typed result before the network call). `setSubmitError(null)` clears any previous error, then `signIn.email` is called — Better Auth returns `{ error }` on failure, never throws. If `response.error` is set, the message is surfaced. The `catch` handles unexpected failures. On success, `router.invalidate()` re-runs `__root` `beforeLoad`, which re-fetches the session server-side and propagates it through context so the Header switches to the authenticated state immediately.

  | Step | What happens |
  |---|---|
  | `signIn.email(...)` | Better Auth validates credentials and issues a session cookie |
  | `response.error` check | Surfaces wrong password / unknown email without throwing |
  | `router.invalidate()` | Re-runs `__root` `beforeLoad` → session flows into Header and all routes |
  | `navigate({ to: "/" })` | Redirects to home after successful login |

- [x] <a id="p8-s10"></a>**Step 10 — Sign Out** `src/components/Header.tsx` 🚪

  Sign out is handled directly inside the Header via `signOut` from the auth client.

  ```ts
  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: async () => {
          await router.invalidate(); // re-runs __root beforeLoad → session becomes null in context
          navigate({ to: "/" });
          setIsUserMenuOpen(false);
          toast.success("Logged out successfully.");
        },
      },
    });
  };
  ```

  `signOut` accepts `fetchOptions.onSuccess` instead of returning a promise — the callback runs only when the server confirms the session was destroyed. `router.invalidate()` then re-runs `__root` `beforeLoad`, which re-fetches the session (now `null`) and propagates it through context so the Header switches to the unauthenticated state immediately.

#### Cache & Session Sync

- [x] <a id="p9-s5"></a>**Step 1 — Session in root context & `router.invalidate()` for sync**

  Instead of fetching the session in every route or component that needs it, it's fetched **once** in `__root.tsx` `beforeLoad` and shared globally via route context:

  ```ts
  // src/routes/__root.tsx
  beforeLoad: async () => {
    const session = await getSession();
    return { session };
  },
  ```

  Every child route and component reads the same resolved value — no extra network call per route:

  ```ts
  // Header.tsx — reads session to conditionally render nav links (UX)
  // create-product.tsx — reads session inside beforeLoad to block the route (security)
  const { session } = RootRoute.useRouteContext();
  ```

  Both signup and logout call `router.invalidate()` after their operation. This re-runs `beforeLoad` across the entire route tree, re-fetching the session server-side and propagating it through context:

  ```ts
  // After signUp.email succeeds (signup-form.tsx)
  await router.invalidate(); // beforeLoad runs → picks up new session

  // After signOut succeeds (Header.tsx)
  await router.invalidate(); // beforeLoad runs → session is now null
  ```

  | Action | Result |
  |---|---|
  | Sign up | `router.invalidate()` → `beforeLoad` re-fetches → Header switches to authenticated state |
  | Log out | `router.invalidate()` → `beforeLoad` re-fetches → Header switches to unauthenticated state |

#### Protecting Resources

Use `beforeLoad` to guard routes — runs on every navigation, including client-side `<Link>` transitions. Since `__root.tsx` already resolved the session in context, child routes read from `context.session` directly — no extra `getSession()` call per route.

- [x] <a id="p9-s1"></a>**Step 1 — Auth server functions** `src/lib/auth.functions.ts`

  ```ts
  import { createServerFn } from "@tanstack/react-start";
  import { getRequestHeaders } from "@tanstack/react-start/server";
  import { auth } from "@/lib/auth";

  export const sessionQueryKey = ["session"] as const;

  export const getSession = createServerFn({ method: "GET" }).handler(async () => {
    return auth.api.getSession({ headers: getRequestHeaders() });
  });

  export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (!session) throw new Error("Unauthorized");
    return session;
  });
  ```

  | Function | Returns | Use case |
  |---|---|---|
  | `getSession` | `session \| null` | Read session anywhere — loaders, server functions, `beforeLoad` |
  | `ensureSession` | `session` (throws if missing) | Alternative guard — throws directly instead of redirecting |
  | `sessionQueryKey` | `["session"]` | Shared cache key for TanStack Query |

- [x] <a id="p9-s2"></a>**Step 2 — Protect routes with `beforeLoad`**

  The `create-product` route is admin-only. Because `__root.tsx` already fetched the session in its own `beforeLoad` and put it in context, child routes just read `context.session` — no duplicate network call:

  ```ts
  // src/routes/products/create-product.tsx
  export const Route = createFileRoute("/products/create-product")({
    beforeLoad: async ({ context }) => {
      const session = context.session; // already resolved by __root.tsx beforeLoad
      if (!session) throw redirect({ to: "/sign-in" });
      if (session.user.role !== "admin") throw redirect({ to: "/" });
      return { user: session.user };
    },
    component: RouteComponent,
  });
  ```

  Use `throw redirect(...)` — not `return`. TanStack Router only acts on thrown values from `beforeLoad`. The returned object is merged into the route context and available via `Route.useRouteContext()`.

- [x] <a id="p9-s3"></a>**Step 3 — Hide nav links by role**

  The "Create Product" link is only shown to admins. The session comes from route context — no `useQuery` needed:

  ```ts
  const { session } = RootRoute.useRouteContext();

  // In JSX:
  {session?.user.role === "admin" && (
    <Link to="/products/create-product">Create Product</Link>
  )}
  ```

  | Layer | What it does |
  |---|---|
  | `role === "admin"` in Header | Hides the link — UX only |
  | `beforeLoad` + role check | Blocks the route — actual security boundary |

  Hiding the link is a UX improvement. The `beforeLoad` guard is the real protection — anyone can navigate directly via URL.

  But both of these only protect the UI and the route navigation. A determined user can still send a raw `POST` directly to the `createProduct` server function endpoint, bypassing both. That's why the server function itself needs its own auth check — covered in Step 4.

- [x] <a id="p9-s6"></a>**Step 4 — Protect the server function**

  Hiding the link and blocking the route are UX measures — a determined user can still send a raw `POST` directly to the server function endpoint, bypassing both. The server function itself must be the final authority.

  `createProduct` re-validates the session independently, server-side, before touching the database:

  ```ts
  // src/data/products.ts
  export const createProduct = createServerFn({ method: "POST" })
    .inputValidator((data: z.infer<typeof productSchema>) =>
      productSchema.parse(data),
    )
    .handler(async ({ data }): Promise<ProductSelect> => {
      const session = await getSession(); // fresh server-side check — no context here
      if (!session) throw new Error("Unauthorized");
      if (session.user.role !== "admin") throw new Error("Forbidden");

      const { db } = await import("@/db");
      const result = await db
        .insert(products)
        .values({ ...data, badge: data.badge ?? null })
        .returning();
      // ...
    });
  ```

  This gives three independent layers of protection for `createProduct`:

  | Layer | Where | What it does |
  |---|---|---|
  | **UI permissions** | `Header.tsx` | Hides the "Create Product" link unless `session?.user.role === "admin"` |
  | **Route permissions** | `create-product.tsx` `beforeLoad` | Reads `context.session` — redirects to `/` or `/sign-in` before the page renders |
  | **Server authorization** | `createProduct` handler | Calls `getSession()` directly — throws `Unauthorized` / `Forbidden` if the request bypasses the UI and route guards |

  The route guard stops most users. The server-side check stops everyone else.

- [x] <a id="p9-s4"></a>**Step 5 — Adaptive Header & user dropdown** 👤

  The Header now adapts its right-side actions based on whether a session exists.

  **Unauthenticated state** — two plain links:

  ```tsx
  <Link to="/sign-in">Login</Link>
  <Link to="/sign-up">Sign Up</Link>
  ```

  **Authenticated state** — a `User` icon button toggles a dropdown managed by local `useState`:

  ```tsx
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: async () => {
          await router.invalidate(); // re-runs __root beforeLoad → session becomes null in context
          navigate({ to: "/" });
          setIsUserMenuOpen(false);
          toast.success("Logged out successfully.");
        },
      },
    });
  };

  <button onClick={() => setIsUserMenuOpen((prev) => !prev)}>
    <User size={18} />
  </button>

  {isUserMenuOpen && (
    <div className="absolute right-0 mt-2 w-48 rounded-xl ...">
      {/* name + email */}
      <Link to="/profile">Profile</Link>
      {session?.user.role === "admin" && (
        <Link to="/products/create-product">Create Product</Link>
      )}
      <button onClick={handleLogout}>Log out</button>
    </div>
  )}
  ```

  Both signup and logout call `router.invalidate()` after their operation — see [Cache & Session Sync](#p9-s5).

  | Dropdown item | Visible to |
  |---|---|
  | Name + email (read-only) | All authenticated users |
  | Profile | All authenticated users |
  | Create Product | `admin` role only |
  | Log out | All authenticated users |

  The "Create Product" link inside the dropdown mirrors the `beforeLoad` guard on the route — it's a UX convenience, not a security boundary.

---

<a id="phase-9"></a>

### Phase 9 — Toast Notifications with Sonner

- [x] <a id="p10-s1"></a>**Step 1 — Install Sonner** 📦

  ```bash
  npm install sonner
  ```

  Sonner is a lightweight, opinionated toast library for React. It ships its own `<Toaster>` provider and a standalone `toast` function — no context or hooks needed at the call site.

- [x] <a id="p10-s2"></a>**Step 2 — Mount the Toaster** `src/routes/__root.tsx`

  Import `Toaster` and render it once inside the root shell so it's available everywhere in the app:

  ```tsx
  import { Toaster } from 'sonner'

  function RootDocument({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {/* ... existing shell ... */}
        <Toaster />
      </QueryClientProvider>
    );
  }
  ```

  `<Toaster>` is a singleton — mount it once at the root and forget it. It renders a portal outside the normal React tree so toasts always appear on top regardless of z-index stacking.

- [x] <a id="p10-s3"></a>**Step 3 — Trigger toasts from components** 🔔

  Import the `toast` function directly where you need it — no hook, no context:

  ```tsx
  import { toast } from "sonner";

  // Success toast after account creation
  toast.success("Account created successfully.");
  ```

  Common variants:

  | Call | When to use |
  |---|---|
  | `toast.success(msg)` | Mutation succeeded — user feedback |
  | `toast.error(msg)` | Mutation failed — surface the error |
  | `toast.loading(msg)` | Long async operation in flight |
  | `toast(msg)` | Neutral / informational message |

---

<a id="phase-10"></a>

### Phase 10 — Image Upload with Supabase Storage

![flowstorage](./assets/supabase_storage_upload_flow.svg)

- [x] <a id="p10-storage-s1"></a>**Step 1 — Create the Bucket in Supabase** 🪣

  This is done in the Supabase dashboard — no code needed.

  1. Open your project at [supabase.com](https://supabase.com)
  2. In the left menu click **Storage**
  3. Click **New Bucket**
  4. Name: `product-images`
  5. Check **Public bucket** ✅ (so any visitor can see the images)
  6. Click **Create bucket**

  ![step1](./assets/step1.png)

- [x] <a id="p10-storage-s2"></a>**Step 2 — Configure access policies (RLS Policies)** 🔒

  Supabase uses RLS policies to control who can view, upload, or delete files. But those policies only work when you use Supabase Auth.

  We use **Better Auth**, so Supabase always sees requests as anonymous — it doesn't know who the user is. That's why we'll use the `service_role` key, which bypasses all RLS policies.

  Permission verification is done by us inside each server function:

  ```ts
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  ```

  So for this step, nothing needs to be configured.

- [x] <a id="p10-storage-s3"></a>**Step 3 — Environment variables** 🔐

  Your `DATABASE_URL` is for Drizzle to talk directly to PostgreSQL. But Supabase Storage is not PostgreSQL — it's a separate REST API. To talk to it you need the project URL + the anon key. They're two different things.

  Go to **Project Settings → API Keys → Legacy anon, service_role API keys** tab and add to your `.env`:

  ```env
  DATABASE_URL="postgresql://postgres.fceondpyuqyitudbtnuw:<yourpassword>@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
  BETTER_AUTH_SECRET=MYtcOnjaZUdCXep01HdHEKcUVHrmZmQB
  BETTER_AUTH_URL=http://localhost:3000
  SUPABASE_URL=https://fceondpyuqyitudbtnuw.supabase.co
  SUPABASE_ANON_KEY=eyJhbGc1OiJIUzI1NiIsInR5cCI6IkpXVCJ9...paste_full_key_here
  SUPABASE_SERVICE_ROLE_KEY=eyJhbG...your_service_role_key
  ```

  | Variable | Purpose |
  |---|---|
  | `SUPABASE_URL` | Base URL of your Supabase project — for the Storage REST API |
  | `SUPABASE_ANON_KEY` | Public key — safe for the browser, respects RLS |
  | `SUPABASE_SERVICE_ROLE_KEY` | Secret key — bypasses RLS, **server-side only** |

- [x] <a id="p10-storage-s4"></a>**Step 4 — Install dependencies** 📦

  ```bash
  npm i @supabase/supabase-js browser-image-compression
  ```

  | Package | Purpose |
  |---|---|
  | `@supabase/supabase-js` | Client that talks to Supabase Storage (upload, delete, get URLs) |
  | `browser-image-compression` | Compresses the image in the browser before sending it to the server |

- [x] <a id="p10-storage-s5"></a>**Step 5 — Create the Supabase client** `src/lib/supabase.ts` ⚡

  Create this new file:

  ```ts
  import { createClient } from "@supabase/supabase-js";

  const supabaseUrl = process.env.SUPABASE_URL ?? "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  ```

  This client is independent from Drizzle. Drizzle talks directly to PostgreSQL. This client talks to Supabase's REST API for Storage. They don't interfere with each other.

  | Client | Speaks to | Used for |
  |---|---|---|
  | Drizzle (`src/db/index.ts`) | PostgreSQL (TCP pool) | All DB queries and mutations |
  | Supabase (`src/lib/supabase.ts`) | Storage REST API | File uploads and public URLs |

- [x] <a id="p10-storage-s6"></a>**Step 6 — Server Function to upload images** 🖼️

  In `src/data/products.ts`, add this new function at the end of the file, after `createProduct`:

  ```ts
  export const uploadProductImage = createServerFn({ method: "POST" })
    .inputValidator((data: { fileBase64: string; fileName: string }) => data)
    .handler(async ({ data }) => {
      // Only admins
      const session = await getSession();
      if (!session || session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const { supabase } = await import("@/lib/supabase");

      // Convert base64 → Buffer
      const base64Data = data.fileBase64.split(",")[1] ?? data.fileBase64;
      const buffer = Buffer.from(base64Data, "base64");

      // Fix content type: jpg → jpeg
      const ext = data.fileName.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

      // Unique name
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `products/${uniqueName}`;

      // Upload to Supabase
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl };
    });
  ```

  Why `base64` instead of `FormData`? TanStack Start's `createServerFn` serializes inputs as JSON. Binary files can't go through JSON, so we encode the file as base64 on the client, pass it as a string, and decode it back to a `Buffer` on the server before uploading.

- [x] <a id="p10-storage-s7"></a>**Step 7 — Modify the form** `src/routes/products/create-product.tsx` 📝

  **New approach — upload at submit, not on select:**
  Instead of uploading the image the moment the admin picks a file, the upload only happens when they click "Create Product". If they cancel or change their mind, nothing gets sent to Supabase — zero orphaned files.

  ***

  **7.1 — Update the imports**

  ```ts
  // BEFORE:
  import { createProduct, productSchema } from "@/data/products";

  // AFTER:
  import imageCompression from "browser-image-compression";
  import { createProduct, productSchema, uploadProductImage } from "@/data/products";
  ```

  ***

  **7.2 — Add upload state**

  Inside `RouteComponent`, alongside the `submitError` you already have:

  ```ts
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  ```

  | State | Purpose |
  |---|---|
  | `imagePreview` | Object URL shown as a local preview |
  | `compressedFile` | The compressed `File` object — held in memory until submit |

  ***

  **7.3 — Create the image select handler**

  This function only compresses and shows a preview — it does **not** upload anything:

  ```ts
  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      setCompressedFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setSubmitError("Error compressing image");
    }
  }
  ```

  ***

  **7.4 — Upload in `onSubmit`**

  The image is uploaded to Supabase only when the admin clicks "Create Product". If they cancel or remove the image, nothing is uploaded — zero orphaned files:

  ```ts
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      badge: undefined as BadgeValue | undefined,
      image: "",
      inventory: "in-stock" as InventoryValue,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError(null);

        if (!compressedFile) {
          setSubmitError("Please select an image");
          return;
        }

        // Convert to base64 and upload only now
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressedFile);
        });

        const { url } = await uploadProductImage({
          data: {
            fileBase64: base64,
            fileName: compressedFile.name,
          },
        });

        await createProduct({
          data: {
            name: value.name,
            description: value.description,
            price: value.price,
            badge: value.badge,
            image: url,
            inventory: value.inventory,
          },
        });

        await router.invalidate({ sync: true });
        navigate({ to: "/products" });
      } catch {
        setSubmitError("Something went wrong. Please try again.");
      }
    },
  });
  ```

  ***

  **7.5 — Image field in JSX**

  The image field is now a visual drop zone. No validators needed on this field because the URL is generated at submit time, not during input:

  ```tsx
  <form.Field name="image">
    {(field) => (
      <FormField field={field} label="Product Image *">
        <div className="space-y-3">
          <label
            className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="h-36 w-36 rounded-lg object-cover"
              />
            ) : (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <title>Upload icon</title>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click to select an image
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>

          {imagePreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setImagePreview(null);
                setCompressedFile(null);
              }}
            >
              Remove image
            </Button>
          )}
        </div>
      </FormField>
    )}
  </form.Field>
  ```

  ***

  **Complete flow** 🎯

  ```
  Admin selects image
         ↓
  browser-image-compression (3MB → 500KB)
         ↓
  Preview shown locally (URL.createObjectURL)
  File held in memory (compressedFile state)
         ↓
  Admin clicks "Create Product"
         ↓
  FileReader converts to base64
         ↓
  uploadProductImage() → Supabase Storage
         ↓
  Supabase returns public URL
         ↓
  createProduct() saves the URL in the DB
         ↓
  If admin cancels → nothing was uploaded → zero wasted space
  ```

---

<a id="phase-11"></a>

### Phase 11 — Admin Product Management

![phase11](./assets/phase_11_admin_product_management.svg)

Admin page for editing and deleting products from the catalog. Uses TanStack Table to list products, a shadcn Dialog for inline editing with optional image upload (uploaded to Supabase on save), and an AlertDialog for deletion confirmation. Protected via `beforeLoad` + admin role verification inside the server functions.

- [x] <a id="p11-s1"></a>**Step 1 — Install dependencies** 📦

  The Manage Products page requires three new packages:

  | Package | Purpose |
  |---|---|
  | `@tanstack/react-table` | Table logic: sorting, filtering, pagination |
  | `table` (shadcn) | UI components that TanStack Table renders |
  | `dialog` (shadcn) | Modal for inline product editing |
  | `alert-dialog` (shadcn) | Confirmation prompt before deleting |

  ```bash
  npm install @tanstack/react-table
  npx shadcn@latest add dialog alert-dialog table
  ```

  This generates `src/components/ui/dialog.tsx`, `src/components/ui/alert-dialog.tsx`, and `src/components/ui/table.tsx` — Radix UI primitives with shadcn styles ready to use.

- [x] <a id="p11-s2"></a>**Step 2 — Create the route** `src/routes/products/manage-products.tsx` 🗂️

  This page fetches all products with `getAllProducts()` in the loader and displays them in a TanStack Table. The edit Dialog and delete AlertDialog are mounted, but their handlers only `console.log` for now — they'll be wired to server functions in Step 4.

  > **`beforeLoad`** redirects to `/sign-in` if there's no session, and to `/` if the role isn't `admin`. The guard runs on the server before the loader even fires.

  ```tsx
  import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
  import {
  	type ColumnDef,
  	flexRender,
  	getCoreRowModel,
  	useReactTable,
  } from "@tanstack/react-table";
  import imageCompression from "browser-image-compression";
  import { Pencil, Trash2 } from "lucide-react";
  import { useState } from "react";
  import {
  	AlertDialog,
  	AlertDialogAction,
  	AlertDialogCancel,
  	AlertDialogContent,
  	AlertDialogDescription,
  	AlertDialogFooter,
  	AlertDialogHeader,
  	AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  import {
  	Card,
  	CardContent,
  	CardDescription,
  	CardHeader,
  	CardTitle,
  } from "@/components/ui/card";
  import {
  	Dialog,
  	DialogContent,
  	DialogDescription,
  	DialogFooter,
  	DialogHeader,
  	DialogTitle,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
  	Select,
  	SelectContent,
  	SelectItem,
  	SelectTrigger,
  	SelectValue,
  } from "@/components/ui/select";
  import {
  	Table,
  	TableBody,
  	TableCell,
  	TableHead,
  	TableHeader,
  	TableRow,
  } from "@/components/ui/table";
  import { Textarea } from "@/components/ui/textarea";
  import { getAllProducts } from "@/data/products";
  import type { InventoryValue, ProductSelect } from "@/db/schema";

  export const Route = createFileRoute("/products/manage-products")({
  	beforeLoad: async ({ context }) => {
  		const session = context.session;
  		if (!session) throw redirect({ to: "/sign-in" });
  		if (session.user.role !== "admin") throw redirect({ to: "/" });
  		return { user: session.user };
  	},
  	loader: async () => getAllProducts(),
  	component: ManageProductsPage,
  });

  function ManageProductsPage() {
  	const products = Route.useLoaderData();
  	const router = useRouter();

  	// Edit dialog state
  	const [editingProduct, setEditingProduct] = useState<ProductSelect | null>(
  		null,
  	);
  	const [editForm, setEditForm] = useState({
  		name: "",
  		description: "",
  		price: "",
  		badge: "none",
  		inventory: "in-stock",
  	});

  	// Image state
  	const [imagePreview, setImagePreview] = useState<string | null>(null);
  	const [compressedFile, setCompressedFile] = useState<File | null>(null);

  	// Delete dialog state
  	const [deletingProduct, setDeletingProduct] = useState<ProductSelect | null>(
  		null,
  	);

  	// Loading states
  	const [isSaving, setIsSaving] = useState(false);
  	const [isDeleting, setIsDeleting] = useState(false);

  	function openEditDialog(product: ProductSelect) {
  		setEditingProduct(product);
  		setEditForm({
  			name: product.name,
  			description: product.description,
  			price: product.price,
  			badge: product.badge ?? "none",
  			inventory: product.inventory,
  		});
  		setImagePreview(null);
  		setCompressedFile(null);
  	}

  	async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
  		const file = e.target.files?.[0];
  		if (!file) return;

  		try {
  			const compressed = await imageCompression(file, {
  				maxSizeMB: 0.5,
  				maxWidthOrHeight: 1200,
  				useWebWorker: true,
  			});
  			setCompressedFile(compressed);
  			setImagePreview(URL.createObjectURL(compressed));
  		} catch {
  			console.error("Error compressing image");
  		}
  	}

  	async function handleSave() {
  		if (!editingProduct) return;
  		setIsSaving(true);

  		// TODO: replace with real updateProduct server function
  		console.log("Saving product:", editingProduct.id, editForm);
  		console.log("New image:", compressedFile ? "yes" : "no (keep current)");

  		setIsSaving(false);
  		setEditingProduct(null);
  	}

  	async function handleDelete() {
  		if (!deletingProduct) return;
  		setIsDeleting(true);

  		// TODO: replace with real deleteProduct server function
  		console.log("Deleting product:", deletingProduct.id);

  		setIsDeleting(false);
  		setDeletingProduct(null);
  	}

  	const columns: ColumnDef<ProductSelect>[] = [
  		{
  			accessorKey: "image",
  			header: "Image",
  			cell: ({ row }) => (
  				<img
  					src={row.original.image}
  					alt={row.original.name}
  					className="h-10 w-10 rounded-md object-cover"
  				/>
  			),
  		},
  		{
  			accessorKey: "name",
  			header: "Name",
  		},
  		{
  			accessorKey: "price",
  			header: "Price",
  			cell: ({ row }) => <span>${row.original.price}</span>,
  		},
  		{
  			accessorKey: "badge",
  			header: "Badge",
  			cell: ({ row }) => (
  				<span className="text-sm text-slate-500">
  					{row.original.badge ?? "—"}
  				</span>
  			),
  		},
  		{
  			accessorKey: "inventory",
  			header: "Inventory",
  			cell: ({ row }) => {
  				const status = row.original.inventory;
  				const styles: Record<string, string> = {
  					"in-stock":
  						"bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  					backorder:
  						"bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  					preorder:
  						"bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  				};
  				return (
  					<span
  						className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? ""}`}
  					>
  						{status}
  					</span>
  				);
  			},
  		},
  		{
  			id: "actions",
  			header: "Actions",
  			cell: ({ row }) => (
  				<div className="flex items-center gap-2">
  					<Button
  						variant="outline"
  						size="sm"
  						onClick={() => openEditDialog(row.original)}
  					>
  						<Pencil size={14} />
  					</Button>
  					<Button
  						variant="outline"
  						size="sm"
  						className="text-red-500 hover:text-red-700 hover:border-red-300"
  						onClick={() => setDeletingProduct(row.original)}
  					>
  						<Trash2 size={14} />
  					</Button>
  				</div>
  			),
  		},
  	];

  	const table = useReactTable({
  		data: products,
  		columns,
  		getCoreRowModel: getCoreRowModel(),
  	});

  	return (
  		<div className="mx-auto max-w-7xl py-8 px-4">
  			<div className="space-y-6">
  				<Card>
  					<CardHeader>
  						<CardTitle className="text-lg">Manage Products</CardTitle>
  						<CardDescription>
  							Edit or remove products from the catalog.
  						</CardDescription>
  					</CardHeader>
  				</Card>

  				<Card>
  					<CardContent className="p-0">
  						<Table>
  							<TableHeader>
  								{table.getHeaderGroups().map((headerGroup) => (
  									<TableRow key={headerGroup.id}>
  										{headerGroup.headers.map((header) => (
  											<TableHead key={header.id}>
  												{header.isPlaceholder
  													? null
  													: flexRender(
  															header.column.columnDef.header,
  															header.getContext(),
  														)}
  											</TableHead>
  										))}
  									</TableRow>
  								))}
  							</TableHeader>
  							<TableBody>
  								{table.getRowModel().rows.length ? (
  									table.getRowModel().rows.map((row) => (
  										<TableRow key={row.id}>
  											{row.getVisibleCells().map((cell) => (
  												<TableCell key={cell.id}>
  													{flexRender(
  														cell.column.columnDef.cell,
  														cell.getContext(),
  													)}
  												</TableCell>
  											))}
  										</TableRow>
  									))
  								) : (
  									<TableRow>
  										<TableCell
  											colSpan={columns.length}
  											className="h-24 text-center text-slate-500"
  										>
  											No products found.
  										</TableCell>
  									</TableRow>
  								)}
  							</TableBody>
  						</Table>
  					</CardContent>
  				</Card>
  			</div>

  			{/* Edit Dialog */}
  			<Dialog
  				open={editingProduct !== null}
  				onOpenChange={(open) => {
  					if (!open) setEditingProduct(null);
  				}}
  			>
  				<DialogContent className="sm:max-w-lg">
  					<DialogHeader>
  						<DialogTitle>Edit Product</DialogTitle>
  						<DialogDescription>
  							Update the product details below.
  						</DialogDescription>
  					</DialogHeader>

  					<div className="space-y-4 py-4">
  						<div className="space-y-2">
  							<Label htmlFor="edit-name">Name</Label>
  							<Input
  								id="edit-name"
  								value={editForm.name}
  								onChange={(e) =>
  									setEditForm((prev) => ({ ...prev, name: e.target.value }))
  								}
  							/>
  						</div>

  						<div className="space-y-2">
  							<Label htmlFor="edit-description">Description</Label>
  							<Textarea
  								id="edit-description"
  								value={editForm.description}
  								onChange={(e) =>
  									setEditForm((prev) => ({
  										...prev,
  										description: e.target.value,
  									}))
  								}
  							/>
  						</div>

  						<div className="space-y-2">
  							<Label htmlFor="edit-price">Price</Label>
  							<Input
  								id="edit-price"
  								type="number"
  								step="0.01"
  								value={editForm.price}
  								onChange={(e) =>
  									setEditForm((prev) => ({ ...prev, price: e.target.value }))
  								}
  							/>
  						</div>

  						<div className="space-y-2">
  							<Label>Badge</Label>
  							<Select
  								value={editForm.badge}
  								onValueChange={(value) =>
  									setEditForm((prev) => ({ ...prev, badge: value ?? "none" }))
  								}
  							>
  								<SelectTrigger className="w-full">
  									<SelectValue />
  								</SelectTrigger>
  								<SelectContent>
  									<SelectItem value="none">None</SelectItem>
  									<SelectItem value="New">New</SelectItem>
  									<SelectItem value="Sale">Sale</SelectItem>
  									<SelectItem value="Featured">Featured</SelectItem>
  									<SelectItem value="Limited">Limited</SelectItem>
  								</SelectContent>
  							</Select>
  						</div>

  						<div className="space-y-2">
  							<Label>Inventory Status</Label>
  							<Select
  								value={editForm.inventory}
  								onValueChange={(value) =>
  									setEditForm((prev) => ({
  										...prev,
  										inventory: value as InventoryValue,
  									}))
  								}
  							>
  								<SelectTrigger className="w-full">
  									<SelectValue />
  								</SelectTrigger>
  								<SelectContent>
  									<SelectItem value="in-stock">In Stock</SelectItem>
  									<SelectItem value="backorder">Backorder</SelectItem>
  									<SelectItem value="preorder">Preorder</SelectItem>
  								</SelectContent>
  							</Select>
  						</div>

  						{/* Image field */}
  						<div className="space-y-2">
  							<Label>Product Image</Label>
  							<div className="flex items-center gap-4">
  								<img
  									src={imagePreview ?? editingProduct?.image ?? ""}
  									alt="Product"
  									className="h-20 w-20 rounded-lg object-cover border"
  								/>
  								<div className="flex flex-col gap-2">
  									{!imagePreview && (
  										<label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-muted">
  											Change image
  											<input
  												type="file"
  												accept="image/*"
  												onChange={handleImageSelect}
  												className="hidden"
  											/>
  										</label>
  									)}
  									{imagePreview && (
  										<Button
  											type="button"
  											variant="outline"
  											size="sm"
  											onClick={() => {
  												setImagePreview(null);
  												setCompressedFile(null);
  											}}
  										>
  											Undo change
  										</Button>
  									)}
  								</div>
  							</div>
  							<p className="text-xs text-muted-foreground">
  								{imagePreview
  									? "New image selected — will upload on save."
  									: "Leave unchanged to keep the current image."}
  							</p>
  						</div>
  					</div>

  					<DialogFooter>
  						<Button
  							variant="outline"
  							onClick={() => setEditingProduct(null)}
  							disabled={isSaving}
  						>
  							Cancel
  						</Button>
  						<Button onClick={handleSave} disabled={isSaving}>
  							{isSaving ? "Saving..." : "Save Changes"}
  						</Button>
  					</DialogFooter>
  				</DialogContent>
  			</Dialog>

  			{/* Delete AlertDialog */}
  			<AlertDialog
  				open={deletingProduct !== null}
  				onOpenChange={(open) => {
  					if (!open) setDeletingProduct(null);
  				}}
  			>
  				<AlertDialogContent>
  					<AlertDialogHeader>
  						<AlertDialogTitle>Delete Product</AlertDialogTitle>
  						<AlertDialogDescription>
  							Are you sure you want to delete{" "}
  							<span className="font-semibold">{deletingProduct?.name}</span>?
  							This action cannot be undone.
  						</AlertDialogDescription>
  					</AlertDialogHeader>
  					<AlertDialogFooter>
  						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
  						<AlertDialogAction
  							onClick={handleDelete}
  							disabled={isDeleting}
  							className="bg-red-600 hover:bg-red-700"
  						>
  							{isDeleting ? "Deleting..." : "Delete"}
  						</AlertDialogAction>
  					</AlertDialogFooter>
  				</AlertDialogContent>
  			</AlertDialog>
  		</div>
  	);
  }
  ```

- [x] <a id="p11-s3"></a>**Step 3 — Add link in the Header** `src/components/Header.tsx` 🔗

  The user menu already had the "Create Product" link. Add "Manage Products" right below it, inside the same `admin` role conditional block:

  ```tsx
  {session?.user.role === "admin" && (
  	<>
  		<Link
  			to="/products/create-product"
  			onClick={() => setIsUserMenuOpen(false)}
  			className="mt-2 block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  		>
  			Create Product
  		</Link>
  		<Link
  			to="/products/manage-products"
  			onClick={() => setIsUserMenuOpen(false)}
  			className="mt-2 block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  		>
  			Manage Products
  		</Link>
  	</>
  )}
  ```

  Both links are only rendered when `session?.user.role === "admin"`. If the role doesn't match, the entire block is skipped.

- [x] <a id="p11-s4"></a>**Step 4 — Create `updateProduct` and `deleteProduct`** `src/data/products.ts` 🛠️

  Add these two server functions at the bottom of `src/data/products.ts`:

  > **`updateProduct`** uses `productSchema.partial()` — all fields are optional except `id`. Only the fields the admin sends are included in the DB `SET`. **`deleteProduct`** receives only the `id` and deletes the product. Both verify session and admin role before touching the DB.

  ```ts
  const updateProductSchema = productSchema.partial().extend({
  	id: z.string().min(1, "Product ID is required"),
  });

  export const updateProduct = createServerFn({ method: "POST" })
  	.inputValidator((data: z.infer<typeof updateProductSchema>) =>
  		updateProductSchema.parse(data),
  	)
  	.handler(async ({ data }) => {
  		const session = await getSession();
  		if (!session) throw new Error("Unauthorized");
  		if (session.user.role !== "admin") throw new Error("Forbidden");

  		const { db } = await import("@/db");
  		const { id, ...values } = data;

  		const updateData: Record<string, unknown> = {};
  		if (values.name !== undefined) updateData.name = values.name;
  		if (values.description !== undefined)
  			updateData.description = values.description;
  		if (values.price !== undefined) updateData.price = values.price;
  		if (values.image !== undefined) updateData.image = values.image;
  		if (values.inventory !== undefined) updateData.inventory = values.inventory;
  		if (values.badge !== undefined) updateData.badge = values.badge ?? null;

  		const result = await db
  			.update(products)
  			.set(updateData)
  			.where(eq(products.id, id))
  			.returning();

  		const product = result[0];
  		if (!product) throw new Error("Product not found");
  		return product;
  	});

  export const deleteProduct = createServerFn({ method: "POST" })
  	.inputValidator((data: { id: string }) => data)
  	.handler(async ({ data }) => {
  		const session = await getSession();
  		if (!session) throw new Error("Unauthorized");
  		if (session.user.role !== "admin") throw new Error("Forbidden");

  		const { db } = await import("@/db");
  		await db.delete(products).where(eq(products.id, data.id));
  	});
  ```

  The `updateData: Record<string, unknown>` pattern builds the update object dynamically — only fields present in the payload are included in Drizzle's `SET`. This avoids accidentally overwriting fields the admin didn't touch.

- [x] <a id="p11-s5"></a>**Step 5 — Connect server functions in `manage-products.tsx`** ⚡

  Replace the imports from Step 2 and the `handleSave` / `handleDelete` handlers (the ones with `console.log`) with the real server functions:

  **Updated imports:**

  ```ts
  import { toast } from "sonner";
  import {
  	getAllProducts,
  	updateProduct,
  	deleteProduct,
  	uploadProductImage,
  } from "@/data/products";
  import type { BadgeValue, InventoryValue, ProductSelect } from "@/db/schema";
  ```

  **`handleSave` — optional image upload + update:**

  ```ts
  async function handleSave() {
  	if (!editingProduct) return;
  	setIsSaving(true);

  	try {
  		let imageUrl: string | undefined;

  		if (compressedFile) {
  			const base64 = await new Promise<string>((resolve, reject) => {
  				const reader = new FileReader();
  				reader.onload = () => resolve(reader.result as string);
  				reader.onerror = reject;
  				reader.readAsDataURL(compressedFile);
  			});

  			const { url } = await uploadProductImage({
  				data: {
  					fileBase64: base64,
  					fileName: compressedFile.name,
  				},
  			});
  			imageUrl = url;
  		}

  		await updateProduct({
  			data: {
  				id: editingProduct.id,
  				name: editForm.name,
  				description: editForm.description,
  				price: editForm.price,
  				badge:
  					editForm.badge === "none"
  						? undefined
  						: (editForm.badge as BadgeValue),
  				inventory: editForm.inventory as InventoryValue,
  				...(imageUrl ? { image: imageUrl } : {}),
  			},
  		});

  		await router.invalidate();
  		setEditingProduct(null);
  		toast.success("Product updated successfully.");
  	} catch {
  		toast.error("Failed to update product. Please try again.");
  	} finally {
  		setIsSaving(false);
  	}

  	setIsSaving(false);
  	setEditingProduct(null);
  }
  ```

  **`handleDelete` — delete with confirmation:**

  ```ts
  async function handleDelete() {
  	if (!deletingProduct) return;
  	setIsDeleting(true);

  	try {
  		await deleteProduct({ data: { id: deletingProduct.id } });
  		await router.invalidate();
  		setDeletingProduct(null);
  		toast.success("Product deleted successfully.");
  	} catch {
  		toast.error("Failed to delete product. Please try again.");
  	} finally {
  		setIsDeleting(false);
  	}

  	setIsDeleting(false);
  	setDeletingProduct(null);
  }
  ```

  `router.invalidate()` forces the loader to re-run — the table updates with fresh DB data without a full page reload. If the image didn't change (`compressedFile` is `null`), the spread `...(imageUrl ? { image: imageUrl } : {})` omits the `image` field from the payload, and `updateProduct` leaves the original URL untouched.

---

<a id="phase-12"></a>

### Phase 12 — Stripe Checkout & Order History

![phase12](./assets/phase_12_stripe_checkout_flow.svg)
![cards](./assets/stripe_test_cards_reference.svg)

How it works: When the user clicks "Checkout", the server creates a pending order in the database with a snapshot of the cart items, then creates a Stripe Checkout Session with those products. Stripe returns a URL and the user gets redirected there. Stripe handles everything (card, security, receipt). After payment, Stripe redirects the user back to the app — the success page verifies the payment with Stripe's API, updates the order status to "paid", and clears the cart. The user can then view all their past orders on the `/orders` page.

- [x] <a id="p12-s1"></a>**Step 1 — Install Stripe & add environment variable**

  1) Install the package:

  ```bash
  npm i stripe
  ```

  2) Open your `.env` file and add this line at the bottom:

  ```env
  STRIPE_SECRET_KEY=sk_test_your_full_secret_key_here
  ```

  The secret key is used server-side only (in your server function). The public key is only needed if you use Stripe Elements later — for Checkout Sessions we only need the secret key, but it's good to have both stored.

- [x] <a id="p12-s2"></a>**Step 2 — Add `orders` and `order_items` tables to the schema**

  Open `src/db/schema.ts` and paste this at the very bottom of the file, after the existing `cartItems` table and its types:

  ```ts
  // --- Phase 12: Orders ---

  const orderStatusValues = ["pending", "paid", "failed"] as const;
  export const orderStatusEnum = pgEnum("order_status", orderStatusValues);
  ```

  `as const` tells TypeScript these are the only possible values — not just any string. Without it, TypeScript sees `string[]`. With it, TypeScript sees exactly `"pending" | "paid" | "failed"`. Then `pgEnum` creates a PostgreSQL enum type so the database also only accepts these three values. Same pattern you already use for `badgeEnum` and `inventoryEnum`.

  ```ts
  export const orders = pgTable("orders", {
  	id: uuid("id").primaryKey().defaultRandom(),
  	userId: text("user_id")
  		.notNull()
  		.references(() => user.id, { onDelete: "cascade" }),
  	stripeSessionId: text("stripe_session_id"),
  	status: orderStatusEnum("status").notNull().default("pending"),
  	total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  	createdAt: timestamp("created_at").defaultNow().notNull(),
  });

  export const orderItems = pgTable("order_items", {
  	id: uuid("id").primaryKey().defaultRandom(),
  	orderId: uuid("order_id")
  		.notNull()
  		.references(() => orders.id, { onDelete: "cascade" }),
  	productId: uuid("product_id").references(() => products.id, {
  		onDelete: "set null",
  	}),
  	name: varchar("name", { length: 256 }).notNull(),
  	price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  	quantity: integer("quantity").notNull(),
  	image: varchar("image", { length: 512 }).notNull(),
  });

  export type OrderSelect = typeof orders.$inferSelect;
  export type OrderInsert = typeof orders.$inferInsert;
  export type OrderItemSelect = typeof orderItems.$inferSelect;
  export type OrderItemInsert = typeof orderItems.$inferInsert;
  ```

  Drizzle reads your table definition and creates the type automatically with `$inferSelect`. Less code, and if you add a column to the table later, the type updates itself.

  Two versions:
  - `$inferSelect` → "what does a row look like when I read from the DB?" — all columns are present
  - `$inferInsert` → "what do I need to send when I write to the DB?" — columns with defaults (`id`, `createdAt`) are optional because the database fills them in

- [x] <a id="p12-s3"></a>**Step 3 — Generate & push the new schema**

  Run these two commands in order:

  ```bash
  npm run db:generate
  ```

  Then:

  ```bash
  npm run db:push
  ```

  After both finish, go to your Supabase Dashboard → Table Editor — you should see two new tables: `orders` and `order_items`.

- [x] <a id="p12-s4"></a>**Step 4 — Create `/checkout/success` route (layout)**

  Create the file `src/routes/checkout/success.tsx`:

  ```tsx
  import { Link, createFileRoute } from "@tanstack/react-router";
  import { Button } from "#/components/ui/button";
  import { CheckCircle } from "lucide-react";

  export const Route = createFileRoute("/checkout/success")({
  	component: CheckoutSuccess,
  });

  function CheckoutSuccess() {
  	// TODO: Step 8 — connect to confirmOrder to verify payment and clear cart

  	return (
  		<div className="mx-auto max-w-lg py-20 text-center">
  			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
  				<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
  			</div>

  			<h1 className="mt-6 text-2xl font-bold">Payment successful!</h1>

  			<p className="mt-2 text-slate-600 dark:text-slate-300">
  				Thank you for your purchase. Your order is being processed.
  			</p>

  			<div className="mt-8 flex items-center justify-center gap-3">
  				<Link to="/orders">
  					<Button variant="outline">View my orders</Button>
  				</Link>

  				<Link to="/products">
  					<Button>Continue shopping</Button>
  				</Link>
  			</div>
  		</div>
  	);
  }
  ```

- [x] <a id="p12-s5"></a>**Step 5 — Create `/checkout/cancel` route (layout)**

  Create the file `src/routes/checkout/cancel.tsx`:

  ```tsx
  import { Link, createFileRoute } from "@tanstack/react-router";
  import { XCircle } from "lucide-react";
  import { Button } from "#/components/ui/button";

  export const Route = createFileRoute("/checkout/cancel")({
  	component: CheckoutCancel,
  });

  function CheckoutCancel() {
  	return (
  		<div className="mx-auto max-w-lg py-20 text-center">
  			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
  				<XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
  			</div>

  			<h1 className="mt-6 text-2xl font-bold">Payment cancelled</h1>

  			<p className="mt-2 text-slate-600 dark:text-slate-300">
  				No worries — your cart is still saved. Come back whenever you're ready.
  			</p>

  			<div className="mt-8 flex items-center justify-center gap-3">
  				<Link to="/cart">
  					<Button variant="outline">Back to cart</Button>
  				</Link>

  				<Link to="/products">
  					<Button>Browse products</Button>
  				</Link>
  			</div>
  		</div>
  	);
  }
  ```

- [x] <a id="p12-s6"></a>**Step 6 — Create `src/data/checkout.ts`**

  ```ts
  import { createServerFn } from "@tanstack/react-start";
  import { eq } from "drizzle-orm";
  import { cartItems, orderItems, orders, products } from "#/db/schema";
  import { getSession } from "#/lib/auth.functions";

  export const createCheckoutSession = createServerFn({ method: "POST" }).handler(
  	async () => {
  		const session = await getSession();
  		if (!session) {
  			throw new Error("You must be logged in to checkout");
  		}

  		const { db } = await import("@/db");
  		const Stripe = (await import("stripe")).default;

  		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

  		// 1. Fetch cart items with product details
  		const rows = await db
  			.select()
  			.from(cartItems)
  			.innerJoin(products, eq(cartItems.productId, products.id));

  		if (rows.length === 0) {
  			throw new Error("Cart is empty");
  		}

  		// 2. Calculate total
  		const total = rows.reduce(
  			(acc, row) => acc + Number(row.products.price) * row.cart_items.quantity,
  			0,
  		);

  		// 3. Create a pending order in the DB
  		const [order] = await db
  			.insert(orders)
  			.values({
  				userId: session.user.id,
  				total: total.toFixed(2),
  				status: "pending",
  			})
  			.returning();

  		if (!order) {
  			throw new Error("Failed to create order");
  		}

  		// 4. Insert order items (snapshot of product data at time of purchase)
  		await db.insert(orderItems).values(
  			rows.map((row) => ({
  				orderId: order.id,
  				productId: row.products.id,
  				name: row.products.name,
  				price: row.products.price,
  				quantity: row.cart_items.quantity,
  				image: row.products.image,
  			})),
  		);

  		// 5. Build line_items for Stripe
  		const line_items = rows.map((row) => ({
  			price_data: {
  				currency: "usd",
  				product_data: {
  					name: row.products.name,
  					description: row.products.description,
  					...(row.products.image.startsWith("http")
  						? { images: [row.products.image] }
  						: {}),
  				},
  				unit_amount: Math.round(Number(row.products.price) * 100),
  			},
  			quantity: row.cart_items.quantity,
  		}));

  		// 6. Create Stripe Checkout Session
  		const checkoutSession = await stripe.checkout.sessions.create({
  			mode: "payment",
  			payment_method_types: ["card"],
  			line_items,
  			success_url: `${process.env.BETTER_AUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  			cancel_url: `${process.env.BETTER_AUTH_URL}/checkout/cancel`,
  			metadata: {
  				orderId: order.id,
  			},
  		});

  		// 7. Save the Stripe session ID in our order
  		await db
  			.update(orders)
  			.set({ stripeSessionId: checkoutSession.id })
  			.where(eq(orders.id, order.id));

  		if (!checkoutSession.url) {
  			throw new Error("Stripe did not return a checkout URL");
  		}

  		return { url: checkoutSession.url };
  	},
  );

  // Called from /checkout/success to verify payment and finalize the order
  export const confirmOrder = createServerFn({ method: "POST" })
  	.inputValidator((data: { sessionId: string }) => data)
  	.handler(async ({ data }) => {
  		const session = await getSession();
  		if (!session) {
  			throw new Error("Unauthorized");
  		}

  		const { db } = await import("@/db");
  		const Stripe = (await import("stripe")).default;

  		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

  		// 1. Verify payment with Stripe
  		const checkoutSession = await stripe.checkout.sessions.retrieve(
  			data.sessionId,
  		);

  		if (checkoutSession.payment_status !== "paid") {
  			throw new Error("Payment not completed");
  		}

  		// 2. Find the order by Stripe session ID
  		const [order] = await db
  			.select()
  			.from(orders)
  			.where(eq(orders.stripeSessionId, data.sessionId))
  			.limit(1);

  		if (!order) {
  			throw new Error("Order not found");
  		}

  		// 3. Only update if still pending (avoid double-processing)
  		if (order.status === "pending") {
  			await db
  				.update(orders)
  				.set({ status: "paid" })
  				.where(eq(orders.id, order.id));

  			// 4. Clear the cart
  			await db.delete(cartItems);
  		}

  		return { orderId: order.id, status: "paid" as const };
  	});
  ```

  This file has two functions:

  - `createCheckoutSession` — the user clicks Checkout → this creates a pending order in the DB, saves a snapshot of the cart items, sends the products to Stripe, and returns the payment URL.
  - `confirmOrder` — after the user pays and returns to `/checkout/success` → this asks Stripe "did they actually pay?", updates the order to "paid", and clears the cart. We'll connect this in Step 8.

  The `unit_amount` uses `* 100` because Stripe works in cents — $99.99 becomes 9999.

- [x] <a id="p12-s7"></a>**Step 7 — Wire the Checkout button in `cart.tsx`**

  Open `src/routes/cart.tsx` and make three changes:

  1) Add this import at the top (next to your other imports):

  ```ts
  import { createCheckoutSession } from "@/data/checkout";
  ```

  2) Add this state (next to your other `useState` calls inside `CartPage`):

  ```ts
  const [checkingOut, setCheckingOut] = useState(false);
  ```

  3) Find the current Checkout button and replace it with:

  ```tsx
  <Button
  	className="mt-5 w-full"
  	type="button"
  	disabled={checkingOut}
  	onClick={async () => {
  		setCheckingOut(true);
  		try {
  			const { url } = await createCheckoutSession();
  			window.location.href = url;
  		} catch (error) {
  			toast.error(
  				error instanceof Error
  					? error.message
  					: "Failed to start checkout. Please try again.",
  			);
  			setCheckingOut(false);
  		}
  	}}
  >
  	{checkingOut ? "Redirecting to Stripe..." : "Checkout"}
  </Button>
  ```

  When the user clicks Checkout: the button disables and shows "Redirecting to Stripe...", calls the server function to create the order and Stripe session, then redirects the browser to Stripe's payment page. If something fails (not logged in, empty cart), it shows a toast error.

  Notice we don't call `setCheckingOut(false)` on success — because the browser is navigating away to Stripe, so the component is about to unmount anyway.

  The `error instanceof Error` check is asking: "is this a real Error object with a `.message` property?"

  If yes, it shows the specific message from your server function. These are the possible ones you defined in `checkout.ts`:
  - `"You must be logged in to checkout"` — user not logged in
  - `"Cart is empty"` — no items in cart
  - `"Failed to create order"` — database issue
  - `"Stripe did not return a checkout URL"` — Stripe issue

  If no (something unexpected happened that isn't a standard Error), it shows the generic fallback: `"Failed to start checkout. Please try again."`

- [x] <a id="p12-s8"></a>**Step 8 — Connect `/checkout/success` to `confirmOrder`**

  Open `src/routes/checkout/success.tsx`. Here are the changes:

  1) Replace the imports at the top with:

  ```ts
  import { Link, createFileRoute } from "@tanstack/react-router";
  import { Button } from "#/components/ui/button";
  import { CheckCircle, Loader2 } from "lucide-react";
  import { useEffect, useRef, useState } from "react";
  import { useQueryClient } from "@tanstack/react-query";
  import { confirmOrder } from "#/data/checkout";
  import { cartCountQueryKey } from "#/components/Header";
  ```

  You're adding: `Loader2` (spinner icon), `useEffect`, `useRef`, `useState`, `useQueryClient`, `confirmOrder`, and `cartCountQueryKey`.

  2) Replace the `CheckoutSuccess` function with:

  ```tsx
  function CheckoutSuccess() {
  	const queryClient = useQueryClient();
  	const confirmed = useRef(false);
  	const [status, setStatus] = useState<"loading" | "success" | "error">(
  		"loading",
  	);

  	// Runs once when the page loads — verifies payment with Stripe
  	useEffect(() => {
  		if (confirmed.current) return;
  		confirmed.current = true;

  		const params = new URLSearchParams(window.location.search);
  		const sessionId = params.get("session_id");

  		if (!sessionId) {
  			setStatus("error");
  			return;
  		}

  		confirmOrder({ data: { sessionId } })
  			.then(() => {
  				queryClient.invalidateQueries({ queryKey: cartCountQueryKey });
  				setStatus("success");
  			})
  			.catch(() => {
  				setStatus("error");
  			});
  	}, [queryClient]);

  	if (status === "loading") {
  		return (
  			<div className="mx-auto max-w-lg py-20 text-center">
  				<Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" />
  				<p className="mt-4 text-slate-600 dark:text-slate-300">
  					Verifying your payment...
  				</p>
  			</div>
  		);
  	}

  	if (status === "error") {
  		return (
  			<div className="mx-auto max-w-lg py-20 text-center">
  				<h1 className="text-2xl font-bold">Something went wrong</h1>
  				<p className="mt-2 text-slate-600 dark:text-slate-300">
  					We couldn't verify your payment. If you were charged, please contact
  					support.
  				</p>
  				<Link to="/products" className="mt-6 inline-block">
  					<Button>Back to products</Button>
  				</Link>
  			</div>
  		);
  	}

  	return (
  		<div className="mx-auto max-w-lg py-20 text-center">
  			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
  				<CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
  			</div>

  			<h1 className="mt-6 text-2xl font-bold">Payment successful!</h1>

  			<p className="mt-2 text-slate-600 dark:text-slate-300">
  				Thank you for your purchase. Your order is being processed.
  			</p>

  			<div className="mt-8 flex items-center justify-center gap-3">
  				<Link to="/orders">
  					<Button variant="outline">View my orders</Button>
  				</Link>

  				<Link to="/products">
  					<Button>Continue shopping</Button>
  				</Link>
  			</div>
  		</div>
  	);
  }
  ```

  What happens when the user lands on this page after paying:

  1. The page starts in `loading` state — shows a spinner and "Verifying your payment..."
  2. It reads `session_id` from the URL (Stripe put it there via the `{CHECKOUT_SESSION_ID}` template)
  3. Calls `confirmOrder` which asks Stripe "did they actually pay?", updates the order to "paid", and clears the cart
  4. Updates the cart badge in the Header (now shows 0)
  5. Switches to `success` state — shows the green checkmark

  `useRef(confirmed)` prevents the function from running twice — React Strict Mode in dev calls `useEffect` twice, and the ref ensures we only verify the payment once.

- [x] <a id="p12-s9"></a>**Step 9 — Add "My Orders" link in the Header**

  Open `src/components/Header.tsx`. Find the Profile link inside the user dropdown, and add this right after it:

  ```tsx
  <Link
  	to="/orders"
  	onClick={() => setIsUserMenuOpen(false)}
  	className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  >
  	My Orders
  </Link>
  ```

  This link is visible to all logged-in users, not just admins — that's why it goes outside the admin conditional block.

- [x] <a id="p12-s10"></a>**Step 10 — Create `/orders` route (layout with mock data)**

  Create the file `src/routes/orders/index.tsx`:

  ```tsx
  import { createFileRoute, Link } from "@tanstack/react-router";
  import { Package } from "lucide-react";
  import { Button } from "#/components/ui/button";
  import {
  	Empty,
  	EmptyContent,
  	EmptyDescription,
  	EmptyHeader,
  	EmptyTitle,
  } from "@/components/ui/empty";

  export const Route = createFileRoute("/orders")({
  	// TODO: Step 12 — loader: fetch real orders via getOrdersByUser
  	component: OrdersPage,
  });

  // Mock data — same shape as the real DB response will have
  const mockOrders = [
  	{
  		id: "order-1",
  		status: "paid" as const,
  		total: "249.98",
  		createdAt: new Date("2025-06-01T14:30:00"),
  		items: [
  			{
  				id: "item-1",
  				name: "TanStack Router Pro",
  				price: "99.99",
  				quantity: 1,
  				image: "/tanstack-circle-logo.png",
  			},
  			{
  				id: "item-2",
  				name: "TanStack Query Enterprise",
  				price: "149.99",
  				quantity: 1,
  				image: "/tanstack-circle-logo.png",
  			},
  		],
  	},
  	{
  		id: "order-2",
  		status: "paid" as const,
  		total: "79.99",
  		createdAt: new Date("2025-05-28T09:15:00"),
  		items: [
  			{
  				id: "item-3",
  				name: "TanStack Table Premium",
  				price: "79.99",
  				quantity: 1,
  				image: "/tanstack-circle-logo.png",
  			},
  		],
  	},
  ];

  const statusStyles = {
  	pending:
  		"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  	paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  	failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  function OrdersPage() {
  	const orders = mockOrders;

  	if (orders.length === 0) {
  		return (
  			<div className="mx-auto max-w-3xl py-16">
  				<Empty>
  					<EmptyHeader>
  						<Package size={40} className="mx-auto text-slate-400" />
  						<EmptyTitle>No orders yet</EmptyTitle>
  						<EmptyDescription>
  							Once you complete a purchase, your orders will appear here.
  						</EmptyDescription>
  					</EmptyHeader>

  					<EmptyContent>
  						<Link to="/products">
  							<Button>Browse products</Button>
  						</Link>
  					</EmptyContent>
  				</Empty>
  			</div>
  		);
  	}

  	return (
  		<div className="mx-auto max-w-3xl space-y-6 py-8">
  			<div>
  				<h1 className="text-2xl font-semibold">My Orders</h1>
  				<p className="text-sm text-slate-600 dark:text-slate-300">
  					Your purchase history.
  				</p>
  			</div>

  			<div className="space-y-4">
  				{orders.map((order) => (
  					<div
  						key={order.id}
  						className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-950/40"
  					>
  						<div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
  							<div className="flex items-center gap-4 text-sm">
  								<span className="text-slate-500">
  									{order.createdAt.toLocaleDateString("en-US", {
  										year: "numeric",
  										month: "short",
  										day: "numeric",
  									})}
  								</span>

  								<span
  									className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}
  								>
  									{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
  								</span>
  							</div>

  							<span className="text-sm font-semibold">
  								${Number(order.total).toFixed(2)}
  							</span>
  						</div>

  						<div className="divide-y divide-slate-100 dark:divide-slate-800">
  							{order.items.map((item) => (
  								<div
  									key={item.id}
  									className="flex items-center gap-4 px-5 py-3"
  								>
  									<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
  										<img
  											src={item.image}
  											alt={item.name}
  											className="h-8 w-8 object-contain"
  											loading="lazy"
  										/>
  									</div>

  									<div className="flex-1">
  										<p className="text-sm font-semibold">{item.name}</p>
  										<p className="text-xs text-slate-500">
  											Qty: {item.quantity} · ${Number(item.price).toFixed(2)}{" "}
  											each
  										</p>
  									</div>

  									<span className="text-sm font-semibold">
  										${(Number(item.price) * item.quantity).toFixed(2)}
  									</span>
  								</div>
  							))}
  						</div>
  					</div>
  				))}
  			</div>
  		</div>
  	);
  }
  ```

- [x] <a id="p12-s11"></a>**Step 11 — Create `src/data/orders.ts`**

  Create the file `src/data/orders.ts`:

  ```ts
  import { createServerFn } from "@tanstack/react-start";
  import { desc, eq } from "drizzle-orm";
  import { orderItems, orders } from "#/db/schema";
  import { getSession } from "#/lib/auth.functions";

  // Fetch all orders for the logged-in user (newest first)
  export const getOrdersByUser = createServerFn({ method: "GET" }).handler(
  	async () => {
  		const session = await getSession();
  		if (!session) {
  			throw new Error("Unauthorized");
  		}

  		const { db } = await import("@/db");

  		// Get all orders for this user, newest first
  		const userOrders = await db
  			.select()
  			.from(orders)
  			.where(eq(orders.userId, session.user.id))
  			.orderBy(desc(orders.createdAt));

  		if (userOrders.length === 0) return [];

  		// For each order, fetch its items
  		const ordersWithItems = await Promise.all(
  			userOrders.map(async (order) => {
  				const items = await db
  					.select()
  					.from(orderItems)
  					.where(eq(orderItems.orderId, order.id));

  				return {
  					id: order.id,
  					status: order.status,
  					total: order.total,
  					createdAt: order.createdAt,
  					items: items.map((item) => ({
  						id: item.id,
  						name: item.name,
  						price: item.price,
  						quantity: item.quantity,
  						image: item.image,
  					})),
  				};
  			}),
  		);

  		return ordersWithItems;
  	},
  );

  // Fetch a single order by ID (verifies ownership)
  export const getOrderById = createServerFn({ method: "GET" })
  	.inputValidator((data: { orderId: string }) => data)
  	.handler(async ({ data }) => {
  		const session = await getSession();
  		if (!session) {
  			throw new Error("Unauthorized");
  		}

  		const { db } = await import("@/db");

  		const [order] = await db
  			.select()
  			.from(orders)
  			.where(eq(orders.id, data.orderId))
  			.limit(1);

  		if (!order) {
  			throw new Error("Order not found");
  		}

  		// Verify the order belongs to the logged-in user
  		if (order.userId !== session.user.id) {
  			throw new Error("Forbidden");
  		}

  		const items = await db
  			.select()
  			.from(orderItems)
  			.where(eq(orderItems.orderId, order.id));

  		return {
  			id: order.id,
  			status: order.status,
  			total: order.total,
  			createdAt: order.createdAt,
  			stripeSessionId: order.stripeSessionId,
  			items: items.map((item) => ({
  				id: item.id,
  				name: item.name,
  				price: item.price,
  				quantity: item.quantity,
  				image: item.image,
  			})),
  		};
  	});
  ```

  Two functions:

  - `getOrdersByUser` — fetches all orders for the logged-in user, newest first. For each order, it also fetches its items. This is what the `/orders` page will use.
  - `getOrderById` — fetches a single order with its items. It checks that the order belongs to the logged-in user (so nobody can see someone else's orders). Useful if you later want an order detail page.

- [x] <a id="p12-s12"></a>**Step 12 — Connect `/orders` to real data**

  Open `src/routes/orders/index.tsx` and make these changes:

  1) Add this import at the top (next to the other imports):

  ```ts
  import { Link, createFileRoute, redirect } from "@tanstack/react-router";
  import { getOrdersByUser } from "@/data/orders";
  ```

  2) Replace the Route definition to this:

  ```ts
  export const Route = createFileRoute("/orders")({
  	beforeLoad: async ({ context }) => {
  		const session = context.session;
  		if (!session) throw redirect({ to: "/sign-in" });
  	},
  	loader: async () => getOrdersByUser(),
  	component: OrdersPage,
  });
  ```

  3) Delete the entire `mockOrders` block.

  4) Inside `OrdersPage`, replace the first line — change:

  ```ts
  const orders = mockOrders;
  ```

  to:

  ```ts
  const orders = Route.useLoaderData();
  ```

  Now the page fetches real orders from the database. The `beforeLoad` guard redirects to sign-in if the user is not logged in (same pattern as `create-product.tsx`). The loader calls `getOrdersByUser` which returns only orders belonging to the current user.

---

<a id="phase-13"></a>

### Phase 13 — Admin Orders Dashboard

![phase13](./assets/phase_13_admin_orders_dashboard_v2.svg)

- [x] <a id="p13-s1"></a>**Step 1 — Header link, route & mock layout with detail Dialog**

  Three things happening here:

  - **Header** — Add "Manage Orders" link inside the admin block, right after "Manage Products"
  - **Route** — Create `src/routes/orders/manage-orders.tsx` with `beforeLoad` admin guard, TanStack Table with mock data, and an Eye button per row
  - **Dialog** — Clicking the eye icon opens a Dialog showing customer info, status, total, and the list of items

  ***

  **1) Header — add the link**

  Open `src/components/Header.tsx`. Inside the `session?.user.role === "admin"` block, add this right after the "Manage Products" link:

  ```tsx
  <Link
  	to="/orders/manage-orders"
  	onClick={() => setIsUserMenuOpen(false)}
  	className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  >
  	Manage Orders
  </Link>
  ```

  ***

  **2) Create the route file**

  Create `src/routes/orders/manage-orders.tsx`:

  ```tsx
  import { createFileRoute, redirect } from "@tanstack/react-router";
  import {
  	type ColumnDef,
  	flexRender,
  	getCoreRowModel,
  	useReactTable,
  } from "@tanstack/react-table";
  import { Eye } from "lucide-react";
  import { useState } from "react";
  import { Button } from "@/components/ui/button";
  import {
  	Card,
  	CardContent,
  	CardDescription,
  	CardHeader,
  	CardTitle,
  } from "@/components/ui/card";
  import {
  	Dialog,
  	DialogContent,
  	DialogDescription,
  	DialogHeader,
  	DialogTitle,
  } from "@/components/ui/dialog";
  import {
  	Table,
  	TableBody,
  	TableCell,
  	TableHead,
  	TableHeader,
  	TableRow,
  } from "@/components/ui/table";

  // ── Mock data — delete in Step 3 when we connect real data ──
  const mockOrders = [
  	{
  		id: "ord-001",
  		user: { name: "John Doe", email: "john@example.com" },
  		status: "paid" as const,
  		total: "249.98",
  		createdAt: new Date("2026-05-20T14:30:00"),
  		items: [
  			{ id: "i1", name: "TanStack Router Pro", price: "99.99", quantity: 1, image: "/tanstack-circle-logo.png" },
  			{ id: "i2", name: "TanStack Query Enterprise", price: "149.99", quantity: 1, image: "/tanstack-circle-logo.png" },
  		],
  	},
  	{
  		id: "ord-002",
  		user: { name: "Jane Smith", email: "jane@example.com" },
  		status: "pending" as const,
  		total: "79.99",
  		createdAt: new Date("2026-05-21T09:15:00"),
  		items: [
  			{ id: "i3", name: "TanStack Table Premium", price: "79.99", quantity: 1, image: "/tanstack-circle-logo.png" },
  		],
  	},
  	{
  		id: "ord-003",
  		user: { name: "Carlos Rivera", email: "carlos@example.com" },
  		status: "failed" as const,
  		total: "199.99",
  		createdAt: new Date("2026-05-19T18:45:00"),
  		items: [
  			{ id: "i4", name: "TanStack Start Framework", price: "199.99", quantity: 1, image: "/tanstack-circle-logo.png" },
  		],
  	},
  ];

  type MockOrder = (typeof mockOrders)[number];

  const statusStyles = {
  	pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  	paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  	failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  // ── Route ──
  export const Route = createFileRoute("/orders/manage-orders")({
  	beforeLoad: async ({ context }) => {
  		const session = context.session;
  		if (!session) throw redirect({ to: "/sign-in" });
  		if (session.user.role !== "admin") throw redirect({ to: "/" });
  		return { user: session.user };
  	},
  	component: ManageOrdersPage,
  });

  // ── Component ──
  function ManageOrdersPage() {
  	const orders = mockOrders; // ← becomes Route.useLoaderData() in Step 3

  	const [viewingOrder, setViewingOrder] = useState<MockOrder | null>(null);

  	const columns: ColumnDef<MockOrder>[] = [
  		{
  			accessorKey: "createdAt",
  			header: "Date",
  			cell: ({ row }) => (
  				<span className="text-sm text-slate-600 dark:text-slate-300">
  					{row.original.createdAt.toLocaleDateString("en-US", {
  						year: "numeric",
  						month: "short",
  						day: "numeric",
  					})}
  				</span>
  			),
  		},
  		{
  			id: "customer",
  			header: "Customer",
  			cell: ({ row }) => (
  				<div>
  					<p className="text-sm font-medium">{row.original.user.name}</p>
  					<p className="text-xs text-slate-500">{row.original.user.email}</p>
  				</div>
  			),
  		},
  		{
  			accessorKey: "status",
  			header: "Status",
  			cell: ({ row }) => (
  				<span
  					className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.original.status]}`}
  				>
  					{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
  				</span>
  			),
  		},
  		{
  			id: "itemsCount",
  			header: "Items",
  			cell: ({ row }) => (
  				<span className="text-sm">
  					{row.original.items.reduce((sum, item) => sum + item.quantity, 0)}
  				</span>
  			),
  		},
  		{
  			accessorKey: "total",
  			header: "Total",
  			cell: ({ row }) => (
  				<span className="text-sm font-semibold">
  					${Number(row.original.total).toFixed(2)}
  				</span>
  			),
  		},
  		{
  			id: "actions",
  			header: "",
  			cell: ({ row }) => (
  				<Button
  					variant="outline"
  					size="sm"
  					onClick={() => setViewingOrder(row.original)}
  				>
  					<Eye size={14} />
  				</Button>
  			),
  		},
  	];

  	// useReactTable wires up the data, columns, and the row model.
  	// getCoreRowModel() is the minimum required model — it processes rows without sorting, filtering, or pagination.
  	const table = useReactTable({
  		data: orders,
  		columns,
  		getCoreRowModel: getCoreRowModel(),
  	});

  	return (
  		<div className="mx-auto max-w-7xl py-8 px-4">
  			<div className="space-y-6">
  				<Card>
  					<CardHeader>
  						<CardTitle className="text-lg">Manage Orders</CardTitle>
  						<CardDescription>
  							View all customer orders and their details.
  						</CardDescription>
  					</CardHeader>
  				</Card>

  				<Card>
  					<CardContent className="p-0">
  						<Table>
  							<TableHeader>
  								{table.getHeaderGroups().map((headerGroup) => (
  									<TableRow key={headerGroup.id}>
  										{headerGroup.headers.map((header) => (
  											<TableHead key={header.id}>
  												{header.isPlaceholder
  													? null
  													: flexRender(
  															header.column.columnDef.header,
  															header.getContext(),
  														)}
  											</TableHead>
  										))}
  									</TableRow>
  								))}
  							</TableHeader>
  							<TableBody>
  								{table.getRowModel().rows.length ? (
  									table.getRowModel().rows.map((row) => (
  										<TableRow key={row.id}>
  											{row.getVisibleCells().map((cell) => (
  												<TableCell key={cell.id}>
  													{flexRender(
  														cell.column.columnDef.cell,
  														cell.getContext(),
  													)}
  												</TableCell>
  											))}
  										</TableRow>
  									))
  								) : (
  									<TableRow>
  										<TableCell
  											colSpan={columns.length}
  											className="h-24 text-center text-slate-500"
  										>
  											No orders found.
  										</TableCell>
  									</TableRow>
  								)}
  							</TableBody>
  						</Table>
  					</CardContent>
  				</Card>
  			</div>

  			{/* Order detail Dialog */}
  			<Dialog
  				open={viewingOrder !== null}
  				onOpenChange={(open) => {
  					if (!open) setViewingOrder(null);
  				}}
  			>
  				<DialogContent className="max-w-lg">
  					<DialogHeader>
  						<DialogTitle>Order Details</DialogTitle>
  						<DialogDescription>
  							Order placed on{" "}
  							{viewingOrder?.createdAt.toLocaleDateString("en-US", {
  								year: "numeric",
  								month: "long",
  								day: "numeric",
  							})}
  						</DialogDescription>
  					</DialogHeader>

  					{viewingOrder && (
  						<div className="space-y-4">
  							<div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
  								<p className="text-sm font-medium">{viewingOrder.user.name}</p>
  								<p className="text-xs text-slate-500">{viewingOrder.user.email}</p>
  							</div>

  							<div className="flex items-center justify-between">
  								<span
  									className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[viewingOrder.status]}`}
  								>
  									{viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}
  								</span>
  								<span className="text-lg font-bold">
  									${Number(viewingOrder.total).toFixed(2)}
  								</span>
  							</div>

  							<div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
  								{viewingOrder.items.map((item) => (
  									<div key={item.id} className="flex items-center gap-3 p-3">
  										<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
  											<img src={item.image} alt={item.name} className="h-6 w-6 object-contain" />
  										</div>
  										<div className="flex-1">
  											<p className="text-sm font-medium">{item.name}</p>
  											<p className="text-xs text-slate-500">
  												Qty: {item.quantity} · ${Number(item.price).toFixed(2)} each
  											</p>
  										</div>
  										<span className="text-sm font-semibold">
  											${(Number(item.price) * item.quantity).toFixed(2)}
  										</span>
  									</div>
  								))}
  							</div>
  						</div>
  					)}
  				</DialogContent>
  			</Dialog>
  		</div>
  	);
  }
  ```

  **How TanStack Table renders the grid**

  The pattern is always the same three steps: (1) define `columns` with `ColumnDef[]`, (2) call `useReactTable` to get a `table` instance, (3) map `table.getHeaderGroups()` for the header and `table.getRowModel().rows` for the body.

  Each column definition has an `id` or `accessorKey`. `accessorKey` maps directly to a property on the row data; `id` is for computed or action columns that don't map to a single field. The `cell` render prop receives `{ row }` — `row.original` is the typed raw object, so you can access any property without casting.

  `flexRender` is TanStack Table's utility that calls the column's `header` or `cell` function with the correct context — it handles both function and static string definitions transparently.

- [x] <a id="p13-s2"></a>**Step 2 — Create `getAllOrders` server function**

  This function fetches all orders from all users (not just the logged-in user like `getOrdersByUser` does). It joins `orders` with `user` to get the buyer's name and email, then fetches the items for each order. Only admins can call it.

  Open `src/data/orders.ts` and add this function at the bottom:

  ```ts
  // Fetch ALL orders (admin only) — joins with user table to get buyer info
  export const getAllOrders = createServerFn({ method: "GET" }).handler(
  	async () => {
  		const session = await getSession();
  		if (!session) throw new Error("Unauthorized");
  		if (session.user.role !== "admin") throw new Error("Forbidden");

  		const { db } = await import("@/db");
  		const { user } = await import("@/db/schema");

  		// Get all orders joined with user info, newest first
  		const rows = await db
  			.select({
  				id: orders.id,
  				status: orders.status,
  				total: orders.total,
  				createdAt: orders.createdAt,
  				userName: user.name,
  				userEmail: user.email,
  			})
  			.from(orders)
  			.innerJoin(user, eq(orders.userId, user.id))
  			.orderBy(desc(orders.createdAt));

  		if (rows.length === 0) return [];

  		// For each order, fetch its items
  		const ordersWithItems = await Promise.all(
  			rows.map(async (row) => {
  				const items = await db
  					.select()
  					.from(orderItems)
  					.where(eq(orderItems.orderId, row.id));

  				return {
  					id: row.id,
  					user: { name: row.userName, email: row.userEmail },
  					status: row.status,
  					total: row.total,
  					createdAt: row.createdAt,
  					items: items.map((item) => ({
  						id: item.id,
  						name: item.name,
  						price: item.price,
  						quantity: item.quantity,
  						image: item.image,
  					})),
  				};
  			}),
  		);

  		return ordersWithItems;
  	},
  );
  ```

  Notice the return shape matches exactly the mock data we used in Step 1 — `user: { name, email }`, `status`, `total`, `createdAt`, and `items[]`. This means swapping from mock to real data will be seamless.

  **Why the `select` projection matters**

  Unlike `getOrdersByUser` which does `db.select().from(orders)` and gets every column, `getAllOrders` uses an explicit projection: `db.select({ id: orders.id, userName: user.name, ... })`. This is necessary because the join produces a row that would otherwise contain both `orders.*` and `user.*` — including fields like `user.password` and `user.emailVerified` that we never want to expose. Projecting only the needed columns keeps the response lean and safe.

- [x] <a id="p13-s3"></a>**Step 3 — Connect the route to real data**

  Open `src/routes/orders/manage-orders.tsx` and make these changes:

  1) Add the import at the top:

  ```ts
  import { getAllOrders } from "@/data/orders";
  ```

  2) Add a `loader` to the Route definition:

  ```ts
  export const Route = createFileRoute("/orders/manage-orders")({
  	beforeLoad: async ({ context }) => {
  		const session = context.session;
  		if (!session) throw redirect({ to: "/sign-in" });
  		if (session.user.role !== "admin") throw redirect({ to: "/" });
  		return { user: session.user };
  	},
  	loader: async () => getAllOrders(),
  	component: ManageOrdersPage,
  });
  ```

  3) Delete the entire `mockOrders` array and the `MockOrder` type.

  4) Inside `ManageOrdersPage`, replace:

  ```ts
  const orders = mockOrders;
  ```

  with:

  ```ts
  const orders = Route.useLoaderData();
  ```

  5) Update the type for `viewingOrder` and `columns`. Replace:

  ```ts
  const [viewingOrder, setViewingOrder] = useState<MockOrder | null>(null);

  const columns: ColumnDef<MockOrder>[] = [
  ```

  with:

  ```ts
  type OrderData = (typeof orders)[number];

  const [viewingOrder, setViewingOrder] = useState<OrderData | null>(null);

  const columns: ColumnDef<OrderData>[] = [
  ```

  That's it — 5 small changes. The component stays exactly the same because `getAllOrders` returns the same shape as the mock data.

- [x] <a id="p13-s4"></a>**Step 4 — `updateOrderStatus` server function + connect in UI**

  Two things: create the server function, then add a `Select` in the Dialog so the admin can change the status.

  ***

  **1) Add `updateOrderStatus` in `src/data/orders.ts`**

  ```ts
  export const updateOrderStatus = createServerFn({ method: "POST" })
  	.inputValidator(
  		(data: { orderId: string; status: "pending" | "paid" | "failed" }) => data,
  	)
  	.handler(async ({ data }) => {
  		const session = await getSession();
  		if (!session) throw new Error("Unauthorized");
  		if (session.user.role !== "admin") throw new Error("Forbidden");

  		const { db } = await import("@/db");

  		await db
  			.update(orders)
  			.set({ status: data.status })
  			.where(eq(orders.id, data.orderId));
  	});
  ```

  Receives the order ID and the new status. Checks admin role first, then updates the `status` column in the database.

  ***

  **2) Update `manage-orders.tsx`**

  Add these new imports at the top (keep the ones you already have):

  ```ts
  import { toast } from "sonner";
  import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
  import { getAllOrders, updateOrderStatus } from "@/data/orders";
  import {
  	Select,
  	SelectContent,
  	SelectItem,
  	SelectTrigger,
  	SelectValue,
  } from "@/components/ui/select";
  ```

  Inside `ManageOrdersPage`, add these two lines after the existing state:

  ```ts
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  ```

  In the Dialog, find the status + total section (the `div` with `flex items-center justify-between`). Replace it with:

  ```tsx
  <div className="flex items-center justify-between">
  	<Select
  		value={viewingOrder.status}
  		disabled={updatingId === viewingOrder.id}
  		onValueChange={async (value) => {
  			setUpdatingId(viewingOrder.id);
  			try {
  				await updateOrderStatus({
  					data: {
  						orderId: viewingOrder.id,
  						status: value as "pending" | "paid" | "failed",
  					},
  				});
  				toast.success("Order status updated");
  				router.invalidate();
  				setViewingOrder(null);
  			} catch {
  				toast.error("Failed to update status");
  			}
  			setUpdatingId(null);
  		}}
  	>
  		<SelectTrigger className="w-30 h-8 text-xs">
  			<SelectValue />
  		</SelectTrigger>
  		<SelectContent>
  			<SelectItem value="pending">
  				<span className="text-yellow-600">Pending</span>
  			</SelectItem>
  			<SelectItem value="paid">
  				<span className="text-green-600">Paid</span>
  			</SelectItem>
  			<SelectItem value="failed">
  				<span className="text-red-600">Failed</span>
  			</SelectItem>
  		</SelectContent>
  	</Select>
  	<span className="text-lg font-bold">
  		${Number(viewingOrder.total).toFixed(2)}
  	</span>
  </div>
  ```

  After `updateOrderStatus` succeeds, `router.invalidate()` re-runs the loader so the table reflects the new status immediately — same pattern used in Phase 6 after creating a product. `setViewingOrder(null)` closes the Dialog.

---

<a id="phase-14"></a>

### Phase 14 — Order Confirmation Email with Resend

![phase14](./assets/phase_14_resend_email_flow.svg)

When `confirmOrder` verifies the payment with Stripe and updates the order to "paid", it also fires a confirmation email to the buyer using Resend. The email includes a summary with the products, quantities, prices, and total. The email module is fully generic — reusable across any store.

- [x] <a id="p14-s1"></a>**Step 1 — Create an API key in Resend** 🔑

  In your Resend dashboard, click **+ Create API Key**:
  - Name it `ecommerce` (or whatever you prefer)
  - Permission: **Full access**
  - Click **Create** and copy the token immediately (it's only shown once)

  Open your `.env` and add at the bottom:

  ```env
  RESEND_API_KEY=re_your_full_key_here
  ```

- [x] <a id="p14-s2"></a>**Step 2 — Install Resend** 📦

  ```bash
  npm install resend
  ```

  Resend's SDK is minimal — one function `resend.emails.send()` with full TypeScript support.

- [x] <a id="p14-s3"></a>**Step 3 — Create `src/lib/email.ts`** 📧

  This module is completely generic. Nothing is hardcoded to any specific store — it receives the store config as a parameter, so you can copy it to any project and just change the values when calling it:

  ```ts
  import { Resend } from "resend";

  const resend = new Resend(process.env.RESEND_API_KEY);

  // ─── Generic types ───────────────────────────────────────

  type OrderItem = {
    name: string;
    price: string;
    quantity: number;
    image: string;
  };

  type StoreConfig = {
    name: string;
    from: string;
    ordersUrl: string;
    colors?: {
      primary?: string;
      background?: string;
      text?: string;
      muted?: string;
      border?: string;
    };
  };

  type OrderEmailData = {
    to: string;
    customerName: string;
    orderId: string;
    total: string;
    items: OrderItem[];
  };

  // ─── Email builder ───────────────────────────────────────

  export async function sendOrderConfirmationEmail(
    store: StoreConfig,
    order: OrderEmailData,
  ) {
    const c = {
      primary: store.colors?.primary ?? "#0f172a",
      background: store.colors?.background ?? "#f8fafc",
      text: store.colors?.text ?? "#0f172a",
      muted: store.colors?.muted ?? "#64748b",
      border: store.colors?.border ?? "#e2e8f0",
    };

    const itemRows = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding:12px 8px;border-bottom:1px solid ${c.border};">
              <img src="${item.image}" alt="${item.name}" width="48" height="48" style="border-radius:8px;object-fit:cover;" />
            </td>
            <td style="padding:12px 8px;border-bottom:1px solid ${c.border};font-size:14px;color:${c.text};">
              ${item.name}
            </td>
            <td style="padding:12px 8px;border-bottom:1px solid ${c.border};font-size:14px;text-align:center;color:${c.text};">
              ${item.quantity}
            </td>
            <td style="padding:12px 8px;border-bottom:1px solid ${c.border};font-size:14px;text-align:right;color:${c.text};">
              $${(Number(item.price) * item.quantity).toFixed(2)}
            </td>
          </tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="text-align:center;padding:24px 0;border-bottom:2px solid ${c.border};">
          <h1 style="margin:0;font-size:24px;color:${c.text};">Order Confirmed! ✓</h1>
          <p style="margin:8px 0 0;font-size:13px;color:${c.muted};">${store.name}</p>
        </div>

        <div style="padding:24px 0;">
          <p style="font-size:16px;color:${c.text};">Hi ${order.customerName},</p>
          <p style="font-size:14px;color:${c.muted};">
            Thank you for your purchase. Here's a summary of your order.
          </p>
        </div>

        <div style="background:${c.background};border-radius:12px;padding:16px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:${c.muted};text-transform:uppercase;letter-spacing:0.05em;">Order ID</p>
          <p style="margin:0;font-size:14px;color:${c.text};font-family:monospace;">${order.orderId}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid ${c.border};">
              <th style="padding:8px;text-align:left;font-size:12px;color:${c.muted};text-transform:uppercase;"></th>
              <th style="padding:8px;text-align:left;font-size:12px;color:${c.muted};text-transform:uppercase;">Product</th>
              <th style="padding:8px;text-align:center;font-size:12px;color:${c.muted};text-transform:uppercase;">Qty</th>
              <th style="padding:8px;text-align:right;font-size:12px;color:${c.muted};text-transform:uppercase;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="text-align:right;padding:16px 8px;border-top:2px solid ${c.text};margin-top:8px;">
          <span style="font-size:16px;font-weight:700;color:${c.text};">Total: $${Number(order.total).toFixed(2)}</span>
        </div>

        <div style="text-align:center;padding:32px 0 16px;">
          <a href="${store.ordersUrl}" style="display:inline-block;background:${c.primary};color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
            View My Orders
          </a>
        </div>

        <div style="text-align:center;padding:16px 0;border-top:1px solid ${c.border};">
          <p style="font-size:12px;color:${c.muted};margin:0;">
            This email was sent by ${store.name}.
          </p>
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: store.from,
      to: order.to,
      subject: `Order Confirmed — ${order.orderId.slice(0, 8)}`,
      html,
    });

    if (error) {
      console.error(`[${store.name}] Failed to send confirmation email:`, error);
    }
  }
  ```

  `StoreConfig` is everything that changes between stores — name, sender address, orders URL, brand colors. `OrderEmailData` is always the same shape. When you build another store tomorrow, you just pass different config values.

  The `colors` object is optional — if you don't pass it, the email defaults to a clean slate/dark palette. Email clients (Gmail, Outlook, Apple Mail) don't support external CSS or classes, so everything must be inline `style=""` — ugly to write, but the only reliable way.

- [x] <a id="p14-s4"></a>**Step 4 — Wire into `confirmOrder` (`src/data/checkout.ts`)** ⚡

  Two changes:

  **1) Add the import at the top of the file** (next to the other imports):

  ```ts
  import { sendOrderConfirmationEmail } from "@/lib/email";
  ```

  **2) Inside `confirmOrder`**, add the email block right after `await db.delete(cartItems)` and before the closing `}` of the `if (order.status === "pending")` block:

  ```ts
  // 5. Send confirmation email (fire-and-forget)
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        sendOrderConfirmationEmail(
          {
            name: "TanStack Store",
            from: "TanStack Store <onboarding@resend.dev>",
            ordersUrl: `${process.env.BETTER_AUTH_URL}/orders`,
          },
          {
            to: session.user.email,
            customerName: session.user.name,
            orderId: order.id,
            total: order.total,
            items: items.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
          },
        );
  ```

  `sendOrderConfirmationEmail(...)` is called **without `await`** — intentional. The payment is already processed, the DB is updated, the cart is cleared. The email fires in the background (fire-and-forget). If it fails, `console.error` logs it but doesn't break the user's experience.

  When you verify your own domain in Resend, just change the `from` to something like `"TanStack Store <orders@yourdomain.com>"`.

  ***

  > **Important — Resend free plan limitation:** Without a verified domain, Resend only allows sending emails to the address you signed up with (your Resend account owner email). If your app user has a different email, the send will fail with a `403 validation_error`.
  >
  > To remove this limitation and send to any email, verify your own domain in the Resend dashboard → **Domains** → **Add Domain** → follow the DNS setup. Once verified, update the `from` field in `checkout.ts` to use your domain:
  >
  > ```ts
  > from: "TanStack Store <orders@yourdomain.com>",
  > ```

---

<a id="phase-15"></a>

### Phase 15 — User Profile & Avatar Upload 👤

![phase15](./assets/phase_15_user_profile_avatar_upload.svg)

- [x] <a id="p15-s1"></a>**Step 1 — Profile page layout with edit Dialog** 🖼️

  Replace the placeholder in `src/routes/profile.tsx` with the full profile page layout. The route is protected with `beforeLoad` (redirects to `/sign-in` if no session), displays the user's info in a Card, and has an "Edit" button that opens a Dialog. The Dialog handlers only `console.log` for now — they'll be connected in Step 2.

  ```tsx
  import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
  import imageCompression from "browser-image-compression";
  import { Calendar, Mail, Pencil, Shield, User } from "lucide-react";
  import { useState } from "react";
  import { Button } from "@/components/ui/button";
  import {
  	Card,
  	CardContent,
  	CardDescription,
  	CardHeader,
  	CardTitle,
  } from "@/components/ui/card";
  import {
  	Dialog,
  	DialogContent,
  	DialogDescription,
  	DialogFooter,
  	DialogHeader,
  	DialogTitle,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";

  export const Route = createFileRoute("/profile")({
  	beforeLoad: async ({ context }) => {
  		const session = context.session;
  		if (!session) throw redirect({ to: "/sign-in" });
  		return { user: session.user };
  	},
  	component: ProfilePage,
  });

  function ProfilePage() {
  	const { user } = Route.useRouteContext();
  	const router = useRouter();

  	// Edit dialog state
  	const [isEditOpen, setIsEditOpen] = useState(false);
  	const [editForm, setEditForm] = useState({
  		name: "",
  	});

  	// Image state
  	const [imagePreview, setImagePreview] = useState<string | null>(null);
  	const [compressedFile, setCompressedFile] = useState<File | null>(null);

  	// Loading state
  	const [isSaving, setIsSaving] = useState(false);

  	function openEditDialog() {
  		setEditForm({
  			name: user.name,
  		});
  		setImagePreview(null);
  		setCompressedFile(null);
  		setIsEditOpen(true);
  	}

  	async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
  		const file = e.target.files?.[0];
  		if (!file) return;

  		try {
  			const compressed = await imageCompression(file, {
  				maxSizeMB: 0.5,
  				maxWidthOrHeight: 800,
  				useWebWorker: true,
  			});
  			setCompressedFile(compressed);
  			setImagePreview(URL.createObjectURL(compressed));
  		} catch {
  			console.error("Error compressing image");
  		}
  	}

  	async function handleSave() {
  		// TODO: Step 2 — wire to updateProfile + uploadProfileImage server functions
  		console.log("Save profile:", {
  			name: editForm.name,
  			hasNewImage: !!compressedFile,
  		});
  		setIsEditOpen(false);
  	}

  	const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
  		year: "numeric",
  		month: "long",
  		day: "numeric",
  	});

  	return (
  		<div className="mx-auto max-w-2xl space-y-6 py-8">
  			{/* Page header */}
  			<div>
  				<h1 className="text-2xl font-semibold">Profile</h1>
  				<p className="text-sm text-slate-600 dark:text-slate-300">
  					Your account information.
  				</p>
  			</div>

  			{/* Profile card */}
  			<Card>
  				<CardHeader className="flex flex-row items-center justify-between">
  					<div className="space-y-1">
  						<CardTitle>Account Details</CardTitle>
  						<CardDescription>
  							View and manage your profile information.
  						</CardDescription>
  					</div>
  					<Button
  						variant="outline"
  						size="sm"
  						onClick={openEditDialog}
  						className="gap-2"
  					>
  						<Pencil size={14} />
  						Edit
  					</Button>
  				</CardHeader>

  				<CardContent className="space-y-6">
  					{/* Avatar + name section */}
  					<div className="flex items-center gap-4">
  						<div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
  							{user.image ? (
  								<img
  									src={user.image}
  									alt={user.name}
  									className="h-full w-full object-cover"
  								/>
  							) : (
  								<User size={28} className="text-slate-400" />
  							)}
  						</div>
  						<div>
  							<p className="text-lg font-semibold text-slate-900 dark:text-white">
  								{user.name}
  							</p>
  							<span
  								className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
  									user.role === "admin"
  										? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  										: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  								}`}
  							>
  								<Shield size={12} />
  								{user.role === "admin" ? "Admin" : "User"}
  							</span>
  						</div>
  					</div>

  					{/* Info rows */}
  					<div className="divide-y divide-slate-100 rounded-lg border dark:divide-slate-800 dark:border-slate-800">
  						<div className="flex items-center gap-3 px-4 py-3">
  							<Mail size={16} className="text-slate-400" />
  							<div>
  								<p className="text-xs text-slate-500">Email</p>
  								<p className="text-sm font-medium text-slate-900 dark:text-white">
  									{user.email}
  								</p>
  							</div>
  						</div>

  						<div className="flex items-center gap-3 px-4 py-3">
  							<Calendar size={16} className="text-slate-400" />
  							<div>
  								<p className="text-xs text-slate-500">Member since</p>
  								<p className="text-sm font-medium text-slate-900 dark:text-white">
  									{memberSince}
  								</p>
  							</div>
  						</div>

  						<div className="flex items-center gap-3 px-4 py-3">
  							<Shield size={16} className="text-slate-400" />
  							<div>
  								<p className="text-xs text-slate-500">Email verified</p>
  								<p className="text-sm font-medium text-slate-900 dark:text-white">
  									{user.emailVerified ? "Yes" : "No"}
  								</p>
  							</div>
  						</div>
  					</div>
  				</CardContent>
  			</Card>

  			{/* Edit Dialog */}
  			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
  				<DialogContent className="sm:max-w-md">
  					<DialogHeader>
  						<DialogTitle>Edit Profile</DialogTitle>
  						<DialogDescription>
  							Update your name and profile picture.
  						</DialogDescription>
  					</DialogHeader>

  					<div className="space-y-4 py-2">
  						{/* Name field */}
  						<div className="space-y-2">
  							<Label htmlFor="edit-name">Name</Label>
  							<Input
  								id="edit-name"
  								value={editForm.name}
  								onChange={(e) =>
  									setEditForm((prev) => ({
  										...prev,
  										name: e.target.value,
  									}))
  								}
  								placeholder="Your name"
  							/>
  						</div>

  						{/* Avatar upload field */}
  						<div className="space-y-2">
  							<Label>Profile Picture</Label>
  							<div className="flex items-center gap-4">
  								<div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
  									{imagePreview ? (
  										<img
  											src={imagePreview}
  											alt="Preview"
  											className="h-full w-full object-cover"
  										/>
  									) : user.image ? (
  										<img
  											src={user.image}
  											alt={user.name}
  											className="h-full w-full object-cover"
  										/>
  									) : (
  										<User size={32} className="text-slate-400" />
  									)}
  								</div>
  								<div className="flex flex-col gap-2">
  									{!imagePreview && (
  										<label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-muted">
  											Change image
  											<input
  												type="file"
  												accept="image/*"
  												onChange={handleImageSelect}
  												className="hidden"
  											/>
  										</label>
  									)}
  									{imagePreview && (
  										<Button
  											type="button"
  											variant="outline"
  											size="sm"
  											onClick={() => {
  												setImagePreview(null);
  												setCompressedFile(null);
  											}}
  										>
  											Undo change
  										</Button>
  									)}
  								</div>
  							</div>
  							<p className="text-xs text-muted-foreground">
  								{imagePreview
  									? "New image selected — will upload on save."
  									: "Leave unchanged to keep the current picture."}
  							</p>
  						</div>
  					</div>

  					<DialogFooter>
  						<Button
  							variant="outline"
  							onClick={() => setIsEditOpen(false)}
  							disabled={isSaving}
  						>
  							Cancel
  						</Button>
  						<Button onClick={handleSave} disabled={isSaving}>
  							{isSaving ? "Saving..." : "Save Changes"}
  						</Button>
  					</DialogFooter>
  				</DialogContent>
  			</Dialog>
  		</div>
  	);
  }
  ```

  The Card shows the user's avatar (fallback `User` icon if no image), name, role badge (amber = admin, blue = user), email, member-since date, and email verification status. The edit Dialog pre-fills the name and includes the same image compress → preview pattern from `manage-products.tsx`. `handleSave` only `console.log`s — Step 2 connects it to real server functions.

- [x] <a id="p15-s2"></a>**Step 2 — Server functions & wiring the edit Dialog** ⚡

  Created `src/data/user.ts` with two server functions: `uploadProfileImage` and `updateProfile`.

  Auth check inside the handler, base64 → Buffer → Supabase Storage for the image, Drizzle update for the name. Avatars are uploaded to the `avatars/` folder inside the existing `product-images` bucket.

  ```ts
  // src/data/user.ts
  import { createServerFn } from "@tanstack/react-start";
  import { eq } from "drizzle-orm";
  import { getSession } from "@/lib/auth.functions";

  export const uploadProfileImage = createServerFn({ method: "POST" })
  	.inputValidator((data: { fileBase64: string; fileName: string }) => data)
  	.handler(async ({ data }) => {
  		const session = await getSession();
  		if (!session) throw new Error("Unauthorized");

  		const { supabase } = await import("@/lib/supabase");

  		// Convert base64 → Buffer
  		const base64Data = data.fileBase64.split(",")[1] ?? data.fileBase64;
  		const buffer = Buffer.from(base64Data, "base64");

  		// Fix content type: jpg → jpeg
  		const ext = data.fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  		const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

  		// Unique name
  		const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  		const filePath = `avatars/${uniqueName}`;

  		// Upload to Supabase
  		const { error } = await supabase.storage
  			.from("product-images")
  			.upload(filePath, buffer, {
  				contentType: mimeType,
  				upsert: false,
  			});

  		if (error) {
  			console.error("Supabase upload error:", error);
  			throw new Error(`Upload failed: ${error.message}`);
  		}

  		// Get public URL
  		const { data: urlData } = supabase.storage
  			.from("product-images")
  			.getPublicUrl(filePath);

  		return { url: urlData.publicUrl };
  	});

  export const updateProfile = createServerFn({ method: "POST" })
  	.inputValidator(
  		(data: { name?: string; image?: string }) => data,
  	)
  	.handler(async ({ data }) => {
  		const session = await getSession();
  		if (!session) throw new Error("Unauthorized");

  		const { db } = await import("@/db");
  		const { user } = await import("@/db/schema");

  		const updateData: Record<string, unknown> = {};
  		if (data.name !== undefined) updateData.name = data.name;
  		if (data.image !== undefined) updateData.image = data.image;

  		const result = await db
  			.update(user)
  			.set(updateData)
  			.where(eq(user.id, session.user.id))
  			.returning();

  		const updated = result[0];
  		if (!updated) throw new Error("User not found");
  		return updated;
  	});
  ```

  | Function | What it does |
  | --- | --- |
  | `uploadProfileImage` | Compresses base64 → Buffer, uploads to `avatars/` in Supabase Storage, returns public URL |
  | `updateProfile` | Updates `name` and/or `image` on the `user` table — only touches the fields that were sent |

  Then wired `handleSave` in `src/routes/profile.tsx` to the real server functions and added toast notifications. Same flow as `manage-products.tsx`:

  ```ts
  import { toast } from "sonner";
  import { updateProfile, uploadProfileImage } from "@/data/user";

  async function handleSave() {
  	setIsSaving(true);

  	try {
  		let imageUrl: string | undefined;

  		// Upload image only if a new one was selected
  		if (compressedFile) {
  			const base64 = await new Promise<string>((resolve, reject) => {
  				const reader = new FileReader();
  				reader.onload = () => resolve(reader.result as string);
  				reader.onerror = reject;
  				reader.readAsDataURL(compressedFile);
  			});

  			const { url } = await uploadProfileImage({
  				data: {
  					fileBase64: base64,
  					fileName: compressedFile.name,
  				},
  			});
  			imageUrl = url;
  		}

  		await updateProfile({
  			data: {
  				name: editForm.name,
  				...(imageUrl ? { image: imageUrl } : {}),
  			},
  		});

  		await router.invalidate();
  		setIsEditOpen(false);
  		toast.success("Profile updated successfully.");
  	} catch {
  		toast.error("Failed to update profile. Please try again.");
  	} finally {
  		setIsSaving(false);
  	}
  }
  ```

  `router.invalidate()` re-runs `__root` `beforeLoad` which re-fetches the session — the Header dropdown and profile page both update with the new name/image immediately. If no new image was selected (`compressedFile` is `null`), the spread `...(imageUrl ? { image: imageUrl } : {})` omits the `image` field, and `updateProfile` leaves the current avatar untouched.

---

---

<a id="phase-16"></a>

### Phase 16 — Search, Filter & Sort

![phase16](./assets/phase16_architecture_updated.svg)

- [x] <a id="p16-s1"></a>**Step 1 — Create `src/components/DataToolbar.tsx`** 🔍

  A fully reusable toolbar component that owns zero state — it only renders UI and fires callbacks. Any page can use it by passing the right props.

  Two design decisions worth noting:

  The `filters` prop is a generic array — each entry is a dropdown with its own options, value, and `onChange`. Adding a new filter to any page never requires touching `DataToolbar` itself.

  The `__reset__` sentinel is the first `<SelectItem>` in every dropdown. When selected it maps to `""` in `onValueChange`, which clears that filter — letting shadcn's `<SelectValue>` show the placeholder naturally when the value is empty.

  The `dateRange` prop is optional — only `manage-orders` passes it. If not passed, the date inputs simply don't render. `products` and `manage-products` are completely unaffected.

  ```ts
  import { RotateCcw, Search, X } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import {
  	Select,
  	SelectContent,
  	SelectItem,
  	SelectTrigger,
  	SelectValue,
  } from "@/components/ui/select";

  export type FilterOption = {
  	label: string;
  	value: string;
  };

  export type DataToolbarProps = {
  	searchValue: string;
  	onSearchChange: (value: string) => void;
  	searchPlaceholder?: string;
  	filters?: {
  		label: string;
  		value: string;
  		placeholder: string;
  		options: FilterOption[];
  		onChange: (value: string) => void;
  		width?: string;
  	}[];
  	sortOptions?: FilterOption[];
  	sortValue: string;
  	onSortChange: (value: string) => void;
  	dateRange?: {
  		from: string;
  		to: string;
  		onFromChange: (value: string) => void;
  		onToChange: (value: string) => void;
  	};
  	isDirty: boolean;
  	onReset: () => void;
  	resultCount?: { filtered: number; total: number };
  };

  export function DataToolbar({
  	searchValue,
  	onSearchChange,
  	searchPlaceholder = "Search...",
  	filters = [],
  	sortOptions = [],
  	sortValue,
  	onSortChange,
  	isDirty,
  	onReset,
  	dateRange,
  	resultCount,
  }: DataToolbarProps) {
  	return (
  		<div className="flex flex-col gap-3 mt-4">
  			<div className="flex flex-wrap items-center gap-2">
  				{/* Search input */}
  				<div className="relative flex-1 min-w-50">
  					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
  					<Input
  						value={searchValue}
  						onChange={(e) => onSearchChange(e.target.value ?? "")}
  						placeholder={searchPlaceholder}
  						className="pl-9 pr-8"
  					/>
  					{searchValue && (
  						<button
  							type="button"
  							onClick={() => onSearchChange("")}
  							className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
  							aria-label="Clear search"
  						>
  							<X size={14} />
  						</button>
  					)}
  				</div>

  				{/* Dynamic filter dropdowns (inventory, status, badge…) */}
  				{filters.map((filter) => (
  					<Select
  						key={filter.placeholder}
  						value={filter.value}
  						onValueChange={(v) =>
  							filter.onChange(v === "__reset__" ? "" : (v ?? ""))
  						}
  					>
  						<SelectTrigger className={filter.width ?? "w-40"}>
  							<SelectValue placeholder={filter.placeholder} />
  						</SelectTrigger>
  						<SelectContent>
  							<SelectItem value="__reset__">{filter.placeholder}</SelectItem>
  							{filter.options.map((opt) => (
  								<SelectItem key={opt.value} value={opt.value}>
  									{opt.label}
  								</SelectItem>
  							))}
  						</SelectContent>
  					</Select>
  				))}

  				{/* Date range — only renders when dateRange prop is passed */}
  				{dateRange && (
  					<div className="flex items-center gap-2">
  						<Input
  							type="date"
  							value={dateRange.from}
  							onChange={(e) => dateRange.onFromChange(e.target.value ?? "")}
  							className="w-37.5 text-sm"
  						/>
  						<span className="text-xs text-slate-400">to</span>
  						<Input
  							type="date"
  							value={dateRange.to}
  							onChange={(e) => dateRange.onToChange(e.target.value ?? "")}
  							className="w-37.5 text-sm"
  						/>
  					</div>
  				)}

  				{/* Sort dropdown */}
  				{sortOptions.length > 0 && (
  					<Select
  						value={sortValue}
  						onValueChange={(v) =>
  							onSortChange(v === "__reset__" ? "" : (v ?? ""))
  						}
  					>
  						<SelectTrigger className="w-45">
  							<SelectValue placeholder="Sort by..." />
  						</SelectTrigger>
  						<SelectContent>
  							<SelectItem value="__reset__">Sort by...</SelectItem>
  							{sortOptions.map((opt) => (
  								<SelectItem key={opt.value} value={opt.value}>
  									{opt.label}
  								</SelectItem>
  							))}
  						</SelectContent>
  					</Select>
  				)}

  				{/* Reset button — only visible when any filter is active */}
  				{isDirty && (
  					<Button
  						variant="outline"
  						size="sm"
  						onClick={onReset}
  						className="gap-1.5 text-slate-500"
  					>
  						<RotateCcw size={13} />
  						Reset
  					</Button>
  				)}
  			</div>

  			{/* Result count — only shown when filters are active */}
  			{resultCount && isDirty && (
  				<p className="text-xs text-slate-400">
  					Showing{" "}
  					<span className="font-medium text-slate-600 dark:text-slate-300">
  						{resultCount.filtered}
  					</span>{" "}
  					of {resultCount.total} results
  				</p>
  			)}
  		</div>
  	);
  }
  ```

- [x] <a id="p16-s2"></a>**Step 2 — Create `src/hooks/useProductFilters.ts`** 🧩

  Encapsulates all filter and sort logic for product pages. Takes the raw `products` array, returns `filtered` (the processed array) and `toolbar` (the complete props object ready to spread into `<DataToolbar />`).

  Three things worth noting:

  `ProductSelect` is imported directly from the schema — the hook is fully typed against your real database shape, no manual type needed.

  The options arrays (`SORT_OPTIONS`, `INVENTORY_OPTIONS`, `BADGE_OPTIONS`) are defined outside the component so React doesn't recreate them on every render.

  The `toolbar` object is assembled inside the hook — the route just does `<DataToolbar {...toolbar} />` and nothing else. The route never touches a filter state directly.

  ```ts
  import { useMemo, useState } from "react";
  import type { DataToolbarProps } from "@/components/DataToolbar";
  import type { ProductSelect } from "@/db/schema";

  const SORT_OPTIONS = [
  	{ label: "Name A → Z", value: "name-asc" },
  	{ label: "Name Z → A", value: "name-desc" },
  	{ label: "Price low → high", value: "price-asc" },
  	{ label: "Price high → low", value: "price-desc" },
  	{ label: "Top rated", value: "rating-desc" },
  ];

  const INVENTORY_OPTIONS = [
  	{ label: "In stock", value: "in-stock" },
  	{ label: "Backorder", value: "backorder" },
  	{ label: "Preorder", value: "preorder" },
  ];

  const BADGE_OPTIONS = [
  	{ label: "New", value: "New" },
  	{ label: "Sale", value: "Sale" },
  	{ label: "Featured", value: "Featured" },
  	{ label: "Limited", value: "Limited" },
  ];

  type UseProductFiltersReturn = {
  	filtered: ProductSelect[];
  	toolbar: DataToolbarProps;
  };

  export function useProductFilters(
  	products: ProductSelect[],
  ): UseProductFiltersReturn {
  	const [search, setSearch] = useState("");
  	const [inventory, setInventory] = useState("");
  	const [badge, setBadge] = useState("");
  	const [sort, setSort] = useState("");

  	const isDirty = !!(search || inventory || badge || sort);

  	const filtered = useMemo(() => {
  		let result = [...products];

  		if (search) {
  			const q = search.toLowerCase();
  			result = result.filter((p) => p.name.toLowerCase().includes(q));
  		}
  		if (inventory) result = result.filter((p) => p.inventory === inventory);
  		if (badge) result = result.filter((p) => p.badge === badge);

  		if (sort === "name-asc") result.sort((a, b) => a.name.localeCompare(b.name));
  		if (sort === "name-desc") result.sort((a, b) => b.name.localeCompare(a.name));
  		if (sort === "price-asc") result.sort((a, b) => Number(a.price) - Number(b.price));
  		if (sort === "price-desc") result.sort((a, b) => Number(b.price) - Number(a.price));
  		if (sort === "rating-desc") result.sort((a, b) => Number(b.rating) - Number(a.rating));

  		return result;
  	}, [products, search, inventory, badge, sort]);

  	const toolbar: DataToolbarProps = {
  		searchValue: search,
  		onSearchChange: setSearch,
  		searchPlaceholder: "Search products by name...",
  		filters: [
  			{
  				label: "inventory",
  				value: inventory,
  				placeholder: "All inventory",
  				options: INVENTORY_OPTIONS,
  				onChange: setInventory,
  				width: "w-[150px]",
  			},
  			{
  				label: "badges",
  				value: badge,
  				placeholder: "All badges",
  				options: BADGE_OPTIONS,
  				onChange: setBadge,
  				width: "w-[140px]",
  			},
  		],
  		sortOptions: SORT_OPTIONS,
  		sortValue: sort,
  		onSortChange: setSort,
  		isDirty,
  		onReset: () => {
  			setSearch("");
  			setInventory("");
  			setBadge("");
  			setSort("");
  		},
  		resultCount: { filtered: filtered.length, total: products.length },
  	};

  	return { filtered, toolbar };
  }
  ```

- [x] <a id="p16-s3"></a>**Step 3 — Create `src/hooks/useOrderFilters.ts`** 🧩

  Same pattern as `useProductFilters` but shaped for order data. Before creating the hook, add one line to the bottom of `src/data/orders.ts`:

  ```ts
  export type OrderData = Awaited<ReturnType<typeof getAllOrders>>[number];
  ```

  `Awaited` unwraps the `Promise`, `ReturnType` extracts what `getAllOrders` returns, and `[number]` indexes into the array to get a single element's type. This way the type is always in sync with the server function — if the query projection changes, the type updates automatically.

  Three things specific to the hook itself:

  `OrderData` is not defined manually — the hook imports it from `@/data/orders`, keeping the type co-located with the data source instead of duplicating it.

  The date filter uses `getFullYear()`, `getMonth()`, `getDate()` instead of `toISOString()` — this reads the date in local timezone, preventing an off-by-one day bug that happens when the server is ahead of UTC.

  Date-based sort options (`date-desc`, `date-asc`) are removed from `SORT_OPTIONS` because `dateFrom`/`dateTo` already handles date filtering. Having both would be redundant.

  ```ts
  import { useMemo, useState } from "react";
  import type { DataToolbarProps } from "@/components/DataToolbar";
  import type { OrderData } from "@/data/orders";

  const SORT_OPTIONS = [
  	{ label: "Customer A → Z", value: "name-asc" },
  	{ label: "Customer Z → A", value: "name-desc" },
  	{ label: "Total high → low", value: "total-desc" },
  	{ label: "Total low → high", value: "total-asc" },
  ];

  const STATUS_OPTIONS = [
  	{ label: "Paid", value: "paid" },
  	{ label: "Pending", value: "pending" },
  	{ label: "Failed", value: "failed" },
  ];

  type UseOrderFiltersReturn = {
  	filtered: OrderData[];
  	toolbar: DataToolbarProps;
  };

  export function useOrderFilters(orders: OrderData[]): UseOrderFiltersReturn {
  	const [search, setSearch] = useState("");
  	const [status, setStatus] = useState("");
  	const [sort, setSort] = useState("");
  	const [dateFrom, setDateFrom] = useState("");
  	const [dateTo, setDateTo] = useState("");

  	const isDirty = !!(search || status || dateFrom || dateTo || sort);

  	const filtered = useMemo(() => {
  		let result = [...orders];

  		if (search) {
  			const q = search.toLowerCase();
  			result = result.filter(
  				(o) =>
  					o.user.name.toLowerCase().includes(q) ||
  					o.user.email.toLowerCase().includes(q),
  			);
  		}

  		if (status) result = result.filter((o) => o.status === status);

  		if (dateFrom) {
  			result = result.filter((o) => {
  				const d = new Date(o.createdAt);
  				const orderDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  				return orderDate >= dateFrom;
  			});
  		}

  		if (dateTo) {
  			result = result.filter((o) => {
  				const d = new Date(o.createdAt);
  				const orderDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  				return orderDate <= dateTo;
  			});
  		}

  		if (sort === "name-asc") result.sort((a, b) => a.user.name.localeCompare(b.user.name));
  		if (sort === "name-desc") result.sort((a, b) => b.user.name.localeCompare(a.user.name));
  		if (sort === "total-desc") result.sort((a, b) => Number(b.total) - Number(a.total));
  		if (sort === "total-asc") result.sort((a, b) => Number(a.total) - Number(b.total));

  		return result;
  	}, [orders, search, status, dateFrom, dateTo, sort]);

  	const toolbar: DataToolbarProps = {
  		searchValue: search,
  		onSearchChange: setSearch,
  		searchPlaceholder: "Search by customer or email...",
  		filters: [
  			{
  				label: "statuses",
  				value: status,
  				placeholder: "All statuses",
  				options: STATUS_OPTIONS,
  				onChange: setStatus,
  				width: "w-[150px]",
  			},
  		],
  		sortOptions: SORT_OPTIONS,
  		sortValue: sort,
  		onSortChange: setSort,
  		isDirty,
  		onReset: () => {
  			setSearch("");
  			setStatus("");
  			setDateFrom("");
  			setDateTo("");
  			setSort("");
  		},
  		dateRange: {
  			from: dateFrom,
  			to: dateTo,
  			onFromChange: setDateFrom,
  			onToChange: setDateTo,
  		},
  		resultCount: { filtered: filtered.length, total: orders.length },
  	};

  	return { filtered, toolbar };
  }
  ```

- [x] <a id="p16-s4"></a>**Step 4 — Wire into `/products` (`src/routes/products/index.tsx`)** 🔌

  Three additions to the existing file — nothing removed, nothing restructured.

  Add two imports at the top:

  ```ts
  import { DataToolbar } from "@/components/DataToolbar";
  import { useProductFilters } from "@/hooks/useProductFilters";
  ```

  Add the hook inside `RouteComponent`, right after `useQuery`:

  ```ts
  const { filtered, toolbar } = useProductFilters(data);
  ```

  Replace `data?.map(...)` with `filtered.map(...)` in the grid section and add the empty state fallback:

  ```tsx
  <section className="max-w-6xl mx-auto">
  	{filtered.length > 0 ? (
  		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  			{filtered.map((product) => (
  				<ProductCard key={product.id} product={product} />
  			))}
  		</div>
  	) : (
  		<p className="text-center text-sm text-slate-500 py-16">
  			No products match your filters.
  		</p>
  	)}
  </section>
  ```

  Add `<DataToolbar>` inside the Card, right after `<CardDescription>`:

  ```tsx
  <CardDescription className="text-sm text-slate-600">
  	Browse a minimal, production-flavoured catalog with TanStack
  	Start server functions and typed routes.
  </CardDescription>
  <DataToolbar {...toolbar} />
  ```

- [x] <a id="p16-s5"></a>**Step 5 — Wire into `manage-products` (`src/routes/products/manage-products.tsx`)** 🔌

  Four additions to the existing file — nothing removed, nothing restructured.

  Add two imports at the top:

  ```ts
  import { DataToolbar } from "@/components/DataToolbar";
  import { useProductFilters } from "@/hooks/useProductFilters";
  ```

  Add the hook inside `ManageProductsPage`, right after `const products = Route.useLoaderData()`:

  ```ts
  const { filtered, toolbar } = useProductFilters(products);
  ```

  Change `data: products` to `data: filtered` in `useReactTable`:

  ```ts
  const table = useReactTable({
  	data: filtered, // ← was: products
  	columns,
  	getCoreRowModel: getCoreRowModel(),
  });
  ```

  Add `<DataToolbar>` inside the first `<CardHeader>`, right after `<CardDescription>`:

  ```tsx
  <Card>
  	<CardHeader>
  		<CardTitle className="text-lg">Manage Products</CardTitle>
  		<CardDescription>
  			Edit or remove products from the catalog.
  		</CardDescription>
  		<DataToolbar {...toolbar} />
  	</CardHeader>
  </Card>
  ```

- [x] <a id="p16-s6"></a>**Step 6 — Wire into `manage-orders` (`src/routes/orders/manage-orders.tsx`)** 🔌

  Four additions to the existing file — nothing removed, nothing restructured. `OrderData` is imported from `@/data/orders`, where it's inferred directly from `getAllOrders`'s return type — no manual type definition needed in the route.

  Add three imports at the top:

  ```ts
  import { DataToolbar } from "@/components/DataToolbar";
  import { type OrderData } from "@/data/orders";
  import { useOrderFilters } from "@/hooks/useOrderFilters";
  ```

  Add the hook inside `ManageOrdersPage`, right after `const orders = Route.useLoaderData()`, and remove the inline `type OrderData` line:

  ```ts
  const { filtered, toolbar } = useOrderFilters(orders);
  // remove: type OrderData = (typeof orders)[number]
  ```

  Change `data: orders` to `data: filtered` in `useReactTable`:

  ```ts
  const table = useReactTable({
  	data: filtered, // ← was: orders
  	columns,
  	getCoreRowModel: getCoreRowModel(),
  });
  ```

  Add `<DataToolbar>` inside the first `<CardHeader>`, right after `<CardDescription>`:

  ```tsx
  <Card>
  	<CardHeader>
  		<CardTitle className="text-lg">Manage Orders</CardTitle>
  		<CardDescription>
  			View all customer orders and their details.
  		</CardDescription>
  		<DataToolbar {...toolbar} />
  	</CardHeader>
  </Card>
  ```

---

<a id="p16-implementation"></a>**How to implement DataToolbar on any page**

![DataToolbar](./assets/datatoolbar_implementation_guide.svg)

To implement `DataToolbar` on any new page, you only do three things:

**Step 1 — Write a hook (`useXFilters.ts`).** This is the only file where you think about filters. Add a `useState` per filter axis, a `useMemo` that filters and sorts the array, and a `toolbar` object that wires every state to its setter. Return `{ filtered, toolbar }`.

**Step 2 — Wire it in the route.** Call `const { filtered, toolbar } = useXFilters(data)` right after you get the data. Then pass `filtered` to your grid or table instead of the raw array.

**Step 3 — Drop the component.** Place `<DataToolbar {...toolbar} />` wherever you want the toolbar to appear in the UI. The spread operator handles everything — no individual props to wire manually.

`DataToolbar` itself never changes. The only work per new page is writing the hook.

---

<a id="phase-17"></a>

### Phase 17 — Deploy to Railway 🚂

![phase17](./assets/phase17_railway_deploy.svg)

> **Before deploying** — sync your lockfile to avoid `npm ci` failures on Railway:
> ```powershell
> Remove-Item -Recurse -Force node_modules
> Remove-Item package-lock.json
> npm install
> ```
> This regenerates a clean `package-lock.json` that matches your current `package.json` exactly. Skipping this step is the most common cause of broken Railway builds.

- [x] <a id="p17-s1"></a>**Step 1 — Install the Railway preset package** 📦

  ```bash
  npm install -D @tanstack/react-start-config
  ```

  If you're already on the latest TanStack Start, also update:

  ```bash
  npm install @tanstack/react-start@latest
  ```

- [x] <a id="p17-s2"></a>**Step 2 — Create `tanstack.config.ts`** ⚙️

  Create this file at the project root to tell TanStack Start to build for the Railway preset:

  ```ts
  import { defineConfig } from "@tanstack/react-start/config";

  export default defineConfig({
    server: {
      preset: "railway",
    },
  });
  ```

  The `railway` preset configures Nitro's output format to match what Railway expects — a plain Node.js server entrypoint at `.output/server/index.mjs`.

- [x] <a id="p17-s3"></a>**Step 3 — Configure `nixpacks.toml`** 🔧

  Railway uses [Nixpacks](https://nixpacks.com) to build Node.js projects. By default, it detects a `package-lock.json` and runs `npm ci` — which fails if the lockfile is out of sync. Override the install phase explicitly to use `npm install` instead:

  ```toml
  [phases.setup]
  nixPkgs = ["nodejs_22"]

  [phases.install]
  cmds = ["npm install"]

  [phases.build]
  cmds = ["npm run build"]

  [start]
  cmd = "npm run start"
  ```

  > **Why `[phases.install]` matters:** Railway's build pipeline has a separate install phase that runs before build. Without overriding it, Nixpacks defaults to `npm ci` — which is strict and will refuse to install if any package version in `package.json` doesn't match the lockfile exactly. Defining `[phases.install]` replaces that default.

- [x] <a id="p17-s4"></a>**Step 4 — Push to GitHub and create the Railway project** 🚀

  Commit all changes and push to GitHub:

  ```bash
  git add .
  git commit -m "chore: configure Railway deployment"
  git push
  ```

  Then in [Railway](https://railway.app):
  1. Click **New Project → Deploy from GitHub repo**
  2. Select your repository
  3. Railway detects `nixpacks.toml` and starts the first build automatically

- [x] <a id="p17-s5"></a>**Step 5 — Add environment variables on Railway** 🔐

  In your Railway project, go to **Variables** and add all the required environment variables. Use the same keys as your local `.env`:

  ```env
  DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
  BETTER_AUTH_SECRET=<your-secret>
  BETTER_AUTH_URL=http://localhost:3000   

  SUPABASE_URL=https://<project-ref>.supabase.co
  SUPABASE_ANON_KEY=<your-anon-key>
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

  STRIPE_SECRET_KEY=<your-stripe-secret-key>
  RESEND_API_KEY=<your-resend-api-key>
  ```

  > Set `BETTER_AUTH_URL` to `http://localhost:3000` for now — it gets updated once you have your Railway domain in Step 7.

- [x] <a id="p17-s6"></a>**Step 6 — Set the production domain** 🌐

  Once the deploy succeeds, go to your service → **Settings → Networking → Generate Domain**. Railway provides a domain like:

  ```
  https://your-app-production.up.railway.app
  ```

  Copy this URL — you'll need it in the next step.

- [x] <a id="p17-s7"></a>**Step 7 — Update `BETTER_AUTH_URL` and add `VITE_BETTER_AUTH_URL`** 🔑

  Better Auth uses `BETTER_AUTH_URL` server-side to resolve redirects and cookie domains. It must match the actual deployment URL, not `localhost`.

  Back in Railway **Variables**, update the existing variable and add a new one:

  ```env
  BETTER_AUTH_URL=https://your-app-production.up.railway.app
  VITE_BETTER_AUTH_URL=https://your-app-production.up.railway.app
  ```

  `VITE_BETTER_AUTH_URL` is the client-side equivalent — Vite only exposes env vars prefixed with `VITE_` to the browser bundle. Without it, the auth client falls back to `localhost` and all sign-in requests go to the wrong host.

  Don't forget to add `VITE_BETTER_AUTH_URL` to your local `.env` as well:

  ```env
  VITE_BETTER_AUTH_URL=http://localhost:3000
  ```

- [x] <a id="p17-s8"></a>**Step 8 — Update `src/lib/auth-client.ts`** 🔧

  Update the auth client to read `VITE_BETTER_AUTH_URL` so it works correctly in both environments:

  ```ts
  import { createAuthClient } from "better-auth/react";

  const baseURL =
    import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000";

  export const authClient = createAuthClient({
    baseURL,
  });

  export const { signIn, signUp, useSession, signOut } = authClient;
  ```

  Without this change, the auth client hardcodes `localhost` as its base URL, which means all sign-in requests from the deployed app point to your local machine instead of the Railway server.

- [x] <a id="p17-s9"></a>**Step 9 — Push and redeploy** ✅

  Commit the `auth-client.ts` change and push:

  ```bash
  git add src/lib/auth-client.ts
  git commit -m "fix: use VITE_BETTER_AUTH_URL for auth client base URL"
  git push
  ```

  Railway detects the push and triggers a new build automatically. Once it completes, your app is fully deployed and sign-in works in production.

---

