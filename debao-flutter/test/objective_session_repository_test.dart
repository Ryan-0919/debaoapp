import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/models.dart';
import 'package:debao_flutter/data/repositories.dart';

class _ObjectiveTransport
    implements ApiTransport, HeaderAwareApiTransport, PutAwareApiTransport {
  _ObjectiveTransport({List<Map<String, dynamic>>? sessions})
      : sessions = sessions ?? const [_sessionJson];

  final calls = <String>[];
  final headers = <String, Map<String, String>>{};
  final bodies = <String, Object?>{};
  final List<Map<String, dynamic>> sessions;

  @override
  Future<dynamic> getData(String path, {Map<String, dynamic>? query}) async {
    calls.add('GET $path');
    if (path == '/v1/question-sessions/s1/report') {
      return _reportJson;
    }
    if (path.startsWith('/v1/question-sessions/') &&
        !path.endsWith('/report')) {
      return sessions.firstWhere(
        (session) => path == '/v1/question-sessions/${session['id']}',
        orElse: () => _sessionJson,
      );
    }
    if (path == '/v1/question-sessions') {
      return <String, dynamic>{
        'items': sessions,
      };
    }
    return <String, dynamic>{};
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add('POST $path');
    bodies[path] = data;
    return _reportJson;
  }

  @override
  Future<dynamic> postDataWithHeaders(String path,
      {Object? data, Map<String, String>? headers}) async {
    calls.add('POST $path');
    bodies[path] = data;
    this.headers[path] = headers ?? const {};
    return path.endsWith('/submit') ? _reportJson : _sessionJson;
  }

  @override
  Future<dynamic> putData(String path, {Object? data}) async {
    calls.add('PUT $path');
    bodies[path] = data;
    return <String, dynamic>{
      'questionId': 'q1',
      'answers': ['0', '2'],
      'updatedAt': 'now',
    };
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async =>
      postData(path, data: data);

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async =>
      <String, dynamic>{};
}

const _sessionJson = <String, dynamic>{
  'id': 's1',
  'mode': 'chapter',
  'title': '民法专项练习',
  'subjectId': 'civil',
  'questionIds': ['q1'],
  'questions': [
    {
      'id': 'q1',
      'subjectId': 'civil',
      'stem': '下列哪些正确？',
      'options': ['甲', '乙', '丙'],
      'questionType': 'multiple',
      'version': 3,
    }
  ],
  'answers': [
    {
      'questionId': 'q1',
      'answers': ['0', '2'],
      'updatedAt': 'now'
    }
  ],
  'durationSeconds': 1200,
  'startedAt': '2026-09-01T10:00:00.000Z',
  'expiresAt': '2099-09-01T10:20:00.000Z',
  'status': 'in_progress',
};

const _reportJson = <String, dynamic>{
  'id': 'r1',
  'sessionId': 's1',
  'mode': 'chapter',
  'title': '民法专项练习',
  'total': 1,
  'answered': 1,
  'correct': 1,
  'score': 100,
  'maxScore': 100,
  'results': [
    {
      'questionId': 'q1',
      'stem': '下列哪些正确？',
      'options': ['甲', '乙', '丙'],
      'questionType': 'multiple',
      'version': 3,
      'answers': ['0', '2'],
      'correctAnswers': ['0', '2'],
      'correct': true,
      'analysis': '解析',
    }
  ],
  'subjectStats': [
    {'subjectId': 'civil', 'total': 1, 'correct': 1, 'correctRate': 100}
  ],
  'submittedAt': '2026-09-01T10:01:00.000Z',
};

void main() {
  test('objective session repository sends typed session requests', () async {
    final transport = _ObjectiveTransport();
    final repository = QuestionRepository(transport);

    final session = await repository.createSession(
      mode: 'chapter',
      title: '民法专项练习',
      subjectId: 'civil',
      limit: 1,
      idempotencyKey: 'create-key-123',
    );
    expect(session.id, 's1');
    expect(session.questions.single.isMultiple, isTrue);
    expect(session.answers.single.answers, ['0', '2']);
    expect(transport.headers['/v1/question-sessions']?['Idempotency-Key'],
        'create-key-123');

    final saved = await repository.saveSessionAnswer(
      sessionId: 's1',
      questionId: 'q1',
      answers: ['0', '2'],
    );
    expect(saved['answers'], ['0', '2']);
    expect(transport.calls, contains('PUT /v1/question-sessions/s1/answers'));

    final report = await repository.submitSession(
      sessionId: 's1',
      idempotencyKey: 'submit-key-123',
    );
    expect(report.score, 100);
    expect(report.results.single.correctAnswers, ['0', '2']);
    expect(
        transport.headers['/v1/question-sessions/s1/submit']
            ?['Idempotency-Key'],
        'submit-key-123');
  });

  test('objective report endpoint parses server snapshot', () async {
    final report =
        await QuestionRepository(_ObjectiveTransport()).getReport('s1');
    expect(report.sessionId, 's1');
    expect(report.results.single.version, 3);
    expect(report.subjectStats.single.correctRate, 100);
  });

  test('open objective session resumes only the same quiz intent', () async {
    final matchingTransport = _ObjectiveTransport();
    final matchingRepository = QuestionRepository(matchingTransport);

    final resumed = await matchingRepository.openObjectiveSession(
      const ObjectiveSessionRequest(
        mode: 'chapter',
        title: '民法专项练习',
        subjectId: 'civil',
        questionIds: ['q1'],
        limit: 1,
        durationSeconds: 1200,
      ),
    );

    expect(resumed.id, 's1');
    expect(matchingTransport.calls, contains('GET /v1/question-sessions/s1'));
    expect(
        matchingTransport.calls, isNot(contains('POST /v1/question-sessions')));

    final differentTransport = _ObjectiveTransport();
    final differentRepository = QuestionRepository(differentTransport);
    await differentRepository.openObjectiveSession(
      const ObjectiveSessionRequest(
        mode: 'chapter',
        title: '民法专项练习',
        subjectId: 'civil',
        questionIds: ['q2'],
        limit: 1,
        durationSeconds: 900,
      ),
    );

    expect(differentTransport.calls, contains('POST /v1/question-sessions'));
    expect(differentTransport.calls,
        isNot(contains('GET /v1/question-sessions/s1')));
  });
}
