
# 🛒 Products Dashboard (Frontend Challenge)

A small React + TypeScript app built with **Vite** and **Material UI (MUI)**.  
It lists products from the DummyJSON API, allows search, filtering, pagination, creation, and editing —  
all with URL-synced filters and local overrides to simulate persistence.

---

## 🚀 How to Run

### 1. Install dependencies

````console

npm install

````

### 2. Start the dev server

````console

npm run dev

````
Runs on http://localhost:5173 by default.

### 3. Project Structure

src/
- api/                # API helpers for DummyJSON (fetch, create, update, etc.)
- components/         # Reusable UI pieces (ProductCard)
- pages/              # Main pages (List, Detail, Edit, New)
- state/              # Local context for overrides (temporary persistence)
- theme/              # Theme + color mode context (light/dark)
- App.tsx             # Main layout + routes
- main.tsx            # Entry point
- types/              # Shared TypeScript types

### 4. Design Decisions

React Router v6
Handles all navigation, search params, and preserves filters via search.

Overrides Context
Keeps locally created or edited products in memory so changes persist across navigation.
This is required because the DummyJSON API does not save mutations.

URL-Synced Filters
Keeps search, category, page, and per-page limit in the query string —
so refreshing or sharing the link preserves the same view.

5-Column Grid
Uses columns={{ xs:4, sm:8, md:12, lg:20 }} to show exactly 5 cards per row on large screens.

Light/Dark Theme Toggle
Implemented with MUI’s ColorModeContext for a clean switch between modes.

### Trade-offs & Future Improvements

| Area                 | Current Approach               | Possible Improvement                                |
| -------------------- | ------------------------------ | --------------------------------------------------- |
| **Testing**          | Manual testing in browser.     | Add Jest + React Testing Library.                   |
| **Form Validation**  | Simple inline checks.          | Add Formik or React Hook Form.                      |
| **Accessibility**    | MUI defaults.                  | Add more alt text, roles, and focus outlines.       |

