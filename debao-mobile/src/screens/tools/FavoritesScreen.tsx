import {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ChevronLeft, ChevronRight, Star} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {environment} from '@/config/environment';
import {questionService} from '@/services';
import type {QuestionFavorite} from '@/services';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const FAVORITES = [
  {id: 'favorite-1', subject: '民法', year: '2023', title: '关于善意取得制度适用的判断（第2题）'},
  {id: 'favorite-2', subject: '民法典', year: undefined, title: '善意取得——《民法典》第311条'},
  {id: 'favorite-3', subject: '民法', year: '2022', title: '关于诉讼时效适用规则的判断（第3题）'},
  {id: 'favorite-4', subject: '刑法', year: '2023', title: '犯罪未完成形态的认定（第5题）'},
] as const;
type FavoriteItem = {id: string; subject: string; year?: string; title: string};

function toUiFavorite(item: QuestionFavorite) {
  return {id: item.id, subject: '题库', year: undefined as string | undefined, title: item.question?.stem ?? '收藏题目'};
}

export default function FavoritesScreen() {
  const navigation = useNavigation<Navigation>();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([...FAVORITES]);
  const [loading, setLoading] = useState(!environment.useMocks);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (environment.useMocks) return;
    setLoading(true);
    setError('');
    try {
      setFavorites((await questionService.listFavorites()).map(toUiFavorite));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '收藏加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load().catch(() => undefined); }, [load]);

  const remove = async (id: string) => {
    if (environment.useMocks) return;
    try {
      await questionService.removeFavorite(id);
      setFavorites(items => items.filter(item => item.id !== id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '取消收藏失败，请稍后重试');
    }
  };

  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="favorites-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" accessibilityRole="button" hitSlop={6} onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
          <ChevronLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>收藏夹</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} testID="favorites-scroll">
        <Text style={styles.summary} testID="favorites-summary">共 {favorites.length} 条收藏</Text>
        {loading ? <Text testID="favorites-loading" style={styles.stateText}>正在加载收藏...</Text> : null}
        {error ? <View testID="favorites-error" style={styles.errorBox}><Text accessibilityRole="alert" style={styles.errorText}>{error}</Text><Pressable testID="favorites-retry" onPress={load}><Text style={styles.retryText}>重新加载</Text></Pressable></View> : null}
        <View style={styles.list}>
          {favorites.map((favorite, index) => (
            <Pressable
              key={favorite.id}
              accessibilityRole="button"
              accessibilityLabel={`${favorite.subject}${favorite.year ? ` ${favorite.year}年` : ''} ${favorite.title}`}
              testID={favorite.id}
              onPress={() => navigation.navigate('ObjectiveAnswer', {mode: 'chapter', title: '收藏题目'})}
              style={({pressed}) => [styles.row, index < favorites.length - 1 && styles.rowDivider, pressed && styles.pressed]}>
              <Pressable accessibilityLabel={`取消收藏${favorite.title}`} testID={`remove-favorite-${favorite.id}`} onPress={event => { event.stopPropagation(); remove(favorite.id).catch(() => undefined); }} style={styles.removeButton}>
                <Star size={16} color="#A87000" fill="#A87000" style={styles.star} />
              </Pressable>
              <View style={styles.rowCopy}>
                <View style={styles.tags}>
                  <View style={styles.tag}><Text style={styles.tagText}>{favorite.subject}</Text></View>
                  {favorite.year ? <View style={styles.tag}><Text style={styles.tagText}>{favorite.year}年</Text></View> : null}
                </View>
                <Text numberOfLines={2} style={styles.title}>{favorite.title}</Text>
              </View>
              <ChevronRight size={14} color="#C0C5D0" style={styles.chevron} />
            </Pressable>
          ))}
        </View>
        {!loading && !favorites.length ? <Text testID="favorites-empty" style={styles.stateText}>暂无收藏题目</Text> : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  backButton: {width: 32, height: 40, alignItems: 'flex-start', justifyContent: 'center'},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 14, lineHeight: 19, fontWeight: '700', color: colors.ink},
  headerSide: {width: 32},
  content: {paddingBottom: 24},
  summary: {height: 39, paddingHorizontal: 16, paddingTop: 11, fontSize: 12, lineHeight: 17, color: colors.muted},
  list: {marginHorizontal: 16, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface},
  row: {minHeight: 70, paddingHorizontal: 16, paddingVertical: 13, flexDirection: 'row', alignItems: 'flex-start'},
  rowDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line},
  star: {marginTop: 2},
  rowCopy: {flex: 1, minWidth: 0, marginLeft: 12, marginRight: 8},
  tags: {height: 21, flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5},
  tag: {height: 21, paddingHorizontal: 8, borderRadius: 3, backgroundColor: colors.page, alignItems: 'center', justifyContent: 'center'},
  tagText: {fontSize: 10, lineHeight: 14, color: colors.body},
  title: {fontSize: 13, lineHeight: 19, color: colors.ink},
  chevron: {marginTop: 3},
  pressed: {opacity: 0.65},
  removeButton: {width: 24, height: 28, alignItems: 'center', justifyContent: 'center'},
  stateText: {paddingVertical: 24, textAlign: 'center', fontSize: 13, color: colors.muted},
  errorBox: {marginHorizontal: 16, marginBottom: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.apricot, flexDirection: 'row', alignItems: 'center', gap: 10},
  errorText: {flex: 1, fontSize: 12, lineHeight: 18, color: colors.error},
  retryText: {fontSize: 12, fontWeight: '700', color: colors.brand},
});
