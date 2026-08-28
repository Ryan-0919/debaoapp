import {useMemo, useState} from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Gift,
  Headphones,
  PlayCircle,
  Radio,
  Share2,
  ShieldCheck,
  Star,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {
  productMarketing,
  productReviews,
  productSyllabi,
  teacherInfo,
  type DetailIcon,
} from '@/data/productDetails';
import {findCatalogProduct, type ProductType} from '@/data/products';
import {orderService, paymentService} from '@/services';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'ProductDetail'>;

const typeColors: Record<ProductType, {background: string; foreground: string}> = {
  视频课程: {background: '#F0F0FF', foreground: '#4C4BEA'},
  直播课程: {background: '#FFF0F5', foreground: '#C0385A'},
  音频课程: {background: '#EAF7F7', foreground: '#1A8B8B'},
};

function Glyph({name, color, size = 18}: {name: DetailIcon; color: string; size?: number}) {
  const props = {color, size};
  switch (name) {
    case 'book': return <BookOpen {...props} />;
    case 'clock': return <Clock3 {...props} />;
    case 'gift': return <Gift {...props} />;
    case 'headphones': return <Headphones {...props} />;
    case 'radio': return <Radio {...props} />;
    case 'shield': return <ShieldCheck {...props} />;
    case 'target': return <Target {...props} />;
    case 'trophy': return <Trophy {...props} />;
    case 'users': return <Users {...props} />;
    case 'zap': return <Zap {...props} />;
  }
}

function TypeIcon({type, color}: {type: ProductType; color: string}) {
  if (type === '音频课程') return <Headphones color={color} size={13} />;
  if (type === '直播课程') return <Radio color={color} size={13} />;
  return <PlayCircle color={color} size={13} />;
}

export default function ProductDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const product = useMemo(() => findCatalogProduct(route.params.productId), [route.params.productId]);
  const syllabus = productSyllabi[product.id];
  const reviews = productReviews[product.id] ?? productReviews.p1;
  const marketing = productMarketing[product.id];
  const teacher = teacherInfo[product.teacher];
  const palette = typeColors[product.type];
  const [expanded, setExpanded] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [paying, setPaying] = useState(false);
  const visibleSyllabus = expanded ? syllabus.items : syllabus.items.slice(0, 4);
  const discount = product.originalPrice - product.price;

  const shareProduct = () => {
    Share.share({message: `${product.name} - 得宝法考`}).catch(() => undefined);
  };

  const pay = async () => {
    if (paying) return;
    setPaying(true);
    const order = await orderService.create(product);
    await paymentService.pay(order);
    setPaying(false);
    setSheetVisible(false);
    navigation.replace('PurchaseSuccess', {productName: product.name, orderId: order.id});
  };

  return (
    <AppScreen backgroundColor={colors.page} scroll={false} testID="product-detail-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" hitSlop={10} onPress={navigation.goBack} style={styles.headerButton} testID="product-detail-back">
          <ArrowLeft color={colors.body} size={22} />
        </Pressable>
        <View style={styles.headerSpacer} />
        <Pressable accessibilityLabel="分享" hitSlop={10} onPress={shareProduct} style={styles.headerButton} testID="product-detail-share">
          <Share2 color={colors.body} size={19} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} testID="product-detail-scroll">
        <View style={styles.coverWrap}>
          <Image resizeMode="cover" source={product.image} style={styles.cover} />
          {product.type === '音频课程' ? (
            <View style={styles.audioOverlay} testID="product-audio-overlay"><View style={styles.audioIcon}><Headphones color="#FFFFFF" size={32} /></View></View>
          ) : null}
          {product.type === '直播课程' ? (
            <View style={styles.liveBadge} testID="product-live-badge"><View style={styles.liveDot} /><Text style={styles.liveText}>直播课程</Text></View>
          ) : null}
        </View>

        <View style={styles.sectionFlush}>
          <View style={styles.tagRow}>
            <View style={styles.brandTag}><Text style={styles.brandTagText}>{product.category}</Text></View>
            <View style={[styles.typeTag, {backgroundColor: palette.background}]}>
              <TypeIcon color={palette.foreground} type={product.type} />
              <Text style={[styles.typeTagText, {color: palette.foreground}]} testID="product-detail-type">{product.type}</Text>
            </View>
            <View style={styles.stageTag}><Text style={styles.stageTagText}>{product.stage}</Text></View>
          </View>
          <Text style={styles.productName} testID="product-detail-name">{product.name}</Text>
          <Text style={styles.brief}>{product.brief}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>¥{product.price.toLocaleString()}</Text>
            <Text style={styles.originalPrice}>¥{product.originalPrice.toLocaleString()}</Text>
            <Text style={styles.discount}>省¥{discount.toLocaleString()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>已售 {product.sold.toLocaleString()} 份</Text>
            <View style={styles.ratingRow}>
              {Array.from({length: 5}).map((_, index) => <Star color={colors.warning} fill={colors.warning} key={index} size={11} />)}
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>课程包含</Text>
          <View style={styles.includeList}>
            {product.includes.map(item => (
              <View key={item} style={styles.includeRow}><CheckCircle2 color={colors.success} size={15} /><Text style={styles.includeText}>{item}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主讲老师</Text>
          <View style={styles.teacherRow}>
            <View style={[styles.teacherAvatar, product.teacher === '多位名师' && styles.teacherAvatarMulti]}><Text style={styles.teacherAvatarText}>{product.teacher === '多位名师' ? '多' : product.teacher[0]}</Text></View>
            <View style={styles.teacherCopy}>
              <Text style={styles.teacherName}>{product.teacher}</Text>
              <Text style={[styles.teacherTitle, {color: palette.foreground}]}>{teacher.title}</Text>
              <Text style={styles.teacherBio}>{teacher.bio}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{syllabus.heading}</Text>
          {visibleSyllabus.map((item, index) => (
            <View key={`${item.label}-${item.title}`} style={styles.syllabusRow} testID={`product-syllabus-item-${index}`}>
              <View style={styles.syllabusLabelWrap}><Text style={[styles.syllabusLabel, {backgroundColor: palette.background, color: palette.foreground}]}>{item.label}</Text></View>
              <Text style={styles.syllabusTitle}>{item.title}</Text>
              <Text style={styles.syllabusMeta}>{item.meta}</Text>
            </View>
          ))}
          {syllabus.items.length > 4 ? (
            <Pressable accessibilityRole="button" onPress={() => setExpanded(value => !value)} style={styles.expandButton} testID="product-syllabus-toggle">
              <Text style={styles.expandText}>{expanded ? '收起' : `展开全部 ${syllabus.items.length} 项`}</Text>
              {expanded ? <ChevronUp color={colors.brand} size={14} /> : <ChevronDown color={colors.brand} size={14} />}
            </Pressable>
          ) : null}
          <Text style={styles.syllabusFooter}>{syllabus.footer}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>交付方式</Text>
          <Text style={styles.delivery}>{product.delivery}</Text>
        </View>

        <View style={styles.marketingSection} testID="product-marketing">
          <View style={styles.marketingHeader}><View style={[styles.marketingMark, {backgroundColor: palette.foreground}]} /><Text style={styles.sectionTitleNoMargin}>课程详情</Text></View>
          <View style={[styles.marketingHero, {backgroundColor: marketing.heroColor}]}>
            <View style={styles.heroRule} /><Text style={styles.heroTitle}>{marketing.heroTitle}</Text><Text style={styles.heroSubtitle}>{marketing.heroSubtitle}</Text><View style={styles.heroRule} />
          </View>
          <View style={styles.statsRow}>
            {marketing.stats.map((stat, index) => (
              <View key={stat.label} style={[styles.stat, index < marketing.stats.length - 1 && styles.statDivider]}>
                <Glyph color={palette.foreground} name={stat.icon} size={20} /><Text style={styles.statValue}>{stat.value}</Text><Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.featuresBlock}>
            <Text style={styles.marketingHeading}>{marketing.featureHeading}</Text>
            {marketing.features.map(item => (
              <View key={item.title} style={styles.featureRow}>
                <View style={styles.featureIcon}><Glyph color={item.color} name={item.icon} /></View>
                <View style={styles.featureCopy}><Text style={styles.featureTitle}>{item.title}</Text><Text style={styles.featureDescription}>{item.description}</Text></View>
              </View>
            ))}
          </View>
          <Image resizeMode="cover" source={product.detailImage} style={styles.detailImage} />
          <Text style={styles.photoCaption}>{marketing.photoCaption}</Text>
          {marketing.timeline ? (
            <View style={styles.timelineBlock}>
              <Text style={styles.marketingHeading}>{marketing.timelineHeading}</Text>
              {marketing.timeline.map(step => (
                <View key={step.phase} style={styles.timelineRow}>
                  <View style={[styles.timelineMarker, {backgroundColor: step.color}]}><Text adjustsFontSizeToFit numberOfLines={1} style={styles.timelineMarkerText}>{step.marker}</Text></View>
                  <View style={styles.timelineCopy}><Text style={styles.featureTitle}>{step.title}</Text><Text style={styles.featureDescription}>{step.detail}</Text></View>
                  <Text style={styles.timelinePhase}>{step.phase}</Text>
                </View>
              ))}
            </View>
          ) : null}
          <View style={styles.guaranteeBlock}>
            <Text style={styles.guaranteeHeading}>服务承诺</Text>
            <View style={styles.guaranteeGrid}>
              {marketing.guarantees.map(item => (
                <View key={item.text} style={styles.guaranteeItem}><Glyph color={item.color} name={item.icon} size={16} /><Text style={styles.guaranteeText}>{item.text}</Text></View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section} testID="product-reviews">
          <View style={styles.reviewHeader}><Text style={styles.sectionTitleNoMargin}>学员评价</Text><View style={styles.reviewScore}><Text style={styles.reviewScoreValue}>4.9</Text><Text style={styles.reviewScoreTotal}>/ 5.0</Text></View></View>
          {reviews.map((review, index) => (
            <View key={`${review.name}-${review.date}`} style={[styles.review, index < reviews.length - 1 && styles.reviewDivider]} testID={`product-review-${index}`}>
              <View style={styles.reviewMeta}>
                <View style={styles.reviewerIdentity}><View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{review.name[0]}</Text></View><Text style={styles.reviewerName}>{review.name}</Text>{review.tag ? <Text style={styles.reviewTag}>{review.tag}</Text> : null}</View>
                <Text style={styles.reviewStars}>{'★'.repeat(review.stars)}<Text style={styles.reviewStarsOff}>{'★'.repeat(5 - review.stars)}</Text></Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text><Text style={styles.reviewDate}>{review.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.purchaseBar, sheetVisible && styles.purchaseBarHidden]}>
        <View><Text style={styles.purchaseLabel}>限时优惠</Text><Text style={styles.purchasePrice}>¥{product.price.toLocaleString()}</Text></View>
        <Pressable accessibilityRole="button" onPress={() => setSheetVisible(true)} style={({pressed}) => [styles.buyButton, pressed && styles.pressed]} testID="product-buy"><Text style={styles.buyText}>立即购买</Text></Pressable>
      </View>

      <Modal animationType="slide" navigationBarTranslucent onRequestClose={() => setSheetVisible(false)} transparent visible={sheetVisible}>
        <View style={styles.overlay}>
          <Pressable accessibilityLabel="关闭购买弹层" onPress={() => setSheetVisible(false)} style={styles.overlayDismiss} />
          <View style={styles.sheet} testID="product-purchase-sheet">
            <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>确认购买</Text><Pressable accessibilityLabel="关闭" hitSlop={8} onPress={() => setSheetVisible(false)}><X color={colors.ink} size={21} /></Pressable></View>
            <View style={styles.sheetProduct}>
              <Image resizeMode="cover" source={product.image} style={styles.sheetImage} />
              <View style={styles.sheetProductCopy}><Text numberOfLines={2} style={styles.sheetProductName}>{product.name}</Text><View style={[styles.sheetType, {backgroundColor: palette.background}]}><TypeIcon color={palette.foreground} type={product.type} /><Text style={[styles.sheetTypeText, {color: palette.foreground}]}>{product.type}</Text></View></View>
            </View>
            <View style={styles.sheetPrices}>
              <View style={styles.sheetPriceRow}><Text style={styles.sheetPriceLabel}>课程原价</Text><Text style={styles.sheetOriginal}>¥{product.originalPrice.toLocaleString()}</Text></View>
              <View style={styles.sheetPriceRow}><Text style={styles.sheetPriceLabel}>限时优惠</Text><Text style={styles.sheetDiscount}>−¥{discount.toLocaleString()}</Text></View>
              <View style={[styles.sheetPriceRow, styles.sheetTotalRow]}><Text style={styles.sheetTotalLabel}>实付金额</Text><Text style={styles.sheetTotal}>¥{product.price.toLocaleString()}</Text></View>
            </View>
            <View style={styles.sheetNotice}><Text style={styles.sheetNoticeText}>购买后系统将自动开通课程权限。如需发票，请在"订单与已购"中申请。</Text></View>
            <View style={styles.sheetActions}>
              <Pressable disabled={paying} onPress={() => setSheetVisible(false)} style={styles.cancelButton} testID="product-purchase-cancel"><Text style={styles.cancelText}>取消</Text></Pressable>
              <Pressable disabled={paying} onPress={pay} style={[styles.confirmButton, paying && styles.disabled]} testID="product-purchase-confirm"><Text style={styles.confirmText}>{paying ? '支付中…' : `确认支付 ¥${product.price.toLocaleString()}`}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  headerButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  headerSpacer: {flex: 1},
  scrollContent: {paddingBottom: 12},
  coverWrap: {height: 210, backgroundColor: colors.line}, cover: {width: '100%', height: 210},
  audioOverlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.36)', alignItems: 'center', justifyContent: 'center'},
  audioIcon: {width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center'},
  liveBadge: {position: 'absolute', left: 16, bottom: 12, height: 28, borderRadius: 14, paddingHorizontal: 12, backgroundColor: 'rgba(192,56,90,0.93)', flexDirection: 'row', alignItems: 'center', gap: 8},
  liveDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF'}, liveText: {fontSize: 12, color: '#FFFFFF', fontWeight: '700'},
  sectionFlush: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, backgroundColor: colors.surface},
  section: {marginTop: 12, padding: 16, backgroundColor: colors.surface},
  tagRow: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12},
  brandTag: {height: 21, paddingHorizontal: 8, borderRadius: 4, backgroundColor: colors.brandLight, justifyContent: 'center'}, brandTagText: {fontSize: 11, color: colors.brand, fontWeight: '600'},
  typeTag: {height: 21, paddingHorizontal: 8, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4}, typeTagText: {fontSize: 11, fontWeight: '600'},
  stageTag: {height: 21, paddingHorizontal: 8, borderRadius: 4, backgroundColor: colors.page, justifyContent: 'center'}, stageTagText: {fontSize: 11, color: colors.muted, fontWeight: '600'},
  productName: {fontSize: 17, lineHeight: 24, fontWeight: '800', color: colors.ink}, brief: {fontSize: 13, lineHeight: 20, color: colors.body, marginTop: 8},
  priceRow: {marginTop: 14, flexDirection: 'row', alignItems: 'baseline', gap: 8}, price: {fontSize: 24, lineHeight: 30, fontWeight: '900', color: colors.brand}, originalPrice: {fontSize: 14, color: '#C0C5D0', textDecorationLine: 'line-through'}, discount: {fontSize: 11, lineHeight: 19, paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden', color: '#FFFFFF', backgroundColor: colors.error, fontWeight: '700'},
  metaRow: {marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 16}, metaText: {fontSize: 12, color: colors.muted}, ratingRow: {flexDirection: 'row', alignItems: 'center', gap: 1}, ratingText: {fontSize: 11, color: colors.muted, marginLeft: 4},
  sectionTitle: {fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.ink, marginBottom: 12}, sectionTitleNoMargin: {fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.ink},
  includeList: {gap: 10}, includeRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 8}, includeText: {flex: 1, fontSize: 13, lineHeight: 18, color: colors.body},
  teacherRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12}, teacherAvatar: {width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'}, teacherAvatarMulti: {backgroundColor: '#C0385A'}, teacherAvatarText: {fontSize: 20, color: '#FFFFFF', fontWeight: '800'},
  teacherCopy: {flex: 1}, teacherName: {fontSize: 15, lineHeight: 20, fontWeight: '800', color: colors.ink}, teacherTitle: {fontSize: 11, lineHeight: 16, marginTop: 2}, teacherBio: {fontSize: 13, lineHeight: 20, color: colors.body, marginTop: 8},
  syllabusRow: {minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.page}, syllabusLabelWrap: {width: 72}, syllabusLabel: {alignSelf: 'flex-start', fontSize: 11, lineHeight: 19, paddingHorizontal: 8, borderRadius: 4, overflow: 'hidden', fontWeight: '600'}, syllabusTitle: {flex: 1, fontSize: 13, lineHeight: 18, color: colors.ink}, syllabusMeta: {fontSize: 11, color: colors.muted},
  expandButton: {height: 38, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4}, expandText: {fontSize: 13, color: colors.brand}, syllabusFooter: {fontSize: 11, lineHeight: 16, color: '#C0C5D0', textAlign: 'center', marginTop: 4}, delivery: {fontSize: 13, lineHeight: 20, color: colors.body},
  marketingSection: {marginTop: 12, backgroundColor: colors.surface, overflow: 'hidden'}, marketingHeader: {height: 46, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.page}, marketingMark: {width: 4, height: 16, borderRadius: 2},
  marketingHero: {height: 190, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center'}, heroRule: {width: 48, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.4)'}, heroTitle: {fontSize: 22, lineHeight: 30, color: '#FFFFFF', fontWeight: '800', marginVertical: 14}, heroSubtitle: {fontSize: 13, lineHeight: 21, color: 'rgba(255,255,255,0.84)', textAlign: 'center', marginBottom: 14},
  statsRow: {flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.page}, stat: {width: '25%', height: 88, alignItems: 'center', justifyContent: 'center', gap: 3}, statDivider: {borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.page}, statValue: {fontSize: 15, lineHeight: 20, fontWeight: '800', color: colors.ink}, statLabel: {fontSize: 10, color: colors.muted},
  featuresBlock: {paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.page}, marketingHeading: {fontSize: 14, lineHeight: 20, fontWeight: '800', color: colors.ink, textAlign: 'center', marginBottom: 16}, featureRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16}, featureIcon: {width: 32, height: 32, borderRadius: 8, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'}, featureCopy: {flex: 1}, featureTitle: {fontSize: 13, lineHeight: 18, color: colors.ink, fontWeight: '700'}, featureDescription: {fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: 2},
  detailImage: {width: '100%', height: 180}, photoCaption: {fontSize: 11, lineHeight: 28, color: colors.muted, textAlign: 'center', backgroundColor: colors.page},
  timelineBlock: {paddingHorizontal: 16, paddingVertical: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.page}, timelineRow: {minHeight: 52, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12}, timelineMarker: {width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'}, timelineMarkerText: {width: 34, textAlign: 'center', color: '#FFFFFF', fontSize: 10, fontWeight: '800'}, timelineCopy: {flex: 1, paddingTop: 4}, timelinePhase: {fontSize: 10, lineHeight: 40, color: '#C0C5D0'},
  guaranteeBlock: {padding: 16, backgroundColor: '#F8F9FF'}, guaranteeHeading: {fontSize: 12, color: colors.muted, fontWeight: '700', textAlign: 'center', marginBottom: 12}, guaranteeGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8}, guaranteeItem: {width: '48.8%', minHeight: 48, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 8}, guaranteeText: {flex: 1, fontSize: 11, lineHeight: 16, color: colors.body},
  reviewHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}, reviewScore: {flexDirection: 'row', alignItems: 'baseline', gap: 3}, reviewScoreValue: {fontSize: 18, color: colors.brand, fontWeight: '800'}, reviewScoreTotal: {fontSize: 12, color: colors.muted}, review: {paddingBottom: 12, marginBottom: 12}, reviewDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.page}, reviewMeta: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6}, reviewerIdentity: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8}, reviewAvatar: {width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'}, reviewAvatarText: {fontSize: 11, color: '#FFFFFF', fontWeight: '800'}, reviewerName: {fontSize: 12, color: colors.ink, fontWeight: '600'}, reviewTag: {fontSize: 10, lineHeight: 18, paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden', color: colors.success, backgroundColor: colors.mint}, reviewStars: {fontSize: 12, color: colors.warning}, reviewStarsOff: {color: colors.line}, reviewText: {fontSize: 13, lineHeight: 20, color: colors.body}, reviewDate: {fontSize: 11, color: '#C0C5D0', marginTop: 4},
  purchaseBar: {minHeight: 72, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line}, purchaseBarHidden: {opacity: 0}, purchaseLabel: {fontSize: 11, color: colors.muted}, purchasePrice: {fontSize: 18, lineHeight: 24, color: colors.brand, fontWeight: '900'}, buyButton: {flex: 1, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, buyText: {fontSize: 15, color: '#FFFFFF', fontWeight: '700'}, pressed: {opacity: 0.72},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay}, overlayDismiss: {flex: 1}, sheet: {paddingHorizontal: 20, paddingBottom: 28, backgroundColor: colors.surface, borderTopLeftRadius: 12, borderTopRightRadius: 12}, sheetHeader: {height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, sheetTitle: {fontSize: 18, color: colors.ink, fontWeight: '800'}, sheetProduct: {paddingBottom: 16, flexDirection: 'row', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, sheetImage: {width: 64, height: 48, borderRadius: 4, backgroundColor: colors.line}, sheetProductCopy: {flex: 1}, sheetProductName: {fontSize: 14, lineHeight: 19, color: colors.ink, fontWeight: '700'}, sheetType: {alignSelf: 'flex-start', height: 21, marginTop: 5, paddingHorizontal: 8, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4}, sheetTypeText: {fontSize: 11, fontWeight: '600'},
  sheetPrices: {paddingVertical: 14, gap: 12}, sheetPriceRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}, sheetPriceLabel: {fontSize: 14, color: colors.body}, sheetOriginal: {fontSize: 14, color: colors.muted, textDecorationLine: 'line-through'}, sheetDiscount: {fontSize: 14, color: colors.error}, sheetTotalRow: {paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line}, sheetTotalLabel: {fontSize: 15, color: colors.ink, fontWeight: '700'}, sheetTotal: {fontSize: 15, color: colors.brand, fontWeight: '800'}, sheetNotice: {padding: 12, borderRadius: 8, backgroundColor: colors.page}, sheetNoticeText: {fontSize: 12, lineHeight: 18, color: colors.muted}, sheetActions: {marginTop: 20, flexDirection: 'row', gap: 8}, cancelButton: {flex: 1, height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'}, cancelText: {fontSize: 14, color: colors.body}, confirmButton: {flex: 1, height: 48, borderRadius: 8, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center'}, confirmText: {fontSize: 14, color: '#FFFFFF', fontWeight: '700'}, disabled: {opacity: 0.65},
});
