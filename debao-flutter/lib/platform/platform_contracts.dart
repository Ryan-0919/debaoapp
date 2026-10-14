/// 三端原生能力的业务无关接口。真实实现放在平台插件中，页面只依赖这些 contract。

library;

enum PlatformOperationStatus { success, cancelled, unavailable, failed, mocked }

class PlatformOperation<T> {
  const PlatformOperation({required this.status, this.data, this.message});

  final PlatformOperationStatus status;
  final T? data;
  final String? message;
}

abstract interface class AuthPlatform {
  Future<PlatformOperation<String>> signInWithWechat();

  Future<PlatformOperation<String>> oneTapPhoneSignIn();

  Future<PlatformOperation<void>> bindPhone(String ticket, String phone);
}

abstract interface class PaymentPlatform {
  Future<PlatformOperation<void>> pay(
      {required String orderId, required String channel});
}

abstract interface class MediaPlatform {
  Future<PlatformOperation<void>> prepare(String mediaId);

  Future<PlatformOperation<void>> download(String mediaId);
}

abstract interface class PushPlatform {
  Future<PlatformOperation<String>> requestPermission();

  Future<PlatformOperation<void>> registerDevice();
}

abstract interface class FilePlatform {
  Future<PlatformOperation<List<String>>> pickFiles(
      {required List<String> extensions});
}

abstract interface class LivePlatform {
  Future<PlatformOperation<void>> joinRoom(String roomId);

  Future<PlatformOperation<void>> leaveRoom(String roomId);
}
