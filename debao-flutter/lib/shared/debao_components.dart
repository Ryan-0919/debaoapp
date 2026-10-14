import 'package:flutter/material.dart';
import '../core/design_tokens.dart';

class DebaoTopBar extends StatelessWidget implements PreferredSizeWidget {
  const DebaoTopBar(
      {super.key,
      required this.title,
      this.leading,
      this.actions,
      this.centerTitle = true});
  final String title;
  final Widget? leading;
  final List<Widget>? actions;
  final bool centerTitle;
  @override
  Size get preferredSize => const Size.fromHeight(52);
  @override
  Widget build(BuildContext context) => AppBar(
      title: Text(title,
          style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: DebaoColors.ink)),
      centerTitle: centerTitle,
      leading: leading,
      actions: actions,
      backgroundColor: DebaoColors.surface,
      surfaceTintColor: DebaoColors.surface,
      elevation: 0,
      bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: DebaoColors.line)));
}

class DebaoSegmented extends StatelessWidget {
  const DebaoSegmented(
      {super.key,
      required this.labels,
      required this.selected,
      required this.onChanged});
  final List<String> labels;
  final int selected;
  final ValueChanged<int> onChanged;
  @override
  Widget build(BuildContext context) => Container(
      height: 32,
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
          color: DebaoColors.page,
          borderRadius: BorderRadius.circular(DebaoRadius.md)),
      child: Row(
          mainAxisSize: MainAxisSize.min,
          children: labels
              .asMap()
              .entries
              .map((entry) => InkWell(
                  onTap: () => onChanged(entry.key),
                  borderRadius: BorderRadius.circular(DebaoRadius.sm),
                  child: Container(
                      height: 28,
                      padding: const EdgeInsets.symmetric(
                          horizontal: DebaoSpacing.lg),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                          color: selected == entry.key
                              ? DebaoColors.surface
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(DebaoRadius.sm),
                          boxShadow: selected == entry.key
                              ? const [
                                  BoxShadow(
                                      color: Color(0x12000000), blurRadius: 2)
                                ]
                              : null),
                      child: Text(entry.value,
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: selected == entry.key
                                  ? DebaoColors.brand
                                  : DebaoColors.muted)))))
              .toList()));
}

class DebaoPanel extends StatelessWidget {
  const DebaoPanel(
      {super.key,
      required this.child,
      this.margin = const EdgeInsets.only(top: DebaoSpacing.md)});
  final Widget child;
  final EdgeInsetsGeometry margin;
  @override
  Widget build(BuildContext context) => Container(
      margin: margin,
      decoration: BoxDecoration(
          color: DebaoColors.surface,
          borderRadius: BorderRadius.circular(DebaoRadius.md)),
      child: child);
}

class DebaoEmptyState extends StatelessWidget {
  const DebaoEmptyState({super.key, required this.title, this.description});
  final String title;
  final String? description;
  @override
  Widget build(BuildContext context) => Padding(
      padding: const EdgeInsets.all(DebaoSpacing.section),
      child: Column(children: [
        const Icon(Icons.inbox_outlined, size: 32, color: DebaoColors.muted),
        const SizedBox(height: DebaoSpacing.md),
        Text(title,
            style: const TextStyle(fontSize: 14, color: DebaoColors.muted)),
        if (description != null) ...[
          const SizedBox(height: DebaoSpacing.xs),
          Text(description!,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: DebaoColors.muted))
        ]
      ]));
}
