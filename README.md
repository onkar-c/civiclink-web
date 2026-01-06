# CivicLink Web

CivicLink is a web application for reporting, tracking, and managing city infrastructure issues.  
This repository contains the **frontend** built with Next.js, which talks with a separate NestJS + Prisma backend.

CivicLink provides role-based access for:

- **Citizens** – report issues and track their status
- **Admins** – monitor global issue trends and manage users
- **(Optional) Dispatchers** – operational views for triaging and updating issues

The goal is to resemble a real-world MVP rather than a simple CRUD demo.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **UI:** React, Tailwind CSS
- **State / Auth:** Custom `AuthContext` (JWT-based, token + user in context)
- **API Client:** Lightweight wrappers over `fetch` (`apiGet`, `apiPost`, `apiPatch`)
- **Build/Tooling:** Node.js, npm/pnpm, ESLint

---

## Features

- **Authentication**
  - Email + password login
  - Registration flow for new accounts (default citizen role)
  - Shared profile page (`/profile`) for updating display name

- **Citizen Dashboard**
  - `/citizen` shows only the logged-in citizen’s issues
  - Create and edit issues (title, description, priority, coordinates)
  - Edit and create flows use `replace` navigation to avoid cluttered history

- **Admin Dashboard**
  - `/admin` shows high-level stats for issues (counts by status and priority)
  - Table of recent issues with key fields and timestamps

- **User Management (Admin)**
  - `/admin/users` lists users with pagination
  - Change roles (Citizen, Dispatcher, Admin) via dropdown with optimistic updates

- **Session & Navigation**
  - Global header adapts based on auth state (login/register vs profile/logout)
  - Logout clears auth and uses `location.replace('/')` to reset the session cleanly

---

## Architecture

The frontend follows a **feature-first structure** on top of Next.js App Router:

- `app/` – routing, layouts, and page-level composition
  - `(dashboard)/citizen`, `(dashboard)/admin`, `(dashboard)/profile`, `register`, etc.
- `features/` – domain-specific logic and UI:
  - `auth/` – login, registration, auth context
  - `issues/` – issue types, API, and components (list, create, edit)
  - `users/` – user types, API, profile form, admin user management
- `lib/` – shared utilities such as API client helpers

Page components stay relatively thin and delegate most behavior to feature modules.

---

## Backend Requirements

This frontend expects a running CivicLink backend exposing REST endpoints roughly along these lines:

Backend stack:

- **Framework:** NestJS
- **ORM:** Prisma 7
- **Database:** PostgreSQL (or similar)
- **Auth:** JWT (Bearer token in `Authorization` header)

Backend repository: - [CivicLink Backend](https://github.com/onkar-c/civiclink-backend.git)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/onkar-c/civiclink-web.git
cd civiclink-web
```

### 2. npm install
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Run the development server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

### 4. Open
```bash
http://localhost:3001
```

##License

This project is licensed under the MIT License.  
You are free to use, modify, and distribute this software with appropriate attribution.



