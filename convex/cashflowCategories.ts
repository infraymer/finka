import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { ConvexCtx } from './lib/db';

export const listByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx: ConvexCtx, args) => {
    return await ctx.db
      .query('cashflowCategories')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.string(),
    direction: v.union(v.literal('income'), v.literal('expense')),
  },
  handler: async (ctx: ConvexCtx, args) => {
    return await ctx.db.insert('cashflowCategories', {
      ...args,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const archive = mutation({
  args: {
    cashflowCategoryId: v.id('cashflowCategories'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const category = await ctx.db.get(args.cashflowCategoryId);
    if (!category || category.organizationId !== args.organizationId) {
      throw new Error('category not found');
    }

    await ctx.db.patch(args.cashflowCategoryId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});
