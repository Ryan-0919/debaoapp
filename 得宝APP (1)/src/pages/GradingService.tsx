import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { Tag, DiffBadge } from "@/components/ui";
import { ChevronRight, Upload } from "lucide-react";

interface Props { nav: NavContextType }

const GRADINGS = [
  { id: "g1", title: "民法·股权转让案例", year: "2023", status: "已批改", score: "38/50", feedback: "论点清晰，法条引用准确，建议加强对抗辩权的分析。" },
  { id: "g2", title: "合同解除与违约责任", year: "2022", status: "待批改", score: null, feedback: null },
];

export default function GradingService({ nav }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="批改服务" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Usage */}
        <div className="bg-white mx-4 mt-4 rounded-lg px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[14px] font-semibold text-[#171925]">批改次数</p>
            <p className="text-[13px] text-[#4C4BEA] font-semibold">剩余 8 次</p>
          </div>
          <div className="h-1.5 bg-[#E5E7ED] rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#4C4BEA] rounded-full" style={{ width: "20%" }} />
          </div>
          <p className="text-[11px] text-[#707684] mt-1.5">已使用 2 次 / 共 10 次（含课程权益）</p>
        </div>

        {/* Submit button */}
        <div className="mx-4 mt-3">
          <button
            onClick={() => nav.navigate({ type: "subjective-answer", questionIndex: 0, subjectName: "民法" })}
            className="w-full bg-white rounded-lg border border-dashed border-[#4C4BEA] px-4 py-4 flex flex-col items-center gap-2 active:opacity-80"
          >
            <Upload size={22} color="#4C4BEA" />
            <p className="text-[14px] font-semibold text-[#4C4BEA]">提交主观题答案批改</p>
            <p className="text-[12px] text-[#707684]">选择题目后提交您的书面答案，24小时内反馈</p>
          </button>
        </div>

        {/* History */}
        <div className="mx-4 mt-3">
          <p className="text-[12px] text-[#707684] mb-1.5">批改记录</p>
          <div className="bg-white rounded-lg overflow-hidden">
            {GRADINGS.map((g, i) => (
              <div key={g.id} className={`px-4 py-4 ${i < GRADINGS.length - 1 ? "border-b border-[#E5E7ED]" : ""}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                    g.status === "已批改" ? "bg-[#EAF6EF] text-[#5DA765]" : "bg-[#FFF5DD] text-[#A87000]"
                  }`}>{g.status}</span>
                  <span className="text-[11px] text-[#707684]">{g.year}年真题</span>
                  {g.score && <span className="ml-auto text-[13px] font-bold text-[#4C4BEA]">{g.score}</span>}
                </div>
                <p className="text-[14px] font-semibold text-[#171925]">{g.title}</p>
                {g.feedback && (
                  <p className="text-[12px] text-[#5F6574] mt-2 bg-[#F4F5F7] rounded p-2.5 leading-relaxed">
                    {g.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
