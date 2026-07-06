# Production Deployment Checklist

## Database Schema Status
✅ **Verified**: All database migrations are valid and in sync with Prisma schema

### Migrations Applied (in order):
1. `0001_auth_profiles.sql` - Authentication & user profiles
2. `0002_core_schema.sql` - Core tables (clients, projects, BOQ, quotations, etc.)
3. `0003_projects_module.sql` - Project address and progress columns
4. `0004_clients_module.sql` - Client module support
5. `0005_boq_module.sql` - BOQ hierarchy with sections/categories/items and workflow states
6. `0006_quotation_module.sql` - Quotation module with workflow and commercial fields
7. `0007_contracts_module.sql` - Contracts module with milestones and audit logging

### Schema Validation
- Prisma schema: **Valid** ✅
- Database sync: **In sync** ✅
- Enum types: **All defined correctly** ✅
  - boq_status: draft, finalized, superseded, submitted, approved, archived
  - quotation_status: draft, sent, approved, rejected, revised, viewed, expired
  - contract_status: draft, pending_approval, approved, signed, cancelled, completed

## For Production Deployment

### Before deployment:
1. Ensure Supabase DATABASE_URL and DIRECT_URL are set in environment
2. Run migrations if not already applied:
   ```bash
   cd packages/database
   npx prisma migrate deploy
   ```

### Build process:
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

### Verify after deployment:
4. Test database connectivity:
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

## Common Issues

**Error: "Invalid prisma.project.count()"**
- This typically means the Prisma client wasn't generated during build
- Solution: Run `npx prisma generate` in the build pipeline before deploying
- Ensure DATABASE_URL environment variable is set before any database operations

**Error: Migration already exists**
- The migrations are idempotent (using `if not exists` / `if not already exists`)
- Safe to re-apply without affecting existing data
