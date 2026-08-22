-- Teacher subscription billing.
--
-- Until now a plan was a number typed into profiles.recap_monthly_limit by
-- hand, and "switch plan" was a mailto. These columns are what let Stripe do
-- it: the customer and subscription ids to talk to Stripe about, the plan id
-- to say what was bought, and the status so a failed payment is visible
-- without a round trip.
--
-- recap_monthly_limit stays the single thing the quota check reads. Stripe
-- decides what it should be; nothing about how allowances are counted changes.

alter table public.profiles
  add column if not exists stripe_customer_id     text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan_id                text,
  add column if not exists subscription_status    text;

comment on column public.profiles.plan_id is
  'lib/plans.ts id. Legacy ids (studio-legacy) mark grandfathered accounts.';
comment on column public.profiles.subscription_status is
  'Stripe subscription status: active, past_due, canceled, trialing, ...';

create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

-- Grandfathering. Migration 0023 put every account that existed at the time on
-- the 30-recap Studio plan, so a 30 that has no plan_id is exactly that: a
-- customer from before the three-tier pricing. They keep the allowance and the
-- price they signed up at, and Settings now names their plan instead of
-- calling it "Custom".
update public.profiles
   set plan_id = 'studio-legacy'
 where plan_id is null
   and recap_monthly_limit = 30;

update public.profiles
   set plan_id = 'starter-legacy'
 where plan_id is null
   and recap_monthly_limit = 15;

-- Webhook idempotency. Stripe retries, and delivering the same
-- checkout.session.completed twice must not sell the same top-up twice.
create table if not exists public.billing_events (
  event_id     text primary key,
  type         text not null,
  teacher_id   uuid references public.profiles (id) on delete set null,
  processed_at timestamptz not null default now()
);

alter table public.billing_events enable row level security;
-- No policies on purpose: only the service-role webhook touches this table,
-- and service role bypasses RLS. Enabling it keeps the anon key out.
