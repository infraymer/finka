export type Id = string;

type IndexFilter = {
  eq: (field: string, value: unknown) => IndexFilter;
};

export type QueryBuilder<T> = {
  withIndex: (indexName: string, cb: (q: IndexFilter) => unknown) => QueryBuilder<T>;
  collect: () => Promise<T[]>;
  first: () => Promise<T | null>;
};

export type Db = {
  insert: (table: string, value: Record<string, unknown>) => Promise<Id>;
  get: (id: Id) => Promise<Record<string, unknown> | null>;
  patch: (id: Id, value: Record<string, unknown>) => Promise<void>;
  query: <T = Record<string, unknown>>(table: string) => QueryBuilder<T>;
};

export type ConvexCtx = { db: Db };
