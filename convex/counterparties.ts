import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { ConvexCtx } from './lib/db';

export const listByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx: ConvexCtx, args) => {
    return await ctx.db
      .query('counterparties')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.string(),
    type: v.union(v.literal('client'), v.literal('employee'), v.literal('contractor')),
  },
  handler: async (ctx: ConvexCtx, args) => {
    return await ctx.db.insert('counterparties', {
      ...args,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const archive = mutation({
  args: {
    counterpartyId: v.id('counterparties'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const counterparty = await ctx.db.get(args.counterpartyId);
    if (!counterparty || counterparty.organizationId !== args.organizationId) {
      throw new Error('counterparty not found');
    }

    await ctx.db.patch(args.counterpartyId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});
