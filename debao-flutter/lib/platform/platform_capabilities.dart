import 'package:flutter/foundation.dart';

enum PlatformKind {
  android('Android'),
  ios('iOS'),
  harmony('HarmonyOS'),
  other('未知平台');

  const PlatformKind(this.label);

  final String label;
}

class PlatformCapabilities {
  const PlatformCapabilities(this.kind);

  final PlatformKind kind;

  static PlatformCapabilities get current {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return const PlatformCapabilities(PlatformKind.android);
      case TargetPlatform.iOS:
        return const PlatformCapabilities(PlatformKind.ios);
      case TargetPlatform.fuchsia:
      case TargetPlatform.linux:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
        return const PlatformCapabilities(PlatformKind.other);
    }
  }

  Future<CapabilityResult> check(String capability) async {
    return CapabilityResult.pending(capability);
  }
}

class CapabilityResult {
  const CapabilityResult(
      {required this.capability, required this.status, this.reason});

  const CapabilityResult.pending(this.capability)
      : status = CapabilityStatus.pending,
        reason = '尚未接入对应平台 SDK 或真实供应商';

  final String capability;
  final CapabilityStatus status;
  final String? reason;
}

enum CapabilityStatus { available, unavailable, pending, mocked }
