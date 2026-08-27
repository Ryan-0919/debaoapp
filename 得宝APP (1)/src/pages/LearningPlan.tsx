import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface Props { nav: NavContextType }

const PLAN = [
  {
    week: "本周计划（8月26日–9月1日）",
    tasks: [
      { title: "完成民法·物权法章节练习", detail: "目标30题 · 已完成12题", done: false, time: "45分钟" },
      { title: "观看刑法第8讲", detail: "犯罪的未完成形态 · 约55分钟", done: true, time: "55分钟" },
      { title: "复习错题（民法）", detail: "28道待复习", done: false, time: "30分钟" },
      { title: "完成行政法章节测验", detail: "行政许可 · 15题", done: false, time: "20分钟" },
    ],
  },
  {
    week: "下周预计",
    tasks: [
      { title: "民事诉讼法专项练习", detail: "强化薄弱科目", done: false, time: "60分钟" },
      { title: "2022年真题卷二精练", detail: "历年真题模拟", done: false, time: "90分钟" },
    ],
  },
];

export default function LearningPlan({ nav }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="学习计划" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Progress */}
        <div className="bg-white mx-4 mt-4 rounded-lg px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] font-semibold text-[#171925]">本周完成进度</p>
            <p className="text-[13px] text-[#4C4BEA] font-medium">1 / 4</p>
          </div>
          <div className="h-2 bg-[#E5E7ED] rounded-full overflow-hidden">
            <div className="h-full bg-[#4C4BEA] rounded-full" style={{ width: "25%" }} />
          </div>
          <p className="text-[11px] text-[#707684] mt-1.5">预计本周学习时长 3.5 小时，已完成 0.9 小时</p>
        </div>

        {PLAN.map((week) => (
          <div key={week.week} className="mx-4 mt-3">
            <p className="text-[12px] text-[#707684] mb-1.5">{week.week}</p>
            <div className="bg-white rounded-lg overflow-hidden">
              {week.tasks.map((task, i) => (
                <div
                  key={task.title}
                  className={`flex items-start gap-3 px-4 py-3.5 ${
                    i < week.tasks.length - 1 ? "border-b border-[#E5E7ED]" : ""
                  }`}
                >
                  {task.done ? (
                    <CheckCircle size={18} color="#5DA765" className="flex-none mt-0.5" />
                  ) : (
                    <Circle size={18} color="#C0C5D0" className="flex-none mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`text-[14px] font-medium ${task.done ? "text-[#707684] line-through" : "text-[#171925]"}`}>
                      {task.title}
                    </p>
                    <p className="text-[12px] text-[#707684] mt-0.5">{task.detail}</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-[11px] text-[#707684] flex-none mt-0.5">
                    <Clock size={11} color="#C0C5D0" />
                    {task.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
