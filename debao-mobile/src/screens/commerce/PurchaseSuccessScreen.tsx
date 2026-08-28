import {Pressable, StyleSheet, Text, View} from 'react-native';
import {CheckCircle2} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {AppButton} from '@/components/ui';
import {findCatalogProduct, productCourseIds} from '@/data/products';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'PurchaseSuccess'>;

export default function PurchaseSuccessScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const product = findCatalogProduct(route.params.productId);
  const courseId = productCourseIds[product.id];
  const activeColor = product.autoStart ? colors.success : '#A87000';

  const openCourse = () => {
    if (courseId) {
      navigation.navigate('CourseDetail', {courseId});
      return;
    }
    navigation.replace('MainTabs', {screen: 'Courses'});
  };

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="purchase-success-screen">
      <View style={styles.content}>
        <View style={styles.successIcon}><CheckCircle2 color={colors.success} size={40} /></View>
        <Text style={styles.title}>购买成功</Text>
        <Text style={styles.product} testID="purchase-success-product">{route.params.productName}</Text>

        <View
          style={[styles.activation, {backgroundColor: product.autoStart ? colors.mint : colors.gold}]}
          testID="purchase-success-activation">
          <View style={styles.activationTitleRow}>
            <CheckCircle2 color={activeColor} size={15} />
            <Text style={[styles.activationTitle, {color: activeColor}]} testID="purchase-success-status">
              {product.autoStart ? '课程权限已自动开通' : '课程将于开课日自动激活'}
            </Text>
          </View>
          <Text style={styles.activationBody}>
            {product.autoStart ? '可在「我的课程」中立即开始学习' : '开课后将收到通知，届时可进入课程'}
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            label={courseId ? '进入课程' : '查看我的课程'}
            onPress={openCourse}
            testID="purchase-success-course"
          />
          <AppButton
            label="查看订单"
            onPress={() => navigation.navigate('OrderList')}
            testID="purchase-success-orders"
            variant="secondary"
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.replace('MainTabs', {screen: 'Home'})}
            style={({pressed}) => [styles.homeButton, pressed && styles.pressed]}
            testID="purchase-success-home"
          >
            <Text style={styles.homeText}>返回首页</Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {flex: 1, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center'},
  successIcon: {width: 80, height: 80, borderRadius: 40, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 20},
  title: {fontSize: 20, lineHeight: 28, fontWeight: '800', textAlign: 'center', color: colors.ink},
  product: {fontSize: 14, lineHeight: 22, color: colors.body, textAlign: 'center', marginTop: 8, marginBottom: 12},
  activation: {width: '100%', maxWidth: 280, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md, marginBottom: 32},
  activationTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  activationTitle: {fontSize: 13, lineHeight: 18, fontWeight: '700'},
  activationBody: {fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 4, marginLeft: 23},
  actions: {width: '100%', maxWidth: 280, gap: 8},
  homeButton: {height: 32, alignItems: 'center', justifyContent: 'center'},
  homeText: {fontSize: 13, color: colors.brand},
  pressed: {opacity: 0.65},
});
