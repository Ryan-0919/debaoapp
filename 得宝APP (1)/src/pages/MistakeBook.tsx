import { useState } from "react";
import { NavContextType } from "@/types";
import { OBJECTIVE_QUESTIONS, SUBJECTS } from "@/data";
import TopBar from "@/components/TopBar";
import { Tag, DiffBadge } from "@/components/ui";
import { ChevronRight, RefreshCw } from "lucide-react";

interface Props { nav: NavContextType }

export default function MistakeBook({ nav }: Props) {
  const [filter, setFilter] = useState("全部");
  const subjectNames = ["全部", ...SUBJECTS.slice(0, 5).map((s) => s.name)];

  const questions = OBJECTIVE_QUESTIONS.slice(0, 3);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="错题本" onBack={nav.goBack} />

      {/* Subject filter */}
      <div className="bg-white border-b border-[#E5E7ED]">
        <div className="flex gap-1 px-4 py-2.5 overflow-x-auto">
          {subjectNames.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-none px-3 h-7 text-[12px] rounded-full border transition-colors ${
                filter === s
                  ? "bg-[#4C4BEA] text-white border-[#4C4BEA]"
                  : "text-[#5F6574] border-[#E5E7ED]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <p className="text-[12px] text-[#707684]">共 {questions.length} 道错题待复习</p>
          <button className="flex items-center gap-1 text-[12px] text-[#4C4BEA]">
            <RefreshCw size={12} color="#4C4BEA" /> 一键重做
          </button>
        </div>

        <div className="mx-4 space-y-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => nav.navigate({ type: "objective-answer", mode: "chapter", title: "错题复习" })}
              className="w-full bg-white rounded-lg p-4 text-left active:opacity-80"
            >
              <div className="flex items-center gap-2 mb-2">
                <Tag color="muted">{q.subject}</Tag>
                <Tag color="muted">{q.year}年</Tag>
                <span className="ml-auto flex items-center gap-1 text-[11px] text-[#FF7252]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7252] inline-block" />
                  答错{[2, 1, 3][i]}次
                </span>
              </div>
              <p className="text-[13px] text-[#171925] leading-relaxed line-clamp-2">{q.stem}</p>
              <div className="flex items-center gap-3 mt-2 text-[12px] text-[#707684]">
                <span>我的答案：<span className="text-[#FF7252] font-medium">{["B", "C", "B"][i]}</span></span>
                <span>正确答案：<span className="text-[#5DA765] font-medium">{q.answer}</span></span>
                <ChevronRight size={14} color="#C0C5D0" className="ml-auto" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
