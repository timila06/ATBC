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
- `sponsors.html` - Sponsor pathways
- `board-members.html` - President and board member information
- `activity.html` - Activity slider, archive, and Admin update controls
- `login.html` - Email/password login
- `president.html` - President statement editor
- `dashboard.html` - Role-based dashboard
- `contact.html` - Contact information and enquiry form

## Access Model

- Admin: account oversight, activity updates, activity deletion, and promotion approval
- President: president statement management
- Silver member: business promotion access with three updates per month
- Gold member: business promotion access with one update per week
- Platinum member: business promotion access with two updates per week

## Backend Preparation

Supabase is prepared as the authentication and database layer. Add the project URL and anon key in `supabase-config.js`, then apply `supabase-schema.sql` in the Supabase SQL editor.

Vercel deployment files are included through `package.json` and `vercel.json`.

## Assets

Core images live in `assets/`, including the ATBC banner logo, president photo, and Australia/Thailand imagery.
