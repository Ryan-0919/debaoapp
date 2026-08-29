const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;

export const environment = {
  apiBaseUrl: runtimeEnv?.DEBAO_API_BASE_URL ?? 'http://10.0.2.2:4000/v1',
  requestTimeoutMs: Number(runtimeEnv?.DEBAO_REQUEST_TIMEOUT_MS ?? 12_000),
  useMocks: runtimeEnv?.DEBAO_USE_MOCKS !== 'false',
} as const;
