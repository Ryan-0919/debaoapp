export interface PaymentAdapter {
  readonly name: string;
  pay(orderId: string, amount: number): Promise<{status: 'paid' | 'pending'; transactionId: string}>;
}

export interface SmsAdapter {
  readonly name: string;
  sendCode(phone: string): Promise<{accepted: boolean; providerMessageId: string}>;
}

export interface PushAdapter {
  readonly name: string;
  send(deviceToken: string, title: string, body: string): Promise<{accepted: boolean; providerMessageId: string}>;
}

export interface GradingAdapter {
  readonly name: string;
  enqueue(submissionId: string): Promise<{status: 'queued' | 'processing'}>;
}

export class LocalPaymentAdapter implements PaymentAdapter {
  readonly name = 'local';
  async pay(orderId: string, _amount: number) {
    return {status: 'paid' as const, transactionId: `LOCAL-${orderId}-${Date.now()}`};
  }
}

export class UnconfiguredPaymentAdapter implements PaymentAdapter {
  readonly name = 'unconfigured';
  async pay(_orderId: string, _amount: number) {
    return {status: 'pending' as const, transactionId: `PENDING-${Date.now()}`};
  }
}

export class LocalSmsAdapter implements SmsAdapter {
  readonly name = 'local';
  async sendCode(_phone: string) { return {accepted: true, providerMessageId: `LOCAL-SMS-${Date.now()}`}; }
}

export class LocalPushAdapter implements PushAdapter {
  readonly name = 'local';
  async send(_deviceToken: string, _title: string, _body: string) { return {accepted: false, providerMessageId: 'LOCAL-PUSH-NOT-CONFIGURED'}; }
}

export class LocalGradingAdapter implements GradingAdapter {
  readonly name = 'local';
  async enqueue(_submissionId: string) { return {status: 'queued' as const}; }
}

export function createPaymentAdapter(): PaymentAdapter {
  return (process.env.PAYMENT_ADAPTER ?? 'local') === 'local'
    ? new LocalPaymentAdapter()
    : new UnconfiguredPaymentAdapter();
}

export const smsAdapter: SmsAdapter = new LocalSmsAdapter();
export const pushAdapter: PushAdapter = new LocalPushAdapter();
export const gradingAdapter: GradingAdapter = new LocalGradingAdapter();
