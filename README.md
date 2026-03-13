# Finka

Sprint 1 foundation + Sprint 2 CRUD + Sprint 3 planning + Sprint 4 reports backend for financial SaaS MVP.

## Stack
- React 18 + TypeScript (strict)
- Bun + Vite
- Convex (schema, queries, mutations, indexes)

## Quick start
1. Install dependencies:
   ```bash
   bun install
   ```
2. Copy environment:
   ```bash
   cp .env.example .env.local
   ```
3. Start Convex in one terminal:
   ```bash
   bun run convex:dev
   ```
4. Start frontend in another terminal:
   ```bash
   bun run dev
   ```
5. Seed demo organization:
   ```bash
   bun run seed
   ```

## Checks
```bash
bun run typecheck
bun run lint
```

## Implemented
- Base React app with Convex provider.
- Convex schema for MVP entities.
- Required transaction indexes for filters.
- Seed mutation and script for one demo organization.
- Sprint 2 backend CRUD modules:
  - `convex/accounts.ts`
  - `convex/projects.ts`
  - `convex/counterparties.ts`
  - `convex/cashflowCategories.ts`
  - `convex/transactions.ts`
- Sprint 3 planning module:
  - `convex/planning.ts` with `generatePlannedForMonth` and `paymentCalendarByMonth`.
- Sprint 4 reports module:
  - `convex/reports.ts` with `cashflowByMonth`, `pnlByMonth`, `planFactByMonth`.
- Shared transaction invariants in `convex/lib/transactions.ts`.

## Next step (Sprint 5)
- Build UI pages for reports and planning calendar using existing Convex queries.
- Add unit tests for transaction invariants and report aggregations.
- Replace local `_generated` stubs with real Convex codegen output in CI/dev flow.

