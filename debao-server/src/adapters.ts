export interface PaymentAdapter {
  readonly name: string;
  pay(orderId: string, amount: number): Promise<{status: 'paid' | 'pending'; transactionId: string}>;
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

export function createPaymentAdapter(): PaymentAdapter {
  return (process.env.PAYMENT_ADAPTER ?? 'local') === 'local'
    ? new LocalPaymentAdapter()
    : new UnconfiguredPaymentAdapter();
}
