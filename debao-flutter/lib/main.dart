import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

import 'app/app.dart';

void main() {
  usePathUrlStrategy();
  // Keep the default browser build deterministic and aligned with the RC
  // prototype. Real API mode remains explicit so a remote dataset cannot
  // silently change the visual acceptance surface; use
  // `--dart-define=DEBAO_REMOTE=true` for a connected environment.
  const remoteEnabled =
      bool.fromEnvironment('DEBAO_REMOTE', defaultValue: false);
  runApp(ProviderScope(child: DebaoApp(remoteEnabled: remoteEnabled)));
}
