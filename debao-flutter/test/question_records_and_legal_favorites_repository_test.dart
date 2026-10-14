import 'package:flutter_test/flutter_test.dart';

import 'package:debao_flutter/core/network/api_client.dart';
import 'package:debao_flutter/data/repositories.dart';

class _Call {
  const _Call(this.method, this.path, {this.query, this.data});

  final String method;
  final String path;
  final Map<String, dynamic>? query;
  final Object? data;
}

class _FakeTransport implements ApiTransport {
  final calls = <_Call>[];

  @override
  Future<dynamic> getData(
    String path, {
    Map<String, dynamic>? query,
  }) async {
    calls.add(_Call('GET', path, query: query));
    if (path == '/v1/question-records') {
      return <String, dynamic>{
        'items': <Map<String, dynamic>>[
          <String, dynamic>{
            'id': 'record-1',
            'questionId': 'oq1',
            'answers': <String>['1'],
            'correct': true,
            'createdAt': '2026-09-02T12:00:00Z',
            'subjectId': 'civil',
            'mode': 'objective',
            'title': 'Civil objective practice',
            'total': 1,
            'correctCount': 1,
          },
        ],
        'page': 2,
        'pageSize': 10,
        'total': 25,
        'answered': 80,
        'correct': 62,
      };
    }
    if (path == '/v1/legal-favorites') {
      return <Map<String, dynamic>>[
        <String, dynamic>{
          'id': 'legal-favorite-1',
          'legalDocumentId': 'civil-311',
          'article': 'Article 311',
          'title': 'Bona fide acquisition',
          'content': 'Snapshot content',
          'subjectId': 'civil',
          'version': 3,
          'effectiveFrom': '2021-01-01',
          'createdAt': '2026-09-02T12:00:00Z',
        },
      ];
    }
    return null;
  }

  @override
  Future<dynamic> postData(String path, {Object? data}) async {
    calls.add(_Call('POST', path, data: data));
    return <String, dynamic>{
      'id': 'legal-favorite-2',
      'legalDocumentId': 'civil-311',
      'article': 'Article 311',
      'title': 'Bona fide acquisition',
      'content': 'Snapshot content',
      'createdAt': '2026-09-02T12:00:00Z',
    };
  }

  @override
  Future<dynamic> deleteData(String path, {Object? data}) async {
    calls.add(_Call('DELETE', path, data: data));
    return <String, dynamic>{'removed': true};
  }

  @override
  Future<dynamic> patchData(String path, {Object? data}) async => null;
}

void main() {
  test('question record page forwards pagination and filter parameters',
      () async {
    final transport = _FakeTransport();
    final page = await QuestionRepository(transport).recordPage(
      page: 2,
      pageSize: 10,
      subjectId: 'civil',
      mode: 'objective',
    );

    expect(page.page, 2);
    expect(page.pageSize, 10);
    expect(page.total, 25);
    expect(page.answered, 80);
    expect(page.correct, 62);
    expect(page.hasMore, true);
    expect(page.items.single.title, 'Civil objective practice');
    expect(page.items.single.correctCount, 1);
    final call = transport.calls.single;
    expect(call.path, '/v1/question-records');
    expect(call.query, <String, dynamic>{
      'page': 2,
      'pageSize': 10,
      'subjectId': 'civil',
      'mode': 'objective',
    });
  });

  test('legal favorite repository maps snapshots and uses item delete path',
      () async {
    final transport = _FakeTransport();
    final repository = QuestionRepository(transport);

    final items = await repository.legalFavorites();
    expect(items.single.legalDocumentId, 'civil-311');
    expect(items.single.version, 3);
    final created = await repository.addLegalFavorite('civil-311');
    expect(created.id, 'legal-favorite-2');
    await repository.removeLegalFavorite(created.id);

    expect(transport.calls[0].path, '/v1/legal-favorites');
    expect(transport.calls[1].method, 'POST');
    expect(transport.calls[1].data, <String, dynamic>{
      'documentId': 'civil-311',
    });
    expect(transport.calls[2].method, 'DELETE');
    expect(transport.calls[2].path, '/v1/legal-favorites/legal-favorite-2');
  });
}
