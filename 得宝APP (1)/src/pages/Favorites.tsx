import { NavContextType } from "@/types";
import TopBar from "@/components/TopBar";
import { Tag } from "@/components/ui";
import { Star, ChevronRight } from "lucide-react";

interface Props { nav: NavContextType }

const FAVORITES = [
  { type: "题目", subject: "民法", year: "2023", title: "关于善意取得制度适用的判断（第2题）", tag: "客观题" },
  { type: "法条", subject: "民法典", article: "第311条", title: "善意取得——《民法典》第311条", tag: "法条" },
  { type: "题目", subject: "民法", year: "2022", title: "关于诉讼时效适用规则的判断（第3题）", tag: "客观题" },
  { type: "题目", subject: "刑法", year: "2023", title: "犯罪未完成形态的认定（第5题）", tag: "客观题" },
];

export default function Favorites({ nav }: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F4F5F7]">
      <TopBar title="收藏夹" onBack={nav.goBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-4 py-3">
          <p className="text-[12px] text-[#707684]">共 {FAVORITES.length} 条收藏</p>
        </div>
        <div className="bg-white mx-4 rounded-lg overflow-hidden">
          {FAVORITES.map((f, i) => (
            <button
              key={i}
              onClick={() => nav.navigate({ type: "objective-answer", mode: "chapter", title: "收藏题目" })}
              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left active:bg-[#F4F5F7] ${
                i < FAVORITES.length - 1 ? "border-b border-[#E5E7ED]" : ""
              }`}
            >
              <Star size={16} color="#A87000" fill="#A87000" className="mt-0.5 flex-none" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Tag color="muted">{f.subject}</Tag>
                  {f.year && <Tag color="muted">{f.year}年</Tag>}
                </div>
                <p className="text-[13px] text-[#171925] leading-snug line-clamp-2">{f.title}</p>
              </div>
              <ChevronRight size={14} color="#C0C5D0" className="mt-0.5 flex-none" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
