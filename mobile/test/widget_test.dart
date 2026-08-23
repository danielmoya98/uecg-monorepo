import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uecg_app/main.dart';

void main() {
  testWidgets('UECGApp basic smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: UECGApp()));
    expect(find.byType(UECGApp), findsOneWidget);
  });
}
