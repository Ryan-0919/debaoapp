import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ReceiptText} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {Card, EmptyState, ListRow, Pill} from '@/components/ui';
import {orderService} from '@/services';
import {colors, spacing} from '@/theme';
import type {Order} from '@/types/domain';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function OrderListScreen() {
  const navigation = useNavigation<Navigation>();
  const [items, setItems] = useState<Order[]>([]);
  useEffect(() => { orderService.list().then(setItems); }, []);
  return (
    <AppScreen>
      <PageHeader title="订单与已购" />
      <View style={styles.content}>
        {items.length === 0 ? <EmptyState title="正在读取订单" description="Mock 订单数据加载完成后会显示在这里。" /> : items.map(item => (
          <Card key={item.id} style={styles.card}>
            <ListRow
              title={item.productName}
              subtitle={`${item.id}\n${item.createdAt}`}
              leading={<ReceiptText size={22} color={colors.brand} />}
              trailing={<Pill label={item.status === 'paid' ? '已支付' : item.status === 'pending' ? '待支付' : '已关闭'} tone={item.status === 'paid' ? 'success' : 'warning'} />}
              onPress={() => navigation.navigate('OrderDetail', {orderId: item.id})}
            />
            <Text style={styles.amount}>实付 ¥{item.amount.toLocaleString()}</Text>
          </Card>
        ))}
      </View>
    </AppScreen>
  );
}

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
  card: {marginBottom: spacing.md, paddingVertical: 0},
  amount: {fontSize: 13, fontWeight: '700', color: colors.ink, textAlign: 'right', paddingVertical: spacing.md},
  status: {alignItems: 'center', padding: spacing.xl},
  statusTitle: {fontSize: 19, fontWeight: '800', color: colors.ink, marginTop: spacing.md},
  statusBody: {fontSize: 12, color: colors.muted, marginTop: 5},
  detailCard: {paddingVertical: 0},
});
