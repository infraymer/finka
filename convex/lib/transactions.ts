export type TransactionType = 'income' | 'expense' | 'transfer';

export function validateTransactionInvariants(input: {
  type: TransactionType;
  amountKopecks: number;
  accountIdFrom?: string;
  accountIdTo?: string;
  cashflowCategoryId?: string;
}) {
  if (input.amountKopecks <= 0) {
    throw new Error('amountKopecks must be greater than 0');
  }

  if (input.type === 'income' && !input.accountIdTo) {
    throw new Error('income requires accountIdTo');
  }

  if (input.type === 'expense' && !input.accountIdFrom) {
    throw new Error('expense requires accountIdFrom');
  }

  if (input.type === 'transfer') {
    if (!input.accountIdFrom || !input.accountIdTo) {
      throw new Error('transfer requires accountIdFrom and accountIdTo');
    }

    if (input.accountIdFrom === input.accountIdTo) {
      throw new Error('transfer requires different accounts');
    }
  }

  if (input.type !== 'transfer' && !input.cashflowCategoryId) {
    throw new Error('income/expense requires cashflowCategoryId');
  }
}
