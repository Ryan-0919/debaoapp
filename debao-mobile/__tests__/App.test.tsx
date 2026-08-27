import {mockAIService, mockPaymentService} from '../src/services/mockServices';

test('mock payment returns an explicit mock transaction', async () => {
  const result = await mockPaymentService.pay({
    id: 'test-order',
    productName: '测试课程',
    amount: 1,
    status: 'pending',
    createdAt: '2026-08-27',
  });
  expect(result.status).toBe('mock-paid');
  expect(result.transactionId).toMatch(/^MOCK-/);
});

test('mock AI service streams a marked local response', async () => {
  let response = '';
  await mockAIService.streamReply('合同效力', chunk => {
    response += chunk;
  });
  expect(response).toContain('本地 Mock 回答');
  expect(response).toContain('合同效力');
});
