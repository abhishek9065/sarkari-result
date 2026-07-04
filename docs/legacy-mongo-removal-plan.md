# Legacy Mongo/Cosmos Removal Plan

PostgreSQL is the primary runtime database for content, editorial, SEO, admin, user, notification, and analytics data. Mongo/Cosmos remains a transitional compatibility surface and migration source only.

## Current Runtime Position

- Intended production default: `LEGACY_MONGO_REQUIRED=false`.
- Current guarded route list: `legacyMongoBackedApiPrefixes = []` in `backend/src/services/legacyRuntime.ts`.
- Core API readiness depends on PostgreSQL, not Mongo/Cosmos.
- Mongo/Cosmos bridge startup is controlled by `LEGACY_MONGO_ENABLED` and configured only when `COSMOS_CONNECTION_STRING` or `MONGODB_URI` is present.

## Current Legacy Surfaces

Runtime and diagnostics:

- `backend/src/services/cosmosdb.ts`
- `backend/src/services/legacyRuntime.ts`
- `backend/src/services/health.ts`
- `backend/src/services/security-audit.ts`
- `backend/src/services/dualWriteReconciliation.ts`

Mongo-backed models still present:

- `backend/src/models/alertSubscriptions.mongo.ts`
- `backend/src/models/announcements.mongo.ts`
- `backend/src/models/auditLogs.mongo.ts`
- `backend/src/models/bookmarks.mongo.ts`
- `backend/src/models/contentPages.mongo.ts`
- `backend/src/models/contentTaxonomies.mongo.ts`
- `backend/src/models/postVersions.mongo.ts`
- `backend/src/models/posts.mongo.ts`
- `backend/src/models/users.mongo.ts`

Mongo/Cosmos scripts still present:

- migration scripts: `migrate-users-to-postgres.ts`, `migrate-content-to-postgres.ts`, `migrate-bookmarks-to-postgres.ts`
- audit/backfill scripts: `audit-content-migration.ts`, `backfill-posts.ts`
- old seed/send scripts: `seed-data.ts`, `seed-more-data.ts`, `seed-all-data.ts`, `send-digest.ts`

## Safe Operating Policy

- Keep `LEGACY_MONGO_REQUIRED=false` in production unless a release explicitly depends on a legacy compatibility path.
- Keep `LEGACY_MONGO_ENABLED=false` when Mongo/Cosmos is not needed.
- Do not add new product functionality that writes to Mongo/Cosmos.
- Do not add new guarded prefixes without documenting the owner, route, reason, and removal condition.
- Keep migration scripts available until PostgreSQL data parity has been verified and backups are retained.

## Monitoring Before Removal

Run production with `LEGACY_MONGO_REQUIRED=false` and monitor at least one full release cycle:

- `/api/readyz`
- `/api/health`
- `/api/health/deep`
- backend logs for `LEGACY_DB_UNAVAILABLE`, Mongo/Cosmos connection attempts, and startup warnings
- Sentry issues related to legacy services or missing collections
- Datadog service health, if configured
- admin workflows for posts, bookmarks, users, subscriptions, security audit history, and backups

Removal should not proceed while any production request path still requires Mongo/Cosmos for core behavior.

## Removal Sequence

1. Confirm `legacyMongoBackedApiPrefixes` remains empty in production diagnostics.
2. Confirm migration scripts are no longer required for rollback, audit, or data parity checks.
3. Replace or remove runtime imports of Mongo-backed models from schedulers, reminders, security audit history, backup metadata, and reconciliation jobs.
4. Remove unused Mongo model files and related tests in small batches.
5. Remove `cosmosdb.ts` only after no runtime code, tests, or scripts import it.
6. Remove Mongo/Cosmos env references from Docker Compose and docs only after the code no longer accepts those compatibility paths.
7. Remove `mongodb` and `mongodb-memory-server` dependencies after the final import is gone.

## Rollback Plan

If removal causes a production issue:

- restore the previous known-good commit using the normal deploy rollback helper
- set `LEGACY_MONGO_REQUIRED=false` unless the rollback commit explicitly needs the bridge
- restore Mongo/Cosmos env values only if the rollback commit requires them
- rerun `/api/readyz`, `/api/health/deep`, and admin smoke checks

Do not partially reintroduce Mongo/Cosmos files without also restoring the tests and env documentation that explain why they are required.
