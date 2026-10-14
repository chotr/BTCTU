export type ApiEnvelope<TData> = {
  data: TData;
  meta?: Record<string, unknown>;
};
