import { useState } from "react";
import { NavContextType } from "@/types";
import { OBJECTIVE_QUESTIONS } from "@/data";
import TopBar from "@/components/TopBar";
import Dialog from "@/components/Dialog";
import BottomSheet from "@/components/BottomSheet";
import { Tag } from "@/components/ui";
import { Grid3x3, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  nav: NavContextType;
  mode: "chapter" | "exam";
  title: string;
}

export default function ObjectiveAnswer({ nav, mode, title }: Props) {
  const questions = OBJECTIVE_QUESTIONS;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [cardSheet, setCardSheet] = useState(false);

  const q = questions[currentIdx];
  const userAnswer = answers[q.id];

  const handleSelect = (key: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [q.id]: key });
  };

  const handleSubmit = () => {
    setSubmitDialog(false);
    setSubmitted(true);
    nav.navigate({ type: "objective-report" });
  };

  const answered = Object.keys(answers).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar
        onBack={nav.goBack}
        right={
          <button onClick={() => setCardSheet(true)} className="w-8 h-8 flex items-center justify-center">
            <Grid3x3 size={18} color="#5F6574" />
          </button>
        }
      >
        <div className="flex flex-col items-center">
          <p className="text-[14px] font-semibold text-[#171925]">{title}</p>
          <p className="text-[11px] text-[#707684]">
            {currentIdx + 1} / {questions.length}
          </p>
        </div>
      </TopBar>

      {/* Progress */}
      <div className="bg-white px-4 py-2 border-b border-[#E5E7ED]">
        <div className="h-1 bg-[#E5E7ED] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4C4BEA] rounded-full transition-all"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white rounded-lg p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-[#707684]">{q.subject}</span>
            <span className="text-[11px] text-[#707684]">{q.year}年</span>
            <Tag color="muted">{q.point}</Tag>
          </div>
          <p className="text-[14px] text-[#171925] leading-[1.8]">{q.stem}</p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt) => {
            const isSelected = userAnswer === opt.key;
            const isCorrect = submitted && opt.key === q.answer;
            const isWrong = submitted && isSelected && opt.key !== q.answer;

            return (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                className={`w-full flex items-start gap-3 bg-white rounded-lg p-4 text-left transition-colors border ${
                  isCorrect
                    ? "border-[#5DA765] bg-[#EAF6EF]"
                    : isWrong
                    ? "border-[#FF7252] bg-red-50"
                    : isSelected
                    ? "border-[#4C4BEA] bg-[#F0F0FF]"
                    : "border-transparent active:bg-[#F8F9FA]"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex-none flex items-center justify-center text-[13px] font-bold border ${
                    isCorrect
                      ? "bg-[#5DA765] border-[#5DA765] text-white"
                      : isWrong
                      ? "bg-[#FF7252] border-[#FF7252] text-white"
                      : isSelected
                      ? "bg-[#4C4BEA] border-[#4C4BEA] text-white"
                      : "border-[#C0C5D0] text-[#707684]"
                  }`}
                >
                  {opt.key}
                </div>
                <p className="text-[14px] text-[#171925] leading-relaxed flex-1">{opt.text}</p>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {submitted && (
          <div className="bg-white rounded-lg p-4 mt-3">
            <p className="text-[13px] font-semibold text-[#171925] mb-2">解析</p>
            <p className="text-[13px] text-[#5F6574] leading-[1.8]">{q.explanation}</p>
            <div className="mt-3 pt-3 border-t border-[#E5E7ED] flex items-start gap-1.5">
              <span className="text-[11px] text-[#707684] mt-0.5">法条依据</span>
              <span className="text-[11px] text-[#5F6574]">{q.lawBasis}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex-none bg-white border-t border-[#E5E7ED] px-4 py-3 flex gap-2">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0}
          className="h-11 px-4 border border-[#E5E7ED] rounded-lg text-[14px] text-[#5F6574] flex items-center gap-1 active:bg-[#F4F5F7] disabled:opacity-40"
        >
          <ChevronLeft size={16} /> 上一题
        </button>
        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="flex-1 h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8] flex items-center justify-center gap-1"
          >
            下一题 <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => setSubmitDialog(true)}
            className="flex-1 h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]"
          >
            交卷
          </button>
        )}
      </div>

      {/* Answer card sheet */}
      <BottomSheet open={cardSheet} onClose={() => setCardSheet(false)} title="答题卡">
        <div className="px-5 py-4">
          <div className="flex gap-2 mb-4 text-[12px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#4C4BEA] inline-block" />已答</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#E5E7ED] inline-block" />未答</span>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-5">
            {questions.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => { setCurrentIdx(i); setCardSheet(false); }}
                className={`aspect-square rounded text-[13px] font-medium ${
                  i === currentIdx
                    ? "bg-[#4C4BEA] text-white ring-2 ring-[#4C4BEA] ring-offset-1"
                    : answers[qq.id]
                    ? "bg-[#F0F0FF] text-[#4C4BEA]"
                    : "bg-[#F4F5F7] text-[#707684]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-[#707684] mb-4">
            已作答 {answered} / {questions.length}，未作答 {questions.length - answered} 题
          </p>
          <button
            onClick={() => { setCardSheet(false); setSubmitDialog(true); }}
            className="w-full h-11 bg-[#4C4BEA] text-white text-[14px] font-semibold rounded-lg active:bg-[#3D3CC8]"
          >
            交卷
          </button>
        </div>
      </BottomSheet>

      <Dialog
        open={submitDialog}
        title="确认交卷"
        description={`已作答 ${answered} 题，${questions.length - answered} 题未作答，交卷后不可修改。`}
        confirmText="确认交卷"
        cancelText="继续作答"
        onConfirm={handleSubmit}
        onCancel={() => setSubmitDialog(false)}
      />
    </div>
  );
}
