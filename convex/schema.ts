import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const timestamp = v.number();

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }),

  users: defineTable({
    organizationId: v.id('organizations'),
    email: v.string(),
    role: v.union(v.literal('admin')),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index('by_organizationId', ['organizationId'])
    .index('by_email', ['email']),

  accounts: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    kind: v.union(v.literal('bank'), v.literal('cash')),
    openingBalanceKopecks: v.number(),
    isArchived: v.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }).index('by_organizationId', ['organizationId']),

  projects: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    isArchived: v.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }).index('by_organizationId', ['organizationId']),

  counterparties: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    type: v.union(v.literal('client'), v.literal('employee'), v.literal('contractor')),
    isArchived: v.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_type', ['organizationId', 'type']),

  cashflowCategories: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    direction: v.union(v.literal('income'), v.literal('expense')),
    isArchived: v.boolean(),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_direction', ['organizationId', 'direction']),

  recurringRules: defineTable({
    organizationId: v.id('organizations'),
    transactionType: v.union(v.literal('income'), v.literal('expense'), v.literal('transfer')),
    amountKopecks: v.number(),
    accountIdFrom: v.optional(v.id('accounts')),
    accountIdTo: v.optional(v.id('accounts')),
    projectId: v.optional(v.id('projects')),
    counterpartyId: v.optional(v.id('counterparties')),
    cashflowCategoryId: v.optional(v.id('cashflowCategories')),
    cadence: v.union(v.literal('weekly'), v.literal('monthly')),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    comment: v.optional(v.string()),
    createdAt: timestamp,
    updatedAt: timestamp,
  }).index('by_organizationId', ['organizationId']),

  plannedTransactions: defineTable({
    organizationId: v.id('organizations'),
    recurringRuleId: v.optional(v.id('recurringRules')),
    type: v.union(v.literal('income'), v.literal('expense'), v.literal('transfer')),
    amountKopecks: v.number(),
    date: v.string(),
    accountIdFrom: v.optional(v.id('accounts')),
    accountIdTo: v.optional(v.id('accounts')),
    projectId: v.optional(v.id('projects')),
    counterpartyId: v.optional(v.id('counterparties')),
    cashflowCategoryId: v.optional(v.id('cashflowCategories')),
    status: v.union(v.literal('planned'), v.literal('posted')),
    comment: v.optional(v.string()),
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_date', ['organizationId', 'date']),

  transactions: defineTable({
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
    createdAt: timestamp,
    updatedAt: timestamp,
  })
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_date', ['organizationId', 'date'])
    .index('by_organizationId_type', ['organizationId', 'type'])
    .index('by_organizationId_projectId', ['organizationId', 'projectId'])
    .index('by_organizationId_counterpartyId', ['organizationId', 'counterpartyId'])
    .index('by_organizationId_cashflowCategoryId', ['organizationId', 'cashflowCategoryId']),
});
