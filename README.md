# Australia Thailand Business Council Website

Official website implementation for the Australia Thailand Business Council (ATBC).

## Overview

The site presents ATBC's bilateral business network, council role, president statement, membership options, sponsorship pathways, promotion listings, board members, strategic partners, activity updates, and contact channels.

## Pages

- `index.html` - Homepage
- `about.html` - About, history, and strategic partners
- `mission.html` - Mission, vision, and detailed council delivery model
- `memberships.html` - Silver, Gold, and Platinum membership paths
- `member-register.html` - Member registration and payment flow
- `promotion.html` - Member promotion submission and Admin approval
- `events.html` - Main ATBC events
- `member-directory.html` - ATBC member directory
- `profile.html` - Registered user profile and notification preferences
- `sponsors.html` - Sponsor pathways
- `board-members.html` - President and board member information
- `activity.html` - Activity slider, archive, and Admin update controls
- `login.html` - Email/password login
- `president.html` - President statement editor
- `dashboard.html` - Member home and role-based dashboard
- `contact.html` - Contact information and enquiry form

## Access Model

- Registered user: profile, events, activity updates, members, and approved promotions
- Admin: account oversight, activity updates, activity deletion, and promotion approval
- President: president statement management
- Silver member: business promotion access with three updates per month
- Gold member: business promotion access with one update per week
- Platinum member: business promotion access with two updates per week

Individual Ordinary and Individual Affiliate memberships create registered member accounts without business promotion posting rights.

## Backend Preparation

Supabase is prepared as the authentication and database layer. Add the project URL and anon key in `supabase-config.js`, then apply `supabase-schema.sql` in the Supabase SQL editor. When Supabase credentials are present, the site uses Supabase Auth and database tables. Without credentials, it falls back to local browser storage for preview only.

Vercel deployment files are included through `package.json` and `vercel.json`.

See `PRODUCTION_SETUP.md` for the exact launch steps.

## Assets

Core images live in `assets/`, including the ATBC banner logo, president photo, and Australia/Thailand imagery.
