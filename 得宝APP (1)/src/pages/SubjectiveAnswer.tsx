import { useState, useRef } from "react";
import { NavContextType } from "@/types";
import { SUBJECTIVE_QUESTIONS } from "@/data";
import TopBar from "@/components/TopBar";
import Dialog from "@/components/Dialog";
import { DiffBadge, StatusDot } from "@/components/ui";
import { BookOpen, ChevronLeft, ChevronRight, Save } from "lucide-react";

interface Props {
  nav: NavContextType;
  questionIndex: number;
  subjectName: string;
}

export default function SubjectiveAnswer({ nav, questionIndex, subjectName }: Props) {
  const questions = SUBJECTIVE_QUESTIONS.filter((q) => q.subject === subjectName);
  const [qIdx, setQIdx] = useState(questionIndex);
  const q = questions[qIdx] ?? questions[0];

  const [activeSubQ, setActiveSubQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitDialog, setSubmitDialog] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const subQ = q?.questions[activeSubQ];
  const currentAnswer = answers[`${q?.id}-${activeSubQ}`] ?? "";

  const setAnswer = (val: string) => {
    setAnswers({ ...answers, [`${q?.id}-${activeSubQ}`]: val });
    setSavedAt(null);
  };

  const saveNow = () => {
    setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
  };

  const isSubQFilled = (qi: number) =>
    (answers[`${q?.id}-${qi}`] ?? "").trim().length > 0;

  if (!q) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E5E7ED] flex-none">
        <div className="flex items-center h-[52px] px-4 gap-2">
          <button
            onClick={nav.goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F4F5F7]"
          >
            <ChevronLeft size={22} color="#171925" strokeWidth={2} />
          </button>
          <div className="flex-1 flex flex-col items-center">
            <p className="text-[13px] font-semibold text-[#171925]">{subjectName} · 分科真题</p>
            <p className="text-[11px] text-[#707684]">{qIdx + 1} / {questions.length}</p>
          </div>
          <button
            onClick={() => nav.navigate({ type: "law-search" })}
            className="w-8 h-8 flex items-center justify-center text-[11px] text-[#4C4BEA] bg-[#F0F0FF] rounded-lg"
          >
            <BookOpen size={15} color="#4C4BEA" />
          </button>
        </div>

        {/* Q navigator */}
        <div className="flex px-4 pb-2 gap-1.5 overflow-x-auto">
          {questions.map((qq, i) => {
            const hasAny = qq.questions.some((_, qi) => (answers[`${qq.id}-${qi}`] ?? "").trim());
            return (
              <button
                key={qq.id}
                onClick={() => { setQIdx(i); setActiveSubQ(0); }}
                className={`flex-none w-8 h-7 rounded text-[12px] font-medium transition-colors ${
                  i === qIdx
                    ? "bg-[#4C4BEA] text-white"
                    : hasAny
                    ? "bg-[#EAF6EF] text-[#5DA765]"
                    : "bg-[#F4F5F7] text-[#707684]"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable reading area */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-3">
          {/* Q meta */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-[#707684] bg-white px-2 py-0.5 rounded border border-[#E5E7ED]">
              {q.year}年
            </span>
            <DiffBadge level={q.difficulty as "易" | "中" | "难"} />
            <span className="text-[11px] text-[#707684]">建议{q.suggestMinutes}分钟</span>
          </div>

          <p className="text-[16px] font-bold text-[#171925] leading-snug mb-3">{q.title}</p>

          {/* Case content */}
          <div className="bg-white rounded-lg p-4">
            <p className="text-[13px] text-[#5F6574] leading-[1.8] whitespace-pre-wrap">{q.content}</p>
            {q.questions.map((sq, i) => (
              <p key={sq.id} className="text-[13px] text-[#171925] leading-[1.8] mt-2">
                {i + 1}. {sq.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed answer workspace */}
      <div className="flex-none bg-white border-t border-[#E5E7ED]">
        {/* Sub-question tabs */}
        <div className="flex px-4 pt-3 gap-1.5">
          {q.questions.map((sq, i) => (
            <button
              key={sq.id}
              onClick={() => setActiveSubQ(i)}
              className={`flex items-center gap-1 px-3 h-7 rounded-full text-[12px] font-medium transition-colors ${
                i === activeSubQ
                  ? "bg-[#4C4BEA] text-white"
                  : "bg-[#F4F5F7] text-[#707684]"
              }`}
            >
              <StatusDot status={isSubQFilled(i) ? "done" : "none"} />
              第{["一", "二", "三", "四"][i]}问
            </button>
          ))}
        </div>

        {/* Current sub-question */}
        <div className="px-4 pt-2.5 pb-1">
          <p className="text-[12px] text-[#5F6574] leading-relaxed line-clamp-2">
            {subQ?.text}
          </p>
        </div>

        {/* Textarea */}
        <div className="px-4">
          <textarea
            ref={textareaRef}
            value={currentAnswer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="在此输入您的回答…"
            rows={4}
            className="w-full bg-[#F8F9FA] border border-[#E5E7ED] rounded-lg text-[13px] text-[#171925] placeholder:text-[#C0C5D0] p-3 resize-none outline-none focus:border-[#4C4BEA] leading-relaxed"
          />
        </div>

        {/* Save status + count */}
        <div className="flex items-center px-4 py-1.5">
          <span className="text-[11px] text-[#707684]">
            {savedAt ? `草稿已保存 ${savedAt}` : currentAnswer ? "未保存" : ""}
          </span>
          <span className="ml-auto text-[11px] text-[#707684]">{currentAnswer.length} 字</span>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={saveNow}
            className="h-10 px-3 border border-[#E5E7ED] rounded-lg text-[13px] text-[#5F6574] flex items-center gap-1 active:bg-[#F4F5F7]"
          >
            <Save size={14} color="#707684" /> 保存
          </button>
          <button
            onClick={() => {
              if (activeSubQ > 0) setActiveSubQ(activeSubQ - 1);
              else if (qIdx > 0) { setQIdx(qIdx - 1); setActiveSubQ(0); }
            }}
            disabled={qIdx === 0 && activeSubQ === 0}
            className="h-10 px-3 border border-[#E5E7ED] rounded-lg text-[13px] text-[#5F6574] active:bg-[#F4F5F7] disabled:opacity-40"
          >
            上一题
          </button>
          <button
            onClick={() => {
              if (activeSubQ < q.questions.length - 1) {
                setActiveSubQ(activeSubQ + 1);
              } else if (qIdx < questions.length - 1) {
                setQIdx(qIdx + 1);
                setActiveSubQ(0);
              } else {
                setSubmitDialog(true);
              }
            }}
            className="flex-1 h-10 bg-[#4C4BEA] text-white text-[13px] font-semibold rounded-lg active:bg-[#3D3CC8]"
          >
            {qIdx === questions.length - 1 && activeSubQ === q.questions.length - 1
              ? "提交作答"
              : activeSubQ < q.questions.length - 1
              ? `下一问`
              : "下一题"}
          </button>
        </div>
      </div>

      <Dialog
        open={submitDialog}
        title="确认提交"
        description={`您已完成本次练习。共${questions.length}道题，${
          Object.keys(answers).length
        }个小问已作答。提交后无法修改答案。`}
        confirmText="提交作答"
        cancelText="继续修改"
        onConfirm={() => { setSubmitDialog(false); nav.goBack(); }}
        onCancel={() => setSubmitDialog(false)}
      />
    </div>
  );
}
