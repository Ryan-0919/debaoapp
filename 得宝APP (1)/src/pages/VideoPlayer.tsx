import { useState, useEffect, useRef } from "react";
import { NavContextType } from "@/types";
import { COURSES } from "@/data";
import {
  Play, Pause, SkipBack, SkipForward,
  ChevronLeft, Settings, Maximize2, Download,
  CheckCircle, Circle, ChevronDown, PenLine, BookOpen,
} from "lucide-react";

interface Props {
  nav: NavContextType;
  courseId: string;
  lessonId?: string;
}

type Tab = "catalog" | "handout" | "notes";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const MOCK_NOTES = [
  { id: 1, ts: "05:32", text: "物权变动的生效要件：动产交付，不动产登记" },
  { id: 2, ts: "12:14", text: "善意取得的三个构成要件：无权处分、受让人善意、已交付或登记" },
];

export default function VideoPlayer({ nav, courseId, lessonId }: Props) {
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(28); // percent
  const [elapsed, setElapsed] = useState(338); // seconds
  const [speed, setSpeed] = useState(1.0);
  const [showSpeed, setShowSpeed] = useState(false);
  const [tab, setTab] = useState<Tab>("catalog");
  const [openChapter, setOpenChapter] = useState(0);
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulated total duration 1200s = 20min
  const totalSec = 1200;
  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = Math.min(e + 1, totalSec);
          setProgress(Math.round((next / totalSec) * 100));
          return next;
        });
      }, 1000 / speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, speed]);

  const seek = (pct: number) => {
    const s = Math.round((pct / 100) * totalSec);
    setElapsed(s);
    setProgress(pct);
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    setNotes((n) => [{ id: Date.now(), ts: fmtTime(elapsed), text: noteInput.trim() }, ...n]);
    setNoteInput("");
  };

  // Current lesson title
  const allLessons = course.chapters.flatMap((ch) => ch.lessons);
  const currentLesson = lessonId
    ? allLessons.find((l) => l.id === lessonId)
    : allLessons.find((l) => (l as any).current) ?? allLessons[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0F]">
      {/* Video area */}
      <div
        className="relative bg-[#0A0A0F] flex-none"
        style={{ height: 219 }}
        onClick={() => {
          setShowControls((v) => !v);
          setShowSpeed(false);
        }}
      >
        {/* Simulated video poster */}
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=450&fit=crop&auto=format"
          alt="视频"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        {/* Back button */}
        <button
          onClick={(e) => { e.stopPropagation(); nav.goBack(); }}
          className="absolute top-3 left-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center z-10 active:bg-black/60"
        >
          <ChevronLeft size={18} color="white" />
        </button>

        {/* Top right controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSpeed((v) => !v); }}
            className="bg-black/40 rounded px-2 h-6 text-[11px] text-white font-semibold active:bg-black/60"
          >
            {speed === 1 ? "倍速" : `${speed}x`}
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 bg-black/40 rounded-full flex items-center justify-center active:bg-black/60"
          >
            <Settings size={14} color="white" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 bg-black/40 rounded-full flex items-center justify-center active:bg-black/60"
          >
            <Maximize2 size={13} color="white" />
          </button>
        </div>

        {/* Speed menu */}
        {showSpeed && (
          <div
            className="absolute top-12 right-3 bg-[#1A1A2E]/95 rounded-lg overflow-hidden z-20 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setSpeed(s); setShowSpeed(false); }}
                className={`block w-full px-5 py-2.5 text-[13px] text-left ${
                  speed === s ? "text-[#C9F456] font-semibold bg-white/10" : "text-white"
                } active:bg-white/20`}
              >
                {s === 1 ? "正常" : `${s}x`}
              </button>
            ))}
          </div>
        )}

        {/* Center play indicator */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }}
              className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              {playing ? (
                <Pause size={24} color="white" fill="white" />
              ) : (
                <Play size={24} color="white" fill="white" className="ml-1" />
              )}
            </button>
          </div>
        )}

        {/* Bottom controls overlay */}
        {showControls && (
          <div
            className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div
              className="relative h-1 rounded-full bg-white/30 mb-2 active:h-1.5 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(Math.round(((e.clientX - rect.left) / rect.width) * 100));
              }}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-[#C9F456]"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setElapsed((e) => Math.max(0, e - 10))} className="active:opacity-70">
                  <SkipBack size={16} color="white" />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="w-8 h-8 flex items-center justify-center active:opacity-70"
                >
                  {playing ? (
                    <Pause size={18} color="white" fill="white" />
                  ) : (
                    <Play size={18} color="white" fill="white" />
                  )}
                </button>
                <button onClick={() => setElapsed((e) => Math.min(totalSec, e + 10))} className="active:opacity-70">
                  <SkipForward size={16} color="white" />
                </button>
                <span className="text-[11px] text-white/80 ml-1">
                  {fmtTime(elapsed)} / {fmtTime(totalSec)}
                </span>
              </div>
              <button className="active:opacity-70">
                <Download size={15} color="white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lesson info strip */}
      <div className="flex-none bg-white px-4 py-3 border-b border-[#E5E7ED]">
        <p className="text-[14px] font-semibold text-[#171925] leading-snug">
          {currentLesson?.title ?? course.currentLesson}
        </p>
        <p className="text-[11px] text-[#707684] mt-0.5">{course.teacher}主讲 · {course.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex-none bg-white flex border-b border-[#E5E7ED]">
        {(["catalog", "handout", "notes"] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = { catalog: "目录", handout: "讲义", notes: "笔记" };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-[13px] font-medium relative ${
                tab === t ? "text-[#4C4BEA]" : "text-[#707684]"
              }`}
            >
              {labels[t]}
              {tab === t && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#4C4BEA] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto bg-[#F4F5F7]">
        {tab === "catalog" && (
          <div className="bg-white">
            {course.chapters.map((ch, chIdx) => (
              <div key={ch.title}>
                <button
                  onClick={() => setOpenChapter(openChapter === chIdx ? -1 : chIdx)}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E5E7ED] active:bg-[#F4F5F7]"
                >
                  <div className="flex-1 text-left">
                    <p className="text-[13px] font-semibold text-[#171925]">{ch.title}</p>
                    <p className="text-[11px] text-[#707684]">
                      {ch.lessons.filter((l) => l.done).length}/{ch.lessons.length} 课节
                    </p>
                  </div>
                  <ChevronDown
                    size={15}
                    color="#C0C5D0"
                    className={`transition-transform ${openChapter === chIdx ? "rotate-180" : ""}`}
                  />
                </button>

                {openChapter === chIdx &&
                  ch.lessons.map((lesson) => {
                    const isCurrent = lesson.id === currentLesson?.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => nav.replace({ type: "video-player", courseId, lessonId: lesson.id })}
                        className={`w-full flex items-center gap-3 px-4 py-3 pl-8 border-b border-[#E5E7ED] active:bg-[#F4F5F7] ${
                          isCurrent ? "bg-[#F0F0FF]" : ""
                        }`}
                      >
                        {lesson.done ? (
                          <CheckCircle size={15} color="#5DA765" className="flex-none" />
                        ) : isCurrent ? (
                          <Play size={15} color="#4C4BEA" fill="#4C4BEA" className="flex-none" />
                        ) : (
                          <Circle size={15} color="#C0C5D0" className="flex-none" />
                        )}
                        <p
                          className={`flex-1 text-left text-[13px] ${
                            isCurrent ? "font-semibold text-[#4C4BEA]" : lesson.done ? "text-[#707684]" : "text-[#5F6574]"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <span className="text-[11px] text-[#C0C5D0]">{lesson.duration}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        )}

        {tab === "handout" && (
          <div className="px-4 py-5">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[#4C4BEA] px-4 py-3 flex items-center gap-2">
                <BookOpen size={16} color="white" />
                <p className="text-[13px] font-semibold text-white">讲义 · 第3章：物权变动</p>
              </div>
              <div className="p-4 space-y-4">
                <section>
                  <h3 className="text-[14px] font-bold text-[#171925] mb-2">一、物权变动的概念</h3>
                  <p className="text-[13px] text-[#5F6574] leading-relaxed">
                    物权变动是指物权的产生、变更和消灭。按照《民法典》第208条，不动产物权的设立、变更、转让和消灭，经依法登记，发生效力；未经登记，不发生效力，但是法律另有规定的除外。
                  </p>
                </section>
                <section>
                  <h3 className="text-[14px] font-bold text-[#171925] mb-2">二、动产物权变动</h3>
                  <p className="text-[13px] text-[#5F6574] leading-relaxed">
                    动产物权的设立和转让，自交付时发生效力，但是法律另有规定的除外。
                  </p>
                  <div className="mt-2 bg-[#F0F0FF] rounded p-3">
                    <p className="text-[12px] text-[#4C4BEA] font-semibold mb-1">重点记忆</p>
                    <p className="text-[12px] text-[#5F6574]">动产：交付生效 / 不动产：登记生效</p>
                  </div>
                </section>
                <section>
                  <h3 className="text-[14px] font-bold text-[#171925] mb-2">三、善意取得</h3>
                  <p className="text-[13px] text-[#5F6574] leading-relaxed">
                    无处分权人将动产或不动产转让给受让人，符合下列情形的，受让人取得该动产或不动产的所有权：
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {["受让人受让该动产或不动产时是善意的", "以合理的价格转让", "转让的动产或不动产依照法律规定应当登记的已经登记，不需要登记的已经交付给受让人"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[#5F6574]">
                        <span className="flex-none w-4 h-4 bg-[#4C4BEA] text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5">{i + 1}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
              <div className="border-t border-[#E5E7ED] p-4">
                <button className="w-full h-10 border border-[#4C4BEA] text-[#4C4BEA] text-[13px] font-semibold rounded-lg active:bg-[#F0F0FF] flex items-center justify-center gap-2">
                  <Download size={14} />
                  下载讲义 PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "notes" && (
          <div className="px-4 py-4">
            {/* Input */}
            <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PenLine size={13} color="#4C4BEA" />
                <span className="text-[11px] text-[#4C4BEA] font-medium">{fmtTime(elapsed)}</span>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="在这里记下当前时间点的笔记..."
                rows={3}
                className="w-full text-[13px] text-[#171925] placeholder:text-[#C0C5D0] outline-none resize-none leading-relaxed"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={addNote}
                  className="px-4 h-8 bg-[#4C4BEA] text-white text-[12px] font-semibold rounded-lg active:bg-[#3D3CC8] disabled:opacity-40"
                  disabled={!noteInput.trim()}
                >
                  保存
                </button>
              </div>
            </div>

            {/* Notes list */}
            {notes.length === 0 ? (
              <p className="text-center text-[13px] text-[#C0C5D0] mt-8">暂无笔记</p>
            ) : (
              <div className="space-y-2.5">
                {notes.map((n) => (
                  <div key={n.id} className="bg-white rounded-lg px-4 py-3 shadow-sm">
                    <p className="text-[11px] text-[#4C4BEA] font-medium mb-1">{n.ts}</p>
                    <p className="text-[13px] text-[#5F6574] leading-relaxed">{n.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
