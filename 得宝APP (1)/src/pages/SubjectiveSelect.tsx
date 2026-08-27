import { useState } from "react";
import { NavContextType } from "@/types";
import { SUBJECTIVE_QUESTIONS, SUBJECTS } from "@/data";
import TopBar from "@/components/TopBar";
import { DiffBadge, StatusDot, Tag } from "@/components/ui";
import { ChevronRight, Filter } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";

interface Props {
  nav: NavContextType;
  subject?: string;
}

export default function SubjectiveSelect({ nav, subject = "民法" }: Props) {
  const [filterSheet, setFilterSheet] = useState(false);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [diffFilter, setDiffFilter] = useState<string | null>(null);

  const subjectInfo = SUBJECTS.find((s) => s.name === subject);

  let questions = SUBJECTIVE_QUESTIONS.filter((q) => q.subject === subject);
  if (yearFilter) questions = questions.filter((q) => q.year === yearFilter);
  if (diffFilter) questions = questions.filter((q) => q.difficulty === diffFilter);

  const allYears = [...new Set(SUBJECTIVE_QUESTIONS.map((q) => q.year))].sort().reverse();

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar
        onBack={nav.goBack}
        title={`${subject} · 主观题`}
        right={
          <button onClick={() => setFilterSheet(true)} className="w-8 h-8 flex items-center justify-center">
            <Filter size={18} color={yearFilter || diffFilter ? "#4C4BEA" : "#5F6574"} />
          </button>
        }
      />

      {/* Subject header */}
      <div className="bg-white px-4 py-3 border-b border-[#E5E7ED] flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[15px] font-bold"
          style={{ background: subjectInfo?.color, color: subjectInfo?.textColor }}
        >
          {subject[0]}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#171925]">{subject}</p>
          <p className="text-[12px] text-[#707684]">
            共{questions.length}题 · 2018–2023真题
            {(yearFilter || diffFilter) && " · 已筛选"}
          </p>
        </div>
        {(yearFilter || diffFilter) && (
          <button
            onClick={() => { setYearFilter(null); setDiffFilter(null); }}
            className="ml-auto text-[12px] text-[#4C4BEA]"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {questions.length === 0 ? (
          <div className="flex flex-col items-center pt-16 px-8 text-center">
            <div className="w-14 h-14 bg-[#F4F5F7] rounded-full flex items-center justify-center text-2xl mb-3">📋</div>
            <p className="text-[14px] font-medium text-[#171925] mb-1">
              {yearFilter || diffFilter ? "暂无符合条件的题目" : "暂无真题数据"}
            </p>
            <p className="text-[12px] text-[#707684]">
              {yearFilter || diffFilter
                ? "请尝试调整筛选条件"
                : "演示数据仅包含民法科目，其他科目将在正式版本中提供"}
            </p>
          </div>
        ) : (
          <div className="bg-white mx-4 mt-3 rounded-lg overflow-hidden">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => nav.navigate({ type: "subjective-answer", questionIndex: idx, subjectName: subject })}
                className="w-full text-left px-4 py-4 border-b border-[#E5E7ED] active:bg-[#F4F5F7]"
              >
                {/* Header row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-[#707684] bg-[#F4F5F7] px-1.5 py-0.5 rounded">
                    {q.year}年
                  </span>
                  <DiffBadge level={q.difficulty as "易" | "中" | "难"} />
                  <span className="ml-auto flex items-center gap-1 text-[11px] text-[#707684]">
                    <StatusDot status={q.status} />
                    {q.status === "none" ? "未作答" : q.status === "draft" ? "草稿" : "已完成"}
                  </span>
                </div>

                {/* Title */}
                <p className="text-[14px] font-semibold text-[#171925] leading-tight mb-1.5">
                  {q.title}
                </p>

                {/* Summary */}
                <p className="text-[12px] text-[#5F6574] leading-relaxed line-clamp-2">
                  {q.summary}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-3 mt-2.5">
                  <span className="text-[11px] text-[#707684]">{q.subCount}个小问</span>
                  <span className="text-[11px] text-[#707684]">建议{q.suggestMinutes}分钟</span>
                  <ChevronRight size={14} color="#C0C5D0" className="ml-auto" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={filterSheet} onClose={() => setFilterSheet(false)} title="筛选条件">
        <div className="px-5 py-4">
          <p className="text-[13px] font-semibold text-[#171925] mb-3">年份</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {allYears.map((y) => (
              <button
                key={y}
                onClick={() => setYearFilter(yearFilter === y ? null : y)}
                className={`px-3 h-8 text-[13px] rounded-lg border transition-colors ${
                  yearFilter === y
                    ? "bg-[#4C4BEA] text-white border-[#4C4BEA]"
                    : "text-[#5F6574] border-[#E5E7ED]"
                }`}
              >
                {y}年
              </button>
            ))}
          </div>
          <p className="text-[13px] font-semibold text-[#171925] mb-3">难度</p>
          <div className="flex gap-2 mb-6">
            {["易", "中", "难"].map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(diffFilter === d ? null : d)}
                className={`px-4 h-8 text-[13px] rounded-lg border transition-colors ${
                  diffFilter === d
                    ? "bg-[#4C4BEA] text-white border-[#4C4BEA]"
                    : "text-[#5F6574] border-[#E5E7ED]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={() => setFilterSheet(false)}
            className="w-full h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]"
          >
            确认
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
