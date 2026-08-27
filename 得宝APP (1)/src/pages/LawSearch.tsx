import { useState } from "react";
import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import BottomSheet from "@/components/BottomSheet";
import { Search, Star, ChevronRight, X, MessageSquare, ThumbsUp, Bookmark, Bell, Pin, ChevronDown } from "lucide-react";

interface Props { nav: NavContextType }

// ─── Types ────────────────────────────────────────────────────────────────────
interface LawArticle {
  law: string; article: string; title: string;
  content: string; fullText: string; chapter: string;
  version: string; keywords: string[]; subject: string;
}

interface ForumPost {
  id: string; author: string; avatar: string; tag: string;
  title: string; preview: string; likes: number; replies: number;
  time: string; pinned?: boolean;
}

interface Announcement {
  id: string; type: "考试" | "政策" | "课程" | "活动"; title: string;
  body: string; date: string; important?: boolean;
}

// ─── Law data ─────────────────────────────────────────────────────────────────
const SUBJECTS = ["民法", "刑法", "行政法", "民诉法", "刑诉法", "商法", "经济法", "国际法"];

const LAW_DB: LawArticle[] = [
  { subject: "民法", law: "中华人民共和国民法典", article: "第311条", title: "善意取得",
    content: "无处分权人将不动产或者动产转让给受让人的，所有权人有权追回；除法律另有规定外，符合下列情形的，受让人取得该不动产或者动产的所有权……",
    fullText: "无处分权人将不动产或者动产转让给受让人的，所有权人有权追回；除法律另有规定外，符合下列情形的，受让人取得该不动产或者动产的所有权：\n（一）受让人受让该不动产或者动产时是善意的；\n（二）以合理的价格转让；\n（三）转让的不动产或者动产依照法律规定应当登记的已经登记，不需要登记的已经交付给受让人。\n受让人依据前款规定取得不动产或者动产的所有权的，原所有权人有权向无处分权人请求损害赔偿。\n当事人善意取得其他物权的，参照适用前两款规定。",
    chapter: "第二编 物权 · 第一分编 通则 · 第三章 物权的保护", version: "2020年5月28日通过", keywords: ["善意取得", "无处分权", "物权"] },
  { subject: "民法", law: "中华人民共和国民法典", article: "第188条", title: "诉讼时效期间",
    content: "向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定……",
    fullText: "向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定。\n诉讼时效期间自权利人知道或者应当知道权利受到损害以及义务人之日起计算。法律另有规定的，依照其规定。但是，自权利受到损害之日起超过二十年的，人民法院不予保护，有特殊情况的，人民法院可以根据权利人的申请决定延长。",
    chapter: "第一编 总则 · 第九章 诉讼时效", version: "2020年5月28日通过", keywords: ["诉讼时效", "三年"] },
  { subject: "民法", law: "中华人民共和国民法典", article: "第563条", title: "合同法定解除",
    content: "有下列情形之一的，当事人可以解除合同：（一）因不可抗力致使不能实现合同目的……",
    fullText: "有下列情形之一的，当事人可以解除合同：\n（一）因不可抗力致使不能实现合同目的；\n（二）在履行期限届满前，当事人一方明确表示或者以自己的行为表明不履行主要债务；\n（三）当事人一方迟延履行主要债务，经催告后在合理期限内仍未履行；\n（四）当事人一方迟延履行债务或者有其他违约行为致使不能实现合同目的；\n（五）法律规定的其他情形。\n以持续履行的债务为内容的不定期合同，当事人可以随时解除合同，但是应当在合理期限之前通知对方。",
    chapter: "第三编 合同 · 第一分编 通则 · 第八章 合同的解除", version: "2020年5月28日通过", keywords: ["合同解除", "不可抗力"] },
  { subject: "民法", law: "中华人民共和国民法典", article: "第985条", title: "不当得利",
    content: "得利人没有法律根据取得不当利益的，受损失的人可以请求得利人返还取得的利益……",
    fullText: "得利人没有法律根据取得不当利益的，受损失的人可以请求得利人返还取得的利益，但是有下列情形之一的除外：\n（一）为履行道德义务进行的给付；\n（二）债务到期之前的清偿；\n（三）明知无给付义务而进行的债务清偿。",
    chapter: "第三编 合同 · 第三分编 准合同 · 第二章 不当得利", version: "2020年5月28日通过", keywords: ["不当得利", "返还"] },
  { subject: "民法", law: "中华人民共和国民法典", article: "第634条", title: "分期付款买卖",
    content: "分期付款的买受人未支付到期价款的数额达到全部价款的五分之一，经催告后在合理期限内仍未支付的……",
    fullText: "分期付款的买受人未支付到期价款的数额达到全部价款的五分之一，经催告后在合理期限内仍未支付的，出卖人可以请求买受人支付全部价款或者解除合同。\n出卖人解除合同的，可以向买受人请求支付该标的物的使用费。",
    chapter: "第三编 合同 · 第二分编 典型合同 · 第九章 买卖合同", version: "2020年5月28日通过", keywords: ["分期付款", "五分之一"] },
  { subject: "刑法", law: "中华人民共和国刑法", article: "第232条", title: "故意杀人罪",
    content: "故意杀人的，处死刑、无期徒刑或者十年以上有期徒刑；情节较轻的，处三年以上十年以下有期徒刑。",
    fullText: "故意杀人的，处死刑、无期徒刑或者十年以上有期徒刑；情节较轻的，处三年以上十年以下有期徒刑。",
    chapter: "第二编 分则 · 第四章 侵犯公民人身权利、民主权利罪", version: "1997年3月14日通过，历经多次修正", keywords: ["故意杀人", "死刑"] },
  { subject: "刑法", law: "中华人民共和国刑法", article: "第264条", title: "盗窃罪",
    content: "盗窃公私财物，数额较大的，或者多次盗窃、入户盗窃、携带凶器盗窃、扒窃的，处三年以下有期徒刑……",
    fullText: "盗窃公私财物，数额较大的，或者多次盗窃、入户盗窃、携带凶器盗窃、扒窃的，处三年以下有期徒刑、拘役或者管制，并处或者单处罚金；数额巨大或者有其他严重情节的，处三年以上十年以下有期徒刑，并处罚金；数额特别巨大或者有其他特别严重情节的，处十年以上有期徒刑或者无期徒刑，并处罚金或者没收财产。",
    chapter: "第二编 分则 · 第五章 侵犯财产罪", version: "1997年3月14日通过，历经多次修正", keywords: ["盗窃", "财产犯罪"] },
  { subject: "行政法", law: "中华人民共和国行政诉讼法", article: "第46条", title: "起诉期限",
    content: "公民、法人或者其他组织直接向人民法院提起诉讼的，应当自知道或者应当知道作出行政行为之日起六个月内提出……",
    fullText: "公民、法人或者其他组织直接向人民法院提起诉讼的，应当自知道或者应当知道作出行政行为之日起六个月内提出。法律另有规定的除外。\n因不动产提起诉讼的案件自行政行为作出之日起超过二十年，其他案件自行政行为作出之日起超过五年提起诉讼的，人民法院不予受理。",
    chapter: "第三章 诉讼参加人", version: "2017年6月27日修正", keywords: ["行政诉讼", "起诉期限", "六个月"] },
  { subject: "民诉法", law: "中华人民共和国民事诉讼法", article: "第122条", title: "起诉条件",
    content: "起诉必须符合下列条件：（一）原告是与本案有直接利害关系的公民、法人和其他组织……",
    fullText: "起诉必须符合下列条件：\n（一）原告是与本案有直接利害关系的公民、法人和其他组织；\n（二）有明确的被告；\n（三）有具体的诉讼请求和事实、理由；\n（四）属于人民法院受理民事诉讼的范围和受诉人民法院管辖。",
    chapter: "第二编 审判程序 · 第一章 第一审普通程序", version: "2021年12月24日修正", keywords: ["起诉条件", "民事诉讼"] },
  { subject: "刑诉法", law: "中华人民共和国刑事诉讼法", article: "第12条", title: "无罪推定",
    content: "未经人民法院依法判决，对任何人都不得确定有罪。",
    fullText: "未经人民法院依法判决，对任何人都不得确定有罪。",
    chapter: "第一编 总则 · 第一章 任务和基本原则", version: "2018年10月26日修正", keywords: ["无罪推定", "刑事诉讼"] },
];

const HOT_ARTICLES = ["第311条", "第188条", "第563条", "第232条"];

// ─── Forum data ───────────────────────────────────────────────────────────────
const FORUM_POSTS: ForumPost[] = [
  { id: "f1", author: "法考老鸟", avatar: "老", tag: "经验分享", title: "三战上岸经验分享：客观题从108到213的蜕变之路", preview: "分享一下我三年备考的心路历程，希望能帮到还在坚持的同学们……", likes: 342, replies: 87, time: "2小时前", pinned: true },
  { id: "f2", author: "民法小白", avatar: "民", tag: "答疑求助", title: "善意取得中「合理价格」如何认定？有没有具体标准？", preview: "老师说合理价格不低于市价70%，但这个比例是哪里来的？有没有法条依据……", likes: 28, replies: 15, time: "4小时前" },
  { id: "f3", author: "刑法爱好者", avatar: "刑", tag: "知识整理", title: "共同犯罪8大考点汇总，附真题解析（2019-2023）", preview: "整理了近五年关于共同犯罪的考点，包括主从犯认定、帮助犯、片面共犯……", likes: 186, replies: 43, time: "昨天" },
  { id: "f4", author: "诉讼法研究", avatar: "诉", tag: "答疑求助", title: "行政诉讼起诉期限6个月和2年的区别，一直搞不清楚", preview: "请问直接起诉是6个月，但经过复议的是多久？两者起算点有何不同……", likes: 54, replies: 22, time: "昨天" },
  { id: "f5", author: "主观题达人", avatar: "主", tag: "技巧方法", title: "主观题答题模板分享：合同纠纷类案例万能框架", preview: "做了大量主观题后总结的答题框架，按照这个模板写基本不会跑偏……", likes: 271, replies: 61, time: "3天前" },
  { id: "f6", author: "行政法控", avatar: "行", tag: "知识整理", title: "行政许可vs行政审批vs行政确认，三者区别一表搞定", preview: "每次做题都被这三个概念绕晕，今天专门整理了对比表……", likes: 93, replies: 19, time: "4天前" },
];

const FORUM_TAGS = ["全部", "经验分享", "答疑求助", "知识整理", "技巧方法"];

// ─── Announcement data ────────────────────────────────────────────────────────
const ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", type: "考试", title: "2024年法律职业资格考试客观题考试时间公告", body: "根据司法部统一部署，2024年法律职业资格考试客观题考试时间定于2024年9月14日、15日举行，请各位考生提前做好准备，按时参加考试。", date: "2026-08-20", important: true },
  { id: "a2", type: "课程", title: "得宝法考2024客观题冲刺班正式上线", body: "2024年法考客观题冲刺直播课现已全面开放，包含20+场直播课程、历年真题精讲、考前模拟押题等内容，欢迎报名参加。", date: "2026-08-15" },
  { id: "a3", type: "政策", title: "关于法律职业资格考试报名条件调整的说明", body: "根据司法部最新规定，参加2024年法律职业资格考试报名资格条件如下：具备全日制普通高等学校法学类本科及以上学历，或者全日制普通高等学校非法学类本科及以上学历并具有法律职业资格考试报名资格。", date: "2026-08-10" },
  { id: "a4", type: "活动", title: "【免费公开课】法考备考策略专场直播，名额有限", body: "本周六晚19:00，三位资深法考名师将联合举办「2024法考最后冲刺攻略」公开课，直播内容包括：各科重点预测、答题技巧强化、心态调整建议等，扫码免费预约。", date: "2026-08-05" },
  { id: "a5", type: "课程", title: "民法精讲课第19-22讲已更新上线", body: "民法精讲课本周更新第19-22讲，内容涵盖「不动产登记」「动产交付」「用益物权」「担保物权」四个重要章节，已购学员可直接进入课程观看。", date: "2026-07-28" },
  { id: "a6", type: "政策", title: "2024年法考成绩查询时间及流程说明", body: "客观题考试成绩预计于考试结束后45个工作日内公布，届时请登录司法部官网或本平台查询成绩。如对成绩有异议，可在成绩公布后5个工作日内提出复核申请。", date: "2026-07-15" },
];

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  考试: { bg: "bg-[#FFF1E8]", text: "text-[#D2691E]" },
  政策: { bg: "bg-[#F0F0FF]", text: "text-[#4C4BEA]" },
  课程: { bg: "bg-[#EAF6EF]", text: "text-[#3A7A46]" },
  活动: { bg: "bg-[#FFF0F5]", text: "text-[#C0385A]" },
};

// ─── Main component ───────────────────────────────────────────────────────────
type MainTab = "laws" | "forum" | "notices";

export default function LawSearch({ nav }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>("laws");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<LawArticle | null>(null);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [subjectFilter, setSubjectFilter] = useState("全部");
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [forumTag, setForumTag] = useState("全部");
  const [expandedNotice, setExpandedNotice] = useState<string | null>(null);

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setSearched(true);
    setSubjectFilter("全部");
  };

  const toggleStar = (key: string) => {
    setStarred((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const searchResults = searched && query.trim()
    ? LAW_DB.filter((a) => a.title.includes(query) || a.article.includes(query) || a.keywords.some((k) => k.includes(query)) || a.content.includes(query))
    : [];

  const filteredBySubject = subjectFilter === "全部" ? LAW_DB : LAW_DB.filter((a) => a.subject === subjectFilter);
  const groupedBySubject = SUBJECTS.reduce<Record<string, LawArticle[]>>((acc, s) => {
    acc[s] = LAW_DB.filter((a) => a.subject === s);
    return acc;
  }, {});
  const hotArticles = LAW_DB.filter((a) => HOT_ARTICLES.includes(a.article));
  const filteredPosts = forumTag === "全部" ? FORUM_POSTS : FORUM_POSTS.filter((p) => p.tag === forumTag);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="法条 · 论坛" onBack={nav.goBack} />

      {/* Main tabs */}
      <div className="flex-none flex bg-white border-b border-[#E5E7ED]">
        {([["laws", "法条检索"], ["forum", "学习论坛"], ["notices", "官方公告"]] as [MainTab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setMainTab(t)}
            className={`flex-1 py-2.5 text-[13px] font-medium relative ${mainTab === t ? "text-[#4C4BEA]" : "text-[#707684]"}`}
          >
            {label}
            {t === "notices" && <span className="absolute top-2 right-4 w-1.5 h-1.5 bg-[#FF7252] rounded-full" />}
            {mainTab === t && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#4C4BEA] rounded-full" />}
          </button>
        ))}
      </div>

      {/* ── LAW TAB ── */}
      {mainTab === "laws" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="flex-none bg-white px-4 py-3 border-b border-[#E5E7ED]">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-[#F4F5F7] rounded-lg px-3 h-9">
                <Search size={14} color="#707684" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); if (!e.target.value.trim()) setSearched(false); }}
                  onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
                  placeholder="搜索法条、关键词、条文编号…"
                  className="flex-1 bg-transparent text-[13px] text-[#171925] placeholder:text-[#C0C5D0] outline-none"
                />
                {query && <button onClick={() => { setQuery(""); setSearched(false); }}><X size={13} color="#C0C5D0" /></button>}
              </div>
              <button onClick={() => doSearch(query)} className="px-3 h-9 bg-[#4C4BEA] text-white text-[12px] font-medium rounded-lg active:bg-[#3D3CC8]">搜索</button>
            </div>
          </div>

          {/* Subject filter chips */}
          {!searched && (
            <div className="flex-none bg-white border-b border-[#E5E7ED] px-4 py-2.5 flex gap-2 overflow-x-auto">
              {(["全部", ...SUBJECTS]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={`flex-none px-3 h-7 text-[12px] rounded-full border transition-colors ${
                    subjectFilter === s ? "bg-[#4C4BEA] text-white border-[#4C4BEA]" : "text-[#5F6574] border-[#E5E7ED]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-6">
            {searched ? (
              /* Search results */
              <div className="px-4 mt-3 space-y-2.5">
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center pt-16">
                    <Search size={36} color="#E5E7ED" />
                    <p className="text-[14px] text-[#707684] mt-3">未找到「{query}」相关法条</p>
                    <button onClick={() => { setQuery(""); setSearched(false); }} className="mt-2 text-[12px] text-[#4C4BEA]">返回浏览</button>
                  </div>
                ) : (
                  <>
                    <p className="text-[12px] text-[#707684]">找到 {searchResults.length} 条结果</p>
                    {searchResults.map((a) => (
                      <ArticleCard key={a.article} article={a} starred={starred.has(a.article)} onStar={() => toggleStar(a.article)} onOpen={() => setSelected(a)} />
                    ))}
                  </>
                )}
              </div>
            ) : subjectFilter === "全部" ? (
              <>
                {/* Hot articles */}
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="text-[13px]">🔥</span>
                    <p className="text-[13px] font-semibold text-[#171925]">高频考点法条</p>
                  </div>
                  <div className="space-y-2.5">
                    {hotArticles.map((a) => (
                      <ArticleCard key={a.article} article={a} starred={starred.has(a.article)} onStar={() => toggleStar(a.article)} onOpen={() => setSelected(a)} />
                    ))}
                  </div>
                </div>

                {/* Browse by subject */}
                <div className="px-4 pt-5">
                  <p className="text-[13px] font-semibold text-[#171925] mb-2.5">按科目浏览</p>
                  <div className="space-y-2">
                    {SUBJECTS.filter((s) => groupedBySubject[s]?.length > 0).map((s) => {
                      const articles = groupedBySubject[s];
                      const isOpen = expandedSubject === s;
                      return (
                        <div key={s} className="bg-white rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => setExpandedSubject(isOpen ? null : s)}
                            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#F4F5F7]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-[#171925]">{s}</span>
                              <span className="text-[11px] text-[#707684] bg-[#F4F5F7] px-2 py-0.5 rounded-full">{articles.length} 条</span>
                            </div>
                            <ChevronDown size={15} color="#C0C5D0" className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          {isOpen && (
                            <div className="border-t border-[#E5E7ED]">
                              {articles.map((a, i) => (
                                <div
                                  key={a.article}
                                  role="button"
                                  onClick={() => setSelected(a)}
                                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-[#F4F5F7] ${i < articles.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-[#171925]">{a.article}　{a.title}</p>
                                    <p className="text-[11px] text-[#707684] mt-0.5 line-clamp-1">{a.chapter}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-none">
                                    <div
                                      role="button"
                                      onClick={(e) => { e.stopPropagation(); toggleStar(a.article); }}
                                      className="p-1 active:opacity-70"
                                    >
                                      <Star size={14} color={starred.has(a.article) ? "#A87000" : "#C0C5D0"} fill={starred.has(a.article) ? "#A87000" : "none"} />
                                    </div>
                                    <ChevronRight size={14} color="#C0C5D0" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Filtered by subject */
              <div className="px-4 mt-3 space-y-2.5">
                <p className="text-[12px] text-[#707684]">{subjectFilter} · 共 {filteredBySubject.length} 条法条</p>
                {filteredBySubject.map((a) => (
                  <ArticleCard key={a.article} article={a} starred={starred.has(a.article)} onStar={() => toggleStar(a.article)} onOpen={() => setSelected(a)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FORUM TAB ── */}
      {mainTab === "forum" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tag filter */}
          <div className="flex-none bg-white border-b border-[#E5E7ED] px-4 py-2.5 flex gap-2 overflow-x-auto">
            {FORUM_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setForumTag(t)}
                className={`flex-none px-3 h-7 text-[12px] rounded-full border transition-colors ${
                  forumTag === t ? "bg-[#4C4BEA] text-white border-[#4C4BEA]" : "text-[#5F6574] border-[#E5E7ED]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pb-6">
            <div className="px-4 pt-3 space-y-2.5">
              {filteredPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4C4BEA] to-[#7B6CF5] flex items-center justify-center text-white text-[11px] font-bold flex-none">
                      {post.avatar}
                    </div>
                    <span className="text-[12px] font-medium text-[#5F6574]">{post.author}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-auto ${
                      post.tag === "答疑求助" ? "bg-[#FFF5DD] text-[#A87000]"
                      : post.tag === "经验分享" ? "bg-[#EAF6EF] text-[#3A7A46]"
                      : post.tag === "知识整理" ? "bg-[#F0F0FF] text-[#4C4BEA]"
                      : "bg-[#FFF0F5] text-[#C0385A]"
                    }`}>
                      {post.tag}
                    </span>
                    {post.pinned && <Pin size={12} color="#FF7252" />}
                  </div>

                  {/* Content */}
                  <p className="text-[14px] font-semibold text-[#171925] leading-snug mb-1">{post.title}</p>
                  <p className="text-[12px] text-[#707684] leading-relaxed line-clamp-2">{post.preview}</p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-[#F4F5F7]">
                    <button className="flex items-center gap-1 text-[11px] text-[#707684] active:opacity-70">
                      <ThumbsUp size={12} color="#C0C5D0" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 text-[11px] text-[#707684] active:opacity-70">
                      <MessageSquare size={12} color="#C0C5D0" />
                      {post.replies} 回复
                    </button>
                    <span className="text-[11px] text-[#C0C5D0] ml-auto">{post.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Post button */}
          <div className="flex-none bg-white border-t border-[#E5E7ED] px-4 py-3">
            <button className="w-full h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-xl active:bg-[#3D3CC8] flex items-center justify-center gap-2">
              <MessageSquare size={16} color="white" />
              发布帖子
            </button>
          </div>
        </div>
      )}

      {/* ── NOTICES TAB ── */}
      {mainTab === "notices" && (
        <div className="flex-1 overflow-y-auto pb-6">
          <div className="px-4 pt-3 space-y-2.5">
            {ANNOUNCEMENTS.map((ann) => {
              const style = TYPE_STYLE[ann.type];
              const isExpanded = expandedNotice === ann.id;
              return (
                <div
                  key={ann.id}
                  role="button"
                  onClick={() => setExpandedNotice(isExpanded ? null : ann.id)}
                  className={`bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer ${ann.important ? "border-l-4 border-[#FF7252]" : ""}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-none mt-0.5 ${style.bg} ${style.text}`}>
                        {ann.type}
                      </span>
                      {ann.important && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF1E8] text-[#D2691E] flex-none mt-0.5 flex items-center gap-0.5">
                          <Bell size={9} color="#D2691E" /> 重要
                        </span>
                      )}
                      <span className="text-[11px] text-[#C0C5D0] ml-auto flex-none">{ann.date}</span>
                    </div>
                    <p className="text-[14px] font-semibold text-[#171925] leading-snug">{ann.title}</p>

                    {isExpanded ? (
                      <p className="text-[13px] text-[#5F6574] leading-relaxed mt-2.5">{ann.body}</p>
                    ) : (
                      <p className="text-[12px] text-[#707684] leading-relaxed mt-1.5 line-clamp-2">{ann.body}</p>
                    )}

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F4F5F7]">
                      <span className="text-[11px] text-[#4C4BEA]">{isExpanded ? "收起 ↑" : "查看全文 ↓"}</span>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] text-[#707684] active:opacity-70"
                      >
                        <Bookmark size={11} color="#C0C5D0" /> 收藏
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full article sheet */}
      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title="法条全文">
        {selected && (
          <div className="px-5 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-[11px] text-[#707684]">{selected.law}</p>
                <p className="text-[19px] font-bold text-[#171925] mt-0.5">{selected.article}　{selected.title}</p>
                <p className="text-[11px] text-[#C0C5D0] mt-1">{selected.chapter}</p>
              </div>
              <div
                role="button"
                onClick={() => toggleStar(selected.article)}
                className="w-9 h-9 rounded-full bg-[#F4F5F7] flex items-center justify-center active:bg-[#E5E7ED] flex-none cursor-pointer"
              >
                <Star size={17} color={starred.has(selected.article) ? "#A87000" : "#C0C5D0"} fill={starred.has(selected.article) ? "#A87000" : "none"} />
              </div>
            </div>

            <div className="h-px bg-[#E5E7ED] mb-4" />

            <div className="bg-[#FAFAFE] rounded-xl p-4 mb-4 border border-[#F0F0FF]">
              <p className="text-[14px] text-[#171925] leading-[2] whitespace-pre-line">{selected.fullText}</p>
            </div>

            <p className="text-[11px] text-[#C0C5D0] text-center mb-4">{selected.version}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {selected.keywords.map((k) => (
                <button
                  key={k}
                  onClick={() => { setSelected(null); doSearch(k); setMainTab("laws"); }}
                  className="px-3 h-7 bg-[#F0F0FF] text-[#4C4BEA] text-[12px] rounded-full active:bg-[#E4E4FC]"
                >
                  #{k}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleStar(selected.article)}
                className={`flex-1 h-11 rounded-xl text-[14px] font-semibold border flex items-center justify-center gap-1.5 active:opacity-80 ${
                  starred.has(selected.article) ? "border-[#A87000]/40 bg-[#FFF5DD] text-[#A87000]" : "border-[#E5E7ED] text-[#5F6574]"
                }`}
              >
                <Star size={15} fill={starred.has(selected.article) ? "#A87000" : "none"} color={starred.has(selected.article) ? "#A87000" : "#5F6574"} />
                {starred.has(selected.article) ? "已收藏" : "收藏法条"}
              </button>
              <button
                onClick={() => { setSelected(null); nav.navigate({ type: "objective-answer", mode: "chapter", title: `${selected.article}相关练习` }); }}
                className="flex-1 h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-xl active:bg-[#3D3CC8] flex items-center justify-center gap-1.5"
              >
                <ChevronRight size={15} color="white" /> 相关练习题
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

// ─── Article card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, starred, onStar, onOpen }: {
  article: LawArticle; starred: boolean; onStar: () => void; onOpen: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer" onClick={onOpen}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[11px] text-[#707684]">{article.law}</p>
            <p className="text-[15px] font-bold text-[#171925] mt-0.5">{article.article}　{article.title}</p>
          </div>
          <div
            role="button"
            onClick={(e) => { e.stopPropagation(); onStar(); }}
            className="w-8 h-8 flex items-center justify-center flex-none active:opacity-70 cursor-pointer"
          >
            <Star size={16} color={starred ? "#A87000" : "#C0C5D0"} fill={starred ? "#A87000" : "none"} />
          </div>
        </div>
        <p className="text-[13px] text-[#5F6574] leading-relaxed line-clamp-2">{article.content}</p>
        <div className="mt-3 pt-2.5 border-t border-[#F4F5F7] flex items-center justify-between">
          <p className="text-[11px] text-[#707684] truncate flex-1 pr-2">{article.chapter}</p>
          <span className="text-[11px] text-[#4C4BEA] font-medium flex-none">查看全文 →</span>
        </div>
      </div>
    </div>
  );
}
