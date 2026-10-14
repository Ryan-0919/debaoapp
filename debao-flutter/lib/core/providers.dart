import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'network/api_client.dart';
import 'security/secure_token_store.dart';

final Provider<ApiClient> apiClientProvider = Provider<ApiClient>((ref) {
  // Keep the token store shared by authentication and the API interceptor.
  return ApiClient(tokenStore: ref.watch(secureTokenStoreProvider));
});

final Provider<SecureTokenStore> secureTokenStoreProvider =
    Provider<SecureTokenStore>(
  (ref) => SecureTokenStore(),
);
