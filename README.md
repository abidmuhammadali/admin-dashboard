# Admin Dashboard

A full-stack admin dashboard built with React, TypeScript, and Supabase. Admins can create organizations, invite members, and manage everything from one place.

## Live URLs

- **Production:** https://admin-dashboard-flame-seven-66.vercel.app
- **Preview:** https://admin-dashboard-git-development-abidmuhammadali0-6415s-projects.vercel.app

## Test Credentials

- **Email:** abidmuhammadali0@gmail.com
- **Password:** [your password here]

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth, Database, Edge Functions)
- TanStack React Query
- React Router v6
- React Hook Form + Zod

## Features

- Admin authentication (signup/login/logout)
- Create organizations with 3 types (School, Nonprofit, Business)
- Conditional fields based on organization type
- Invite members by email
- Members list with invited/active status
- Organization directory with type badges
- Supabase Edge Function for secure member invitations
- Row Level Security on all tables

## Branching Strategy

- `main` → Production (deployed to Production URL)
- `development` → Active development (deployed to Preview URL)
- Feature branches → branched off development, merged via Pull Request

## Setup Instructions

1. Clone the repository
   git clone https://github.com/abidmuhammadali/admin-dashboard.git

2. Install dependencies
   npm install

3. Copy environment variables
   cp .env.example .env.local

4. Fill in your Supabase credentials in .env.local

5. Run the development server
   npm run dev

## Database Setup

Run the SQL in supabase/migrations/schema.sql against your Supabase project.

## Shortcuts & Tradeoffs

- Used direct Supabase client for most operations, Edge Function only for invitations
- No email sending implemented — invitation records saved to database only
- No acceptance flow for invitations implemented

## What I Would Do With More Time

- Add invitation acceptance flow
- Add search and filter on organizations
- Add role based permissions within organizations
- Add end to end tests with Playwright
- Add dark mode toggle