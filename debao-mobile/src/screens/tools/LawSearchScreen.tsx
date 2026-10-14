import {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {ChevronDown, ChevronLeft, ChevronRight, Flame, MessageSquare, Pin, RefreshCw, Search, Star, ThumbsUp, X} from 'lucide-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius, shadows} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';
import {environment} from '@/config/environment';
import {forumService, legalService} from '@/services';
import type {ForumCategory, ForumPost as ApiForumPost, LegalFavorite} from '@/services';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ScreenRoute = RouteProp<RootStackParamList, 'LawSearch'>;
type MainTab = 'laws' | 'forum';

interface LawArticle {
  documentId?: string;
  subject: string;
  law: string;
  article: string;
  title: string;
  content: string;
  fullText: string;
  chapter: string;
  version: string;
  keywords: string[];
}

interface ForumListPost {
  id: string;
  author: string;
  avatar: string;
  tag: string;
  title: string;
  preview: string;
  likes: number;
  replies: number;
  time: string;
  pinned?: boolean;
}

const SUBJECTS = ['民法', '刑法', '行政法', '民诉法', '刑诉法', '商法', '经济法', '国际法'];
const HOT_ARTICLES = ['第311条', '第188条', '第563条', '第232条'];

const LAW_DB: LawArticle[] = [
  {subject: '民法', law: '中华人民共和国民法典', article: '第311条', title: '善意取得', content: '无处分权人将不动产或者动产转让给受让人的，所有权人有权追回；除法律另有规定外，符合下列情形的，受让人取得该不动产或者动产的所有权……', fullText: '无处分权人将不动产或者动产转让给受让人的，所有权人有权追回；除法律另有规定外，符合下列情形的，受让人取得该不动产或者动产的所有权：\n（一）受让人受让该不动产或者动产时是善意的；\n（二）以合理的价格转让；\n（三）转让的不动产或者动产依照法律规定应当登记的已经登记，不需要登记的已经交付给受让人。\n受让人依据前款规定取得不动产或者动产的所有权的，原所有权人有权向无处分权人请求损害赔偿。\n当事人善意取得其他物权的，参照适用前两款规定。', chapter: '第二编 物权 · 第一分编 通则 · 第三章 物权的保护', version: '2020年5月28日通过', keywords: ['善意取得', '无处分权', '物权']},
  {subject: '民法', law: '中华人民共和国民法典', article: '第188条', title: '诉讼时效期间', content: '向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定……', fullText: '向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定。\n诉讼时效期间自权利人知道或者应当知道权利受到损害以及义务人之日起计算。法律另有规定的，依照其规定。但是，自权利受到损害之日起超过二十年的，人民法院不予保护，有特殊情况的，人民法院可以根据权利人的申请决定延长。', chapter: '第一编 总则 · 第九章 诉讼时效', version: '2020年5月28日通过', keywords: ['诉讼时效', '三年']},
  {subject: '民法', law: '中华人民共和国民法典', article: '第563条', title: '合同法定解除', content: '有下列情形之一的，当事人可以解除合同：（一）因不可抗力致使不能实现合同目的……', fullText: '有下列情形之一的，当事人可以解除合同：\n（一）因不可抗力致使不能实现合同目的；\n（二）在履行期限届满前，当事人一方明确表示或者以自己的行为表明不履行主要债务；\n（三）当事人一方迟延履行主要债务，经催告后在合理期限内仍未履行；\n（四）当事人一方迟延履行债务或者有其他违约行为致使不能实现合同目的；\n（五）法律规定的其他情形。', chapter: '第三编 合同 · 第一分编 通则 · 第八章 合同的解除', version: '2020年5月28日通过', keywords: ['合同解除', '不可抗力']},
  {subject: '民法', law: '中华人民共和国民法典', article: '第985条', title: '不当得利', content: '得利人没有法律根据取得不当利益的，受损失的人可以请求得利人返还取得的利益……', fullText: '得利人没有法律根据取得不当利益的，受损失的人可以请求得利人返还取得的利益，但是有下列情形之一的除外：\n（一）为履行道德义务进行的给付；\n（二）债务到期之前的清偿；\n（三）明知无给付义务而进行的债务清偿。', chapter: '第三编 合同 · 第三分编 准合同 · 第二章 不当得利', version: '2020年5月28日通过', keywords: ['不当得利', '返还']},
  {subject: '民法', law: '中华人民共和国民法典', article: '第634条', title: '分期付款买卖', content: '分期付款的买受人未支付到期价款的数额达到全部价款的五分之一，经催告后在合理期限内仍未支付的……', fullText: '分期付款的买受人未支付到期价款的数额达到全部价款的五分之一，经催告后在合理期限内仍未支付的，出卖人可以请求买受人支付全部价款或者解除合同。\n出卖人解除合同的，可以向买受人请求支付该标的物的使用费。', chapter: '第三编 合同 · 第二分编 典型合同 · 第九章 买卖合同', version: '2020年5月28日通过', keywords: ['分期付款', '五分之一']},
  {subject: '刑法', law: '中华人民共和国刑法', article: '第232条', title: '故意杀人罪', content: '故意杀人的，处死刑、无期徒刑或者十年以上有期徒刑；情节较轻的，处三年以上十年以下有期徒刑。', fullText: '故意杀人的，处死刑、无期徒刑或者十年以上有期徒刑；情节较轻的，处三年以上十年以下有期徒刑。', chapter: '第二编 分则 · 第四章 侵犯公民人身权利、民主权利罪', version: '1997年3月14日通过，历经多次修正', keywords: ['故意杀人', '死刑']},
  {subject: '刑法', law: '中华人民共和国刑法', article: '第264条', title: '盗窃罪', content: '盗窃公私财物，数额较大的，或者多次盗窃、入户盗窃、携带凶器盗窃、扒窃的，处三年以下有期徒刑……', fullText: '盗窃公私财物，数额较大的，或者多次盗窃、入户盗窃、携带凶器盗窃、扒窃的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金；数额巨大或者有其他严重情节的，处三年以上十年以下有期徒刑，并处罚金。', chapter: '第二编 分则 · 第五章 侵犯财产罪', version: '1997年3月14日通过，历经多次修正', keywords: ['盗窃', '财产犯罪']},
  {subject: '行政法', law: '中华人民共和国行政诉讼法', article: '第46条', title: '起诉期限', content: '公民、法人或者其他组织直接向人民法院提起诉讼的，应当自知道或者应当知道作出行政行为之日起六个月内提出……', fullText: '公民、法人或者其他组织直接向人民法院提起诉讼的，应当自知道或者应当知道作出行政行为之日起六个月内提出。法律另有规定的除外。\n因不动产提起诉讼的案件自行政行为作出之日起超过二十年，其他案件自行政行为作出之日起超过五年提起诉讼的，人民法院不予受理。', chapter: '第三章 诉讼参加人', version: '2017年6月27日修正', keywords: ['行政诉讼', '起诉期限', '六个月']},
  {subject: '民诉法', law: '中华人民共和国民事诉讼法', article: '第122条', title: '起诉条件', content: '起诉必须符合下列条件：（一）原告是与本案有直接利害关系的公民、法人和其他组织……', fullText: '起诉必须符合下列条件：\n（一）原告是与本案有直接利害关系的公民、法人和其他组织；\n（二）有明确的被告；\n（三）有具体的诉讼请求和事实、理由；\n（四）属于人民法院受理民事诉讼的范围和受诉人民法院管辖。', chapter: '第二编 审判程序 · 第一章 第一审普通程序', version: '2021年12月24日修正', keywords: ['起诉条件', '民事诉讼']},
  {subject: '刑诉法', law: '中华人民共和国刑事诉讼法', article: '第12条', title: '无罪推定', content: '未经人民法院依法判决，对任何人都不得确定有罪。', fullText: '未经人民法院依法判决，对任何人都不得确定有罪。', chapter: '第一编 总则 · 第一章 任务和基本原则', version: '2018年10月26日修正', keywords: ['无罪推定', '刑事诉讼']},
];

const FORUM_POSTS: ForumListPost[] = [
  {id: 'f1', author: '法考老鸟', avatar: '老', tag: '经验分享', title: '三战上岸经验分享：客观题从108到213的蜕变之路', preview: '分享一下我三年备考的心路历程，希望能帮到还在坚持的同学们……', likes: 342, replies: 87, time: '2小时前', pinned: true},
  {id: 'f2', author: '民法小白', avatar: '民', tag: '答疑求助', title: '善意取得中「合理价格」如何认定？有没有具体标准？', preview: '老师说合理价格不低于市价70%，但这个比例是哪里来的？有没有法条依据……', likes: 28, replies: 15, time: '4小时前'},
  {id: 'f3', author: '刑法爱好者', avatar: '刑', tag: '知识整理', title: '共同犯罪8大考点汇总，附真题解析（2019-2023）', preview: '整理了近五年关于共同犯罪的考点，包括主从犯认定、帮助犯、片面共犯……', likes: 186, replies: 43, time: '昨天'},
  {id: 'f4', author: '诉讼法研究', avatar: '诉', tag: '答疑求助', title: '行政诉讼起诉期限6个月和2年的区别，一直搞不清楚', preview: '请问直接起诉是6个月，但经过复议的是多久？两者起算点有何不同……', likes: 54, replies: 22, time: '昨天'},
  {id: 'f5', author: '主观题达人', avatar: '主', tag: '技巧方法', title: '主观题答题模板分享：合同纠纷类案例万能框架', preview: '做了大量主观题后总结的答题框架，按照这个模板写基本不会跑偏……', likes: 271, replies: 61, time: '3天前'},
  {id: 'f6', author: '行政法控', avatar: '行', tag: '知识整理', title: '行政许可vs行政审批vs行政确认，三者区别一表搞定', preview: '每次做题都被这三个概念绕晕，今天专门整理了对比表……', likes: 93, replies: 19, time: '4天前'},
];

const forumTags = ['全部', '经验分享', '答疑求助', '知识整理', '技巧方法'];

function forumTagPalette(tag: string) {
  if (tag === '答疑求助') return {backgroundColor: colors.gold, color: '#A87000'};
  if (tag === '经验分享') return {backgroundColor: colors.mint, color: '#3A7A46'};
  if (tag === '知识整理') return {backgroundColor: colors.brandLight, color: colors.brand};
  return {backgroundColor: colors.rose, color: '#C0385A'};
}

function mapForumPost(item: ApiForumPost): ForumListPost {
  return {id: item.id, author: item.userName, avatar: item.userName.slice(0, 1) || '得', tag: item.category, title: item.title, preview: item.body, likes: item.likes, replies: item.comments, time: new Date(item.createdAt).toLocaleDateString('zh-CN')};
}

function articleKey(article: LawArticle): string {
  return article.documentId ?? article.article;
}

function favoriteArticleKey(item: LegalFavorite): string {
  // Keep both the stable document id and the displayed article number. Search
  // results may format the article field differently from the favorite row.
  return item.article || item.legalDocumentId;
}

export default function LawSearchScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ScreenRoute>();
  const answerContext = route.params?.source === 'subjective-answer';
  const contextSubject = route.params?.subject;
  const initialSubject = contextSubject && SUBJECTS.includes(contextSubject) ? contextSubject : '全部';
  const [mainTab, setMainTab] = useState<MainTab>('laws');
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState(initialSubject);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selected, setSelected] = useState<LawArticle | null>(null);
  const [starred, setStarred] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Record<string, string>>({});
  const [forumTag, setForumTag] = useState('全部');
  const [apiSearchResults, setApiSearchResults] = useState<LawArticle[]>([]);
  const [apiForumPosts, setApiForumPosts] = useState<ForumListPost[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumLoadingMore, setForumLoadingMore] = useState(false);
  const [forumError, setForumError] = useState('');
  const [forumNextCursor, setForumNextCursor] = useState<string>();
  useEffect(() => {
    if (environment.useMocks) return;
    let active = true;
    if (legalService.listFavorites) {
      legalService.listFavorites().then(items => {
        if (!active) return;
        setStarred(items.flatMap(item => [item.legalDocumentId, favoriteArticleKey(item)]));
        setFavoriteIds(Object.fromEntries(items.map(item => [item.legalDocumentId, item.id])));
      }).catch(() => undefined);
    }
    return () => { active = false; };
  }, []);

  const loadForum = useCallback(async (cursor?: string) => {
    if (environment.useMocks) return;
    cursor ? setForumLoadingMore(true) : setForumLoading(true); setForumError('');
    try {
      const result = await forumService.list({category: forumTag === '全部' ? undefined : forumTag as ForumCategory, cursor, limit: 20});
      const mapped = result.items.map(mapForumPost);
      setApiForumPosts(items => cursor ? [...items, ...mapped] : mapped); setForumNextCursor(result.nextCursor);
    } catch (reason) {
      setForumError(reason instanceof Error ? reason.message : '论坛加载失败，请稍后重试');
    } finally {
      setForumLoading(false); setForumLoadingMore(false);
    }
  }, [forumTag]);

  useEffect(() => {
    if (environment.useMocks) return;
    loadForum().catch(() => undefined);
    return navigation.addListener('focus', () => { loadForum().catch(() => undefined); });
  }, [navigation, loadForum]);

  const localSearchResults = useMemo(() => LAW_DB.filter(article => {
    const value = searchedQuery.trim();
    return value && `${article.title}${article.article}${article.content}${article.keywords.join('')}`.includes(value);
  }), [searchedQuery]);
  const searchResults = environment.useMocks ? localSearchResults : apiSearchResults;
  const subjectResults = subjectFilter === '全部' ? LAW_DB : LAW_DB.filter(article => article.subject === subjectFilter);
  const forumSource = environment.useMocks ? FORUM_POSTS : apiForumPosts;
  const posts = forumTag === '全部' ? forumSource : forumSource.filter(post => post.tag === forumTag);
  const toggleStar = (article: LawArticle) => {
    const key = articleKey(article);
    const displayKey = article.article;
    if (environment.useMocks || !article.documentId || !legalService.addFavorite || !legalService.removeFavorite) {
      setStarred(items => items.includes(key) ? items.filter(item => item !== key && item !== displayKey) : [...items, key]);
      return;
    }
    const favoriteId = favoriteIds[article.documentId];
    if (favoriteId) {
      legalService.removeFavorite(favoriteId).then(() => {
        setFavoriteIds(items => { const next = {...items}; delete next[article.documentId!]; return next; });
        setStarred(items => items.filter(item => item !== key && item !== displayKey));
      }).catch(() => undefined);
      return;
    }
    legalService.addFavorite(article.documentId).then(favorite => {
      setFavoriteIds(items => ({...items, [article.documentId!]: favorite.id}));
      setStarred(items => items.includes(key) ? items : [...items, key, displayKey]);
    }).catch(() => undefined);
  };
  const doSearch = () => {
    const value = query.trim();
    if (value) {
      setSearchedQuery(value);
      setSubjectFilter('全部');
      if (!environment.useMocks) {
        legalService.search(value).then(result => setApiSearchResults(result.items.map(item => ({documentId: item.id, subject: '法规', law: item.article.split('第')[0] || '法律法规', article: item.article.includes('第') ? `第${item.article.split('第').slice(1).join('第')}` : item.article, title: item.title, content: item.content, fullText: item.content, chapter: item.article, version: `${item.effectiveFrom} 生效`, keywords: [value]})))).catch(() => setApiSearchResults([]));
      }
    }
  };

  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="law-search-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}><ChevronLeft size={20} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle}>法条 · 论坛</Text>
        {answerContext ? <Pressable testID="law-return-to-subjective" accessibilityLabel="返回继续作答" onPress={() => navigation.goBack()} style={styles.returnButton}><Text style={styles.returnButtonText}>返回作答</Text></Pressable> : <View style={styles.headerSide} />}
      </View>
      <View style={styles.mainTabs}>
        {([['laws', '法条检索'], ['forum', '学习论坛']] as const).map(([tab, label]) => (
          <Pressable key={tab} accessibilityState={{selected: mainTab === tab}} testID={`law-main-tab-${tab}`} onPress={() => setMainTab(tab)} style={styles.mainTab}>
            <Text style={[styles.mainTabText, mainTab === tab && styles.mainTabTextSelected]}>{label}</Text>
            {mainTab === tab ? <View style={styles.tabIndicator} /> : null}
          </Pressable>
        ))}
      </View>

      {answerContext ? <View testID="law-answer-context" style={styles.answerContext}><Text style={styles.answerContextText}>正在作答{contextSubject ? `：${contextSubject}` : ''}主观题，查询后可返回继续作答</Text></View> : null}

      {mainTab === 'laws' ? (
        <LawTab query={query} setQuery={setQuery} searchedQuery={searchedQuery} setSearchedQuery={setSearchedQuery} doSearch={doSearch} subjectFilter={subjectFilter} setSubjectFilter={setSubjectFilter} subjectResults={subjectResults} searchResults={searchResults} expandedSubject={expandedSubject} setExpandedSubject={setExpandedSubject} starred={starred} toggleStar={toggleStar} setSelected={setSelected} />
      ) : (
        <ForumTab tag={forumTag} setTag={setForumTag} posts={posts} loading={forumLoading} loadingMore={forumLoadingMore} error={forumError} nextCursor={forumNextCursor} onRetry={() => loadForum()} onLoadMore={() => loadForum(forumNextCursor)} onOpen={postId => navigation.navigate('ForumDetail', {postId})} onCompose={() => navigation.navigate('ForumCompose')} />
      )}

      <ArticleSheet article={selected} starred={selected ? (starred.includes(articleKey(selected)) || starred.includes(selected.article)) : false} onClose={() => setSelected(null)} onStar={() => selected && toggleStar(selected)} onKeyword={keyword => {setSelected(null); setMainTab('laws'); setQuery(keyword); setSearchedQuery(keyword);}} onPractice={() => {if (selected) {const title = `${selected.article}相关练习`; setSelected(null); navigation.navigate('ObjectiveAnswer', {mode: 'chapter', title});}}} />
    </AppScreen>
  );
}

function LawTab({query, setQuery, searchedQuery, setSearchedQuery, doSearch, subjectFilter, setSubjectFilter, subjectResults, searchResults, expandedSubject, setExpandedSubject, starred, toggleStar, setSelected}: {
  query: string; setQuery: (value: string) => void; searchedQuery: string; setSearchedQuery: (value: string) => void; doSearch: () => void; subjectFilter: string; setSubjectFilter: (value: string) => void; subjectResults: LawArticle[]; searchResults: LawArticle[]; expandedSubject: string | null; setExpandedSubject: (value: string | null) => void; starred: string[]; toggleStar: (value: LawArticle) => void; setSelected: (value: LawArticle) => void;
}) {
  const showingSearch = !!searchedQuery;
  const articles = showingSearch ? searchResults : subjectFilter === '全部' ? LAW_DB.filter(article => HOT_ARTICLES.includes(article.article)) : subjectResults;
  return (
    <View style={styles.flex}>
      <View style={styles.searchArea}>
        <View style={styles.searchInputBox}><Search size={14} color={colors.muted} /><TextInput value={query} onChangeText={value => {setQuery(value); if (!value.trim()) {setSearchedQuery('');}}} onSubmitEditing={doSearch} placeholder="搜索法条、关键词、条文编号…" placeholderTextColor="#C0C5D0" style={styles.searchInput} />{query ? <Pressable accessibilityLabel="清空搜索" onPress={() => {setQuery(''); setSearchedQuery('');}}><X size={15} color="#C0C5D0" /></Pressable> : null}</View>
        <Pressable testID="law-search-submit" onPress={doSearch} style={({pressed}) => [styles.searchButton, pressed && styles.primaryPressed]}><Text style={styles.searchButtonText}>搜索</Text></Pressable>
      </View>
      {!showingSearch ? <ScrollView horizontal contentContainerStyle={styles.chips} showsHorizontalScrollIndicator={false}>{['全部', ...SUBJECTS].map(subject => <Chip key={subject} label={subject} selected={subjectFilter === subject} testID={`law-subject-${subject}`} onPress={() => setSubjectFilter(subject)} />)}</ScrollView> : null}
      <ScrollView contentContainerStyle={styles.lawContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" testID="law-results-scroll">
        {showingSearch ? <Text style={styles.resultSummary}>{searchResults.length ? `找到 ${searchResults.length} 条结果` : `未找到「${searchedQuery}」相关法条`}</Text> : subjectFilter === '全部' ? <View style={styles.sectionHeading}><Flame size={14} color={colors.error} /><Text style={styles.sectionTitle}>高频考点法条</Text></View> : <Text style={styles.resultSummary}>{subjectFilter} · 共 {subjectResults.length} 条法条</Text>}
        {showingSearch && !searchResults.length ? <View style={styles.searchEmpty}><Search size={36} color={colors.line} /><Text style={styles.searchEmptyText}>未找到「{searchedQuery}」相关法条</Text><Pressable testID="law-search-empty-action" accessibilityRole="button" onPress={() => {setQuery(''); setSearchedQuery('');}}><Text style={styles.searchEmptyAction}>返回浏览</Text></Pressable></View> : articles.map(article => <ArticleCard key={article.article} article={article} starred={starred.includes(articleKey(article)) || starred.includes(article.article)} onStar={() => toggleStar(article)} onOpen={() => setSelected(article)} />)}
        {!showingSearch && subjectFilter === '全部' ? <View style={styles.browse}><Text style={styles.sectionTitle}>按科目浏览</Text>{SUBJECTS.map(subject => {const group = LAW_DB.filter(article => article.subject === subject); if (!group.length) {return null;} const open = expandedSubject === subject; return <View key={subject} style={styles.subjectGroup}><Pressable testID={`law-group-${subject}`} onPress={() => setExpandedSubject(open ? null : subject)} style={styles.subjectHeader}><Text style={styles.subjectName}>{subject}</Text><View style={styles.countBadge}><Text style={styles.countText}>{group.length} 条</Text></View><ChevronDown size={15} color="#C0C5D0" style={open ? styles.chevronUp : undefined} /></Pressable>{open ? group.map((article, index) => <Pressable key={article.article} onPress={() => setSelected(article)} style={[styles.subjectArticle, index < group.length - 1 && styles.divider]}><View style={styles.flex}><Text style={styles.subjectArticleTitle}>{article.article}　{article.title}</Text><Text numberOfLines={1} style={styles.subjectArticleChapter}>{article.chapter}</Text></View><Pressable accessibilityLabel={`收藏${article.article}`} onPress={() => toggleStar(article)} style={styles.starButton}><Star size={14} color={starred.includes(articleKey(article)) || starred.includes(article.article) ? '#A87000' : '#C0C5D0'} fill={starred.includes(articleKey(article)) || starred.includes(article.article) ? '#A87000' : 'none'} /></Pressable><ChevronRight size={14} color="#C0C5D0" /></Pressable>) : null}</View>;})}</View> : null}
      </ScrollView>
    </View>
  );
}

function Chip({label, selected, onPress, testID}: {label: string; selected: boolean; onPress: () => void; testID?: string}) {
  return <Pressable accessibilityState={{selected}} testID={testID} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

function ArticleCard({article, starred, onStar, onOpen}: {article: LawArticle; starred: boolean; onStar: () => void; onOpen: () => void}) {
  return <Pressable testID={`law-article-${article.article}`} onPress={onOpen} style={({pressed}) => [styles.articleCard, pressed && styles.pressed]}><View style={styles.articleHeading}><View style={styles.flex}><Text style={styles.lawName}>{article.law}</Text><Text style={styles.articleTitle}>{article.article}　{article.title}</Text></View><Pressable accessibilityLabel={`收藏${article.article}`} onPress={onStar} style={styles.starButton}><Star size={16} color={starred ? '#A87000' : '#C0C5D0'} fill={starred ? '#A87000' : 'none'} /></Pressable></View><Text numberOfLines={2} style={styles.articleContent}>{article.content}</Text><View style={styles.articleFooter}><Text numberOfLines={1} style={styles.articleChapter}>{article.chapter}</Text><Text style={styles.openText}>查看全文 →</Text></View></Pressable>;
}

function ForumTab({tag, setTag, posts, loading, loadingMore, error, nextCursor, onRetry, onLoadMore, onOpen, onCompose}: {tag: string; setTag: (value: string) => void; posts: ForumListPost[]; loading: boolean; loadingMore: boolean; error: string; nextCursor?: string; onRetry: () => void; onLoadMore: () => void; onOpen: (postId: string) => void; onCompose: () => void}) {
  return (
    <View style={styles.flex}>
      <ScrollView horizontal contentContainerStyle={styles.chips} showsHorizontalScrollIndicator={false}>
        {forumTags.map(item => <Chip key={item} label={item} selected={tag === item} testID={`forum-tag-${item}`} onPress={() => setTag(item)} />)}
      </ScrollView>
      {loading ? (
        <View style={styles.forumState}><ActivityIndicator color={colors.brand} /><Text style={styles.forumStateText}>正在加载帖子...</Text></View>
      ) : error && !posts.length ? (
        <View style={styles.forumState}><Text accessibilityRole="alert" style={styles.forumError}>{error}</Text><Pressable testID="forum-list-retry" onPress={onRetry} style={styles.forumRetry}><RefreshCw size={14} color={colors.brand} /><Text style={styles.forumRetryText}>重新加载</Text></Pressable></View>
      ) : (
        <ScrollView contentContainerStyle={styles.forumContent} showsVerticalScrollIndicator={false}>
          {posts.map(post => {
            const palette = forumTagPalette(post.tag);
            return (
              <Pressable key={post.id} testID={`forum-post-${post.id}`} onPress={() => onOpen(post.id)} style={({pressed}) => [styles.postCard, pressed && styles.pressed]}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{post.avatar}</Text></View>
                  <Text style={styles.author}>{post.author}</Text>
                  <View style={[styles.postTag, {backgroundColor: palette.backgroundColor}]}><Text style={[styles.postTagText, {color: palette.color}]}>{post.tag}</Text></View>
                  {post.pinned ? <Pin size={12} color={colors.error} /> : null}
                </View>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text numberOfLines={2} style={styles.postPreview}>{post.preview}</Text>
                <View style={styles.postFooter}>
                  <View style={styles.postMetric}><ThumbsUp size={12} color="#C0C5D0" /><Text style={styles.postMetricText}>{post.likes}</Text></View>
                  <View style={styles.postMetric}><MessageSquare size={12} color="#C0C5D0" /><Text style={styles.postMetricText}>{post.replies} 回复</Text></View>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
              </Pressable>
            );
          })}
          {!posts.length ? <View style={styles.forumEmpty}><MessageSquare size={28} color={colors.muted} /><Text style={styles.forumEmptyTitle}>暂无相关帖子</Text><Text style={styles.forumStateText}>换个分类看看，或发布第一篇帖子。</Text></View> : null}
          {nextCursor ? <Pressable testID="forum-list-more" disabled={loadingMore} onPress={onLoadMore} style={styles.forumMore}><Text style={styles.forumMoreText}>{loadingMore ? '加载中...' : '加载更多'}</Text></Pressable> : null}
          {error ? <Text accessibilityRole="alert" style={styles.forumInlineError}>{error}</Text> : null}
        </ScrollView>
      )}
      <View style={styles.postButtonArea}><Pressable testID="forum-compose" onPress={onCompose} style={({pressed}) => [styles.postButton, pressed && styles.primaryPressed]}><MessageSquare size={16} color={colors.surface} /><Text style={styles.postButtonText}>发布帖子</Text></Pressable></View>
    </View>
  );
}

function ArticleSheet({article, starred, onClose, onStar, onKeyword, onPractice}: {article: LawArticle | null; starred: boolean; onClose: () => void; onStar: () => void; onKeyword: (value: string) => void; onPractice: () => void}) {
  return <Modal transparent navigationBarTranslucent animationType="slide" visible={!!article} onRequestClose={onClose}><View style={styles.sheetOverlay}><Pressable accessibilityLabel="关闭法条全文" style={styles.sheetDismiss} onPress={onClose} /><View accessibilityViewIsModal testID="law-article-sheet" style={styles.sheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>法条全文</Text><Pressable accessibilityLabel="关闭" onPress={onClose} style={styles.closeButton}><X size={18} color={colors.muted} /></Pressable></View>{article ? <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}><View style={styles.sheetArticleHeader}><View style={styles.flex}><Text style={styles.lawName}>{article.law}</Text><Text style={styles.sheetArticleTitle}>{article.article}　{article.title}</Text><Text style={styles.sheetChapter}>{article.chapter}</Text></View><Pressable accessibilityLabel={`收藏${article.article}`} onPress={onStar} style={styles.sheetStar}><Star size={17} color={starred ? '#A87000' : '#C0C5D0'} fill={starred ? '#A87000' : 'none'} /></Pressable></View><View style={styles.sheetDivider} /><View style={styles.fullTextBox}><Text style={styles.fullText}>{article.fullText}</Text></View><Text style={styles.version}>{article.version}</Text><View style={styles.keywords}>{article.keywords.map(keyword => <Pressable key={keyword} onPress={() => onKeyword(keyword)} style={styles.keyword}><Text style={styles.keywordText}>#{keyword}</Text></Pressable>)}</View><View style={styles.sheetActions}><Pressable testID="law-sheet-star" onPress={onStar} style={[styles.sheetSecondary, starred && styles.sheetSecondaryStarred]}><Star size={15} color={starred ? '#A87000' : colors.body} fill={starred ? '#A87000' : 'none'} /><Text style={[styles.sheetSecondaryText, starred && styles.sheetSecondaryTextStarred]}>{starred ? '已收藏' : '收藏法条'}</Text></Pressable><Pressable testID="law-related-practice" onPress={onPractice} style={styles.sheetPrimary}><ChevronRight size={15} color={colors.surface} /><Text style={styles.sheetPrimaryText}>相关练习题</Text></Pressable></View></ScrollView> : null}</View></View></Modal>;
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center'}, backButton: {width: 32, height: 40, justifyContent: 'center'}, headerTitle: {flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.ink}, headerSide: {width: 32}, returnButton: {minWidth: 64, height: 32, paddingHorizontal: 5, alignItems: 'flex-end', justifyContent: 'center'}, returnButtonText: {fontSize: 11, fontWeight: '600', color: colors.brand},
  answerContext: {minHeight: 32, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.brandLight, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, answerContextText: {fontSize: 11, lineHeight: 16, color: colors.brand},
  mainTabs: {height: 43, flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, mainTab: {flex: 1, alignItems: 'center', justifyContent: 'center'}, mainTabText: {fontSize: 13, color: colors.muted}, mainTabTextSelected: {fontWeight: '500', color: colors.brand}, tabIndicator: {position: 'absolute', bottom: 0, width: 40, height: 2, borderRadius: 1, backgroundColor: colors.brand},
  searchArea: {height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, searchInputBox: {height: 36, flex: 1, borderRadius: radius.md, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.page}, searchInput: {flex: 1, paddingVertical: 0, fontSize: 13, color: colors.ink}, searchButton: {height: 36, paddingHorizontal: 14, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, searchButtonText: {fontSize: 12, fontWeight: '500', color: colors.surface},
  chips: {height: 48, paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: colors.surface}, chip: {height: 28, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'}, chipSelected: {borderColor: colors.brand, backgroundColor: colors.brand}, chipText: {fontSize: 12, color: colors.body}, chipTextSelected: {fontWeight: '600', color: colors.surface},
  lawContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 10}, resultSummary: {fontSize: 12, lineHeight: 17, color: colors.muted}, searchEmpty: {alignItems: 'center', paddingTop: 52, gap: 8}, searchEmptyText: {fontSize: 14, color: colors.muted}, searchEmptyAction: {fontSize: 12, color: colors.brand}, sectionHeading: {height: 24, flexDirection: 'row', alignItems: 'center', gap: 6}, sectionTitle: {fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.ink}, articleCard: {borderRadius: radius.lg, padding: 16, backgroundColor: colors.surface, ...shadows.card}, articleHeading: {flexDirection: 'row', alignItems: 'flex-start'}, lawName: {fontSize: 11, lineHeight: 15, color: colors.muted}, articleTitle: {fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.ink, marginTop: 2}, starButton: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'}, articleContent: {fontSize: 13, lineHeight: 20, color: colors.body, marginTop: 8}, articleFooter: {height: 31, marginTop: 8, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.page, flexDirection: 'row', alignItems: 'center'}, articleChapter: {flex: 1, fontSize: 11, color: colors.muted}, openText: {fontSize: 11, fontWeight: '500', color: colors.brand},
  browse: {marginTop: 10, gap: 8}, subjectGroup: {borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface}, subjectHeader: {height: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center'}, subjectName: {fontSize: 13, fontWeight: '600', color: colors.ink}, countBadge: {marginLeft: 8, paddingHorizontal: 8, height: 20, borderRadius: 10, justifyContent: 'center', backgroundColor: colors.page}, countText: {fontSize: 11, color: colors.muted}, chevronUp: {transform: [{rotate: '180deg'}]}, subjectArticle: {minHeight: 58, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line}, divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, subjectArticleTitle: {fontSize: 13, color: colors.ink}, subjectArticleChapter: {fontSize: 11, color: colors.muted, marginTop: 3},
  forumContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 10}, forumState: {flex: 1, paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', gap: 12}, forumStateText: {fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: 'center'}, forumError: {fontSize: 12, lineHeight: 18, color: colors.error, textAlign: 'center'}, forumRetry: {height: 38, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface}, forumRetryText: {fontSize: 12, fontWeight: '600', color: colors.brand}, forumEmpty: {paddingVertical: 48, alignItems: 'center', gap: 8}, forumEmptyTitle: {fontSize: 14, fontWeight: '700', color: colors.ink}, forumMore: {height: 44, alignItems: 'center', justifyContent: 'center'}, forumMoreText: {fontSize: 12, fontWeight: '600', color: colors.brand}, forumInlineError: {fontSize: 11, lineHeight: 17, color: colors.error, textAlign: 'center'}, postCard: {borderRadius: radius.lg, padding: 16, backgroundColor: colors.surface, ...shadows.card}, postHeader: {height: 28, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10}, avatar: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, avatarText: {fontSize: 11, fontWeight: '700', color: colors.surface}, author: {fontSize: 12, fontWeight: '500', color: colors.body}, postTag: {marginLeft: 'auto', paddingHorizontal: 7, height: 20, borderRadius: 10, justifyContent: 'center'}, postTagText: {fontSize: 10, fontWeight: '500'}, postTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink}, postPreview: {fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: 4}, postFooter: {height: 32, marginTop: 10, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.page, flexDirection: 'row', alignItems: 'center', gap: 16}, postMetric: {flexDirection: 'row', alignItems: 'center', gap: 4}, postMetricText: {fontSize: 11, color: colors.muted}, postTime: {marginLeft: 'auto', fontSize: 11, color: '#C0C5D0'}, postButtonArea: {height: 68, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.surface}, postButton: {height: 44, borderRadius: radius.lg, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, postButtonText: {fontSize: 14, fontWeight: '600', color: colors.surface},
  sheetOverlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay}, sheetDismiss: {flex: 1}, sheet: {maxHeight: '82%', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden', backgroundColor: colors.surface}, sheetHeader: {height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, sheetTitle: {flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink}, closeButton: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'}, sheetContent: {padding: 20, paddingBottom: 28}, sheetArticleHeader: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16}, sheetDivider: {height: StyleSheet.hairlineWidth, marginBottom: 16, backgroundColor: colors.line}, sheetArticleTitle: {fontSize: 19, lineHeight: 26, fontWeight: '700', color: colors.ink, marginTop: 2}, sheetChapter: {fontSize: 11, lineHeight: 16, color: '#C0C5D0', marginTop: 3}, sheetStar: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.page}, fullTextBox: {borderRadius: radius.lg, borderWidth: 1, borderColor: colors.brandLight, padding: 16, backgroundColor: '#FAFAFE'}, fullText: {fontSize: 14, lineHeight: 28, color: colors.ink}, version: {fontSize: 11, textAlign: 'center', color: '#C0C5D0', marginVertical: 16}, keywords: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20}, keyword: {height: 28, paddingHorizontal: 12, borderRadius: 14, justifyContent: 'center', backgroundColor: colors.brandLight}, keywordText: {fontSize: 12, color: colors.brand}, sheetActions: {height: 44, flexDirection: 'row', gap: 8}, sheetSecondary: {flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center'}, sheetSecondaryStarred: {borderColor: '#E8D39E', backgroundColor: colors.gold}, sheetSecondaryText: {fontSize: 14, fontWeight: '600', color: colors.body}, sheetSecondaryTextStarred: {color: '#A87000'}, sheetPrimary: {flex: 1, borderRadius: radius.lg, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, sheetPrimaryText: {fontSize: 14, fontWeight: '600', color: colors.surface},
  pressed: {opacity: 0.65}, primaryPressed: {backgroundColor: colors.brandDark},
});
