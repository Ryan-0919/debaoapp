import 'package:flutter_test/flutter_test.dart';
import 'package:debao_flutter/app/app.dart';
import 'package:debao_flutter/core/config/app_environment.dart';
import 'package:debao_flutter/features/auth/login_screen.dart';
import 'package:debao_flutter/features/commerce/mall_screen.dart';
import 'package:debao_flutter/features/courses/courses_screen.dart';
import 'package:debao_flutter/features/profile/profile_screen.dart';
import 'package:debao_flutter/features/questions/question_bank_screen.dart';
import 'package:debao_flutter/data/models.dart';

void main() {
  test('normal builds default every main page to real APIs', () {
    expect(remoteDataDefault, isTrue);
    expect(AppEnvironment.current.allowsMocks, isFalse);
    expect(const DebaoApp().remoteEnabled, isTrue);
    expect(const MallScreen().remoteEnabled, isTrue);
    expect(const CoursesScreen().remoteEnabled, isTrue);
    expect(const ProfileScreen().remoteEnabled, isTrue);
    expect(const QuestionBankScreen().remoteEnabled, isTrue);
    expect(const LoginScreen().remoteEnabled, isTrue);
  }, skip: !remoteDataDefault);
  test('learning chart values come from the API daily series', () {
    final report = LearningReport.fromJson({
      'minutes': 9,
      'dailyTrend': [
        {'date': '2026-10-12', 'minutes': 7},
        {'date': '2026-10-13', 'minutes': 2},
      ],
    });
    expect(report.dailyTrend.map((item) => item.minutes), [7, 2]);
    expect(LearningReport.fromJson({}).dailyTrend, isEmpty);
  });
}
