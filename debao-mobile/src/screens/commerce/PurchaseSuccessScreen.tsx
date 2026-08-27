import {StyleSheet, Text, View} from 'react-native';
import {CheckCircle2} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {AppButton, MockNotice} from '@/components/ui';
import {colors, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'PurchaseSuccess'>;

export default function PurchaseSuccessScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  return (
    <AppScreen scroll={false}>
      <View style={styles.content}>
        <View style={styles.icon}><CheckCircle2 size={52} color={colors.success} /></View>
        <Text style={styles.title}>购买流程演示完成</Text>
        <Text style={styles.product}>{route.params.productName}</Text>
        <Text style={styles.order}>Mock 订单号：{route.params.orderId}</Text>
        <MockNotice text="这不是实际扣款结果；正式支付、订单签名与课程权益需由服务端确认。" />
        <View style={styles.actions}>
          <AppButton label="查看我的课程" onPress={() => navigation.navigate('MainTabs', {screen: 'Courses'})} />
          <AppButton label="查看订单" variant="secondary" onPress={() => navigation.replace('OrderDetail', {orderId: route.params.orderId})} />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {flex: 1, justifyContent: 'center', padding: spacing.xl},
  icon: {alignItems: 'center'},
  title: {fontSize: 22, fontWeight: '800', textAlign: 'center', color: colors.ink, marginTop: spacing.lg},
  product: {fontSize: 14, lineHeight: 21, color: colors.body, textAlign: 'center', marginTop: spacing.md},
  order: {fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: spacing.sm},
  actions: {gap: spacing.md, marginTop: spacing.xl},
});
