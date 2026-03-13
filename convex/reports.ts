import { v } from 'convex/values';
import { query } from './_generated/server';
import type { ConvexCtx } from './lib/db';

type TxType = 'income' | 'expense' | 'transfer';

type ReportRow = {
  id: string;
  amountKopecks: number;
  type: TxType;
  cashflowCategoryId?: string;
};

function monthRange(month: string) {
  const start = `${month}-01`;
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthNumber = Number(monthStr);
  const next = new Date(Date.UTC(year, monthNumber, 1));
  const end = next.toISOString().slice(0, 10);
  return { start, end };
}

function inRange(date: string, start: string, end: string) {
  return date >= start && date < end;
}

function sumByType(rows: ReportRow[]) {
  return rows.reduce(
    (acc, row) => {
      if (row.type === 'income') {
        acc.incomeKopecks += row.amountKopecks;
      }
      if (row.type === 'expense') {
        acc.expenseKopecks += row.amountKopecks;
      }
      return acc;
    },
    { incomeKopecks: 0, expenseKopecks: 0 },
  );
}

export const cashflowByMonth = query({
  args: {
    organizationId: v.id('organizations'),
    month: v.string(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const { start, end } = monthRange(args.month);

    const rows = await ctx.db
      .query('transactions')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    const inMonth = rows.filter((row) => inRange(row.date, start, end));

    const byCategory = new Map<string, { incomeKopecks: number; expenseKopecks: number }>();

    for (const row of inMonth) {
      if (!row.cashflowCategoryId || row.type === 'transfer') {
        continue;
      }
      const prev = byCategory.get(row.cashflowCategoryId) ?? { incomeKopecks: 0, expenseKopecks: 0 };
      if (row.type === 'income') {
        prev.incomeKopecks += row.amountKopecks;
      }
      if (row.type === 'expense') {
        prev.expenseKopecks += row.amountKopecks;
      }
      byCategory.set(row.cashflowCategoryId, prev);
    }

    const totals = sumByType(inMonth);

    return {
      month: args.month,
      incomeKopecks: totals.incomeKopecks,
      expenseKopecks: totals.expenseKopecks,
      netKopecks: totals.incomeKopecks - totals.expenseKopecks,
      byCategory: Array.from(byCategory.entries()).map(([cashflowCategoryId, value]) => ({
        cashflowCategoryId,
        incomeKopecks: value.incomeKopecks,
        expenseKopecks: value.expenseKopecks,
        netKopecks: value.incomeKopecks - value.expenseKopecks,
      })),
    };
  },
});

export const pnlByMonth = query({
  args: {
    organizationId: v.id('organizations'),
    month: v.string(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const { start, end } = monthRange(args.month);

    const rows = await ctx.db
      .query('transactions')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    const inMonth = rows.filter((row) => inRange(row.date, start, end) && row.type !== 'transfer');
    const totals = sumByType(inMonth);

    return {
      month: args.month,
      revenueKopecks: totals.incomeKopecks,
      expenseKopecks: totals.expenseKopecks,
      profitKopecks: totals.incomeKopecks - totals.expenseKopecks,
    };
  },
});

export const planFactByMonth = query({
  args: {
    organizationId: v.id('organizations'),
    month: v.string(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const { start, end } = monthRange(args.month);

    const plannedRows = await ctx.db
      .query('plannedTransactions')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    const factualRows = await ctx.db
      .query('transactions')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    const plannedInMonth = plannedRows.filter((row) => inRange(row.date, start, end));
    const factualInMonth = factualRows.filter((row) => inRange(row.date, start, end));

    const plannedTotals = sumByType(plannedInMonth);
    const factualTotals = sumByType(factualInMonth);

    return {
      month: args.month,
      planned: {
        incomeKopecks: plannedTotals.incomeKopecks,
        expenseKopecks: plannedTotals.expenseKopecks,
        netKopecks: plannedTotals.incomeKopecks - plannedTotals.expenseKopecks,
      },
      factual: {
        incomeKopecks: factualTotals.incomeKopecks,
        expenseKopecks: factualTotals.expenseKopecks,
        netKopecks: factualTotals.incomeKopecks - factualTotals.expenseKopecks,
      },
      delta: {
        incomeKopecks: factualTotals.incomeKopecks - plannedTotals.incomeKopecks,
        expenseKopecks: factualTotals.expenseKopecks - plannedTotals.expenseKopecks,
        netKopecks:
          factualTotals.incomeKopecks -
          factualTotals.expenseKopecks -
          (plannedTotals.incomeKopecks - plannedTotals.expenseKopecks),
      },
    };
  },
});
