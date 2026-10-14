import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Back affordance used by screens that can also be opened as standalone
/// deep links. A deep-linked GoRouter page has no previous route in its
/// navigator, so the normal AppBar-implied back button is not rendered.
class DebaoRouteBackButton extends StatelessWidget {
  const DebaoRouteBackButton({super.key, this.fallbackLocation = '/'});

  final String fallbackLocation;

  @override
  Widget build(BuildContext context) => BackButton(
        onPressed: () => debaoPopOrFallback(context, fallbackLocation),
      );
}

/// Pops the current navigator when possible, otherwise turns a standalone
/// deep link into a normal in-app navigation to [fallbackLocation].
void debaoPopOrFallback(BuildContext context, [String fallbackLocation = '/']) {
  final navigator = Navigator.maybeOf(context);
  if (navigator?.canPop() ?? false) {
    navigator!.pop();
    return;
  }

  final router = GoRouter.maybeOf(context);
  if (router == null) return;
  if (router.canPop()) {
    router.pop();
    return;
  }
  router.go(fallbackLocation);
}
