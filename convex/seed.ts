import { mutation } from './_generated/server';
import { v } from 'convex/values';
import type { ConvexCtx } from './lib/db';
import { validateTransactionInvariants } from './lib/transactions';

export const seedDemoOrganization = mutation({
  args: {
    organizationName: v.string(),
    adminEmail: v.string(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const now = Date.now();

    const organizationId = await ctx.db.insert('organizations', {
      name: args.organizationName,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('users', {
      organizationId,
      email: args.adminEmail,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    });

    const bankAccountId = await ctx.db.insert('accounts', {
      organizationId,
      name: 'Расчетный счет',
      kind: 'bank',
      openingBalanceKopecks: 500_000_00,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    const cashAccountId = await ctx.db.insert('accounts', {
      organizationId,
      name: 'Касса',
      kind: 'cash',
      openingBalanceKopecks: 100_000_00,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    const projectId = await ctx.db.insert('projects', {
      organizationId,
      name: 'Основной проект',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    const counterpartyId = await ctx.db.insert('counterparties', {
      organizationId,
      name: 'ООО Ромашка',
      type: 'client',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    const incomeCategoryId = await ctx.db.insert('cashflowCategories', {
      organizationId,
      name: 'Выручка',
      direction: 'income',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    const expenseCategoryId = await ctx.db.insert('cashflowCategories', {
      organizationId,
      name: 'Операционные расходы',
      direction: 'expense',
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    const seedTransactions = [
      {
        type: 'income' as const,
        amountKopecks: 250_000_00,
        date: '2026-01-10',
        accountIdTo: bankAccountId,
        cashflowCategoryId: incomeCategoryId,
      },
      {
        type: 'expense' as const,
        amountKopecks: 70_000_00,
        date: '2026-01-12',
        accountIdFrom: bankAccountId,
        cashflowCategoryId: expenseCategoryId,
      },
      {
        type: 'transfer' as const,
        amountKopecks: 10_000_00,
        date: '2026-01-13',
        accountIdFrom: bankAccountId,
        accountIdTo: cashAccountId,
      },
    ];

    for (const tx of seedTransactions) {
      validateTransactionInvariants({
        type: tx.type,
        amountKopecks: tx.amountKopecks,
        accountIdFrom: tx.accountIdFrom,
        accountIdTo: tx.accountIdTo,
        cashflowCategoryId: tx.cashflowCategoryId,
      });

      await ctx.db.insert('transactions', {
        organizationId,
        type: tx.type,
        amountKopecks: tx.amountKopecks,
        date: tx.date,
        accountIdFrom: tx.accountIdFrom,
        accountIdTo: tx.accountIdTo,
        projectId,
        counterpartyId,
        cashflowCategoryId: tx.cashflowCategoryId,
        isPlanned: false,
        status: 'posted',
        comment: 'Seed transaction',
        createdAt: now,
        updatedAt: now,
      });
    }

    return { organizationId };
  },
});
