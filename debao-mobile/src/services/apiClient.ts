import {environment} from '@/config/environment';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
}

export class ApiClient {
  constructor(private readonly baseUrl = environment.apiBaseUrl) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (environment.useMocks) {
      throw new ApiError(
        '当前为 Mock 模式，真实网络请求已禁用。',
        0,
        'MOCK_MODE_NETWORK_DISABLED',
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      environment.requestTimeoutMs,
    );

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(options.token ? {Authorization: `Bearer ${options.token}`} : {}),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new ApiError(
          `请求失败（HTTP ${response.status}）`,
          response.status,
          'HTTP_ERROR',
        );
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('请求超时，请稍后重试。', 0, 'REQUEST_TIMEOUT');
      }
      throw new ApiError('网络连接失败，请检查网络。', 0, 'NETWORK_ERROR');
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const apiClient = new ApiClient();
