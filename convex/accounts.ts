import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { ConvexCtx } from './lib/db';

export const listByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx: ConvexCtx, args) => {
    return await ctx.db
      .query('accounts')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.string(),
    kind: v.union(v.literal('bank'), v.literal('cash')),
    openingBalanceKopecks: v.number(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    if (args.openingBalanceKopecks < 0) {
      throw new Error('openingBalanceKopecks must be >= 0');
    }

    return await ctx.db.insert('accounts', {
      ...args,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const archive = mutation({
  args: {
    accountId: v.id('accounts'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account || account.organizationId !== args.organizationId) {
      throw new Error('account not found');
    }

    await ctx.db.patch(args.accountId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});
