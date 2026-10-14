import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/repositories.dart';

class _PutTransport implements ApiTransport, PutAwareApiTransport {
  Object? body;
  String? path;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> postData(String path, {Object? data}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> putData(String path, {Object? data}) async {
    this.path = path;
    body = data;
    return <String, dynamic>{'saved': true};
  }
}

class _QuestionTransport implements ApiTransport {
  Object? body;
  String? path;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    this.path = path;
    body = data;
    return <String, dynamic>{'submissionId': 'submission-1', 'correct': false};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async =>
      <String, dynamic>{};
}

class _LegacyTransport implements ApiTransport {
  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> postData(String path, {Object? data}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      <String, dynamic>{};

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async =>
      <String, dynamic>{};
}

void main() {
  test('saveDraft sends the server PUT payload', () async {
    final transport = _PutTransport();

    final result = await QuestionRepository(transport).saveDraft(
      'grading-question-1',
      ['第一小问答案', '第二小问答案'],
    );

    expect(result['saved'], true);
    expect(transport.path, '/v1/question-drafts/grading-question-1');
    expect(transport.body, {
      'questionId': 'grading-question-1',
      'answers': ['第一小问答案', '第二小问答案'],
    });
  });

  test('saveDraft reports unsupported legacy transports', () async {
    expect(
      () => QuestionRepository(_LegacyTransport()).saveDraft('q1', ['答案']),
      throwsA(isA<ApiError>()),
    );
  });

  test('objective submissions use an invalid value for unanswered items',
      () async {
    final transport = _QuestionTransport();

    await QuestionRepository(transport).submit('q1', ['-1']);

    expect(transport.path, '/v1/question-submissions');
    expect(transport.body, {
      'questionId': 'q1',
      'answers': ['-1'],
    });
  });
}
