import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { ConvexCtx, Id } from './lib/db';
import { validateTransactionInvariants } from './lib/transactions';

async function assertEntityBelongsToOrganization(
  ctx: ConvexCtx,
  entityId: Id | undefined,
  organizationId: Id,
  label: string,
) {
  if (!entityId) {
    return;
  }

  const entity = await ctx.db.get(entityId);
  if (!entity || entity.organizationId !== organizationId) {
    throw new Error(`${label} not found in organization`);
  }
}

export const listByFilters = query({
  args: {
    organizationId: v.id('organizations'),
    type: v.optional(v.union(v.literal('income'), v.literal('expense'), v.literal('transfer'))),
    projectId: v.optional(v.id('projects')),
    counterpartyId: v.optional(v.id('counterparties')),
    cashflowCategoryId: v.optional(v.id('cashflowCategories')),
  },
  handler: async (ctx: ConvexCtx, args) => {
    if (args.type) {
      return await ctx.db
        .query('transactions')
        .withIndex('by_organizationId_type', (q) => q.eq('organizationId', args.organizationId).eq('type', args.type))
        .collect();
    }

    if (args.projectId) {
      return await ctx.db
        .query('transactions')
        .withIndex('by_organizationId_projectId', (q) => q.eq('organizationId', args.organizationId).eq('projectId', args.projectId))
        .collect();
    }

    if (args.counterpartyId) {
      return await ctx.db
        .query('transactions')
        .withIndex('by_organizationId_counterpartyId', (q) =>
          q.eq('organizationId', args.organizationId).eq('counterpartyId', args.counterpartyId),
        )
        .collect();
    }

    if (args.cashflowCategoryId) {
      return await ctx.db
        .query('transactions')
        .withIndex('by_organizationId_cashflowCategoryId', (q) =>
          q.eq('organizationId', args.organizationId).eq('cashflowCategoryId', args.cashflowCategoryId),
        )
        .collect();
    }

    return await ctx.db
      .query('transactions')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    organizationId: v.id('organizations'),
    type: v.union(v.literal('income'), v.literal('expense'), v.literal('transfer')),
    amountKopecks: v.number(),
    date: v.string(),
    accountIdFrom: v.optional(v.id('accounts')),
    accountIdTo: v.optional(v.id('accounts')),
    projectId: v.optional(v.id('projects')),
    counterpartyId: v.optional(v.id('counterparties')),
    cashflowCategoryId: v.optional(v.id('cashflowCategories')),
    isPlanned: v.boolean(),
    status: v.union(v.literal('planned'), v.literal('posted')),
    comment: v.optional(v.string()),
  },
  handler: async (ctx: ConvexCtx, args) => {
    validateTransactionInvariants({
      type: args.type,
      amountKopecks: args.amountKopecks,
      accountIdFrom: args.accountIdFrom,
      accountIdTo: args.accountIdTo,
      cashflowCategoryId: args.cashflowCategoryId,
    });

    await assertEntityBelongsToOrganization(ctx, args.accountIdFrom, args.organizationId, 'accountIdFrom');
    await assertEntityBelongsToOrganization(ctx, args.accountIdTo, args.organizationId, 'accountIdTo');
    await assertEntityBelongsToOrganization(ctx, args.projectId, args.organizationId, 'projectId');
    await assertEntityBelongsToOrganization(ctx, args.counterpartyId, args.organizationId, 'counterpartyId');
    await assertEntityBelongsToOrganization(ctx, args.cashflowCategoryId, args.organizationId, 'cashflowCategoryId');

    return await ctx.db.insert('transactions', {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
