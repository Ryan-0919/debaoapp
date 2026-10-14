import {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, ChevronRight, RefreshCw} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {RemoteState} from '@/components/ui';
import {prototypeOrders, type PrototypeOrder} from '@/data/orders';
import {environment} from '@/config/environment';
import {orderService} from '@/services';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function OrderListScreen() {
  const navigation = useNavigation<Navigation>();
  const [orders, setOrders] = useState<PrototypeOrder[]>(environment.useMocks ? prototypeOrders : []);
  const [loading, setLoading] = useState(!environment.useMocks);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (environment.useMocks) return;
    setLoading(true);
    setError('');
    try {
      const items = await orderService.list();
      setOrders(items.map(item => ({id: item.id, productName: item.productName, orderNo: item.id, date: item.createdAt, amount: item.amount, status: item.status === 'paid' ? '已完成' : '待开课', productId: item.productId ?? 'p1', courseId: item.status === 'paid' && item.productId === 'p1' ? 'c1' : null})));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '订单加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load().catch(() => undefined); }, [load]);
  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="order-list-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={({pressed}) => [styles.headerSide, pressed && styles.pressed]}>
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>订单与已购</Text>
        <View style={styles.headerSide} />
      </View>
      {loading || (error && !orders.length) ? <RemoteState testID="order-list-state" loading={loading} error={error} loadingLabel="正在加载订单..." emptyTitle="暂无订单" emptyDescription="购买课程后，订单会显示在这里。" onRetry={load} /> : (
        <>
          {error ? <View testID="order-list-inline-error" style={styles.inlineError}><Text accessibilityRole="alert" style={styles.inlineErrorText}>{error}</Text><Pressable testID="order-list-retry" onPress={load} style={styles.retry}><RefreshCw size={14} color={colors.brand} /><Text style={styles.retryText}>重新加载</Text></Pressable></View> : null}
          {!orders.length ? <RemoteState testID="order-list-empty" empty emptyTitle="暂无订单" emptyDescription="购买课程后，订单会显示在这里。" /> : <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.orderGroup}>
              {orders.map((order, index) => (
                <Pressable
                  key={order.id}
                  accessibilityLabel={`${order.status}, ${order.productName}, ${order.date}, ¥${order.amount.toLocaleString()}`}
                  testID={`order-row-${order.id}`}
                  onPress={() => navigation.navigate('OrderDetail', {orderId: order.id})}
                  style={({pressed}) => [styles.orderRow, index < orders.length - 1 && styles.divider, pressed && styles.rowPressed]}>
                  <View style={styles.orderCopy}>
                    <Text style={[styles.status, order.status === '已完成' ? styles.completed : styles.pending]}>{order.status}</Text>
                    <Text numberOfLines={2} style={styles.productName}>{order.productName}</Text>
                    <Text style={styles.date}>{order.date}</Text>
                    <Text style={styles.amount}>¥{order.amount.toLocaleString()}</Text>
                  </View>
                  <ChevronRight size={16} color="#C0C5D0" style={styles.chevron} />
                </Pressable>
              ))}
            </View>
          </ScrollView>}
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  headerSide: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.ink},
  pressed: {opacity: 0.6},
  scrollContent: {paddingBottom: 24},
  orderGroup: {marginHorizontal: 16, marginTop: 16, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  orderRow: {minHeight: 126, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'flex-start'},
  divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  rowPressed: {backgroundColor: colors.page},
  orderCopy: {flex: 1, minWidth: 0},
  status: {fontSize: 11, lineHeight: 16, fontWeight: '500', marginBottom: 6},
  completed: {color: colors.success},
  pending: {color: '#A87000'},
  productName: {fontSize: 14, lineHeight: 19, fontWeight: '600', color: colors.ink},
  date: {fontSize: 11, lineHeight: 16, color: colors.muted, marginTop: 4},
  amount: {fontSize: 15, lineHeight: 20, fontWeight: '700', color: colors.brand, marginTop: 8},
  chevron: {marginTop: 4, marginLeft: 12},
  inlineError: {marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: radius.md, backgroundColor: colors.apricot, flexDirection: 'row', alignItems: 'center', gap: 10},
  inlineErrorText: {flex: 1, fontSize: 12, lineHeight: 18, color: colors.error},
  retry: {height: 36, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surface},
  retryText: {fontSize: 12, fontWeight: '700', color: colors.brand},
});
