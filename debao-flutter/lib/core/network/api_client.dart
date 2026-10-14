import 'package:dio/dio.dart';

import '../config/app_environment.dart';
import '../security/secure_token_store.dart';

const _publicAuthPaths = <String>{
  '/v1/auth/providers',
  '/v1/auth/send-code',
  '/v1/auth/login',
  '/v1/auth/wechat',
  '/v1/auth/wechat/bind-phone',
  '/v1/auth/one-click',
  '/v1/auth/refresh',
};

abstract interface class ApiTransport {
  Future<dynamic> getData(String path, {Map<String, dynamic>? query});
  Future<dynamic> postData(String path, {Object? data});
  Future<dynamic> patchData(String path, {Object? data});
  Future<dynamic> deleteData(String path, {Object? data});
}

/// Optional capability for requests that need per-request headers (for
/// example, idempotency keys on grading submissions). Keeping this separate
/// preserves compatibility with lightweight fakes used by page previews and
/// widget tests.
abstract interface class HeaderAwareApiTransport {
  Future<dynamic> postDataWithHeaders(String path,
      {Object? data, Map<String, String>? headers});
}

/// Optional capability for endpoints that use HTTP PUT. Keeping this
/// separate from [ApiTransport] preserves compatibility with lightweight
/// fake transports used by local previews and widget tests.
abstract interface class PutAwareApiTransport {
  Future<dynamic> putData(String path, {Object? data});
}

class ApiClient
    implements ApiTransport, HeaderAwareApiTransport, PutAwareApiTransport {
  ApiClient({Dio? dio, TokenStore? tokenStore})
      : _dio = dio ?? Dio(),
        _tokenStore = tokenStore ?? SecureTokenStore() {
    _dio.options = BaseOptions(
      baseUrl: AppEnvironment.current.apiBaseUrl,
      connectTimeout: const Duration(seconds: 1),
      receiveTimeout: const Duration(seconds: 2),
      headers: <String, String>{'Accept': 'application/json'},
    );
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        options.headers['X-Client-Platform'] = 'flutter';
        final publicAuthPath = _publicAuthPaths.contains(options.uri.path);
        if (options.extra['skipAuth'] != true && !publicAuthPath) {
          final token = await _tokenStore.readAccessToken();
          final accessToken = token ??
              (AppEnvironment.current == AppEnvironment.development
                  ? 'demo-token'
                  : null);
          if (accessToken != null && accessToken.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        final request = error.requestOptions;
        final publicAuthPath = _publicAuthPaths.contains(request.uri.path);
        if (error.response?.statusCode == 401 &&
            request.extra['retried'] != true &&
            request.extra['skipAuth'] != true &&
            !publicAuthPath &&
            !request.path.endsWith('/auth/refresh')) {
          final refreshed = await _refreshAccessToken();
          if (refreshed != null) {
            request.extra['retried'] = true;
            request.headers['Authorization'] = 'Bearer $refreshed';
            try {
              final response = await _dio.fetch<dynamic>(request);
              return handler.resolve(response);
            } on DioException catch (retryError) {
              return handler.next(retryError);
            }
          }
        }
        handler.next(error);
      },
    ));
  }

  final Dio _dio;
  final TokenStore _tokenStore;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    return _run(() => _dio.get<dynamic>(path, queryParameters: query));
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    return _run(() => _dio.post<dynamic>(path, data: data));
  }

  @override
  Future<dynamic> postDataWithHeaders(String path,
      {Object? data, Map<String, String>? headers}) async {
    return _run(() => _dio.post<dynamic>(
          path,
          data: data,
          options: Options(headers: headers),
        ));
  }

  @override
  Future<dynamic> putData(String path, {Object? data}) async {
    return _run(() => _dio.put<dynamic>(path, data: data));
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async {
    return _run(() => _dio.patch<dynamic>(path, data: data));
  }

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    return _run(() => _dio.delete<dynamic>(path, data: data));
  }

  Future<dynamic> _run(Future<Response<dynamic>> Function() request) async {
    try {
      return _unwrap(await request());
    } on DioException catch (error) {
      final body = error.response?.data;
      final errorBody = body is Map<String, dynamic> ? body['error'] : null;
      if (errorBody is Map<String, dynamic>) {
        throw ApiError(
          (errorBody['code'] as String?) ?? 'REQUEST_FAILED',
          (errorBody['message'] as String?) ?? 'Request failed',
          statusCode: error.response?.statusCode,
          requestId: errorBody['requestId'] as String?,
        );
      }
      final code = error.type == DioExceptionType.connectionError ||
              error.type == DioExceptionType.connectionTimeout
          ? 'OFFLINE'
          : error.type == DioExceptionType.receiveTimeout
              ? 'TIMEOUT'
              : 'REQUEST_FAILED';
      throw ApiError(code, error.message ?? 'Request failed',
          statusCode: error.response?.statusCode);
    }
  }

  dynamic _unwrap(Response<dynamic> response) {
    final body = response.data;
    if (body is Map<String, dynamic> && body.containsKey('data')) {
      return body['data'];
    }
    return body;
  }

  Future<String?> _refreshAccessToken() async {
    final refreshToken = await _tokenStore.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) return null;
    try {
      final response = await _dio.post<dynamic>(
        '/v1/auth/refresh',
        data: <String, dynamic>{'refreshToken': refreshToken},
        options: Options(extra: <String, dynamic>{'skipAuth': true}),
      );
      final payload = response.data is Map<String, dynamic>
          ? (response.data as Map<String, dynamic>)['data']
          : response.data;
      if (payload is! Map<String, dynamic>) return null;
      final accessToken = payload['accessToken'] as String?;
      final nextRefresh = payload['refreshToken'] as String?;
      if (accessToken == null || nextRefresh == null) return null;
      await _tokenStore.writeTokens(
          accessToken: accessToken, refreshToken: nextRefresh);
      return accessToken;
    } on DioException {
      await _tokenStore.clear();
      return null;
    }
  }
}

class ApiError implements Exception {
  const ApiError(this.code, this.message, {this.statusCode, this.requestId});

  final String code;
  final String message;
  final int? statusCode;
  final String? requestId;

  @override
  String toString() => 'ApiError($code): $message';
}
