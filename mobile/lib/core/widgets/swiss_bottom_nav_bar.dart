import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

class SwissNavBarItem {
  final IconData
      icon; // Asegúrate de enviarle PhosphorIcons cuando uses este widget
  final String label;
  SwissNavBarItem({required this.icon, required this.label});
}

class SwissBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  final List<SwissNavBarItem> items;

  const SwissBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.pureWhite,
        border: Border(
          top: BorderSide(color: AppTheme.lineGray, width: 1),
        ),
      ),
      child: SafeArea(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: List.generate(items.length, (index) {
            final isSelected = currentIndex == index;
            final color = isSelected ? AppTheme.swissBlue : AppTheme.slateGray;

            return Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () => onTap(index),
                child: Container(
                  // 🔥 Línea superior animada indicando foco
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: isSelected
                            ? AppTheme.swissBlue
                            : Colors.transparent,
                        width: 3,
                      ),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 14.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(items[index].icon, color: color, size: 24)
                          .animate(target: isSelected ? 1 : 0)
                          .scaleXY(
                              end: 1.1,
                              curve: Curves.easeOutBack,
                              duration: 200.ms),
                      const SizedBox(height: 6),
                      Text(
                        items[index].label,
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: color,
                              fontSize: 9,
                              letterSpacing: 1.0,
                              fontWeight: isSelected
                                  ? FontWeight.w900
                                  : FontWeight.w700,
                            ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
