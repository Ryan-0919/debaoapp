import {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Send} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {PageHeader} from '@/components/PageHeader';
import {AppButton} from '@/components/ui';
import {forumService} from '@/services';
import type {ForumCategory} from '@/services';
import {colors, radius, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const categories: ForumCategory[] = ['经验分享', '答疑求助', '知识整理', '技巧方法'];

export default function ForumComposeScreen() {
  const navigation = useNavigation<Navigation>();
  const [category, setCategory] = useState<ForumCategory>('经验分享');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const valid = useMemo(() => title.trim().length >= 4 && title.trim().length <= 80 && body.trim().length >= 10 && body.trim().length <= 5000, [body, title]);

  const publish = async () => {
    if (!valid || submitting) return;
    setSubmitting(true); setError('');
    try {
      const post = await forumService.create({category, title: title.trim(), body: body.trim()});
      navigation.replace('ForumDetail', {postId: post.id});
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '发布失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppScreen keyboardAware testID="forum-compose-screen">
      <PageHeader title="发布帖子" />
      <View style={styles.form}>
        <View>
          <Text style={styles.label}>帖子分类</Text>
          <View style={styles.categories}>
            {categories.map(item => <Pressable key={item} accessibilityState={{selected: category === item}} testID={`forum-compose-category-${item}`} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categorySelected]}><Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text></Pressable>)}
          </View>
        </View>
        <View>
          <View style={styles.labelRow}><Text style={styles.label}>标题</Text><Text style={styles.counter}>{title.length}/80</Text></View>
          <TextInput testID="forum-compose-title" value={title} onChangeText={setTitle} maxLength={80} placeholder="清晰描述你想分享或讨论的内容" placeholderTextColor="#A4A9B4" style={styles.titleInput} />
          {title.length > 0 && title.trim().length < 4 ? <Text style={styles.hint}>标题至少需要 4 个字</Text> : null}
        </View>
        <View>
          <View style={styles.labelRow}><Text style={styles.label}>正文</Text><Text style={styles.counter}>{body.length}/5000</Text></View>
          <TextInput testID="forum-compose-body" value={body} onChangeText={setBody} maxLength={5000} multiline textAlignVertical="top" placeholder="补充背景、你的思考或具体问题" placeholderTextColor="#A4A9B4" style={styles.bodyInput} />
          {body.length > 0 && body.trim().length < 10 ? <Text style={styles.hint}>正文至少需要 10 个字</Text> : null}
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <AppButton testID="forum-compose-submit" label="发布帖子" icon={<Send size={17} color={colors.surface} />} disabled={!valid} loading={submitting} onPress={publish} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {padding: spacing.lg, gap: spacing.xl},
  labelRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  label: {fontSize: 14, lineHeight: 20, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm},
  counter: {fontSize: 11, color: colors.muted, marginBottom: spacing.sm},
  categories: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  category: {height: 34, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface},
  categorySelected: {borderColor: colors.brand, backgroundColor: colors.brand},
  categoryText: {fontSize: 12, color: colors.body},
  categoryTextSelected: {fontWeight: '600', color: colors.surface},
  titleInput: {height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 14, color: colors.ink, backgroundColor: colors.surface},
  bodyInput: {minHeight: 220, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 14, lineHeight: 22, color: colors.ink, backgroundColor: colors.surface},
  hint: {fontSize: 11, color: colors.warning, marginTop: spacing.xs},
  error: {fontSize: 12, lineHeight: 18, color: colors.error},
});
