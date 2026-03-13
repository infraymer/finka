import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { ConvexCtx } from './lib/db';

export const listByOrganization = query({
  args: { organizationId: v.id('organizations') },
  handler: async (ctx: ConvexCtx, args) => {
    return await ctx.db
      .query('projects')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();
  },
});

export const create = mutation({
  args: {
    organizationId: v.id('organizations'),
    name: v.string(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    return await ctx.db.insert('projects', {
      ...args,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const archive = mutation({
  args: {
    projectId: v.id('projects'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project || project.organizationId !== args.organizationId) {
      throw new Error('project not found');
    }

    await ctx.db.patch(args.projectId, {
      isArchived: true,
      updatedAt: Date.now(),
    });
  },
});
