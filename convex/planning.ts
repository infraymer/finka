import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { ConvexCtx } from './lib/db';
import { validateTransactionInvariants } from './lib/transactions';

function monthRange(month: string) {
  const start = `${month}-01`;
  const [yearStr, monthStr] = month.split('-');
  const year = Number(yearStr);
  const monthNumber = Number(monthStr);

  const next = new Date(Date.UTC(year, monthNumber, 1));
  const end = next.toISOString().slice(0, 10);
  return { start, end };
}

function shouldIncludeDate(cadence: 'weekly' | 'monthly', startDate: string, currentDate: string) {
  if (currentDate < startDate) {
    return false;
  }

  if (cadence === 'monthly') {
    return startDate.slice(8, 10) === currentDate.slice(8, 10);
  }

  const start = new Date(`${startDate}T00:00:00.000Z`).getTime();
  const current = new Date(`${currentDate}T00:00:00.000Z`).getTime();
  const diffDays = Math.floor((current - start) / (24 * 60 * 60 * 1000));
  return diffDays >= 0 && diffDays % 7 === 0;
}

export const generatePlannedForMonth = mutation({
  args: {
    organizationId: v.id('organizations'),
    month: v.string(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const now = Date.now();
    const { start, end } = monthRange(args.month);

    const rules = await ctx.db
      .query('recurringRules')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    let createdCount = 0;

    for (const rule of rules) {
      let cursor = start;
      while (cursor < end) {
        const isAfterRuleStart = cursor >= rule.startDate;
        const isBeforeRuleEnd = !rule.endDate || cursor <= rule.endDate;
        const cadenceMatches = shouldIncludeDate(rule.cadence, rule.startDate, cursor);

        if (isAfterRuleStart && isBeforeRuleEnd && cadenceMatches) {
          validateTransactionInvariants({
            type: rule.transactionType,
            amountKopecks: rule.amountKopecks,
            accountIdFrom: rule.accountIdFrom,
            accountIdTo: rule.accountIdTo,
            cashflowCategoryId: rule.cashflowCategoryId,
          });

          const existing = await ctx.db
            .query('plannedTransactions')
            .withIndex('by_organizationId_date', (q) => q.eq('organizationId', args.organizationId).eq('date', cursor))
            .first();

          const hasDuplicate =
            existing &&
            existing.recurringRuleId === rule._id &&
            existing.amountKopecks === rule.amountKopecks &&
            existing.type === rule.transactionType;

          if (!hasDuplicate) {
            await ctx.db.insert('plannedTransactions', {
              organizationId: args.organizationId,
              recurringRuleId: rule._id,
              type: rule.transactionType,
              amountKopecks: rule.amountKopecks,
              date: cursor,
              accountIdFrom: rule.accountIdFrom,
              accountIdTo: rule.accountIdTo,
              projectId: rule.projectId,
              counterpartyId: rule.counterpartyId,
              cashflowCategoryId: rule.cashflowCategoryId,
              status: 'planned',
              comment: rule.comment,
              createdAt: now,
              updatedAt: now,
            });
            createdCount += 1;
          }
        }

        const d = new Date(`${cursor}T00:00:00.000Z`);
        d.setUTCDate(d.getUTCDate() + 1);
        cursor = d.toISOString().slice(0, 10);
      }
    }

    return { createdCount };
  },
});

export const paymentCalendarByMonth = query({
  args: {
    organizationId: v.id('organizations'),
    month: v.string(),
  },
  handler: async (ctx: ConvexCtx, args) => {
    const { start, end } = monthRange(args.month);

    const planned = await ctx.db
      .query('plannedTransactions')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    const factual = await ctx.db
      .query('transactions')
      .withIndex('by_organizationId', (q) => q.eq('organizationId', args.organizationId))
      .collect();

    const inRangePlanned = planned.filter((item) => item.date >= start && item.date < end);
    const inRangeFactual = factual.filter((item) => item.date >= start && item.date < end);

    const summaryByDay = new Map<string, { inflowKopecks: number; outflowKopecks: number }>();

    const apply = (date: string, type: 'income' | 'expense' | 'transfer', amountKopecks: number) => {
      const current = summaryByDay.get(date) ?? { inflowKopecks: 0, outflowKopecks: 0 };
      if (type === 'income') {
        current.inflowKopecks += amountKopecks;
      }
      if (type === 'expense') {
        current.outflowKopecks += amountKopecks;
      }
      summaryByDay.set(date, current);
    };

    for (const item of inRangePlanned) {
      apply(item.date, item.type, item.amountKopecks);
    }

    for (const item of inRangeFactual) {
      apply(item.date, item.type, item.amountKopecks);
    }

    return Array.from(summaryByDay.entries())
      .map(([date, value]) => ({
        date,
        inflowKopecks: value.inflowKopecks,
        outflowKopecks: value.outflowKopecks,
        netKopecks: value.inflowKopecks - value.outflowKopecks,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});
