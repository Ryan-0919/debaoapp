import { useState, useEffect, useRef } from "react";
import { NavContextType } from "@/types";
import { COURSES } from "@/data";
import {
  ChevronLeft, SkipBack, SkipForward, Play, Pause,
  Repeat, Share2, Download, BookOpen, PenLine, List,
} from "lucide-react";

interface Props {
  nav: NavContextType;
  courseId: string;
  lessonId?: string;
}

type Tab = "transcript" | "notes" | "catalog";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const TRANSCRIPT = [
  { ts: 0, text: "同学们好，今天我们学习物权法中一个非常重要的概念——物权变动。" },
  { ts: 12, text: "物权变动，就是物权的产生、变更和消灭。听起来抽象，但实际上你每天都在经历它。" },
  { ts: 26, text: "比如你买了一支笔，那支笔所有权就发生了变动，从卖家转移到你。" },
  { ts: 40, text: "民法典第208条明确规定：不动产物权的变动，以登记为生效要件。" },
  { ts: 58, text: "这意味着，哪怕你签了合同、付了钱，只要没办理过户登记，法律上你还不是房子的主人。" },
  { ts: 75, text: "这和我们的生活直觉不一样，所以很多同学在这里出错。记住：不动产=登记。" },
  { ts: 92, text: "动产就简单多了，动产物权自交付时发生效力。给你了，就是你的。" },
  { ts: 108, text: "好，接下来我们讲善意取得制度，这是客观题的高频考点……" },
  { ts: 124, text: "善意取得的三个要件：第一，无权处分；第二，受让人善意；第三，已完成交付或登记。" },
  { ts: 145, text: "三个条件缺一不可。缺了任何一个，善意取得就不成立。" },
];

const MOCK_NOTES = [
  { id: 1, ts: "00:40", text: "民法典第208条：不动产登记生效" },
  { id: 2, ts: "02:04", text: "善意取得三要件：无权处分、善意、交付/登记" },
];

export default function AudioPlayer({ nav, courseId, lessonId }: Props) {
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(38); // seconds
  const [speed, setSpeed] = useState(1.0);
  const [showSpeed, setShowSpeed] = useState(false);
  const [loop, setLoop] = useState(false);
  const [tab, setTab] = useState<Tab>("transcript");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState(MOCK_NOTES);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const totalSec = 720; // 12 minutes

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          if (next >= totalSec) {
            if (loop) return 0;
            setPlaying(false);
            return totalSec;
          }
          return next;
        });
      }, 1000 / speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, speed, loop]);

  const progress = (elapsed / totalSec) * 100;

  const allLessons = course.chapters.flatMap((ch) => ch.lessons);
  const currentLesson =
    lessonId ? allLessons.find((l) => l.id === lessonId) : allLessons.find((l) => (l as any).current) ?? allLessons[0];

  const currentTranscriptIdx = TRANSCRIPT.reduce((acc, seg, i) => {
    return seg.ts <= elapsed ? i : acc;
  }, 0);

  const addNote = () => {
    if (!noteInput.trim()) return;
    setNotes((n) => [{ id: Date.now(), ts: fmtTime(elapsed), text: noteInput.trim() }, ...n]);
    setNoteInput("");
  };

  // Waveform bars (simulated)
  const bars = Array.from({ length: 48 }, (_, i) => {
    const seed = Math.sin(i * 1.7) * 0.5 + 0.5;
    return 0.15 + seed * 0.85;
  });
  const activeBars = Math.round((elapsed / totalSec) * bars.length);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      {/* Top bar */}
      <div className="flex-none bg-white flex items-center justify-between px-4 py-3 border-b border-[#E5E7ED]">
        <button onClick={nav.goBack} className="w-8 h-8 flex items-center justify-center active:opacity-70">
          <ChevronLeft size={20} color="#5F6574" />
        </button>
        <p className="text-[14px] font-semibold text-[#171925]">音频课程</p>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center active:opacity-70">
            <Share2 size={17} color="#5F6574" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center active:opacity-70">
            <Download size={17} color="#5F6574" />
          </button>
        </div>
      </div>

      {/* Player card */}
      <div className="flex-none bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm">
        {/* Cover + info */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-none">
            <img
              src={course.image}
              alt={course.name}
              className={`w-20 h-20 rounded-xl object-cover bg-[#E5E7ED] shadow ${playing ? "ring-2 ring-[#4C4BEA]" : ""}`}
            />
            {playing && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4C4BEA] rounded-full flex items-center justify-center shadow">
                <span className="flex gap-0.5">
                  <span className="w-0.5 h-2.5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 h-2.5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 h-2.5 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite]" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#171925] leading-snug">{currentLesson?.title ?? course.currentLesson}</p>
            <p className="text-[12px] text-[#707684] mt-1">{course.teacher}主讲</p>
            <p className="text-[11px] text-[#C0C5D0] mt-0.5">{course.name}</p>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex items-center gap-px h-10 mb-3 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setElapsed(Math.round(pct * totalSec));
        }}>
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors"
              style={{
                height: `${h * 100}%`,
                background: i < activeBars ? "#4C4BEA" : "#E5E7ED",
              }}
            />
          ))}
        </div>

        {/* Time */}
        <div className="flex justify-between text-[11px] text-[#C0C5D0] mb-4">
          <span>{fmtTime(elapsed)}</span>
          <span>{fmtTime(totalSec)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLoop((v) => !v)}
            className={`w-9 h-9 flex items-center justify-center rounded-full active:opacity-70 ${
              loop ? "bg-[#F0F0FF]" : ""
            }`}
          >
            <Repeat size={18} color={loop ? "#4C4BEA" : "#C0C5D0"} />
          </button>

          <button
            onClick={() => setElapsed((e) => Math.max(0, e - 15))}
            className="flex flex-col items-center gap-0.5 active:opacity-70"
          >
            <SkipBack size={22} color="#5F6574" />
            <span className="text-[9px] text-[#C0C5D0]">15s</span>
          </button>

          <button
            onClick={() => setPlaying((p) => !p)}
            className="w-14 h-14 bg-[#4C4BEA] rounded-full flex items-center justify-center shadow-lg active:bg-[#3D3CC8] active:scale-95 transition-transform"
          >
            {playing ? (
              <Pause size={24} color="white" fill="white" />
            ) : (
              <Play size={24} color="white" fill="white" className="ml-1" />
            )}
          </button>

          <button
            onClick={() => setElapsed((e) => Math.min(totalSec, e + 15))}
            className="flex flex-col items-center gap-0.5 active:opacity-70"
          >
            <SkipForward size={22} color="#5F6574" />
            <span className="text-[9px] text-[#C0C5D0]">15s</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSpeed((v) => !v)}
              className="w-9 h-9 bg-[#F4F5F7] rounded-lg flex items-center justify-center active:bg-[#E5E7ED]"
            >
              <span className="text-[11px] font-bold text-[#5F6574]">{speed}x</span>
            </button>
            {showSpeed && (
              <div className="absolute bottom-10 right-0 bg-white rounded-xl shadow-xl overflow-hidden border border-[#E5E7ED] z-20 w-24">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); setShowSpeed(false); }}
                    className={`block w-full px-3 py-2.5 text-[13px] text-left ${
                      speed === s ? "text-[#4C4BEA] font-semibold bg-[#F0F0FF]" : "text-[#5F6574]"
                    } active:bg-[#F4F5F7]`}
                  >
                    {s === 1 ? "正常" : `${s}x`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-none flex bg-white mx-4 mt-3 rounded-xl overflow-hidden border border-[#E5E7ED]">
        {(["transcript", "notes", "catalog"] as Tab[]).map((t) => {
          const labels: Record<Tab, { label: string; icon: React.ReactNode }> = {
            transcript: { label: "字幕", icon: <BookOpen size={13} /> },
            notes: { label: "笔记", icon: <PenLine size={13} /> },
            catalog: { label: "目录", icon: <List size={13} /> },
          };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 flex items-center justify-center gap-1 text-[12px] font-medium ${
                tab === t ? "bg-[#4C4BEA] text-white" : "text-[#707684]"
              }`}
            >
              {labels[t].icon}
              {labels[t].label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto mt-3" ref={transcriptRef}>
        {tab === "transcript" && (
          <div className="px-4 pb-6 space-y-2">
            {TRANSCRIPT.map((seg, i) => (
              <button
                key={seg.ts}
                onClick={() => setElapsed(seg.ts)}
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                  i === currentTranscriptIdx
                    ? "bg-[#F0F0FF] border-l-2 border-[#4C4BEA]"
                    : "bg-white hover:bg-[#F4F5F7]"
                }`}
              >
                <span className={`text-[11px] font-medium block mb-0.5 ${
                  i === currentTranscriptIdx ? "text-[#4C4BEA]" : "text-[#C0C5D0]"
                }`}>
                  {fmtTime(seg.ts)}
                </span>
                <span className={`text-[13px] leading-relaxed ${
                  i === currentTranscriptIdx ? "text-[#171925] font-medium" : "text-[#5F6574]"
                }`}>
                  {seg.text}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "notes" && (
          <div className="px-4 pb-6">
            <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PenLine size={13} color="#4C4BEA" />
                <span className="text-[11px] text-[#4C4BEA] font-medium">{fmtTime(elapsed)}</span>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="记下这个时间点的重点..."
                rows={2}
                className="w-full text-[13px] text-[#171925] placeholder:text-[#C0C5D0] outline-none resize-none leading-relaxed"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  onClick={addNote}
                  disabled={!noteInput.trim()}
                  className="px-4 h-8 bg-[#4C4BEA] text-white text-[12px] font-semibold rounded-lg active:bg-[#3D3CC8] disabled:opacity-40"
                >
                  保存
                </button>
              </div>
            </div>

            {notes.length === 0 ? (
              <p className="text-center text-[13px] text-[#C0C5D0] mt-8">暂无笔记</p>
            ) : (
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="bg-white rounded-xl px-4 py-3 shadow-sm">
                    <p className="text-[11px] text-[#4C4BEA] font-medium mb-1">{n.ts}</p>
                    <p className="text-[13px] text-[#5F6574] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "catalog" && (
          <div className="px-4 pb-6">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              {allLessons.map((lesson, i) => {
                const isCurrent = lesson.id === currentLesson?.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => nav.replace({ type: "audio-player", courseId, lessonId: lesson.id })}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7ED] active:bg-[#F4F5F7] ${
                      isCurrent ? "bg-[#F0F0FF]" : ""
                    }`}
                  >
                    <span className={`text-[11px] w-5 text-right flex-none ${isCurrent ? "text-[#4C4BEA]" : "text-[#C0C5D0]"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 text-left">
                      <p className={`text-[13px] ${isCurrent ? "font-semibold text-[#4C4BEA]" : lesson.done ? "text-[#707684]" : "text-[#5F6574]"}`}>
                        {lesson.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#C0C5D0]">{lesson.duration}</span>
                      {isCurrent && playing && (
                        <div className="flex gap-0.5 items-end h-3.5">
                          {[0, 150, 300].map((delay) => (
                            <span
                              key={delay}
                              className="w-0.5 bg-[#4C4BEA] rounded-full"
                              style={{
                                height: "100%",
                                animation: `bounce 0.8s ease-in-out infinite`,
                                animationDelay: `${delay}ms`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
