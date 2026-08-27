import { NavContextType } from "@/types";
import { OBJECTIVE_QUESTIONS } from "@/data";
import TopBar from "@/components/TopBar";
import { ProgressBar } from "@/components/ui";
import { CheckCircle, XCircle } from "lucide-react";

interface Props { nav: NavContextType }

export default function ObjectiveReport({ nav }: Props) {
  const total = OBJECTIVE_QUESTIONS.length;
  const correct = 3;
  const wrong = total - correct;
  const score = Math.round((correct / total) * 100);

  const q = OBJECTIVE_QUESTIONS[0];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="答题报告" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Score overview */}
        <div className="bg-white mx-4 mt-4 rounded-lg p-5 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#F0F0FF] border-4 border-[#4C4BEA] flex flex-col items-center justify-center mb-3">
            <span className="text-[24px] font-bold text-[#4C4BEA]">{score}</span>
            <span className="text-[10px] text-[#4C4BEA]">分</span>
          </div>
          <p className="text-[14px] text-[#5F6574]">本次得分</p>
          <div className="flex gap-6 mt-4 pt-4 border-t border-[#E5E7ED] w-full justify-center">
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-bold text-[#5DA765]">{correct}</span>
              <span className="text-[12px] text-[#707684]">答对</span>
            </div>
            <div className="w-px bg-[#E5E7ED]" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-bold text-[#FF7252]">{wrong}</span>
              <span className="text-[12px] text-[#707684]">答错</span>
            </div>
            <div className="w-px bg-[#E5E7ED]" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-bold text-[#171925]">{total}</span>
              <span className="text-[12px] text-[#707684]">总题数</span>
            </div>
          </div>
        </div>

        {/* By subject */}
        <div className="bg-white mx-4 mt-3 rounded-lg p-4">
          <p className="text-[14px] font-semibold text-[#171925] mb-3">科目分析</p>
          {[
            { name: "民法", correct: 2, total: 3 },
            { name: "刑法", correct: 1, total: 1 },
          ].map((s) => (
            <div key={s.name} className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] text-[#5F6574]">{s.name}</span>
                <span className="text-[12px] text-[#707684]">
                  {s.correct}/{s.total}
                </span>
              </div>
              <ProgressBar
                value={(s.correct / s.total) * 100}
                color={s.correct / s.total >= 0.7 ? "#5DA765" : "#FF7252"}
              />
            </div>
          ))}
        </div>

        {/* Question review */}
        <div className="mx-4 mt-3">
          <p className="text-[14px] font-semibold text-[#171925] mb-3">逐题解析</p>
          {OBJECTIVE_QUESTIONS.map((qq, i) => {
            const fakeUser = i === 0 ? "D" : i === 1 ? "B" : i === 2 ? "A" : "A";
            const isRight = fakeUser === qq.answer;
            return (
              <div key={qq.id} className="bg-white rounded-lg p-4 mb-2">
                <div className="flex items-start gap-2 mb-2">
                  {isRight ? (
                    <CheckCircle size={16} color="#5DA765" className="mt-0.5 flex-none" />
                  ) : (
                    <XCircle size={16} color="#FF7252" className="mt-0.5 flex-none" />
                  )}
                  <p className="text-[13px] text-[#171925] leading-relaxed line-clamp-2">{qq.stem}</p>
                </div>
                <div className="flex items-center gap-4 text-[12px] mb-2 ml-6">
                  <span className="text-[#5F6574]">
                    你的答案：<span className={isRight ? "text-[#5DA765] font-medium" : "text-[#FF7252] font-medium"}>{fakeUser}</span>
                  </span>
                  <span className="text-[#5F6574]">
                    正确答案：<span className="text-[#5DA765] font-medium">{qq.answer}</span>
                  </span>
                </div>
                <div className="ml-6 bg-[#F4F5F7] rounded p-2.5">
                  <p className="text-[12px] text-[#707684] leading-relaxed line-clamp-3">{qq.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-none bg-white border-t border-[#E5E7ED] px-4 py-3 flex gap-2">
        <button
          onClick={() => nav.navigate({ type: "mistake-book" })}
          className="flex-1 h-11 border border-[#E5E7ED] rounded-lg text-[14px] text-[#5F6574] active:bg-[#F4F5F7]"
        >
          加入错题本
        </button>
        <button
          onClick={nav.goBack}
          className="flex-1 h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]"
        >
          返回题库
        </button>
      </div>
    </div>
  );
}
