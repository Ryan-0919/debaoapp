import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { ProgressBar, Tag } from "@/components/ui";
import { TrendingUp, AlertCircle } from "lucide-react";

interface Props { nav: NavContextType }

const SUBJECTS_PERF = [
  { name: "民法", correct: 78, total: 100, rank: "中等" },
  { name: "刑法", correct: 82, total: 90, rank: "良好" },
  { name: "行政法", correct: 55, total: 80, rank: "较弱" },
  { name: "民事诉讼法", correct: 40, total: 75, rank: "薄弱" },
  { name: "刑事诉讼法", correct: 60, total: 70, rank: "中等" },
  { name: "商法", correct: 25, total: 40, rank: "中等" },
];

export default function LearningReport({ nav }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="学习报告" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Overview */}
        <div className="bg-white mx-4 mt-4 rounded-lg p-4">
          <p className="text-[13px] text-[#707684] mb-1">本周学习时长</p>
          <p className="text-[28px] font-bold text-[#171925]">4.2 <span className="text-[16px] font-medium text-[#707684]">小时</span></p>
          <div className="flex gap-1 mt-3">
            {["一", "二", "三", "四", "五", "六", "日"].map((d, i) => {
              const h = [0.5, 1.2, 0, 0.8, 1.2, 0.5, 0][i];
              return (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: 40 }}>
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${(h / 1.5) * 100}%`,
                        background: h > 0 ? "#4C4BEA" : "#E5E7ED",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#707684]">{d}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak subject alert */}
        <div className="bg-[#FFF1E8] mx-4 mt-3 rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertCircle size={15} color="#D2691E" className="mt-0.5 flex-none" />
          <div>
            <p className="text-[13px] font-semibold text-[#D2691E]">民事诉讼法需要重点关注</p>
            <p className="text-[12px] text-[#707684] mt-0.5">正确率仅 53%，建议本周加强练习</p>
            <button
              onClick={() => nav.navigate({ type: "objective-answer", mode: "chapter", title: "民事诉讼法专项" })}
              className="mt-2 text-[12px] text-[#4C4BEA] font-medium"
            >
              进入专项练习 →
            </button>
          </div>
        </div>

        {/* Subject performance */}
        <div className="bg-white mx-4 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-[#171925] mb-4">各科正确率</p>
          <div className="space-y-4">
            {SUBJECTS_PERF.map((s) => {
              const rate = Math.round((s.correct / s.total) * 100);
              const color = rate >= 75 ? "#5DA765" : rate >= 60 ? "#4C4BEA" : "#FF7252";
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#5F6574]">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                        style={{
                          color,
                          background: rate >= 75 ? "#EAF6EF" : rate >= 60 ? "#F0F0FF" : "#FFF1E8",
                        }}
                      >
                        {s.rank}
                      </span>
                      <span className="text-[13px] font-semibold text-[#171925]">{rate}%</span>
                    </div>
                  </div>
                  <ProgressBar value={rate} color={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Study stats */}
        <div className="bg-white mx-4 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-[#171925] mb-3">做题统计</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "累计做题", value: "2,847" },
              { label: "正确率", value: "68%" },
              { label: "错题待复习", value: "28" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F4F5F7] rounded-lg p-3 flex flex-col items-center">
                <span className="text-[18px] font-bold text-[#171925]">{value}</span>
                <span className="text-[11px] text-[#707684] mt-1 text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
