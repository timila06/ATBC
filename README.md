# Australia Thailand Business Council Website

Official website implementation for the Australia Thailand Business Council (ATBC).

## Overview

The site presents ATBC's bilateral business network, council role, president statement, membership options, sponsorship pathways, board members, strategic partners, activity updates, and contact channels.

## Pages

- `index.html` - Homepage
- `about.html` - About, history, and strategic partners
- `mission.html` - Mission, vision, and detailed council delivery model
- `memberships.html` - Individual and organisation membership details
- `sponsors.html` - Silver, Gold, Platinum, and custom sponsor pathways
- `board-members.html` - President and board member information
- `activity.html` - Activity slider, activity archive, and role-based update form
- `login.html` - Email/password login and visitor registration interface
- `dashboard.html` - Role-based dashboard for Admin, Website Owner, Activity Updater, President, and Visitor accounts
- `contact.html` - Contact information and enquiry form

## Role Access Model

The current static version includes a front-end login prototype with assigned role accounts, visitor registration, local account records, and local login history.

- Admin: content, activity, and user oversight
- Website Owner: website oversight and settings
- Activity Updater: activity updates
- President: president statement workflow
- Visitor: registered visitor account

For production authentication, connect these roles to a secure backend or identity provider.

## Login And User Tracking Options

- Supabase: recommended for this project. It provides authentication, user tables, row-level security, and a hosted Postgres database without building a full backend from scratch.
- Firebase: convenient for quick authentication and analytics, but database structure and admin reporting can become less relational for council-style records.
- Auth0 or Clerk: strong managed authentication, but they still need a separate database for activity posts, president statements, and registration tracking.
- Custom backend: most flexible, but slower and more expensive to build and maintain.

Recommended production setup: Supabase Auth plus Supabase Postgres tables for user profiles, login audit records, activity posts, president statements, sponsor enquiries, and membership enquiries.

## Assets

Core images live in `assets/`, including the ATBC banner logo and Australia/Thailand imagery.

## Deployment

The site is hosted as a static website through GitHub Pages.
