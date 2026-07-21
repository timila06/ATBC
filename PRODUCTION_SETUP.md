# ATBC Production Setup

## Supabase

1. Create a Supabase project.
2. Open the SQL editor and run `supabase-schema.sql`.
3. Copy the project URL and anon public key.
4. Put those values into `supabase-config.js` for GitHub Pages, or use Vercel environment variables if the app is moved to an environment-injected setup.
5. Create real Admin and President users through Supabase Auth.
6. In the `profiles` table, set their roles manually:
   - `admin`
   - `president`

## Vercel

1. Import `https://github.com/timila06/ATBC` into your Vercel account.
2. Use `npm run build` as the build command.
3. Use `dist` as the output directory.
4. Add environment variables if you move config away from `supabase-config.js`.
5. Add the production domain once the client approves the site.

## Payments

The current code supports membership application data, but a real provider must still be connected. Recommended options in Thailand:

- Omise for Thai cards and local payment methods.
- Stripe if the business can operate it in the relevant jurisdiction.
- Manual invoice/bank transfer for the first launch.

Production payment flow should:

1. Create a pending payment row in `membership_payments`.
2. Send the user to the provider checkout or invoice process.
3. Confirm payment through a webhook or Admin verification.
4. Update `profiles.role`, `profiles.member_tier`, `profiles.membership_status`, and `profiles.paid_at`.

## Email Notifications

The database includes `notification_queue`, but an email provider must still be connected. Recommended options:

- Resend
- SendGrid
- Mailgun
- Supabase Edge Function + provider API

Email triggers should run when:

- A new activity is posted.
- A new event is posted.
- A promotion is approved.

## Security Checklist

- Remove local fallback credentials before final production launch.
- Do not store admin passwords in frontend code.
- Use Supabase Auth for all roles.
- Assign Admin/President roles only from Supabase Dashboard or a secured server function.
- Test RLS policies before inviting real users.
- Back up the database before schema changes.
