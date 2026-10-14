const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;

export const environment = {
  apiBaseUrl: runtimeEnv?.DEBAO_API_BASE_URL ?? 'http://10.0.2.2:4000/v1',
  requestTimeoutMs: Number(runtimeEnv?.DEBAO_REQUEST_TIMEOUT_MS ?? 12_000),
  // Real backend is the default; set DEBAO_USE_MOCKS=true only for isolated UI demos.
  useMocks: runtimeEnv?.DEBAO_USE_MOCKS === 'true',
  authProviderMode: runtimeEnv?.DEBAO_AUTH_PROVIDER_MODE ?? (__DEV__ ? 'local' : 'native'),
} as const;
