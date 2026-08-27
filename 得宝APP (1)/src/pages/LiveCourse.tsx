import { useState, useEffect, useRef } from "react";
import { NavContextType } from "@/types";
import { ChevronLeft, Send, Heart, Share2, Users, MessageCircle, BookOpen } from "lucide-react";

interface Props {
  nav: NavContextType;
  title?: string;
}

type LiveState = "countdown" | "live" | "replay";

type ChatMsg = { id: number; user: string; avatar: string; text: string; ts: string };

const MOCK_MESSAGES: ChatMsg[] = [
  { id: 1, user: "法考学员A", avatar: "A", text: "老师讲得太清楚了！", ts: "14:02" },
  { id: 2, user: "备考小组", avatar: "B", text: "这个知识点我以前一直搞混", ts: "14:02" },
  { id: 3, user: "法律人小王", avatar: "C", text: "善意取得的这三个要件要背熟", ts: "14:03" },
  { id: 4, user: "律师执照+1", avatar: "D", text: "请问民法和刑法哪个先背？", ts: "14:03" },
  { id: 5, user: "张明远老师", avatar: "T", text: "建议先打好民法基础，刑法逻辑性强跟上就好", ts: "14:04" },
];

const UPCOMING = [
  { time: "14:30", name: "民法精讲第19讲：用益物权", teacher: "张明远", viewers: 1842 },
  { time: "16:00", name: "刑法体系第8讲：共同犯罪", teacher: "李东明", viewers: 2137 },
  { time: "19:30", name: "主观题写作技巧专题", teacher: "王晓峰", viewers: 986 },
];

function CountdownDisplay({ seconds }: { seconds: number }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div className="flex items-center gap-2">
      {[pad(h), pad(m), pad(s)].map((v, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="w-12 h-14 bg-[#1A1A2E] rounded-lg flex items-center justify-center text-[24px] font-bold text-white">
            {v}
          </span>
          {i < 2 && <span className="text-white/60 text-[20px] font-light">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function LiveCourse({ nav, title }: Props) {
  const [liveState] = useState<LiveState>("countdown");
  const [countdown, setCountdown] = useState(4 * 3600 + 28 * 60 + 17); // ~4.5h
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>(MOCK_MESSAGES);
  const [chatTab, setChatTab] = useState<"chat" | "slides">("chat");
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(6284);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveState !== "countdown") return;
    const t = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [liveState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((m) => [
      ...m,
      { id: Date.now(), user: "我", avatar: "M", text: chatInput.trim(), ts: "now" },
    ]);
    setChatInput("");
  };

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const courseTitle = title ?? "民法精讲第18讲：物权变动的公示与公信原则";

  if (liveState === "countdown") {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0F]">
        {/* Header */}
        <div className="flex-none flex items-center gap-3 px-4 pt-3 pb-3">
          <button
            onClick={nav.goBack}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center active:bg-white/20"
          >
            <ChevronLeft size={18} color="white" />
          </button>
          <p className="text-[14px] font-semibold text-white flex-1 truncate">即将直播</p>
          <button className="w-8 h-8 flex items-center justify-center active:opacity-70">
            <Share2 size={17} color="white/70" />
          </button>
        </div>

        {/* Hero area */}
        <div className="flex-none relative">
          <img
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop&auto=format"
            alt="封面"
            className="w-full object-cover opacity-20"
            style={{ height: 180 }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="bg-[#FF7252] px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[11px] text-white font-semibold">距开播</span>
            </div>
            <CountdownDisplay seconds={countdown} />
            <p className="text-[11px] text-white/50">2026年08月27日  19:00 正式开播</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex-none bg-[#12121F] px-4 py-4 border-b border-white/10">
          <p className="text-[15px] font-bold text-white leading-snug">{courseTitle}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-7 h-7 rounded-full bg-[#4C4BEA] flex items-center justify-center flex-none">
              <span className="text-[11px] text-white font-bold">张</span>
            </div>
            <p className="text-[13px] text-white/70">张明远老师</p>
            <div className="flex items-center gap-1 ml-auto">
              <Users size={13} color="#C0C5D0" />
              <span className="text-[12px] text-white/50">已预约 {likeCount.toLocaleString()} 人</span>
            </div>
          </div>
        </div>

        {/* Upcoming schedule */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0F] px-4 py-4">
          <p className="text-[13px] font-semibold text-white/60 mb-3">今日直播安排</p>
          <div className="space-y-2.5">
            {UPCOMING.map((item) => (
              <div key={item.name} className="bg-[#12121F] rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="flex-none text-center">
                  <p className="text-[13px] font-bold text-[#C9F456]">{item.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{item.teacher} · 预约 {item.viewers.toLocaleString()}</p>
                </div>
                <button className="flex-none bg-[#4C4BEA]/20 border border-[#4C4BEA]/40 text-[#8887F5] text-[11px] font-semibold px-3 h-7 rounded-full active:bg-[#4C4BEA]/30">
                  预约
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe bar */}
        <div className="flex-none bg-[#12121F] border-t border-white/10 px-4 py-3">
          <button
            onClick={handleLike}
            className={`w-full h-12 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 active:opacity-80 transition-colors ${
              liked ? "bg-[#FF7252]/20 text-[#FF7252] border border-[#FF7252]/40" : "bg-[#4C4BEA] text-white"
            }`}
          >
            <Heart size={16} fill={liked ? "#FF7252" : "none"} color={liked ? "#FF7252" : "white"} />
            {liked ? "已预约开播提醒" : "预约开播提醒"}
          </button>
        </div>
      </div>
    );
  }

  // Live / replay state (kept for completeness but never reached in demo)
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0F]">
      <div className="flex-none flex items-center gap-3 px-4 pt-3 pb-3">
        <button onClick={nav.goBack} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center active:bg-white/20">
          <ChevronLeft size={18} color="white" />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="bg-[#FF7252] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> 直播中
          </span>
          <p className="text-[13px] text-white truncate">{courseTitle}</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-white/50">
          <Users size={12} color="rgba(255,255,255,0.5)" />
          {(1842).toLocaleString()}
        </div>
      </div>

      {/* Video */}
      <div className="flex-none bg-black" style={{ height: 200 }}>
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop&auto=format"
          alt="直播"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Tabs */}
      <div className="flex-none flex bg-[#12121F] border-b border-white/10">
        {(["chat", "slides"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setChatTab(t)}
            className={`flex-1 py-2.5 text-[13px] flex items-center justify-center gap-1.5 ${
              chatTab === t ? "text-white border-b-2 border-[#C9F456]" : "text-white/40"
            }`}
          >
            {t === "chat" ? <><MessageCircle size={13} />聊天室</> : <><BookOpen size={13} />课件</>}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {messages.map((m) => (
          <div key={m.id} className={`flex items-end gap-2 ${m.user === "我" ? "flex-row-reverse" : ""}`}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-none text-[11px] font-bold text-white"
              style={{ background: m.user === "张明远老师" ? "#C9F456" : m.user === "我" ? "#4C4BEA" : "#333" }}
            >
              {m.avatar}
            </div>
            <div className={`max-w-[220px] ${m.user === "我" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
              {m.user !== "我" && (
                <span className={`text-[10px] ${m.user === "张明远老师" ? "text-[#C9F456]" : "text-white/40"}`}>{m.user}</span>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${
                  m.user === "我"
                    ? "bg-[#4C4BEA] text-white rounded-br-sm"
                    : "bg-[#1E1E2E] text-white/90 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
      <div className="flex-none bg-[#12121F] border-t border-white/10 px-3 py-2.5 flex items-center gap-2">
        <button onClick={handleLike} className="w-8 h-8 flex items-center justify-center active:opacity-70">
          <Heart size={18} fill={liked ? "#FF7252" : "none"} color={liked ? "#FF7252" : "rgba(255,255,255,0.5)"} />
        </button>
        <div className="flex-1 bg-[#1E1E2E] rounded-full flex items-center px-3 h-9">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            placeholder="说点什么..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 outline-none"
          />
        </div>
        <button
          onClick={sendMessage}
          className="w-8 h-8 bg-[#4C4BEA] rounded-full flex items-center justify-center active:bg-[#3D3CC8]"
        >
          <Send size={14} color="white" />
        </button>
      </div>
    </div>
  );
}
