import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'platform_contracts.dart';
import 'unavailable_platforms.dart';

final Provider<AuthPlatform> authPlatformProvider = Provider<AuthPlatform>(
  (_) => UnavailableAuthPlatform(),
);

final Provider<PaymentPlatform> paymentPlatformProvider =
    Provider<PaymentPlatform>(
  (_) => UnavailablePaymentPlatform(),
);

final Provider<MediaPlatform> mediaPlatformProvider = Provider<MediaPlatform>(
  (_) => UnavailableMediaPlatform(),
);

final Provider<PushPlatform> pushPlatformProvider = Provider<PushPlatform>(
  (_) => UnavailablePushPlatform(),
);

final Provider<FilePlatform> filePlatformProvider = Provider<FilePlatform>(
  (_) => UnavailableFilePlatform(),
);

final Provider<LivePlatform> livePlatformProvider = Provider<LivePlatform>(
  (_) => UnavailableLivePlatform(),
);
