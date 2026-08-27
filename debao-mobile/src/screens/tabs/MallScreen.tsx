import {Pressable, StyleSheet, Text, View} from 'react-native';
import {BookOpen, Headphones, Radio, ShoppingBag} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {Pill, SectionTitle} from '@/components/ui';
import {products} from '@/data/mock';
import {colors, radius, shadows, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const categoryIcons = [BookOpen, Radio, Headphones];

export default function MallScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <AppScreen testID="mall-screen">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>精选课程</Text>
          <Text style={styles.subtitle}>适合不同阶段的系统备考方案</Text>
        </View>
        <ShoppingBag size={24} color={colors.ink} onPress={() => navigation.navigate('OrderList')} />
      </View>
      <View style={styles.content}>
        <View style={styles.promo}>
          <View style={styles.promoCopy}>
            <Text style={styles.promoEyebrow}>2026 法考</Text>
            <Text style={styles.promoTitle}>主客一体，全程有计划</Text>
            <Text style={styles.promoBody}>课程、题库、批改与学习报告集中管理</Text>
          </View>
          <View style={styles.promoBadge}><Text style={styles.promoBadgeText}>得宝</Text></View>
        </View>

        <SectionTitle title="热门推荐" />
        {products.map((product, index) => {
          const Icon = categoryIcons[index] ?? BookOpen;
          return (
            <Pressable
              key={product.id}
              onPress={() => navigation.navigate('ProductDetail', {productId: product.id})}
              style={({pressed}) => [styles.product, pressed && styles.pressed]}>
              <View style={[styles.cover, {backgroundColor: product.accent}]}>
                <Icon size={30} color="#FFFFFF" />
                <Text style={styles.coverLabel}>{product.category}</Text>
              </View>
              <View style={styles.productCopy}>
                <Pill label={product.category} />
                <Text numberOfLines={2} style={styles.productTitle}>{product.name}</Text>
                <Text style={styles.sold}>{product.sold.toLocaleString()} 人已购</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>¥{product.price.toLocaleString()}</Text>
                  <Text style={styles.original}>¥{product.originalPrice.toLocaleString()}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: spacing.lg, height: 76, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  title: {fontSize: 24, fontWeight: '800', color: colors.ink},
  subtitle: {fontSize: 12, color: colors.muted, marginTop: 4},
  content: {paddingHorizontal: spacing.lg},
  promo: {marginTop: spacing.lg, minHeight: 150, backgroundColor: colors.ink, borderRadius: radius.md, padding: spacing.xl, flexDirection: 'row', overflow: 'hidden'},
  promoCopy: {flex: 1},
  promoEyebrow: {fontSize: 12, fontWeight: '800', color: colors.action},
  promoTitle: {fontSize: 20, lineHeight: 28, color: '#FFFFFF', fontWeight: '800', marginTop: spacing.sm},
  promoBody: {fontSize: 12, lineHeight: 18, color: '#C5C7D0', marginTop: spacing.sm},
  promoBadge: {width: 76, height: 76, borderRadius: 38, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', transform: [{rotate: '-8deg'}]},
  promoBadgeText: {fontSize: 20, fontWeight: '900', color: colors.ink},
  product: {backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', ...shadows.card},
  cover: {width: 112, minHeight: 126, borderRadius: radius.md, padding: spacing.md, justifyContent: 'space-between'},
  coverLabel: {fontSize: 13, fontWeight: '800', color: '#FFFFFF'},
  productCopy: {flex: 1, marginLeft: spacing.md, alignItems: 'flex-start'},
  productTitle: {fontSize: 15, fontWeight: '700', lineHeight: 21, color: colors.ink, marginTop: spacing.sm},
  sold: {fontSize: 11, color: colors.muted, marginTop: 5},
  priceRow: {marginTop: 'auto', flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm},
  price: {fontSize: 18, fontWeight: '800', color: colors.error},
  original: {fontSize: 11, color: colors.muted, textDecorationLine: 'line-through'},
  pressed: {opacity: 0.62},
});
