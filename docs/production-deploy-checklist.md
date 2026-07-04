# Production Deploy Checklist

Use this checklist before a production release to `sarkariexams.me`. Production deploys are GitHub Actions driven; do not restart services manually from a local machine as the normal release path.

## Before Deploy

- Confirm the target commit is pushed to `main` and has a full 40-character SHA available.
- Confirm the GitHub `production` environment requires reviewer approval before secrets are available to the deploy job.
- Confirm the production droplet checkout is clean:
  - no tracked local edits except allowlisted deploy autoclean paths
  - no untracked files that interfere with Docker Compose
- Confirm the root server `.env` exists and is the source of truth for Docker Compose and deploy scripts.
- Confirm required production variables are populated with real values:
  - `JWT_SECRET`
  - `POSTGRES_PRISMA_URL` or `DATABASE_URL`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `FRONTEND_URL`
  - `CORS_ORIGINS`
  - `FRONTEND_REVALIDATE_TOKEN`
  - `METRICS_TOKEN`
- Keep `LEGACY_MONGO_REQUIRED=false` unless the release explicitly depends on legacy Mongo/Cosmos compatibility paths.

## Preflight

Run the manual GitHub Actions workflow `Deploy Preflight` before a major release:

- `target_environment`: `production`
- `target_sha`: full 40-character commit SHA
- `deploy_mode`: normally `image-pull`; use `fast` or `full` only when validating those fallback paths

The preflight should complete without service restarts and verify:

- SSH access to the droplet
- Docker and Docker Compose availability
- production checkout discovery and cleanliness
- root `.env` presence and required variable validation
- Docker Compose config rendering
- Upstash Redis REST `PING`
- PostgreSQL DNS/TCP reachability
- PostgreSQL Prisma connectivity

Do not proceed to a production deploy if preflight fails. Fix the root cause, rerun preflight, then deploy.

## Deploy

- Push to `main` and wait for `Main CI` to pass.
- Confirm `Deploy to Production` is triggered only by the successful `Main CI` `workflow_run` event from `main`.
- Approve the `production` environment gate only after reviewing the target SHA and release intent.
- Watch the deploy logs for:
  - target SHA checkout
  - image pull or configured deploy mode
  - Prisma migration deploy
  - backend, frontend, admin, nginx health
  - campaign worker stability check

## Post-Deploy Verification

Run:

```bash
PUBLIC_BASE_URL=https://sarkariexams.me bash scripts/verify-deployment.sh
```

Verify these routes manually or from release smoke tooling:

- `/`
- `/jobs`
- `/results`
- `/admin`
- `/api/livez`
- `/api/readyz`
- `/api/health`
- `/api/health/deep` with `METRICS_TOKEN`
- `/metrics` with `METRICS_TOKEN`
- frontend revalidation smoke through the internal frontend container

Also inspect:

- Docker Compose service status
- backend logs for startup validation, Prisma, Redis, and revalidation warnings
- campaign worker logs and restart count
- Sentry and Datadog, when configured

## Rollback

If deploy verification fails and the issue cannot be fixed immediately:

- Check `/tmp/sarkari-result-deploy.log` on the droplet.
- Check `.deploy-state/last-release.env` in the production checkout.
- Use the rollback hint printed by the deploy helper, or run:

```bash
bash scripts/rollback-last.sh --yes
```

After rollback:

- rerun `scripts/verify-deployment.sh`
- confirm the previous SHA is serving public and admin traffic
- document the failing SHA, failed stage, and observed symptoms before retrying
