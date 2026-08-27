import {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BookOpen, Check, ShieldCheck, Users} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {ConfirmSheet} from '@/components/ConfirmSheet';
import {PageHeader} from '@/components/PageHeader';
import {AppButton, Card, ListRow, MockNotice, Pill, SectionTitle} from '@/components/ui';
import {products} from '@/data/mock';
import {orderService, paymentService} from '@/services';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const product = useMemo(() => products.find(item => item.id === route.params.productId) ?? products[0], [route.params.productId]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [paying, setPaying] = useState(false);

  const pay = async () => {
    setPaying(true);
    const order = await orderService.create(product);
    await paymentService.pay(order);
    setPaying(false);
    setSheetVisible(false);
    navigation.replace('PurchaseSuccess', {productName: product.name, orderId: order.id});
  };

  return (
    <AppScreen footer={<View style={styles.footer}><View><Text style={styles.footerLabel}>到手价</Text><Text style={styles.footerPrice}>¥{product.price.toLocaleString()}</Text></View><View style={styles.buy}><AppButton label="立即购买" onPress={() => setSheetVisible(true)} /></View></View>}>
      <PageHeader title="课程详情" />
      <View style={[styles.cover, {backgroundColor: product.accent}]}>
        <BookOpen size={42} color="#FFFFFF" />
        <Text style={styles.coverCategory}>{product.category}</Text>
        <Text style={styles.coverBrand}>得宝法考</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.tagRow}><Pill label={product.category} /><Pill label={`${product.sold.toLocaleString()} 人已购`} tone="neutral" /></View>
        <Text style={styles.title}>{product.name}</Text>
        <View style={styles.priceRow}><Text style={styles.price}>¥{product.price.toLocaleString()}</Text><Text style={styles.original}>¥{product.originalPrice.toLocaleString()}</Text></View>
        <MockNotice text="当前购买流程使用 Mock PaymentService，不会唤起微信、支付宝或系统内购。" />
        <SectionTitle title="课程包含" />
        <Card style={styles.listCard}>
          {product.benefits.map(benefit => <ListRow key={benefit} title={benefit} leading={<Check size={18} color={colors.success} />} />)}
        </Card>
        <SectionTitle title="服务保障" />
        <View style={styles.guarantees}>
          <View style={styles.guarantee}><ShieldCheck size={22} color={colors.brand} /><Text style={styles.guaranteeTitle}>课程服务</Text><Text style={styles.guaranteeBody}>开通后按课程计划学习</Text></View>
          <View style={styles.guarantee}><Users size={22} color={colors.error} /><Text style={styles.guaranteeTitle}>学习陪伴</Text><Text style={styles.guaranteeBody}>班主任服务待后端接入</Text></View>
        </View>
      </View>
      <ConfirmSheet visible={sheetVisible} title="确认购买" description={`您将以 ¥${product.price.toLocaleString()} 购买“${product.name}”。本次仅演示订单与支付状态。`} confirmLabel={`Mock 支付 ¥${product.price.toLocaleString()}`} loading={paying} onClose={() => setSheetVisible(false)} onConfirm={pay} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  cover: {height: 214, padding: spacing.xl, justifyContent: 'flex-end'},
  coverCategory: {fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginTop: spacing.md},
  coverBrand: {fontSize: 12, color: '#FFFFFF', opacity: 0.75, marginTop: 4},
  content: {padding: spacing.lg},
  tagRow: {flexDirection: 'row', gap: spacing.sm},
  title: {fontSize: 21, lineHeight: 29, fontWeight: '800', color: colors.ink, marginTop: spacing.md},
  priceRow: {flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginTop: spacing.md},
  price: {fontSize: 25, fontWeight: '900', color: colors.error},
  original: {fontSize: 13, color: colors.muted, textDecorationLine: 'line-through'},
  listCard: {paddingVertical: 0},
  guarantees: {flexDirection: 'row', gap: spacing.md},
  guarantee: {flex: 1, minHeight: 122, padding: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md},
  guaranteeTitle: {fontSize: 14, fontWeight: '700', color: colors.ink, marginTop: spacing.md},
  guaranteeBody: {fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 4},
  footer: {backgroundColor: colors.surface, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, padding: spacing.md, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center'},
  footerLabel: {fontSize: 10, color: colors.muted},
  footerPrice: {fontSize: 20, color: colors.error, fontWeight: '900'},
  buy: {flex: 1, marginLeft: spacing.xl},
});
