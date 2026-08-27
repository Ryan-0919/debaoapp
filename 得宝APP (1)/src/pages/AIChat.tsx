import { useState, useRef, useEffect } from "react";
import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { Send, Sparkles, BookOpen, Scale, RotateCcw } from "lucide-react";

interface Props { nav: NavContextType }

type Message = { role: "assistant" | "user"; text: string; time: string };

const tick = () => {
  const d = new Date();
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const QUICK_QUESTIONS = [
  { icon: <BookOpen size={13} />, label: "善意取得的三个要件是什么？" },
  { icon: <Scale size={13} />, label: "诉讼时效与除斥期间有何区别？" },
  { icon: <BookOpen size={13} />, label: "合同无效与合同被撤销的区别？" },
  { icon: <Scale size={13} />, label: "共同犯罪中从犯如何认定？" },
];

const AI_REPLIES: [string, string][] = [
  ["善意取得", "**善意取得的三个构成要件（《民法典》第311条）：**\n\n1. **受让人善意**：受让时不知道且不应当知道转让人无处分权。举证责任由主张恶意的一方承担。\n\n2. **以合理价格转让**：排除赠与、明显低价等情形，通常以不低于市价70%为参考。\n\n3. **已完成公示**：不动产须已登记，动产须已交付（含简易交付、指示交付）。\n\n**口诀**：善意 + 合价 + 公示 → 善意取得成立。"],
  ["诉讼时效", "**诉讼时效 vs 除斥期间对比：**\n\n**诉讼时效**（一般3年）\n- 消灭胜诉权，实体权利仍存在\n- 可以中断、中止、延长\n- 自知道或应知损害及义务人起算\n\n**除斥期间**（法定，不可变更）\n- 直接消灭实体权利\n- 不可中断、中止\n- 自权利成立之日起算\n\n**高频考点**：撤销权的行使期限——知道之日起1年（除斥期间），行为发生之日起5年（最长期限），两者均不适用中断中止。"],
  ["合同无效", "**合同无效 vs 合同被撤销：**\n\n**无效合同**：自始当然绝对无效，任何人可主张，法院可主动适用。典型情形：违反强制性规定、违背公序良俗、恶意串通损害第三人。\n\n**可撤销合同**：撤销前有效，撤销后溯及既往无效。只有特定当事人（撤销权人）可主张，1年除斥期间内行使。典型情形：欺诈、胁迫、重大误解、显失公平。\n\n**共同后果**：返还财产→折价补偿→损害赔偿，各自按过错承担责任。"],
  ["共同犯罪", "**从犯的认定（《刑法》第27条）：**\n\n在共同犯罪中起**次要或辅助**作用的为从犯。\n\n**两种类型：**\n- **次要实行犯**：参与实行但作用较小（如望风、部分实行）\n- **帮助犯**：未参与实行，仅提供帮助（提供工具、出谋划策）\n\n**处罚**：应当从轻、减轻或免除处罚（三档裁量）\n\n**易混点**：主犯 ≠ 首要分子。首要分子是犯罪集团/聚众犯罪中的组织策划者，不要求亲自实行。"],
];

function getReply(text: string): string {
  for (const [key, reply] of AI_REPLIES) {
    if (text.includes(key)) return reply;
  }
  return `关于「${text}」的分析思路：\n\n**第一步：定性**\n明确涉及的法律关系类型和适用的法律领域（民事/刑事/行政）。\n\n**第二步：找构成要件**\n逐一对照相关法条的构成要件，逐项分析是否满足。\n\n**第三步：结合案情得结论**\n注意区分必要条件与充分条件，留意法律例外规定和司法解释。\n\n如果是具体案例，欢迎描述详情，我可以给出更针对性的分析。`;
}

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line) return <div key={i} className="h-2" />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const content = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold text-[#171925]">{p}</strong> : <span key={j}>{p}</span>
    );
    return <p key={i} className="leading-relaxed">{content}</p>;
  });
}

export default function AIChat({ nav }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "你好！我是得宝法考AI助手，可以帮你解答法考相关问题。\n\n你可以问我：法律概念辨析、案例分析思路、法条解读、易混考点对比等。",
      time: tick(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: text.trim(), time: tick() }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: getReply(text.trim()), time: tick() }]);
      setLoading(false);
    }, 800 + Math.random() * 500);
  };

  const isFirst = messages.length === 1;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar
        title="AI 答疑"
        onBack={nav.goBack}
        right={
          <button
            onClick={() => setMessages([messages[0]])}
            className="w-8 h-8 flex items-center justify-center active:opacity-70"
          >
            <RotateCcw size={16} color="#5F6574" />
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4C4BEA] to-[#7B6CF5] flex items-center justify-center flex-none shadow-sm mt-0.5">
                <Sparkles size={14} color="white" />
              </div>
            )}
            <div className={`max-w-[270px] flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`px-3.5 py-3 rounded-2xl text-[13px] ${
                  m.role === "user"
                    ? "bg-[#4C4BEA] text-white rounded-br-sm"
                    : "bg-white text-[#5F6574] rounded-bl-sm shadow-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="space-y-0.5">{renderText(m.text)}</div>
                ) : (
                  <p className="leading-relaxed">{m.text}</p>
                )}
              </div>
              <span className="text-[10px] text-[#C0C5D0] px-1">{m.time}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4C4BEA] to-[#7B6CF5] flex items-center justify-center flex-none shadow-sm">
              <Sparkles size={14} color="white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 bg-[#C0C5D0] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}

        {isFirst && !loading && (
          <div className="pt-2">
            <p className="text-[11px] text-[#C0C5D0] text-center mb-3">常见问题快速提问</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.label)}
                  className="flex items-start gap-2 bg-white rounded-xl p-3 text-left active:bg-[#F4F5F7] shadow-sm"
                >
                  <span className="text-[#4C4BEA] mt-0.5 flex-none">{q.icon}</span>
                  <span className="text-[12px] text-[#5F6574] leading-snug">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="flex-none bg-white border-t border-[#E5E7ED] px-4 py-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="输入问题，如：善意取得的构成要件是什么？"
          rows={1}
          className="flex-1 bg-[#F4F5F7] rounded-xl px-3 py-2.5 text-[13px] text-[#171925] placeholder:text-[#C0C5D0] outline-none border border-transparent focus:border-[#4C4BEA] resize-none leading-relaxed"
          style={{ maxHeight: 80 }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          className="w-10 h-10 bg-[#4C4BEA] rounded-xl flex items-center justify-center flex-none active:bg-[#3D3CC8] disabled:opacity-40 transition-opacity"
        >
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
