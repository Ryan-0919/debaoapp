import { useState } from "react";
import { NavContextType, Page, Tab } from "@/types";
import {
  Bell, ChevronRight,
  PlayCircle, ClipboardList, AlertCircle, Star, MessageCircle,
  Scale, PenLine, ThumbsUp, Pin, X,
} from "lucide-react";

const ANNOUNCEMENTS = [
  { type: "考试", text: "2024年法律职业资格考试客观题考试时间定于9月14日、15日举行，请提前做好准备。", important: true },
  { type: "课程", text: "民法精讲课第19-22讲已更新上线，已购学员可直接进入课程观看。", important: false },
];

const HOT_POSTS = [
  { tag: "经验分享", title: "三战上岸经验分享：客观题从108到213的蜕变之路", likes: 342, replies: 87, pinned: true },
  { tag: "知识整理", title: "共同犯罪8大考点汇总，附真题解析（2019-2023）", likes: 186, replies: 43, pinned: false },
  { tag: "答疑求助", title: "善意取得中「合理价格」如何认定？有没有具体标准？", likes: 28, replies: 15, pinned: false },
];

const BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=300&fit=crop&auto=format",
];

type EntryAction =
  | { kind: "tab"; tab: Tab }
  | { kind: "page"; page: Page };

interface Entry {
  icon: React.ReactNode;
  label: string;
  color: string;
  iconColor: string;
  action: EntryAction;
}

const OBJ_ENTRIES: Entry[] = [
  { icon: <PlayCircle size={22} strokeWidth={1.8} />, label: "我的课程", color: "#F0F0FF", iconColor: "#4C4BEA", action: { kind: "tab", tab: "courses" } },
  { icon: <ClipboardList size={22} strokeWidth={1.8} />, label: "做题记录", color: "#EDF5FF", iconColor: "#1A5FA8", action: { kind: "page", page: { type: "question-records" } } },
  { icon: <AlertCircle size={22} strokeWidth={1.8} />, label: "错题本", color: "#FFF1E8", iconColor: "#D2691E", action: { kind: "page", page: { type: "mistake-book" } } },
  { icon: <Star size={22} strokeWidth={1.8} />, label: "收藏夹", color: "#FFF5DD", iconColor: "#A87000", action: { kind: "page", page: { type: "favorites" } } },
  { icon: <MessageCircle size={22} strokeWidth={1.8} />, label: "AI答疑", color: "#EAF6EF", iconColor: "#1A8B8B", action: { kind: "page", page: { type: "ai-chat" } } },
];

const SUB_ENTRIES: Entry[] = [
  { icon: <PlayCircle size={22} strokeWidth={1.8} />, label: "课程", color: "#F0F0FF", iconColor: "#4C4BEA", action: { kind: "tab", tab: "courses" } },
  { icon: <Scale size={22} strokeWidth={1.8} />, label: "法条检索", color: "#EAF7F7", iconColor: "#1A8B8B", action: { kind: "page", page: { type: "law-search" } } },
  { icon: <ClipboardList size={22} strokeWidth={1.8} />, label: "做题记录", color: "#EDF5FF", iconColor: "#1A5FA8", action: { kind: "page", page: { type: "question-records" } } },
  { icon: <Star size={22} strokeWidth={1.8} />, label: "收藏夹", color: "#FFF5DD", iconColor: "#A87000", action: { kind: "page", page: { type: "favorites" } } },
  { icon: <PenLine size={22} strokeWidth={1.8} />, label: "批改", color: "#FFF1E8", iconColor: "#D2691E", action: { kind: "page", page: { type: "grading" } } },
  { icon: <MessageCircle size={22} strokeWidth={1.8} />, label: "AI答疑", color: "#EAF6EF", iconColor: "#1A8B8B", action: { kind: "page", page: { type: "ai-chat" } } },
];

interface Props { nav: NavContextType }

export default function Home({ nav }: Props) {
  const [channel, setChannel] = useState<"obj" | "sub">("obj");
  const [bannerIdx, setBannerIdx] = useState(0);
  const [noticeIdx, setNoticeIdx] = useState(0);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const entries = channel === "obj" ? OBJ_ENTRIES : SUB_ENTRIES;

  const examDays = channel === "obj" ? 42 : 98;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F5F7]">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-3 border-b border-[#E5E7ED]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-bold text-[#4C4BEA]">得宝法考</span>
            <span className="text-[11px] text-[#707684] bg-[#F4F5F7] px-1.5 py-0.5 rounded">演示数据</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Channel toggle */}
            <div className="flex bg-[#F4F5F7] rounded-lg p-0.5">
              {(["obj", "sub"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`px-3 h-7 text-[12px] font-semibold rounded transition-colors ${
                    channel === c
                      ? "bg-white text-[#4C4BEA] shadow-sm"
                      : "text-[#707684]"
                  }`}
                >
                  {c === "obj" ? "客观题" : "主观题"}
                </button>
              ))}
            </div>
            <button
              onClick={() => nav.navigate({ type: "notifications" })}
              className="w-8 h-8 flex items-center justify-center relative"
            >
              <Bell size={19} color="#5F6574" strokeWidth={1.8} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF7252] rounded-full" />
            </button>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="mx-4 mt-3 rounded-lg overflow-hidden relative">
        <img
          src={BANNER_IMAGES[bannerIdx]}
          alt="活动横幅"
          className="w-full h-[140px] object-cover bg-[#E5E7ED]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171925]/60 to-transparent flex items-end p-4">
          <div>
            <p className="text-white text-[13px] font-medium">
              {channel === "obj" ? "2024客观题精英班" : "2024主观题冲刺班"}
            </p>
            <p className="text-white/80 text-[11px] mt-0.5">
              {channel === "obj" ? "限时特惠 · 已有5312人报名" : "批改服务 · 已有1893人报名"}
            </p>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {BANNER_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === bannerIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Function entries */}
      <div className="bg-white mx-4 mt-3 rounded-lg px-4 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {entries.map(({ icon, label, color, iconColor, action }) => (
            <button
              key={label}
              onClick={() =>
                action.kind === "tab"
                  ? nav.switchTab(action.tab)
                  : nav.navigate(action.page)
              }
              className="flex flex-col items-center gap-1.5 flex-none active:opacity-70"
              style={{ minWidth: "56px" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: color, color: iconColor }}
              >
                {icon}
              </div>
              <span className="text-[11px] text-[#5F6574] whitespace-nowrap">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <button
        onClick={() => nav.navigate({ type: "product-detail", productId: "p1" })}
        className="mx-4 mt-3 rounded-xl overflow-hidden relative active:opacity-90 block w-[calc(100%-32px)]"
        style={{ height: 100 }}
      >
        <img
          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=300&fit=crop&auto=format"
          alt="活动"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, #4C4BEAee 0%, #4C4BEA88 60%, transparent 100%)" }} />
        <div className="absolute inset-0 flex items-center px-4 gap-3">
          <div className="flex-1">
            <p className="text-white text-[11px] font-medium opacity-80 mb-0.5">限时特惠 · 倒计时 3 天</p>
            <p className="text-white text-[15px] font-bold leading-snug">2024法考全程班</p>
            <p className="text-white text-[11px] opacity-70 mt-0.5">主客一体 · 名师精讲 · 含批改服务</p>
          </div>
          <div className="flex-none flex flex-col items-end gap-1.5">
            <div className="text-right">
              <p className="text-[#C9F456] text-[18px] font-bold leading-none">¥3,980</p>
              <p className="text-white/50 text-[11px] line-through">¥5,200</p>
            </div>
            <span className="bg-[#C9F456] text-[#171925] text-[12px] font-bold px-3 py-1 rounded-full">
              立即报名
            </span>
          </div>
        </div>
      </button>

      {/* Countdown */}
      <div className="mx-4 mt-3 bg-white rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-[#707684]">
            {channel === "obj" ? "2024客观题考试" : "2024主观题考试"}
          </p>
          <p className="text-[13px] text-[#171925] font-medium mt-0.5">距今还有</p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-bold text-[#4C4BEA]">{examDays}</span>
          <span className="text-[13px] text-[#5F6574]">天</span>
        </div>
      </div>

      {/* Hot courses */}
      <div>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[15px] font-semibold text-[#171925]">热门课程</span>
          <button
            onClick={() => nav.switchTab("mall")}
            className="flex items-center gap-0.5 text-[13px] text-[#4C4BEA]"
          >
            查看更多 <ChevronRight size={14} color="#4C4BEA" />
          </button>
        </div>

        <div className="flex gap-3 px-4 pb-2 overflow-x-auto">
          {[
            { name: "民法精讲课", teacher: "张明远", price: 1980, img: "photo-1589829545856-d10d557cf95f", id: "p2" },
            { name: "刑法体系课", teacher: "李东明", price: 2280, img: "photo-1553877522-43269d4ea984", id: "p1" },
            { name: "主观题冲刺", teacher: "王晓峰", price: 1280, img: "photo-1450101499163-c8848c66ca85", id: "p3" },
          ].map((c) => (
            <button
              key={c.name}
              onClick={() => nav.navigate({ type: "product-detail", productId: c.id })}
              className="flex-none w-[148px] bg-white rounded-lg overflow-hidden active:opacity-80"
            >
              <img
                src={`https://images.unsplash.com/${c.img}?w=300&h=170&fit=crop&auto=format`}
                alt={c.name}
                className="w-full h-[88px] object-cover bg-[#E5E7ED]"
              />
              <div className="p-2.5">
                <p className="text-[12px] font-semibold text-[#171925] leading-tight">{c.name}</p>
                <p className="text-[11px] text-[#707684] mt-0.5">{c.teacher}主讲</p>
                <p className="text-[13px] font-bold text-[#4C4BEA] mt-1.5">¥{c.price.toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Official notices */}
      {!noticeDismissed && (
        <div className="mx-4 mt-3 bg-white rounded-lg overflow-hidden border-l-4 border-[#4C4BEA]">
          <div className="px-3 py-2.5 flex items-start gap-2">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-none mt-0.5 ${
              ANNOUNCEMENTS[noticeIdx].important
                ? "bg-[#FFF1E8] text-[#D2691E]"
                : "bg-[#EAF6EF] text-[#3A7A46]"
            }`}>
              {ANNOUNCEMENTS[noticeIdx].type}
            </span>
            <p className="flex-1 text-[12px] text-[#5F6574] leading-relaxed line-clamp-2">
              {ANNOUNCEMENTS[noticeIdx].text}
            </p>
            <button onClick={() => setNoticeDismissed(true)} className="flex-none p-0.5 active:opacity-70">
              <X size={13} color="#C0C5D0" />
            </button>
          </div>
          <div className="flex items-center justify-between px-3 pb-2.5">
            <div className="flex gap-1">
              {ANNOUNCEMENTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setNoticeIdx(i)}
                  className={`h-1 rounded-full transition-all ${i === noticeIdx ? "w-4 bg-[#4C4BEA]" : "w-1 bg-[#E5E7ED]"}`}
                />
              ))}
            </div>
            <button
              onClick={() => nav.navigate({ type: "law-search" })}
              className="text-[11px] text-[#4C4BEA] font-medium"
            >
              查看全部公告 →
            </button>
          </div>
        </div>
      )}

      {/* Community hot posts */}
      <div className="mx-4 mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-semibold text-[#171925]">社区热帖</span>
          <button
            onClick={() => nav.navigate({ type: "law-search" })}
            className="flex items-center gap-0.5 text-[13px] text-[#4C4BEA]"
          >
            进入论坛 <ChevronRight size={14} color="#4C4BEA" />
          </button>
        </div>
        <div className="bg-white rounded-lg overflow-hidden">
          {HOT_POSTS.map((post, i) => (
            <button
              key={post.title}
              onClick={() => nav.navigate({ type: "law-search" })}
              className={`w-full flex items-start gap-2.5 px-4 py-3 text-left active:bg-[#F4F5F7] ${
                i < HOT_POSTS.length - 1 ? "border-b border-[#E5E7ED]" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    post.tag === "答疑求助" ? "bg-[#FFF5DD] text-[#A87000]"
                    : post.tag === "经验分享" ? "bg-[#EAF6EF] text-[#3A7A46]"
                    : "bg-[#F0F0FF] text-[#4C4BEA]"
                  }`}>
                    {post.tag}
                  </span>
                  {post.pinned && <Pin size={11} color="#FF7252" />}
                </div>
                <p className="text-[13px] text-[#171925] leading-snug line-clamp-1">{post.title}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-none text-[11px] text-[#C0C5D0]">
                <div className="flex items-center gap-1">
                  <ThumbsUp size={11} color="#C0C5D0" />
                  {post.likes}
                </div>
                <span>{post.replies} 回复</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
