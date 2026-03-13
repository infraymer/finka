type HandlerConfig<TArgs, TResult> = {
  args: TArgs;
  handler: (...args: unknown[]) => TResult | Promise<TResult>;
};

export function mutation<TArgs, TResult>(config: HandlerConfig<TArgs, TResult>) {
  return config;
}

export function query<TArgs, TResult>(config: HandlerConfig<TArgs, TResult>) {
  return config;
}
