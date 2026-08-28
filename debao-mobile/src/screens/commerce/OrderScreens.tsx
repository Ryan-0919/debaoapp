import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ReceiptText} from 'lucide-react-native';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {Card, EmptyState, ListRow} from '@/components/ui';
import {orderService} from '@/services';
import {colors, spacing} from '@/theme';
import type {Order} from '@/types/domain';
import type {RootStackParamList} from '@/types/navigation';

export {default as OrderListScreen} from './OrderListScreen';

type DetailRoute = RouteProp<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const route = useRoute<DetailRoute>();
  const [order, setOrder] = useState<Order | null>();
  useEffect(() => { orderService.get(route.params.orderId).then(setOrder); }, [route.params.orderId]);
  return (
    <AppScreen>
      <PageHeader title="订单详情" />
      <View style={styles.content}>
        {!order ? <EmptyState title={order === undefined ? '正在读取订单' : '未找到订单'} description={order === undefined ? '请稍候。' : '该 Mock 订单仅保存在当前运行会话中。'} /> : (
          <>
            <View style={styles.status}><ReceiptText size={32} color={colors.success} /><Text style={styles.statusTitle}>{order.status === 'paid' ? '支付成功' : 'Mock 订单已创建'}</Text><Text style={styles.statusBody}>正式课程权益以后端订单状态为准</Text></View>
            <Card style={styles.detailCard}>
              <ListRow title="商品" subtitle={order.productName} />
              <ListRow title="订单号" subtitle={order.id} />
              <ListRow title="创建时间" subtitle={order.createdAt} />
              <ListRow title="支付方式" subtitle="Mock PaymentService" />
              <ListRow title="订单金额" subtitle={`¥${order.amount.toLocaleString()}`} />
            </Card>
          </>
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg},
  status: {alignItems: 'center', padding: spacing.xl},
  statusTitle: {fontSize: 19, fontWeight: '800', color: colors.ink, marginTop: spacing.md},
  statusBody: {fontSize: 12, color: colors.muted, marginTop: 5},
  detailCard: {paddingVertical: 0},
});
