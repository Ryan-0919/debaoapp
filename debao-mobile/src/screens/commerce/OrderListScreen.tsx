import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, ChevronRight} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {prototypeOrders} from '@/data/orders';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function OrderListScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="order-list-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={({pressed}) => [styles.headerSide, pressed && styles.pressed]}>
          <ChevronLeft size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>订单与已购</Text>
        <View style={styles.headerSide} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.orderGroup}>
          {prototypeOrders.map((order, index) => (
            <Pressable
              key={order.id}
              accessibilityLabel={`${order.status}, ${order.productName}, ${order.date}, ¥${order.amount.toLocaleString()}`}
              testID={`order-row-${order.id}`}
              onPress={() => navigation.navigate('OrderDetail', {orderId: order.id})}
              style={({pressed}) => [styles.orderRow, index < prototypeOrders.length - 1 && styles.divider, pressed && styles.rowPressed]}>
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
      </ScrollView>
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
});
