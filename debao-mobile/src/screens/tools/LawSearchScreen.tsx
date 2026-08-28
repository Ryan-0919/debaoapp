import {useMemo, useState} from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Bell, Bookmark, ChevronDown, ChevronLeft, ChevronRight, Flame, MessageSquare, Pin, Search, Star, ThumbsUp, X} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppScreen} from '@/components/AppScreen';
import {colors, radius} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type MainTab = 'laws' | 'forum' | 'notices';

interface LawArticle {
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

interface ForumPost {
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

interface Notice {
  id: string;
  type: string;
  title: string;
  body: string;
  date: string;
  important?: boolean;
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

const FORUM_POSTS: ForumPost[] = [
  {id: 'f1', author: '法考老鸟', avatar: '老', tag: '经验分享', title: '三战上岸经验分享：客观题从108到213的蜕变之路', preview: '分享一下我三年备考的心路历程，希望能帮到还在坚持的同学们……', likes: 342, replies: 87, time: '2小时前', pinned: true},
  {id: 'f2', author: '民法小白', avatar: '民', tag: '答疑求助', title: '善意取得中「合理价格」如何认定？有没有具体标准？', preview: '老师说合理价格不低于市价70%，但这个比例是哪里来的？有没有法条依据……', likes: 28, replies: 15, time: '4小时前'},
  {id: 'f3', author: '刑法爱好者', avatar: '刑', tag: '知识整理', title: '共同犯罪8大考点汇总，附真题解析（2019-2023）', preview: '整理了近五年关于共同犯罪的考点，包括主从犯认定、帮助犯、片面共犯……', likes: 186, replies: 43, time: '昨天'},
  {id: 'f4', author: '诉讼法研究', avatar: '诉', tag: '答疑求助', title: '行政诉讼起诉期限6个月和2年的区别，一直搞不清楚', preview: '请问直接起诉是6个月，但经过复议的是多久？两者起算点有何不同……', likes: 54, replies: 22, time: '昨天'},
  {id: 'f5', author: '主观题达人', avatar: '主', tag: '技巧方法', title: '主观题答题模板分享：合同纠纷类案例万能框架', preview: '做了大量主观题后总结的答题框架，按照这个模板写基本不会跑偏……', likes: 271, replies: 61, time: '3天前'},
  {id: 'f6', author: '行政法控', avatar: '行', tag: '知识整理', title: '行政许可vs行政审批vs行政确认，三者区别一表搞定', preview: '每次做题都被这三个概念绕晕，今天专门整理了对比表……', likes: 93, replies: 19, time: '4天前'},
];

const NOTICES: Notice[] = [
  {id: 'a1', type: '考试', title: '2024年法律职业资格考试客观题考试时间公告', body: '根据司法部统一部署，2024年法律职业资格考试客观题考试时间定于2024年9月14日、15日举行，请各位考生提前做好准备，按时参加考试。', date: '2026-08-20', important: true},
  {id: 'a2', type: '课程', title: '得宝法考2024客观题冲刺班正式上线', body: '2024年法考客观题冲刺直播课现已全面开放，包含20+场直播课程、历年真题精讲、考前模拟押题等内容，欢迎报名参加。', date: '2026-08-15'},
  {id: 'a3', type: '政策', title: '关于法律职业资格考试报名条件调整的说明', body: '根据司法部最新规定，参加2024年法律职业资格考试报名资格条件如下：具备全日制普通高等学校法学类本科及以上学历。', date: '2026-08-10'},
  {id: 'a4', type: '活动', title: '【免费公开课】法考备考策略专场直播，名额有限', body: '本周六晚19:00，三位资深法考名师将联合举办「2024法考最后冲刺攻略」公开课。', date: '2026-08-05'},
  {id: 'a5', type: '课程', title: '民法精讲课第19-22讲已更新上线', body: '民法精讲课本周更新第19-22讲，内容涵盖不动产登记、动产交付、用益物权和担保物权。', date: '2026-07-28'},
  {id: 'a6', type: '政策', title: '2024年法考成绩查询时间及流程说明', body: '客观题考试成绩预计于考试结束后45个工作日内公布，届时请登录司法部官网或本平台查询成绩。', date: '2026-07-15'},
];

const forumTags = ['全部', '经验分享', '答疑求助', '知识整理', '技巧方法'];

export default function LawSearchScreen() {
  const navigation = useNavigation<Navigation>();
  const [mainTab, setMainTab] = useState<MainTab>('laws');
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('全部');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selected, setSelected] = useState<LawArticle | null>(null);
  const [starred, setStarred] = useState<string[]>([]);
  const [forumTag, setForumTag] = useState('全部');
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  const searchResults = useMemo(() => LAW_DB.filter(article => {
    const value = searchedQuery.trim();
    return value && `${article.title}${article.article}${article.content}${article.keywords.join('')}`.includes(value);
  }), [searchedQuery]);
  const subjectResults = subjectFilter === '全部' ? LAW_DB : LAW_DB.filter(article => article.subject === subjectFilter);
  const posts = forumTag === '全部' ? FORUM_POSTS : FORUM_POSTS.filter(post => post.tag === forumTag);
  const toggleStar = (article: string) => setStarred(items => items.includes(article) ? items.filter(item => item !== article) : [...items, article]);
  const doSearch = () => {
    if (query.trim()) {
      setSearchedQuery(query.trim());
      setSubjectFilter('全部');
    }
  };

  return (
    <AppScreen scroll={false} backgroundColor={colors.page} testID="law-search-screen">
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回" onPress={() => navigation.goBack()} style={({pressed}) => [styles.backButton, pressed && styles.pressed]}><ChevronLeft size={20} color={colors.ink} /></Pressable>
        <Text style={styles.headerTitle}>法条 · 论坛</Text><View style={styles.headerSide} />
      </View>
      <View style={styles.mainTabs}>
        {([['laws', '法条检索'], ['forum', '学习论坛'], ['notices', '官方公告']] as const).map(([tab, label]) => (
          <Pressable key={tab} accessibilityState={{selected: mainTab === tab}} testID={`law-main-tab-${tab}`} onPress={() => setMainTab(tab)} style={styles.mainTab}>
            <Text style={[styles.mainTabText, mainTab === tab && styles.mainTabTextSelected]}>{label}</Text>
            {tab === 'notices' ? <View style={styles.noticeDot} /> : null}
            {mainTab === tab ? <View style={styles.tabIndicator} /> : null}
          </Pressable>
        ))}
      </View>

      {mainTab === 'laws' ? (
        <LawTab query={query} setQuery={setQuery} searchedQuery={searchedQuery} setSearchedQuery={setSearchedQuery} doSearch={doSearch} subjectFilter={subjectFilter} setSubjectFilter={setSubjectFilter} subjectResults={subjectResults} searchResults={searchResults} expandedSubject={expandedSubject} setExpandedSubject={setExpandedSubject} starred={starred} toggleStar={toggleStar} setSelected={setSelected} />
      ) : mainTab === 'forum' ? (
        <ForumTab tag={forumTag} setTag={setForumTag} posts={posts} />
      ) : (
        <NoticesTab expanded={expandedNotice} setExpanded={setExpandedNotice} />
      )}

      <ArticleSheet article={selected} starred={selected ? starred.includes(selected.article) : false} onClose={() => setSelected(null)} onStar={() => selected && toggleStar(selected.article)} onKeyword={keyword => {setSelected(null); setMainTab('laws'); setQuery(keyword); setSearchedQuery(keyword);}} onPractice={() => {if (selected) {const title = `${selected.article}相关练习`; setSelected(null); navigation.navigate('ObjectiveAnswer', {mode: 'chapter', title});}}} />
    </AppScreen>
  );
}

function LawTab({query, setQuery, searchedQuery, setSearchedQuery, doSearch, subjectFilter, setSubjectFilter, subjectResults, searchResults, expandedSubject, setExpandedSubject, starred, toggleStar, setSelected}: {
  query: string; setQuery: (value: string) => void; searchedQuery: string; setSearchedQuery: (value: string) => void; doSearch: () => void; subjectFilter: string; setSubjectFilter: (value: string) => void; subjectResults: LawArticle[]; searchResults: LawArticle[]; expandedSubject: string | null; setExpandedSubject: (value: string | null) => void; starred: string[]; toggleStar: (value: string) => void; setSelected: (value: LawArticle) => void;
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
        {articles.map(article => <ArticleCard key={article.article} article={article} starred={starred.includes(article.article)} onStar={() => toggleStar(article.article)} onOpen={() => setSelected(article)} />)}
        {!showingSearch && subjectFilter === '全部' ? <View style={styles.browse}><Text style={styles.sectionTitle}>按科目浏览</Text>{SUBJECTS.map(subject => {const group = LAW_DB.filter(article => article.subject === subject); if (!group.length) {return null;} const open = expandedSubject === subject; return <View key={subject} style={styles.subjectGroup}><Pressable testID={`law-group-${subject}`} onPress={() => setExpandedSubject(open ? null : subject)} style={styles.subjectHeader}><Text style={styles.subjectName}>{subject}</Text><View style={styles.countBadge}><Text style={styles.countText}>{group.length} 条</Text></View><ChevronDown size={15} color="#C0C5D0" style={open ? styles.chevronUp : undefined} /></Pressable>{open ? group.map((article, index) => <Pressable key={article.article} onPress={() => setSelected(article)} style={[styles.subjectArticle, index < group.length - 1 && styles.divider]}><View style={styles.flex}><Text style={styles.subjectArticleTitle}>{article.article}　{article.title}</Text><Text numberOfLines={1} style={styles.subjectArticleChapter}>{article.chapter}</Text></View><Pressable accessibilityLabel={`收藏${article.article}`} onPress={() => toggleStar(article.article)} style={styles.starButton}><Star size={14} color={starred.includes(article.article) ? '#A87000' : '#C0C5D0'} fill={starred.includes(article.article) ? '#A87000' : 'none'} /></Pressable><ChevronRight size={14} color="#C0C5D0" /></Pressable>) : null}</View>;})}</View> : null}
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

function ForumTab({tag, setTag, posts}: {tag: string; setTag: (value: string) => void; posts: ForumPost[]}) {
  return <View style={styles.flex}><ScrollView horizontal contentContainerStyle={styles.chips} showsHorizontalScrollIndicator={false}>{forumTags.map(item => <Chip key={item} label={item} selected={tag === item} testID={`forum-tag-${item}`} onPress={() => setTag(item)} />)}</ScrollView><ScrollView contentContainerStyle={styles.forumContent} showsVerticalScrollIndicator={false}>{posts.map(post => <View key={post.id} testID={`forum-post-${post.id}`} style={styles.postCard}><View style={styles.postHeader}><View style={styles.avatar}><Text style={styles.avatarText}>{post.avatar}</Text></View><Text style={styles.author}>{post.author}</Text><View style={styles.postTag}><Text style={styles.postTagText}>{post.tag}</Text></View>{post.pinned ? <Pin size={12} color={colors.error} /> : null}</View><Text style={styles.postTitle}>{post.title}</Text><Text numberOfLines={2} style={styles.postPreview}>{post.preview}</Text><View style={styles.postFooter}><View style={styles.postMetric}><ThumbsUp size={12} color="#C0C5D0" /><Text style={styles.postMetricText}>{post.likes}</Text></View><View style={styles.postMetric}><MessageSquare size={12} color="#C0C5D0" /><Text style={styles.postMetricText}>{post.replies} 回复</Text></View><Text style={styles.postTime}>{post.time}</Text></View></View>)}</ScrollView><View style={styles.postButtonArea}><View style={styles.postButton}><MessageSquare size={16} color={colors.surface} /><Text style={styles.postButtonText}>发布帖子</Text></View></View></View>;
}

function NoticesTab({expanded, setExpanded}: {expanded: string | null; setExpanded: (value: string | null) => void}) {
  return <ScrollView contentContainerStyle={styles.noticesContent} showsVerticalScrollIndicator={false}>{NOTICES.map(notice => {const open = expanded === notice.id; return <Pressable key={notice.id} testID={`notice-${notice.id}`} onPress={() => setExpanded(open ? null : notice.id)} style={[styles.noticeCard, notice.important && styles.noticeImportant]}><View style={styles.noticeMeta}><View style={styles.noticeType}><Text style={styles.noticeTypeText}>{notice.type}</Text></View>{notice.important ? <View style={styles.importantBadge}><Bell size={9} color="#D2691E" /><Text style={styles.importantText}>重要</Text></View> : null}<Text style={styles.noticeDate}>{notice.date}</Text></View><Text style={styles.noticeTitle}>{notice.title}</Text><Text numberOfLines={open ? undefined : 2} style={styles.noticeBody}>{notice.body}</Text><View style={styles.noticeFooter}><Text style={styles.expandText}>{open ? '收起 ↑' : '查看全文 ↓'}</Text><View style={styles.bookmark}><Bookmark size={11} color="#C0C5D0" /><Text style={styles.bookmarkText}>收藏</Text></View></View></Pressable>;})}</ScrollView>;
}

function ArticleSheet({article, starred, onClose, onStar, onKeyword, onPractice}: {article: LawArticle | null; starred: boolean; onClose: () => void; onStar: () => void; onKeyword: (value: string) => void; onPractice: () => void}) {
  return <Modal transparent navigationBarTranslucent animationType="slide" visible={!!article} onRequestClose={onClose}><View style={styles.sheetOverlay}><Pressable accessibilityLabel="关闭法条全文" style={styles.sheetDismiss} onPress={onClose} /><View accessibilityViewIsModal testID="law-article-sheet" style={styles.sheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>法条全文</Text><Pressable accessibilityLabel="关闭" onPress={onClose} style={styles.closeButton}><X size={18} color={colors.muted} /></Pressable></View>{article ? <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}><View style={styles.sheetArticleHeader}><View style={styles.flex}><Text style={styles.lawName}>{article.law}</Text><Text style={styles.sheetArticleTitle}>{article.article}　{article.title}</Text><Text style={styles.sheetChapter}>{article.chapter}</Text></View><Pressable accessibilityLabel={`收藏${article.article}`} onPress={onStar} style={styles.sheetStar}><Star size={17} color={starred ? '#A87000' : '#C0C5D0'} fill={starred ? '#A87000' : 'none'} /></Pressable></View><View style={styles.fullTextBox}><Text style={styles.fullText}>{article.fullText}</Text></View><Text style={styles.version}>{article.version}</Text><View style={styles.keywords}>{article.keywords.map(keyword => <Pressable key={keyword} onPress={() => onKeyword(keyword)} style={styles.keyword}><Text style={styles.keywordText}>#{keyword}</Text></Pressable>)}</View><View style={styles.sheetActions}><Pressable testID="law-sheet-star" onPress={onStar} style={[styles.sheetSecondary, starred && styles.sheetSecondaryStarred]}><Star size={15} color={starred ? '#A87000' : colors.body} fill={starred ? '#A87000' : 'none'} /><Text style={[styles.sheetSecondaryText, starred && styles.sheetSecondaryTextStarred]}>{starred ? '已收藏' : '收藏法条'}</Text></Pressable><Pressable testID="law-related-practice" onPress={onPractice} style={styles.sheetPrimary}><ChevronRight size={15} color={colors.surface} /><Text style={styles.sheetPrimaryText}>相关练习题</Text></Pressable></View></ScrollView> : null}</View></View></Modal>;
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {height: 52, paddingHorizontal: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center'}, backButton: {width: 32, height: 40, justifyContent: 'center'}, headerTitle: {flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.ink}, headerSide: {width: 32},
  mainTabs: {height: 43, flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, mainTab: {flex: 1, alignItems: 'center', justifyContent: 'center'}, mainTabText: {fontSize: 13, color: colors.muted}, mainTabTextSelected: {fontWeight: '500', color: colors.brand}, tabIndicator: {position: 'absolute', bottom: 0, width: 40, height: 2, borderRadius: 1, backgroundColor: colors.brand}, noticeDot: {position: 'absolute', top: 7, right: 16, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.error},
  searchArea: {height: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, searchInputBox: {height: 36, flex: 1, borderRadius: radius.md, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.page}, searchInput: {flex: 1, paddingVertical: 0, fontSize: 13, color: colors.ink}, searchButton: {height: 36, paddingHorizontal: 14, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, searchButtonText: {fontSize: 12, fontWeight: '500', color: colors.surface},
  chips: {height: 48, paddingHorizontal: 16, paddingVertical: 10, gap: 8, backgroundColor: colors.surface}, chip: {height: 28, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center'}, chipSelected: {borderColor: colors.brand, backgroundColor: colors.brand}, chipText: {fontSize: 12, color: colors.body}, chipTextSelected: {fontWeight: '600', color: colors.surface},
  lawContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 10}, resultSummary: {fontSize: 12, lineHeight: 17, color: colors.muted}, sectionHeading: {height: 24, flexDirection: 'row', alignItems: 'center', gap: 6}, sectionTitle: {fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.ink}, articleCard: {borderRadius: radius.lg, padding: 16, backgroundColor: colors.surface}, articleHeading: {flexDirection: 'row', alignItems: 'flex-start'}, lawName: {fontSize: 11, lineHeight: 15, color: colors.muted}, articleTitle: {fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.ink, marginTop: 2}, starButton: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'}, articleContent: {fontSize: 13, lineHeight: 20, color: colors.body, marginTop: 8}, articleFooter: {height: 31, marginTop: 8, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.page, flexDirection: 'row', alignItems: 'center'}, articleChapter: {flex: 1, fontSize: 11, color: colors.muted}, openText: {fontSize: 11, fontWeight: '500', color: colors.brand},
  browse: {marginTop: 10, gap: 8}, subjectGroup: {borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface}, subjectHeader: {height: 48, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center'}, subjectName: {fontSize: 13, fontWeight: '600', color: colors.ink}, countBadge: {marginLeft: 8, paddingHorizontal: 8, height: 20, borderRadius: 10, justifyContent: 'center', backgroundColor: colors.page}, countText: {fontSize: 11, color: colors.muted}, chevronUp: {transform: [{rotate: '180deg'}]}, subjectArticle: {minHeight: 58, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line}, divider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, subjectArticleTitle: {fontSize: 13, color: colors.ink}, subjectArticleChapter: {fontSize: 11, color: colors.muted, marginTop: 3},
  forumContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, gap: 10}, postCard: {borderRadius: radius.lg, padding: 16, backgroundColor: colors.surface}, postHeader: {height: 28, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10}, avatar: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, avatarText: {fontSize: 11, fontWeight: '700', color: colors.surface}, author: {fontSize: 12, fontWeight: '500', color: colors.body}, postTag: {marginLeft: 'auto', paddingHorizontal: 7, height: 20, borderRadius: 10, justifyContent: 'center', backgroundColor: colors.brandLight}, postTagText: {fontSize: 10, fontWeight: '500', color: colors.brand}, postTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink}, postPreview: {fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: 4}, postFooter: {height: 32, marginTop: 10, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.page, flexDirection: 'row', alignItems: 'center', gap: 16}, postMetric: {flexDirection: 'row', alignItems: 'center', gap: 4}, postMetricText: {fontSize: 11, color: colors.muted}, postTime: {marginLeft: 'auto', fontSize: 11, color: '#C0C5D0'}, postButtonArea: {height: 68, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, backgroundColor: colors.surface}, postButton: {height: 44, borderRadius: radius.lg, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, postButtonText: {fontSize: 14, fontWeight: '600', color: colors.surface},
  noticesContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 10}, noticeCard: {borderRadius: radius.lg, padding: 16, backgroundColor: colors.surface}, noticeImportant: {borderLeftWidth: 4, borderLeftColor: colors.error}, noticeMeta: {height: 22, flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7}, noticeType: {height: 20, paddingHorizontal: 8, borderRadius: 10, justifyContent: 'center', backgroundColor: colors.brandLight}, noticeTypeText: {fontSize: 10, fontWeight: '600', color: colors.brand}, importantBadge: {height: 20, paddingHorizontal: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.apricot}, importantText: {fontSize: 10, fontWeight: '600', color: '#D2691E'}, noticeDate: {marginLeft: 'auto', fontSize: 11, color: '#C0C5D0'}, noticeTitle: {fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.ink}, noticeBody: {fontSize: 12, lineHeight: 19, color: colors.muted, marginTop: 6}, noticeFooter: {height: 28, marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.page, flexDirection: 'row', alignItems: 'center'}, expandText: {fontSize: 11, color: colors.brand}, bookmark: {marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4}, bookmarkText: {fontSize: 11, color: colors.muted},
  sheetOverlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay}, sheetDismiss: {flex: 1}, sheet: {maxHeight: '82%', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden', backgroundColor: colors.surface}, sheetHeader: {height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line}, sheetTitle: {flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink}, closeButton: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'}, sheetContent: {padding: 20, paddingBottom: 28}, sheetArticleHeader: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16}, sheetArticleTitle: {fontSize: 19, lineHeight: 26, fontWeight: '700', color: colors.ink, marginTop: 2}, sheetChapter: {fontSize: 11, lineHeight: 16, color: '#C0C5D0', marginTop: 3}, sheetStar: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.page}, fullTextBox: {borderRadius: radius.lg, borderWidth: 1, borderColor: colors.brandLight, padding: 16, backgroundColor: '#FAFAFE'}, fullText: {fontSize: 14, lineHeight: 28, color: colors.ink}, version: {fontSize: 11, textAlign: 'center', color: '#C0C5D0', marginVertical: 16}, keywords: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20}, keyword: {height: 28, paddingHorizontal: 12, borderRadius: 14, justifyContent: 'center', backgroundColor: colors.brandLight}, keywordText: {fontSize: 12, color: colors.brand}, sheetActions: {height: 44, flexDirection: 'row', gap: 8}, sheetSecondary: {flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center'}, sheetSecondaryStarred: {borderColor: '#E8D39E', backgroundColor: colors.gold}, sheetSecondaryText: {fontSize: 14, fontWeight: '600', color: colors.body}, sheetSecondaryTextStarred: {color: '#A87000'}, sheetPrimary: {flex: 1, borderRadius: radius.lg, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand}, sheetPrimaryText: {fontSize: 14, fontWeight: '600', color: colors.surface},
  pressed: {opacity: 0.65}, primaryPressed: {backgroundColor: colors.brandDark},
});
