import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/repositories.dart';

class FakeTransport implements ApiTransport {
  FakeTransport(this.responses);
  final Map<String, dynamic> responses;
  final calls = <String>[];

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    return responses[path];
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    return responses[path] ?? <String, dynamic>{'ok': true};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async {
    calls.add('PATCH $path');
    return responses[path] ?? <String, dynamic>{'ok': true};
  }

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    calls.add('DELETE $path');
    return responses[path] ?? <String, dynamic>{'ok': true};
  }
}

class _LearningPlanTransport implements ApiTransport {
  final calls = <String>[];

  static const _plan = <String, dynamic>{
    'id': 'p1',
    'title': '周计划',
    'dailyMinutes': 60,
    'startDate': '2026-09-02',
    'endDate': '2026-09-08',
    'status': 'active',
  };

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    return <dynamic>[_plan];
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    return _plan;
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async {
    calls.add('PATCH $path');
    return <String, dynamic>{..._plan, 'status': 'completed'};
  }

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    calls.add('DELETE $path');
    return null;
  }
}

void main() {
  test('core repositories map server collections', () async {
    final fake = FakeTransport({
      '/v1/me': {'id': 'u1', 'name': '测试用户'},
      '/v1/courses': [
        {
          'id': 'c1',
          'title': '民法',
          'teacher': '老师',
          'type': 'video',
          'progress': 25
        }
      ],
      '/v1/products': [
        {'id': 'p1', 'name': '课程', 'category': '客观题', 'price': 99}
      ],
      '/v1/orders': [
        {
          'id': 'o1',
          'productName': '课程',
          'amount': 99,
          'status': 'paid',
          'createdAt': 'now'
        }
      ],
      '/v1/notifications': [
        {
          'id': 'n1',
          'title': '提醒',
          'body': '正文',
          'createdAt': 'now',
          'read': false
        }
      ],
      '/v1/forum/posts': {
        'items': [
          {'id': 'post1', 'title': '标题', 'body': '正文', 'likes': 2}
        ]
      },
    });
    expect((await UserRepository(fake).me()).name, '测试用户');
    expect((await CourseRepository(fake).courses()).single.progress, 25);
    expect((await CommerceRepository(fake).products()).single.price, 99);
    expect((await CommerceRepository(fake).orders()).single.status, 'paid');
    expect(
        (await CommunityRepository(fake).notifications()).single.title, '提醒');
    expect((await CommunityRepository(fake).posts()).single.id, 'post1');
    expect(
        fake.calls,
        containsAll(<String>[
          'GET /v1/me',
          'GET /v1/courses',
          'GET /v1/products',
          'GET /v1/orders',
          'GET /v1/notifications',
          'GET /v1/forum/posts'
        ]));
  });

  test('learning plan repository maps CRUD endpoints', () async {
    final fake = _LearningPlanTransport();
    final repository = CourseRepository(fake);

    expect((await repository.plans()).single.title, '周计划');
    expect((await repository.createPlan(title: '周计划')).id, 'p1');
    expect((await repository.updatePlan('p1', status: 'completed')).status,
        'completed');
    await repository.deletePlan('p1');

    expect(
        fake.calls,
        containsAll(<String>[
          'GET /v1/learning/plans',
          'POST /v1/learning/plans',
          'PATCH /v1/learning/plans/p1',
          'DELETE /v1/learning/plans/p1',
        ]));
  });
}
