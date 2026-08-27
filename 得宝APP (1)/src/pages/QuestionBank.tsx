import { useState } from "react";
import { NavContextType } from "@/types";
import { SUBJECTS } from "@/data";
import { ChevronRight, ChevronDown } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomSheet from "@/components/BottomSheet";
import { Tag, DiffBadge } from "@/components/ui";

interface Props { nav: NavContextType }

const YEARS = ["2023", "2022", "2021", "2020", "2019", "2018"];

const OBJ_CHAPTERS = [
  { subject: "民法", chapters: ["民法总则", "物权法", "合同法", "侵权责任法", "婚姻家庭法", "继承法"], done: [42, 28, 15, 8, 0, 0] },
  { subject: "刑法", chapters: ["刑法总论", "刑法分论"], done: [60, 22] },
  { subject: "行政法", chapters: ["行政许可", "行政处罚", "行政诉讼"], done: [30, 18, 5] },
  { subject: "民事诉讼法", chapters: ["诉讼当事人", "证据", "诉讼程序"], done: [12, 0, 0] },
  { subject: "刑事诉讼法", chapters: ["侦查程序", "审判程序", "执行程序"], done: [0, 0, 0] },
];

export default function QuestionBank({ nav }: Props) {
  const [mode, setMode] = useState<"obj" | "sub">("obj");
  const [yearSheet, setYearSheet] = useState(false);
  const [selectedYear, setSelectedYear] = useState("2023");
  const [expandedSubj, setExpandedSubj] = useState<string | null>("民法");
  const [volume, setVolume] = useState<"卷一" | "卷二">("卷一");

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar>
        <div className="flex gap-1 bg-[#F4F5F7] p-0.5 rounded-lg">
          {(["obj", "sub"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 h-7 text-[13px] font-semibold rounded transition-colors ${
                mode === m ? "bg-white text-[#4C4BEA] shadow-sm" : "text-[#707684]"
              }`}
            >
              {m === "obj" ? "客观题" : "主观题"}
            </button>
          ))}
        </div>
      </TopBar>

      <div className="flex-1 overflow-y-auto">
        {mode === "obj" ? (
          <div className="pb-6">
            {/* Real exam section */}
            <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7ED]">
                <p className="text-[15px] font-semibold text-[#171925]">历年真题</p>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#E5E7ED]">
                <span className="text-[14px] text-[#5F6574]">年份</span>
                <button
                  onClick={() => setYearSheet(true)}
                  className="flex items-center gap-1 text-[14px] text-[#171925] font-medium"
                >
                  {selectedYear} <ChevronDown size={14} color="#707684" />
                </button>
              </div>
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#E5E7ED]">
                <span className="text-[14px] text-[#5F6574]">卷别</span>
                <div className="flex gap-1">
                  {(["卷一", "卷二"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVolume(v)}
                      className={`px-3 h-7 text-[12px] font-medium rounded transition-colors ${
                        volume === v ? "bg-[#4C4BEA] text-white" : "bg-[#F4F5F7] text-[#5F6574]"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[#5F6574]">{selectedYear}年 {volume} · 50题</p>
                  <p className="text-[11px] text-[#707684] mt-0.5">预计用时 90 分钟</p>
                </div>
                <button
                  onClick={() => nav.navigate({ type: "objective-answer", mode: "exam", title: `${selectedYear}真题${volume}` })}
                  className="bg-[#4C4BEA] text-white text-[13px] font-medium px-4 h-9 rounded-lg active:bg-[#3D3CC8]"
                >
                  开始做题
                </button>
              </div>
            </div>

            {/* Chapter practice */}
            <div className="bg-white mx-4 mt-3 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7ED]">
                <p className="text-[15px] font-semibold text-[#171925]">章节练习</p>
              </div>
              {OBJ_CHAPTERS.map(({ subject, chapters, done }) => {
                const isOpen = expandedSubj === subject;
                const subjInfo = SUBJECTS.find((s) => s.name === subject);
                return (
                  <div key={subject}>
                    <button
                      onClick={() => setExpandedSubj(isOpen ? null : subject)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7ED] active:bg-[#F4F5F7]"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex-none flex items-center justify-center text-[12px] font-bold"
                        style={{ background: subjInfo?.color, color: subjInfo?.textColor }}
                      >
                        {subject[0]}
                      </div>
                      <span className="flex-1 text-left text-[14px] font-medium text-[#171925]">{subject}</span>
                      <span className="text-[12px] text-[#707684]">{chapters.length}章</span>
                      <ChevronDown
                        size={16}
                        color="#C0C5D0"
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen &&
                      chapters.map((ch, i) => (
                        <button
                          key={ch}
                          onClick={() => nav.navigate({ type: "objective-answer", mode: "chapter", title: ch })}
                          className="w-full flex items-center gap-3 px-4 py-3 pl-[60px] border-b border-[#E5E7ED] active:bg-[#F4F5F7]"
                        >
                          <span className="flex-1 text-left text-[13px] text-[#5F6574]">{ch}</span>
                          {done[i] > 0 ? (
                            <span className="text-[12px] text-[#5DA765]">已做{done[i]}题</span>
                          ) : (
                            <span className="text-[12px] text-[#C0C5D0]">未练习</span>
                          )}
                          <ChevronRight size={14} color="#C0C5D0" />
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pb-6">
            {/* Subjective mode */}
            <div className="bg-white mx-4 mt-4 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7ED]">
                <p className="text-[15px] font-semibold text-[#171925]">分科真题</p>
                <p className="text-[12px] text-[#707684] mt-0.5">选择科目查看题目，支持按年份和难度筛选</p>
              </div>
              {SUBJECTS.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => nav.navigate({ type: "subjective-select", subject: s.name })}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7ED] active:bg-[#F4F5F7]"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex-none flex items-center justify-center text-[13px] font-bold"
                    style={{ background: s.color, color: s.textColor }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-medium text-[#171925]">{s.name}</p>
                    <p className="text-[11px] text-[#707684] mt-0.5">
                      {s.name === "民法" ? "32题 · 2018–2023" : "共若干题"}
                    </p>
                  </div>
                  <ChevronRight size={16} color="#C0C5D0" />
                </button>
              ))}
            </div>

            {/* Integrated exam */}
            <div className="bg-white mx-4 mt-3 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E5E7ED]">
                <p className="text-[15px] font-semibold text-[#171925]">历年整卷</p>
                <p className="text-[12px] text-[#707684] mt-0.5">完整主观题卷，限时模拟考试体验</p>
              </div>
              {YEARS.slice(0, 4).map((y) => (
                <button
                  key={y}
                  onClick={() => nav.navigate({ type: "subjective-select" })}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7ED] active:bg-[#F4F5F7]"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F0F0FF] flex items-center justify-center">
                    <span className="text-[11px] font-bold text-[#4C4BEA]">{y.slice(2)}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[14px] font-medium text-[#171925]">{y}年主观题</p>
                    <p className="text-[11px] text-[#707684] mt-0.5">6题 · 建议240分钟</p>
                  </div>
                  <ChevronRight size={16} color="#C0C5D0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomSheet open={yearSheet} onClose={() => setYearSheet(false)} title="选择年份">
        <div className="py-2">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => { setSelectedYear(y); setYearSheet(false); }}
              className={`w-full text-left px-5 py-4 text-[15px] border-b border-[#E5E7ED] active:bg-[#F4F5F7] ${
                y === selectedYear ? "text-[#4C4BEA] font-semibold" : "text-[#171925]"
              }`}
            >
              {y}年
              {y === selectedYear && <span className="float-right">✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
