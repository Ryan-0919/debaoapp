import {useMemo, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {Search} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface MallProduct {
  id: string;
  name: string;
  category: '主客一体' | '客观题' | '主观题';
  type: '视频课程' | '直播课程' | '音频课程' | '书籍';
  price: number;
  originalPrice: number;
  sold: number;
  brief: string;
  image: ImageSourcePropType;
}

const categories = ['全部', '主客一体', '客观题', '主观题'] as const;
const types = ['全部', '视频课程', '直播课程', '音频课程', '书籍'] as const;

const mallProducts: MallProduct[] = [
  {
    id: 'p1',
    name: '2024法考全程班（主客一体·视频精讲）',
    category: '主客一体',
    type: '视频课程',
    price: 3980,
    originalPrice: 5200,
    sold: 2847,
    brief: '覆盖客观题全科+主观题冲刺，名师全程讲授，配套题库、模拟卷和主观题批改服务。',
    image: require('@/assets/images/home-library.png'),
  },
  {
    id: 'p2',
    name: '2024客观题精英班（视频+直播）',
    category: '客观题',
    type: '视频课程',
    price: 1980,
    originalPrice: 2800,
    sold: 5312,
    brief: '系统精讲客观题全科知识点，覆盖卷一卷二，配套章节练习和历年真题解析。',
    image: require('@/assets/images/home-office.png'),
  },
  {
    id: 'p3',
    name: '2024主观题冲刺班（精讲+批改）',
    category: '主观题',
    type: '视频课程',
    price: 1280,
    originalPrice: 1680,
    sold: 1893,
    brief: '主观题专项突破，以历年真题案例为核心，精讲答题逻辑与规范，配套批改服务。',
    image: require('@/assets/images/course-subjective.png'),
  },
  {
    id: 'p4',
    name: '法考直播冲刺班（考前30天）',
    category: '客观题',
    type: '直播课程',
    price: 680,
    originalPrice: 880,
    sold: 3102,
    brief: '考前30天密集直播冲刺，押题预测、重点串讲，配合模拟考试查漏补缺。',
    image: require('@/assets/images/product-live.png'),
  },
  {
    id: 'p5',
    name: '民法音频精讲（通勤随听版）',
    category: '客观题',
    type: '音频课程',
    price: 398,
    originalPrice: 598,
    sold: 4217,
    brief: '全程音频授课，利用碎片时间随时随地听课，配套逐字稿与知识点卡片，通勤路上高效备考。',
    image: require('@/assets/images/product-audio-civil.png'),
  },
  {
    id: 'p6',
    name: '法考全科音频串讲班',
    category: '主客一体',
    type: '音频课程',
    price: 880,
    originalPrice: 1280,
    sold: 2091,
    brief: '名师精讲全科核心考点，音频形式高效输出，配合题库随时检验，适合已有基础的二战考生。',
    image: require('@/assets/images/product-audio-all.png'),
  },
];

export default function MallScreen() {
  const navigation = useNavigation<Navigation>();
  const [category, setCategory] = useState<(typeof categories)[number]>('全部');
  const [type, setType] = useState<(typeof types)[number]>('全部');

  const filteredProducts = useMemo(
    () => mallProducts.filter(product =>
      (category === '全部' || product.category === category) &&
      (type === '全部' || product.type === type)),
    [category, type],
  );

  return (
    <AppScreen scroll={false} testID="mall-screen">
      <View style={styles.topBar}>
        <View style={styles.topSide} />
        <Text style={styles.topTitle}>商城</Text>
        <View style={styles.topSide} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Search color={colors.muted} size={15} />
          <Text style={styles.searchPlaceholder}>搜索课程、书籍…</Text>
        </View>
      </View>

      <View style={styles.filters}>
        <ScrollView
          contentContainerStyle={styles.categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {categories.map(item => {
            const active = item === category;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{selected: active}}
                hitSlop={4}
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.categoryButton, active && styles.categoryButtonActive]}
                testID={`mall-category-${item}`}>
                <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView
          contentContainerStyle={styles.typeList}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {types.map(item => {
            const active = item === type;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{selected: active}}
                key={item}
                onPress={() => setType(item)}
                style={[styles.typeButton, active && styles.typeButtonActive]}
                testID={`mall-type-${item}`}>
                <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{item}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        testID="mall-product-list">
        {filteredProducts.map(product => (
          <Pressable
            accessibilityLabel={product.name}
            accessibilityRole="button"
            key={product.id}
            onPress={() => navigation.navigate('ProductDetail', {productId: product.id})}
            style={({pressed}) => [styles.product, pressed && styles.pressed]}
            testID={`mall-product-${product.id}`}>
            <Image resizeMode="cover" source={product.image} style={styles.productImage} />
            <View style={styles.productCopy}>
              <View style={styles.tags}>
                <Text style={styles.categoryTag}>{product.category}</Text>
                <Text style={styles.typeTag}>{product.type}</Text>
              </View>
              <Text numberOfLines={2} style={styles.productName}>{product.name}</Text>
              <Text numberOfLines={1} style={styles.productBrief}>{product.brief}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>¥{product.price.toLocaleString()}</Text>
                <Text style={styles.originalPrice}>¥{product.originalPrice.toLocaleString()}</Text>
                <Text style={styles.sold}>已售{product.sold.toLocaleString()}</Text>
              </View>
            </View>
          </Pressable>
        ))}
        {filteredProducts.length === 0 && (
          <View style={styles.empty} testID="mall-empty-state">
            <Text style={styles.emptyText}>暂无符合条件的课程</Text>
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center'},
  topSide: {width: 40},
  topTitle: {flex: 1, textAlign: 'center', fontSize: 16, lineHeight: 22, color: colors.ink, fontWeight: '700'},
  searchSection: {height: 49, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, justifyContent: 'flex-end'},
  searchBox: {height: 36, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.page, flexDirection: 'row', alignItems: 'center', gap: 8},
  searchPlaceholder: {fontSize: 13, lineHeight: 18, color: '#C0C5D0'},
  filters: {backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  categoryList: {height: 40, paddingHorizontal: 16},
  categoryButton: {height: 40, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', alignItems: 'center', justifyContent: 'center'},
  categoryButtonActive: {borderBottomColor: colors.brand},
  categoryLabel: {fontSize: 13, color: colors.muted, fontWeight: '500'},
  categoryLabelActive: {color: colors.brand},
  typeList: {paddingHorizontal: 16, paddingBottom: 10, gap: 6},
  typeButton: {height: 28, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'},
  typeButtonActive: {backgroundColor: colors.brand, borderColor: colors.brand},
  typeLabel: {fontSize: 12, color: colors.body, fontWeight: '500'},
  typeLabelActive: {color: '#FFFFFF'},
  productList: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 12},
  product: {height: 104, borderRadius: 8, backgroundColor: colors.surface, overflow: 'hidden', flexDirection: 'row'},
  productImage: {width: 110, height: 104, backgroundColor: colors.line},
  productCopy: {flex: 1, minWidth: 0, padding: 12},
  tags: {height: 18, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 6},
  categoryTag: {fontSize: 11, lineHeight: 17, paddingHorizontal: 8, borderRadius: 4, color: colors.brand, backgroundColor: colors.brandLight, fontWeight: '500'},
  typeTag: {fontSize: 11, lineHeight: 17, paddingHorizontal: 8, borderRadius: 4, color: colors.muted, backgroundColor: colors.page, fontWeight: '500'},
  productName: {fontSize: 13, lineHeight: 18, color: colors.ink, fontWeight: '700'},
  productBrief: {fontSize: 11, lineHeight: 16, color: colors.muted, marginTop: 3},
  priceRow: {marginTop: 4, flexDirection: 'row', alignItems: 'baseline', gap: 6},
  price: {fontSize: 15, lineHeight: 20, color: colors.brand, fontWeight: '800'},
  originalPrice: {fontSize: 11, lineHeight: 16, color: '#C0C5D0', textDecorationLine: 'line-through'},
  sold: {fontSize: 11, lineHeight: 16, color: colors.muted, marginLeft: 'auto'},
  pressed: {opacity: 0.72},
  empty: {paddingTop: 64, alignItems: 'center'},
  emptyText: {fontSize: 14, color: colors.muted},
});
