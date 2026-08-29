import {useEffect, useMemo, useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Search} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {catalogProducts} from '@/data/products';
import {productService} from '@/services';
import {environment} from '@/config/environment';
import {colors} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const categories = ['全部', '主客一体', '客观题', '主观题'] as const;
const types = ['全部', '视频课程', '直播课程', '音频课程', '书籍'] as const;

export default function MallScreen() {
  const navigation = useNavigation<Navigation>();
  const [category, setCategory] = useState<(typeof categories)[number]>('全部');
  const [type, setType] = useState<(typeof types)[number]>('全部');
  const [products, setProducts] = useState(catalogProducts);

  useEffect(() => {
    if (environment.useMocks) return;
    let active = true;
    productService.list().then(items => {
      if (!active) return;
      setProducts(items.map(item => {
        const local = catalogProducts.find(product => product.id === item.id);
        return local ? {...local, name: item.name, category: item.category, price: item.price, originalPrice: item.originalPrice, sold: item.sold} : null;
      }).filter((item): item is (typeof catalogProducts)[number] => Boolean(item)));
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const filteredProducts = useMemo(
    () => products.filter(product =>
      (category === '全部' || product.category === category) &&
      (type === '全部' || product.type === type)),
    [category, products, type],
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
