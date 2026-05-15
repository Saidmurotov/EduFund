import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/main.dart';

void main() {
  testWidgets('EduFund app renders login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const EduFundApp());

    expect(find.text('EduFund orqali orzuingizdagi grantni toping.'), findsOneWidget);
    expect(find.text('Kirish'), findsOneWidget);
  });
}
