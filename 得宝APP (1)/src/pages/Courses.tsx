import { useState, useRef } from "react";
import { NavContextType } from "@/types";
import { COURSES } from "@/data";
import TopBar from "@/components/TopBar";
import BottomSheet from "@/components/BottomSheet";
import { Play, ChevronLeft, ChevronRight, Radio, BookOpen, RotateCcw, CalendarDays, AlertCircle } from "lucide-react";
import { ProgressBar, Tag } from "@/components/ui";

interface Props { nav: NavContextType }

// ─── Mock schedule data ───────────────────────────────────────────────────────
type SessionStatus =
  | "done" | "in-progress" | "not-started" | "missed"
  | "live-waiting" | "live-soon" | "live-ended";

type SessionType = "main" | "supplement" | "live" | "practice" | "review";

interface Session {
  id: string;
  startTime: string;
  endTime: string;
  type: SessionType;
  label: string;
  title: string;
  lesson?: string;
  teacher?: string;
  duration: number;
  status: SessionStatus;
  progress?: number;
  completedAt?: string;
  tip?: string;
}

// Week of Aug 25–31 2026, pivot: Aug 27 = today
const SCHEDULE: Record<string, Session[]> = {
  "2026-08-25": [
    { id: "s1", startTime: "09:00", endTime: "10:20", type: "main", label: "录播", title: "民法精讲", lesson: "第16讲：物权的效力", teacher: "张明远", duration: 80, status: "done", progress: 100, completedAt: "10:18" },
    { id: "s2", startTime: "20:00", endTime: "20:30", type: "practice", label: "练习", title: "物权法配套题组", duration: 30, status: "done", completedAt: "20:25" },
  ],
  "2026-08-26": [
    { id: "s3", startTime: "09:00", endTime: "10:30", type: "main", label: "录播", title: "民法精讲", lesson: "第17讲：物权变动总论", teacher: "张明远", duration: 90, status: "done", progress: 100, completedAt: "10:27" },
    { id: "s4", startTime: "21:00", endTime: "21:30", type: "review", label: "复习", title: "物权变动错题整理", duration: 30, status: "missed", tip: "与本周课程配套" },
  ],
  "2026-08-27": [
    { id: "s5", startTime: "09:00", endTime: "10:20", type: "main", label: "录播", title: "民法精讲", lesson: "第18讲：物权变动的公示与公信原则", teacher: "张明远", duration: 80, status: "in-progress", progress: 62 },
    { id: "s6", startTime: "14:00", endTime: "15:00", type: "supplement", label: "专项", title: "请求权基础答题训练", duration: 60, status: "not-started", tip: "建议第18讲后完成" },
    { id: "s7", startTime: "19:30", endTime: "21:00", type: "live", label: "直播", title: "刑法重点罪名串讲", teacher: "李东明", duration: 90, status: "live-soon" },
    { id: "s8", startTime: "21:10", endTime: "21:40", type: "practice", label: "练习", title: "民法配套题组 · 第18讲", duration: 30, status: "not-started" },
  ],
  "2026-08-28": [
    { id: "s9", startTime: "09:00", endTime: "10:30", type: "main", label: "录播", title: "民法精讲", lesson: "第19讲：不动产登记", teacher: "张明远", duration: 90, status: "not-started" },
    { id: "s10", startTime: "15:00", endTime: "16:00", type: "supplement", label: "专项", title: "善意取得专题精讲", duration: 60, status: "not-started", tip: "与本周民法课程配套" },
  ],
  "2026-08-29": [
    { id: "s11", startTime: "09:30", endTime: "10:50", type: "main", label: "录播", title: "民法精讲", lesson: "第20讲：动产交付", teacher: "张明远", duration: 80, status: "not-started" },
  ],
  "2026-08-30": [],
  "2026-08-31": [
    { id: "s12", startTime: "10:00", endTime: "10:30", type: "review", label: "补课", title: "物权变动错题整理", duration: 30, status: "not-started", tip: "来自8月26日待补课" },
  ],
};

const DAY_DOTS: Record<string, "done" | "partial" | "missed" | "has-course" | "supplement" | "empty"> = {
  "2026-08-25": "done",
  "2026-08-26": "missed",
  "2026-08-27": "has-course",
  "2026-08-28": "has-course",
  "2026-08-29": "has-course",
  "2026-08-30": "empty",
  "2026-08-31": "supplement",
};

const TODAY = "2026-08-27";

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMonday(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  return addDays(d, diff);
}

const DOT_STYLES: Record<string, string> = {
  done: "bg-[#5DA765]",
  missed: "bg-[#FF7252]",
  "has-course": "bg-[#4C4BEA]",
  supplement: "bg-[#A87000]",
  empty: "bg-transparent",
  partial: "bg-[#4C4BEA]",
};

const SESSION_TYPE_STYLE: Record<SessionType, { border: string; bg: string; labelColor: string; labelBg: string }> = {
  main: { border: "border-l-[#4C4BEA]", bg: "", labelColor: "text-[#4C4BEA]", labelBg: "bg-[#F0F0FF]" },
  supplement: { border: "border-l-[#A87000]", bg: "", labelColor: "text-[#A87000]", labelBg: "bg-[#FFF5DD]" },
  live: { border: "border-l-[#C0385A]", bg: "", labelColor: "text-[#C0385A]", labelBg: "bg-[#FFF0F5]" },
  practice: { border: "border-l-[#1A8B8B]", bg: "", labelColor: "text-[#1A8B8B]", labelBg: "bg-[#EAF7F7]" },
  review: { border: "border-l-[#707684]", bg: "", labelColor: "text-[#707684]", labelBg: "bg-[#F4F5F7]" },
};

function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const map: Record<SessionStatus, { text: string; color: string }> = {
    "done": { text: "已完成", color: "text-[#5DA765]" },
    "in-progress": { text: "学习中", color: "text-[#4C4BEA]" },
    "not-started": { text: "未开始", color: "text-[#707684]" },
    "missed": { text: "待补课", color: "text-[#FF7252]" },
    "live-waiting": { text: "等待直播", color: "text-[#707684]" },
    "live-soon": { text: "即将开始", color: "text-[#C0385A]" },
    "live-ended": { text: "已结束", color: "text-[#707684]" },
  };
  const { text, color } = map[status];
  return <span className={`text-[11px] font-medium ${color}`}>{text}</span>;
}

function SessionActionButton({ session, nav }: { session: Session; nav: NavContextType }) {
  if (session.status === "in-progress") {
    return (
      <button
        onClick={() => nav.navigate({ type: "course-detail", courseId: "c1" })}
        className="flex items-center gap-1 bg-[#C9F456] text-[#171925] text-[12px] font-semibold px-3 h-8 rounded-lg active:bg-[#B8E040] flex-none"
      >
        <Play size={11} fill="#171925" color="#171925" /> 继续学习
      </button>
    );
  }
  if (session.status === "done") {
    return (
      <button className="flex items-center gap-1 text-[12px] text-[#707684] px-2 h-8 rounded-lg border border-[#E5E7ED] active:bg-[#F4F5F7] flex-none">
        <RotateCcw size={11} color="#707684" /> 再次学习
      </button>
    );
  }
  if (session.status === "missed") {
    return (
      <button
        onClick={() => nav.navigate({ type: "course-detail", courseId: "c1" })}
        className="text-[12px] text-[#FF7252] font-medium px-3 h-8 rounded-lg border border-[#FF7252]/30 bg-red-50 active:bg-red-100 flex-none"
      >
        立即补课
      </button>
    );
  }
  if (session.status === "live-soon") {
    return (
      <button
        onClick={() => nav.navigate({ type: "live-course", title: session.title })}
        className="text-[12px] text-[#C0385A] font-semibold px-3 h-8 rounded-lg bg-[#FFF0F5] active:bg-pink-100 flex-none animate-pulse"
      >
        进入直播
      </button>
    );
  }
  if (session.status === "live-waiting") {
    return (
      <button
        onClick={() => nav.navigate({ type: "live-course", title: session.title })}
        className="text-[12px] text-[#707684] px-3 h-8 rounded-lg border border-[#E5E7ED] flex-none"
      >
        查看详情
      </button>
    );
  }
  if (session.status === "not-started") {
    return (
      <button
        onClick={() => nav.navigate({ type: "course-detail", courseId: "c1" })}
        className="text-[12px] text-[#4C4BEA] font-medium px-3 h-8 rounded-lg bg-[#F0F0FF] active:bg-[#E4E4FC] flex-none"
      >
        {session.type === "practice" || session.type === "review" ? "去完成" : "开始学习"}
      </button>
    );
  }
  return null;
}

// ─── Month calendar bottom sheet ─────────────────────────────────────────────
function MonthCalendar({ baseDate, selectedKey, onSelect, onClose }: {
  baseDate: Date; selectedKey: string; onSelect: (key: string) => void; onClose: () => void
}) {
  const [month, setMonth] = useState(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay(); // 0=Sun
  const offset = firstDay === 0 ? 6 : firstDay - 1; // make Monday first
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let day = 1 - offset;
  while (day <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++, day++) {
      week.push(day >= 1 && day <= daysInMonth ? day : null);
    }
    weeks.push(week);
  }
  const MONTH_NAMES = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

  return (
    <div className="px-4 py-3 pb-5">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonth(new Date(year, mon - 1, 1))} className="w-8 h-8 flex items-center justify-center">
          <ChevronLeft size={18} color="#5F6574" />
        </button>
        <span className="text-[14px] font-semibold text-[#171925]">{year}年 {MONTH_NAMES[mon]}</span>
        <button onClick={() => setMonth(new Date(year, mon + 1, 1))} className="w-8 h-8 flex items-center justify-center">
          <ChevronRight size={18} color="#5F6574" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["一","二","三","四","五","六","日"].map(d => (
          <div key={d} className="text-center text-[11px] text-[#707684] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${year}-${String(mon + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const isSelected = key === selectedKey;
          const isToday = key === TODAY;
          const dot = DAY_DOTS[key];
          return (
            <button
              key={i}
              onClick={() => { onSelect(key); onClose(); }}
              className="flex flex-col items-center py-0.5"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-medium
                ${isSelected ? "bg-[#4C4BEA] text-white" : isToday ? "border border-[#4C4BEA] text-[#4C4BEA]" : "text-[#171925]"}`}>
                {d}
              </div>
              {dot && dot !== "empty" && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${DOT_STYLES[dot]}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reschedule sheet ─────────────────────────────────────────────────────────
function RescheduleSheet({ session, onDone, onClose }: {
  session: Session; onDone: () => void; onClose: () => void
}) {
  const options = [
    { label: "今天  8月27日", sub: "今日安排已满" },
    { label: "明天  8月28日", sub: "" },
    { label: "后天  8月29日", sub: "" },
    { label: "本周末  8月30日", sub: "暂无安排" },
    { label: "下周一  9月1日", sub: "" },
  ];
  const [sel, setSel] = useState(1);
  return (
    <div className="px-5 py-4">
      <p className="text-[13px] text-[#5F6574] mb-4 leading-relaxed">
        调整「{session.title}」的学习日期
      </p>
      <div className="space-y-1.5 mb-5">
        {options.map((o, i) => (
          <button
            key={i}
            onClick={() => setSel(i)}
            className={`w-full flex items-center px-3 h-11 rounded-lg text-left transition-colors ${
              sel === i ? "bg-[#F0F0FF] border border-[#4C4BEA]" : "bg-[#F4F5F7] border border-transparent"
            }`}
          >
            <span className="flex-1 text-[13px] font-medium text-[#171925]">{o.label}</span>
            {o.sub && <span className="text-[11px] text-[#707684]">{o.sub}</span>}
            {sel === i && <span className="text-[#4C4BEA] ml-2 text-[12px]">✓</span>}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 h-11 border border-[#E5E7ED] rounded-lg text-[14px] text-[#5F6574]">取消</button>
        <button onClick={onDone} className="flex-1 h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]">
          确认调整
        </button>
      </div>
    </div>
  );
}

// ─── Add to calendar sheet ────────────────────────────────────────────────────
function AddToCalendarSheet({ courseName, onDone, onClose }: {
  courseName: string; onDone: () => void; onClose: () => void
}) {
  const [selDay, setSelDay] = useState(1);
  const [selTime, setSelTime] = useState("14:00");
  const days = ["今天 8/27", "明天 8/28", "8月29日", "8月30日 周六", "9月1日"];
  const times = ["09:00", "14:00", "19:00", "21:00"];
  return (
    <div className="px-5 py-4">
      <p className="text-[13px] text-[#5F6574] mb-4">将「{courseName}」加入学习日历</p>
      <p className="text-[12px] font-semibold text-[#171925] mb-2">选择日期</p>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {days.map((d, i) => (
          <button key={i} onClick={() => setSelDay(i)}
            className={`px-3 h-8 rounded-lg text-[12px] font-medium border transition-colors ${
              selDay === i ? "bg-[#4C4BEA] text-white border-[#4C4BEA]" : "text-[#5F6574] border-[#E5E7ED]"
            }`}>{d}</button>
        ))}
      </div>
      <p className="text-[12px] font-semibold text-[#171925] mb-2">开始时间</p>
      <div className="flex gap-1.5 mb-5">
        {times.map(t => (
          <button key={t} onClick={() => setSelTime(t)}
            className={`px-3 h-8 rounded-lg text-[12px] font-medium border transition-colors ${
              selTime === t ? "bg-[#4C4BEA] text-white border-[#4C4BEA]" : "text-[#5F6574] border-[#E5E7ED]"
            }`}>{t}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 h-11 border border-[#E5E7ED] rounded-lg text-[14px] text-[#5F6574]">取消</button>
        <button onClick={onDone} className="flex-1 h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]">
          加入日历
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Courses({ nav }: Props) {
  const [view, setView] = useState<"calendar" | "all">("calendar");

  // Calendar state
  const todayDate = parseDate(TODAY);
  const [weekStart, setWeekStart] = useState(getMonday(todayDate));
  const [selectedKey, setSelectedKey] = useState(TODAY);
  const [quickFilter, setQuickFilter] = useState<"today" | "tomorrow" | "missed" | null>(null);

  // Sheets
  const [monthSheet, setMonthSheet] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
  const [addCalSession, setAddCalSession] = useState<{ name: string } | null>(null);
  const [addedCal, setAddedCal] = useState<Set<string>>(new Set());

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const effectiveKey = quickFilter === "today" ? TODAY
    : quickFilter === "tomorrow" ? toDateKey(addDays(parseDate(TODAY), 1))
    : selectedKey;

  const sessions = quickFilter === "missed"
    ? Object.values(SCHEDULE).flat().filter(s => s.status === "missed")
    : (SCHEDULE[effectiveKey] ?? []);

  const totalMissed = Object.values(SCHEDULE).flat().filter(s => s.status === "missed").length;

  const selectDate = (key: string) => {
    setSelectedKey(key);
    setQuickFilter(null);
    // Adjust week if needed
    const d = parseDate(key);
    const mon = getMonday(d);
    setWeekStart(mon);
  };

  const isToday = effectiveKey === TODAY;
  const isTomorrow = effectiveKey === toDateKey(addDays(parseDate(TODAY), 1));
  const selectedDate = parseDate(effectiveKey);
  const MONTH_NAMES = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];

  const totalMinutes = sessions.reduce((a, s) => a + s.duration, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours} 小时${mins > 0 ? ` ${mins} 分钟` : ""}` : `${mins} 分钟`;

  const continueSessions = sessions.filter(s => s.status === "in-progress");

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      {/* Top bar with segment */}
      <div className="flex-none bg-white border-b border-[#E5E7ED]">
        <div className="flex items-center justify-center gap-1 px-4 h-[52px]">
          <div className="flex bg-[#F4F5F7] rounded-lg p-0.5">
            {(["calendar", "all"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 h-7 text-[13px] font-semibold rounded transition-colors ${
                  view === v ? "bg-white text-[#4C4BEA] shadow-sm" : "text-[#707684]"
                }`}>
                {v === "calendar" ? "学习日历" : "全部课程"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="flex-1 overflow-y-auto">
          {/* Learning overview band */}
          <div className="bg-white px-4 pt-4 pb-3 border-b border-[#E5E7ED]">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-[11px] text-[#707684] mb-0.5">当前课程</p>
                <p className="text-[14px] font-bold text-[#171925] leading-snug">2026 法考主客一体系统班</p>
                <p className="text-[12px] text-[#4C4BEA] mt-0.5">第二阶段 · 系统精讲 · 民法第 18 讲 / 共 32 讲</p>
              </div>
              <div className="flex flex-col items-end flex-none">
                <span className="text-[20px] font-bold text-[#4C4BEA]">42%</span>
                <span className="text-[10px] text-[#707684]">整体进度</span>
              </div>
            </div>
            <ProgressBar value={42} className="mb-2.5" />
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-[#5F6574]">本周 <span className="font-semibold text-[#171925]">7</span> / 12 节</span>
              <span className="text-[#E5E7ED]">·</span>
              {totalMissed > 0 && (
                <>
                  <span className="text-[#FF7252] font-medium">待补课 {totalMissed} 节</span>
                  <span className="text-[#E5E7ED]">·</span>
                </>
              )}
              <span className="text-[#5F6574]">直播 <span className="font-semibold text-[#171925]">今晚 19:30</span></span>
            </div>
          </div>

          {/* Week strip */}
          <div className="bg-white px-4 pt-3 pb-3 border-b border-[#E5E7ED]">
            <div className="flex items-center justify-between mb-2.5">
              <button
                onClick={() => setMonthSheet(true)}
                className="flex items-center gap-1 text-[13px] font-semibold text-[#171925]"
              >
                {MONTH_NAMES[weekStart.getMonth()]}
                <ChevronRight size={14} color="#707684" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setWeekStart(addDays(weekStart, -7))}
                  className="w-7 h-7 flex items-center justify-center rounded active:bg-[#F4F5F7]"
                >
                  <ChevronLeft size={16} color="#707684" />
                </button>
                <button
                  onClick={() => setWeekStart(addDays(weekStart, 7))}
                  className="w-7 h-7 flex items-center justify-center rounded active:bg-[#F4F5F7]"
                >
                  <ChevronRight size={16} color="#707684" />
                </button>
              </div>
            </div>

            <div className="flex gap-1">
              {weekDays.map((d, i) => {
                const key = toDateKey(d);
                const isSelected = key === effectiveKey && !quickFilter;
                const isToday_ = key === TODAY;
                const dot = DAY_DOTS[key];
                const DAYS_CN = ["一", "二", "三", "四", "五", "六", "日"];
                return (
                  <button
                    key={key}
                    onClick={() => selectDate(key)}
                    className="flex-1 flex flex-col items-center gap-1 py-1"
                  >
                    <span className="text-[10px] text-[#707684]">{DAYS_CN[i]}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors ${
                      isSelected
                        ? "bg-[#4C4BEA] text-white"
                        : isToday_
                        ? "border border-[#4C4BEA] text-[#4C4BEA]"
                        : "text-[#171925]"
                    }`}>
                      {d.getDate()}
                    </div>
                    {dot && dot !== "empty" ? (
                      <div className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[dot]}`} />
                    ) : <div className="w-1.5 h-1.5" />}
                    {isToday_ && (
                      <span className="text-[9px] text-[#4C4BEA] font-medium -mt-0.5">今天</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick filters */}
          <div className="flex gap-2 px-4 pt-3 pb-1">
            {[
              { id: "today", label: "今天" },
              { id: "tomorrow", label: "明天" },
              { id: "missed", label: `待补课${totalMissed > 0 ? `  ${totalMissed}` : ""}` },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setQuickFilter(quickFilter === id as any ? null : id as any)}
                className={`px-3 h-7 text-[12px] font-medium rounded-full border transition-colors ${
                  quickFilter === id
                    ? id === "missed"
                      ? "bg-[#FF7252] text-white border-[#FF7252]"
                      : "bg-[#4C4BEA] text-white border-[#4C4BEA]"
                    : "text-[#5F6574] border-[#E5E7ED] bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* "Resume now" banner – only on today when in-progress session exists */}
          {isToday && continueSessions.length > 0 && !quickFilter && (
            <div className="mx-4 mt-2 bg-[#F0F0FF] border border-[#4C4BEA]/20 rounded-lg px-4 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#4C4BEA] font-medium">正在学习</p>
                <p className="text-[12px] text-[#171925] font-semibold truncate">{continueSessions[0].lesson}</p>
              </div>
              <button
                onClick={() => nav.navigate({ type: "course-detail", courseId: "c1" })}
                className="flex items-center gap-1 bg-[#C9F456] text-[#171925] text-[12px] font-semibold px-3 h-8 rounded-lg active:bg-[#B8E040] flex-none"
              >
                <Play size={11} fill="#171925" color="#171925" /> 现在继续
              </button>
            </div>
          )}

          {/* Schedule */}
          <div className="px-4 pt-3 pb-6">
            {/* Date header */}
            {quickFilter !== "missed" ? (
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[14px] font-bold text-[#171925]">
                  {quickFilter === "today" || isToday
                    ? "今日学习"
                    : quickFilter === "tomorrow" || isTomorrow
                    ? "明日课程"
                    : `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`}
                </p>
                {sessions.length > 0 && (
                  <p className="text-[12px] text-[#707684]">
                    {sessions.length} 项 · 预计 {timeStr}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[14px] font-bold text-[#171925] mb-3">待补课程</p>
            )}

            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg py-10 flex flex-col items-center">
                <CalendarDays size={32} color="#C0C5D0" className="mb-3" />
                <p className="text-[14px] font-medium text-[#171925]">今日无课程安排</p>
                <p className="text-[12px] text-[#707684] mt-1">可以轻松休息，或查看明日课表</p>
                <button
                  onClick={() => setQuickFilter("tomorrow")}
                  className="mt-3 text-[13px] text-[#4C4BEA] font-medium"
                >
                  查看明日课表 →
                </button>
              </div>
            ) : quickFilter === "missed" ? (
              // Missed view
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="bg-white rounded-lg px-4 py-3 border-l-4 border-l-[#FF7252]">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-medium text-[#FF7252] bg-red-50 px-1.5 py-0.5 rounded">待补课</span>
                          <span className="text-[11px] text-[#707684]">原计划 8月26日</span>
                        </div>
                        <p className="text-[14px] font-semibold text-[#171925] truncate">{s.title}</p>
                        {s.lesson && <p className="text-[12px] text-[#707684] mt-0.5">{s.lesson}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] text-[#707684]">{s.duration} 分钟</span>
                      <div className="flex-1" />
                      <button
                        onClick={() => setRescheduleSession(s)}
                        className="text-[12px] text-[#707684] px-2 h-7 border border-[#E5E7ED] rounded-lg"
                      >
                        调整日期
                      </button>
                      <button
                        onClick={() => nav.navigate({ type: "course-detail", courseId: "c1" })}
                        className="text-[12px] text-[#FF7252] font-medium px-3 h-7 rounded-lg bg-red-50 border border-[#FF7252]/20"
                      >
                        立即补课
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Timeline schedule
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[44px] top-0 bottom-0 w-px bg-[#E5E7ED]" />

                <div className="space-y-3">
                  {sessions.map((s, idx) => {
                    const style = SESSION_TYPE_STYLE[s.type];
                    return (
                      <div key={s.id} className="flex gap-3">
                        {/* Time column */}
                        <div className="w-[44px] flex-none pt-3">
                          <p className="text-[11px] font-medium text-[#707684] text-right leading-none">{s.startTime}</p>
                        </div>

                        {/* Timeline dot */}
                        <div className="flex-none relative z-10 pt-3">
                          <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                            s.status === "done"
                              ? "bg-[#5DA765] border-[#5DA765]"
                              : s.status === "in-progress"
                              ? "bg-[#4C4BEA] border-[#4C4BEA]"
                              : s.status === "missed"
                              ? "bg-[#FF7252] border-[#FF7252]"
                              : s.status === "live-soon"
                              ? "bg-[#C0385A] border-[#C0385A]"
                              : "bg-white border-[#C0C5D0]"
                          }`} />
                        </div>

                        {/* Card */}
                        <div className={`flex-1 min-w-0 bg-white rounded-lg border-l-[3px] ${style.border} overflow-hidden`}>
                          <div className="px-3 py-3">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${style.labelBg} ${style.labelColor}`}>
                                  {s.label}
                                </span>
                                <SessionStatusBadge status={s.status} />
                              </div>
                              <span className="text-[10px] text-[#C0C5D0] flex-none">{s.startTime}–{s.endTime}</span>
                            </div>

                            <p className="text-[14px] font-semibold text-[#171925] leading-snug mb-0.5">{s.title}</p>
                            {s.lesson && <p className="text-[12px] text-[#5F6574] mb-0.5 leading-snug">{s.lesson}</p>}

                            <div className="flex items-center gap-2 text-[11px] text-[#707684] mb-2">
                              {s.teacher && <span>{s.teacher}</span>}
                              {s.teacher && <span>·</span>}
                              <span>{s.duration} 分钟</span>
                              {s.tip && <><span>·</span><span className="text-[#A87000]">{s.tip}</span></>}
                            </div>

                            {s.status === "in-progress" && s.progress !== undefined && (
                              <div className="flex items-center gap-2 mb-2">
                                <ProgressBar value={s.progress} className="flex-1" />
                                <span className="text-[11px] text-[#4C4BEA] font-medium flex-none">{s.progress}%</span>
                              </div>
                            )}

                            {s.status === "done" && s.completedAt && (
                              <p className="text-[11px] text-[#5DA765] mb-2">完成于 {s.completedAt}</p>
                            )}

                            <div className="flex items-center justify-between">
                              {s.status === "missed" && (
                                <button
                                  onClick={() => setRescheduleSession(s)}
                                  className="text-[11px] text-[#707684] underline"
                                >
                                  调整日期
                                </button>
                              )}
                              <div className="ml-auto">
                                <SessionActionButton session={s} nav={nav} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── All Courses view ─────────────────────────────────────────── */
        <div className="flex-1 overflow-y-auto pb-6">
          {/* Main courses */}
          <div className="mx-4 mt-4">
            <p className="text-[11px] text-[#707684] mb-1.5">录播课</p>
            <div className="bg-white rounded-lg overflow-hidden">
              {COURSES.filter(c => c.type === "录播").map((course, i, arr) => (
                <div
                  key={course.id}
                  className={`px-4 py-4 ${i < arr.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}
                >
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => nav.navigate({ type: "course-detail", courseId: course.id })}
                  >
                    <img src={course.image} alt={course.name}
                      className="w-[64px] h-[44px] object-cover rounded bg-[#E5E7ED] flex-none" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#171925] leading-snug">{course.name}</p>
                      <p className="text-[11px] text-[#707684] mt-0.5 mb-2">{course.teacher}主讲 · 有效期至 2025年1月</p>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={course.progress} className="flex-1" />
                        <span className="text-[11px] text-[#4C4BEA] font-semibold flex-none">{course.progress}%</span>
                      </div>
                      <p className="text-[11px] text-[#707684] mt-1">
                        {course.completedLessons}/{course.totalLessons} 课节 · 上次学习 {course.lastStudied}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => nav.navigate({ type: "course-detail", courseId: course.id })}
                      className="flex-1 h-8 text-[12px] text-[#4C4BEA] font-medium bg-[#F0F0FF] rounded-lg"
                    >
                      查看本周安排
                    </button>
                    <button
                      onClick={() => nav.navigate({ type: "course-detail", courseId: course.id })}
                      className="flex-1 h-8 text-[12px] font-semibold text-[#171925] bg-[#C9F456] rounded-lg flex items-center justify-center gap-1"
                    >
                      <Play size={11} fill="#171925" color="#171925" /> 继续学习
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplement courses */}
          <div className="mx-4 mt-4">
            <p className="text-[11px] text-[#707684] mb-1.5">专项训练</p>
            <div className="bg-white rounded-lg overflow-hidden">
              {[
                { id: "sup1", name: "请求权基础答题训练", main: "民法精讲课", stage: "建议第18讲后开始", progress: 0, added: false },
                { id: "sup2", name: "刑法重点罪名冲刺", main: "刑法体系课", stage: "建议刑法分论阶段", progress: 35, added: true },
              ].map((c, i, arr) => {
                const isAdded = addedCal.has(c.id) || c.added;
                return (
                  <div key={c.id} className={`px-4 py-3.5 ${i < arr.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#171925]">{c.name}</p>
                        <p className="text-[11px] text-[#707684] mt-0.5">配合「{c.main}」· {c.stage}</p>
                        {c.progress > 0 && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <ProgressBar value={c.progress} color="#A87000" className="flex-1" />
                            <span className="text-[11px] text-[#A87000] font-medium">{c.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => nav.navigate({ type: "course-detail", courseId: "c1" })}
                        className="flex-1 h-8 text-[12px] text-[#5F6574] border border-[#E5E7ED] rounded-lg"
                      >
                        查看课程
                      </button>
                      {isAdded ? (
                        <button className="flex-1 h-8 text-[12px] text-[#5DA765] bg-[#EAF6EF] rounded-lg flex items-center justify-center gap-1">
                          ✓ 已加入日历
                        </button>
                      ) : (
                        <button
                          onClick={() => setAddCalSession({ name: c.name })}
                          className="flex-1 h-8 text-[12px] text-[#4C4BEA] font-medium bg-[#F0F0FF] rounded-lg"
                        >
                          + 加入学习安排
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audio courses */}
          <div className="mx-4 mt-4">
            <p className="text-[11px] text-[#707684] mb-1.5">音频课程</p>
            <div className="bg-white rounded-lg overflow-hidden">
              {[
                { id: "a1", name: "民法音频精讲（通勤随听版）", teacher: "张明远", lessons: 68, hours: 52, progress: 18 },
                { id: "a2", name: "法考全科音频串讲班", teacher: "多位名师", lessons: 220, hours: 160, progress: 0 },
              ].map((c, i, arr) => (
                <div key={c.id} className={`px-4 py-4 ${i < arr.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4C4BEA] to-[#7B6CF5] flex items-center justify-center flex-none shadow-sm">
                      <BookOpen size={22} color="white" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#171925] leading-snug">{c.name}</p>
                      <p className="text-[11px] text-[#707684] mt-0.5">{c.teacher}主讲 · 共{c.lessons}讲 · 约{c.hours}小时</p>
                      {c.progress > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <ProgressBar value={c.progress} className="flex-1" />
                          <span className="text-[11px] text-[#4C4BEA] font-semibold">{c.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => nav.navigate({ type: "audio-player", courseId: "c1" })}
                      className="flex-1 h-8 text-[12px] font-semibold text-[#171925] bg-[#C9F456] rounded-lg flex items-center justify-center gap-1 active:bg-[#B8E040]"
                    >
                      <Play size={11} fill="#171925" color="#171925" />
                      {c.progress > 0 ? "继续收听" : "开始收听"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live courses */}
          <div className="mx-4 mt-4">
            <p className="text-[11px] text-[#707684] mb-1.5">直播课程</p>
            <div className="bg-white rounded-lg overflow-hidden">
              {[
                { id: "l1", name: "民法精讲第18讲：物权变动", teacher: "张明远", time: "今日 19:00", status: "soon" as const },
                { id: "l2", name: "法考直播冲刺班（考前30天）", teacher: "多位名师", time: "09月01日 开课", status: "upcoming" as const },
              ].map((c, i, arr) => (
                <div key={c.id} className={`px-4 py-4 ${i < arr.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C0385A] to-[#E05070] flex items-center justify-center flex-none shadow-sm relative">
                      <Radio size={22} color="white" strokeWidth={1.8} />
                      {c.status === "soon" && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF7252] rounded-full border-2 border-white animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#171925] leading-snug">{c.name}</p>
                      <p className="text-[11px] text-[#707684] mt-0.5">{c.teacher}主讲</p>
                      <div className="flex items-center gap-1 mt-1">
                        {c.status === "soon" ? (
                          <span className="text-[11px] font-semibold text-[#C0385A]">● {c.time}</span>
                        ) : (
                          <span className="text-[11px] text-[#707684]">{c.time}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => nav.navigate({ type: "live-course", title: c.name })}
                      className={`flex-1 h-8 text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1 active:opacity-80 ${
                        c.status === "soon"
                          ? "bg-[#FFF0F5] text-[#C0385A] border border-[#C0385A]/30"
                          : "bg-[#F0F0FF] text-[#4C4BEA]"
                      }`}
                    >
                      {c.status === "soon" ? "进入直播间" : "预约提醒"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div className="mx-4 mt-4">
            <p className="text-[11px] text-[#707684] mb-1.5">已完成</p>
            <div className="bg-white rounded-lg px-4 py-4 flex items-center justify-between">
              <p className="text-[14px] text-[#707684]">暂无已完成课程</p>
            </div>
          </div>
        </div>
      )}

      {/* Month calendar sheet */}
      <BottomSheet open={monthSheet} onClose={() => setMonthSheet(false)} title="选择日期">
        <MonthCalendar
          baseDate={todayDate}
          selectedKey={effectiveKey}
          onSelect={selectDate}
          onClose={() => setMonthSheet(false)}
        />
      </BottomSheet>

      {/* Reschedule sheet */}
      <BottomSheet open={!!rescheduleSession} onClose={() => setRescheduleSession(null)} title="调整补课日期">
        {rescheduleSession && (
          <RescheduleSheet
            session={rescheduleSession}
            onDone={() => setRescheduleSession(null)}
            onClose={() => setRescheduleSession(null)}
          />
        )}
      </BottomSheet>

      {/* Add to calendar sheet */}
      <BottomSheet open={!!addCalSession} onClose={() => setAddCalSession(null)} title="加入学习安排">
        {addCalSession && (
          <AddToCalendarSheet
            courseName={addCalSession.name}
            onDone={() => {
              if (addCalSession) setAddedCal(s => new Set([...s, addCalSession.name]));
              setAddCalSession(null);
            }}
            onClose={() => setAddCalSession(null)}
          />
        )}
      </BottomSheet>
    </div>
  );
}
