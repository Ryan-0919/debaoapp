import {useCallback, useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {CheckCircle, ChevronLeft, RefreshCw} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {RemoteState} from '@/components/ui';
import {prototypeOrders, type PrototypeOrder} from '@/data/orders';
import {catalogProducts} from '@/data/products';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {environment} from '@/config/environment';
import {orderService} from '@/services';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<DetailRoute>();
  const [order, setOrder] = useState<PrototypeOrder | null>(environment.useMocks ? (prototypeOrders.find(item => item.id === route.params.orderId) ?? prototypeOrders[0]) : null);
  const [loading, setLoading] = useState(!environment.useMocks);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (environment.useMocks) return;
    setLoading(true);
    setError('');
    try {
      const item = await orderService.get(route.params.orderId);
      if (!item) {
        setOrder(null);
        setError('订单不存在');
        return;
      }
      const productId = item.productId ?? catalogProducts.find(productItem => productItem.name === item.productName)?.id ?? 'p1';
      setOrder({id: item.id, productName: item.productName, orderNo: item.id, date: item.createdAt, amount: item.amount, status: item.status === 'paid' ? '已完成' : '待开课', productId, courseId: item.status === 'paid' ? (productId === 'p1' ? 'c1' : productId === 'p2' ? 'c3' : null) : null});
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '订单加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [route.params.orderId]);
  useEffect(() => { load().catch(() => undefined); }, [load]);
  const product = order ? catalogProducts.find(item => item.id === order.productId) ?? catalogProducts[0] : null;
  const completed = order?.status === '已完成';

  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="order-detail-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={({pressed}) => [styles.headerSide, pressed && styles.pressed]}>
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>订单详情</Text>
        <View style={styles.headerSide} />
      </View>

      {loading || (error && !order) ? <RemoteState testID="order-detail-state" loading={loading} error={error} loadingLabel="正在加载订单详情..." emptyTitle="暂无订单详情" emptyDescription="该订单可能已被删除。" onRetry={load} /> : order && product ? <>
        {error ? <View testID="order-detail-inline-error" style={styles.inlineError}><Text accessibilityRole="alert" style={styles.inlineErrorText}>{error}</Text><Pressable testID="order-detail-retry" onPress={load} style={styles.retry}><RefreshCw size={14} color={colors.brand} /><Text style={styles.retryText}>重新加载</Text></Pressable></View> : null}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View testID="order-detail-status" style={styles.statusCard}>
          <View style={[styles.statusIcon, completed ? styles.completedIcon : styles.pendingIcon]}>
            <CheckCircle size={22} color={completed ? colors.success : '#A87000'} />
          </View>
          <View>
            <Text style={styles.statusTitle}>{order.status}</Text>
            <Text style={styles.statusDescription}>{completed ? '课程权限已自动开通' : '课程将于开课日自动激活'}</Text>
          </View>
        </View>

        <View style={styles.productCard}>
          <View style={styles.productRow}>
            <Image source={product.image} accessibilityLabel={order.productName} style={styles.productImage} />
            <View style={styles.productCopy}>
              <Text style={styles.productName}>{order.productName}</Text>
              <Text style={styles.productType}>{product.type}</Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>实付金额</Text>
            <Text style={styles.amount}>¥{order.amount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          {[
            ['订单编号', order.orderNo],
            ['下单时间', order.date],
            ['支付方式', '微信支付'],
          ].map(([label, value], index) => (
            <View key={label} style={[styles.infoRow, index < 2 && styles.infoDivider]}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityLabel="查看商品"
          testID="order-view-product"
          onPress={() => navigation.navigate('ProductDetail', {productId: order.productId})}
          style={({pressed}) => [styles.footerButton, styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>查看商品</Text>
        </Pressable>
        {order.courseId ? (
          <Pressable
            accessibilityLabel="进入课程"
            testID="order-enter-course"
            onPress={() => navigation.navigate('CourseDetail', {courseId: order.courseId!})}
            style={({pressed}) => [styles.footerButton, styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryText}>进入课程</Text>
          </Pressable>
        ) : null}
      </View>
      </> : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  headerSide: {width: 40, height: 40, justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.ink},
  pressed: {opacity: 0.65},
  scroll: {flex: 1},
  scrollContent: {paddingBottom: 24},
  statusCard: {marginHorizontal: 16, marginTop: 16, minHeight: 76, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface},
  statusIcon: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'},
  completedIcon: {backgroundColor: colors.mint},
  pendingIcon: {backgroundColor: colors.gold},
  statusTitle: {fontSize: 15, lineHeight: 20, fontWeight: '600', color: colors.ink},
  statusDescription: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 2},
  productCard: {marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  productRow: {padding: 16, flexDirection: 'row', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  productImage: {width: 80, height: 56, borderRadius: radius.sm, backgroundColor: colors.line},
  productCopy: {flex: 1, minWidth: 0},
  productName: {fontSize: 14, lineHeight: 19, fontWeight: '600', color: colors.ink},
  productType: {fontSize: 12, lineHeight: 17, color: colors.muted, marginTop: 4},
  amountRow: {height: 49, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  amountLabel: {fontSize: 13, color: colors.body},
  amount: {fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.brand},
  infoCard: {marginHorizontal: 16, marginTop: 12, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  infoRow: {height: 50, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  infoDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  infoLabel: {fontSize: 13, color: colors.muted},
  infoValue: {fontSize: 13, color: colors.ink},
  footer: {paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 8, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line},
  footerButton: {flex: 1, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center'},
  secondaryButton: {borderWidth: 1, borderColor: colors.line},
  secondaryText: {fontSize: 14, color: colors.body},
  primaryButton: {backgroundColor: colors.brand},
  primaryText: {fontSize: 14, fontWeight: '600', color: colors.surface},
  inlineError: {marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: radius.md, backgroundColor: colors.apricot, flexDirection: 'row', alignItems: 'center', gap: 10},
  inlineErrorText: {flex: 1, fontSize: 12, lineHeight: 18, color: colors.error},
  retry: {height: 36, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.surface},
  retryText: {fontSize: 12, fontWeight: '700', color: colors.brand},
});
