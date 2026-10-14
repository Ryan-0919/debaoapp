import 'platform_contracts.dart';

/// 在真实平台 SDK 接入前使用的显式失败实现，禁止伪造生产成功。
class UnavailableAuthPlatform implements AuthPlatform {
  @override
  Future<PlatformOperation<String>> signInWithWechat() async =>
      const PlatformOperation<String>(
        status: PlatformOperationStatus.unavailable,
        message: '微信登录平台 SDK 尚未配置',
      );

  @override
  Future<PlatformOperation<String>> oneTapPhoneSignIn() async =>
      const PlatformOperation<String>(
        status: PlatformOperationStatus.unavailable,
        message: '手机号一键登录 SDK 尚未配置',
      );

  @override
  Future<PlatformOperation<void>> bindPhone(
          String ticket, String phone) async =>
      const PlatformOperation<void>(
        status: PlatformOperationStatus.unavailable,
        message: '手机号绑定 SDK 尚未配置',
      );
}

class UnavailablePaymentPlatform implements PaymentPlatform {
  @override
  Future<PlatformOperation<void>> pay(
          {required String orderId, required String channel}) async =>
      const PlatformOperation<void>(
        status: PlatformOperationStatus.unavailable,
        message: '支付平台 SDK 尚未配置',
      );
}

class UnavailableMediaPlatform implements MediaPlatform {
  @override
  Future<PlatformOperation<void>> prepare(String mediaId) async =>
      const PlatformOperation<void>(
        status: PlatformOperationStatus.unavailable,
        message: '媒体播放 SDK 尚未配置',
      );

  @override
  Future<PlatformOperation<void>> download(String mediaId) async =>
      const PlatformOperation<void>(
        status: PlatformOperationStatus.unavailable,
        message: '媒体下载能力尚未配置',
      );
}

class UnavailablePushPlatform implements PushPlatform {
  @override
  Future<PlatformOperation<String>> requestPermission() async =>
      const PlatformOperation<String>(
        status: PlatformOperationStatus.unavailable,
        message: '推送 SDK 尚未配置',
      );

  @override
  Future<PlatformOperation<void>> registerDevice() async =>
      const PlatformOperation<void>(
        status: PlatformOperationStatus.unavailable,
        message: '推送 SDK 尚未配置',
      );
}

class UnavailableFilePlatform implements FilePlatform {
  @override
  Future<PlatformOperation<List<String>>> pickFiles(
          {required List<String> extensions}) async =>
      const PlatformOperation<List<String>>(
        status: PlatformOperationStatus.unavailable,
        message: '文件选择能力尚未配置',
      );
}

class UnavailableLivePlatform implements LivePlatform {
  @override
  Future<PlatformOperation<void>> joinRoom(String roomId) async =>
      const PlatformOperation<void>(
        status: PlatformOperationStatus.unavailable,
        message: '直播 SDK 尚未配置',
      );

  @override
  Future<PlatformOperation<void>> leaveRoom(String roomId) async =>
      const PlatformOperation<void>(
        status: PlatformOperationStatus.unavailable,
        message: '直播 SDK 尚未配置',
      );
}
