import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// The RC reference is presented as a 390x844 phone canvas in a browser.
/// Keep native builds untouched while giving Web previews the same frame and
/// simulated status bar used by the reference project.
class DebaoWebPhoneFrame extends StatelessWidget {
  const DebaoWebPhoneFrame({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!kIsWeb) return child;
    if (Uri.base.queryParameters['embedded'] == '1') return child;

    // MaterialApp.builder can receive loose constraints on Flutter Web. Use
    // the view metrics as the authoritative viewport so the phone canvas never
    // paints beyond the CanvasKit backing surface (which would tile the frame
    // on desktop-sized previews).
    final viewSize = MediaQuery.sizeOf(context);
    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth =
            viewSize.width.isFinite ? viewSize.width : constraints.maxWidth;
        final availableHeight =
            viewSize.height.isFinite ? viewSize.height : constraints.maxHeight;
        final width =
            math.min(390.0, availableWidth.isFinite ? availableWidth : 390.0);
        final height =
            math.min(844.0, availableHeight.isFinite ? availableHeight : 844.0);
        final statusBarHeight =
            math.min(40.0, math.max(0.0, height * 40 / 844));
        return SizedBox.expand(
          child: ColoredBox(
            color: const Color(0xFFE8E9ED),
            child: Center(
              child: SizedBox(
                width: width,
                height: height,
                child: DecoratedBox(
                  decoration: const BoxDecoration(
                    color: Color(0xFFF4F5F7),
                    boxShadow: [
                      BoxShadow(
                        color: Color(0x22000000),
                        blurRadius: 20,
                        offset: Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      SizedBox(
                        height: statusBarHeight,
                        child: const _ReferenceStatusBar(),
                      ),
                      Expanded(child: child),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _ReferenceStatusBar extends StatelessWidget {
  const _ReferenceStatusBar();

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const DefaultTextStyle(
              style: TextStyle(
                color: Color(0xFF171925),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
              child: Text('9:41'),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.signal_cellular_4_bar,
                    color: Color(0xFF171925), size: 14),
                const SizedBox(width: 4),
                const Icon(Icons.wifi, color: Color(0xFF171925), size: 14),
                const SizedBox(width: 4),
                Container(
                  width: 20,
                  height: 11,
                  decoration: BoxDecoration(
                    border:
                        Border.all(color: const Color(0xFF171925), width: 1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                  padding: const EdgeInsets.all(1),
                  child: const Align(
                    alignment: Alignment.centerLeft,
                    child: FractionallySizedBox(
                      widthFactor: .72,
                      child: ColoredBox(color: Color(0xFF171925)),
                    ),
                  ),
                ),
                const SizedBox(width: 2),
                Container(
                  width: 2,
                  height: 5,
                  decoration: const BoxDecoration(
                    color: Color(0xFF171925),
                    borderRadius:
                        BorderRadius.horizontal(right: Radius.circular(2)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
