import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { Tag } from "@/components/ui";
import { ChevronRight } from "lucide-react";

interface Props { nav: NavContextType }

const RECORDS = [
  { date: "今天", time: "21:05", mode: "章节练习", title: "民法·物权法", count: 20, correct: 15 },
  { date: "昨天", time: "20:30", mode: "历年真题", title: "2023年卷一", count: 50, correct: 36 },
  { date: "8月24日", time: "19:15", mode: "章节练习", title: "刑法·总论", count: 15, correct: 12 },
  { date: "8月23日", time: "21:40", mode: "章节练习", title: "民法·合同法", count: 25, correct: 17 },
];

export default function QuestionRecords({ nav }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="做题记录" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Stats */}
        <div className="bg-white mx-4 mt-4 rounded-lg flex divide-x divide-[#E5E7ED]">
          {[
            { label: "累计做题", value: "2,847" },
            { label: "正确率", value: "68%" },
          ].map(({ label, value }) => (
            <div key={label} className="flex-1 flex flex-col items-center py-4">
              <span className="text-[20px] font-bold text-[#4C4BEA]">{value}</span>
              <span className="text-[11px] text-[#707684] mt-1">{label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white mx-4 mt-3 rounded-lg overflow-hidden">
          {RECORDS.map((r, i) => (
            <button
              key={i}
              onClick={() => nav.navigate({ type: "objective-report" })}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[#F4F5F7] ${
                i < RECORDS.length - 1 ? "border-b border-[#E5E7ED]" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag color="muted">{r.mode}</Tag>
                  <span className="text-[11px] text-[#707684]">{r.date} {r.time}</span>
                </div>
                <p className="text-[14px] font-semibold text-[#171925]">{r.title}</p>
                <p className="text-[12px] text-[#707684] mt-0.5">
                  {r.count}题 · 正确{r.correct}题 · 正确率
                  <span className={r.correct / r.count >= 0.7 ? " text-[#5DA765]" : " text-[#FF7252]"}>
                    {Math.round((r.correct / r.count) * 100)}%
                  </span>
                </p>
              </div>
              <ChevronRight size={16} color="#C0C5D0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
